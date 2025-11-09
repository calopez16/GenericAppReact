using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class FixesSeasons : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Seasons_Companies_IdCompanyNavigationIdCompany",
                table: "Seasons");

            migrationBuilder.DropIndex(
                name: "IX_Seasons_IdCompanyNavigationIdCompany",
                table: "Seasons");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "Seasons");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEOgIdL6lXLphYzMtJLBJlmEu77FxnD2Ejqwn+dU7uzio3GMkoCNWOw45fcQSV2//Sw==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "Seasons",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBWTDXgpdcXQrLU9f9tGDTf6voDCnYfttGlzjxz4ECdvf7eqCllv/7DkyXKlVE17xQ==");

            migrationBuilder.CreateIndex(
                name: "IX_Seasons_IdCompanyNavigationIdCompany",
                table: "Seasons",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.AddForeignKey(
                name: "FK_Seasons_Companies_IdCompanyNavigationIdCompany",
                table: "Seasons",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
