
namespace GenericApp.API.Models
{
    public class ManifestPalletDTO
    {
        public int IdManifestPallet { get; set; }
        public int IdManifest { get; set; } 
        public int IdShipment { get; set; } 
        public int IdLabel { get; set; }       
        public decimal? MaxBoxQuantity { get; set; }
        public int Position { get; set; }
        public decimal? TemperatureF { get; set; }
        public decimal? TemperatureC { get; set; }
        public string? Comments { get; set; }
        public bool? IsDeleted { get; set; }
        public ManifestDTO ManifestNavigation { get; set; }
        public LabelDTO LabelNavigation { get; set; }
        public List<ManifestPalletLoadingDTO> ManifestPalletLoadings { get; set; } = new List<ManifestPalletLoadingDTO>();
    }
}
