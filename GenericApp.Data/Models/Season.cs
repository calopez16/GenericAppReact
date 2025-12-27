using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Season
    {
        public int IdSeason { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime InitialDate{ get; set; }
        public DateTime EndDate{ get; set; }
        public bool? IsClosed { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }

        public virtual Company? IdCompanyNavigation { get; set; }

    }
}
