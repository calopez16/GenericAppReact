using GenericApp.API.Constants;
using GenericApp.BLL.Sevices;
using GenericApp.BLL.Sevices.Interface;
using GenericApp.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using AutoMapper;

namespace GenericApp
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        public void ConfigurationServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddDbContext<ApplicationDBContext>(options =>
            {
                options.UseSqlServer(Configuration.GetConnectionString("defaultConnection"));
            });

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(op =>
                op.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = false,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["jwt:SecurityKeyJwt"])),
                    ClockSkew = TimeSpan.Zero
                });

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "GenericApp", Version = "V1" });
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header
                });
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
                });
            });

            services.AddIdentity<IdentityUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDBContext>()
                .AddDefaultTokenProviders();

            services.AddAuthorization(options =>
            {
                options.AddPolicy(nameof(AppPolicies.User), policy => policy.RequireClaim(nameof(AppPolicies.User)));
                options.AddPolicy(nameof(AppPolicies.IsChangePasswordNeeded), policy => policy.RequireClaim(nameof(AppPolicies.IsChangePasswordNeeded)));
            });

            services.AddCors(options =>
            {
                options.AddDefaultPolicy(builder =>
                {
                    builder.WithOrigins("http://localhost:60688").AllowAnyMethod().AllowAnyHeader();
                });
            });

            services.AddScoped<IRepository, Repository>();
            services.AddAutoMapper(typeof(Startup).Assembly);

            //services.AddDataProtection();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Configure the HTTP request pipeline.
            //if (env.IsDevelopment())
            //{
            //    app.UseSwagger();
            //    app.UseSwaggerUI();
            //}
            app.UseSwagger();
            app.UseSwaggerUI();
            app.UseHttpsRedirection();

            // ====================================================================
            // === CONFIGURACIÓN CLAVE PARA SERVIR IMÁGENES EN /api/img ===
            // ====================================================================

            // Esta configuración mapea la URL '/api/img' a la carpeta física 'wwwroot/img'.
            app.UseStaticFiles(new StaticFileOptions
            {
                // RequestPath: La URL que usará React para acceder (e.g., /api/img/logo.png)
                RequestPath = "/img",

                // FileProvider: La ubicación física de los archivos.
                FileProvider = new PhysicalFileProvider(
                    // Combina la ruta base de 'wwwroot' con la subcarpeta 'img'
                    Path.Combine(env.WebRootPath, "img")
                )
            });

            // Si necesitas servir archivos estáticos desde la raíz de wwwroot, descomenta esto:
            // app.UseStaticFiles(); 

            // ====================================================================

            app.UseRouting();
            app.UseCors();
            app.UseAuthorization();

            app.UseEndpoints(enpoints =>
            {
                enpoints.MapControllers();
            });
        }
    }
}
