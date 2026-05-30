using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class EmployeeFix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeBeneficiaries_EmployeeWorkInformations_EmployeeWorkInformationIdEmployeeWorkInformation",
                table: "EmployeeBeneficiaries");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeBeneficiaries_EmployeeWorkInformationIdEmployeeWorkInformation",
                table: "EmployeeBeneficiaries");

            migrationBuilder.DropColumn(
                name: "EmployeeWorkInformationIdEmployeeWorkInformation",
                table: "EmployeeBeneficiaries");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEC3LFFajVjwhDEsjh7JKNev+LdLGbHd6LE5/kXkcqxt9PwHoQ24R/Ya0D+0GvxZdFQ==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EmployeeWorkInformationIdEmployeeWorkInformation",
                table: "EmployeeBeneficiaries",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEFMiGudeBFuR3oDY5lF7v6ctiTFbzxtIi8hege6ab6b11wMNQYHNfYg79qOsYyAb1Q==");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeBeneficiaries_EmployeeWorkInformationIdEmployeeWorkInformation",
                table: "EmployeeBeneficiaries",
                column: "EmployeeWorkInformationIdEmployeeWorkInformation");

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeBeneficiaries_EmployeeWorkInformations_EmployeeWorkInformationIdEmployeeWorkInformation",
                table: "EmployeeBeneficiaries",
                column: "EmployeeWorkInformationIdEmployeeWorkInformation",
                principalTable: "EmployeeWorkInformations",
                principalColumn: "IdEmployeeWorkInformation");
        }
    }
}
