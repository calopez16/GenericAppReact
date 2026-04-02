using System;
using System.Collections.Generic;

namespace GenericApp.Data.Models
{
    public class OralHygiene
    {
        public int IdOralHygiene { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
