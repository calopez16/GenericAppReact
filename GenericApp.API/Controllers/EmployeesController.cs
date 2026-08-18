using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Data;
using System.Threading.Tasks;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controlador para gestionar las operaciones CRUD y consultas de la entidad Employee.
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("employees")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class EmployeesController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;

        /// <summary>
        /// Inicializa una nueva instancia del controlador EmployeesController.
        /// </summary>
        /// <param name="repository">Instancia del repositorio para acceso a datos.</param>
        /// <param name="mapper">Instancia de AutoMapper para mapeo de DTOs.</param>
        public EmployeesController(
            IRepository repository,
            IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet("relationship-types")]
        public async Task<ActionResult> GetRelationshipTypes()
        {
            var types = await _repository.FindBy<EmployeeRelationshipType>(x => !(x.IsDeleted ?? false));
            return Ok(new ApiResponse { Data = types.Select(x => _mapper.Map<EmployeeRelationshipTypeDTO>(x)) });
        }

        [HttpPost("relationship-types")]
        public async Task<ActionResult> AddRelationshipType([FromBody] EmployeeRelationshipTypeDTO dto)
        {
            var entity = new EmployeeRelationshipType
            {
                Description = dto.Description,
                IsActive = true,
                IsDeleted = false,
            };
            await _repository.Add(entity);
            return Ok(new ApiResponse { Data = _mapper.Map<EmployeeRelationshipTypeDTO>(entity) });
        }

        [HttpPost("upload-excel")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
        public ActionResult UploadExcel([FromForm] IFormFile file, [FromForm] int dataStartRow = 2)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new ApiResponse { Message = "No file provided" });

            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            var rows = new List<EmployeeExcelRowDTO>();

            using var stream = file.OpenReadStream();
            using var package = new ExcelPackage(stream);
            var sheet = package.Workbook.Worksheets[0];
            if (sheet == null)
                return BadRequest(new ApiResponse { Message = "No worksheet found" });

            int lastRow = sheet.Dimension?.End.Row ?? 0;

            string? GetVal(int row, int col)
            {
                var v = sheet.Cells[row, col].Text?.Trim();
                if (string.IsNullOrEmpty(v)) return null;
                if (v == "- -" || v == "--" || v == "-" || v == "-   -") return null;
                return v;
            }

            for (int r = dataStartRow; r <= lastRow; r++)
            {
                if (string.IsNullOrWhiteSpace(sheet.Cells[r, 1].Text) &&
                    string.IsNullOrWhiteSpace(sheet.Cells[r, 4].Text))
                    continue;

                var row = new EmployeeExcelRowDTO
                {
                    RowNumber = r,
                    Clave = GetVal(r, 1),
                    ApellidoPaterno = GetVal(r, 2),
                    ApellidoMaterno = GetVal(r, 3),
                    Nombre = GetVal(r, 4),
                    LugarNacimiento = GetVal(r, 5),
                    Direccion = GetVal(r, 6),
                    Telefono = GetVal(r, 7),
                    Ciudad = GetVal(r, 8),
                    Estado = GetVal(r, 9),
                    RFC = GetVal(r, 10),
                    CURP = GetVal(r, 11),
                    IMSS = GetVal(r, 12),
                    Sexo = GetVal(r, 13),
                    EstadoCivil = GetVal(r, 14),
                    Puesto = GetVal(r, 15),
                    FechaNacimiento = GetVal(r, 16),
                    FechaIngreso = GetVal(r, 17),
                    FechaBaja = GetVal(r, 18),
                    CausaBaja = GetVal(r, 19),
                    Activo = GetVal(r, 24),
                    SalarioDiario = GetVal(r, 26),
                    SalarioIntegrado = GetVal(r, 27),
                    Padre = GetVal(r, 28),
                    Madre = GetVal(r, 29),
                    CorreoElectronico = GetVal(r, 35),
                    FormaDePago = GetVal(r, 40),

                    Beneficiario1 = GetVal(r, 41),
                    Parentesco1 = GetVal(r, 42),
                    Porcentaje1 = GetVal(r, 43),

                    Beneficiario2 = GetVal(r, 44),
                    Parentesco2 = GetVal(r, 45),
                    Porcentaje2 = GetVal(r, 46),

                    Beneficiario3 = GetVal(r, 47),
                    Parentesco3 = GetVal(r, 48),
                    Porcentaje3 = GetVal(r, 49),
                    Conyugue = GetVal(r, 50),
                    ConyugueFechaNacimiento = GetVal(r, 51),

                    Hijo1 = GetVal(r, 52),
                    Hijo1FechaNacimiento = GetVal(r, 53),
                    Hijo1Sexo = GetVal(r, 54),

                    Hijo2 = GetVal(r, 55),
                    Hijo2FechaNacimiento = GetVal(r, 56),
                    Hijo2Sexo = GetVal(r, 57),

                    Hijo3 = GetVal(r, 58),
                    Hijo3FechaNacimiento = GetVal(r, 59),
                    Hijo3Sexo = GetVal(r, 60),

                    Hijo4 = GetVal(r, 61),
                    Hijo4FechaNacimiento = GetVal(r, 62),
                    Hijo4Sexo = GetVal(r, 63),

                    Hijo5 = GetVal(r, 64),
                    Hijo5FechaNacimiento = GetVal(r, 65),
                    Hijo5Sexo = GetVal(r, 66),

                    Hijo6 = GetVal(r, 67),
                    Hijo6FechaNacimiento = GetVal(r, 68),
                    Hijo6Sexo = GetVal(r, 69),

                    FechaNacimientoPadre = GetVal(r, 71),
                    FechaNacimientoMadre = GetVal(r, 73),

                    PadreVive = GetVal(r, 87),
                    MadreVive = GetVal(r, 88),
                    ConyugeVive = GetVal(r, 89),

                    CelularTrabajador = GetVal(r, 82),
                    ContactoEmergencia = GetVal(r, 90),
                    ParentescoContacto = GetVal(r, 91),
                    CelularContacto = GetVal(r, 92),

                    FechaInicioContrato = GetVal(r, 97),
                    FechaVencimientoContrato = GetVal(r, 98),
                    Errores = new List<EmployeeExcelRowErrorsDTO>()
                };

                ValidateEmployeeRow(row);
                rows.Add(row);
            }

            return Ok(new ApiResponse { Data = rows });
        }

        private void ValidateEmployeeRow(EmployeeExcelRowDTO row)
        {
            var errores = row.Errores;

            // Validar Clave (requerido y debe ser entero)
            if (string.IsNullOrWhiteSpace(row.Clave))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "FIELD_REQUIRED", Field = "Clave", Value = row.Clave ?? "" });
            else if (!int.TryParse(row.Clave, out _))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_INTEGER", Field = "Clave", Value = row.Clave });

            // Validar Nombre (requerido, max 150 caracteres)
            if (string.IsNullOrWhiteSpace(row.Nombre))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "FIELD_REQUIRED", Field = "Nombre", Value = row.Nombre ?? "" });
            else if (row.Nombre.Length > 150)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "Nombre", Value = row.Nombre });

            // Validar ApellidoPaterno (max 150 caracteres)
            if (!string.IsNullOrWhiteSpace(row.ApellidoPaterno) && row.ApellidoPaterno.Length > 150)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "ApellidoPaterno", Value = row.ApellidoPaterno });

            // Validar ApellidoMaterno (max 150 caracteres)
            if (!string.IsNullOrWhiteSpace(row.ApellidoMaterno) && row.ApellidoMaterno.Length > 150)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "ApellidoMaterno", Value = row.ApellidoMaterno });

            // Validar Direccion (max 250 caracteres)
            if (!string.IsNullOrWhiteSpace(row.Direccion) && row.Direccion.Length > 250)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "Direccion", Value = row.Direccion });

            // Validar RFC (max 50 caracteres)
            if (!string.IsNullOrWhiteSpace(row.RFC) && row.RFC.Length > 50)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "RFC", Value = row.RFC });

            // Validar CURP (max 50 caracteres)
            if (!string.IsNullOrWhiteSpace(row.CURP) && row.CURP.Length > 50)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "CURP", Value = row.CURP });

            // Validar IMSS (max 50 caracteres)
            if (!string.IsNullOrWhiteSpace(row.IMSS) && row.IMSS.Length > 50)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "IMSS", Value = row.IMSS });

            // Validar Sexo (max 50 caracteres)
            if (!string.IsNullOrWhiteSpace(row.Sexo) && row.Sexo.Length > 50)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "Sexo", Value = row.Sexo });

            // Validar EstadoCivil (max 50 caracteres)
            if (!string.IsNullOrWhiteSpace(row.EstadoCivil) && row.EstadoCivil.Length > 50)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "EstadoCivil", Value = row.EstadoCivil });

            // Validar Puesto (max 150 caracteres)
            if (!string.IsNullOrWhiteSpace(row.Puesto) && row.Puesto.Length > 150)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "Puesto", Value = row.Puesto });

            //// Validar FechaNacimiento (requerido y formato válido)
            //if (string.IsNullOrWhiteSpace(row.FechaNacimiento))
            //    errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "FIELD_REQUIRED", Field = "FechaNacimiento", Value = row.FechaNacimiento ?? "" });
            //else 
            if (!string.IsNullOrWhiteSpace(row.FechaNacimiento))
                if (!DateTime.TryParse(row.FechaNacimiento, out _))
                    errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DATE", Field = "FechaNacimiento", Value = row.FechaNacimiento });

            // Validar FechaIngreso (formato válido si existe)
            if (!string.IsNullOrWhiteSpace(row.FechaIngreso) && !DateTime.TryParse(row.FechaIngreso, out _))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DATE", Field = "FechaIngreso", Value = row.FechaIngreso });

            // Validar FechaBaja (formato válido si existe)
            if (!string.IsNullOrWhiteSpace(row.FechaBaja) && !DateTime.TryParse(row.FechaBaja, out _))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DATE", Field = "FechaBaja", Value = row.FechaBaja });

            // Validar SalarioDiario (debe ser decimal válido si existe)
            if (!string.IsNullOrWhiteSpace(row.SalarioDiario) &&
                !decimal.TryParse(row.SalarioDiario.Replace(",", "."), System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out _))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DECIMAL", Field = "SalarioDiario", Value = row.SalarioDiario });

            // Validar SalarioIntegrado (debe ser decimal válido si existe)
            if (!string.IsNullOrWhiteSpace(row.SalarioIntegrado) &&
                !decimal.TryParse(row.SalarioIntegrado.Replace(",", "."), System.Globalization.NumberStyles.Any,
                    System.Globalization.CultureInfo.InvariantCulture, out _))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DECIMAL", Field = "SalarioIntegrado", Value = row.SalarioIntegrado });

            // Validar FormaDePago (max 50 caracteres)
            if (!string.IsNullOrWhiteSpace(row.FormaDePago) && row.FormaDePago.Length > 50)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "FormaDePago", Value = row.FormaDePago });

            // Validar FechaInicioContrato (formato válido si existe)
            if (!string.IsNullOrWhiteSpace(row.FechaInicioContrato) && !DateTime.TryParse(row.FechaInicioContrato, out _))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DATE", Field = "FechaInicioContrato", Value = row.FechaInicioContrato });

            // Validar FechaVencimientoContrato (formato válido si existe)
            if (!string.IsNullOrWhiteSpace(row.FechaVencimientoContrato) && !DateTime.TryParse(row.FechaVencimientoContrato, out _))
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DATE", Field = "FechaVencimientoContrato", Value = row.FechaVencimientoContrato });

            // Validar Beneficiarios
            ValidateBeneficiary(errores, row.Beneficiario1, row.Parentesco1, row.Porcentaje1, 1);
            ValidateBeneficiary(errores, row.Beneficiario2, row.Parentesco2, row.Porcentaje2, 2);
            ValidateBeneficiary(errores, row.Beneficiario3, row.Parentesco3, row.Porcentaje3, 3);

            // Validar suma de porcentajes de beneficiarios
            var porcentajes = new[] { row.Porcentaje1, row.Porcentaje2, row.Porcentaje3 };
            var beneficiarios = new[] { row.Beneficiario1, row.Beneficiario2, row.Beneficiario3 };
            var totalPorcentaje = 0m;
            var hasBeneficiarios = false;

            for (int i = 0; i < 3; i++)
            {
                if (!string.IsNullOrWhiteSpace(beneficiarios[i]))
                {
                    hasBeneficiarios = true;
                    if (!string.IsNullOrWhiteSpace(porcentajes[i]) &&
                        decimal.TryParse(porcentajes[i].Replace(",", "."), System.Globalization.NumberStyles.Any,
                            System.Globalization.CultureInfo.InvariantCulture, out var pct))
                    {
                        totalPorcentaje += pct;
                    }
                }
            }

            if (hasBeneficiarios && totalPorcentaje != 100)
                errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "BENEFICIARY_PERCENTAGE_SUM", Field = "Porcentajes", Value = totalPorcentaje.ToString() });

            // Validar Dependientes
            ValidateDependent(errores, row.Padre, row.FechaNacimientoPadre, "Padre", "FechaNacimientoPadre");
            ValidateDependent(errores, row.Madre, row.FechaNacimientoMadre, "Madre", "FechaNacimientoMadre");
            ValidateDependent(errores, row.Conyugue, row.ConyugueFechaNacimiento, "Conyugue", "ConyugueFechaNacimiento");

            ValidateDependent(errores, row.Hijo1, row.Hijo1FechaNacimiento, "Hijo1", "Hijo1FechaNacimiento");
            ValidateDependent(errores, row.Hijo2, row.Hijo2FechaNacimiento, "Hijo2", "Hijo2FechaNacimiento");
            ValidateDependent(errores, row.Hijo3, row.Hijo3FechaNacimiento, "Hijo3", "Hijo3FechaNacimiento");
            ValidateDependent(errores, row.Hijo4, row.Hijo4FechaNacimiento, "Hijo4", "Hijo4FechaNacimiento");
            ValidateDependent(errores, row.Hijo5, row.Hijo5FechaNacimiento, "Hijo5", "Hijo5FechaNacimiento");
            ValidateDependent(errores, row.Hijo6, row.Hijo6FechaNacimiento, "Hijo6", "Hijo6FechaNacimiento");

            // Validar Contacto de Emergencia
            ValidateEmergencyContact(errores, row.ContactoEmergencia, row.ParentescoContacto, row.CelularContacto);
        }

        private void ValidateBeneficiary(List<EmployeeExcelRowErrorsDTO> errores, string? nombre, string? parentesco, string? porcentaje, int index)
        {
            if (!string.IsNullOrWhiteSpace(nombre))
            {
                // Validar longitud del nombre (max 150)
                if (nombre.Length > 150)
                    errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = $"Beneficiario{index}", Value = nombre });

                // Validar que tenga parentesco
                if (string.IsNullOrWhiteSpace(parentesco))
                    errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "FIELD_REQUIRED", Field = $"Parentesco{index}", Value = parentesco ?? "" });

                // Validar porcentaje
                if (string.IsNullOrWhiteSpace(porcentaje))
                {
                    errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "FIELD_REQUIRED", Field = $"Porcentaje{index}", Value = porcentaje ?? "" });
                }
                else
                {
                    if (!decimal.TryParse(porcentaje.Replace(",", "."), System.Globalization.NumberStyles.Any,
                        System.Globalization.CultureInfo.InvariantCulture, out var pct))
                    {
                        errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DECIMAL", Field = $"Porcentaje{index}", Value = porcentaje });
                    }
                    else if (pct < 0 || pct > 100)
                    {
                        errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "PERCENTAGE_OUT_OF_RANGE", Field = $"Porcentaje{index}", Value = porcentaje });
                    }
                }
            }
        }

        private void ValidateDependent(List<EmployeeExcelRowErrorsDTO> errores, string? nombre, string? fechaNacimiento, string nombreField, string fechaField)
        {
            if (!string.IsNullOrWhiteSpace(nombre))
            {
                // Validar longitud del nombre (max 150)
                if (nombre.Length > 150)
                    errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = nombreField, Value = nombre });

                // Validar fecha de nacimiento si existe
                if (!string.IsNullOrWhiteSpace(fechaNacimiento))
                    if (!DateTime.TryParse(fechaNacimiento, out _))
                        errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "INVALID_DATE", Field = fechaField, Value = fechaNacimiento });
            }
        }

        private void ValidateEmergencyContact(List<EmployeeExcelRowErrorsDTO> errores, string? nombre, string? parentesco, string? telefono)
        {
            if (!string.IsNullOrWhiteSpace(nombre))
            {
                // Validar longitud del nombre (max 150)
                if (nombre.Length > 150)
                    errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "ContactoEmergencia", Value = nombre });

                // Validar teléfono (max 25)
                if (!string.IsNullOrWhiteSpace(telefono) && telefono.Length > 25)
                    errores.Add(new EmployeeExcelRowErrorsDTO { ErrorCode = "MAX_LENGTH_EXCEEDED", Field = "CelularContacto", Value = telefono });
            }
        }

        [HttpPost("import-excel")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> ImportExcel([FromBody] EmployeeImportRequestDTO request)
        {
            if (request?.Rows == null || !request.Rows.Any())
                return BadRequest(new ApiResponse { Message = "No rows to import" });

            int inserted = 0;
            int updated = 0;
            int errors = 0;
            var errorDetails = new List<object>();

            foreach (var row in request.Rows)
            {
                try
                {
                    if (!int.TryParse(row.Clave, out int clave))
                    {
                        errors++;
                        errorDetails.Add(new 
                        { 
                            RowNumber = row.RowNumber, 
                            Clave = row.Clave, 
                            Nombre = row.Nombre, 
                            Error = "Clave inválida o no proporcionada" 
                        });
                        continue;
                    }

                    var existing = await _repository.FirstOrDefault<Employee>(
                        x => x.Clave == clave && x.IdCompany == request.IdCompany && !(x.IsDeleted ?? false),
                        x => x.EmployeeWorkInformations,
                        x => x.Beneficiaries,
                        x => x.Dependents,
                        x => x.EmployeeEmergencyContacts);

                    DateTime ParseDate(string? val) =>
                        DateTime.TryParse(val, out var d) ? d : DateTime.MinValue;

                    DateTime? ParseDateNullable(string? val) =>
                        DateTime.TryParse(val, out var d) ? d : null;

                    decimal ParseDecimal(string? val) =>
                        decimal.TryParse(val?.Replace(",", "."), System.Globalization.NumberStyles.Any,
                            System.Globalization.CultureInfo.InvariantCulture, out var n) ? n : 0;

                    if (existing == null)
                    {
                        var employee = new Employee
                        {
                            Clave = clave,
                            IdCompany = request.IdCompany,
                            ApellidoPaterno = row.ApellidoPaterno,
                            ApellidoMaterno = row.ApellidoMaterno,
                            Nombre = row.Nombre,
                            Address = row.Direccion,
                            RFC = row.RFC,
                            CURP = row.CURP,
                            IMSS = row.IMSS,
                            Genre = NormalizeGenre(row.Sexo),
                            CivilStatus = row.EstadoCivil,
                            Position = row.Puesto,
                            BirthDate = ParseDate(row.FechaNacimiento),
                            IsActive = row.Activo?.ToUpper() is "SI" or "S" or "1" or "TRUE" or "YES",
                            IsDeleted = false,
                            EmployeeWorkInformations = new List<EmployeeWorkInformation>(),
                            Beneficiaries = new List<EmployeeBeneficiarie>(),
                            Dependents = new List<EmployeeDependents>(),
                            EmployeeEmergencyContacts = new List<EmployeeEmergencyContact>(),
                        };

                        await MapRelatedData(employee, row, ParseDate, ParseDateNullable, ParseDecimal);
                        await _repository.Add(employee);
                        inserted++;
                    }
                    else
                    {
                        existing.ApellidoPaterno = row.ApellidoPaterno ?? existing.ApellidoPaterno;
                        existing.ApellidoMaterno = row.ApellidoMaterno ?? existing.ApellidoMaterno;
                        existing.Nombre = row.Nombre ?? existing.Nombre;
                        existing.Address = row.Direccion ?? existing.Address;
                        existing.RFC = row.RFC ?? existing.RFC;
                        existing.CURP = row.CURP ?? existing.CURP;
                        existing.IMSS = row.IMSS ?? existing.IMSS;
                        existing.Genre = NormalizeGenre(row.Sexo) ?? existing.Genre;
                        existing.CivilStatus = row.EstadoCivil ?? existing.CivilStatus;
                        existing.Position = row.Puesto ?? existing.Position;
                        if (row.FechaNacimiento != null) existing.BirthDate = ParseDate(row.FechaNacimiento);
                        if (row.Activo != null)
                            existing.IsActive = row.Activo.ToUpper() is "SI" or "S" or "1" or "TRUE" or "YES";

                        await _repository.RemoveRange(existing.EmployeeWorkInformations.ToList());
                        await _repository.RemoveRange(existing.Beneficiaries.ToList());
                        await _repository.RemoveRange(existing.Dependents.ToList());
                        await _repository.RemoveRange(existing.EmployeeEmergencyContacts.ToList());

                        existing.EmployeeWorkInformations.Clear();
                        existing.Beneficiaries.Clear();
                        existing.Dependents.Clear();
                        existing.EmployeeEmergencyContacts.Clear();

                        await MapRelatedData(existing, row, ParseDate, ParseDateNullable, ParseDecimal);
                        await _repository.Update(existing);
                        updated++;
                    }
                }
                catch (Exception ex)
                {
                    errors++;
                    errorDetails.Add(new 
                    { 
                        RowNumber = row.RowNumber, 
                        Clave = row.Clave, 
                        Nombre = row.Nombre, 
                        Error = ex.Message 
                    });
                }
            }

            var result = new 
            { 
                Inserted = inserted, 
                Updated = updated, 
                Errors = errors,
                Total = request.Rows.Count(),
                ErrorDetails = errorDetails
            };

            return Ok(new ApiResponse { Data = result });
        }

        private static string? NormalizeGenre(string? val)
        {
            if (string.IsNullOrWhiteSpace(val)) return null;
            var upper = val.Trim().ToUpper();
            if (upper.StartsWith("M")) return "M";
            if (upper.StartsWith("F")) return "F";
            return val;
        }

        /// <summary>
        /// Busca un tipo de parentesco por descripción. Si no existe, lo crea y devuelve el ID.
        /// </summary>
        private async Task<int?> GetOrCreateRelationshipTypeAsync(string? description)
        {
            if (string.IsNullOrWhiteSpace(description)) return null;

            var normalized = description.Trim();
            var existing = await _repository.FirstOrDefault<EmployeeRelationshipType>(
                x => x.Description != null &&
                     x.Description.ToLower() == normalized.ToLower() &&
                     !(x.IsDeleted ?? false));

            if (existing != null)
                return existing.IdEmployeeRelationshipType;

            var newType = new EmployeeRelationshipType
            {
                Description = normalized,
                IsActive = true,
                IsDeleted = false,
            };
            await _repository.Add(newType);
            return newType.IdEmployeeRelationshipType;
        }

        private async Task MapRelatedData(
            Employee employee,
            EmployeeExcelRowDTO row,
            Func<string?, DateTime> parseDate,
            Func<string?, DateTime?> parseDateNullable,
            Func<string?, decimal> parseDecimal)
        {
            // Work information
            if (!string.IsNullOrEmpty(row.SalarioDiario) || !string.IsNullOrEmpty(row.FechaIngreso))
            {
                employee.EmployeeWorkInformations.Add(new EmployeeWorkInformation
                {
                    DailySalary = parseDecimal(row.SalarioDiario),
                    IntegralSalary = parseDecimal(row.SalarioIntegrado),
                    PayType = row.FormaDePago,
                    InitialDate = parseDate(row.FechaIngreso),
                    ContractExpiration = parseDate(row.FechaVencimientoContrato),
                    IsActive = true,
                    IsDeleted = false
                });
            }

            // Beneficiaries
            var beneficiaryData = new[]
            {
                (Name: row.Beneficiario1, Pct: row.Porcentaje1, Parentesco: row.Parentesco1),
                (Name: row.Beneficiario2, Pct: row.Porcentaje2, Parentesco: row.Parentesco2),
                (Name: row.Beneficiario3, Pct: row.Porcentaje3, Parentesco: row.Parentesco3),
            };
            foreach (var (name, pct, parentesco) in beneficiaryData)
            {
                if (!string.IsNullOrEmpty(name))
                {
                    var relationshipTypeId = await GetOrCreateRelationshipTypeAsync(parentesco);
                    employee.Beneficiaries.Add(new EmployeeBeneficiarie
                    {
                        Name = name,
                        Percentage = parseDecimal(pct),
                        IdEmployeeRelationshipType = relationshipTypeId,
                        IsActive = true,
                        IsDeleted = false,
                    });
                }
            }

            // Emergency contact
            if (!string.IsNullOrEmpty(row.ContactoEmergencia))
            {
                var relationshipTypeId = await GetOrCreateRelationshipTypeAsync(row.ParentescoContacto);

                employee.EmployeeEmergencyContacts.Add(new EmployeeEmergencyContact
                {
                    Name = row.ContactoEmergencia,
                    IdEmployeeRelationshipType = relationshipTypeId,
                    Phone = row.CelularContacto,
                    IsActive = true,
                    IsDeleted = false,
                });
            }

            // Dependents: cónyuge, hijos, padre, madre
            async Task AddDependent(string? name, string? birthDate, string? relationship, bool? isAlive = null)
            {
                if (string.IsNullOrEmpty(name)) return;
                var relationshipTypeId = await GetOrCreateRelationshipTypeAsync(relationship);
                employee.Dependents.Add(new EmployeeDependents
                {
                    Name = name,
                    BirthDate = parseDateNullable(birthDate),
                    IdEmployeeRelationshipType = relationshipTypeId,
                    IsAlive = isAlive ?? true,
                    IsActive = true,
                    IsDeleted = false,
                });
            }

            await AddDependent(row.Conyugue, row.ConyugueFechaNacimiento, "CONYUGE",
                row.ConyugeVive != null ? row.ConyugeVive.ToUpper() is "SI" or "S" or "1" or "TRUE" : null);
            await AddDependent(row.Hijo1, row.Hijo1FechaNacimiento, "HIJO");
            await AddDependent(row.Hijo2, row.Hijo2FechaNacimiento, "HIJO");
            await AddDependent(row.Hijo3, row.Hijo3FechaNacimiento, "HIJO");
            await AddDependent(row.Hijo4, row.Hijo4FechaNacimiento, "HIJO");
            await AddDependent(row.Hijo5, row.Hijo5FechaNacimiento, "HIJO");
            await AddDependent(row.Hijo6, row.Hijo6FechaNacimiento, "HIJO");
            await AddDependent(row.Padre, row.FechaNacimientoPadre, "PADRE",
                row.PadreVive != null ? row.PadreVive.ToUpper() is "SI" or "S" or "1" or "TRUE" : null);
            await AddDependent(row.Madre, row.FechaNacimientoMadre, "MADRE",
                row.MadreVive != null ? row.MadreVive.ToUpper() is "SI" or "S" or "1" or "TRUE" : null);
        }

        /// <summary>
        /// Obtiene una lista paginada de employeees activos, permitiendo la búsqueda por nombre o RFC.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por nombre o RFC (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de EmployeeDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetEmployeesPagination(
            [FromQuery] int idCompany,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {

            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Employee>();
            query = query.Where(x => !(x.IsDeleted ?? false) && x.IdCompany == idCompany);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    (u.Clave.ToString() != null && u.Clave.ToString().Contains(searchTerm)) ||
                    (u.Nombre != null && u.Nombre.Contains(searchTerm)) ||
                    (u.ApellidoPaterno != null && u.ApellidoPaterno.Contains(searchTerm)) ||
                    (u.RFC != null && u.RFC.Contains(searchTerm)));
            }

            var totalRows = query.Count();
            var data = query.
                OrderBy(x => x.Nombre)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new EmployeeDTO
                {
                    IdEmployee = x.IdEmployee,
                    Clave = x.Clave,
                    Nombre = x.Nombre,
                    ApellidoPaterno = x.ApellidoPaterno,
                    ApellidoMaterno = x.ApellidoMaterno,
                    Address = x.Address,
                    RFC = x.RFC,
                    CURP = x.CURP,
                    IMSS = x.IMSS,
                    Genre = x.Genre,
                    CivilStatus = x.CivilStatus,
                    Position = x.Position,
                    BirthDate = x.BirthDate,
                    IsActive = x.IsActive,
                    IdCompany = x.IdCompany
                })
                .ToList();

            var paginatedResponse = new
            {
                TotalCount = totalRows,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)System.Math.Ceiling((double)totalRows / pageSize),
                Data = data
            };

            return Ok(new ApiResponse { Data = paginatedResponse });

        }

        /// <summary>
        /// Obtiene un employeee específico por su ID.
        /// </summary>
        /// <param name="id">El ID del employeee a buscar.</param>
        /// <returns>La EmployeeDTO si se encuentra, o NotFound si no existe o está eliminado.</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<EmployeeDTO>> GetEmployeeById(int id)
        {
            var employee = await _repository.FirstOrDefault<Employee>(
                x => x.IdEmployee == id && !(x.IsDeleted ?? false),
                x => x.EmployeeWorkInformations,
                x => x.Beneficiaries,
                x => x.Dependents,
                x => x.EmployeeEmergencyContacts);

            if (employee == null)
                return NotFound(new ApiResponse());

            var employeeDTO = _mapper.Map<EmployeeDTO>(employee);

            return Ok(new ApiResponse { Data = employeeDTO });
        }

        /// <summary>
        /// Agrega una nueva entidad Employee a la base de datos.
        /// </summary>
        /// <param name="model">El EmployeeDTO con los datos del employeee a crear.</param>
        /// <returns>La entidad Employee creada o un conflicto si ya existe un employeee con el mismo nombre o RFC.</returns>
        [HttpPost]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> AddEmployee([FromBody] EmployeeDTO model)
        {
            var employeeExists = await _repository.FirstOrDefault<Employee>(x =>
                x.IdCompany == model.IdCompany &&
                (!string.IsNullOrEmpty(model.RFC) && x.RFC != null && x.RFC.ToLower().Equals(model.RFC.ToLower()) ||
                 !string.IsNullOrEmpty(model.CURP) && x.CURP != null && x.CURP.ToLower().Equals(model.CURP.ToLower()))
                && !(x.IsDeleted ?? false));
            if (employeeExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(!string.IsNullOrEmpty(model.RFC) && (employeeExists.RFC?.ToLower().Equals(model.RFC.ToLower()) ?? false) ? model.RFC : "")}, {(!string.IsNullOrEmpty(model.CURP) && (employeeExists.CURP?.ToLower().Equals(model.CURP.ToLower()) ?? false) ? model.CURP : "")}".Trim(',', ' ')
                    }
                );

            var employeeDB = _mapper.Map<Employee>(model);
            employeeDB.EmployeeWorkInformations = new List<EmployeeWorkInformation>();
            employeeDB.Beneficiaries = new List<EmployeeBeneficiarie>();
            employeeDB.Dependents = new List<EmployeeDependents>();
            employeeDB.EmployeeEmergencyContacts = new List<EmployeeEmergencyContact>();

            if (model.EmployeeWorkInformations?.Any() == true)
                employeeDB.EmployeeWorkInformations.Add(_mapper.Map<EmployeeWorkInformation>(model.EmployeeWorkInformations.First()));

            if (model.Beneficiaries?.Any() == true)
                employeeDB.Beneficiaries = model.Beneficiaries.Select(b => _mapper.Map<EmployeeBeneficiarie>(b)).ToList();

            if (model.Dependents?.Any() == true)
                employeeDB.Dependents = model.Dependents.Select(d => _mapper.Map<EmployeeDependents>(d)).ToList();

            if (model.EmployeeEmergencyContacts?.Any() == true)
                employeeDB.EmployeeEmergencyContacts = model.EmployeeEmergencyContacts.Select(e => _mapper.Map<EmployeeEmergencyContact>(e)).ToList();

            var result = await _repository.Add(employeeDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<EmployeeDTO>(employeeDB) });
        }

        /// <summary>
        /// Actualiza una entidad Employee existente.
        /// </summary>
        /// <param name="model">El EmployeeDTO con los datos actualizados.</param>
        /// <returns>La entidad Employee actualizada o un conflicto si ya existe otro employeee con el mismo nombre o RFC.</returns>
        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> UpdateEmployee([FromBody] EmployeeDTO model)
        {
            var employeeExists = await _repository.FirstOrDefault<Employee>(x =>
                x.IdEmployee != model.IdEmployee &&
                x.IdCompany == model.IdCompany &&
                (!string.IsNullOrEmpty(model.RFC) && x.RFC != null && x.RFC.ToLower().Equals(model.RFC.ToLower()) ||
                 !string.IsNullOrEmpty(model.CURP) && x.CURP != null && x.CURP.ToLower().Equals(model.CURP.ToLower()))
                && !(x.IsDeleted ?? false));
            if (employeeExists != null)
                return Conflict(
                    new ApiResponse
                    {
                        Conflict = $"{(!string.IsNullOrEmpty(model.RFC) && (employeeExists.RFC?.ToLower().Equals(model.RFC.ToLower()) ?? false) ? model.RFC : "")}, {(!string.IsNullOrEmpty(model.CURP) && (employeeExists.CURP?.ToLower().Equals(model.CURP.ToLower()) ?? false) ? model.CURP : "")}".Trim(',', ' ')
                    }
                );

            var employeeDB = await _repository.FirstOrDefault<Employee>(
                x => x.IdEmployee == (model.IdEmployee ?? 0),
                x => x.EmployeeWorkInformations,
                x => x.Beneficiaries,
                x => x.Dependents,
                x => x.EmployeeEmergencyContacts);

            if (employeeDB == null)
                return NotFound(new ApiResponse());

            employeeDB.Clave = model.Clave ?? employeeDB.Clave;
            employeeDB.Nombre = model.Nombre;
            employeeDB.ApellidoPaterno = model.ApellidoPaterno;
            employeeDB.ApellidoMaterno = model.ApellidoMaterno;
            employeeDB.Address = model.Address;
            employeeDB.RFC = model.RFC;
            employeeDB.CURP = model.CURP;
            employeeDB.IMSS = model.IMSS;
            employeeDB.Genre = model.Genre;
            employeeDB.CivilStatus = model.CivilStatus;
            employeeDB.Position = model.Position;
            employeeDB.BirthDate = model.BirthDate ?? employeeDB.BirthDate;
            employeeDB.IdCompany = model.IdCompany ?? employeeDB.IdCompany;

            // WorkInformation: siempre debe existir un único registro — actualizar si ya existe, agregar si no
            var incomingWorkInfo = model.EmployeeWorkInformations?.FirstOrDefault();
            if (employeeDB.EmployeeWorkInformations.Any())
            {
                var existing = employeeDB.EmployeeWorkInformations.First();
                existing.DailySalary = incomingWorkInfo?.DailySalary ?? existing.DailySalary;
                existing.IntegralSalary = incomingWorkInfo?.IntegralSalary ?? existing.IntegralSalary;
                existing.PayType = incomingWorkInfo?.PayType ?? existing.PayType;
                existing.InitialDate = incomingWorkInfo?.InitialDate ?? existing.InitialDate;
                existing.ContractExpiration = incomingWorkInfo?.ContractExpiration ?? existing.ContractExpiration;
            }
            else if (incomingWorkInfo != null)
            {
                employeeDB.EmployeeWorkInformations.Add(_mapper.Map<EmployeeWorkInformation>(incomingWorkInfo));
            }

            // Beneficiaries
            var incomingBeneficiaryIds = model.Beneficiaries?.Select(b => b.IdEmployeeBeneficiarie).Where(id => id > 0).ToList();
            var beneficiariesToDelete = employeeDB.Beneficiaries.Where(b => !incomingBeneficiaryIds.Contains(b.IdEmployeeBeneficiarie)).ToList();
            if (beneficiariesToDelete.Any())
            {
                await _repository.RemoveRange(beneficiariesToDelete);
                foreach (var b in beneficiariesToDelete) employeeDB.Beneficiaries.Remove(b);
            }
            if (model.Beneficiaries?.Any() == true)
            {
                foreach (var b in model.Beneficiaries)
                {
                    if (b.IdEmployeeBeneficiarie > 0)
                    {
                        var existing = employeeDB.Beneficiaries.FirstOrDefault(x => x.IdEmployeeBeneficiarie == b.IdEmployeeBeneficiarie);
                        if (existing != null) _mapper.Map(b, existing);
                    }
                    else
                    {
                        employeeDB.Beneficiaries.Add(_mapper.Map<EmployeeBeneficiarie>(b));
                    }
                }
            }

            // Dependents
            var incomingDependentIds = model.Dependents?.Select(d => d.IdEmployeeDependents).Where(id => id > 0).ToList();
            var dependentsToDelete = employeeDB.Dependents.Where(d => !incomingDependentIds.Contains(d.IdEmployeeDependents)).ToList();
            if (dependentsToDelete.Any())
            {
                await _repository.RemoveRange(dependentsToDelete);
                foreach (var d in dependentsToDelete) employeeDB.Dependents.Remove(d);
            }
            if (model.Dependents?.Any() == true)
            {
                foreach (var d in model.Dependents)
                {
                    if (d.IdEmployeeDependents > 0)
                    {
                        var existing = employeeDB.Dependents.FirstOrDefault(x => x.IdEmployeeDependents == d.IdEmployeeDependents);
                        if (existing != null) _mapper.Map(d, existing);
                    }
                    else
                    {
                        employeeDB.Dependents.Add(_mapper.Map<EmployeeDependents>(d));
                    }
                }
            }

            // EmergencyContacts
            var incomingEmergencyIds = model.EmployeeEmergencyContacts?.Select(e => e.IdEmployeeEmergencyContact).Where(id => id > 0).ToList();
            var emergencyToDelete = employeeDB.EmployeeEmergencyContacts.Where(e => !incomingEmergencyIds.Contains(e.IdEmployeeEmergencyContact)).ToList();
            if (emergencyToDelete.Any())
            {
                await _repository.RemoveRange(emergencyToDelete);
                foreach (var e in emergencyToDelete) employeeDB.EmployeeEmergencyContacts.Remove(e);
            }
            if (model.EmployeeEmergencyContacts?.Any() == true)
            {
                foreach (var e in model.EmployeeEmergencyContacts)
                {
                    if (e.IdEmployeeEmergencyContact > 0)
                    {
                        var existing = employeeDB.EmployeeEmergencyContacts.FirstOrDefault(x => x.IdEmployeeEmergencyContact == e.IdEmployeeEmergencyContact);
                        if (existing != null) _mapper.Map(e, existing);
                    }
                    else
                    {
                        employeeDB.EmployeeEmergencyContacts.Add(_mapper.Map<EmployeeEmergencyContact>(e));
                    }
                }
            }

            var result = await _repository.Update(employeeDB);

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = _mapper.Map<EmployeeDTO>(employeeDB) });
        }

        /// <summary>
        /// Deshabilita lógicamente un employeee existente (establece IsActive = false).
        /// </summary>
        /// <param name="id">El ID del employeee a deshabilitar.</param>
        /// <returns>La EmployeeDTO de la entidad actualizada.</returns>
        [HttpPut("disable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DisableEmployee(int id)
        {
            var employee = await _repository.GetById<Employee>(id);
            if (employee == null)
                return NotFound(new ApiResponse());
            employee.IsActive = false;
            var result = await _repository.Update(employee);
            if (!result)
                return BadRequest(new ApiResponse());

            var employeeDTO = _mapper.Map<EmployeeDTO>(employee);
            return Ok(new ApiResponse { Data = employeeDTO });
        }

        /// <summary>
        /// Habilita lógicamente un employeee existente (establece IsActive = true).
        /// </summary>
        /// <param name="id">El ID del employeee a habilitar.</param>
        /// <returns>La EmployeeDTO de la entidad actualizada.</returns>
        [HttpPut("enable/{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> EnableEmployee(int id)
        {
            var employee = await _repository.FirstOrDefault<Employee>(x => x.IdEmployee == id && !(x.IsDeleted ?? false));
            if (employee == null)
                return NotFound(new ApiResponse());
            employee.IsActive = true;
            var result = await _repository.Update(employee);
            if (!result)
                return BadRequest(new ApiResponse());

            var employeeDTO = _mapper.Map<EmployeeDTO>(employee);
            return Ok(new ApiResponse { Data = employeeDTO });
        }

        /// <summary>
        /// Realiza la eliminación lógica de un employeee (establece IsDeleted = true).
        /// </summary>
        /// <param name="id">El ID del employeee a eliminar.</param>
        /// <returns>La EmployeeDTO de la entidad eliminada lógicamente.</returns>
        [HttpDelete("{id}")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> DeleteEmployee(int id)
        {
            var employee = await _repository.FirstOrDefault<Employee>(x => x.IdEmployee == id && !(x.IsDeleted ?? false));
            if (employee == null)
                return NotFound(new ApiResponse());
            employee.IsDeleted = true;
            var result = await _repository.Update(employee);
            if (!result)
                return BadRequest(new ApiResponse());

            var employeeDTO = _mapper.Map<EmployeeDTO>(employee);
            return Ok(new ApiResponse { Data = employeeDTO });
        }
    }
}