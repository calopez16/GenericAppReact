using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class ContractTemplateContractSign
    {
        public int IdContractTemplateContractSign { get; set; }
        public int IdContractSign { get; set; }
        public int IdContractTemplate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public virtual ContractSign? IdContractSignNavigation{ get; set; }
        public virtual ContractTemplate? IdContractTemplateNavigation { get; set; }
    }
}
