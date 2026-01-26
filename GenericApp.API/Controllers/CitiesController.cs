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
    /// Gestiona las operaciones CRUD y de consulta relacionadas con las entidades City y sus relaciones (State, Country).
    /// </summary>
    [ApiController]
    [Route("cities")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class CitiesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador de ciudades con el repositorio y el mapeador.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public CitiesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de ciudades, permitiendo filtrado por término de búsqueda y estado activo.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por descripción (opcional).</param>
        /// <param name="active">Filtro por estado activo (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de CityDTOs.</returns>
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

        /// <summary>
        /// Obtiene una ciudad específica por su ID.
        /// </summary>
        /// <param name="id">El ID de la ciudad a buscar.</param>
        /// <returns>La CityDTO si se encuentra, o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<CityDTO>> GetCityById(int id)
        {
            // Obtenemos la consulta base del repositorio
            var query = await _repository.Query<City>();

            // Aplicamos los Includes para cargar las navegaciones
            var city = await query.Include(x => x.IdStateNavigation)
                    .ThenInclude(s => s.IdCountryNavigation)
                    .FirstOrDefaultAsync(x => x.IdCity == id && !(x.IsDeleted ?? false));

            if (city == null)
                return NotFound(new ApiResponse { Message = "Ciudad no encontrada" });

            // El Mapper se encarga de convertir las entidades cargadas al DTO
            var cityDTO = _mapper.Map<CityDTO>(new CityDTO
            {
                Description = city.Description,
                IdCity = city.IdCity,
                IdState = city.IdState,
                IdStateNavigation = new StateDTO
                {
                    IdState = city.IdStateNavigation.IdState,
                    Description = city.IdStateNavigation.Description,
                    IdCountryNavigation = new CountryDTO
                    {
                        Description = city.IdStateNavigation.IdCountryNavigation.Description,
                        IdCountry = city.IdStateNavigation.IdCountryNavigation.IdCountry
                    }

                }
            });

            return Ok(new ApiResponse { Data = cityDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad City a la base de datos, realizando validación de conflictos.
        /// </summary>
        /// <param name="model">El CityDTO con los datos de la ciudad a crear.</param>
        /// <returns>La entidad City creada o un conflicto si ya existe.</returns>
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

        /// <summary>
        /// Actualiza una entidad City existente, incluyendo la validación de conflictos por descripción.
        /// </summary>
        /// <param name="model">El CityDTO con los datos actualizados.</param>
        /// <returns>La entidad City actualizada o un BadRequest/NotFound si falla.</returns>
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

            var cityDB = await _repository.GetById<City>(model.IdCity ?? 0);
            cityDB.Description = model.Description;
            var isIdStateChanged = (cityDB.IdState != model.IdState);
            cityDB.IdState = model.IdState ?? 0;
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

        /// <summary>
        /// Deshabilita lógicamente una ciudad existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID de la ciudad a deshabilitar.</param>
        /// <returns>La CityDTO de la ciudad actualizada.</returns>
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

        /// <summary>
        /// Habilita lógicamente una ciudad existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID de la ciudad a habilitar.</param>
        /// <returns>La CityDTO de la ciudad actualizada.</returns>
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

        /// <summary>
        /// Realiza la eliminación lógica de una ciudad (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID de la ciudad a eliminar.</param>
        /// <returns>La CityDTO de la ciudad eliminada lógicamente.</returns>
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

        /// <summary>
        /// Obtiene una lista de estados activos, filtrada opcionalmente por país.
        /// </summary>
        /// <param name="idCountry">El ID del país para filtrar (opcional).</param>
        /// <returns>Una colección de StateDTOs.</returns>
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

        /// <summary>
        /// Obtiene una lista paginada de estados, permitiendo filtrar por término de búsqueda y país.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por descripción (opcional).</param>
        /// <param name="idCountry">Filtro por ID de país (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de StateDTOs.</returns>
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

        /// <summary>
        /// Obtiene una lista de países.
        /// </summary>
        /// <returns>Una colección de CountryDTOs.</returns>
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