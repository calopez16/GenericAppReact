using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class LabelType
    {
        public int IdLabelType { get; set; }
        public int IdLabel { get; set; }
        public string Description { get; set; }
        public int MaxBoxQuantity { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public Label IdLabelNavigation { get; set; }
    }
}
