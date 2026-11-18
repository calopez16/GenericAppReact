CREATE TABLE [dbo].[States] (
    [IdState]     INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (150) NOT NULL,
    [IdCountry]   INT            NOT NULL,
    [IsActive]    BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]   BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    CONSTRAINT [PK_States] PRIMARY KEY CLUSTERED ([IdState] ASC),
    CONSTRAINT [FK_States_Countries_IdCountry] FOREIGN KEY ([IdCountry]) REFERENCES [dbo].[Countries] ([IdCountry])
);


GO
CREATE NONCLUSTERED INDEX [IX_States_IdCountry]
    ON [dbo].[States]([IdCountry] ASC);

