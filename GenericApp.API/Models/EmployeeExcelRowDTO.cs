namespace GenericApp.API.Models
{
    public class EmployeeExcelRowDTO
    {
        public int RowNumber { get; set; }
        public string? Clave { get; set; }
        public string? ApellidoPaterno { get; set; }
        public string? ApellidoMaterno { get; set; }
        public string? Nombre { get; set; }
        public string? LugarNacimiento { get; set; }
        public string? Direccion { get; set; }
        public string? Telefono { get; set; }
        public string? Ciudad { get; set; }
        public string? Estado { get; set; }
        public string? RFC { get; set; }
        public string? CURP { get; set; }
        public string? IMSS { get; set; }
        public string? Sexo { get; set; }
        public string? EstadoCivil { get; set; }
        public string? Puesto { get; set; }
        public string? FechaNacimiento { get; set; }
        public string? FechaIngreso { get; set; }
        public string? FechaBaja { get; set; }
        public string? CausaBaja { get; set; }
        public string? Activo { get; set; }
        public string? SalarioDiario { get; set; }
        public string? SalarioIntegrado { get; set; }
        public string? FormaDePago { get; set; }
        // Padres
        public string? Padre { get; set; }
        public string? FechaNacimientoPadre { get; set; }
        public string? PadreVive { get; set; }
        public string? Madre { get; set; }
        public string? FechaNacimientoMadre { get; set; }
        public string? MadreVive { get; set; }
        // Cónyuge
        public string? Conyugue { get; set; }
        public string? ConyugueFechaNacimiento { get; set; }
        public string? ConyugeVive { get; set; }
        // Hijos
        public string? Hijo1 { get; set; }
        public string? Hijo1FechaNacimiento { get; set; }
        public string? Hijo1Sexo { get; set; }
        public string? Hijo2 { get; set; }
        public string? Hijo2FechaNacimiento { get; set; }
        public string? Hijo2Sexo { get; set; }
        public string? Hijo3 { get; set; }
        public string? Hijo3FechaNacimiento { get; set; }
        public string? Hijo3Sexo { get; set; }
        public string? Hijo4 { get; set; }
        public string? Hijo4FechaNacimiento { get; set; }
        public string? Hijo4Sexo { get; set; }
        public string? Hijo5 { get; set; }
        public string? Hijo5FechaNacimiento { get; set; }
        public string? Hijo5Sexo { get; set; }
        public string? Hijo6 { get; set; }
        public string? Hijo6FechaNacimiento { get; set; }
        public string? Hijo6Sexo { get; set; }
        // Beneficiarios
        public string? Beneficiario1 { get; set; }
        public string? Parentesco1 { get; set; }
        public string? Porcentaje1 { get; set; }
        public string? Beneficiario2 { get; set; }
        public string? Parentesco2 { get; set; }
        public string? Porcentaje2 { get; set; }
        public string? Beneficiario3 { get; set; }
        public string? Parentesco3 { get; set; }
        public string? Porcentaje3 { get; set; }
        // Contacto de emergencia
        public string? ContactoEmergencia { get; set; }
        public string? ParentescoContacto { get; set; }
        public string? CelularContacto { get; set; }
        // Contrato
        public string? FechaInicioContrato { get; set; }
        public string? FechaVencimientoContrato { get; set; }
        // Extra
        public string? CodigoPostal { get; set; }
        public string? CorreoElectronico { get; set; }
        public string? CelularTrabajador { get; set; }
    }
}
