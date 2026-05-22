namespace GenericApp.API.Models
{
    public class ContractSignedDTO
    {
        public int? IdContractSigned { get; set; }
        public int? IdContract { get; set; }
        public int? IdContractTemplate { get; set; }
        public ContractTemplateDTO? IdContractTemplateNavigation { get; set; }
    }
}
