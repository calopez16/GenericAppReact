using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class EditShipmentDate : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "EmbarqueDate",
                table: "Shipments",
                newName: "ShipmentDate");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEF7I9h0DzUvMgFx2O9gRuqDir46sWI8RaY097koTrx9iwwrTRxKBWr/zrUFU3oIuWg==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ShipmentDate",
                table: "Shipments",
                newName: "EmbarqueDate");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEIeqgo1vkOYvlI1/VPyAoF/ayssTpFCBZH0tKHr1zA4DYMnA4F+e8e3JxuH1pvU3UQ==");
        }
    }
}
