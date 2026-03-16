namespace GenericApp.API.Models
{
    public class MedicalRecordDTO
    {
        public int? IdMedicalRecord { get; set; }
        public int IdClient { get; set; }
        public string? BloodType { get; set; }
        public string? SmokingHabit { get; set; }
        public string? AlcoholHabit { get; set; }
        public string? DrugHabit { get; set; }
        public string? BloodPressure { get; set; }
        public bool? IsPregnant { get; set; }
        public int? PregnancyMonths { get; set; }
        public string? DiabetesStatus { get; set; }
        public string? DiabetesNotes { get; set; }
        public string? CancerStatus { get; set; }
        public string? CancerNotes { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public List<SurgeryDTO> Surgeries { get; set; } = new();
        public List<AllergyDTO> Allergies { get; set; } = new();
        public List<DiseaseDTO> Diseases { get; set; } = new();
    }
}
