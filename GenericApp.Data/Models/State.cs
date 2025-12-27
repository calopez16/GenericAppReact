using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class State
    {
        public int IdState { get; set; }
        public string Description { get; set; }
        public int IdCountry { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        [NotMapped]
        public Country IdCountryNavigation { get; set; }
        [NotMapped]
        public ICollection<City> Cities { get; set; } = new List<City>();
    }
}
