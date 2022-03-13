using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Table
/// </summary>
public class Table
{
    public int Object_Id { get; set; }
    public string Name { get; set; }
    public List<string> Columns { get; set; }

    public Table(string name = "", List<string> columns = null, int object_id = 0)
	{
        Name = name;
        Columns = columns;
        Object_Id = object_id;

    }
}