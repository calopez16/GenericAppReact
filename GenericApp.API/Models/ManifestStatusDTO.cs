namespace GenericApp.API.Models
{
    public class ManifestStatusDTO
    {
        public int IdManifestStatus { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
