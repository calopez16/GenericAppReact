using GenericApp.Data.Models;

namespace GenericApp.API.Models
{
    public class ClientDTO
    {
        public int? IdClient { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public int? IdCity { get; set; }
        public string? Phone { get; set; }
        public string? Notes { get; set; }
        public DateTime BirthDate { get; set; }
        public int? IdMaritalStatus { get; set; }
        public string? MaritalStatus { get; set; }
        public string? Ocupation { get; set; }
        public string? Education { get; set; }
        public string? Profession { get; set; }
        public string? Religion { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
        public CityDTO? IdCityNavigation { get; set; }
        public string? Gender { get; set; }
        public bool Child { get; set; }
    }
}
