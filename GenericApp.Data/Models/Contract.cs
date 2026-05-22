using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Contract
    {
        public int IdContract { get; set; }
        public int IdEmployee { get; set; }
        public DateTime SignatureDate { get; set; }
        public string? DocumentName { get; set; }
        public string? VirtualPath { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
        public virtual Company? IdCompanyNavigation { get; set; }
        public List<ContractSigned> ContractSigned { get; set; }
    }
}
