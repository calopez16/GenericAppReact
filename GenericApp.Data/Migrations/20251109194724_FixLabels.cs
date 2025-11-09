using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class FixLabels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Labels_Companies_IdCompanyNavigationIdCompany",
                table: "Labels");

            migrationBuilder.DropIndex(
                name: "IX_Labels_IdCompanyNavigationIdCompany",
                table: "Labels");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "Labels");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEAytFZuRwyfgHVhMbK1sEGz1vV04UNxNEsWNhc0xJpNufN02HXelxNV2Es0/qO0BFw==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "Labels",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEKBiPwakPucfWtwTPtZHQRDyAcsf2NWi71FrjhblGmjUMMbF3Du2XEKIs3Cq8NY+fQ==");

            migrationBuilder.CreateIndex(
                name: "IX_Labels_IdCompanyNavigationIdCompany",
                table: "Labels",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.AddForeignKey(
                name: "FK_Labels_Companies_IdCompanyNavigationIdCompany",
                table: "Labels",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
