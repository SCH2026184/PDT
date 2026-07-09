// --- SCENARIO DRAWING LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    window.tacticalPoints.scenario = window.tacticalPoints.scenario || [];
    const scenarioListContainer = document.getElementById('scenario-list');

    let scenarioDrawMode = null; // 'circle', 'line', 'square', 'polygon', 'freehand'
    let scenarioDrawingPoints = [];
    let scenarioTempLayer = null; // Visual preview
    let isDrawingFreehand = false;

    const scenarioBtn = document.getElementById('scenario-btn');
    const scenarioDropdown = document.getElementById('scenario-dropdown');
    const scenarioToolBtns = document.querySelectorAll('.scenario-tool-btn');

    // Toggle Dropdown
    if (scenarioBtn) {
        scenarioBtn.addEventListener('click', (e) => {
            const isVisible = scenarioDropdown.style.display === 'flex';
            scenarioDropdown.style.display = isVisible ? 'none' : 'flex';
            e.stopPropagation();
        });
    }

    // Close dropdown if clicked outside
    document.addEventListener('click', (e) => {
        if (scenarioBtn && !scenarioBtn.contains(e.target) && scenarioDropdown && !scenarioDropdown.contains(e.target)) {
            scenarioDropdown.style.display = 'none';
        }
    });

    // Tool Selection
    scenarioToolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tool = btn.getAttribute('data-tool');
            
            if (scenarioDrawMode === tool) {
                deactivateScenarioDrawing();
                return;
            }
            
            deactivateScenarioDrawing();
            
            scenarioDrawMode = tool;
            btn.classList.add('active');
            document.getElementById('map').style.cursor = 'crosshair';
            scenarioDropdown.style.display = 'none';
            
            if (tool === 'freehand' && window.map) {
                window.map.dragging.disable();
            }
            
            e.stopPropagation();
        });
    });

    function deactivateScenarioDrawing() {
        scenarioDrawMode = null;
        scenarioDrawingPoints = [];
        isDrawingFreehand = false;
        
        if (scenarioTempLayer && window.map) {
            window.map.removeLayer(scenarioTempLayer);
        }
        scenarioTempLayer = null;
        
        scenarioToolBtns.forEach(b => b.classList.remove('active'));
        
        if (window.map) {
            document.getElementById('map').style.cursor = '';
            window.map.dragging.enable();
        }
    }

    // Handle map Clicks / Mouse Moves
    if (window.map) {
        window.map.on('mousedown', (e) => {
            if (!scenarioDrawMode) return;
            
            if (scenarioDrawMode === 'freehand') {
                isDrawingFreehand = true;
                scenarioDrawingPoints = [e.latlng];
                scenarioTempLayer = L.polyline(scenarioDrawingPoints, {color: '#00d2ff', weight: 2}).addTo(window.map);
            } else if (scenarioDrawMode === 'text') {
                scenarioDrawingPoints = [e.latlng];
                finalizeScenarioObject();
            } else {
                scenarioDrawingPoints.push(e.latlng);
                updateScenarioPreview(null);
                
                // Auto-finalize for 2-point shapes
                if ((scenarioDrawMode === 'circle' || scenarioDrawMode === 'square' || scenarioDrawMode === 'line') && scenarioDrawingPoints.length === 2) {
                    finalizeScenarioObject();
                }
            }
        });
        
        window.map.on('mousemove', (e) => {
            if (!scenarioDrawMode) return;
            
            if (scenarioDrawMode === 'freehand') {
                if (isDrawingFreehand && scenarioTempLayer) {
                    scenarioDrawingPoints.push(e.latlng);
                    scenarioTempLayer.setLatLngs(scenarioDrawingPoints);
                }
            } else if (scenarioDrawingPoints.length > 0) {
                updateScenarioPreview(e.latlng);
            }
        });
        
        window.map.on('mouseup', (e) => {
            if (scenarioDrawMode === 'freehand' && isDrawingFreehand) {
                isDrawingFreehand = false;
                finalizeScenarioObject();
            }
        });

        window.map.on('dblclick', (e) => {
            if (scenarioDrawMode === 'polygon' && scenarioDrawingPoints.length >= 3) {
                // Remove the last double-clicked point because mousedown added it twice
                scenarioDrawingPoints.pop();
                finalizeScenarioObject();
            }
        });
    }

    function updateScenarioPreview(currentHoverPos = null) {
        if (scenarioTempLayer) {
            window.map.removeLayer(scenarioTempLayer);
            scenarioTempLayer = null;
        }
        
        if (scenarioDrawingPoints.length === 0) return;
        
        const style = { color: '#00d2ff', weight: 2, fillOpacity: 0.1 };
        
        if (scenarioDrawMode === 'circle' && scenarioDrawingPoints.length === 1 && currentHoverPos) {
            const radius = scenarioDrawingPoints[0].distanceTo(currentHoverPos);
            scenarioTempLayer = L.circle(scenarioDrawingPoints[0], { ...style, radius: radius }).addTo(window.map);
        } 
        else if (scenarioDrawMode === 'line') {
            const pts = [...scenarioDrawingPoints];
            if (currentHoverPos) pts.push(currentHoverPos);
            scenarioTempLayer = L.polyline(pts, style).addTo(window.map);
        }
        else if (scenarioDrawMode === 'square' && scenarioDrawingPoints.length === 1 && currentHoverPos) {
            const bounds = L.latLngBounds(scenarioDrawingPoints[0], currentHoverPos);
            scenarioTempLayer = L.rectangle(bounds, style).addTo(window.map);
        }
        else if (scenarioDrawMode === 'polygon') {
            const pts = [...scenarioDrawingPoints];
            if (currentHoverPos) pts.push(currentHoverPos);
            scenarioTempLayer = L.polygon(pts, style).addTo(window.map);
        }
    }

    // Finalize Drawing with Enter
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && scenarioDrawMode) {
            finalizeScenarioObject();
        }
        if (e.key === 'Escape' && scenarioDrawMode) {
            deactivateScenarioDrawing();
        }
    });

    function finalizeScenarioObject() {
        if (scenarioDrawingPoints.length === 0) {
            deactivateScenarioDrawing();
            return;
        }

        let finalLayer = null;
        const defaultStyle = { color: '#00d2ff', weight: 2, fillColor: '#00d2ff', fillOpacity: 0.2, fill: true };
        
        // Lines and freehand should not be filled by default since they aren't closed shapes usually
        if (scenarioDrawMode === 'line' || scenarioDrawMode === 'freehand') {
            defaultStyle.fill = false;
            defaultStyle.fillOpacity = 0;
        }

        let geoType = '';
        let geoData = null;

        if (scenarioDrawMode === 'circle' && scenarioDrawingPoints.length === 2) {
            const radius = scenarioDrawingPoints[0].distanceTo(scenarioDrawingPoints[1]);
            finalLayer = L.circle(scenarioDrawingPoints[0], { ...defaultStyle, radius: radius });
            geoType = 'circle';
            geoData = { center: [scenarioDrawingPoints[0].lat, scenarioDrawingPoints[0].lng], radius: radius };
        }
        else if (scenarioDrawMode === 'line' && scenarioDrawingPoints.length >= 2) {
            finalLayer = L.polyline(scenarioDrawingPoints, defaultStyle);
            geoType = 'line';
            geoData = { points: scenarioDrawingPoints.map(p => [p.lat, p.lng]) };
        }
        else if (scenarioDrawMode === 'square' && scenarioDrawingPoints.length === 2) {
            const bounds = L.latLngBounds(scenarioDrawingPoints[0], scenarioDrawingPoints[1]);
            finalLayer = L.rectangle(bounds, defaultStyle);
            geoType = 'square';
            geoData = { bounds: [[bounds.getSouthWest().lat, bounds.getSouthWest().lng], [bounds.getNorthEast().lat, bounds.getNorthEast().lng]] };
        }
        else if (scenarioDrawMode === 'polygon' && scenarioDrawingPoints.length >= 3) {
            finalLayer = L.polygon(scenarioDrawingPoints, defaultStyle);
            geoType = 'polygon';
            geoData = { points: scenarioDrawingPoints.map(p => [p.lat, p.lng]) };
        }
        else if (scenarioDrawMode === 'freehand' && scenarioDrawingPoints.length >= 2) {
            finalLayer = L.polyline(scenarioDrawingPoints, defaultStyle);
            geoType = 'freehand';
            geoData = { points: scenarioDrawingPoints.map(p => [p.lat, p.lng]) };
        }
        else if (scenarioDrawMode === 'text' && scenarioDrawingPoints.length === 1) {
            geoData = { center: [scenarioDrawingPoints[0].lat, scenarioDrawingPoints[0].lng] };
            geoType = 'text';
            defaultStyle.fill = false; // text defaults to floating without background box
            finalLayer = L.marker(scenarioDrawingPoints[0], {
                icon: L.divIcon({ className: '', html: '<div class="scenario-text-icon">Novo Texto</div>', iconAnchor: [0, 0] })
            });
        }

        if (finalLayer) {
            finalLayer.addTo(window.map);
            
            // Add to window.tacticalPoints
            const ptObj = {
                id: 'SCN-' + Math.random().toString(36).substr(2, 9),
                name: geoType === 'text' ? 'Texto' : 'Objeto ' + (window.tacticalPoints.scenario.length + 1),
                mode: 'scenario',
                type: geoType,
                geoData: geoData,
                layer: finalLayer,
                color: defaultStyle.color,
                fill: defaultStyle.fill,
                fillColor: defaultStyle.fillColor,
                fillOpacity: defaultStyle.fillOpacity,
                visible: true
            };
            
            if (geoType === 'text') {
                ptObj.textContent = "Novo Texto";
                ptObj.fontSize = 16;
                if (typeof window.updateScenarioTextIcon === 'function') window.updateScenarioTextIcon(ptObj);
            }
            
            if (typeof window.bindScenarioEditPopup === 'function') {
                window.bindScenarioEditPopup(ptObj);
            }
            window.tacticalPoints.scenario.push(ptObj);
            window.renderScenarioList();
            
            if (geoType === 'text') {
                setTimeout(() => { ptObj.layer.fire('dblclick', {latlng: ptObj.layer.getLatLng()}); }, 100);
            }
        }
        
        deactivateScenarioDrawing();
    }

    window.updateScenarioTextIcon = function(pt) {
        if (!pt || pt.type !== 'text' || !pt.layer) return;
        
        const txt = pt.textContent || 'Novo Texto';
        const fs = pt.fontSize || 16;
        const color = pt.color || '#00d2ff';
        const fillC = pt.fillColor || color;
        
        let styleStr = `color: ${color}; font-size: ${fs}px; transform: rotate(${pt.rotation || 0}deg); transform-origin: top left; white-space: nowrap;`;
        if (pt.fill) {
            // Apply background box styling
            styleStr += ` background: ${fillC}; border: 2px solid ${color}; padding: 4px 8px; opacity: ${pt.fillOpacity !== undefined ? pt.fillOpacity : 1};`;
        } else {
            // Floating text styling
            styleStr += ` text-shadow: 1px 1px 3px rgba(0,0,0,0.8), -1px -1px 3px rgba(0,0,0,0.8);`;
        }
        
        const iconHtml = `<div class="scenario-text-icon" style="${styleStr}">${txt}</div>`;
        pt.layer.setIcon(L.divIcon({
            className: '', // Prevents leaflet default icon class
            html: iconHtml,
            iconAnchor: [0, 0] // Anchor at top-left
        }));
    };

    let scenarioEditPanel = null;
    window.cleanupScenarioEdit = null;

    function getOrCreateScenarioEditPanel() {
        if (!scenarioEditPanel) {
            scenarioEditPanel = document.createElement('div');
            scenarioEditPanel.id = 'scenario-floating-edit-panel';
            scenarioEditPanel.style.cssText = "display: none; position: absolute; top: 70px; right: 20px; width: 220px; background: rgba(10, 15, 30, 0.95); backdrop-filter: blur(12px); border: 1px solid rgba(0, 210, 255, 0.45); border-radius: 8px; padding: 12px; z-index: 2000; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6); font-family: 'Inter', sans-serif; color: white;";
            
            const closeBtn = document.createElement('div');
            closeBtn.innerHTML = '&times;';
            closeBtn.style.cssText = "position: absolute; top: 4px; right: 8px; cursor: pointer; font-size: 1.4rem; color: #00d2ff; line-height: 1;";
            closeBtn.onclick = () => window.closeScenarioEditPanel();
            scenarioEditPanel.appendChild(closeBtn);
            
            const contentDiv = document.createElement('div');
            contentDiv.id = 'scenario-floating-content';
            contentDiv.style.cssText = "display: flex; flex-direction: column; gap: 10px; margin-top: 15px;";
            scenarioEditPanel.appendChild(contentDiv);
            
            document.getElementById('map-container').appendChild(scenarioEditPanel);
        }
        return scenarioEditPanel;
    }

    window.closeScenarioEditPanel = function() {
        if (scenarioEditPanel) scenarioEditPanel.style.display = 'none';
        if (typeof window.cleanupScenarioEdit === 'function') {
            window.cleanupScenarioEdit();
            window.cleanupScenarioEdit = null;
        }
    };

    window.bindScenarioEditPopup = function(pt) {
        if (!pt || !pt.layer) return;
        
        pt.layer.on('dblclick', function(e) {
            L.DomEvent.stopPropagation(e);
            window.closeScenarioEditPanel(); // Clean up previous edit session
            
            const popupContainer = document.createElement('div');
            popupContainer.style.cssText = "display: flex; flex-direction: column; gap: 10px; min-width: 180px; font-family: 'Inter', sans-serif;";

            const titleInput = document.createElement('input');
            titleInput.type = 'text';
            titleInput.value = pt.name;
            titleInput.style.cssText = "background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; padding: 4px; border-radius: 4px; font-weight: bold; width: 100%; box-sizing: border-box;";
            titleInput.addEventListener('input', (ev) => {
                pt.name = ev.target.value;
                if (window.renderScenarioList) window.renderScenarioList();
            });

            const isLine = (pt.type === 'line' || pt.type === 'freehand');
            const isText = (pt.type === 'text');

            if (isText) {
                const textContentRow = document.createElement('div');
                textContentRow.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
                textContentRow.innerHTML = `<span style="font-size: 0.8rem; color: #ccc;">Texto:</span>`;
                const textContentArea = document.createElement('textarea');
                textContentArea.value = pt.textContent || '';
                textContentArea.style.cssText = "background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; padding: 4px; border-radius: 4px; font-size: 0.85rem; resize: vertical; min-height: 40px;";
                textContentArea.addEventListener('input', (ev) => {
                    pt.textContent = ev.target.value;
                    window.updateScenarioTextIcon(pt);
                });
                textContentRow.appendChild(textContentArea);
                popupContainer.appendChild(textContentRow);

                const fontSizeRow = document.createElement('div');
                fontSizeRow.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
                fontSizeRow.innerHTML = `<span style="font-size: 0.8rem; color: #ccc;">Tamanho da Fonte:</span>`;
                const fontSizeSlider = document.createElement('input');
                fontSizeSlider.type = 'range';
                fontSizeSlider.min = '8';
                fontSizeSlider.max = '72';
                fontSizeSlider.step = '1';
                fontSizeSlider.value = pt.fontSize || 16;
                fontSizeSlider.style.accentColor = "#00d2ff";
                fontSizeSlider.addEventListener('input', (ev) => {
                    pt.fontSize = parseInt(ev.target.value);
                    window.updateScenarioTextIcon(pt);
                });
                fontSizeRow.appendChild(fontSizeSlider);
                popupContainer.appendChild(fontSizeRow);
            }

            const borderRow = document.createElement('div');
            borderRow.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
            borderRow.innerHTML = `<span style="font-size: 0.8rem; color: #ccc;">${isText ? 'Cor do Texto:' : 'Cor da Borda:'}</span>`;
            const borderColorInput = document.createElement('input');
            borderColorInput.type = 'color';
            borderColorInput.value = pt.color || '#00d2ff';
            borderColorInput.style.cssText = "cursor: pointer; width: 30px; height: 20px; padding: 0; border: none;";
            borderColorInput.addEventListener('input', (ev) => {
                pt.color = ev.target.value;
                if (isText) window.updateScenarioTextIcon(pt);
                else pt.layer.setStyle({ color: pt.color });
            });
            borderRow.appendChild(borderColorInput);

            popupContainer.appendChild(titleInput);

            const coordRow = document.createElement('div');
            coordRow.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
            coordRow.innerHTML = `<span style="font-size: 0.8rem; color: #ccc;">Coordenada:</span>`;
            const coordInput = document.createElement('input');
            coordInput.type = 'text';
            
            let centerLat = 0, centerLng = 0;
            if (pt.layer.getBounds && pt.type !== 'line' && pt.type !== 'freehand') {
                const center = pt.layer.getBounds().getCenter();
                centerLat = center.lat; centerLng = center.lng;
            } else if (pt.layer.getLatLng) {
                const latlng = pt.layer.getLatLng();
                centerLat = latlng.lat; centerLng = latlng.lng;
            } else if (pt.geoData && pt.geoData.points && pt.geoData.points.length > 0) {
                const center = pt.layer.getBounds ? pt.layer.getBounds().getCenter() : {lat: pt.geoData.points[0][0], lng: pt.geoData.points[0][1]};
                centerLat = center.lat; centerLng = center.lng;
            }
            
            coordInput.value = (typeof window.formatCoords === 'function') ? window.formatCoords(centerLat, centerLng) : `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`;
            coordInput.style.cssText = "background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; padding: 4px; border-radius: 4px; font-family: monospace; width: 100%; box-sizing: border-box; font-size: 0.85rem;";
            
            const formatSelect = document.getElementById('coord-format');
            const formatListener = () => {
                coordInput.value = (typeof window.formatCoords === 'function') ? window.formatCoords(centerLat, centerLng) : `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`;
            };
            
            coordInput.addEventListener('change', (ev) => {
                if (typeof window.parseInputCoords === 'function') {
                    const newCoords = window.parseInputCoords(ev.target.value);
                    if (newCoords) {
                        const dLat = newCoords.lat - centerLat;
                        const dLng = newCoords.lng - centerLng;
                        
                        if (pt.type === 'circle') {
                            pt.geoData.center = [newCoords.lat, newCoords.lng];
                            pt.layer.setLatLng(newCoords);
                        } else if (pt.type === 'text') {
                            pt.geoData.center = [newCoords.lat, newCoords.lng];
                            pt.layer.setLatLng(newCoords);
                        } else if (pt.type === 'line' || pt.type === 'freehand' || pt.type === 'polygon') {
                            const newPoints = pt.geoData.points.map(p => [p[0] + dLat, p[1] + dLng]);
                            pt.geoData.points = newPoints;
                            pt.layer.setLatLngs(newPoints);
                        } else if (pt.type === 'square') {
                            const newBounds = pt.geoData.bounds.map(p => [p[0] + dLat, p[1] + dLng]);
                            pt.geoData.bounds = newBounds;
                            pt.layer.setBounds(newBounds);
                        }
                        
                        centerLat = newCoords.lat;
                        centerLng = newCoords.lng;
                        ev.target.value = window.formatCoords(centerLat, centerLng);
                        
                        // Sync handles if they exist
                        rebuildHandles();
                    } else {
                        ev.target.value = window.formatCoords(centerLat, centerLng);
                    }
                }
            });
            coordRow.appendChild(coordInput);
            popupContainer.appendChild(coordRow);

            popupContainer.appendChild(borderRow);

            if (!isLine) {
                const fillRow = document.createElement('div');
                fillRow.style.cssText = "display: flex; justify-content: space-between; align-items: center;";
                fillRow.innerHTML = `<span style="font-size: 0.8rem; color: #ccc;">Fundo:</span>`;
                const fillToggle = document.createElement('input');
                fillToggle.type = 'checkbox';
                fillToggle.checked = pt.fill !== false;
                fillToggle.style.cssText = "cursor: pointer; accent-color: #00d2ff; margin:0;";
                
                const fillColorInput = document.createElement('input');
                fillColorInput.type = 'color';
                fillColorInput.value = pt.fillColor || pt.color || '#00d2ff';
                fillColorInput.style.cssText = "cursor: pointer; width: 30px; height: 20px; padding: 0; border: none;";
                fillColorInput.disabled = !fillToggle.checked;
                fillColorInput.style.opacity = fillToggle.checked ? "1" : "0.3";

                fillToggle.addEventListener('change', () => {
                    pt.fill = fillToggle.checked;
                    fillColorInput.disabled = !pt.fill;
                    fillColorInput.style.opacity = pt.fill ? "1" : "0.3";
                    if (isText) window.updateScenarioTextIcon(pt);
                    else pt.layer.setStyle({ fill: pt.fill, fillColor: pt.fillColor || pt.color });
                });
                fillColorInput.addEventListener('input', (ev) => {
                    pt.fillColor = ev.target.value;
                    if (isText) window.updateScenarioTextIcon(pt);
                    else pt.layer.setStyle({ fillColor: pt.fillColor });
                });

                const fillControls = document.createElement('div');
                fillControls.style.display = "flex";
                fillControls.style.alignItems = "center";
                fillControls.style.gap = "8px";
                fillControls.appendChild(fillToggle);
                fillControls.appendChild(fillColorInput);
                fillRow.appendChild(fillControls);

                const opacityRow = document.createElement('div');
                opacityRow.style.cssText = "display: flex; flex-direction: column; gap: 4px; margin-top: 4px;";
                opacityRow.innerHTML = `<span style="font-size: 0.8rem; color: #ccc;">Contraste:</span>`;
                const opacitySlider = document.createElement('input');
                opacitySlider.type = 'range';
                opacitySlider.min = '0';
                opacitySlider.max = '1';
                opacitySlider.step = '0.05';
                opacitySlider.value = pt.fillOpacity !== undefined ? pt.fillOpacity : 0.2;
                opacitySlider.style.accentColor = "#00d2ff";
                opacitySlider.addEventListener('input', (ev) => {
                    pt.fillOpacity = parseFloat(ev.target.value);
                    if (isText) window.updateScenarioTextIcon(pt);
                    else pt.layer.setStyle({ fillOpacity: pt.fillOpacity });
                });
                opacityRow.appendChild(opacitySlider);

                popupContainer.appendChild(fillRow);
                popupContainer.appendChild(opacityRow);
            }


            if (pt.type === 'circle') {
                const radiusRow = document.createElement('div');
                radiusRow.style.cssText = "display: flex; flex-direction: column; gap: 4px;";
                radiusRow.innerHTML = `<span style="font-size: 0.8rem; color: #ccc;">Raio:</span>`;
                
                const radiusGroup = document.createElement('div');
                radiusGroup.style.cssText = "display: flex; gap: 4px;";
                
                const radiusInput = document.createElement('input');
                radiusInput.type = 'number';
                radiusInput.style.cssText = "background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; padding: 4px; border-radius: 4px; flex-grow: 1; width: 60px;";
                
                const unitSelect = document.createElement('select');
                unitSelect.style.cssText = "background: rgba(0,0,0,0.3); border: 1px solid #444; color: #fff; border-radius: 4px; padding: 4px;";
                const opts = ['m', 'ft', 'NM'];
                opts.forEach(u => {
                    const o = document.createElement('option');
                    o.value = u;
                    o.textContent = u;
                    unitSelect.appendChild(o);
                });
                
                let currentUnit = 'm';
                const updateRadiusDisplay = () => {
                    const rMeters = pt.geoData.radius;
                    let val = rMeters;
                    if (currentUnit === 'ft') val = rMeters * 3.28084;
                    else if (currentUnit === 'NM') val = rMeters / 1852;
                    radiusInput.value = val.toFixed(2);
                };
                
                popupContainer._updateRadiusDisplay = updateRadiusDisplay;
                updateRadiusDisplay();
                
                unitSelect.addEventListener('change', (ev) => {
                    currentUnit = ev.target.value;
                    updateRadiusDisplay();
                });
                
                radiusInput.addEventListener('change', (ev) => {
                    let val = parseFloat(ev.target.value);
                    if (isNaN(val) || val <= 0) { updateRadiusDisplay(); return; }
                    let rMeters = val;
                    if (currentUnit === 'ft') rMeters = val / 3.28084;
                    else if (currentUnit === 'NM') rMeters = val * 1852;
                    
                    pt.geoData.radius = rMeters;
                    pt.layer.setRadius(rMeters);
                    if (popupContainer._updateRadiusHandle) popupContainer._updateRadiusHandle();
                });
                
                radiusGroup.appendChild(radiusInput);
                radiusGroup.appendChild(unitSelect);
                radiusRow.appendChild(radiusGroup);
                popupContainer.appendChild(radiusRow);
            }

            const panel = getOrCreateScenarioEditPanel();
            const contentDiv = panel.querySelector('#scenario-floating-content');
            contentDiv.innerHTML = '';
            contentDiv.appendChild(popupContainer);
            panel.style.display = 'block';

            // --- DRAG HANDLES LOGIC ---
            let dragHandles = [];
            let vertexHandles = [];
            let centerHandle = null;
            
            const createHandle = (latlng, onDrag) => {
                const handle = L.marker(latlng, {
                    draggable: true,
                    icon: L.divIcon({
                        className: 'scenario-drag-handle',
                        html: `<div style="width: 12px; height: 12px; background: #00d2ff; border: 2px solid #000; border-radius: 50%; box-shadow: 0 0 5px #000; cursor: move; transform: translate(-1px, -1px);"></div>`,
                        iconSize: [12, 12],
                        iconAnchor: [6, 6]
                    })
                }).addTo(window.map);
                handle.on('drag', onDrag);
                dragHandles.push(handle);
                return handle;
            };

            const createCenterHandle = (latlng, onDrag) => {
                const handle = L.marker(latlng, {
                    draggable: true,
                    icon: L.divIcon({
                        className: 'scenario-drag-handle-center',
                        html: `<div style="width: 14px; height: 14px; background: #ffaa00; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 5px #000; cursor: move; transform: translate(-2px, -2px);"></div>`,
                        iconSize: [14, 14],
                        iconAnchor: [7, 7]
                    })
                }).addTo(window.map);
                handle.on('drag', onDrag);
                dragHandles.push(handle);
                centerHandle = handle;
                return handle;
            };

            let rotateHandleMarker = null;
            let rotateBaselinePoints = null;

            const clearHandles = () => {
                dragHandles.forEach(h => window.map.removeLayer(h));
                dragHandles = [];
                vertexHandles = [];
                centerHandle = null;
                if (rotateHandleMarker) { window.map.removeLayer(rotateHandleMarker); rotateHandleMarker = null; }
            };
            
            const createRotateHandle = (centerLatLng) => {
                if (pt.type === 'circle' || pt.type === 'freehand') return;
                
                const cPt = window.map.project(centerLatLng, window.map.getZoom());
                const rPt = L.point(cPt.x, cPt.y - 50);
                const initialRotateLatLng = window.map.unproject(rPt, window.map.getZoom());
                
                rotateHandleMarker = L.marker(initialRotateLatLng, {
                    draggable: true,
                    icon: L.divIcon({
                        className: 'scenario-drag-handle-rotate',
                        html: `<div style="width: 14px; height: 14px; background: #b000ff; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 0 5px #000; cursor: grab; transform: translate(-2px, -2px); display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-rotate" style="font-size: 8px; color: white;"></i></div>`,
                        iconSize: [14, 14],
                        iconAnchor: [7, 7]
                    })
                }).addTo(window.map);
                
                let startAngle = 0;
                let originalCenterPt = null;
                
                rotateHandleMarker.on('dragstart', (ev) => {
                    if (pt.type === 'polygon' || pt.type === 'line') {
                        rotateBaselinePoints = JSON.parse(JSON.stringify(pt.geoData.points));
                    } else if (pt.type === 'square') {
                        const b = pt.geoData.bounds;
                        const sw = b[0]; const ne = b[1];
                        const nw = [ne[0], sw[1]];
                        const se = [sw[0], ne[1]];
                        pt.type = 'polygon';
                        pt.geoData.points = [sw, nw, ne, se];
                        rotateBaselinePoints = JSON.parse(JSON.stringify(pt.geoData.points));
                        
                        window.map.removeLayer(pt.layer);
                        pt.layer = L.polygon(pt.geoData.points, {
                            color: pt.color || '#00d2ff', fill: pt.fill, fillColor: pt.fillColor || pt.color, fillOpacity: pt.fillOpacity || 0.2
                        }).addTo(window.map);
                        window.bindScenarioEditPopup(pt);
                    } else if (pt.type === 'text') {
                        rotateBaselinePoints = pt.rotation || 0;
                    }
                    originalCenterPt = window.map.project(centerHandle ? centerHandle.getLatLng() : centerLatLng, 20);
                    const startEvPt = window.map.project(ev.target.getLatLng(), 20);
                    startAngle = Math.atan2(startEvPt.y - originalCenterPt.y, startEvPt.x - originalCenterPt.x);
                });
                
                rotateHandleMarker.on('drag', (ev) => {
                    const currentEvPt = window.map.project(ev.target.getLatLng(), 20);
                    const currentAngle = Math.atan2(currentEvPt.y - originalCenterPt.y, currentEvPt.x - originalCenterPt.x);
                    let deltaRad = currentAngle - startAngle;
                    
                    if (pt.type === 'text') {
                        const deltaDeg = deltaRad * 180 / Math.PI;
                        pt.rotation = ((rotateBaselinePoints || 0) + deltaDeg) % 360;
                        window.updateScenarioTextIcon(pt);
                    } else if (pt.type === 'polygon' || pt.type === 'line') {
                        const newPoints = rotateBaselinePoints.map(p => {
                            const pr = window.map.project([p[0], p[1]], 20);
                            const dx = pr.x - originalCenterPt.x;
                            const dy = pr.y - originalCenterPt.y;
                            const nx = originalCenterPt.x + dx * Math.cos(deltaRad) - dy * Math.sin(deltaRad);
                            const ny = originalCenterPt.y + dx * Math.sin(deltaRad) + dy * Math.cos(deltaRad);
                            const nll = window.map.unproject(L.point(nx, ny), 20);
                            return [nll.lat, nll.lng];
                        });
                        pt.geoData.points = newPoints;
                        pt.layer.setLatLngs(newPoints);
                        
                        if (vertexHandles && vertexHandles.length === newPoints.length) {
                            vertexHandles.forEach((vh, idx) => {
                                vh.setLatLng(newPoints[idx]);
                            });
                        }
                    }
                });
                
                rotateHandleMarker.on('dragend', () => {
                    if (pt.type === 'polygon') {
                        setTimeout(() => { pt.layer.fire('dblclick', {latlng: centerHandle ? centerHandle.getLatLng() : centerLatLng}); }, 50);
                    }
                });
            };

            const rebuildHandles = () => {
                clearHandles();
                if (pt.type === 'freehand') return; // Do not edit freehand vertices
                
                if (pt.type === 'polygon' || pt.type === 'line') {
                    if (pt.geoData.points.length > 0) {
                        const bounds = pt.layer.getBounds ? pt.layer.getBounds() : L.latLngBounds(pt.geoData.points);
                        const center = bounds.getCenter();
                        let lastPos = center;
                        createCenterHandle(center, (ev) => {
                            const newPos = ev.target.getLatLng();
                            const dLat = newPos.lat - lastPos.lat;
                            const dLng = newPos.lng - lastPos.lng;
                            pt.geoData.points = pt.geoData.points.map(p => [p[0] + dLat, p[1] + dLng]);
                            pt.layer.setLatLngs(pt.geoData.points);
                            lastPos = newPos;
                            updateCoordField();
                            vertexHandles.forEach((vh, idx) => {
                                vh.setLatLng(pt.geoData.points[idx]);
                            });
                            if (rotateHandleMarker) {
                                const currCenter = ev.target.getLatLng();
                                const cPt = window.map.project(currCenter, window.map.getZoom());
                                const rPt = L.point(cPt.x, cPt.y - 50);
                                const newRot = window.map.unproject(rPt, window.map.getZoom());
                                rotateHandleMarker.setLatLng(newRot);
                            }
                        });
                        createRotateHandle(center);
                    }
                    
                    pt.geoData.points.forEach((p, idx) => {
                        const vh = createHandle([p[0], p[1]], (ev) => {
                            const newPos = ev.target.getLatLng();
                            pt.geoData.points[idx] = [newPos.lat, newPos.lng];
                            pt.layer.setLatLngs(pt.geoData.points);
                            updateCoordField();
                            if (centerHandle && pt.layer.getBounds) centerHandle.setLatLng(pt.layer.getBounds().getCenter());
                        });
                        vertexHandles.push(vh);
                    });
                } else if (pt.type === 'square') {
                    const bounds = pt.geoData.bounds;
                    const sw = [bounds[0][0], bounds[0][1]];
                    const ne = [bounds[1][0], bounds[1][1]];
                    const nw = [ne[0], sw[1]];
                    const se = [sw[0], ne[1]];
                    
                    const center = L.latLngBounds(sw, ne).getCenter();
                    let lastPos = center;
                    createCenterHandle(center, (ev) => {
                        const newPos = ev.target.getLatLng();
                        const dLat = newPos.lat - lastPos.lat;
                        const dLng = newPos.lng - lastPos.lng;
                        sw[0] += dLat; sw[1] += dLng;
                        ne[0] += dLat; ne[1] += dLng;
                        nw[0] += dLat; nw[1] += dLng;
                        se[0] += dLat; se[1] += dLng;
                        
                        const newBounds = L.latLngBounds(sw, ne);
                        pt.geoData.bounds = [[sw[0], sw[1]], [ne[0], ne[1]]];
                        pt.layer.setBounds(newBounds);
                        lastPos = newPos;
                        updateCoordField();
                        
                        vertexHandles[0].setLatLng(sw);
                        vertexHandles[1].setLatLng(ne);
                        vertexHandles[2].setLatLng(nw);
                        vertexHandles[3].setLatLng(se);
                        if (rotateHandleMarker) {
                            const currCenter = ev.target.getLatLng();
                            const cPt = window.map.project(currCenter, window.map.getZoom());
                            const rPt = L.point(cPt.x, cPt.y - 50);
                            const newRot = window.map.unproject(rPt, window.map.getZoom());
                            rotateHandleMarker.setLatLng(newRot);
                        }
                    });
                    createRotateHandle(center);
                    
                    const updateSquare = (p1, p2) => {
                        const newBounds = L.latLngBounds(p1, p2);
                        pt.geoData.bounds = [[newBounds.getSouthWest().lat, newBounds.getSouthWest().lng], [newBounds.getNorthEast().lat, newBounds.getNorthEast().lng]];
                        pt.layer.setBounds(newBounds);
                        updateCoordField();
                        
                        sw[0] = newBounds.getSouthWest().lat; sw[1] = newBounds.getSouthWest().lng;
                        ne[0] = newBounds.getNorthEast().lat; ne[1] = newBounds.getNorthEast().lng;
                        nw[0] = ne[0]; nw[1] = sw[1];
                        se[0] = sw[0]; se[1] = ne[1];
                        
                        vertexHandles[0].setLatLng(sw);
                        vertexHandles[1].setLatLng(ne);
                        vertexHandles[2].setLatLng(nw);
                        vertexHandles[3].setLatLng(se);
                        if (centerHandle) centerHandle.setLatLng(newBounds.getCenter());
                    };
                    
                    vertexHandles.push(createHandle(sw, (ev) => updateSquare(ev.target.getLatLng(), ne)));
                    vertexHandles.push(createHandle(ne, (ev) => updateSquare(sw, ev.target.getLatLng())));
                    vertexHandles.push(createHandle(nw, (ev) => updateSquare(ev.target.getLatLng(), se)));
                    vertexHandles.push(createHandle(se, (ev) => updateSquare(nw, ev.target.getLatLng())));
                } else if (pt.type === 'circle') {
                    const cLat = pt.geoData.center[0];
                    const cLng = pt.geoData.center[1];
                    const radius = pt.geoData.radius;
                    
                    let lastPos = L.latLng(cLat, cLng);
                    createCenterHandle(lastPos, (ev) => {
                        const newPos = ev.target.getLatLng();
                        pt.geoData.center = [newPos.lat, newPos.lng];
                        pt.layer.setLatLng(newPos);
                        lastPos = newPos;
                        updateCoordField();
                        if (popupContainer._updateRadiusHandle) popupContainer._updateRadiusHandle();
                    });
                    
                    let radiusHandle = null;
                    popupContainer._updateRadiusHandle = () => {
                        if (!radiusHandle) return;
                        const currCenter = pt.layer.getLatLng();
                        const rLng = currCenter.lng + (pt.geoData.radius / 111320) / Math.cos(currCenter.lat * Math.PI / 180);
                        radiusHandle.setLatLng([currCenter.lat, rLng]);
                    };
                    
                    const rLng = cLng + (radius / 111320) / Math.cos(cLat * Math.PI / 180);
                    radiusHandle = createHandle([cLat, rLng], (ev) => {
                        const newPos = ev.target.getLatLng();
                        const newRadius = window.map.distance(pt.layer.getLatLng(), newPos);
                        pt.geoData.radius = newRadius;
                        pt.layer.setRadius(newRadius);
                        if (popupContainer._updateRadiusDisplay) popupContainer._updateRadiusDisplay();
                    });
                } else if (pt.type === 'text') {
                    // Central anchor handle for text
                    createCenterHandle(pt.geoData.center, (ev) => {
                        const newPos = ev.target.getLatLng();
                        pt.geoData.center = [newPos.lat, newPos.lng];
                        pt.layer.setLatLng(newPos);
                        updateCoordField();
                        if (rotateHandleMarker) {
                            const cPt = window.map.project(newPos, window.map.getZoom());
                            const rPt = L.point(cPt.x, cPt.y - 50);
                            const newRot = window.map.unproject(rPt, window.map.getZoom());
                            rotateHandleMarker.setLatLng(newRot);
                        }
                    });
                    createRotateHandle(pt.geoData.center);
                }
            };
            
            const updateCoordField = () => {
                let clat = 0, clng = 0;
                if (pt.layer.getBounds && pt.type !== 'line' && pt.type !== 'freehand') {
                    const center = pt.layer.getBounds().getCenter();
                    clat = center.lat; clng = center.lng;
                } else if (pt.layer.getLatLng) {
                    const latlng = pt.layer.getLatLng();
                    clat = latlng.lat; clng = latlng.lng;
                } else if (pt.geoData && pt.geoData.points && pt.geoData.points.length > 0) {
                    const center = pt.layer.getBounds ? pt.layer.getBounds().getCenter() : {lat: pt.geoData.points[0][0], lng: pt.geoData.points[0][1]};
                    clat = center.lat; clng = center.lng;
                }
                centerLat = clat;
                centerLng = clng;
                coordInput.value = (typeof window.formatCoords === 'function') ? window.formatCoords(centerLat, centerLng) : `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`;
            };

            rebuildHandles();

            if (formatSelect) {
                formatSelect.addEventListener('change', formatListener);
            }

            window.cleanupScenarioEdit = () => {
                if (formatSelect) {
                    formatSelect.removeEventListener('change', formatListener);
                }
                clearHandles();
            };
        });
    }

    window.renderScenarioList = function() {
        const listContainer = document.getElementById('scenario-list');
        if (!listContainer) return;
        listContainer.innerHTML = '';
        
        if(!window.tacticalPoints.scenario) return;

        window.tacticalPoints.scenario.forEach((pt, index) => {
            const item = document.createElement('div');
            item.style.cssText = "background: #18181a; border: 1px solid #2a2a2d; border-radius: 6px; padding: 6px 10px; margin-bottom: 6px; display: flex; flex-direction: column;";
            
            const topRow = document.createElement('div');
            topRow.style.cssText = "display: flex; align-items: center; justify-content: space-between; width: 100%;";
            
            const leftCol = document.createElement('div');
            leftCol.style.cssText = "display: flex; align-items: center; gap: 8px;";
            
            const toggle = document.createElement('input'); 
            toggle.type = 'checkbox'; 
            toggle.checked = pt.visible !== false;
            toggle.style.cssText = 'width: 16px; height: 16px; cursor: pointer; accent-color: #007bff;';
            toggle.title = "Mostrar/Ocultar";
            toggle.addEventListener('change', () => { 
                pt.visible = toggle.checked; 
                if (pt.layer && window.map) {
                    if (pt.visible) window.map.addLayer(pt.layer);
                    else window.map.removeLayer(pt.layer);
                }
            });

            const titleSpan = document.createElement('span');
            titleSpan.innerHTML = `<i class="fa-solid fa-shapes"></i> ` + pt.name;
            titleSpan.style.cssText = "font-weight: bold; font-size: 0.9rem; color: #e2e8f0; max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;";
            
            leftCol.appendChild(toggle);
            leftCol.appendChild(titleSpan);
            
            const rightCol = document.createElement('div');
            rightCol.style.cssText = "display: flex; gap: 4px;";
            
            const centerBtn = document.createElement('button');
            centerBtn.className = 'action-btn-small';
            centerBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
            centerBtn.title = 'Centralizar';
            centerBtn.onclick = () => {
                if (pt.layer && pt.visible !== false) {
                    if (pt.layer.getBounds) window.map.fitBounds(pt.layer.getBounds());
                    else if (pt.layer.getLatLng) window.map.setView(pt.layer.getLatLng(), 16);
                }
            };
            
            const delBtn = document.createElement('button');
            delBtn.className = 'action-btn-small delete';
            delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            delBtn.title = 'Remover';
            delBtn.onclick = () => {
                if (pt.layer && window.map) window.map.removeLayer(pt.layer);
                window.tacticalPoints.scenario.splice(index, 1);
                window.renderScenarioList();
            };
            
            rightCol.appendChild(centerBtn);
            rightCol.appendChild(delBtn);
            
            topRow.appendChild(leftCol);
            topRow.appendChild(rightCol);
            item.appendChild(topRow);

            if (pt.type === 'square' && pt.geoData && pt.geoData.bounds) {
                const sqInfo = document.createElement('div');
                sqInfo.style.cssText = 'display:flex; flex-direction:column; gap:6px; margin-top:8px; width:100%; padding-top:8px; border-top:1px solid #2a2a2d;';
                
                let s = pt.geoData.bounds[0][0];
                let w = pt.geoData.bounds[0][1];
                let n = pt.geoData.bounds[1][0];
                let e = pt.geoData.bounds[1][1];

                const createCornerDiv = (labelText, fullText, lat, lng) => {
                    const div = document.createElement('div');
                    div.style.cssText = 'display:flex; align-items:center; gap:6px;';
                    div.innerHTML = `<span style="font-size:0.65rem; font-weight:bold; color:#a0a0a0; min-width:25px;" title="${fullText}">${labelText}:</span>`;
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = window.formatCoords ? window.formatCoords(lat, lng) : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                    input.style.cssText = 'flex:1; font-size:0.7rem; padding:4px; background:rgba(0,0,0,0.5); color:white; border:1px solid #00d2ff; border-radius:4px; width:100%;';
                    div.appendChild(input);
                    return { div, input };
                };

                const seCorner = createCornerDiv('SE', 'Superior Esquerda', n, w);
                const sdCorner = createCornerDiv('SD', 'Superior Direita', n, e);
                const ieCorner = createCornerDiv('IE', 'Inferior Esquerda', s, w);
                const idCorner = createCornerDiv('ID', 'Inferior Direita', s, e);

                const updateSquareList = (changedCorner, inputEl) => {
                    const latLng = window.parseCoordsToLatLng ? window.parseCoordsToLatLng(inputEl.value) : null;
                    if (!latLng) {
                        inputEl.style.borderColor = 'red';
                        return;
                    }
                    inputEl.style.borderColor = '#00d2ff';
                    
                    if (changedCorner === 'SE') { n = latLng.lat; w = latLng.lng; }
                    else if (changedCorner === 'SD') { n = latLng.lat; e = latLng.lng; }
                    else if (changedCorner === 'IE') { s = latLng.lat; w = latLng.lng; }
                    else if (changedCorner === 'ID') { s = latLng.lat; e = latLng.lng; }

                    const minLat = Math.min(s, n);
                    const maxLat = Math.max(s, n);
                    const minLng = Math.min(w, e);
                    const maxLng = Math.max(w, e);
                    s = minLat; n = maxLat; w = minLng; e = maxLng;

                    pt.geoData.bounds = [[s, w], [n, e]];
                    
                    seCorner.input.value = window.formatCoords ? window.formatCoords(n, w) : `${n.toFixed(5)}, ${w.toFixed(5)}`;
                    sdCorner.input.value = window.formatCoords ? window.formatCoords(n, e) : `${n.toFixed(5)}, ${e.toFixed(5)}`;
                    ieCorner.input.value = window.formatCoords ? window.formatCoords(s, w) : `${s.toFixed(5)}, ${w.toFixed(5)}`;
                    idCorner.input.value = window.formatCoords ? window.formatCoords(s, e) : `${s.toFixed(5)}, ${e.toFixed(5)}`;
                    
                    const newBounds = L.latLngBounds([s, w], [n, e]);
                    if (pt.layer && window.map) {
                        pt.layer.setBounds(newBounds);
                        // Also update handles if they exist and match this point
                        if (window._updateSquareHandles && window._currentEditPt === pt) {
                            window._updateSquareHandles(newBounds);
                        }
                    }
                };

                seCorner.input.addEventListener('change', () => updateSquareList('SE', seCorner.input));
                sdCorner.input.addEventListener('change', () => updateSquareList('SD', sdCorner.input));
                ieCorner.input.addEventListener('change', () => updateSquareList('IE', ieCorner.input));
                idCorner.input.addEventListener('change', () => updateSquareList('ID', idCorner.input));

                sqInfo.appendChild(seCorner.div);
                sqInfo.appendChild(sdCorner.div);
                sqInfo.appendChild(ieCorner.div);
                sqInfo.appendChild(idCorner.div);
                item.appendChild(sqInfo);
            }

            listContainer.appendChild(item);
        });
    }

    // Function to rebuild layers when loading scenario
    window.rebuildScenarioLayer = function(pt) {
        if (!pt || !pt.type || !pt.geoData) return null;
        
        // Normalize circle geoData if it came with lat/lng instead of center
        if (pt.type === 'circle' && !pt.geoData.center && pt.geoData.lat !== undefined && pt.geoData.lng !== undefined) {
            pt.geoData.center = [pt.geoData.lat, pt.geoData.lng];
        }
        
        // Use pt properties or fallback to defaults
        const style = { 
            color: pt.color || '#00d2ff', 
            weight: 2, 
            fill: pt.fill !== undefined ? pt.fill : true,
            fillColor: pt.fillColor || pt.color || '#00d2ff',
            fillOpacity: pt.fillOpacity !== undefined ? pt.fillOpacity : 0.2
        };

        if (pt.type === 'line' || pt.type === 'freehand') {
            style.fill = false;
        }
        
        let layer = null;
        
        if (pt.type === 'circle') {
            layer = L.circle(pt.geoData.center, { ...style, radius: pt.geoData.radius });
        } else if (pt.type === 'line' || pt.type === 'freehand') {
            layer = L.polyline(pt.geoData.points, style);
        } else if (pt.type === 'square') {
            layer = L.rectangle(pt.geoData.bounds, style);
        } else if (pt.type === 'polygon') {
            layer = L.polygon(pt.geoData.points, style);
        }
        
        if (layer && window.map && pt.visible !== false) {
            layer.addTo(window.map);
        }
        return layer;
    }
});





