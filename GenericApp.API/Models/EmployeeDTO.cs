namespace GenericApp.API.Models
{
    public class EmployeeDTO
    {
        public int? IdEmployee { get; set; }
        public int? Clave { get; set; }
        public string? ApellidoPaterno { get; set; }
        public string? ApellidoMaterno { get; set; }
        public string? Nombre { get; set; }
        public string? Address { get; set; }
        public string? RFC { get; set; }
        public string? CURP { get; set; }
        public string? IMSS { get; set; }
        public string? Genre { get; set; }
        public string? CivilStatus { get; set; }
        public string? Position { get; set; }
        public DateTime? BirthDate { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public int? IdCompany { get; set; }
        public CompanyDTO? IdCompanyNavigation { get; set; }
        public List<ContractDTO>? Contracts { get; set; }
        public List<EmployeeWorkInformationDTO>? EmployeeWorkInformations { get; set; }
        public List<EmployeeBeneficiarieDTO>? Beneficiaries { get; set; }
        public List<EmployeeDependentsDTO>? Dependents { get; set; }
        public List<EmployeeEmergencyContactDTO>? EmployeeEmergencyContacts { get; set; }
    }
}
