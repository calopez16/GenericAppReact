namespace GenericApp.API.Models
{
    public class StateDTO
    {
        public int IdState { get; set; }
        public string Description { get; set; }
        public int IdCountry { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
