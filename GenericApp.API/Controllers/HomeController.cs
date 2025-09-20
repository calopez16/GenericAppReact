using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace GenericApp.Controllers
{
    [ApiController]
    [Route("home")]
    public class HomeController : ControllerBase
    {
        // GET: HomeController
        [HttpGet]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "admin")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "user")]
        public ActionResult Index()
        {
            return Ok(new
            {
                Aver = "a123"
            });
        }
    }
}
