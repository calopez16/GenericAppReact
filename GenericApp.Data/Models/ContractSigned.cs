using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class ContractSigned
    {
        public int IdContractSigned { get; set; }
        public int IdContract { get; set; }
        public int IdContractTemplate { get; set; }

        public Contract IdContractNavigation { get; set; }
        public ContractTemplate IdContractTemplateNavigation { get; set; }
    }
}
