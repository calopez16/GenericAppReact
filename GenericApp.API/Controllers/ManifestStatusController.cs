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
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad ManifestStatus (Estado de Manifiesto).
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("manifest-status")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ManifestStatusController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador ManifestStatusController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public ManifestStatusController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de estados de manifiesto, permitiendo la búsqueda por término y el filtro por estado activo.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por descripción (opcional).</param>
        /// <param name="active">Filtro por estado activo (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de ManifestStatusDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetManifestStatusPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<ManifestStatus>();

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
                .Select(s => new ManifestStatusDTO
                {
                    Description = s.Description,
                    IdManifestStatus = s.IdManifestStatus,
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
        /// Obtiene un estado de manifiesto específico por su ID.
        /// </summary>
        /// <param name="id">El ID del estado de manifiesto a buscar.</param>
        /// <returns>La ManifestStatusDTO si se encuentra, o NotFound si no existe o está eliminado.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ManifestStatusDTO>> GetManifestStatusById(int id)
        {
            var manifestStatus = await _repository.FindBy<ManifestStatus>(x => x.IdManifestStatus == id && !(x.IsDeleted ?? false));
            if (manifestStatus == null)
                return NotFound(new ApiResponse());

            var manifestStatusDTO = _mapper.Map<ManifestStatusDTO>(manifestStatus);

            return Ok(new ApiResponse { Data = manifestStatusDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad ManifestStatus a la base de datos.
        /// </summary>
        /// <param name="model">El ManifestStatusDTO con los datos del estado de manifiesto a crear.</param>
        /// <returns>La entidad ManifestStatus creada o un conflicto si ya existe un estado con la misma descripción.</returns>
        [HttpPost]
        public async Task<ActionResult> AddManifestStatus([FromBody] ManifestStatusDTO model)
        {
            var manifestStatusExists = await _repository.FirstOrDefault<ManifestStatus>(x => (x.Description.ToLower().Equals(model.Description.ToLower())) && !(x.IsDeleted ?? false));
            if (manifestStatusExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(manifestStatusExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var manifestStatusDB = _mapper.Map<ManifestStatus>(model);
            var result = await _repository.Add(manifestStatusDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = manifestStatusDB });
        }

        /// <summary>
        /// Actualiza una entidad ManifestStatus existente.
        /// </summary>
        /// <param name="model">El ManifestStatusDTO con los datos actualizados.</param>
        /// <returns>La entidad ManifestStatus actualizada o un conflicto si ya existe otro estado con la misma descripción (no eliminada).</returns>
        [HttpPut]
        public async Task<ActionResult> UpdateManifestStatus([FromBody] ManifestStatusDTO model)
        {
            var manifestStatusExists = await _repository.FirstOrDefault<ManifestStatus>(x => x.IdManifestStatus == model.IdManifestStatus && (x.Description.ToLower().Equals(model.Description.ToLower())) && (x.IsDeleted ?? false));
            if (manifestStatusExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(manifestStatusExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var manifestStatusDB = await _repository.GetById<ManifestStatus>(model.IdManifestStatus);
            manifestStatusDB.Description = model.Description;
            var result = await _repository.Update(manifestStatusDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = manifestStatusDB });
        }

        /// <summary>
        /// Deshabilita lógicamente un estado de manifiesto existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID del estado de manifiesto a deshabilitar.</param>
        /// <returns>La ManifestStatusDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableManifestStatus(int id)
        {
            var manifestStatus = await _repository.GetById<ManifestStatus>(id);
            if (manifestStatus == null)
                return NotFound(new ApiResponse());
            manifestStatus.IsActive = false;
            var result = await _repository.Update(manifestStatus);
            if (!result)
                return BadRequest(new ApiResponse());

            var manifestStatusDTO = _mapper.Map<ManifestStatusDTO>(manifestStatus);
            return Ok(new ApiResponse { Data = manifestStatusDTO });
        }

        /// <summary>
        /// Habilita lógicamente un estado de manifiesto existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID del estado de manifiesto a habilitar.</param>
        /// <returns>La ManifestStatusDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableManifestStatus(int id)
        {
            var manifestStatus = await _repository.FirstOrDefault<ManifestStatus>(x => x.IdManifestStatus == id && !(x.IsDeleted ?? false));
            if (manifestStatus == null)
                return NotFound(new ApiResponse());
            manifestStatus.IsActive = true;
            var result = await _repository.Update(manifestStatus);
            if (!result)
                return BadRequest(new ApiResponse());

            var manifestStatusDTO = _mapper.Map<ManifestStatusDTO>(manifestStatus);
            return Ok(new ApiResponse { Data = manifestStatusDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de un estado de manifiesto (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID del estado de manifiesto a eliminar.</param>
        /// <returns>La ManifestStatusDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteManifestStatus(int id)
        {
            var manifestStatus = await _repository.FirstOrDefault<ManifestStatus>(x => x.IdManifestStatus == id && !(x.IsDeleted ?? false));
            if (manifestStatus == null)
                return NotFound(new ApiResponse());
            manifestStatus.IsDeleted = true;
            var result = await _repository.Update(manifestStatus);
            if (!result)
                return BadRequest(new ApiResponse());

            var manifestStatusDTO = _mapper.Map<ManifestStatusDTO>(manifestStatus);
            return Ok(new ApiResponse { Data = manifestStatusDTO });
        }
    }
}