using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class EmployeeBeneficiarie
    {
        public int IdEmployeeBeneficiarie { get; set; }
        public int IdEmployee { get; set; }
        public string? Name { get; set; }
        public int? IdEmployeeRelationshipType { get; set; }
        public decimal? Percentage { get; set; }        
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Employee IdEmployeeNavigation { get; set; }
        public virtual EmployeeRelationshipType? IdEmployeeRelationshipTypeNavigation { get; set; }
    }
}
