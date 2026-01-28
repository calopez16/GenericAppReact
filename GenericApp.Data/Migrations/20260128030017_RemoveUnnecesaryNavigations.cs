using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class RemoveUnnecesaryNavigations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPalletLoadings_Manifests_IdManifestNavigationIdManifest",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPalletLoadings_Shipments_IdShipmentNavigationIdShipment",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPallets_Shipments_IdShipmentNavigationIdShipment",
                table: "ManifestPallets");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPallets_IdShipmentNavigationIdShipment",
                table: "ManifestPallets");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPalletLoadings_IdManifestNavigationIdManifest",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPalletLoadings_IdShipmentNavigationIdShipment",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropColumn(
                name: "IdShipmentNavigationIdShipment",
                table: "ManifestPallets");

            migrationBuilder.DropColumn(
                name: "IdManifestNavigationIdManifest",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropColumn(
                name: "IdShipmentNavigationIdShipment",
                table: "ManifestPalletLoadings");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAELPhODfdO8XwcWiRtyE/1QLagOMIvNLHRepsA7QKnm6UL7l9uzHay3SC4VjBB5wZ1w==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdShipmentNavigationIdShipment",
                table: "ManifestPallets",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdManifestNavigationIdManifest",
                table: "ManifestPalletLoadings",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdShipmentNavigationIdShipment",
                table: "ManifestPalletLoadings",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEB5ABrZAt4J/Z0PDafsZ0IE071MdyWQfZMOS2E0qITEjtz3Jdc76NJB7FOprwtbTMQ==");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_IdShipmentNavigationIdShipment",
                table: "ManifestPallets",
                column: "IdShipmentNavigationIdShipment");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdManifestNavigationIdManifest",
                table: "ManifestPalletLoadings",
                column: "IdManifestNavigationIdManifest");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdShipmentNavigationIdShipment",
                table: "ManifestPalletLoadings",
                column: "IdShipmentNavigationIdShipment");

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPalletLoadings_Manifests_IdManifestNavigationIdManifest",
                table: "ManifestPalletLoadings",
                column: "IdManifestNavigationIdManifest",
                principalTable: "Manifests",
                principalColumn: "IdManifest");

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPalletLoadings_Shipments_IdShipmentNavigationIdShipment",
                table: "ManifestPalletLoadings",
                column: "IdShipmentNavigationIdShipment",
                principalTable: "Shipments",
                principalColumn: "IdShipment");

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPallets_Shipments_IdShipmentNavigationIdShipment",
                table: "ManifestPallets",
                column: "IdShipmentNavigationIdShipment",
                principalTable: "Shipments",
                principalColumn: "IdShipment");
        }
    }
}
