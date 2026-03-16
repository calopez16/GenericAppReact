namespace GenericApp.Data.Models
{
    public class Allergy
    {
        public int IdAllergy { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual MedicalRecord? IdMedicalRecordNavigation { get; set; }
    }
}
