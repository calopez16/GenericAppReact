using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class ContractSign
    {

        public int IdContractSign { get; set; }
        public string? Name { get; set; }
        public string? SignFileName { get; set; }
        public int? IdCompany { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public virtual Company? IdCompanyNavigation { get; set; }
    }
}
