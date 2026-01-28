using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddManifestShipmentNo : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ShipmentNo",
                table: "Shipments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ManifestNo",
                table: "Manifests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEItVqnBIwpkr6SQayKMlb0uUSa4whyaTAsOUW6d/rtGEqsRuy/DzKIIwO8Shjnagag==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShipmentNo",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "ManifestNo",
                table: "Manifests");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAELPhODfdO8XwcWiRtyE/1QLagOMIvNLHRepsA7QKnm6UL7l9uzHay3SC4VjBB5wZ1w==");
        }
    }
}
