using System;
using System.IO;
using System.Text;

public class Fixer {
    public static void Fix() {
        string inputPath = @"c:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\script.js";
        string text = File.ReadAllText(inputPath, Encoding.UTF8);
        char fffd = '\uFFFD';
        
        text = text.Replace("p" + fffd + "gInput", "parseFloat(headingInput");
        text = text.Replace("p" + fffd + "getElementById('lat-error')", "parseFloat(document.getElementById('lat-error')");
        text = text.Replace("p" + fffd + "g-error')", "parseFloat(document.getElementById('long-error')");
        text = text.Replace("emp" + fffd + "g =", "emp.heading =");
        text = text.Replace("emp" + fffd + "gErr =", "emp.longErr =");
        text = text.Replace("emp" + fffd + "g +", "emp.heading +");
        text = text.Replace("emp" + fffd + "g !==", "emp.heading !==");
        text = text.Replace("intN" + fffd + "ontent", "intNode.textContent");
        text = text.Replace("P" + fffd + "g. `${p" + fffd + "geN" + fffd + "otal}`", "Pág. `${pageNum}/${pageTotal}`");
        text = text.Replace("p" + fffd + "gDeclina" + fffd + "onInput", "magDeclinationInput");
        
        File.WriteAllText(inputPath, text, new UTF8Encoding(false));
    }
}
