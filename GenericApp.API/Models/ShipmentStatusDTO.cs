namespace GenericApp.API.Models
{
    public class ShipmentStatusDTO
    {
        public int? IdShipmentStatus { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
