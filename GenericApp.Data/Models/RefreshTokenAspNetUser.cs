using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data.Models
{
    public class RefreshTokenAspNetUser
    {
        public int IdRefreshTokenAspNetUser { get; set; }
        public DateTime CreationDate { get; set; }
        [Required]
        public string? IdUser { get; set; }
        [Required]
        public string? RefreshToken { get; set; }
        public bool? IsActive { get; set; }
    }
}
