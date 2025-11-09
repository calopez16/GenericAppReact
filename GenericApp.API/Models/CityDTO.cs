namespace GenericApp.API.Models
{
    public class CityDTO
    {
        public int IdCity { get; set; }
        public string? Description { get; set; }
        public int IdState { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public StateDTO? IdStateNavigation { get; set; }
    }
}
