using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class NewFieldsClients : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Code",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Rfc",
                table: "Clients");

            migrationBuilder.AddColumn<DateTime>(
                name: "BirthDate",
                table: "Clients",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Education",
                table: "Clients",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MaritalState",
                table: "Clients",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Ocupation",
                table: "Clients",
                type: "nvarchar(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Profession",
                table: "Clients",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Religion",
                table: "Clients",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEMxBBwaHKGyuJS4Jjpl5rSkgOTBsAPO5BCIyIxn3Iqkznq2CC67GZnLbBB92XhBgNg==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Education",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "MaritalState",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Ocupation",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Profession",
                table: "Clients");

            migrationBuilder.DropColumn(
                name: "Religion",
                table: "Clients");

            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "Clients",
                type: "nvarchar(25)",
                maxLength: 25,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "Clients",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Rfc",
                table: "Clients",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEDf07YMLcz/ZoS4PAG3UNjnCosO0gBXMrrfenVJzm01T7CWzrsNPZlM2d+BRMcaepA==");
        }
    }
}
