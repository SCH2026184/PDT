using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Text;

class Program {
    static void Main() {
        string path = @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\index.html";
        string html = File.ReadAllText(path, new UTF8Encoding(false));

        // Let's add the + button to all tactical-list-header lines.
        html = Regex.Replace(html, @"(<span style=""display:flex; align-items:center; gap:6px;""><i class="".*?""></i>.*?)</span>", "$1 <button class=\"add-tactical-btn\" style=\"background:none; border:none; color:var(--primary); cursor:pointer;\"><i class=\"fa-solid fa-plus\"></i></button></span>");
        
        File.WriteAllText(path, html, new UTF8Encoding(false));
        Console.WriteLine("Added + buttons.");
    }
}
