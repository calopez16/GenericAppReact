using AutoMapper;
using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("medical-records")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class MedicalRecordsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        public MedicalRecordsController(IRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet("client/{clientId}")]
        public async Task<ActionResult> GetByClientId(int clientId)
        {
            var record = await _repository.FirstOrDefault<MedicalRecord>(
                x => x.IdClient == clientId && !(x.IsDeleted ?? false),
                x => x.Surgeries,
                x => x.Allergies,
                x => x.Diseases,
                x => x.BloodPressureRecords,
                x => x.MedicalNotes);

            if (record == null)
                return Ok(new ApiResponse { Data = null });

            var dto = _mapper.Map<MedicalRecordDTO>(record);
            dto.Surgeries = record.Surgeries
                .Where(s => !(s.IsDeleted ?? false))
                .Select(s => _mapper.Map<SurgeryDTO>(s))
                .ToList();
            dto.Allergies = record.Allergies
                .Where(a => !(a.IsDeleted ?? false))
                .Select(a => _mapper.Map<AllergyDTO>(a))
                .ToList();
            dto.Diseases = record.Diseases
                .Where(d => !(d.IsDeleted ?? false))
                .Select(d => _mapper.Map<DiseaseDTO>(d))
                .ToList();
            dto.BloodPressureRecords = record.BloodPressureRecords
                .OrderByDescending(b => b.RecordedAt)
                .Select(b => _mapper.Map<BloodPressureRecordDTO>(b))
                .ToList();
            dto.MedicalNotes = record.MedicalNotes
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => _mapper.Map<MedicalNoteDTO>(n))
                .ToList();

            return Ok(new ApiResponse { Data = dto });
        }

        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> Create([FromBody] MedicalRecordDTO model)
        {
            var exists = await _repository.FirstOrDefault<MedicalRecord>(
                x => x.IdClient == model.IdClient && !(x.IsDeleted ?? false));

            if (exists != null)
                return Conflict(new ApiResponse { Conflict = "A medical record already exists for this client." });

            var entity = _mapper.Map<MedicalRecord>(model);
            entity.Surgeries = new List<Surgery>();
            entity.Allergies = new List<Allergy>();
            entity.Diseases = new List<Disease>();
            entity.IsActive = true;
            entity.IsDeleted = false;

            var result = await _repository.Add(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<MedicalRecordDTO>(entity) });
        }

        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> Update([FromBody] MedicalRecordDTO model, [FromQuery] int? consultationId = null)
        {
            var entity = await _repository.FirstOrDefault<MedicalRecord>(
                x => x.IdMedicalRecord == (model.IdMedicalRecord ?? 0) && !(x.IsDeleted ?? false));

            if (entity == null)
                return NotFound(new ApiResponse());

            var lifestyleChanged =
                !string.Equals(entity.SmokingHabit, model.SmokingHabit, StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(entity.AlcoholHabit, model.AlcoholHabit, StringComparison.OrdinalIgnoreCase) ||
                !string.Equals(entity.DrugHabit, model.DrugHabit, StringComparison.OrdinalIgnoreCase);

            entity.BloodType = model.BloodType;
            entity.SmokingHabit = model.SmokingHabit;
            entity.AlcoholHabit = model.AlcoholHabit;
            entity.DrugHabit = model.DrugHabit;
            entity.BloodPressure = model.BloodPressure;
            entity.IsPregnant = model.IsPregnant;
            entity.PregnancyMonths = model.PregnancyMonths;
            entity.DiabetesStatus = model.DiabetesStatus;
            entity.DiabetesNotes = model.DiabetesNotes;
            entity.CancerStatus = model.CancerStatus;
            entity.CancerNotes = model.CancerNotes;

            if (lifestyleChanged)
            {
                entity.LifestyleLastUpdated = DateTime.UtcNow;
                entity.LifestyleLastUpdatedConsultationId = consultationId;
            }

            var result = await _repository.Update(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<MedicalRecordDTO>(entity) });
        }

        // --- Surgery sub-endpoints ---
        [HttpPost("{medicalRecordId}/surgeries")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddSurgery(int medicalRecordId, [FromBody] SurgeryDTO model, [FromQuery] int? consultationId = null)
        {
            var record = await _repository.GetById<MedicalRecord>(medicalRecordId);
            if (record == null)
                return NotFound(new ApiResponse());

            var entity = _mapper.Map<Surgery>(model);
            entity.IdMedicalRecord = medicalRecordId;
            entity.IsActive = true;
            entity.IsDeleted = false;
            entity.IdConsultation = consultationId;

            var result = await _repository.Add(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<SurgeryDTO>(entity) });
        }

        [HttpDelete("{medicalRecordId}/surgeries/{surgeryId}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteSurgery(int medicalRecordId, int surgeryId)
        {
            var entity = await _repository.FirstOrDefault<Surgery>(
                x => x.IdSurgery == surgeryId && x.IdMedicalRecord == medicalRecordId && !(x.IsDeleted ?? false));

            if (entity == null)
                return NotFound(new ApiResponse());

            entity.IsDeleted = true;
            var result = await _repository.Update(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<SurgeryDTO>(entity) });
        }

        // --- Allergy sub-endpoints ---
        [HttpPost("{medicalRecordId}/allergies")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddAllergy(int medicalRecordId, [FromBody] AllergyDTO model, [FromQuery] int? consultationId = null)
        {
            var record = await _repository.GetById<MedicalRecord>(medicalRecordId);
            if (record == null)
                return NotFound(new ApiResponse());

            var entity = _mapper.Map<Allergy>(model);
            entity.IdMedicalRecord = medicalRecordId;
            entity.IsActive = true;
            entity.IsDeleted = false;
            entity.IdConsultation = consultationId;

            var result = await _repository.Add(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<AllergyDTO>(entity) });
        }

        [HttpDelete("{medicalRecordId}/allergies/{allergyId}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteAllergy(int medicalRecordId, int allergyId)
        {
            var entity = await _repository.FirstOrDefault<Allergy>(
                x => x.IdAllergy == allergyId && x.IdMedicalRecord == medicalRecordId && !(x.IsDeleted ?? false));

            if (entity == null)
                return NotFound(new ApiResponse());

            entity.IsDeleted = true;
            var result = await _repository.Update(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<AllergyDTO>(entity) });
        }

        // --- Disease sub-endpoints ---
        [HttpPost("{medicalRecordId}/diseases")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddDisease(int medicalRecordId, [FromBody] DiseaseDTO model, [FromQuery] int? consultationId = null)
        {
            var record = await _repository.GetById<MedicalRecord>(medicalRecordId);
            if (record == null)
                return NotFound(new ApiResponse());

            var entity = _mapper.Map<Disease>(model);
            entity.IdMedicalRecord = medicalRecordId;
            entity.IsActive = true;
            entity.IsDeleted = false;
            entity.IdConsultation = consultationId;
            entity.LastUpdatedAt = DateTime.UtcNow;

            var result = await _repository.Add(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<DiseaseDTO>(entity) });
        }

        [HttpPut("{medicalRecordId}/diseases/{diseaseId}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> UpdateDisease(int medicalRecordId, int diseaseId, [FromBody] DiseaseDTO model, [FromQuery] int? consultationId = null)
        {
            var entity = await _repository.FirstOrDefault<Disease>(
                x => x.IdDisease == diseaseId && x.IdMedicalRecord == medicalRecordId && !(x.IsDeleted ?? false));

            if (entity == null)
                return NotFound(new ApiResponse());

            entity.Description = model.Description;
            entity.Medications = model.Medications;
            entity.IsActive = model.IsActive;
            entity.IdConsultation = consultationId;
            entity.LastUpdatedAt = DateTime.UtcNow;

            var result = await _repository.Update(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<DiseaseDTO>(entity) });
        }

        [HttpDelete("{medicalRecordId}/diseases/{diseaseId}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteDisease(int medicalRecordId, int diseaseId)
        {
            var entity = await _repository.FirstOrDefault<Disease>(
                x => x.IdDisease == diseaseId && x.IdMedicalRecord == medicalRecordId && !(x.IsDeleted ?? false));

            if (entity == null)
                return NotFound(new ApiResponse());

            entity.IsDeleted = true;
            var result = await _repository.Update(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<DiseaseDTO>(entity) });
        }

        // --- Blood pressure history ---
        [HttpGet("{medicalRecordId}/blood-pressure")]
        public async Task<ActionResult> GetBloodPressureHistory(int medicalRecordId)
        {
            var record = await _repository.FirstOrDefault<MedicalRecord>(
                x => x.IdMedicalRecord == medicalRecordId && !(x.IsDeleted ?? false),
                x => x.BloodPressureRecords);

            if (record == null)
                return NotFound(new ApiResponse());

            var list = record.BloodPressureRecords
                .OrderByDescending(x => x.RecordedAt)
                .Select(x => _mapper.Map<BloodPressureRecordDTO>(x))
                .ToList();

            return Ok(new ApiResponse { Data = list });
        }

        [HttpPost("{medicalRecordId}/blood-pressure")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddBloodPressureRecord(int medicalRecordId, [FromBody] BloodPressureRecordDTO model, [FromQuery] int? consultationId = null)
        {
            var record = await _repository.GetById<MedicalRecord>(medicalRecordId);
            if (record == null)
                return NotFound(new ApiResponse());

            var entity = _mapper.Map<BloodPressureRecord>(model);
            entity.IdMedicalRecord = medicalRecordId;
            entity.RecordedAt = model.RecordedAt == default ? DateTime.UtcNow : model.RecordedAt;
            entity.IdConsultation = consultationId;

            var result = await _repository.Add(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<BloodPressureRecordDTO>(entity) });
        }

        // --- Notes ---
        [HttpPost("{medicalRecordId}/notes")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddNote(int medicalRecordId, [FromBody] MedicalNoteDTO model, [FromQuery] int? consultationId = null)
        {
            try
            {   var record = await _repository.GetById<MedicalRecord>(medicalRecordId);
            if (record == null)
                return NotFound(new ApiResponse());

            var entity = _mapper.Map<MedicalNote>(model);
            entity.IdMedicalRecord = medicalRecordId;
            entity.CreatedAt = DateTime.UtcNow;
            entity.IdConsultation = consultationId;

            var result = await _repository.Add(entity);
            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<MedicalNoteDTO>(entity) });

            }
            catch (Exception ex)
            {

                throw;
            }
         
        }
    }
}
