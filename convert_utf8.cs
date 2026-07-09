using System;
using System.IO;
using System.Text;

class Program {
    static void Main() {
        string[] files = { @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\script.js", @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\index.html" };
        foreach (string file in files) {
            string content = File.ReadAllText(file, Encoding.GetEncoding("windows-1252"));
            File.WriteAllText(file, content, new UTF8Encoding(false));
            Console.WriteLine("Converted " + file + " to UTF-8");
        }
    }
}
