using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for DB
/// </summary>
public class DB
{
    public static SqlDataReader ExecSqlDataReader(string strLenh)
    {
        string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection Conn = new SqlConnection(connectionString);
        Conn.Open();

        SqlDataReader myReader;
        SqlCommand sqlcmd = new SqlCommand(strLenh, Conn);

        //xác định kiểu lệnh cho sqlcmd là kiểu text.
        sqlcmd.CommandType = CommandType.Text;
        sqlcmd.CommandTimeout = 600;
        if (Conn.State == ConnectionState.Closed) Conn.Open();
        try
        {
            myReader = sqlcmd.ExecuteReader();
            return myReader;
        }
        catch (SqlException ex)
        {
            Conn.Close();
            return null;
        }
    }

    public static DataTable ExecSqlDataTable(string cmd)
    {
        string connectionString = ConfigurationManager.ConnectionStrings["DefaultConnection"].ConnectionString;
        SqlConnection Conn = new SqlConnection(connectionString);
        Conn.Open();

        DataTable dt = new DataTable();
        if (Conn.State == ConnectionState.Closed) Conn.Open();
        SqlDataAdapter da = new SqlDataAdapter(cmd, Conn);
        da.Fill(dt);
        Conn.Close();
        return dt;
    }
}