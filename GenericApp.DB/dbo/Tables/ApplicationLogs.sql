CREATE TABLE [dbo].[ApplicationLogs] (
    [IdApplicationLog] INT            IDENTITY (1, 1) NOT NULL,
    [Date]             DATETIME2 (7)  DEFAULT (getdate()) NOT NULL,
    [IdAspNetUsers]    NVARCHAR (450) NOT NULL,
    [UserName]         NVARCHAR (256) NOT NULL,
    [Module]           NVARCHAR (150) NOT NULL,
    [IdDataAffected]   INT            NOT NULL,
    [Description]      NVARCHAR (250) NULL,
    [Details]          NVARCHAR (500) NULL,
    [Details2]         NVARCHAR (500) NULL,
    CONSTRAINT [PK_ApplicationLogs] PRIMARY KEY CLUSTERED ([IdApplicationLog] ASC)
);

