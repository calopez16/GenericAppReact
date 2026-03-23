namespace GenericApp.API.Models
{
    public class MaritalStatusOptionDTO
    {
        public int IdMaritalStatus { get; set; }
        public string Description { get; set; } = string.Empty;
    }

    public class ClientCatalogOptionsDTO
    {
        public List<string> Genders { get; set; } = new();
        public List<MaritalStatusOptionDTO> MaritalStates { get; set; } = new();
    }
}
