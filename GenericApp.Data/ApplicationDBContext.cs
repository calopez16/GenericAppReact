using GenericApp.Data.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GenericApp.Data
{
    public class ApplicationDBContext : IdentityDbContext
    {

        public ApplicationDBContext(DbContextOptions options) : base(options)
        {


        }

        public DbSet<RefreshTokenAspNetUser> RefreshTokenAspNetUser { get; set; }

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
        }

    }
}
