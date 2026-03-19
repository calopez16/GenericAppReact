using System;

namespace GenericApp.Data.Models
{
    public class BloodPressureRecord
    {
        public int IdBloodPressureRecord { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? Value { get; set; }
        public DateTime RecordedAt { get; set; }
        public int? IdConsultation { get; set; }

        public virtual MedicalRecord? IdMedicalRecordNavigation { get; set; }
    }
}
