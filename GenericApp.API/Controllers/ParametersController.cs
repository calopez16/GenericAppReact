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
    /// <summary>
    /// Controlador para gestionar parámetros de configuración de la aplicación y archivos estáticos (logo, fondo de login).
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("parameters")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class ParametersController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IWebHostEnvironment _environment;

        /// <summary>
        /// Inicializa una nueva instancia del controlador ParametersController.
        /// </summary>
        /// <param name="environment">Proporciona información sobre el entorno de alojamiento web.</param>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        public ParametersController(
            IWebHostEnvironment environment,
            IRepository repository)
        {
            _repository = repository;
            _environment = environment;
        }

        /// <summary>
        /// Actualiza el valor y la descripción de un parámetro de configuración existente.
        /// </summary>
        /// <param name="model">El ParameterDTO con el código y el nuevo valor/descripción.</param>
        /// <returns>Una ApiResponse vacía en caso de éxito, o NotFound/BadRequest si el parámetro no existe o la actualización falla.</returns>
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

        /// <summary>
        /// Obtiene un parámetro de configuración específico usando su código.
        /// </summary>
        /// <param name="parameterCode">El código único del parámetro a buscar.</param>
        /// <returns>El ParameterDTO si se encuentra, o NotFound si no existe.</returns>
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

        /// <summary>
        /// Sube y reemplaza el archivo de logo de la aplicación ("logo.png") en la carpeta "wwwroot/img".
        /// </summary>
        /// <param name="file">El archivo de imagen a subir.</param>
        /// <returns>Mensaje de éxito o BadRequest si falla la subida.</returns>
        [HttpPost("logo")]
        public async Task<ActionResult> AppLogo(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiResponse { Message = "No se ha enviado ningún archivo." });
            }

            string fileName = "logo.png";
            string fullPath = Path.Combine(_environment.WebRootPath, "img", fileName);

            try
            {
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new ApiResponse { Message = "Logo de la aplicación reemplazado exitosamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new ApiResponse { Message = $"Error al guardar el archivo: {ex.Message}" });
            }
        }

        /// <summary>
        /// Sube y reemplaza el archivo de imagen de fondo del login ("login_background.png") en la carpeta "wwwroot/img".
        /// </summary>
        /// <param name="file">El archivo de imagen a subir.</param>
        /// <returns>ApiResponse vacía en caso de éxito, o BadRequest si falla la subida.</returns>
        [HttpPost("login-background")]
        public async Task<ActionResult> LoginBackground(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new ApiResponse { Message = "No se ha enviado ningún archivo." });
            }

            string fileName = "login_background.png";
            string fullPath = Path.Combine(_environment.WebRootPath, "img", fileName);

            try
            {
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new ApiResponse());
            }
            catch (Exception)
            {
                return BadRequest(new ApiResponse());
            }
        }
    }
}