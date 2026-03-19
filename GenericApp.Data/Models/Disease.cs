namespace GenericApp.Data.Models
{
    public class Disease
    {
        public int IdDisease { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? Description { get; set; }
        public string? Medications { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int? IdConsultation { get; set; }
        public DateTime? LastUpdatedAt { get; set; }

        public virtual MedicalRecord? IdMedicalRecordNavigation { get; set; }
    }
}
