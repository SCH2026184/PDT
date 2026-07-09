using System;
using System.IO;
using System.Text.RegularExpressions;
using System.Text;

class Program {
    static void Main() {
        string path = @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\index.html";
        string html = File.ReadAllText(path, new UTF8Encoding(false));

        int startIdx = html.IndexOf("<div style=\"margin-top:15px; width:100%; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom:15px; margin-bottom:15px;\">");
        if(startIdx == -1) {
            Console.WriteLine("Start index not found!");
            return;
        }

        int endIdx = html.IndexOf("<!-- Modal para Salvar Emprego -->");
        if(endIdx == -1) {
            Console.WriteLine("End index not found!");
            return;
        }

        // We want to replace everything from startIdx to endIdx - "</div>\n        </div>\n    </div>\n\n    <!-- Modal"
        // Let's just find the closing tags before the modal.
        int actualEndIdx = html.LastIndexOf("</div>\r\n        </div>\r\n    </div>\r\n\r\n    <!-- Modal", endIdx + 50);
        if (actualEndIdx == -1) {
             actualEndIdx = html.LastIndexOf("</div>\n        </div>\n    </div>\n\n    <!-- Modal", endIdx + 50);
        }
        
        string replacement = @"
                    <!-- TACTICAL LISTS -->
                    <div id=""tactical-lists-container"" style=""width: 100%; display: flex; flex-direction: column; gap: 15px; margin-top: 15px;"">
                        
                        <!-- Waypoints -->
                        <div class=""tactical-list-section"">
                            <div class=""tactical-list-header"">
                                <span style=""display:flex; align-items:center; gap:6px;""><i class=""fa-solid fa-route""></i> Waypoints</span>
                                <div style=""display: flex; align-items: center; gap: 4px;"">
                                    <input type=""checkbox"" id=""show-waypoints-list"" checked style=""width: 14px; height: 14px; margin: 0; cursor: pointer;"">
                                </div>
                            </div>
                            <div id=""waypoints-list"" class=""tactical-items-container""></div>
                        </div>

                        <!-- Targets -->
                        <div class=""tactical-list-section"">
                            <div class=""tactical-list-header"">
                                <span style=""display:flex; align-items:center; gap:6px;""><i class=""fa-solid fa-crosshairs""></i> Targets</span>
                                <div style=""display: flex; align-items: center; gap: 4px;"">
                                    <input type=""checkbox"" id=""show-targets-list"" checked style=""width: 14px; height: 14px; margin: 0; cursor: pointer;"">
                                </div>
                            </div>
                            <div id=""targets-list"" class=""tactical-items-container""></div>
                        </div>

                        <!-- Artillery -->
                        <div class=""tactical-list-section"">
                            <div class=""tactical-list-header"">
                                <span style=""display:flex; align-items:center; gap:6px;""><i class=""fa-solid fa-rocket""></i> Artilharia</span>
                                <div style=""display: flex; align-items: center; gap: 4px;"">
                                    <input type=""checkbox"" id=""show-artillery-list"" checked style=""width: 14px; height: 14px; margin: 0; cursor: pointer;"">
                                </div>
                            </div>
                            <div id=""artillery-list"" class=""tactical-items-container""></div>
                        </div>

                        <!-- Navigation -->
                        <div class=""tactical-list-section"">
                            <div class=""tactical-list-header"">
                                <span style=""display:flex; align-items:center; gap:6px;""><i class=""fa-solid fa-map""></i> Navigation</span>
                                <div style=""display: flex; align-items: center; gap: 4px;"">
                                    <input type=""checkbox"" id=""show-navigation-list"" checked style=""width: 14px; height: 14px; margin: 0; cursor: pointer;"">
                                </div>
                            </div>
                            <div id=""navigation-list"" class=""tactical-items-container""></div>
                        </div>

                        <!-- Friendly -->
                        <div class=""tactical-list-section"">
                            <div class=""tactical-list-header"">
                                <span style=""display:flex; align-items:center; gap:6px;""><i class=""fa-solid fa-shield-halved""></i> Friendly</span>
                                <div style=""display: flex; align-items: center; gap: 4px;"">
                                    <input type=""checkbox"" id=""show-friendly-list"" checked style=""width: 14px; height: 14px; margin: 0; cursor: pointer;"">
                                </div>
                            </div>
                            <div id=""friendly-list"" class=""tactical-items-container""></div>
                        </div>

                        <!-- Threats -->
                        <div class=""tactical-list-section"">
                            <div class=""tactical-list-header"">
                                <span style=""display:flex; align-items:center; gap:6px;""><i class=""fa-solid fa-triangle-exclamation""></i> Threats</span>
                                <div style=""display: flex; align-items: center; gap: 4px;"">
                                    <input type=""checkbox"" id=""show-threats-list"" checked style=""width: 14px; height: 14px; margin: 0; cursor: pointer;"">
                                </div>
                            </div>
                            <div id=""threats-list"" class=""tactical-items-container""></div>
                        </div>

                    </div>
                ";

        string newHtml = html.Substring(0, startIdx) + replacement + html.Substring(actualEndIdx);
        
        // Also add some CSS to the head for the lists!
        int styleEnd = newHtml.IndexOf("</style>");
        string css = @"
        .tactical-list-section {
            border-bottom: 1px solid rgba(255,255,255,0.08);
            padding-bottom: 10px;
        }
        .tactical-list-section:last-child {
            border-bottom: none;
        }
        .tactical-list-header {
            font-size: 0.7rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--primary);
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        }
        .tactical-items-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 6px;
            max-height: 180px;
            overflow-y: auto;
            padding-right: 4px;
        }
        ";
        newHtml = newHtml.Substring(0, styleEnd) + css + newHtml.Substring(styleEnd);

        File.WriteAllText(path, newHtml, new UTF8Encoding(false));
        Console.WriteLine("Replaced lists in index.html");
    }
}
