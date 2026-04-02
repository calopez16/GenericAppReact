using System;

namespace GenericApp.Data.Models
{
    public class ConsultationTreatment
    {
        public int IdConsultationTreatment { get; set; }
        public int IdConsultation { get; set; }
        public int IdTreatment { get; set; }
        public int? ToothNumber { get; set; }

        public virtual Consultation? IdConsultationNavigation { get; set; }
        public virtual Treatment? IdTreatmentNavigation { get; set; }
    }
}
