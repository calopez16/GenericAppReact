namespace GenericApp.API.Models
{
    public class EmployeeEmergencyContactDTO
    {
        public int? IdEmployeeEmergencyContact { get; set; }
        public int? IdEmployee { get; set; }
        public string? Name { get; set; }
        public int? IdEmployeeRelationshipType { get; set; }
        public string? Phone { get; set; }
        public DateTime? BirthDate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public EmployeeRelationshipTypeDTO? IdEmployeeRelationshipTypeNavigation { get; set; }

    }
}
