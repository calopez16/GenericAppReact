using AutoMapper;
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
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<City>();

            query = query.Include(x => x.IdStateNavigation);
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
                .Select(s => new CityDTO
                {
                    Description = s.Description,
                    IdCity = s.IdCity,
                    IdState = s.IdState,
                    IsActive = s.IsActive,
                    IdStateNavigation = new StateDTO
                    {
                        IdCountry = s.IdStateNavigation.IdCountry,
                        IdState = s.IdStateNavigation.IdState,
                        Description = s.IdStateNavigation.Description,
                        IdCountryNavigation = new CountryDTO
                        {
                            Description = s.IdStateNavigation.IdCountryNavigation.Description
                        },
                    }
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
            var cityExists = await _repository.FirstOrDefault<City>(x => (x.Description.ToLower().Equals(model.Description.ToLower())) && x.IdState == model.IdState && !(x.IsDeleted ?? false), x => x.IdStateNavigation, x => x.IdStateNavigation.IdCountryNavigation);
            if (cityExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(cityExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")} {((cityExists.IdState == model.IdState) ? $"{cityExists.IdStateNavigation.Description}, {cityExists.IdStateNavigation.IdCountryNavigation.Description}" : "")}"
                    }
                );

            var cityDB = _mapper.Map<City>(model);

            var result = await _repository.Add(cityDB);

            var newState = await _repository.FirstOrDefault<State>(x => x.IdState == model.IdState, x => x.IdCountryNavigation);
            cityDB.IdStateNavigation = new State
            {
                Description = newState.Description,
                IdCountryNavigation = new Country
                {
                    Description = newState.IdCountryNavigation.Description
                }
            };

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = cityDB });
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
            var isIdStateChanged = (cityDB.IdState != model.IdState);
            cityDB.IdState = model.IdState;
            var result = await _repository.Update(cityDB);
            var newState = await _repository.FirstOrDefault<State>(x => x.IdState == model.IdState, x => x.IdCountryNavigation);
            cityDB.IdStateNavigation = new State
            {
                Description = newState.Description,
                IdCountryNavigation = new Country
                {
                    Description = newState.IdCountryNavigation.Description
                }
            };
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = cityDB });
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
        public async Task<ActionResult<StateDTO>> GetStatesByCountry([FromQuery] int? idCountry = null)
        {
            try
            {
                var states = await _repository.FindBy<State>(x => (!idCountry.HasValue || x.IdCountry == idCountry) && !(x.IsDeleted ?? false));
                if (states == null)
                    return NotFound(new ApiResponse());

                var statesDTO = _mapper.Map<List<StateDTO>>(states);

                return Ok(new ApiResponse { Data = statesDTO });
            }
            catch (Exception ex)
            {

                throw;
            }
        }

        [HttpGet("pagination-states")]
        public async Task<ActionResult> GetStatesPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? idCountry = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<State>();

            query = query.Include(x => x.IdCountryNavigation);
            query = query.Where(x => !(x.IsDeleted ?? false) && (x.IsActive ?? true) && (!idCountry.HasValue || x.IdCountry == idCountry));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Description.Contains(searchTerm));
            }

            var totalRows = query.Count();
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new StateDTO
                {
                    Description = s.Description,
                    IdCountry = s.IdCountry,
                    IdState = s.IdState,
                    IsActive = s.IsActive,
                    IdCountryNavigation = new CountryDTO
                    {
                        IdCountry = s.IdCountryNavigation.IdCountry,
                        Description = s.IdCountryNavigation.Description
                    }
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