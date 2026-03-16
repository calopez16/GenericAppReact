using System;

namespace GenericApp.Data.Models
{
    public class Consultation
    {
        public int IdConsultation { get; set; }
        public int IdClient { get; set; }
        public DateTime ConsultationDate { get; set; }
        public string? Reason { get; set; }
        public string? CurrentCondition { get; set; }
        public string? PhysicalExam { get; set; }
        public string? Diagnosis { get; set; }
        public string? Treatment { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }

        public virtual Client? IdClientNavigation { get; set; }
    }
}
