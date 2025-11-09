using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class FixShippingCompany : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShippingCompanies_Companies_IdCompanyNavigationIdCompany",
                table: "ShippingCompanies");

            migrationBuilder.DropIndex(
                name: "IX_ShippingCompanies_IdCompanyNavigationIdCompany",
                table: "ShippingCompanies");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "ShippingCompanies");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEKBiPwakPucfWtwTPtZHQRDyAcsf2NWi71FrjhblGmjUMMbF3Du2XEKIs3Cq8NY+fQ==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "ShippingCompanies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAENgwlxmn3dcKdjKtj4xpDHaXFxhpJ6nQRSbrzKXhtIDZ7ZS7jehr5CyzyUL4C9LlzA==");

            migrationBuilder.CreateIndex(
                name: "IX_ShippingCompanies_IdCompanyNavigationIdCompany",
                table: "ShippingCompanies",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.AddForeignKey(
                name: "FK_ShippingCompanies_Companies_IdCompanyNavigationIdCompany",
                table: "ShippingCompanies",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
