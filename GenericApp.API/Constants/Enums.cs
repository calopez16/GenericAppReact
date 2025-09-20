namespace GenericApp.API.Constants
{
    public enum AppPolicies
    {
        Admin,
        User,
        IsDisabled,
        IsChangePasswordNeeded
    }

    public static class AppClaims
    {
        public static string IsAdmin { get; set; } = "IsAdmin";
        public static string IsUser { get; set; } = "IsUser";
        public static string IsDisabled { get; set; } = "IsDisabled";
        public static string IsChangePasswordNeeded { get; set; } = "IsChangePasswordNeeded";
    }
}
