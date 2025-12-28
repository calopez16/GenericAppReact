using GenericApp.API.Constants;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data.Models;
using GenericApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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

        /// <summary>
        /// Realiza el login del usuario, valida credenciales y genera tokens de acceso y refresco.
        /// </summary>
        /// <param name="loginDTO">Objeto que contiene el email y la contraseña del usuario.</param>
        /// <returns>Un token de acceso y un token de refresco (si es necesario), o Unauthorized si las credenciales son inválidas o el usuario está deshabilitado.</returns>
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDTO loginDTO)
        {
            var user = await _userManager.FindByNameAsync(loginDTO.Email);
            if (user == null)
                return Unauthorized();
            var claims = await _userManager.GetClaimsAsync(user);
            var isChangePasswordNeeded = false;
            if (claims != null)
            {
                if (claims.Any(x => x.Type == nameof(AppPolicies.IsDisabled)))
                    return Unauthorized();
                isChangePasswordNeeded = claims.Any(x => x.Type == nameof(AppPolicies.IsChangePasswordNeeded));
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

            var userRoles = await _userManager.GetRolesAsync(user);
            var userDetail = await _repository.FirstOrDefault<UserDetail>(x => x.IdUser.Equals(user.Id));
            var company = await _repository.FirstOrDefault<Company>(x => x.IdCompany.Equals(userDetail.IdCompany));

            return Ok(new
            {
                Data = new LoginResponseDTO
                {
                    Token = accessToken,
                    UserName = user.UserName,
                    FullName = user.UserName,
                    IsChangePasswordNeeded = isChangePasswordNeeded,
                    Roles = userRoles.ToList(),
                    IdCompany = userDetail?.IdCompany,
                    Company = company != null ? new API.Models.CompanyDTO
                    {
                        IdCompany = company.IdCompany,
                        Name = company.Name,
                        LogoName = company.LogoName
                    } : null,
                }
            });
        }

        /// <summary>
        /// Renueva el token de acceso (AccessToken) utilizando un token de refresco (RefreshToken) válido contenido en el header de autorización.
        /// </summary>
        /// <returns>Un nuevo token de acceso si el RefreshToken es válido, o Unauthorized si el token no es válido o ha expirado.</returns>
        [HttpGet("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            try
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
                        return Ok(new
                        {
                            Data = new LoginResponseDTO
                            {
                                Token = newAccessToken,
                                UserName = user.UserName,
                                FullName = user.UserName
                            }
                        });
                    }
                }
            }
            catch
            {
            }

            return Unauthorized();
        }

        /// <summary>
        /// Permite a un usuario forzado a cambiar su contraseña (Policy: IsChangePasswordNeeded) establecer una nueva contraseña.
        /// </summary>
        /// <param name="newPassword">La nueva contraseña a establecer.</param>
        /// <returns>Un nuevo token de acceso si el cambio fue exitoso, o Unauthorized si no hay token de usuario o la operación falla.</returns>
        [HttpPost("pass-restart")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.IsChangePasswordNeeded))]
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
                        await _userManager.RemoveClaimAsync(user, new Claim(nameof(AppPolicies.IsChangePasswordNeeded), "1"));
                        await _userManager.AddClaimAsync(user, new Claim(nameof(AppPolicies.User), "1"));

                        var loginDTO = new LoginDTO { Email = user.UserName };
                        var accessToken = await GenerateToken(loginDTO);
                        var refreshToken = await GenerateToken(loginDTO, true);

                        var actualRefreshToken = await _repository.FirstOrDefault<RefreshTokenAspNetUser>(x => x.IdUser == user.Id && x.IsActive == true);
                        if (actualRefreshToken != null)
                        {
                            actualRefreshToken.IsActive = false;
                            await _repository.Update<RefreshTokenAspNetUser>(actualRefreshToken);
                        }
                        await _repository.Add<RefreshTokenAspNetUser>(new RefreshTokenAspNetUser { IdUser = user.Id, RefreshToken = refreshToken, IsActive = true });

                        var userRoles = await _userManager.GetRolesAsync(user);
                        var userDetail = await _repository.FirstOrDefault<UserDetail>(x => x.IdUser.Equals(user.Id));
                        var company = await _repository.FirstOrDefault<Company>(x => x.IdCompany.Equals(userDetail.IdCompany));
                        return Ok(new
                        {
                            Data = new LoginResponseDTO
                            {
                                Token = accessToken,
                                UserName = user.UserName,
                                FullName = user.UserName,
                                Roles = userRoles.ToList(),
                                Company = new API.Models.CompanyDTO
                                {
                                    IdCompany = company.IdCompany,
                                    Name = company.Name,
                                    LogoName = company.LogoName
                                },
                                IdCompany = userDetail?.IdCompany,
                            }
                        });
                    }
                }
            }
            return Unauthorized();
        }

        /// <summary>
        /// Genera un token JWT (Access Token o Refresh Token) para el usuario.
        /// </summary>
        /// <param name="loginDTO">Información de login utilizada para obtener los claims del usuario.</param>
        /// <param name="refreshToken">Indica si se debe generar un Refresh Token (true) o un Access Token (false). Por defecto es false.</param>
        /// <returns>El token JWT generado como string, o null en caso de error.</returns>
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