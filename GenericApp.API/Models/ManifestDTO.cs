
namespace GenericApp.API.Models
{
    public class ManifestDTO
    {
        public int IdManifest { get; set; }
        public int IdShipment { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime ExitDate { get; set; }
        public decimal? TemperatureTrailerBoxF { get; set; }
        public decimal? TemperatureTrailerBoxC { get; set; }
        public int IdSeason { get; set; }
        public int IdDriver { get; set; }
        public string? TrailerPlate { get; set; }
        public string? TrailerBoxPlate { get; set; }
        public int IdShippingCompany { get; set; } 
        public string? Comments { get; set; }
        public bool? IsDeleted { get; set; }
        public ShipmentDTO ShipmentNavigation { get; set; }
        public DriverDTO DriverNavigation { get; set; }
        public ManifestStatusDTO ManifestStatusNavigation { get; set; }
        public List<ManifestPalletDTO> ManifestPallets { get; set; } = new List<ManifestPalletDTO>();
    }
}
