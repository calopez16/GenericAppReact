using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenericApp.Data
{
    public class ApplicationContextFactory : IDesignTimeDbContextFactory<ApplicationDBContext>
    {
        public ApplicationDBContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDBContext>();

            optionsBuilder.UseSqlServer("Server=localhost;Database=Contratos;User=sa;Pwd=saadmin;");

            return new ApplicationDBContext(optionsBuilder.Options);
        }
    }
}
