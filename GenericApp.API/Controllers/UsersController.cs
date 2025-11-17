using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GenericApp.API.Controllers
{
    /// <summary>
    /// Controlador para gestionar las operaciones de administración de usuarios y roles (IdentityUsers y IdentityRoles).
    /// Requiere autenticación y el rol de Administrador.
    /// </summary>
    [ApiController]
    [Route("users")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = nameof(AppPolicies.User), Roles = nameof(AppRoles.Administrator))]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly SignInManager<IdentityUser> _signInManager;

        /// <summary>
        /// Inicializa una nueva instancia del controlador UsersController.
        /// </summary>
        /// <param name="userManager">Administrador de usuarios de ASP.NET Core Identity.</param>
        /// <param name="roleManager">Administrador de roles de ASP.NET Core Identity.</param>
        /// <param name="configuration">Configuración de la aplicación.</param>
        /// <param name="signInManager">Administrador de inicio de sesión de ASP.NET Core Identity.</param>
        public UsersController(
            UserManager<IdentityUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            SignInManager<IdentityUser> signInManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _signInManager = signInManager;
        }

        /// <summary>
        /// Agrega un nuevo rol a la base de datos de Identity.
        /// </summary>
        /// <param name="roleName">Nombre del rol a crear.</param>
        /// <returns>Mensaje de éxito o BadRequest si el rol ya existe o la creación falla.</returns>
        [HttpPost("roles")]
        public async Task<ActionResult> AddRole([FromBody] string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
                return BadRequest(new ApiResponse { Message = "El nombre del rol es requerido." });

            var roleExists = await _roleManager.RoleExistsAsync(roleName);
            if (roleExists)
                return BadRequest(new ApiResponse { Message = "El rol ya existe." });

            var result = await _roleManager.CreateAsync(new IdentityRole(roleName));

            if (result.Succeeded)
                return Ok(new ApiResponse { Message = "Rol creado exitosamente." });

            return BadRequest(new ApiResponse { Data = result.Errors });
        }

        /// <summary>
        /// Obtiene una lista de todos los roles existentes en Identity.
        /// </summary>
        /// <returns>Una ApiResponse con la lista de roles.</returns>
        [HttpGet("roles")]
        public ActionResult GetRoles()
        {
            var roles = _roleManager.Roles.ToList();
            return Ok(new ApiResponse { Data = roles });

        }

        /// <summary>
        /// Obtiene una lista paginada de usuarios (excluyendo al usuario 'admin').
        /// Incluye roles y el estado de deshabilitado de cada usuario.
        /// </summary>
        /// <param name="pageNumber">Número de página a recuperar (por defecto 1).</param>
        /// <param name="pageSize">Tamaño de la página (por defecto 10).</param>
        /// <param name="searchTerm">Término de búsqueda para filtrar por nombre de usuario o email (opcional).</param>
        /// <returns>Una respuesta paginada con la lista de UserDTOs.</returns>
        [HttpGet("pagination")]
        public async Task<ActionResult> GetUsersPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = _userManager.Users.Where(u => !u.UserName.Equals("admin")).AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u =>
                    u.UserName.Contains(searchTerm) ||
                    u.Email.Contains(searchTerm));
            }

            var totalUsers = query.Count();
            var users = query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var usersWithClaims = new List<UserDTO>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var claims = await _userManager.GetClaimsAsync(user);
                usersWithClaims.Add(new UserDTO
                {
                    UserNameId = user.UserName,
                    UserName = user.UserName,
                    Email = user.Email,
                    Roles = roles.ToList(),
                    IsDisabled = claims.Any(x => x.Type == nameof(AppPolicies.IsDisabled))
                });
            }

            var paginatedResponse = new
            {
                TotalCount = totalUsers,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)System.Math.Ceiling((double)totalUsers / pageSize),
                Users = usersWithClaims
            };

            return Ok(new ApiResponse { Data = paginatedResponse });
        }

        /// <summary>
        /// Crea un nuevo usuario con una contraseña temporal ("Nuevo123!"), le asigna el claim de cambio de contraseña forzoso y los roles especificados.
        /// </summary>
        /// <param name="model">El UserDTO con el nombre de usuario, email y roles.</param>
        /// <returns>Mensaje de éxito con la contraseña temporal o conflicto si el usuario/email ya existe.</returns>
        [HttpPost]
        public async Task<ActionResult> AddUser([FromBody] UserDTO model)
        {
            var newPassword = "Nuevo123!";
            if (string.IsNullOrEmpty(model.UserName) || string.IsNullOrEmpty(model.Email))
                return BadRequest();

            var userExists = await _userManager.FindByNameAsync(model.UserName);
            if (userExists != null)
                return Conflict(new ApiResponse { Conflict = model.UserName });

            var emailExists = await _userManager.FindByEmailAsync(model.Email);
            if (emailExists != null)
                return Conflict(new ApiResponse { Conflict = model.Email });

            var userToCreate = new IdentityUser { UserName = model.UserName, Email = model.Email };
            var result = await _userManager.CreateAsync(userToCreate, newPassword);

            if (result.Succeeded)
            {
                var user = await _userManager.FindByNameAsync(model.UserName);
                await _userManager.AddClaimAsync(user, new Claim(nameof(AppPolicies.IsChangePasswordNeeded), "1"));

                if (model.Roles != null && model.Roles.Any())
                {
                    foreach (var roleName in model.Roles)
                    {
                        var roleExists = await _roleManager.RoleExistsAsync(roleName);
                        if (roleExists)
                            await _userManager.AddToRoleAsync(user, roleName);
                    }
                }

                return Ok(new ApiResponse { Data = new { NewPassword = newPassword } });
            }

            return BadRequest(new ApiResponse { Data = result.Errors });
        }

        /// <summary>
        /// Actualiza el nombre de usuario, email y la asignación de roles de un usuario existente.
        /// </summary>
        /// <param name="model">El UserDTO con los datos actualizados. Utiliza UserNameId para identificar al usuario.</param>
        /// <returns>ApiResponse vacía en caso de éxito, NotFound si el usuario no existe, o Conflict si el nuevo username/email ya está en uso.</returns>
        [HttpPut]
        public async Task<ActionResult> UpdateUser([FromBody] UserDTO model)
        {
            var user = await _userManager.FindByNameAsync(model.UserNameId);
            if (user == null)
                return NotFound();

            if (model.UserName != null && model.UserName != user.UserName)
            {
                var existingUser = await _userManager.FindByNameAsync(model.UserName);
                if (existingUser != null)
                    return Conflict(new ApiResponse { Conflict = model.UserName });
                user.UserName = model.UserName;
            }

            if (model.Email != null && model.Email != user.Email)
            {
                var existingEmailUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingEmailUser != null)
                    return Conflict(new ApiResponse { Conflict = model.Email });
                user.Email = model.Email;
            }

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                return BadRequest();

            var existingRoles = await _userManager.GetRolesAsync(user);

            var rolesToAdd = model.Roles.Except(existingRoles).ToList();
            if (rolesToAdd.Any())
                await _userManager.AddToRolesAsync(user, rolesToAdd);

            var rolesToRemove = existingRoles.Except(model.Roles).ToList();
            if (rolesToRemove.Any())
                await _userManager.RemoveFromRolesAsync(user, rolesToRemove);

            return Ok(new ApiResponse());
        }

        /// <summary>
        /// Obtiene los detalles de un usuario específico por su nombre de usuario.
        /// </summary>
        /// <param name="username">El nombre de usuario a buscar.</param>
        /// <returns>El UserDTO con los detalles del usuario, o NotFound si no existe.</returns>
        [HttpGet("username/{username}")]
        public async Task<ActionResult<UserDTO>> GetUserByUsername(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
                return NotFound(new ApiResponse());

            var roles = await _userManager.GetRolesAsync(user);

            var userResponse = new UserDTO
            {
                UserNameId = user.UserName,
                UserName = user.UserName,
                Email = user.Email,
                Roles = roles.ToList(),
            };

            return Ok(new ApiResponse { Data = userResponse });
        }

        /// <summary>
        /// Restablece la contraseña de un usuario a un valor predeterminado ("Nuevo123!").
        /// Forzará el cambio de contraseña en el próximo login (añade el claim IsChangePasswordNeeded y remueve el claim User).
        /// </summary>
        /// <param name="userName">El nombre de usuario cuya contraseña será restablecida.</param>
        /// <returns>Mensaje de éxito con la nueva contraseña temporal o NotFound/BadRequest si falla.</returns>
        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword([FromBody] string userName)
        {
            var newPassword = "Nuevo123!";
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return NotFound(new ApiResponse());

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            var currentClaims = await _userManager.GetClaimsAsync(user);
            var isDisabledClaim = currentClaims.Any(c => c.Type == nameof(AppPolicies.IsDisabled));
            var isUserClaim = currentClaims.Any(c => c.Type == nameof(AppPolicies.User));
            var isChangePasswordNeededClaim = currentClaims.Any(c => c.Type == nameof(AppPolicies.IsChangePasswordNeeded));

            if (isUserClaim)
                await _userManager.RemoveClaimAsync(user, new System.Security.Claims.Claim(nameof(AppPolicies.User), "1"));
            if (!isChangePasswordNeededClaim)
                await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim(nameof(AppPolicies.IsChangePasswordNeeded), "1"));

            if (!result.Succeeded)
                return BadRequest(new ApiResponse { Data = result.Errors });

            return Ok(new ApiResponse { Data = new { NewPassword = newPassword } });
        }


        /// <summary>
        /// Deshabilita un usuario agregando el claim 'IsDisabled'.
        /// </summary>
        /// <param name="userName">El nombre de usuario a deshabilitar.</param>
        /// <returns>ApiResponse vacía en caso de éxito o NotFound si el usuario no existe.</returns>
        [HttpPost("{userName}/disable")]
        public async Task<ActionResult> DisableUser(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return NotFound(new ApiResponse());

            var currentClaims = await _userManager.GetClaimsAsync(user);
            var isDisabledClaim = currentClaims.FirstOrDefault(c => c.Type == nameof(AppPolicies.IsDisabled));

            if (isDisabledClaim == null)
                await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim(nameof(AppPolicies.IsDisabled), "1"));

            return Ok(new ApiResponse());
        }

        /// <summary>
        /// Habilita un usuario eliminando el claim 'IsDisabled'.
        /// </summary>
        /// <param name="userName">El nombre de usuario a habilitar.</param>
        /// <returns>ApiResponse vacía en caso de éxito o NotFound si el usuario no existe.</returns>
        [HttpPost("{userName}/enable")]
        public async Task<ActionResult> EnableUser(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return NotFound(new ApiResponse());

            var claims = await _userManager.GetClaimsAsync(user);
            var isDisabledClaim = claims.FirstOrDefault(c => c.Type == nameof(AppPolicies.IsDisabled));

            if (isDisabledClaim != null)
                await _userManager.RemoveClaimAsync(user, isDisabledClaim);

            return Ok(new ApiResponse());
        }
    }
}