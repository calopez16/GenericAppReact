using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using GenericApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("embarques")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class EmbarquesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IWebHostEnvironment _environment;

        public EmbarquesController(
            IWebHostEnvironment environment,
            IRepository repository)
        {
            _repository = repository;
            _environment = environment;
        }

        private List<EmbarqueDTO> GetDummyShipments()
        {
            var dummyShipments = new List<EmbarqueDTO>();

            for (int i = 1; i <= 50; i++) // Generate 50 dummy shipments
            {
                var shipment = new EmbarqueDTO
                {
                    Id = i,
                    TripNumber = $"V{i.ToString().PadLeft(4, '0')}",
                    Date = DateTime.Today.AddDays(-i),
                    Address = $"Street {100 + i}",
                    City = i % 2 == 0 ? "Calexico" : "El Centro",
                    State = "California",
                    Country = "USA",
                    PostalCode = $"922{i.ToString().PadLeft(2, '0')}",
                    Phone = $"760-555-12{i.ToString().PadLeft(2, '0')}",
                    TaxId = $"TAXID{i.ToString().PadLeft(5, '0')}US", // Using a US-like equivalent for RFC
                    Season = i % 3 == 0 ? "Summer" : "Winter",
                    Driver = $"Driver {i}",
                    TrailerPlates = $"TR-{i.ToString().PadLeft(5, '0')}",
                    BoxPlates = $"BX-{i.ToString().PadLeft(5, '0')}",
                    DepartureTime = new TimeSpan(8, 0, 0).Add(TimeSpan.FromMinutes(i * 15)),
                    Temperature = 3.5m + (i % 5),
                    Line = i % 4 == 0 ? "Line A" : "Line B",
                    Mixed = i % 2 == 0,
                    Pallets = new List<PalletDTO>()
                };

                // Add dummy palettes (Pallets)
                for (int j = 1; j <= (i % 4) + 2; j++) // 2 to 5 palettes per shipment
                {
                    var pallet = new PalletDTO
                    {
                        Position = j,
                        Boxes = new List<BoxDTO>()
                    };

                    // Add dummy boxes (Boxes)
                    for (int k = 1; k <= 10; k++) // 10 boxes per pallet
                    {
                        pallet.Boxes.Add(new BoxDTO
                        {
                            Label = $"LBL-{i}-{j}-{k}",
                            SerialCode = Guid.NewGuid().ToString().Substring(0, 8)
                        });
                    }
                    shipment.Pallets.Add(pallet);
                }

                dummyShipments.Add(shipment);
            }

            return dummyShipments;
        }

        [HttpGet("pagination")]
        public async Task<ActionResult> GetEmbarquesPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            // 1. Get ALL dummy data
            var allShipments = GetDummyShipments();

            // 2. Apply filtering
            var query = allShipments.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var normalizedSearchTerm = searchTerm.Trim().ToLowerInvariant();

                // Searching dummy data by TripNumber and City
                query = query.Where(u =>
                    u.TripNumber.ToLowerInvariant().Contains(normalizedSearchTerm) ||
                    u.City.ToLowerInvariant().Contains(normalizedSearchTerm));
            }

            // 3. Count total items after filtering
            var totalShipments = query.Count();

            // 4. Apply pagination (Skip and Take)
            var shipmentsPaginated = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            // 5. Create the response object
            var paginatedResponse = new
            {
                TotalCount = totalShipments,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)System.Math.Ceiling((double)totalShipments / pageSize),
                // The key name remains 'Embarques' as it's defined in your original response object, 
                // but its content is the list of ShipmentDTOs.
                Embarques = shipmentsPaginated
            };

            // Assuming ApiResponse is a standard wrapper model you use
            return Ok(new ApiResponse { Data = paginatedResponse });
        }

    }
}