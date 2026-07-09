using System;
using System.IO;
using System.Text;

public class Fixer {
    public static void Fix() {
        string path = @"c:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\script.js";
        string text = File.ReadAllText(path, Encoding.UTF8);

        text = text.Replace("Açãolis", "Anapolis");
        text = text.Replace("Açãona", "Adiciona");
        text = text.Replace("Açãonda", "Arredonda");
        text = text.Replace("Açãopt", "Array.from(opt.selectedOptions).map(opt"); // Wait! Context: const selectedEmps = Açãopt => parseInt(opt.value)); -> `Array.from(opt.selectedOptions).map(opt`? But the context is `const selectedEmps = Açãopt => parseInt(opt.value));`. So let's replace `const selectedEmps = Açãopt =>` with `const selectedEmps = Array.from(document.querySelectorAll('.mtgt-emps option:checked')).map(opt =>`. Wait, let's just use `Array.from(document.getElementById('mtgt-emps').selectedOptions).map(opt`? 
        text = text.Replace("Açãos", "Alvos");
        text = text.Replace("Açãous", "Anonymous");
        text = text.Replace("btnDeclinaçãoAdj", "btnDeclinationAdj");
        text = text.Replace("Designaçãon", "Designation");
        text = text.Replace("disposiçãos", "dispositivos");
        text = text.Replace("DRAçãorIdx", "DRAW_COLORS[colorIdx % DRAW_COLORS.length]");
        text = text.Replace("Geraçãor", "Gerador");
        text = text.Replace("goToDesignaçãoBtn", "goToDesignationBtn");
        text = text.Replace("emp.lngetAção", "emp.targetAcquisition");
        text = text.Replace("map.lngetAçãow)", "map.removeLayer(drawnTargetArrow)");
        text = text.Replace("bindTooltip.lngnação", "bindTooltip(`Designação");
        text = text.Replace("magDeclinaçãocus", "magDeclinationInput.addEventListener('focus'");
        text = text.Replace("magDeclinaçãonInput", "magDeclinationInput");
        text = text.Replace("mnAçãorm", "mn.style.transform");
        text = text.Replace("mnAçãow", "mnArrow");
        text = text.Replace("posiçãolute", "position: absolute");
        text = text.Replace("posiçãoon", "position");
        text = text.Replace("querySelectorAção-btn", "querySelectorAll('.action-btn'");
        text = text.Replace("readAçãob)", "readAsArrayBuffer(blob)");
        text = text.Replace("setAçãol)", "setActiveTool(tool)");
        text = text.Replace("setAçãox'", "setAttribute('viewBox'");
        text = text.Replace("setupAçãoRepeat", "setupAutoRepeat");
        text = text.Replace("setupAçãown", "setupHeadingDown");
        text = text.Replace("showFragmentaçãoCheck", "showFragmentationCheck");

        // Advanced contexts
        text = text.Replace("const selectedEmps = Açãopt => parseInt(opt.value));", "const selectedEmps = Array.from(empsSelect.selectedOptions).map(opt => parseInt(opt.value));");
        text = text.Replace("function setAçãol)", "function setActiveTool(tool)");
        text = text.Replace("setupAçãown,", "btnHeadingDown,");

        File.WriteAllText(path, text, new UTF8Encoding(false));
    }
}
