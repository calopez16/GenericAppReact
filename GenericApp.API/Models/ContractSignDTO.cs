using System.ComponentModel.DataAnnotations;

namespace GenericApp.API.Models
{
    public class ContractSignDTO
    {
        public int IdContractSign { get; set; } = 0;
        [Required, StringLength(150)]
        public string? Name { get; set; }
        public string? SignFileName { get; set; }
        public IFormFile? Sign { get; set; }
        public int IdCompany { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? IsEmployee { get; set; } = true;
        public string? SignBase64 { get; set; }
        public bool RemoveSign { get; set; }
    }
}
