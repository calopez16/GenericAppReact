namespace GenericApp.API.Models
{
    public class DiseaseDTO
    {
        public int? IdDisease { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? Description { get; set; }
        public string? Medications { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
