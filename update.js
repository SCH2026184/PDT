const fs = require('fs');
let content = fs.readFileSync('C:\\\\Users\\\\Diego Schroeder\\\\Desktop\\\\Antigravity\\\\PDE II\\\\script.js', 'utf8');

// 1. Add properties to const emp = {
content = content.replace('const emp = {', 'const emp = { telemetryTimeMs: window.getCurrentTelemetryTime ? window.getCurrentTelemetryTime() : 0, timeSyncEnabled: false, ');

// 2. Add the window.onTelemetryTimeUpdate logic before renderEmploymentList
const syncLogic = 
    window.onTelemetryTimeUpdate = (currentGlobalTimeMs) => {
        savedEmployments.forEach(emp => {
            if (emp.timeSyncEnabled) {
                if (currentGlobalTimeMs >= emp.telemetryTimeMs) {
                    if (emp.visible && !map.hasLayer(emp.layerGroup)) map.addLayer(emp.layerGroup);
                } else {
                    if (map.hasLayer(emp.layerGroup)) map.removeLayer(emp.layerGroup);
                }
            } else {
                if (emp.visible && !map.hasLayer(emp.layerGroup)) map.addLayer(emp.layerGroup);
                else if (!emp.visible && map.hasLayer(emp.layerGroup)) map.removeLayer(emp.layerGroup);
            }
        });
    };

    function renderEmploymentList() {;
content = content.replace('function renderEmploymentList() {', syncLogic);

// 3. Update renderEmploymentList to include the checkbox
const oldTimeLogic = const timeEl = document.createElement('span'); const empDate = new Date(emp.id); const timeStr = empDate.toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }); timeEl.textContent = timeStr;
            timeEl.style.cssText = "font-family: 'Oswald', 'Impact', 'Arial Narrow', sans-serif; font-weight: bold; color: #fff; font-size: 1.1rem; letter-spacing: 0.5px;";
            topRow.appendChild(nameEl); topRow.appendChild(timeEl);;

const newTimeLogic = const timeContainer = document.createElement('div');
            timeContainer.style.cssText = 'display: flex; flex-direction: column; align-items: flex-end;';
            const timeEl = document.createElement('span'); const empDate = new Date(emp.id); const timeStr = empDate.toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }); timeEl.textContent = timeStr;
            timeEl.style.cssText = "font-family: 'Oswald', 'Impact', 'Arial Narrow', sans-serif; font-weight: bold; color: #fff; font-size: 1.1rem; letter-spacing: 0.5px; line-height: 1;";
            timeContainer.appendChild(timeEl);
            
            const syncContainer = document.createElement('label');
            syncContainer.style.cssText = 'display: flex; align-items: center; gap: 4px; font-size: 0.65rem; color: #888; cursor: pointer; margin-top: 2px; line-height: 1;';
            const syncCheck = document.createElement('input');
            syncCheck.type = 'checkbox';
            syncCheck.checked = emp.timeSyncEnabled;
            syncCheck.style.cssText = 'width: 10px; height: 10px; margin: 0; accent-color: #00d2ff; cursor: pointer;';
            syncCheck.addEventListener('change', (e) => {
                emp.timeSyncEnabled = syncCheck.checked;
                if (window.onTelemetryTimeUpdate && window.getCurrentTelemetryTime) {
                    window.onTelemetryTimeUpdate(window.getCurrentTelemetryTime());
                }
            });
            syncContainer.appendChild(syncCheck);
            syncContainer.appendChild(document.createTextNode('SYNC TL'));
            timeContainer.appendChild(syncContainer);

            topRow.appendChild(nameEl); topRow.appendChild(timeContainer);;

content = content.replace(oldTimeLogic, newTimeLogic);

fs.writeFileSync('C:\\\\Users\\\\Diego Schroeder\\\\Desktop\\\\Antigravity\\\\PDE II\\\\script.js', content, 'utf8');
console.log('Script updated');
