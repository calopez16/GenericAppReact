namespace GenericApp.API.Models
{
    public class CreateContractDTO
    {
        public int IdEmployee { get; set; }
        public int IdCompany { get; set; }
        public List<int> TemplateIds { get; set; } = new List<int>();
        public string? SignatureBase64 { get; set; }
        public string? SignatureString { get; set; }
    }
}
