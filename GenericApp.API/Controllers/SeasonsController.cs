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
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad Season (Temporada).
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("seasons")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class SeasonsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador SeasonsController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public SeasonsController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de temporadas, permitiendo la búsqueda por término y el filtro por estado activo.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por nombre o descripción (opcional).</param>
        /// <param name="active">Filtro por estado activo (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de SeasonDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetSeasonsPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Season>();

            query = query.Where(x => !(x.IsDeleted ?? false) && (!active.HasValue || x.IsActive == active));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Name.Contains(searchTerm) || u.Description.Contains(searchTerm));
            }

            var totalRows = query.Count();
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new SeasonDTO
                {
                    Name = s.Name,
                    Description = s.Description,
                    IdSeason = s.IdSeason,
                    IsActive = s.IsActive,
                    InitialDate = s.InitialDate,
                    EndDate = s.EndDate
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
        /// Obtiene una temporada específica por su ID.
        /// </summary>
        /// <param name="id">El ID de la temporada a buscar.</param>
        /// <returns>La SeasonDTO si se encuentra, o NotFound si no existe o está eliminada.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<SeasonDTO>> GetSeasonById(int id)
        {
            var season = await _repository.FindBy<Season>(x => x.IdSeason == id && !(x.IsDeleted ?? false));
            if (season == null)
                return NotFound(new ApiResponse());

            var seasonDTO = _mapper.Map<SeasonDTO>(season);

            return Ok(new ApiResponse { Data = seasonDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad Season a la base de datos, validando que las fechas no se solapen con temporadas activas existentes.
        /// </summary>
        /// <param name="model">El SeasonDTO con los datos de la temporada a crear.</param>
        /// <returns>La entidad Season creada o un conflicto si hay solapamiento de fechas.</returns>
        [HttpPost]
        public async Task<ActionResult> AddSeason([FromBody] SeasonDTO model)
        {
            if (await CheckDateOverlap(model.InitialDate, model.EndDate))
            {
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = "Las fechas seleccionadas se solapan con una temporada existente y activa."
                    }
                );
            }

            var seasonDB = _mapper.Map<Season>(model);
            seasonDB.IsActive = true;
            seasonDB.IsDeleted = false;
            seasonDB.IdCompany = 1;
            var result = await _repository.Add(seasonDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = seasonDB });
        }

        /// <summary>
        /// Actualiza una entidad Season existente, validando que las fechas no se solapen con otras temporadas activas.
        /// </summary>
        /// <param name="model">El SeasonDTO con los datos actualizados.</param>
        /// <returns>La entidad Season actualizada o un NotFound/Conflicto si falla.</returns>
        [HttpPut]
        public async Task<ActionResult> UpdateSeason([FromBody] SeasonDTO model)
        {
            var seasonDB = await _repository.GetById<Season>(model.IdSeason);
            if (seasonDB == null || (seasonDB.IsDeleted ?? false))
                return NotFound(new ApiResponse());

            if (await CheckDateOverlap(model.InitialDate, model.EndDate, model.IdSeason))
            {
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = "Las fechas seleccionadas se solapan con otra temporada existente y activa."
                    }
                );
            }
            seasonDB.Name = model.Name;
            seasonDB.Description = model.Description;
            seasonDB.InitialDate = model.InitialDate;
            seasonDB.EndDate = model.EndDate;
            seasonDB.IsClosed = model.IsClosed;

            var result = await _repository.Update(seasonDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = seasonDB });
        }

        /// <summary>
        /// Deshabilita lógicamente una temporada existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID de la temporada a deshabilitar.</param>
        /// <returns>La SeasonDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableSeason(int id)
        {
            var season = await _repository.GetById<Season>(id);
            if (season == null)
                return NotFound(new ApiResponse());
            season.IsActive = false;
            var result = await _repository.Update(season);
            if (!result)
                return BadRequest(new ApiResponse());

            var seasonDTO = _mapper.Map<SeasonDTO>(season);
            return Ok(new ApiResponse { Data = seasonDTO });
        }

        /// <summary>
        /// Habilita lógicamente una temporada existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID de la temporada a habilitar.</param>
        /// <returns>La SeasonDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableSeason(int id)
        {
            var season = await _repository.FirstOrDefault<Season>(x => x.IdSeason == id && !(x.IsDeleted ?? false));
            if (season == null)
                return NotFound(new ApiResponse());
            season.IsActive = true;
            var result = await _repository.Update(season);
            if (!result)
                return BadRequest(new ApiResponse());

            var seasonDTO = _mapper.Map<SeasonDTO>(season);
            return Ok(new ApiResponse { Data = seasonDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de una temporada (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID de la temporada a eliminar.</param>
        /// <returns>La SeasonDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteSeason(int id)
        {
            var season = await _repository.FirstOrDefault<Season>(x => x.IdSeason == id && !(x.IsDeleted ?? false));
            if (season == null)
                return NotFound(new ApiResponse());
            season.IsDeleted = true;
            var result = await _repository.Update(season);
            if (!result)
                return BadRequest(new ApiResponse());

            var seasonDTO = _mapper.Map<SeasonDTO>(season);
            return Ok(new ApiResponse { Data = seasonDTO });
        }

        /// <summary>
        /// Cierra una temporada existente (establece IsClosed = true).
        /// </summary>
        /// <param name="id">El ID de la temporada a cerrar.</param>
        /// <returns>La SeasonDTO de la entidad actualizada.</returns>
        [HttpPut("close/{id}")]
        public async Task<ActionResult> CloseSeason(int id)
        {
            var season = await _repository.FirstOrDefault<Season>(x => x.IdSeason == id && !(x.IsDeleted ?? false));
            if (season == null)
                return NotFound(new ApiResponse());
            season.IsClosed = true;
            var result = await _repository.Update(season);
            if (!result)
                return BadRequest(new ApiResponse());

            var seasonDTO = _mapper.Map<SeasonDTO>(season);
            return Ok(new ApiResponse { Data = seasonDTO });
        }

        /// <summary>
        /// Abre una temporada existente (establece IsClosed = false).
        /// </summary>
        /// <param name="id">El ID de la temporada a abrir.</param>
        /// <returns>La SeasonDTO de la entidad actualizada.</returns>
        [HttpPut("open/{id}")]
        public async Task<ActionResult> OpenSeason(int id)
        {
            var season = await _repository.FirstOrDefault<Season>(x => x.IdSeason == id && !(x.IsDeleted ?? false));
            if (season == null)
                return NotFound(new ApiResponse());
            season.IsClosed = false;
            var result = await _repository.Update(season);
            if (!result)
                return BadRequest(new ApiResponse());

            var seasonDTO = _mapper.Map<SeasonDTO>(season);
            return Ok(new ApiResponse { Data = seasonDTO });
        }

        /// <summary>
        /// Verifica si un rango de fechas se solapa con cualquier otra temporada activa y no eliminada.
        /// </summary>
        /// <param name="initialDate">Fecha de inicio del nuevo rango.</param>
        /// <param name="endDate">Fecha de fin del nuevo rango.</param>
        /// <param name="currentSeasonId">ID de la temporada actual a excluir del chequeo (solo para actualizaciones).</param>
        /// <returns>True si hay solapamiento, false en caso contrario.</returns>
        private async Task<bool> CheckDateOverlap(DateTime initialDate, DateTime endDate, int? currentSeasonId = null)
        {
            var newStart = initialDate.Date;
            var newEnd = endDate.Date;

            var query = await _repository.Query<Season>();

            query = query.Where(s =>
                !(s.IsDeleted ?? false) &&
                (s.IsActive ?? true));

            if (currentSeasonId.HasValue && currentSeasonId.Value > 0)
            {
                query = query.Where(s => s.IdSeason != currentSeasonId.Value);
            }

            var hasOverlap = await query.AnyAsync(s =>
                (newStart <= s.EndDate) &&
                (newEnd >= s.InitialDate)
            );

            return hasOverlap;
        }
    }
}