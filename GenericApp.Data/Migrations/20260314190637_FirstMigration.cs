using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class FirstMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApplicationLogs",
                columns: table => new
                {
                    IdApplicationLog = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IdAspNetUsers = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Module = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IdDataAffected = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Details = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Details2 = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationLogs", x => x.IdApplicationLog);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    IdCompany = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    RazonSocial = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rfc = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    RegFdaNo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Empaque = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GnnNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    LogoName = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.IdCompany);
                });

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    IdCountry = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.IdCountry);
                });

            migrationBuilder.CreateTable(
                name: "Parameters",
                columns: table => new
                {
                    IdParameter = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ParameterCode = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parameters", x => x.IdParameter);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokenAspNetUser",
                columns: table => new
                {
                    IdRefreshTokenAspNetUser = table.Column<int>(type: "int", maxLength: 80, nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IdUser = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    RefreshToken = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValueSql: "1")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokenAspNetUser", x => x.IdRefreshTokenAspNetUser);
                });

            migrationBuilder.CreateTable(
                name: "UserDetails",
                columns: table => new
                {
                    IdUserDetail = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdUser = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    IdCompany = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserDetails", x => x.IdUserDetail);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "States",
                columns: table => new
                {
                    IdState = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IdCountry = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_States", x => x.IdState);
                    table.ForeignKey(
                        name: "FK_States_Countries_IdCountry",
                        column: x => x.IdCountry,
                        principalTable: "Countries",
                        principalColumn: "IdCountry",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    IdCity = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IdState = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.IdCity);
                    table.ForeignKey(
                        name: "FK_Cities_States_IdState",
                        column: x => x.IdState,
                        principalTable: "States",
                        principalColumn: "IdState",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    IdClient = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Rfc = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IdCity = table.Column<int>(type: "int", nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    IdCompany = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Clients", x => x.IdClient);
                    table.ForeignKey(
                        name: "FK_Clients_Cities_IdCity",
                        column: x => x.IdCity,
                        principalTable: "Cities",
                        principalColumn: "IdCity",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Clients_Companies_IdCompany",
                        column: x => x.IdCompany,
                        principalTable: "Companies",
                        principalColumn: "IdCompany",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "a18be9c0-aa65-4af8-bd17-00bd9344e575", "a18be9c0-aa65-4af8-bd17-00bd9344e575", "Administrator", "ADMINISTRATOR" },
                    { "a18be9c0-aa65-4af8-bd17-00bd9344e576", "a18be9c0-aa65-4af8-bd17-00bd9344e576", "User", "USER" },
                    { "a18be9c0-aa65-4af8-bd17-00bd9344e578", "a18be9c0-aa65-4af8-bd17-00bd9344e578", "MultiEmpresa", "MULTIEMPRESA" }
                });

            migrationBuilder.InsertData(
                table: "AspNetUsers",
                columns: new[] { "Id", "AccessFailedCount", "ConcurrencyStamp", "Email", "EmailConfirmed", "LockoutEnabled", "LockoutEnd", "NormalizedEmail", "NormalizedUserName", "PasswordHash", "PhoneNumber", "PhoneNumberConfirmed", "SecurityStamp", "TwoFactorEnabled", "UserName" },
                values: new object[] { "a18be9c0-aa65-4af8-bd17-00bd9344e577", 0, "a18be9c0-aa65-4af8-bd17-00bd9344e577", "admin", true, false, null, "ADMIN", "ADMIN", "AQAAAAEAACcQAAAAEJ7xutA1nZ9OFQAeBaATDSl7OsSTL15OIUX3i6WmGlooXRvbtNk7G4mA2fh7vHL5ag==", null, false, "00000000-0000-0000-0000-000000000000", false, "admin" });

            migrationBuilder.InsertData(
                table: "Companies",
                columns: new[] { "IdCompany", "Address", "Empaque", "GnnNumber", "IsActive", "IsDeleted", "LogoName", "Name", "Notes", "Phone", "PostalCode", "RazonSocial", "RegFdaNo", "Rfc" },
                values: new object[] { 1, null, null, null, true, false, null, "Mision", null, null, null, null, null, null });

            migrationBuilder.InsertData(
                table: "Countries",
                columns: new[] { "IdCountry", "Description", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "México", true, false },
                    { 2, "Estados Unidos", true, false }
                });

            migrationBuilder.InsertData(
                table: "UserDetails",
                columns: new[] { "IdUserDetail", "IdCompany", "IdUser" },
                values: new object[] { 1, 1, "a18be9c0-aa65-4af8-bd17-00bd9344e577" });

            migrationBuilder.InsertData(
                table: "AspNetUserClaims",
                columns: new[] { "Id", "ClaimType", "ClaimValue", "UserId" },
                values: new object[] { -1, "User", "1", "a18be9c0-aa65-4af8-bd17-00bd9344e577" });

            migrationBuilder.InsertData(
                table: "AspNetUserRoles",
                columns: new[] { "RoleId", "UserId" },
                values: new object[] { "a18be9c0-aa65-4af8-bd17-00bd9344e575", "a18be9c0-aa65-4af8-bd17-00bd9344e577" });

            migrationBuilder.InsertData(
                table: "States",
                columns: new[] { "IdState", "Description", "IdCountry", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Aguascalientes", 1, true, false },
                    { 2, "Baja California", 1, true, false },
                    { 3, "Baja California Sur", 1, true, false },
                    { 4, "Campeche", 1, true, false },
                    { 5, "Coahuila", 1, true, false },
                    { 6, "Colima", 1, true, false },
                    { 7, "Chiapas", 1, true, false },
                    { 8, "Chihuahua", 1, true, false },
                    { 9, "Ciudad de México", 1, true, false },
                    { 10, "Durango", 1, true, false },
                    { 11, "Guanajuato", 1, true, false },
                    { 12, "Guerrero", 1, true, false },
                    { 13, "Hidalgo", 1, true, false },
                    { 14, "Jalisco", 1, true, false },
                    { 15, "Estado de México", 1, true, false },
                    { 16, "Michoacán", 1, true, false },
                    { 17, "Morelos", 1, true, false },
                    { 18, "Nayarit", 1, true, false },
                    { 19, "Nuevo León", 1, true, false },
                    { 20, "Oaxaca", 1, true, false },
                    { 21, "Puebla", 1, true, false },
                    { 22, "Querétaro", 1, true, false },
                    { 23, "Quintana Roo", 1, true, false },
                    { 24, "San Luis Potosí", 1, true, false },
                    { 25, "Sinaloa", 1, true, false },
                    { 26, "Sonora", 1, true, false },
                    { 27, "Tabasco", 1, true, false },
                    { 28, "Tamaulipas", 1, true, false },
                    { 29, "Tlaxcala", 1, true, false },
                    { 30, "Veracruz", 1, true, false },
                    { 31, "Yucatán", 1, true, false },
                    { 32, "Zacatecas", 1, true, false },
                    { 33, "Alabama", 2, true, false },
                    { 34, "Alaska", 2, true, false },
                    { 35, "Arizona", 2, true, false },
                    { 36, "Arkansas", 2, true, false },
                    { 37, "California", 2, true, false },
                    { 38, "Colorado", 2, true, false },
                    { 39, "Connecticut", 2, true, false },
                    { 40, "Delaware", 2, true, false }
                });

            migrationBuilder.InsertData(
                table: "States",
                columns: new[] { "IdState", "Description", "IdCountry", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 41, "Florida", 2, true, false },
                    { 42, "Georgia", 2, true, false },
                    { 43, "Hawaii", 2, true, false },
                    { 44, "Idaho", 2, true, false },
                    { 45, "Illinois", 2, true, false },
                    { 46, "Indiana", 2, true, false },
                    { 47, "Iowa", 2, true, false },
                    { 48, "Kansas", 2, true, false },
                    { 49, "Kentucky", 2, true, false },
                    { 50, "Louisiana", 2, true, false },
                    { 51, "Maine", 2, true, false },
                    { 52, "Maryland", 2, true, false },
                    { 53, "Massachusetts", 2, true, false },
                    { 54, "Michigan", 2, true, false },
                    { 55, "Minnesota", 2, true, false },
                    { 56, "Mississippi", 2, true, false },
                    { 57, "Missouri", 2, true, false },
                    { 58, "Montana", 2, true, false },
                    { 59, "Nebraska", 2, true, false },
                    { 60, "Nevada", 2, true, false },
                    { 61, "New Hampshire", 2, true, false },
                    { 62, "New Jersey", 2, true, false },
                    { 63, "New Mexico", 2, true, false },
                    { 64, "New York", 2, true, false },
                    { 65, "North Carolina", 2, true, false },
                    { 66, "North Dakota", 2, true, false },
                    { 67, "Ohio", 2, true, false },
                    { 68, "Oklahoma", 2, true, false },
                    { 69, "Oregon", 2, true, false },
                    { 70, "Pennsylvania", 2, true, false },
                    { 71, "Rhode Island", 2, true, false },
                    { 72, "South Carolina", 2, true, false },
                    { 73, "South Dakota", 2, true, false },
                    { 74, "Tennessee", 2, true, false },
                    { 75, "Texas", 2, true, false },
                    { 76, "Utah", 2, true, false },
                    { 77, "Vermont", 2, true, false },
                    { 78, "Virginia", 2, true, false },
                    { 79, "Washington", 2, true, false },
                    { 80, "West Virginia", 2, true, false },
                    { 81, "Wisconsin", 2, true, false },
                    { 82, "Wyoming", 2, true, false }
                });

            migrationBuilder.InsertData(
                table: "Cities",
                columns: new[] { "IdCity", "Description", "IdState", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Tijuana", 2, true, false },
                    { 2, "Mexicali", 2, true, false },
                    { 3, "Ensenada", 2, true, false },
                    { 4, "Playas de Rosarito", 2, true, false },
                    { 5, "Tecate", 2, true, false },
                    { 6, "San Quintín", 2, true, false },
                    { 7, "San Felipe", 2, true, false },
                    { 8, "Los Angeles", 37, true, false },
                    { 9, "San Diego", 37, true, false },
                    { 10, "San Jose", 37, true, false },
                    { 11, "Calexico", 37, true, false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Cities_IdState",
                table: "Cities",
                column: "IdState");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_IdCity",
                table: "Clients",
                column: "IdCity");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_IdCompany",
                table: "Clients",
                column: "IdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_States_IdCountry",
                table: "States",
                column: "IdCountry");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationLogs");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropTable(
                name: "Parameters");

            migrationBuilder.DropTable(
                name: "RefreshTokenAspNetUser");

            migrationBuilder.DropTable(
                name: "UserDetails");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Cities");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "States");

            migrationBuilder.DropTable(
                name: "Countries");
        }
    }
}
