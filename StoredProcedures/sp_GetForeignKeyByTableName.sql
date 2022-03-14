USE [QLDSV_TC]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetForeignKey]    Script Date: 3/14/2022 2:59:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE OR ALTER   PROCEDURE [dbo].[sp_GetForeignKeyByTableName]
	-- khai bao cac bien tam 
	@TABLE_NAME nvarchar(50)
AS
BEGIN
	SELECT  obj.name AS FK_NAME,
		tab1.name AS [table],
		col1.name AS [column],
		tab1.object_id AS [object_id],
		tab2.name AS [referenced_table],
		col2.name AS [referenced_column],
		tab2.object_id AS [referenced_object_id]
	FROM sys.foreign_key_columns fkc
	INNER JOIN sys.objects obj
		ON obj.object_id = fkc.constraint_object_id
	INNER JOIN sys.tables tab1
		ON tab1.object_id = fkc.parent_object_id
	INNER JOIN sys.schemas sch
		ON tab1.schema_id = sch.schema_id
	INNER JOIN sys.columns col1
		ON col1.column_id = parent_column_id AND col1.object_id = tab1.object_id
	INNER JOIN sys.tables tab2
		ON tab2.object_id = fkc.referenced_object_id
	INNER JOIN sys.columns col2
		ON col2.column_id = referenced_column_id AND col2.object_id = tab2.object_id
	WHERE tab1.name = @TABLE_NAME

END
