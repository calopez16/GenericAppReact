using System;
using System;

namespace GenericApp.API.Models
{
    public class MedicalNoteDTO
    {
        public int? IdMedicalNote { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? NoteType { get; set; }
        public string? Content { get; set; }
        public DateTime CreatedAt { get; set; }
        public int? IdConsultation { get; set; }
    }
}
