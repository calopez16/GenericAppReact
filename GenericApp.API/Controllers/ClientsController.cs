using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Data;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad Client.
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("clients")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class ClientsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador ClientsController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public ClientsController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de clientes activos, permitiendo la búsqueda por nombre o RFC.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por nombre o RFC (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de ClientDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetClientsPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Client>();
            query = query.Where(x => !(x.IsDeleted ?? false));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Name.Contains(searchTerm));
            }

            var totalRows = query.Count();
            var data = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ClientDTO
                {
                    Name = x.Name,
                    BirthDate = x.BirthDate,
                    MaritalState=x.MaritalState,
                    Ocupation = x.Ocupation,
                    Education = x.Education,
                    Profession = x.Profession,
                    Religion = x.Religion,
                    Address = x.Address,
                    IdCity = x.IdCity,
                    IdClient = x.IdClient,
                    IsActive = x.IsActive,
                    Notes = x.Notes,
                    Phone = x.Phone,
                    
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
        /// Obtiene un cliente específico por su ID.
        /// </summary>
        /// <param name="id">El ID del cliente a buscar.</param>
        /// <returns>La ClientDTO si se encuentra, o NotFound si no existe o está eliminado.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDTO>> GetClientById(int id)
        {
            var client = await _repository.FirstOrDefault<Client>(
                x => x.IdClient == id && !(x.IsDeleted ?? false),
                x => x.IdGenderNavigation,
                x => x.IdCityNavigation);
            if (client == null)
                return NotFound(new ApiResponse());

            var clientDTO = _mapper.Map<ClientDTO>(client);

            return Ok(new ApiResponse { Data = clientDTO });

        }

        /// <summary>
        /// Agrega una nueva entidad Client a la base de datos.
        /// </summary>
        /// <param name="model">El ClientDTO con los datos del cliente a crear.</param>
        /// <returns>La entidad Client creada o un conflicto si ya existe un cliente con el mismo nombre o RFC.</returns>
        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddClient([FromBody] ClientDTO model)
        {
            var clientExists = await _repository.FirstOrDefault<Client>(x => (x.Name.ToLower().Equals(model.Name.ToLower())) && !(x.IsDeleted ?? false));
            if (clientExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(clientExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var clientDB = _mapper.Map<Client>(model);
            var result = await _repository.Add(clientDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = clientDB });
        }

        /// <summary>
        /// Actualiza una entidad Client existente.
        /// </summary>
        /// <param name="model">El ClientDTO con los datos actualizados.</param>
        /// <returns>La entidad Client actualizada o un conflicto si ya existe otro cliente con el mismo nombre o RFC.</returns>
        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> UpdateClient([FromBody] ClientDTO model)
        {
            var clientExists = await _repository.FirstOrDefault<Client>(x => x.IdClient != model.IdClient && (x.Name.ToLower().Equals(model.Name.ToLower())) && !(x.IsDeleted ?? false));
            if (clientExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(clientExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var clientDB = await _repository.GetById<Client>(model.IdClient ?? 0);
            clientDB.Name = model.Name;
            clientDB.BirthDate = model.BirthDate;
            clientDB.MaritalState = model.MaritalState;
            clientDB.Phone = model.Phone;
            clientDB.Address = model.Address;
            clientDB.Ocupation = model.Ocupation;
            clientDB.Education= model.Education;
            clientDB.Profession = model.Profession;
            clientDB.Religion = model.Religion;
            clientDB.IdCity = model.IdCity;
            clientDB.Notes = model.Notes;

            if (!string.IsNullOrWhiteSpace(model.Gender))
            {
                var gender = await _repository.FirstOrDefault<Gender>(g => g.Descripcion == model.Gender && !(g.IsDeleted ?? false));
                clientDB.IdGender = gender?.IdGender;
            }
            else
            {
                clientDB.IdGender = null;
            }

            var result = await _repository.Update(clientDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = clientDB });
        }

        /// <summary>
        /// Deshabilita lógicamente un cliente existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID del cliente a deshabilitar.</param>
        /// <returns>La ClientDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DisableClient(int id)
        {
            var client = await _repository.GetById<Client>(id);
            if (client == null)
                return NotFound(new ApiResponse());
            client.IsActive = false;
            var result = await _repository.Update(client);
            if (!result)
                return BadRequest(new ApiResponse());

            var clientDTO = _mapper.Map<ClientDTO>(client);
            return Ok(new ApiResponse { Data = clientDTO });
        }

        /// <summary>
        /// Habilita lógicamente un cliente existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID del cliente a habilitar.</param>
        /// <returns>La ClientDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> EnableClient(int id)
        {
            var client = await _repository.FirstOrDefault<Client>(x => x.IdClient == id && !(x.IsDeleted ?? false));
            if (client == null)
                return NotFound(new ApiResponse());
            client.IsActive = true;
            var result = await _repository.Update(client);
            if (!result)
                return BadRequest(new ApiResponse());

            var clientDTO = _mapper.Map<ClientDTO>(client);
            return Ok(new ApiResponse { Data = clientDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de un cliente (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID del cliente a eliminar.</param>
        /// <returns>La ClientDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteClient(int id)
        {
            var client = await _repository.FirstOrDefault<Client>(x => x.IdClient == id && !(x.IsDeleted ?? false));
            if (client == null)
                return NotFound(new ApiResponse());
            client.IsDeleted = true;
            var result = await _repository.Update(client);
            if (!result)
                return BadRequest(new ApiResponse());

            var clientDTO = _mapper.Map<ClientDTO>(client);
            return Ok(new ApiResponse { Data = clientDTO });
        }
    }
}