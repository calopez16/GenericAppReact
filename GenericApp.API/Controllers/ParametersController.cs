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
    [Route("parameters")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ParametersController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IWebHostEnvironment _environment;

        public ParametersController(
            IWebHostEnvironment environment,
            IRepository repository)
        {
            _repository = repository;
            _environment = environment;
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

        [HttpPost("logo")]
        public async Task<ActionResult> AppLogo(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiResponse { Message = "No se ha enviado ningún archivo." });
            }

            // 1. Definir el nombre de archivo y la ruta
            string fileName = "logo.png";
            // Combina la ruta de wwwroot con el nombre del archivo.
            // WebRootPath apunta a la carpeta wwwroot.
            string fullPath = Path.Combine(_environment.WebRootPath,"img", fileName);

            try
            {
                // 2. Guardar el archivo
                // FileMode.Create asegura que si el archivo (logo.png) ya existe, se sobrescriba.
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new ApiResponse { Message = "Logo de la aplicación reemplazado exitosamente." });
            }
            catch (Exception ex)
            {
                // Loggear la excepción real en un entorno real
                return BadRequest(new ApiResponse { Message = $"Error al guardar el archivo: {ex.Message}" });
            }
        }

        [HttpPost("login-background")]
        public async Task<ActionResult> LoginBackground(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiResponse { Message = "No se ha enviado ningún archivo." });
            }

            // 1. Definir el nombre de archivo y la ruta
            string fileName = "login_background.png";
            // Combina la ruta de wwwroot con el nombre del archivo.
            // WebRootPath apunta a la carpeta wwwroot.
            string fullPath = Path.Combine(_environment.WebRootPath, "img", fileName);

            try
            {
                // 2. Guardar el archivo
                // FileMode.Create asegura que si el archivo (logo.png) ya existe, se sobrescriba.
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new ApiResponse ());
            }
            catch (Exception)
            {
                // Loggear la excepción real en un entorno real
                return BadRequest(new ApiResponse ());
            }
        }
    }
}