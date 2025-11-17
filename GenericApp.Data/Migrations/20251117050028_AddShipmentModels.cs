using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddShipmentModels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaxBoxQuantity",
                table: "LabelTypes");

            migrationBuilder.AddColumn<decimal>(
                name: "MaxBoxQuantity",
                table: "Labels",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AlterColumn<string>(
                name: "Rfc",
                table: "Companies",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(13)",
                oldMaxLength: 13);

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "Companies",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Companies",
                type: "nvarchar(25)",
                maxLength: 25,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(25)",
                oldMaxLength: 25);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Companies",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Companies",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250);

            migrationBuilder.AddColumn<string>(
                name: "RegFdaNo",
                table: "Companies",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Shipments",
                columns: table => new
                {
                    IdShipment = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    EmbarqueDate = table.Column<DateTime>(type: "date", nullable: false),
                    IdUser = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    IdClient = table.Column<int>(type: "int", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    IdCity = table.Column<int>(type: "int", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shipments", x => x.IdShipment);
                    table.ForeignKey(
                        name: "FK_Shipments_Cities_IdCity",
                        column: x => x.IdCity,
                        principalTable: "Cities",
                        principalColumn: "IdCity",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Shipments_Clients_IdClient",
                        column: x => x.IdClient,
                        principalTable: "Clients",
                        principalColumn: "IdClient",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Manifests",
                columns: table => new
                {
                    IdManifest = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdShipment = table.Column<int>(type: "int", nullable: false),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    ExitDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    TemperatureTrailerBoxF = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TemperatureTrailerBoxC = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    IdSeason = table.Column<int>(type: "int", nullable: false),
                    IdDriver = table.Column<int>(type: "int", nullable: false),
                    TrailerPlate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TrailerBoxPlate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IdShippingCompany = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Manifests", x => x.IdManifest);
                    table.ForeignKey(
                        name: "FK_Manifests_Drivers_IdDriver",
                        column: x => x.IdDriver,
                        principalTable: "Drivers",
                        principalColumn: "IdDriver",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Manifests_Seasons_IdSeason",
                        column: x => x.IdSeason,
                        principalTable: "Seasons",
                        principalColumn: "IdSeason",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Manifests_Shipments_IdShipment",
                        column: x => x.IdShipment,
                        principalTable: "Shipments",
                        principalColumn: "IdShipment",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Manifests_ShippingCompanies_IdShippingCompany",
                        column: x => x.IdShippingCompany,
                        principalTable: "ShippingCompanies",
                        principalColumn: "IdShippingCompany",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ManifestPallets",
                columns: table => new
                {
                    IdManifestPallet = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdManifest = table.Column<int>(type: "int", nullable: false),
                    IdShipment = table.Column<int>(type: "int", nullable: false),
                    IdLabel = table.Column<int>(type: "int", nullable: false),
                    MaxBoxQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Position = table.Column<int>(type: "int", nullable: false),
                    TemperatureF = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TemperatureC = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManifestPallets", x => x.IdManifestPallet);
                    table.ForeignKey(
                        name: "FK_ManifestPallets_Labels_IdLabel",
                        column: x => x.IdLabel,
                        principalTable: "Labels",
                        principalColumn: "IdLabel",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ManifestPallets_Manifests_IdManifest",
                        column: x => x.IdManifest,
                        principalTable: "Manifests",
                        principalColumn: "IdManifest",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ManifestPallets_Shipments_IdShipment",
                        column: x => x.IdShipment,
                        principalTable: "Shipments",
                        principalColumn: "IdShipment",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ManifestPalletLoadings",
                columns: table => new
                {
                    IdManifestPalletLoading = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdManifestPallet = table.Column<int>(type: "int", nullable: false),
                    IdManifest = table.Column<int>(type: "int", nullable: false),
                    IdShipment = table.Column<int>(type: "int", nullable: false),
                    IdLabelType = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    BoxQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManifestPalletLoadings", x => x.IdManifestPalletLoading);
                    table.ForeignKey(
                        name: "FK_ManifestPalletLoadings_LabelTypes_IdLabelType",
                        column: x => x.IdLabelType,
                        principalTable: "LabelTypes",
                        principalColumn: "IdLabelType",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ManifestPalletLoadings_ManifestPallets_IdManifestPallet",
                        column: x => x.IdManifestPallet,
                        principalTable: "ManifestPallets",
                        principalColumn: "IdManifestPallet",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ManifestPalletLoadings_Manifests_IdManifest",
                        column: x => x.IdManifest,
                        principalTable: "Manifests",
                        principalColumn: "IdManifest",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ManifestPalletLoadings_Shipments_IdShipment",
                        column: x => x.IdShipment,
                        principalTable: "Shipments",
                        principalColumn: "IdShipment",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEEQ4tzF4Ks55Y5+tokDSrHqLWwFV9/Kahpnxas67EmDkFU5jCm9q0OIO7OYVwSquxA==");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdLabelType",
                table: "ManifestPalletLoadings",
                column: "IdLabelType");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdManifest",
                table: "ManifestPalletLoadings",
                column: "IdManifest");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdManifestPallet",
                table: "ManifestPalletLoadings",
                column: "IdManifestPallet");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdShipment",
                table: "ManifestPalletLoadings",
                column: "IdShipment");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_IdLabel",
                table: "ManifestPallets",
                column: "IdLabel");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_IdManifest",
                table: "ManifestPallets",
                column: "IdManifest");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_IdShipment",
                table: "ManifestPallets",
                column: "IdShipment");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdDriver",
                table: "Manifests",
                column: "IdDriver");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdSeason",
                table: "Manifests",
                column: "IdSeason");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdShipment",
                table: "Manifests",
                column: "IdShipment");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdShippingCompany",
                table: "Manifests",
                column: "IdShippingCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdCity",
                table: "Shipments",
                column: "IdCity");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdClient",
                table: "Shipments",
                column: "IdClient");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ManifestPalletLoadings");

            migrationBuilder.DropTable(
                name: "ManifestPallets");

            migrationBuilder.DropTable(
                name: "Manifests");

            migrationBuilder.DropTable(
                name: "Shipments");

            migrationBuilder.DropColumn(
                name: "MaxBoxQuantity",
                table: "Labels");

            migrationBuilder.DropColumn(
                name: "RegFdaNo",
                table: "Companies");

            migrationBuilder.AddColumn<int>(
                name: "MaxBoxQuantity",
                table: "LabelTypes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "Rfc",
                table: "Companies",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(13)",
                oldMaxLength: 13,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "Companies",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Phone",
                table: "Companies",
                type: "nvarchar(25)",
                maxLength: 25,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(25)",
                oldMaxLength: 25,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "Companies",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Address",
                table: "Companies",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEAytFZuRwyfgHVhMbK1sEGz1vV04UNxNEsWNhc0xJpNufN02HXelxNV2Es0/qO0BFw==");
        }
    }
}
