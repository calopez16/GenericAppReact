namespace GenericApp.API.Models
{
    public class ApiResponse
    {
        public bool Success { get; set; }
        public object? Data { get; set; }
        public object? Conflict { get; set; }
        public string? Message { get; set; }
    }
}
