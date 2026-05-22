using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class EmployeeDependents
    {
        public int IdEmployeeDependents { get; set; }
        public int IdEmployee { get; set; }
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public DateTime? BirthDate { get; set; }
        public int? IdEmployeeRelationshipType { get; set; }
        public bool IsAlive { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public virtual Employee IdEmployeeNavigation { get; set; }
        public virtual EmployeeRelationshipType? IdEmployeeRelationshipTypeNavigation { get; set; }

    }
}
