namespace GenericApp.API.Models
{
    public class TreatmentDTO
    {
        public int IdTreatment { get; set; }
        public string? Code { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
    }

    public class OralHygieneDTO
    {
        public int IdOralHygiene { get; set; }
        public string? Description { get; set; }
    }

    public class ConsultationTreatmentDTO
    {
        public int? IdConsultationTreatment { get; set; }
        public int IdConsultation { get; set; }
        public int IdTreatment { get; set; }
        public int? ToothNumber { get; set; }
        public string? TreatmentCode { get; set; }
        public string? TreatmentDescription { get; set; }
    }

    public class ConsultationCatalogOptionsDTO
    {
        public List<TreatmentDTO> Treatments { get; set; } = new();
        public List<OralHygieneDTO> OralHygienes { get; set; } = new();
    }
}
