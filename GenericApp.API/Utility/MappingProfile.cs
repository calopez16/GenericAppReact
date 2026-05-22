using AutoMapper;
using GenericApp.API.Models;
using GenericApp.Data.Models;
using GenericApp.Models;

namespace GenericApp.API.Utility
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Parameter, ParameterDTO>().ReverseMap();
            CreateMap<Client, ClientDTO>().ReverseMap();
            CreateMap<City, CityDTO>().ReverseMap();
            CreateMap<Country, CountryDTO>().ReverseMap();
            CreateMap<State, StateDTO>().ReverseMap();
            CreateMap<Company, CompanyDTO>().ReverseMap();
            CreateMap<Driver, DriverDTO>().ReverseMap();
            CreateMap<Season, SeasonDTO>().ReverseMap();
            CreateMap<ContractTemplate, ContractTemplateDTO>().ReverseMap();
            
        }
    }
}
