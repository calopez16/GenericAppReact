using AutoMapper;
using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GenericApp.Controllers
{
    [ApiController]
    [Route("configuration")]
    public class ConfigurationController : ControllerBase
    {
        private const string AllowedUserName = "admin";
        private readonly IRepository _repository;

        public ConfigurationController(
          IRepository repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var p1 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P1");
            var p2 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P2");
            var p3 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P3");
            var p4 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P4");
            var p5 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P5");

            var configuration = new ConfigurationDTO
            {
                IsMultilaguageEnable = p1?.Value != null ? bool.TryParse(p1.Value, out var v1) && v1 : false,
                DefaultLanguage = p2?.Value,
                IsChooseThemeEnable = p3?.Value != null ? bool.TryParse(p3.Value, out var v3) && v3 : false,
                DefaultTheme = p4?.Value,
                IsMultiCompanyEnable = p5?.Value != null ? bool.TryParse(p5.Value, out var v5) && v5 : false,
            };

            return Ok(new ApiResponse { Data = configuration });
        }

        /// <summary>
        /// Actualiza una entidad Client existente.
        /// </summary>
        /// <param name="model">El ClientDTO con los datos actualizados.</param>
        /// <returns>La entidad Client actualizada o un conflicto si ya existe otro cliente con el mismo nombre o RFC.</returns>
        [HttpPut]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
        public async Task<ActionResult> Update([FromBody] ConfigurationDTO model)
        {
            var userName = User.FindFirstValue(ClaimTypes.Email);
            var isAdmin = User.IsInRole(nameof(AppRoles.Administrator));

            if (!isAdmin && !string.Equals(userName, AllowedUserName, StringComparison.OrdinalIgnoreCase))
                return Unauthorized();

            var p1 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P1");
            var p2 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P2");
            var p3 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P3");
            var p4 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P4");
            var p5 = await _repository.FirstOrDefault<Parameter>(p => p.ParameterCode == "P5");

            if (p1 != null)
                p1.Value = model.IsMultilaguageEnable.HasValue ? model.IsMultilaguageEnable.Value.ToString().ToLower() : p1.Value;

            if (p2 != null)
                p2.Value = model.DefaultLanguage ?? p2.Value;

            if (p3 != null)
                p3.Value = model.IsChooseThemeEnable.HasValue ? model.IsChooseThemeEnable.Value.ToString().ToLower() : p3.Value;

            if (p4 != null)
                p4.Value = model.DefaultTheme ?? p4.Value;
            if (p5 != null)
                p5.Value = model.IsMultiCompanyEnable.HasValue ? model.IsMultiCompanyEnable.Value.ToString().ToLower() : p5.Value;

            var result = (p1 == null || await _repository.Update(p1))
                      && (p2 == null || await _repository.Update(p2))
                      && (p3 == null || await _repository.Update(p3))
                      && (p4 == null || await _repository.Update(p4))
                      && (p5 == null || await _repository.Update(p5));

            if (!result)
                return BadRequest(new ApiResponse());

            return Ok(new ApiResponse { Data = model });
        }

    }
}