USE [QLDSV_TC]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetColumn]    Script Date: 3/13/2022 9:34:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
CREATE OR ALTER   PROCEDURE [dbo].[sp_GetColumn]
	-- khai bao cac bien tam 
	@OBJECT_ID int
AS
BEGIN
	DECLARE @primary_key nvarchar(10);
	SELECT @primary_key = c.name
		FROM QLDSV_TC.sys.indexes i
			inner join QLDSV_TC.sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
			inner join QLDSV_TC.sys.columns c ON ic.object_id = c.object_id AND c.column_id = ic.column_id
		WHERE i.is_primary_key = 1
		AND i.object_ID = @OBJECT_ID


	SELECT a.name, b.DATA_TYPE, b.CHARACTER_MAXIMUM_LENGTH, IIF(@primary_key = a.name, 1, 0 ) as is_primary_key
	FROM 
		QLDSV_TC.sys.columns a
	JOIN QLDSV_TC.INFORMATION_SCHEMA.COLUMNS b
	ON a.name = b.COLUMN_NAME
	WHERE a.object_id = @OBJECT_ID AND a.is_rowguidcol = 0 
	GROUP BY a.name, b.DATA_TYPE, b.CHARACTER_MAXIMUM_LENGTH

END
