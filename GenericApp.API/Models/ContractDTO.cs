using GenericApp.Data.Models;

namespace GenericApp.API.Models
{
    public class ContractDTO
    {
        public int IdContract { get; set; }
        public int IdEmployee { get; set; }
        public DateTime CreateDate { get; set; } = DateTime.Now;
        public DateTime? SignatureDate { get; set; }
        public string? DocumentName { get; set; }
        public string? VirtualPath { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
        public virtual CompanyDTO? IdCompanyNavigation { get; set; }
    }
}
