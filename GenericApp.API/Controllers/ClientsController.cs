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
        [HttpGet("{id}")]
        public async Task<ActionResult<ClientDTO>> GetClientById([FromQuery] int id)
        {
            var client = await _repository.GetById<Client>(id);
            if (client == null)
                return NotFound(new ApiResponse());

            var clientDTO = _mapper.Map<ClientDTO>(client);

            return Ok(new ApiResponse { Data = clientDTO });
        }
        [HttpPost]
        public async Task<ActionResult> AddClient([FromBody] ClientDTO model)
        {
            var clientExists = await _repository.FirstOrDefault<Client>(x => x.Name.ToLower().Equals(model.Name.ToLower()) || x.Rfc.ToLower().Equals(model.Rfc.ToLower()));
            if (clientExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(clientExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}, {(clientExists.Rfc.ToLower().Equals(model.Rfc.ToLower()) ? model.Rfc : "")}"
                    }
                );

            var clientDB = _mapper.Map<Client>(model);
            var result = await _repository.Add(clientDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut]
        public async Task<ActionResult> UpdateClient([FromBody] ClientDTO model)
        {
            var clientExists = await _repository.FirstOrDefault<Client>(x => x.Name.ToLower().Equals(model.Name.ToLower()) || x.Rfc.ToLower().Equals(model.Rfc.ToLower()));
            if (clientExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(clientExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}, {(clientExists.Rfc.ToLower().Equals(model.Rfc.ToLower()) ? model.Rfc : "")}"
                    }
                );

            var clientDB = _mapper.Map<Client>(model);
            var result = await _repository.Update(clientDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableClient([FromQuery] int id)
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
        public async Task<ActionResult> EnableClient([FromQuery] int id)
        {
            var client = await _repository.GetById<Client>(id);
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
        public async Task<ActionResult> DeleteClient([FromQuery] int id)
        {
            var client = await _repository.GetById<Client>(id);
            if (client == null)
                return NotFound(new ApiResponse());
            client.IsActive = true;
            var result = await _repository.RemoveById<Client>(id);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse ());
        }
    }
}