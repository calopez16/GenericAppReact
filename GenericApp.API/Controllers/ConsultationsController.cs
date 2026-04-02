using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("consultations")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class ConsultationsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public ConsultationsController(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet("catalog-options")]
        public async Task<ActionResult> GetCatalogOptions()
        {
            var treatmentQuery = await _repository.Query<Treatment>();
            var oralHygieneQuery = await _repository.Query<OralHygiene>();

            var treatments = await treatmentQuery
                .Where(x => !(x.IsDeleted ?? false) && (x.IsActive ?? false))
                .OrderBy(x => x.Code)
                .Select(x => new TreatmentDTO { IdTreatment = x.IdTreatment, Code = x.Code, Description = x.Description, IsActive = x.IsActive })
                .ToListAsync();

            var oralHygienes = await oralHygieneQuery
                .Where(x => !(x.IsDeleted ?? false) && (x.IsActive ?? false))
                .OrderBy(x => x.IdOralHygiene)
                .Select(x => new OralHygieneDTO { IdOralHygiene = x.IdOralHygiene, Description = x.Description })
                .ToListAsync();

            return Ok(new ApiResponse
            {
                Data = new ConsultationCatalogOptionsDTO
                {
                    Treatments = treatments,
                    OralHygienes = oralHygienes
                }
            });
        }

        [HttpGet("recent")]
        public async Task<ActionResult> GetRecent(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? idCompany = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var clientQuery = await _repository.Query<Client>();
            var consultQuery = await _repository.Query<Consultation>();

            var joined = consultQuery
                .Where(x => !(x.IsDeleted ?? false))
                .Join(
                    clientQuery.Where(c => !(c.IsDeleted ?? false) && (idCompany == null || c.IdCompany == idCompany)),
                    c => c.IdClient,
                    cl => cl.IdClient,
                    (c, cl) => new ConsultationDTO
                    {
                        IdConsultation = c.IdConsultation,
                        IdClient = c.IdClient,
                        ClientName = cl.Name,
                        ConsultationDate = c.ConsultationDate,
                        Reason = c.Reason,
                        Diagnosis = c.Diagnosis,
                        Treatment = c.Treatment,
                        IsActive = c.IsActive
                    });

            if (!string.IsNullOrWhiteSpace(searchTerm))
                joined = joined.Where(x => x.ClientName!.Contains(searchTerm) || (x.Reason != null && x.Reason.Contains(searchTerm)));

            joined = joined.OrderByDescending(x => x.ConsultationDate);

            var totalRows = joined.Count();
            var data = joined.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();

            return Ok(new ApiResponse
            {
                Data = new
                {
                    TotalCount = totalRows,
                    PageSize = pageSize,
                    CurrentPage = pageNumber,
                    TotalPages = (int)System.Math.Ceiling((double)totalRows / pageSize),
                    Data = data
                }
            });
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult> GetByClientId(
            int clientId,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var clientEntity = await _repository.FirstOrDefault<Client>(x => x.IdClient == clientId);
            var query = await _repository.Query<Consultation>();
            query = query
                .Where(x => x.IdClient == clientId && !(x.IsDeleted ?? false))
                .OrderByDescending(x => x.ConsultationDate);

            var totalRows = query.Count();
            var data = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ConsultationDTO
                {
                    IdConsultation = x.IdConsultation,
                    IdClient = x.IdClient,
                    ClientName = clientEntity != null ? clientEntity.Name : null,
                    ConsultationDate = x.ConsultationDate,
                    Reason = x.Reason,
                    CurrentCondition = x.CurrentCondition,
                    PhysicalExam = x.PhysicalExam,
                    Diagnosis = x.Diagnosis,
                    Treatment = x.Treatment,
                    IsActive = x.IsActive
                })
                .ToList();

            return Ok(new ApiResponse
            {
                Data = new
                {
                    TotalCount = totalRows,
                    PageSize = pageSize,
                    CurrentPage = pageNumber,
                    TotalPages = (int)System.Math.Ceiling((double)totalRows / pageSize),
                    Data = data
                }
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult> GetById(int id)
        {
            var entity = await _repository.FirstOrDefault<Consultation>(
                x => x.IdConsultation == id && !(x.IsDeleted ?? false),
                x => x.ConsultationTreatments);

            if (entity == null)
                return NotFound(new ApiResponse());

            var client = await _repository.FirstOrDefault<Client>(x => x.IdClient == entity.IdClient);

            var treatmentIds = entity.ConsultationTreatments.Select(ct => ct.IdTreatment).Distinct().ToList();
            var treatmentQuery = await _repository.Query<Treatment>();
            var treatments = await treatmentQuery
                .Where(t => treatmentIds.Contains(t.IdTreatment))
                .ToListAsync();
            var treatmentMap = treatments.ToDictionary(t => t.IdTreatment);

            var dto = _mapper.Map<ConsultationDTO>(entity);
            dto.ClientName = client?.Name;
            dto.ConsultationTreatments = entity.ConsultationTreatments.Select(ct =>
            {
                treatmentMap.TryGetValue(ct.IdTreatment, out var tr);
                return new ConsultationTreatmentDTO
                {
                    IdConsultationTreatment = ct.IdConsultationTreatment,
                    IdConsultation = ct.IdConsultation,
                    IdTreatment = ct.IdTreatment,
                    ToothNumber = ct.ToothNumber,
                    TreatmentCode = tr?.Code,
                    TreatmentDescription = tr?.Description,
                };
            }).ToList();

            return Ok(new ApiResponse { Data = dto });
        }

        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> Create([FromBody] ConsultationDTO model)
        {
            var entity = _mapper.Map<Consultation>(model);
            entity.IsActive = true;
            entity.IsDeleted = false;

            var result = await _repository.Add(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            if (model.ConsultationTreatments.Count > 0)
            {
                var ctEntities = model.ConsultationTreatments.Select(ct => new ConsultationTreatment
                {
                    IdConsultation = entity.IdConsultation,
                    IdTreatment = ct.IdTreatment,
                    ToothNumber = ct.ToothNumber,
                }).ToList();
                await _repository.AddRange(ctEntities);
            }

            var client = await _repository.FirstOrDefault<Client>(x => x.IdClient == entity.IdClient);
            var dto = _mapper.Map<ConsultationDTO>(entity);
            dto.ClientName = client?.Name;

            return Ok(new ApiResponse { Data = dto });
        }

        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> Update([FromBody] ConsultationDTO model)
        {
            var entity = await _repository.FirstOrDefault<Consultation>(
                x => x.IdConsultation == (model.IdConsultation ?? 0) && !(x.IsDeleted ?? false));

            if (entity == null)
                return NotFound(new ApiResponse());

            entity.ConsultationDate = model.ConsultationDate;
            entity.Reason = model.Reason;
            entity.CurrentCondition = model.CurrentCondition;
            entity.PhysicalExam = model.PhysicalExam;
            entity.Diagnosis = model.Diagnosis;
            entity.Treatment = model.Treatment;

            var result = await _repository.Update(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            // Replace consultation treatments: delete existing then insert new ones
            var existingCTs = await _repository.FindBy<ConsultationTreatment>(ct => ct.IdConsultation == entity.IdConsultation);
            if (existingCTs.Any())
                await _repository.RemoveRange(existingCTs);

            if (model.ConsultationTreatments.Count > 0)
            {
                var ctEntities = model.ConsultationTreatments.Select(ct => new ConsultationTreatment
                {
                    IdConsultation = entity.IdConsultation,
                    IdTreatment = ct.IdTreatment,
                    ToothNumber = ct.ToothNumber,
                }).ToList();
                await _repository.AddRange(ctEntities);
            }

            return Ok(new ApiResponse { Data = _mapper.Map<ConsultationDTO>(entity) });
        }

        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> Delete(int id)
        {
            var entity = await _repository.FirstOrDefault<Consultation>(
                x => x.IdConsultation == id && !(x.IsDeleted ?? false));

            if (entity == null)
                return NotFound(new ApiResponse());

            entity.IsDeleted = true;
            var result = await _repository.Update(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<ConsultationDTO>(entity) });
        }
    }
}
