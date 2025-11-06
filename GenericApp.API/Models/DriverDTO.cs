namespace GenericApp.API.Models
{
    public class DriverDTO
    {
        public int IdDriver { get; set; }
        public string Name { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
    }
}
