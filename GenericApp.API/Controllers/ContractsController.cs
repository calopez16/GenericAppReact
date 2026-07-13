using AngleSharp;
using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Globalization;
using System.IO.Compression;
using System.Text.RegularExpressions;
using AsDom = AngleSharp.Dom;
using IConfiguration = Microsoft.Extensions.Configuration.IConfiguration;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controller for managing CRUD operations for ContractTemplate catalog.
    /// Requires authentication and User policy.
    /// </summary>
    [ApiController]
    [Route("contracts")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class ContractsController : ControllerBase
    {
        private readonly IRepository _repository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;

        public ContractsController(IRepository repository, IMapper mapper, IWebHostEnvironment env, IConfiguration configuration)
        {
            _repository = repository;
            _mapper = mapper;
            _env = env;
            _configuration = configuration;
        }

        /// <summary>
        /// Returns a paginated list of signed contracts ordered by creation date descending.
        /// </summary>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetContractsPagination(
            [FromQuery] int idCompany,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = await _repository.Query<Contract>();
            query = query.Where(x => x.IdCompany == idCompany && !(x.IsDeleted ?? false));

            if (!string.IsNullOrWhiteSpace(searchTerm))
                query = query.Where(x => (x.DocumentName != null && x.DocumentName.Contains(searchTerm)));

            if (dateFrom.HasValue)
                query = query.Where(x => (x.SignatureDate ?? x.CreateDate) >= dateFrom.Value.Date);
            if (dateTo.HasValue)
                query = query.Where(x => (x.SignatureDate ?? x.CreateDate) <= dateTo.Value.Date.AddDays(1).AddTicks(-1));

            query = query.OrderByDescending(x => x.SignatureDate ?? x.CreateDate);

            var totalRows = query.Count();
            var data = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new ContractDTO
                {
                    IdContract = x.IdContract,
                    IdEmployee = x.IdEmployee,
                    CreateDate = x.CreateDate,
                    SignatureDate = x.SignatureDate,
                    DocumentName = x.DocumentName,
                    VirtualPath = x.VirtualPath,
                    IsActive = x.IsActive,
                    IsDeleted = x.IsDeleted,
                    IdCompany = x.IdCompany,
                    IdEmployeeNavigation = new EmployeeDTO
                    {
                        Nombre = $"{x.IdEmployeeNavigation.Nombre} {x.IdEmployeeNavigation.ApellidoPaterno} {x.IdEmployeeNavigation.ApellidoMaterno}"
                    }
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
        /// Returns a paginated list of signed contracts ordered by creation date descending.
        /// </summary>
        [HttpGet("employee-pagination")]
        public async Task<ActionResult> GetEmployeesWithContractsPagination(
            [FromQuery] int idCompany,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] bool showNoContract = false)
        {
            try
            {


                if (pageNumber < 1) pageNumber = 1;
                if (pageSize < 1) pageSize = 10;

                var query = await _repository.Query<Employee>();
                query = query.Where(x => x.IdCompany == idCompany && !(x.IsDeleted ?? false));

                if (!string.IsNullOrWhiteSpace(searchTerm))
                    query = query.Where(x => (x.Nombre != null && x.Nombre.Contains(searchTerm)));

                query = query.Include(x => x.Contracts);

                if (dateFrom.HasValue || dateTo.HasValue)
                {
                    if (showNoContract)
                    {
                        // Employees who have NO contract signed within the date range
                        query = query.Where(x => !x.Contracts.Any(c =>
                            !(c.IsDeleted ?? false) &&
                            (!dateFrom.HasValue || (c.SignatureDate ?? c.CreateDate) >= dateFrom.Value.Date) &&
                            (!dateTo.HasValue || (c.SignatureDate ?? c.CreateDate) <= dateTo.Value.Date.AddDays(1).AddTicks(-1))));
                    }
                }
                else if (showNoContract)
                {
                    // No date filter: employees with no contracts at all
                    query = query.Where(x => !x.Contracts.Any(c => !(c.IsDeleted ?? false)));
                }

                query = query.OrderByDescending(x => x.Contracts.Any(c => !(c.IsDeleted ?? false)))
                             .ThenBy(x => x.Nombre)
                             .ThenBy(x => x.ApellidoPaterno)
                             .ThenBy(x => x.ApellidoMaterno);

                var totalRows = query.Count();
                var data = query
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
                        IdCompany = x.IdCompany,
                        Contracts = x.Contracts
                            .Where(s => !(s.IsDeleted ?? false) &&
                                (!dateFrom.HasValue || (s.SignatureDate ?? s.CreateDate) >= dateFrom.Value.Date) &&
                                (!dateTo.HasValue || (s.SignatureDate ?? s.CreateDate) <= dateTo.Value.Date.AddDays(1).AddTicks(-1)))
                            .OrderByDescending(o => o.SignatureDate)
                            .Select(s => new ContractDTO
                            {
                                IdContract = s.IdContract,
                                VirtualPath = s.VirtualPath,
                                DocumentName = s.DocumentName,
                                SignatureDate = s.SignatureDate
                            }).OrderBy(x => x.SignatureDate).ToList()
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
            catch (Exception ex)
            {

                throw ex;
            }
        }


        /// <summary>
        /// Creates a new signed contract with multiple templates and saves PDF to disk.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult> CreateSignedContract([FromBody] CreateContractDTO model)
        {
            try
            {
                if (model.TemplateIds == null || model.TemplateIds.Count == 0)
                    return BadRequest(new ApiResponse { Message = "At least one template is required" });

                var employee = await _repository.GetById<Employee>(model.IdEmployee);
                if (employee == null)
                    return NotFound(new ApiResponse { Message = "Employee not found" });
                var employeeName = $"{employee.Nombre} {employee.ApellidoPaterno} {employee.ApellidoMaterno}";

                var templates = new List<ContractTemplate>();
                foreach (var templateId in model.TemplateIds)
                {
                    var template = await _repository.FirstOrDefault<ContractTemplate>(
                        x => x.IdTemplate == templateId && !(x.IsDeleted ?? false));
                    if (template != null)
                        templates.Add(template);
                }

                if (templates.Count == 0)
                    return BadRequest(new ApiResponse { Message = "No valid templates found" });

                var documentName = $"Contrato_{employee.Nombre}_{employee.ApellidoPaterno}_{DateTime.Now:yyyyMMddHHmmss}.pdf";
                var contractsFolder = Path.Combine(_env.WebRootPath, _configuration["contractsSettings:contractsPath"] ?? "contratos");

                if (!Directory.Exists(contractsFolder))
                    Directory.CreateDirectory(contractsFolder);

                var filePath = Path.Combine(contractsFolder, documentName);

                QuestPDF.Settings.License = LicenseType.Community;

                var company = await _repository.FirstOrDefault<Company>(
                    x => x.IdCompany == model.IdCompany && !(x.IsDeleted ?? false));

                var processedTemplates = new List<(ContractTemplate Template, string ProcessedContent)>();
                foreach (var template in templates)
                {
                    var contentWithData = await ReplaceVariables(template.Content ?? "", employee, company, model.SignatureBase64);
                    processedTemplates.Add((template, contentWithData));
                }

                // PRE-PROCESAMIENTO: Cargamos de forma segura los documentos de AngleSharp y las firmas antes de QuestPDF
                var renderDataList = new List<(ContractTemplate Template, AsDom.INodeList ChildNodes, List<ContractSign> ContractSigns)>();
                var config = Configuration.Default;
                var context = BrowsingContext.New(config);

                foreach (var (template, processedContent) in processedTemplates)
                {
                    var document = await context.OpenAsync(req => req.Content(processedContent));
                    var body = document.Body!;

                    var contractsSignsIds = await _repository.FindBy<ContractTemplateContractSign>(x => x.IdContractTemplate == template.IdTemplate && !(x.IsDeleted ?? false));
                    var contractSigns = await _repository.FindBy<ContractSign>(x => contractsSignsIds.Select(s => s.IdContractSign).Contains(x.IdContractSign) && !(x.IsDeleted ?? false));

                    renderDataList.Add((template, body.ChildNodes, contractSigns?.ToList() ?? new List<ContractSign>()));
                }

                var pdfDocument = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.Letter);
                        page.MarginTop(1, Unit.Centimetre);
                        page.MarginBottom(2, Unit.Centimetre);
                        page.MarginLeft(2.5f, Unit.Centimetre);
                        page.MarginRight(2.5f, Unit.Centimetre);
                        page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Lato));

                        page.Content().Column(col =>
                        {
                            bool isFirstTemplate = true;

                            foreach (var (template, childNodes, contractSigns) in renderDataList)
                            {
                                if (!isFirstTemplate)
                                {
                                    col.Item().PageBreak();
                                }

                                if (company != null && (template.IsHeaderEnable ?? false))
                                {
                                    col.Item().Element(header => ComposeContractHeader(header, company, employee, template.Name));
                                    col.Item().PaddingBottom(10);
                                }

                                //col.Item().Text(template.Name ?? "").FontSize(16).Bold().FontColor(Colors.Black);
                                //col.Item().PaddingBottom(8);

                                isFirstTemplate = false;

                                RenderNodes(col, childNodes);

                                RenderSignatures(col, contractSigns, model.IdCompany, model.SignatureBase64, employeeName, employee.Position);
                            }
                        });

                        page.Footer().AlignCenter().Text(t =>
                        {
                            t.Span($"{employee.Nombre} {employee.ApellidoPaterno} {employee.ApellidoMaterno}".Trim() ?? "").FontSize(8).FontColor(Colors.Grey.Darken1);
                            t.Span("  —  ").FontSize(8).FontColor(Colors.Grey.Lighten1);
                            t.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Darken1);
                            t.Span(" / ").FontSize(8).FontColor(Colors.Grey.Lighten1);
                            t.TotalPages().FontSize(8).FontColor(Colors.Grey.Darken1);
                        });
                    });
                });

                pdfDocument.GeneratePdf(filePath);

                var contractFolderVirtualPath = _configuration["contractsSettings:contractsPath"] ?? "contratos";

                var contract = new Contract
                {
                    IdEmployee = model.IdEmployee,
                    IdCompany = model.IdCompany,
                    CreateDate = DateTime.Now,
                    SignatureDate = DateTime.Now,
                    DocumentName = documentName,
                    VirtualPath = $"/{contractFolderVirtualPath}/{documentName}",
                    IsActive = true,
                    IsDeleted = false
                };

                var result = await _repository.Add(contract);

                if (!result)
                    return BadRequest(new ApiResponse { Message = "Failed to save contract" });

                return Ok(new ApiResponse
                {
                    Data = new ContractDTO
                    {
                        IdEmployee = model.IdEmployee,
                        IdCompany = model.IdCompany,
                        CreateDate = DateTime.Now,
                        SignatureDate = DateTime.Now,
                        DocumentName = documentName,
                        VirtualPath = $"/{contractFolderVirtualPath}/{documentName}",
                        IsActive = true,
                        IsDeleted = false
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse { Message = $"Error creating contract: {ex.Message}" });
            }
        }

        /// <summary>
        /// Generates a preview PDF combining multiple templates with employee data.
        /// Variables {{variable}} are replaced with actual employee information.
        /// </summary>
        [HttpPost("preview")]
        public async Task<IActionResult> GetContractPreview([FromBody] CreateContractDTO model)
        {
            try
            {
                if (model.TemplateIds == null || model.TemplateIds.Count == 0)
                    return BadRequest(new ApiResponse { Message = "At least one template is required" });

                var employee = await _repository.FirstOrDefault<Employee>(
                    x => x.IdEmployee == model.IdEmployee && !(x.IsDeleted ?? false),
                    x => x.EmployeeWorkInformations,
                    x => x.Beneficiaries,
                    x => x.Dependents,
                    x => x.EmployeeEmergencyContacts);
                if (employee == null)
                    return NotFound(new ApiResponse { Message = "Employee not found" });
                var employeeName = $"{employee?.Nombre ?? ""} {employee?.ApellidoPaterno ?? ""} {employee?.ApellidoMaterno ?? ""}";
                var templates = new List<ContractTemplate>();
                foreach (var templateId in model.TemplateIds)
                {
                    var template = await _repository.FirstOrDefault<ContractTemplate>(
                        x => x.IdTemplate == templateId && !(x.IsDeleted ?? false));
                    if (template != null)
                        templates.Add(template);
                }

                if (templates.Count == 0)
                    return BadRequest(new ApiResponse { Message = "No valid templates found" });

                var company = await _repository.FirstOrDefault<Company>(
                    x => x.IdCompany == model.IdCompany && !(x.IsDeleted ?? false));

                var processedTemplates = new List<(ContractTemplate Template, string ProcessedContent)>();
                foreach (var template in templates)
                {
                    var contentWithData = await ReplaceVariables(template.Content ?? "", employee, company, null, true);
                    processedTemplates.Add((template, contentWithData));
                }

                // PRE-PROCESAMIENTO PREVIEW: Cargamos de forma segura los documentos de AngleSharp y las firmas antes de QuestPDF
                var renderDataList = new List<(ContractTemplate Template, AsDom.INodeList ChildNodes, List<ContractSign> ContractSigns)>();
                var config = Configuration.Default;
                var context = BrowsingContext.New(config);

                foreach (var (template, processedContent) in processedTemplates)
                {
                    var document = await context.OpenAsync(req => req.Content(processedContent));
                    var body = document.Body!;

                    var contractsSignsIds = await _repository.FindBy<ContractTemplateContractSign>(x => x.IdContractTemplate == template.IdTemplate && !(x.IsDeleted ?? false));
                    var contractSigns = await _repository.FindBy<ContractSign>(x => contractsSignsIds.Select(s => s.IdContractSign).Contains(x.IdContractSign) && !(x.IsDeleted ?? false));

                    renderDataList.Add((template, body.ChildNodes, contractSigns?.ToList() ?? new List<ContractSign>()));
                }

                QuestPDF.Settings.License = LicenseType.Community;

                var pdfDocument = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.Letter);
                        page.MarginTop(1, Unit.Centimetre);
                        page.MarginBottom(2, Unit.Centimetre);
                        page.MarginLeft(2.5f, Unit.Centimetre);
                        page.MarginRight(2.5f, Unit.Centimetre);
                        page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Lato));

                        page.Content().Column(col =>
                        {
                            bool isFirstTemplate = true;

                            foreach (var (template, childNodes, contractSigns) in renderDataList)
                            {
                                if (!isFirstTemplate)
                                {
                                    col.Item().PageBreak();
                                }

                                if (company != null && (template.IsHeaderEnable ?? false))
                                {
                                    col.Item().Element(header => ComposeContractHeader(header, company, employee, template.Name));
                                    col.Item().PaddingBottom(10);
                                }

                                //col.Item().Text(template.Name ?? "").FontSize(16).Bold().FontColor(Colors.Black);
                                //col.Item().PaddingBottom(8);

                                isFirstTemplate = false;

                                RenderNodes(col, childNodes);

                                RenderSignatures(col, contractSigns, model.IdCompany, model.SignatureBase64, employeeName, employee.Position);

                            }
                        });

                        page.Footer().AlignCenter().Text(t =>
                        {
                            t.Span($"{employee.Nombre} {employee.ApellidoPaterno} {employee.ApellidoMaterno}".Trim() ?? "").FontSize(8).FontColor(Colors.Grey.Darken1);
                            t.Span("  —  ").FontSize(8).FontColor(Colors.Grey.Lighten1);
                            t.CurrentPageNumber().FontSize(8).FontColor(Colors.Grey.Darken1);
                            t.Span(" / ").FontSize(8).FontColor(Colors.Grey.Lighten1);
                            t.TotalPages().FontSize(8).FontColor(Colors.Grey.Darken1);
                        });
                    });
                });

                var stream = new MemoryStream();
                pdfDocument.GeneratePdf(stream);
                stream.Position = 0;

                var fileName = $"Preview_Contrato_{employee.Nombre}_{employee.ApellidoPaterno}.pdf";
                return File(stream, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ApiResponse { Message = $"Error generating preview: {ex.Message}" });
            }
        }


        /// <summary>
        /// Downloads a ZIP file containing the PDFs of the specified contract IDs.
        /// </summary>
        [HttpPost("download-zip")]
        public async Task<IActionResult> DownloadContractsZip([FromBody] List<int> contractIds)
        {
            if (contractIds == null || contractIds.Count == 0)
                return BadRequest(new ApiResponse { Message = "At least one contract ID is required" });

            var contractsFolder = Path.Combine(_env.WebRootPath, _configuration["contractsSettings:contractsPath"] ?? "contratos");

            var memoryStream = new MemoryStream();
            using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
            {
                foreach (var id in contractIds)
                {
                    var contract = await _repository.GetById<Contract>(id);
                    if (contract == null) continue;

                    var filePath = Path.Combine(contractsFolder, contract.DocumentName);
                    if (!System.IO.File.Exists(filePath)) continue;

                    var entry = archive.CreateEntry(contract.DocumentName, CompressionLevel.Fastest);
                    using var entryStream = entry.Open();
                    using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
                    await fileStream.CopyToAsync(entryStream);
                }
            }

            memoryStream.Position = 0;
            var zipName = $"Contratos_{Guid.NewGuid()}.zip";
            return File(memoryStream, "application/zip", zipName);
        }

        /// <summary>
        /// Generates a PDF for a contract template, rendering its HTML content.
        /// </summary>
        [HttpGet("pdf/{id}")]
        public async Task<IActionResult> GetContractTemplatePdf(int id)
        {
            var contractSigned = await _repository.GetById<Contract>(id);
            var contractsFolder = Path.Combine(_env.WebRootPath, _configuration["contractsSettings:contractsPath"] ?? "contratos");
            var pathFile = Path.Combine(contractsFolder, contractSigned.DocumentName);
            var stream = new FileStream(pathFile, FileMode.Open, FileAccess.Read);
            return File(stream, "application/pdf", contractSigned.DocumentName);

        }

        /// <summary>
        /// Soft-deletes a contract and removes the physical PDF file from disk.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContract(int id)
        {
            var contract = await _repository.GetById<Contract>(id);
            if (contract == null)
                return NotFound(new ApiResponse { Message = "Contract not found" });

            contract.IsDeleted = true;
            var result = await _repository.Update(contract);
            if (!result)
                return BadRequest(new ApiResponse { Message = "Failed to delete contract" });

            if (!string.IsNullOrEmpty(contract.DocumentName))
            {
                var contractsFolder = Path.Combine(_env.WebRootPath, _configuration["contractsSettings:contractsPath"] ?? "contratos");
                var filePath = Path.Combine(contractsFolder, contract.DocumentName);
                if (System.IO.File.Exists(filePath))
                    System.IO.File.Delete(filePath);
            }

            return Ok(new ApiResponse { Message = "Contract deleted successfully" });
        }

        #region Helpers
        private async Task<string> ReplaceVariables(string htmlContent, Employee employee, Company? company, string? signatureBase64 = null, bool isPreview = false)
        {
            var contractTemplateVariables = await _repository.FindBy<ContractTemplateVariable>(x => (x.IsActive ?? false) && !(x.IsDeleted ?? false));

            if (string.IsNullOrEmpty(htmlContent))
                return htmlContent;

            var result = htmlContent;

            foreach (var variable in contractTemplateVariables)
            {
                if (string.IsNullOrEmpty(variable.Code))
                    continue;

                var replacement = GetVariableValue(variable, employee, company);

                // Pattern 1: Match the full <span> element with tiptap-variable class
                var spanPattern = $@"<span[^>]*data-variable=""{{{{{Regex.Escape(variable.Code)}}}}}""[^>]*>.*?</span>";
                result = Regex.Replace(result, spanPattern, replacement, RegexOptions.IgnoreCase | RegexOptions.Singleline);

                // Pattern 2: Match standalone variable (fallback for variables not wrapped in span)
                var simplePattern = $@"{{{{\s*{Regex.Escape(variable.Code)}\s*}}}}";
                result = Regex.Replace(result, simplePattern, replacement, RegexOptions.IgnoreCase);
            }

            return result;
        }

        private string GetVariableValue(ContractTemplateVariable variable, Employee employee, Company? company = null)
        {
            var type = variable.Type?.ToLower() ?? "";
            var code = variable.Code?.ToLower() ?? "";
            var fechaActual = DateTime.Now;

            switch (variable.Code)
            {
                case nameof(ContractTemplateVariablesEnum.nombreEmpresa):
                    return company.RazonSocial;
                case nameof(ContractTemplateVariablesEnum.fechaActualContrato):
                    return fechaActual.ToString("d 'días del mes de' MMMM 'del año' yyyy", new CultureInfo("es-ES"));
                case nameof(ContractTemplateVariablesEnum.clave):
                    return employee.Clave.ToString();
                case nameof(ContractTemplateVariablesEnum.nombre):
                    return $"{(employee.Nombre ?? "")} {(employee.ApellidoPaterno ?? "")} {(employee.ApellidoMaterno ?? "")}";
                case nameof(ContractTemplateVariablesEnum.nacionalidad):
                    return "MEXICANA";
                case nameof(ContractTemplateVariablesEnum.edad):
                    DateTime fechaNacimiento = employee.BirthDate;
                    int edad = fechaActual.Year - fechaNacimiento.Year;
                    // Ajuste por si no ha cumplido años este año
                    if (fechaActual < fechaNacimiento.AddYears(edad))
                        edad--;
                    return edad.ToString();
                case nameof(ContractTemplateVariablesEnum.sexo):
                    return employee.Genre ?? "";
                case nameof(ContractTemplateVariablesEnum.estadoCivil):
                    return employee.CivilStatus ?? "";
                case nameof(ContractTemplateVariablesEnum.curp):
                    return employee.CURP ?? "";
                case nameof(ContractTemplateVariablesEnum.rfc):
                    return employee.RFC ?? "";
                case nameof(ContractTemplateVariablesEnum.numeroAfiliacionImss):
                    return employee.IMSS ?? "";
                case nameof(ContractTemplateVariablesEnum.domicilio):
                    return employee.Address ?? "";
                case nameof(ContractTemplateVariablesEnum.puesto):
                    return employee.Position ?? "";
                case nameof(ContractTemplateVariablesEnum.turno):
                    return "Matutino";
                case nameof(ContractTemplateVariablesEnum.salarioDiarioBase):
                    return employee.EmployeeWorkInformations?.FirstOrDefault()?.DailySalary.ToString("#.##") ?? "0.00";
                case nameof(ContractTemplateVariablesEnum.fechaInicioContrato):
                    return employee.EmployeeWorkInformations?.FirstOrDefault()?.InitialDate.ToString("dd/MM/yyyy") ?? "";
                case nameof(ContractTemplateVariablesEnum.fechaTerminacionContrato):
                    return employee.EmployeeWorkInformations?.FirstOrDefault()?.ContractExpiration.ToString("dd/MM/yyyy") ?? "";
                case nameof(ContractTemplateVariablesEnum.fechaActualFormatoCorto):
                    return fechaActual.ToString("dd/MM/yyyy");
                case nameof(ContractTemplateVariablesEnum.fechaActualFormatoLargo):
                    return fechaActual.ToString("d 'de' MMMM 'de' yyyy", new CultureInfo("es-ES"));
                case nameof(ContractTemplateVariablesEnum.Beneficiario1):
                    return employee.Beneficiaries?.ElementAtOrDefault(0)?.Name ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario1_Domicilio):
                    return "MISMO";
                //return employee.Beneficiaries?.ElementAtOrDefault(0)?.Address ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario1_FechaNacimiento):
                    return "";
                //return employee.Beneficiaries?.ElementAtOrDefault(0)?.BirthDate ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario1_Telefono):
                    return "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario1_Percentage):
                    return employee.Beneficiaries?.ElementAtOrDefault(0)?.Percentage?.ToString("N0") ?? "0";
                //return employee.Beneficiaries?.ElementAtOrDefault(0)?.Phone ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario2):
                    return employee.Beneficiaries?.ElementAtOrDefault(1)?.Name ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario2_Domicilio):
                    return "MISMO";
                //return employee.Beneficiaries?.ElementAtOrDefault(1)?.Address ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario2_FechaNacimiento):
                    return "";
                //return employee.Beneficiaries?.ElementAtOrDefault(1)?.BirthDate ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario2_Telefono):
                    return "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario2_Percentage):
                    return employee.Beneficiaries?.ElementAtOrDefault(1)?.Percentage?.ToString("N0") ?? "0";
                //return employee.Beneficiaries?.ElementAtOrDefault(1)?.Phone ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario3):
                    return employee.Beneficiaries?.ElementAtOrDefault(2)?.Name ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario3_Domicilio):
                    return "MISMO";
                //return employee.Beneficiaries?.ElementAtOrDefault(2)?.Address ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario3_FechaNacimiento):
                    return "";
                //return employee.Beneficiaries?.ElementAtOrDefault(2)?.BirthDate ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario3_Telefono):
                    return "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario3_Percentage):
                    return employee.Beneficiaries?.ElementAtOrDefault(2)?.Percentage?.ToString("N0") ?? "0";
                //return employee.Beneficiaries?.ElementAtOrDefault(0)?.Phone ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario4):
                    return employee.Beneficiaries?.ElementAtOrDefault(3)?.Name ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario4_Domicilio):
                    return "MISMO";
                //return employee.Beneficiaries?.ElementAtOrDefault(3)?.Address ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario4_FechaNacimiento):
                    return "";
                //return employee.Beneficiaries?.ElementAtOrDefault(3)?.BirthDate ?? "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario4_Telefono):
                    return "";
                case nameof(ContractTemplateVariablesEnum.Beneficiario4_Percentage):
                    return employee.Beneficiaries?.ElementAtOrDefault(3)?.Percentage?.ToString("N0") ?? "0";
                //return employee.Beneficiaries?.ElementAtOrDefault(3)?.Phone ?? "";
                default:
                    break;
            }
            return "";
        }

        /// <summary>
        /// Renders the signatures section. Leaves the employee signature space blank during preview.
        /// </summary>
        private void RenderSignatures(ColumnDescriptor col, List<ContractSign> signs, int idCompany, string? signatureBase64 = null, string? nombreEmpleado = null, string? employeePosition = null)
        {
            const int maxSignsPerRow = 4;
            // Mantenemos la altura total de 80, pero organizaremos mejor el espacio interior.
            const float signatureAreaHeight = 65;

            // Always add employee signature placeholder at the end
            var allSignatures = new List<ContractSignDTO>();

            // Add existing signs
            foreach (var sign in signs)
            {
                allSignatures.Add(new ContractSignDTO
                {
                    Name = sign.Name ?? "Sin nombre",
                    SignFileName = sign.SignFileName,
                    IsEmployee = false
                });
            }
            // Add employee signature placeholder
            allSignatures.Add(new ContractSignDTO
            {
                Name = string.IsNullOrEmpty(nombreEmpleado) ? "Firma del empleado" : nombreEmpleado,
                SignFileName = "firma-default.png",
                IsEmployee = true,
                SignBase64 = signatureBase64,
                Position = employeePosition
            });


            // Group signatures in rows of maximum 4
            var signatureRows = new List<List<ContractSignDTO>>();
            for (int i = 0; i < allSignatures.Count; i += maxSignsPerRow)
            {
                signatureRows.Add(allSignatures.Skip(i).Take(maxSignsPerRow).ToList());
            }

            var signsPath = _configuration["contractsSettings:contractsSignsPath"] ?? "Signs";

            // Render using table layout for full width distribution with centered content
            col.Item().AlignCenter().Table(table =>
            {
                // Define 4 equal columns
                table.ColumnsDefinition(cd =>
                {
                    for (int i = 0; i < maxSignsPerRow; i++)
                        cd.RelativeColumn();
                });

                foreach (var row in signatureRows)
                {
                    int signsInRow = row.Count;

                    // Render each signature in the row following the layout rules
                    for (int index = 0; index < signsInRow; index++)
                    {
                        var signInfo = row[index];
                        var cell = table.Cell();

                        // Apply custom colspans and positional cells depending on the signature count in the row
                        if (signsInRow == 1)
                        {
                            cell.ColumnSpan(4);
                        }
                        else if (signsInRow == 2)
                        {
                            cell.ColumnSpan(2);
                        }
                        else if (signsInRow == 3)
                        {
                            if (index == 1)
                            {
                                cell.ColumnSpan(2);
                            }
                        }

                        // --- CAMBIO 1: Reducción del padding de la celda ---
                        // Reducimos el padding general de la celda de 2 a 1 para ganar espacio vertical.
                        cell.Padding(1).Column(signatureCol =>
                        {
                            // --- CAMBIO 2: Reducción de la altura de la imagen ---
                            // Reducimos la altura dedicada a la imagen de 80 a 55 para dejar espacio para la línea y el texto.
                            // Ajuste este valor si necesita la imagen más grande o más pequeña.
                            signatureCol.Item().Height(signatureAreaHeight).AlignCenter()
                                .Element(container =>
                                {
                                    if (signInfo.IsEmployee == true)
                                    {
                                        if (string.IsNullOrEmpty(signatureBase64))
                                        {
                                            // During preview, show a placeholder for the employee signature
                                            container.Border(1)
                                                .BorderColor(Colors.Grey.Lighten1)
                                                .AlignCenter()
                                                .AlignMiddle()
                                                .Text("[Firma del empleado]")
                                                .FontSize(7)
                                                .FontFamily(Fonts.Lato)
                                                .FontColor(Colors.Grey.Medium);
                                        }
                                        else
                                        {
                                            byte[] imageBytes = Convert.FromBase64String(signatureBase64);
                                            container.AlignCenter().AlignMiddle().Image(imageBytes).FitArea();
                                        }
                                    }
                                    else
                                    {
                                        // Try to load the signature image
                                        var signPath = Path.Combine(_env.WebRootPath, "img", signsPath, idCompany.ToString(), signInfo.SignFileName);
                                        if (System.IO.File.Exists(signPath))
                                        {
                                            // Image fills container while maintaining aspect ratio
                                            container.AlignCenter().AlignMiddle().Image(signPath).FitArea();
                                        }
                                        else
                                        {
                                            // File not found: show placeholder
                                            container.Border(1)
                                                    .BorderColor(Colors.Grey.Lighten1)
                                                    .AlignCenter()
                                                    .AlignMiddle()
                                                    .Text("[Imagen no encontrada]")
                                                    .FontSize(7)
                                                    .FontFamily(Fonts.Lato)
                                                    .FontColor(Colors.Grey.Medium);
                                        }
                                    }
                                });

                            //// --- CAMBIO 3: Ajuste de espaciado y grosor de línea ---
                            //// Reducimos el PaddingTop de 4 a 1 y aumentamos el grosor de la línea a 1.5 para mayor visibilidad.
                            //signatureCol.Item()
                            //    .AlignCenter()
                            //    .LineHorizontal(10f) // Línea ligeramente más gruesa
                            //    .LineColor(Colors.Black);

                            // Name label
                            // Reducimos el PaddingTop de 2 a 1.
                            signatureCol.Item().BorderBottom(1).PaddingBottom(1)
                                .AlignCenter()
                                .Text(signInfo.Name)
                                .FontSize(12)
                                .FontFamily(Fonts.Lato)
                                .FontColor(Colors.Black);
                            if (signInfo.IsEmployee ?? false)
                                signatureCol.Item()
                                   .AlignCenter()
                                   .Text("NOMBRE Y FIRMA COMPLETO DEL TRABAJADOR")
                                   .FontSize(8)
                                   .Bold()
                                   .FontFamily(Fonts.Lato)
                                   .FontColor(Colors.Black);
                        });
                    }
                }
            });
        }

        private void ComposeContractHeader(IContainer container, Company company, Employee employee, string contractTemplateName)
        {
            container.Column(column =>
            {
                column.Item().PaddingBottom(4).Row(row =>
                {
                    const float logoHeight = 48;
                    const float logoColWidth = 80;

                    var logoName = company.LogoName;
                    bool hasLogo = !string.IsNullOrEmpty(logoName);
                    string? logoPath = hasLogo
                        ? Path.Combine(_env.WebRootPath, "img", "logos", logoName!)
                        : null;
                    bool logoExists = logoPath != null && System.IO.File.Exists(logoPath);

                    row.ConstantItem(logoColWidth).AlignMiddle().AlignLeft()
                        .Element(e =>
                        {
                            if (logoExists)
                                e.Height(logoHeight).Image(logoPath!);
                        });

                    row.RelativeItem().AlignMiddle().Column(col =>
                    {
                        col.Item().AlignCenter().Text(contractTemplateName)
                            .Bold().FontSize(14).FontColor(Colors.Black);

                        var subtitle = company.RazonSocial ?? company.Name;
                        if (!string.IsNullOrWhiteSpace(subtitle))
                            col.Item().AlignCenter().PaddingTop(2)
                                .Text(subtitle.ToUpper())
                                .FontSize(9).FontColor(Colors.Grey.Darken2);

                        //col.Item().AlignCenter().PaddingTop(2)
                        //    .Text($"{employee.Nombre} {employee.ApellidoPaterno} {employee.ApellidoMaterno}".Trim())
                        //    .FontSize(10).FontColor(Colors.Grey.Darken1);
                    });

                    row.ConstantItem(logoColWidth);
                });

                column.Item().PaddingBottom(4).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
            });
        }

        /// <summary>Walks a node list and writes items into a QuestPDF ColumnDescriptor.</summary>
        private static void RenderNodes(ColumnDescriptor col, AsDom.INodeList nodes, bool compact = false)
        {
            foreach (var node in nodes)
                RenderNode(col, node, compact);
        }

        private static void RenderNode(ColumnDescriptor col, AsDom.INode node, bool compact = false)
        {
            // Skip bare text nodes at block level — they are only inter-element
            // whitespace in Tiptap HTML (newlines between <p>, <h1>, etc.).
            // Actual text content is handled by BuildInlineSpans inside each element.
            if (node is AsDom.IText) return;

            if (node is not AsDom.IElement el) return;

            switch (el.TagName.ToUpper())
            {
                case "P":
                    // Always render paragraph (even if empty) so line breaks are respected
                    var textContent = el.TextContent?.Trim() ?? "";
                    if (string.IsNullOrEmpty(textContent))
                    {
                        // Empty <p> = explicit line break between blocks (suppressed in compact mode)
                        if (!compact) col.Item().Height(10);
                    }
                    else
                    {
                        var pItem = col.Item().ExtendHorizontal();
                        if (!compact) pItem = pItem.PaddingBottom(8);
                        pItem.Text(t =>
                        {
                            ApplyTextAlign(t, el);
                            BuildInlineSpans(t, el);
                        });
                    }
                    break;

                case "H1":
                    col.Item().ExtendHorizontal().PaddingTop(6).PaddingBottom(8)
                        .DefaultTextStyle(s => s.FontSize(22).Bold())
                        .Text(t =>
                        {
                            ApplyTextAlign(t, el);
                            BuildInlineSpans(t, el);
                        });
                    break;

                case "H2":
                    col.Item().ExtendHorizontal().PaddingTop(5).PaddingBottom(7)
                        .DefaultTextStyle(s => s.FontSize(17).Bold())
                        .Text(t =>
                        {
                            ApplyTextAlign(t, el);
                            BuildInlineSpans(t, el);
                        });
                    break;

                case "H3":
                    col.Item().ExtendHorizontal().PaddingTop(4).PaddingBottom(6)
                        .DefaultTextStyle(s => s.FontSize(13).Bold())
                        .Text(t =>
                        {
                            ApplyTextAlign(t, el);
                            BuildInlineSpans(t, el);
                        });
                    break;

                case "BLOCKQUOTE":
                    col.Item().BorderLeft(3).BorderColor(Colors.Grey.Lighten1)
                        .PaddingLeft(8).PaddingVertical(4).PaddingBottom(8).Column(inner =>
                        {
                            RenderNodes(inner, el.ChildNodes, compact);
                        });
                    break;

                case "UL":
                case "OL":
                    RenderList(col, el);
                    break;

                case "TABLE":
                    RenderTable(col, el);
                    if (!compact) col.Item().Height(8); // spacing after table
                    break;

                case "BR":
                    // Block-level <br> adds vertical spacing (suppressed in compact mode)
                    if (!compact) col.Item().Height(10);
                    break;

                case "HR":
                    col.Item().PaddingVertical(6).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                    break;

                case "IMG":
                    // base64 images embedded by Tiptap
                    var src = el.GetAttribute("src") ?? "";
                    if (src.StartsWith("data:image"))
                    {
                        try
                        {
                            var base64 = src[(src.IndexOf(',') + 1)..];
                            var bytes = Convert.FromBase64String(base64);
                            var widthAttr = el.GetAttribute("width");
                            float imgWidth = float.TryParse(widthAttr, out var w) ? w : 400;
                            var alignAttr = el.GetAttribute("data-align") ?? "left";
                            var item = col.Item().PaddingVertical(4);
                            switch (alignAttr)
                            {
                                case "center": item.AlignCenter().MaxWidth(imgWidth).Image(bytes); break;
                                case "right": item.AlignRight().MaxWidth(imgWidth).Image(bytes); break;
                                default: item.AlignLeft().MaxWidth(imgWidth).Image(bytes); break;
                            }
                        }
                        catch { /* skip unreadable images */ }
                    }
                    break;

                default:
                    // Dive into any other container elements
                    RenderNodes(col, el.ChildNodes, compact);
                    break;
            }
        }

        private static void RenderList(ColumnDescriptor col, AsDom.IElement listEl)
        {
            var isOrdered = listEl.TagName.Equals("OL", StringComparison.OrdinalIgnoreCase);
            var items = listEl.QuerySelectorAll("li");
            int counter = 1;

            col.Item().PaddingBottom(8).Column(listCol =>
            {
                foreach (var li in items)
                {
                    var bullet = isOrdered ? $"{counter++}." : "•";

                    // A <li> may contain block children (e.g. <p>, <br>) or just inline text.
                    // If it has block-level children, render them inside a nested column
                    // so that <br> and multiple <p> inside one <li> are respected.
                    var hasBlockChildren = li.ChildNodes
                        .OfType<AsDom.IElement>()
                        .Any(c =>
                        {
                            var tag = c.TagName.ToUpper();
                            return tag == "P" || tag == "UL" || tag == "OL"
                                || tag == "H1" || tag == "H2" || tag == "H3"
                                || tag == "BLOCKQUOTE" || tag == "TABLE" || tag == "HR";
                        });

                    var bulletFontSize = GetListItemFontSize(li);
                    listCol.Item().PaddingBottom(2).Row(row =>
                    {
                        row.ConstantItem(20).Text(t =>
                        {
                            var s = t.Span(bullet);
                            if (bulletFontSize.HasValue) s.FontSize(bulletFontSize.Value);
                        });

                        if (hasBlockChildren)
                        {
                            // Render each block child (P, BR…) in a nested column
                            row.RelativeItem().Column(liCol =>
                            {
                                RenderNodes(liCol, li.ChildNodes);
                            });
                        }
                        else
                        {
                            // Pure inline content — single text span
                            var paragraph = li.QuerySelector("p");
                            row.RelativeItem().Text(t =>
                            {
                                if (paragraph != null)
                                    ApplyTextAlign(t, paragraph);
                                BuildInlineSpans(t, li);
                            });
                        }
                    });
                }
            });
        }

        /// <summary>
        /// Returns the font-size (in pt) of the first styled span found inside a list item,
        /// or null if no explicit font-size is present. Used to keep the bullet/number
        /// visually consistent with the item text.
        /// </summary>
        private static float? GetListItemFontSize(AsDom.IElement li)
        {
            var span = li.QuerySelector("span[style]");
            if (span == null) return null;

            var style = span.GetAttribute("style") ?? "";
            var match = System.Text.RegularExpressions.Regex
                .Match(style, @"font-size:\s*([\d.]+)px");
            if (!match.Success) return null;

            if (float.TryParse(match.Groups[1].Value,
                System.Globalization.NumberStyles.Float,
                System.Globalization.CultureInfo.InvariantCulture,
                out var px))
                return px * 0.75f; // CSS px → PDF pt

            return null;
        }

        private static void RenderTable(ColumnDescriptor col, AsDom.IElement tableEl)
        {
            var rows = tableEl.QuerySelectorAll("tr").ToList();
            if (rows.Count == 0) return;

            // Determine column count accounting for colspan values
            int colCount = rows.Max(r =>
                r.QuerySelectorAll("td, th").Sum(c =>
                {
                    var cs = c.GetAttribute("colspan");
                    return int.TryParse(cs, out var n) && n > 1 ? n : 1;
                }));
            if (colCount == 0) return;

            bool tableBorderless = tableEl.GetAttribute("data-borderless") == "true";

            col.Item().PaddingVertical(6).Table(table =>
            {
                table.ColumnsDefinition(cd =>
                {
                    for (int i = 0; i < colCount; i++)
                        cd.RelativeColumn();
                });

                foreach (var row in rows)
                {
                    var cells = row.QuerySelectorAll("td, th").ToList();
                    bool isHeader = cells.Any(c => c.TagName.Equals("TH", StringComparison.OrdinalIgnoreCase));

                    // Parse optional fixed row height (e.g. data-row-height="40px")
                    float? rowHeightPt = null;
                    var rowHeightAttr = row.GetAttribute("data-row-height");
                    if (!string.IsNullOrWhiteSpace(rowHeightAttr))
                    {
                        var digits = rowHeightAttr.Replace("px", "").Trim();
                        if (float.TryParse(digits,
                            System.Globalization.NumberStyles.Float,
                            System.Globalization.CultureInfo.InvariantCulture,
                            out var px))
                            rowHeightPt = px * 0.75f; // CSS px → PDF points
                    }

                    // Calculate columns already consumed by explicit cells (with colspan)
                    int consumed = cells.Sum(c =>
                    {
                        var cs = c.GetAttribute("colspan");
                        return int.TryParse(cs, out var n) && n > 1 ? n : 1;
                    });

                    // Pad remaining empty columns
                    int emptyCols = colCount - consumed;

                    foreach (var cell in cells)
                    {
                        var colspanAttr = cell.GetAttribute("colspan");
                        int colspan = int.TryParse(colspanAttr, out var cs) && cs > 1 ? cs : 1;

                        var rowspanAttr = cell.GetAttribute("rowspan");
                        int rowspan = int.TryParse(rowspanAttr, out var rs) && rs > 1 ? rs : 1;

                        bool cellBorderless = tableBorderless || cell.GetAttribute("data-borderless") == "true";

                        var cellBase = table.Cell();
                        if (colspan > 1) cellBase = cellBase.ColumnSpan((uint)colspan);
                        if (rowspan > 1) cellBase = cellBase.RowSpan((uint)rowspan);

                        // Border first (ITableCellContainer → IContainer)
                        IContainer cellContainer = cellBorderless
                            ? cellBase.Border(0)
                            : cellBase.Border(0.5f).BorderColor(Colors.Grey.Lighten1);

                        // Apply fixed row height on IContainer (where MinHeight lives)
                        if (rowHeightPt.HasValue)
                            cellContainer = cellContainer.MinHeight(rowHeightPt.Value);

                        float cellPadding = rowHeightPt.HasValue ? 2 : 5;
                        var paddedCell = isHeader && !cellBorderless
                            ? cellContainer.Background(Colors.Grey.Lighten3).Padding(cellPadding)
                            : cellContainer.Padding(cellPadding);

                        // Detect block-level children (img, p, ul, etc.) that cannot
                        // be rendered inside a TextDescriptor — use a Column instead.
                        bool cellHasBlockContent = cell.ChildNodes
                            .OfType<AsDom.IElement>()
                            .Any(c =>
                            {
                                var tag = c.TagName.ToUpper();
                                return tag == "IMG" || tag == "P" || tag == "UL" || tag == "OL"
                                    || tag == "H1" || tag == "H2" || tag == "H3"
                                    || tag == "TABLE" || tag == "HR" || tag == "BLOCKQUOTE";
                            });

                        if (rowHeightPt.HasValue)
                        {
                            // Compact: render inline directly, font scaled to fit the row
                            // available = rowHeight - top padding - bottom padding
                            float availableForText = rowHeightPt.Value - cellPadding * 2;
                            // QuestPDF needs ~1.3× the font size for a single text line
                            float compactFontSize = Math.Clamp(availableForText / 1.3f, 5f, 11f);
                            var firstP = cell.QuerySelector("p");
                            paddedCell
                                .DefaultTextStyle(s => s.FontSize(compactFontSize))
                                .Text(t =>
                                {
                                    if (firstP != null) ApplyTextAlign(t, firstP);
                                    BuildInlineSpans(t, cell);
                                    if (isHeader) t.DefaultTextStyle(s => s.Bold());
                                });
                        }
                        else if (cellHasBlockContent)
                        {
                            paddedCell.Column(cellCol =>
                            {
                                RenderNodes(cellCol, cell.ChildNodes);
                            });
                        }
                        else
                        {
                            paddedCell.Text(t =>
                            {
                                BuildInlineSpans(t, cell);
                                if (isHeader) t.DefaultTextStyle(s => s.Bold());
                            });
                        }
                    }

                    // Fill remaining columns with empty cells
                    for (int i = 0; i < emptyCols; i++)
                    {
                        IContainer emptyCell = tableBorderless
                            ? table.Cell().Border(0)
                            : table.Cell().Border(0.5f).BorderColor(Colors.Grey.Lighten1);
                        if (rowHeightPt.HasValue)
                            emptyCell = emptyCell.MinHeight(rowHeightPt.Value);
                        emptyCell.Padding(rowHeightPt.HasValue ? 2 : 4).Text("");
                    }
                }
            });
        }

        /// <summary>
        /// Recursively builds QuestPDF inline text spans for an element's children,
        /// honouring bold, italic, underline, strike, color and font-size.
        /// <paramref name="inherited"/> carries the accumulated parent style so all
        /// ancestor properties (font-size, font-family, bold…) compose correctly.
        /// </summary>
        private static void BuildInlineSpans(TextDescriptor t, AsDom.IElement el, Func<TextSpanDescriptor, TextSpanDescriptor>? inherited = null)
        {
            foreach (var child in el.ChildNodes)
            {
                if (child is AsDom.IText textNode)
                {
                    var content = textNode.TextContent;
                    if (!string.IsNullOrEmpty(content))
                    {
                        var s = t.Span(content);
                        inherited?.Invoke(s);
                    }
                    continue;
                }

                if (child is not AsDom.IElement childEl) continue;

                switch (childEl.TagName.ToUpper())
                {
                    case "STRONG":
                    case "B":
                        {
                            // Build a style that first applies inherited, then adds Bold
                            Func<TextSpanDescriptor, TextSpanDescriptor> boldStyle = s =>
                            {
                                if (inherited != null) s = inherited(s);
                                return s.Bold();
                            };
                            ApplyFormattedChildren(t, childEl, boldStyle);
                            break;
                        }
                    case "EM":
                    case "I":
                        {
                            Func<TextSpanDescriptor, TextSpanDescriptor> italicStyle = s =>
                            {
                                if (inherited != null) s = inherited(s);
                                return s.Italic();
                            };
                            ApplyFormattedChildren(t, childEl, italicStyle);
                            break;
                        }
                    case "U":
                        {
                            Func<TextSpanDescriptor, TextSpanDescriptor> underlineStyle = s =>
                            {
                                if (inherited != null) s = inherited(s);
                                return s.Underline();
                            };
                            ApplyFormattedChildren(t, childEl, underlineStyle);
                            break;
                        }
                    case "S":
                    case "DEL":
                        {
                            Func<TextSpanDescriptor, TextSpanDescriptor> strikeStyle = s =>
                            {
                                if (inherited != null) s = inherited(s);
                                return s.Strikethrough();
                            };
                            ApplyFormattedChildren(t, childEl, strikeStyle);
                            break;
                        }
                    case "CODE":
                        {
                            var codeSpan = t.Span(GetText(childEl))
                                .FontFamily(Fonts.CourierNew)
                                .BackgroundColor(Colors.Grey.Lighten3);
                            inherited?.Invoke(codeSpan);
                            break;
                        }
                    case "SPAN":
                        ApplySpanStyle(t, childEl, inherited);
                        break;
                    case "A":
                        {
                            var linkSpan = t.Hyperlink(GetText(childEl), childEl.GetAttribute("href") ?? "#");
                            inherited?.Invoke(linkSpan);
                            break;
                        }
                    case "BR":
                        t.Span("\n");
                        break;
                    default:
                        BuildInlineSpans(t, childEl, inherited);
                        break;
                }
            }
        }

        /// <summary>
        /// Emits one span per text node inside <paramref name="el"/>, applying
        /// <paramref name="style"/> to each. When recursing into nested inline
        /// elements, composes <paramref name="style"/> with the element-specific
        /// style so descendant spans receive all ancestor styles.
        /// </summary>
        private static void ApplyFormattedChildren(TextDescriptor t, AsDom.IElement el, Func<TextSpanDescriptor, TextSpanDescriptor> style)
        {
            foreach (var child in el.ChildNodes)
            {
                if (child is AsDom.IText txt)
                {
                    var content = txt.TextContent;
                    if (!string.IsNullOrEmpty(content))
                    {
                        var s = t.Span(content);
                        style(s);
                    }
                }
                else if (child is AsDom.IElement nested)
                {
                    // Must handle all inline formatting tags here too.
                    // Calling BuildInlineSpans(t, nested, style) with nested=<strong>
                    // would make <strong> the "el" parameter, so its text children
                    // would only receive `style` (inherited) and never get Bold applied.
                    switch (nested.TagName.ToUpper())
                    {
                        case "BR":
                            t.Span("\n");
                            break;
                        case "STRONG":
                        case "B":
                            {
                                Func<TextSpanDescriptor, TextSpanDescriptor> composed = s =>
                                {
                                    s = style(s);
                                    return s.Bold();
                                };
                                ApplyFormattedChildren(t, nested, composed);
                                break;
                            }
                        case "EM":
                        case "I":
                            {
                                Func<TextSpanDescriptor, TextSpanDescriptor> composed = s =>
                                {
                                    s = style(s);
                                    return s.Italic();
                                };
                                ApplyFormattedChildren(t, nested, composed);
                                break;
                            }
                        case "U":
                            {
                                Func<TextSpanDescriptor, TextSpanDescriptor> composed = s =>
                                {
                                    s = style(s);
                                    return s.Underline();
                                };
                                ApplyFormattedChildren(t, nested, composed);
                                break;
                            }
                        case "S":
                        case "DEL":
                            {
                                Func<TextSpanDescriptor, TextSpanDescriptor> composed = s =>
                                {
                                    s = style(s);
                                    return s.Strikethrough();
                                };
                                ApplyFormattedChildren(t, nested, composed);
                                break;
                            }
                        case "SPAN":
                            ApplySpanStyle(t, nested, style);
                            break;
                        default:
                            BuildInlineSpans(t, nested, style);
                            break;
                    }
                }
            }
        }

        /// <summary>
        /// Reads the CSS text-align value from an element's style attribute
        /// and sets the matching QuestPDF alignment on the TextDescriptor.
        /// Left alignment is the QuestPDF default so it is intentionally skipped.
        /// </summary>
        private static void ApplyTextAlign(TextDescriptor t, AsDom.IElement el)
        {
            var style = el.GetAttribute("style") ?? "";
            var match = System.Text.RegularExpressions.Regex
                .Match(style, @"text-align:\s*(\w+)");
            if (!match.Success) return;

            switch (match.Groups[1].Value.ToLowerInvariant())
            {
                case "center": t.AlignCenter(); break;
                case "right": t.AlignRight(); break;
                case "justify": t.Justify(); break;
                    // "left" is the default — nothing to do
            }
        }

        private static void ApplySpanStyle(TextDescriptor t, AsDom.IElement span, Func<TextSpanDescriptor, TextSpanDescriptor>? inherited = null)
        {
            var style = span.GetAttribute("style") ?? "";

            // Parse all CSS properties from the style attribute
            var colorMatch = System.Text.RegularExpressions.Regex
                .Match(style, @"color:\s*(#[0-9a-fA-F]{3,6}|rgb\([^)]+\))");
            var sizeMatch = System.Text.RegularExpressions.Regex
                .Match(style, @"font-size:\s*([\d.]+)px");
            var familyMatch = System.Text.RegularExpressions.Regex
                .Match(style, @"font-family:\s*([^;]+)");

            bool hasBold = style.Contains("font-weight: bold") || style.Contains("font-weight:bold");
            bool hasItalic = style.Contains("font-style: italic") || style.Contains("font-style:italic");
            bool hasUnderline = style.Contains("text-decoration: underline") || style.Contains("text-decoration:underline");
            bool hasStrike = style.Contains("text-decoration: line-through") || style.Contains("text-decoration:line-through");

            // Build a composite style: first apply inherited parent styles,
            // then overlay this span's own CSS properties on top.
            Func<TextSpanDescriptor, TextSpanDescriptor> styleFunc = s =>
            {
                if (inherited != null) s = inherited(s);

                if (colorMatch.Success)
                {
                    var hex = CssColorToHex(colorMatch.Groups[1].Value);
                    if (hex != null) s = s.FontColor(hex);
                }

                if (sizeMatch.Success && float.TryParse(sizeMatch.Groups[1].Value,
                    System.Globalization.NumberStyles.Float,
                    System.Globalization.CultureInfo.InvariantCulture, out var px))
                {
                    s = s.FontSize(px * 0.75f); // px → pt
                }

                if (familyMatch.Success)
                {
                    var family = NormalizeFontFamily(familyMatch.Groups[1].Value);
                    if (family != null) s = s.FontFamily(family);
                }

                if (hasBold) s = s.Bold();
                if (hasItalic) s = s.Italic();
                if (hasUnderline) s = s.Underline();
                if (hasStrike) s = s.Strikethrough();

                return s;
            };

            // styleFunc becomes the inherited context for any nested elements
            // (strong, em, span…) so they receive all accumulated styles.
            ApplyFormattedChildren(t, span, styleFunc);
        }

        /// <summary>
        /// Strips CSS quoting and maps the first listed font family to a clean
        /// name that SkiaSharp / QuestPDF can resolve on the host OS.
        /// Returns null when the name cannot be mapped.
        /// </summary>
        private static string? NormalizeFontFamily(string css)
        {
            // CSS may list multiple families: "Arial", sans-serif
            // Take only the first token, strip quotes and whitespace.
            var first = css.Split(',')[0]
                           .Trim()
                           .Trim('"', '\'', '\u2018', '\u2019', '\u201C', '\u201D');

            // Map common aliases to canonical names understood by Skia/OS fonts
            return first.ToLowerInvariant() switch
            {
                "lato" => Fonts.Lato,
                "arial" => "Arial",
                "helvetica" => "Arial",  // fallback
                "helvetica neue" => "Arial",
                "times new roman" or "times" => "Times New Roman",
                "courier new" or "courier" => Fonts.CourierNew,
                "georgia" => "Georgia",
                "verdana" => Fonts.Verdana,
                "trebuchet ms" or "trebuchet" => "Trebuchet MS",
                "tahoma" => "Tahoma",
                "calibri" => "Calibri",
                "sans-serif" or "serif" or "monospace" or "cursive" or "fantasy" => null,
                _ => string.IsNullOrWhiteSpace(first) ? null : first
            };
        }

        private static string GetText(AsDom.IElement el) => el.TextContent;

        private static string? CssColorToHex(string css)
        {
            if (css.StartsWith('#')) return css;
            if (css.StartsWith("rgb("))
            {
                var parts = css.Replace("rgb(", "").Replace(")", "")
                               .Split(',').Select(s => s.Trim()).ToArray();
                if (parts.Length == 3
                    && int.TryParse(parts[0], out var r)
                    && int.TryParse(parts[1], out var g)
                    && int.TryParse(parts[2], out var b))
                    return $"#{r:X2}{g:X2}{b:X2}";
            }
            return null;
        }
        #endregion
    }
}
