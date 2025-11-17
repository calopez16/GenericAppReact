using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddNavigations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdCityNavigationIdCity",
                table: "Shipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "IdClientNavigationIdClient",
                table: "Shipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Shipments",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ShipmentStatusNavigationIdShipmentStatus",
                table: "Shipments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "DriverNavigationIdDriver",
                table: "Manifests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "Manifests",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ManifestStatusNavigationIdManifestStatus",
                table: "Manifests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ShipmentNavigationIdShipment",
                table: "Manifests",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LabelNavigationIdLabel",
                table: "ManifestPallets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ManifestNavigationIdManifest",
                table: "ManifestPallets",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "LabelTypeNavigationIdLabelType",
                table: "ManifestPalletLoadings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ManifestPalletNavigationIdManifestPallet",
                table: "ManifestPalletLoadings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEPc8RBuiaBvdQIah0qZbO9f9oyoLrtU50t0AAZEGEM7D36cl6Ns2yODd6vlFKHEfZA==");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdCityNavigationIdCity",
                table: "Shipments",
                column: "IdCityNavigationIdCity");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdClientNavigationIdClient",
                table: "Shipments",
                column: "IdClientNavigationIdClient");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_ShipmentStatusNavigationIdShipmentStatus",
                table: "Shipments",
                column: "ShipmentStatusNavigationIdShipmentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_DriverNavigationIdDriver",
                table: "Manifests",
                column: "DriverNavigationIdDriver");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_ManifestStatusNavigationIdManifestStatus",
                table: "Manifests",
                column: "ManifestStatusNavigationIdManifestStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_ShipmentNavigationIdShipment",
                table: "Manifests",
                column: "ShipmentNavigationIdShipment");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_LabelNavigationIdLabel",
                table: "ManifestPallets",
                column: "LabelNavigationIdLabel");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_ManifestNavigationIdManifest",
                table: "ManifestPallets",
                column: "ManifestNavigationIdManifest");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_LabelTypeNavigationIdLabelType",
                table: "ManifestPalletLoadings",
                column: "LabelTypeNavigationIdLabelType");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_ManifestPalletNavigationIdManifestPallet",
                table: "ManifestPalletLoadings",
                column: "ManifestPalletNavigationIdManifestPallet");

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPalletLoadings_LabelTypes_LabelTypeNavigationIdLabelType",
                table: "ManifestPalletLoadings",
                column: "LabelTypeNavigationIdLabelType",
                principalTable: "LabelTypes",
                principalColumn: "IdLabelType",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPalletLoadings_ManifestPallets_ManifestPalletNavigationIdManifestPallet",
                table: "ManifestPalletLoadings",
                column: "ManifestPalletNavigationIdManifestPallet",
                principalTable: "ManifestPallets",
                principalColumn: "IdManifestPallet",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPallets_Labels_LabelNavigationIdLabel",
                table: "ManifestPallets",
                column: "LabelNavigationIdLabel",
                principalTable: "Labels",
                principalColumn: "IdLabel",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ManifestPallets_Manifests_ManifestNavigationIdManifest",
                table: "ManifestPallets",
                column: "ManifestNavigationIdManifest",
                principalTable: "Manifests",
                principalColumn: "IdManifest",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Manifests_Drivers_DriverNavigationIdDriver",
                table: "Manifests",
                column: "DriverNavigationIdDriver",
                principalTable: "Drivers",
                principalColumn: "IdDriver",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Manifests_ManifestStatuses_ManifestStatusNavigationIdManifestStatus",
                table: "Manifests",
                column: "ManifestStatusNavigationIdManifestStatus",
                principalTable: "ManifestStatuses",
                principalColumn: "IdManifestStatus",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Manifests_Shipments_ShipmentNavigationIdShipment",
                table: "Manifests",
                column: "ShipmentNavigationIdShipment",
                principalTable: "Shipments",
                principalColumn: "IdShipment",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Shipments_Cities_IdCityNavigationIdCity",
                table: "Shipments",
                column: "IdCityNavigationIdCity",
                principalTable: "Cities",
                principalColumn: "IdCity",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Shipments_Clients_IdClientNavigationIdClient",
                table: "Shipments",
                column: "IdClientNavigationIdClient",
                principalTable: "Clients",
                principalColumn: "IdClient",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Shipments_ShipmentStatuses_ShipmentStatusNavigationIdShipmentStatus",
                table: "Shipments",
                column: "ShipmentStatusNavigationIdShipmentStatus",
                principalTable: "ShipmentStatuses",
                principalColumn: "IdShipmentStatus",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPalletLoadings_LabelTypes_LabelTypeNavigationIdLabelType",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPalletLoadings_ManifestPallets_ManifestPalletNavigationIdManifestPallet",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPallets_Labels_LabelNavigationIdLabel",
                table: "ManifestPallets");

            migrationBuilder.DropForeignKey(
                name: "FK_ManifestPallets_Manifests_ManifestNavigationIdManifest",
                table: "ManifestPallets");

            migrationBuilder.DropForeignKey(
                name: "FK_Manifests_Drivers_DriverNavigationIdDriver",
                table: "Manifests");

            migrationBuilder.DropForeignKey(
                name: "FK_Manifests_ManifestStatuses_ManifestStatusNavigationIdManifestStatus",
                table: "Manifests");

            migrationBuilder.DropForeignKey(
                name: "FK_Manifests_Shipments_ShipmentNavigationIdShipment",
                table: "Manifests");

            migrationBuilder.DropForeignKey(
                name: "FK_Shipments_Cities_IdCityNavigationIdCity",
                table: "Shipments");

            migrationBuilder.DropForeignKey(
                name: "FK_Shipments_Clients_IdClientNavigationIdClient",
                table: "Shipments");

            migrationBuilder.DropForeignKey(
                name: "FK_Shipments_ShipmentStatuses_ShipmentStatusNavigationIdShipmentStatus",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_IdCityNavigationIdCity",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_IdClientNavigationIdClient",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Shipments_ShipmentStatusNavigationIdShipmentStatus",
                table: "Shipments");

            migrationBuilder.DropIndex(
                name: "IX_Manifests_DriverNavigationIdDriver",
                table: "Manifests");

            migrationBuilder.DropIndex(
                name: "IX_Manifests_ManifestStatusNavigationIdManifestStatus",
                table: "Manifests");

            migrationBuilder.DropIndex(
                name: "IX_Manifests_ShipmentNavigationIdShipment",
                table: "Manifests");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPallets_LabelNavigationIdLabel",
                table: "ManifestPallets");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPallets_ManifestNavigationIdManifest",
                table: "ManifestPallets");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPalletLoadings_LabelTypeNavigationIdLabelType",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropIndex(
                name: "IX_ManifestPalletLoadings_ManifestPalletNavigationIdManifestPallet",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropColumn(
                name: "IdCityNavigationIdCity",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "IdClientNavigationIdClient",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "ShipmentStatusNavigationIdShipmentStatus",
                table: "Shipments");

            migrationBuilder.DropColumn(
                name: "DriverNavigationIdDriver",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "ManifestStatusNavigationIdManifestStatus",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "ShipmentNavigationIdShipment",
                table: "Manifests");

            migrationBuilder.DropColumn(
                name: "LabelNavigationIdLabel",
                table: "ManifestPallets");

            migrationBuilder.DropColumn(
                name: "ManifestNavigationIdManifest",
                table: "ManifestPallets");

            migrationBuilder.DropColumn(
                name: "LabelTypeNavigationIdLabelType",
                table: "ManifestPalletLoadings");

            migrationBuilder.DropColumn(
                name: "ManifestPalletNavigationIdManifestPallet",
                table: "ManifestPalletLoadings");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAELqpxh6QsckSfG6pYumBGLRpINcJOdhgNKC6/07S42O/sk2kn4PwACsEyVxSWM1orw==");
        }
    }
}
