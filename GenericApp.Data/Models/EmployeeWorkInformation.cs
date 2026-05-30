using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class EmployeeWorkInformation
    {
        public int IdEmployeeWorkInformation { get; set; }
        public int IdEmployee { get; set; }
        public decimal DailySalary { get; set; }
        public decimal IntegralSalary { get; set; }
        public string? PayType { get; set; }
        public DateTime InitialDate { get; set; }
        public DateTime ContractExpiration { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public virtual Employee IdEmployeeNavigation { get; set; }
    }
}
