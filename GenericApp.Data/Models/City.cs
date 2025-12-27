using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class City
    {
        public int IdCity { get; set; }
        public string? Description { get; set; }
        public int IdState { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public virtual State? IdStateNavigation { get; set; }
        public virtual List<Client> Clients { get; set; } = new List<Client>();
    }
}
