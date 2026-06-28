using AngleSharp;
using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Globalization;
using System.Text.RegularExpressions;
using AsDom = AngleSharp.Dom;
using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controller for managing CRUD operations for ContractSignTemplate catalog.
    /// Requires authentication and User policy.
    /// </summary>
    [ApiController]
    [Route("contracts-signs")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class ContractSignSignsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;

        public ContractSignSignsController(IRepository repository, IMapper mapper, IWebHostEnvironment env, IConfiguration configuration)
        {
            _repository = repository;
            _mapper = mapper;
            _env = env;
            _configuration = configuration;
        }

        /// <summary>
        /// Returns a paginated list of signed contracts ordered by creation date descending.
        /// </summary>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetContractSignSignsPagination(
            [FromQuery] int idCompany,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<ContractSign>();
            query = query.Where(x => x.IdCompany == idCompany && !(x.IsDeleted ?? false));

            if (!string.IsNullOrWhiteSpace(searchTerm))
                query = query.Where(x => (x.Name != null && x.Name.Contains(searchTerm)));

            query = query.OrderByDescending(x => x.Name ?? x.Name);

            var totalRows = query.Count();
            var data = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ContractSignDTO
                {
                    IdContractSign = x.IdContractSign,
                    Name = x.Name,
                    SignFileName = x.SignFileName,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted
                })
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

        /// <summary>
        /// Obtiene las firmas activas del sistema.
        /// </summary>
        /// <param name="id">El ID de la ciudad a buscar.</param>
        /// <returns>La ContractSignDTO si se encuentra, o NotFound si no existe.</returns>
        [HttpGet("active")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult<ContractSignDTO>> GetActiveContractSigns()
        {
            // Obtenemos la consulta base del repositorio
            var query = await _repository.Query<ContractSign>();

            // Aplicamos los Includes para cargar las navegaciones
            var contractSign = await query.Where(x => (x.IsActive ?? false) && !(x.IsDeleted ?? false)).ToListAsync();

            // El Mapper se encarga de convertir las entidades cargadas al DTO
            var contractSignListDTO = _mapper.Map<List<ContractSignDTO>>(contractSign);

            return Ok(new ApiResponse { Data = contractSignListDTO });
        }

        /// <summary>
        /// Obtiene una ciudad específica por su ID.
        /// </summary>
        /// <param name="id">El ID de la ciudad a buscar.</param>
        /// <returns>La ContractSignDTO si se encuentra, o NotFound si no existe.</returns>
        [HttpGet("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult<ContractSignDTO>> GetContractSignById(int id)
        {
            // Obtenemos la consulta base del repositorio
            var query = await _repository.Query<ContractSign>();

            // Aplicamos los Includes para cargar las navegaciones
            var contractSign = await query.FirstOrDefaultAsync(x => x.IdContractSign == id && !(x.IsDeleted ?? false));

            if (contractSign == null)
                return NotFound(new ApiResponse { Message = "Firma no encontrada" });

            // El Mapper se encarga de convertir las entidades cargadas al DTO
            var contractSignDTO = _mapper.Map<ContractSignDTO>(new ContractSignDTO
            {
                IdContractSign = contractSign.IdContractSign,
                Name = contractSign.Name
            });

            return Ok(new ApiResponse { Data = contractSignDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad ContractSign a la base de datos, realizando validación de conflictos.
        /// </summary>
        /// <param name="model">El ContractSignDTO con los datos de la ciudad a crear.</param>
        /// <returns>La entidad ContractSign creada o un conflicto si ya existe.</returns>
        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddContractSign([FromForm] ContractSignDTO model)
        {
            var contractSignExists = await _repository.FirstOrDefault<ContractSign>(x => (x.Name.ToLower().Equals(model.Name.ToLower())) && !(x.IsDeleted ?? false));
            if (contractSignExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(contractSignExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );


            var contractSignDB = _mapper.Map<ContractSign>(model);

            if (model.Sign != null)
                contractSignDB.SignFileName = await GuardarFirma(model.Sign, model.IdCompany);

            var result = await _repository.Add(contractSignDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = contractSignDB });
        }

        /// <summary>
        /// Actualiza una entidad ContractSign existente, incluyendo la validación de conflictos por descripción.
        /// </summary>
        /// <param name="model">El ContractSignDTO con los datos actualizados.</param>
        /// <returns>La entidad ContractSign actualizada o un BadRequest/NotFound si falla.</returns>
        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> UpdateContractSign([FromForm] ContractSignDTO model)
        {
            var contractSignExists = await _repository.FirstOrDefault<ContractSign>(x => x.IdContractSign == model.IdContractSign && (x.Name.ToLower().Equals(model.Name.ToLower())) && (x.IsDeleted ?? false));
            if (contractSignExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(contractSignExists.Name.ToLower().Equals(model.Name.ToLower()) ? model.Name : "")}"
                    }
                );

            var contractSignDB = await _repository.GetById<ContractSign>(model.IdContractSign);
            contractSignDB.Name = model.Name;

            if (model.Sign != null)
            {
                if (!string.IsNullOrEmpty(contractSignDB.SignFileName))
                {
                    await DeleteFirma(contractSignDB.SignFileName, contractSignDB.IdCompany ?? 1);
                }
                contractSignDB.SignFileName = await GuardarFirma(model.Sign, model.IdCompany);
            }

            var result = await _repository.Update(contractSignDB);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = contractSignDB });
        }

        private async Task<string> GuardarFirma(IFormFile logo, int idCompany)
        {

            var signPath = _configuration["contractsSettings:contractsSignsPath"] ?? "Signs";

            string carpeta = Path.Combine(_env.WebRootPath, "img", signPath, idCompany.ToString());

            // Crear directorio si no existe
            if (!Directory.Exists(carpeta))
                Directory.CreateDirectory(carpeta);

            // Generar nombre único para evitar colisiones (Guid + extensión original)
            string nombreArchivo = $"{Guid.NewGuid()}{Path.GetExtension(logo.FileName)}";
            string rutaCompleta = Path.Combine(carpeta, nombreArchivo);

            // Guardar el archivo físicamente
            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await logo.CopyToAsync(stream);
            }
            return nombreArchivo;
        }


        private async Task<bool> DeleteFirma(string logoName, int idCompany)
        {
            try
            {
                var signPath = _configuration["contractsSettings:contractsSignsPath"] ?? "Signs";
                string carpeta = Path.Combine(_env.WebRootPath, signPath, idCompany.ToString());
                if (!Directory.Exists(carpeta))
                    return default;

                string rutaCompleta = Path.Combine(carpeta, logoName);

                if (System.IO.File.Exists(rutaCompleta))
                    System.IO.File.Delete(rutaCompleta);
            }
            catch (Exception)
            {
                return false;
            }
            return true;
        }

        /// <summary>
        /// Deshabilita lógicamente una ciudad existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID de la ciudad a deshabilitar.</param>
        /// <returns>La ContractSignDTO de la ciudad actualizada.</returns>
        [HttpPut("disable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DisableContractSign(int id)
        {
            var contractSign = await _repository.GetById<ContractSign>(id);
            if (contractSign == null)
                return NotFound(new ApiResponse());
            contractSign.IsActive = false;
            var result = await _repository.Update(contractSign);
            if (!result)
                return BadRequest(new ApiResponse());

            var contractSignDTO = _mapper.Map<ContractSignDTO>(contractSign);
            return Ok(new ApiResponse { Data = contractSignDTO });
        }

        /// <summary>
        /// Habilita lógicamente una ciudad existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID de la ciudad a habilitar.</param>
        /// <returns>La ContractSignDTO de la ciudad actualizada.</returns>
        [HttpPut("enable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> EnableContractSign(int id)
        {
            var contractSign = await _repository.FirstOrDefault<ContractSign>(x => x.IdContractSign == id && !(x.IsDeleted ?? false));
            if (contractSign == null)
                return NotFound(new ApiResponse());
            contractSign.IsActive = true;
            var result = await _repository.Update(contractSign);
            if (!result)
                return BadRequest(new ApiResponse());

            var contractSignDTO = _mapper.Map<ContractSignDTO>(contractSign);
            return Ok(new ApiResponse { Data = contractSignDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de una ciudad (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID de la ciudad a eliminar.</param>
        /// <returns>La ContractSignDTO de la ciudad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteContractSign(int id)
        {
            var contractSign = await _repository.FirstOrDefault<ContractSign>(x => x.IdContractSign == id && !(x.IsDeleted ?? false));
            if (contractSign == null)
                return NotFound(new ApiResponse());
            contractSign.IsDeleted = true;
            var result = await _repository.Update(contractSign);
            if (!result)
                return BadRequest(new ApiResponse());

            var contractSignDTO = _mapper.Map<ContractSignDTO>(contractSign);
            return Ok(new ApiResponse { Data = contractSignDTO });
        }


    }
}
