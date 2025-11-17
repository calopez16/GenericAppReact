using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad Company.
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("companies")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class CompaniesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador CompaniesController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public CompaniesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de compañías, permitiendo la búsqueda por nombre o RFC.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por nombre o RFC (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de Company.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetCompaniesPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Company>();

            query = query.Where(x => !(x.IsDeleted ?? false));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Name.Contains(searchTerm) ||
                    u.Rfc.Contains(searchTerm));
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

        /// <summary>
        /// Obtiene una compañía específica por su ID.
        /// </summary>
        /// <param name="id">El ID de la compañía a buscar.</param>
        /// <returns>La CompanyDTO si se encuentra, o NotFound si no existe o está eliminada.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<CompanyDTO>> GetCompanyById(int id)
        {
            var company = await _repository.FindBy<Company>(x => x.IdCompany == id && !(x.IsDeleted ?? false));
            if (company == null)
                return NotFound(new ApiResponse());

            var companyDTO = _mapper.Map<CompanyDTO>(company);

            return Ok(new ApiResponse { Data = companyDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad Company a la base de datos.
        /// </summary>
        /// <param name="model">El CompanyDTO con los datos de la compañía a crear.</param>
        /// <returns>La ApiResponse vacía en caso de éxito, o un conflicto si ya existe una compañía con el mismo nombre o RFC.</returns>
        [HttpPost]
        public async Task<ActionResult> AddCompany([FromBody] CompanyDTO model)
        {
            var companyExists = await _repository.FirstOrDefault<Company>(x => (x.Name.ToLower().Equals(model.Name.ToLower()) || x.Rfc.ToLower().Equals(model.Rfc.ToLower())) && !(x.IsDeleted ?? false));
            if (companyExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(companyExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}, {(companyExists.Rfc.ToLower().Equals(model.Rfc.ToLower()) ? model.Rfc : "")}"
                    }
                );

            var companyDB = _mapper.Map<Company>(model);
            var result = await _repository.Add(companyDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        /// <summary>
        /// Actualiza una entidad Company existente.
        /// </summary>
        /// <param name="model">El CompanyDTO con los datos actualizados.</param>
        /// <returns>La ApiResponse vacía en caso de éxito, o un conflicto si ya existe otra compañía (no eliminada) con el mismo nombre o RFC.</returns>
        [HttpPut]
        public async Task<ActionResult> UpdateCompany([FromBody] CompanyDTO model)
        {
            var companyExists = await _repository.FirstOrDefault<Company>(x => (x.Name.ToLower().Equals(model.Name.ToLower()) || x.Rfc.ToLower().Equals(model.Rfc.ToLower())) && (x.IsDeleted ?? false));
            if (companyExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(companyExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}, {(companyExists.Rfc.ToLower().Equals(model.Rfc.ToLower()) ? model.Rfc : "")}"
                    }
                );

            var companyDB = _mapper.Map<Company>(model);
            var result = await _repository.Update(companyDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        /// <summary>
        /// Deshabilita lógicamente una compañía existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID de la compañía a deshabilitar.</param>
        /// <returns>La CompanyDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableCompany(int id)
        {
            var company = await _repository.GetById<Company>(id);
            if (company == null)
                return NotFound(new ApiResponse());
            company.IsActive = false;
            var result = await _repository.Update(company);
            if (!result)
                return BadRequest(new ApiResponse());

            var companyDTO = _mapper.Map<CompanyDTO>(company);
            return Ok(new ApiResponse { Data = companyDTO });
        }

        /// <summary>
        /// Habilita lógicamente una compañía existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID de la compañía a habilitar.</param>
        /// <returns>La CompanyDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableCompany(int id)
        {
            var company = await _repository.FirstOrDefault<Company>(x => x.IdCompany == id && !(x.IsDeleted ?? false));
            if (company == null)
                return NotFound(new ApiResponse());
            company.IsActive = true;
            var result = await _repository.Update(company);
            if (!result)
                return BadRequest(new ApiResponse());

            var companyDTO = _mapper.Map<CompanyDTO>(company);
            return Ok(new ApiResponse { Data = companyDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de una compañía (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID de la compañía a eliminar.</param>
        /// <returns>La CompanyDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCompany(int id)
        {
            var company = await _repository.FirstOrDefault<Company>(x => x.IdCompany == id && !(x.IsDeleted ?? false));
            if (company == null)
                return NotFound(new ApiResponse());
            company.IsDeleted = true;
            var result = await _repository.Update(company);
            if (!result)
                return BadRequest(new ApiResponse());

            var companyDTO = _mapper.Map<CompanyDTO>(company);
            return Ok(new ApiResponse { Data = companyDTO });
        }
    }
}