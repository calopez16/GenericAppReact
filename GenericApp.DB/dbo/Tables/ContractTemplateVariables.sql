CREATE TABLE [dbo].[ContractTemplateVariables] (
    [IdContractTemplateVariable] INT            IDENTITY (1, 1) NOT NULL,
    [Code]                       NVARCHAR (150) NOT NULL,
    [Description]                NVARCHAR (180) NULL,
    [Type]                       NVARCHAR (MAX) NULL,
    [IsActive]                   BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]                  BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    CONSTRAINT [PK_ContractTemplateVariables] PRIMARY KEY CLUSTERED ([IdContractTemplateVariable] ASC)
);

