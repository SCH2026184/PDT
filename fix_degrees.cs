using System;
using System.IO;
using System.Text;

class Program {
    static void Main() {
        string pathJs = "script.js";
        string js = File.ReadAllText(pathJs, Encoding.UTF8);
        js = js.Replace("'", "°");
        js = js.Replace("'", "°");
        js = js.Replace("'", "°");
        js = js.Replace("'", "°");
        js = js.Replace("}' (MAG)", "}° (MAG)");
        File.WriteAllText(pathJs, js, new UTF8Encoding(false));
    }
}
