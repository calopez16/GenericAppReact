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
    [Route("drivers")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class DriversController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public DriversController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

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

        [HttpGet("{id}")]
        public async Task<ActionResult<DriverDTO>> GetDriverById(int id)
        {
            var driver = await _repository.FindBy<Driver>(x => x.IdDriver == id && !(x.IsDeleted ?? false));
            if (driver == null)
                return NotFound(new ApiResponse());

            var driverDTO = _mapper.Map<DriverDTO>(driver);

            return Ok(new ApiResponse { Data = driverDTO });
        }
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