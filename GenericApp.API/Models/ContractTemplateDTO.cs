namespace GenericApp.API.Models
{
    public class ContractTemplateDTO
    {
        public int? IdTemplate { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Content { get; set; }
        public bool? IsHeaderEnable { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int? IdCompany { get; set; }
        public List<int>? ContractSignIds { get; set; }
    }
}
