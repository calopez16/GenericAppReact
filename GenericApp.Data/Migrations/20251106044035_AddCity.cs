using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddCity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LabelIdLabel",
                table: "LabelTypes",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Cities",
                columns: table => new
                {
                    IdCity = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Description = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: true, defaultValue: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cities", x => x.IdCity);
                });

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEC+wlQhqpgA89ym0lix264jugBQEFBgsZ7/pKAM8c+FJmKT5V6KHulveQCPHWy0Ygw==");

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

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LabelTypes_Labels_LabelIdLabel",
                table: "LabelTypes");

            migrationBuilder.DropTable(
                name: "Cities");

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
                value: "AQAAAAEAACcQAAAAENBJz16M8Mj66okZMIVkYzsw+NT32Z3+ojoCfkEbTW3E5W7TB+jgN/3Rt4JABAuxfQ==");
        }
    }
}
