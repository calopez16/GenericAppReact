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
    [ApiController]
    [Route("seasons")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class SeasonsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public SeasonsController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

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
                    u.Name.Contains(searchTerm)|| u.Description.Contains(searchTerm));
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

        [HttpGet("{id}")]
        public async Task<ActionResult<SeasonDTO>> GetSeasonById(int id)
        {
            var season = await _repository.FindBy<Season>(x => x.IdSeason == id && !(x.IsDeleted ?? false));
            if (season == null)
                return NotFound(new ApiResponse());

            var seasonDTO = _mapper.Map<SeasonDTO>(season);

            return Ok(new ApiResponse { Data = seasonDTO });
        }
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
            seasonDB.IsActive = true; // Asumimos que una nueva temporada está activa por defecto
            seasonDB.IsDeleted = false;
            seasonDB.IdCompany = 1;
            var result = await _repository.Add(seasonDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = seasonDB });
        }

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

        private async Task<bool> CheckDateOverlap(DateTime initialDate, DateTime endDate, int? currentSeasonId = null)
        {
            // Normalizar las fechas para que la hora sea medianoche (aunque DateTimes están incluidas)
            var newStart = initialDate.Date;
            var newEnd = endDate.Date;

            // La lógica de solapamiento es:
            // (InicioA <= FinB) AND (FinA >= InicioB)
            // Aquí A es la nueva temporada, y B es cualquier otra temporada existente.

            var query = await _repository.Query<Season>();

            // Filtrar por temporadas activas y no eliminadas
            query = query.Where(s =>
                !(s.IsDeleted ?? false) &&
                (s.IsActive ?? true));

            // Si estamos editando, excluir la temporada actual del chequeo de solapamiento
            if (currentSeasonId.HasValue && currentSeasonId.Value > 0)
            {
                query = query.Where(s => s.IdSeason != currentSeasonId.Value);
            }

            // Aplicar la lógica de solapamiento:
            // La nueva temporada se solapa con una existente (s) si:
            // (La fecha de inicio de la nueva es ANTES o IGUAL al final de la existente) AND
            // (La fecha de fin de la nueva es DESPUÉS o IGUAL al inicio de la existente)
            var hasOverlap = await query.AnyAsync(s =>
                (newStart <= s.EndDate) &&
                (newEnd >= s.InitialDate)
            );

            return hasOverlap; // Retorna true si hay solapamiento (conflicto)
        }
    }
}