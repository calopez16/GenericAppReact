using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Drawing.Printing;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("shipments")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class ShipmentsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly UserManager<IdentityUser> _userManager;

        public ShipmentsController(
            UserManager<IdentityUser> userManager,
            IRepository repository,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IWebHostEnvironment env)
        {
            _repository = repository;
            _mapper = mapper;
            _userManager = userManager;
            _env = env;
        }

        [HttpGet("{idCompany}/pagination")]
        public async Task<ActionResult> GetShipmentsPagination(
            int idCompany,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Shipment>();

            query = query.Include(s => s.IdShipmentStatusNavigation)
                         .Include(s => s.IdCityNavigation)
                         .Include(s => s.Manifests).ThenInclude(s => s.IdDriverNavigation);

            query = query.Where(x => !(x.IsDeleted ?? false));
            query = query.Where(x => x.IdCompany == idCompany);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(s =>
                    s.Address!.Contains(searchTerm) ||
                    s.IdShipment.ToString().Contains(searchTerm));
            }

            var totalRows = await query.CountAsync();
            var data = await query
                .OrderByDescending(s => s.CreationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var dataDTO = _mapper.Map<IEnumerable<ShipmentDTO>>(data);

            var paginatedResponse = new
            {
                TotalCount = totalRows,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)System.Math.Ceiling((double)totalRows / pageSize),
                Data = dataDTO
            };

            return Ok(new ApiResponse { Data = paginatedResponse });

        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ShipmentDTO>> GetShipmentById(int id)
        {
            var shipmentQuery = await _repository.Query<Shipment>();

            var shipmentDTO = await shipmentQuery
            .Select(s => new ShipmentDTO
            {
                IdShipment = s.IdShipment,
                ShipmentNo = s.ShipmentNo,
                CreationDate = s.CreationDate,
                ShipmentDate = s.ShipmentDate,
                IdClient = s.IdClient,
                IdCity = s.IdCity,
                Mixed = s.Mixed,
                IdShipmentStatus = s.IdShipmentStatus,
                Comments = s.Comments,
                IdCompanyNavigation = new CompanyDTO
                {
                    RegFdaNo = s.IdCompanyNavigation.RegFdaNo,
                    GnnNumber = s.IdCompanyNavigation.GnnNumber,
                    Empaque = s.IdCompanyNavigation.Empaque
                },
                Manifests = s.Manifests.Where(wmp => !(wmp.IsDeleted ?? false)).Select(m => new ManifestDTO
                {
                    IdManifest = m.IdManifest,
                    ManifestNo = m.ManifestNo,
                    RegFdaNo = m.RegFdaNo,
                    IdDriver = m.IdDriver,
                    IdDriverNavigation = new DriverDTO
                    {
                        IdDriver = m.IdDriver,
                        Name = m.IdDriverNavigation.Name
                    },
                    TemperatureTrailerBoxC = m.TemperatureTrailerBoxC,
                    TemperatureTrailerBoxF = m.TemperatureTrailerBoxF,
                    IdSeason = m.IdSeason,
                    SeasonYear = m.IdSeasonNavigation.SeasonYear,
                    TrailerPlate = m.TrailerPlate,
                    TrailerBoxPlate = m.TrailerBoxPlate,
                    TrailerPlateEconomicNumber = m.TrailerPlateEconomicNumber,
                    TrailerBoxPlateEconomicNumber = m.TrailerBoxPlateEconomicNumber,
                    IdTrailerBoxType = m.IdTrailerBoxType,
                    IdTrailerBoxTypeNavigation = new TrailerBoxTypeDTO
                    {
                        Description = m.IdTrailerBoxTypeNavigation.Description
                    },
                    IdShippingCompany = m.IdShippingCompany,
                    IdShippingCompanyNavigation = new ShippingCompanyDTO
                    {
                        IdShippingCompany = m.IdShippingCompany,
                        Name = m.IdShippingCompanyNavigation.Name
                    },
                    Comments = m.Comments,
                    Empaque = m.Empaque,
                    ExitDate = m.ExitDate.ToString("HH:mm"),
                    TrackingCode = m.TrackingCode,
                    Stamps = m.Stamps,
                    Chismografo = m.Chismografo,
                    GnnNumber = m.GnnNumber,
                    ManifestPallets = m.ManifestPallets.Where(wmp => !(wmp.IsDeleted ?? false)).Select(p => new ManifestPalletDTO
                    {
                        IdManifestPallet = p.IdManifestPallet,
                        IdLabel = p.IdLabel,
                        MaxBoxQuantity = p.MaxBoxQuantity,
                        Position = p.Position,
                        IdLabelNavigation = new LabelDTO
                        {
                            IdLabel = p.IdLabel,
                            Description = p.IdLabelNavigation.Description,
                            MaxBoxQuantity = p.IdLabelNavigation.MaxBoxQuantity
                        },
                        TemperatureC = p.TemperatureC,
                        TemperatureF = p.TemperatureF,
                        Comments = p.Comments,
                        Chismografo = p.Chismografo,
                        ManifestPalletLoadings = p.ManifestPalletLoadings.Where(wm => !(wm.IsDeleted ?? false)).Select(pl => new ManifestPalletLoadingDTO
                        {
                            IdManifestPallet = pl.IdManifestPallet,
                            IdManifestPalletLoading = pl.IdManifestPalletLoading,
                            IdLabelType = pl.IdLabelType,
                            Description = pl.Description,
                            IdLabelTypeNavigation = new LabelTypeDTO
                            {
                                IdLabel = pl.IdLabelTypeNavigation.IdLabel,
                                IdLabelType = pl.IdLabelType,
                                Description = pl.IdLabelTypeNavigation.Description,
                                Size = pl.IdLabelTypeNavigation.Size
                            },
                            BoxQuantity = pl.BoxQuantity
                        }).ToList()
                    }).ToList()
                }).ToList()
            })
            .FirstOrDefaultAsync(x => x.IdShipment == id);

            if (shipmentDTO == null)
                return NotFound(new ApiResponse());

            return Ok(new ApiResponse { Data = shipmentDTO });
        }

        [HttpGet("manifest-pdf/{id}")]
        public async Task<IActionResult> GetManifestPdfById(int id)
        {
            var shipmentQuery = await _repository.Query<Shipment>();

            var shipment = await shipmentQuery
            .Select(s => new ShipmentDTO
            {
                IdShipment = s.IdShipment,
                ShipmentNo = s.ShipmentNo,
                CreationDate = s.CreationDate,
                ShipmentDate = s.ShipmentDate,
                IdClient = s.IdClient,
                IdClientNavigation = new ClientDTO
                {
                    Code = s.IdClientNavigation.Code
                },
                IdCity = s.IdCity,
                IdCompanyNavigation = new CompanyDTO
                {
                    Name = s.IdCompanyNavigation.Name,
                    Address = $"{s.IdCompanyNavigation.Address}, C.P. {s.IdCompanyNavigation.PostalCode}",
                    RazonSocial = s.IdCompanyNavigation.RazonSocial,
                    Empaque = s.IdCompanyNavigation.Empaque,
                    LogoName = s.IdCompanyNavigation.LogoName
                },
                Mixed = s.Mixed,
                IdShipmentStatus = s.IdShipmentStatus,
                Comments = s.Comments,
                Manifests = s.Manifests.Where(wmp => !(wmp.IsDeleted ?? false)).Select(m => new ManifestDTO
                {
                    IdManifest = m.IdManifest,
                    ManifestNo = m.ManifestNo,
                    RegFdaNo = m.RegFdaNo,
                    IdDriver = m.IdDriver,
                    IdDriverNavigation = new DriverDTO
                    {
                        Name = m.IdDriverNavigation.Name
                    },
                    TemperatureTrailerBoxC = m.TemperatureTrailerBoxC,
                    TemperatureTrailerBoxF = m.TemperatureTrailerBoxF,
                    IdSeason = m.IdSeason,
                    ClientCode = s.IdClientNavigation.Code,
                    SeasonYear = m.IdSeasonNavigation.SeasonYear,
                    TrailerPlate = m.TrailerPlate,
                    TrailerPlateEconomicNumber = m.TrailerPlateEconomicNumber,
                    TrailerBoxPlate = m.TrailerBoxPlate,
                    TrailerBoxPlateEconomicNumber = m.TrailerBoxPlateEconomicNumber,
                    IdTrailerBoxTypeNavigation = new TrailerBoxTypeDTO
                    {
                        Description = m.IdTrailerBoxTypeNavigation.Description
                    },
                    IdShippingCompany = m.IdShippingCompany,
                    IdShippingCompanyNavigation = new ShippingCompanyDTO
                    {
                        Name = m.IdShippingCompanyNavigation.Name
                    },
                    Comments = m.Comments,
                    Empaque = m.Empaque,
                    ExitDate = m.ExitDate.ToString("hh:mm tt"),
                    TrackingCode = m.TrackingCode,
                    Stamps = m.Stamps,
                    Chismografo = m.Chismografo,
                    GnnNumber = m.GnnNumber,
                    ManifestPallets = m.ManifestPallets.Where(wmp => !(wmp.IsDeleted ?? false)).Select(p => new ManifestPalletDTO
                    {
                        IdManifestPallet = p.IdManifestPallet,
                        IdLabel = p.IdLabel,
                        MaxBoxQuantity = p.MaxBoxQuantity,
                        Position = p.Position,
                        TemperatureC = p.TemperatureC,
                        TemperatureF = p.TemperatureF,
                        Comments = p.Comments,
                        Chismografo = p.Chismografo,
                        ManifestPalletLoadings = p.ManifestPalletLoadings.Where(wm => !(wm.IsDeleted ?? false)).Select(pl => new ManifestPalletLoadingDTO
                        {
                            IdManifestPalletLoading = pl.IdManifestPalletLoading,
                            IdLabelType = pl.IdLabelType,
                            Description = pl.Description,
                            IdLabelTypeNavigation = new LabelTypeDTO
                            {
                                Description = pl.IdLabelTypeNavigation.Description,
                                Size = pl.IdLabelTypeNavigation.Size
                            },
                            BoxQuantity = pl.BoxQuantity
                        }).ToList()
                    }).ToList()
                }).ToList()
            }).FirstOrDefaultAsync(x => x.IdShipment == id);

            if (shipment == null) return NotFound("Shipment not found");

            // Configuración de licencia
            QuestPDF.Settings.License = LicenseType.Community;

            // 2. Generar el Documento
            var document = Document.Create(container =>
            {
                foreach (var manifest in shipment.Manifests.Where(m => !(m.IsDeleted ?? false)))
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.Letter);
                        page.Margin(1, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Lato));

                        // Header
                        page.Header().Element(header => ComposeHeader(header, shipment, manifest, "MANIFIESTO DE EMBARQUE"));

                        // Content
                        page.Content().Column(mainCol =>
                        {
                            // SEPARADOR: Esta línea dividirá el Header del Contenido
                            mainCol.Item().PaddingTop(1).PaddingBottom(3).LineHorizontal(1).LineColor(Colors.Grey.Lighten1);

                            // Contenedor de las dos columnas
                            mainCol.Item().Row(row =>
                            {
                                // PARTE IZQUIERDA: Distribución de la carga
                                row.RelativeItem(2).Column(col =>
                                {
                                    col.Item().Element(e => ComposeContent(e, manifest));
                                });

                                row.ConstantItem(8); // Espacio entre columnas

                                // PARTE DERECHA: Datos operativos, Totales, sellos y comentarios
                                row.RelativeItem(1).Column(col =>
                                {
                                    col.Item().Element(e => ComposeRightPanel(e, shipment, manifest));
                                });
                            });
                        });

                        // Footer
                    });
                }
            });

            // 3. Retornar el archivo PDF
            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", $"Manifiesto_{shipment.IdShipment}.pdf");
        }
        private void ComposeRightPanel(IContainer container, ShipmentDTO shipment, ManifestDTO manifest)
        {
            container.Column(col =>
            {
                // Título de sección alineado con el de la izquierda
                col.Item().PaddingTop(2).PaddingBottom(5).Text(" ").FontSize(10).Bold().FontColor(Colors.Grey.Darken1);

                // --- SECCIÓN: INFORMACIÓN OPERATIVA ---
                col.Item().PaddingBottom(5).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Column(infoCol =>
                {
                    infoCol.Item().Text($"INFORMACIÓN DE REMISION #{manifest.ManifestNo:D4}").Bold().FontSize(8);
                    infoCol.Item().PaddingTop(1).PaddingBottom(1).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                    var labelStyle = TextStyle.Default.FontSize(7).Bold();
                    var valueStyle = TextStyle.Default.FontSize(7);

                    infoCol.Item().PaddingTop(3).Table(t =>
                    {
                        t.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn((float)1);
                            c.RelativeColumn((float)1.5);
                        });

                        t.Cell().PaddingBottom(1).Text("TEMPORADA:").FontSize(8).Style(labelStyle);
                        t.Cell().Text($"{manifest.SeasonYear}").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("MIXTO:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(shipment.Mixed == true ? "SÍ" : "NO").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("EMPAQUE:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(shipment.IdCompanyNavigation?.Empaque ?? "-").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("FECHA:").FontSize(8).Style(labelStyle);
                        t.Cell().Text($"{shipment.ShipmentDate?.ToString("dd/MM/yyyy") ?? "-"}").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("SALIDA HR:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(manifest.ExitDate ?? "-").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("TEMP:").FontSize(8).Style(labelStyle);
                        t.Cell().Text($"{manifest.TemperatureTrailerBoxF?.ToString("0")} °F").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("").FontSize(8).Style(labelStyle);
                        t.Cell().Text("").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("TIPO CON.:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(manifest.IdTrailerBoxTypeNavigation.Description ?? "-").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("PLACAS TRÁILER:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(!string.IsNullOrEmpty(manifest.TrailerPlate) ? $"{manifest.TrailerPlateEconomicNumber} {manifest.TrailerPlate}" : "-").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("PLACAS CAJA:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(!string.IsNullOrEmpty(manifest.TrailerBoxPlate) ? $"{manifest.TrailerBoxPlateEconomicNumber} {manifest.TrailerBoxPlate}" : "-").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("LÍNEA:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(manifest.IdShippingCompanyNavigation?.Name ?? "-").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("CHOFER:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(manifest.IdDriverNavigation?.Name ?? "-").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("").FontSize(8).Style(labelStyle);
                        t.Cell().Text("").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("No. REG FDA:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(manifest.RegFdaNo ?? "-").FontSize(7).Style(valueStyle);

                        t.Cell().PaddingBottom(1).Text("GNN #:").FontSize(8).Style(labelStyle);
                        t.Cell().Text(manifest.GnnNumber ?? "-").FontSize(7).Style(valueStyle);

                    });
                });

                col.Item().Element(e => ComposeLabelTypeSummary(e, manifest));

                // 2. RESUMEN DE CARGA (Totales)
                var totalBoxes = manifest.ManifestPallets?
                    .Where(p => !(p.IsDeleted ?? false))
                    .SelectMany(p => p.ManifestPalletLoadings)
                    .Where(l => !(l.IsDeleted ?? false))
                    .Sum(l => l.BoxQuantity) ?? 0;

                var totalPallets = manifest.ManifestPallets?
                    .Count(p => !(p.IsDeleted ?? false)) ?? 0;

                col.Item().PaddingBottom(5).Border(1).BorderColor(Colors.Grey.Lighten2).Background(Colors.Grey.Lighten5).Padding(5).Column(totalCol =>
                {
                    totalCol.Item().Text("RESUMEN TOTAL").Bold().FontSize(8);
                    totalCol.Item().PaddingTop(1).PaddingBottom(1).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    totalCol.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Total de bultos:").FontSize(8);
                        r.AutoItem().Text($"{totalBoxes:N0}").Bold().FontSize(7);
                    });
                    totalCol.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Total Pallets:").FontSize(8);
                        r.AutoItem().Text($"{totalPallets:N0}").Bold().FontSize(7);
                    });
                });

                // 3. SELLOS
                col.Item().PaddingBottom(5).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Column(stampsCol =>
                {
                    stampsCol.Item().Text("SELLOS").Bold().FontSize(8);
                    stampsCol.Item().PaddingTop(1).PaddingBottom(1).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    stampsCol.Item().Text(manifest.Stamps ?? "Sin sellos.").FontSize(7).FontColor(Colors.Red.Medium).Bold();
                });

                // 4. COMENTARIOS
                col.Item().PaddingBottom(5).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Column(commCol =>
                {
                    commCol.Item().Text("COMENTARIOS / NOTAS").Bold().FontSize(8);
                    commCol.Item().PaddingTop(1).PaddingBottom(1).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    commCol.Item().Text(manifest.Comments ?? "Sin comentarios.").FontSize(7);
                });
            });
        }
        private void ComposeLabelTypeSummary(IContainer container, ManifestDTO manifest)
        {
            // 1. Agrupar datos: LabelType -> Total y desglose por Size
            var summary = manifest.ManifestPallets?
                .Where(p => !(p.IsDeleted ?? false))
                .SelectMany(p => p.ManifestPalletLoadings)
                .Where(l => !(l.IsDeleted ?? false))
                .GroupBy(l => l.IdLabelTypeNavigation?.Description + " " + l.Description ?? "Sin Descripción")
                .Select(g => new
                {
                    LabelType = g.Key,

                    Total = g.Sum(x => x.BoxQuantity ?? 0),
                    Sizes = g.GroupBy(s => s.IdLabelTypeNavigation?.Size ?? "N/A")
                             .Select(sg => new { Size = sg.Key, Qty = sg.Sum(x => x.BoxQuantity ?? 0) })
                             .OrderBy(sg => sg.Size)
                })
                .OrderBy(x => x.LabelType)
                .ToList();

            if (summary == null || !summary.Any()) return;

            container.PaddingBottom(5).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Column(col =>
            {
                // Encabezado de la sección
                col.Item().Text("CONCENTRADO").Bold().FontSize(8);
                col.Item().PaddingTop(1).PaddingBottom(1).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);

                col.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(); // LabelType + Sizes
                        columns.ConstantColumn(40); // Total
                    });

                    foreach (var item in summary)
                    {
                        // Fila de LabelType
                        table.Cell().Column(c =>
                        {
                            c.Item().Text(item.LabelType).FontSize(8).Bold();

                            // Línea de tamaños (Ej: 24s: 100, 36s: 50)
                            c.Item().Text(t =>
                            {
                                foreach (var s in item.Sizes)
                                {
                                    t.Span($"{s.Size}: ").FontSize(8).FontColor(Colors.Grey.Darken2);
                                    t.Span($"{s.Qty:N0}   ").FontSize(8).Bold();
                                }
                            });
                        });

                        // Celda de Total
                        table.Cell().AlignRight().AlignMiddle().PaddingRight(5).Text($"{item.Total:N0}").FontSize(8).Bold().FontColor(Colors.Blue.Medium);

                        // Divisor entre productos
                        table.Cell().ColumnSpan(2).PaddingVertical(1).LineHorizontal(0.5f).LineColor(Colors.Grey.Lighten3);
                    }
                });
            });
        }
        private void ComposeHeader(IContainer container, ShipmentDTO shipment, ManifestDTO manifest, string documentTitle)
        {
            container.Column(column =>
            {
                column.Item().Row(row =>
                {
                    // BLOQUE IZQUIERDO: LOGO + DATOS EMPRESA
                    row.RelativeItem(4).Row(subRow =>
                    {
                        var logoName = shipment.IdCompanyNavigation?.LogoName;
                        if (!string.IsNullOrEmpty(logoName))
                        {
                            string carpeta = Path.Combine(_env.WebRootPath, "img", "logos");
                            string rutaCompleta = Path.Combine(carpeta, logoName);
                            if (System.IO.File.Exists(rutaCompleta))
                            {
                                subRow.AutoItem().PaddingRight(10).Height(50).Image(rutaCompleta);
                            }
                        }

                        subRow.RelativeItem().Column(stack =>
                        {
                            stack.Item().Text($"EMPAQUE {shipment.IdCompanyNavigation?.Empaque?.ToUpper() ?? ""}").Bold().FontSize(12).FontColor(Colors.Blue.Darken2);
                            stack.Item().Text(shipment.IdCompanyNavigation?.RazonSocial?.ToUpper() ?? "").FontSize(7).FontColor(Colors.Grey.Darken1);
                            stack.Item().Text(shipment.IdCompanyNavigation?.Address?.ToUpper() ?? "").FontSize(7).FontColor(Colors.Grey.Darken1);
                        });
                    });

                    // BLOQUE DERECHO: TÍTULOS Y FOLIOS
                    row.RelativeItem(6).AlignRight().Column(stack =>
                    {
                        stack.Item().Text(documentTitle).FontSize(14).Bold();
                        stack.Item().Text($"REMISION #{shipment.ShipmentNo:D4}").FontSize(12).AlignRight().Bold().FontColor(Colors.Red.Darken2);
                        stack.Item().Text($"VIAJE #{shipment.ShipmentNo:D3}").FontSize(12).AlignRight().Bold().FontColor(Colors.Grey.Darken2);
                    });
                });

                // Espacio pequeño al final del header
                column.Item().PaddingBottom(5);
            });
        }
        private void ComposeContent(IContainer container, ManifestDTO manifest)
        {
            container.PaddingTop(2).Column(column =>
            {
                column.Item().PaddingBottom(5).Text("DISTRIBUCIÓN DE CARGA").FontSize(10).Bold().FontColor(Colors.Grey.Darken1);

                // Grid del Trailer (12 filas x 2 lados = 24 posiciones)
                column.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(); // Izquierda
                        columns.ConstantColumn(20); // Pasillo
                        columns.RelativeColumn(); // Derecha
                    });

                    int maxPositions = 26;

                    for (int i = 1; i <= maxPositions; i += 2)
                    {
                        // Izquierda (Impares)
                        table.Cell().Element(cell => DrawPalletCell(cell, manifest, i));

                        // Pasillo
                        table.Cell().Element(cell => cell.Background(Colors.Grey.Lighten4));

                        // Derecha (Pares)
                        table.Cell().Element(cell => DrawPalletCell(cell, manifest, i + 1));
                    }
                });
            });
        }
        private void DrawPalletCell(IContainer container, ManifestDTO manifest, int position)
        {
            var pallet = manifest.ManifestPallets?.FirstOrDefault(p => p.Position == position && !(p.IsDeleted ?? false));

            container.BorderBottom(1).BorderColor(Colors.Grey.Lighten3).Padding(4).Column(stack =>
            {
                // Header de celda (Num Posición + Icono Chismógrafo + Temp)
                stack.Item().Row(row =>
                {
                    // 1. Número de Posición
                    row.AutoItem().Background(Colors.Grey.Lighten2).PaddingHorizontal(4).Text($"{position}").Bold().FontSize(8);

                    // 2. NUEVO: Icono del Chismógrafo (si el pallet existe y tiene el flag activo)
                    if (pallet != null && (pallet.Chismografo == true)) // <--- AGREGADO
                    {
                        row.AutoItem()
                           .PaddingLeft(2) // Un poco de espacio tras el número
                           .Text($"Chismógrafo: {manifest.Chismografo}")    // Icono (puedes usar texto si prefieres)
                           .FontSize(8)
                           .FontColor(Colors.Blue.Medium);
                    }

                    // 3. Temperatura (Alineada a la derecha)
                    if (pallet != null)
                    {
                        if (pallet.TemperatureF != null)
                            row.RelativeItem().AlignRight().Text($"{pallet.TemperatureF?.ToString("0.##")} °F").FontSize(8).FontColor(Colors.Blue.Darken3);
                    }
                });

                // Resto del contenido de la celda (Productos)
                if (pallet != null)
                {
                    // 1. Obtenemos los items válidos
                    var validLoadings = pallet.ManifestPalletLoadings
                                                .Where(l => !(l.IsDeleted ?? false))
                                                .ToList();

                    // 2. Dibujamos la lista de productos (Detalle)
                    foreach (var load in validLoadings)
                    {
                        var qty = load.BoxQuantity ?? 0;

                        stack.Item().PaddingTop(2).Text(t =>
                        {
                            t.Span(load.IdLabelTypeNavigation?.Description ?? "").Bold().FontSize(7);
                            t.Span($" {load.Description}" ?? "").FontSize(7);
                            t.Span($" {load.IdLabelTypeNavigation?.Size} " ?? "").FontSize(7);
                            t.Span($" {manifest.ClientCode} " ?? "").FontSize(7);
                            t.Span($" ({qty:0})").Bold().FontSize(8);
                        });
                    }

                    // 3. LOGICA NUEVA: Agrupar por TAMAÑO (Size) para el Footer
                    var sizeSummary = validLoadings
                        .GroupBy(l => l.IdLabelTypeNavigation?.Size)
                        .Select(g => new
                        {
                            Size = string.IsNullOrWhiteSpace(g.Key) ? "STD" : g.Key,
                            Count = g.Sum(l => l.BoxQuantity ?? 0)
                        })
                        .OrderBy(x => x.Size)
                        .ToList();

                    // Calculamos el Gran Total
                    var grandTotal = sizeSummary.Sum(x => x.Count);

                    // 4. Footer con desglose por tamaños
                    stack.Item().PaddingTop(4)
                        .BorderTop(1, Unit.Point).BorderColor(Colors.Grey.Lighten4)
                        .AlignRight()
                        .Text(text =>
                        {
                            //foreach (var item in sizeSummary)
                            //{
                            //    text.Span($"{item.Size} ").FontSize(6).FontColor(Colors.Grey.Darken1);
                            //    text.Span($"{item.Count}   ").FontSize(7).Bold().FontColor(Colors.Black);
                            //}

                            // Total Final en Verde
                            text.Span($"TOTAL: {grandTotal:0}").Bold().FontSize(8).FontColor(Colors.Green.Darken2);
                        });
                }
                else
                {
                    stack.Item().PaddingTop(10).AlignCenter().Text("VACÍO").FontSize(8).FontColor(Colors.Grey.Lighten1).Italic();
                }
            });
        }
        private void ComposeFooter(IContainer container, ManifestDTO manifest)
        {
            // Cálculos totales
            var totalBoxes = manifest.ManifestPallets?
                .Where(p => !(p.IsDeleted ?? false))
                .SelectMany(p => p.ManifestPalletLoadings)
                .Where(l => !(l.IsDeleted ?? false))
                .Sum(l => l.BoxQuantity) ?? 0;

            var totalPallets = manifest.ManifestPallets?
                .Count(p => !(p.IsDeleted ?? false)) ?? 0;

            container.PaddingTop(20).Row(row =>
            {
                // Firma Chofer
                //row.RelativeItem().Column(col =>
                //{
                //    col.Item().Text("_________________________").AlignCenter();
                //    col.Item().Text("FIRMA CHOFER").AlignCenter().FontSize(8);
                //});

                //// Firma Despachador
                //row.RelativeItem().Column(col =>
                //{
                //    col.Item().Text("_________________________").AlignCenter();
                //    col.Item().Text("FIRMA DESPACHADOR").AlignCenter().FontSize(8);
                //});

                // Cuadro Resumen Total
                row.RelativeItem().Border(1).BorderColor(Colors.Black).Padding(5).Column(col =>
                {
                    col.Item().Text("RESUMEN TOTAL").Bold().Underline().FontSize(10);
                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Total Cajas:").FontSize(9);
                        r.AutoItem().Text($"{totalBoxes:N0}").Bold().FontSize(10);
                    });
                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Total Pallets:").FontSize(9);
                        r.AutoItem().Text($"{totalPallets:N0}").Bold().FontSize(10);
                    });
                });
            });
        }

        [HttpGet("remision-pdf/{id}")]
        public async Task<IActionResult> GetRemisionPdfById(int id)
        {
            // -----------------------------------------------------------------------
            // 1. OBTENCIÓN DE DATOS (Consulta completa igual que en Manifiesto)
            // -----------------------------------------------------------------------
            var shipmentQuery = await _repository.Query<Shipment>();

            var shipment = await shipmentQuery
            .Select(s => new ShipmentDTO

            {
                IdShipment = s.IdShipment,
                ShipmentNo = s.ShipmentNo,
                CreationDate = s.CreationDate,
                ShipmentDate = s.ShipmentDate,
                IdClient = s.IdClient,
                IdClientNavigation = new ClientDTO
                {
                    Name = s.IdClientNavigation.Name,
                },
                IdCompanyNavigation = new CompanyDTO
                {
                    Name = s.IdCompanyNavigation.Name,
                    Address = $"{s.IdCompanyNavigation.Address}, C.P. {s.IdCompanyNavigation.PostalCode}",
                    RazonSocial = s.IdCompanyNavigation.RazonSocial,
                    Empaque = s.IdCompanyNavigation.Empaque,
                    LogoName = s.IdCompanyNavigation.LogoName
                },
                Address = s.Address,
                IdCity = s.IdCity,
                Mixed = s.Mixed,
                IdShipmentStatus = s.IdShipmentStatus,
                Comments = s.Comments,
                Manifests = s.Manifests.Where(wmp => !(wmp.IsDeleted ?? false)).Select(m => new ManifestDTO
                {
                    IdManifest = m.IdManifest,
                    ManifestNo = m.ManifestNo,
                    RegFdaNo = m.RegFdaNo,
                    IdDriver = m.IdDriver,
                    IdDriverNavigation = new DriverDTO
                    {
                        Name = m.IdDriverNavigation.Name
                    },
                    TemperatureTrailerBoxC = m.TemperatureTrailerBoxC,
                    TemperatureTrailerBoxF = m.TemperatureTrailerBoxF,
                    IdSeason = m.IdSeason,
                    SeasonYear = m.IdSeasonNavigation.SeasonYear,
                    TrailerPlate = m.TrailerPlate,
                    TrailerPlateEconomicNumber = m.TrailerPlateEconomicNumber,
                    TrailerBoxPlate = m.TrailerBoxPlate,
                    TrailerBoxPlateEconomicNumber = m.TrailerBoxPlateEconomicNumber,
                    IdShippingCompany = m.IdShippingCompany,
                    IdShippingCompanyNavigation = new ShippingCompanyDTO
                    {
                        Name = m.IdShippingCompanyNavigation.Name
                    },
                    Comments = m.Comments,
                    Empaque = m.Empaque,
                    ExitDate = m.ExitDate.ToString("hh:mm tt"),
                    TrackingCode = m.TrackingCode,
                    Stamps = m.Stamps,
                    Chismografo = m.Chismografo,
                    GnnNumber = m.GnnNumber,
                    ManifestPallets = m.ManifestPallets.Where(wmp => !(wmp.IsDeleted ?? false)).Select(p => new ManifestPalletDTO
                    {
                        IdManifestPallet = p.IdManifestPallet,
                        IdLabel = p.IdLabel,
                        MaxBoxQuantity = p.MaxBoxQuantity,
                        Position = p.Position,
                        TemperatureC = p.TemperatureC,
                        TemperatureF = p.TemperatureF,
                        Comments = p.Comments,
                        Chismografo = p.Chismografo,
                        ManifestPalletLoadings = p.ManifestPalletLoadings.Where(wm => !(wm.IsDeleted ?? false)).Select(pl => new ManifestPalletLoadingDTO
                        {
                            IdManifestPalletLoading = pl.IdManifestPalletLoading,
                            IdLabelType = pl.IdLabelType,
                            Description = pl.Description,
                            IdLabelTypeNavigation = new LabelTypeDTO
                            {
                                Description = pl.IdLabelTypeNavigation.Description,
                                Size = pl.IdLabelTypeNavigation.Size
                            },
                            BoxQuantity = pl.BoxQuantity
                        }).ToList()
                    }).ToList()
                }).ToList()
            }).FirstOrDefaultAsync(x => x.IdShipment == id);

            if (shipment == null) return NotFound("Shipment not found");

            // -----------------------------------------------------------------------
            // 2. GENERACIÓN DEL PDF (QuestPDF)
            // -----------------------------------------------------------------------
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                foreach (var manifest in shipment.Manifests)
                {
                    container.Page(page =>
                    {
                        // Configuración general de la página
                        page.Size(PageSizes.Letter);
                        page.Margin(1, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Lato));

                        // A) HEADER: Reutilizamos el mismo diseño que el Manifiesto
                        // Pasamos "REMISIÓN" como título para diferenciarlo
                        page.Header().Element(header => ComposeHeader(header, shipment, manifest, "REMISIÓN"));

                        // B) CONTENIDO: Usamos la tabla de lista (específica de remisión)
                        page.Content().Column(col =>
                        {
                            col.Item().PaddingTop(5).Element(e => ComposeRemisionSubHeader(e, shipment, manifest));
                            // Agregamos un pequeño margen superior
                            col.Item().PaddingTop(10).Element(e => ComposeRemisionTable(e, manifest));
                        });

                        // C) FOOTER: Reutilizamos el footer del Manifiesto (Firmas y Totales)
                        // para mantener la consistencia visual exacta.
                        page.Footer().Element(footer => ComposeFooter(footer, manifest));
                    });
                }
            });

            // -----------------------------------------------------------------------
            // 3. RETORNO DEL ARCHIVO
            // -----------------------------------------------------------------------
            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", $"Remision_{shipment.IdShipment}.pdf");
        }
        private void ComposeRemisionSubHeader(IContainer container, ShipmentDTO shipment, ManifestDTO manifest)
        {
            container.Border(1).BorderColor(Colors.Grey.Lighten2).Padding(8).Column(mainCol =>
            {
                // Primera fila: Cliente y Fecha (Alineada a la derecha)
                mainCol.Item().Row(row =>
                {
                    // Cliente
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("CLIENTE").FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                        col.Item().Text($"{shipment.IdClientNavigation?.Name ?? "N/A"}").FontSize(10).Bold();
                    });

                    // Fecha (Alineada a la derecha)
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().AlignRight().Text("FECHA").FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                        col.Item().AlignRight().Text($"{shipment.ShipmentDate?.ToString("dd/MM/yyyy") ?? "-"}").FontSize(10).Bold();
                    });
                });

                // Separador 1 (Corrección del error)
                mainCol.Item().PaddingVertical(5).BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3);

                // Segunda fila: Dirección
                mainCol.Item().Column(col =>
                {
                    col.Item().Text("DIRECCIÓN").FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                    col.Item().Text($"{shipment.Address ?? "DIRECCIÓN NO ESPECIFICADA"}").FontSize(9).Bold();
                });

                // Separador 2 (Corrección del error)
                mainCol.Item().PaddingVertical(5).BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten3);

                // Tercera fila: Chofer y Placas
                mainCol.Item().Row(row =>
                {
                    // Chofer
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("CHOFER").FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                        col.Item().Text($"{manifest.IdDriverNavigation?.Name ?? "N/A"}").FontSize(9).Bold();
                    });

                    // Placas Trailer
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("PLACAS TRÁILER").FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                        col.Item().Text($"{manifest.TrailerPlateEconomicNumber} {manifest.TrailerPlate ?? "-"}").FontSize(9).Bold();
                    });

                    // Placas Caja
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("PLACAS CAJA").FontSize(8).Bold().FontColor(Colors.Grey.Darken2);
                        col.Item().Text($"{manifest.TrailerBoxPlateEconomicNumber} {manifest.TrailerBoxPlate ?? "-"}").FontSize(9).Bold();
                    });
                });
            });
        }
        private void ComposeRemisionTable(IContainer container, ManifestDTO manifest)
        {
            // 1. Aplanamos y AGRUPAMOS los items por Descripción y Tamaño
            var groupedItems = manifest.ManifestPallets?
                .Where(p => !(p.IsDeleted ?? false))
                .SelectMany(p => p.ManifestPalletLoadings)
                .Where(l => !(l.IsDeleted ?? false))
                .GroupBy(l => new
                {
                    Description = l.IdLabelTypeNavigation?.Description + " " + l.Description,
                    Size = l.IdLabelTypeNavigation?.Size
                })
                .Select(g => new
                {
                    Description = g.Key.Description,
                    Size = g.Key.Size,
                    TotalBoxes = g.Sum(x => x.BoxQuantity ?? 0)
                })
                .OrderBy(x => x.Size)
                .ThenBy(x => x.Description)
                .ToList();

            container.Table(table =>
            {
                // Definición de las 4 columnas solicitadas
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(55);  // CANT.
                    columns.RelativeColumn();    // DESCRIPCIÓN (Aquí van Size + LabelType)
                    columns.ConstantColumn(75);  // PRECIO
                    columns.ConstantColumn(75);  // IMPORTE
                });

                // --- HEADER DE LA TABLA ---
                table.Header(header =>
                {
                    static IContainer HeaderStyle(IContainer c) => c
                        .Border(1)
                        .BorderColor(Colors.Grey.Lighten1)
                        .Background(Colors.Grey.Lighten4)
                        .Padding(4)
                        .AlignMiddle()
                        .AlignCenter();

                    header.Cell().Element(HeaderStyle).Text("CANT.").FontSize(9).Bold();
                    header.Cell().Element(HeaderStyle).Text("DESCRIPCIÓN").FontSize(9).Bold();
                    header.Cell().Element(HeaderStyle).Text("PRECIO").FontSize(9).Bold();
                    header.Cell().Element(HeaderStyle).Text("IMPORTE").FontSize(9).Bold();
                });

                // --- FILAS DE DATOS ---
                foreach (var item in groupedItems)
                {
                    static IContainer CellStyle(IContainer c) => c
                        .Border(1)
                        .BorderColor(Colors.Grey.Lighten1)
                        .Padding(4)
                        .AlignMiddle();

                    // 1. Cantidad con comas
                    table.Cell().Element(CellStyle).AlignCenter().Text($"{item.TotalBoxes:N0}").FontSize(9).Bold();

                    // 2. Descripción (Size Bold + Texto) en la misma celda
                    table.Cell().Element(CellStyle).Text(t =>
                    {
                        t.Span($"{item.Description}").FontSize(9);
                        if (!string.IsNullOrEmpty(item.Size))
                        {
                            t.Span($" - ").FontSize(9);
                            t.Span($"{item.Size}").FontSize(9).Bold();
                        }
                    });

                    // 3. Precio (Blanco)
                    table.Cell().Element(CellStyle).Text("");

                    // 4. Importe (Blanco)
                    table.Cell().Element(CellStyle).Text("");
                }

                // --- FILAS DE RELLENO ESTÉTICO ---
                int emptyRows = 18 - groupedItems.Count;
                for (int i = 0; i < (emptyRows < 5 ? 5 : emptyRows); i++)
                {
                    table.Cell().Border(1).BorderColor(Colors.Grey.Lighten1).MinHeight(20).Text("");
                    table.Cell().Border(1).BorderColor(Colors.Grey.Lighten1).MinHeight(20).Text("");
                    table.Cell().Border(1).BorderColor(Colors.Grey.Lighten1).MinHeight(20).Text("");
                    table.Cell().Border(1).BorderColor(Colors.Grey.Lighten1).MinHeight(20).Text("");
                }
            });
        }

        [HttpGet("bitacora-pdf/{id}/{horaCierre}")]
        public async Task<ActionResult> GetBitacoraSellosPdf(int id, string horaCierre)
        {
            // 1. Obtención de datos
            var shipment = await _repository.FirstOrDefault<Shipment>(x => x.IdShipment == id && !(x.IsDeleted ?? false), x => x.IdCompanyNavigation);

            // Incluimos IdDriverNavigation para la firma
            var manifest = await _repository.FirstOrDefault<Manifest>(x => x.IdShipment == id && !(x.IsDeleted ?? false), m => m.IdDriverNavigation, m => m.IdTrailerBoxTypeNavigation);

            if (shipment == null || manifest == null) return NotFound(new ApiResponse());

            // 2. Configuración de recursos
            string pathimagen = Path.Combine(_env.WebRootPath, "img", "ctpat-logo.jpg");
            QuestPDF.Settings.License = LicenseType.Community;

            var data = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.Letter);
                    page.Margin(1, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Verdana));

                    // --- HEADER ---
                    page.Header().PaddingBottom(10).Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            if (System.IO.File.Exists(pathimagen))
                            {
                                col.Item().Height(50).Image(pathimagen);
                            }
                        });

                        row.RelativeItem().AlignCenter().Column(col =>
                        {
                            col.Item().PaddingTop(10).Text("BITÁCORA DE SELLOS").FontSize(14).Bold().FontColor(Colors.Blue.Medium);
                        });

                        row.RelativeItem().AlignRight().Column(col =>
                        {
                            col.Item().PaddingTop(10).Text($"FOLIO: {shipment.ShipmentNo.Value.ToString("D3")}").FontSize(12).Bold();
                        });
                    });

                    // --- CONTENIDO ---
                    page.Content().Column(col =>
                    {
                        // Propósito (Con Subrayado)
                        col.Item().Text("Propósito de la inspección:").FontSize(11).Bold();
                        col.Item().PaddingBottom(10).Text($"Asegurar que los embarques con producto provenientes de {shipment.IdCompanyNavigation?.RazonSocial ?? ""} Cumplen con cada una de las disposiciones del programa de seguridad  C-TPAT de acuerdo a los procedimientos establecidos por la empresa con los prestadores de servicios de transporte debidamente establecidos en el procediendo  de carga y transporte, que obra en el expediente correspondiente.").Justify();

                        // Frecuencia
                        col.Item().Text(t =>
                        {
                            t.Justify();
                            t.Span("Frecuencia de la comunicación de alguna inspección u hallazgo: ").Bold();
                            t.Span("cuando sea requerido el chofer, se comunicara vía radio o celular con el contacto del empaque durante el transcurso del viaje desde el momento que el camión sale del empaque hasta que llegue a su destino, y cuando ocurriere algún hallazgo o anomalía durante el trayecto del camino, este tendrá que reportar de inmediato al contacto del empaque, dicho suceso quien estará monitoreando el viaje vía satélite, el cual notificara dicho suceso al encargado.");
                        });
                        col.Item().Text(t =>
                        {
                            t.Justify();
                            t.Span("Niveles aceptables: ").Bold();
                            t.Span("Cada cierto tiempo en el trayecto del viaje del chofer, notificara las condiciones presentadas en el viaje y cuando hubiere puntos de inspección de cualquier autoridad ya sea militar, federal, aduanal, etc. Este reportara vía radio, teléfono o quedara grabado en este documento de manera detallada, anotando la hora, autoridad inspectora, violación del candado o sello y tiempos aproximados de duración de inspección.");
                        });
                        col.Item().Text(t =>
                        {
                            t.Justify();
                            t.Span("Acciones correctivas: ").Bold();
                            t.Span("Si por necesidad no previstas de la carga en turno o posibles fallas o imprevistos suscitados, en alguno de los equipos, este procedimiento no fuere posible llevarlo a cabo. Deberá el chofer reportarlo de inmediato y anotar en la presente bitácora en el apartado de comentarios las causas y deberá solicitar instrucciones por parte de la empresa a través  del contacto del empaque o jefe del empaque respectivos, para que ordene una acción correctiva inmediata.");
                        });

                        col.Item().Text(t =>
                        {
                            t.Justify();
                            t.Span("El chofer deberá anotar, nombre de la persona que autorizo y ordeno instrucciones de modificar el procedimiento, hora y fechas de la llamada de notificación, tiempos aproximados de los posibles hallazgos o anomalías y nombre y firma del chofer en turno el cual es el principal responsable de la carga del producto.");
                        });

                        col.Item().PaddingVertical(10).LineHorizontal(1f).LineColor(Colors.Grey.Lighten2);

                        // Información del Viaje
                        col.Item().Table(table =>
                        {
                            table.ColumnsDefinition(columns =>
                            {
                                columns.RelativeColumn();
                                columns.RelativeColumn();
                            });

                            // Fila 1
                            table.Cell().Text(t => { t.Span("No. Manifiesto: ").Bold(); t.Span($"{manifest.ManifestNo:D4}"); });
                            table.Cell().Text(t => { t.Span("Línea: ").Bold(); t.Span("CORRECAMINOS"); });

                            // Fila 2
                            table.Cell().Text(t => { t.Span("Empaque: ").Bold(); t.Span($"{manifest.IdCompanyNavigation.Empaque}"); });
                            table.Cell().Text(t => { t.Span("Destino: ").Bold(); t.Span($"{shipment.Address}"); });

                            // Fila 3
                            table.Cell().Text(t => { t.Span("Fecha: ").Bold(); t.Span($"{shipment.ShipmentDate.ToString("dd/MM/yyyy")}"); });
                            table.Cell().Text(t => { t.Span("Placa Caja: ").Bold(); t.Span($"{manifest.TrailerBoxPlateEconomicNumber} {manifest.TrailerBoxPlate}"); });

                            // Fila 4
                            table.Cell().Text(t => { t.Span("Hora de salida: ").Bold(); t.Span($"{manifest.ExitDate:hh:mm tt}"); });
                        });

                        // Subtítulo centrado antes de la tabla
                        col.Item().PaddingTop(20).AlignCenter().Text("Bitácora del Operador").FontSize(12).Bold();

                        // Tabla de Sellos (Solo la cantidad existente)
                        col.Item().PaddingTop(10).Element(e => ComposeBitacoraTable(e, manifest.Stamps, horaCierre));

                        // Espacio para Firma con el Chofer asignado
                        col.Item().PaddingTop(40).Row(row =>
                        {
                            row.RelativeItem();
                            row.ConstantItem(250).Column(c =>
                            {
                                c.Item().BorderTop(1).AlignCenter().Text($"{manifest.IdDriverNavigation?.Name?.ToUpper() ?? "SIN CHOFER ASIGNADO"}").FontSize(9).Bold();
                                c.Item().AlignCenter().Text("Firma del Chofer").FontSize(8);
                            });
                            row.RelativeItem();
                        });
                    });
                });
            });

            byte[] pdf = data.GeneratePdf();
            return File(pdf, "application/pdf", $"Bitacora_Sellos_{id}.pdf");
        }

        private void ComposeBitacoraTable(IContainer container, string? stampsSource, string horaCierre)
        {
            var listaSellos = new List<string>();
            if (!string.IsNullOrWhiteSpace(stampsSource))
            {
                listaSellos = stampsSource
                    .Split(new[] { '\r', '\n', ',', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(s => s.Trim())
                    .ToList();
            }

            container.Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(3);
                });

                table.Header(header =>
                {
                    static IContainer CellStyle(IContainer container) =>
                        container.DefaultTextStyle(x => x.Bold())
                                 .Border(1)
                                 .Background(Colors.Grey.Lighten4)
                                 .AlignCenter();

                    header.Cell().Element(CellStyle).Padding(7).Text("NO. DE CANDADO");
                    header.Cell().Element(CellStyle).Padding(7).Text("CIERRE (HORA)");
                    header.Cell().Element(CellStyle).Padding(7).Text("APERTURA");
                    header.Cell().Element(CellStyle).Padding(7).Text("OBSERVACIONES");
                });

                // Iteración exclusiva sobre los sellos existentes
                for (int i = 0; i < listaSellos.Count; i++)
                {
                    table.Cell().Border(1).Padding(7).AlignCenter().Text(listaSellos[i]).Bold();

                    var horaCierreDate = i == 0 ? !string.IsNullOrEmpty(horaCierre) ? DateTime.ParseExact(horaCierre, "HH:mm", null) : DateTime.Now : DateTime.MinValue;
                    table.Cell().Border(1).Padding(7).AlignCenter().Text(i == 0 ? horaCierreDate.ToString("hh:mm tt") : "");

                    table.Cell().Border(1).Padding(7).Text(" ");
                    table.Cell().Border(1).Padding(7).Text(" ");
                }
            });
        }

        [HttpPost]
        public async Task<ActionResult> AddShipment([FromBody] ShipmentDTO model)
        {
            try
            {
                var validator = new JwtSecurityTokenHandler();

                Request.Headers.TryGetValue("Authorization", out var headerAuth);
                var jwtToken = headerAuth.FirstOrDefault()?.Split(" ").Last();
                var tokenInfo = validator.ReadJwtToken(jwtToken);
                var emailUser = tokenInfo.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email);
                var user = await _userManager.FindByNameAsync(emailUser?.Value);

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var season = await _repository.FirstOrDefault<Season>(x => x.SeasonYear == model.SeasonYear);
                if (season == null)
                {
                    season = new Season
                    {
                        Name = model.SeasonYear.ToString(),
                        SeasonYear = model.SeasonYear,
                        IdCompany = model.IdCompany ?? 0,
                        IsActive = true,
                        IsDeleted = false,
                        IsClosed = false
                    };
                    await _repository.Add(season);

                }

                var shipmentDB = _mapper.Map<Shipment>(model);
                shipmentDB.CreationDate = DateTime.UtcNow;
                shipmentDB.IdUser = user.Id;
                shipmentDB.IdShipmentStatus = (int)ShipmentsStatus.Activa;
                shipmentDB.IsDeleted = false;
                var shipmentsQuery = await _repository.Query<Shipment>();
                var lastShipmentNo = await shipmentsQuery.Where(s => s.IdCompany == shipmentDB.IdCompany).OrderByDescending(x => x.IdShipment).Select(x => x.ShipmentNo).FirstOrDefaultAsync() ?? 0;
                shipmentDB.ShipmentNo = lastShipmentNo + 1;
                if (model.Manifests != null && model.Manifests.Any())
                {
                    shipmentDB.Manifests = new List<Manifest>();

                    foreach (var manifestDto in model.Manifests)
                    {
                        if (manifestDto.IdShipment == 0)
                        {
                            var manifestDB = _mapper.Map<Manifest>(manifestDto);

                            manifestDB.CreationDate = DateTime.UtcNow;
                            manifestDB.IdSeason = season.IdSeason;
                            manifestDB.ManifestNo = shipmentDB.ShipmentNo;
                            manifestDB.IdManifestStatus = (int)ManifestStatusEnum.Activa;
                            manifestDB.IsDeleted = false;
                            manifestDB.ExitDate = manifestDto.ExitDate != null ? DateTime.ParseExact(manifestDto.ExitDate, "HH:mm", null) : DateTime.MinValue;
                            if (manifestDto.ManifestPallets != null)
                            {
                                manifestDB.ManifestPallets = manifestDto.ManifestPallets.Select(palletDto =>
                                {
                                    var palletDB = _mapper.Map<ManifestPallet>(palletDto);
                                    if (palletDto.ManifestPalletLoadings != null)
                                    {
                                        palletDB.ManifestPalletLoadings = palletDto.ManifestPalletLoadings.Select(loadDto =>
                                        {
                                            var loadDB = _mapper.Map<ManifestPalletLoading>(loadDto);
                                            return loadDB;
                                        }).ToList();
                                    }
                                    return palletDB;
                                }).ToList();
                            }

                            shipmentDB.Manifests.Add(manifestDB);
                        }
                    }
                }

                var result = await _repository.Add(shipmentDB);

                if (!result)
                    return BadRequest(new ApiResponse { Message = "Error al crear el Shipment y sus objetos asociados." });

                var createdShipmentQuery = await _repository.Query<Shipment>();
                var createdShipment = await createdShipmentQuery
                .Include(s => s.Manifests!)
                    .ThenInclude(m => m.ManifestPallets!)
                        .ThenInclude(p => p.ManifestPalletLoadings)
                .Include(s => s.IdShipmentStatusNavigation)
                .FirstOrDefaultAsync(s => s.IdShipment == shipmentDB.IdShipment);

                var resultDTO = _mapper.Map<ShipmentDTO>(createdShipment);
                return Ok(new ApiResponse());
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        [HttpPut]
        public async Task<ActionResult> UpdateShipment([FromBody] ShipmentDTO model)
        {
            try
            {
                // 1. Obtener la entidad completa de la Base de Datos
                var shipmentDBQuery = await _repository.Query<Shipment>();

                var shipmentDB = await shipmentDBQuery.Include(s => s.Manifests!)
                     .ThenInclude(m => m.ManifestPallets!)
                         .ThenInclude(p => p.ManifestPalletLoadings)
                 .FirstOrDefaultAsync(x => x.IdShipment == model.IdShipment && !(x.IsDeleted ?? false));

                if (shipmentDB == null)
                    return NotFound(new ApiResponse { Message = "Shipment no encontrado." });

                // ---------------------------------------------------------
                // 2. ACTUALIZACIÓN MANUAL: SHIPMENT (Padre)
                // ---------------------------------------------------------

                // Solo actualizamos si el dato viene en el DTO (no es null)
                if (model.ShipmentDate.HasValue) shipmentDB.ShipmentDate = model.ShipmentDate.Value;
                if (model.IdClient.HasValue) shipmentDB.IdClient = model.IdClient.Value;
                if (model.Address != null) shipmentDB.Address = model.Address;
                if (model.IdCity.HasValue) shipmentDB.IdCity = model.IdCity.Value;
                if (model.Mixed.HasValue) shipmentDB.Mixed = model.Mixed.Value;
                if (model.Comments != null) shipmentDB.Comments = model.Comments;

                // ---------------------------------------------------------
                // 3. ACTUALIZACIÓN MANUAL: MANIFESTS (Hijos)
                // ---------------------------------------------------------
                var incomingManifests = model.Manifests ?? new List<ManifestDTO>();

                // 3.1 Detectar eliminados (Están en BD pero NO en el JSON entrante) -> IsDeleted = true
                foreach (var existingManifest in shipmentDB.Manifests)
                {
                    if (!incomingManifests.Any(m => m.IdManifest == existingManifest.IdManifest))
                    {
                        existingManifest.IsDeleted = true;
                    }
                }

                // 3.2 Recorrer los que vienen para Actualizar o Insertar
                foreach (var mDto in incomingManifests)
                {
                    var manifestDB = shipmentDB.Manifests.FirstOrDefault(m => m.IdManifest == mDto.IdManifest && m.IdManifest > 0);

                    if (manifestDB != null)
                    {
                        // === ACTUALIZAR MANIFEST EXISTENTE ===
                        // Conversión de fecha (string a DateTime)
                        if (!string.IsNullOrEmpty(mDto.ExitDate) && DateTime.TryParse(mDto.ExitDate, out DateTime parsedExitDate))
                        {
                            manifestDB.ExitDate = parsedExitDate;
                        }

                        if (mDto.TemperatureTrailerBoxC.HasValue) manifestDB.TemperatureTrailerBoxC = mDto.TemperatureTrailerBoxC.Value;
                        if (mDto.TemperatureTrailerBoxF.HasValue) manifestDB.TemperatureTrailerBoxF = mDto.TemperatureTrailerBoxF.Value;
                        if (mDto.IdSeason.HasValue) manifestDB.IdSeason = mDto.IdSeason.Value;
                        if (mDto.IdDriver.HasValue) manifestDB.IdDriver = mDto.IdDriver.Value;
                        if (mDto.TrailerPlate != null) manifestDB.TrailerPlate = mDto.TrailerPlate;
                        if (mDto.TrailerBoxPlate != null) manifestDB.TrailerBoxPlate = mDto.TrailerBoxPlate;
                        if (mDto.TrailerPlateEconomicNumber != null) manifestDB.TrailerPlateEconomicNumber = mDto.TrailerPlateEconomicNumber;
                        if (mDto.TrailerBoxPlateEconomicNumber != null) manifestDB.TrailerBoxPlateEconomicNumber = mDto.TrailerBoxPlateEconomicNumber;
                        if (mDto.IdTrailerBoxType != null) manifestDB.IdTrailerBoxType = mDto.IdTrailerBoxType;
                        if (mDto.IdShippingCompany.HasValue) manifestDB.IdShippingCompany = mDto.IdShippingCompany.Value;
                        if (mDto.Empaque != null) manifestDB.Empaque = mDto.Empaque;
                        if (mDto.RegFdaNo != null) manifestDB.RegFdaNo = mDto.RegFdaNo;
                        if (mDto.TrackingCode != null) manifestDB.TrackingCode = mDto.TrackingCode;
                        if (mDto.Chismografo != null) manifestDB.Chismografo = mDto.Chismografo;
                        if (mDto.Stamps != null) manifestDB.Stamps = mDto.Stamps;
                        manifestDB.Comments = mDto.Comments;

                        // Procesar sus Hijos (Pallets)
                        ProcessPallets(manifestDB, mDto.ManifestPallets);
                    }
                    else
                    {
                        // === CREAR NUEVO MANIFEST ===
                        var newManifest = new Manifest
                        {
                            // Campos requeridos por tu modelo Manifest.cs (ajustar si tienes valores por defecto)
                            CreationDate = DateTime.UtcNow,
                            IdManifestStatus = 1, // Valor por defecto o el que corresponda
                            IdShipment = shipmentDB.IdShipment,

                            // Campos mapeados manualmente
                            TemperatureTrailerBoxC = mDto.TemperatureTrailerBoxC,
                            TemperatureTrailerBoxF = mDto.TemperatureTrailerBoxF,
                            IdSeason = mDto.IdSeason ?? 0, // Asumiendo int no nullable en BD, usar 0 o valor default
                            IdDriver = mDto.IdDriver ?? 0,
                            TrailerPlate = mDto.TrailerPlate,
                            TrailerBoxPlate = mDto.TrailerBoxPlate,
                            TrailerPlateEconomicNumber = mDto.TrailerPlateEconomicNumber,
                            TrailerBoxPlateEconomicNumber = mDto.TrailerBoxPlateEconomicNumber,
                            IdTrailerBoxType = mDto.IdTrailerBoxType,
                            IdShippingCompany = mDto.IdShippingCompany ?? 0,
                            Empaque = mDto.Empaque,
                            RegFdaNo = mDto.RegFdaNo,
                            TrackingCode = mDto.TrackingCode,
                            Chismografo = mDto.Chismografo,
                            Stamps = mDto.Stamps
                        };

                        // Conversión de fecha para el nuevo
                        if (!string.IsNullOrEmpty(mDto.ExitDate) && DateTime.TryParse(mDto.ExitDate, out DateTime parsedExit))
                        {
                            newManifest.ExitDate = parsedExit;
                        }
                        else
                        {
                            newManifest.ExitDate = DateTime.UtcNow; // Fallback si es requerido
                        }

                        // Agregar a la colección del padre
                        shipmentDB.Manifests.Add(newManifest);

                        // Procesar sus Hijos (Pallets) en el nuevo objeto
                        ProcessPallets(newManifest, mDto.ManifestPallets);
                    }
                }

                // 4. Guardar Cambios
                var result = await _repository.Update(shipmentDB);

                if (!result)
                    return BadRequest(new ApiResponse { Message = "Error al guardar los cambios." });

                return Ok(new ApiResponse());
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        private void ProcessPallets(Manifest manifestDB, List<ManifestPalletDTO>? incomingPallets)
        {
            incomingPallets ??= new List<ManifestPalletDTO>();

            // A) Marcar IsDeleted si no viene en la lista
            if (manifestDB.ManifestPallets != null)
            {
                foreach (var existingPallet in manifestDB.ManifestPallets)
                {
                    if (!incomingPallets.Any(p => p.IdManifestPallet == existingPallet.IdManifestPallet))
                    {
                        existingPallet.IsDeleted = true;
                    }
                }
            }
            else
            {
                manifestDB.ManifestPallets = new List<ManifestPallet>();
            }

            // B) Actualizar o Insertar
            foreach (var pDto in incomingPallets)
            {
                var palletDB = manifestDB.ManifestPallets.FirstOrDefault(p => p.IdManifestPallet == pDto.IdManifestPallet && p.IdManifestPallet > 0);

                if (palletDB != null)
                {
                    // Update
                    if (pDto.IdLabel.HasValue) palletDB.IdLabel = pDto.IdLabel.Value;
                    if (pDto.Position.HasValue) palletDB.Position = pDto.Position.Value;
                    palletDB.TemperatureF = pDto.TemperatureF;
                    palletDB.TemperatureC = pDto.TemperatureC;
                    if (pDto.Chismografo.HasValue) palletDB.Chismografo = pDto.Chismografo.Value;

                    // Procesar Nietos (Loadings)
                    ProcessLoadings(palletDB, pDto.ManifestPalletLoadings);
                }
                else
                {
                    // Insert
                    var newPallet = new ManifestPallet
                    {
                        IdManifest = manifestDB.IdManifest, // Solo útil si el manifest ya existía, EF lo maneja por navegación
                        IdLabel = pDto.IdLabel ?? 0,
                        Position = pDto.Position ?? 0,
                        TemperatureF = pDto.TemperatureF,
                        TemperatureC = pDto.TemperatureC,
                        Chismografo = pDto.Chismografo,
                        IsDeleted = false
                    };

                    manifestDB.ManifestPallets.Add(newPallet);

                    // Procesar Nietos en nuevo Pallet
                    ProcessLoadings(newPallet, pDto.ManifestPalletLoadings);
                }
            }
        }

        private void ProcessLoadings(ManifestPallet palletDB, List<ManifestPalletLoadingDTO>? incomingLoadings)
        {
            incomingLoadings ??= new List<ManifestPalletLoadingDTO>();

            // A) Marcar IsDeleted si no viene en la lista
            if (palletDB.ManifestPalletLoadings != null)
            {
                foreach (var existingLoad in palletDB.ManifestPalletLoadings)
                {
                    if (!incomingLoadings.Any(l => l.IdManifestPalletLoading == existingLoad.IdManifestPalletLoading))
                    {
                        existingLoad.IsDeleted = true;
                    }
                }
            }
            else
            {
                palletDB.ManifestPalletLoadings = new List<ManifestPalletLoading>();
            }

            // B) Actualizar o Insertar
            foreach (var lDto in incomingLoadings)
            {
                var loadDB = palletDB.ManifestPalletLoadings.FirstOrDefault(l => l.IdManifestPalletLoading == lDto.IdManifestPalletLoading && l.IdManifestPalletLoading > 0);

                if (loadDB != null)
                {
                    // Update
                    if (lDto.IdLabelType.HasValue) loadDB.IdLabelType = lDto.IdLabelType.Value;
                    if (lDto.Description != null) loadDB.Description = lDto.Description;
                    if (lDto.BoxQuantity.HasValue) loadDB.BoxQuantity = lDto.BoxQuantity.Value;
                }
                else
                {
                    // Insert
                    var newLoad = new ManifestPalletLoading
                    {
                        // IdManifestPallet lo asigna EF al agregarlo a la colección del padre
                        IdLabelType = lDto.IdLabelType ?? 0,
                        Description = lDto.Description,
                        BoxQuantity = lDto.BoxQuantity,
                        IsDeleted = false
                    };

                    palletDB.ManifestPalletLoadings.Add(newLoad);
                }
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteShipment(int id)
        {
            var shipment = await _repository.FirstOrDefault<Shipment>(x => x.IdShipment == id && !(x.IsDeleted ?? false));
            if (shipment == null)
                return NotFound(new ApiResponse());

            shipment.IsDeleted = true;

            var result = await _repository.Update(shipment);

            if (!result)
                return BadRequest(new ApiResponse());

            var shipmentDTO = _mapper.Map<ShipmentDTO>(shipment);
            return Ok(new ApiResponse { Data = shipmentDTO });
        }

        [HttpGet("last-plate/{idCompany}/{economicNo}/{isBoxPlateEconomic}")]
        public async Task<ActionResult> GetLastPlateByEconomicNumber(int idCompany, string economicNo, bool isBoxPlateEconomic)
        {
            var trailerPlate = "";
            var manifestDBQuery = await _repository.Query<Manifest>();
            manifestDBQuery = manifestDBQuery
                .Where(x => x.IdCompany == idCompany && !(x.IsDeleted ?? false))
            .OrderByDescending(x => x.CreationDate);

            if (isBoxPlateEconomic)
                trailerPlate = manifestDBQuery.Where(x => x.TrailerBoxPlateEconomicNumber.ToLower().Equals(economicNo.ToLower())).Select(x => x.TrailerBoxPlate).FirstOrDefault();
            else
                trailerPlate = manifestDBQuery.Where(x => x.TrailerPlateEconomicNumber.ToLower().Equals(economicNo.ToLower())).Select(x => x.TrailerBoxPlate).FirstOrDefault();

            return Ok(new ApiResponse { Data = trailerPlate });
        }

    }
}