
using GenericApp.Data.Models;

namespace GenericApp.API.Models
{
    public class ManifestDTO
    {
        public int? IdManifest { get; set; }
        public int? ManifestNo { get; set; }
        public int? ShipmentNo { get; set; }
        public int? IdShipment { get; set; }
        public DateTime? CreationDate { get; set; }
        public string? ExitDate { get; set; }
        public decimal? TemperatureTrailerBoxF { get; set; }
        public decimal? TemperatureTrailerBoxC { get; set; }
        public int? IdSeason { get; set; }
        public int? IdDriver { get; set; }
        public string? TrailerPlate { get; set; }
        public string? TrailerBoxPlate { get; set; }
        public int? IdShippingCompany { get; set; } 
        public string? Comments { get; set; }
        public bool? IsDeleted { get; set; }
        public int? IdCompany { get; set; }
        public int? SeasonYear { get; set; }
        public string? Empaque { get; set; }
        public string? RegFdaNo { get; set; }
        public string? TrackingCode { get; set; }
        public string? Chismografo { get; set; }
        public string? Stamps { get; set; }
        public string? GnnNumber { get; set; }

        public virtual CompanyDTO? IdCompanyNavigation { get; set; }
        public virtual ShipmentDTO? IdShipmentNavigation { get; set; }
        public virtual ShippingCompanyDTO? IdShippingCompanyNavigation { get; set; }
        public virtual SeasonDTO? IdSeasonNavigation { get; set; }
        public virtual DriverDTO? IdDriverNavigation { get; set; }
        public virtual ManifestStatusDTO? IdManifestStatusNavigation { get; set; }
        public List<ManifestPalletDTO> ManifestPallets { get; set; } = new List<ManifestPalletDTO>();
    }
}
