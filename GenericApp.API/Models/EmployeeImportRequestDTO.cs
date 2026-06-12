namespace GenericApp.API.Models
{
    public class EmployeeImportRequestDTO
    {
        public int IdCompany { get; set; }
        public List<EmployeeExcelRowDTO> Rows { get; set; } = new();
    }
}
