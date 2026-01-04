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
                Manifests = s.Manifests.Select(m => new ManifestDTO
                {
                    IdManifest = m.IdManifest,
                    TrailerBoxPlate = m.TrailerBoxPlate,
                    RegFdaNo = m.RegFdaNo,
                    IdDriver = m.IdDriver,
                    TemperatureTrailerBoxC = m.TemperatureTrailerBoxC,
                    TemperatureTrailerBoxF = m.TemperatureTrailerBoxF,
                    IdSeason = m.IdSeason,
                    SeasonYear = m.IdSeasonNavigation.SeasonYear,
                    TrailerPlate = m.TrailerPlate,
                    IdShippingCompany = m.IdShippingCompany,
                    Comments = m.Comments,
                    Empaque = m.Empaque,
                    ExitDate = m.ExitDate.ToString("HH:mm"),
                    TrackingCode = m.TrackingCode,
                    Stamps = m.Stamps,
                    Chismografo = m.Chismografo,
                    GnnNumber = m.GnnNumber,
                    ManifestPallets = m.ManifestPallets.Select(p => new ManifestPalletDTO
                    {
                        IdManifestPallet = p.IdManifestPallet,
                        IdLabel = p.IdLabel,
                        MaxBoxQuantity = p.MaxBoxQuantity,
                        Position = p.Position,
                        TemperatureC = p.TemperatureC,
                        TemperatureF = p.TemperatureF,
                        Comments = p.Comments,
                        ManifestPalletLoadings = p.ManifestPalletLoadings.Select(pl => new ManifestPalletLoadingDTO
                        {
                            IdManifestPalletLoading = pl.IdManifestPalletLoading,
                            IdLabelType = pl.IdLabelType,
                            Description = pl.Description,
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
            // 1. Obtener el Shipment con toda su jerarquía (Manifests -> Pallets -> Loadings)
            var createdShipmentQuery = await _repository.Query<Shipment>();
            var shipmentDB = await createdShipmentQuery
                .Include(s => s.Manifests!)
                    .ThenInclude(m => m.ManifestPallets!)
                        .ThenInclude(p => p.ManifestPalletLoadings)
                .FirstOrDefaultAsync(x => x.IdShipment == model.IdShipment && !(x.IsDeleted ?? false));

            if (shipmentDB == null || (shipmentDB.IsDeleted ?? false))
                return NotFound(new ApiResponse { Message = "Shipment no encontrado." });

            // 2. Actualizar propiedades escalares del Shipment (evitando colecciones por seguridad)
            // Nota: Asegúrate de que tu perfil de AutoMapper para Shipment -> Shipment ignore Manifests
            // o que el mapeo aquí no sobrescriba la colección rastreada por EF.
            _mapper.Map(model, shipmentDB);

            // 3. Manejo de MANIFESTS (Eliminar, Actualizar, Agregar)
            var incomingManifests = model.Manifests ?? new List<ManifestDTO>();

            // 3.1 Eliminar Manifests que ya no vienen en el DTO
            var manifestIdsToKeep = incomingManifests.Where(m => m.IdManifest > 0).Select(m => m.IdManifest).ToList();
            var manifestsToRemove = shipmentDB.Manifests!.Where(m => !manifestIdsToKeep.Contains(m.IdManifest)).ToList();

            if (manifestsToRemove.Any())
            {
                // Opcional: Marcar como borrado lógico si tu DB lo requiere, o eliminar físico:
                // foreach(var m in manifestsToRemove) m.IsDeleted = true; 
                _repository.RemoveRange(manifestsToRemove);
            }

            foreach (var manifestDto in incomingManifests)
            {
                var manifestDB = shipmentDB.Manifests!.FirstOrDefault(m => m.IdManifest == manifestDto.IdManifest);

                // A) ACTUALIZAR MANIFEST EXISTENTE
                if (manifestDB != null)
                {
                    _mapper.Map(manifestDto, manifestDB);

                    // 4. Manejo de PALLETS (dentro de Manifest existente)
                    var incomingPallets = manifestDto.ManifestPallets ?? new List<ManifestPalletDTO>();
                    var palletIdsToKeep = incomingPallets.Where(p => p.IdManifestPallet > 0).Select(p => p.IdManifestPallet).ToList();
                    var palletsToRemove = manifestDB.ManifestPallets!.Where(p => !palletIdsToKeep.Contains(p.IdManifestPallet)).ToList();

                    if (palletsToRemove.Any())
                    {
                        _repository.RemoveRange(palletsToRemove);
                    }

                    foreach (var palletDto in incomingPallets)
                    {
                        var palletDB = manifestDB.ManifestPallets!.FirstOrDefault(p => p.IdManifestPallet == palletDto.IdManifestPallet);

                        // A.1) ACTUALIZAR PALLET EXISTENTE
                        if (palletDB != null)
                        {
                            _mapper.Map(palletDto, palletDB);

                            // 5. Manejo de LOADINGS (dentro de Pallet existente)
                            var incomingLoadings = palletDto.ManifestPalletLoadings ?? new List<ManifestPalletLoadingDTO>();
                            var loadingIdsToKeep = incomingLoadings.Where(l => l.IdManifestPalletLoading > 0).Select(l => l.IdManifestPalletLoading).ToList();
                            var loadingsToRemove = palletDB.ManifestPalletLoadings!.Where(l => !loadingIdsToKeep.Contains(l.IdManifestPalletLoading)).ToList();

                            if (loadingsToRemove.Any())
                            {
                                _repository.RemoveRange(loadingsToRemove);
                            }

                            foreach (var loadDto in incomingLoadings)
                            {
                                var loadingDB = palletDB.ManifestPalletLoadings!.FirstOrDefault(l => l.IdManifestPalletLoading == loadDto.IdManifestPalletLoading);

                                if (loadingDB != null)
                                {
                                    // Actualizar Loading existente
                                    _mapper.Map(loadDto, loadingDB);
                                }
                                else if (loadDto.IdManifestPalletLoading <= 0)
                                {
                                    // Nuevo Loading en Pallet existente
                                    var newLoading = _mapper.Map<ManifestPalletLoading>(loadDto);
                                    newLoading.IdManifestPallet = palletDB.IdManifestPallet;
                                    // Nota: No asignamos IdManifest/IdShipment aquí porque en tu modelo 'ManifestPalletLoading.cs' 
                                    // no existen esas propiedades como enteros, solo como navegaciones.
                                    palletDB.ManifestPalletLoadings!.Add(newLoading);
                                }
                            }
                        }
                        // A.2) AGREGAR NUEVO PALLET (en Manifest existente)
                        else if (palletDto.IdManifestPallet <= 0)
                        {
                            var newPallet = _mapper.Map<ManifestPallet>(palletDto);
                            newPallet.IdManifest = manifestDB.IdManifest; // Vincular al padre

                            // Asegurar que los loadings del nuevo pallet se vinculen correctamente
                            if (newPallet.ManifestPalletLoadings != null)
                            {
                                foreach (var load in newPallet.ManifestPalletLoadings)
                                {
                                    // EF Core manejará el IdManifestPallet automáticamente al agregarlo a la colección
                                    // pero si hay propiedades adicionales requeridas, asígnalas aquí.
                                }
                            }
                            manifestDB.ManifestPallets!.Add(newPallet);
                        }
                    }
                }
                // B) AGREGAR NUEVO MANIFEST
                else if (manifestDto.IdManifest <= 0)
                {
                    var newManifest = _mapper.Map<Manifest>(manifestDto);
                    newManifest.IdShipment = shipmentDB.IdShipment; // Vincular al padre principal
                    newManifest.CreationDate = DateTime.UtcNow;

                    // Al ser un nuevo Manifest completo, AutoMapper debería haber mapeado la jerarquía (Pallets -> Loadings).
                    // Solo necesitamos agregarlo a la colección del Shipment. EF Core se encargará de insertar 
                    // el Manifest, luego los Pallets con el nuevo ID del Manifest, etc.

                    // Verificación opcional de integridad si es necesario modificar datos en cascada:
                    if (newManifest.ManifestPallets != null)
                    {
                        foreach (var pallet in newManifest.ManifestPallets)
                        {
                            // pallet.IdManifest será asignado por EF al guardar, no es necesario forzarlo aquí
                            // si newManifest se agrega a shipmentDB.
                        }
                    }

                    shipmentDB.Manifests!.Add(newManifest);
                }
            }

            // 6. Guardar Cambios
            var result = await _repository.Update(shipmentDB);

            if (!result)
                return BadRequest(new ApiResponse { Message = "Error al actualizar el Shipment y su jerarquía asociada." });

            // 7. Refrescar datos para retornar
            var updatedShipmentQuery = await _repository.Query<Shipment>();
            var updatedShipment = await updatedShipmentQuery
                .Include(s => s.Manifests!)
                    .ThenInclude(m => m.ManifestPallets!)
                        .ThenInclude(p => p.ManifestPalletLoadings)
                .FirstOrDefaultAsync(s => s.IdShipment == model.IdShipment);

            var resultDTO = _mapper.Map<ShipmentDTO>(updatedShipment);

            return Ok(new ApiResponse { Data = resultDTO, Message = "Shipment actualizado exitosamente." });
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