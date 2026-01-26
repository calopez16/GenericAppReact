using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad ShipmentStatus (Estado de Embarque).
    /// Nota: La ruta es incorrecta ("manifest-status") pero se mantiene para la estructura actual del código proporcionado.
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("shipment-status")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ShipmentStatusController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador ShipmentStatusController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public ShipmentStatusController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de estados de embarque, permitiendo la búsqueda por término y el filtro por estado activo.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por descripción (opcional).</param>
        /// <param name="active">Filtro por estado activo (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de ShipmentStatusDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetShipmentStatusPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<ShipmentStatus>();

            query = query.Where(x => !(x.IsDeleted ?? false) && (!active.HasValue || x.IsActive == active));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Description.Contains(searchTerm));
            }

            var totalRows = query.Count();
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new ShipmentStatusDTO
                {
                    Description = s.Description,
                    IdShipmentStatus = s.IdShipmentStatus,
                    IsActive = s.IsActive,
                })
                .ToListAsync();

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
        /// Obtiene un estado de embarque específico por su ID.
        /// </summary>
        /// <param name="id">El ID del estado de embarque a buscar.</param>
        /// <returns>La ShipmentStatusDTO si se encuentra, o NotFound si no existe o está eliminado.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ShipmentStatusDTO>> GetShipmentStatusById(int id)
        {
            var shipmentStatus = await _repository.FindBy<ShipmentStatus>(x => x.IdShipmentStatus == id && !(x.IsDeleted ?? false));
            if (shipmentStatus == null)
                return NotFound(new ApiResponse());

            var shipmentStatusDTO = _mapper.Map<ShipmentStatusDTO>(shipmentStatus);

            return Ok(new ApiResponse { Data = shipmentStatusDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad ShipmentStatus a la base de datos.
        /// </summary>
        /// <param name="model">El ShipmentStatusDTO con los datos del estado de embarque a crear.</param>
        /// <returns>La entidad ShipmentStatus creada o un conflicto si ya existe un estado con la misma descripción.</returns>
        [HttpPost]
        public async Task<ActionResult> AddShipmentStatus([FromBody] ShipmentStatusDTO model)
        {
            var shipmentStatusExists = await _repository.FirstOrDefault<ShipmentStatus>(x => (x.Description.ToLower().Equals(model.Description.ToLower())) && !(x.IsDeleted ?? false));
            if (shipmentStatusExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(shipmentStatusExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var shipmentStatusDB = _mapper.Map<ShipmentStatus>(model);
            var result = await _repository.Add(shipmentStatusDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = shipmentStatusDB });
        }

        /// <summary>
        /// Actualiza una entidad ShipmentStatus existente.
        /// </summary>
        /// <param name="model">El ShipmentStatusDTO con los datos actualizados.</param>
        /// <returns>La entidad ShipmentStatus actualizada o un conflicto si ya existe otro estado con la misma descripción (no eliminada).</returns>
        [HttpPut]
        public async Task<ActionResult> UpdateShipmentStatus([FromBody] ShipmentStatusDTO model)
        {
            var shipmentStatusExists = await _repository.FirstOrDefault<ShipmentStatus>(x => x.IdShipmentStatus == model.IdShipmentStatus && (x.Description.ToLower().Equals(model.Description.ToLower())) && (x.IsDeleted ?? false));
            if (shipmentStatusExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(shipmentStatusExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var shipmentStatusDB = await _repository.GetById<ShipmentStatus>(model.IdShipmentStatus ?? 0);
            shipmentStatusDB.Description = model.Description;
            var result = await _repository.Update(shipmentStatusDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = shipmentStatusDB });
        }

        /// <summary>
        /// Deshabilita lógicamente un estado de embarque existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID del estado de embarque a deshabilitar.</param>
        /// <returns>La ShipmentStatusDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableShipmentStatus(int id)
        {
            var shipmentStatus = await _repository.GetById<ShipmentStatus>(id);
            if (shipmentStatus == null)
                return NotFound(new ApiResponse());
            shipmentStatus.IsActive = false;
            var result = await _repository.Update(shipmentStatus);
            if (!result)
                return BadRequest(new ApiResponse());

            var shipmentStatusDTO = _mapper.Map<ShipmentStatusDTO>(shipmentStatus);
            return Ok(new ApiResponse { Data = shipmentStatusDTO });
        }

        /// <summary>
        /// Habilita lógicamente un estado de embarque existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID del estado de embarque a habilitar.</param>
        /// <returns>La ShipmentStatusDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableShipmentStatus(int id)
        {
            var shipmentStatus = await _repository.FirstOrDefault<ShipmentStatus>(x => x.IdShipmentStatus == id && !(x.IsDeleted ?? false));
            if (shipmentStatus == null)
                return NotFound(new ApiResponse());
            shipmentStatus.IsActive = true;
            var result = await _repository.Update(shipmentStatus);
            if (!result)
                return BadRequest(new ApiResponse());

            var shipmentStatusDTO = _mapper.Map<ShipmentStatusDTO>(shipmentStatus);
            return Ok(new ApiResponse { Data = shipmentStatusDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de un estado de embarque (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID del estado de embarque a eliminar.</param>
        /// <returns>La ShipmentStatusDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteShipmentStatus(int id)
        {
            var shipmentStatus = await _repository.FirstOrDefault<ShipmentStatus>(x => x.IdShipmentStatus == id && !(x.IsDeleted ?? false));
            if (shipmentStatus == null)
                return NotFound(new ApiResponse());
            shipmentStatus.IsDeleted = true;
            var result = await _repository.Update(shipmentStatus);
            if (!result)
                return BadRequest(new ApiResponse());

            var shipmentStatusDTO = _mapper.Map<ShipmentStatusDTO>(shipmentStatus);
            return Ok(new ApiResponse { Data = shipmentStatusDTO });
        }
    }
}