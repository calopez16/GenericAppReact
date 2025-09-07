
namespace GenericApp.Models
{
    public class LoginResponseDTO
    {
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string RoleName { get; set; }
        public string Token { get; internal set; }
    }
}
