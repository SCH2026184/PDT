using System;
using System.IO;
using System.Text;

class Program {
    static void Main() {
        string path = @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\script.js";
        string js = File.ReadAllText(path, new UTF8Encoding(false));

        string newLogic = @"
    let activeTacticalMode = null;
    let pointCounters = { waypoints: 1, targets: 1, artillery: 1, navigation: 1, friendly: 1, threats: 1 };
    
    // Defer adding listeners until DOM is ready just in case
    setTimeout(() => {
        document.querySelectorAll('.add-tactical-btn').forEach((btn, idx) => {
            const modes = ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats'];
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (activeTacticalMode === modes[idx]) {
                    activeTacticalMode = null;
                    document.getElementById('map').style.cursor = 'grab';
                    btn.style.color = 'var(--primary)';
                } else {
                    activeTacticalMode = modes[idx];
                    document.getElementById('map').style.cursor = 'crosshair';
                    document.querySelectorAll('.add-tactical-btn').forEach(b => b.style.color = 'var(--primary)');
                    btn.style.color = '#00ff00';
                }
            });
        });

        ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats'].forEach(mode => {
            const chk = document.getElementById(`show-${mode}-list`);
            if(chk) {
                chk.addEventListener('change', (e) => {
                    const show = e.target.checked;
                    tacticalPoints[mode].forEach(pt => {
                        if (pt.marker) {
                            if (show) pt.marker.addTo(map); else map.removeLayer(pt.marker);
                        }
                        if (pt.circle) {
                            if (show) pt.circle.addTo(map); else map.removeLayer(pt.circle);
                        }
                        if (pt.impactLine) {
                            if (show) pt.impactLine.addTo(map); else map.removeLayer(pt.impactLine);
                        }
                        if (pt.impactMarker) {
                            if (show) pt.impactMarker.addTo(map); else map.removeLayer(pt.impactMarker);
                        }
                        if (pt.bombCircle && show) pt.bombCircle.addTo(map); else if (pt.bombCircle) map.removeLayer(pt.bombCircle);
                        if (pt.rocketCircle && show) pt.rocketCircle.addTo(map); else if (pt.rocketCircle) map.removeLayer(pt.rocketCircle);
                        if (pt.bulletsCircle && show) pt.bulletsCircle.addTo(map); else if (pt.bulletsCircle) map.removeLayer(pt.bulletsCircle);
                    });
                });
            }
        });
    }, 1000);

    function getHollowIcon(mode) {
        let color = '#00ffff';
        if (mode === 'targets') color = 'red';
        if (mode === 'threats') color = 'red';
        if (mode === 'artillery') color = 'blue';
        if (mode === 'friendly') color = 'blue';
        if (mode === 'navigation') color = 'green';
        if (mode === 'waypoints') color = 'white';
        
        let shape = `<circle cx=""15"" cy=""15"" r=""12"" stroke=""${color}"" stroke-width=""2.5"" fill=""none"" />`;
        if (mode === 'targets' || mode === 'threats') {
            shape = `<polygon points=""15,5 28,25 2,25"" stroke=""${color}"" stroke-width=""2.5"" fill=""none"" />`;
        }
        
        return L.divIcon({ 
            className: `tactical-icon-${mode}`, 
            html: `<svg width=""30"" height=""30"" viewBox=""0 0 30 30"" style=""display: block;"">${shape}</svg>`, 
            iconSize: [30, 30], 
            iconAnchor: [15, 15] 
        });
    }

    function addTacticalPoint(mode, latlng) {
        const id = Date.now() + Math.floor(Math.random() * 1000);
        let namePrefix = mode.toUpperCase().substring(0, 3);
        if (mode === 'waypoints') namePrefix = 'WP';
        if (mode === 'artillery') namePrefix = 'ARTY';
        if (mode === 'navigation') namePrefix = 'NAV';
        if (mode === 'friendly') namePrefix = 'FRD';
        if (mode === 'threats') namePrefix = 'SAM';
        
        const pt = {
            id: id,
            name: `${namePrefix} ${pointCounters[mode]++}`,
            latlng: latlng,
        };
        
        const icon = getHollowIcon(mode);
        pt.marker = L.marker(latlng, { icon: icon, draggable: true });
        pt.marker.bindTooltip(pt.name);
        
        if (document.getElementById(`show-${mode}-list`).checked) {
            pt.marker.addTo(map);
            if (typeof showLegends !== 'undefined' && showLegends) pt.marker.openTooltip();
        }
        
        pt.marker.on('dragend', (e) => {
            pt.latlng = e.target.getLatLng();
            if (mode === 'artillery') drawArtilleryImpact(pt);
            if (mode === 'threats' && pt.circle) pt.circle.setLatLng(pt.latlng);
            if (pt.bombCircle) pt.bombCircle.setLatLng(pt.latlng);
            if (pt.rocketCircle) pt.rocketCircle.setLatLng(pt.latlng);
            if (pt.bulletsCircle) pt.bulletsCircle.setLatLng(pt.latlng);
            updateTacticalList(mode);
        });
        
        if (mode === 'threats') {
            pt.radiusNM = 2.0;
            pt.circle = L.circle(latlng, { radius: pt.radiusNM * 1852, color: 'red', fillOpacity: 0.1, dashArray: '5, 5' });
            if (document.getElementById(`show-${mode}-list`).checked) {
                pt.circle.addTo(map);
            }
        }
        
        tacticalPoints[mode].push(pt);
        updateTacticalList(mode);
        
        activeTacticalMode = null;
        document.getElementById('map').style.cursor = 'grab';
        document.querySelectorAll('.add-tactical-btn').forEach(b => b.style.color = 'var(--primary)');
    }
";

        js = js.Replace("if (targetDrawingActive) {", "if (typeof activeTacticalMode !== 'undefined' && activeTacticalMode) { addTacticalPoint(activeTacticalMode, e.latlng); return; }\n        if (targetDrawingActive) {");

        int endIdx = js.LastIndexOf("});");
        js = js.Insert(endIdx, newLogic + "\n");
        File.WriteAllText(path, js, new UTF8Encoding(false));
        Console.WriteLine("Injected logic.");
    }
}
