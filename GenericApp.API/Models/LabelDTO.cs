namespace GenericApp.API.Models
{
    public class LabelDTO
    {
        public int IdLabel { get; set; }
        public string? Description { get; set; }
        public decimal? MaxBoxQuantity { get; set; }

        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
        public List<LabelTypeDTO>  LabelTypes { get; set; }
    }
}
