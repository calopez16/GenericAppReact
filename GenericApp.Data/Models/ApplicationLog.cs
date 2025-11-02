using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class ApplicationLog
    {
        public int IdApplicationLog { get; set; }
        public DateTime Date { get; set; }
        public string IdAspNetUsers { get; set; }
        public string UserName { get; set; }
        public string Module { get; set; }
        public int IdDataAffected { get; set; }
        public string Description { get; set; }
        public string Details { get; set; }
        public string Details2 { get; set; }
    }
}
