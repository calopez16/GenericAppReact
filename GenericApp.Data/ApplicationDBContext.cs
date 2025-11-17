using GenericApp.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;

namespace GenericApp.Data
{
    public class ApplicationDBContext : IdentityDbContext
    {
        //Comentar esta linea cuando se vaya a hacer un add-migration y update-database
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options)
        : base(options)
        {
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=localhost;Database=GenericApi;User=sa;Pwd=saadmin;");
            optionsBuilder.UseLazyLoadingProxies(false);
        }

        public DbSet<ApplicationLog> ApplicationLogs { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<Driver> Drivers { get; set; }
        public DbSet<Label> Labels { get; set; }
        public DbSet<LabelType> LabelTypes { get; set; }
        public DbSet<Manifest> Manifests { get; set; }
        public DbSet<ManifestStatus> ManifestStatuses { get; set; }
        public DbSet<ManifestPallet> ManifestPallets { get; set; }
        public DbSet<ManifestPalletLoading> ManifestPalletLoadings { get; set; }
        public DbSet<Parameter> Parameters { get; set; }
        public DbSet<RefreshTokenAspNetUser> RefreshTokenAspNetUser { get; set; }
        public DbSet<Season> Seasons { get; set; }
        public DbSet<Shipment> Shipments { get; set; }
        public DbSet<ShipmentStatus> ShipmentStatuses { get; set; }
        public DbSet<ShippingCompany> ShippingCompanies { get; set; }
        public DbSet<State> States { get; set; }

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

            modelBuilder.Entity<Company>(b =>
            {
                b.HasKey(x => x.IdCompany);
                b.Property(x => x.Name).HasMaxLength(150).IsRequired();
                b.Property(x => x.Rfc).HasMaxLength(13);
                b.Property(x => x.Address).HasMaxLength(250);
                b.Property(x => x.PostalCode).HasMaxLength(50);
                b.Property(x => x.Phone).HasMaxLength(25);
                b.Property(x => x.Notes).HasMaxLength(250);
                b.Property(x => x.RegFdaNo).HasMaxLength(50);
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);
            });

