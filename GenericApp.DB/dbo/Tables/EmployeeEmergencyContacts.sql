CREATE TABLE [dbo].[EmployeeEmergencyContacts] (
    [IdEmployeeEmergencyContact] INT            IDENTITY (1, 1) NOT NULL,
    [IdEmployee]                 INT            NOT NULL,
    [Name]                       NVARCHAR (150) NULL,
    [Phone]                      NVARCHAR (25)  NULL,
    [BirthDate]                  DATETIME2 (7)  NULL,
    [IsActive]                   BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]                  BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [IdEmployeeRelationshipType] INT            NULL,
    CONSTRAINT [PK_EmployeeEmergencyContacts] PRIMARY KEY CLUSTERED ([IdEmployeeEmergencyContact] ASC),
    CONSTRAINT [FK_EmployeeEmergencyContacts_EmployeeRelationshipTypes_IdEmployeeRelationshipType] FOREIGN KEY ([IdEmployeeRelationshipType]) REFERENCES [dbo].[EmployeeRelationshipTypes] ([IdEmployeeRelationshipType]),
    CONSTRAINT [FK_EmployeeEmergencyContacts_Employees_IdEmployee] FOREIGN KEY ([IdEmployee]) REFERENCES [dbo].[Employees] ([IdEmployee])
);

