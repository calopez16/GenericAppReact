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
    /// Gestiona las operaciones CRUD y de consulta relacionadas con las entidades TrailerBoxType y sus relaciones (State, Country).
    /// </summary>
    [ApiController]
    [Route("trailerboxtypes")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class TrailerBoxTypesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador de Tipo de contenedores del trailer con el repositorio y el mapeador.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public TrailerBoxTypesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de Tipo de contenedores del trailer, permitiendo filtrado por término de búsqueda y estado activo.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por descripción (opcional).</param>
        /// <param name="active">Filtro por estado activo (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de TrailerBoxTypeDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetTrailerBoxTypesPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<TrailerBoxType>();

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
                .Select(s => new TrailerBoxTypeDTO
                {
                    Description = s.Description,
                    IdTrailerBoxType = s.IdTrailerBoxType,
                    IsDeleted = s.IsDeleted,
                    IsActive = s.IsActive
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
        /// Obtiene una ciudad específica por su ID.
        /// </summary>
        /// <param name="id">El ID de la ciudad a buscar.</param>
        /// <returns>La TrailerBoxTypeDTO si se encuentra, o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult<TrailerBoxTypeDTO>> GetTrailerBoxTypeById(int id)
        {
            // Obtenemos la consulta base del repositorio
            var query = await _repository.Query<TrailerBoxType>();

            // Aplicamos los Includes para cargar las navegaciones
            var trailerBoxType = await query
                    .FirstOrDefaultAsync(x => x.IdTrailerBoxType == id && !(x.IsDeleted ?? false));

            if (trailerBoxType == null)
                return NotFound(new ApiResponse { Message = "Ciudad no encontrada" });

            // El Mapper se encarga de convertir las entidades cargadas al DTO
            var trailerBoxTypeDTO = _mapper.Map<TrailerBoxTypeDTO>(new TrailerBoxTypeDTO
            {
                Description = trailerBoxType.Description,
                IdTrailerBoxType = trailerBoxType.IdTrailerBoxType
            });

            return Ok(new ApiResponse { Data = trailerBoxTypeDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad TrailerBoxType a la base de datos, realizando validación de conflictos.
        /// </summary>
        /// <param name="model">El TrailerBoxTypeDTO con los datos de la ciudad a crear.</param>
        /// <returns>La entidad TrailerBoxType creada o un conflicto si ya existe.</returns>
        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddTrailerBoxType([FromBody] TrailerBoxTypeDTO model)
        {
            var trailerBoxTypeExists = await _repository.FirstOrDefault<TrailerBoxType>(x => (x.Description.ToLower().Equals(model.Description.ToLower())) && !(x.IsDeleted ?? false));
            if (trailerBoxTypeExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(trailerBoxTypeExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );
            model.IsActive = true;
            model.IsDeleted = false;
            var trailerBoxTypeDB = _mapper.Map<TrailerBoxType>(model);

            var result = await _repository.Add(trailerBoxTypeDB);           

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = trailerBoxTypeDB });
        }

        /// <summary>
        /// Actualiza una entidad TrailerBoxType existente, incluyendo la validación de conflictos por descripción.
        /// </summary>
        /// <param name="model">El TrailerBoxTypeDTO con los datos actualizados.</param>
        /// <returns>La entidad TrailerBoxType actualizada o un BadRequest/NotFound si falla.</returns>
        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> UpdateTrailerBoxType([FromBody] TrailerBoxTypeDTO model)
        {
            var trailerBoxTypeExists = await _repository.FirstOrDefault<TrailerBoxType>(x => x.IdTrailerBoxType == model.IdTrailerBoxType && (x.Description.ToLower().Equals(model.Description.ToLower())) && (x.IsDeleted ?? false));
            if (trailerBoxTypeExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(trailerBoxTypeExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var trailerBoxTypeDB = await _repository.GetById<TrailerBoxType>(model.IdTrailerBoxType);
            trailerBoxTypeDB.Description = model.Description;            
            var result = await _repository.Update(trailerBoxTypeDB);
           
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = trailerBoxTypeDB });
        }

        /// <summary>
        /// Deshabilita lógicamente una ciudad existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID de la ciudad a deshabilitar.</param>
        /// <returns>La TrailerBoxTypeDTO de la ciudad actualizada.</returns>
        [HttpPut("disable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DisableTrailerBoxType(int id)
        {
            var trailerBoxType = await _repository.GetById<TrailerBoxType>(id);
            if (trailerBoxType == null)
                return NotFound(new ApiResponse());
            trailerBoxType.IsActive = false;
            var result = await _repository.Update(trailerBoxType);
            if (!result)
                return BadRequest(new ApiResponse());

            var trailerBoxTypeDTO = _mapper.Map<TrailerBoxTypeDTO>(trailerBoxType);
            return Ok(new ApiResponse { Data = trailerBoxTypeDTO });
        }

        /// <summary>
        /// Habilita lógicamente una ciudad existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID de la ciudad a habilitar.</param>
        /// <returns>La TrailerBoxTypeDTO de la ciudad actualizada.</returns>
        [HttpPut("enable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> EnableTrailerBoxType(int id)
        {
            var trailerBoxType = await _repository.FirstOrDefault<TrailerBoxType>(x => x.IdTrailerBoxType == id && !(x.IsDeleted ?? false));
            if (trailerBoxType == null)
                return NotFound(new ApiResponse());
            trailerBoxType.IsActive = true;
            var result = await _repository.Update(trailerBoxType);
            if (!result)
                return BadRequest(new ApiResponse());

            var trailerBoxTypeDTO = _mapper.Map<TrailerBoxTypeDTO>(trailerBoxType);
            return Ok(new ApiResponse { Data = trailerBoxTypeDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de una ciudad (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID de la ciudad a eliminar.</param>
        /// <returns>La TrailerBoxTypeDTO de la ciudad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteTrailerBoxType(int id)
        {
            var trailerBoxType = await _repository.FirstOrDefault<TrailerBoxType>(x => x.IdTrailerBoxType == id && !(x.IsDeleted ?? false));
            if (trailerBoxType == null)
                return NotFound(new ApiResponse());
            trailerBoxType.IsDeleted = true;
            var result = await _repository.Update(trailerBoxType);
            if (!result)
                return BadRequest(new ApiResponse());

            var trailerBoxTypeDTO = _mapper.Map<TrailerBoxTypeDTO>(trailerBoxType);
            return Ok(new ApiResponse { Data = trailerBoxTypeDTO });
        }       

    }
}