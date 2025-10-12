namespace GenericApp.API.Models
{
    /// <summary>
    /// Represents a box within a palette.
    /// </summary>
    public class BoxDTO
    {
        public string Label { get; set; } = string.Empty; // Etiqueta
        public string SerialCode { get; set; } = string.Empty; // Serie/codigo
    }

    /// <summary>
    /// Represents a palette within a shipment.
    /// </summary>
    public class PalletDTO
    {
        public int Position { get; set; } // Posicion
        public List<BoxDTO> Boxes { get; set; } = new List<BoxDTO>(); // Cajas
    }

    /// <summary>
    /// Represents the full data model for a shipment (Embarque).
    /// </summary>
    public class EmbarqueDTO
    {
        public int Id { get; set; }
        public string TripNumber { get; set; } = string.Empty; // Número de viaje
        public DateTime Date { get; set; } // Date
        public string Address { get; set; } = string.Empty; // Direccion
        public string City { get; set; } = string.Empty; // Ciudad
        public string State { get; set; } = string.Empty; // Estado
        public string Country { get; set; } = string.Empty; // Pais
        public string PostalCode { get; set; } = string.Empty; // Codigo postal
        public string Phone { get; set; } = string.Empty; // Telefono
        public string TaxId { get; set; } = string.Empty; // RFC (Registro Federal de Contribuyentes)
        public string Season { get; set; } = string.Empty; // Temporada
        public string Driver { get; set; } = string.Empty; // Chofer
        public string TrailerPlates { get; set; } = string.Empty; // Placas trailer
        public string BoxPlates { get; set; } = string.Empty; // Placas_caja (Container/Box plates)
        public TimeSpan DepartureTime { get; set; } // Hora de salida
        public decimal Temperature { get; set; } // Temperatura
        public string Line { get; set; } = string.Empty; // Linea (Carrier/Shipping Line)
        public bool Mixed { get; set; } // Mixto
        public List<PalletDTO> Pallets { get; set; } = new List<PalletDTO>(); // Tarimas
    }
}
