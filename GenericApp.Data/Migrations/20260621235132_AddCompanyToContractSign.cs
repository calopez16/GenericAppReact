using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddCompanyToContractSign : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCompany",
                table: "ContractSigns",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdCompanyNavigationIdCompany",
                table: "ContractSigns",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEHXxi/mgt+6RlptkDmaKr7UOVlrwru3Q68nuwshLIumd80BM7xcsXW7aWiPowgnuXQ==");

            migrationBuilder.CreateIndex(
                name: "IX_ContractSigns_IdCompanyNavigationIdCompany",
                table: "ContractSigns",
                column: "IdCompanyNavigationIdCompany");

            migrationBuilder.AddForeignKey(
                name: "FK_ContractSigns_Companies_IdCompanyNavigationIdCompany",
                table: "ContractSigns",
                column: "IdCompanyNavigationIdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ContractSigns_Companies_IdCompanyNavigationIdCompany",
                table: "ContractSigns");

            migrationBuilder.DropIndex(
                name: "IX_ContractSigns_IdCompanyNavigationIdCompany",
                table: "ContractSigns");

            migrationBuilder.DropColumn(
                name: "IdCompany",
                table: "ContractSigns");

            migrationBuilder.DropColumn(
                name: "IdCompanyNavigationIdCompany",
                table: "ContractSigns");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEALEDyqJ68CNqjqz/kLoDldUIT9AnmnaviMYziv2vgjrfnpCJupqFRtHUeonDIuq1w==");
        }
    }
}
