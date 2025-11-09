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
    [Route("companies")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class CompaniesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public CompaniesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

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


        [HttpGet("{id}")]
        public async Task<ActionResult<CompanyDTO>> GetCompanyById(int id)
        {
            var company = await _repository.FindBy<Company>(x => x.IdCompany == id && !(x.IsDeleted ?? false));
            if (company == null)
                return NotFound(new ApiResponse());

            var companyDTO = _mapper.Map<CompanyDTO>(company);

            return Ok(new ApiResponse { Data = companyDTO });
        }
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