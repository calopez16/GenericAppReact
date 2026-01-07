namespace GenericApp.API.Models
{
    public class ManifestPalletLoadingDTO
    {
        public int? IdManifestPalletLoading { get; set; }
        public int? IdManifestPallet { get; set; }
        public int? IdLabelType { get; set; }
        public string? Description { get; set; }
        public decimal? BoxQuantity { get; set; }
        public bool? IsDeleted { get; set; }
        public ManifestPalletDTO? IdManifestPalletNavigation { get; set; }
        public LabelTypeDTO? IdLabelTypeNavigation { get; set; }
    }
}
