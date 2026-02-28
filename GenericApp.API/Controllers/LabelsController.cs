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
    /// <summary>
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad Label, que incluye la colección anidada LabelType.
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("labels")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class LabelsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador LabelsController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public LabelsController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        /// <summary>
        /// Obtiene una lista paginada de etiquetas (Labels), incluyendo sus tipos (LabelTypes),
        /// permitiendo la búsqueda por término y el filtro por estado activo.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por descripción (opcional).</param>
        /// <param name="active">Filtro por estado activo (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de LabelDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetLabelsPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? active = null
            )
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Label>();
            query = query.Include(x => x.LabelTypes);
            query = query.Where(x => !(x.IsDeleted ?? false) && (!active.HasValue || x.IsActive == active));

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.Description.Contains(searchTerm));
            }

            var totalRows = query.Count();
            var data = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new LabelDTO
                {
                    Description = s.Description,
                    IdLabel = s.IdLabel,
                    IsActive = s.IsActive,
                    MaxBoxQuantity = s.MaxBoxQuantity,
                    LabelTypes = s.LabelTypes.Where(x => !(x.IsDeleted ?? false)).Select(x => new LabelTypeDTO
                    {
                        IdLabelType = x.IdLabelType,
                        Description = x.Description,
                        IdLabel = x.IdLabel,
                        IsActive = x.IsActive,
                        IsDeleted = x.IsDeleted,
                        Size = x.Size
                    }).ToList()
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

        /// <summary>
        /// Obtiene una etiqueta específica por su ID.
        /// </summary>
        /// <param name="id">El ID de la etiqueta a buscar.</param>
        /// <returns>La LabelDTO si se encuentra, o NotFound si no existe o está eliminada.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<LabelDTO>> GetLabelById(int id)
        {
            var label = await _repository.FindBy<Label>(x => x.IdLabel == id && !(x.IsDeleted ?? false));
            if (label == null)
                return NotFound(new ApiResponse());

            var labelDTO = _mapper.Map<LabelDTO>(label);

            return Ok(new ApiResponse { Data = labelDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad Label a la base de datos, incluyendo su colección de LabelTypes.
        /// </summary>
        /// <param name="model">El LabelDTO con los datos de la etiqueta y sus tipos a crear.</param>
        /// <returns>La LabelDTO de la entidad creada o un conflicto si ya existe una etiqueta con la misma descripción.</returns>
        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddLabel([FromBody] LabelDTO model)
        {
            var labelExists = await _repository.FirstOrDefault<Label>(
                x => x.Description.ToLower().Equals(model.Description.ToLower()) && !(x.IsDeleted ?? false)
            );

            if (labelExists != null)
                return Conflict(new ApiResponse { Conflict = $"{model.Description}" });

            var labelDB = new Label
            {
                Description = model.Description,
                MaxBoxQuantity = model.MaxBoxQuantity,
                IdCompany = model.IdCompany ?? 0,
                IsActive = true,
                IsDeleted = false,
                LabelTypes = new List<LabelType>()
            };

            if (model.LabelTypes != null)
            {
                foreach (var group in model.LabelTypes)
                {
                    // Expandimos el array de tallas en registros individuales
                    foreach (var s in group.Sizes ?? new List<string>())
                    {
                        labelDB.LabelTypes.Add(new LabelType
                        {
                            Description = group.Description,
                            Size = s,
                            IsActive = true,
                            IsDeleted = false
                        });
                    }
                }
            }

            var result = await _repository.Add(labelDB);
            var labelResponse = new LabelDTO
            {
                IdLabel = labelDB.IdLabel,
                Description = labelDB.Description,
                MaxBoxQuantity = labelDB.MaxBoxQuantity,
                IdCompany = labelDB.IdCompany,
                IsActive = true,
                IsDeleted = false,
                LabelTypes = labelDB.LabelTypes.Select(x => new LabelTypeDTO
                {
                    IdLabel = x.IdLabel,
                    Description = x.Description,
                    IdLabelType = x.IdLabelType,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted,
                    Size = x.Size
                }).ToList()
            };

            return result ? Ok(new ApiResponse { Data = labelResponse }) : BadRequest();
        }

        /// <summary>
        /// Actualiza una entidad Label existente y sincroniza su colección anidada de LabelTypes.
        /// </summary>
        /// <param name="model">El LabelDTO con los datos actualizados.</param>
        /// <returns>La LabelDTO de la entidad actualizada o un conflicto si ya existe otra etiqueta con el mismo nombre.</returns>
        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> UpdateLabel([FromBody] LabelDTO model)
        {
            var labelDB = await _repository.FirstOrDefault<Label>(x => x.IdLabel == model.IdLabel, x => x.LabelTypes);
            if (labelDB == null || (labelDB.IsDeleted ?? false)) return NotFound();

            labelDB.Description = model.Description;
            labelDB.MaxBoxQuantity = model.MaxBoxQuantity;

            // 1. Aplanamos los datos entrantes para tener una lista clara de pares (Descripción + Size)
            var incomingPairs = (model.LabelTypes ?? new List<LabelTypeDTO>())
                .SelectMany(g => (g.Sizes ?? new List<string>())
                    .Select(s => new { Description = g.Description, Size = s }))
                .ToList();

            var existingLabelTypes = labelDB.LabelTypes ?? new List<LabelType>();

            // 2. Borrado Lógico: Desactivar lo que está en DB pero NO viene en la nueva lista
            var toDelete = existingLabelTypes
                .Where(lt => !(lt.IsDeleted ?? false))
                .Where(lt => !incomingPairs.Any(ip => ip.Description == lt.Description && ip.Size == lt.Size))
                .ToList();

            foreach (var item in toDelete)
            {
                item.IsDeleted = true;
            }

            // 3. Crear o Restaurar: Procesar cada par de la lista entrante
            foreach (var pair in incomingPairs)
            {
                // ¿Ya existe uno activo con esta descripción y talla?
                var activeInDB = existingLabelTypes.Any(lt =>
                    lt.Description == pair.Description &&
                    lt.Size == pair.Size &&
                    !(lt.IsDeleted ?? false));

                if (!activeInDB)
                {
                    // Si no está activo, buscamos si hay uno eliminado para restaurarlo
                    var deletedInDB = existingLabelTypes.FirstOrDefault(lt =>
                        lt.Description == pair.Description &&
                        lt.Size == pair.Size &&
                        (lt.IsDeleted ?? false));

                    if (deletedInDB != null)
                    {
                        deletedInDB.IsDeleted = false;
                        deletedInDB.IsActive = true;
                    }
                    else
                    {
                        // Si no existe ni eliminado, creamos el nuevo registro
                        existingLabelTypes.Add(new LabelType
                        {
                            Description = pair.Description,
                            Size = pair.Size,
                            IdLabel = labelDB.IdLabel,
                            IsActive = true,
                            IsDeleted = false
                        });
                    }
                }
            }

            var result = await _repository.Update(labelDB);
            return result ? Ok(new ApiResponse()) : BadRequest();
        }

        /// <summary>
        /// Deshabilita lógicamente una etiqueta existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID de la etiqueta a deshabilitar.</param>
        /// <returns>La LabelDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
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

        /// <summary>
        /// Habilita lógicamente una etiqueta existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID de la etiqueta a habilitar.</param>
        /// <returns>La LabelDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
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

        /// <summary>
        /// Realiza la eliminación lógica de una etiqueta (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID de la etiqueta a eliminar.</param>
        /// <returns>La LabelDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
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

        /// <summary>
        /// Obtiene listado de tamaño de etiquetas registradas en el sistema.
        /// </summary>
        /// <returns>Listado de LabelDTO si se encuentran, o NotFound si no existen.</returns>
        [HttpGet("labeltypes-active")]
        public async Task<ActionResult<IEnumerable<LabelTypeDTO>>> GetActiveSizeLabels()
        {
            try
            {
                var query = await _repository.Query<LabelType>();

                var labelTypeList = await query
                    .Where(x => !(x.IsDeleted ?? false))
                    .GroupBy(x => x.Size)
                    .Select(group => group.OrderBy(lt => lt.IdLabelType).FirstOrDefault())
                    .ToListAsync();

                if (labelTypeList == null || !labelTypeList.Any())
                    return NotFound(new ApiResponse { Message = "No se encontraron etiquetas." });

                var labelDTO = _mapper.Map<List<LabelTypeDTO>>(labelTypeList);

                return Ok(new ApiResponse { Data = labelDTO });
            }
            catch (Exception)
            {
                // Es recomendable registrar el error aquí (logger)
                return StatusCode(500, new ApiResponse { Message = "Error interno al procesar los tipos de etiqueta." });
            }
        }
    }
}