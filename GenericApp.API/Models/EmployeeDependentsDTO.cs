namespace GenericApp.API.Models
{
    public class EmployeeDependentsDTO
    {
        public int? IdEmployeeDependents { get; set; }
        public int? IdEmployee { get; set; }
        public string? Name { get; set; }
        public string? LastName { get; set; }
        public DateTime? BirthDate { get; set; }
        public int? IdEmployeeRelationshipType { get; set; }
        public bool? IsAlive { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public EmployeeRelationshipTypeDTO? IdEmployeeRelationshipTypeNavigation { get; set; }
    }
}
