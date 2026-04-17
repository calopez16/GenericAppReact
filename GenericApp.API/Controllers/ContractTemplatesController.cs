using AngleSharp;
using AngleSharp.Html.Dom;
using AsDom = AngleSharp.Dom;
using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controller for managing CRUD operations for ContractTemplate catalog.
    /// Requires authentication and User policy.
    /// </summary>
    [ApiController]
    [Route("contract-templates")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class ContractTemplatesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public ContractTemplatesController(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Returns a paginated list of contract templates, optionally filtered by name.
        /// </summary>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetContractTemplatesPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<ContractTemplate>();
            query = query.Where(x => !(x.IsDeleted ?? false));

            if (!string.IsNullOrWhiteSpace(searchTerm))
                query = query.Where(x => x.Name.Contains(searchTerm) || x.Description.Contains(searchTerm));

            var totalRows = query.Count();
            var data = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ContractTemplateDTO
                {
                    IdTemplate = x.IdTemplate,
                    Name = x.Name,
                    Description = x.Description,
                    Content = x.Content,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted,
                    IdCompany = x.IdCompany
                })
                .ToList();

            var paginatedResponse = new
            {
                TotalCount = totalRows,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)System.Math.Ceiling((double)totalRows / pageSize),
                Data = data
            };

            return Ok(new ApiResponse { Data = paginatedResponse });
        }

        /// <summary>
        /// Returns a specific contract template by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<ContractTemplateDTO>> GetContractTemplateById(int id)
        {
            var template = await _repository.FirstOrDefault<ContractTemplate>(x => x.IdTemplate == id && !(x.IsDeleted ?? false));
            if (template == null)
                return NotFound(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<ContractTemplateDTO>(template) });
        }

        /// <summary>
        /// Returns all active contract templates (no pagination).
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult> GetActiveContractTemplates()
        {
            var query = await _repository.Query<ContractTemplate>();
            var data = query
                .Where(x => (x.IsActive ?? false) && !(x.IsDeleted ?? false))
                .Select(x => new ContractTemplateDTO
                {
                    IdTemplate = x.IdTemplate,
                    Name = x.Name,
                    Description = x.Description,
                    IsActive = x.IsActive,
                    IdCompany = x.IdCompany
                })
                .ToList();

            return Ok(new ApiResponse { Data = data });
        }

        /// <summary>
        /// Creates a new contract template.
        /// </summary>
        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddContractTemplate([FromBody] ContractTemplateDTO model)
        {
            var exists = await _repository.FirstOrDefault<ContractTemplate>(x => x.Name.ToLower().Equals(model.Name.ToLower()) && !(x.IsDeleted ?? false));
            if (exists != null)
                return Conflict(new ApiResponse { Conflict = model.Name });

            var entity = _mapper.Map<ContractTemplate>(model);
            var result = await _repository.Add(entity);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = entity });
        }

        /// <summary>
        /// Updates an existing contract template.
        /// </summary>
        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> UpdateContractTemplate([FromBody] ContractTemplateDTO model)
        {

            var exists = await _repository.FirstOrDefault<ContractTemplate>(x => x.IdTemplate != model.IdTemplate && x.Name.ToLower().Equals(model.Name.ToLower()) && !(x.IsDeleted ?? false));
            if (exists != null)
                return Conflict(new ApiResponse { Conflict = model.Name });

            var templateDB = await _repository.GetById<ContractTemplate>(model.IdTemplate ?? 0);
            if (templateDB == null)
                return NotFound(new ApiResponse());

            templateDB.Name = model.Name;
            templateDB.Description = model.Description;
            templateDB.Content = model.Content;

            var result = await _repository.Update(templateDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = templateDB });

        }

        /// <summary>
        /// Disables a contract template (IsActive = false).
        /// </summary>
        [HttpPut("disable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DisableContractTemplate(int id)
        {
            var template = await _repository.GetById<ContractTemplate>(id);
            if (template == null)
                return NotFound(new ApiResponse());

            template.IsActive = false;
            var result = await _repository.Update(template);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<ContractTemplateDTO>(template) });
        }

        /// <summary>
        /// Enables a contract template (IsActive = true).
        /// </summary>
        [HttpPut("enable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> EnableContractTemplate(int id)
        {
            var template = await _repository.FirstOrDefault<ContractTemplate>(x => x.IdTemplate == id && !(x.IsDeleted ?? false));
            if (template == null)
                return NotFound(new ApiResponse());

            template.IsActive = true;
            var result = await _repository.Update(template);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<ContractTemplateDTO>(template) });
        }

        /// <summary>
        /// Soft-deletes a contract template (IsDeleted = true).
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteContractTemplate(int id)
        {
            var template = await _repository.FirstOrDefault<ContractTemplate>(x => x.IdTemplate == id && !(x.IsDeleted ?? false));
            if (template == null)
                return NotFound(new ApiResponse());

            template.IsDeleted = true;
            var result = await _repository.Update(template);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<ContractTemplateDTO>(template) });
        }

        // ─────────────────────────────────────────────────────────────────────
        // PDF generation
        // ─────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Generates a PDF for a contract template, rendering its HTML content.
        /// </summary>
        [HttpGet("pdf/{id}")]
        public async Task<IActionResult> GetContractTemplatePdf(int id)
        {
            try
            {

           
            var template = await _repository.FirstOrDefault<ContractTemplate>(
                x => x.IdTemplate == id && !(x.IsDeleted ?? false));

            if (template == null)
                return NotFound(new ApiResponse());

            QuestPDF.Settings.License = LicenseType.Community;

            // Parse the Tiptap HTML with AngleSharp
            var config = Configuration.Default;
            var context = BrowsingContext.New(config);
            var document = await context.OpenAsync(req => req.Content(template.Content ?? ""));
            var body = document.Body!;

            var pdfDocument = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.Letter);
                    page.MarginTop(2, Unit.Centimetre);
                    page.MarginBottom(2, Unit.Centimetre);
                    page.MarginLeft(2.5f, Unit.Centimetre);
                    page.MarginRight(2.5f, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Lato));

                    page.Content().Column(col =>
                    {
                        RenderNodes(col, body.ChildNodes);
                    });

                    page.Footer().AlignCenter().Text(t =>
                    {
                        t.Span(template.Name ?? "").FontSize(8).FontColor(Colors.Grey.Darken1);
                        t.Span("  —  ").FontSize(8).FontColor(Colors.Grey.Lighten1);
                        t.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Darken1);
                        t.Span(" / ").FontSize(8).FontColor(Colors.Grey.Lighten1);
                        t.TotalPages().FontSize(8).FontColor(Colors.Grey.Darken1);
                    });
                });
            });

            var stream = new MemoryStream();
            pdfDocument.GeneratePdf(stream);
            stream.Position = 0;

            var fileName = $"{SanitizeFileName(template.Name ?? "contrato")}.pdf";
            return File(stream, "application/pdf", fileName);
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        // ── Helpers ──────────────────────────────────────────────────────────

        private static string SanitizeFileName(string name)
        {
            var invalid = Path.GetInvalidFileNameChars();
            return string.Concat(name.Select(c => invalid.Contains(c) ? '_' : c));
        }

        /// <summary>Walks a node list and writes items into a QuestPDF ColumnDescriptor.</summary>
        private static void RenderNodes(ColumnDescriptor col, AsDom.INodeList nodes)
        {
            foreach (var node in nodes)
                RenderNode(col, node);
        }

        private static void RenderNode(ColumnDescriptor col, AsDom.INode node)
        {
            // Skip bare text nodes at block level — they are only inter-element
            // whitespace in Tiptap HTML (newlines between <p>, <h1>, etc.).
            // Actual text content is handled by BuildInlineSpans inside each element.
            if (node is AsDom.IText) return;

            if (node is not AsDom.IElement el) return;

            switch (el.TagName.ToUpper())
            {
                case "P":
                    // Always render paragraph (even if empty) so line breaks are respected
                    var textContent = el.TextContent?.Trim() ?? "";
                    if (string.IsNullOrEmpty(textContent))
                    {
                        // Empty <p> = explicit line break between blocks
                        col.Item().Height(10);
                    }
                    else
                    {
                        col.Item().ExtendHorizontal().PaddingBottom(8).Text(t =>
                        {
                            ApplyTextAlign(t, el);
                            BuildInlineSpans(t, el);
                        });
                    }
                    break;

                case "H1":
                    col.Item().ExtendHorizontal().PaddingTop(6).PaddingBottom(8)
                        .DefaultTextStyle(s => s.FontSize(22).Bold())
                        .Text(t =>
                        {
                            ApplyTextAlign(t, el);
                            BuildInlineSpans(t, el);
                        });
                    break;

                case "H2":
                    col.Item().ExtendHorizontal().PaddingTop(5).PaddingBottom(7)
                        .DefaultTextStyle(s => s.FontSize(17).Bold())
                        .Text(t =>
                        {
                            ApplyTextAlign(t, el);
                            BuildInlineSpans(t, el);
                        });
                    break;

                case "H3":
                    col.Item().ExtendHorizontal().PaddingTop(4).PaddingBottom(6)
                        .DefaultTextStyle(s => s.FontSize(13).Bold())
                        .Text(t =>
                        {
                            ApplyTextAlign(t, el);
                            BuildInlineSpans(t, el);
                        });
                    break;

                case "BLOCKQUOTE":
                    col.Item().BorderLeft(3).BorderColor(Colors.Grey.Lighten1)
                        .PaddingLeft(8).PaddingVertical(4).PaddingBottom(8).Column(inner =>
                        {
                            RenderNodes(inner, el.ChildNodes);
                        });
                    break;

                case "UL":
                case "OL":
                    RenderList(col, el);
                    break;

                case "TABLE":
                    RenderTable(col, el);
                    col.Item().Height(8); // spacing after table
                    break;

                case "BR":
                    // Block-level <br> adds vertical spacing
                    col.Item().Height(10);
                    break;

                case "HR":
                    col.Item().PaddingVertical(6).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    break;

                case "IMG":
                    // base64 images embedded by Tiptap
                    var src = el.GetAttribute("src") ?? "";
                    if (src.StartsWith("data:image"))
                    {
                        try
                        {
                            var base64 = src[(src.IndexOf(',') + 1)..];
                            var bytes = Convert.FromBase64String(base64);
                            var widthAttr = el.GetAttribute("width");
                            float imgWidth = float.TryParse(widthAttr, out var w) ? w : 400;
                            col.Item().PaddingVertical(4).MaxWidth(imgWidth).Image(bytes);
                        }
                        catch { /* skip unreadable images */ }
                    }
                    break;

                default:
                    // Dive into any other container elements
                    RenderNodes(col, el.ChildNodes);
                    break;
            }
        }

        private static void RenderList(ColumnDescriptor col, AsDom.IElement listEl)
        {
            var isOrdered = listEl.TagName.Equals("OL", StringComparison.OrdinalIgnoreCase);
            var items = listEl.QuerySelectorAll("li");
            int counter = 1;

            col.Item().PaddingBottom(8).Column(listCol =>
            {
                foreach (var li in items)
                {
                    var bullet = isOrdered ? $"{counter++}." : "•";

                    // A <li> may contain block children (e.g. <p>, <br>) or just inline text.
                    // If it has block-level children, render them inside a nested column
                    // so that <br> and multiple <p> inside one <li> are respected.
                    var hasBlockChildren = li.ChildNodes
                        .OfType<AsDom.IElement>()
                        .Any(c =>
                        {
                            var tag = c.TagName.ToUpper();
                            return tag == "P" || tag == "UL" || tag == "OL"
                                || tag == "H1" || tag == "H2" || tag == "H3"
                                || tag == "BLOCKQUOTE" || tag == "TABLE" || tag == "HR";
                        });

                    listCol.Item().PaddingBottom(2).Row(row =>
                    {
                        row.ConstantItem(20).Text(bullet).FontSize(11);

                        if (hasBlockChildren)
                        {
                            // Render each block child (P, BR…) in a nested column
                            row.RelativeItem().Column(liCol =>
                            {
                                RenderNodes(liCol, li.ChildNodes);
                            });
                        }
                        else
                        {
                            // Pure inline content — single text span
                            var paragraph = li.QuerySelector("p");
                            row.RelativeItem().Text(t =>
                            {
                                if (paragraph != null)
                                    ApplyTextAlign(t, paragraph);
                                BuildInlineSpans(t, li);
                            });
                        }
                    });
                }
            });
        }

        private static void RenderTable(ColumnDescriptor col, AsDom.IElement tableEl)
        {
            var rows = tableEl.QuerySelectorAll("tr").ToList();
            if (rows.Count == 0) return;

            // Determine column count from the row with most cells
            int colCount = rows.Max(r => r.QuerySelectorAll("td, th").Length);
            if (colCount == 0) return;

            col.Item().PaddingVertical(6).Table(table =>
            {
                table.ColumnsDefinition(cd =>
                {
                    for (int i = 0; i < colCount; i++)
                        cd.RelativeColumn();
                });

                foreach (var row in rows)
                {
                    var cells = row.QuerySelectorAll("td, th").ToList();
                    bool isHeader = cells.Any(c => c.TagName.Equals("TH", StringComparison.OrdinalIgnoreCase));

                    // Pad missing cells
                    while (cells.Count < colCount)
                        cells.Add(null!);

                    foreach (var cell in cells)
                    {
                        if (cell is null)
                        {
                            table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1).Padding(4).Text("");
                            continue;
                        }

                        // Build the full fluent chain in one shot — never split a
                        // single-child container across two statements.
                        var cellContainer = table.Cell()
                            .Border(0.5f)
                            .BorderColor(Colors.Grey.Lighten1);

                        var paddedCell = isHeader
                            ? cellContainer.Background(Colors.Grey.Lighten3).Padding(5)
                            : cellContainer.Padding(5);

                        // Detect block-level children (img, p, ul, etc.) that cannot
                        // be rendered inside a TextDescriptor — use a Column instead.
                        bool cellHasBlockContent = cell.ChildNodes
                            .OfType<AsDom.IElement>()
                            .Any(c =>
                            {
                                var tag = c.TagName.ToUpper();
                                return tag == "IMG" || tag == "P" || tag == "UL" || tag == "OL"
                                    || tag == "H1" || tag == "H2" || tag == "H3"
                                    || tag == "TABLE" || tag == "HR" || tag == "BLOCKQUOTE";
                            });

                        if (cellHasBlockContent)
                        {
                            paddedCell.Column(cellCol =>
                            {
                                RenderNodes(cellCol, cell.ChildNodes);
                            });
                        }
                        else
                        {
                            paddedCell.Text(t =>
                            {
                                BuildInlineSpans(t, cell);
                                if (isHeader) t.DefaultTextStyle(s => s.Bold());
                            });
                        }
                    }
                }
            });
        }

        /// <summary>
        /// Recursively builds QuestPDF inline text spans for an element's children,
        /// honouring bold, italic, underline, strike, color and font-size.
        /// <paramref name="inherited"/> carries the accumulated parent style so all
        /// ancestor properties (font-size, font-family, bold…) compose correctly.
        /// </summary>
        private static void BuildInlineSpans(
            TextDescriptor t,
            AsDom.IElement el,
            Func<TextSpanDescriptor, TextSpanDescriptor>? inherited = null)
        {
            foreach (var child in el.ChildNodes)
            {
                if (child is AsDom.IText textNode)
                {
                    var content = textNode.TextContent;
                    if (!string.IsNullOrEmpty(content))
                    {
                        var s = t.Span(content);
                        inherited?.Invoke(s);
                    }
                    continue;
                }

                if (child is not AsDom.IElement childEl) continue;

                switch (childEl.TagName.ToUpper())
                {
                    case "STRONG": case "B":
                    {
                        // Build a style that first applies inherited, then adds Bold
                        Func<TextSpanDescriptor, TextSpanDescriptor> boldStyle = s =>
                        {
                            if (inherited != null) s = inherited(s);
                            return s.Bold();
                        };
                        ApplyFormattedChildren(t, childEl, boldStyle);
                        break;
                    }
                    case "EM": case "I":
                    {
                        Func<TextSpanDescriptor, TextSpanDescriptor> italicStyle = s =>
                        {
                            if (inherited != null) s = inherited(s);
                            return s.Italic();
                        };
                        ApplyFormattedChildren(t, childEl, italicStyle);
                        break;
                    }
                    case "U":
                    {
                        Func<TextSpanDescriptor, TextSpanDescriptor> underlineStyle = s =>
                        {
                            if (inherited != null) s = inherited(s);
                            return s.Underline();
                        };
                        ApplyFormattedChildren(t, childEl, underlineStyle);
                        break;
                    }
                    case "S": case "DEL":
                    {
                        Func<TextSpanDescriptor, TextSpanDescriptor> strikeStyle = s =>
                        {
                            if (inherited != null) s = inherited(s);
                            return s.Strikethrough();
                        };
                        ApplyFormattedChildren(t, childEl, strikeStyle);
                        break;
                    }
                    case "CODE":
                    {
                        var codeSpan = t.Span(GetText(childEl))
                            .FontFamily(Fonts.CourierNew)
                            .BackgroundColor(Colors.Grey.Lighten3);
                        inherited?.Invoke(codeSpan);
                        break;
                    }
                    case "SPAN":
                        ApplySpanStyle(t, childEl, inherited);
                        break;
                    case "A":
                    {
                        var linkSpan = t.Hyperlink(GetText(childEl), childEl.GetAttribute("href") ?? "#");
                        inherited?.Invoke(linkSpan);
                        break;
                    }
                    case "BR":
                        t.Span("\n");
                        break;
                    default:
                        BuildInlineSpans(t, childEl, inherited);
                        break;
                }
            }
        }

        /// <summary>
        /// Emits one span per text node inside <paramref name="el"/>, applying
        /// <paramref name="style"/> to each. When recursing into nested inline
        /// elements, composes <paramref name="style"/> with the element-specific
        /// style so descendant spans receive all ancestor styles.
        /// </summary>
        private static void ApplyFormattedChildren(
            TextDescriptor t,
            AsDom.IElement el,
            Func<TextSpanDescriptor, TextSpanDescriptor> style)
        {
            foreach (var child in el.ChildNodes)
            {
                if (child is AsDom.IText txt)
                {
                    var content = txt.TextContent;
                    if (!string.IsNullOrEmpty(content))
                    {
                        var s = t.Span(content);
                        style(s);
                    }
                }
                else if (child is AsDom.IElement nested)
                {
                    // Must handle all inline formatting tags here too.
                    // Calling BuildInlineSpans(t, nested, style) with nested=<strong>
                    // would make <strong> the "el" parameter, so its text children
                    // would only receive `style` (inherited) and never get Bold applied.
                    switch (nested.TagName.ToUpper())
                    {
                        case "BR":
                            t.Span("\n");
                            break;
                        case "STRONG": case "B":
                        {
                            Func<TextSpanDescriptor, TextSpanDescriptor> composed = s =>
                            {
                                s = style(s);
                                return s.Bold();
                            };
                            ApplyFormattedChildren(t, nested, composed);
                            break;
                        }
                        case "EM": case "I":
                        {
                            Func<TextSpanDescriptor, TextSpanDescriptor> composed = s =>
                            {
                                s = style(s);
                                return s.Italic();
                            };
                            ApplyFormattedChildren(t, nested, composed);
                            break;
                        }
                        case "U":
                        {
                            Func<TextSpanDescriptor, TextSpanDescriptor> composed = s =>
                            {
                                s = style(s);
                                return s.Underline();
                            };
                            ApplyFormattedChildren(t, nested, composed);
                            break;
                        }
                        case "S": case "DEL":
                        {
                            Func<TextSpanDescriptor, TextSpanDescriptor> composed = s =>
                            {
                                s = style(s);
                                return s.Strikethrough();
                            };
                            ApplyFormattedChildren(t, nested, composed);
                            break;
                        }
                        case "SPAN":
                            ApplySpanStyle(t, nested, style);
                            break;
                        default:
                            BuildInlineSpans(t, nested, style);
                            break;
                    }
                }
            }
        }

        /// <summary>
        /// Reads the CSS text-align value from an element's style attribute
        /// and sets the matching QuestPDF alignment on the TextDescriptor.
        /// Left alignment is the QuestPDF default so it is intentionally skipped.
        /// </summary>
        private static void ApplyTextAlign(TextDescriptor t, AsDom.IElement el)
        {
            var style = el.GetAttribute("style") ?? "";
            var match = System.Text.RegularExpressions.Regex
                .Match(style, @"text-align:\s*(\w+)");
            if (!match.Success) return;

            switch (match.Groups[1].Value.ToLowerInvariant())
            {
                case "center":  t.AlignCenter();  break;
                case "right":   t.AlignRight();   break;
                case "justify": t.Justify();      break;
                // "left" is the default — nothing to do
            }
        }

        private static void ApplySpanStyle(
            TextDescriptor t,
            AsDom.IElement span,
            Func<TextSpanDescriptor, TextSpanDescriptor>? inherited = null)
        {
            var style = span.GetAttribute("style") ?? "";

            // Parse all CSS properties from the style attribute
            var colorMatch = System.Text.RegularExpressions.Regex
                .Match(style, @"color:\s*(#[0-9a-fA-F]{3,6}|rgb\([^)]+\))");
            var sizeMatch = System.Text.RegularExpressions.Regex
                .Match(style, @"font-size:\s*([\d.]+)px");
            var familyMatch = System.Text.RegularExpressions.Regex
                .Match(style, @"font-family:\s*([^;]+)");

            bool hasBold = style.Contains("font-weight: bold") || style.Contains("font-weight:bold");
            bool hasItalic = style.Contains("font-style: italic") || style.Contains("font-style:italic");
            bool hasUnderline = style.Contains("text-decoration: underline") || style.Contains("text-decoration:underline");
            bool hasStrike = style.Contains("text-decoration: line-through") || style.Contains("text-decoration:line-through");

            // Build a composite style: first apply inherited parent styles,
            // then overlay this span's own CSS properties on top.
            Func<TextSpanDescriptor, TextSpanDescriptor> styleFunc = s =>
            {
                if (inherited != null) s = inherited(s);

                if (colorMatch.Success)
                {
                    var hex = CssColorToHex(colorMatch.Groups[1].Value);
                    if (hex != null) s = s.FontColor(hex);
                }

                if (sizeMatch.Success && float.TryParse(sizeMatch.Groups[1].Value,
                    System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out var px))
                {
                    s = s.FontSize(px * 0.75f); // px → pt
                }

                if (familyMatch.Success)
                {
                    var family = NormalizeFontFamily(familyMatch.Groups[1].Value);
                    if (family != null) s = s.FontFamily(family);
                }

                if (hasBold) s = s.Bold();
                if (hasItalic) s = s.Italic();
                if (hasUnderline) s = s.Underline();
                if (hasStrike) s = s.Strikethrough();

                return s;
            };

            // styleFunc becomes the inherited context for any nested elements
            // (strong, em, span…) so they receive all accumulated styles.
            ApplyFormattedChildren(t, span, styleFunc);
        }

        /// <summary>
        /// Strips CSS quoting and maps the first listed font family to a clean
        /// name that SkiaSharp / QuestPDF can resolve on the host OS.
        /// Returns null when the name cannot be mapped.
        /// </summary>
        private static string? NormalizeFontFamily(string css)
        {
            // CSS may list multiple families: "Arial", sans-serif
            // Take only the first token, strip quotes and whitespace.
            var first = css.Split(',')[0]
                           .Trim()
                           .Trim('"', '\'', '\u2018', '\u2019', '\u201C', '\u201D');

            // Map common aliases to canonical names understood by Skia/OS fonts
            return first.ToLowerInvariant() switch
            {
                "lato"                              => Fonts.Lato,
                "arial"                             => "Arial",
                "helvetica"                         => "Arial",  // fallback
                "helvetica neue"                    => "Arial",
                "times new roman" or "times"        => "Times New Roman",
                "courier new" or "courier"          => Fonts.CourierNew,
                "georgia"                           => "Georgia",
                "verdana"                           => Fonts.Verdana,
                "trebuchet ms" or "trebuchet"       => "Trebuchet MS",
                "tahoma"                            => "Tahoma",
                "calibri"                           => "Calibri",
                "sans-serif" or "serif" or "monospace" or "cursive" or "fantasy" => null,
                _ => string.IsNullOrWhiteSpace(first) ? null : first
            };
        }

        private static string GetText(AsDom.IElement el) => el.TextContent;

        private static string? CssColorToHex(string css)
        {
            if (css.StartsWith('#')) return css;
            if (css.StartsWith("rgb("))
            {
                var parts = css.Replace("rgb(", "").Replace(")", "")
                               .Split(',').Select(s => s.Trim()).ToArray();
                if (parts.Length == 3
                    && int.TryParse(parts[0], out var r)
                    && int.TryParse(parts[1], out var g)
                    && int.TryParse(parts[2], out var b))
                    return $"#{r:X2}{g:X2}{b:X2}";
            }
            return null;
        }
    }
}
