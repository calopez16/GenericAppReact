using AutoMapper;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("seasons")]
    //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
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
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Season>();

            query = query.Where(x => !(x.IsDeleted ?? false));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Name.Contains(searchTerm) ||
                    u.Description.Contains(searchTerm));
            }

            var totalRows = query.Count();
            var data = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

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
            var seasonExists = await _repository.FirstOrDefault<Season>(x => (x.Name.ToLower().Equals(model.Name.ToLower()) || x.Description.ToLower().Equals(model.Description.ToLower())) && !(x.IsDeleted ?? false));
            if (seasonExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(seasonExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}, {(seasonExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var seasonDB = _mapper.Map<Season>(model);
            var result = await _repository.Add(seasonDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut]
        public async Task<ActionResult> UpdateSeason([FromBody] SeasonDTO model)
        {
            var seasonExists = await _repository.FirstOrDefault<Season>(x => (x.Name.ToLower().Equals(model.Name.ToLower()) || x.Description.ToLower().Equals(model.Description.ToLower())) && (x.IsDeleted ?? false));
            if (seasonExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(seasonExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}, {(seasonExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var seasonDB = _mapper.Map<Season>(model);
            var result = await _repository.Update(seasonDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
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
    }
}