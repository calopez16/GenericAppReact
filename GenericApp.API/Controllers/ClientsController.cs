using AutoMapper;
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
    [ApiController]
    [Route("clients")]
    //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ClientsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public ClientsController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

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
                    u.Name.Contains(searchTerm) ||
                    u.Rfc.Contains(searchTerm));
            }

            var totalRows = query.Count();
            var data = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ClientDTO
                {
                    Name = x.Name,
                    Address = x.Address,
                    IdCity = x.IdCity,
                    IdClient = x.IdClient,
                    IsActive = x.IsActive,
                    Notes = x.Notes,
                    Phone = x.Phone,
                    PostalCode = x.PostalCode,
                    Rfc = x.Rfc
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


        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDTO>> GetClientById(int id)
        {
            var client = await _repository.FindBy<Client>(x => x.IdClient == id && !(x.IsDeleted ?? false));
            if (client == null)
                return NotFound(new ApiResponse());

            var clientDTO = _mapper.Map<ClientDTO>(client);

            return Ok(new ApiResponse { Data = clientDTO });
        }
        [HttpPost]
        public async Task<ActionResult> AddClient([FromBody] ClientDTO model)
        {
            var clientExists = await _repository.FirstOrDefault<Client>(x => (x.Name.ToLower().Equals(model.Name.ToLower()) || (!model.Rfc.IsNullOrEmpty() && x.Rfc.ToLower().Equals(model.Rfc.ToLower()))) && !(x.IsDeleted ?? false));
            if (clientExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(clientExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}, {(!model.Rfc.IsNullOrEmpty() && clientExists.Rfc.ToLower().Equals(model.Rfc.ToLower()) ? model.Rfc : "")}"
                    }
                );

            var clientDB = _mapper.Map<Client>(model);
            clientDB.IdCompany = 1;
            var result = await _repository.Add(clientDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = clientDB });
        }

        [HttpPut]
        public async Task<ActionResult> UpdateClient([FromBody] ClientDTO model)
        {
            var clientExists = await _repository.FirstOrDefault<Client>(x => x.IdClient != model.IdClient && (x.Name.ToLower().Equals(model.Name.ToLower()) || (!model.Rfc.IsNullOrEmpty() && x.Rfc.ToLower().Equals(model.Rfc.ToLower()))) && !(x.IsDeleted ?? false));
            if (clientExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(clientExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}, {(!clientExists.Rfc.IsNullOrEmpty() && clientExists.Rfc.ToLower().Equals(model.Rfc.ToLower()) ? model.Rfc : "")}"
                    }
                );

            var clientDB = await _repository.GetById<Client>(model.IdClient);
            clientDB.Name = model.Name;
            clientDB.Rfc = model.Rfc;
            clientDB.Phone = model.Phone;
            clientDB.Address = model.Address;
            clientDB.PostalCode = model.PostalCode;
            clientDB.IdCity = model.IdCity;
            clientDB.Notes = model.Notes;
            var result = await _repository.Update(clientDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = clientDB });
        }

        [HttpPut("disable/{id}")]
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

        [HttpPut("enable/{id}")]
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
        [HttpDelete("{id}")]
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