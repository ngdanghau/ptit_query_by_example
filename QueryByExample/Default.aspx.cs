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
                            "Total",
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
                DataTable dt = getInfoForeignKey(object_id);
                string JSONresult = JsonConvert.SerializeObject(dt);
                return JSONresult;
        }
    
        [System.Web.Services.WebMethod]
        [ScriptMethod(UseHttpGet = false)]
        public static string getPrimaryKey(int object_id)
        {
                DataTable dt = getInfoPrimaryKey(object_id);
                string JSONresult = JsonConvert.SerializeObject(dt);
                return JSONresult;
        }

        private static DataTable getInfoForeignKey(int object_id)
        {
            string lenh = string.Format("EXEC sp_GetForeignKey @OBJECT_ID = {0}", object_id);
            return DB.ExecSqlDataTable(lenh);
        }
    
        private static DataTable getInfoForeignKey(string table_name)
        {
            string lenh = string.Format("EXEC sp_GetForeignKeyByTableName @TABLE_NAME = N'{0}'", table_name);
            return DB.ExecSqlDataTable(lenh);
        }
    
        private static DataTable getInfoPrimaryKey(int object_id)
        {
            string lenh = string.Format("EXEC sp_GetPrimaryKey @OBJECT_ID = {0}", object_id);
            return DB.ExecSqlDataTable(lenh);
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
    }

    [System.Web.Services.WebMethod]
    [ScriptMethod(UseHttpGet = false)]
    
    public static string genSQL(
        List<string> gen_Table, List<string> gen_Field, 
        List<string> gen_Sort, List<string> gen_Criteria, 
        List<string> gen_Total, List<string> object_ids, 
        List<string> gen_Rename, List<string> gen_Show,
        List<string> TableList, List<List<string>> gen_Or
    )
    {

        /**
         * SELECT $selectSQL 
         * FROM $TableList 
         * WHERE ($joinSQL) 
         *      AND (  
         *              ($criteriaSQL)   OR  
         *              ($orSQL) 
         *         )
         * GROUP BY $groupSQL
         * HAVING (  
         *              ($havingCriteriaSQL)   OR  
         *              ($havingOrSQL) 
         *         )
         * SORT BY $sortSQL ASC|DESC
         */
        var selectSQL = new List<string>();
        var orSQL = new List<string>();
        var criteriaSQL = new List<string>();
        var joinSQL = new List<string>();
        var groupSQL = new List<string>();
        var sortSQL = new List<string>();
        var havingCriteriaSQL = new List<string>();
        var havingOrSQL = new List<string>();

        // khai báo giá trị mặc định
        var SortVarible = new List<string>() { "ASC", "DESC" };

        var TotalVarible = new List<string>() {  "group_by", "where","sum", "count", "min", "max", "avg" };


        // kiểm tra có bảng tồn tại ko
        var TempTable = gen_Table.Where(s => !string.IsNullOrWhiteSpace(s));

        if (
            TempTable.Count() == 0 ||
            gen_Table.Count() == 0 ||
            object_ids.Count() == 0 ||
            gen_Field.Count() == 0 ||
            gen_Table.Count() != object_ids.Count()
        ) return "ERROR|Chọn ít nhất 1 bảng";


        for (var i = 0; i < gen_Table.Count(); i++)
        {

            var field = "";
            if (Utils.inBounds(i, gen_Field))
            {
                field = gen_Field[i].Trim();
            }
             
            var table = gen_Table[i].Trim();

            if (string.IsNullOrEmpty(field) || string.IsNullOrEmpty(table)) continue;
            var table_field = table + "." + field;

            var rename = "";
            if (Utils.inBounds(i, gen_Rename))
            {
                rename = gen_Rename[i].Trim().Replace("'", "");
                if (!string.IsNullOrEmpty(rename))
                {
                    if (field == "*")
                    {
                        return "ERROR|Đổi tên không áp dụng cho trường *";
                    }

                    rename = " AS '" + rename + "'";
                }
                
            }

            var isTotal = false;
            var isShow = false;
            var total = "";
            // kiểm tra groupby
            if (Utils.inBounds(i, gen_Total))
            {
                total = gen_Total[i].Trim();
                if (!string.IsNullOrEmpty(total))
                {
                    if (!TotalVarible.Contains(total))
                    {
                        return "ERROR|Giá trị total không hợp lệ!";
                    }

                    if (field == "*")
                    {
                        return "ERROR|Giá trị Total không hợp lệ cho Field *!";
                    }
                    isTotal = true;
                }
            }

            // Nếu check show thì hiện field ở select
            if (gen_Show.Contains(i.ToString()))
            {
                isShow = true;
                if (isTotal && total != "group_by" && total != "where")
                {
                    selectSQL.Add(total.ToUpper() + "(" + table_field + ")" + rename);
                }
                else
                {
                    selectSQL.Add(table_field + rename);
                }
            }


            // kiểm tra thứ tự này có Criteria không
            if ( Utils.inBounds(i, gen_Criteria))
            {
                var criteria_value = gen_Criteria[i].Trim();
                if(!string.IsNullOrEmpty(criteria_value))
                {
                    try
                    {
                        CheckConditionSQL(field, criteria_value, object_ids[i], "Criteria");
                    }
                    catch (Exception ex)
                    {
                        return ex.Message;
                    }

                    if(isTotal )
                    {
                        if(total == "where")
                        {
                            criteriaSQL.Add(string.Format("({0})", table_field + criteria_value));
                        }
                        else if(total == "group_by")
                        {
                            havingCriteriaSQL.Add(string.Format("({0})", table_field + criteria_value));
                        }
                        else
                        {
                            havingCriteriaSQL.Add(string.Format("({0})", total.ToUpper() + "(" + table_field + ") " + criteria_value));
                        }
                    }
                    else
                    {
                        criteriaSQL.Add(string.Format("({0})", table_field + criteria_value));
                    }
                    
                }
            }

            if (Utils.inBounds(i, gen_Sort) )
            {
                var sort_value = gen_Sort[i].Trim().ToUpper();
                if (!string.IsNullOrEmpty(sort_value))
                {
                    if (!SortVarible.Contains(sort_value))
                    {
                        return "ERROR|Giá trị sort không đúng cú pháp";
                    }

                    if (field == "*")
                    {
                        return "ERROR|Không thể sắp xếp cho trường *";
                    }

                    if (isTotal)
                    {
                        if (total == "where")
                        {
                            sortSQL.Add(table_field + " " + sort_value);
                        }
                        else if(total != "group_by")
                        {
                            sortSQL.Add(string.Format("{0}({1}) {2}", total.ToUpper(), table_field, sort_value));
                        } 
                    }
                    else
                    {
                        sortSQL.Add(table_field + " " + sort_value);
                    }
                    
                }
            }


            if (isShow && isTotal && (total == "group_by" || total == "where"))
            {
                groupSQL.Add(table_field);
            }


        }

        
        foreach (List<string> or_elms in gen_Or)
        {
            // câu lệnh hoàn chỉnh sau khi lặp 1 dòng diều kiện or
            var or_condition = new List<string>();
            var or_having_condition = new List<string>();
            for (var i = 0; i < gen_Table.Count(); i++)
            {
                var field = gen_Field[i].Trim();
                var table = gen_Table[i].Trim();
                var table_field = table + "." + field;

                var isTotal = false;
                var total = "";
                // kiểm tra groupby
                if (Utils.inBounds(i, gen_Total))
                {
                    total = gen_Total[i].Trim();
                    if (!string.IsNullOrEmpty(total))
                    {
                        if (!TotalVarible.Contains(total))
                        {
                            return "ERROR|Giá trị total không hợp lệ!";
                        }

                        if (field == "*")
                        {
                            return "ERROR|Giá trị Total không hợp lệ cho Field *!";
                        }
                        isTotal = true;
                    }
                }

                if (Utils.inBounds(i, or_elms))
                {

                    var or_elm = or_elms[i].Trim();
                    if (!string.IsNullOrEmpty(or_elm))
                    {
                        try
                        {
                            CheckConditionSQL(field, or_elm, object_ids[i], "Or");
                        }
                        catch (Exception ex)
                        {
                            return ex.Message;
                        }

                        if (isTotal)
                        {
                            if (total == "group_by")
                            {
                                or_having_condition.Add(
                                    string.Format("({0})", table_field + or_elm)
                                );
                            }
                            else if (total == "where")
                            {
                                or_condition.Add(
                                    string.Format("({0})", table_field + or_elm)
                                );
                            }
                            else
                            {
                                or_having_condition.Add(
                                    string.Format("({0})", total.ToUpper() + "(" + table_field + ") " + or_elm)
                                );
                            }

                        }
                        else
                        {
                            or_condition.Add(
                                string.Format("({0})", table_field + or_elm)
                            );
                        }
                        
                    }
                }
            }


            if (or_condition.Count() > 0)
            {
                orSQL.Add(
                    string.Format("(\n\t\t\t\t\t{0}\n\t\t\t\t)", string.Join(" AND ", or_condition))
                );
            } 
            
            if (or_having_condition.Count() > 0)
            {
                havingOrSQL.Add(
                    string.Format("({0})", string.Join(" AND ", or_having_condition))
                );
            }
        }



        foreach (var table in TableList)
        {
            DataTable dt = getInfoForeignKey(table);
            foreach (DataRow row in dt.Rows)
            {
                var column = row["column"].ToString();
                var referenced_table = row["referenced_table"].ToString();
                var referenced_column = row["referenced_column"].ToString();

                if (!TableList.Contains(referenced_table))
                {
                    continue;
                }

                joinSQL.Add(string.Format("{0}.{1} = {2}.{3}", table, column, referenced_table, referenced_column));
            }
        }


        if (selectSQL.Count() == 0)
        {
            return "ERROR|Câu lệnh SELECT phải có ít nhất 1 Field";
        }


        string query = string.Format("SELECT {0} \nFROM {1}\n", string.Join(", ", selectSQL), string.Join(", ", TableList));


        // nối chuỗi
        var where = "";

        if (criteriaSQL.Count() > 0 && orSQL.Count() > 0)
        {
            where = string.Format("(\n\t\t\t\t\t{0}\n\t\t\t\t) \n\t\t\t\tOR \n\t\t\t\t{1}", string.Join(" AND ", criteriaSQL), string.Join(" OR ", orSQL));
        }
        else if(criteriaSQL.Count() > 0 && orSQL.Count() == 0)
        {
            where = string.Format("{0}", string.Join(" AND ", criteriaSQL));
        }
        else if (criteriaSQL.Count() == 0 && orSQL.Count() > 0)
        {
            where = string.Format("{0}", string.Join(" OR ", orSQL));
        }


        if (joinSQL.Count() > 0 && !string.IsNullOrEmpty(where))
        {
            query += string.Format("WHERE ({0}) \n\t\t AND \n\t\t(\n\t\t\t\t{1}\n\t\t) \n", string.Join(" AND ", joinSQL), where);
        }
        else if (joinSQL.Count() > 0 && string.IsNullOrEmpty(where)) 
        {
            query += string.Format("WHERE ({0}) \n", string.Join(" AND ", joinSQL));
        }
        else if (joinSQL.Count() == 0 && !string.IsNullOrEmpty(where))
        {
            query += string.Format("WHERE ({0}) \n", where);
        }




        if (groupSQL.Count() > 0)
        {
            query += string.Format("GROUP BY {0}\n", string.Join(", ", groupSQL));
        }

        var having = "";

        if (havingCriteriaSQL.Count() > 0 && havingOrSQL.Count() > 0)
        {
            having = string.Format("(\n\t\t\t{0}\n\t\t) \n\t\t OR \n\t\t(\n\t\t\t{1}\n\t\t) \n", string.Join(" AND ", havingCriteriaSQL), string.Join(" OR ", havingOrSQL));
        }
        else if (havingCriteriaSQL.Count() > 0 && havingOrSQL.Count() == 0)
        {
            having = string.Format("{0}", string.Join(" AND ", havingCriteriaSQL));
        }
        else if (havingCriteriaSQL.Count() == 0 && havingOrSQL.Count() > 0)
        {
            having = string.Format("{0}", string.Join(" OR ", havingOrSQL));
        }


        if (!string.IsNullOrEmpty(having))
        {
            query += string.Format("HAVING {0}\n", having);
        }



        if (sortSQL.Count() > 0)
        {
            query += string.Format("ORDER BY {0}\n", string.Join(", ", sortSQL));
        }

        //Debug.WriteLine(query);

        HttpContext.Current.Session["querySQL"] = query;
        return query;
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