using System;

namespace GenericApp.Data.Models
{
    public class Surgery
    {
        public int IdSurgery { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? Description { get; set; }
        public DateTime? SurgeryDate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual MedicalRecord? IdMedicalRecordNavigation { get; set; }
    }
}
