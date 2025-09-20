using GenericApp.API.Constants;
using GenericApp.API.Models;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading.Tasks;

namespace GenericApp.API.Controllers
{
    [ApiController]
    [Route("users")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly SignInManager<IdentityUser> _signInManager;

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

        [HttpPost("roles")]
        public async Task<ActionResult> AddRole([FromBody] string roleName)
        {
            if (string.IsNullOrWhiteSpace(roleName))
            {
                return BadRequest("El nombre del rol es requerido.");
            }

            var roleExists = await _roleManager.RoleExistsAsync(roleName);
            if (roleExists)
            {
                return BadRequest(new { message = "El rol ya existe." });
            }

            var result = await _roleManager.CreateAsync(new IdentityRole(roleName));

            if (result.Succeeded)
            {
                return Ok(new { message = "Rol creado exitosamente." });
            }

            return BadRequest(result.Errors);
        }

        [HttpGet("roles")]
        public ActionResult GetRoles()
        {
            var roles = _roleManager.Roles.ToList();
            return Ok(roles);
        }

        [HttpGet("pagination")]
        public async Task<ActionResult> GetUsersPagination(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize = 10;

            var query = _userManager.Users.AsQueryable();

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
                    UserName = user.UserName,
                    Email = user.Email,
                    Roles = roles.ToList(),
                    IsDisabled = claims.Any(x => x.Type == AppClaims.IsDisabled)
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

            return Ok(paginatedResponse);
        }

        [HttpPost]
        public async Task<ActionResult> AddUser([FromBody] UserDTO model)
        {
            var newPassword = "Nuevo123!";
            if (string.IsNullOrEmpty(model.UserName) || string.IsNullOrEmpty(model.Email))
                return BadRequest();

            var userExists = await _userManager.FindByNameAsync(model.UserName);
            if (userExists != null)
                return Conflict(model.UserName);

            var emailExists = await _userManager.FindByEmailAsync(model.Email);
            if (emailExists != null)
                return Conflict(model.Email);

            var userToCreate = new IdentityUser { UserName = model.UserName, Email = model.Email };
            var result = await _userManager.CreateAsync(userToCreate, newPassword);

            if (result.Succeeded)
            {
                var user = await _userManager.FindByNameAsync(model.UserName);
                await _userManager.AddClaimAsync(user, new Claim(AppClaims.IsChangePasswordNeeded, "1"));

                // Asignar roles al usuario
                if (model.Roles != null && model.Roles.Any())
                {
                    foreach (var roleName in model.Roles)
                    {
                        var roleExists = await _roleManager.RoleExistsAsync(roleName);
                        if (roleExists)
                            await _userManager.AddToRoleAsync(user, roleName);
                    }
                }

                return Ok(new UserDTO { NewPassword = newPassword });
            }

            return BadRequest(result.Errors);
        }

        [HttpPut("{userId}")]
        public async Task<ActionResult> UpdateUser(string userId, [FromBody] UserDTO model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            if (model.UserName != null && model.UserName != user.UserName)
            {
                var existingUser = await _userManager.FindByNameAsync(model.UserName);
                if (existingUser != null)
                    return Conflict(model.UserName);
                user.UserName = model.UserName;
            }

            if (model.Email != null && model.Email != user.Email)
            {
                var existingEmailUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingEmailUser != null)
                    return Conflict(model.Email);
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

            return Ok();
        }

        [HttpGet("username/{username}")]
        public async Task<ActionResult<UserDTO>> GetUserByUsername(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
                return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            var userResponse = new UserDTO
            {
                UserName = user.UserName,
                Email = user.Email,
                Roles = roles.ToList(),
            };

            return Ok(userResponse);
        }

        [HttpPost("reset-password/{userId}")]
        public async Task<ActionResult> ResetPassword(string userId, [FromBody] UserDTO model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return NotFound();

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);

            var currentClaims = await _userManager.GetClaimsAsync(user);
            var isDisabledClaim = currentClaims.Any(c => c.Type == AppClaims.IsDisabled);
            var isUserClaim = currentClaims.Any(c => c.Type == AppClaims.IsUser);
            var isChangePasswordNeededClaim = currentClaims.Any(c => c.Type == AppClaims.IsChangePasswordNeeded);

            if (isDisabledClaim)
                await _userManager.RemoveClaimAsync(user, new System.Security.Claims.Claim(AppClaims.IsDisabled, "1"));
            if (isUserClaim)
                await _userManager.RemoveClaimAsync(user, new System.Security.Claims.Claim(AppClaims.IsUser, "1"));
            if (!isChangePasswordNeededClaim)
                await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim(AppClaims.IsChangePasswordNeeded, "1"));

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok();
        }

        [HttpPost("{userName}/disable")]
        public async Task<ActionResult> DisableUser(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return NotFound();

            var currentClaims = await _userManager.GetClaimsAsync(user);
            var isDisabledClaim = currentClaims.FirstOrDefault(c => c.Type == AppClaims.IsDisabled);

            if (isDisabledClaim == null)
                await _userManager.AddClaimAsync(user, new System.Security.Claims.Claim(AppClaims.IsDisabled, "1"));

            return Ok();
        }

        [HttpPost("{userName}/enable")]
        public async Task<ActionResult> EnableUser(string userName)
        {
            var user = await _userManager.FindByNameAsync(userName);
            if (user == null)
                return NotFound();

            var claims = await _userManager.GetClaimsAsync(user);
            var isDisabledClaim = claims.FirstOrDefault(c => c.Type == AppClaims.IsDisabled);

            if (isDisabledClaim != null)
                await _userManager.RemoveClaimAsync(user, isDisabledClaim);

            return Ok();
        }
    }
}