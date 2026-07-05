using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class addEmployeeRelationContract : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBlec0nz23mOLTqZ6IF13YAiOLiysJjR4eVFfRkg85CRcqWamQH9evDeR7Rhg0pnjA==");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_IdEmployee",
                table: "Contracts",
                column: "IdEmployee");

            migrationBuilder.AddForeignKey(
                name: "FK_Contracts_Employees_IdEmployee",
                table: "Contracts",
                column: "IdEmployee",
                principalTable: "Employees",
                principalColumn: "IdEmployee",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Contracts_Employees_IdEmployee",
                table: "Contracts");

            migrationBuilder.DropIndex(
                name: "IX_Contracts_IdEmployee",
                table: "Contracts");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEHXxi/mgt+6RlptkDmaKr7UOVlrwru3Q68nuwshLIumd80BM7xcsXW7aWiPowgnuXQ==");
        }
    }
}
