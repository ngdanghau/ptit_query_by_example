using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for Utils
/// </summary>
public class Utils
{
    public static bool inBounds(int index, int[] array)
    {
        return (index >= 0) && (index < array.Length);
    }

    public static bool inBounds(int index, List<string> array)
    {
        return (index >= 0) && (index < array.Count);
    }

    public static bool StartsWithAny(string source, IEnumerable<string> strings, out string result)
    {
        foreach (var valueToCheck in strings)
        {
            if (source.StartsWith(valueToCheck))
            {
                result = source.Replace(valueToCheck, "");
                return true;
            }
        }
        result = "";
        return false;
    }

    public static bool IsNumeric(string text)
    {
        double number;
        return double.TryParse(text, out number);
    }
}