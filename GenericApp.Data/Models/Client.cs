using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Client
    {
        public int IdClient { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public int? IdCity { get; set; }
        public string? Phone { get; set; }
        public string? Notes { get; set; }
        public DateTime BirthDate { get; set; }
        public string? Ocupation { get; set; }
        public string? Education { get; set; }
        public string? Profession { get; set; }
        public string? Religion { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
        public int? IdGender { get; set; }
        public int? IdMaritalStatus { get; set; }
        public bool Child { get; set; }
        public virtual MaritalStatus? IdMaritalStatusNavigation { get; set; }
        public virtual Gender? IdGenderNavigation { get; set; }
        public virtual Company? IdCompanyNavigation { get; set; }
        public virtual City? IdCityNavigation { get; set; }
    }
}
