namespace GenericApp.API.Models
{
    public class ContractSignDTO
    {
        public int IdContractSign { get; set; } = 0;
        public string? Name { get; set; }
        public string? SignFileName { get; set; }
        public IFormFile? Sign { get; set; }
        public int IdCompany { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
