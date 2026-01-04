using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("manifests")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ManifestsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly UserManager<IdentityUser> _userManager;

        public ManifestsController(
            UserManager<IdentityUser> userManager,
            IRepository repository,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _mapper = mapper;
            _userManager = userManager;
        }

        [HttpGet("pagination")]
        public async Task<ActionResult> GetManifestsPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            try
            {
                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1) pageSize = 10;

                var query = await _repository.Query<Manifest>();

                query = query
                    .Include(s => s.IdManifestStatusNavigation)
                    .Include(s => s.IdShipmentNavigation)
                    .Include(s => s.IdDriverNavigation);

                query = query.Where(x => !(x.IdShipmentNavigation.IsDeleted ?? false));

                if (!string.IsNullOrWhiteSpace(searchTerm))
                {
                    query = query.Where(s =>
                        s.IdManifest.ToString().Contains(searchTerm));
                }

                var totalRows = await query.CountAsync();
                var data = await query
                .OrderByDescending(s => s.CreationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ManifestDTO
                {
                    IdManifest = x.IdManifest,
                    IdShipment = x.IdShipment,
                    CreationDate = x.CreationDate,
                    TemperatureTrailerBoxF = x.TemperatureTrailerBoxF,
                    TemperatureTrailerBoxC = x.TemperatureTrailerBoxC,
                    IdSeason = x.IdSeason,
                    IdDriver = x.IdDriver,
                    TrailerPlate = x.TrailerPlate,
                    TrailerBoxPlate = x.TrailerBoxPlate,
                    IdShippingCompany = x.IdShippingCompany,
                    Comments = x.Comments,
                    IdCompany = x.IdCompany,
                    Empaque = x.Empaque,
                    RegFdaNo = x.RegFdaNo,

                    IdDriverNavigation = x.IdDriverNavigation != null ? new DriverDTO
                    {
                        IdDriver = x.IdDriverNavigation.IdDriver,
                        Name = x.IdDriverNavigation.Name,
                    } : null,

                    IdShipmentNavigation = x.IdShipmentNavigation != null ? new ShipmentDTO
                    {
                        IdShipment = x.IdShipmentNavigation.IdShipment,
                        ShipmentDate = x.IdShipmentNavigation.ShipmentDate,
                        IdClient = x.IdShipmentNavigation.IdClient,
                        Mixed = x.IdShipmentNavigation.Mixed,
                    } : null
                })
                .ToListAsync();

                var dataDTO = _mapper.Map<IEnumerable<ManifestDTO>>(data);

                var paginatedResponse = new
                {
                    TotalCount = totalRows,
                    PageSize = pageSize,
                    CurrentPage = pageNumber,
                    TotalPages = (int)System.Math.Ceiling((double)totalRows / pageSize),
                    Data = dataDTO
                };

                return Ok(new ApiResponse { Data = paginatedResponse });
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ManifestDTO>> GetManifestById(int id)
        {
            var shipmentQuery = await _repository.Query<Manifest>();

            var shipment = await shipmentQuery
            .Include(s => s.IdManifestStatusNavigation)
            .FirstOrDefaultAsync(x => x.IdManifest == id && !(x.IsDeleted ?? false));

            if (shipment == null)
                return NotFound(new ApiResponse());

            var shipmentDTO = _mapper.Map<ManifestDTO>(shipment);

            return Ok(new ApiResponse { Data = shipmentDTO });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteManifest(int id)
        {
            var shipment = await _repository.FirstOrDefault<Manifest>(x => x.IdManifest == id && !(x.IsDeleted ?? false));
            if (shipment == null)
                return NotFound(new ApiResponse());

            shipment.IsDeleted = true;

            var result = await _repository.Update(shipment);

            if (!result)
                return BadRequest(new ApiResponse());

            var shipmentDTO = _mapper.Map<ManifestDTO>(shipment);
            return Ok(new ApiResponse { Data = shipmentDTO });
        }
    }
}