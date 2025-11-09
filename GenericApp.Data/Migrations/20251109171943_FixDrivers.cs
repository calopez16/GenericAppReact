using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class FixDrivers : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Drivers_Companies_IdCompanyNavigationIdCompany",
                table: "Drivers");

            migrationBuilder.DropIndex(
                name: "IX_Drivers_IdCompanyNavigationIdCompany",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "Drivers");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAENgwlxmn3dcKdjKtj4xpDHaXFxhpJ6nQRSbrzKXhtIDZ7ZS7jehr5CyzyUL4C9LlzA==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "Drivers",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEOgIdL6lXLphYzMtJLBJlmEu77FxnD2Ejqwn+dU7uzio3GMkoCNWOw45fcQSV2//Sw==");

            migrationBuilder.CreateIndex(
                name: "IX_Drivers_IdCompanyNavigationIdCompany",
                table: "Drivers",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.AddForeignKey(
                name: "FK_Drivers_Companies_IdCompanyNavigationIdCompany",
                table: "Drivers",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
