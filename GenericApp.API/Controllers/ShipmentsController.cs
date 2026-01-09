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
using System.Drawing.Printing;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("shipments")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ShipmentsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly UserManager<IdentityUser> _userManager;

        public ShipmentsController(
            UserManager<IdentityUser> userManager,
            IRepository repository,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _mapper = mapper;
            _userManager = userManager;
        }

        [HttpGet("pagination")]
        public async Task<ActionResult> GetShipmentsPagination(
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
                CreationDate = s.CreationDate,
                ShipmentDate = s.ShipmentDate,
                IdClient = s.IdClient,
                IdCity = s.IdCity,
                Mixed = s.Mixed,
                IdShipmentStatus = s.IdShipmentStatus,
                Comments = s.Comments,
                Manifests = s.Manifests.Where(wmp => !(wmp.IsDeleted ?? false)).Select(m => new ManifestDTO
                {
                    IdManifest = m.IdManifest,
                    TrailerBoxPlate = m.TrailerBoxPlate,
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
                    IdShippingCompany = m.IdShippingCompany,
                    IdShippingCompanyNavigation = new ShippingCompanyDTO
                    {
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
                        TemperatureC = p.TemperatureC,
                        TemperatureF = p.TemperatureF,
                        Comments = p.Comments,
                        ManifestPalletLoadings = p.ManifestPalletLoadings.Where(wm => !(wm.IsDeleted ?? false)).Select(pl => new ManifestPalletLoadingDTO
                        {
                            IdManifestPalletLoading = pl.IdManifestPalletLoading,
                            IdLabelType = pl.IdLabelType,
                            Description = pl.Description,
                            IdLabelTypeNavigation = new LabelTypeDTO
                            {
                                Description = pl.IdLabelTypeNavigation.Description
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
        [AllowAnonymous] // Opcional, depende de tu seguridad
        public async Task<IActionResult> GetManifestPdfById(int id)
        {
            Thread.Sleep(2000);
            var shipmentQuery = await _repository.Query<Shipment>();

            var shipment = await shipmentQuery
            .Select(s => new ShipmentDTO

            {
                IdShipment = s.IdShipment,
                CreationDate = s.CreationDate,
                ShipmentDate = s.ShipmentDate,
                IdClient = s.IdClient,
                IdCity = s.IdCity,
                Mixed = s.Mixed,
                IdShipmentStatus = s.IdShipmentStatus,
                Comments = s.Comments,
                Manifests = s.Manifests.Where(wmp => !(wmp.IsDeleted ?? false)).Select(m => new ManifestDTO
                {
                    IdManifest = m.IdManifest,
                    TrailerBoxPlate = m.TrailerBoxPlate,
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
                    IdShippingCompany = m.IdShippingCompany,
                    IdShippingCompanyNavigation = new ShippingCompanyDTO
                    {
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
                        TemperatureC = p.TemperatureC,
                        TemperatureF = p.TemperatureF,
                        Comments = p.Comments,
                        ManifestPalletLoadings = p.ManifestPalletLoadings.Where(wm => !(wm.IsDeleted ?? false)).Select(pl => new ManifestPalletLoadingDTO
                        {
                            IdManifestPalletLoading = pl.IdManifestPalletLoading,
                            IdLabelType = pl.IdLabelType,
                            Description = pl.Description,
                            IdLabelTypeNavigation = new LabelTypeDTO
                            {
                                Description = pl.IdLabelTypeNavigation.Description
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
                        page.Header().Element(header => ComposeHeader(header, shipment, manifest));

                        // Content
                        page.Content().Element(content =>
                        {
                            content.Column(col =>
                            {
                                // Grid del Trailer
                                col.Item().Element(e => ComposeContent(e, manifest));
                                // Extras (Sellos y Chismografo) - NUEVO
                                col.Item().Element(e => ComposeExtras(e, manifest));
                            });
                        });

                        // Footer
                        page.Footer().Element(footer => ComposeFooter(footer, manifest));
                    });
                }
            });

            // 3. Retornar el archivo PDF
            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", $"Manifiesto_{shipment.IdShipment}.pdf");
        }

        private void ComposeHeader(IContainer container, ShipmentDTO shipment, ManifestDTO manifest)
        {
            container.Column(column =>
            {
                // --- FILA 1: Logos y Títulos ---
                column.Item().Row(row =>
                {
                    // Izquierda: Datos Fiscales / Logo
                    row.RelativeItem(4).Column(stack =>
                    {
                        stack.Item().Text("MISION DEL BISANI S.A. DE C.V.").Bold().FontSize(14).FontColor(Colors.Blue.Darken2);
                        stack.Item().Text("HERMENEGILDO GALEANA NO. 106 COL. CENTRO").FontSize(7).FontColor(Colors.Grey.Medium);
                        stack.Item().Text("CIUDAD CONSTITUCION, B.C.S., MEXICO. C.P. 23600").FontSize(7).FontColor(Colors.Grey.Medium);
                    });

                    // Derecha: Datos del Documento
                    row.RelativeItem(4).AlignRight().Column(stack =>
                    {
                        stack.Item().Text("MANIFIESTO DE EMBARQUE").FontSize(16).Bold();
                        stack.Item().Text($"REMISIÓN: {shipment.IdShipment:D4}").FontSize(12).Bold().FontColor(Colors.Red.Medium);
                        stack.Item().Text($"FECHA: {shipment.ShipmentDate?.ToString("dd/MM/yyyy") ?? "-"}").FontSize(9);
                    });
                });

                // --- FILA 2: Tabla de Datos Detallados ---
                column.Item().PaddingTop(10).Decoration(decoration =>
                {
                    decoration.Before().BorderBottom(1).BorderColor(Colors.Grey.Lighten1);
                    decoration.Content().PaddingVertical(5).Row(row =>
                    {
                        // Columna 1
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(t => { t.Span("Viaje #: ").Bold(); t.Span($"{manifest.IdManifest}"); });
                            col.Item().Text(t => { t.Span("Chofer: ").Bold(); t.Span(manifest.IdDriverNavigation?.Name ?? "-"); });
                            col.Item().Text(t => { t.Span("FDA No: ").Bold(); t.Span(manifest.RegFdaNo ?? "-"); });
                            col.Item().Text(t => { t.Span("Temporada: ").Bold(); t.Span($"{manifest.SeasonYear}"); });
                        });

                        // Columna 2
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(t => { t.Span("Placas Trailer: ").Bold(); t.Span(manifest.TrailerPlate ?? "-"); });
                            col.Item().Text(t => { t.Span("Placas Caja: ").Bold(); t.Span(manifest.TrailerBoxPlate ?? "-"); });
                            col.Item().Text(t => { t.Span("Línea: ").Bold(); t.Span(manifest.IdShippingCompanyNavigation?.Name ?? "-"); });
                            col.Item().Text(t => { t.Span("Empaque: ").Bold(); t.Span(manifest.Empaque ?? "-"); });
                        });

                        // Columna 3
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text(t => { t.Span("Temp: ").Bold(); t.Span($"{manifest.TemperatureTrailerBoxF}°F / {manifest.TemperatureTrailerBoxC}°C"); });
                            col.Item().Text(t => { t.Span("Hr. Salida: ").Bold(); t.Span(manifest.ExitDate ?? "-"); });
                            col.Item().Text(t => { t.Span("Mixto: ").Bold(); t.Span(shipment.Mixed == true ? "SÍ" : "NO"); });
                            col.Item().Text(t => { t.Span("GNN #: ").Bold(); t.Span(manifest.GnnNumber ?? "-"); });
                        });
                    });
                });
            });
        }
        private void ComposeContent(IContainer container, ManifestDTO manifest)
        {
            container.PaddingVertical(10).Column(column =>
            {
                column.Item().PaddingBottom(5).Text("DISTRIBUCIÓN DE CARGA (VISTA SUPERIOR)").FontSize(10).Bold().FontColor(Colors.Grey.Darken1);

                // Grid del Trailer (12 filas x 2 lados = 24 posiciones)
                column.Item().Border(1).BorderColor(Colors.Grey.Lighten1).Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(); // Izquierda
                        columns.ConstantColumn(20); // Pasillo
                        columns.RelativeColumn(); // Derecha
                    });

                    int maxPositions = 24;

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
                // Header de celda (Num Posición + Temp)
                stack.Item().Row(row =>
                {
                    row.AutoItem().Background(Colors.Grey.Lighten2).PaddingHorizontal(4).Text($"{position}").Bold().FontSize(8);
                    if (pallet != null)
                    {
                        row.RelativeItem().AlignRight().Text($"{pallet.TemperatureF}°F").FontSize(7).FontColor(Colors.Blue.Medium);
                    }
                });

                if (pallet != null)
                {
                    int totalBoxesInPallet = 0;

                    // Listado de productos (Loadings)
                    foreach (var load in pallet.ManifestPalletLoadings.Where(l => !(l.IsDeleted ?? false)))
                    {
                        var qty = load.BoxQuantity ?? 0;
                        totalBoxesInPallet += (int)qty;

                        stack.Item().PaddingTop(2).Text(t =>
                        {
                            t.Span($"{qty} - ").Bold().FontSize(8);
                            t.Span(load.Description ?? load.IdLabelTypeNavigation?.Description ?? "").FontSize(7);
                        });
                    }

                    // Total del Pallet (Texto Verde)
                    stack.Item().PaddingTop(4)
                        .BorderTop(1, Unit.Point).BorderColor(Colors.Grey.Lighten4)
                        .AlignRight()
                        .Text($"Total: {totalBoxesInPallet}")
                        .Bold().FontSize(8).FontColor(Colors.Green.Darken2);
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
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("_________________________").AlignCenter();
                    col.Item().Text("FIRMA CHOFER").AlignCenter().FontSize(8);
                });

                // Firma Despachador
                row.RelativeItem().Column(col =>
                {
                    col.Item().Text("_________________________").AlignCenter();
                    col.Item().Text("FIRMA DESPACHADOR").AlignCenter().FontSize(8);
                });

                // Cuadro Resumen Total
                row.RelativeItem().Border(1).BorderColor(Colors.Black).Padding(5).Column(col =>
                {
                    col.Item().Text("RESUMEN TOTAL").Bold().Underline().FontSize(10);
                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Total Cajas:").FontSize(9);
                        r.AutoItem().Text($"{totalBoxes}").Bold().FontSize(10);
                    });
                    col.Item().Row(r =>
                    {
                        r.RelativeItem().Text("Total Pallets:").FontSize(9);
                        r.AutoItem().Text($"{totalPallets}").Bold().FontSize(10);
                    });
                });
            });
        }
        private void ComposeExtras(IContainer container, ManifestDTO manifest)
        {
            container.PaddingTop(10).Row(row =>
            {
                // Caja de Comentarios / Chismógrafo
                row.RelativeItem(1).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Column(col =>
                {
                    col.Item().Text("CHISMÓGRAFO / NOTAS:").Bold().FontSize(8);
                    col.Item().Text(manifest.Chismografo ?? "Sin comentarios.").FontSize(8);
                });

                row.ConstantItem(10); // Espacio separador

                // Caja de Sellos
                row.RelativeItem(1).Border(1).BorderColor(Colors.Grey.Lighten2).Padding(5).Column(col =>
                {
                    col.Item().Text("SELLOS (STAMPS):").Bold().FontSize(8);
                    col.Item().Text(manifest.Stamps ?? "Sin sellos.").FontSize(9).FontColor(Colors.Red.Medium).Bold();
                });
            });
        }

        // --- DISEÑO TIPO REMISIÓN (Basado en la imagen) ---
        [HttpGet("remision-pdf/{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRemisionPdfById(int id)
        {
            var shipmentQuery = await _repository.Query<Shipment>();

            var shipment = await shipmentQuery
            .Select(s => new ShipmentDTO

            {
                IdShipment = s.IdShipment,
                CreationDate = s.CreationDate,
                ShipmentDate = s.ShipmentDate,
                IdClient = s.IdClient,
                IdCity = s.IdCity,
                Mixed = s.Mixed,
                IdShipmentStatus = s.IdShipmentStatus,
                Comments = s.Comments,
                Manifests = s.Manifests.Where(wmp => !(wmp.IsDeleted ?? false)).Select(m => new ManifestDTO
                {
                    IdManifest = m.IdManifest,
                    TrailerBoxPlate = m.TrailerBoxPlate,
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
                    IdShippingCompany = m.IdShippingCompany,
                    IdShippingCompanyNavigation = new ShippingCompanyDTO
                    {
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
                        TemperatureC = p.TemperatureC,
                        TemperatureF = p.TemperatureF,
                        Comments = p.Comments,
                        ManifestPalletLoadings = p.ManifestPalletLoadings.Where(wm => !(wm.IsDeleted ?? false)).Select(pl => new ManifestPalletLoadingDTO
                        {
                            IdManifestPalletLoading = pl.IdManifestPalletLoading,
                            IdLabelType = pl.IdLabelType,
                            Description = pl.Description,
                            IdLabelTypeNavigation = new LabelTypeDTO
                            {
                                Description = pl.IdLabelTypeNavigation.Description
                            },
                            BoxQuantity = pl.BoxQuantity
                        }).ToList()
                    }).ToList()
                }).ToList()
            }).FirstOrDefaultAsync(x => x.IdShipment == id);


            if (shipment == null) return NotFound("Shipment not found");

            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                // Generamos una página por cada Manifiesto dentro del Shipment
                foreach (var manifest in shipment.Manifests)
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.Letter);
                        page.Margin(1, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(9).FontFamily(Fonts.Lato));

                        // 1. Header (Empresa y Recuadro Remisión)
                        page.Header().Element(header => ComposeRemisionHeader(header, shipment, manifest));

                        page.Content().Column(col =>
                        {
                            // 2. Bloque de Info (Cliente/Trailer con fondos azules)
                            col.Item().Element(e => ComposeRemisionInfoBlock(e, shipment, manifest));

                            // 3. Tabla de Productos
                            col.Item().Element(e => ComposeRemisionTable(e, manifest));
                        });

                        // 4. Footer (Observaciones y Totales)
                        page.Footer().Element(footer => ComposeRemisionFooter(footer, manifest));
                    });
                }
            });

            var stream = new MemoryStream();
            document.GeneratePdf(stream);
            stream.Position = 0;

            return File(stream, "application/pdf", $"Remision_{shipment.IdShipment}.pdf");
        }
        private void ComposeRemisionHeader(IContainer container, ShipmentDTO shipment, ManifestDTO manifest)
        {
            container.Row(row =>
            {
                // IZQUIERDA: Datos de la empresa
                row.RelativeItem(6).Column(col =>
                {
                    col.Item().Text("MISION DEL BISANI S.A. DE C.V.").Bold().FontSize(14).FontColor(Colors.Black);
                    col.Item().Text("HERMENEGILDO GALEANA NO. 106").FontSize(9);
                    col.Item().Text("COL. CENTRO, CIUDAD CONSTITUCION").FontSize(9);
                    col.Item().Text("B.C.S., MEXICO. C.P. 23600").FontSize(9);
                    col.Item().Text("Email: contacto@misionbisani.com").FontSize(9);
                });

                // DERECHA: Recuadro "REMISIÓN"
                row.RelativeItem(4).Border(1).BorderColor(Colors.Blue.Darken4).Column(col =>
                {
                    col.Item().Background(Colors.White).AlignCenter().Padding(2)
                        .Text("REMISIÓN").Bold().FontSize(14).FontColor(Colors.Black);

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c =>
                        {
                            c.RelativeColumn(1);
                            c.RelativeColumn(2);
                        });

                        // --- CORRECCIÓN 1: Cambiar 'void' por 'IContainer' ---
                        static IContainer CellStyle(IContainer c) => c.BorderTop(1).BorderColor(Colors.Black).Padding(2);
                        static IContainer LabelStyle(IContainer c) => c.Background(Colors.Blue.Darken4).Padding(2);
                        // ----------------------------------------------------

                        // --- CORRECCIÓN 2: Encadenar los métodos ---
                        // En lugar de llamar a la función y luego al texto en líneas separadas,
                        // las unimos en una sola línea fluida: LabelStyle(c).Text(...)

                        // 1. FECHA
                        table.Cell().Element(c => LabelStyle(c).AlignCenter().Text("FECHA").FontColor(Colors.White).Bold());
                        table.Cell().Element(c => CellStyle(c).AlignCenter().Text($"{shipment.ShipmentDate?.ToString("dd/MM/yyyy") ?? "-"}"));

                        // 2. VIAJE
                        table.Cell().Element(c => LabelStyle(c).AlignCenter().Text("VIAJE").FontColor(Colors.White).Bold());
                        table.Cell().Element(c => CellStyle(c).AlignCenter().Text($"{manifest.IdManifest}"));

                        // 3. CHOFER
                        table.Cell().Element(c => LabelStyle(c).AlignCenter().Text("CHOFER").FontColor(Colors.White).Bold());
                        table.Cell().Element(c => CellStyle(c).AlignCenter().Text($"{manifest.IdDriverNavigation?.Name ?? "-"}").FontSize(7));
                    });
                });
            });
        }
        private void ComposeRemisionInfoBlock(IContainer container, ShipmentDTO shipment, ManifestDTO manifest)
        {
            container.PaddingVertical(10).Row(row =>
            {
                // --- BLOQUE IZQUIERDO (Cliente) ---
                row.RelativeItem().PaddingRight(5).Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.ConstantColumn(70); // Ancho etiqueta
                        c.RelativeColumn();   // Ancho valor
                    });

                    // Función local para filas azules
                    void AddRow(string label, string value)
                    {
                        table.Cell().Border(1).BorderColor(Colors.Blue.Darken4).Background(Colors.Blue.Darken4).Padding(2)
                            .Text(label).FontColor(Colors.White).Bold().FontSize(8);

                        table.Cell().Border(1).BorderColor(Colors.Blue.Darken4).Padding(2)
                            .Text(value).FontSize(8);
                    }

                    AddRow("CLIENTE", $"ID: {shipment.IdClient}"); // Ajustar si tienes el Nombre del Cliente
                    AddRow("DESTINO", shipment.IdCity?.ToString() ?? "-"); // Ajustar con nombre ciudad
                    AddRow("SICL", "-"); // Campo fijo imagen
                    AddRow("OMO", "-");  // Campo fijo imagen
                });

                // --- BLOQUE DERECHO (Trailer) ---
                row.RelativeItem().PaddingLeft(5).Table(table =>
                {
                    table.ColumnsDefinition(c =>
                    {
                        c.ConstantColumn(70);
                        c.RelativeColumn();
                    });

                    void AddRow(string label, string value)
                    {
                        table.Cell().Border(1).BorderColor(Colors.Blue.Darken4).Background(Colors.Blue.Darken4).Padding(2)
                            .Text(label).FontColor(Colors.White).Bold().FontSize(8);

                        table.Cell().Border(1).BorderColor(Colors.Blue.Darken4).Padding(2)
                            .Text(value).FontSize(8);
                    }

                    AddRow("TRAILER", manifest.TrailerPlate ?? "-");
                    AddRow("CAJA", manifest.TrailerBoxPlate ?? "-");
                    AddRow("SELLO", manifest.Stamps ?? "-");
                });
            });
        }
        private void ComposeRemisionTable(IContainer container, ManifestDTO manifest)
        {
            // Aplanamos la lista: De Pallets -> Loadings -> Lista Simple
            var allItems = manifest.ManifestPallets?
                .Where(p => !(p.IsDeleted ?? false))
                .SelectMany(p => p.ManifestPalletLoadings)
                .Where(l => !(l.IsDeleted ?? false))
                .ToList() ?? new List<ManifestPalletLoadingDTO>();

            container.Table(table =>
            {
                // Definición de columnas (Imagen: Cant, Descripcion, Peso)
                table.ColumnsDefinition(columns =>
                {
                    columns.ConstantColumn(50); // CANT.
                    columns.RelativeColumn();   // DESCRIPCION
                    columns.ConstantColumn(80); // PESO (Lbs)
                });

                // Header de la tabla
                table.Header(header =>
                {
                    header.Cell().Border(1).BorderColor(Colors.Black).Background(Colors.Blue.Darken4).Padding(2).Text("CANT.").FontColor(Colors.White).Bold().AlignCenter();
                    header.Cell().Border(1).BorderColor(Colors.Black).Background(Colors.Blue.Darken4).Padding(2).Text("DESCRIPCION").FontColor(Colors.White).Bold().AlignCenter();
                    header.Cell().Border(1).BorderColor(Colors.Black).Background(Colors.Blue.Darken4).Padding(2).Text("PESO (Lbs)").FontColor(Colors.White).Bold().AlignCenter();
                });

                // Filas
                foreach (var item in allItems)
                {
                    table.Cell().Border(1).BorderColor(Colors.Black).Padding(2).Text($"{item.BoxQuantity}").AlignCenter();
                    table.Cell().Border(1).BorderColor(Colors.Black).Padding(2).Text(item.Description ?? "Sin descripción");

                    // Nota: No tenemos campo "Peso" en el DTO actual, lo dejo vacío o guión como placeholder
                    table.Cell().Border(1).BorderColor(Colors.Black).Padding(2).Text("-").AlignCenter();
                }

                // Filas vacías de relleno (para que se vea como la hoja rayada de la imagen)
                for (int i = 0; i < 10; i++) // Agrega 10 filas vacías de estética
                {
                    table.Cell().Border(1).BorderColor(Colors.Black).MinHeight(15).Text("");
                    table.Cell().Border(1).BorderColor(Colors.Black).MinHeight(15).Text("");
                    table.Cell().Border(1).BorderColor(Colors.Black).MinHeight(15).Text("");
                }
            });
        }
        private void ComposeRemisionFooter(IContainer container, ManifestDTO manifest)
        {
            // Cálculos
            var totalBoxes = manifest.ManifestPallets?
                .Where(p => !(p.IsDeleted ?? false))
                .SelectMany(p => p.ManifestPalletLoadings)
                .Where(l => !(l.IsDeleted ?? false))
                .Sum(l => l.BoxQuantity) ?? 0;

            var totalPallets = manifest.ManifestPallets?
                .Count(p => !(p.IsDeleted ?? false)) ?? 0;

            container.PaddingTop(5).Row(row =>
            {
                // IZQUIERDA: Observaciones y Recibió
                row.RelativeItem(7).PaddingRight(10).Column(col =>
                {
                    // Caja Observaciones
                    col.Item().Border(1).BorderColor(Colors.Blue.Darken4).Column(obs =>
                    {
                        obs.Item().Background(Colors.Blue.Darken4).Padding(2).Text("OBSERVACIONES").FontColor(Colors.White).Bold().FontSize(8);
                        obs.Item().Padding(5).MinHeight(40).Text(manifest.Comments ?? manifest.Chismografo ?? "").FontSize(8);
                    });

                    // Línea Recibió
                    col.Item().PaddingTop(30).Row(r =>
                    {
                        r.AutoItem().Text("RECIBIÓ: ").Bold();
                        r.RelativeItem().BorderBottom(1).BorderColor(Colors.Black);
                    });
                });

                // DERECHA: Totales
                row.RelativeItem(3).Border(1).BorderColor(Colors.Black).Column(col =>
                {
                    col.Item().Background(Colors.Blue.Darken4).Padding(2).Text("TOTALES").FontColor(Colors.White).Bold().AlignCenter();

                    col.Item().Table(table =>
                    {
                        table.ColumnsDefinition(c => { c.RelativeColumn(); c.ConstantColumn(50); });

                        table.Cell().Border(1).Padding(2).Text("PALLETS").FontSize(8).Bold();
                        table.Cell().Border(1).Padding(2).Text($"{totalPallets}").FontSize(8).AlignCenter();

                        table.Cell().Border(1).Padding(2).Text("BULTOS").FontSize(8).Bold();
                        table.Cell().Border(1).Padding(2).Text($"{totalBoxes}").FontSize(8).AlignCenter();

                        table.Cell().Border(1).Padding(2).Text("PESO TOTAL (Lbs)").FontSize(8).Bold();
                        table.Cell().Border(1).Padding(2).Text("-").FontSize(8).AlignCenter();
                    });
                });
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
                            manifestDB.IdManifestStatus = (int)ManifestStatusEnum.Activa;
                            manifestDB.IsDeleted = false;
                            manifestDB.ExitDate = DateTime.ParseExact(manifestDto.ExitDate, "HH:mm", null);
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
                    if (mDto.IdShippingCompany.HasValue) manifestDB.IdShippingCompany = mDto.IdShippingCompany.Value;
                    if (mDto.Empaque != null) manifestDB.Empaque = mDto.Empaque;
                    if (mDto.RegFdaNo != null) manifestDB.RegFdaNo = mDto.RegFdaNo;
                    if (mDto.TrackingCode != null) manifestDB.TrackingCode = mDto.TrackingCode;
                    if (mDto.Chismografo != null) manifestDB.Chismografo = mDto.Chismografo;
                    if (mDto.Stamps != null) manifestDB.Stamps = mDto.Stamps;

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
                    if (pDto.TemperatureF.HasValue) palletDB.TemperatureF = pDto.TemperatureF.Value;
                    if (pDto.TemperatureC.HasValue) palletDB.TemperatureC = pDto.TemperatureC.Value;

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
    }
}