using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Collections.Generic;

class Program {
    static void Main() {
        string logPath = @"C:\Users\Diego Schroeder\.gemini\antigravity\brain\7f0adfc9-bc66-425a-905b-1b2662dd06b4\.system_generated\logs\transcript.jsonl";
        if (!File.Exists(logPath)) {
            Console.WriteLine("Log not found.");
            return;
        }

        string[] lines = File.ReadAllLines(logPath);
        int count = 0;
        foreach (string line in lines) {
            if (line.Contains("\"replace_file_content\"") || line.Contains("\"multi_replace_file_content\"")) {
                if (line.Contains("script.js")) {
                    count++;
                }
            }
        }
        Console.WriteLine("Found " + count + " edit actions to script.js");
    }
}
