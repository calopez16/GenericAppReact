using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Shipment
    {
        public int IdShipment { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime EmbarqueDate { get; set; }
        public string? IdUser { get; set; }
        public int IdClient { get; set; }
        public string? Address { get; set; }
        public int? IdCity { get; set; }
        public bool? Mixed { get; set; }
        public int IdShipmentStatus { get; set; }
        public string? Comments { get; set; }
        public bool? IsDeleted { get; set; }
        public Client IdClientNavigation { get; set; }
        public City IdCityNavigation { get; set; }
        public ShipmentStatus ShipmentStatusNavigation { get; set; }
        public ICollection<Manifest> Manifests { get; set; } = new List<Manifest>();
    }
}
