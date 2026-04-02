using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class DentalCatalogs : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "Child",
                table: "Clients",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "OralHygienes",
                columns: table => new
                {
                    IdOralHygiene = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OralHygienes", x => x.IdOralHygiene);
                });

            migrationBuilder.CreateTable(
                name: "Treatments",
                columns: table => new
                {
                    IdTreatment = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Treatments", x => x.IdTreatment);
                });

            migrationBuilder.CreateTable(
                name: "ConsultationTreatments",
                columns: table => new
                {
                    IdConsultationTreatment = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdConsultation = table.Column<int>(type: "int", nullable: false),
                    IdTreatment = table.Column<int>(type: "int", nullable: false),
                    ToothNumber = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConsultationTreatments", x => x.IdConsultationTreatment);
                    table.ForeignKey(
                        name: "FK_ConsultationTreatments_Consultations_IdConsultation",
                        column: x => x.IdConsultation,
                        principalTable: "Consultations",
                        principalColumn: "IdConsultation",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ConsultationTreatments_Treatments_IdTreatment",
                        column: x => x.IdTreatment,
                        principalTable: "Treatments",
                        principalColumn: "IdTreatment",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEDfMlUN4Bc3dDPTtMBlvDzBPmQBpsgmMxthSwTGS0dQF5tqTNQRRxL3DzJXbc7CI4Q==");

            migrationBuilder.InsertData(
                table: "OralHygienes",
                columns: new[] { "IdOralHygiene", "Description", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "Excelente", true, false },
                    { 2, "Buena", true, false },
                    { 3, "Regular", true, false },
                    { 4, "Mala", true, false }
                });

            migrationBuilder.InsertData(
                table: "Treatments",
                columns: new[] { "IdTreatment", "Code", "Description", "IsActive", "IsDeleted" },
                values: new object[,]
                {
                    { 1, "C", "Corona", true, false },
                    { 2, "Et", "Extracción", true, false },
                    { 3, "R", "Restauración", true, false },
                    { 4, "Ei", "Endodoncia inferior", true, false },
                    { 5, "Au", "Amalgama", true, false },
                    { 6, "S", "Sellante", true, false },
                    { 7, "Fa", "Funda acrílica", true, false },
                    { 8, "Hip", "Hipersensibilidad", true, false },
                    { 9, "Dt", "Diente temporal", true, false },
                    { 10, "Dr", "Diente roto", true, false },
                    { 11, "X", "Extracción indicada", true, false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationTreatments_IdConsultation",
                table: "ConsultationTreatments",
                column: "IdConsultation");

            migrationBuilder.CreateIndex(
                name: "IX_ConsultationTreatments_IdTreatment",
                table: "ConsultationTreatments",
                column: "IdTreatment");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConsultationTreatments");

            migrationBuilder.DropTable(
                name: "OralHygienes");

            migrationBuilder.DropTable(
                name: "Treatments");

            migrationBuilder.DropColumn(
                name: "Child",
                table: "Clients");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBW/5OlbtNF8Y15BYnEUkzO7qW5TPaMC6wXDcbFNI2Mo+GA24vMMj2TB8PEUBZByOQ==");
        }
    }
}
