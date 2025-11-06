using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class EditLabelType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LabelTypes_Labels_LabelIdLabel",
                table: "LabelTypes");

            migrationBuilder.DropIndex(
                name: "IX_LabelTypes_LabelIdLabel",
                table: "LabelTypes");

            migrationBuilder.DropColumn(
                name: "LabelIdLabel",
                table: "LabelTypes");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEFMRaLzRJBIw0M1MnCpGv2Dz/rCnCXBjeyrhw6kasx854KYlbeUtzG5GP6oHnTlC3A==");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LabelIdLabel",
                table: "LabelTypes",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEObSYHid3QzExnLX5Yp6RYX7iK3ihcBzv0D4G89+wF8Ubv7cJl/7vK1fDA6TB+1EXw==");

            migrationBuilder.CreateIndex(
                name: "IX_LabelTypes_LabelIdLabel",
                table: "LabelTypes",
                column: "LabelIdLabel");

            migrationBuilder.AddForeignKey(
                name: "FK_LabelTypes_Labels_LabelIdLabel",
                table: "LabelTypes",
                column: "LabelIdLabel",
                principalTable: "Labels",
                principalColumn: "IdLabel");
        }
    }
}
