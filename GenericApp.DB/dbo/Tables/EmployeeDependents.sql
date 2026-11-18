CREATE TABLE [dbo].[EmployeeDependents] (
    [IdEmployeeDependents]       INT            IDENTITY (1, 1) NOT NULL,
    [IdEmployee]                 INT            NOT NULL,
    [Name]                       NVARCHAR (150) NULL,
    [BirthDate]                  DATETIME2 (7)  NULL,
    [IdEmployeeRelationshipType] INT            NULL,
    [IsAlive]                    BIT            NOT NULL,
    [IsActive]                   BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]                  BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [Order]                      INT            DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_EmployeeDependents] PRIMARY KEY CLUSTERED ([IdEmployeeDependents] ASC),
    CONSTRAINT [FK_EmployeeDependents_EmployeeRelationshipTypes_IdEmployeeRelationshipType] FOREIGN KEY ([IdEmployeeRelationshipType]) REFERENCES [dbo].[EmployeeRelationshipTypes] ([IdEmployeeRelationshipType]),
    CONSTRAINT [FK_EmployeeDependents_Employees_IdEmployee] FOREIGN KEY ([IdEmployee]) REFERENCES [dbo].[Employees] ([IdEmployee])
);

