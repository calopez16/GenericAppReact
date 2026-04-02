using AutoMapper;
using GenericApp.API.Models;
using GenericApp.Data.Models;

namespace GenericApp.API.Utility
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Client, ClientDTO>()
                .ForMember(dest => dest.Gender, opt => opt.MapFrom(src => src.IdGenderNavigation != null ? src.IdGenderNavigation.Descripcion : null))
                .ForMember(dest => dest.MaritalStatus, opt => opt.MapFrom(src => src.IdMaritalStatusNavigation != null ? src.IdMaritalStatusNavigation.Description : null))
                .ReverseMap()
                .ForMember(dest => dest.IdGenderNavigation, opt => opt.Ignore())
                .ForMember(dest => dest.IdGender, opt => opt.Ignore())
                .ForMember(dest => dest.IdMaritalStatusNavigation, opt => opt.Ignore());
            CreateMap<City, CityDTO>().ReverseMap();
            CreateMap<Country, CountryDTO>().ReverseMap();
            CreateMap<State, StateDTO>().ReverseMap();
            CreateMap<Company, CompanyDTO>().ReverseMap();
            CreateMap<MedicalRecord, MedicalRecordDTO>().ReverseMap();
            CreateMap<Surgery, SurgeryDTO>().ReverseMap();
            CreateMap<Allergy, AllergyDTO>().ReverseMap();
            CreateMap<Disease, DiseaseDTO>().ReverseMap();
            CreateMap<Consultation, ConsultationDTO>().ReverseMap();
            CreateMap<Treatment, TreatmentDTO>().ReverseMap();
            CreateMap<OralHygiene, OralHygieneDTO>().ReverseMap();
            CreateMap<ConsultationTreatment, ConsultationTreatmentDTO>()
                .ForMember(dest => dest.TreatmentCode, opt => opt.MapFrom(src => src.IdTreatmentNavigation != null ? src.IdTreatmentNavigation.Code : null))
                .ForMember(dest => dest.TreatmentDescription, opt => opt.MapFrom(src => src.IdTreatmentNavigation != null ? src.IdTreatmentNavigation.Description : null))
                .ReverseMap()
                .ForMember(dest => dest.IdTreatmentNavigation, opt => opt.Ignore())
                .ForMember(dest => dest.IdConsultationNavigation, opt => opt.Ignore());
            // Map between blood pressure history entities and DTOs
            CreateMap<BloodPressureRecord, BloodPressureRecordDTO>().ReverseMap();
            // Map between medical note entities and DTOs
            CreateMap<MedicalNote, MedicalNoteDTO>().ReverseMap();
        }
    }
}
