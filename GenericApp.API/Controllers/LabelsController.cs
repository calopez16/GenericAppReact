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
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
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
        public async Task<ActionResult> UpdateLabel([FromBody] LabelDTO model)
        {
            var labelDB = await _repository.FirstOrDefault<Label>(x => x.IdLabel == model.IdLabel, x => x.LabelTypes);
            if (labelDB == null || (labelDB.IsDeleted ?? false)) return NotFound();

            labelDB.Description = model.Description;
            labelDB.MaxBoxQuantity = model.MaxBoxQuantity;

            var incomingGroups = model.LabelTypes ?? new List<LabelTypeDTO>();
            var existingLabelTypes = labelDB.LabelTypes ?? new List<LabelType>();

            foreach (var group in incomingGroups)
            {
                var requestedSizes = group.Sizes ?? new List<string>();

                // Borrado lógico de tallas desmarcadas
                var toRemove = existingLabelTypes
                    .Where(lt => lt.Description == group.Description && !(lt.IsDeleted ?? false) && !requestedSizes.Contains(lt.Size))
                    .ToList();

                foreach (var item in toRemove) { item.IsDeleted = true; item.IsActive = false; }

                // Restaurar o Crear
                foreach (var s in requestedSizes)
                {
                    var exists = existingLabelTypes.Any(lt => lt.Description == group.Description && lt.Size == s && !(lt.IsDeleted ?? false));
                    if (!exists)
                    {
                        var deleted = existingLabelTypes.FirstOrDefault(lt => lt.Description == group.Description && lt.Size == s && (lt.IsDeleted ?? false));
                        if (deleted != null) { deleted.IsDeleted = false; deleted.IsActive = true; }
                        else
                        {
                            existingLabelTypes.Add(new LabelType { Description = group.Description, Size = s, IdLabel = labelDB.IdLabel, IsActive = true, IsDeleted = false });
                        }
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