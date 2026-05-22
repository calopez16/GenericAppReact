namespace GenericApp.API.Models
{
    public class EmployeeBeneficiarieDTO
    {
        public int? IdEmployeeBeneficiarie { get; set; }
        public int? IdEmployee { get; set; }
        public string? Name { get; set; }
        public int? IdEmployeeRelationshipType { get; set; }
        public decimal? Percentage { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public EmployeeRelationshipTypeDTO? IdEmployeeRelationshipTypeNavigation { get; set; }
    }
}
