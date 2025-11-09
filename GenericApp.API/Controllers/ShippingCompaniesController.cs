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
    [ApiController]
    [Route("shipping-companies")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
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

        [HttpGet("{id}")]
        public async Task<ActionResult<ShippingCompanyDTO>> GetShippingCompanyById(int id)
        {
            var shippingCompany = await _repository.FindBy<ShippingCompany>(x => x.IdShippingCompany == id && !(x.IsDeleted ?? false));
            if (shippingCompany == null)
                return NotFound(new ApiResponse());

            var shippingCompanyDTO = _mapper.Map<ShippingCompanyDTO>(shippingCompany);

            return Ok(new ApiResponse { Data = shippingCompanyDTO });
        }
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