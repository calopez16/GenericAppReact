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
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad ShippingCompany (Compañía de Transporte).
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("shipping-companies")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class ShippingCompaniesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador ShippingCompaniesController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public ShippingCompaniesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de compañías de transporte, permitiendo la búsqueda por término y el filtro por estado activo.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por nombre (opcional).</param>
        /// <param name="active">Filtro por estado activo (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de ShippingCompanyDTOs.</returns>
        [HttpGet("pagination")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = $"{nameof(AppRoles.User)},{nameof(AppRoles.Administrator)}")]
        public async Task<ActionResult> GetShippingCompaniesPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<ShippingCompany>();

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
                .Select(s => new ShippingCompanyDTO
                {
                    Name = s.Name,
                    IdShippingCompany = s.IdShippingCompany,
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
        /// Obtiene una compañía de transporte específica por su ID.
        /// </summary>
        /// <param name="id">El ID de la compañía de transporte a buscar.</param>
        /// <returns>La ShippingCompanyDTO si se encuentra, o NotFound si no existe o está eliminada.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ShippingCompanyDTO>> GetShippingCompanyById(int id)
        {
            var shippingCompany = await _repository.FindBy<ShippingCompany>(x => x.IdShippingCompany == id && !(x.IsDeleted ?? false));
            if (shippingCompany == null)
                return NotFound(new ApiResponse());

            var shippingCompanyDTO = _mapper.Map<ShippingCompanyDTO>(shippingCompany);

            return Ok(new ApiResponse { Data = shippingCompanyDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad ShippingCompany a la base de datos.
        /// </summary>
        /// <param name="model">El ShippingCompanyDTO con los datos de la compañía a crear.</param>
        /// <returns>La entidad ShippingCompany creada o un conflicto si ya existe una compañía con el mismo nombre.</returns>
        [HttpPost]
        public async Task<ActionResult> AddShippingCompany([FromBody] ShippingCompanyDTO model)
        {
            var shippingCompanyExists = await _repository.FirstOrDefault<ShippingCompany>(x => (x.Name.ToLower().Equals(model.Name.ToLower())) && !(x.IsDeleted ?? false));
            if (shippingCompanyExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(shippingCompanyExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var shippingCompanyDB = _mapper.Map<ShippingCompany>(model);
            shippingCompanyDB.IdCompany = 1;
            var result = await _repository.Add(shippingCompanyDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = shippingCompanyDB });
        }

        /// <summary>
        /// Actualiza una entidad ShippingCompany existente.
        /// </summary>
        /// <param name="model">El ShippingCompanyDTO con los datos actualizados.</param>
        /// <returns>La entidad ShippingCompany actualizada o un conflicto si ya existe otra compañía con el mismo nombre (no eliminada).</returns>
        [HttpPut]
        public async Task<ActionResult> UpdateShippingCompany([FromBody] ShippingCompanyDTO model)
        {
            var shippingCompanyExists = await _repository.FirstOrDefault<ShippingCompany>(x => x.IdShippingCompany == model.IdShippingCompany && (x.Name.ToLower().Equals(model.Name.ToLower())) && (x.IsDeleted ?? false));
            if (shippingCompanyExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(shippingCompanyExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var shippingCompanyDB = await _repository.GetById<ShippingCompany>(model.IdShippingCompany);
            shippingCompanyDB.Name = model.Name;
            var result = await _repository.Update(shippingCompanyDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = shippingCompanyDB });
        }

        /// <summary>
        /// Deshabilita lógicamente una compañía de transporte existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID de la compañía de transporte a deshabilitar.</param>
        /// <returns>La ShippingCompanyDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableShippingCompany(int id)
        {
            var shippingCompany = await _repository.GetById<ShippingCompany>(id);
            if (shippingCompany == null)
                return NotFound(new ApiResponse());
            shippingCompany.IsActive = false;
            var result = await _repository.Update(shippingCompany);
            if (!result)
                return BadRequest(new ApiResponse());

            var shippingCompanyDTO = _mapper.Map<ShippingCompanyDTO>(shippingCompany);
            return Ok(new ApiResponse { Data = shippingCompanyDTO });
        }

        /// <summary>
        /// Habilita lógicamente una compañía de transporte existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID de la compañía de transporte a habilitar.</param>
        /// <returns>La ShippingCompanyDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableShippingCompany(int id)
        {
            var shippingCompany = await _repository.FirstOrDefault<ShippingCompany>(x => x.IdShippingCompany == id && !(x.IsDeleted ?? false));
            if (shippingCompany == null)
                return NotFound(new ApiResponse());
            shippingCompany.IsActive = true;
            var result = await _repository.Update(shippingCompany);
            if (!result)
                return BadRequest(new ApiResponse());

            var shippingCompanyDTO = _mapper.Map<ShippingCompanyDTO>(shippingCompany);
            return Ok(new ApiResponse { Data = shippingCompanyDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de una compañía de transporte (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID de la compañía de transporte a eliminar.</param>
        /// <returns>La ShippingCompanyDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteShippingCompany(int id)
        {
            var shippingCompany = await _repository.FirstOrDefault<ShippingCompany>(x => x.IdShippingCompany == id && !(x.IsDeleted ?? false));
            if (shippingCompany == null)
                return NotFound(new ApiResponse());
            shippingCompany.IsDeleted = true;
            var result = await _repository.Update(shippingCompany);
            if (!result)
                return BadRequest(new ApiResponse());

            var shippingCompanyDTO = _mapper.Map<ShippingCompanyDTO>(shippingCompany);
            return Ok(new ApiResponse { Data = shippingCompanyDTO });
        }
    }
}