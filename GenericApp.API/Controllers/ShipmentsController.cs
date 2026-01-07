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
                Manifests = s.Manifests.Where(wmp => !(wmp.IsDeleted ?? false)).Select(m => new ManifestDTO
                {
                    IdManifest = m.IdManifest,
                    TrailerBoxPlate = m.TrailerBoxPlate,
                    RegFdaNo = m.RegFdaNo,
                    IdDriver = m.IdDriver,
                    IdDriverNavigation=new DriverDTO
                    {
                        Name=m.IdDriverNavigation.Name
                    },
                    TemperatureTrailerBoxC = m.TemperatureTrailerBoxC,
                    TemperatureTrailerBoxF = m.TemperatureTrailerBoxF,
                    IdSeason = m.IdSeason,
                    SeasonYear = m.IdSeasonNavigation.SeasonYear,
                    TrailerPlate = m.TrailerPlate,
                    IdShippingCompany = m.IdShippingCompany,
                    IdShippingCompanyNavigation = new ShippingCompanyDTO
                    {
                        Name=m.IdShippingCompanyNavigation.Name
                    },
                    Comments = m.Comments,
                    Empaque = m.Empaque,
                    ExitDate = m.ExitDate.ToString("HH:mm"),
                    TrackingCode = m.TrackingCode,
                    Stamps = m.Stamps,
                    Chismografo = m.Chismografo,
                    GnnNumber = m.GnnNumber,
                    ManifestPallets = m.ManifestPallets.Where(wmp=> !(wmp.IsDeleted ?? false)).Select(p => new ManifestPalletDTO
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

            var shipmentDB =await shipmentDBQuery.Include(s => s.Manifests!)
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

            return Ok(new ApiResponse ());
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