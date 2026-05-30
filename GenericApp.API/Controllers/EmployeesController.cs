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
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad Employee.
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("employees")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class EmployeesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador EmployeesController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public EmployeesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de employeees activos, permitiendo la búsqueda por nombre o RFC.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por nombre o RFC (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de EmployeeDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetEmployeesPagination(
            [FromQuery] int idCompany,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Employee>();
            query = query.Where(x => !(x.IsDeleted ?? false) && x.IdCompany == idCompany);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    (u.Nombre != null && u.Nombre.Contains(searchTerm)) ||
                    (u.ApellidoPaterno != null && u.ApellidoPaterno.Contains(searchTerm)) ||
                    (u.RFC != null && u.RFC.Contains(searchTerm)));
            }

            var totalRows = query.Count();
            var data = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new EmployeeDTO
                {
                    IdEmployee = x.IdEmployee,
                    Clave = x.Clave,
                    Nombre = x.Nombre,
                    ApellidoPaterno = x.ApellidoPaterno,
                    ApellidoMaterno = x.ApellidoMaterno,
                    Address = x.Address,
                    RFC = x.RFC,
                    CURP = x.CURP,
                    IMSS = x.IMSS,
                    Genre = x.Genre,
                    CivilStatus = x.CivilStatus,
                    Position = x.Position,
                    BirthDate = x.BirthDate,
                    IsActive = x.IsActive,
                    IdCompany = x.IdCompany
                })
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

        /// <summary>
        /// Obtiene un employeee específico por su ID.
        /// </summary>
        /// <param name="id">El ID del employeee a buscar.</param>
        /// <returns>La EmployeeDTO si se encuentra, o NotFound si no existe o está eliminado.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDTO>> GetEmployeeById(int id)
        {
            var employee = await _repository.FirstOrDefault<Employee>(x => x.IdEmployee == id && !(x.IsDeleted ?? false));
            if (employee == null)
                return NotFound(new ApiResponse());

            var employeeDTO = _mapper.Map<EmployeeDTO>(employee);

            return Ok(new ApiResponse { Data = employeeDTO });

        }

        /// <summary>
        /// Agrega una nueva entidad Employee a la base de datos.
        /// </summary>
        /// <param name="model">El EmployeeDTO con los datos del employeee a crear.</param>
        /// <returns>La entidad Employee creada o un conflicto si ya existe un employeee con el mismo nombre o RFC.</returns>
        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddEmployee([FromBody] EmployeeDTO model)
        {
            var employeeExists = await _repository.FirstOrDefault<Employee>(x =>
                x.IdCompany == model.IdCompany &&
                (!string.IsNullOrEmpty(model.RFC) && x.RFC != null && x.RFC.ToLower().Equals(model.RFC.ToLower()) ||
                 !string.IsNullOrEmpty(model.CURP) && x.CURP != null && x.CURP.ToLower().Equals(model.CURP.ToLower()))
                && !(x.IsDeleted ?? false));
            if (employeeExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(!string.IsNullOrEmpty(model.RFC) && (employeeExists.RFC?.ToLower().Equals(model.RFC.ToLower()) ?? false) ? model.RFC : "")}, {(!string.IsNullOrEmpty(model.CURP) && (employeeExists.CURP?.ToLower().Equals(model.CURP.ToLower()) ?? false) ? model.CURP : "")}".Trim(',', ' ')
                    }
                );

            var employeeDB = _mapper.Map<Employee>(model);
            var result = await _repository.Add(employeeDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = employeeDB });
        }

        /// <summary>
        /// Actualiza una entidad Employee existente.
        /// </summary>
        /// <param name="model">El EmployeeDTO con los datos actualizados.</param>
        /// <returns>La entidad Employee actualizada o un conflicto si ya existe otro employeee con el mismo nombre o RFC.</returns>
        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> UpdateEmployee([FromBody] EmployeeDTO model)
        {
            var employeeExists = await _repository.FirstOrDefault<Employee>(x =>
                x.IdEmployee != model.IdEmployee &&
                x.IdCompany == model.IdCompany &&
                (!string.IsNullOrEmpty(model.RFC) && x.RFC != null && x.RFC.ToLower().Equals(model.RFC.ToLower()) ||
                 !string.IsNullOrEmpty(model.CURP) && x.CURP != null && x.CURP.ToLower().Equals(model.CURP.ToLower()))
                && !(x.IsDeleted ?? false));
            if (employeeExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(!string.IsNullOrEmpty(model.RFC) && (employeeExists.RFC?.ToLower().Equals(model.RFC.ToLower()) ?? false) ? model.RFC : "")}, {(!string.IsNullOrEmpty(model.CURP) && (employeeExists.CURP?.ToLower().Equals(model.CURP.ToLower()) ?? false) ? model.CURP : "")}".Trim(',', ' ')
                    }
                );

            var employeeDB = await _repository.GetById<Employee>(model.IdEmployee ?? 0);
            employeeDB.Clave = model.Clave ?? employeeDB.Clave;
            employeeDB.Nombre = model.Nombre;
            employeeDB.ApellidoPaterno = model.ApellidoPaterno;
            employeeDB.ApellidoMaterno = model.ApellidoMaterno;
            employeeDB.Address = model.Address;
            employeeDB.RFC = model.RFC;
            employeeDB.CURP = model.CURP;
            employeeDB.IMSS = model.IMSS;
            employeeDB.Genre = model.Genre;
            employeeDB.CivilStatus = model.CivilStatus;
            employeeDB.Position = model.Position;
            employeeDB.BirthDate = model.BirthDate ?? employeeDB.BirthDate;
            employeeDB.IdCompany = model.IdCompany ?? employeeDB.IdCompany;
            var result = await _repository.Update(employeeDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = employeeDB });
        }

        /// <summary>
        /// Deshabilita lógicamente un employeee existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID del employeee a deshabilitar.</param>
        /// <returns>La EmployeeDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DisableEmployee(int id)
        {
            var employee = await _repository.GetById<Employee>(id);
            if (employee == null)
                return NotFound(new ApiResponse());
            employee.IsActive = false;
            var result = await _repository.Update(employee);
            if (!result)
                return BadRequest(new ApiResponse());

            var employeeDTO = _mapper.Map<EmployeeDTO>(employee);
            return Ok(new ApiResponse { Data = employeeDTO });
        }

        /// <summary>
        /// Habilita lógicamente un employeee existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID del employeee a habilitar.</param>
        /// <returns>La EmployeeDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> EnableEmployee(int id)
        {
            var employee = await _repository.FirstOrDefault<Employee>(x => x.IdEmployee == id && !(x.IsDeleted ?? false));
            if (employee == null)
                return NotFound(new ApiResponse());
            employee.IsActive = true;
            var result = await _repository.Update(employee);
            if (!result)
                return BadRequest(new ApiResponse());

            var employeeDTO = _mapper.Map<EmployeeDTO>(employee);
            return Ok(new ApiResponse { Data = employeeDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de un employeee (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID del employeee a eliminar.</param>
        /// <returns>La EmployeeDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteEmployee(int id)
        {
            var employee = await _repository.FirstOrDefault<Employee>(x => x.IdEmployee == id && !(x.IsDeleted ?? false));
            if (employee == null)
                return NotFound(new ApiResponse());
            employee.IsDeleted = true;
            var result = await _repository.Update(employee);
            if (!result)
                return BadRequest(new ApiResponse());

            var employeeDTO = _mapper.Map<EmployeeDTO>(employee);
            return Ok(new ApiResponse { Data = employeeDTO });
        }
    }
}