using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Manifest
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
        public int IdManifestStatus { get; set; }
        public string? Comments { get; set; }
        public bool? IsDeleted { get; set; }
        public int? IdCompany { get; set; }
        public string? Empaque { get; set; }
        public string? RegFdaNo { get; set; }
        public string? TrackingCode { get; set; }
        public string? Chismografo { get; set; }
        public string? Stamps { get; set; }
        public string? GnnNumber { get; set; }

        public virtual Company? IdCompanyNavigation { get; set; }
        public virtual Shipment? IdShipmentNavigation { get; set; }
        public virtual ShippingCompany? IdShippingCompanyNavigation { get; set; }
        public virtual Season? IdSeasonNavigation { get; set; }
        public virtual Driver? IdDriverNavigation { get; set; }
        public virtual ManifestStatus? IdManifestStatusNavigation { get; set; }
        public virtual ICollection<ManifestPallet> ManifestPallets { get; set; } = new List<ManifestPallet>();
    }
}
