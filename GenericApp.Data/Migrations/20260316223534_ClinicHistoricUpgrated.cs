using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class ClinicHistoricUpgrated : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdConsultation",
                table: "Surgeries",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LifestyleLastUpdated",
                table: "MedicalRecords",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LifestyleLastUpdatedConsultationId",
                table: "MedicalRecords",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdConsultation",
                table: "Diseases",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastUpdatedAt",
                table: "Diseases",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "IdConsultation",
                table: "Allergies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "BloodPressureRecords",
                columns: table => new
                {
                    IdBloodPressureRecord = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMedicalRecord = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    RecordedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IdConsultation = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BloodPressureRecords", x => x.IdBloodPressureRecord);
                    table.ForeignKey(
                        name: "FK_BloodPressureRecords_MedicalRecords_IdMedicalRecord",
                        column: x => x.IdMedicalRecord,
                        principalTable: "MedicalRecords",
                        principalColumn: "IdMedicalRecord",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MedicalNotes",
                columns: table => new
                {
                    IdMedicalNote = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMedicalRecord = table.Column<int>(type: "int", nullable: false),
                    NoteType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Content = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    IdConsultation = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalNotes", x => x.IdMedicalNote);
                    table.ForeignKey(
                        name: "FK_MedicalNotes_MedicalRecords_IdMedicalRecord",
                        column: x => x.IdMedicalRecord,
                        principalTable: "MedicalRecords",
                        principalColumn: "IdMedicalRecord",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEAa0Bm4Ha6OvvlrDMKUWWO7M3gxSw3LNgqJx/O6yBHCgDMyft3ln6SK8b/RbIcV1lg==");

            migrationBuilder.CreateIndex(
                name: "IX_BloodPressureRecords_IdMedicalRecord",
                table: "BloodPressureRecords",
                column: "IdMedicalRecord");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalNotes_IdMedicalRecord",
                table: "MedicalNotes",
                column: "IdMedicalRecord");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BloodPressureRecords");

            migrationBuilder.DropTable(
                name: "MedicalNotes");

            migrationBuilder.DropColumn(
                name: "IdConsultation",
                table: "Surgeries");

            migrationBuilder.DropColumn(
                name: "LifestyleLastUpdated",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "LifestyleLastUpdatedConsultationId",
                table: "MedicalRecords");

            migrationBuilder.DropColumn(
                name: "IdConsultation",
                table: "Diseases");

            migrationBuilder.DropColumn(
                name: "LastUpdatedAt",
                table: "Diseases");

            migrationBuilder.DropColumn(
                name: "IdConsultation",
                table: "Allergies");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEGCjvUZC3h5OelnUEqMrAq6/MWevy9qvtT7kTa1dDVi1iyY+PbNr4cmKWJngPxMjeA==");
        }
    }
}
