using GenericApp.API.Constants;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GenericApp.Controllers
{
    [ApiController]
    [Route("configuration")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User))]
    public class ConfigurationController : ControllerBase
    {
        private const string AllowedUserName = "admin";

        [HttpGet]
        public IActionResult Get()
        {
            var userName = User.FindFirstValue(ClaimTypes.Email);
            var isAdmin = User.IsInRole(nameof(AppRoles.Administrator));

            if (!isAdmin && !string.Equals(userName, AllowedUserName, StringComparison.OrdinalIgnoreCase))
                return Forbid();

            return Ok(new { });
        }
    }
}
