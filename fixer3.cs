using System;
using System.IO;
using System.Text;

public class Fixer {
    public static void Fix() {
        string path = @"c:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\script.js";
        string text = File.ReadAllText(path, Encoding.UTF8);
        char a = (char)225; // á

        text = text.Replace("p" + a + "get.result", "e.target.result");
        text = text.Replace("p" + a + "get.value", "e.target.value");
        text = text.Replace("p" + a + "gN" + a + "ontent", "parseFloat(node.textContent");
        text = text.Replace("p" + a + "g(center.lat", "points.push(L.latLng(center.lat");
        text = text.Replace("p" + a + "g(absPx", "points.push(L.latLng(absPx");
        text = text.Replace("const p" + a + "g = emp.heading + dec;", "const magHeading = emp.heading + dec;");
        text = text.Replace("desHeading = p" + a + "g || 0) + dec;", "desHeading = parseFloat(desHeadingInput.value || 0) + dec;");
        text = text.Replace("const p" + a + "g = magHeading + dec;", "const desHeading = magHeading + dec;");
        text = text.Replace("const p" + a + "g = emp.heading + dec;", "const magHeading = emp.heading + dec;");
        
        text = text.Replace("map" + a + "getA" + a + "ow", "map.removeLayer(drawnTargetArrow)");
        text = text.Replace("bindTooltip" + a + "gna" + a + "o", "bindTooltip(`Designação");
        text = text.Replace("seta-logo.p" + a + "g", "seta-logo.png");
        text = text.Replace("inv" + a + "lido", "inválido");
        text = text.Replace("p" + a + "ge(i)", "pdf.getPage(i)");
        text = text.Replace("p" + a + "g = ((parsed", "heading = ((parsed");
        text = text.Replace("weap" + a + "g", "weaponHeading");
        text = text.Replace("p" + a + "ge.x", "pEdge.x");
        text = text.Replace("p" + a + "ge.y", "pEdge.y");
        text = text.Replace("map" + a + "g-info-box", "map-compass-info-box");
        text = text.Replace("map" + a + "g-info", "map-compass-info");
        text = text.Replace("emp" + a + "getA" + a + "on", "emp.targetAcquisition");
        text = text.Replace("emp" + a + "g.lat", "emp.targetLatLng.lat");
        text = text.Replace("p" + a + "g = center.lng", "p.lng = center.lng");
        text = text.Replace("p" + a + "g the map", "panning the map");
        text = text.Replace("P" + a + "gons", "Polygons");
        text = text.Replace("p" + a + "g(px, py", "pointToLatLng(px, py");
        text = text.Replace("p" + a + "gaƟ", "pregações"); // just leave it or remove it
        text = text.Replace("T" + a + "ticos", "Táticos");
        text = text.Replace("Emp" + a + "gada", "Empregada");
        
        // Remove trailing á artifacts from the previous replace
        text = text.Replace("p" + a + "g", "p.lng");

        File.WriteAllText(path, text, new UTF8Encoding(false));
    }
}
