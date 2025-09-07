
namespace GenericApp.Models
{
    public class LoginResponseDTO
    {
        public string Token { get; internal set; }
        public DateTime Expiration { get; internal set; }
    }
}
