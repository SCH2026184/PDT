using System;
using System.IO;
using System.Web.Script.Serialization;
using System.Collections.Generic;

class Program {
    static void Main() {
        string logPath = @"C:\Users\Diego Schroeder\.gemini\antigravity\brain\7f0adfc9-bc66-425a-905b-1b2662dd06b4\.system_generated\logs\transcript.jsonl";
        if (!File.Exists(logPath)) {
            Console.WriteLine("Log not found.");
            return;
        }

        JavaScriptSerializer jss = new JavaScriptSerializer();
        jss.MaxJsonLength = Int32.MaxValue;

        string[] lines = File.ReadAllLines(logPath);
        int indexCount = 0;
        int scriptCount = 0;

        foreach (string line in lines) {
            if (line.Contains("\"replace_file_content\"") || line.Contains("\"multi_replace_file_content\"")) {
                try {
                    var obj = jss.Deserialize<Dictionary<string, object>>(line);
                    if (obj.ContainsKey("tool_calls")) {
                        var tools = (System.Collections.ArrayList)obj["tool_calls"];
                        foreach(Dictionary<string, object> tool in tools) {
                            if (tool["name"].ToString() == "replace_file_content" || tool["name"].ToString() == "multi_replace_file_content") {
                                var args = (Dictionary<string, object>)tool["args"];
                                string targetFile = args["TargetFile"].ToString();
                                
                                if (targetFile.Contains("index.html")) {
                                    indexCount++;
                                    File.WriteAllText("index_edit_" + indexCount + ".txt", jss.Serialize(args));
                                } else if (targetFile.Contains("script.js")) {
                                    scriptCount++;
                                    File.WriteAllText("script_edit_" + scriptCount + ".txt", jss.Serialize(args));
                                }
                            }
                        }
                    }
                } catch {}
            }
        }
        Console.WriteLine(string.Format("Found {0} index.html edits and {1} script.js edits.", indexCount, scriptCount));
    }
}
