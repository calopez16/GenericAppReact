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
    [Route("cities")]
    //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class CitiesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public CitiesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet("pagination")]
        public async Task<ActionResult> GetCitiesPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<City>();

            query = query.Where(x => !(x.IsDeleted ?? false));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
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
        public async Task<ActionResult<CityDTO>> GetCityById(int id)
        {
            var city = await _repository.FindBy<City>(x => x.IdCity == id && !(x.IsDeleted ?? false));
            if (city == null)
                return NotFound(new ApiResponse());

            var cityDTO = _mapper.Map<CityDTO>(city);

            return Ok(new ApiResponse { Data = cityDTO });
        }
        [HttpPost]
        public async Task<ActionResult> AddCity([FromBody] CityDTO model)
        {
            var cityExists = await _repository.FirstOrDefault<City>(x => (x.Description.ToLower().Equals(model.Description.ToLower())) && !(x.IsDeleted ?? false));
            if (cityExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(cityExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var cityDB = _mapper.Map<City>(model);

            var result = await _repository.Add(cityDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut]
        public async Task<ActionResult> UpdateCity([FromBody] CityDTO model)
        {
            var cityExists = await _repository.FirstOrDefault<City>(x => x.IdCity == model.IdCity && (x.Description.ToLower().Equals(model.Description.ToLower())) && (x.IsDeleted ?? false));
            if (cityExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(cityExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var cityDB = await _repository.GetById<City>(model.IdCity);
            cityDB.Description = model.Description;
            cityDB.IdState = model.IdState;
            var result = await _repository.Update(cityDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableCity(int id)
        {
            var city = await _repository.GetById<City>(id);
            if (city == null)
                return NotFound(new ApiResponse());
            city.IsActive = false;
            var result = await _repository.Update(city);
            if (!result)
                return BadRequest(new ApiResponse());

            var cityDTO = _mapper.Map<CityDTO>(city);
            return Ok(new ApiResponse { Data = cityDTO });
        }

        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableCity(int id)
        {
            var city = await _repository.FirstOrDefault<City>(x => x.IdCity == id && !(x.IsDeleted ?? false));
            if (city == null)
                return NotFound(new ApiResponse());
            city.IsActive = true;
            var result = await _repository.Update(city);
            if (!result)
                return BadRequest(new ApiResponse());

            var cityDTO = _mapper.Map<CityDTO>(city);
            return Ok(new ApiResponse { Data = cityDTO });
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCity(int id)
        {
            var city = await _repository.FirstOrDefault<City>(x => x.IdCity == id && !(x.IsDeleted ?? false));
            if (city == null)
                return NotFound(new ApiResponse());
            city.IsDeleted = true;
            var result = await _repository.Update(city);
            if (!result)
                return BadRequest(new ApiResponse());

            var cityDTO = _mapper.Map<CityDTO>(city);
            return Ok(new ApiResponse { Data = cityDTO });
        }

        [HttpGet("states")]
        public async Task<ActionResult<StateDTO>> GetStatesByCountry([FromQuery] int? idCountry)
        {
            var states = await _repository.FindBy<State>(x => (!idCountry.HasValue || x.IdCountry == idCountry) && !(x.IsDeleted ?? false));
            if (states == null)
                return NotFound(new ApiResponse());

            var statesDTO = _mapper.Map<StateDTO>(states);

            return Ok(new ApiResponse { Data = statesDTO });
        }

        [HttpGet("countries")]
        public async Task<ActionResult<CountryDTO>> GetCountries()
        {
            var countries = await _repository.FindBy<State>(x => !(x.IsDeleted ?? false));
            if (countries == null)
                return NotFound(new ApiResponse());

            var countriesDTO = _mapper.Map<CountryDTO>(countries);

            return Ok(new ApiResponse { Data = countriesDTO });
        }
    }
}