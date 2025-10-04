using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class Parameter
    {
        public int IdParameter { get; set; }
        public string ParameterCode { get; set; }
        public string Description { get; set; }
        public string Value { get; set; }
    }
}
