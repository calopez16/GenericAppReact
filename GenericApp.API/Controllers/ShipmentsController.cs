using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("shipments")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ShipmentsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public ShipmentsController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet("pagination")]
        public async Task<ActionResult> GetShipmentsPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            try
            {


                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1) pageSize = 10;

                var query = await _repository.Query<Shipment>();

                query = query.Include(s => s.IdShipmentStatusNavigation)
                             .Include(s => s.IdCityNavigation);

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
            catch (Exception ex)
            {

                throw;
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ShipmentDTO>> GetShipmentById(int id)
        {
            var shipmentQuery = await _repository.Query<Shipment>();

            var shipment = await shipmentQuery
            .Include(s => s.IdCityNavigation)
            .Include(s => s.IdShipmentStatusNavigation)
            .Include(s => s.Manifests!)
                .ThenInclude(m => m.IdManifestStatusNavigation)
            .FirstOrDefaultAsync(x => x.IdShipment == id && !(x.IsDeleted ?? false));

            if (shipment == null)
                return NotFound(new ApiResponse());

            var shipmentDTO = _mapper.Map<ShipmentDTO>(shipment);

            return Ok(new ApiResponse { Data = shipmentDTO });
        }

        [HttpPost]
        public async Task<ActionResult> AddShipment([FromBody] ShipmentDTO model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var shipmentDB = _mapper.Map<Shipment>(model);
            shipmentDB.CreationDate = DateTime.UtcNow;
            shipmentDB.IdUser = userId;
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

            return Ok(new ApiResponse { Data = resultDTO, Message = "Shipment creado exitosamente." });
        }

        [HttpPut]
        public async Task<ActionResult> UpdateShipment([FromBody] ShipmentDTO model)
        {
            var createdShipmentQuery = await _repository.Query<Shipment>();
            var shipmentDB = await createdShipmentQuery
                .Include(s => s.Manifests!)
                    .ThenInclude(m => m.ManifestPallets!)
                        .ThenInclude(p => p.ManifestPalletLoadings)
                .FirstOrDefaultAsync(x => x.IdShipment == model.IdShipment && !(x.IsDeleted ?? false));

            if (shipmentDB == null || (shipmentDB.IsDeleted ?? false))
                return NotFound(new ApiResponse { Message = "Shipment no encontrado." });

            _mapper.Map(model, shipmentDB);

            var incomingManifests = model.Manifests ?? new List<ManifestDTO>();

            var manifestIdsToKeep = incomingManifests.Where(m => m.IdManifest > 0).Select(m => m.IdManifest).ToList();
            var manifestsToRemove = shipmentDB.Manifests!.Where(m => !manifestIdsToKeep.Contains(m.IdManifest)).ToList();

            if (manifestsToRemove.Any())
            {
                _repository.RemoveRange(manifestsToRemove);
            }

            foreach (var manifestDto in incomingManifests)
            {
                var manifestDB = shipmentDB.Manifests!.FirstOrDefault(m => m.IdManifest == manifestDto.IdManifest);

                if (manifestDB != null)
                {
                    _mapper.Map(manifestDto, manifestDB);

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

                        if (palletDB != null)
                        {
                            _mapper.Map(palletDto, palletDB);

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
                                    _mapper.Map(loadDto, loadingDB);
                                }
                                else if (loadDto.IdManifestPalletLoading <= 0)
                                {
                                    var newLoading = _mapper.Map<ManifestPalletLoading>(loadDto);
                                    newLoading.IdManifest = manifestDB.IdManifest;
                                    newLoading.IdShipment = shipmentDB.IdShipment;
                                    newLoading.IdManifestPallet = palletDB.IdManifestPallet;
                                    palletDB.ManifestPalletLoadings!.Add(newLoading);
                                }
                            }
                        }
                        else if (palletDto.IdManifestPallet <= 0)
                        {
                            var newPallet = _mapper.Map<ManifestPallet>(palletDto);
                            newPallet.IdManifest = manifestDB.IdManifest;
                            newPallet.IdShipment = shipmentDB.IdShipment;

                            if (newPallet.ManifestPalletLoadings != null)
                            {
                                foreach (var loading in newPallet.ManifestPalletLoadings)
                                {
                                    loading.IdManifest = manifestDB.IdManifest;
                                    loading.IdShipment = shipmentDB.IdShipment;
                                }
                            }
                            manifestDB.ManifestPallets!.Add(newPallet);
                        }
                    }
                }
                else if (manifestDto.IdManifest <= 0 && (manifestDto.IdShipment == shipmentDB.IdShipment || manifestDto.IdShipment == 0))
                {
                    var newManifest = _mapper.Map<Manifest>(manifestDto);
                    newManifest.IdShipment = shipmentDB.IdShipment;
                    newManifest.CreationDate = DateTime.UtcNow;

                    if (newManifest.ManifestPallets != null)
                    {
                        foreach (var pallet in newManifest.ManifestPallets)
                        {
                            pallet.IdShipment = shipmentDB.IdShipment;

                            if (pallet.ManifestPalletLoadings != null)
                            {
                                foreach (var loading in pallet.ManifestPalletLoadings)
                                {
                                    loading.IdShipment = shipmentDB.IdShipment;
                                }
                            }
                        }
                    }
                    shipmentDB.Manifests!.Add(newManifest);
                }
            }

            var result = await _repository.Update(shipmentDB);

            if (!result)
                return BadRequest(new ApiResponse { Message = "Error al actualizar el Shipment y su jerarquía asociada." });

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