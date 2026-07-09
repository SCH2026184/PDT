using System;
using System.IO;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        string logPath = @"C:\Users\Diego Schroeder\.gemini\antigravity\brain\7f0adfc9-bc66-425a-905b-1b2662dd06b4\.system_generated\tasks\task-5157.log";
        string outPath = @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\script_recovered.js";
        
        if (!File.Exists(logPath)) {
            Console.WriteLine("Log not found.");
            return;
        }

        string[] lines = File.ReadAllLines(logPath);
        using (StreamWriter sw = new StreamWriter(outPath)) {
            foreach (string line in lines) {
                Match m = Regex.Match(line, @"^script\.js:\d+:(.*)$");
                if (m.Success) {
                    string content = m.Groups[1].Value;
                    if (content.StartsWith(" ")) content = content.Substring(1); // remove the leading space added by grep-like output
                    sw.WriteLine(content);
                }
            }
        }
        Console.WriteLine("Recovered script to script_recovered.js");
    }
}
