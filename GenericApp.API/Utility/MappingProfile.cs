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
            CreateMap<Season, SeasonDTO>().ReverseMap();
            CreateMap<ContractTemplate, ContractTemplateDTO>().ReverseMap();
            CreateMap<Employee, EmployeeDTO>().ReverseMap();
            CreateMap<EmployeeWorkInformation, EmployeeWorkInformationDTO>().ReverseMap();
            CreateMap<EmployeeBeneficiarie, EmployeeBeneficiarieDTO>().ReverseMap();
            CreateMap<EmployeeDependents, EmployeeDependentsDTO>().ReverseMap();
            CreateMap<EmployeeEmergencyContact, EmployeeEmergencyContactDTO>().ReverseMap();
            CreateMap<EmployeeRelationshipType, EmployeeRelationshipTypeDTO>().ReverseMap();
            CreateMap<Contract, ContractDTO>().ReverseMap();
        }
    }
}
