using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class addLogoNameCompany : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCompany",
                table: "Shipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdCompany",
                table: "Manifests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Logo",
                table: "Companies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "AspNetRoles",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[] { "a18be9c0-aa65-4af8-bd17-00bd9344e578", "a18be9c0-aa65-4af8-bd17-00bd9344e578", "MultiEmpresa", "MULTIEMPRESA" });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEL0oiNX9xvFU1SH6xuOsT4W9DEQKHp6Hrx51Hj1k4lIfI1E2K8dfYftM1ttcm+Z5Pg==");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdCompany",
                table: "Shipments",
                column: "IdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdCompany",
                table: "Manifests",
                column: "IdCompany");

            migrationBuilder.AddForeignKey(
                name: "FK_Manifests_Companies_IdCompany",
                table: "Manifests",
                column: "IdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Shipments_Companies_IdCompany",
                table: "Shipments",
                column: "IdCompany",
                principalTable: "Companies",
                principalColumn: "IdCompany",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Manifests_Companies_IdCompany",
                table: "Manifests");

            migrationBuilder.DropForeignKey(
                name: "FK_Shipments_Companies_IdCompany",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_IdCompany",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Manifests_IdCompany",
                table: "Manifests");

            migrationBuilder.DeleteData(
                table: "AspNetRoles",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e578");

            migrationBuilder.DropColumn(
                name: "IdCompany",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "IdCompany",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "Logo",
                table: "Companies");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEF7I9h0DzUvMgFx2O9gRuqDir46sWI8RaY097koTrx9iwwrTRxKBWr/zrUFU3oIuWg==");
        }
    }
}
