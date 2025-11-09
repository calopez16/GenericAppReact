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
    [Route("labels")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
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
                    LabelTypes = s.LabelTypes.Where(x => !(x.IsDeleted ?? false)).Select(x => new LabelTypeDTO
                    {
                        IdLabelType = x.IdLabelType,
                        Description = x.Description,
                        IdLabel = x.IdLabel,
                        IsActive = x.IsActive,
                        IsDeleted = x.IsDeleted,
                        MaxBoxQuantity = x.MaxBoxQuantity
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
            // 1. Validación de unicidad de la Descripción (Description)
            // Se valida contra registros NO eliminados (IsDeleted == false)
            var labelExists = await _repository.FirstOrDefault<Label>(
                x => x.Description.ToLower().Equals(model.Description.ToLower()) &&
                     !(x.IsDeleted ?? false)
            );

            if (labelExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        // Se simplifica el conflicto retornado
                        Conflict = $"{model.Description}"
                    }
                );

            // 2. Mapear y configurar la entidad principal (Label)
            var labelDB = _mapper.Map<Label>(model);
            labelDB.IdCompany = 1;
            labelDB.IsActive = true;
            labelDB.IsDeleted = false; // Nuevo registro, no está eliminado

            // 3. Crear entidades LabelType a partir de DTOs
            if (model.LabelTypes != null && model.LabelTypes.Any())
            {
                labelDB.LabelTypes = model.LabelTypes.Select(ltDto => new LabelType
                {
                    Description = ltDto.Description,
                    MaxBoxQuantity = ltDto.MaxBoxQuantity,
                    IsActive = ltDto.IsActive ?? true,
                    IsDeleted = false // Nuevo LabelType, no está eliminado
                }).ToList();
            }

            // 4. Guardar la Label (junto con sus LabelTypes)
            var result = await _repository.Add(labelDB);

            if (!result)
                return BadRequest(new ApiResponse());

            // Se recomienda retornar el objeto mapeado a DTO para asegurar la consistencia.
            var resultDTO = _mapper.Map<LabelDTO>(labelDB);
            return Ok(new ApiResponse
            {
                Data = new LabelDTO
                {
                    IdLabel = labelDB.IdLabel,
                    Description = labelDB.Description,
                    IsActive = labelDB.IsActive,
                    LabelTypes = labelDB.LabelTypes.Select(s => new LabelTypeDTO
                    {
                        IdLabelType = s.IdLabelType,
                        Description = s.Description,
                        IdLabel = s.IdLabel,
                        IsActive = s.IsActive,
                        MaxBoxQuantity = s.MaxBoxQuantity
                    }).ToList()
                }
            });
        }

        [HttpPut]
        public async Task<ActionResult> UpdateLabel([FromBody] LabelDTO model)
        {
            // 1. Validación de unicidad de la Descripción (Description)
            // Se valida contra registros NO eliminados que NO sean el registro actual.
            var labelExists = await _repository.FirstOrDefault<Label>(
                x => x.Description.ToLower().Equals(model.Description.ToLower()) &&
                     x.IdLabel != model.IdLabel &&
                     !(x.IsDeleted ?? false)
            );

            if (labelExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{model.Description}"
                    }
                );

            // 2. Obtener la entidad Label principal (incluyendo LabelTypes)
            // Se asume que el repositorio tiene una sobrecarga para incluir la colección LabelTypes
            var labelDB = await _repository.FirstOrDefault<Label>(x => x.IdLabel == model.IdLabel, x => x.LabelTypes);

            if (labelDB == null || (labelDB.IsDeleted ?? false))
                return NotFound(new ApiResponse());

            // 3. Actualizar propiedades de la Label principal
            labelDB.Description = model.Description;

            // 4. Sincronización de LabelTypes (CRUD dentro de la colección)

            var incomingLabelTypes = model.LabelTypes ?? new List<LabelTypeDTO>();
            var existingLabelTypes = labelDB.LabelTypes ?? new List<LabelType>();

            // a) Identificar y procesar eliminaciones lógicas (IsDeleted = true)
            // IDs de LabelTypes activos en DB que NO están en el DTO entrante.
            var idsToRemoveLogically = existingLabelTypes
                .Where(lt => !(lt.IsDeleted ?? false))
                .Select(lt => lt.IdLabelType)
                .Except(incomingLabelTypes.Where(lt => lt.IdLabelType > 0).Select(lt => lt.IdLabelType))
                .ToList();

            foreach (var id in idsToRemoveLogically)
            {
                var itemToMarkDeleted = existingLabelTypes.FirstOrDefault(lt => lt.IdLabelType == id);
                if (itemToMarkDeleted != null)
                {
                    itemToMarkDeleted.IsDeleted = true;
                    itemToMarkDeleted.IsActive = false;
                }
            }

            // b) Identificar y procesar adiciones y actualizaciones
            foreach (var ltDto in incomingLabelTypes)
            {
                if (ltDto.IdLabelType > 0)
                {
                    // Actualizar existente
                    var ltDB = existingLabelTypes.FirstOrDefault(lt => lt.IdLabelType == ltDto.IdLabelType);
                    if (ltDB != null)
                    {
                        ltDB.Description = ltDto.Description;
                        ltDB.MaxBoxQuantity = ltDto.MaxBoxQuantity;
                        ltDB.IsActive = ltDto.IsActive ?? true;
                        ltDB.IsDeleted = false; // Revivir si estaba previamente eliminado y se envió de nuevo
                    }
                }
                else
                {
                    // Agregar nuevo (ID <= 0 o ID Temporal)
                    existingLabelTypes.Add(new LabelType
                    {
                        Description = ltDto.Description,
                        MaxBoxQuantity = ltDto.MaxBoxQuantity,
                        IsActive = ltDto.IsActive ?? true,
                        IsDeleted = false,
                        IdLabel = labelDB.IdLabel
                    });
                }
            }

            // 5. Guardar los cambios
            var result = await _repository.Update(labelDB);

            if (!result)
                return BadRequest(new ApiResponse());

            // 6. Construir el DTO de retorno manualmente
            var updatedLabelDTO = new LabelDTO
            {
                IdLabel = labelDB.IdLabel,
                Description = labelDB.Description,
                IsActive = labelDB.IsActive,
                LabelTypes = existingLabelTypes
                    .Where(lt => !(lt.IsDeleted ?? false)) // Filtrar tipos eliminados lógicamente
                    .Select(lt => new LabelTypeDTO
                    {
                        IdLabelType = lt.IdLabelType,
                        IdLabel = lt.IdLabel,
                        Description = lt.Description,
                        MaxBoxQuantity = lt.MaxBoxQuantity,
                        IsActive = lt.IsActive,
                        // No se incluye IsDeleted para mantener el DTO limpio
                    }).ToList()
            };

            return Ok(new ApiResponse { Data = updatedLabelDTO });
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