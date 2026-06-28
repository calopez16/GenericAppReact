namespace GenericApp.API.Models
{
    public class ContractTemplateContractSignDTO
    {
        public int IdContractTemplateContractSign { get; set; }
        public int IdContractSign { get; set; }
        public int IdContractTemplate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
