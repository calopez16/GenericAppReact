using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Client
    {
        public int IdClient { get; set; }
        public string Name { get; set; }
        public string Rfc { get; set; }
        public string Address { get; set; }
        public int IdCity { get; set; }
        public string PostalCode { get; set; }
        public string Phone { get; set; }
        public string Notes { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
    }
}
