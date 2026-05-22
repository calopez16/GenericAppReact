namespace GenericApp.API.Models
{
    public class EmployeeWorkInformationDTO
    {
        public int? IdEmployeeWorkInformation { get; set; }
        public int? IdEmployee { get; set; }
        public decimal? DailySalary { get; set; }
        public decimal? IntegralSalary { get; set; }
        public string? PayType { get; set; }
        public DateTime? InitialDate { get; set; }
        public DateTime? ContractExpiration { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
