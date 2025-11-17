using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class ManifestPallet
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
        public Manifest ManifestNavigation { get; set; } 
        public Label LabelNavigation { get; set; } 
        public ICollection<ManifestPalletLoading> ManifestPalletLoadings { get; set; } = new List<ManifestPalletLoading>();
    }
}
