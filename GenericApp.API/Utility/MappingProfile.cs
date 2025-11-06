using AutoMapper;
using GenericApp.API.Models;
using GenericApp.Data.Models;

namespace GenericApp.API.Utility
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {

            CreateMap<Client, ClientDTO>();
            CreateMap<ClientDTO, Client>();

            CreateMap<Company, CompanyDTO>();
            CreateMap<CompanyDTO, Company>();
        }
    }
}
