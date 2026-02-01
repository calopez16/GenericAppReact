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
        public DbSet<UserDetail> UserDetails { get; set; }

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

            modelBuilder.Entity<UserDetail>(b =>
            {
                b.HasKey(x => new { x.IdUserDetail });
                b.Property(x => x.IdUser).HasMaxLength(450);
            });

            modelBuilder.Entity<Parameter>(b =>
            {
                b.HasKey(x => x.IdParameter);
                b.Property(x => x.ParameterCode).HasMaxLength(5).IsRequired();
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.Value).HasMaxLength(250).IsRequired();
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

            modelBuilder.Entity<ShipmentStatus>(b =>
            {
                b.HasKey(x => x.IdShipmentStatus);
                b.Property(x => x.Description).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);
            });

            modelBuilder.Entity<ManifestStatus>(b =>
            {
                b.HasKey(x => x.IdManifestStatus);
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

                b.HasOne(c => c.IdCompanyNavigation)
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
                b.Property(x => x.Name).HasMaxLength(150).IsRequired();
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne(d => d.IdCompanyNavigation)
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

                b.HasOne(l => l.IdCompanyNavigation)
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
                b.Property(x => x.Name).HasMaxLength(150).IsRequired();
                b.Property(x => x.Description).HasMaxLength(250);
                b.Property(x => x.InitialDate).HasColumnType("date");
                b.Property(x => x.EndDate).HasColumnType("date");
                b.Property(x => x.IsClosed).HasDefaultValue(false);
                b.Property(x => x.IsActive).HasDefaultValue(true);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne(s => s.IdCompanyNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdCompany)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Shipment>(b =>
            {
                b.HasKey(x => x.IdShipment);
                b.Property(x => x.CreationDate).HasDefaultValueSql("GETDATE()").IsRequired();
                b.Property(x => x.ShipmentDate).HasColumnType("date").IsRequired();
                b.Property(x => x.IdUser).HasMaxLength(450);
                b.Property(x => x.Address).HasMaxLength(250);
                b.Property(x => x.Comments).HasMaxLength(500);
                b.Property(x => x.Mixed).HasDefaultValue(false);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne(s => s.IdClientNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdClient)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(s => s.IdCityNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdCity)
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(s => s.IdShipmentStatusNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdShipmentStatus)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(s => s.IdCompanyNavigation)
                  .WithMany()
                  .HasForeignKey(x => x.IdCompany)
                  .IsRequired()
                  .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(s => s.IdUserNavigation)
                  .WithMany()
                  .HasForeignKey(s => s.IdUser)
                  .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Manifest>(b =>
            {
                b.HasKey(x => x.IdManifest);
                b.Property(x => x.CreationDate).HasDefaultValueSql("GETDATE()").IsRequired();
                b.Property(x => x.ExitDate).IsRequired();
                b.Property(x => x.TemperatureTrailerBoxF).HasColumnType("decimal(18,2)");
                b.Property(x => x.TemperatureTrailerBoxC).HasColumnType("decimal(18,2)");
                b.Property(x => x.TrailerPlate).HasMaxLength(50);
                b.Property(x => x.TrailerBoxPlate).HasMaxLength(50);
                b.Property(x => x.Comments).HasMaxLength(500);
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                // CORREGIDO
                b.HasOne(m => m.IdShipmentNavigation)
                    .WithMany(s => s.Manifests)
                    .HasForeignKey(x => x.IdShipment)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(m => m.IdSeasonNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdSeason)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(m => m.IdDriverNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdDriver)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(m => m.IdShippingCompanyNavigation)
                     .WithMany()
                     .HasForeignKey(x => x.IdShippingCompany)
                     .IsRequired()
                     .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(m => m.IdManifestStatusNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdManifestStatus)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(m => m.IdCompanyNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdCompany)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);
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

                b.HasOne(mp => mp.IdManifestNavigation)
                    .WithMany(m => m.ManifestPallets)
                    .HasForeignKey(x => x.IdManifest)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);           

                b.HasOne(mp => mp.IdLabelNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdLabel)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<ManifestPalletLoading>(b =>
            {
                b.HasKey(x => x.IdManifestPalletLoading);
                b.Property(x => x.Description).HasMaxLength(250).IsRequired();
                b.Property(x => x.BoxQuantity).HasColumnType("decimal(18,2)");
                b.Property(x => x.IsDeleted).HasDefaultValue(false);

                b.HasOne(mpl => mpl.IdManifestPalletNavigation)
                    .WithMany(p => p.ManifestPalletLoadings)
                    .HasForeignKey(x => x.IdManifestPallet)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);

                b.HasOne(mpl => mpl.IdLabelTypeNavigation)
                    .WithMany()
                    .HasForeignKey(x => x.IdLabelType)
                    .IsRequired()
                    .OnDelete(DeleteBehavior.Restrict);
            });


            modelBuilder.Entity<Company>().HasData(new Company
            {
                IdCompany = 1,
                Name = "Mision",
                IsActive = true,
                IsDeleted = false
            });

            const string ADMIN_ROLE_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e575";
            const string USER_ROLE_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e576";
            const string ADMIN_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e577";
            const string MULTICOMPANY_ID = "a18be9c0-aa65-4af8-bd17-00bd9344e578";

            modelBuilder.Entity<UserDetail>().HasData(new UserDetail
            {
                IdUser = ADMIN_ID,
                IdUserDetail = 1,
                IdCompany = 1,
            });

            modelBuilder.Entity<Country>().HasData(
                new Country
                {
                    IdCountry = 1,
                    Description = "México",
                    IsActive = true,
                    IsDeleted = false
                },
                new Country
                {
                    IdCountry = 2,
                    Description = "Estados Unidos",
                    IsActive = true,
                    IsDeleted = false
                }
            );

            modelBuilder.Entity<State>().HasData(
                new State { IdState = 1, IdCountry = 1, Description = "Aguascalientes", IsActive = true, IsDeleted = false },
                new State { IdState = 2, IdCountry = 1, Description = "Baja California", IsActive = true, IsDeleted = false },
                new State { IdState = 3, IdCountry = 1, Description = "Baja California Sur", IsActive = true, IsDeleted = false },
                new State { IdState = 4, IdCountry = 1, Description = "Campeche", IsActive = true, IsDeleted = false },
                new State { IdState = 5, IdCountry = 1, Description = "Coahuila", IsActive = true, IsDeleted = false },
                new State { IdState = 6, IdCountry = 1, Description = "Colima", IsActive = true, IsDeleted = false },
                new State { IdState = 7, IdCountry = 1, Description = "Chiapas", IsActive = true, IsDeleted = false },
                new State { IdState = 8, IdCountry = 1, Description = "Chihuahua", IsActive = true, IsDeleted = false },
                new State { IdState = 9, IdCountry = 1, Description = "Ciudad de México", IsActive = true, IsDeleted = false },
                new State { IdState = 10, IdCountry = 1, Description = "Durango", IsActive = true, IsDeleted = false },
                new State { IdState = 11, IdCountry = 1, Description = "Guanajuato", IsActive = true, IsDeleted = false },
                new State { IdState = 12, IdCountry = 1, Description = "Guerrero", IsActive = true, IsDeleted = false },
                new State { IdState = 13, IdCountry = 1, Description = "Hidalgo", IsActive = true, IsDeleted = false },
                new State { IdState = 14, IdCountry = 1, Description = "Jalisco", IsActive = true, IsDeleted = false },
                new State { IdState = 15, IdCountry = 1, Description = "Estado de México", IsActive = true, IsDeleted = false },
                new State { IdState = 16, IdCountry = 1, Description = "Michoacán", IsActive = true, IsDeleted = false },
                new State { IdState = 17, IdCountry = 1, Description = "Morelos", IsActive = true, IsDeleted = false },
                new State { IdState = 18, IdCountry = 1, Description = "Nayarit", IsActive = true, IsDeleted = false },
                new State { IdState = 19, IdCountry = 1, Description = "Nuevo León", IsActive = true, IsDeleted = false },
                new State { IdState = 20, IdCountry = 1, Description = "Oaxaca", IsActive = true, IsDeleted = false },
                new State { IdState = 21, IdCountry = 1, Description = "Puebla", IsActive = true, IsDeleted = false },
                new State { IdState = 22, IdCountry = 1, Description = "Querétaro", IsActive = true, IsDeleted = false },
                new State { IdState = 23, IdCountry = 1, Description = "Quintana Roo", IsActive = true, IsDeleted = false },
                new State { IdState = 24, IdCountry = 1, Description = "San Luis Potosí", IsActive = true, IsDeleted = false },
                new State { IdState = 25, IdCountry = 1, Description = "Sinaloa", IsActive = true, IsDeleted = false },
                new State { IdState = 26, IdCountry = 1, Description = "Sonora", IsActive = true, IsDeleted = false },
                new State { IdState = 27, IdCountry = 1, Description = "Tabasco", IsActive = true, IsDeleted = false },
                new State { IdState = 28, IdCountry = 1, Description = "Tamaulipas", IsActive = true, IsDeleted = false },
                new State { IdState = 29, IdCountry = 1, Description = "Tlaxcala", IsActive = true, IsDeleted = false },
                new State { IdState = 30, IdCountry = 1, Description = "Veracruz", IsActive = true, IsDeleted = false },
                new State { IdState = 31, IdCountry = 1, Description = "Yucatán", IsActive = true, IsDeleted = false },
                new State { IdState = 32, IdCountry = 1, Description = "Zacatecas", IsActive = true, IsDeleted = false },
                new State { IdState = 33, IdCountry = 2, Description = "Alabama", IsActive = true, IsDeleted = false },
                new State { IdState = 34, IdCountry = 2, Description = "Alaska", IsActive = true, IsDeleted = false },
                new State { IdState = 35, IdCountry = 2, Description = "Arizona", IsActive = true, IsDeleted = false },
                new State { IdState = 36, IdCountry = 2, Description = "Arkansas", IsActive = true, IsDeleted = false },
                new State { IdState = 37, IdCountry = 2, Description = "California", IsActive = true, IsDeleted = false },
                new State { IdState = 38, IdCountry = 2, Description = "Colorado", IsActive = true, IsDeleted = false },
                new State { IdState = 39, IdCountry = 2, Description = "Connecticut", IsActive = true, IsDeleted = false },
                new State { IdState = 40, IdCountry = 2, Description = "Delaware", IsActive = true, IsDeleted = false },
                new State { IdState = 41, IdCountry = 2, Description = "Florida", IsActive = true, IsDeleted = false },
                new State { IdState = 42, IdCountry = 2, Description = "Georgia", IsActive = true, IsDeleted = false },
                new State { IdState = 43, IdCountry = 2, Description = "Hawaii", IsActive = true, IsDeleted = false },
                new State { IdState = 44, IdCountry = 2, Description = "Idaho", IsActive = true, IsDeleted = false },
                new State { IdState = 45, IdCountry = 2, Description = "Illinois", IsActive = true, IsDeleted = false },
                new State { IdState = 46, IdCountry = 2, Description = "Indiana", IsActive = true, IsDeleted = false },
                new State { IdState = 47, IdCountry = 2, Description = "Iowa", IsActive = true, IsDeleted = false },
                new State { IdState = 48, IdCountry = 2, Description = "Kansas", IsActive = true, IsDeleted = false },
                new State { IdState = 49, IdCountry = 2, Description = "Kentucky", IsActive = true, IsDeleted = false },
                new State { IdState = 50, IdCountry = 2, Description = "Louisiana", IsActive = true, IsDeleted = false },
                new State { IdState = 51, IdCountry = 2, Description = "Maine", IsActive = true, IsDeleted = false },
                new State { IdState = 52, IdCountry = 2, Description = "Maryland", IsActive = true, IsDeleted = false },
                new State { IdState = 53, IdCountry = 2, Description = "Massachusetts", IsActive = true, IsDeleted = false },
                new State { IdState = 54, IdCountry = 2, Description = "Michigan", IsActive = true, IsDeleted = false },
                new State { IdState = 55, IdCountry = 2, Description = "Minnesota", IsActive = true, IsDeleted = false },
                new State { IdState = 56, IdCountry = 2, Description = "Mississippi", IsActive = true, IsDeleted = false },
                new State { IdState = 57, IdCountry = 2, Description = "Missouri", IsActive = true, IsDeleted = false },
                new State { IdState = 58, IdCountry = 2, Description = "Montana", IsActive = true, IsDeleted = false },
                new State { IdState = 59, IdCountry = 2, Description = "Nebraska", IsActive = true, IsDeleted = false },
                new State { IdState = 60, IdCountry = 2, Description = "Nevada", IsActive = true, IsDeleted = false },
                new State { IdState = 61, IdCountry = 2, Description = "New Hampshire", IsActive = true, IsDeleted = false },
                new State { IdState = 62, IdCountry = 2, Description = "New Jersey", IsActive = true, IsDeleted = false },
                new State { IdState = 63, IdCountry = 2, Description = "New Mexico", IsActive = true, IsDeleted = false },
                new State { IdState = 64, IdCountry = 2, Description = "New York", IsActive = true, IsDeleted = false },
                new State { IdState = 65, IdCountry = 2, Description = "North Carolina", IsActive = true, IsDeleted = false },
                new State { IdState = 66, IdCountry = 2, Description = "North Dakota", IsActive = true, IsDeleted = false },
                new State { IdState = 67, IdCountry = 2, Description = "Ohio", IsActive = true, IsDeleted = false },
                new State { IdState = 68, IdCountry = 2, Description = "Oklahoma", IsActive = true, IsDeleted = false },
                new State { IdState = 69, IdCountry = 2, Description = "Oregon", IsActive = true, IsDeleted = false },
                new State { IdState = 70, IdCountry = 2, Description = "Pennsylvania", IsActive = true, IsDeleted = false },
                new State { IdState = 71, IdCountry = 2, Description = "Rhode Island", IsActive = true, IsDeleted = false },
                new State { IdState = 72, IdCountry = 2, Description = "South Carolina", IsActive = true, IsDeleted = false },
                new State { IdState = 73, IdCountry = 2, Description = "South Dakota", IsActive = true, IsDeleted = false },
                new State { IdState = 74, IdCountry = 2, Description = "Tennessee", IsActive = true, IsDeleted = false },
                new State { IdState = 75, IdCountry = 2, Description = "Texas", IsActive = true, IsDeleted = false },
                new State { IdState = 76, IdCountry = 2, Description = "Utah", IsActive = true, IsDeleted = false },
                new State { IdState = 77, IdCountry = 2, Description = "Vermont", IsActive = true, IsDeleted = false },
                new State { IdState = 78, IdCountry = 2, Description = "Virginia", IsActive = true, IsDeleted = false },
                new State { IdState = 79, IdCountry = 2, Description = "Washington", IsActive = true, IsDeleted = false },
                new State { IdState = 80, IdCountry = 2, Description = "West Virginia", IsActive = true, IsDeleted = false },
                new State { IdState = 81, IdCountry = 2, Description = "Wisconsin", IsActive = true, IsDeleted = false },
                new State { IdState = 82, IdCountry = 2, Description = "Wyoming", IsActive = true, IsDeleted = false }
            );

            modelBuilder.Entity<City>().HasData(
                new City { IdCity = 1, IdState = 2, Description = "Tijuana", IsActive = true, IsDeleted = false },
                new City { IdCity = 2, IdState = 2, Description = "Mexicali", IsActive = true, IsDeleted = false },
                new City { IdCity = 3, IdState = 2, Description = "Ensenada", IsActive = true, IsDeleted = false },
                new City { IdCity = 4, IdState = 2, Description = "Playas de Rosarito", IsActive = true, IsDeleted = false },
                new City { IdCity = 5, IdState = 2, Description = "Tecate", IsActive = true, IsDeleted = false },
                new City { IdCity = 6, IdState = 2, Description = "San Quintín", IsActive = true, IsDeleted = false },
                new City { IdCity = 7, IdState = 2, Description = "San Felipe", IsActive = true, IsDeleted = false },
                new City { IdCity = 8, IdState = 37, Description = "Los Angeles", IsActive = true, IsDeleted = false },
                new City { IdCity = 9, IdState = 37, Description = "San Diego", IsActive = true, IsDeleted = false },
                new City { IdCity = 10, IdState = 37, Description = "San Jose", IsActive = true, IsDeleted = false },
                new City { IdCity = 11, IdState = 37, Description = "Calexico", IsActive = true, IsDeleted = false }
            );

            modelBuilder.Entity<ShipmentStatus>().HasData(
               new ShipmentStatus { IdShipmentStatus = 1, Description = "Activa", IsActive = true, IsDeleted = false },
               new ShipmentStatus { IdShipmentStatus = 2, Description = "Concluída", IsActive = true, IsDeleted = false }
            );

            modelBuilder.Entity<ManifestStatus>().HasData(
               new ManifestStatus { IdManifestStatus = 1, Description = "Activa", IsActive = true, IsDeleted = false },
               new ManifestStatus { IdManifestStatus = 2, Description = "Concluída", IsActive = true, IsDeleted = false }
            );

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
                },
                new IdentityRole
                {
                    Id = MULTICOMPANY_ID,
                    Name = "MultiEmpresa",
                    NormalizedName = "MULTIEMPRESA",
                    ConcurrencyStamp = MULTICOMPANY_ID
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