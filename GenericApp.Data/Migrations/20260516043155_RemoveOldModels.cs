using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class RemoveOldModels : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ManifestPalletLoadings");

            migrationBuilder.DropTable(
                name: "LabelTypes");

            migrationBuilder.DropTable(
                name: "ManifestPallets");

            migrationBuilder.DropTable(
                name: "Labels");

            migrationBuilder.DropTable(
                name: "Manifests");

            migrationBuilder.DropTable(
                name: "ManifestStatuses");

            migrationBuilder.DropTable(
                name: "Shipments");

            migrationBuilder.DropTable(
                name: "ShippingCompanies");

            migrationBuilder.DropTable(
                name: "TrailerBoxType");

            migrationBuilder.DropTable(
                name: "ShipmentStatuses");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEHNPM7LV6pdpaIuv8Gn3SqHT957L6xcVCMbesOjw7u0S/xqI5ZkOf9mqQQRmOh7xDw==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Labels",
                columns: table => new
                {
                    IdLabel = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCompany = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    MaxBoxQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Labels", x => x.IdLabel);
                    table.ForeignKey(
                        name: "FK_Labels_Companies_IdCompany",
                        column: x => x.IdCompany,
                        principalTable: "Companies",
                        principalColumn: "IdCompany",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ManifestStatuses",
                columns: table => new
                {
                    IdManifestStatus = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ManifestStatuses", x => x.IdManifestStatus);
                });

            migrationBuilder.CreateTable(
                name: "ShipmentStatuses",
                columns: table => new
                {
                    IdShipmentStatus = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShipmentStatuses", x => x.IdShipmentStatus);
                });

            migrationBuilder.CreateTable(
                name: "ShippingCompanies",
                columns: table => new
                {
                    IdShippingCompany = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCompany = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShippingCompanies", x => x.IdShippingCompany);
                });

            migrationBuilder.CreateTable(
                name: "TrailerBoxType",
                columns: table => new
                {
                    IdTrailerBoxType = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TrailerBoxType", x => x.IdTrailerBoxType);
                });

            migrationBuilder.CreateTable(
                name: "LabelTypes",
                columns: table => new
                {
                    IdLabelType = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdLabel = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    Size = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LabelTypes", x => x.IdLabelType);
                    table.ForeignKey(
                        name: "FK_LabelTypes_Labels_IdLabel",
                        column: x => x.IdLabel,
                        principalTable: "Labels",
                        principalColumn: "IdLabel",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Shipments",
                columns: table => new
                {
                    IdShipment = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCity = table.Column<int>(type: "int", nullable: true),
                    IdClient = table.Column<int>(type: "int", nullable: false),
                    IdCompany = table.Column<int>(type: "int", nullable: false),
                    IdShipmentStatus = table.Column<int>(type: "int", nullable: false),
                    IdUser = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    Mixed = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    ShipmentDate = table.Column<DateTime>(type: "date", nullable: false),
                    ShipmentNo = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shipments", x => x.IdShipment);
                    table.ForeignKey(
                        name: "FK_Shipments_AspNetUsers_IdUser",
                        column: x => x.IdUser,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                    table.ForeignKey(
                        name: "FK_Shipments_Companies_IdCompany",
                        column: x => x.IdCompany,
                        principalTable: "Companies",
                        principalColumn: "IdCompany",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Shipments_ShipmentStatuses_IdShipmentStatus",
                        column: x => x.IdShipmentStatus,
                        principalTable: "ShipmentStatuses",
                        principalColumn: "IdShipmentStatus",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Manifests",
                columns: table => new
                {
                    IdManifest = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdCompany = table.Column<int>(type: "int", nullable: false),
                    IdDriver = table.Column<int>(type: "int", nullable: false),
                    IdManifestStatus = table.Column<int>(type: "int", nullable: false),
                    IdSeason = table.Column<int>(type: "int", nullable: false),
                    IdShipment = table.Column<int>(type: "int", nullable: false),
                    IdShippingCompany = table.Column<int>(type: "int", nullable: false),
                    IdTrailerBoxType = table.Column<int>(type: "int", nullable: true),
                    Chismografo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreationDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    Empaque = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExitDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GnnNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    ManifestNo = table.Column<int>(type: "int", nullable: true),
                    RegFdaNo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Stamps = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TemperatureTrailerBoxC = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TemperatureTrailerBoxF = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TrackingCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrailerBoxPlate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TrailerBoxPlateEconomicNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TrailerPlate = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    TrailerPlateEconomicNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Manifests", x => x.IdManifest);
                    table.ForeignKey(
                        name: "FK_Manifests_Companies_IdCompany",
                        column: x => x.IdCompany,
                        principalTable: "Companies",
                        principalColumn: "IdCompany",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Manifests_Drivers_IdDriver",
                        column: x => x.IdDriver,
                        principalTable: "Drivers",
                        principalColumn: "IdDriver",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Manifests_ManifestStatuses_IdManifestStatus",
                        column: x => x.IdManifestStatus,
                        principalTable: "ManifestStatuses",
                        principalColumn: "IdManifestStatus",
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
                    table.ForeignKey(
                        name: "FK_Manifests_TrailerBoxType_IdTrailerBoxType",
                        column: x => x.IdTrailerBoxType,
                        principalTable: "TrailerBoxType",
                        principalColumn: "IdTrailerBoxType",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ManifestPallets",
                columns: table => new
                {
                    IdManifestPallet = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdLabel = table.Column<int>(type: "int", nullable: false),
                    IdManifest = table.Column<int>(type: "int", nullable: false),
                    Chismografo = table.Column<bool>(type: "bit", nullable: true),
                    Comments = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false),
                    MaxBoxQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Position = table.Column<int>(type: "int", nullable: false),
                    TemperatureC = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    TemperatureF = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
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
                });

            migrationBuilder.CreateTable(
                name: "ManifestPalletLoadings",
                columns: table => new
                {
                    IdManifestPalletLoading = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdLabelType = table.Column<int>(type: "int", nullable: false),
                    IdManifestPallet = table.Column<int>(type: "int", nullable: false),
                    BoxQuantity = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
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
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEKXJzIj8Ta6hNwLZuCoVXjCvLd8bU3Kh/EF7PLTD8SMLd0LDPPgM+3rQFfrwSJb4wQ==");

            migrationBuilder.InsertData(
                table: "ManifestStatuses",
                columns: new[] { "IdManifestStatus", "Description", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Activa", true, false },
                    { 2, "Concluída", true, false }
                });

            migrationBuilder.InsertData(
                table: "ShipmentStatuses",
                columns: new[] { "IdShipmentStatus", "Description", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Activa", true, false },
                    { 2, "Concluída", true, false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Labels_IdCompany",
                table: "Labels",
                column: "IdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_LabelTypes_IdLabel",
                table: "LabelTypes",
                column: "IdLabel");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdLabelType",
                table: "ManifestPalletLoadings",
                column: "IdLabelType");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPalletLoadings_IdManifestPallet",
                table: "ManifestPalletLoadings",
                column: "IdManifestPallet");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_IdLabel",
                table: "ManifestPallets",
                column: "IdLabel");

            migrationBuilder.CreateIndex(
                name: "IX_ManifestPallets_IdManifest",
                table: "ManifestPallets",
                column: "IdManifest");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdCompany",
                table: "Manifests",
                column: "IdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdDriver",
                table: "Manifests",
                column: "IdDriver");

            migrationBuilder.CreateIndex(
                name: "IX_Manifests_IdManifestStatus",
                table: "Manifests",
                column: "IdManifestStatus");

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
                name: "IX_Manifests_IdTrailerBoxType",
                table: "Manifests",
                column: "IdTrailerBoxType");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdCity",
                table: "Shipments",
                column: "IdCity");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdClient",
                table: "Shipments",
                column: "IdClient");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdCompany",
                table: "Shipments",
                column: "IdCompany");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdShipmentStatus",
                table: "Shipments",
                column: "IdShipmentStatus");

            migrationBuilder.CreateIndex(
                name: "IX_Shipments_IdUser",
                table: "Shipments",
                column: "IdUser");
        }
    }
}
