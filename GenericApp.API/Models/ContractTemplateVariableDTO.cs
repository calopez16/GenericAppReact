namespace GenericApp.API.Models
{
    public class ContractTemplateVariableDTO
    {
        public int IdContractTemplateVariable { get; set; }
        public string? Code { get; set; }
        public string? Description { get; set; }
        public string? Type { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