            modelBuilder.Entity<Country>(b =>
            {
                b.HasKey(x => x.IdCountry);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);
            });
            modelBuilder.Entity<State>(b =>
            {
                b.HasKey(x => x.IdState);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne(s => s.IdCountryNavigation)
                    .WithMany(c => c.States)
                    .HasForeignKey(s => s.IdCountry)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<City>(b =>
            {
                b.HasKey(x => x.IdCity);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne(s => s.IdStateNavigation)
                     .WithMany(c => c.Cities)
                     .HasForeignKey(s => s.IdState)
                     .OnDelete(DeleteBehavior.Restrict);
            });

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

                b.HasOne<Company>()
                   .WithMany()
                   .HasForeignKey(x => x.IdCompany)
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(lt => lt.IdCityNavigation)
                .WithMany(l => l.Clients)
                .HasForeignKey(x => x.IdCity)
                .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Driver>(b =>
            {
                b.HasKey(x => x.IdDriver);
                b.Property(x => x.Name).HasMaxLength(150);
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne<Company>()
                   .WithMany()
                   .HasForeignKey(x => x.IdCompany)
                   .OnDelete(DeleteBehavior.Restrict)
                   .IsRequired();
            });

            modelBuilder.Entity<Label>(b =>
            {
                b.HasKey(x => x.IdLabel);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.MaxBoxQuantity).HasColumnType("decimal(18,2)").IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne<Company>()
                   .WithMany()
                   .HasForeignKey(x => x.IdCompany)
                   .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<LabelType>(b =>
            {
                b.HasKey(x => x.IdLabelType);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne(lt => lt.IdLabelNavigation)
                    .WithMany(l => l.LabelTypes)
                    .HasForeignKey(x => x.IdLabel)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);
            });

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

                b.HasOne<Company>()
                   .WithMany()
                   .HasForeignKey(x => x.IdCompany)
                   .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ShippingCompany>(b =>
            {
                b.HasKey(x => x.IdShippingCompany);
                b.Property(x => x.Name).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);
            });

            modelBuilder.Entity<ApplicationLog>(b =>
            {
                b.HasKey(x => x.IdApplicationLog);
                b.Property(x => x.Date).HasDefaultValueSql("GETDATE()").IsRequired();
                b.Property(x => x.IdAspNetUsers).HasMaxLength(450).IsRequired();
                b.Property(x => x.UserName).HasMaxLength(256).IsRequired();
                b.Property(x => x.Module).HasMaxLength(150).IsRequired();
                b.Property(x => x.IdDataAffected).IsRequired();
                b.Property(x => x.Description).HasMaxLength(250);
                b.Property(x => x.Details).HasMaxLength(500);
                b.Property(x => x.Details2).HasMaxLength(500);
            });

            modelBuilder.Entity<Shipment>(b =>
            {
                b.HasKey(x => x.IdShipment);
                b.Property(x => x.CreationDate).HasDefaultValueSql("GETDATE()").IsRequired();
                b.Property(x => x.EmbarqueDate).HasColumnType("date").IsRequired();
                b.Property(x => x.IdUser).HasMaxLength(450);
                b.Property(x => x.Address).HasMaxLength(250);
                b.Property(x => x.Comments).HasMaxLength(500);
                b.Property(x => x.Mixed).HasDefaultValue(false);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne<Client>()
                   .WithMany()
                   .HasForeignKey(x => x.IdClient)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<City>()
                   .WithMany()
                   .HasForeignKey(x => x.IdCity)
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<ShipmentStatus>()
                   .WithMany()
                   .HasForeignKey(x => x.IdShipmentStatus)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ShipmentStatus>(b =>
            {
                b.HasKey(x => x.IdShipmentStatus);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);
            });

            modelBuilder.Entity<Manifest>(b =>
            {
                b.HasKey(x => x.IdManifest);
                b.Property(x => x.CreationDate).HasDefaultValueSql("GETDATE()").IsRequired();
                b.Property(x => x.ExitDate).HasColumnType("date");
                b.Property(x => x.TemperatureTrailerBoxF).HasColumnType("decimal(18,2)");
                b.Property(x => x.TemperatureTrailerBoxC).HasColumnType("decimal(18,2)");
                b.Property(x => x.TrailerPlate).HasMaxLength(50);
                b.Property(x => x.TrailerBoxPlate).HasMaxLength(50);
                b.Property(x => x.Comments).HasMaxLength(500);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);


                b.HasOne<Shipment>()
                   .WithMany(s => s.Manifests)
                   .HasForeignKey(x => x.IdShipment)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<Season>()
                   .WithMany()
                   .HasForeignKey(x => x.IdSeason)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<Driver>()
                   .WithMany()
                   .HasForeignKey(x => x.IdDriver)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<ShippingCompany>()
                   .WithMany()
                   .HasForeignKey(x => x.IdShippingCompany)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<ManifestStatus>()
                   .WithMany()
                   .HasForeignKey(x => x.IdManifestStatus)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ManifestStatus>(b =>
            {
                b.HasKey(x => x.IdManifestStatus);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);
            });

            modelBuilder.Entity<ManifestPallet>(b =>
            {
                b.HasKey(x => x.IdManifestPallet);
                b.Property(x => x.MaxBoxQuantity).HasColumnType("decimal(18,2)");
                b.Property(x => x.Position).IsRequired();
                b.Property(x => x.TemperatureF).HasColumnType("decimal(18,2)");
                b.Property(x => x.TemperatureC).HasColumnType("decimal(18,2)");
                b.Property(x => x.Comments).HasMaxLength(500);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne<Manifest>()
                   .WithMany(m => m.ManifestPallets)
                   .HasForeignKey(x => x.IdManifest)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<Shipment>()
                   .WithMany()
                   .HasForeignKey(x => x.IdShipment)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<Label>()
                   .WithMany()
                   .HasForeignKey(x => x.IdLabel)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ManifestPalletLoading>(b =>
            {
                b.HasKey(x => x.IdManifestPalletLoading);
                b.Property(x => x.Description).HasMaxLength(250);
                b.Property(x => x.BoxQuantity).HasColumnType("decimal(18,2)");
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne<ManifestPallet>()
                   .WithMany(p => p.ManifestPalletLoadings)
                   .HasForeignKey(x => x.IdManifestPallet)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<Manifest>()
                   .WithMany()
                   .HasForeignKey(x => x.IdManifest)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<Shipment>()
                   .WithMany()
                   .HasForeignKey(x => x.IdShipment)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);

                b.HasOne<LabelType>()
                   .WithMany()
                   .HasForeignKey(x => x.IdLabelType)
                   .IsRequired()
                   .OnDelete(DeleteBehavior.Restrict);
            });


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
        }
    }
}