namespace GenericApp.API.Models
{
    public class LabelTypeDTO
    {
        public int? IdLabelType { get; set; }
        public int? IdLabel { get; set; }
        public string? Description { get; set; }
        public string? Size { get; set; }
        public List<string>? Sizes { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public LabelDTO? IdLabelNavigation { get; set; }
    }
}
