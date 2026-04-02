using System;
using System.Collections.Generic;

namespace GenericApp.Data.Models
{
    public class Treatment
    {
        public int IdTreatment { get; set; }
        public string? Code { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual ICollection<ConsultationTreatment> ConsultationTreatments { get; set; } = new List<ConsultationTreatment>();
    }
}
