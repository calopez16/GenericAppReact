using System;

namespace GenericApp.Data.Models
{
    public class MedicalNote
    {
        public int IdMedicalNote { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? NoteType { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? IdConsultation { get; set; }

        public virtual MedicalRecord? IdMedicalRecordNavigation { get; set; }
    }
}
