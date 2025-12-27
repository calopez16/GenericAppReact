using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Shipment
    {
        public int IdShipment { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime ShipmentDate { get; set; }
        public string? IdUser { get; set; }
        public int IdClient { get; set; }
        public string? Address { get; set; }
        public int? IdCity { get; set; }
        public bool? Mixed { get; set; }
        public int IdShipmentStatus { get; set; }
        public string? Comments { get; set; }
        public bool? IsDeleted { get; set; }
        public int? IdCompany { get; set; }

        public virtual IdentityUser? IdUserNavigation { get; set; }
        public virtual Company? IdCompanyNavigation { get; set; }
        public virtual Client? IdClientNavigation { get; set; }
        public virtual City? IdCityNavigation { get; set; }
        public virtual ShipmentStatus? IdShipmentStatusNavigation { get; set; }
        public virtual ICollection<Manifest> Manifests { get; set; } = new List<Manifest>();
    }
}
