namespace GenericApp.API.Models
{
    public class CountryDTO
    {
        public int? IdCountry { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
