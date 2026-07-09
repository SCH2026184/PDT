using System;
using System.IO;
using System.Text;

class Program {
    static void Main() {
        string pathJs = "script.js";
        string js = File.ReadAllText(pathJs, Encoding.UTF8);
        js = js.Replace('°', '\'');
        File.WriteAllText(pathJs, js, new UTF8Encoding(false));
        
        string pathHtml = "index.html";
        string html = File.ReadAllText(pathHtml, Encoding.UTF8);
        html = html.Replace('°', '\'');
        File.WriteAllText(pathHtml, html, new UTF8Encoding(false));
        
        Console.WriteLine("Done replacing ° with '");
    }
}
