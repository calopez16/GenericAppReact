CREATE TABLE [dbo].[ContractTemplates] (
    [IdTemplate]     INT            IDENTITY (1, 1) NOT NULL,
    [Name]           NVARCHAR (150) NOT NULL,
    [Description]    NVARCHAR (500) NULL,
    [Content]        NVARCHAR (MAX) NULL,
    [IsActive]       BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]      BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [IdCompany]      INT            NOT NULL,
    [IsHeaderEnable] BIT            NULL,
    CONSTRAINT [PK_ContractTemplates] PRIMARY KEY CLUSTERED ([IdTemplate] ASC),
    CONSTRAINT [FK_ContractTemplates_Companies_IdCompany] FOREIGN KEY ([IdCompany]) REFERENCES [dbo].[Companies] ([IdCompany])
);


GO
CREATE NONCLUSTERED INDEX [IX_ContractTemplates_IdCompany]
    ON [dbo].[ContractTemplates]([IdCompany] ASC);

