namespace GenericApp.API.Models
{
    public class EmbarquesTemporadaDTO
    {
        public int SeasonYear { get; set; }
        public int TotalEmbarques { get; set; }
    }

    public class NumeroCajasDTO
    {
        public int TotalCajas { get; set; }
        public int TotalViajes { get; set; }
    }

    public class UltimoViajeDTO
    {
        public int TotalCajas { get; set; }
        public string NumeroViaje { get; set; }
    }

    public class TemperaturaPromedioDTO
    {
        public decimal TemperaturaPromedio { get; set; }
    }

    public class GraficaEmbarquesDTO
    {
        public List<string> Meses { get; set; }
        public List<int?> Embarques { get; set; } // int? permite valores null
    }
}
