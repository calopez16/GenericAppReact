
namespace GenericApp.API.Models
{
   
    public class ShipmentDTO
    {
        public int? IdShipment { get; set; }
        public DateTime? CreationDate { get; set; }
        public DateTime? ShipmentDate { get; set; }
        public string? IdUser { get; set; }
        public int? IdClient { get; set; }
        public string? Address { get; set; }
        public int? IdCity { get; set; }
        public bool? Mixed { get; set; }
        public int? IdShipmentStatus { get; set; }
        public string? Comments { get; set; }
        public bool? IsDeleted { get; set; }
        public int? IdCompany { get; set; }
        public int? SeasonYear { get; set; }

        public ClientDTO? IdClientNavigation { get; set; }
        public CityDTO? IdCityNavigation { get; set; }
        public ShipmentStatusDTO? ShipmentStatusNavigation { get; set; }
        public List<ManifestDTO> Manifests { get; set; } = new List<ManifestDTO>();

    }
}
