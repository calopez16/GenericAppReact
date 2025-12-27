using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class UserDetail
    {
        public int IdUserDetail { get; set; }
        [Required]
        public string? IdUser { get; set; }
        [Required]
        public int? IdCompany { get; set; }
    }
}
