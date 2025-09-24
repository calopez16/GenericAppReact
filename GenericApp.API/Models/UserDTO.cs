namespace GenericApp.API.Models
{
    public class UserDTO
    {
        public string? UserNameId { get; set; }
        public string? UserName { get; set; }
        public string? Email { get; set; }
        public string? RoleName { get; set; }
        public string? NewPassword { get; set; }
        public bool? IsDisabled { get; set; }
        public List<UserClaimDTO>? Claims { get; set; }
        public List<string>? Roles { get; set; }
    }
}
