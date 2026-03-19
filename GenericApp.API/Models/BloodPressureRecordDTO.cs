using System;
using System;

namespace GenericApp.API.Models
{
    public class BloodPressureRecordDTO
    {
        public int? IdBloodPressureRecord { get; set; }
        public int IdMedicalRecord { get; set; }
        public string? Value { get; set; }
        public DateTime RecordedAt { get; set; }
        public int? IdConsultation { get; set; }
    }
}
