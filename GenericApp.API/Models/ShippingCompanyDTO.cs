namespace GenericApp.API.Models
{
    public class ShippingCompanyDTO
    {
        public int IdShippingCompany { get; set; }
        public string Name { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
    }
}
