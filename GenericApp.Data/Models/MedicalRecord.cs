using System;
using System.Collections.Generic;

namespace GenericApp.Data.Models
{
    public class MedicalRecord
    {
        public int IdMedicalRecord { get; set; }
        public int IdClient { get; set; }
        public string? BloodType { get; set; }
        public string? SmokingHabit { get; set; }
        public string? AlcoholHabit { get; set; }
        public string? DrugHabit { get; set; }
        public string? BloodPressure { get; set; }
        public bool? IsPregnant { get; set; }
        public int? PregnancyMonths { get; set; }
        public string? DiabetesStatus { get; set; }
        public string? DiabetesNotes { get; set; }
        public string? CancerStatus { get; set; }
        public string? CancerNotes { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Client? IdClientNavigation { get; set; }
        public virtual ICollection<Surgery> Surgeries { get; set; } = new List<Surgery>();
        public virtual ICollection<Allergy> Allergies { get; set; } = new List<Allergy>();
        public virtual ICollection<Disease> Diseases { get; set; } = new List<Disease>();
    }
}
