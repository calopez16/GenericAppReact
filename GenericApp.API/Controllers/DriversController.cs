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
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad Driver.
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("drivers")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class DriversController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador DriversController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public DriversController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de conductores, permitiendo la búsqueda por término y el filtro por estado activo.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por nombre (opcional).</param>
        /// <param name="active">Filtro por estado activo (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de DriverDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetDriversPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Driver>();

            query = query.Where(x => !(x.IsDeleted ?? false) && (!active.HasValue || x.IsActive == active));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Name.Contains(searchTerm));
            }

            var totalRows = query.Count();
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new DriverDTO
                {
                    Name = s.Name,
                    IdDriver = s.IdDriver,
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
        /// Obtiene un conductor específico por su ID.
        /// </summary>
        /// <param name="id">El ID del conductor a buscar.</param>
        /// <returns>La DriverDTO si se encuentra, o NotFound si no existe o está eliminado.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<DriverDTO>> GetDriverById(int id)
        {
            var driver = await _repository.FindBy<Driver>(x => x.IdDriver == id && !(x.IsDeleted ?? false));
            if (driver == null)
                return NotFound(new ApiResponse());

            var driverDTO = _mapper.Map<DriverDTO>(driver);

            return Ok(new ApiResponse { Data = driverDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad Driver a la base de datos.
        /// </summary>
        /// <param name="model">El DriverDTO con los datos del conductor a crear.</param>
        /// <returns>La entidad Driver creada o un conflicto si ya existe un conductor con el mismo nombre.</returns>
        [HttpPost]
        public async Task<ActionResult> AddDriver([FromBody] DriverDTO model)
        {
            var driverExists = await _repository.FirstOrDefault<Driver>(x => (x.Name.ToLower().Equals(model.Name.ToLower())) && !(x.IsDeleted ?? false));
            if (driverExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(driverExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var driverDB = _mapper.Map<Driver>(model);
            driverDB.IdCompany = 1;
            var result = await _repository.Add(driverDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = driverDB });
        }

        /// <summary>
        /// Actualiza una entidad Driver existente.
        /// </summary>
        /// <param name="model">El DriverDTO con los datos actualizados.</param>
        /// <returns>La entidad Driver actualizada o un conflicto si ya existe otro conductor con el mismo nombre.</returns>
        [HttpPut]
        public async Task<ActionResult> UpdateDriver([FromBody] DriverDTO model)
        {
            var driverExists = await _repository.FirstOrDefault<Driver>(x => x.IdDriver == model.IdDriver && (x.Name.ToLower().Equals(model.Name.ToLower())) && (x.IsDeleted ?? false));
            if (driverExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(driverExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var driverDB = await _repository.GetById<Driver>(model.IdDriver);
            driverDB.Name = model.Name;
            var result = await _repository.Update(driverDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = driverDB });
        }

        /// <summary>
        /// Deshabilita lógicamente un conductor existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID del conductor a deshabilitar.</param>
        /// <returns>La DriverDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableDriver(int id)
        {
            var driver = await _repository.GetById<Driver>(id);
            if (driver == null)
                return NotFound(new ApiResponse());
            driver.IsActive = false;
            var result = await _repository.Update(driver);
            if (!result)
                return BadRequest(new ApiResponse());

            var driverDTO = _mapper.Map<DriverDTO>(driver);
            return Ok(new ApiResponse { Data = driverDTO });
        }

        /// <summary>
        /// Habilita lógicamente un conductor existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID del conductor a habilitar.</param>
        /// <returns>La DriverDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableDriver(int id)
        {
            var driver = await _repository.FirstOrDefault<Driver>(x => x.IdDriver == id && !(x.IsDeleted ?? false));
            if (driver == null)
                return NotFound(new ApiResponse());
            driver.IsActive = true;
            var result = await _repository.Update(driver);
            if (!result)
                return BadRequest(new ApiResponse());

            var driverDTO = _mapper.Map<DriverDTO>(driver);
            return Ok(new ApiResponse { Data = driverDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de un conductor (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID del conductor a eliminar.</param>
        /// <returns>La DriverDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDriver(int id)
        {
            var driver = await _repository.FirstOrDefault<Driver>(x => x.IdDriver == id && !(x.IsDeleted ?? false));
            if (driver == null)
                return NotFound(new ApiResponse());
            driver.IsDeleted = true;
            var result = await _repository.Update(driver);
            if (!result)
                return BadRequest(new ApiResponse());

            var driverDTO = _mapper.Map<DriverDTO>(driver);
            return Ok(new ApiResponse { Data = driverDTO });
        }
    }
}