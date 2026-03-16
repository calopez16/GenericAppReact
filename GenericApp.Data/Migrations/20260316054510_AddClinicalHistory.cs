using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddClinicalHistory : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Consultations",
                columns: table => new
                {
                    IdConsultation = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdClient = table.Column<int>(type: "int", nullable: false),
                    ConsultationDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CurrentCondition = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    PhysicalExam = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Diagnosis = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Treatment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Consultations", x => x.IdConsultation);
                    table.ForeignKey(
                        name: "FK_Consultations_Clients_IdClient",
                        column: x => x.IdClient,
                        principalTable: "Clients",
                        principalColumn: "IdClient",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicalRecords",
                columns: table => new
                {
                    IdMedicalRecord = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdClient = table.Column<int>(type: "int", nullable: false),
                    BloodType = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: true),
                    SmokingHabit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AlcoholHabit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DrugHabit = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BloodPressure = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IsPregnant = table.Column<bool>(type: "bit", nullable: true),
                    PregnancyMonths = table.Column<int>(type: "int", nullable: true),
                    DiabetesStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DiabetesNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CancerStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CancerNotes = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicalRecords", x => x.IdMedicalRecord);
                    table.ForeignKey(
                        name: "FK_MedicalRecords_Clients_IdClient",
                        column: x => x.IdClient,
                        principalTable: "Clients",
                        principalColumn: "IdClient",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Allergies",
                columns: table => new
                {
                    IdAllergy = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMedicalRecord = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Allergies", x => x.IdAllergy);
                    table.ForeignKey(
                        name: "FK_Allergies_MedicalRecords_IdMedicalRecord",
                        column: x => x.IdMedicalRecord,
                        principalTable: "MedicalRecords",
                        principalColumn: "IdMedicalRecord",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Diseases",
                columns: table => new
                {
                    IdDisease = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMedicalRecord = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Medications = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Diseases", x => x.IdDisease);
                    table.ForeignKey(
                        name: "FK_Diseases_MedicalRecords_IdMedicalRecord",
                        column: x => x.IdMedicalRecord,
                        principalTable: "MedicalRecords",
                        principalColumn: "IdMedicalRecord",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Surgeries",
                columns: table => new
                {
                    IdSurgery = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMedicalRecord = table.Column<int>(type: "int", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    SurgeryDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Surgeries", x => x.IdSurgery);
                    table.ForeignKey(
                        name: "FK_Surgeries_MedicalRecords_IdMedicalRecord",
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
                value: "AQAAAAEAACcQAAAAEDBzd26cpKMw9jaQDtdIpTuR6Yl6WCKOrYdOzHhtiWtHQ2n0rO7tACOaIaSi+vz2IA==");

            migrationBuilder.CreateIndex(
                name: "IX_Allergies_IdMedicalRecord",
                table: "Allergies",
                column: "IdMedicalRecord");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_IdClient",
                table: "Consultations",
                column: "IdClient");

            migrationBuilder.CreateIndex(
                name: "IX_Diseases_IdMedicalRecord",
                table: "Diseases",
                column: "IdMedicalRecord");

            migrationBuilder.CreateIndex(
                name: "IX_MedicalRecords_IdClient",
                table: "MedicalRecords",
                column: "IdClient");

            migrationBuilder.CreateIndex(
                name: "IX_Surgeries_IdMedicalRecord",
                table: "Surgeries",
                column: "IdMedicalRecord");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Allergies");

            migrationBuilder.DropTable(
                name: "Consultations");

            migrationBuilder.DropTable(
                name: "Diseases");

            migrationBuilder.DropTable(
                name: "Surgeries");

            migrationBuilder.DropTable(
                name: "MedicalRecords");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAELjZWBizlA3KPPVxLUficU8mPE7bLsOGtMgF2e2uxj7MVttcYcwJ57rBmDemsf7DCw==");
        }
    }
}
