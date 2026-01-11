using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddRazonSocialFieldCompany : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RazonSocial",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEG8t7sHaRhJ/S66bMS4+VZnxf6qAYPvIaM3hn9Po9Mwv+BpL9GrUBRNr1TUrehUYow==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RazonSocial",
                table: "Companies");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBL77DBMRluTI0y4X+K1MYw3+EeJHwPOhFjIe5O/c0HE570dtSQ538DCUzuBRazk0g==");
        }
    }
}
