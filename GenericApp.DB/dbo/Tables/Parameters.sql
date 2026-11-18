CREATE TABLE [dbo].[Parameters] (
    [IdParameter]   INT            IDENTITY (1, 1) NOT NULL,
    [ParameterCode] NVARCHAR (5)   NOT NULL,
    [Description]   NVARCHAR (150) NOT NULL,
    [Value]         NVARCHAR (250) NOT NULL,
    CONSTRAINT [PK_Parameters] PRIMARY KEY CLUSTERED ([IdParameter] ASC)
);

