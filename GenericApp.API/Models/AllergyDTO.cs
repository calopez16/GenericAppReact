namespace GenericApp.API.Models
{
    public class AllergyDTO
    {
        public int? IdAllergy { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
