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
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("parameters")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ParametersController : ControllerBase
    {
        private readonly IRepository _repository;

        public ParametersController(
            IRepository repository)
        {
            _repository = repository;
        }

        [HttpPut]
        public async Task<ActionResult> UpdateParameter([FromBody] ParameterDTO model)
        {
            try
            {
                var parameter = await _repository.FirstOrDefault<Parameter>(x => x.ParameterCode == model.ParameterCode);
                if (parameter == null)
                    return NotFound();
                parameter.Value = model.Value;
                parameter.Description = model.Description;
                await _repository.Update<Parameter>(parameter);
                return Ok(new ApiResponse());
            }
            catch (Exception)
            {
                return BadRequest(new ApiResponse());

            }
        }

        [HttpGet("code/{parameterCode}")]
        public async Task<ActionResult<ParameterDTO>> GetParameterByCode(string parameterCode)
        {
            var parameter = await _repository.FirstOrDefault<Parameter>(x => x.ParameterCode == parameterCode);
            if (parameter == null)
                return NotFound(new ApiResponse());

            var parameterResponse = new ParameterDTO
            {
                IdParameter = parameter.IdParameter,
                ParameterCode = parameter.ParameterCode,
                Description = parameter.Description,
                Value = parameter.Value,
            };

            return Ok(new ApiResponse { Data = parameterResponse });
        }
    }
}