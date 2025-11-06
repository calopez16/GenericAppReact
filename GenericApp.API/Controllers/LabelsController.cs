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
    [Route("labels")]
    //[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class LabelsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public LabelsController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet("pagination")]
        public async Task<ActionResult> GetLabelsPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Label>();

            query = query.Where(x => !(x.IsDeleted ?? false));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Description.Contains(searchTerm));
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
        public async Task<ActionResult<LabelDTO>> GetLabelById(int id)
        {
            var label = await _repository.FindBy<Label>(x => x.IdLabel == id && !(x.IsDeleted ?? false));
            if (label == null)
                return NotFound(new ApiResponse());

            var labelDTO = _mapper.Map<LabelDTO>(label);

            return Ok(new ApiResponse { Data = labelDTO });
        }
        [HttpPost]
        public async Task<ActionResult> AddLabel([FromBody] LabelDTO model)
        {
            var labelExists = await _repository.FirstOrDefault<Label>(x => (x.Description.ToLower().Equals(model.Description.ToLower())) && !(x.IsDeleted ?? false));
            if (labelExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(labelExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var labelDB = _mapper.Map<Label>(model);
            var result = await _repository.Add(labelDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut]
        public async Task<ActionResult> UpdateLabel([FromBody] LabelDTO model)
        {
            var labelExists = await _repository.FirstOrDefault<Label>(x => (x.Description.ToLower().Equals(model.Description.ToLower())) && (x.IsDeleted ?? false));
            if (labelExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(labelExists.Description.ToLower().Equals(model.Description.ToLower()) ? model.Description : "")}"
                    }
                );

            var labelDB = _mapper.Map<Label>(model);
            var result = await _repository.Update(labelDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse());
        }

        [HttpPut("disable/{id}")]
        public async Task<ActionResult> DisableLabel(int id)
        {
            var label = await _repository.GetById<Label>(id);
            if (label == null)
                return NotFound(new ApiResponse());
            label.IsActive = false;
            var result = await _repository.Update(label);
            if (!result)
                return BadRequest(new ApiResponse());

            var labelDTO = _mapper.Map<LabelDTO>(label);
            return Ok(new ApiResponse { Data = labelDTO });
        }

        [HttpPut("enable/{id}")]
        public async Task<ActionResult> EnableLabel(int id)
        {
            var label = await _repository.FirstOrDefault<Label>(x => x.IdLabel == id && !(x.IsDeleted ?? false));
            if (label == null)
                return NotFound(new ApiResponse());
            label.IsActive = true;
            var result = await _repository.Update(label);
            if (!result)
                return BadRequest(new ApiResponse());

            var labelDTO = _mapper.Map<LabelDTO>(label);
            return Ok(new ApiResponse { Data = labelDTO });
        }
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteLabel(int id)
        {
            var label = await _repository.FirstOrDefault<Label>(x => x.IdLabel == id && !(x.IsDeleted ?? false));
            if (label == null)
                return NotFound(new ApiResponse());
            label.IsDeleted = true;
            var result = await _repository.Update(label);
            if (!result)
                return BadRequest(new ApiResponse());

            var labelDTO = _mapper.Map<LabelDTO>(label);
            return Ok(new ApiResponse { Data = labelDTO });
        }
    }
}