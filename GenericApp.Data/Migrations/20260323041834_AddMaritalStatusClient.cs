using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddMaritalStatusClient : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaritalState",
                table: "Clients");

            migrationBuilder.AddColumn<int>(
                name: "IdMaritalStatus",
                table: "Clients",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBW/5OlbtNF8Y15BYnEUkzO7qW5TPaMC6wXDcbFNI2Mo+GA24vMMj2TB8PEUBZByOQ==");

            migrationBuilder.CreateIndex(
                name: "IX_Clients_IdMaritalStatus",
                table: "Clients",
                column: "IdMaritalStatus");

            migrationBuilder.AddForeignKey(
                name: "FK_Clients_MaritalStatus_IdMaritalStatus",
                table: "Clients",
                column: "IdMaritalStatus",
                principalTable: "MaritalStatus",
                principalColumn: "IdMaritalStatus",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Clients_MaritalStatus_IdMaritalStatus",
                table: "Clients");

            migrationBuilder.DropIndex(
                name: "IX_Clients_IdMaritalStatus",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "IdMaritalStatus",
                table: "Clients");

            migrationBuilder.AddColumn<string>(
                name: "MaritalState",
                table: "Clients",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEPtC/RhzMwUXwoCD9udn7VZmC8SQdNyIYc8CjKFR9Vpqh/drazHqywBP/qsCF4JQgA==");
        }
    }
}
