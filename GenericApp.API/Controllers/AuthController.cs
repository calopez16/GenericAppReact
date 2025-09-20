using GenericApp.API.Constants;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using GenericApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.IdentityModel.Tokens;
using Microsoft.VisualBasic;
using System.IdentityModel.Tokens.Jwt;
using System.Reflection.Metadata.Ecma335;
using System.Runtime.Serialization;
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

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            var user = await _userManager.FindByNameAsync(loginDTO.Email);
            var claims = await _userManager.GetClaimsAsync(user);
            var isChangePasswordNeeded = false;
            if (claims != null)
            {
                if (claims.Any(x => x.Type == AppClaims.IsDisabled))
                    return Unauthorized();
                isChangePasswordNeeded = claims.Any(x => x.Type == AppClaims.IsChangePasswordNeeded);
            }

            var resultado = await _signInManager.PasswordSignInAsync(loginDTO.Email, loginDTO.Password, isPersistent: false, lockoutOnFailure: false);
            if (!resultado.Succeeded)
                return Unauthorized();
            var accessToken = await GenerateToken(loginDTO);
            var refreshToken = "";
            var actualRefreshToken = await _repository.FirstOrDefault<RefreshTokenAspNetUser>(x => x.IdUser == user.Id && x.IsActive == true);
            if (actualRefreshToken == null)
            {
                refreshToken = await GenerateToken(loginDTO, true);
                await _repository.Add<RefreshTokenAspNetUser>(new RefreshTokenAspNetUser { IdUser = user.Id, RefreshToken = refreshToken, IsActive = true });
            }
            else
            {
                var validator = new JwtSecurityTokenHandler();
                var tokenValidated = await validator.ValidateTokenAsync(actualRefreshToken.RefreshToken, new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = false,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["jwt:RefreshToken:SecurityKeyJwt"])),
                    ClockSkew = TimeSpan.Zero
                });
                if (!tokenValidated.IsValid)
                {
                    actualRefreshToken.IsActive = false;
                    await _repository.Update<RefreshTokenAspNetUser>(actualRefreshToken);
                    refreshToken = await GenerateToken(loginDTO, true);
                    await _repository.Add<RefreshTokenAspNetUser>(new RefreshTokenAspNetUser { IdUser = user.Id, RefreshToken = refreshToken, IsActive = true });
                }
            }

            return Ok(new LoginResponseDTO
            {
                Token = accessToken,
                UserName = user.UserName,
                FullName = user.UserName,
                IsChangePasswordNeeded = isChangePasswordNeeded
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
                var emailUser = tokenInfo.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email);
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

        [HttpPost("pass-restart")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "IsChangePasswordNeeded")]
        public async Task<ActionResult<LoginResponseDTO>> RestartPassword([FromBody] string newPassword)
        {
            var validator = new JwtSecurityTokenHandler();
            Request.Headers.TryGetValue("Authorization", out var headerAuth);
            var jwtToken = headerAuth.FirstOrDefault()?.Split(" ").Last();
            if (jwtToken != null)
            {
                var tokenInfo = validator.ReadJwtToken(jwtToken);
                var emailUser = tokenInfo.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Email);
                var user = await _userManager.FindByNameAsync(emailUser?.Value);
                if (user != null)
                {
                    var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
                    var changePasswordResult = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);
                    if (changePasswordResult.Succeeded)
                    {
                        await _userManager.RemoveClaimAsync(user, new Claim(AppClaims.IsChangePasswordNeeded, "1"));
                        await _userManager.AddClaimAsync(user, new Claim(AppClaims.IsUser, "1"));

                        var loginDTO = new LoginDTO { Email = user.Email };
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
                            FullName = user.UserName,
                        });
                    }
                }





            }
            return Unauthorized();
        }

        [HttpPost("AllowClaim")]
        public async Task<ActionResult> AllowClaim(LoginDTO loginDTO)
        {
            var user = await _userManager.FindByEmailAsync(loginDTO.Email);
            await _userManager.AddClaimAsync(user, new Claim(AppClaims.IsAdmin, "1"));
            return NoContent();

        }

        [HttpPost("RemoveClaim")]
        public async Task<ActionResult> RemoveClaim(LoginDTO loginDTO)
        {
            var user = await _userManager.FindByEmailAsync(loginDTO.Email);
            await _userManager.RemoveClaimAsync(user, new Claim(AppClaims.IsAdmin, "1"));
            return NoContent();

        }

        private async Task<string> GenerateToken(LoginDTO loginDTO, bool refreshToken = false)
        {
            try
            {

                var claims = new List<Claim>
                {
                    new(ClaimTypes.Email, loginDTO.Email)
                };

                var user = await _userManager.FindByNameAsync(loginDTO.Email);
                var claimsDB = await _userManager.GetClaimsAsync(user);
                claims.AddRange(claimsDB);
                var roles = await _userManager.GetRolesAsync(user);
                foreach (var role in roles)
                    claims.Add(new Claim(ClaimTypes.Role, role));

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
