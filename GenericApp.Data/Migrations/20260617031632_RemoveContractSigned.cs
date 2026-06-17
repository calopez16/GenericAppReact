using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class RemoveContractSigned : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContractsSigned");

            migrationBuilder.AlterColumn<DateTime>(
                name: "SignatureDate",
                table: "Contracts",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreateDate",
                table: "Contracts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEK4ZcQiadOaRPi0vgXYRE/tweVrUY8IxPfU4/eypzHHRuujlHM/mXvj3URkxCUXeTQ==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreateDate",
                table: "Contracts");

            migrationBuilder.AlterColumn<DateTime>(
                name: "SignatureDate",
                table: "Contracts",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.CreateTable(
                name: "ContractsSigned",
                columns: table => new
                {
                    IdContractSigned = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdContract = table.Column<int>(type: "int", nullable: false),
                    IdContractTemplate = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractsSigned", x => x.IdContractSigned);
                    table.ForeignKey(
                        name: "FK_ContractsSigned_Contracts_IdContract",
                        column: x => x.IdContract,
                        principalTable: "Contracts",
                        principalColumn: "IdContract",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ContractsSigned_ContractTemplates_IdContractTemplate",
                        column: x => x.IdContractTemplate,
                        principalTable: "ContractTemplates",
                        principalColumn: "IdTemplate",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEAPwN4HHRLLqBR7XoBC/p8Hv6aZTYM9K1xx5cXKsT2ZMdVHKcelyq53jOsxcdNU4Rg==");

            migrationBuilder.CreateIndex(
                name: "IX_ContractsSigned_IdContract",
                table: "ContractsSigned",
                column: "IdContract");

            migrationBuilder.CreateIndex(
                name: "IX_ContractsSigned_IdContractTemplate",
                table: "ContractsSigned",
                column: "IdContractTemplate");
        }
    }
}
