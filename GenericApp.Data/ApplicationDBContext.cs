using GenericApp.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GenericApp.Data
{
    public class ApplicationDBContext : IdentityDbContext
    {

        //Comentar cuando se agregue una nueva migracion
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options)
        : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            //optionsBuilder.UseSqlServer("Server=localhost;Database=GenericApi;User=sa;Pwd=saadmin;");
        }
        public DbSet<RefreshTokenAspNetUser> RefreshTokenAspNetUser { get; set; }
        public DbSet<Parameter> Parameters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<RefreshTokenAspNetUser>(b =>
            {
                b.HasKey(x => new { x.IdRefreshTokenAspNetUser });

                b.Property(x => x.IdRefreshTokenAspNetUser).HasMaxLength(80);
                b.Property(x => x.CreationDate).HasDefaultValueSql("GETDATE()");
                b.Property(x => x.IdUser).HasMaxLength(450);
                b.Property(x => x.RefreshToken).HasMaxLength(500);
                b.Property(x => x.IsActive).HasDefaultValueSql("1");
            });

            modelBuilder.Entity<Parameter>(b =>
            {
                b.HasKey(x => x.IdParameter);
                b.Property(x => x.ParameterCode).HasMaxLength(5);
                b.Property(x => x.Description).HasMaxLength(150);
                b.Property(x => x.Value).HasMaxLength(250);
            });

            // =================================================================================================
            // INICIO: CÓDIGO PARA SEED DE USUARIO Y ROLES
            // =================================================================================================

            // IDs para los roles y el usuario (puedes usar los GUIDs que prefieras)
            const string ADMIN_ROLE_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e575";
            const string USER_ROLE_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e576";
            const string ADMIN_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e577";

            // 1. Seed de Roles (Administrator y User)
            modelBuilder.Entity<IdentityRole>().HasData(
                new IdentityRole
                {
                    Id = ADMIN_ROLE_ID,
                    Name = "Administrator",
                    NormalizedName = "ADMINISTRATOR",
                    ConcurrencyStamp = ADMIN_ROLE_ID
                },
                new IdentityRole
                {
                    Id = USER_ROLE_ID,
                    Name = "User",
                    NormalizedName = "USER",
                    ConcurrencyStamp = USER_ROLE_ID
                }
            );

            // 2. Crear el usuario administrador
            var adminUser = new IdentityUser
            {
                Id = ADMIN_ID,
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                Email = "admin",
                NormalizedEmail = "ADMIN",
                EmailConfirmed = true,
                SecurityStamp = new Guid().ToString("D"),
                ConcurrencyStamp = ADMIN_ID
            };

            // 3. Hashear la contraseña del usuario
            // ¡NUNCA guardes contraseñas en texto plano!
            var passwordHasher = new PasswordHasher<IdentityUser>();
            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "@dmin123!");

            // 4. Seed del usuario administrador
            modelBuilder.Entity<IdentityUser>().HasData(adminUser);

            // 5. Asignar el rol "Administrator" al usuario administrador
            modelBuilder.Entity<IdentityUserRole<string>>().HasData(new IdentityUserRole<string>
            {
                RoleId = ADMIN_ROLE_ID,
                UserId = ADMIN_ID
            });

            // 6. Asignar un Claim al usuario administrador
            modelBuilder.Entity<IdentityUserClaim<string>>().HasData(new IdentityUserClaim<string>
            {
                Id = -1,
                UserId = ADMIN_ID,
                ClaimType = "User",
                ClaimValue = "1"
            });

            // =================================================================================================
            // FIN: CÓDIGO PARA SEED
            // =================================================================================================
        }

    }
}
