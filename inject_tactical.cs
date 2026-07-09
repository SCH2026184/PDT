using System;
using System.IO;
using System.Text;

class Program {
    static void Main() {
        string path = @"C:\Users\Diego Schroeder\Desktop\Antigravity\PDE II\script.js";
        string js = File.ReadAllText(path, new UTF8Encoding(false));

        string newFunc = @"
    function updateTacticalList(mode) {
        let container;
        if (mode === 'waypoints') container = document.getElementById('waypoints-list');
        if (mode === 'targets') container = document.getElementById('targets-list');
        if (mode === 'artillery') container = document.getElementById('artillery-list');
        if (mode === 'navigation') container = document.getElementById('navigation-list');
        if (mode === 'friendly') container = document.getElementById('friendly-list');
        if (mode === 'threats') container = document.getElementById('threats-list');
        
        if (!container) return;
        container.innerHTML = '';
        
        tacticalPoints[mode].forEach(pt => {
            const item = document.createElement('div');
            item.style.cssText = 'display:flex; align-items:center; gap:10px; margin-bottom:8px; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);';
            
            const info = document.createElement('div');
            info.style.cssText = 'flex:1; display:flex; flex-direction:column; gap:2px;';
            
            const nameEl = document.createElement('span');
            nameEl.style.cssText = 'font-size:0.85rem; font-weight:bold; color:var(--primary); outline:none; cursor:text;';
            nameEl.contentEditable = true;
            nameEl.textContent = pt.name;
            nameEl.addEventListener('blur', (e) => {
                pt.name = e.target.textContent;
                if (pt.marker) {
                    pt.marker.bindTooltip(pt.name);
                    if (showLegends) pt.marker.openTooltip();
                }
            });
            
            const coordsEl = document.createElement('span');
            coordsEl.style.cssText = 'font-size:0.65rem; color:var(--text-dim);';
            const casTabActive = document.querySelector('.tab[data-target=""cas-tab""]') && document.querySelector('.tab[data-target=""cas-tab""]').classList.contains('active');
            let coordsFormat = casTabActive ? 'MGRS' : document.getElementById('coord-format').value;
            coordsEl.textContent = formatCoords(pt.latlng.lat, pt.latlng.lng, coordsFormat);
            
            info.appendChild(nameEl);
            info.appendChild(coordsEl);
            
            // Add mode specific inputs
            if (mode === 'artillery') {
                const artInfo = document.createElement('div');
                artInfo.style.cssText = 'display:flex; gap:10px; margin-top:4px;';
                
                const gtlInput = document.createElement('input');
                gtlInput.type = 'number';
                gtlInput.placeholder = 'GTL (Mag)';
                gtlInput.value = pt.gtl || '';
                gtlInput.style.cssText = 'width:60px; font-size:0.7rem; padding:2px; background:rgba(0,0,0,0.5); color:white; border:1px solid var(--primary); border-radius:4px;';
                
                const rangeInput = document.createElement('input');
                rangeInput.type = 'number';
                rangeInput.placeholder = 'Range (m)';
                rangeInput.value = pt.range || '';
                rangeInput.style.cssText = 'width:70px; font-size:0.7rem; padding:2px; background:rgba(0,0,0,0.5); color:white; border:1px solid var(--primary); border-radius:4px;';
                
                const updateArtillery = () => {
                    pt.gtl = parseFloat(gtlInput.value);
                    pt.range = parseFloat(rangeInput.value);
                    drawArtilleryImpact(pt);
                };
                gtlInput.addEventListener('input', updateArtillery);
                rangeInput.addEventListener('input', updateArtillery);
                
                artInfo.appendChild(gtlInput);
                artInfo.appendChild(rangeInput);
                info.appendChild(artInfo);
            }
            
            if (mode === 'friendly') {
                const weaponsGroup = document.createElement('div');
                weaponsGroup.style.cssText = 'display:flex; gap:10px; margin-top:6px;';
                
                ['bomb', 'rocket', 'bullets'].forEach(w => {
                    const lbl = document.createElement('label');
                    lbl.style.cssText = 'display:flex; align-items:center; gap:4px; cursor:pointer; font-size:0.7rem; color:var(--text-dim);';
                    const chk = document.createElement('input');
                    chk.type = 'checkbox';
                    chk.className = 'friendly-weapon-check';
                    chk.dataset.weapon = w;
                    chk.dataset.id = pt.id;
                    chk.checked = pt[w + 'Checked'] || false;
                    
                    let icon = '';
                    if(w === 'bomb') icon = '<i class=""fa-solid fa-bomb""></i>';
                    if(w === 'rocket') icon = '<i class=""fa-solid fa-rocket""></i>';
                    if(w === 'bullets') icon = '<i class=""fa-solid fa-meteor""></i>';
                    
                    lbl.innerHTML = icon;
                    lbl.prepend(chk);
                    weaponsGroup.appendChild(lbl);
                    
                    chk.addEventListener('change', (e) => {
                        const isChecked = e.target.checked;
                        const show = document.getElementById('show-friendly-list').checked;
                        if (w === 'bomb') {
                            pt.bombChecked = isChecked;
                            if (pt.bombCircle) { map.removeLayer(pt.bombCircle); delete pt.bombCircle; }
                            if (isChecked) {
                                pt.bombCircle = L.circle(pt.latlng, { radius: 310, color: 'blue', dashArray: '5, 5', fill: false, weight: 2 });
                                if (show) pt.bombCircle.addTo(map);
                            }
                        }
                        if (w === 'rocket') {
                            pt.rocketChecked = isChecked;
                            if (pt.rocketCircle) { map.removeLayer(pt.rocketCircle); delete pt.rocketCircle; }
                            if (isChecked) {
                                pt.rocketCircle = L.circle(pt.latlng, { radius: 300, color: 'blue', dashArray: '5, 5', fill: false, weight: 2 });
                                if (show) pt.rocketCircle.addTo(map);
                            }
                        }
                        if (w === 'bullets') {
                            pt.bulletsChecked = isChecked;
                            if (pt.bulletsCircle) { map.removeLayer(pt.bulletsCircle); delete pt.bulletsCircle; }
                            if (isChecked) {
                                pt.bulletsCircle = L.circle(pt.latlng, { radius: 100, color: 'blue', dashArray: '5, 5', fill: false, weight: 2 });
                                if (show) pt.bulletsCircle.addTo(map);
                            }
                        }
                    });
                });
                info.appendChild(weaponsGroup);
            }
            
            if (mode === 'threats') {
                const threatInfo = document.createElement('div');
                threatInfo.style.cssText = 'display:flex; align-items:center; gap:6px; margin-top:4px;';
                const radInput = document.createElement('input');
                radInput.type = 'number';
                radInput.step = '0.1';
                radInput.value = pt.radiusNM || 2.0;
                radInput.style.cssText = 'width:50px; font-size:0.7rem; padding:2px; background:rgba(0,0,0,0.5); color:white; border:1px solid red; border-radius:4px;';
                const radLabel = document.createElement('span');
                radLabel.textContent = 'NM';
                radLabel.style.cssText = 'font-size:0.7rem; color:red;';
                
                radInput.addEventListener('input', (e) => {
                    pt.radiusNM = parseFloat(e.target.value) || 2.0;
                    if (pt.circle) {
                        pt.circle.setRadius(pt.radiusNM * 1852);
                    }
                });
                threatInfo.appendChild(radInput);
                threatInfo.appendChild(radLabel);
                info.appendChild(threatInfo);
            }
            
            const actions = document.createElement('div');
            actions.style.cssText = 'display:flex; gap:6px;';
            
            const gotoBtn = document.createElement('button');
            gotoBtn.innerHTML = '<i class=""fa-solid fa-location-crosshairs""></i>';
            gotoBtn.style.cssText = 'background:rgba(0, 210, 255, 0.1); border:1px solid var(--primary); color:var(--primary); cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
            gotoBtn.addEventListener('click', () => map.setView(pt.latlng, 15, {animate: true}));
            
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '<i class=""fa-solid fa-trash""></i>';
            delBtn.style.cssText = 'background:rgba(255, 0, 0, 0.1); border:1px solid red; color:red; cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
            delBtn.addEventListener('click', () => {
                if (pt.marker) map.removeLayer(pt.marker);
                if (pt.circle) map.removeLayer(pt.circle);
                if (pt.impactLine) map.removeLayer(pt.impactLine);
                if (pt.impactMarker) map.removeLayer(pt.impactMarker);
                if (pt.bombCircle) map.removeLayer(pt.bombCircle);
                if (pt.rocketCircle) map.removeLayer(pt.rocketCircle);
                if (pt.bulletsCircle) map.removeLayer(pt.bulletsCircle);
                const idx = tacticalPoints[mode].findIndex(x => x.id === pt.id);
                if (idx > -1) tacticalPoints[mode].splice(idx, 1);
                updateTacticalList(mode);
            });
            
            actions.appendChild(gotoBtn);
            actions.appendChild(delBtn);
            
            item.appendChild(info);
            item.appendChild(actions);
            container.appendChild(item);
        });
    }

    function drawArtilleryImpact(pt) {
        if (pt.impactLine) map.removeLayer(pt.impactLine);
        if (pt.impactMarker) map.removeLayer(pt.impactMarker);
        
        if (!pt.gtl || !pt.range) return;
        
        const magDec = parseFloat(document.getElementById('mag-declination').value || 0);
        const trueHeading = (pt.gtl + magDec + 360) % 360;
        
        const rad = (trueHeading * Math.PI) / 180;
        const distDegLat = (pt.range / 111111) * Math.cos(rad);
        const distDegLng = (pt.range / (111111 * Math.cos(pt.latlng.lat * Math.PI / 180))) * Math.sin(rad);
        
        const impactLatLng = L.latLng(pt.latlng.lat + distDegLat, pt.latlng.lng + distDegLng);
        
        pt.impactLine = L.polyline([pt.latlng, impactLatLng], { color: 'blue', dashArray: '5, 5', weight: 2 }).addTo(map);
        
        const xIcon = L.divIcon({ className: 'impact-x', html: `<svg width=""16"" height=""16"" viewBox=""0 0 16 16""><line x1=""0"" y1=""0"" x2=""16"" y2=""16"" stroke=""blue"" stroke-width=""3""/><line x1=""16"" y1=""0"" x2=""0"" y2=""16"" stroke=""blue"" stroke-width=""3""/></svg>`, iconSize: [16, 16], iconAnchor: [8, 8] });
        pt.impactMarker = L.marker(impactLatLng, { icon: xIcon }).addTo(map);
    }
";

        int insertIndex = js.IndexOf("function updateTargetListUI()");
        if (insertIndex == -1) {
             Console.WriteLine("Could not find updateTargetListUI");
             return;
        }

        string newJs = js.Insert(insertIndex, newFunc + "\n");
        File.WriteAllText(path, newJs, new UTF8Encoding(false));
        Console.WriteLine("Injected updateTacticalList and drawArtilleryImpact.");
    }
}
