namespace GenericApp.API.Models
{
    public class SeasonDTO
    {
        public int IdSeason { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime InitialDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool? IsClosed { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int IdCompany { get; set; }
    }
}
