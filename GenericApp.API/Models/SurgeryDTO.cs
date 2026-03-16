namespace GenericApp.API.Models
{
    public class SurgeryDTO
    {
        public int? IdSurgery { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? Description { get; set; }
        public DateTime? SurgeryDate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
