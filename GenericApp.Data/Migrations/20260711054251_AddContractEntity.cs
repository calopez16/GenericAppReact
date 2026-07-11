using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddContractEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreateDate",
                table: "Contracts",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEAdLsGIkxwtw3jsQ3xmHo0VYOXTVcXPsZ5oRiSAFLxAFBCOgxmJ92dSFKIN6PRFoug==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreateDate",
                table: "Contracts",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETDATE()");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEBlec0nz23mOLTqZ6IF13YAiOLiysJjR4eVFfRkg85CRcqWamQH9evDeR7Rhg0pnjA==");
        }
    }
}
