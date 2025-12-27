
using GenericApp.API.Models;

namespace GenericApp.Models
{
    public class LoginResponseDTO
    {
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public List<string>? Roles { get; set; }
        public string? Token { get; internal set; }
        public int? IdCompany { get; set; }
        public CompanyDTO Company { get; set; }
        public bool IsChangePasswordNeeded { get; set; }
    }
}
