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
    [Route("ShippingCompanies")]
    //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ShippingCompaniesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public ShippingCompaniesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet("pagination")]
        public async Task<ActionResult> GetShippingCompaniesPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<ShippingCompany>();

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
        public async Task<ActionResult<ShippingCompanyDTO>> GetShippingCompanyById(int id)
        {
            var client = await _repository.FindBy<ShippingCompany>(x => x.IdShippingCompany == id && !(x.IsDeleted ?? false));
            if (client == null)
                return NotFound(new ApiResponse());

            var clientDTO = _mapper.Map<ShippingCompanyDTO>(client);

            return Ok(new ApiResponse { Data = clientDTO });
        }
        [HttpPost]
        public async Task<ActionResult> AddShippingCompany([FromBody] ShippingCompanyDTO model)
        {
            var clientExists = await _repository.FirstOrDefault<ShippingCompany>(x => (x.Name.ToLower().Equals(model.Name.ToLower())) && !(x.IsDeleted ?? false));
            if (clientExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(clientExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var clientDB = _mapper.Map<ShippingCompany>(model);
            var result = await _repository.Add(clientDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut]
        public async Task<ActionResult> UpdateShippingCompany([FromBody] ShippingCompanyDTO model)
        {
            var clientExists = await _repository.FirstOrDefault<ShippingCompany>(x => (x.Name.ToLower().Equals(model.Name.ToLower())) && (x.IsDeleted ?? false));
            if (clientExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(clientExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var clientDB = _mapper.Map<ShippingCompany>(model);
            var result = await _repository.Update(clientDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableShippingCompany(int id)
        {
            var client = await _repository.GetById<ShippingCompany>(id);
            if (client == null)
                return NotFound(new ApiResponse());
            client.IsActive = false;
            var result = await _repository.Update(client);
            if (!result)
                return BadRequest(new ApiResponse());

            var clientDTO = _mapper.Map<ShippingCompanyDTO>(client);
            return Ok(new ApiResponse { Data = clientDTO });
        }

        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableShippingCompany(int id)
        {
            var client = await _repository.FirstOrDefault<ShippingCompany>(x => x.IdShippingCompany == id && !(x.IsDeleted ?? false));
            if (client == null)
                return NotFound(new ApiResponse());
            client.IsActive = true;
            var result = await _repository.Update(client);
            if (!result)
                return BadRequest(new ApiResponse());

            var clientDTO = _mapper.Map<ShippingCompanyDTO>(client);
            return Ok(new ApiResponse { Data = clientDTO });
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteShippingCompany(int id)
        {
            var client = await _repository.FirstOrDefault<ShippingCompany>(x => x.IdShippingCompany == id && !(x.IsDeleted ?? false));
            if (client == null)
                return NotFound(new ApiResponse());
            client.IsDeleted = true;
            var result = await _repository.Update(client);
            if (!result)
                return BadRequest(new ApiResponse());

            var clientDTO = _mapper.Map<ShippingCompanyDTO>(client);
            return Ok(new ApiResponse { Data = clientDTO });
        }
    }
}