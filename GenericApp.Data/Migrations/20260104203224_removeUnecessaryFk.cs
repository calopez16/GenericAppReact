using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class removeUnecessaryFk : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPalletLoadings_Manifests_IdManifest",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPalletLoadings_Shipments_IdShipment",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPallets_Shipments_IdShipment",
                table: "ManifestPallets");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPallets_IdShipment",
                table: "ManifestPallets");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPalletLoadings_IdManifest",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPalletLoadings_IdShipment",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropColumn(
                name: "IdShipment",
                table: "ManifestPallets");

            migrationBuilder.DropColumn(
                name: "IdManifest",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropColumn(
                name: "IdShipment",
                table: "ManifestPalletLoadings");

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
                value: "AQAAAAEAACcQAAAAEACGJjPE+DweBYC3QU1O0RLNtmn5/KWJWMLJNvff6ojGAoRzk05jEvqSlGl9iPHTwA==");

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

        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.AddColumn<int>(
                name: "IdShipment",
                table: "ManifestPallets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdManifest",
                table: "ManifestPalletLoadings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdShipment",
                table: "ManifestPalletLoadings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEFrHbd2k2Ds5p4J8fgGpyb97MhMNUeACDJaa3MoTAwS8wPEwMHtFuwWPwZA5DEZt4w==");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_IdShipment",
                table: "ManifestPallets",
                column: "IdShipment");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdManifest",
                table: "ManifestPalletLoadings",
                column: "IdManifest");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdShipment",
                table: "ManifestPalletLoadings",
                column: "IdShipment");

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPalletLoadings_Manifests_IdManifest",
                table: "ManifestPalletLoadings",
                column: "IdManifest",
                principalTable: "Manifests",
                principalColumn: "IdManifest",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPalletLoadings_Shipments_IdShipment",
                table: "ManifestPalletLoadings",
                column: "IdShipment",
                principalTable: "Shipments",
                principalColumn: "IdShipment",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPallets_Shipments_IdShipment",
                table: "ManifestPallets",
                column: "IdShipment",
                principalTable: "Shipments",
                principalColumn: "IdShipment",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
