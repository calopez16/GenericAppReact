using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddIdCompanyNavigationContractSign : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractSigns_Companies_IdCompanyNavigationIdCompany",
                table: "ContractSigns");

            migrationBuilder.DropTable(
                name: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_ContractSigns_IdCompanyNavigationIdCompany",
                table: "ContractSigns");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "ContractSigns");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBV1B6Jv9waxVKRrM9vewkulgA5AgCssrq19fmbbyiTHIrnBdalh0sIt65qH2RJvxA==");

            migrationBuilder.CreateIndex(
                name: "IX_ContractSigns_IdCompany",
                table: "ContractSigns",
                column: "IdCompany");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractSigns_Companies_IdCompany",
                table: "ContractSigns",
                column: "IdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractSigns_Companies_IdCompany",
                table: "ContractSigns");

            migrationBuilder.DropIndex(
                name: "IX_ContractSigns_IdCompany",
                table: "ContractSigns");

            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "ContractSigns",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Clients",
                columns: table => new
                {
                    IdClient = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCity = table.Column<int>(type: "int", nullable: true),
                    IdCompany = table.Column<int>(type: "int", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Code = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Rfc = table.Column<string>(type: "nvarchar(13)", maxLength: 13, nullable: true)
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

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEAdLsGIkxwtw3jsQ3xmHo0VYOXTVcXPsZ5oRiSAFLxAFBCOgxmJ92dSFKIN6PRFoug==");

            migrationBuilder.CreateIndex(
                name: "IX_ContractSigns_IdCompanyNavigationIdCompany",
                table: "ContractSigns",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_IdCity",
                table: "Clients",
                column: "IdCity");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_IdCompany",
                table: "Clients",
                column: "IdCompany");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractSigns_Companies_IdCompanyNavigationIdCompany",
                table: "ContractSigns",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany");
        }
    }
}
