using GenericApp.Data.Models;

namespace GenericApp.API.Models
{
    public class ConfigurationDTO
    {
        public bool? IsMultilaguageEnable { get; set; }
        public string? DefaultLanguage { get; set; }
        public bool? IsChooseThemeEnable { get; set; }
        public string? DefaultTheme { get; set; }
        public bool? IsMultiCompanyEnable { get; set; }
    }
}
