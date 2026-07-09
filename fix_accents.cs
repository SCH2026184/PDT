using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        string[] files = { @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\script.js", @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\index.html" };
        foreach (string file in files) {
            string text = File.ReadAllText(file, new UTF8Encoding(false));
            
            // Fix Degrees
            text = Regex.Replace(text, @"'|Ã‚Â°|Ã‚Âº|Â°|Âº|º|°|\uFFFD'\uFFFD", "°");
            text = text.Replace("\uFFFD'\uFFFD", "°");
            text = text.Replace("\uFFFD", "°"); // A lot of \uFFFD in toDMS are just degrees
            
            // Fix Designação
            text = Regex.Replace(text, @"Designa[\uFFFD]+o", "Designação");
            
            // Fix Válido/Inválido
            text = Regex.Replace(text, @"inv[\uFFFD]+lido", "inválido");
            text = Regex.Replace(text, @"v[\uFFFD]+lido", "válido");
            text = Regex.Replace(text, @"v[\uFFFD]+lidos", "válidos");
            
            // Fix Táticos
            text = Regex.Replace(text, @"T[\uFFFD]+ticos", "Táticos");
            
            // Fix Criação
            text = Regex.Replace(text, @"cria[\uFFFD]+o", "criação");
            
            // Fix Lógica
            text = Regex.Replace(text, @"l[\uFFFD]+gica", "lógica");
            
            // Fix Páginas
            text = Regex.Replace(text, @"p[\uFFFD]+ginas", "páginas");

            // Fix Pregações
            text = Regex.Replace(text, @"prega[\uFFFD]+es", "pregações");
            
            // Fix Polígonos
            text = Regex.Replace(text, @"pol[\uFFFD]+gono", "polígono");
            
            // Fix Configurações
            text = Regex.Replace(text, @"Configura[\uFFFD]+es", "Configurações");

            // Fix Ações
            text = Regex.Replace(text, @"A[\uFFFD]+es", "Ações");

            // Fix Padrão
            text = Regex.Replace(text, @"Padr[\uFFFD]+o", "Padrão");

            File.WriteAllText(file, text, new UTF8Encoding(false));
            Console.WriteLine("Fixed accents in " + file);
        }
    }
}
