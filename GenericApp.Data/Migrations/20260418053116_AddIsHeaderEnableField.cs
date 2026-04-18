using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddIsHeaderEnableField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsHeaderEnable",
                table: "ContractTemplates",
                type: "bit",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEKXJzIj8Ta6hNwLZuCoVXjCvLd8bU3Kh/EF7PLTD8SMLd0LDPPgM+3rQFfrwSJb4wQ==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsHeaderEnable",
                table: "ContractTemplates");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEDIr/P6mEDxAGxRMgWtCNpg65Uv8xfeMJsVCQ5lmgkNrWkRgJ9uaUr9dN6VUAmooRQ==");
        }
    }
}
