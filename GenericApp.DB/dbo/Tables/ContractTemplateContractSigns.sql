CREATE TABLE [dbo].[ContractTemplateContractSigns] (
    [IdContractTemplateContractSign] INT IDENTITY (1, 1) NOT NULL,
    [IdContractSign]                 INT NOT NULL,
    [IdContractTemplate]             INT NOT NULL,
    [IsActive]                       BIT DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]                      BIT DEFAULT (CONVERT([bit],(0))) NULL,
    CONSTRAINT [PK_ContractTemplateContractSigns] PRIMARY KEY CLUSTERED ([IdContractTemplateContractSign] ASC),
    CONSTRAINT [FK_ContractTemplateContractSigns_ContractSigns_IdContractSign] FOREIGN KEY ([IdContractSign]) REFERENCES [dbo].[ContractSigns] ([IdContractSign]),
    CONSTRAINT [FK_ContractTemplateContractSigns_ContractTemplates_IdContractTemplate] FOREIGN KEY ([IdContractTemplate]) REFERENCES [dbo].[ContractTemplates] ([IdTemplate])
);


GO
CREATE NONCLUSTERED INDEX [IX_ContractTemplateContractSigns_IdContractSign]
    ON [dbo].[ContractTemplateContractSigns]([IdContractSign] ASC);


GO
CREATE NONCLUSTERED INDEX [IX_ContractTemplateContractSigns_IdContractTemplate]
    ON [dbo].[ContractTemplateContractSigns]([IdContractTemplate] ASC);

