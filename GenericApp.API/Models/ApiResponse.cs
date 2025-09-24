namespace GenericApp.API.Models
{
    public class ApiResponse
    {
        public object? Data { get; set; }
        public object? Conflict { get; set; }
        public string? Message { get; set; }
    }
}
