using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class ManifestPalletLoading
    {
        public int IdManifestPalletLoading { get; set; }
        public int IdManifestPallet { get; set; }
        public int IdManifest { get; set; }
        public int IdShipment { get; set; }
        public int IdLabelType { get; set; }
        public string? Description { get; set; }
        public decimal? BoxQuantity { get; set; }
        public bool? IsDeleted { get; set; }
        
        public virtual ManifestPallet? IdManifestPalletNavigation { get; set; }
        public virtual Manifest? IdManifestNavigation { get; set; }
        public virtual Shipment? IdShipmentNavigation { get; set; }
        public virtual LabelType? IdLabelTypeNavigation { get; set; }
    }
}
