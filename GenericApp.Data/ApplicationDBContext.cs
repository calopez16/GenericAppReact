using GenericApp.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System; // Agregado para usar Guid

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
            optionsBuilder.UseSqlServer("Server=localhost;Database=GenericApi;User=sa;Pwd=saadmin;");
        }
        public DbSet<RefreshTokenAspNetUser> RefreshTokenAspNetUser { get; set; }
        public DbSet<Parameter> Parameters { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Label> Labels { get; set; }
        public DbSet<LabelType> LabelTypes { get; set; }
        public DbSet<Season> Seasons { get; set; }
        public DbSet<ShippingCompany> ShippingCompanies { get; set; }
        public DbSet<ApplicationLog> ApplicationLogs { get; set; } // ¡Asegúrate de agregar este DbSet!

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =================================================================================================
            // Configuraciones Existentes
            // =================================================================================================

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

            // === Company ===
            modelBuilder.Entity<Company>(b =>
            {
                b.HasKey(x => x.IdCompany);
                b.Property(x => x.Name).HasMaxLength(150).IsRequired();
                b.Property(x => x.Rfc).HasMaxLength(13);
                b.Property(x => x.Address).HasMaxLength(250);
                b.Property(x => x.PostalCode).HasMaxLength(50);
                b.Property(x => x.Phone).HasMaxLength(25);
                b.Property(x => x.Notes).HasMaxLength(250);
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);
            });

            // === Client ===
            modelBuilder.Entity<Client>(b =>
            {
                b.HasKey(x => x.IdClient);
                b.Property(x => x.Name).HasMaxLength(150).IsRequired();
                b.Property(x => x.Rfc).HasMaxLength(13);
                b.Property(x => x.Address).HasMaxLength(250);
                b.Property(x => x.PostalCode).HasMaxLength(50);
                b.Property(x => x.Phone).HasMaxLength(25);
                b.Property(x => x.Notes).HasMaxLength(250);
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                // Relación FK_Clients_Companies
                b.HasOne<Company>()
                 .WithMany()
                 .HasForeignKey(x => x.IdCompany)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // === Driver ===
            modelBuilder.Entity<Driver>(b =>
            {
                b.HasKey(x => x.IdDriver);
                b.Property(x => x.Name).HasMaxLength(150);
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                // Relación FK_Drivers_Companies
                b.HasOne<Company>()
                 .WithMany()
                 .HasForeignKey(x => x.IdCompany)
                 .OnDelete(DeleteBehavior.Restrict)
                 .IsRequired();
            });

            // === Label ===
            modelBuilder.Entity<Label>(b =>
            {
                b.HasKey(x => x.IdLabel);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                // Relación FK_Labels_Companies
                b.HasOne<Company>()
                 .WithMany()
                 .HasForeignKey(x => x.IdCompany)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // === LabelType (LabelsTypes en SQL) ===
            modelBuilder.Entity<LabelType>(b =>
            {
                b.HasKey(x => x.IdLabelType);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.MaxBoxQuantity).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                // Relación LabelType -> Label (IdLabel NOT NULL)
                b.HasOne<Label>()
                 .WithMany()
                 .HasForeignKey(x => x.IdLabel)
                 .IsRequired()
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // === Season ===
            modelBuilder.Entity<Season>(b =>
            {
                b.HasKey(x => x.IdSeason);
                b.Property(x => x.Name).HasMaxLength(150);
                b.Property(x => x.Description).HasMaxLength(250);
                b.Property(x => x.InitialDate).HasColumnType("date");
                b.Property(x => x.EndDate).HasColumnType("date");
                b.Property(x => x.IsClosed).HasDefaultValue(false);
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                // Relación FK_Seasons_Companies
                b.HasOne<Company>()
                 .WithMany()
                 .HasForeignKey(x => x.IdCompany)
                 .OnDelete(DeleteBehavior.Restrict);
            });

            // === ShippingCompany ===
            modelBuilder.Entity<ShippingCompany>(b =>
            {
                b.HasKey(x => x.IdShippingCompany);
                b.Property(x => x.Name).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);
            });

            // 🚨 NUEVA CONFIGURACIÓN: ApplicationLogs 🚨
            modelBuilder.Entity<ApplicationLog>(b =>
            {
                b.HasKey(x => x.IdApplicationLog); // PK_ApplicationLogs
                b.Property(x => x.Date).HasDefaultValueSql("GETDATE()").IsRequired(); // DEFAULT (getdate())
                b.Property(x => x.IdAspNetUsers).HasMaxLength(450).IsRequired();
                b.Property(x => x.UserName).HasMaxLength(256).IsRequired();
                b.Property(x => x.Module).HasMaxLength(150).IsRequired();
                b.Property(x => x.IdDataAffected).IsRequired();
                b.Property(x => x.Description).HasMaxLength(250);
                b.Property(x => x.Details).HasMaxLength(500);
                b.Property(x => x.Details2).HasMaxLength(500);
            });

            // =================================================================================================
            // INICIO: CÓDIGO PARA SEED DE USUARIO Y ROLES (YA EXISTENTE)
            // =================================================================================================

            // ... (código de seed) ...
            const string ADMIN_ROLE_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e575";
            const string USER_ROLE_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e576";
            const string ADMIN_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e577";

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

            var passwordHasher = new PasswordHasher<IdentityUser>();
            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "@dmin123!");

            modelBuilder.Entity<IdentityUser>().HasData(adminUser);

            modelBuilder.Entity<IdentityUserRole<string>>().HasData(new IdentityUserRole<string>
            {
                RoleId = ADMIN_ROLE_ID,
                UserId = ADMIN_ID
            });

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