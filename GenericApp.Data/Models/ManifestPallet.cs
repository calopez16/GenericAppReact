using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class ManifestPallet
    {
        public int IdManifestPallet { get; set; }
        public int IdManifest { get; set; }
        public int IdLabel { get; set; }
        public decimal? MaxBoxQuantity { get; set; }
        public int Position { get; set; }
        public decimal? TemperatureF { get; set; }
        public decimal? TemperatureC { get; set; }
        public string? Comments { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? Chismografo { get; set; }
        public virtual Shipment? IdShipmentNavigation { get; set; }
        public virtual Manifest? IdManifestNavigation { get; set; }
        public virtual Label? IdLabelNavigation { get; set; }
        public virtual ICollection<ManifestPalletLoading> ManifestPalletLoadings { get; set; } = new List<ManifestPalletLoading>();
    }
}
