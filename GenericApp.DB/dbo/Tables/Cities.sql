CREATE TABLE [dbo].[Cities] (
    [IdCity]      INT            IDENTITY (1, 1) NOT NULL,
    [Description] NVARCHAR (150) NOT NULL,
    [IsActive]    BIT            DEFAULT (CONVERT([bit],(1))) NULL,
    [IsDeleted]   BIT            DEFAULT (CONVERT([bit],(0))) NULL,
    [IdState]     INT            DEFAULT ((0)) NOT NULL,
    CONSTRAINT [PK_Cities] PRIMARY KEY CLUSTERED ([IdCity] ASC),
    CONSTRAINT [FK_Cities_States_IdState] FOREIGN KEY ([IdState]) REFERENCES [dbo].[States] ([IdState])
);


GO
CREATE NONCLUSTERED INDEX [IX_Cities_IdState]
    ON [dbo].[Cities]([IdState] ASC);

