using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GenericApp.Data.Migrations
{
    public partial class AddOralHygieneToConsultation : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "IdOralHygiene",
                table: "Consultations",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEIebBmmMri7HMCCG51qqLBeBUHSXvABEziWC5rLptkymkcm7IiUFUzSqKuPbh8tLaw==");

            migrationBuilder.CreateIndex(
                name: "IX_Consultations_IdOralHygiene",
                table: "Consultations",
                column: "IdOralHygiene");

            migrationBuilder.AddForeignKey(
                name: "FK_Consultations_OralHygienes_IdOralHygiene",
                table: "Consultations",
                column: "IdOralHygiene",
                principalTable: "OralHygienes",
                principalColumn: "IdOralHygiene",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Consultations_OralHygienes_IdOralHygiene",
                table: "Consultations");

            migrationBuilder.DropIndex(
                name: "IX_Consultations_IdOralHygiene",
                table: "Consultations");

            migrationBuilder.DropColumn(
                name: "IdOralHygiene",
                table: "Consultations");

            migrationBuilder.UpdateData(
                table: "AspNetUsers",
                keyColumn: "Id",
                keyValue: "a18be9c0-aa65-4af8-bd17-00bd9344e577",
                column: "PasswordHash",
                value: "AQAAAAEAACcQAAAAEDfMlUN4Bc3dDPTtMBlvDzBPmQBpsgmMxthSwTGS0dQF5tqTNQRRxL3DzJXbc7CI4Q==");
        }
    }
}
