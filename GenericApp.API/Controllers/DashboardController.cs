using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad Label, que incluye la colección anidada LabelType.
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("dashboard")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class DashboardController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador LabelsController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public DashboardController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet("{idCompany}/embarques-temporada")]
        public async Task<ActionResult<EmbarquesTemporadaDTO>> GetEmbarqueTemporada(int idCompany)
        {
            var actualYear = DateTime.Now.Year;

            var manifestList = await _repository.FindBy<Manifest>(x => x.IdCompany == idCompany && x.IdSeasonNavigation.SeasonYear == actualYear && !(x.IsDeleted ?? false));
            if (manifestList == null)
                return NotFound(new ApiResponse());

            var manifestDTO = _mapper.Map<List<ManifestDTO>>(manifestList);

            var response = new EmbarquesTemporadaDTO
            {
                SeasonYear = actualYear,
                TotalEmbarques = manifestDTO.Count
            };

            return Ok(new ApiResponse { Data = response });
        }
        [HttpGet("{idCompany}/total-cajas-semana")]
        public async Task<ActionResult<NumeroCajasDTO>> GetTotalCajas(int idCompany)
        {

            // 1. Calcular el rango de la semana actual (Lunes a Domingo)
            DateTime baseDate = DateTime.Today;
            int diff = (7 + (baseDate.DayOfWeek - DayOfWeek.Monday)) % 7;
            DateTime startActualWeek = baseDate.AddDays(-1 * diff).Date;
            DateTime endActualWeek = startActualWeek.AddDays(7).AddTicks(-1);

            // 2. Obtener la consulta base con los Includes necesarios
            var shipmentQuery = await _repository.Query<Shipment>();

            var shipmentList = shipmentQuery
                .Include(s => s.Manifests)
                    .ThenInclude(m => m.ManifestPallets)
                        .ThenInclude(p => p.ManifestPalletLoadings)
                .Where(x =>
                    x.IdCompany == idCompany &&
                    x.ShipmentDate >= startActualWeek &&
                    x.ShipmentDate <= endActualWeek &&
                    !(x.IsDeleted ?? false))
                .ToList();

            if (shipmentList == null)
                return NotFound(new ApiResponse());

            // 3. Calcular totales (Corrección de SelectMany y Paréntesis)
            int totalCajas = shipmentList
                .SelectMany(s => s.Manifests.Where(m => !(m.IsDeleted ?? false)))
                .SelectMany(m => m.ManifestPallets.Where(p => !(p.IsDeleted ?? false)))
                .SelectMany(p => p.ManifestPalletLoadings.Where(l => !(l.IsDeleted ?? false)))
                .Sum(l => (int?)l.BoxQuantity ?? 0);

            var response = new NumeroCajasDTO
            {
                TotalCajas = totalCajas,
                TotalViajes = shipmentList.Count
            };

            return Ok(new ApiResponse { Data = response });

        }

        [HttpGet("{idCompany}/ultimo-viaje")]
        public async Task<ActionResult<UltimoViajeDTO>> GetUltimoViaje(int idCompany)
        {
            try
            {
                // 1. Obtener la consulta base con Includes
                var shipmentQuery = await _repository.Query<Shipment>();

                // 2. Buscamos el último viaje registrado (OrderByDescending) 
                // sin restringirlo a la semana actual, para que siempre muestre el KPI del viaje más reciente
                var ultimoShipment = shipmentQuery
                    .Include(s => s.Manifests)
                        .ThenInclude(m => m.ManifestPallets)
                            .ThenInclude(p => p.ManifestPalletLoadings)
                    .Where(x => x.IdCompany == idCompany && !(x.IsDeleted ?? false))
                    .OrderByDescending(x => x.IdShipment) // O x.ShipmentDate para el más reciente por fecha
                    .FirstOrDefault();

                if (ultimoShipment == null)
                    return NotFound(new ApiResponse { Message = "No se encontraron viajes" });

                // 3. Calcular totales recorriendo la jerarquía (usando la variable correcta: ultimoShipment)
                // Agregamos una lista para poder usar SelectMany sobre el objeto único
                int totalCajas = new List<Shipment> { ultimoShipment }
                    .SelectMany(s => s.Manifests.Where(m => !(m.IsDeleted ?? false)))
                    .SelectMany(m => m.ManifestPallets.Where(p => !(p.IsDeleted ?? false)))
                    .SelectMany(p => p.ManifestPalletLoadings.Where(l => !(l.IsDeleted ?? false)))
                    .Sum(l => (int?)l.BoxQuantity ?? 0);

                // 4. Construimos la respuesta
                var response = new UltimoViajeDTO
                {
                    TotalCajas = totalCajas,
                    // Formateamos el ID para que se vea como número de viaje (ej. 00125)
                    NumeroViaje = ultimoShipment.IdShipment.ToString().PadLeft(5, '0')
                };

                return Ok(new ApiResponse { Data = response });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse { Message = ex.Message });
            }
        }

        [HttpGet("{idCompany}/temperatura-promedio")]
        public async Task<ActionResult<TemperaturaPromedioDTO>> GetTemperaturaPromedio(int idCompany)
        {
            var actualYear = DateTime.Now.Year;

            // 1. Obtenemos los manifiestos de la temporada actual
            var manifestList = await _repository.FindBy<Manifest>(x =>
                x.IdCompany == idCompany &&
                x.IdSeasonNavigation.SeasonYear == actualYear &&
                !(x.IsDeleted ?? false)
            );

            if (manifestList == null || !manifestList.Any())
                return Ok(new ApiResponse { Data = new TemperaturaPromedioDTO { TemperaturaPromedio = 0 } });

            // 2. Calculamos el promedio filtrando valores que no sean 0 (asumiendo que 0 es vacío o error de sensor)
            // Usamos la temperatura en Celsius para el estándar del KPI
            var promedio = manifestList
                .Where(x => x.TemperatureTrailerBoxC.HasValue && x.TemperatureTrailerBoxC != 0)
                .Select(x => x.TemperatureTrailerBoxC)
                .DefaultIfEmpty(0)
                .Average();

            var response = new TemperaturaPromedioDTO
            {
                TemperaturaPromedio = Math.Round(promedio ?? 0, 2) // Redondeamos a 2 decimales
            };

            return Ok(new ApiResponse { Data = response });
        }

        [HttpGet("{idCompany}/grafica-embarques")]
        public async Task<ActionResult<ApiResponse>> GetGraficaEmbarques(int idCompany)
        {
            // 1. Definir el rango del año actual
            int currentYear = DateTime.Today.Year;
            DateTime startOfYear = new DateTime(currentYear, 1, 1);
            DateTime endOfYear = new DateTime(currentYear, 12, 31, 23, 59, 59);

            // 2. Obtener los embarques del año de esa compañía
            var shipmentQuery = await _repository.Query<Shipment>();

            var shipments = shipmentQuery
                .Where(x => x.IdCompany == idCompany &&
                            x.ShipmentDate >= startOfYear &&
                            x.ShipmentDate <= endOfYear &&
                            !(x.IsDeleted ?? false))
                .Select(x => new { x.ShipmentDate }) // Solo necesitamos la fecha para contar
                .ToList();

            // 3. Preparar los nombres de los meses
            var nombresMeses = new List<string> { "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic" };
            var datosEmbarques = new List<int?>();

            // 4. Llenar la lista mes por mes
            int mesActual = DateTime.Today.Month;

            for (int i = 1; i <= 12; i++)
            {
                // Contamos cuántos embarques hay en este mes
                int count = shipments.Count(s => s.ShipmentDate.Month == i);

                datosEmbarques.Add(count);

                // Lógica de corte: 
                // Si el mes es mayor al mes actual, mandamos null para que la gráfica se corte.
                // Si el mes es igual o menor al actual pero no hay datos, mandamos 0 (o null según prefieras).
                //if (i > mesActual)
                //{
                //    datosEmbarques.Add(null);
                //}
                //else
                //{
                //    datosEmbarques.Add(count);
                //}
            }

            var response = new GraficaEmbarquesDTO
            {
                Meses = nombresMeses,
                Embarques = datosEmbarques
            };

            return Ok(new ApiResponse { Data = response });
        }
    }
}