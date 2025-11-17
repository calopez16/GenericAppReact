using System;
using System.Collections.Generic;
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
        public ManifestPallet ManifestPalletNavigation { get; set; }
        public LabelType LabelTypeNavigation { get; set; }
    }
}
