using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Label
    {
        public int IdLabel { get; set; }
        public string Description { get; set; }
        public decimal? MaxBoxQuantity { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
        [NotMapped]
        public ICollection<LabelType> LabelTypes { get; set; } = new List<LabelType>();
    }
}
