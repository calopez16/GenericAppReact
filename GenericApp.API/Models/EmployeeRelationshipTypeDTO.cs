namespace GenericApp.API.Models
{
    public class EmployeeRelationshipTypeDTO
    {
        public int? IdEmployeeRelationshipType { get; set; }
        public string? Description { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
