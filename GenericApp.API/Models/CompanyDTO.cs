namespace GenericApp.API.Models
{
    public class CompanyDTO
    {
        public int IdCompany { get; set; }
        public string Name { get; set; }
        public string Rfc { get; set; }
        public string Address { get; set; }
        public string PostalCode { get; set; }
        public string Phone { get; set; }
        public string Notes { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
