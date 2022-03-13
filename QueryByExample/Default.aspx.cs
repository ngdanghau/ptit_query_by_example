using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Linq;
using System.Web;
using System.Web.Script.Services;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class _Default : System.Web.UI.Page {

        public List<string> listCol = new List<string>(){
                            "Table",
                            "Field",
                            "Rename",
                            "Sort",
                            "Show",
                            "Criteria",
                            "Or",
        };

        [System.Web.Services.WebMethod]
        [ScriptMethod(UseHttpGet = false)]
        public static string getColumns(int object_id)
        {
                DataTable dt = getInfoColumn(object_id);
                string JSONresult = JsonConvert.SerializeObject(dt);
                return JSONresult;
        }
    
        [System.Web.Services.WebMethod]
        [ScriptMethod(UseHttpGet = false)]
        public static string getForeignKey(int object_id)
        {
                string lenh = string.Format("EXEC sp_GetForeignKey @OBJECT_ID = {0}", object_id);
                DataTable dt =  DB.ExecSqlDataTable(lenh);
                string JSONresult = JsonConvert.SerializeObject(dt);
                return JSONresult;
        }

        private static DataTable getInfoColumn(int object_id)
        {
            string lenh = string.Format("EXEC sp_GetColumn @OBJECT_ID = {0}", object_id);
            return DB.ExecSqlDataTable(lenh);
        }

        protected void Page_Load(object sender, EventArgs e) {

        }

    private static void CheckConditionSQL(string field, string condition, string object_id, string text)
    {
        var NumericDataTypes = new List<string>() { "tinyint", "smallint", "int", "bigint", "decimal", "numeric", "smallmoney", "money", "float", "real" };
        if (field == "*")
        {
            throw new Exception("ERROR|Không thể áp dụng điều kiện " + text + " cho trường *");
        }

        var condition_final = "";
        if (!Utils.StartsWithAny(condition, new List<string> { "=", ">", ">=", "<", "<=" }, out condition_final))
        {
            throw new Exception("ERROR|Điều kiện " + text + " không đúng cú pháp");
        }

        if (string.IsNullOrEmpty(condition_final))
        {
            throw new Exception("ERROR|Điều kiện " + text + " không đúng cú pháp");
        }

        DataTable dt = getInfoColumn(Convert.ToInt32(object_id));
        foreach (DataRow row in dt.Rows)
        {

            if (row["name"].ToString() == field)
            {

                var data_type = row["DATA_TYPE"].ToString();
                // nẾU là kiểu số
                if (NumericDataTypes.Contains(data_type))
                {
                    // kiểm tra có tồn tại dấu nháy của chuỗi ko
                    if (condition_final.Contains("'"))
                    {
                        throw new Exception("ERROR|Điều kiện " + text + " của cột " + field + " không được là chuỗi!");
                    }

                    if (!Utils.IsNumeric(condition_final))
                    {
                        throw new Exception("ERROR|Điều kiện " + text + " của cột " + field + " phải là số!");
                    }
                }
                // nếu là bit kiểm tra có phải là 0, 1, True, False ko
                else if (data_type == "bit")
                {
                    if (condition_final != "'True'" && condition_final != "'False'" && condition_final != "0" && condition_final != "1")
                    {
                        throw new Exception("ERROR|Điều kiện " + text + " của cột " + field + " phải là 0 , 1, 'True', 'False'!");
                    }
                }

                // nếu là kiểu string, kiểm tra có dấu ' ở đầu và cuối ko
                else if (!condition_final.StartsWith("'") || !condition_final.EndsWith("'"))
                {
                    throw new Exception("ERROR|Điều kiện " + text + " không đúng so với kiểu dữ liệu của cột đang chọn!");
                }
            }
        }
    }

    [System.Web.Services.WebMethod]
    [ScriptMethod(UseHttpGet = false)]
    public static string genSQL(List<string> gen_Table, List<string> gen_Field, List<string> gen_Sort, List<string> gen_Criteria, List<string> gen_Or, List<string> object_ids, List<string> gen_Rename, List<string> gen_Show)
    {
        var select = "";
        var from = "";
        var where = "";
        var group = "";
        var sort = "";
        var or_sql = "";

        // khai báo giá trị mặc định
        var SortVarible = new List<string>() { "ASC", "DESC" };
        
        
        // kiểm tra có bảng tồn tại ko
        if (
            gen_Table.Count() == 0 ||
            object_ids.Count() == 0 ||
            gen_Field.Count() == 0 ||
            gen_Table.Count() != object_ids.Count()
        ) return "ERROR|Vui lòng chọn bảng để gen sql";


        for (var i = 0; i < gen_Table.Count(); i++)
        {
            var field = gen_Field[i].Trim();
            var table = gen_Table[i].Trim();

            if (string.IsNullOrEmpty(field) || string.IsNullOrEmpty(table)) continue;
            var table_field = table + "." + field;

            var rename = "";
            if (Utils.inBounds(i, gen_Rename))
            {
                rename = gen_Rename[i].Trim();
                if (!string.IsNullOrEmpty(rename))
                {
                    if (field == "*")
                    {
                        return "ERROR|Đổi tên không áp dụng cho trường *";
                    }

                    if (!rename.StartsWith("'") || !rename.EndsWith("'"))
                    {
                        return "ERROR|Đổi tên không đúng cú pháp";
                    }

                    rename = " AS " + rename;
                }
                
            }

            

            if(gen_Show.Contains(i.ToString()))
            {
                select += table_field + rename + ", ";
            }



            if (!from.Contains(gen_Table[i]))
            {
                from += gen_Table[i] + ", ";
            }
            



            // kiểm tra thứ tự này có Criteria không
            if ( Utils.inBounds(i, gen_Criteria))
            {
                var criteria = gen_Criteria[i].Trim();
                if(!string.IsNullOrEmpty(criteria))
                {
                    try
                    {
                        CheckConditionSQL(field, criteria, object_ids[i], "Criteria");
                    }
                    catch (Exception ex)
                    {
                        return ex.Message;
                    }

                    where += "("+table_field + gen_Criteria[i]+") AND ";
                }
            }

            if (Utils.inBounds(i, gen_Sort) )
            {
                var sort_condition = SortVarible.Contains(gen_Sort[i].Trim().ToUpper()) ? gen_Sort[i].Trim().ToUpper() : "";
                if (!string.IsNullOrEmpty(sort_condition))
                {
                    if (field == "*")
                    {
                        return "ERROR|Không thể sắp xếp cho trường *";
                    }

                    sort += table_field + " " + sort_condition + ", ";
                }
                

            }

        }

        
        for (var i = 0; i < gen_Table.Count(); i++)
        {
            var field = gen_Field[i].Trim();
            var table = gen_Table[i].Trim();

            if (string.IsNullOrEmpty(field) || string.IsNullOrEmpty(table)) continue;
            var table_field = table + "." + field;

            if (Utils.inBounds(i, gen_Or))
            {
                
                var or_condition = gen_Or[i].Trim();
                if (!string.IsNullOrEmpty(or_condition))
                {
                    try
                    {
                        CheckConditionSQL(field, or_condition, object_ids[i], "Or");
                    }
                    catch (Exception ex)
                    {
                        return ex.Message;
                    }
                    or_sql += "(" + table_field + or_condition + ") AND ";
                }
            }
        }

        if (string.IsNullOrEmpty(select))
        {
            return "ERROR|Câu lệnh SELECT phải có ít nhất 1 Field";
        }

        // trim tất cả
        select = select.Trim();
        from = from.Trim();
        where = where.Trim();
        group = group.Trim();
        sort = sort.Trim();
        or_sql = or_sql.Trim();

        // xóa dấu phẩy cuối cùng
        select = select.Substring(0, select.Length - 1);
        from = from.Substring(0, from.Length - 1);
       

        string sql = string.Format("SELECT {0} FROM {1} ", select, from);

        // xóa ký tự AND cuối cùng cùa câu lệnh and
        if (!string.IsNullOrEmpty(where))
        { 
            if (where.EndsWith("AND"))
            {
                where = where.Substring(0, where.Length - 3);
            }
            where = "(" + where + ")";
        }

        // xóa ký tự AND cuối cùng của câu lệnh or
        if (!string.IsNullOrEmpty(or_sql))
        {
            if (or_sql.EndsWith("AND"))
            {
                or_sql = or_sql.Substring(0, or_sql.Length - 3);
            }
            or_sql = "(" + or_sql + ")";
        }

        // nối chuỗi
        if (!string.IsNullOrEmpty(where) && !string.IsNullOrEmpty(or_sql))
        {
            sql += string.Format("WHERE {0} OR {1}", where, or_sql);
        }
        else if(!string.IsNullOrEmpty(where) && string.IsNullOrEmpty(or_sql))
        {
            sql += string.Format("WHERE {0}", where);
        }
        else if (string.IsNullOrEmpty(where) && !string.IsNullOrEmpty(or_sql))
        {
            sql += string.Format("WHERE {0}", or_sql);
        }




        if (!string.IsNullOrEmpty(group))
        {
            sql += string.Format("GROUP BY {0} ", group);
        }

        if (!string.IsNullOrEmpty(sort))
        {
            sort = sort.Substring(0, sort.Length - 1);
            sql += string.Format("ORDER BY {0}", sort);
        }


        Debug.WriteLine(sql);

        HttpContext.Current.Session["querySQL"] = sql;
        return sql;
    }

    [System.Web.Services.WebMethod]
    [ScriptMethod(UseHttpGet = false)]
    public static string genReport(string query, string title)
    {
        if (string.IsNullOrEmpty(title))
        {
            return "ERROR|Thiếu tiêu đề báo cáo";
        }

        if (string.IsNullOrEmpty(query))
        {
            return "ERROR|Thiếu câu lệnh query";
        }

        try
        {
            DataTable dt = DB.ExecSqlDataTable(query);
            HttpContext.Current.Session["querySQL"] = query;
            HttpContext.Current.Session["title"] = title;
        }
        catch(Exception ex)
        {
            return "ERROR|" + ex.Message;
        }
        return "success";
    }
}