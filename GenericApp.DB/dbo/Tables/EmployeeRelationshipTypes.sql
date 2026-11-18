CREATE TABLE [dbo].[EmployeeRelationshipTypes] (
    [IdEmployeeRelationshipType] INT            IDENTITY (1, 1) NOT NULL,
    [Description]                NVARCHAR (150) NULL,
    [IsActive]                   BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]                  BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    CONSTRAINT [PK_EmployeeRelationshipTypes] PRIMARY KEY CLUSTERED ([IdEmployeeRelationshipType] ASC)
);

