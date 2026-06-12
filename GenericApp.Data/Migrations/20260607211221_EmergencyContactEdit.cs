using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class EmergencyContactEdit : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Relationship",
                table: "EmployeeEmergencyContacts");

            migrationBuilder.AddColumn<int>(
                name: "IdEmployeeRelationshipType",
                table: "EmployeeEmergencyContacts",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEAPwN4HHRLLqBR7XoBC/p8Hv6aZTYM9K1xx5cXKsT2ZMdVHKcelyq53jOsxcdNU4Rg==");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeEmergencyContacts_IdEmployeeRelationshipType",
                table: "EmployeeEmergencyContacts",
                column: "IdEmployeeRelationshipType");

            migrationBuilder.AddForeignKey(
                name: "FK_EmployeeEmergencyContacts_EmployeeRelationshipTypes_IdEmployeeRelationshipType",
                table: "EmployeeEmergencyContacts",
                column: "IdEmployeeRelationshipType",
                principalTable: "EmployeeRelationshipTypes",
                principalColumn: "IdEmployeeRelationshipType",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmployeeEmergencyContacts_EmployeeRelationshipTypes_IdEmployeeRelationshipType",
                table: "EmployeeEmergencyContacts");

            migrationBuilder.DropIndex(
                name: "IX_EmployeeEmergencyContacts_IdEmployeeRelationshipType",
                table: "EmployeeEmergencyContacts");

            migrationBuilder.DropColumn(
                name: "IdEmployeeRelationshipType",
                table: "EmployeeEmergencyContacts");

            migrationBuilder.AddColumn<string>(
                name: "Relationship",
                table: "EmployeeEmergencyContacts",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEOxXVgOb2WFyE42H9eKRjx5J4eNnbbtV/KRDHvNd3KropbSUHh8JALnGnP2c+Bu3CQ==");
        }
    }
}
