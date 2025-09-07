using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using GenericApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection.Metadata.Ecma335;
using System.Security.Claims;
using System.Text;

namespace GenericApp.Controllers
{
    [ApiController]
    [Route("Auth")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly SignInManager<IdentityUser> _signInManager;
        private readonly IRepository _repository;

        public AuthController(
            UserManager<IdentityUser> userManager,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager,
            IRepository repository)
        {
            _userManager = userManager;
            _configuration = configuration;
            _signInManager = signInManager;
            _repository = repository;
        }

        //[HttpPost("register")]
        //public async Task<IActionResult> Register(LoginDTO loginDTO)
        //{
        //    var result = await _userManager.CreateAsync(new IdentityUser
        //    {
        //        UserName = loginDTO.Email,
        //        Email = loginDTO.Email
        //    }, loginDTO.Password);

        //    if (!result.Succeeded)
        //        return BadRequest(result.Errors);
        //    var token = await GenerateToken(loginDTO);
        //    return Ok(token);
        //}

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            var resultado = await _signInManager.PasswordSignInAsync(loginDTO.Email, loginDTO.Password, isPersistent: false, lockoutOnFailure: false);
            if (!resultado.Succeeded)
                return Unauthorized();
            var user = await _userManager.FindByNameAsync(loginDTO.Email);
            var accessToken = await GenerateToken(loginDTO);
            var refreshToken = await GenerateToken(loginDTO, true);

            var actualRefreshToken = await _repository.FirstOrDefault<RefreshTokenAspNetUser>(x => x.IdUser == user.Id && x.IsActive == true);
            if (actualRefreshToken != null)
            {
                actualRefreshToken.IsActive = false;
                await _repository.Update<RefreshTokenAspNetUser>(actualRefreshToken);
            }
            await _repository.Add<RefreshTokenAspNetUser>(new RefreshTokenAspNetUser { IdUser = user.Id, RefreshToken = refreshToken, IsActive = true });

            return Ok(new LoginResponseDTO
            {
                Token = accessToken,
                UserName = user.UserName,
                FullName = user.UserName
            });
        }

        [HttpGet("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var validator = new JwtSecurityTokenHandler();
            Request.Headers.TryGetValue("Authorization", out var headerAuth);
            var jwtToken = headerAuth.FirstOrDefault()?.Split(" ").Last();
            if (jwtToken != null)
            {

                var tokenInfo = validator.ReadJwtToken(jwtToken);
                var emailUser = tokenInfo.Claims.FirstOrDefault(x => x.Type.Equals("email"));
                var user = await _userManager.FindByNameAsync(emailUser?.Value);
                var actualRefreshToken = await _repository.FirstOrDefault<RefreshTokenAspNetUser>(x => x.IdUser == user.Id && x.IsActive == true);
                var tokenValidated = await validator.ValidateTokenAsync(actualRefreshToken.RefreshToken, new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = false,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["jwt:RefreshToken:SecurityKeyJwt"])),
                    ClockSkew = TimeSpan.Zero
                });
                if (tokenValidated.IsValid)
                {
                    var newAccessToken = await GenerateToken(new LoginDTO { Email = user.UserName });
                    return Ok(new LoginResponseDTO
                    {
                        Token = newAccessToken,
                        UserName = user.UserName,
                        FullName = user.UserName
                    });
                }
            }
            return Unauthorized();
        }

        //[HttpPost("pass-restart")]
        ////[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "admin")]
        //public async Task<ActionResult<LoginResponseDTO>> RefreshToken2(string email)
        //{
        //    var user = await _userManager.FindByEmailAsync(email);
        //    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        //    await _userManager.ResetPasswordAsync(user, resetToken, "Admin123!");
        //    return Ok();
        //}

        [HttpPost("AllowClaim")]
        public async Task<ActionResult> AllowClaim(LoginDTO loginDTO)
        {
            var user = await _userManager.FindByEmailAsync(loginDTO.Email);
            await _userManager.AddClaimAsync(user, new Claim("isAdmin", "1"));
            return NoContent();

        }

        [HttpPost("RemoveClaim")]
        public async Task<ActionResult> RemoveClaim(LoginDTO loginDTO)
        {
            var user = await _userManager.FindByEmailAsync(loginDTO.Email);
            await _userManager.RemoveClaimAsync(user, new Claim("isAdmin", "1"));
            return NoContent();

        }

        private async Task<string> GenerateToken(LoginDTO loginDTO, bool refreshToken = false)
        {
            try
            {

                var claims = new List<Claim>
            {
                new("email", loginDTO.Email)
            };

                var user = await _userManager.FindByEmailAsync(loginDTO.Email);
                var claimsDB = await _userManager.GetClaimsAsync(user);
                claims.AddRange(claimsDB);

                var SecurityKeyJwtFromConfig = !refreshToken ? _configuration["jwt:SecurityKeyJwt"] : _configuration["jwt:RefreshToken:SecurityKeyJwt"];
                var TokenExpirationTimeFromConfig = !refreshToken ? _configuration["jwt:ExpirationInMinutes"] : _configuration["jwt:RefreshToken:ExpirationInDays"];
                int.TryParse(TokenExpirationTimeFromConfig ?? "0", out int tokenExpirationTime);

                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SecurityKeyJwtFromConfig));
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
                var expirationDate = !refreshToken ? DateTime.Now.AddMinutes(tokenExpirationTime) : DateTime.Now.AddDays(tokenExpirationTime);
                var securityToken = new JwtSecurityToken(
                    issuer: null,
                    audience: null,
                    claims: claims,
                    expires: expirationDate,
                    signingCredentials: credentials);

                return new JwtSecurityTokenHandler().WriteToken(securityToken);
            }
            catch (Exception)
            {
                return null;
            }
        }


    }
}
