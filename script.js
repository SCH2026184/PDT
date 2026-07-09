window.openCPModal = function(inputEl) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(10,10,10,0.95); border: 1px solid var(--primary); padding: 20px; z-index: 10000; border-radius: 8px; max-height: 80vh; overflow-y: auto; display: flex; flex-direction: column; gap: 5px; width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.8);';
    const title = document.createElement('h3');
    title.textContent = 'Selecione um Ponto';
    title.style.color = 'white';
    title.style.marginBottom = '10px';
    modal.appendChild(title);
    
    if (typeof tacticalPoints !== 'undefined') {
        ['waypoints', 'targets', 'navigation', 'artillery', 'friendly', 'threats'].forEach(mode => {
            if (tacticalPoints[mode]) {
                tacticalPoints[mode].forEach(pt => {
                    if (pt.name) {
                        const btn = document.createElement('button');
                        btn.innerHTML = `<i class="fa-solid fa-map-pin" style="color:var(--primary); margin-right:8px;"></i> ${pt.name} <span style="color:var(--text-dim); font-size:0.8em; margin-left:8px;">(${mode})</span>`;
                        btn.style.cssText = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 10px; text-align: left; cursor: pointer; border-radius: 4px; transition: 0.2s;';
                        btn.onmouseover = () => { btn.style.background = 'rgba(0,210,255,0.2)'; btn.style.borderColor = 'rgba(0,210,255,0.5)'; };
                        btn.onmouseout = () => { btn.style.background = 'rgba(255,255,255,0.05)'; btn.style.borderColor = 'rgba(255,255,255,0.1)'; };
                        btn.onclick = () => {
                            inputEl.value = pt.name;
                            document.body.removeChild(modal);
                            document.body.removeChild(backdrop);
                            // Trigger input event to simulate user typing
                            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                        };
                        modal.appendChild(btn);
                    }
                });
            }
        });
    }
    
    if (modal.children.length === 1) {
        const noPts = document.createElement('p');
        noPts.textContent = 'Nenhum ponto cadastrado.';
        noPts.style.color = 'var(--text-dim)';
        modal.appendChild(noPts);
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cancelar';
    closeBtn.style.cssText = 'margin-top: 10px; background: rgba(255,50,50,0.2); border: 1px solid rgba(255,50,50,0.5); color: white; padding: 8px; border-radius: 4px; cursor: pointer;';
    closeBtn.onclick = () => { document.body.removeChild(modal); document.body.removeChild(backdrop); };
    modal.appendChild(closeBtn);

    const backdrop = document.createElement('div');
    backdrop.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9999; backdrop-filter: blur(3px);';
    backdrop.onclick = () => { document.body.removeChild(modal); document.body.removeChild(backdrop); };
    
    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
};

document.addEventListener('DOMContentLoaded', () => {
    // --- LAYOUT FIXES ---
    // Mover os modais para o body para evitar que o backdrop-filter ou transforms dos painéis quebrem o position: fixed
    const ninelineModal = document.getElementById('nineline-modal');
    if (ninelineModal) document.body.appendChild(ninelineModal);
    
    const artilleryModal = document.getElementById('artillery-edit-modal');
    if (artilleryModal) document.body.appendChild(artilleryModal);

    const debriefingModalFix = document.getElementById('debriefing-modal');
    if (debriefingModalFix) document.body.appendChild(debriefingModalFix);

    // --- SPLASH SCREEN LOGIC ---
    const splashScreen = document.getElementById('splash-screen');
    const loadingFill = document.getElementById('splash-loading-fill');
    const loadingText = document.getElementById('splash-loading-text');
    
    if (splashScreen) {
        let progress = 0;
        
        const interval = setInterval(() => {
            // 20% chance to simulate a "stall" (network lag, database loading)
            if (Math.random() < 0.20) {
                return; // skip this tick
            }
            
            // Randomly increase progress between 5% and 10% (compensate for stalls)
            const jump = Math.floor(Math.random() * 6) + 5;
            progress += jump;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                loadingFill.style.width = '100%';
                loadingText.textContent = '100%';
                
                // Fade out after a short delay
                setTimeout(() => {
                    splashScreen.style.opacity = '0';
                    setTimeout(() => {
                        splashScreen.style.display = 'none';
                    }, 1000); // Wait for transition to finish
                }, 400);
            } else {
                loadingFill.style.width = progress + '%';
                loadingText.textContent = progress + '%';
            }
        }, 250); // Update slower for a deliberate loading feel
    }
    // ---------------------------

    // Selectors
    const weaponSelect = document.getElementById('weapon-select');
    const targetCoordsInput = document.getElementById('target-coords');
    const designationCoordsInput = document.getElementById('designation-coords');
    const headingInput = document.getElementById('heading');
    const magDeclinationInput = document.getElementById('mag-declination');
    const cursorCoordsVal = document.getElementById('cursor-coords-val');
    const copyCoordsBtn = document.getElementById('copy-coords');
    const markTargetBtn = document.getElementById('mark-target-btn');
    const goToTargetBtn = document.getElementById('go-to-target-btn');
    const targetFolderInput = document.getElementById('target-folder');
    const bombQtyInput = document.getElementById('bomb-qty');
    const bombQtyText = document.getElementById('bomb-qty-text');
    const releaseModeSelect = document.getElementById('release-mode');
    const rippleDistInput = document.getElementById('ripple-dist');
    const ameRadiusInput = document.getElementById('ame-radius');
    
    // Novas variaveis para Designacao
    const designationQtyInput = document.getElementById('designation-qty');
    const designationRippleInput = document.getElementById('designation-ripple');
    const legendToggleBtn = document.getElementById('legend-toggle-btn');
    const printModeBtn = document.getElementById('print-mode-btn');
    const showCalculatedCheck = document.getElementById('show-calculated');
    const showEffectedCheck = document.getElementById('show-effected');
    const showFragmentationCheck = document.getElementById('show-fragmentation');
    const coordFormatSelect = document.getElementById('coord-format');
    const targetAcquisitionSelect = document.getElementById('target-acquisition');

    const toggleRightPanelBtn = document.getElementById('toggle-right-panel-btn');
    const toggleRightPanelIcon = document.getElementById('toggle-right-panel-icon');
    const miniMapContainerElem = document.getElementById('mini-map-container');

    const toggleLeftPanelBtn = document.getElementById('toggle-left-panel-btn');
    const toggleLeftPanelIcon = document.getElementById('toggle-left-panel-icon');
    const mainContainer = document.querySelector('.container');

    if (toggleLeftPanelBtn && mainContainer) {
        toggleLeftPanelBtn.addEventListener('click', () => {
            mainContainer.classList.toggle('left-collapsed');
            if (mainContainer.classList.contains('left-collapsed')) {
                toggleLeftPanelIcon.classList.remove('fa-chevron-left');
                toggleLeftPanelIcon.classList.add('fa-chevron-right');
            } else {
                toggleLeftPanelIcon.classList.remove('fa-chevron-right');
                toggleLeftPanelIcon.classList.add('fa-chevron-left');
            }
            setTimeout(() => { 
                if (typeof map !== 'undefined' && map) map.invalidateSize(); 
                if (typeof window.checkFloatingNineLine === 'function') window.checkFloatingNineLine();
            }, 350);
        });
    }

    // Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) targetEl.style.display = 'block';
            
            if (targetId === 'attack-tab') {
                document.getElementById('left-panel').style.backgroundImage = "linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.9)), url('bg_strike_cropped.jpg')";
                document.getElementById('left-panel').style.backgroundSize = "cover";
                document.getElementById('left-panel').style.backgroundPosition = "center";
            } else if (targetId === 'cas-tab') {
                document.getElementById('left-panel').style.backgroundImage = "linear-gradient(rgba(15, 23, 42, 0.6), rgba(15, 23, 42, 0.9)), url('bg_cas.jpg')";
                document.getElementById('left-panel').style.backgroundSize = "cover";
                document.getElementById('left-panel').style.backgroundPosition = "center";
            }
            
            if (typeof tacticalPoints !== 'undefined') {
                ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats'].forEach(m => updateTacticalList(m));
            }
        });
    });

    if (toggleRightPanelBtn && miniMapContainerElem) {
        toggleRightPanelBtn.addEventListener('click', () => {
            miniMapContainerElem.classList.toggle('collapsed');
            if (mainContainer) {
                mainContainer.classList.toggle('right-collapsed');
            }
            if (miniMapContainerElem.classList.contains('collapsed')) {
                toggleRightPanelIcon.classList.remove('fa-chevron-right');
                toggleRightPanelIcon.classList.add('fa-chevron-left');
            } else {
                toggleRightPanelIcon.classList.remove('fa-chevron-left');
                toggleRightPanelIcon.classList.add('fa-chevron-right');
            }
            setTimeout(() => { if (map) map.invalidateSize(); }, 350);
        });
    }
    const targetTypeSelect = document.getElementById('target-type');
    const saveModal = document.getElementById('save-modal');
    const modalInput = document.getElementById('modal-employment-name');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const modalSaveConfirmBtn = document.getElementById('modal-save-confirm-btn');
    const tgtCreationBtn = document.getElementById('tgt-creation-btn');
    const targetListContainer = document.getElementById('target-list');    const tacticalPoints = {
        waypoints: [],
        targets: [],
        artillery: [],
        navigation: [],
        friendly: [],
        threats: [],
        scenario: []
    };

    window.tacticalPoints = tacticalPoints;

    // Pre-populate specific points if parseCoordsToLatLng is available
    setTimeout(() => {
        if (window.parseCoordsToLatLng && window.addTacticalPoint) {
            const preLoad = [];
            preLoad.forEach(pt => {
                const latlng = window.parseCoordsToLatLng(pt.coords);
                if (latlng) {
                    // avoid duplicates by name
                    if (!tacticalPoints[pt.mode].some(p => p.name === pt.name)) {
                        // Create marker and add
                        window.addTacticalPoint(pt.mode, latlng, false, pt.name);
                    }
                }
            });
        }
    }, 1000);

    let selectedTacticalPoint = null;

    function selectTacticalPoint(pt, itemElement) {
        if (selectedTacticalPoint) {
            if (selectedTacticalPoint.element) selectedTacticalPoint.element.classList.remove('selected-tactical-item');
            if (selectedTacticalPoint.pt && selectedTacticalPoint.pt.marker && selectedTacticalPoint.pt.marker._icon) {
                L.DomUtil.removeClass(selectedTacticalPoint.pt.marker._icon, 'selected-marker');
            }
        }
        if (!pt) {
            selectedTacticalPoint = null;
            if (typeof updateCasSummary === 'function') updateCasSummary(null);
            
            // Hide Target Details
            const placeholder = document.getElementById('mini-map-placeholder');
            const mapContainer = document.getElementById('mini-map-container');
            const header = document.getElementById('mini-map-header');
            
            if (placeholder) placeholder.style.display = 'flex';
            if (header) header.style.display = 'none';
            if (mapContainer) mapContainer.dataset.hasTarget = "false";
            
            const folderName = document.getElementById('target-folder-name');
            const dmpiDisplay = document.getElementById('target-dmpi-display');
            if (folderName) folderName.textContent = '';
            if (dmpiDisplay) dmpiDisplay.textContent = '';
            
            return;
        }
        
        if (!itemElement) {
            const lists = ['waypoints-list', 'targets-list', 'artillery-list', 'navigation-list', 'friendly-list', 'threats-list', 'scenario-list'];
            for (let listId of lists) {
                const listContainer = document.getElementById(listId);
                if (listContainer) {
                    const items = Array.from(listContainer.children);
                    const idx = tacticalPoints[listId.split('-')[0]]?.findIndex(x => x.id === pt.id);
                    if (idx !== -1 && idx !== undefined && items[idx]) {
                        itemElement = items[idx];
                        break;
                    }
                }
            }
        }
        
        selectedTacticalPoint = { pt: pt, element: itemElement };
        if (itemElement) itemElement.classList.add('selected-tactical-item');
        if (pt.marker && pt.marker._icon) {
            L.DomUtil.addClass(pt.marker._icon, 'selected-marker');
        }
        if (typeof updateCasSummary === 'function') updateCasSummary(pt);

        // Update minimap if it's a TARGET
        if (tacticalPoints && tacticalPoints['targets'] && tacticalPoints['targets'].some(t => t.id === pt.id)) {
            const folderName = document.getElementById('target-folder-name');
            const dmpiDisplay = document.getElementById('target-dmpi-display');
            const placeholder = document.getElementById('mini-map-placeholder');
            const mapContainer = document.getElementById('mini-map-container');
            
            if (folderName) folderName.textContent = pt.name || `TGT ${pt.id}`;
            if (dmpiDisplay) {
                // Formatting coords, assuming formatCoords is available or we use a basic fallback
                let coordStr = "Aguardando coord...";
                if (pt.latlng && typeof formatCoords === 'function') {
                    coordStr = formatCoords(pt.latlng.lat, pt.latlng.lng);
                } else if (pt.latlng) {
                    coordStr = `${pt.latlng.lat.toFixed(5)}, ${pt.latlng.lng.toFixed(5)}`;
                }
                dmpiDisplay.textContent = coordStr;
            }
            if (placeholder) placeholder.style.display = 'none';
            if (mapContainer) mapContainer.dataset.hasTarget = "true";
            
            if (miniMap && pt.latlng) {
                miniMap.setView(pt.latlng, 15);
                
                // Clear old custom polygon from minimap if necessary
                if (window.miniMapCustomPolygonLayer) miniMap.removeLayer(window.miniMapCustomPolygonLayer);
                
                if (pt.customPolygonPoints && pt.customPolygonPoints.length >= 3) {
                    window.miniMapCustomPolygonLayer = L.polygon(pt.customPolygonPoints, {
                        color: 'red', fillColor: 'red', fillOpacity: 0.15, weight: 2
                    }).addTo(miniMap);
                    miniMap.fitBounds(window.miniMapCustomPolygonLayer.getBounds(), { padding: [10, 10] });
                }
            }
        }
    }

    window.setType = function(val) {
        document.getElementById('nineline-type').value = val;
        document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById('btn-type-' + val);
        if (btn) btn.classList.add('active');
    };

    const showTgtListCheck = document.getElementById('show-tgt-list');
    const showTargetPolygonsCheck = document.getElementById('show-target-polygons');

    const WEAPON_DEFAULTS = {
        'BAFG-230': 7.7,
        'BAFG-120': 5.5,
        'SBAT-70': 2.0,
        'GUNS': 1.0
    };

    let map, miniMap, targetMarker, designationMarker, impactLayer, gridLayer, tileLayer, miniTileLayer;
    let targetLatLng = null;
    let createdTargets = [];
    let targetCounter = 1;
    let tgtCreationActive = false;
    let miniMapTargetMarker = null;
    let designationLatLng = null;
    let cachedPdfText = null;
    let savedEmployments = []; // Array de empregos salvos
    Object.defineProperty(window, 'savedEmployments', {
        get: () => savedEmployments,
        set: (val) => { savedEmployments = val; },
        configurable: true
    });
    let showLegends = true;
    let employmentCounter = 1;
    let editingEmploymentId = null;
    let currentTargetMetadata = null; // metadata de alvo do PDF
    let drawnTargetPolygon = null;
    let drawnTargetMiniPolygon = null;
    let targetPolygonPoints = null; // Coordenadas do polÃ­gono do alvo
    let targetDrawingActive = false;
    let drawnTargetPoints = [];
    let drawnTargetMarkers = [];
    let drawnTargetPolyline = null;
    
    // Cache de alvos/desenhos por DMPI
    const dmpiTargetsCache = {};
    let currentDmpiId = '1';
    let lastMapMouseLatLng = null;

    // LocalizaÃ§Ã£o padrÃ£o corrigida
    const DEFAULT_LAT = -20.464787;
    const DEFAULT_LNG = -54.664863;

    function initMap() {
        if (map) return;
        const initialDec = parseFloat(document.getElementById('mag-declination') ? document.getElementById('mag-declination').value : -18);
        map = L.map('map', { 
            center: [DEFAULT_LAT, DEFAULT_LNG], 
            zoom: 17, 
            zoomControl: false, 
            attributionControl: false,
            rotate: true,
            rotateControl: false,
            bearing: -initialDec
        });
        window.map = map;
        tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }).addTo(map);
        impactLayer = L.layerGroup().addTo(map);
        map.on('move', () => {
            const center = map.getCenter();
            cursorCoordsVal.textContent = formatCoords(center.lat, center.lng);
            if (typeof drawMGRSRulers === 'function') drawMGRSRulers();
        });
        const initialCenter = map.getCenter();
        cursorCoordsVal.textContent = formatCoords(initialCenter.lat, initialCenter.lng);

        map.on('click', () => {
            selectTacticalPoint(null, null);
        });

        // Link custom zoom slider
        const zoomSlider = document.getElementById('live-map-zoom');
        const zoomVal = document.getElementById('live-zoom-val');
        if (zoomSlider && zoomVal) {
            zoomSlider.value = map.getZoom();
            zoomVal.textContent = map.getZoom() + 'x';

            zoomSlider.addEventListener('input', (e) => {
                map.setZoom(e.target.value);
                zoomVal.textContent = e.target.value + 'x';
            });

            map.on('zoom', () => {
                const z = map.getZoom();
                zoomSlider.value = z;
                zoomVal.textContent = z + 'x';
                if (typeof mgrsRulerHighlightActive !== 'undefined' && mgrsRulerHighlightActive) {
                    mgrsRulerHighlightActive = false;
                }
                if (typeof window.updateAllArtillerySizes === 'function') window.updateAllArtillerySizes();
            });

            window.updateAllArtillerySizes = function() {
                if (!map) return;
                document.querySelectorAll('.custom-artillery-icon img').forEach(img => {
                    const lengthM = parseFloat(img.getAttribute('data-length'));
                    const lat = parseFloat(img.getAttribute('data-lat'));
                    if (!isNaN(lengthM) && !isNaN(lat)) {
                        const mpp = 40075016.686 * Math.abs(Math.cos(lat * Math.PI/180)) / Math.pow(2, map.getZoom() + 8);
                        const ppm = 1 / mpp;
                        let sizePx = lengthM * ppm;
                        if (sizePx < 6) sizePx = 6;
                        
                        img.style.width = sizePx + 'px';
                        img.style.height = sizePx + 'px';
                        img.style.marginLeft = -(sizePx/2) + 'px';
                        img.style.marginTop = -(sizePx/2) + 'px';
                    }
                });
            };
        }



        // Init Mini-map
        miniMap = L.map('mini-map', {
            center: [DEFAULT_LAT, DEFAULT_LNG],
            zoom: 19, // zoom imediatamente inferior ao mÃ¡ximo
            zoomControl: false,
            dragging: false,
            touchZoom: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            attributionControl: false,
            rotate: false,
            rotateControl: false
        });
        miniTileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'] }).addTo(miniMap);
    }
    initMap();

    function getAmeUnit() {
        const checked = document.querySelector('input[name="ame-unit"]:checked');
        return checked ? checked.value : 'm';
    }

    function getTargetMultiplier() {
        if (!targetTypeSelect) return 1.0;
        const type = targetTypeSelect.value;
        if (type === 'personnel') return 1.5;
        if (type === 'armored') return 0.4;
        return 1.0;
    }

    // Atualiza o limite mÃ¡ximo da AME conforme a unidade selecionada (100m ou 328ft)
    document.querySelectorAll('input[name="ame-unit"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const isFt = getAmeUnit() === 'ft';
            ameRadiusInput.max = isFt ? '328' : '100';
            // Converte o valor atual para a nova unidade
            const currentVal = parseFloat(ameRadiusInput.value) || 0;
            if (isFt) {
                ameRadiusInput.value = Math.min(328, Math.round(currentVal * 3.28084 * 10) / 10);
            } else {
                ameRadiusInput.value = Math.min(100, Math.round(currentVal / 3.28084 * 10) / 10);
            }
        });
    });

    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    targetFolderInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') {
            document.getElementById('target-folder-name').textContent = "";
            return;
        }
        document.getElementById('target-folder-name').textContent = file.name;
        
        // Limpa cache ao carregar um novo PDF
        for (const k in dmpiTargetsCache) delete dmpiTargetsCache[k];
        
        const dmpiValue = document.getElementById('dmpi-id').value || "1";
        currentDmpiId = dmpiValue;
        document.getElementById('target-dmpi-display').textContent = 'DMPI ' + dmpiValue;
        const reader = new FileReader();
        
        reader.onload = async function() {
            const typedarray = new Uint8Array(this.result);
            try {
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = "";
                
                // LÃª todas as pÃ¡ginas do PDF
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    let lastY;
                    for (let item of textContent.items) {
                        if (lastY !== undefined && lastY !== item.transform[5]) fullText += "\n";
                        fullText += item.str + " ";
                        lastY = item.transform[5];
                    }
                    fullText += "\n"; // Quebra de linha entre pÃ¡ginas
                }
                
                cachedPdfText = fullText;
                findCoordsInText(fullText, dmpiValue);
            } catch (err) { alert("Erro ao processar o PDF."); }
        };
        reader.readAsArrayBuffer(file);
    });

    function saveCurrentDmpiToCache() {
        if (!currentDmpiId) return;
        if (!targetLatLng) return;

        dmpiTargetsCache[currentDmpiId] = {
            targetLatLng: targetLatLng ? L.latLng(targetLatLng.lat, targetLatLng.lng) : null,
            targetCoords: targetCoordsInput.value,
            acquisitionMode: targetAcquisitionSelect.value,
            targetPolygonPoints: targetPolygonPoints ? targetPolygonPoints.map(pt => L.latLng(pt.lat, pt.lng)) : null,
            designationCoords: designationCoordsInput.value,
            latError: document.getElementById('lat-error').value,
            longError: document.getElementById('long-error').value,
            designationHeading: document.getElementById('designation-heading').value
        };
    }

    function loadDmpiFromCache(dmpiId) {
        const cached = dmpiTargetsCache[dmpiId];
        if (!cached) return false;

        // Restaura coordenadas e marcador do alvo
        targetLatLng = cached.targetLatLng;
        targetCoordsInput.value = cached.targetCoords;
        
        if (targetMarker) map.removeLayer(targetMarker);
        if (targetLatLng) {
            const triIcon = L.divIcon({ className: 'target-triangle', html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><polygon points="15,5 28,25 2,25" stroke="red" stroke-width="2.5" fill="none" /></svg>`, iconSize: [30, 30], iconAnchor: [15, 18] });
            targetMarker = L.marker(targetLatLng, { icon: triIcon }).addTo(map);
            targetMarker.bindTooltip("Alvo");
            if (showLegends) targetMarker.openTooltip();
        }
        
        // Restaura modo de aquisiÃ§Ã£o
        targetAcquisitionSelect.value = cached.acquisitionMode;
        
        // Remove polÃ­gonos antigos e alÃ§as
        if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
        if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
        clearDragHandles();
        
        // Restaura pontos do polÃ­gono
        targetPolygonPoints = cached.targetPolygonPoints ? cached.targetPolygonPoints.map(pt => L.latLng(pt.lat, pt.lng)) : null;
        
        if (targetPolygonPoints) {
            const isManual = (cached.acquisitionMode === 'manual');
            const color = isManual ? '#ff3333' : '#00ffcc';
            const weight = isManual ? 2.5 : 2;
            const dash = isManual ? '' : '3, 6';
            const fill = isManual ? 0.15 : 0.05;
            
            drawnTargetPolygon = L.polygon(targetPolygonPoints, {
                color: color,
                weight: weight,
                dashArray: dash,
                fillColor: color,
                fillOpacity: fill
            }).addTo(map);
            
            drawnTargetPolygon.bindTooltip(isManual ? "Alvo Customizado" : "Alvo");
            
            if (miniMap) {
                drawnTargetMiniPolygon = L.polygon(targetPolygonPoints, {
                    color: color,
                    weight: weight,
                    dashArray: dash,
                    fillColor: color,
                    fillOpacity: fill + 0.1
                }).addTo(miniMap);
            }
            
            if (isManual) {
                createDragHandles();
            }
        }
        
        // Restaura resultados do piloto
        designationCoordsInput.value = cached.designationCoords;
        document.getElementById('lat-error').value = cached.latError;
        document.getElementById('long-error').value = cached.longError;
        document.getElementById('designation-heading').value = cached.designationHeading;
        
        // Recria marcador de designaÃ§Ã£o
        const desPos = parseInputCoords(cached.designationCoords);
        if (desPos) {
            designationLatLng = L.latLng(desPos.lat, desPos.lng);
            if (designationMarker) map.removeLayer(designationMarker);
            const dIcon = L.divIcon({ className: 'design-marker-icon', html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><circle cx="15" cy="15" r="12" stroke="#00ff00" stroke-width="2" fill="none" /><circle cx="15" cy="15" r="3" fill="#00ff00" /></svg>`, iconSize: [30, 30], iconAnchor: [15, 15] });
            designationMarker = L.marker(designationLatLng, { icon: dIcon }).addTo(map);
            designationMarker.bindTooltip("DesignaÃ§Ã£o");
            if (showLegends) designationMarker.openTooltip();
        } else {
            if (designationMarker) { map.removeLayer(designationMarker); designationMarker = null; }
        }
        
        // Recalcula e redesenha impactos
        updateDistance();
        drawImpactsOnMap();
        
        if (targetLatLng && miniMap) {
            miniMap.setView(targetLatLng, 19);
            setTimeout(() => {
                miniMap.invalidateSize();
            }, 100);
        }
        
        return true;
    }

    document.getElementById('dmpi-id').addEventListener('change', (e) => {
        const newDmpiId = e.target.value;
        
        // Cancelar desenho se estiver ativo
        if (targetDrawingActive) finishTargetDrawing(false);
        
        // Salva estado do DMPI anterior no cache
        saveCurrentDmpiToCache();
        
        currentDmpiId = newDmpiId;
        document.getElementById('target-dmpi-display').textContent = 'DMPI ' + newDmpiId;
        
        // Tenta carregar do cache
        const loaded = loadDmpiFromCache(newDmpiId);
        
        // Se nÃ£o existir no cache, lÃª do PDF
        if (!loaded) {
            if (cachedPdfText) {
                findCoordsInText(cachedPdfText, newDmpiId);
            } else {
                // Se nÃ£o tem PDF e nÃ£o estÃ¡ no cache, limpa a tela para o novo DMPI
                if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
                if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
                clearDragHandles();
                targetPolygonPoints = null;
                if (targetMarker) { map.removeLayer(targetMarker); targetMarker = null; }
                targetCoordsInput.value = '';
                designationCoordsInput.value = '';
                document.getElementById('lat-error').value = 0;
                document.getElementById('long-error').value = 0;
                document.getElementById('designation-heading').value = '';
                if (designationMarker) { map.removeLayer(designationMarker); designationMarker = null; }
                
                updateDistance();
                drawImpactsOnMap();
            }
        }
    });

    function findCoordsInText(text, dmpiId) {
        const cleanText = text.replace(/[\n\r]/g, " ").replace(/\s+/g, " ");

        // PadrÃ£o que identifica PMDI ou DMPI com suporte a espaÃ§os extras
        const pmdiStr = `P\\s*M\\s*D\\s*I`;
        const dmpiStr = `D\\s*M\\s*P\\s*I`;
        
        // Divide o texto sempre ANTES de um "PMDI", criando "blocos" onde o 1' item Ã© o cabeÃ§alho e os seguintes comeÃ§am com PMDI
        const splitRegex = new RegExp(`(?=${pmdiStr}|${dmpiStr})`, 'ig');
        const chunks = cleanText.split(splitRegex);
        
        // PadrÃ£o para verificar se o bloco comeÃ§a com o PMDI que queremos
        const targetRegex = new RegExp(`^(?:${pmdiStr}|${dmpiStr})\\s*0*${dmpiId}(?!\\d)`, 'i');
        
        let coords = null;
        let matchChunk = cleanText;

        // Varre os blocos tentando achar o nosso PMDI e sua coordenada
        for (const chunk of chunks) {
            if (targetRegex.test(chunk)) {
                matchChunk = chunk;
                const found = extractCoordsFromText(chunk);
                if (found) {
                    coords = found;
                    break;
                }
            }
        }

        if (!coords) {
            // Fallback para o documento inteiro caso nÃ£o ache o PMDI especÃ­fico (ex: coordenadas globais do alvo na pÃ¡g 1)
            coords = extractCoordsFromText(cleanText);
        }

        // Extrai tipo do alvo e dimensÃµes (SugestÃ£o 3)
        let targetType = "Alvo";
        let width = 30; // padrÃ£o
        let length = 20; // padrÃ£o

        if (/hangar/i.test(matchChunk)) targetType = "Hangar";
        else if (/pista/i.test(matchChunk)) targetType = "Pista";
        else if (/edif/i.test(matchChunk)) targetType = "EdificaÃ§Ã£o";
        else if (/radar|antena/i.test(matchChunk)) targetType = "Radar";
        else if (/deposito/i.test(matchChunk)) targetType = "DepÃ³sito";
        
        // Procura dimensÃµes: ex 30x15m, 120x30, 20 x 20m
        const dimRegex = /\b(\d+)\s*[xX]\s*(\d+)\s*(?:m|metros|meters)?\b/;
        const dimMatch = dimRegex.exec(matchChunk);
        if (dimMatch) {
            width = parseInt(dimMatch[1]);
            length = parseInt(dimMatch[2]);
        } else {
            if (targetType === "Hangar") { width = 30; length = 20; }
            else if (targetType === "Pista") { width = 100; length = 25; }
            else if (targetType === "EdificaÃ§Ã£o") { width = 25; length = 25; }
            else if (targetType === "Radar") { width = 15; length = 15; }
            else if (targetType === "DepÃ³sito") { width = 40; length = 20; }
        }
        
        currentTargetMetadata = {
            type: targetType,
            width: width,
            length: length
        };

        if (coords) {
            targetCoordsInput.value = coords.coordStr;
            const pos = parseInputCoords(coords.coordStr);
            if (pos) {
                updateTargetMarker(pos);
                console.log(`Alvo Identificado a partir do PDF!\n\nCoordenada: ${coords.coordStr}`);
                return;
            }
        }

        const preview = cleanText.substring(0, 300);
        console.warn(`NÃ£o consegui identificar as coordenadas do DMPI ${dmpiId} no PDF.\n\nVeja o que o sistema leu:\n${preview}...`);
    }

    function extractCoordsFromText(tempText) {
        let match;
        let latFound = null;
        let lonFound = null;

        // --- PRIORIDADE 1: DMM (ex: S16'01.433' W049'46.313') ---
        // Prefixo: letra direcional ANTES dos graus
        const dmmPrefixRegex = /([NS])\s*(\d{1,3})['']\s*(\d{1,2}[\.,]\d+)['â€²]?\s*([EWO])\s*(\d{1,3})['']\s*(\d{1,2}[\.,]\d+)['â€²]?/gi;
        while ((match = dmmPrefixRegex.exec(tempText)) !== null) {
            const latDir = match[1].toUpperCase();
            const latDeg = match[2];
            const latMin = match[3].replace(',', '.');
            const lonDir = match[4].toUpperCase() === 'O' ? 'W' : match[4].toUpperCase();
            const lonDeg = match[5];
            const lonMin = match[6].replace(',', '.');
            if (!latFound) latFound = { str: `${latDeg}° ${latMin}' ${latDir}`, type: 'DMM' };
            if (!lonFound) lonFound = { str: `${lonDeg}' ${lonMin}' ${lonDir}`, type: 'DMM' };
            break;
        }

        // TambÃ©m tenta DMM com lat e lon separadas (fallback)
        if (!latFound || !lonFound) {
            const dmmSingleRegex = /([NSWEWO])\s*(\d{1,3})['']\s*(\d{1,2}[\.,]\d+)['â€²]?/gi;
            while ((match = dmmSingleRegex.exec(tempText)) !== null) {
                const dir = match[1].toUpperCase() === 'O' ? 'W' : match[1].toUpperCase();
                const deg = match[2];
                const min = match[3].replace(',', '.');
                const isLat = ['N', 'S'].includes(dir);
                const isLon = ['E', 'W'].includes(dir);
                if (isLat && !latFound) latFound = { str: `${deg}' ${min}' ${dir}`, type: 'DMM' };
                if (isLon && !lonFound) lonFound = { str: `${deg}' ${min}' ${dir}`, type: 'DMM' };
            }
        }

        // --- PRIORIDADE 2: DMS como fallback (ex: S16'01'26" W049'46'19") ---
        if (!latFound || !lonFound) {
            const dmsRegex = /([NS])\s*(\d{1,3})['']\s*(\d{1,2})['â€²]\s*([\d.,]+)["â€³]?\s*([EWO])\s*(\d{1,3})['']\s*(\d{1,2})['â€²]\s*([\d.,]+)["â€³]?/gi;
            while ((match = dmsRegex.exec(tempText)) !== null) {
                const latDir = match[1].toUpperCase();
                const lonDir = match[5].toUpperCase() === 'O' ? 'W' : match[5].toUpperCase();
                if (!latFound) latFound = { str: `${match[2]}' ${match[3]}' ${match[4].replace(',','.')}\" ${latDir}`, type: 'DMS' };
                if (!lonFound) lonFound = { str: `${match[6]}' ${match[7]}' ${match[8].replace(',','.')}\" ${lonDir}`, type: 'DMS' };
                break;
            }
        }

        if (latFound && lonFound) {
            return { coordStr: `${latFound.str}, ${lonFound.str}` };
        }
        return null;
    }

    function updateTargetMarker(pos) {
        targetLatLng = L.latLng(pos.lat, pos.lng);
        if (targetMarker) map.removeLayer(targetMarker);
        const triIcon = L.divIcon({ className: 'target-triangle', html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><polygon points="15,5 28,25 2,25" stroke="red" stroke-width="2.5" fill="none" /></svg>`, iconSize: [30, 30], iconAnchor: [15, 18] });
        targetMarker = L.marker(targetLatLng, { icon: triIcon }).addTo(map);
        targetMarker.bindTooltip("Alvo");
        if (showLegends) targetMarker.openTooltip();

        // Clique duplo no triÃ¢ngulo ativa/desativa modo de arrasto do DMPI
        targetMarker.on('dblclick', (e) => {
            L.DomEvent.stopPropagation(e); // Impede o zoom do mapa
            if (targetMarker.dragging.enabled()) {
                targetMarker.dragging.disable();
                targetMarker.bindTooltip("Alvo");
                if (showLegends) targetMarker.openTooltip();
                
                // Recalcula e salva a nova posiÃ§Ã£o final no cache do DMPI
                updateDistance();
                drawImpactsOnMap();
                saveCurrentDmpiToCache();
            } else {
                targetMarker.dragging.enable();
                targetMarker.bindTooltip("Modo EdiÃ§Ã£o: Arraste o DMPI. Clique duplo para salvar/travar", { permanent: true, direction: 'top' }).openTooltip();
            }
        });

        // Suporta movimentaÃ§Ã£o e deslocamento dinÃ¢mico em tempo real
        targetMarker.on('drag', (e) => {
            const newPos = e.target.getLatLng();
            const deltaLat = newPos.lat - targetLatLng.lat;
            const deltaLng = newPos.lng - targetLatLng.lng;
            
            targetLatLng = newPos;
            targetCoordsInput.value = formatCoords(newPos.lat, newPos.lng);
            
            // Se o alvo for manual, translada todos os vÃ©rtices junto com o DMPI
            if (targetPolygonPoints && targetAcquisitionSelect.value === 'manual') {
                targetPolygonPoints = targetPolygonPoints.map(pt => L.latLng(pt.lat + deltaLat, pt.lng + deltaLng));
                if (drawnTargetPolygon) drawnTargetPolygon.setLatLngs(targetPolygonPoints);
                if (drawnTargetMiniPolygon) drawnTargetMiniPolygon.setLatLngs(targetPolygonPoints);
                createDragHandles();
            }
            
            updateDistance();
            drawImpactsOnMap();
        });

        targetMarker.on('dragend', (e) => {
            const newPos = e.target.getLatLng();
            targetLatLng = newPos;
            targetCoordsInput.value = formatCoords(newPos.lat, newPos.lng);
            
            if (targetAcquisitionSelect.value === 'auto') {
                if (currentTargetMetadata) {
                    createAutoTargetPolygon(targetLatLng, currentTargetMetadata.width, currentTargetMetadata.length, currentTargetMetadata.type);
                } else {
                    createAutoTargetPolygon(targetLatLng, 32, 18, "Hangar (Contraste Terreno)");
                }
            } else {
                validateEmploymentEfficacy();
            }
            
            saveCurrentDmpiToCache();
        });

        updateDistance();
        drawImpactsOnMap();

        // Auto draw target polygon if acquisition mode is auto
        if (targetAcquisitionSelect.value === 'auto') {
            if (currentTargetMetadata) {
                createAutoTargetPolygon(targetLatLng, currentTargetMetadata.width, currentTargetMetadata.length, currentTargetMetadata.type);
            } else {
                createAutoTargetPolygon(targetLatLng, 32, 18, "Hangar (Contraste Terreno)");
            }
        } else {
            // Manual mode: remove old polygons if coordinate changes
            if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
            if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
            clearDragHandles();
            targetPolygonPoints = null;
            validateEmploymentEfficacy();
        }

        // Hide the squadron logo placeholder when a target is loaded to show the mini-map
        const placeholder = document.getElementById('mini-map-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }

        // Update Mini-map
        const miniMapContainer = document.getElementById('mini-map-container');
        let justShown = false;
        if (miniMapContainer) {
            if (miniMapContainer.style.display !== 'flex') justShown = true;
            miniMapContainer.style.display = 'flex';
            if (toggleRightPanelBtn) toggleRightPanelBtn.style.display = 'flex';
            const miniMapHeader = document.getElementById('mini-map-header');
            if (miniMapHeader) miniMapHeader.style.display = 'flex';
        }
        if (miniMap) {
            miniMap.setView(targetLatLng, 19);
            setTimeout(() => {
                miniMap.invalidateSize();
                if (justShown) {
                    map.invalidateSize();
                    map.setView(targetLatLng, map.getZoom(), { animate: false });
                }
            }, 100);
        }
    }

    goToTargetBtn.addEventListener('click', () => {
        if (targetLatLng) { map.setView(targetLatLng, 18); }
        else {
            const pos = parseInputCoords(targetCoordsInput.value);
            if (pos) { updateTargetMarker(pos); map.setView(targetLatLng, 18); }
        }
    });

    document.querySelectorAll('input[name="ame-unit"]').forEach(radio => radio.addEventListener('change', drawImpactsOnMap));
    copyCoordsBtn.addEventListener('click', () => {
        const text = cursorCoordsVal.textContent;
        navigator.clipboard.writeText(text).then(() => {
            cursorCoordsVal.textContent = "Copiado!";
            setTimeout(() => { cursorCoordsVal.textContent = text; }, 1000);
        });
    });

    markTargetBtn.addEventListener('click', () => {
        const center = map.getCenter();
        const coordStr = formatCoords(center.lat, center.lng);
        targetCoordsInput.value = coordStr;
        updateTargetMarker({ lat: center.lat, lng: center.lng });
    });

    document.getElementById('mark-designation-btn').addEventListener('click', () => {
        const center = map.getCenter();
        const coordStr = formatCoords(center.lat, center.lng);
        const designationCoordsInput = document.getElementById('designation-coords');
        designationCoordsInput.value = coordStr;
        // Reutiliza a lÃ³gica existente de criaÃ§Ã£o do marcador de designaÃ§Ã£o
        if (designationMarker) map.removeLayer(designationMarker);
        const dIcon = L.divIcon({ className: 'design-marker-icon', html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><circle cx="15" cy="15" r="12" stroke="#00ff00" stroke-width="2" fill="none" /><circle cx="15" cy="15" r="3" fill="#00ff00" /></svg>`, iconSize: [30, 30], iconAnchor: [15, 15] });
        designationLatLng = L.latLng(center.lat, center.lng);
        designationMarker = L.marker(designationLatLng, { icon: dIcon }).addTo(map);
        designationMarker.bindTooltip("DesignaÃ§Ã£o");
        if (showLegends) designationMarker.openTooltip();
        updateDistance();
        drawImpactsOnMap();
    });

    function formatCoords(lat, lng, overrideFormat) {
        const format = overrideFormat || (coordFormatSelect ? coordFormatSelect.value : 'DEC');
        if (format === 'DEC') return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        if (format === 'DMM') return toDMM(lat, lng);
        if (format === 'DMS') return toDMS(lat, lng);
        if (format === 'MGRS') { 
            try { 
                let m = mgrs.forward([lng, lat]); 
                return m.replace(/^(\d+[A-Z])([A-Z]{2})(\d{5})(\d{5})$/, '$1 $2 $3 $4');
            } catch(e) { return 'N/A'; } 
        }
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    function toDMM(lat, lng) {
        const latDir = lat >= 0 ? 'N' : 'S', lngDir = lng >= 0 ? 'E' : 'W';
        const absLat = Math.abs(lat), absLng = Math.abs(lng);
        const latDeg = Math.floor(absLat), latMin = ((absLat - latDeg) * 60).toFixed(4);
        const lngDeg = Math.floor(absLng), lngMin = ((absLng - lngDeg) * 60).toFixed(4);
        return `${latDeg}° ${latMin}' ${latDir}, ${lngDeg}° ${lngMin}' ${lngDir}`;
    }

    function toDMS(lat, lng) {
        const latDir = lat >= 0 ? 'N' : 'S', lngDir = lng >= 0 ? 'E' : 'W';
        const absLat = Math.abs(lat), absLng = Math.abs(lng);
        const formatComp = (val) => {
            const d = Math.floor(val);
            const mFull = (val - d) * 60;
            const m = Math.floor(mFull + 0.0000001); 
            const s = ((mFull - m) * 60).toFixed(2);
            return { d, m, s };
        };
        const la = formatComp(absLat), lo = formatComp(absLng);
        return `${la.d}° ${la.m}' ${la.s}" ${latDir}, ${lo.d}° ${lo.m}' ${lo.s}" ${lngDir}`;
    }

    // PARSER UNIVERSAL SEGURO
    function parseInputCoords(input) {
        if (!input) return null;
        const format = coordFormatSelect.value;
        if (format === 'MGRS') {
            try { const lonlat = mgrs.toPoint(input.trim().replace(/\s+/g, '')); return { lat: lonlat[1], lng: lonlat[0] }; } catch(e) { return null; }
        }

        const parts = input.split(',').map(p => p.trim());
        if (parts.length !== 2) return null;

        const parseSingle = (str) => {
            str = str.toUpperCase().trim();
            let val = NaN;
            let dir = '';

            const dmsPrefix = str.match(/([NSEWO])\s*(\d+)['\s-]+(\d+)['\s-]+([\d.,]+)"?/i);
            const dmsPostfix = str.match(/(\d+)['\s-]+(\d+)['\s-]+([\d.,]+)"?\s*([NSEWO])/i);
            const dmmPrefix = str.match(/([NSEWO])\s*(\d+)['\s-]+([\d.,]+)'?/i);
            const dmmPostfix = str.match(/(\d+)['\s-]+([\d.,]+)'?\s*([NSEWO])/i);
            const dec = str.match(/(-?[\d.]+)/);

            if (dmsPrefix) {
                val = parseInt(dmsPrefix[2]) + (parseInt(dmsPrefix[3]) / 60) + (parseFloat(dmsPrefix[4].replace(',','.')) / 3600);
                dir = dmsPrefix[1].toUpperCase();
            } else if (dmsPostfix) {
                val = parseInt(dmsPostfix[1]) + (parseInt(dmsPostfix[2]) / 60) + (parseFloat(dmsPostfix[3].replace(',','.')) / 3600);
                dir = dmsPostfix[4].toUpperCase();
            } else if (dmmPrefix) {
                val = parseInt(dmmPrefix[2]) + (parseFloat(dmmPrefix[3].replace(',','.')) / 60);
                dir = dmmPrefix[1].toUpperCase();
            } else if (dmmPostfix) {
                val = parseInt(dmmPostfix[1]) + (parseFloat(dmmPostfix[2].replace(',','.')) / 60);
                dir = dmmPostfix[3].toUpperCase();
            } else if (dec) {
                val = Math.abs(parseFloat(dec[1]));
                if (dec[1].startsWith('-')) dir = 'NEG'; // Placeholder for negative decimal
            }

            if (isNaN(val)) return null;

            let type = 'unknown';
            let isNegative = false;

            if (dir === 'S') { type = 'lat'; isNegative = true; }
            else if (dir === 'N') { type = 'lat'; isNegative = false; }
            else if (dir === 'W' || dir === 'O') { type = 'lon'; isNegative = true; }
            else if (dir === 'E') { type = 'lon'; isNegative = false; }
            else if (dir === 'NEG') { isNegative = true; }

            return { val: isNegative ? -val : val, type: type };
        };

        const res1 = parseSingle(parts[0]);
        const res2 = parseSingle(parts[1]);

        if (!res1 || !res2) return null;

        // Se o usuÃ¡rio digitou Lon, Lat (Ex: 48 W, 16 S), o sistema inverte para o padrÃ£o Lat, Lon interno
        let finalLat, finalLng;
        if (res1.type === 'lon' || res2.type === 'lat') {
            finalLat = res2.val;
            finalLng = res1.val;
        } else {
            finalLat = res1.val;
            finalLng = res2.val;
        }

        return { lat: finalLat, lng: finalLng };
    }

    // Export to window so scenario-draw.js can use them dynamically
    window.formatCoords = formatCoords;
    window.parseInputCoords = parseInputCoords;

    weaponSelect.addEventListener('change', () => {
        const weapon = weaponSelect.value;
        if (WEAPON_DEFAULTS[weapon] !== undefined) {
            const isFt = getAmeUnit() === 'ft';
            const valueM = WEAPON_DEFAULTS[weapon];
            ameRadiusInput.value = isFt ? Math.min(328, Math.round(valueM * 3.28084 * 10) / 10) : valueM;
        }
        drawImpactsOnMap();
    });

    if (targetTypeSelect) {
        targetTypeSelect.addEventListener('change', () => {
            drawImpactsOnMap();
            validateEmploymentEfficacy();
        });
    }
    headingInput.addEventListener('input', () => {
        let val = parseInt(headingInput.value);
        if (isNaN(val)) {
            drawImpactsOnMap();
            return;
        }
        
        if (val < 0) {
            headingInput.value = 359;
        } else if (val >= 360) {
            headingInput.value = 0;
        }
        
        drawImpactsOnMap();
    });
    function validateAndAdjustQty() {
        if (releaseModeSelect.value === 'PAIR') {
            let qty = parseInt(bombQtyInput.value || 2);
            if (qty !== 2 && qty !== 4) {
                if (qty <= 2) {
                    bombQtyInput.value = 2;
                } else {
                    bombQtyInput.value = 4;
                }
            }
        }
    }
    releaseModeSelect.addEventListener('change', () => {
        validateAndAdjustQty();
        drawImpactsOnMap();
    });
    bombQtyInput.addEventListener('input', () => {
        validateAndAdjustQty();
        drawImpactsOnMap();
    });
    bombQtyInput.addEventListener('change', () => {
        validateAndAdjustQty();
        drawImpactsOnMap();
    });
    rippleDistInput.addEventListener('input', drawImpactsOnMap);
    ameRadiusInput.addEventListener('input', drawImpactsOnMap);
    
    if (designationQtyInput) designationQtyInput.addEventListener('input', drawImpactsOnMap);
    if (designationQtyInput) designationQtyInput.addEventListener('change', drawImpactsOnMap);
    if (designationRippleInput) designationRippleInput.addEventListener('input', drawImpactsOnMap);
    if (legendToggleBtn) {
        legendToggleBtn.classList.add('active-state');
        legendToggleBtn.addEventListener('click', () => {
            showLegends = !showLegends;
            legendToggleBtn.classList.toggle('active-state', showLegends);
            updateMapMarkers();
            drawImpactsOnMap();
        });
    }
    if (printModeBtn) {
        printModeBtn.addEventListener('click', () => {
            document.body.classList.toggle('print-mode-active');
            const isActive = document.body.classList.contains('print-mode-active');
            printModeBtn.classList.toggle('active-state', isActive);
        });
    }
    showCalculatedCheck.addEventListener('change', drawImpactsOnMap);
    showEffectedCheck.addEventListener('change', drawImpactsOnMap);
    showFragmentationCheck.addEventListener('change', drawImpactsOnMap);
    coordFormatSelect.addEventListener('change', () => {
        const center = map.getCenter();
        cursorCoordsVal.textContent = formatCoords(center.lat, center.lng);
        if (targetLatLng) {
            targetCoordsInput.value = formatCoords(targetLatLng.lat, targetLatLng.lng);
        }
        if (typeof tacticalPoints !== 'undefined') {
            ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats'].forEach(m => updateTacticalList(m));
        }
        updateTargetListUI();
        drawImpactsOnMap();
        updatePlaceholders();
    });

    function updatePlaceholders() {
        const format = coordFormatSelect.value;
        let example = "";
        if (format === 'DMS') example = "Ex: 16' 14' 02\" S, 48' 57' 58\" W";
        else if (format === 'DMM') example = "Ex: 16' 14.043' S, 48' 57.975' W";
        else if (format === 'DEC') example = "Ex: -16.234061, -48.966258";
        else if (format === 'MGRS') example = "Ex: 22L CH 01234 56789";
        
        targetCoordsInput.placeholder = example;
        designationCoordsInput.placeholder = example;
    }

    coordFormatSelect.addEventListener('change', () => {
        const center = map.getCenter();
        cursorCoordsVal.textContent = formatCoords(center.lat, center.lng);
        updatePlaceholders();
    });

    const navCoordInput = document.getElementById('nav-coord-input');
    const navPointType = document.getElementById('nav-point-type');

    window.floatingNineLineDismissed = false;
    window.checkFloatingNineLine = function() {
        const container = document.getElementById('floating-9line-container');
        if (!container) return;
        
        const mainContainer = document.querySelector('.container');
        const isLeftCollapsed = mainContainer && mainContainer.classList.contains('left-collapsed');
        
        let targetWith9L = null;
        if (typeof selectedTacticalPoint !== 'undefined' && selectedTacticalPoint && selectedTacticalPoint.pt && selectedTacticalPoint.pt.ninelineData) {
            targetWith9L = selectedTacticalPoint.pt;
        } else if (typeof tacticalPoints !== 'undefined' && tacticalPoints['targets']) {
            targetWith9L = tacticalPoints['targets'].find(t => t.ninelineData);
        }
        
        if (targetWith9L && isLeftCollapsed) {
            const floatingContent = document.getElementById('floating-9line-content');
            if (floatingContent && (!floatingContent.innerHTML || floatingContent.innerHTML.includes('Selecione'))) {
                if (typeof updateCasSummary === 'function') {
                    const temp = window.checkFloatingNineLine;
                    window.checkFloatingNineLine = function(){};
                    updateCasSummary(targetWith9L);
                    window.checkFloatingNineLine = temp;
                }
            }
        }
        
        const hasNineLine = !!targetWith9L;
        
        if (isLeftCollapsed && hasNineLine && !window.floatingNineLineDismissed) {
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    };

    const closeFloatingBtn = document.getElementById('close-floating-9line-btn');
    if (closeFloatingBtn) {
        closeFloatingBtn.addEventListener('click', () => {
            window.floatingNineLineDismissed = true;
            window.checkFloatingNineLine();
        });
    }

    if (navCoordInput) {
        navCoordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const coords = parseInputCoords(navCoordInput.value);
                if (coords) {
                    map.setView(coords, map.getZoom(), {animate: true});
                    if (typeof miniMap !== 'undefined' && miniMap) miniMap.setView(coords, miniMap.getZoom(), {animate: true});
                } else {
                    alert('Coordenada inválida para o formato selecionado.');
                }
            }
        });
    }

    if (navPointType) {
        navPointType.addEventListener('change', () => {
            const type = navPointType.value;
            if (!type) return;
            
            const coords = parseInputCoords(navCoordInput.value);
            if (coords) {
                map.setView(coords, map.getZoom(), {animate: true});
                if (typeof miniMap !== 'undefined' && miniMap) miniMap.setView(coords, miniMap.getZoom(), {animate: true});
                
                if (typeof addTacticalPoint === 'function') {
                    addTacticalPoint(type, coords);
                }
                navCoordInput.value = '';
            } else {
                alert('Por favor, insira uma coordenada válida no formato selecionado.');
            }
            navPointType.value = ''; // Reset selection
        });
    }

    let parsedXMLReleases = [];
    let parsedTelemetryReleasesVisibility = [];
    const telemetryReleaseGroup = document.getElementById('telemetry-release-group');
    const telemetryVisibilityPanel = document.getElementById('telemetry-visibility-panel');
    const telemetryFileInput = document.getElementById('telemetry-file');
    const telemetryReleaseSelect = document.getElementById('telemetry-release-select');
    const goToEmploymentBtn = document.getElementById('go-to-employment-btn');

    targetAcquisitionSelect.addEventListener('change', () => {
        if (targetAcquisitionSelect.value === 'auto' && targetLatLng) {
            if (currentTargetMetadata) {
                createAutoTargetPolygon(targetLatLng, currentTargetMetadata.width, currentTargetMetadata.length, currentTargetMetadata.type);
            } else {
                createAutoTargetPolygon(targetLatLng, 32, 18, "Hangar (Contraste Terreno)");
            }
        } else if (targetAcquisitionSelect.value === 'manual') {
            if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
            if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
            clearDragHandles();
            targetPolygonPoints = null;
            validateEmploymentEfficacy();
        }
    });

    if (goToEmploymentBtn) {
        goToEmploymentBtn.addEventListener('click', () => {
            if (designationLatLng && map) {
                map.setView(designationLatLng, 17, { animate: true });
            } else {
                alert("Nenhuma coordenada de designaÃ§Ã£o definida.");
            }
        });
    }

    if (telemetryFileInput) {
        telemetryFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const xmlString = event.target.result;
                processXMLTelemetry(xmlString, file.name);
            };
            reader.readAsText(file);
        });
    }

    if (telemetryReleaseSelect) {
        telemetryReleaseSelect.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value);
            applyXMLRelease(idx);
            // Atualiza destaque do item ativo e garante visibilidade
            if (telemetryVisibilityPanel) {
                const labels = telemetryVisibilityPanel.querySelectorAll('label');
                labels.forEach((lbl, i) => {
                    lbl.classList.toggle('active-item', i === idx);
                    // Garantir que o selecionado esteja visÃ­vel
                    if (i === idx) {
                        parsedTelemetryReleasesVisibility[i] = true;
                        const cb = lbl.querySelector('input[type="checkbox"]');
                        if (cb) cb.checked = true;
                    }
                });
            }
        });
    }

    const shiftAllMinus1Btn = document.getElementById('shift-all-emp-minus-1');
    const shiftAllPlus1Btn = document.getElementById('shift-all-emp-plus-1');
    if (shiftAllMinus1Btn) {
        shiftAllMinus1Btn.addEventListener('click', (e) => {
            e.stopPropagation();
            shiftEmploymentsTime(-1);
        });
    }
    if (shiftAllPlus1Btn) {
        shiftAllPlus1Btn.addEventListener('click', (e) => {
            e.stopPropagation();
            shiftEmploymentsTime(1);
        });
    }

    const syncAllEmploymentsBtn = document.getElementById('sync-all-employments');
    if (syncAllEmploymentsBtn) {
        syncAllEmploymentsBtn.addEventListener('change', (e) => {
            const checked = syncAllEmploymentsBtn.checked;
            savedEmployments.forEach(emp => {
                emp.timeSyncEnabled = checked;
            });
            renderEmploymentList();
            if (window.onTelemetryTimeUpdate && window.getCurrentTelemetryTime) {
                window.onTelemetryTimeUpdate(window.getCurrentTelemetryTime());
            }
        });
    }

    function shiftEmploymentsTime(hours) {
        savedEmployments.forEach(emp => {
            if (emp.telemetryTimeMs !== null && emp.telemetryTimeMs !== undefined) {
                emp.telemetryTimeMs += hours * 3600 * 1000;
                if (emp.telemetryTimeMs < 0) emp.telemetryTimeMs += 86400000;
                if (emp.telemetryTimeMs >= 86400000) emp.telemetryTimeMs -= 86400000;
            }
        });
        renderEmploymentList();
        if (window.onTelemetryTimeUpdate && window.getCurrentTelemetryTime) {
            window.onTelemetryTimeUpdate(window.getCurrentTelemetryTime());
        }
    }

    function processXMLTelemetry(xmlString, fileName = "") {
        let trigraph = "";
        if (fileName) {
            const parts = fileName.split('.');
            parts.pop();
            trigraph = parts.join('.').toUpperCase();
        }
        
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");
            
            const agReleases = Array.from(xmlDoc.getElementsByTagName("AG_Release"));
            const sysModes = Array.from(xmlDoc.getElementsByTagName("SYS_Mode"));
            
            const releasesSet = new Set(agReleases);
            sysModes.forEach(sm => {
                if (sm.textContent && sm.textContent.includes("AG_GUN")) {
                    releasesSet.add(sm.parentNode);
                }
            });
            const releases = Array.from(releasesSet);
            
            parsedXMLReleases = [];
            createdTargets.forEach(t => t.linkedXmlReleaseIndex = null);
            for (let i = 0; i < releases.length; i++) {
                const rel = releases[i];
                const timeUTCNode = rel.getElementsByTagName("UTC")[0] || rel.getElementsByTagName("Time_UTC")[0];
                let timeUTC = timeUTCNode ? timeUTCNode.textContent.trim() : "00:00:00";
                let rawMs = null;
                
                // Se vier como milissegundos (ex: 61918700), converter para HH:MM:SS
                if (/^\d+$/.test(timeUTC) && timeUTC.length > 6) {
                    const totalMs = parseInt(timeUTC);
                    rawMs = totalMs;
                    const totalSec = Math.floor(totalMs / 1000);
                    const h = Math.floor(totalSec / 3600);
                    const m = Math.floor((totalSec % 3600) / 60);
                    const s = totalSec % 60;
                    timeUTC = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                } else if (typeof timeUTC === 'string' && timeUTC.includes(':')) {
                    // Formato HH:MM:SS ou HH:MM:SS.mmm
                    const parts = timeUTC.split(':');
                    const h = parseInt(parts[0] || 0);
                    const m = parseInt(parts[1] || 0);
                    const sParts = (parts[2] || "0").split('.');
                    const s = parseInt(sParts[0] || 0);
                    const msPart = sParts[1] || "";
                    const ms = parseInt(msPart.padEnd(3, '0').substring(0, 3) || 0);
                    rawMs = (h * 3600 + m * 60 + s) * 1000 + ms;
                } else if (/^\d{6}$/.test(timeUTC)) {
                    // Formato HHMMSS
                    const h = parseInt(timeUTC.substring(0, 2));
                    const m = parseInt(timeUTC.substring(2, 4));
                    const s = parseInt(timeUTC.substring(4, 6));
                    rawMs = (h * 3600 + m * 60 + s) * 1000;
                    timeUTC = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
                }
                
                const weaponNode = rel.getElementsByTagName("Weapon_Type")[0];
                const rawWeapon = weaponNode ? weaponNode.textContent.trim().toUpperCase() : "";
                let mappedWeapon = "-";
                if (rawWeapon) {
                    if (rawWeapon.includes("FG230") || rawWeapon.includes("230")) {
                        mappedWeapon = "BAFG-230";
                    } else if (rawWeapon.includes("FG120") || rawWeapon.includes("120")) {
                        mappedWeapon = "BAFG-120";
                    } else if (rawWeapon.includes("SBAT") || rawWeapon.includes("70") || rawWeapon.includes("RK275") || rawWeapon.includes("275")) {
                        mappedWeapon = "SBAT-70";
                    } else if (rawWeapon.includes("GUN") || rawWeapon.includes("INGUN")) {
                        mappedWeapon = "GUNS";
                    } else {
                        mappedWeapon = rawWeapon; // Fallback
                    }
                }
                
                const getCoordinate = (relNode, isLat) => {
                    const exactMatches = isLat ? 
                        ["TGT_Lat", "Target_Lat", "Impact_Lat", "Latitude", "Lat", "AC_Lat", "Aircraft_Lat", "A_C_Lat"] : 
                        ["TGR_Long", "TGT_Long", "Target_Long", "Impact_Long", "Longitude", "Long", "Lon", "AC_Long", "Aircraft_Long", "A_C_Long"];
                    
                    for (let match of exactMatches) {
                        const node = relNode.getElementsByTagName(match)[0];
                        if (node && !isNaN(parseFloat(node.textContent)) && parseFloat(node.textContent) !== 0) {
                            return parseFloat(node.textContent);
                        }
                    }
                    
                    for (let c = 0; c < relNode.children.length; c++) {
                        const t = relNode.children[c].tagName.toUpperCase();
                        const val = parseFloat(relNode.children[c].textContent);
                        if (isNaN(val) || val === 0) continue;
                        if (isLat && t.includes("LAT") && !t.includes("FLAT")) return val;
                        if (!isLat && (t.includes("LON") || t.includes("LNG"))) return val;
                    }
                    return 0;
                };

                const getHeading = (relNode) => {
                    const exactMatches = ["True_Heading", "Heading", "HDG", "Aircraft_Heading"];
                    for (let match of exactMatches) {
                        const node = relNode.getElementsByTagName(match)[0];
                        if (node && !isNaN(parseFloat(node.textContent))) {
                            return parseFloat(node.textContent);
                        }
                    }
                    return 0;
                };
                
                parsedXMLReleases.push({
                    tgtLat: getCoordinate(rel, true),
                    tgrLong: getCoordinate(rel, false),
                    trueHeading: getHeading(rel),
                    calcMisAL: parseFloat(rel.getElementsByTagName("Calculated_Mis_AL")[0]?.textContent || 0),
                    calcMisAC: parseFloat(rel.getElementsByTagName("Calculated_Mis_AC")[0]?.textContent || 0),
                    rawMs: rawMs,
                    timeUTC: timeUTC,
                    wdTitle: trigraph ? `${trigraph} WD${i + 1}` : `WD ${timeUTC}`,
                    quantity: parseInt(rel.getElementsByTagName("Quantity")[0]?.textContent || 0) || null,
                    ripple:   parseFloat(rel.getElementsByTagName("Interval")[0]?.textContent || 0) || null,
                    weaponType: mappedWeapon
                });
            }
            
            telemetryReleaseSelect.innerHTML = '';
            if (telemetryVisibilityPanel) telemetryVisibilityPanel.innerHTML = '';
            parsedTelemetryReleasesVisibility = [];
            telemetryReleaseGroup.style.display = 'none';

            if (parsedXMLReleases.length > 0) {
                // Auto-save todos os empregos
                parsedXMLReleases.forEach((rel, index) => {
                    window.currentXMLTrigraph = trigraph;
                    applyXMLRelease(index);
                    executeSaveEmployment(rel.wdTitle);
                });
                window.currentXMLTrigraph = null;
                
                // Limpa a telemetria pendente para evitar visualizaÃ§Ã£o duplicada
                parsedXMLReleases = [];
                
                updateTargetListUI();
            } else {
                alert("Nenhum dado de Emprego (AG_Release / GUN) encontrado no arquivo XML.");
            }
        } catch (error) {
            console.error("Erro ao processar o XML:", error);
            alert("Falha ao ler o arquivo XML de Telemetria.");
        } finally {
            telemetryFileInput.value = '';
        }
    }

    function applyXMLRelease(index) {
        const rel = parsedXMLReleases[index];
        if (!rel) return;
        window.currentXMLTime = rel.timeUTC;
        window.currentXMLRawMs = rel.rawMs;
        
        // ConversÃ£o: valores do XML multiplicar por 180
        const latDeg = rel.tgtLat * 180;
        const lngDeg = rel.tgrLong * 180;
        let headingDeg = rel.trueHeading; // JÃ¡ em graus
        
        // Eixo MagnÃ©tico = Eixo Verdadeiro - DeclinaÃ§Ã£o
        const dec = parseFloat(document.getElementById('mag-declination') ? document.getElementById('mag-declination').value : 0) || 0;
        headingDeg = (headingDeg - dec + 360) % 360;
        
        // Atualizando os campos da DesignaÃ§Ã£o (Real)
        const designationCoordsInput = document.getElementById('designation-coords');
        const designationHeadingInput = document.getElementById('designation-heading');
        const latErrorInput = document.getElementById('lat-error');
        const longErrorInput = document.getElementById('long-error');
        const showEffectedCheck = document.getElementById('show-effected');
        
        if (designationCoordsInput) designationCoordsInput.value = formatCoords(latDeg, lngDeg);
        if (designationHeadingInput) designationHeadingInput.value = Math.round(headingDeg);
        if (latErrorInput) latErrorInput.value = rel.calcMisAC.toFixed(1);
        if (longErrorInput) longErrorInput.value = rel.calcMisAL.toFixed(1);
        
        const designationWeaponInput = document.getElementById('designation-weapon');
        if (designationWeaponInput) designationWeaponInput.value = rel.weaponType || "-";

        if (rel.weaponType && ['BAFG-230', 'BAFG-120', 'SBAT-70', 'GUNS'].includes(rel.weaponType)) {
            weaponSelect.value = rel.weaponType;
            if (WEAPON_DEFAULTS[rel.weaponType] !== undefined) {
                const isFt = getAmeUnit() === 'ft';
                const valueM = WEAPON_DEFAULTS[rel.weaponType];
                ameRadiusInput.value = isFt ? Math.min(328, Math.round(valueM * 3.28084 * 10) / 10) : valueM;
            }
        }

        // Quantidade e Ripple do XML (sÃ³ sobrescreve se o XML tiver o dado)
        const desQtyInput = document.getElementById('designation-qty');
        const desRippleInput = document.getElementById('designation-ripple');
        if (rel.quantity !== null && desQtyInput) desQtyInput.value = rel.quantity;
        if (rel.ripple !== null && desRippleInput) desRippleInput.value = rel.ripple;
        
        if (showEffectedCheck) showEffectedCheck.checked = true;

        // Definir designationLatLng globalmente â€” drawImpactsOnMap vai renderizar o marcador
        designationLatLng = L.latLng(latDeg, lngDeg);
        if (designationMarker) { map.removeLayer(designationMarker); designationMarker = null; }

        drawImpactsOnMap();
    }
    document.getElementById('lat-error').addEventListener('input', drawImpactsOnMap);
    document.getElementById('long-error').addEventListener('input', drawImpactsOnMap);
    if (document.getElementById('designation-qty')) document.getElementById('designation-qty').addEventListener('input', drawImpactsOnMap);
    if (document.getElementById('designation-ripple')) document.getElementById('designation-ripple').addEventListener('input', drawImpactsOnMap);
    document.getElementById('designation-heading').addEventListener('input', () => {
        const desHeadingInput = document.getElementById('designation-heading');
        let val = parseInt(desHeadingInput.value);
        if (isNaN(val)) {
            drawImpactsOnMap();
            return;
        }
        
        if (val < 0) {
            desHeadingInput.value = 359;
        } else if (val >= 360) {
            desHeadingInput.value = 0;
        }
        
        drawImpactsOnMap();
    });

    function updateMapMarkers() {
        const show = showLegends;
        if (targetMarker) { if (show) targetMarker.openTooltip(); else targetMarker.closeTooltip(); }
        if (designationMarker) { if (show) designationMarker.openTooltip(); else designationMarker.closeTooltip(); }
    }

    function handleEnter(e, type) {
        if (e.key === 'Enter') {
            const pos = parseInputCoords(e.target.value);
            if (pos) {
                if (type === 'target') {
                    updateTargetMarker(pos);
                    map.setView(targetLatLng, 18);
                } else if (type === 'designation') {
                    if (designationMarker) map.removeLayer(designationMarker);
                    const dIcon = L.divIcon({ className: 'design-marker-icon', html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><circle cx="15" cy="15" r="12" stroke="#00ff00" stroke-width="2" fill="none" /><circle cx="15" cy="15" r="3" fill="#00ff00" /></svg>`, iconSize: [30, 30], iconAnchor: [15, 15] });
                    designationLatLng = L.latLng(pos.lat, pos.lng);
                    designationMarker = L.marker(designationLatLng, { icon: dIcon }).addTo(map);
                    designationMarker.bindTooltip("DesignaÃ§Ã£o");
                    if (showLegends) designationMarker.openTooltip();
                    map.setView(designationLatLng, 18);
                }
                updateDistance();
                drawImpactsOnMap();
            } else { alert('Formato de coordenada invÃ¡lido.'); }
        }
    }

    targetCoordsInput.addEventListener('keypress', (e) => handleEnter(e, 'target'));
    designationCoordsInput.addEventListener('keypress', (e) => handleEnter(e, 'designation'));

        function updateDistance() {
        if (!targetLatLng || !designationLatLng) {
            if(designationCoordsInput) designationCoordsInput.title = "";
            return;
        }
        const dist = targetLatLng.distanceTo(designationLatLng);
        const distText = "Erro de Designa\xE7\xE3o: " + dist.toFixed(1) + " m / " + (dist * 3.28084).toFixed(1) + " ft";
        if(designationCoordsInput) designationCoordsInput.title = distText; }

    function saveFormToActiveXMLRelease() {
        if (!targetAcquisitionSelect || targetAcquisitionSelect.value !== 'telemetry') return;
        const idx = parsedXMLReleases.length > 0 ? parseInt(telemetryReleaseSelect.value || 0) : -1;
        if (idx === -1 || !parsedXMLReleases[idx]) return;
        
        const rel = parsedXMLReleases[idx];
        
        // Coordenadas (em semicÃ­rculos: graus / 180)
        if (designationLatLng) {
            rel.tgtLat = designationLatLng.lat / 180;
            rel.tgrLong = designationLatLng.lng / 180;
        }
        
        // Eixo Verdadeiro = Eixo MagnÃ©tico + DeclinaÃ§Ã£o
        const desHeadingInput = document.getElementById('designation-heading');
        const dec = parseFloat(document.getElementById('mag-declination') ? document.getElementById('mag-declination').value : 0) || 0;
        if (desHeadingInput && desHeadingInput.value !== "") {
            rel.trueHeading = (parseInt(desHeadingInput.value || 0) + dec + 360) % 360;
        }
        
        // Erros:
        // lat-error (Erro Lateral / AC) -> calcMisAC
        // long-error (Erro Longitudinal / AL) -> calcMisAL
        const latErrorInput = document.getElementById('lat-error');
        const longErrorInput = document.getElementById('long-error');
        if (latErrorInput) rel.calcMisAC = parseFloat(latErrorInput.value || 0);
        if (longErrorInput) rel.calcMisAL = parseFloat(longErrorInput.value || 0);
        
        // Quantidade e Ripple
        const desQtyInput = document.getElementById('designation-qty');
        const desRippleInput = document.getElementById('designation-ripple');
        if (desQtyInput) rel.quantity = parseInt(desQtyInput.value || 1);
        if (desRippleInput) rel.ripple = parseFloat(desRippleInput.value || 0);
    }

    function drawImpactsOnMap() {
        saveFormToActiveXMLRelease();
        impactLayer.clearLayers();
        if (editingEmploymentId !== null) {
            updateActiveEditing();
        }
        if (!designationLatLng && !targetLatLng) return;
        const magHeading = parseInt(headingInput.value || 0);
        const dec = parseFloat(magDeclinationInput.value || 0);
        const heading = (magHeading + dec); 
        const qty = parseInt(bombQtyInput.value || 1);
        const ripple = parseFloat(rippleDistInput.value || 13);
        const ameInput = parseFloat(ameRadiusInput.value || 7);
        const ameUnit = getAmeUnit();
        const baseAme = ameUnit === 'ft' ? ameInput * 0.3048 : ameInput;
        const ame = baseAme * getTargetMultiplier();
        const weapon = weaponSelect.value;
        if (!weapon) return;
        if (showCalculatedCheck.checked && targetLatLng) { drawEmploymentSet(targetLatLng, heading, qty, ripple, ame, 'red', impactLayer, releaseModeSelect.value, false, false, weapon); }
        if (showEffectedCheck.checked && designationLatLng && editingEmploymentId === null) {
            const desHeadingInput = document.getElementById('designation-heading');
            let desHeading = heading;
            if (desHeadingInput && desHeadingInput.value !== "") {
                desHeading = parseInt(desHeadingInput.value || 0) + dec;
            }
            
            // Le os parametros proprios da designacao, se existirem, senao fallback
            const desQty = designationQtyInput ? parseInt(designationQtyInput.value || 1) : qty;
            const desRipple = designationRippleInput ? parseFloat(designationRippleInput.value || 13) : ripple;
            
            const rad = (desHeading * Math.PI / 180);
            const latErr = parseFloat(document.getElementById('lat-error').value || 0);
            const longErr = parseFloat(document.getElementById('long-error').value || 0);
            const latErrM = latErr * 0.3048;
            const longErrM = longErr * 0.3048;
            const dLatLong = (longErrM * Math.cos(rad)) / 111111;
            const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(designationLatLng.lat * Math.PI / 180));
            const latHead = (desHeading + 90) % 360;
            const dLatLat = (latErrM * Math.cos(latHead * Math.PI / 180)) / 111111;
            const dLngLat = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * Math.cos(designationLatLng.lat * Math.PI / 180));
            const effectedCenter = L.latLng(designationLatLng.lat + dLatLong + dLatLat, designationLatLng.lng + dLngLong + dLngLat);
            let desWeapon = document.getElementById('designation-weapon')?.value || 'BAFG-230';
            if (desWeapon === '-') desWeapon = weaponSelect.value;
            drawEmploymentSet(effectedCenter, desHeading, desQty, desRipple, ame, '#00ff00', impactLayer, releaseModeSelect.value, true, false, desWeapon);
        }
        
        // Renderizar outros Empregos XML marcados como visÃ­veis
        // O Ã­ndice ativo Ã© sempre o do select quando hÃ¡ empregos XML carregados.
        // NÃ£o depende da visibilidade do painel (que some quando hÃ¡ sÃ³ 1 emprego).
        const activeTelemetryIndex = parsedXMLReleases.length > 0 ? parseInt(telemetryReleaseSelect.value || 0) : -1;
        
        parsedXMLReleases.forEach((rel, index) => {
            if (index === activeTelemetryIndex) return; // JÃ¡ Ã© renderizado pelo formulÃ¡rio acima
            if (!parsedTelemetryReleasesVisibility[index]) return; // Visibilidade desativada
            
            const rLatDeg = rel.tgtLat * 180;
            const rLngDeg = rel.tgrLong * 180;
            
            // Usar Eixo Verdadeiro (True Heading) direto para cÃ¡lculos e renderizaÃ§Ã£o no mapa
            const rHeadingDeg = rel.trueHeading;
            
            const rCenter = L.latLng(rLatDeg, rLngDeg);
            
            // Mapeando erro (AL = Longitudinal, AC = Lateral)
            const rLongErrM = rel.calcMisAL * 0.3048; // AL = Longitudinal
            const rLatErrM = rel.calcMisAC * 0.3048;  // AC = Lateral
            
            const rRad = (rHeadingDeg * Math.PI / 180);
            const rLatLong = (rLongErrM * Math.cos(rRad)) / 111111;
            const rLngLong = (rLongErrM * Math.sin(rRad)) / (111111 * Math.cos(rLatDeg * Math.PI / 180));
            
            const rLatHead = (rHeadingDeg + 90) % 360;
            const rdLatLat = (rLatErrM * Math.cos(rLatHead * Math.PI / 180)) / 111111;
            const rdLngLat = (rLatErrM * Math.sin(rLatHead * Math.PI / 180)) / (111111 * Math.cos(rLatDeg * Math.PI / 180));
            
            const rEffectedCenter = L.latLng(rLatDeg + rLatLong + rdLatLat, rLngDeg + rLngLong + rdLngLat);
            
            const rQty = rel.quantity || 1;
            const rRipple = rel.ripple || 0;
            let rWeapon = rel.weaponType || 'BAFG-230';
            if (rWeapon === '-') rWeapon = weaponSelect.value;
            drawEmploymentSet(rEffectedCenter, rHeadingDeg, rQty, rRipple, ame, '#00ff00', impactLayer, releaseModeSelect.value, true, true, rWeapon);
        });
        
        // Recalcular eficÃ¡cia do emprego contra o alvo
        validateEmploymentEfficacy();
    }

    function drawEmploymentSet(center, heading, qty, ripple, ame, color, layer, releaseMode = 'SGL', isDesignation = false, isSecondary = false, weapon = 'BAFG-230') {
        const rad = (heading * Math.PI / 180);
        const lineDist = 100;
        const p1Lat = center.lat - (lineDist * Math.cos(rad)) / 111111;
        const p1Lng = center.lng - (lineDist * Math.sin(rad)) / (111111 * Math.cos(center.lat * Math.PI / 180));
        const p2Lat = center.lat + (lineDist * Math.cos(rad)) / 111111;
        const p2Lng = center.lng + (lineDist * Math.sin(rad)) / (111111 * Math.cos(center.lat * Math.PI / 180));
        
        if (isDesignation) {
            // PadrÃ£o anterior: linha tracejada, sem seta
            L.polyline([[p1Lat, p1Lng], [p2Lat, p2Lng]], { color: color, weight: 1.5, dashArray: '10, 10', opacity: 0.8 }).addTo(layer);
        } else {
            // Novo padrÃ£o (Targeting): linha contÃ­nua com ponta de seta discreta
            L.polyline([[p1Lat, p1Lng], [p2Lat, p2Lng]], { color: color, weight: 1.5, opacity: 0.8 }).addTo(layer);
            
            const arrowSize = 8; // seta mais discreta
            const arrowAngle1 = (heading + 180 + 30) * Math.PI / 180;
            const arrowAngle2 = (heading + 180 - 30) * Math.PI / 180;
            
            const a1Lat = p2Lat + (arrowSize * Math.cos(arrowAngle1)) / 111111;
            const a1Lng = p2Lng + (arrowSize * Math.sin(arrowAngle1)) / (111111 * Math.cos(center.lat * Math.PI / 180));
            
            const a2Lat = p2Lat + (arrowSize * Math.cos(arrowAngle2)) / 111111;
            const a2Lng = p2Lng + (arrowSize * Math.sin(arrowAngle2)) / (111111 * Math.cos(center.lat * Math.PI / 180));
            
            L.polyline([[a1Lat, a1Lng], [p2Lat, p2Lng], [a2Lat, a2Lng]], { color: color, weight: 1.5, opacity: 0.8 }).addTo(layer);
        }

        const points = getImpactPoints(center, heading, qty, ripple, releaseMode, weapon);

        if (weapon === 'SBAT-70' || weapon === 'GUNS') {
            // Desenha as duas Elipses de DispersÃ£o no Leaflet (pods gÃªmeos)
            let R = ame; 
            let a = 20, b = 6;
            if (weapon === 'SBAT-70') {
                a = R * 10;
                b = R * 3;
            } else if (weapon === 'GUNS') {
                a = R * 20;
                b = R * 5;
            }

            // Calcula os dois centros com afastamento de 2m para cada lado (espaÃ§amento total de 4m)
            const radPerp = ((heading + 90) % 360) * Math.PI / 180;
            const shiftDist = 2; // metros
            const dLat1 = (-shiftDist * Math.cos(radPerp)) / 111111;
            const dLng1 = (-shiftDist * Math.sin(radPerp)) / (111111 * Math.cos(center.lat * Math.PI / 180));
            const center1 = L.latLng(center.lat + dLat1, center.lng + dLng1);

            const dLat2 = (shiftDist * Math.cos(radPerp)) / 111111;
            const dLng2 = (shiftDist * Math.sin(radPerp)) / (111111 * Math.cos(center.lat * Math.PI / 180));
            const center2 = L.latLng(center.lat + dLat2, center.lng + dLng2);

            const centers = [center1, center2];

            centers.forEach(c => {
                const ellipseLatLngs = [];
                const steps = 64;
                for (let i = 0; i < steps; i++) {
                    const angle = (i * 360 / steps) * Math.PI / 180;
                    const x = a * Math.cos(angle);
                    const y = b * Math.sin(angle);
                    const dLat = (x * Math.cos(rad) - y * Math.sin(rad)) / 111111;
                    const dLng = (x * Math.sin(rad) + y * Math.cos(rad)) / (111111 * Math.cos(c.lat * Math.PI / 180));
                    ellipseLatLngs.push(L.latLng(c.lat + dLat, c.lng + dLng));
                }

                L.polygon(ellipseLatLngs, {
                    color: color,
                    fillColor: color,
                    fillOpacity: isSecondary ? 0.02 : 0.08,
                    weight: 1.5,
                    dashArray: isSecondary ? '6, 6' : '3, 3'
                }).addTo(layer);
            });

            points.forEach(pt => {
                L.circleMarker([pt.lat, pt.lng], {
                    radius: 2,
                    color: color,
                    fillColor: '#ffffff',
                    fillOpacity: 1,
                    weight: 0.8
                }).addTo(layer);
            });
            
            L.circleMarker([center.lat, center.lng], {
                radius: 1.2,
                color: color,
                fillColor: color,
                fillOpacity: 1
            }).addTo(layer);
            
            return;
        }

        points.forEach(pt => {
            if (showFragmentationCheck.checked) {
                L.circle([pt.lat, pt.lng], { 
                    radius: 200, 
                    color: color, 
                    fillColor: color, 
                    fillOpacity: 0.10, 
                    weight: 1.5, 
                    dashArray: '4, 6', 
                    opacity: 0.75 
                }).addTo(layer);
            }
            if (isDesignation) {
                L.circle([pt.lat, pt.lng], { 
                    radius: ame, 
                    color: color, 
                    fillColor: color, 
                    fillOpacity: 0.2, 
                    weight: 2,
                    dashArray: isSecondary ? '5, 5' : null
                }).addTo(layer);
            } else {
                L.circle([pt.lat, pt.lng], { radius: ame, color: color, fillColor: 'transparent', fillOpacity: 0, weight: 2 }).addTo(layer);
            }
            L.circleMarker([pt.lat, pt.lng], { radius: 2, color: color, fillColor: color, fillOpacity: 1 }).addTo(layer);
        });
    }

    // ---- SISTEMA DE EMPREGOS SALVOS ----
    const COLORS = ['#00d2ff', '#00ff00', '#ff0000', '#ffff00', '#ffffff', '#ffa500', '#ff00ff'];

    function saveEmployment() {
        if (editingEmploymentId !== null) {
            alert('As alterações do emprego atual já foram salvas em tempo real. Saindo do modo de edição para planejar um novo ataque.');
            window.originalEditingEmployment = null;
            stopEditing();
            return;
        }

        if (!designationLatLng) {
            alert('Por favor, defina a Coordenada de DesignaÃ§Ã£o (Resultado Piloto) antes de salvar.');
            return;
        }
        
        // Open the custom tactical modal instead of prompt
        const defaultSuggestedName = (employmentCounter === 1) ? "Ã s" : `#${employmentCounter}`;
        modalInput.value = defaultSuggestedName;
        saveModal.style.display = 'flex';
        modalInput.focus();
        modalInput.select();
    }

    function executeSaveEmployment(nameText) {
        const magHeading = parseInt(headingInput.value || 0);
        const dec = parseFloat(magDeclinationInput.value || 0);
        const heading = magHeading + dec;
        const qty = parseInt(bombQtyInput.value || 1);
        const ripple = parseFloat(rippleDistInput.value || 13);
        const ameInput = parseFloat(ameRadiusInput.value || 7);
        const ameUnit = getAmeUnit();
        const ame = ameUnit === 'ft' ? ameInput * 0.3048 : ameInput;
        const weapon = weaponSelect.value || '?';
        let color = COLORS[(employmentCounter - 1) % COLORS.length];
        
        // Automated color-matching to pilot's route (trigraph)
        const trigraphToMatch = window.currentXMLTrigraph || null;
        if (trigraphToMatch) {
            const cleanTri = trigraphToMatch.trim().toUpperCase().substring(0, 3);
            const tracks = (typeof window.getLoadedTracks === 'function') ? window.getLoadedTracks() : [];
            const matchingTrack = tracks.find(track => {
                let trackTri = track.name;
                if (trackTri.includes('.')) {
                    trackTri = trackTri.split('.')[0];
                }
                trackTri = trackTri.trim().toUpperCase();
                const cleanTrackTri = trackTri.substring(0, 3);
                return cleanTrackTri === cleanTri || trackTri.startsWith(cleanTri) || cleanTri.startsWith(trackTri);
            });
            if (matchingTrack) {
                color = matchingTrack.color;
            }
        }

        const layerGroup = L.layerGroup().addTo(map);

        // Desenha apenas o emprego correspondente aos dados de RESULTADO PILOTO (Emprego Efetuado / Real)
        const desHeadingInput = document.getElementById('designation-heading');
        let desHeading = heading;
        let displayHeading = magHeading; // planejado como padrÃ£o
        if (desHeadingInput && desHeadingInput.value !== "") {
            const parsedReal = parseInt(desHeadingInput.value || 0);
            desHeading = parsedReal + dec;
            displayHeading = parsedReal;
        }

        const rad = (desHeading * Math.PI / 180);
        const latErr = parseFloat(document.getElementById('lat-error').value || 0);
        const longErr = parseFloat(document.getElementById('long-error').value || 0);
        const latErrM = latErr * 0.3048;
        const longErrM = longErr * 0.3048;
        const dLatLong = (longErrM * Math.cos(rad)) / 111111;
        const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(designationLatLng.lat * Math.PI / 180));
        const latHead = (desHeading + 90) % 360;
        const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * Math.cos(designationLatLng.lat * Math.PI / 180));
        const effectedCenter = L.latLng(designationLatLng.lat + dLatLong + (latErrM * Math.cos(latHead * Math.PI / 180)) / 111111, designationLatLng.lng + dLngLong + dLngLatCalc);
        
        const emp = { xmlTimeUTC: window.currentXMLTime || null, telemetryTimeMs: window.currentXMLRawMs ? window.currentXMLRawMs : (window.getCurrentTelemetryTime ? window.getCurrentTelemetryTime() : 0), timeSyncEnabled: false, 
            trigraph: window.currentXMLTrigraph || null,
            id: employmentCounter, 
            name: nameText, 
            weapon: weapon,
            qty: qty, 
            ripple: ripple, 
            desQty: designationQtyInput ? parseInt(designationQtyInput.value || 1) : qty,
            desRipple: designationRippleInput ? parseFloat(designationRippleInput.value || 13) : ripple,
            releaseMode: releaseModeSelect.value,
            ameInput: ameInput,
            ameUnit: ameUnit, 
            magHeading: displayHeading, 
            designationCoordsText: designationCoordsInput.value,
            designationLatLng: designationLatLng,
            latErr: latErr,
            longErr: longErr,
            displayHeading: desHeadingInput ? desHeadingInput.value : '',
            layerGroup: layerGroup, 
            visible: true, 
            color: color,
            designationWeaponText: document.getElementById('designation-weapon') ? document.getElementById('designation-weapon').value : '-',
            
            // Persistent Target Area Details
            targetCoordsText: targetCoordsInput.value,
            targetLatLng: targetLatLng ? L.latLng(targetLatLng.lat, targetLatLng.lng) : null,
            targetPolygonPoints: targetPolygonPoints ? targetPolygonPoints.map(pt => L.latLng(pt.lat, pt.lng)) : null,
            currentTargetMetadata: currentTargetMetadata ? { ...currentTargetMetadata } : null,
            targetAcquisition: targetAcquisitionSelect ? targetAcquisitionSelect.value : 'manual',
            targetType: targetTypeSelect ? targetTypeSelect.value : 'infrastructure',
            dmpiValue: document.getElementById('dmpi-id').value,
            targetFolderName: document.getElementById('target-folder-name').textContent
         };
         
        let finalWeapon = emp.designationWeaponText;
        if (!finalWeapon || finalWeapon === '-') finalWeapon = emp.weapon;
         
        drawEmploymentSet(effectedCenter, desHeading, emp.desQty, emp.desRipple, ame, color, layerGroup, releaseModeSelect.value, true, false, finalWeapon);
        
        emp.designationElevation = 0;
        if (effectedCenter) {
            fetch(`https://api.open-meteo.com/v1/elevation?latitude=${effectedCenter.lat}&longitude=${effectedCenter.lng}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.elevation && data.elevation.length > 0) {
                        emp.designationElevation = Math.round(data.elevation[0] * 3.28084);
                        renderEmploymentList();
                        if (window.onTelemetryTimeUpdate && window.getCurrentTelemetryTime) {
                            window.onTelemetryTimeUpdate(window.getCurrentTelemetryTime());
                        }
                    }
                })
                .catch(err => console.error("Erro ao buscar elevação de designação:", err));
        }

        savedEmployments.push(emp);
        employmentCounter++;

        // Clear active designation coordinates and marker so temporary green circles disappear
        designationLatLng = null;
        if (designationMarker) {
            map.removeLayer(designationMarker);
            designationMarker = null;
        }
        document.getElementById('designation-coords').value = '';
        if (document.getElementById('designation-weapon')) document.getElementById('designation-weapon').value = '-';
        document.getElementById('lat-error').value = 0;
        document.getElementById('long-error').value = 0;
        document.getElementById('designation-heading').value = '';

        drawImpactsOnMap();
        renderEmploymentList();
        window.currentXMLTime = null;
        window.currentXMLRawMs = null;
    }

    function triggerSplashEffect(emp) {
        if (!emp.layerGroup) return;
        emp.layerGroup.eachLayer(layer => {
            if (typeof layer.setRadius === 'function') {
                const originalRadius = layer.getRadius();
                const originalColor = layer.options.color;
                const originalFillColor = layer.options.fillColor;
                
                layer.setRadius(originalRadius * 3);
                layer.setStyle({ color: '#ff0000', fillColor: '#ff0000' });
                
                setTimeout(() => {
                    if (map.hasLayer(layer)) {
                        layer.setRadius(originalRadius);
                        layer.setStyle({ color: originalColor, fillColor: originalFillColor });
                    }
                }, 500);
            }
        });
        if (typeof window.flashAirplanes === 'function') {
            window.flashAirplanes();
        }
    }

    function getAircraftAltitudeAtTime(timeMs, trigraph) {
        const tracks = (typeof window.getLoadedTracks === 'function') ? window.getLoadedTracks() : [];
        if (!tracks || tracks.length === 0) return null;

        let bestPoint = null;
        let minTimeDiff = Infinity;

        // 1. Try to match by trigraph first if available
        if (trigraph) {
            const cleanTrigraph = trigraph.trim().toUpperCase();
            const matchingTracks = tracks.filter(t => t.name && t.name.toUpperCase().includes(cleanTrigraph));
            if (matchingTracks.length > 0) {
                matchingTracks.forEach(track => {
                    if (!track.data || track.data.length === 0) return;
                    track.data.forEach(pt => {
                        const diff = Math.abs(pt.timeMs - timeMs);
                        if (diff < minTimeDiff) {
                            minTimeDiff = diff;
                            bestPoint = pt;
                        }
                    });
                });
                if (bestPoint && minTimeDiff < 30000) { // within 30 seconds
                    return bestPoint.alt;
                }
            }
        }

        // 2. Fallback: Search all tracks for the closest point in time
        bestPoint = null;
        minTimeDiff = Infinity;
        tracks.forEach(track => {
            if (!track.data || track.data.length === 0) return;
            track.data.forEach(pt => {
                const diff = Math.abs(pt.timeMs - timeMs);
                if (diff < minTimeDiff) {
                    minTimeDiff = diff;
                    bestPoint = pt;
                }
            });
        });

        if (bestPoint && minTimeDiff < 30000) { // within 30 seconds
            return bestPoint.alt;
        }
        return null;
    }

    function getBombFallDelay(alt) {
        if (alt <= 1200) return 7;
        if (alt <= 2500) return 6;
        if (alt <= 3200) return 9;
        if (alt <= 5000) return 14;
        if (alt <= 8000) return 16;
        return 22;
    }

    let lastTracksFingerprint = '';

    window.onTelemetryTimeUpdate = (currentGlobalTimeMs) => {
        if (typeof checkTargetsTimeSync === 'function') {
            checkTargetsTimeSync();
        }
        const currentTracks = (typeof window.getLoadedTracks === 'function') ? window.getLoadedTracks() : [];
        const tracksFingerprint = currentTracks.map(t => t.id + '_' + (t.data ? t.data.length : 0)).join('|');
        let shouldRerenderList = false;

        if (tracksFingerprint !== lastTracksFingerprint) {
            savedEmployments.forEach(emp => {
                delete emp.explosionDelayMs;
                delete emp.calculatedAltitude;
            });
            lastTracksFingerprint = tracksFingerprint;
            shouldRerenderList = true;
        }

        savedEmployments.forEach(emp => {
            if (emp.timeSyncEnabled) {
                if (emp.explosionDelayMs === undefined) {
                    const alt = getAircraftAltitudeAtTime(emp.telemetryTimeMs, emp.trigraph);
                    emp.calculatedAltitude = alt;
                    
                    const w = emp.weapon || "";
                    if (w.startsWith("BAFG")) {
                        if (alt !== null) {
                            const cota = emp.designationElevation || 0;
                            const height = Math.max(0, alt - cota);
                            const delaySec = getBombFallDelay(height);
                            emp.explosionDelayMs = delaySec * 1000;
                        } else {
                            emp.explosionDelayMs = 5000;
                        }
                    } else if (w.includes("SBAT") || w === "GUNS") {
                        emp.explosionDelayMs = 3000;
                    } else {
                        emp.explosionDelayMs = 5000;
                    }
                    shouldRerenderList = true;
                }

                const delay = emp.explosionDelayMs || 0;
                const isAfter = currentGlobalTimeMs >= (emp.telemetryTimeMs + delay);
                if (isAfter) {
                    if (!map.hasLayer(emp.layerGroup)) {
                        map.addLayer(emp.layerGroup);
                        triggerSplashEffect(emp);
                    }
                } else {
                    if (map.hasLayer(emp.layerGroup)) {
                        map.removeLayer(emp.layerGroup);
                    }
                }
            } else {
                if (emp.visible && !map.hasLayer(emp.layerGroup)) map.addLayer(emp.layerGroup);
                else if (!emp.visible && map.hasLayer(emp.layerGroup)) map.removeLayer(emp.layerGroup);
            }
        });

        if (shouldRerenderList) {
            renderEmploymentList();
        }

        // Time sync for Artillery Impact drawings
        if (typeof tacticalPoints !== 'undefined' && tacticalPoints.artillery) {
            const timeToSeconds = (str) => {
                if (!str) return 0;
                const parts = str.split(':').map(Number);
                return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
            };

            const formatTime = (ms) => {
                if (!ms) return '00:00:00';
                const d = new Date(ms);
                return String(d.getUTCHours()).padStart(2, '0') + ':' + 
                       String(d.getUTCMinutes()).padStart(2, '0') + ':' + 
                       String(d.getUTCSeconds()).padStart(2, '0');
            };
            const currentTimeStr = formatTime(currentGlobalTimeMs);

            function isTimeBetween(t, start, end) {
                if (!start || !end) return true;
                const padTime = (str) => {
                    const parts = str.split(':');
                    while (parts.length < 3) parts.push('00');
                    return parts.map(p => p.padStart(2, '0')).join(':');
                };
                const tNorm = padTime(t);
                const startNorm = padTime(start);
                const endNorm = padTime(end);
                
                if (startNorm <= endNorm) {
                    return tNorm >= startNorm && tNorm <= endNorm;
                } else {
                    return tNorm >= startNorm || tNorm <= endNorm;
                }
            }

            const isValidLatLng = (ll) => ll && typeof ll.lat === 'number' && typeof ll.lng === 'number' && !isNaN(ll.lat) && !isNaN(ll.lng) && isFinite(ll.lat) && isFinite(ll.lng);

            tacticalPoints.artillery.forEach(pt => {
                if (!isValidLatLng(pt.latlng)) return;

                let impactLatLng = null;
                if (pt.impactCoords) {
                    impactLatLng = parseCoordsToLatLng(pt.impactCoords);
                }
                if (!impactLatLng && pt.gtl !== undefined && pt.gtl !== null && pt.range !== undefined && pt.range !== null) {
                    const magDec = parseFloat(document.getElementById('mag-declination').value || 0);
                    if (!isNaN(magDec)) {
                        let rangeMeters = pt.range;
                        if (pt.rangeUnit === 'NM') {
                            rangeMeters = pt.range * 1852;
                        }
                        const trueHeading = (pt.gtl + magDec + 360) % 360;
                        const rad = (trueHeading * Math.PI) / 180;
                        const distDegLat = (rangeMeters / 111111) * Math.cos(rad);
                        const distDegLng = (rangeMeters / (111111 * Math.cos(pt.latlng.lat * Math.PI / 180))) * Math.sin(rad);
                        impactLatLng = L.latLng(pt.latlng.lat + distDegLat, pt.latlng.lng + distDegLng);
                    }
                }

                if (!isValidLatLng(impactLatLng)) return;

                const windows = [
                    { s: pt.startTime, e: pt.endTime },
                    { s: pt.startTime2, e: pt.endTime2 },
                    { s: pt.startTime3, e: pt.endTime3 }
                ].filter(w => w.s && w.e);

                const activeWindow = windows.find(w => isTimeBetween(currentTimeStr, w.s, w.e));
                const active = !!activeWindow;

                pt.projectileMarkers = pt.projectileMarkers || [];
                pt.blastCircles = pt.blastCircles || [];

                let projIdx = 0;
                let blastIdx = 0;

                if (active) {
                    if (pt.impactLine && !map.hasLayer(pt.impactLine)) map.addLayer(pt.impactLine);
                    if (pt.corridorLines) pt.corridorLines.forEach(l => { if (!map.hasLayer(l)) map.addLayer(l); });
                    if (pt.impactMarker && !map.hasLayer(pt.impactMarker)) map.addLayer(pt.impactMarker);

                    // Ballistics speed = 800 m/s
                    const speedMps = 800;

                    // Compute precise current seconds since midnight
                    const dNow = new Date(currentGlobalTimeMs);
                    const exactCurrentSec = dNow.getUTCHours() * 3600 + dNow.getUTCMinutes() * 60 + dNow.getUTCSeconds() + (dNow.getUTCMilliseconds() / 1000);

                    const startSec = timeToSeconds(activeWindow.s);
                    const endSec = timeToSeconds(activeWindow.e);

                    let elapsedSec = 0;
                    if (startSec <= endSec) {
                        elapsedSec = exactCurrentSec - startSec;
                    } else {
                        if (exactCurrentSec >= startSec) {
                            elapsedSec = exactCurrentSec - startSec;
                        } else {
                            elapsedSec = (exactCurrentSec + 86400) - startSec;
                        }
                    }

                    const cadence = Math.max(0.1, pt.cadence || 3);
                    const cadenceIntervalSec = 60 / cadence;

                    if (!pt.cannons) pt.cannons = [];

                    let isShooting = true;
                    if (pt.artilleryType === 'Astros II' && pt.cannons.length > 0) {
                        const distM = pt.cannons[0].origin.distanceTo(pt.cannons[0].target);
                        const maxFlight = distM / speedMps;
                        if (elapsedSec > 6 + maxFlight + 1.0) {
                            isShooting = false;
                        }
                    }

                    if (isShooting) {
                        if (pt.corridorPolygon && !map.hasLayer(pt.corridorPolygon)) map.addLayer(pt.corridorPolygon);
                    } else {
                        if (pt.corridorPolygon && map.hasLayer(pt.corridorPolygon)) map.removeLayer(pt.corridorPolygon);
                    }

                    pt.cannons.forEach((cannon) => {
                        const distanceMeters = cannon.origin.distanceTo(cannon.target);
                        let flightTimeSec = distanceMeters / speedMps;
                        if (isNaN(flightTimeSec) || !isFinite(flightTimeSec)) flightTimeSec = 0;

                        const adjustedElapsedSec = elapsedSec - cannon.firingOffsetSec;
                        if (adjustedElapsedSec < 0) return;

                        let maxN = Math.floor(adjustedElapsedSec / cadenceIntervalSec);
                        let minN = Math.max(0, Math.floor((adjustedElapsedSec - flightTimeSec - 1.0) / cadenceIntervalSec), maxN - 5);

                        if (pt.artilleryType === 'Astros II') {
                            minN = 0;
                            maxN = 0;
                        }

                        for (let n = minN; n <= maxN; n++) {
                            const launchSec = n * cadenceIntervalSec;
                            const shotElapsed = adjustedElapsedSec - launchSec;

                            if (shotElapsed >= 0) {
                                if (shotElapsed < flightTimeSec) {
                                    const headProgress = shotElapsed / flightTimeSec;
                                    const tailProgress = Math.max(0, shotElapsed - 0.125) / flightTimeSec;
                                    
                                    const headLat = cannon.origin.lat + (cannon.target.lat - cannon.origin.lat) * headProgress;
                                    const headLng = cannon.origin.lng + (cannon.target.lng - cannon.origin.lng) * headProgress;
                                    const tailLat = cannon.origin.lat + (cannon.target.lat - cannon.origin.lat) * tailProgress;
                                    const tailLng = cannon.origin.lng + (cannon.target.lng - cannon.origin.lng) * tailProgress;

                                    let marker = pt.projectileMarkers[projIdx];
                                    if (!marker || marker.setStyle === undefined || marker.getLatLngs === undefined || typeof marker.setLatLngs !== 'function') {
                                        if (marker && map.hasLayer(marker)) map.removeLayer(marker);
                                        const projColor = pt.artilleryType === 'Astros II' ? 'white' : 'yellow';
                                        marker = L.polyline([ [tailLat, tailLng], [headLat, headLng] ], {
                                            color: projColor,
                                            weight: 1.5,
                                            opacity: 1
                                        }).addTo(map);
                                        pt.projectileMarkers[projIdx] = marker;
                                    } else {
                                        marker.setLatLngs([ [tailLat, tailLng], [headLat, headLng] ]);
                                        if (!map.hasLayer(marker)) marker.addTo(map);
                                    }
                                    projIdx++;

                                } else if (shotElapsed >= flightTimeSec && shotElapsed < flightTimeSec + 1.0) {
                                    // Blast / Impact
                                    const elapsedAfterImpact = shotElapsed - flightTimeSec;
                                    const scale = 1.0 + elapsedAfterImpact * 0.5;
                                    const opacity = Math.sin(elapsedAfterImpact * Math.PI) * 0.6;

                                    if (opacity > 0) {
                                        let circle = pt.blastCircles[blastIdx];
                                        if (!circle) {
                                            circle = L.circle(cannon.target, {
                                                radius: 15 * scale,
                                                color: 'red',
                                                fillColor: 'red',
                                                fillOpacity: opacity,
                                                opacity: opacity * 1.5,
                                                weight: 2
                                            }).addTo(map);
                                            pt.blastCircles[blastIdx] = circle;
                                        } else {
                                            circle.setLatLng(cannon.target);
                                            circle.setRadius(15 * scale);
                                            circle.setStyle({ fillOpacity: opacity, opacity: opacity * 1.5 });
                                            if (!map.hasLayer(circle)) circle.addTo(map);
                                        }
                                        blastIdx++;
                                    }
                                }
                            }
                        }
                    });
                } else {
                    if (pt.cannons) {
                        pt.cannons.forEach(c => { if (c.activeGreenLine && map.hasLayer(c.activeGreenLine)) map.removeLayer(c.activeGreenLine); });
                    }
                    if (pt.activeGreenLine && map.hasLayer(pt.activeGreenLine)) map.removeLayer(pt.activeGreenLine);

                    if (pt.timeSyncEnabled) {
                        if (pt.impactLine && map.hasLayer(pt.impactLine)) map.removeLayer(pt.impactLine);
                        if (pt.corridorLines) pt.corridorLines.forEach(l => { if (map.hasLayer(l)) map.removeLayer(l); });
                        if (pt.corridorPolygon && map.hasLayer(pt.corridorPolygon)) map.removeLayer(pt.corridorPolygon);
                        if (pt.batteryPolygon && map.hasLayer(pt.batteryPolygon)) map.removeLayer(pt.batteryPolygon);
                        if (pt.impactPolygon && map.hasLayer(pt.impactPolygon)) map.removeLayer(pt.impactPolygon);
                        if (pt.cannonMarkers) pt.cannonMarkers.forEach(m => { if (map.hasLayer(m)) map.removeLayer(m); });
                        if (pt.impactMarker && map.hasLayer(pt.impactMarker)) map.removeLayer(pt.impactMarker);
                    } else {
                        if (pt.impactLine && !map.hasLayer(pt.impactLine)) map.addLayer(pt.impactLine);
                        if (pt.corridorLines) pt.corridorLines.forEach(l => { if (!map.hasLayer(l)) map.addLayer(l); });
                        if (pt.corridorPolygon && !map.hasLayer(pt.corridorPolygon)) map.addLayer(pt.corridorPolygon);
                        if (pt.batteryPolygon && !map.hasLayer(pt.batteryPolygon)) map.addLayer(pt.batteryPolygon);
                        if (pt.impactPolygon && !map.hasLayer(pt.impactPolygon)) map.addLayer(pt.impactPolygon);
                        if (pt.cannonMarkers) pt.cannonMarkers.forEach(m => { if (!map.hasLayer(m)) map.addLayer(m); });
                        if (pt.impactMarker && !map.hasLayer(pt.impactMarker)) map.addLayer(pt.impactMarker);
                    }
                }

                // Remove unused pooled projectile markers from map
                for (let i = projIdx; i < pt.projectileMarkers.length; i++) {
                    if (pt.projectileMarkers[i] && map.hasLayer(pt.projectileMarkers[i])) map.removeLayer(pt.projectileMarkers[i]);
                }
                // Remove unused pooled blast circles from map
                for (let i = blastIdx; i < pt.blastCircles.length; i++) {
                    if (pt.blastCircles[i] && map.hasLayer(pt.blastCircles[i])) map.removeLayer(pt.blastCircles[i]);
                }
            });
        }
    };

    function renderEmploymentList() {
        const list = document.getElementById('employment-list');
        list.innerHTML = '';
        const syncAllEmploymentsBtn = document.getElementById('sync-all-employments');
        if (syncAllEmploymentsBtn) {
            syncAllEmploymentsBtn.checked = savedEmployments.length > 0 && savedEmployments.every(emp => emp.timeSyncEnabled);
        }
        if (typeof window.updateDebriefEmpregosUI === 'function') {
            window.updateDebriefEmpregosUI();
        }
        savedEmployments.forEach(emp => {
            const isEditing = emp.id === editingEmploymentId;
            const item = document.createElement('div');
            item.style.cssText = "background: #18181a; border: 1px solid #2a2a2d; border-radius: 6px; padding: 6px 10px; display: flex; align-items: stretch; gap: 10px; margin-bottom: 6px; transition: all 0.2s; cursor: pointer; " + (isEditing ? 'border-color: rgba(0, 210, 255, 0.5); box-shadow: 0 0 8px rgba(0, 210, 255, 0.2);' : '');
            const leftCol = document.createElement('div');
            leftCol.style.cssText = 'display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 8px; padding-top: 2px; padding-bottom: 2px;';
            const goToBtn = document.createElement('button');
            goToBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
            goToBtn.title = "Ir para o emprego";
            goToBtn.style.cssText = 'background:none; border:none; color:#00d2ff; cursor:pointer; padding:0; font-size:1.1rem; transition: transform 0.2s; flex-shrink: 0;';
            goToBtn.addEventListener('click', (e) => { e.stopPropagation(); if (emp.designationLatLng) { map.setView(emp.designationLatLng, 18, { animate: true }); } else if (emp.targetLatLng) { map.setView(emp.targetLatLng, 18, { animate: true }); } });
            goToBtn.addEventListener('mouseover', () => goToBtn.style.transform = 'scale(1.2)');
            goToBtn.addEventListener('mouseout', () => goToBtn.style.transform = 'scale(1)');
            const toggle = document.createElement('input'); toggle.type = 'checkbox'; toggle.checked = emp.visible;
            toggle.style.cssText = 'width: 18px; height: 18px; cursor: pointer; margin: 0; accent-color: #007bff; flex-shrink: 0;';
            toggle.addEventListener('change', (e) => { emp.visible = toggle.checked; if (emp.visible) map.addLayer(emp.layerGroup); else map.removeLayer(emp.layerGroup); });
            leftCol.appendChild(goToBtn); leftCol.appendChild(toggle);
            const midCol = document.createElement('div'); midCol.style.cssText = 'display: flex; flex-direction: column; justify-content: space-between; align-items: center; gap: 8px; padding-top: 2px; padding-bottom: 2px;';
            const colorDot = document.createElement('span');
            colorDot.style.cssText = `width: 16px; height: 16px; border-radius: 50%; background: ${emp.color}; cursor: pointer; position: relative; border: 1px solid rgba(255,255,255,0.2); flex-shrink: 0;`;
            colorDot.title = "Alterar cor";
            const colorInput = document.createElement('input'); colorInput.type = 'color'; colorInput.value = emp.color;
            colorInput.style.cssText = 'position:absolute; opacity:0; width:100%; height:100%; left:0; top:0; cursor:pointer; border:none; padding:0;';
            colorDot.appendChild(colorInput);
            colorInput.addEventListener('input', (e) => { const newColor = e.target.value; emp.color = newColor; colorDot.style.background = newColor; emp.layerGroup.eachLayer(layer => { if (layer.setStyle) layer.setStyle({ color: newColor, fillColor: newColor }); }); });
            const delBtn = document.createElement('button'); delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>'; delBtn.title = "Remover emprego";
            delBtn.style.cssText = 'background:none; border:none; color:#FF6B6B; cursor:pointer; padding:0; font-size:1rem; transition: transform 0.2s; flex-shrink: 0;';
            delBtn.addEventListener('click', (e) => { e.stopPropagation(); map.removeLayer(emp.layerGroup); savedEmployments = savedEmployments.filter(e => e.id !== emp.id); if (editingEmploymentId === emp.id) stopEditing(); else renderEmploymentList(); });
            midCol.appendChild(colorDot); midCol.appendChild(delBtn);
            const rightCol = document.createElement('div'); rightCol.style.cssText = 'flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0;';
            const topRow = document.createElement('div'); topRow.style.cssText = 'display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; padding-left: 5px;';
            const nameEl = document.createElement('span'); nameEl.textContent = emp.name; nameEl.contentEditable = 'true'; nameEl.title = "Clique para editar nome / Clique fora para salvar";
            nameEl.style.cssText = "font-family: 'Inter', 'Segoe UI', sans-serif; font-weight: 600; color: #e0e0e0; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.2px; outline: none; cursor: text; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-bottom: 1px dashed transparent;";
            nameEl.addEventListener('blur', () => { emp.name = nameEl.textContent.trim() || `Ataque ${emp.id}`; nameEl.textContent = emp.name; });
            nameEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); nameEl.blur(); } });
            if (emp.timeSyncEnabled && emp.explosionDelayMs === undefined) {
                const alt = getAircraftAltitudeAtTime(emp.telemetryTimeMs, emp.trigraph);
                emp.calculatedAltitude = alt;
                
                const w = emp.weapon || "";
                if (w.startsWith("BAFG")) {
                    if (alt !== null) {
                        const cota = emp.designationElevation || 0;
                        const height = Math.max(0, alt - cota);
                        const delaySec = getBombFallDelay(height);
                        emp.explosionDelayMs = delaySec * 1000;
                    } else {
                        emp.explosionDelayMs = 5000;
                    }
                } else if (w.includes("SBAT") || w === "GUNS") {
                    emp.explosionDelayMs = 3000;
                } else {
                    emp.explosionDelayMs = 5000;
                }
            }
            const timeEl = document.createElement('span');
            const formatTime = (ms) => { if (!ms) return '--:--:--'; const d = new Date(ms); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ':' + String(d.getUTCSeconds()).padStart(2, '0'); };
            timeEl.textContent = formatTime(emp.telemetryTimeMs);
            timeEl.style.cssText = "font-family: 'Inter', 'Segoe UI', monospace; font-weight: 500; color: #aaa; font-size: 0.85rem; letter-spacing: 0.5px;";
            const timeContainer = document.createElement('div');
            timeContainer.style.cssText = 'display: flex; flex-direction: column; align-items: flex-end;';
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
                const syncAllEmploymentsBtn = document.getElementById('sync-all-employments');
                if (syncAllEmploymentsBtn) {
                    syncAllEmploymentsBtn.checked = savedEmployments.length > 0 && savedEmployments.every(emp => emp.timeSyncEnabled);
                }
            });
            syncContainer.appendChild(syncCheck);
            syncContainer.appendChild(document.createTextNode('SYNC TL'));
            timeContainer.appendChild(syncContainer);

            const shiftBtnsContainer = document.createElement('div');
            shiftBtnsContainer.style.cssText = 'display: flex; gap: 4px; margin-top: 3px;';
            
            const btnMinus1 = document.createElement('button');
            btnMinus1.textContent = '-1h';
            btnMinus1.title = 'Subtrair 1 hora deste emprego';
            btnMinus1.style.cssText = 'font-size: 0.6rem; padding: 1px 4px; background: rgba(255, 107, 107, 0.15); color: #FF6B6B; border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 3px; cursor: pointer; font-family: monospace; line-height: 1; font-weight: bold;';
            btnMinus1.addEventListener('click', (e) => {
                e.stopPropagation();
                if (emp.telemetryTimeMs !== null && emp.telemetryTimeMs !== undefined) {
                    emp.telemetryTimeMs -= 1 * 3600 * 1000;
                    if (emp.telemetryTimeMs < 0) emp.telemetryTimeMs += 86400000;
                    renderEmploymentList();
                    if (window.onTelemetryTimeUpdate && window.getCurrentTelemetryTime) {
                        window.onTelemetryTimeUpdate(window.getCurrentTelemetryTime());
                    }
                }
            });
            
            const btnPlus1 = document.createElement('button');
            btnPlus1.textContent = '+1h';
            btnPlus1.title = 'Somar 1 hora neste emprego';
            btnPlus1.style.cssText = 'font-size: 0.6rem; padding: 1px 4px; background: rgba(77, 171, 247, 0.15); color: #4DABF7; border: 1px solid rgba(77, 171, 247, 0.3); border-radius: 3px; cursor: pointer; font-family: monospace; line-height: 1; font-weight: bold;';
            btnPlus1.addEventListener('click', (e) => {
                e.stopPropagation();
                if (emp.telemetryTimeMs !== null && emp.telemetryTimeMs !== undefined) {
                    emp.telemetryTimeMs += 1 * 3600 * 1000;
                    if (emp.telemetryTimeMs >= 86400000) emp.telemetryTimeMs -= 86400000;
                    renderEmploymentList();
                    if (window.onTelemetryTimeUpdate && window.getCurrentTelemetryTime) {
                        window.onTelemetryTimeUpdate(window.getCurrentTelemetryTime());
                    }
                }
            });
            
            shiftBtnsContainer.appendChild(btnMinus1);
            shiftBtnsContainer.appendChild(btnPlus1);
            timeContainer.appendChild(shiftBtnsContainer);
            topRow.appendChild(nameEl);
            topRow.appendChild(timeContainer);
            const divider = document.createElement('div'); divider.style.cssText = 'border-bottom: 1px dashed #444; margin-bottom: 4px;';
            const detailsEl = document.createElement('div'); detailsEl.id = `details-${emp.id}`; const modeText = emp.releaseMode === 'PAIR' ? 'PAIR' : 'SGL'; const headingPadded = (emp.magHeading+'').padStart(3, '0');
            detailsEl.textContent = `${emp.qty}X ${emp.weapon} [${modeText}] | RIP: ${emp.ripple}${emp.ameUnit.toUpperCase()} | ${headingPadded}º`;
            detailsEl.style.cssText = "font-family: 'Inter', 'Segoe UI', sans-serif; color: #888; font-size: 0.75rem; letter-spacing: 0.3px; text-transform: uppercase; padding-left: 5px;";
            rightCol.appendChild(topRow); rightCol.appendChild(divider); rightCol.appendChild(detailsEl);
            item.appendChild(leftCol); item.appendChild(midCol); item.appendChild(rightCol);
            item.addEventListener('click', (e) => { if (e.target.type === 'checkbox' || e.target.closest('button') || e.target === colorInput || e.target === colorDot || e.target === nameEl) return; if (isEditing) stopEditing(); else startEditing(emp); });
            list.appendChild(item);
        });
        if (typeof window.updateTimelineMarkers === 'function') window.updateTimelineMarkers();
    }

    function clearAllEmployments() {
        savedEmployments.forEach(emp => {
            if (emp.layerGroup) {
                map.removeLayer(emp.layerGroup);
            }
        });
        savedEmployments = [];
        if (typeof stopEditing === 'function') stopEditing();
        renderEmploymentList();
        employmentCounter = 1;
    }

    function loadExportedEmployment(eData) {
        if (!eData) return;
        
        const desLatLng = eData.designationLatLng ? L.latLng(eData.designationLatLng.lat, eData.designationLatLng.lng) : null;
        const tgtLatLng = eData.targetLatLng ? L.latLng(eData.targetLatLng.lat, eData.targetLatLng.lng) : null;
        const tgtPolyPts = eData.targetPolygonPoints ? eData.targetPolygonPoints.map(pt => L.latLng(pt.lat, pt.lng)) : null;

        const dec = parseFloat(document.getElementById('mag-declination')?.value || 0);
        
        const layerGroup = L.layerGroup();
        if (eData.visible !== false) {
            layerGroup.addTo(map);
        }

        if (desLatLng) {
            const displayHeadingVal = eData.displayHeading !== undefined ? parseFloat(eData.displayHeading) : parseFloat(eData.magHeading || 0);
            const desHeading = displayHeadingVal + dec;
            const rad = (desHeading * Math.PI / 180);
            const latErrM = (eData.latErr || 0) * 0.3048;
            const longErrM = (eData.longErr || 0) * 0.3048;
            const dLatLong = (longErrM * Math.cos(rad)) / 111111;
            const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(desLatLng.lat * Math.PI / 180));
            const latHead = (desHeading + 90) % 360;
            const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * Math.cos(desLatLng.lat * Math.PI / 180));
            const effectedCenter = L.latLng(desLatLng.lat + dLatLong + (latErrM * Math.cos(latHead * Math.PI / 180)) / 111111, desLatLng.lng + dLngLong + dLngLatCalc);

            let finalWeapon = eData.designationWeaponText;
            if (!finalWeapon || finalWeapon === '-') finalWeapon = eData.weapon;
            const ame = eData.ameUnit === 'ft' ? eData.ameInput * 0.3048 : eData.ameInput;

            drawEmploymentSet(effectedCenter, desHeading, eData.desQty || eData.qty, eData.desRipple || eData.ripple, ame, eData.color, layerGroup, eData.releaseMode, true, false, finalWeapon);
        }

        const emp = {
            ...eData,
            designationLatLng: desLatLng,
            targetLatLng: tgtLatLng,
            targetPolygonPoints: tgtPolyPts,
            layerGroup: layerGroup,
            visible: eData.visible !== false
        };

        if (emp.designationElevation === undefined) {
            emp.designationElevation = 0;
            const refLatLng = emp.designationLatLng || emp.targetLatLng;
            if (refLatLng) {
                fetch(`https://api.open-meteo.com/v1/elevation?latitude=${refLatLng.lat}&longitude=${refLatLng.lng}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.elevation && data.elevation.length > 0) {
                            emp.designationElevation = Math.round(data.elevation[0] * 3.28084);
                            renderEmploymentList();
                            if (window.onTelemetryTimeUpdate && window.getCurrentTelemetryTime) {
                                window.onTelemetryTimeUpdate(window.getCurrentTelemetryTime());
                            }
                        }
                    })
                    .catch(err => console.error("Erro ao buscar elevação de designação:", err));
            }
        }

        savedEmployments.push(emp);
        if (emp.id >= employmentCounter) {
            employmentCounter = emp.id + 1;
        }

        renderEmploymentList();
        drawImpactsOnMap();
    }

    window.clearAllEmployments = clearAllEmployments;
    window.loadExportedEmployment = loadExportedEmployment;

    function cloneEmploymentData(emp) {
        return {
            name: emp.name,
            weapon: emp.weapon,
            qty: emp.qty,
            ripple: emp.ripple,
            desQty: emp.desQty,
            desRipple: emp.desRipple,
            releaseMode: emp.releaseMode,
            ameInput: emp.ameInput,
            ameUnit: emp.ameUnit,
            magHeading: emp.magHeading,
            designationCoordsText: emp.designationCoordsText,
            designationLatLng: emp.designationLatLng ? L.latLng(emp.designationLatLng.lat, emp.designationLatLng.lng) : null,
            latErr: emp.latErr,
            longErr: emp.longErr,
            displayHeading: emp.displayHeading,
            designationWeaponText: emp.designationWeaponText,
            targetCoordsText: emp.targetCoordsText,
            targetLatLng: emp.targetLatLng ? L.latLng(emp.targetLatLng.lat, emp.targetLatLng.lng) : null,
            targetPolygonPoints: emp.targetPolygonPoints ? emp.targetPolygonPoints.map(pt => L.latLng(pt.lat, pt.lng)) : null,
            currentTargetMetadata: emp.currentTargetMetadata ? { ...emp.currentTargetMetadata } : null,
            targetAcquisition: emp.targetAcquisition,
            targetType: emp.targetType,
            dmpiValue: emp.dmpiValue,
            targetFolderName: emp.targetFolderName,
            telemetryTimeMs: emp.telemetryTimeMs,
            timeSyncEnabled: emp.timeSyncEnabled,
            trigraph: emp.trigraph,
            visible: emp.visible,
            color: emp.color,
            designationElevation: emp.designationElevation,
            explosionDelayMs: emp.explosionDelayMs,
            calculatedAltitude: emp.calculatedAltitude
        };
    }

    function startEditing(emp) {
        editingEmploymentId = emp.id;
        window.originalEditingEmployment = cloneEmploymentData(emp);
        document.getElementById('new-employment-btn').style.display = 'block';

        // Populate fields
        weaponSelect.value = emp.weapon;
        releaseModeSelect.value = emp.releaseMode || 'SGL';
        bombQtyInput.value = emp.qty;
        rippleDistInput.value = emp.ripple;
        ameRadiusInput.value = emp.ameInput;
        
        const unitM = document.getElementById('unit-m');
        const unitFt = document.getElementById('unit-ft');
        if (emp.ameUnit === 'm') {
            unitM.checked = true;
        } else {
            unitFt.checked = true;
        }
        
        headingInput.value = emp.magHeading;
        
        // Designation (Resultado Piloto)
        designationCoordsInput.value = emp.designationCoordsText || '';
        designationLatLng = emp.designationLatLng;
        
        if (designationMarker) map.removeLayer(designationMarker);
        if (designationLatLng) {
            const dIcon = L.divIcon({ className: 'design-marker-icon', html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><circle cx="15" cy="15" r="12" stroke="#00ff00" stroke-width="2" fill="none" /><circle cx="15" cy="15" r="3" fill="#00ff00" /></svg>`, iconSize: [30, 30], iconAnchor: [15, 15] });
            designationMarker = L.marker(designationLatLng, { icon: dIcon }).addTo(map);
            designationMarker.bindTooltip("Designação");
            if (showLegends) designationMarker.openTooltip();
        }
        
        if (designationQtyInput) designationQtyInput.value = emp.desQty !== undefined ? emp.desQty : emp.qty;
        if (designationRippleInput) designationRippleInput.value = emp.desRipple !== undefined ? emp.desRipple : emp.ripple;
        document.getElementById('lat-error').value = emp.latErr;
        document.getElementById('long-error').value = emp.longErr;
        document.getElementById('designation-heading').value = emp.displayHeading;
        if (document.getElementById('designation-weapon')) {
            document.getElementById('designation-weapon').value = emp.designationWeaponText || '-';
        }

        // Restore Persistent Target Area Details
        targetCoordsInput.value = emp.targetCoordsText || '';
        targetLatLng = emp.targetLatLng;
        currentTargetMetadata = emp.currentTargetMetadata;
        targetAcquisitionSelect.value = emp.targetAcquisition || 'manual';
        if (targetTypeSelect) targetTypeSelect.value = emp.targetType || 'infrastructure';
        document.getElementById('dmpi-id').value = emp.dmpiValue || '1';
        document.getElementById('target-folder-name').textContent = emp.targetFolderName || '';
        document.getElementById('target-dmpi-display').textContent = emp.targetFolderName ? 'DMPI ' + (emp.dmpiValue || '1') : '';
        
        if (targetMarker) map.removeLayer(targetMarker);
        if (targetLatLng) {
            const triIcon = L.divIcon({ className: 'target-triangle', html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><polygon points="15,5 28,25 2,25" stroke="red" stroke-width="2.5" fill="none" /></svg>`, iconSize: [30, 30], iconAnchor: [15, 18] });
            targetMarker = L.marker(targetLatLng, { icon: triIcon }).addTo(map);
            targetMarker.bindTooltip("Alvo");
            if (showLegends) targetMarker.openTooltip();
        }
        
        // Update Mini-map placeholder and view
        const placeholder = document.getElementById('mini-map-placeholder');
        const miniMapHeader = document.getElementById('mini-map-header');
        if (targetLatLng) {
            if (placeholder) placeholder.style.display = 'none';
            if (miniMapHeader) miniMapHeader.style.display = 'flex';
            const miniMapContainer = document.getElementById('mini-map-container');
            if (miniMapContainer) {
                miniMapContainer.style.display = 'flex';
                if (toggleRightPanelBtn) toggleRightPanelBtn.style.display = 'flex';
            }
            if (miniMap) {
                miniMap.setView(targetLatLng, 19);
                setTimeout(() => {
                    miniMap.invalidateSize();
                }, 100);
            }
        } else {
            if (placeholder) placeholder.style.display = 'flex';
            if (miniMapHeader) miniMapHeader.style.display = 'none';
        }
        
        // Restore Target Polygons
        if (drawnTargetPolygon) map.removeLayer(drawnTargetPolygon);
        if (drawnTargetMiniPolygon) miniMap.removeLayer(drawnTargetMiniPolygon);
        clearDragHandles();
        
        targetPolygonPoints = emp.targetPolygonPoints ? [...emp.targetPolygonPoints] : null;
        if (targetPolygonPoints) {
            drawnTargetPolygon = L.polygon(targetPolygonPoints, {
                color: '#00ffff',
                fillColor: '#00ffff',
                fillOpacity: 0.25,
                weight: 2
            }).addTo(map);
            
            let typeText = (currentTargetMetadata && currentTargetMetadata.type) ? currentTargetMetadata.type : "Customizado";
            drawnTargetPolygon.bindTooltip(`Alvo: ${typeText}`);
            
            if (miniMap) {
                drawnTargetMiniPolygon = L.polygon(targetPolygonPoints, {
                    color: '#00ffff',
                    fillColor: '#00ffff',
                    fillOpacity: 0.25,
                    weight: 2
                }).addTo(miniMap);
            }
            
            // Recreate drag handles for active adjustment
            createDragHandles();
        }
        
        updateDistance();
        drawImpactsOnMap();
        renderEmploymentList();
    }

    function stopEditing() {
        if (editingEmploymentId !== null && window.originalEditingEmployment) {
            const emp = savedEmployments.find(e => e.id === editingEmploymentId);
            if (emp) {
                const orig = window.originalEditingEmployment;
                emp.name = orig.name;
                emp.weapon = orig.weapon;
                emp.qty = orig.qty;
                emp.ripple = orig.ripple;
                emp.desQty = orig.desQty;
                emp.desRipple = orig.desRipple;
                emp.releaseMode = orig.releaseMode;
                emp.ameInput = orig.ameInput;
                emp.ameUnit = orig.ameUnit;
                emp.magHeading = orig.magHeading;
                emp.designationCoordsText = orig.designationCoordsText;
                emp.designationLatLng = orig.designationLatLng;
                emp.latErr = orig.latErr;
                emp.longErr = orig.longErr;
                emp.displayHeading = orig.displayHeading;
                emp.designationWeaponText = orig.designationWeaponText;
                emp.targetCoordsText = orig.targetCoordsText;
                emp.targetLatLng = orig.targetLatLng;
                emp.targetPolygonPoints = orig.targetPolygonPoints;
                emp.currentTargetMetadata = orig.currentTargetMetadata;
                emp.targetAcquisition = orig.targetAcquisition;
                emp.targetType = orig.targetType;
                emp.dmpiValue = orig.dmpiValue;
                emp.targetFolderName = orig.targetFolderName;
                emp.telemetryTimeMs = orig.telemetryTimeMs;
                emp.timeSyncEnabled = orig.timeSyncEnabled;
                emp.trigraph = orig.trigraph;
                emp.visible = orig.visible;
                emp.color = orig.color;
                emp.designationElevation = orig.designationElevation;
                emp.explosionDelayMs = orig.explosionDelayMs;
                emp.calculatedAltitude = orig.calculatedAltitude;

                // Redraw original state on its layerGroup
                emp.layerGroup.clearLayers();
                if (emp.visible) {
                    const dec = parseFloat(magDeclinationInput.value || 0);
                    const plannedHeading = emp.magHeading + dec;
                    let desHeading = plannedHeading;
                    if (emp.displayHeading !== "") {
                        desHeading = parseInt(emp.displayHeading || 0) + dec;
                    }

                    let mult = 1.0;
                    if (emp.targetType === 'personnel') mult = 1.5;
                    else if (emp.targetType === 'armored') mult = 0.4;
                    const baseAme = emp.ameUnit === 'ft' ? emp.ameInput * 0.3048 : emp.ameInput;
                    const ame = baseAme * mult;

                    if (emp.designationLatLng) {
                        const rad = (desHeading * Math.PI / 180);
                        const latErrM = emp.latErr * 0.3048;
                        const longErrM = emp.longErr * 0.3048;
                        const dLatLong = (longErrM * Math.cos(rad)) / 111111;
                        const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(emp.designationLatLng.lat * Math.PI / 180));
                        const latHead = (desHeading + 90) % 360;
                        const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * Math.cos(emp.designationLatLng.lat * Math.PI / 180));
                        const effectedCenter = L.latLng(emp.designationLatLng.lat + dLatLong + (latErrM * Math.cos(latHead * Math.PI / 180)) / 111111, emp.designationLatLng.lng + dLngLong + dLngLatCalc);
                        
                        let finalWeapon = emp.designationWeaponText;
                        if (!finalWeapon || finalWeapon === '-') finalWeapon = emp.weapon;
                        drawEmploymentSet(effectedCenter, desHeading, emp.desQty !== undefined ? emp.desQty : emp.qty, emp.desRipple !== undefined ? emp.desRipple : emp.ripple, ame, emp.color, emp.layerGroup, emp.releaseMode || 'SGL', true, false, finalWeapon);
                    }
                }
            }
        }
        window.originalEditingEmployment = null;

        editingEmploymentId = null;
        document.getElementById('new-employment-btn').style.display = 'none';

        // Clear active designation coordinates and marker
        designationLatLng = null;
        if (designationMarker) {
            map.removeLayer(designationMarker);
            designationMarker = null;
        }
        document.getElementById('designation-coords').value = '';
        if (document.getElementById('designation-weapon')) document.getElementById('designation-weapon').value = '-';
        document.getElementById('lat-error').value = 0;
        document.getElementById('long-error').value = 0;
        document.getElementById('designation-heading').value = '';

        // Clear active targeting coordinates and markers
        targetLatLng = null;
        if (targetMarker) {
            const isCustom = createdTargets.some(t => t.marker === targetMarker);
            if (!isCustom) {
                map.removeLayer(targetMarker);
            }
            targetMarker = null;
        }
        if (miniMapTargetMarker && miniMap) {
            miniMap.removeLayer(miniMapTargetMarker);
            miniMapTargetMarker = null;
        }
        targetCoordsInput.value = '';
        currentTargetMetadata = null;
        if (targetTypeSelect) targetTypeSelect.value = 'infrastructure';
        
        // Remove target polygons and handles from maps
        if (drawnTargetPolygon) {
            map.removeLayer(drawnTargetPolygon);
            drawnTargetPolygon = null;
        }
        if (drawnTargetMiniPolygon) {
            miniMap.removeLayer(drawnTargetMiniPolygon);
            drawnTargetMiniPolygon = null;
        }
        clearDragHandles();
        targetPolygonPoints = null;

        // Reset mini-map and placeholders
        document.getElementById('target-folder-name').textContent = '';
        document.getElementById('target-dmpi-display').textContent = '';
        const placeholder = document.getElementById('mini-map-placeholder');
        if (placeholder) {
            placeholder.style.display = 'flex';
        }

        updateDistance();
        drawImpactsOnMap();
        renderEmploymentList();
    }

    function updateActiveEditing() {
        if (editingEmploymentId === null) return false;
        const emp = savedEmployments.find(e => e.id === editingEmploymentId);
        if (!emp) return false;

        // Update properties
        if (emp.weapon !== weaponSelect.value) {
            emp.weapon = weaponSelect.value;
            delete emp.explosionDelayMs;
            delete emp.calculatedAltitude;
        }
        emp.releaseMode = releaseModeSelect.value;
        emp.qty = parseInt(bombQtyInput.value || 1);
        emp.ripple = parseFloat(rippleDistInput.value || 13);
        emp.ameInput = parseFloat(ameRadiusInput.value || 7);
        emp.ameUnit = getAmeUnit();
        emp.magHeading = parseInt(headingInput.value || 0);
        emp.designationCoordsText = designationCoordsInput.value;
        emp.designationLatLng = designationLatLng;
        emp.latErr = parseFloat(document.getElementById('lat-error').value || 0);
        emp.longErr = parseFloat(document.getElementById('long-error').value || 0);
        
        const desHeadingInput = document.getElementById('designation-heading');
        emp.displayHeading = desHeadingInput.value;

        const desQtyInput = document.getElementById('designation-qty');
        if (desQtyInput) {
            emp.desQty = parseInt(desQtyInput.value || 1);
        }
        const desRippleInput = document.getElementById('designation-ripple');
        if (desRippleInput) {
            emp.desRipple = parseFloat(desRippleInput.value || 13);
        }
        const desWeaponInput = document.getElementById('designation-weapon');
        if (desWeaponInput) {
            emp.designationWeaponText = desWeaponInput.value || '-';
        }
        
        // Update Persistent Target Area Details in real-time
        emp.targetCoordsText = targetCoordsInput.value;
        emp.targetLatLng = targetLatLng ? L.latLng(targetLatLng.lat, targetLatLng.lng) : null;
        emp.targetPolygonPoints = targetPolygonPoints ? targetPolygonPoints.map(pt => L.latLng(pt.lat, pt.lng)) : null;
        emp.currentTargetMetadata = currentTargetMetadata ? { ...currentTargetMetadata } : null;
        emp.targetAcquisition = targetAcquisitionSelect.value;
        emp.targetType = targetTypeSelect ? targetTypeSelect.value : 'infrastructure';
        emp.dmpiValue = document.getElementById('dmpi-id').value;
        emp.targetFolderName = document.getElementById('target-folder-name').textContent;
        
        const dec = parseFloat(magDeclinationInput.value || 0);
        const plannedHeading = emp.magHeading + dec;
        let desHeading = plannedHeading;
        if (emp.displayHeading !== "") {
            desHeading = parseInt(emp.displayHeading || 0) + dec;
        }

        let mult = 1.0;
        if (emp.targetType === 'personnel') mult = 1.5;
        else if (emp.targetType === 'armored') mult = 0.4;
        const baseAme = emp.ameUnit === 'ft' ? emp.ameInput * 0.3048 : emp.ameInput;
        const ame = baseAme * mult;

        emp.layerGroup.clearLayers();

        if (emp.designationLatLng) {
            const rad = (desHeading * Math.PI / 180);
            const latErrM = emp.latErr * 0.3048;
            const longErrM = emp.longErr * 0.3048;
            const dLatLong = (longErrM * Math.cos(rad)) / 111111;
            const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(emp.designationLatLng.lat * Math.PI / 180));
            const latHead = (desHeading + 90) % 360;
            const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * Math.cos(emp.designationLatLng.lat * Math.PI / 180));
            const effectedCenter = L.latLng(emp.designationLatLng.lat + dLatLong + (latErrM * Math.cos(latHead * Math.PI / 180)) / 111111, emp.designationLatLng.lng + dLngLong + dLngLatCalc);
            
            drawEmploymentSet(effectedCenter, desHeading, emp.desQty !== undefined ? emp.desQty : emp.qty, emp.desRipple !== undefined ? emp.desRipple : emp.ripple, ame, emp.color, emp.layerGroup, emp.releaseMode || 'SGL', true, false, emp.designationWeaponText || emp.weapon);
        }

        const detailsEl = document.getElementById(`details-${emp.id}`);
        if (detailsEl) {
            const modeText = emp.releaseMode === 'PAIR' ? 'PAIR' : 'SGL';
            detailsEl.textContent = `${emp.qty}x ${emp.weapon} [${modeText}] | Rip: ${emp.ripple}${emp.ameUnit} | Ax: ${emp.magHeading}'`;
        }
        return true;
    }

    document.getElementById('new-employment-btn').addEventListener('click', stopEditing);  document.getElementById('save-employment-btn').addEventListener('click', saveEmployment);

    modalSaveConfirmBtn.addEventListener('click', () => {
        const nameText = modalInput.value.trim() || `Emprego ${employmentCounter}`;
        saveModal.style.display = 'none';
        executeSaveEmployment(nameText);
    });

    modalCancelBtn.addEventListener('click', () => {
        saveModal.style.display = 'none';
    });

    modalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            modalSaveConfirmBtn.click();
        }
    });

    let isMagneticNorthUp = true;
    window.isMagneticNorthUp = isMagneticNorthUp;
    let mgrsGridVisible = false;
    let mgrsGridLayer = null;
    let mgrsRulerHighlightActive = false;
    window.toggleNorthOrientation = function() {
        isMagneticNorthUp = !isMagneticNorthUp;
        window.isMagneticNorthUp = isMagneticNorthUp;
        updateNorthIndicators();
    };

    function updateNorthIndicators() {
        const dec = parseFloat(document.getElementById('mag-declination') ? document.getElementById('mag-declination').value : 0) || 0;
        const tnArrow = document.querySelector('.tn-arrow');
        const mnArrow = document.querySelector('.mn-arrow');
        const northIndicator = document.getElementById('north-indicator');
        
        if (isMagneticNorthUp) {
            // Map rotates so Magnetic North points up
            if (map && map.setBearing) map.setBearing(-dec);
            if (tnArrow) tnArrow.style.transform = `translateX(-50%) rotate(${dec}deg)`;
            if (mnArrow) mnArrow.style.transform = `translateX(-50%) rotate(0deg)`;
            if (mnArrow) { mnArrow.style.opacity = '1'; mnArrow.querySelector('span').style.textShadow = '0 0 6px #ffcc00'; }
            if (tnArrow) { tnArrow.style.opacity = '0.45'; tnArrow.querySelector('span').style.textShadow = ''; }
            if (northIndicator) {
                northIndicator.setAttribute('data-mode', '▲ NM');
                northIndicator.title = `Modo: Norte Magnético (dec: ${dec >= 0 ? '+' : ''}${dec}') — Clique para Norte Verdadeiro`;
            }
        } else {
            // Map north-up (True North)
            if (map && map.setBearing) map.setBearing(0);
            if (tnArrow) tnArrow.style.transform = `translateX(-50%) rotate(0deg)`;
            if (mnArrow) mnArrow.style.transform = `translateX(-50%) rotate(${dec}deg)`;
            if (tnArrow) { tnArrow.style.opacity = '1'; tnArrow.querySelector('span').style.textShadow = '0 0 6px #00d2ff'; }
            if (mnArrow) { mnArrow.style.opacity = '0.45'; mnArrow.querySelector('span').style.textShadow = ''; }
            if (northIndicator) {
                northIndicator.setAttribute('data-mode', '▲ NV');
                northIndicator.title = `Modo: Norte Verdadeiro — Clique para Norte Magnético`;
            }
        }
        // Rebuild MGRS grid to match new bearing
        if (typeof buildMGRSGridLayer === 'function' && mgrsGridVisible) buildMGRSGridLayer();
    }


    // Initialize UI with default values
    updatePlaceholders();
    updateNorthIndicators();
    drawImpactsOnMap();

    // Ruler Tool & Drawing Tool
    let rulerActive = false;
    let rulerPoints = [];
    let rulerPolyline = null;
    let rulerMarkers = [];
    let targetDragHandles = [];

    function updateRulerTooltip() {
        if (!rulerPolyline || rulerPoints.length < 2) return;
        let totalMeters = 0;
        for (let i = 0; i < rulerPoints.length - 1; i++) {
            totalMeters += rulerPoints[i].distanceTo(rulerPoints[i+1]);
        }
        const totalFt = totalMeters * 3.28084;
        const totalNM = totalMeters / 1852;
        const startPt = rulerPoints[0];
        const endPt = rulerPoints[rulerPoints.length - 1];
        const bearing = getBearing(startPt, endPt);
        
        const dec = parseFloat(magDeclinationInput ? magDeclinationInput.value : 0) || 0;
        const magBearing = Math.round((bearing - dec + 360) % 360);
        
        let labelText = `${Math.round(totalMeters)} m / ${Math.round(totalFt)} ft / ${totalNM.toFixed(1)} NM | Eixo: ${String(magBearing).padStart(3, '0')}° (MAG)`;
        rulerPolyline.setTooltipContent(labelText);
    }

    if (magDeclinationInput) {
        magDeclinationInput.addEventListener('input', () => {
            const dec = parseFloat(magDeclinationInput.value) || 0;
            drawImpactsOnMap();
            if (typeof renderCompassSVG === 'function') renderCompassSVG();
            updateNorthIndicators();
            updateRulerTooltip();
        });

        // Sync settings changes with all mag-declination inputs
        document.querySelectorAll('#mag-declination').forEach(input => {
            if (input !== magDeclinationInput) {
                input.addEventListener('input', () => {
                    magDeclinationInput.value = input.value;
                    magDeclinationInput.dispatchEvent(new Event('input'));
                });
            }
        });
    }

    const decWrapper = document.getElementById('declination-wrapper');
    if (decWrapper) {
        decWrapper.addEventListener('click', (e) => {
            if (!decWrapper.classList.contains('expanded')) {
                decWrapper.classList.add('expanded');
                const input = decWrapper.querySelector('#mag-declination');
                if (input) input.focus();
                e.stopPropagation();
            }
        });

        const compassIcon = decWrapper.querySelector('.compass-icon');
        if (compassIcon) {
            compassIcon.addEventListener('click', (e) => {
                if (decWrapper.classList.contains('expanded')) {
                    decWrapper.classList.remove('expanded');
                    e.stopPropagation();
                }
            });
        }

        document.addEventListener('click', (e) => {
            if (!decWrapper.contains(e.target)) {
                decWrapper.classList.remove('expanded');
            }
        });
    }

    const btnMapLocations = document.getElementById('btn-map-locations');
    const mapLocationsDropdown = document.getElementById('map-locations-dropdown');
    
    if (btnMapLocations && mapLocationsDropdown) {
        btnMapLocations.addEventListener('click', (e) => {
            const isVisible = mapLocationsDropdown.style.display === 'flex';
            mapLocationsDropdown.style.display = isVisible ? 'none' : 'flex';
            btnMapLocations.classList.toggle('active-state', !isVisible);
            e.stopPropagation();
        });
        
        document.addEventListener('click', (e) => {
            if (!btnMapLocations.contains(e.target) && !mapLocationsDropdown.contains(e.target)) {
                mapLocationsDropdown.style.display = 'none';
                btnMapLocations.classList.remove('active-state');
            }
        });
        
        const items = mapLocationsDropdown.querySelectorAll('.corner-dropdown-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                const loc = item.getAttribute('data-loc');
                let targetLatLngLoc = null;
                
                if (loc === 'apaa1') {
                    targetLatLngLoc = L.latLng(-20.690768, -55.276937);
                } else if (loc === 'apaa2') {
                    targetLatLngLoc = L.latLng(-20.478180, -55.535782);
                } else if (loc === 'apaa3') {
                    targetLatLngLoc = L.latLng(-19.918062, -54.363978);
                } else if (loc === 'bacg') {
                    targetLatLngLoc = L.latLng(-20.464787, -54.664863);
                }
                
                if (targetLatLngLoc && map) {
                    let zoomLvl = 17;
                    if (loc.startsWith('apaa')) zoomLvl = 11; // zoomed out to see 10NM
                    map.setView(targetLatLngLoc, zoomLvl, { animate: true });
                    
                    if (loc.startsWith('apaa')) {
                        // 10 NM = 18520 meters
                        const apaaName = loc.toUpperCase().replace('APAA', 'APAA 0');
                        const newScenarioPt = {
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            name: apaaName,
                            mode: 'scenario',
                            type: 'circle',
                            latlng: targetLatLngLoc,
                            geoData: { lat: targetLatLngLoc.lat, lng: targetLatLngLoc.lng, radius: 18520 },
                            color: '#ff0000',
                            fill: false,
                            fillColor: '#ff0000',
                            fillOpacity: 0
                        };
                        newScenarioPt.circle = L.circle(targetLatLngLoc, { radius: 18520, color: '#ff0000', weight: 2, fill: false, fillOpacity: 0 }).addTo(map);
                        newScenarioPt.layer = newScenarioPt.circle;

                        if (!tacticalPoints['scenario']) tacticalPoints['scenario'] = [];
                        tacticalPoints['scenario'].push(newScenarioPt);
                        if (typeof updateTacticalList === 'function') updateTacticalList('scenario');
                        
                        let ingressStr, egressStr, ingressName, egressName;
                        if (loc === 'apaa1') { ingressStr = "21KYT00002000"; egressStr = "21KYT00000000"; ingressName = "CP ARROW"; egressName = "CP PLANT"; }
                        else if (loc === 'apaa2') { ingressStr = "21KXT72004000"; egressStr = "21KXT70002000"; ingressName = "CP RIVER"; egressName = "CP UNION"; }
                        else if (loc === 'apaa3') { ingressStr = "21KYT60008000"; egressStr = "21KYT77007250"; ingressName = "CP FLAG"; egressName = "CP RANCH"; }

                        if (ingressStr && egressStr && typeof mgrs !== 'undefined') {
                            try {
                                const ingPt = mgrs.toPoint(ingressStr);
                                const egPt = mgrs.toPoint(egressStr);
                                const ingLatLng = L.latLng(ingPt[1], ingPt[0]);
                                const egLatLng = L.latLng(egPt[1], egPt[0]);
                                
                                if (typeof addTacticalPoint === 'function') {
                                    addTacticalPoint('navigation', ingLatLng, false, `${ingressName} (INGRESS)`);
                                    addTacticalPoint('navigation', egLatLng, false, `${egressName} (EGRESS)`);
                                }
                            } catch(e) { console.error("Error parsing APAA CPs", e); }
                        }
                    }
                }
                
                mapLocationsDropdown.style.display = 'none';
                btnMapLocations.classList.remove('active-state');
            });
        });
    }

    const rulerBtn = document.getElementById('ruler-btn');
    if (rulerBtn) {
        rulerBtn.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            rulerActive = !rulerActive;
            if (rulerActive) {
                btn.style.color = '#000';
                btn.style.background = 'var(--primary)';
                document.getElementById('map').style.cursor = 'crosshair';
                // Desativa desenho do alvo se estiver ativo
                if (targetDrawingActive) finishTargetDrawing(false);
                // Desativa criaÃ§Ã£o de alvos se ativa
                if (tgtCreationActive && tgtCreationBtn) tgtCreationBtn.click();
            } else {
                btn.style.color = '';
                btn.style.background = '';
                document.getElementById('map').style.cursor = '';
                if (rulerPolyline) map.removeLayer(rulerPolyline);
                rulerMarkers.forEach(m => map.removeLayer(m));
                rulerPolyline = null;
                rulerMarkers = [];
                rulerPoints = [];
            }
        });
    }

    // ============================================================
    // MGRS GRID OVERLAY
    // ============================================================

    function buildMGRSGridLayer() {
        if (mgrsGridLayer) {
            map.removeLayer(mgrsGridLayer);
            mgrsGridLayer = null;
        }
        
        // Always draw or clear rulers
        drawMGRSRulers();
        
        if (!mgrsGridVisible) return;

        // Custom canvas tile layer that draws MGRS grid lines only (darker blue theme)
        const MgrsTileLayer = L.GridLayer.extend({
            createTile: function(coords) {
                const tile = document.createElement('canvas');
                const tileSize = this.getTileSize();
                tile.width = tileSize.x;
                tile.height = tileSize.y;
                const ctx = tile.getContext('2d');

                const zoom = coords.z;
                const nwPoint = coords.scaleBy(tileSize);
                const sePoint = nwPoint.add(tileSize);

                function tilePixelToLatLng(px, py) {
                    const worldPx = nwPoint.x + px;
                    const worldPy = nwPoint.y + py;
                    const n = Math.PI - (2 * Math.PI * worldPy) / Math.pow(2, zoom + 8);
                    const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
                    const lng = (worldPx / Math.pow(2, zoom + 8)) * 360 - 180;
                    return { lat, lng };
                }

                function latLngToTilePixel(lat, lng) {
                    const x = ((lng + 180) / 360) * Math.pow(2, zoom + 8) - nwPoint.x;
                    const latRad = lat * Math.PI / 180;
                    const y = (Math.log(Math.tan(Math.PI / 4 + latRad / 2))) ;
                    const worldPy = (Math.PI - y) / (2 * Math.PI) * Math.pow(2, zoom + 8);
                    return { x, y: worldPy - nwPoint.y };
                }

                // Determine grid interval based on zoom
                let gridMeters = 100000; // 100km - zone bands
                if (zoom >= 12) gridMeters = 10000;  // 10km
                if (zoom >= 14) gridMeters = 1000;   // 1km
                if (zoom >= 17) gridMeters = 100;    // 100m
                if (zoom === 19) gridMeters = 50;    // 50m
                if (zoom >= 20) gridMeters = 10;     // 10m    // 100m

                const nw = tilePixelToLatLng(0, 0);
                const se = tilePixelToLatLng(tileSize.x, tileSize.y);

                if (!window.mgrs || typeof window.mgrs.forward !== 'function') return tile;

                // Get approximate UTM bounds for this tile
                try {
                    const nwMGRS = window.mgrs.forward([nw.lng, nw.lat], 5);
                    const seMGRS = window.mgrs.forward([se.lng, se.lat], 5);

                    // Parse zone from NW corner
                    const zoneMatch = nwMGRS.match(/^(\d{1,2}[A-Z])/);
                    if (!zoneMatch) return tile;
                    const zoneId = parseInt(zoneMatch[1]);
                    const centralMeridian = (zoneId - 1) * 6 - 180 + 3;

                    // Compute easting/northing at tile corners using simple UTM approx
                    function latLngToUTMApprox(lat, lng) {
                        const a = 6378137.0;
                        const f = 1 / 298.257223563;
                        const b = a * (1 - f);
                        const e2 = (a * a - b * b) / (a * a);
                        const k0 = 0.9996;
                        const latRad = lat * Math.PI / 180;
                        const lngRad = lng * Math.PI / 180;
                        const lng0Rad = centralMeridian * Math.PI / 180;
                        const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
                        const T = Math.tan(latRad) ** 2;
                        const C = e2 / (1 - e2) * Math.cos(latRad) ** 2;
                        const A = Math.cos(latRad) * (lngRad - lng0Rad);
                        const M = a * ((1 - e2 / 4 - 3 * e2 ** 2 / 64) * latRad
                            - (3 * e2 / 8 + 3 * e2 ** 2 / 32) * Math.sin(2 * latRad)
                            + (15 * e2 ** 2 / 256) * Math.sin(4 * latRad));
                        let easting = k0 * N * (A + (1 - T + C) * A ** 3 / 6) + 500000;
                        let northing = k0 * (M + N * Math.tan(latRad) * (A ** 2 / 2 + (5 - T + 9 * C) * A ** 4 / 24));
                        if (lat < 0) northing += 10000000;
                        return { easting, northing };
                    }

                    function utmToLatLngApprox(easting, northing, lat_ref) {
                        const a = 6378137.0;
                        const f = 1 / 298.257223563;
                        const b = a * (1 - f);
                        const e2 = (a * a - b * b) / (a * a);
                        const k0 = 0.9996;
                        const lng0 = centralMeridian * Math.PI / 180;
                        let N0 = 0;
                        if (lat_ref < 0) N0 = 10000000;
                        const y = (northing - N0) / k0;
                        const x = (easting - 500000) / k0;
                        const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
                        const mu = y / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64));
                        const phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
                            + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu);
                        const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
                        const T1 = Math.tan(phi1) ** 2;
                        const C1 = e2 / (1 - e2) * Math.cos(phi1) ** 2;
                        const R1 = a * (1 - e2) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5;
                        const D = x / N1;
                        const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D ** 2 / 2
                            - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e2 / (1 - e2)) * D ** 4 / 24);
                        const lng = lng0 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6) / Math.cos(phi1);
                        return { lat: lat * 180 / Math.PI, lng: lng * 180 / Math.PI };
                    }

                    const utmNW = latLngToUTMApprox(nw.lat, nw.lng);
                    const utmSE = latLngToUTMApprox(se.lat, se.lng);

                    const eMin = Math.floor(Math.min(utmNW.easting, utmSE.easting) / gridMeters) * gridMeters;
                    const eMax = Math.ceil(Math.max(utmNW.easting, utmSE.easting) / gridMeters) * gridMeters;
                    const nMin = Math.floor(Math.min(utmNW.northing, utmSE.northing) / gridMeters) * gridMeters;
                    const nMax = Math.ceil(Math.max(utmNW.northing, utmSE.northing) / gridMeters) * gridMeters;

                    const latRef = (nw.lat + se.lat) / 2;

                    // White grid lines
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                    ctx.lineWidth = zoom >= 14 ? 1.0 : 0.7;
                    ctx.setLineDash([]); // solid by default (as per user request: "linhas contínuas")

                    // Draw easting lines
                    for (let e = eMin; e <= eMax; e += gridMeters) {
                        // Check if this line is an intermediate line
                        const isMain = (zoom < 19) || (Math.round(e) % 100 === 0);
                        if (isMain) {
                            ctx.setLineDash([]);
                            ctx.lineWidth = zoom >= 14 ? 1.0 : 0.7;
                        } else {
                            ctx.setLineDash([2, 3]); // dashed for intermediate lines
                            ctx.lineWidth = 0.5;      // slightly thinner
                        }

                        const pts = [];
                        for (let n = nMin; n <= nMax; n += gridMeters / 4) {
                            const ll = utmToLatLngApprox(e, n, latRef);
                            const px = latLngToTilePixel(ll.lat, ll.lng);
                            pts.push(px);
                        }
                        if (pts.length < 2) continue;
                        ctx.beginPath();
                        ctx.moveTo(pts[0].x, pts[0].y);
                        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                        ctx.stroke();
                    }

                    // Draw northing lines
                    for (let n = nMin; n <= nMax; n += gridMeters) {
                        // Check if this line is an intermediate line
                        const isMain = (zoom < 19) || (Math.round(n) % 100 === 0);
                        if (isMain) {
                            ctx.setLineDash([]);
                            ctx.lineWidth = zoom >= 14 ? 1.0 : 0.7;
                        } else {
                            ctx.setLineDash([2, 3]); // dashed for intermediate lines
                            ctx.lineWidth = 0.5;      // slightly thinner
                        }

                        const pts = [];
                        for (let e = eMin; e <= eMax; e += gridMeters / 4) {
                            const ll = utmToLatLngApprox(e, n, latRef);
                            const px = latLngToTilePixel(ll.lat, ll.lng);
                            pts.push(px);
                        }
                        if (pts.length < 2) continue;
                        ctx.beginPath();
                        ctx.moveTo(pts[0].x, pts[0].y);
                        for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
                        ctx.stroke();
                    }

                } catch(e) { /* ignore tile errors */ }

                return tile;
            }
        });

        mgrsGridLayer = new MgrsTileLayer({ tileSize: 256, zIndex: 500, opacity: 1 });
        mgrsGridLayer.addTo(map);
    }

    function drawMGRSRulers() {
        window.drawnMGRSRulerBoxes = [];
        const canvas = document.getElementById('mgrs-ruler-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!mgrsGridVisible) return;
        
        // Sync size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        const width = canvas.width;
        const height = canvas.height;
        
        const zoom = map.getZoom();
        if (zoom < 12) return; // Only show numbers at zoom >= 12
        
        // Determine grid interval based on zoom
        let gridMeters = 100000;
        if (zoom >= 12) gridMeters = 10000;  // 10km
        if (zoom >= 14) gridMeters = 1000;   // 1km
        if (zoom >= 17) gridMeters = 100;    // 100m
        if (zoom === 19) gridMeters = 50;    // 50m
        if (zoom >= 20) gridMeters = 10;     // 10m
        
        // Get corners of the map viewport in LatLng
        const nwLatLng = map.containerPointToLatLng([0, 0]);
        const seLatLng = map.containerPointToLatLng([width, height]);
        const neLatLng = map.containerPointToLatLng([width, 0]);
        const swLatLng = map.containerPointToLatLng([0, height]);
        
        if (!window.mgrs || typeof window.mgrs.forward !== 'function') return;
        
        try {
            // Find approximate UTM bounds of the viewport
            const latRef = (nwLatLng.lat + seLatLng.lat) / 2;
            const lngRef = (nwLatLng.lng + seLatLng.lng) / 2;
            
            // Convert map center / corners to UTM
            const centerMGRS = window.mgrs.forward([lngRef, latRef], 5);
            const zoneMatch = centerMGRS.match(/^(\d{1,2}[A-Z])/);
            if (!zoneMatch) return;
            const zoneId = parseInt(zoneMatch[1]);
            const centralMeridian = (zoneId - 1) * 6 - 180 + 3;
            
            function latLngToUTMApprox(lat, lng) {
                const a = 6378137.0;
                const f = 1 / 298.257223563;
                const b = a * (1 - f);
                const e2 = (a * a - b * b) / (a * a);
                const k0 = 0.9996;
                const latRad = lat * Math.PI / 180;
                const lngRad = lng * Math.PI / 180;
                const lng0Rad = centralMeridian * Math.PI / 180;
                const N = a / Math.sqrt(1 - e2 * Math.sin(latRad) ** 2);
                const T = Math.tan(latRad) ** 2;
                const C = e2 / (1 - e2) * Math.cos(latRad) ** 2;
                const A = Math.cos(latRad) * (lngRad - lng0Rad);
                const M = a * ((1 - e2 / 4 - 3 * e2 ** 2 / 64) * latRad
                    - (3 * e2 / 8 + 3 * e2 ** 2 / 32) * Math.sin(2 * latRad)
                    + (15 * e2 ** 2 / 256) * Math.sin(4 * latRad));
                let easting = k0 * N * (A + (1 - T + C) * A ** 3 / 6) + 500000;
                let northing = k0 * (M + N * Math.tan(latRad) * (A ** 2 / 2 + (5 - T + 9 * C) * A ** 4 / 24));
                if (lat < 0) northing += 10000000;
                return { easting, northing };
            }
            
            function utmToLatLngApprox(easting, northing, lat_ref) {
                const a = 6378137.0;
                const f = 1 / 298.257223563;
                const b = a * (1 - f);
                const e2 = (a * a - b * b) / (a * a);
                const k0 = 0.9996;
                const lng0 = centralMeridian * Math.PI / 180;
                let N0 = 0;
                if (lat_ref < 0) N0 = 10000000;
                const y = (northing - N0) / k0;
                const x = (easting - 500000) / k0;
                const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
                const mu = y / (a * (1 - e2 / 4 - 3 * e2 ** 2 / 64));
                const phi1 = mu + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
                    + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu);
                const N1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
                const T1 = Math.tan(phi1) ** 2;
                const C1 = e2 / (1 - e2) * Math.cos(phi1) ** 2;
                const R1 = a * (1 - e2) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5;
                const D = x / N1;
                const lat = phi1 - (N1 * Math.tan(phi1) / R1) * (D ** 2 / 2
                    - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e2 / (1 - e2)) * D ** 4 / 24);
                const lng = lng0 + (D - (1 + 2 * T1 + C1) * D ** 3 / 6) / Math.cos(phi1);
                return { lat: lat * 180 / Math.PI, lng: lng * 180 / Math.PI };
            }
            
            const utmNW = latLngToUTMApprox(nwLatLng.lat, nwLatLng.lng);
            const utmSE = latLngToUTMApprox(seLatLng.lat, seLatLng.lng);
            const utmNE = latLngToUTMApprox(neLatLng.lat, neLatLng.lng);
            const utmSW = latLngToUTMApprox(swLatLng.lat, swLatLng.lng);
            
            const eMin = Math.floor(Math.min(utmNW.easting, utmSE.easting, utmNE.easting, utmSW.easting) / gridMeters) * gridMeters;
            const eMax = Math.ceil(Math.max(utmNW.easting, utmSE.easting, utmNE.easting, utmSW.easting) / gridMeters) * gridMeters;
            const nMin = Math.floor(Math.min(utmNW.northing, utmSE.northing, utmNE.northing, utmSW.northing) / gridMeters) * gridMeters;
            const nMax = Math.ceil(Math.max(utmNW.northing, utmSE.northing, utmNE.northing, utmSW.northing) / gridMeters) * gridMeters;
            
            const normalSlice = gridMeters >= 10000 ? 2 : (gridMeters >= 1000 ? 3 : 5);
            const clickSlice = (zoom >= 20) ? 4 : 3;
            
            ctx.font = 'bold 10px monospace';
            ctx.textBaseline = 'middle';
            
            const bottomMargin = 85; // above the route playback bar
            const rightMargin = 20;  // right edge
            const leftMargin = 25;   // left edge
            
            // Render Easting numbers (bottom ruler)
            let lastX = -999;
            for (let e = eMin; e <= eMax; e += gridMeters) {
                const nTop = Math.max(utmNW.northing, utmNE.northing, utmSW.northing, utmSE.northing) + 10000;
                const nBottom = Math.min(utmNW.northing, utmNE.northing, utmSW.northing, utmSE.northing) - 10000;
                const llTop = utmToLatLngApprox(e, nTop, latRef);
                const llBottom = utmToLatLngApprox(e, nBottom, latRef);
                
                const pTop = map.latLngToContainerPoint(llTop);
                const pBottom = map.latLngToContainerPoint(llBottom);
                
                const targetY = height - bottomMargin;
                if (Math.abs(pBottom.y - pTop.y) > 1) {
                    const intersectX = pTop.x + (targetY - pTop.y) * (pBottom.x - pTop.x) / (pBottom.y - pTop.y);
                    
                    if (intersectX >= leftMargin + 10 && intersectX <= width - rightMargin - 10) {
                        const isMain = (Math.round(e) % 100 === 0);
                        if (Math.abs(intersectX - lastX) < 45 && !isMain) {
                            continue;
                        }
                        
                        const isClicked = typeof mgrsRulerHighlightActive !== 'undefined' && mgrsRulerHighlightActive;
                        const sliceLen = isClicked ? clickSlice : normalSlice;
                        const labelVal = (e % 100000).toString().padStart(5, '0').slice(0, sliceLen);
                        
                        ctx.save();
                        if (isClicked) {
                            ctx.font = 'bold 13px monospace';
                        } else {
                            ctx.font = 'bold 10px monospace';
                        }
                        
                        const textWidth = ctx.measureText(labelVal).width;
                        
                        ctx.fillStyle = 'rgba(8, 16, 32, 0.85)';
                        if (isClicked) {
                            ctx.strokeStyle = '#00d2ff';
                            ctx.lineWidth = 1.8;
                        } else {
                            ctx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
                            ctx.lineWidth = 1;
                        }
                        
                        const boxHeight = isClicked ? 18 : 14;
                        const rectX = intersectX - textWidth / 2 - 5;
                        const rectY = targetY - boxHeight / 2;
                        
                        ctx.beginPath();
                        ctx.rect(rectX, rectY, textWidth + 10, boxHeight);
                        ctx.fill();
                        ctx.stroke();
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.fillText(labelVal, intersectX, targetY);
                        
                        ctx.restore();
                        
                        window.drawnMGRSRulerBoxes.push({
                            type: 'easting',
                            val: e,
                            rectX: rectX,
                            rectY: rectY,
                            width: textWidth + 10,
                            height: boxHeight
                        });
                        
                        lastX = intersectX;
                    }
                }
            }
            
            // Render Northing numbers (left ruler)
            let lastY = -999;
            for (let n = nMin; n <= nMax; n += gridMeters) {
                const eLeft = Math.min(utmNW.easting, utmNE.easting, utmSW.easting, utmSE.easting) - 10000;
                const eRight = Math.max(utmNW.easting, utmNE.easting, utmSW.easting, utmSE.easting) + 10000;
                const llLeft = utmToLatLngApprox(eLeft, n, latRef);
                const llRight = utmToLatLngApprox(eRight, n, latRef);
                
                const pLeft = map.latLngToContainerPoint(llLeft);
                const pRight = map.latLngToContainerPoint(llRight);
                
                const targetX = leftMargin;
                if (Math.abs(pRight.x - pLeft.x) > 1) {
                    const intersectY = pLeft.y + (targetX - pLeft.x) * (pRight.y - pLeft.y) / (pRight.x - pLeft.x);
                    
                    if (intersectY >= 10 && intersectY <= height - bottomMargin - 10) {
                        const isMain = (Math.round(n) % 100 === 0);
                        if (Math.abs(intersectY - lastY) < 20 && !isMain) {
                            continue;
                        }
                        
                        const isClicked = typeof mgrsRulerHighlightActive !== 'undefined' && mgrsRulerHighlightActive;
                        const sliceLen = isClicked ? clickSlice : normalSlice;
                        const northLabel = (n % 100000).toString().padStart(5, '0').slice(0, sliceLen);
                        
                        ctx.save();
                        if (isClicked) {
                            ctx.font = 'bold 13px monospace';
                        } else {
                            ctx.font = 'bold 10px monospace';
                        }
                        
                        const textWidth = ctx.measureText(northLabel).width;
                        
                        ctx.fillStyle = 'rgba(8, 16, 32, 0.85)';
                        if (isClicked) {
                            ctx.strokeStyle = '#00d2ff';
                            ctx.lineWidth = 1.8;
                        } else {
                            ctx.strokeStyle = 'rgba(0, 210, 255, 0.4)';
                            ctx.lineWidth = 1;
                        }
                        
                        const boxHeight = isClicked ? 18 : 14;
                        const rectX = targetX - textWidth / 2 - 5;
                        const rectY = intersectY - boxHeight / 2;
                        
                        ctx.beginPath();
                        ctx.rect(rectX, rectY, textWidth + 10, boxHeight);
                        ctx.fill();
                        ctx.stroke();
                        
                        ctx.fillStyle = '#ffffff';
                        ctx.textAlign = 'center';
                        ctx.fillText(northLabel, targetX, intersectY);
                        
                        ctx.restore();
                        
                        window.drawnMGRSRulerBoxes.push({
                            type: 'northing',
                            val: n,
                            rectX: rectX,
                            rectY: rectY,
                            width: textWidth + 10,
                            height: boxHeight
                        });
                    }
                }
            }
        } catch (e) {
            console.error("Error drawing grid rulers: ", e);
        }
    }

    const mgrsGridBtn = document.getElementById('mgrs-grid-btn');
    if (mgrsGridBtn) {
        mgrsGridBtn.addEventListener('click', () => {
            mgrsGridVisible = !mgrsGridVisible;
            if (!mgrsGridVisible && typeof mgrsRulerHighlightActive !== 'undefined' && mgrsRulerHighlightActive) {
                mgrsRulerHighlightActive = false;
            }
            if (mgrsGridVisible) {
                mgrsGridBtn.style.color = '#000';
                mgrsGridBtn.style.background = 'var(--primary)';
                const span = mgrsGridBtn.querySelector('span');
                if (span) span.style.color = '#000';
            } else {
                mgrsGridBtn.style.color = '';
                mgrsGridBtn.style.background = '';
                const span = mgrsGridBtn.querySelector('span');
                if (span) span.style.color = '';
            }
            buildMGRSGridLayer();
        });
    }
    // ============================================================
    // END MGRS GRID
    // ============================================================

    // Funcionalidade de Desenhar Alvo

    window.toggleTargetDrawingMode = function(btnElement) {
        targetDrawingActive = !targetDrawingActive;
        if (targetDrawingActive) {
            if (rulerActive && rulerBtn) rulerBtn.click();
            if (tgtCreationActive && tgtCreationBtn) tgtCreationBtn.click();
            
            if (btnElement) {
                btnElement.innerHTML = '<i class="fa-solid fa-floppy-disk"></i>';
                btnElement.style.background = '#00d2ff';
                btnElement.style.color = '#000';
            }
            document.getElementById('map').style.cursor = 'crosshair';
            
            if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
            if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
            clearDragHandles();
            targetPolygonPoints = null;
            drawnTargetPoints = [];
            drawnTargetMarkers = [];
            if (drawnTargetPolyline) { map.removeLayer(drawnTargetPolyline); drawnTargetPolyline = null; }
        } else {
            if (btnElement) {
                btnElement.innerHTML = '<i class="fa-solid fa-pencil"></i>';
                btnElement.style.background = 'rgba(0, 210, 255, 0.1)';
                btnElement.style.color = 'var(--primary)';
            }
            finishTargetDrawing(true);
        }
    };

    // Funcionalidade de CriaÃ§Ã£o de Alvos (TGT) por clique
    if (tgtCreationBtn) {
        tgtCreationBtn.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            tgtCreationActive = !tgtCreationActive;
            if (tgtCreationActive) {
                btn.style.color = '#000';
                btn.style.background = 'var(--primary)';
                document.getElementById('map').style.cursor = 'crosshair';
                
                // Desativa a rÃ©gua se ativa
                if (rulerActive && rulerBtn) rulerBtn.click();
                // Desativa desenho do alvo se estiver ativo
                if (targetDrawingActive && drawTargetBtn) drawTargetBtn.click();
            } else {
                btn.style.color = '';
                btn.style.background = '';
                document.getElementById('map').style.cursor = '';
            }
        });
    }

    if (showTgtListCheck) {
        showTgtListCheck.addEventListener('change', () => {
            const show = showTgtListCheck.checked;
            createdTargets.forEach(tgt => {
                if (show) {
                    if (!map.hasLayer(tgt.marker)) {
                        tgt.marker.addTo(map);
                    }
                } else {
                    if (map.hasLayer(tgt.marker)) {
                        map.removeLayer(tgt.marker);
                    }
                }
            });
        });
    }

    window.updatePolygonVisibility = function() {
        const activeTgt = targetLatLng ? createdTargets.find(t => t.latLng.lat === targetLatLng.lat && t.latLng.lng === targetLatLng.lng) : null;
        
        createdTargets.forEach(tgt => {
            const show = tgt.showPolygon !== false; // default true
            const isActive = activeTgt && tgt.id === activeTgt.id;
            
            // Handle active target which uses the drawnTargetPolygon (with editing handles)
            if (isActive) {
                if (drawnTargetPolygon) {
                    if (show && !map.hasLayer(drawnTargetPolygon)) drawnTargetPolygon.addTo(map);
                    if (!show && map.hasLayer(drawnTargetPolygon)) map.removeLayer(drawnTargetPolygon);
                }
                if (drawnTargetMiniPolygon && miniMap) {
                    if (show && !miniMap.hasLayer(drawnTargetMiniPolygon)) drawnTargetMiniPolygon.addTo(miniMap);
                    if (!show && miniMap.hasLayer(drawnTargetMiniPolygon)) miniMap.removeLayer(drawnTargetMiniPolygon);
                }
                if (targetDragHandles) {
                    targetDragHandles.forEach(h => {
                        if (show && !map.hasLayer(h)) h.addTo(map);
                        if (!show && map.hasLayer(h)) map.removeLayer(h);
                    });
                }
                // Hide its passive map polygon if it exists, since active is drawn
                if (tgt.mapPolygon && map.hasLayer(tgt.mapPolygon)) {
                    map.removeLayer(tgt.mapPolygon);
                }
            } else {
                // Handle non-active targets (passive map polygons)
                if (tgt.polygonPoints && tgt.polygonPoints.length > 0) {
                    if (!tgt.mapPolygon) {
                        tgt.mapPolygon = L.polygon(tgt.polygonPoints, {
                            color: '#00ffff',
                            fillColor: '#00ffff',
                            fillOpacity: 0.15,
                            weight: 2
                        }).bindTooltip(tgt.name || "Alvo");
                    } else {
                        tgt.mapPolygon.setLatLngs(tgt.polygonPoints);
                    }
                    
                    if (show && !map.hasLayer(tgt.mapPolygon)) tgt.mapPolygon.addTo(map);
                    if (!show && map.hasLayer(tgt.mapPolygon)) map.removeLayer(tgt.mapPolygon);
                } else if (tgt.mapPolygon) {
                    if (map.hasLayer(tgt.mapPolygon)) map.removeLayer(tgt.mapPolygon);
                    tgt.mapPolygon = null;
                }
            }
        });
    }
    const updatePolygonVisibility = window.updatePolygonVisibility;

    if (showTargetPolygonsCheck) {
        showTargetPolygonsCheck.addEventListener('change', () => {
            updatePolygonVisibility();
            
            // Toggle custom target polygons on the main map
            if (tacticalPoints && tacticalPoints['targets']) {
                const show = showTargetPolygonsCheck.checked;
                tacticalPoints['targets'].forEach(pt => {
                    if (pt.customPolygonLayer) {
                        if (show && pt.showPolygon !== false && !map.hasLayer(pt.customPolygonLayer)) {
                            pt.customPolygonLayer.addTo(map);
                        } else if (!show && map.hasLayer(pt.customPolygonLayer)) {
                            map.removeLayer(pt.customPolygonLayer);
                        }
                    }
                });
            }
        });
    }

    function createCustomTarget(latlng) {
        const name = `TGT${targetCounter}`;
        
        const triIcon = L.divIcon({ 
            className: 'target-triangle-custom', 
            html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><polygon points="15,5 28,25 2,25" stroke="#ff3333" stroke-width="2.5" fill="none" /></svg>`, 
            iconSize: [30, 30], 
            iconAnchor: [15, 18] 
        });
        
        const marker = L.marker(latlng, { icon: triIcon }).addTo(map);
        
        marker.bindTooltip(name, { permanent: true, direction: 'top', className: 'target-tooltip' });
        if (showLegends) marker.openTooltip(); else marker.closeTooltip();
        
        const tgt = {
            id: targetCounter++,
            name: name,
            latLng: latlng,
            marker: marker
        };
        
        createdTargets.push(tgt);
        
        marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            selectActiveTarget(tgt);
        });
        
        selectActiveTarget(tgt);
    }

    function selectActiveTarget(tgt) {
        targetLatLng = tgt.latLng;
        targetCoordsInput.value = formatCoords(tgt.latLng.lat, tgt.latLng.lng);
        
        if (targetMarker && targetMarker !== tgt.marker) {
            const isCustom = createdTargets.some(t => t.marker === targetMarker);
            if (!isCustom) {
                map.removeLayer(targetMarker);
            }
        }
        targetMarker = tgt.marker;
        
        document.getElementById('target-folder-name').textContent = tgt.name;
        document.getElementById('target-dmpi-display').textContent = 'COORDENADA TGT';
        
        const placeholder = document.getElementById('mini-map-placeholder');
        if (placeholder) placeholder.style.display = 'none';
        
        if (showTgtListCheck && !showTgtListCheck.checked) {
            showTgtListCheck.checked = true;
            showTgtListCheck.dispatchEvent(new Event('change'));
        } else {
            if (!map.hasLayer(tgt.marker)) {
                tgt.marker.addTo(map);
            }
        }
        
        if (miniMap) {
            miniMap.setView(tgt.latLng, 20);
            
            if (drawnTargetMiniPolygon) miniMap.removeLayer(drawnTargetMiniPolygon);
            drawnTargetMiniPolygon = null;
            
            if (miniMapTargetMarker) miniMap.removeLayer(miniMapTargetMarker);
            const triIconMini = L.divIcon({ className: 'target-triangle-mini', html: `<svg width="20" height="20" viewBox="0 0 20 20" style="display: block;"><polygon points="10,3 18,17 2,17" stroke="red" stroke-width="2" fill="none" /></svg>`, iconSize: [20, 20], iconAnchor: [10, 12] });
            miniMapTargetMarker = L.marker(tgt.latLng, { icon: triIconMini }).addTo(miniMap);
        }
        
        // Re-render target polygon associated with this custom target
        if (tgt.polygonPoints && tgt.polygonPoints.length > 0) {
            targetPolygonPoints = [...tgt.polygonPoints];
            
            if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
            if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
            
            drawnTargetPolygon = L.polygon(targetPolygonPoints, {
                color: '#00ffff',
                fillColor: '#00ffff',
                fillOpacity: 0.25,
                weight: 2
            }).addTo(map);
            drawnTargetPolygon.bindTooltip("Alvo Customizado");
            
            if (miniMap) {
                drawnTargetMiniPolygon = L.polygon(targetPolygonPoints, {
                    color: '#00ffff',
                    fillColor: '#00ffff',
                    fillOpacity: 0.25,
                    weight: 2
                }).addTo(miniMap);
            }
            
            createDragHandles();
            updatePolygonVisibility();
        } else {
            targetPolygonPoints = null;
            if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
            if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
            clearDragHandles();
        }
        
        if (tgt.linkedXmlReleaseIndex !== undefined && tgt.linkedXmlReleaseIndex !== null && parsedXMLReleases[tgt.linkedXmlReleaseIndex]) {
            const idx = tgt.linkedXmlReleaseIndex;
            if (telemetryReleaseSelect) {
                telemetryReleaseSelect.value = idx;
            }
            if (telemetryVisibilityPanel) {
                const labels = telemetryVisibilityPanel.querySelectorAll('label');
                labels.forEach((lbl, i) => {
                    lbl.classList.toggle('active-item', i === idx);
                    if (i === idx) {
                        parsedTelemetryReleasesVisibility[i] = true;
                        const cb = lbl.querySelector('input[type="checkbox"]');
                        if (cb) cb.checked = true;
                    }
                });
            }
            applyXMLRelease(idx);
        } else {
            drawImpactsOnMap();
        }
        updateTargetListUI();
    }

    function deleteTarget(id) {
        const index = createdTargets.findIndex(t => t.id === id);
        if (index !== -1) {
            const tgt = createdTargets[index];
            if (tgt.marker) {
                map.removeLayer(tgt.marker);
            }
            if (tgt.mapPolygon && map.hasLayer(tgt.mapPolygon)) {
                map.removeLayer(tgt.mapPolygon);
            }
            
            if (targetLatLng && targetLatLng.lat === tgt.latLng.lat && targetLatLng.lng === tgt.latLng.lng) {
                targetLatLng = null;
                targetMarker = null;
                targetCoordsInput.value = '';
                document.getElementById('target-folder-name').textContent = '';
                document.getElementById('target-dmpi-display').textContent = '';
                
                const placeholder = document.getElementById('mini-map-placeholder');
                if (placeholder) placeholder.style.display = 'flex';
                
                if (miniMapTargetMarker && miniMap) {
                    miniMap.removeLayer(miniMapTargetMarker);
                    miniMapTargetMarker = null;
                }
                
                drawImpactsOnMap();
            }
            
            createdTargets.splice(index, 1);
            updateTargetListUI();
        }
    }

    
    function updateTacticalList(mode) {
        let container;
        if (mode === 'waypoints') container = document.getElementById('waypoints-list');
        if (mode === 'targets') container = document.getElementById('targets-list');
        if (mode === 'artillery') container = document.getElementById('artillery-list');
        if (mode === 'navigation') container = document.getElementById('navigation-list');
                if (mode === 'friendly') container = document.getElementById('friendly-list');
        if (mode === 'threats') container = document.getElementById('threats-list');
        if (mode === 'scenario') {
            if (typeof window.renderScenarioList === 'function') {
                window.renderScenarioList();
                return;
            }
            container = document.getElementById('scenario-list');
        }
        
        if (!container) return;
        container.innerHTML = '';
        
        tacticalPoints[mode].forEach(pt => {
            const item = document.createElement('div');
            item.style.cssText = 'display:flex; align-items:center; gap:10px; margin-bottom:8px; padding:8px 12px; border-radius:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);';
            
            item.addEventListener('click', (e) => {
                if (e.target.closest('button') || e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
                selectTacticalPoint(pt, item);
            });

            if (typeof selectedTacticalPoint !== 'undefined' && selectedTacticalPoint && selectedTacticalPoint.pt.id === pt.id) {
                selectedTacticalPoint.element = item;
                item.classList.add('selected-tactical-item');
                if (pt.marker && pt.marker._icon) L.DomUtil.addClass(pt.marker._icon, 'selected-marker');
            }

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
        pt.marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            let itemEl = null;
            const lists = ['waypoints-list', 'targets-list', 'artillery-list', 'navigation-list', 'friendly-list', 'threats-list', 'scenario-list'];
            for (let listId of lists) {
                const listContainer = document.getElementById(listId);
                if (listContainer) {
                    const items = Array.from(listContainer.children);
                    const idx = tacticalPoints[listId.split('-')[0]]?.findIndex(x => x.id === pt.id);
                    if (idx !== -1 && idx !== undefined && items[idx]) itemEl = items[idx];
                }
            }
            if (typeof selectTacticalPoint === 'function' && itemEl) {
                selectTacticalPoint(pt, itemEl);
                itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
                    if (showLegends) pt.marker.openTooltip();
                }
            });
            
            const coordsEl = document.createElement('span');
            coordsEl.style.cssText = 'font-size:0.65rem; color:var(--text-dim);';
            const casTabActive = document.querySelector('.tab[data-target="cas-tab"]') && document.querySelector('.tab[data-target="cas-tab"]').classList.contains('active');
            let coordsFormat = casTabActive ? 'MGRS' : document.getElementById('coord-format').value;
            if (pt.latlng) {
                coordsEl.textContent = formatCoords(pt.latlng.lat, pt.latlng.lng, coordsFormat);
            } else if (pt.type === 'square' && pt.geoData && pt.geoData.bounds) {
                coordsEl.textContent = "Área Delimitada (Quadrado)";
            } else if (pt.type === 'circle' && pt.geoData && pt.geoData.center) {
                coordsEl.textContent = `Centro: ${formatCoords(pt.geoData.center[0], pt.geoData.center[1], coordsFormat)}`;
            } else {
                coordsEl.textContent = "Forma Geográfica";
            }
            
            info.appendChild(nameEl);
            info.appendChild(coordsEl);
            
            // Custom corner edit logic for squares has been moved to scenario-draw.js renderScenarioList
            
            if (pt.mode === 'scenario') {
                info.appendChild(document.createElement('br'));
            }
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
                rangeInput.placeholder = pt.rangeUnit === 'NM' ? 'Range (NM)' : 'Range (m)';
                rangeInput.value = pt.range || '';
                rangeInput.style.cssText = 'width:70px; font-size:0.7rem; padding:2px; background:rgba(0,0,0,0.5); color:white; border:1px solid var(--primary); border-radius:4px;';
                
                const updateArtillery = () => {
                    pt.gtl = parseFloat(gtlInput.value) || 0;
                    pt.range = parseFloat(rangeInput.value) || 0;
                    drawArtilleryImpact(pt);

                    // Sync to modal if this is the active point and modal is open
                    if (typeof currentArtilleryPt !== 'undefined' && currentArtilleryPt && currentArtilleryPt.id === pt.id && artilleryEditModal.style.display === 'flex') {
                        document.getElementById('art-edit-gtl').value = pt.gtl || '';
                        document.getElementById('art-edit-range').value = pt.range || '';
                    }
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
                    if(w === 'bomb') icon = '<i class="fa-solid fa-bomb"></i>';
                    if(w === 'rocket') icon = '<i class="fa-solid fa-rocket"></i>';
                    if(w === 'bullets') icon = '<i class="fa-solid fa-meteor"></i>';
                    
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
            actions.style.cssText = 'display:flex; gap:6px; align-items:center;';
            
            if (mode === 'targets') {
                const drawPolyBtn = document.createElement('button');
                drawPolyBtn.innerHTML = '<i class="fa-solid fa-draw-polygon"></i>';
                drawPolyBtn.title = 'Desenhar Polígono';
                drawPolyBtn.style.cssText = 'background:rgba(0, 210, 255, 0.1); border:1px solid var(--primary); color:var(--primary); cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
                drawPolyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (typeof window.startCustomTargetDrawing === 'function') window.startCustomTargetDrawing(pt);
                });
                actions.appendChild(drawPolyBtn);

                const showPolyLbl = document.createElement('label');
                showPolyLbl.style.cssText = 'display:flex; align-items:center; gap:4px; cursor:pointer; font-size:0.7rem; color:var(--text-dim); margin-right: 4px;';
                showPolyLbl.title = 'Mostrar/Ocultar Polígono no Mapa';
                const showPolyChk = document.createElement('input');
                showPolyChk.type = 'checkbox';
                showPolyChk.checked = pt.showPolygon !== false; // true by default if not set
                showPolyChk.addEventListener('change', (e) => {
                    e.stopPropagation();
                    pt.showPolygon = e.target.checked;
                    if (pt.customPolygonLayer) {
                        const globalShow = document.getElementById('show-targets-list') ? document.getElementById('show-targets-list').checked : true;
                        if (pt.showPolygon && globalShow) pt.customPolygonLayer.addTo(map);
                        else map.removeLayer(pt.customPolygonLayer);
                    }
                });
                showPolyLbl.appendChild(showPolyChk);
                showPolyLbl.appendChild(document.createTextNode('Pol'));
                actions.appendChild(showPolyLbl);

                const showVisLbl = document.createElement('label');
                showVisLbl.style.cssText = 'display:flex; align-items:center; gap:4px; cursor:pointer; font-size:0.7rem; color:var(--text-dim); margin-right: 4px;';
                showVisLbl.title = 'Mostrar/Ocultar Alvo no Mapa';
                const showVisChk = document.createElement('input');
                showVisChk.type = 'checkbox';
                showVisChk.checked = pt.visible !== false;
                showVisChk.addEventListener('change', (e) => {
                    e.stopPropagation();
                    pt.visible = e.target.checked;
                    if (typeof checkTargetsTimeSync === 'function') {
                        checkTargetsTimeSync();
                    }
                });
                showVisLbl.appendChild(showVisChk);
                showVisLbl.appendChild(document.createTextNode('Vis'));
                actions.appendChild(showVisLbl);

                const nineLBtn = document.createElement('button');
                nineLBtn.textContent = '9L';
                nineLBtn.title = '9-Line';
                nineLBtn.style.cssText = 'background:rgba(0, 210, 255, 0.1); border:1px solid var(--primary); color:var(--primary); cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem; font-weight:bold; letter-spacing:1px;';
                nineLBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openNineLineModal(pt);
                });
                actions.appendChild(nineLBtn);
            }
            
            if (mode === 'artillery') {
                const editArtBtn = document.createElement('button');
                editArtBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
                editArtBtn.title = 'Editar Artilharia';
                editArtBtn.style.cssText = 'background:rgba(0, 210, 255, 0.1); border:1px solid var(--primary); color:var(--primary); cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
                editArtBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openArtilleryModal(pt);
                });
                actions.appendChild(editArtBtn);
            }
            
            const gotoBtn = document.createElement('button');
            gotoBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
            gotoBtn.style.cssText = 'background:rgba(0, 210, 255, 0.1); border:1px solid var(--primary); color:var(--primary); cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
            gotoBtn.addEventListener('click', () => map.setView(pt.latlng, 15, {animate: true}));
            
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            delBtn.style.cssText = 'background:rgba(255, 0, 0, 0.1); border:1px solid red; color:red; cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
            delBtn.addEventListener('click', () => {
                if (pt.marker) map.removeLayer(pt.marker);
                if (pt.circle) map.removeLayer(pt.circle);
                if (pt.impactLine) map.removeLayer(pt.impactLine);
                if (pt.impactMarker) map.removeLayer(pt.impactMarker);
                if (pt.bombCircle) map.removeLayer(pt.bombCircle);
                if (pt.rocketCircle) map.removeLayer(pt.rocketCircle);
                if (pt.bulletsCircle) map.removeLayer(pt.bulletsCircle);
                if (pt.activeGreenLine) map.removeLayer(pt.activeGreenLine);
                if (pt.corridorLines) pt.corridorLines.forEach(l => map.removeLayer(l));
                if (pt.corridorPolygon) map.removeLayer(pt.corridorPolygon);
                if (pt.cannonMarkers) pt.cannonMarkers.forEach(m => map.removeLayer(m));
                if (pt.batteryPolygon) map.removeLayer(pt.batteryPolygon);
                if (pt.impactPolygon) map.removeLayer(pt.impactPolygon);
                // Clear existing markers if inactive
                if (pt.projectileMarkers) {
                    pt.projectileMarkers.forEach(m => { if (m && map.hasLayer(m)) map.removeLayer(m); });
                    pt.projectileMarkers = [];
                }
                if (pt.blastCircles) {
                    pt.blastCircles.forEach(c => map.removeLayer(c));
                    pt.blastCircles = [];
                }
                if (pt.dmpiMarkers) {
                    pt.dmpiMarkers.forEach(m => map.removeLayer(m));
                    pt.dmpiMarkers = [];
                }
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

    window.parseCoordsToLatLng = function(str) {
        if (!str) return null;
        try {
            const cleanStr = str.trim().replace(/\s+/g, '');
            if (typeof mgrs !== 'undefined' && typeof mgrs.toPoint === 'function') {
                const lonlat = mgrs.toPoint(cleanStr);
                return L.latLng(lonlat[1], lonlat[0]);
            }
        } catch(e) {}
        
        try {
            const parts = str.split(',').map(p => p.trim());
            if (parts.length === 2) {
                const lat = parseFloat(parts[0]);
                const lng = parseFloat(parts[1]);
                if (!isNaN(lat) && !isNaN(lng)) {
                    return L.latLng(lat, lng);
                }
            }
        } catch(e) {}
        
        // Lookup in tacticalPoints if not a valid coordinate
        if (typeof window.tacticalPoints !== 'undefined') {
            for (let mode in window.tacticalPoints) {
                const pt = window.tacticalPoints[mode].find(p => p.name && p.name.toLowerCase() === str.trim().toLowerCase());
                if (pt && pt.latlng) return L.latLng(pt.latlng.lat, pt.latlng.lng);
            }
        }
        
        return null;
    };
    // Kept local alias for internal script.js usage if needed
    const parseCoordsToLatLng = window.parseCoordsToLatLng;

    function calculateGtlAndRange(startLatLng, endLatLng) {
        const lat1 = startLatLng.lat * Math.PI / 180;
        const lat2 = endLatLng.lat * Math.PI / 180;
        const lon1 = startLatLng.lng * Math.PI / 180;
        const lon2 = endLatLng.lng * Math.PI / 180;
        
        const dLon = lon2 - lon1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        let brng = Math.atan2(y, x) * 180 / Math.PI;
        const trueHeading = (brng + 360) % 360;
        
        const magDec = parseFloat(document.getElementById('mag-declination') ? document.getElementById('mag-declination').value : "-18") || 0;
        const magHeading = Math.round((trueHeading - magDec + 360) % 360);
        
        const distanceMeters = startLatLng.distanceTo(endLatLng);
        
        return { gtl: magHeading, range: distanceMeters };
    }

    function drawArtilleryImpact(pt) {
        if (pt.impactLine) { map.removeLayer(pt.impactLine); pt.impactLine = null; }
        if (pt.corridorLines) { pt.corridorLines.forEach(l => map.removeLayer(l)); pt.corridorLines = null; }
        if (pt.corridorPolygon) { map.removeLayer(pt.corridorPolygon); pt.corridorPolygon = null; }
        if (pt.cannonMarkers) { pt.cannonMarkers.forEach(m => map.removeLayer(m)); pt.cannonMarkers = null; }
        if (pt.batteryPolygon) { map.removeLayer(pt.batteryPolygon); pt.batteryPolygon = null; }
        if (pt.impactPolygon) { map.removeLayer(pt.impactPolygon); pt.impactPolygon = null; }
        if (pt.impactMarker) { map.removeLayer(pt.impactMarker); pt.impactMarker = null; }
        
        let impactLatLng = null;
        
        if (pt.impactCoords) {
            impactLatLng = parseCoordsToLatLng(pt.impactCoords);
            if (impactLatLng) {
                const stats = calculateGtlAndRange(pt.latlng, impactLatLng);
                pt.gtl = stats.gtl;
                pt.range = pt.rangeUnit === 'NM' ? parseFloat((stats.range / 1852).toFixed(1)) : Math.round(stats.range);
                
                const artEditGtl = document.getElementById('art-edit-gtl');
                const artEditRange = document.getElementById('art-edit-range');
                if (currentArtilleryPt && currentArtilleryPt.id === pt.id) {
                    if (artEditGtl) artEditGtl.value = pt.gtl;
                    if (artEditRange) artEditRange.value = pt.range;
                }
            }
        }
        
        const isValidLatLng = (ll) => ll && typeof ll.lat === 'number' && typeof ll.lng === 'number' && !isNaN(ll.lat) && !isNaN(ll.lng) && isFinite(ll.lat) && isFinite(ll.lng);

        if (!isValidLatLng(pt.latlng)) return;

        // Fallback to GTL + Range
        if (!impactLatLng && pt.gtl !== undefined && pt.gtl !== null && pt.range !== undefined && pt.range !== null) {
            const magDec = parseFloat(document.getElementById('mag-declination').value || 0);
            if (!isNaN(magDec)) {
                let rangeMeters = pt.range;
                if (pt.rangeUnit === 'NM') {
                    rangeMeters = pt.range * 1852;
                }
                const trueHeading = (pt.gtl + magDec + 360) % 360;
                const rad = (trueHeading * Math.PI) / 180;
                const distDegLat = (rangeMeters / 111111) * Math.cos(rad);
                const distDegLng = (rangeMeters / (111111 * Math.cos(pt.latlng.lat * Math.PI / 180))) * Math.sin(rad);
                impactLatLng = L.latLng(pt.latlng.lat + distDegLat, pt.latlng.lng + distDegLng);
                
                try {
                    if (window.mgrs && typeof window.mgrs.forward === 'function' && isValidLatLng(impactLatLng)) {
                        const m = window.mgrs.forward([impactLatLng.lng, impactLatLng.lat]);
                        pt.impactCoords = m.replace(/^(\d+[A-Z])([A-Z]{2})(\d{5})(\d{5})$/, '$1 $2 $3 $4');
                        const artEditCoords = document.getElementById('art-edit-coords');
                        if (currentArtilleryPt && currentArtilleryPt.id === pt.id && artEditCoords) {
                            artEditCoords.value = pt.impactCoords;
                        }
                    }
                } catch(e) {}
            }
        }
        
        if (!isValidLatLng(impactLatLng)) return;
        
        // Sincronizar inputs da barra lateral
        const listContainer = document.getElementById('artillery-list');
        if (listContainer) {
            const items = Array.from(listContainer.children);
            const idx = tacticalPoints.artillery.findIndex(x => x.id === pt.id);
            if (idx !== -1 && items[idx]) {
                const itemEl = items[idx];
                const gtlIn = itemEl.querySelector('input[placeholder="GTL (Mag)"]');
                if (gtlIn) gtlIn.value = pt.gtl || '';
                const rangeIn = itemEl.querySelector('input[placeholder^="Range"]');
                if (rangeIn) {
                    rangeIn.value = pt.range || '';
                    rangeIn.placeholder = pt.rangeUnit === 'NM' ? 'Range (NM)' : 'Range (m)';
                }
            }
        }
        
        // Gerar sub-canhões e corredor
        const structure = pt.structure || 'Bateria';
        let numCannons = 1;
        let spreadX = 0, spreadY = 0;
        if (structure === 'Seção') { numCannons = 2; spreadX = 100; spreadY = 50; }
        else if (structure === 'Bateria') { numCannons = 8; spreadX = 400; spreadY = 150; }
        let areaMultiplier = pt.artilleryType === 'Astros II' ? 8 : 4;
        const showCorridor = numCannons > 1 || pt.artilleryType === 'Astros II';

        const dLat = impactLatLng.lat - pt.latlng.lat;
        const dLng = impactLatLng.lng - pt.latlng.lng;
        const gtlHeadingRad = Math.atan2(dLng * Math.cos(pt.latlng.lat * Math.PI/180), dLat);

        const maxSide = Math.max(spreadX, spreadY);
        const impactRadius = maxSide * 1.5;

        if (showCorridor && maxSide > 0) {
            const corridorWidth = impactRadius * 2;
            const halfWidth = corridorWidth / 2;
            const perpRad = gtlHeadingRad + Math.PI / 2;
            
            const offsetLat = (halfWidth / 111111) * Math.cos(perpRad);
            const offsetLng = (halfWidth / (111111 * Math.cos(pt.latlng.lat * Math.PI/180))) * Math.sin(perpRad);

            const leftStart = L.latLng(pt.latlng.lat + offsetLat, pt.latlng.lng + offsetLng);
            const rightStart = L.latLng(pt.latlng.lat - offsetLat, pt.latlng.lng - offsetLng);
            const leftEnd = L.latLng(impactLatLng.lat + offsetLat, impactLatLng.lng + offsetLng);
            const rightEnd = L.latLng(impactLatLng.lat - offsetLat, impactLatLng.lng - offsetLng);

            pt.corridorLines = [
                L.polyline([leftStart, leftEnd], { color: 'blue', dashArray: '5, 5', weight: 1, opacity: 0.6 }),
                L.polyline([rightStart, rightEnd], { color: 'blue', dashArray: '5, 5', weight: 1, opacity: 0.6 })
            ];
            
            pt.corridorPolygon = L.polygon([leftStart, leftEnd, rightEnd, rightStart], { color: 'red', weight: 0, fillOpacity: 0.2 });

            const corners = [
                { cx: spreadX/2, cy: spreadY/2 },
                { cx: spreadX/2, cy: -spreadY/2 },
                { cx: -spreadX/2, cy: -spreadY/2 },
                { cx: -spreadX/2, cy: spreadY/2 }
            ].map(c => {
                const latOff = c.cx * Math.cos(gtlHeadingRad + Math.PI/2) + c.cy * Math.cos(gtlHeadingRad);
                const lngOff = c.cx * Math.sin(gtlHeadingRad + Math.PI/2) + c.cy * Math.sin(gtlHeadingRad);
                return L.latLng(pt.latlng.lat + (latOff / 111111), pt.latlng.lng + (lngOff / (111111 * Math.cos(pt.latlng.lat * Math.PI/180))));
            });

            pt.batteryPolygon = L.polygon(corners, { color: 'blue', weight: 1, fillOpacity: 0.1, dashArray: '4,4' });

            pt.impactPolygon = L.circle(impactLatLng, { radius: impactRadius, color: 'red', weight: 1, fillOpacity: 0.1, dashArray: '4,4' });

        } else {
            pt.impactLine = L.polyline([pt.latlng, impactLatLng], { color: 'blue', dashArray: '5, 5', weight: 1, opacity: 0.6 });
        }

        // Generate randomized cannons
        pt.cannons = [];
        const cadence = Math.max(0.1, pt.cadence || 3);
        const cadenceIntervalSec = 60 / cadence;

        pt.cannonMarkers = pt.cannonMarkers || [];
        pt.cannonMarkers.forEach(m => map.removeLayer(m));
        pt.cannonMarkers = [];

        for (let i = 0; i < numCannons; i++) {
            let cx = 0, cy = 0;
            if (numCannons > 1) {
                cx = (Math.random() - 0.5) * spreadX;
                cy = (Math.random() - 0.5) * spreadY;
            }
            const latOffsetM = cx * Math.cos(gtlHeadingRad + Math.PI/2) + cy * Math.cos(gtlHeadingRad);
            const lngOffsetM = cx * Math.sin(gtlHeadingRad + Math.PI/2) + cy * Math.sin(gtlHeadingRad);

            const originLat = pt.latlng.lat + (latOffsetM / 111111);
            const originLng = pt.latlng.lng + (lngOffsetM / (111111 * Math.cos(pt.latlng.lat * Math.PI/180)));

            let imgSrc = 'art_a1.png';
            let rotationOffset = 90;
            let realLengthMeters = 3 * 2.6;
            if (pt.artilleryType === 'Astros II') {
                imgSrc = 'art_a2.png';
                rotationOffset = 90;
                realLengthMeters = 11 * 1.3;
            } else if (pt.artilleryType === 'M109') {
                imgSrc = 'art_a3.png';
                rotationOffset = 0;
                realLengthMeters = 9 * 1.3;
            }

            const iconHtml = `<img src="${imgSrc}" data-length="${realLengthMeters}" data-lat="${originLat}" style="width: 32px; height: 32px; object-fit: contain; transform: rotate(${pt.gtl + rotationOffset}deg); filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.9)); margin-left: -16px; margin-top: -16px;">`;

            pt.cannonMarkers.push(L.marker(L.latLng(originLat, originLng), {
                icon: L.divIcon({
                    className: 'custom-artillery-icon',
                    html: iconHtml,
                    iconSize: [0, 0],
                    iconAnchor: [0, 0]
                })
            }));

            const numRockets = pt.artilleryType === 'Astros II' ? 8 : 1;
            
            for (let r = 0; r < numRockets; r++) {
                let targetLat = impactLatLng.lat;
                let targetLng = impactLatLng.lng;
                if (showCorridor && impactRadius > 0) {
                    const rDist = Math.sqrt(Math.random()) * impactRadius;
                    const angle = Math.random() * Math.PI * 2;
                    const dispLatM = rDist * Math.cos(angle);
                    const dispLngM = rDist * Math.sin(angle);
                    
                    targetLat += (dispLatM / 111111);
                    targetLng += (dispLngM / (111111 * Math.cos(impactLatLng.lat * Math.PI/180)));
                }

                let offsetSec = Math.random() * cadenceIntervalSec;
                if (pt.artilleryType === 'Astros II') {
                    const pairIndex = Math.floor(r / 2);
                    offsetSec = pairIndex * 2.0; 
                }

                pt.cannons.push({
                    origin: L.latLng(originLat, originLng),
                    target: L.latLng(targetLat, targetLng),
                    firingOffsetSec: offsetSec
                });
            }
        }
        
        // Immediately update sizes for the current zoom level
        setTimeout(() => { if (typeof window.updateAllArtillerySizes === 'function') window.updateAllArtillerySizes(); }, 50);
        
        const xIcon = L.divIcon({ className: 'impact-x', html: `<svg width="16" height="16" viewBox="0 0 16 16"><line x1="0" y1="0" x2="16" y2="16" stroke="blue" stroke-width="3"/><line x1="16" y1="0" x2="0" y2="16" stroke="blue" stroke-width="3"/></svg>`, iconSize: [16, 16], iconAnchor: [8, 8] });
        pt.impactMarker = L.marker(impactLatLng, { icon: xIcon });

        let shouldShow = true;
        const artilleryEditModal = document.getElementById('artillery-edit-modal');
        const isEditing = typeof currentArtilleryPt !== 'undefined' && currentArtilleryPt && currentArtilleryPt.id === pt.id && artilleryEditModal && artilleryEditModal.style.display === 'flex';

        if (pt.timeSyncEnabled && window.getCurrentTelemetryTime && !isEditing) {
            const currentGlobalTimeMs = window.getCurrentTelemetryTime();
            const formatTime = (ms) => {
                if (!ms) return '00:00:00';
                const d = new Date(ms);
                return String(d.getUTCHours()).padStart(2, '0') + ':' + 
                       String(d.getUTCMinutes()).padStart(2, '0') + ':' + 
                       String(d.getUTCSeconds()).padStart(2, '0');
            };
            const currentTimeStr = formatTime(currentGlobalTimeMs);
            
            const padTime = (str) => {
                const parts = str.split(':');
                while (parts.length < 3) parts.push('00');
                return parts.map(p => p.padStart(2, '0')).join(':');
            };
            const tNorm = padTime(currentTimeStr);
            
            const checkWindow = (s, e) => {
                if (!s || !e) return false;
                const startNorm = padTime(s);
                const endNorm = padTime(e);
                if (startNorm <= endNorm) {
                    return tNorm >= startNorm && tNorm <= endNorm;
                } else {
                    return tNorm >= startNorm || tNorm <= endNorm;
                }
            };
            
            const w1 = checkWindow(pt.startTime, pt.endTime);
            const w2 = checkWindow(pt.startTime2, pt.endTime2);
            const w3 = checkWindow(pt.startTime3, pt.endTime3);
            
            if ((pt.startTime && pt.endTime) || (pt.startTime2 && pt.endTime2) || (pt.startTime3 && pt.endTime3)) {
                shouldShow = w1 || w2 || w3;
            }
        }

        if (shouldShow) {
            if (pt.impactLine) pt.impactLine.addTo(map);
            if (pt.corridorLines) pt.corridorLines.forEach(l => l.addTo(map));
            if (pt.batteryPolygon) pt.batteryPolygon.addTo(map);
            if (pt.impactPolygon) pt.impactPolygon.addTo(map);
            if (pt.cannonMarkers) pt.cannonMarkers.forEach(m => m.addTo(map));
            if (pt.impactMarker) pt.impactMarker.addTo(map);
        }

        const tooltipHtml = `
            <div style="font-family: monospace; font-size: 11px;">
                <b>Nome:</b> ${pt.artilleryName || pt.name || pt.id || 'Artilharia'}<br>
                <b>Tipo:</b> ${pt.artilleryType || 'Outros'}<br>
                <b>Estrutura:</b> ${structure}<br>
                <b>GTL:</b> ${pt.gtl}°<br>
                <b>Range:</b> ${pt.range}${pt.rangeUnit}<br>
                <b>Impacto:</b> ${pt.impactCoords}<br>
                <b>Janela 1:</b> ${pt.startTime || '--:--:--'} - ${pt.endTime || '--:--:--'}
                ${pt.startTime2 || pt.endTime2 ? `<br><b>Janela 2:</b> ${pt.startTime2 || '--:--:--'} - ${pt.endTime2 || '--:--:--'}` : ''}
                ${pt.startTime3 || pt.endTime3 ? `<br><b>Janela 3:</b> ${pt.startTime3 || '--:--:--'} - ${pt.endTime3 || '--:--:--'}` : ''}
            </div>
        `;
        if (pt.marker) {
            pt.marker.bindTooltip(tooltipHtml);
        }
        if (pt.batteryPolygon) {
            pt.batteryPolygon.bindTooltip(tooltipHtml);
        }
        if (pt.impactPolygon) {
            pt.impactPolygon.bindTooltip(tooltipHtml);
        }
    }

function updateTargetListUI() {
        if (!targetListContainer) return;
        targetListContainer.innerHTML = '';

        createdTargets.forEach(tgt => {
            const item = document.createElement('div');
            const isActive = targetLatLng && targetLatLng.lat === tgt.latLng.lat && targetLatLng.lng === tgt.latLng.lng;
            
            item.style.cssText = `display:flex; align-items:center; gap:10px; margin-bottom:8px; padding:8px 12px; border-radius:8px; transition: all 0.2s; cursor:pointer; min-height:42px; ${isActive ? 'background:rgba(0, 210, 255, 0.15); border:1px solid var(--primary); box-shadow:0 0 8px rgba(0, 210, 255, 0.25);' : 'background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);'}`;

            const infoContainer = document.createElement('div');
            infoContainer.style.cssText = 'flex:1; display:flex; flex-direction:column; gap:2px; min-width:0;';

            const nameEl = document.createElement('span');
            nameEl.style.cssText = 'font-size:0.85rem; font-weight:bold; color:#ff3333; outline:none; cursor:default; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;';
            nameEl.textContent = tgt.name;

            const coordsEl = document.createElement('span');
            coordsEl.style.cssText = 'font-size:0.65rem; color:var(--text-dim);';
            coordsEl.textContent = formatCoords(tgt.latLng.lat, tgt.latLng.lng);

            infoContainer.appendChild(nameEl);
            infoContainer.appendChild(coordsEl);

            // Atrelar emprego XML ao alvo
            if (parsedXMLReleases && parsedXMLReleases.length > 0) {
                const linkSelect = document.createElement('select');
                linkSelect.style.cssText = 'width:100%; margin-top:5px; padding:3px 6px; font-size:0.65rem; background:rgba(15, 23, 42, 0.7); border:1px solid rgba(255,255,255,0.1); border-radius:4px; color:var(--primary); outline:none; cursor:pointer; font-weight:bold; height:20px; transition:border 0.2s;';
                
                const noneOpt = document.createElement('option');
                noneOpt.value = '';
                noneOpt.textContent = 'Sem Emprego XML';
                linkSelect.appendChild(noneOpt);

                parsedXMLReleases.forEach((rel, index) => {
                    const opt = document.createElement('option');
                    opt.value = index;
                    opt.textContent = rel.wdTitle;
                    linkSelect.appendChild(opt);
                });

                linkSelect.value = (tgt.linkedXmlReleaseIndex !== undefined && tgt.linkedXmlReleaseIndex !== null) ? tgt.linkedXmlReleaseIndex : '';

                linkSelect.addEventListener('click', (e) => {
                    e.stopPropagation();
                });

                linkSelect.addEventListener('change', (e) => {
                    const val = e.target.value;
                    tgt.linkedXmlReleaseIndex = val !== '' ? parseInt(val) : null;
                    if (tgt.linkedXmlReleaseIndex !== null) {
                        selectActiveTarget(tgt);
                    } else {
                        updateTargetListUI();
                    }
                });

                infoContainer.appendChild(linkSelect);
            }

            item.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                selectActiveTarget(tgt);
            });

            const actions = document.createElement('div');
            actions.style.cssText = 'display:flex; gap:6px; flex-shrink:0;';

            const zoomBtn = document.createElement('button');
            zoomBtn.title = 'Ir para o Alvo';
            zoomBtn.style.cssText = 'background:rgba(0, 210, 255, 0.1); border:1px solid var(--primary); color:var(--primary); cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
            zoomBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
            zoomBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                map.setView(tgt.latLng, 18);
                if (miniMap) miniMap.setView(tgt.latLng, 20);
                selectActiveTarget(tgt);
            });

            const delBtn = document.createElement('button');
            delBtn.title = 'Excluir Alvo';
            delBtn.style.cssText = 'background:rgba(255, 51, 51, 0.1); border:1px solid #ff3333; color:#ff3333; cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
            delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTarget(tgt.id);
            });

            const drawPolyBtn = document.createElement('button');
            drawPolyBtn.title = 'Desenhar Polígono';
            drawPolyBtn.style.cssText = 'background:rgba(0, 210, 255, 0.1); border:1px solid var(--primary); color:var(--primary); cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem;';
            drawPolyBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
            drawPolyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectActiveTarget(tgt);
                if (window.toggleTargetDrawingMode) window.toggleTargetDrawingMode(drawPolyBtn);
            });

            const togglePolyBtn = document.createElement('button');
            togglePolyBtn.title = 'Mostrar/Ocultar Polígono';
            const polyVisible = tgt.showPolygon !== false; // default true
            togglePolyBtn.style.cssText = `background:rgba(255, 255, 255, 0.1); border:1px solid #fff; color:#fff; cursor:pointer; padding:4px 6px; border-radius:4px; font-size:0.7rem; opacity: ${polyVisible ? '1' : '0.4'};`;
            togglePolyBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
            togglePolyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                tgt.showPolygon = !polyVisible;
                if (typeof updatePolygonVisibility === 'function') updatePolygonVisibility();
                updateTargetListUI();
            });

            actions.appendChild(zoomBtn);
            actions.appendChild(drawPolyBtn);
            actions.appendChild(togglePolyBtn);
            actions.appendChild(delBtn);

            item.appendChild(infoContainer);
            item.appendChild(actions);
            targetListContainer.appendChild(item);
        });
    }

    function clearDragHandles() {
        targetDragHandles.forEach(h => map.removeLayer(h));
        targetDragHandles = [];
    }

    function createDragHandles() {
        clearDragHandles();
        if (!targetPolygonPoints || targetPolygonPoints.length === 0) return;
        
        targetPolygonPoints.forEach((pt, idx) => {
            const handle = L.marker(pt, {
                draggable: true,
                icon: L.divIcon({
                    className: 'target-drag-handle',
                    html: `<div style="width: 12px; height: 12px; background: #00ffff; border: 2.5px solid #000; border-radius: 50%; box-shadow: 0 0 8px #00ffff; cursor: move; transform: translate(-1px, -1px);"></div>`,
                    iconSize: [12, 12],
                    iconAnchor: [6, 6]
                })
            }).addTo(map);
            
            handle.on('drag', (e) => {
                const newLatLng = e.target.getLatLng();
                targetPolygonPoints[idx] = newLatLng;
                
                // Atualiza polÃ­gonos
                if (drawnTargetPolygon) drawnTargetPolygon.setLatLngs(targetPolygonPoints);
                if (drawnTargetMiniPolygon) drawnTargetMiniPolygon.setLatLngs(targetPolygonPoints);
                
                // Se estiver editando um emprego, atualiza o polÃ­gono dele em tempo real
                if (editingEmploymentId !== null) {
                    const emp = savedEmployments.find(empEl => empEl.id === editingEmploymentId);
                    if (emp) {
                        emp.targetPolygonPoints = targetPolygonPoints.map(pt => L.latLng(pt.lat, pt.lng));
                    }
                }
                
                // --- NOVO: Salva os pontos no alvo customizado ativo ---
                const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === targetLatLng.lat && t.latLng.lng === targetLatLng.lng);
                if (activeCustomTgt) {
                    activeCustomTgt.polygonPoints = [...targetPolygonPoints];
                }
                
                // Recalcula a eficÃ¡cia na hora
                validateEmploymentEfficacy();
            });
            
            handle.on('dragend', () => {
                // ReconstrÃ³i para manter sincronia
                createDragHandles();
                updatePolygonVisibility();
            });

            // Clique duplo no vÃ©rtice remove o ponto do polÃ­gono
            handle.on('dblclick', (e) => {
                L.DomEvent.stopPropagation(e); // Evita o zoom do mapa e outras propagaÃ§Ã£o
                
                if (targetPolygonPoints.length <= 3) {
                    alert('Um polÃ­gono de alvo precisa ter no mÃ­nimo 3 pontos.');
                    return;
                }
                
                targetPolygonPoints.splice(idx, 1);
                
                if (drawnTargetPolygon) drawnTargetPolygon.setLatLngs(targetPolygonPoints);
                if (drawnTargetMiniPolygon) drawnTargetMiniPolygon.setLatLngs(targetPolygonPoints);
                
                if (editingEmploymentId !== null) {
                    const emp = savedEmployments.find(empEl => empEl.id === editingEmploymentId);
                    if (emp) {
                        emp.targetPolygonPoints = targetPolygonPoints.map(pt => L.latLng(pt.lat, pt.lng));
                    }
                }
                
                // --- NOVO: Salva os pontos no alvo customizado ativo ---
                const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === targetLatLng.lat && t.latLng.lng === targetLatLng.lng);
                if (activeCustomTgt) {
                    activeCustomTgt.polygonPoints = [...targetPolygonPoints];
                }
                
                createDragHandles();
                updatePolygonVisibility();
                validateEmploymentEfficacy();
                saveCurrentDmpiToCache();
            });
            
            targetDragHandles.push(handle);
        });
    }

    function finishTargetDrawing(shouldSave = true) {
        targetDrawingActive = false;
        if (drawTargetBtn) {
            drawTargetBtn.innerHTML = '<i class="fa-solid fa-pencil"></i> DESENHAR ALVO (POLÃ GONO)';
            drawTargetBtn.style.background = '';
            drawTargetBtn.style.color = '';
        }
        document.getElementById('map').style.cursor = '';
        
        // Remove marcadores temporÃ¡rios
        drawnTargetMarkers.forEach(m => map.removeLayer(m));
        drawnTargetMarkers = [];
        if (drawnTargetPolyline) { map.removeLayer(drawnTargetPolyline); drawnTargetPolyline = null; }
        
        if (!shouldSave) {
            drawnTargetPoints = [];
            targetPolygonPoints = null;
            clearDragHandles();
            validateEmploymentEfficacy();
            return;
        }

        if (drawnTargetPoints.length < 3) {
            alert('Por favor, clique em pelo menos 3 pontos para formar o polÃ­gono do alvo.');
            drawnTargetPoints = [];
            targetPolygonPoints = null;
            clearDragHandles();
            validateEmploymentEfficacy();
            return;
        }
        
        targetPolygonPoints = [...drawnTargetPoints];
        
        let sumLat = 0, sumLng = 0;
        targetPolygonPoints.forEach(pt => {
            sumLat += pt.lat;
            sumLng += pt.lng;
        });
        const centroidLat = sumLat / targetPolygonPoints.length;
        const centroidLng = sumLng / targetPolygonPoints.length;
        const centroid = L.latLng(centroidLat, centroidLng);

        // --- NOVO: Salva os pontos no alvo customizado ativo ou cria um novo ---
        const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === targetLatLng.lat && t.latLng.lng === targetLatLng.lng);
        
        targetLatLng = centroid;
        
        if (activeCustomTgt) {
            activeCustomTgt.latLng = centroid;
            activeCustomTgt.polygonPoints = [...targetPolygonPoints];
        } else {
            const newId = createdTargets.length + 1;
            const newTgt = {
                id: newId,
                name: `TGT ${newId}`,
                latLng: centroid,
                polygonPoints: [...targetPolygonPoints]
            };
            createdTargets.push(newTgt);
            if (typeof updateTargetListUI === 'function') updateTargetListUI();
        }

        if (targetMarker) {
            targetMarker.setLatLng(centroid);
        } else {
            const triIcon = L.divIcon({ className: 'target-triangle', html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><polygon points="15,5 28,25 2,25" stroke="red" stroke-width="2.5" fill="none" /></svg>`, iconSize: [30, 30], iconAnchor: [15, 18] });
            targetMarker = L.marker(targetLatLng, { icon: triIcon }).addTo(map);
            targetMarker.bindTooltip("Alvo");
            if (typeof showLegends !== 'undefined' && showLegends) targetMarker.openTooltip();
        }
        if (targetCoordsInput) {
            targetCoordsInput.value = typeof formatCoords === 'function' ? formatCoords(centroidLat, centroidLng) : `${centroidLat}, ${centroidLng}`;
        }
        if (typeof updateDistance === 'function') updateDistance();
        if (typeof drawImpactsOnMap === 'function') drawImpactsOnMap();
        if (typeof saveCurrentDmpiToCache === 'function') saveCurrentDmpiToCache();
        
        // Cria polÃ­gono no mapa principal
        drawnTargetPolygon = L.polygon(targetPolygonPoints, {
            color: '#00ffff',
            fillColor: '#00ffff',
            fillOpacity: 0.25,
            weight: 2
        }).addTo(map);
        drawnTargetPolygon.bindTooltip("Alvo Customizado");
        
        // Cria polÃ­gono no mini mapa
        if (miniMap) {
            drawnTargetMiniPolygon = L.polygon(targetPolygonPoints, {
                color: '#00ffff',
                fillColor: '#00ffff',
                fillOpacity: 0.25,
                weight: 2
            }).addTo(miniMap);
        }
        
        // Cria alÃ§as de ajuste manual
        createDragHandles();
        
        updatePolygonVisibility();
        
        validateEmploymentEfficacy();
    }

    function createAutoTargetPolygon(center, W, L_dim, type) {
        // Limpa polÃ­gonos antigos e alÃ§as
        if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
        if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
        clearDragHandles();

        const feedbackBox = document.getElementById('feedback-box');
        const feedbackText = document.getElementById('feedback-text');
        if (feedbackBox && feedbackText) {
            feedbackBox.style.display = 'block';
            feedbackText.innerHTML = `<span style="color:#00e5ff; font-size:0.75rem;"><i class="fa-solid fa-satellite fa-spin"></i> OBSERVANDO CONTRASTE REAL NO TERRENO...</span>`;
        }

        // Tenta segmentar utilizando visÃ£o computacional em tempo real a partir da imagem do satÃ©lite
        segmentTargetFromSatellite(center, W, L_dim, type);
    }

    function segmentTargetFromSatellite(center, W, L_dim, type) {
        const zoom = 20; // Alta resoluÃ§Ã£o (aprox 15cm por pixel)
        
        // ConversÃ£o de Lat/Lng para coordenadas de tile
        function getTileCoords(lat, lng, z) {
            const x = Math.floor((lng + 180) / 360 * Math.pow(2, z));
            const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, z));
            return { x, y };
        }
        
        // ConversÃ£o de Lat/Lng para pixel dentro do tile de 256x256
        function getPixelOffset(lat, lng, tileX, tileY, z) {
            const totalPixels = Math.pow(2, z) * 256;
            const pixelX = ((lng + 180) / 360 * totalPixels);
            const latRad = lat * Math.PI / 180;
            const pixelY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * totalPixels);
            
            const px = Math.floor(pixelX - tileX * 256);
            const py = Math.floor(pixelY - tileY * 256);
            return { px, py };
        }
        
        // ConversÃ£o de pixel de tile de volta para Lat/Lng
        function pixelToLatLng(px, py, tileX, tileY, z) {
            const totalPixels = Math.pow(2, z) * 256;
            const x = tileX * 256 + px;
            const y = tileY * 256 + py;
            
            const lng = (x / totalPixels) * 360 - 180;
            const n = Math.PI - 2 * Math.PI * (y / totalPixels);
            const lat = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
            return L.latLng(lat, lng);
        }

        const tile = getTileCoords(center.lat, center.lng, zoom);
        const offset = getPixelOffset(center.lat, center.lng, tile.x, tile.y, zoom);
        
        // Carrega o tile correspondente da rede com suporte a CORS
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = 256;
                canvas.height = 256;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Analisa um patch ao redor do pixel central do alvo
                const patchSize = 80;
                const startX = Math.max(0, offset.px - patchSize / 2);
                const startY = Math.max(0, offset.py - patchSize / 2);
                const imgData = ctx.getImageData(startX, startY, patchSize, patchSize);
                const pixels = imgData.data;
                
                // Calcula luminosidade (tons de cinza)
                const lumas = new Float32Array(patchSize * patchSize);
                let sum = 0;
                for (let i = 0; i < pixels.length; i += 4) {
                    const luma = 0.299 * pixels[i] + 0.587 * pixels[i+1] + 0.114 * pixels[i+2];
                    lumas[i / 4] = luma;
                    sum += luma;
                }
                const mean = sum / (patchSize * patchSize);
                
                // VariÃ¢ncia local para medir o contraste do terreno
                let varianceSum = 0;
                for (let i = 0; i < lumas.length; i++) {
                    varianceSum += Math.pow(lumas[i] - mean, 2);
                }
                const stdDev = Math.sqrt(varianceSum / lumas.length);
                
                // Se o contraste do terreno for extremamente baixo, aborta e cai no fallback geomÃ©trico
                if (stdDev < 6) throw new Error("Contraste de satÃ©lite insuficiente.");
                
                // Limiar adaptativo
                const centerIdx = Math.floor(patchSize / 2) * patchSize + Math.floor(patchSize / 2);
                const centerLuma = lumas[centerIdx];
                const threshold = mean + (centerLuma < mean ? -0.2 * stdDev : 0.2 * stdDev);
                const isDarkTarget = centerLuma < mean;
                
                // Binariza a imagem local baseando-se no contraste do objeto (hangar/edificaÃ§Ã£o)
                const binary = new Uint8Array(patchSize * patchSize);
                for (let i = 0; i < lumas.length; i++) {
                    binary[i] = isDarkTarget ? (lumas[i] < threshold ? 1 : 0) : (lumas[i] > threshold ? 1 : 0);
                }
                
                // Region Growing (Crescimento de RegiÃ£o) para contornar perfeitamente a edificaÃ§Ã£o
                const centerPx = Math.floor(patchSize / 2);
                const centerPy = Math.floor(patchSize / 2);
                const visited = new Uint8Array(patchSize * patchSize);
                const queue = [[centerPx, centerPy]];
                visited[centerPy * patchSize + centerPx] = 1;
                
                const blobPoints = [];
                
                while (queue.length > 0) {
                    const [cx, cy] = queue.shift();
                    blobPoints.push({ x: cx, y: cy });
                    
                    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
                    for (const [dx, dy] of dirs) {
                        const nx = cx + dx;
                        const ny = cy + dy;
                        if (nx >= 0 && nx < patchSize && ny >= 0 && ny < patchSize) {
                            const idx = ny * patchSize + nx;
                            if (!visited[idx] && binary[idx] === 1) {
                                visited[idx] = 1;
                                queue.push([nx, ny]);
                            }
                        }
                    }
                }
                
                // Valida o tamanho do blob extraÃ­do para evitar ruÃ­dos de satÃ©lite
                if (blobPoints.length < 40 || blobPoints.length > (patchSize * patchSize) * 0.75) {
                    throw new Error("Tamanho de blob de contraste incompatÃ­vel.");
                }
                
                // Encontra a Casca Convexa (Convex Hull) do blob para um contorno fidedigno e perfeito
                blobPoints.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
                
                const lower = [];
                for (let i = 0; i < blobPoints.length; i++) {
                    while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], blobPoints[i]) <= 0) {
                        lower.pop();
                    }
                    lower.push(blobPoints[i]);
                }
                
                const upper = [];
                for (let i = blobPoints.length - 1; i >= 0; i--) {
                    while (upper.length >= 2 && upper[upper.length - 2] && upper[upper.length - 1] && crossProduct(upper[upper.length - 2], upper[upper.length - 1], blobPoints[i]) <= 0) {
                        upper.pop();
                    }
                    upper.push(blobPoints[i]);
                }
                
                upper.pop();
                lower.pop();
                const hull = lower.concat(upper);
                
                // Simplifica o polÃ­gono para remover pequenos serrilhados de pixels e deixar o formato arquitetÃ´nico perfeito
                const simplified = simplifyPolygon(hull, 2.2);
                
                // Mapeia os pixels binarizados de volta para coordenadas Lat/Lng exatas no mapa
                const finalLatLngs = simplified.map(pt => {
                    const absPx = startX + pt.x;
                    const absPy = startY + pt.y;
                    return pixelToLatLng(absPx, absPy, tile.x, tile.y, zoom);
                });
                
                // Desenha o polÃ­gono segmentado real ajustado fidedignamente!
                applySegmentedTarget(finalLatLngs, type);
                
            } catch (err) {
                console.warn("Falha ou falta de suporte a CORS no satÃ©lite. Usando fallback geomÃ©trico de alta fidelidade.", err);
                useHighFidelityFallback(center, W, L_dim, type);
            }
        };
        
        img.onerror = function() {
            console.warn("Erro ao buscar imagem de satÃ©lite. Ativando fallback geomÃ©trico.");
            useHighFidelityFallback(center, W, L_dim, type);
        };
        
        img.src = `https://mt1.google.com/vt/lyrs=s&x=${tile.x}&y=${tile.y}&z=${zoom}`;
    }

    function crossProduct(a, b, c) {
        return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    }

    function simplifyPolygon(points, tolerance) {
        if (points.length <= 4) return points;
        const result = [points[0]];
        for (let i = 1; i < points.length - 1; i++) {
            const prev = result[result.length - 1];
            const curr = points[i];
            const next = points[i + 1];
            
            const area = Math.abs((next.y - prev.y) * curr.x - (next.x - prev.x) * curr.y + next.x * prev.y - next.y * prev.x);
            const bottom = Math.sqrt(Math.pow(next.y - prev.y, 2) + Math.pow(next.x - prev.x, 2));
            const dist = bottom === 0 ? 0 : area / bottom;
            
            if (dist > tolerance) {
                result.push(curr);
            }
        }
        result.push(points[points.length - 1]);
        
        // Remove duplicados ou excessivos
        if (result.length > 8) {
            return result.filter((_, idx) => idx % 2 === 0);
        }
        return result;
    }

    function applySegmentedTarget(latlngs, type) {
        // Limpa polÃ­gonos antigos
        if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
        if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); drawnTargetMiniPolygon = null; }
        
        targetPolygonPoints = latlngs;
        
        // --- NOVO: Salva os pontos no alvo customizado ativo ---
        const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === targetLatLng.lat && t.latLng.lng === targetLatLng.lng);
        if (activeCustomTgt) {
            activeCustomTgt.polygonPoints = [...targetPolygonPoints];
        }
        
        // Cria polÃ­gono no mapa principal
        drawnTargetPolygon = L.polygon(targetPolygonPoints, {
            color: '#00ffff',
            fillColor: '#00ffff',
            fillOpacity: 0.28,
            weight: 2
        }).addTo(map);
        drawnTargetPolygon.bindTooltip(`Alvo: ${type} (Ajustado por Contraste Real)`);
        
        // Cria polÃ­gono no mini mapa
        if (miniMap) {
            drawnTargetMiniPolygon = L.polygon(targetPolygonPoints, {
                color: '#00ffff',
                fillColor: '#00ffff',
                fillOpacity: 0.28,
                weight: 2
            }).addTo(miniMap);
        }
        
        // Adiciona alÃ§as para micro-ajustes manuais
        createDragHandles();
        
        updatePolygonVisibility();
        
        // Mostra feedback de sucesso no painel
        const feedbackBox = document.getElementById('feedback-box');
        const feedbackText = document.getElementById('feedback-text');
        if (feedbackBox && feedbackText) {
            feedbackBox.style.display = 'block';
            feedbackText.innerHTML = `<span style="color:#00ff55; font-size:0.75rem;"><i class="fa-solid fa-circle-check"></i> CONTORNO AJUSTADO AO TERRENO COM SUCESSO!</span>`;
            setTimeout(() => {
                validateEmploymentEfficacy();
            }, 800);
        } else {
            validateEmploymentEfficacy();
        }
    }

    function useHighFidelityFallback(center, W, L_dim, type) {
        const magHeading = parseInt(headingInput.value || 0);
        const dec = parseFloat(magDeclinationInput.value || 0);
        const heading = magHeading + dec;
        const rad = heading * Math.PI / 180;
        
        const halfL = L_dim / 2;
        const halfW = W / 2;
        
        function getOffsetPoint(pt, distL, distW) {
            const dLat = (distL * Math.cos(rad) - distW * Math.sin(rad)) / 111111;
            const dLng = (distL * Math.sin(rad) + distW * Math.cos(rad)) / (111111 * Math.cos(pt.lat * Math.PI / 180));
            return L.latLng(pt.lat + dLat, pt.lng + dLng);
        }
        
        const p1 = getOffsetPoint(center, halfL, halfW);
        const p2 = getOffsetPoint(center, halfL, -halfW);
        const p3 = getOffsetPoint(center, -halfL, -halfW);
        const p4 = getOffsetPoint(center, -halfL, halfW);
        
        targetPolygonPoints = [p1, p2, p3, p4];
        
        // --- NOVO: Salva os pontos no alvo customizado ativo ---
        const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === targetLatLng.lat && t.latLng.lng === targetLatLng.lng);
        if (activeCustomTgt) {
            activeCustomTgt.polygonPoints = [...targetPolygonPoints];
        }
        
        drawnTargetPolygon = L.polygon(targetPolygonPoints, {
            color: '#00ffff',
            fillColor: '#00ffff',
            fillOpacity: 0.25,
            weight: 2
        }).addTo(map);
        drawnTargetPolygon.bindTooltip(`Alvo: ${type} (${W}x${L_dim}m)`);
        
        if (miniMap) {
            drawnTargetMiniPolygon = L.polygon(targetPolygonPoints, {
                color: '#00ffff',
                fillColor: '#00ffff',
                fillOpacity: 0.25,
                weight: 2
            }).addTo(miniMap);
        }
        
        createDragHandles();
        
        updatePolygonVisibility();
        
        const feedbackBox = document.getElementById('feedback-box');
        const feedbackText = document.getElementById('feedback-text');
        if (feedbackBox && feedbackText) {
            feedbackBox.style.display = 'block';
            feedbackText.innerHTML = `<span style="color:#ffcc00; font-size:0.75rem;"><i class="fa-solid fa-circle-exclamation"></i> ALVO PADRONIZADO ${W}x${L_dim}m (AJUSTE MANUAL ATIVO)</span>`;
            setTimeout(() => {
                validateEmploymentEfficacy();
            }, 800);
        } else {
            validateEmploymentEfficacy();
        }
    }

    function getMinDistanceToPolygonEdges(pt, polyPoints) {
        let minDist = Infinity;
        for (let i = 0; i < polyPoints.length; i++) {
            const p1 = polyPoints[i];
            const p2 = polyPoints[(i + 1) % polyPoints.length];
            const dist = getDistanceToSegment(pt, p1, p2);
            if (dist < minDist) minDist = dist;
        }
        return minDist;
    }

    function validateEmploymentEfficacy() {
        const feedbackBox = document.getElementById('feedback-box');
        const feedbackText = document.getElementById('feedback-text');
        const wrapper = document.getElementById('mini-map-wrapper');
        
        // Atualiza a visualizaÃ§Ã£o 2D live (inicial)!
        drawTargetGeometry2D(null, 0);
        
        if (!targetPolygonPoints || !feedbackBox || !feedbackText) {
            if (feedbackBox) feedbackBox.style.display = 'none';
            if (wrapper) wrapper.style.borderColor = 'var(--primary)';
            return;
        }
        
        feedbackBox.style.display = 'block';
        
        // Coleta os pontos de impacto do emprego ativo ou em ediÃ§Ã£o
        let impactPoints = [];
        let qty = 1;
        let ameM = 7;
        
        if (editingEmploymentId !== null) {
            const emp = savedEmployments.find(e => e.id === editingEmploymentId);
            if (emp && emp.designationLatLng) {
                qty = emp.qty;
                const dec = parseFloat(magDeclinationInput.value || 0);
                const plannedHeading = emp.magHeading + dec;
                let desHeading = plannedHeading;
                if (emp.displayHeading !== "") {
                    desHeading = parseInt(emp.displayHeading || 0) + dec;
                }
                let mult = 1.0;
                if (emp.targetType === 'personnel') mult = 1.5;
                else if (emp.targetType === 'armored') mult = 0.4;
                const baseAme = emp.ameUnit === 'ft' ? emp.ameInput * 0.3048 : emp.ameInput;
                ameM = baseAme * mult;
                
                // Calcula effectedCenter para o emprego sendo editado
                const rad = (desHeading * Math.PI / 180);
                const latErr = emp.latErr || 0;
                const longErr = emp.longErr || 0;
                const latErrM = latErr * 0.3048;
                const longErrM = longErr * 0.3048;
                const dLatLong = (longErrM * Math.cos(rad)) / 111111;
                const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(emp.designationLatLng.lat * Math.PI / 180));
                const latHead = (desHeading + 90) % 360;
                const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * Math.cos(emp.designationLatLng.lat * Math.PI / 180));
                const effectedCenter = L.latLng(
                    emp.designationLatLng.lat + dLatLong + (latErrM * Math.cos(latHead * Math.PI / 180)) / 111111,
                    emp.designationLatLng.lng + dLngLong + dLngLatCalc
                );
                
                impactPoints = getImpactPoints(effectedCenter, desHeading, emp.qty, emp.ripple, emp.releaseMode || 'SGL', emp.weapon);
            }
        } else {
            // Emprego ativo (Resultado Piloto)
            if (designationLatLng) {
                qty = parseInt(bombQtyInput.value || 1);
                const magHeading = parseInt(headingInput.value || 0);
                const dec = parseFloat(magDeclinationInput.value || 0);
                const plannedHeading = magHeading + dec;
                const desHeadingInput = document.getElementById('designation-heading');
                let desHeading = plannedHeading;
                if (desHeadingInput && desHeadingInput.value !== "") {
                    desHeading = parseInt(desHeadingInput.value || 0) + dec;
                }
                const ameInput = parseFloat(ameRadiusInput.value || 7);
                const ameUnit = getAmeUnit();
                const baseAme = ameUnit === 'ft' ? ameInput * 0.3048 : ameInput;
                ameM = baseAme * getTargetMultiplier();
                
                // Calcula effectedCenter
                const rad = (desHeading * Math.PI / 180);
                const latErr = parseFloat(document.getElementById('lat-error').value || 0);
                const longErr = parseFloat(document.getElementById('long-error').value || 0);
                const latErrM = latErr * 0.3048;
                const longErrM = longErr * 0.3048;
                const dLatLong = (longErrM * Math.cos(rad)) / 111111;
                const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(designationLatLng.lat * Math.PI / 180));
                const latHead = (desHeading + 90) % 360;
                const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * Math.cos(designationLatLng.lat * Math.PI / 180));
                const effectedCenter = L.latLng(designationLatLng.lat + dLatLong + (latErrM * Math.cos(latHead * Math.PI / 180)) / 111111, designationLatLng.lng + dLngLong + dLngLatCalc);
                
                impactPoints = getImpactPoints(effectedCenter, desHeading, qty, parseFloat(rippleDistInput.value || 13), releaseModeSelect.value, weaponSelect.value);
            }
        }
        
        // Atualiza a visualizaÃ§Ã£o 2D live com os impactos calculados!
        drawTargetGeometry2D(impactPoints, ameM);
        
        if (impactPoints.length === 0) {
            feedbackText.innerHTML = `<span style="color:var(--text-dim)">Aguardando DesignaÃ§Ã£o...</span>`;
            if (wrapper) wrapper.style.borderColor = 'var(--primary)';
            return;
        }
        
        const activeWeapon = (editingEmploymentId !== null) ? 
            (savedEmployments.find(e => e.id === editingEmploymentId)?.weapon || 'BAFG-230') : 
            weaponSelect.value;

        let bestResult = 'invalid'; // 'invalid' < 'partial' < 'valid'
        
        if (activeWeapon === 'SBAT-70' || activeWeapon === 'GUNS') {
            let hits = 0;
            impactPoints.forEach(pt => {
                if (isPointInPolygon(pt, targetPolygonPoints)) {
                    hits++;
                } else {
                    const minDist = getMinDistanceToPolygonEdges(pt, targetPolygonPoints);
                    if (minDist <= 2.0) {
                        hits += 0.5; // impacto prÃ³ximo conta como dano de fragmentaÃ§Ã£o parcial
                    }
                }
            });
            
            const hitRatio = hits / impactPoints.length;
            if (hitRatio >= 0.40) {
                bestResult = 'valid';
            } else if (hits > 0) {
                bestResult = 'partial';
            } else {
                bestResult = 'invalid';
            }
        } else {
            impactPoints.forEach(pt => {
                if (isPointInPolygon(pt, targetPolygonPoints)) {
                    bestResult = 'valid';
                } else {
                    const minDist = getMinDistanceToPolygonEdges(pt, targetPolygonPoints);
                    if (minDist <= ameM) {
                        const ratio = minDist / ameM;
                        // Se estiver um pouco dentro (distÃ¢ncia menor que 70% do raio AME), Ã© VÃ¡lido
                        if (ratio < 0.7) {
                            bestResult = 'valid';
                        } else {
                            // Se sÃ³ encostar (entre 70% e 100% do raio AME), Ã© Parcial
                            if (bestResult !== 'valid') {
                                bestResult = 'partial';
                            }
                        }
                    }
                }
            });
        }
        
        if (bestResult === 'invalid') {
            feedbackText.innerHTML = `<span style="color:#ff3333;"><i class="fa-solid fa-circle-xmark"></i> INVALIDO</span>`;
            if (wrapper) wrapper.style.borderColor = '#ff3333';
        } else if (bestResult === 'partial') {
            feedbackText.innerHTML = `<span style="color:#ffcc00;"><i class="fa-solid fa-circle-exclamation"></i> PARCIAL</span>`;
            if (wrapper) wrapper.style.borderColor = '#ffcc00';
        } else {
            feedbackText.innerHTML = `<span style="color:#00ff00;"><i class="fa-solid fa-circle-check"></i> VÃ LIDO</span>`;
            if (wrapper) wrapper.style.borderColor = '#00ff00';
        }
    }

    function drawTargetGeometry2D(impactPoints, ameM) {
        const dimensionsBox = document.getElementById('target-dimensions-box');
        const canvas = document.getElementById('target-geometry-canvas');
        if (!dimensionsBox || !canvas) return;

        if (!targetPolygonPoints || targetPolygonPoints.length === 0) {
            dimensionsBox.style.display = 'none';
            return;
        }

        dimensionsBox.style.display = 'flex';
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Converte pontos LatLng para coordenadas cartesianas 2D em metros
        const origin = targetPolygonPoints[0];
        const pts = targetPolygonPoints.map(pt => {
            const x = (pt.lng - origin.lng) * 111111 * Math.cos(origin.lat * Math.PI / 180);
            const y = (pt.lat - origin.lat) * 111111;
            return { x, y };
        });

        // 2. Simplifica vÃ©rtices para mesclar arestas com diferenÃ§a angular muito baixa (menos de 15 graus)
        function simplifyPolygonPoints(pts) {
            if (pts.length <= 3) return pts;
            let simplified = [...pts];
            let changed = true;
            while (simplified.length > 3 && changed) {
                changed = false;
                for (let i = 0; i < simplified.length; i++) {
                    const prev = simplified[(i - 1 + simplified.length) % simplified.length];
                    const curr = simplified[i];
                    const next = simplified[(i + 1) % simplified.length];
                    
                    const ux = curr.x - prev.x;
                    const uy = curr.y - prev.y;
                    const vx = next.x - curr.x;
                    const vy = next.y - curr.y;
                    
                    const lenU = Math.sqrt(ux*ux + uy*uy);
                    const lenV = Math.sqrt(vx*vx + vy*vy);
                    if (lenU === 0 || lenV === 0) {
                        simplified.splice(i, 1);
                        changed = true;
                        break;
                    }
                    
                    const dot = ux*vx + uy*vy;
                    const cosTheta = dot / (lenU * lenV);
                    
                    // cos(15 deg) â‰ˆ 0.966. Se o cosseno for maior, a curvatura Ã© menor que 15 graus (praticamente colinear)
                    if (cosTheta > 0.966) {
                        simplified.splice(i, 1);
                        changed = true;
                        break;
                    }
                }
            }
            return simplified;
        }

        const simplifiedPts = simplifyPolygonPoints(pts);

        // 3. Encontra a Bounding Box em metros
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        simplifiedPts.forEach(pt => {
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;
        });

        const wM = maxX - minX;
        const hM = maxY - minY;
        const maxDimM = Math.max(wM, hM);

        // Ajusta as coordenadas para caber em uma caixa de 100x100 dentro do canvas de 160x160
        const scale = maxDimM > 0 ? 100 / maxDimM : 1;
        const cxCanvas = canvas.width / 2;
        const cyCanvas = canvas.height / 2;
        const cxM = (minX + maxX) / 2;
        const cyM = (minY + maxY) / 2;

        const canvasPts = simplifiedPts.map(pt => {
            const px = cxCanvas + (pt.x - cxM) * scale;
            const py = cyCanvas - (pt.y - cyM) * scale; // Inverte o eixo Y do canvas
            return { px, py, x: pt.x, y: pt.y };
        });

        // --- RENDERIZAÃ‡ÃƒO ---
        // Desenha grade de fundo tÃ¡tica
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 20; x < canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 20; y < canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // CÃ­rculos tÃ¡ticos de radar
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cxCanvas, cyCanvas, 65, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cxCanvas, cyCanvas, 40, 0, 2 * Math.PI);
        ctx.stroke();

        // Linhas de mira central
        ctx.strokeStyle = 'rgba(0, 210, 255, 0.09)';
        ctx.beginPath();
        ctx.moveTo(cxCanvas - 10, cyCanvas); ctx.lineTo(cxCanvas + 10, cyCanvas);
        ctx.moveTo(cxCanvas, cyCanvas - 10); ctx.lineTo(cxCanvas, cyCanvas + 10);
        ctx.stroke();

        // Desenha o polÃ­gono simplificado
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(0, 210, 255, 0.6)';
        ctx.strokeStyle = 'var(--primary)';
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(0, 210, 255, 0.08)';

        ctx.beginPath();
        ctx.moveTo(canvasPts[0].px, canvasPts[0].py);
        for (let i = 1; i < canvasPts.length; i++) {
            ctx.lineTo(canvasPts[i].px, canvasPts[i].py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Remove sombra para os vÃ©rtices e textos
        ctx.shadowBlur = 0;

        // Desenha cÃ­rculos de impacto das bombas (se fornecidos)
        if (impactPoints && impactPoints.length > 0 && ameM > 0) {
            const activeWeapon = (editingEmploymentId !== null) ? 
                (savedEmployments.find(e => e.id === editingEmploymentId)?.weapon || 'BAFG-230') : 
                weaponSelect.value;

            if (activeWeapon === 'SBAT-70' || activeWeapon === 'GUNS') {
                // Desenha as duas Elipses de DispersÃ£o no Canvas 2D (lanÃ§adores gÃªmeos)
                let a = 20, b = 6;
                if (activeWeapon === 'SBAT-70') {
                    a = ameM * 10;
                    b = ameM * 3;
                } else if (activeWeapon === 'GUNS') {
                    a = ameM * 20;
                    b = ameM * 5;
                }

                // Separar os pontos de impacto para cada elipse para calcular seus respectivos centros
                const pts1 = [];
                const pts2 = [];
                impactPoints.forEach((p, idx) => {
                    if (idx % 2 === 0) pts1.push(p);
                    else pts2.push(p);
                });

                const subsets = [];
                if (pts1.length > 0) subsets.push(pts1);
                if (pts2.length > 0) subsets.push(pts2);

                const desHeadingInput = document.getElementById('designation-heading');
                const dec = parseFloat(magDeclinationInput.value || 0);
                const magHeading = parseInt(headingInput.value || 0);
                let heading = magHeading + dec;
                if (desHeadingInput && desHeadingInput.value !== "") {
                    heading = parseInt(desHeadingInput.value || 0) + dec;
                }
                if (editingEmploymentId !== null) {
                    const emp = savedEmployments.find(e => e.id === editingEmploymentId);
                    if (emp) {
                        heading = emp.displayHeading !== "" ? (parseInt(emp.displayHeading || 0) + dec) : (emp.magHeading + dec);
                    }
                }
                const headingRad = heading * Math.PI / 180;

                subsets.forEach(pts => {
                    const avgLng = pts.reduce((sum, p) => sum + p.lng, 0) / pts.length;
                    const avgLat = pts.reduce((sum, p) => sum + p.lat, 0) / pts.length;
                    
                    const avgX = (avgLng - origin.lng) * 111111 * Math.cos(origin.lat * Math.PI / 180);
                    const avgY = (avgLat - origin.lat) * 111111;

                    const cx = cxCanvas + (avgX - cxM) * scale;
                    const cy = cyCanvas - (avgY - cyM) * scale;
                    const aPx = a * scale;
                    const bPx = b * scale;

                    ctx.strokeStyle = 'rgba(255, 204, 0, 0.85)';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([3, 3]);
                    ctx.fillStyle = 'rgba(255, 204, 0, 0.08)';
                    ctx.beginPath();
                    const steps = 64;
                    for (let i = 0; i <= steps; i++) {
                        const angle = (i * 2 * Math.PI) / steps;
                        const xOffset = aPx * Math.cos(angle);
                        const yOffset = bPx * Math.sin(angle);
                        
                        const rotX = xOffset * Math.cos(-headingRad) - yOffset * Math.sin(-headingRad);
                        const rotY = xOffset * Math.sin(-headingRad) + yOffset * Math.cos(-headingRad);
                        
                        if (i === 0) {
                            ctx.moveTo(cx + rotX, cy + rotY);
                        } else {
                            ctx.lineTo(cx + rotX, cy + rotY);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                });
                ctx.setLineDash([]);

                impactPoints.forEach(pt => {
                    const x = (pt.lng - origin.lng) * 111111 * Math.cos(origin.lat * Math.PI / 180);
                    const y = (pt.lat - origin.lat) * 111111;
                    const px = cxCanvas + (x - cxM) * scale;
                    const py = cyCanvas - (y - cyM) * scale;

                    ctx.fillStyle = '#ffcc00';
                    ctx.beginPath();
                    ctx.arc(px, py, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                });
            } else {
                impactPoints.forEach(pt => {
                    const x = (pt.lng - origin.lng) * 111111 * Math.cos(origin.lat * Math.PI / 180);
                    const y = (pt.lat - origin.lat) * 111111;

                    const px = cxCanvas + (x - cxM) * scale;
                    const py = cyCanvas - (y - cyM) * scale;
                    const radiusPx = ameM * scale;

                    ctx.strokeStyle = 'rgba(255, 51, 51, 0.8)';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([3, 3]);
                    ctx.fillStyle = 'rgba(255, 51, 51, 0.12)';
                    ctx.beginPath();
                    ctx.arc(px, py, radiusPx, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    ctx.setLineDash([]); 

                    ctx.fillStyle = '#ff3333';
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                });
            }
        }

        // Desenha vÃ©rtices como cÃ­rculos
        ctx.fillStyle = 'white';
        canvasPts.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.px, pt.py, 3, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Desenha as medidas de cada parede/aresta (tamanho maior e mais visÃ­vel)
        canvasPts.forEach((pt, i) => {
            const nextPt = canvasPts[(i + 1) % canvasPts.length];
            
            // Ponto mÃ©dio da parede
            const mx = (pt.px + nextPt.px) / 2;
            const my = (pt.py + nextPt.py) / 2;

            // Calcula o vetor normal externo da aresta
            const dx = nextPt.px - pt.px;
            const dy = nextPt.py - pt.py;
            const len = Math.sqrt(dx*dx + dy*dy);
            if (len === 0) return;

            let nx = -dy / len;
            let ny = dx / len;

            // Vetor partindo do centro do polÃ­gono ao ponto mÃ©dio da parede
            const vx = mx - cxCanvas;
            const vy = my - cyCanvas;
            
            // Garante que o vetor normal aponte para fora do polÃ­gono
            if (nx * vx + ny * vy < 0) {
                nx = -nx;
                ny = -ny;
            }

            // Desloca a etiqueta da medida ligeiramente para fora
            const lx = mx + nx * 16;
            const ly = my + ny * 16;

            // Comprimento da parede em metros
            const dxM = nextPt.x - pt.x;
            const dyM = nextPt.y - pt.y;
            const distM = Math.sqrt(dxM*dxM + dyM*dyM);
            const labelText = distM.toFixed(1).replace('.0','') + 'm';

            // Desenha o fundo da etiqueta para mÃ¡xima legibilidade (tamanho aumentado)
            ctx.font = 'bold 11px Courier New, sans-serif';
            const textWidth = ctx.measureText(labelText).width;
            
            ctx.fillStyle = 'rgba(10, 10, 10, 0.88)';
            ctx.strokeStyle = 'rgba(0, 210, 255, 0.55)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(lx - textWidth/2 - 5, ly - 8, textWidth + 10, 16, 5);
            ctx.fill();
            ctx.stroke();

            // Renderiza o texto da medida
            ctx.fillStyle = '#00ffcc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(labelText, lx, ly);
        });
    }

    function getImpactPoints(center, heading, qty, ripple, releaseMode = 'SGL', weapon = 'BAFG-230') {
        const rad = (heading * Math.PI / 180);
        const radPerp = ((heading + 90) % 360) * Math.PI / 180;
        const cosLat = Math.cos(center.lat * Math.PI / 180);

        if (weapon === 'SBAT-70' || weapon === 'GUNS') {
            let R = 1.0;
            const ameInputEl = document.getElementById('ame-radius');
            if (ameInputEl) {
                const ameInput = parseFloat(ameInputEl.value || 7);
                const isFt = document.querySelector('input[name="ame-unit"]:checked')?.value === 'ft';
                R = isFt ? ameInput * 0.3048 : ameInput;
            }
            
            if (editingEmploymentId !== null) {
                const emp = savedEmployments.find(e => e.id === editingEmploymentId);
                if (emp) {
                    R = emp.ameUnit === 'ft' ? emp.ameInput * 0.3048 : emp.ameInput;
                }
            }

            let a = 20, b = 6;
            let numPoints = qty || 7;
            
            if (weapon === 'SBAT-70') {
                a = R * 10;
                b = R * 3;
            } else if (weapon === 'GUNS') {
                a = R * 20;
                b = R * 5;
                numPoints = 25; 
            }

            // Calcula os dois centros com afastamento de 2m para cada lado (espaÃ§amento total de 4m)
            const shiftDist = 2; // metros
            const dLat1 = (-shiftDist * Math.cos(radPerp)) / 111111;
            const dLng1 = (-shiftDist * Math.sin(radPerp)) / (111111 * cosLat);
            const center1 = L.latLng(center.lat + dLat1, center.lng + dLng1);

            const dLat2 = (shiftDist * Math.cos(radPerp)) / 111111;
            const dLng2 = (shiftDist * Math.sin(radPerp)) / (111111 * cosLat);
            const center2 = L.latLng(center.lat + dLat2, center.lng + dLng2);

            let seed = Math.floor((center.lat + center.lng) * 1000000) || 42;
            function random() {
                const x = Math.sin(seed++) * 10000;
                return x - Math.floor(x);
            }

            const points = [];
            for (let i = 0; i < numPoints; i++) {
                const alpha = random() * 2 * Math.PI;
                const r = Math.sqrt(random());
                const x = r * a * Math.cos(alpha);
                const y = r * b * Math.sin(alpha);
                
                const dLat = (x * Math.cos(rad) - y * Math.sin(rad)) / 111111;
                const dLng = (x * Math.sin(rad) + y * Math.cos(rad)) / (111111 * cosLat);
                
                // Distribui alternadamente os pontos de impacto entre o lanÃ§ador 1 e o lanÃ§ador 2
                const activeCenter = (i % 2 === 0) ? center1 : center2;
                points.push(L.latLng(activeCenter.lat + dLat, activeCenter.lng + dLng));
            }
            return points;
        }

        const points = [];
        if (releaseMode === 'PAIR') {
            const validQty = (qty === 2 || qty === 4) ? qty : (qty <= 2 ? 2 : 4);
            
            if (validQty === 2) {
                const latOffsets = [-2.5, 2.5];
                latOffsets.forEach(latOffset => {
                    const dLatLat = (latOffset * Math.cos(radPerp)) / 111111;
                    const dLngLat = (latOffset * Math.sin(radPerp)) / (111111 * cosLat);
                    points.push(L.latLng(center.lat + dLatLat, center.lng + dLngLat));
                });
            } else if (validQty === 4) {
                const frontLatOffsets = [-2.5, 2.5];
                const rearLatOffsets = [-4.0, 4.0];

                // Par da frente (5m de distÃ¢ncia, +ripple/2 Ã  frente)
                frontLatOffsets.forEach(latOffset => {
                    const dLatLong = ((ripple / 2) * Math.cos(rad)) / 111111;
                    const dLngLong = ((ripple / 2) * Math.sin(rad)) / (111111 * cosLat);
                    const dLatLat = (latOffset * Math.cos(radPerp)) / 111111;
                    const dLngLat = (latOffset * Math.sin(radPerp)) / (111111 * cosLat);
                    points.push(L.latLng(center.lat + dLatLong + dLatLat, center.lng + dLngLong + dLngLat));
                });

                // Par de trÃ¡s (8m de distÃ¢ncia, -ripple/2 atrÃ¡s)
                rearLatOffsets.forEach(latOffset => {
                    const dLatLong = ((-ripple / 2) * Math.cos(rad)) / 111111;
                    const dLngLong = ((-ripple / 2) * Math.sin(rad)) / (111111 * cosLat);
                    const dLatLat = (latOffset * Math.cos(radPerp)) / 111111;
                    const dLngLat = (latOffset * Math.sin(radPerp)) / (111111 * cosLat);
                    points.push(L.latLng(center.lat + dLatLong + dLatLat, center.lng + dLngLong + dLngLat));
                });
            }
        } else {
            const totalLen = (qty - 1) * ripple;
            const startOffset = -totalLen / 2;
            for (let i = 0; i < qty; i++) {
                const offset = startOffset + (i * ripple);
                const dLat = (offset * Math.cos(rad)) / 111111;
                const dLng = (offset * Math.sin(rad)) / (111111 * cosLat);
                points.push(L.latLng(center.lat + dLat, center.lng + dLng));
            }
        }
        return points;
    }

    // Ray-casting algorithm para checar se ponto estÃ¡ em polÃ­gono
    function isPointInPolygon(point, vs) {
        const x = point.lat, y = point.lng;
        let inside = false;
        for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            const xi = vs[i].lat, yi = vs[i].lng;
            const xj = vs[j].lat, yj = vs[j].lng;
            const intersect = ((yi > y) !== (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    // Calcula distÃ¢ncia mÃ­nima de um ponto a um segmento de reta
    function getDistanceToSegment(p, p1, p2) {
        const x = p.lat, y = p.lng;
        const x1 = p1.lat, y1 = p1.lng;
        const x2 = p2.lat, y2 = p2.lng;
        
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dLat = x - xx;
        const dLng = y - yy;
        const dLatM = dLat * 111111;
        const dLngM = dLng * 111111 * Math.cos(x * Math.PI / 180);
        return Math.sqrt(dLatM * dLatM + dLngM * dLngM);
    }

    // Verifica sobreposiÃ§Ã£o entre cÃ­rculo e polÃ­gono
    function isCircleOverlappingPolygon(center, radiusM, polyPoints) {
        if (isPointInPolygon(center, polyPoints)) return true;
        for (let i = 0; i < polyPoints.length; i++) {
            const p1 = polyPoints[i];
            const p2 = polyPoints[(i + 1) % polyPoints.length];
            const dist = getDistanceToSegment(center, p1, p2);
            if (dist <= radiusM) return true;
        }
        return false;
    }

    // Calcula bearing (eixo) entre dois pontos
    function getBearing(pt1, pt2) {
        const lat1 = pt1.lat * Math.PI / 180;
        const lat2 = pt2.lat * Math.PI / 180;
        const dLng = (pt2.lng - pt1.lng) * Math.PI / 180;
        const y = Math.sin(dLng) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
        let brng = Math.atan2(y, x) * 180 / Math.PI;
        return (Math.round(brng) + 360) % 360;
    }

    map.on('click', (e) => {
        if (typeof mgrsGridVisible !== 'undefined' && mgrsGridVisible && window.drawnMGRSRulerBoxes && window.drawnMGRSRulerBoxes.length > 0) {
            const clickPt = e.containerPoint;
            let clickedBox = null;
            for (let box of window.drawnMGRSRulerBoxes) {
                if (clickPt.x >= box.rectX && clickPt.x <= box.rectX + box.width &&
                    clickPt.y >= box.rectY && clickPt.y <= box.rectY + box.height) {
                    clickedBox = box;
                    break;
                }
            }
            if (clickedBox) {
                mgrsRulerHighlightActive = !mgrsRulerHighlightActive;
                if (typeof drawMGRSRulers === 'function') drawMGRSRulers();
                return;
            }
        }

        if (window.dmpiMapSelectionActive && window.activeDmpiTargetPt) {
            const pt = window.activeDmpiTargetPt;
            let format = document.getElementById('coord-format').value;
            const casTabActive = document.querySelector('.tab[data-target="cas-tab"]') && document.querySelector('.tab[data-target="cas-tab"]').classList.contains('active');
            if (casTabActive) format = 'MGRS';
            
            const formatted = formatCoords(e.latlng.lat, e.latlng.lng, format);
            if (!pt.ninelineData) pt.ninelineData = {};
            if (!pt.ninelineData.dmpis) pt.ninelineData.dmpis = [];
            pt.ninelineData.dmpis.push(formatted);
            
            if (typeof drawTargetDmpis === 'function') {
                drawTargetDmpis(pt);
            }
            
            window.dmpiMapSelectionActive = false;
            window.activeDmpiTargetPt = null;
            document.getElementById('map').style.cursor = '';
            
            if (typeof openNineLineModal === 'function') {
                openNineLineModal(pt);
            }
            return;
        }

        if (typeof activeTacticalMode !== 'undefined' && activeTacticalMode) { addTacticalPoint(activeTacticalMode, e.latlng, e.originalEvent.ctrlKey); return; }
        
        if (activeCustomTargetPoint) {
            activeCustomTargetPoints.push(e.latlng);
            const marker = L.circleMarker(e.latlng, { radius: 4, color: 'red', fillColor: 'red', fillOpacity: 1 }).addTo(map);
            activeCustomTargetMarkers.push(marker);
            
            if (activeCustomTargetPoints.length > 1) {
                if (activeCustomTargetPolyline) map.removeLayer(activeCustomTargetPolyline);
                activeCustomTargetPolyline = L.polyline(activeCustomTargetPoints, { color: 'red', weight: 2, dashArray: '5, 5' }).addTo(map);
            }
            return;
        }

        if (targetDrawingActive) {
            drawnTargetPoints.push(e.latlng);
            const marker = L.circleMarker(e.latlng, { radius: 4, color: '#00ffff', fillColor: '#00ffff', fillOpacity: 1 }).addTo(map);
            drawnTargetMarkers.push(marker);
            
            if (drawnTargetPoints.length > 1) {
                if (drawnTargetPolyline) map.removeLayer(drawnTargetPolyline);
                drawnTargetPolyline = L.polyline(drawnTargetPoints, { color: '#00ffff', weight: 2, dashArray: '5, 5' }).addTo(map);
            }
            return;
        }

        if (tgtCreationActive) {
            createCustomTarget(e.latlng);
            return;
        }

        if (!rulerActive) return;
        
        rulerPoints.push(e.latlng);
        const idx = rulerPoints.length - 1;
        
        const marker = L.marker(e.latlng, {
            draggable: true,
            icon: L.divIcon({
                className: 'ruler-point-marker',
                html: `<div style="width: 10px; height: 10px; background: #00d2ff; border: 2px solid #000; border-radius: 50%; box-shadow: 0 0 6px #00d2ff; cursor: move; transform: translate(-1px, -1px);"></div>`,
                iconSize: [10, 10],
                iconAnchor: [5, 5]
            })
        }).addTo(map);
        
        marker.on('drag', (event) => {
            rulerPoints[idx] = event.target.getLatLng();
            
            if (rulerPolyline) {
                rulerPolyline.setLatLngs(rulerPoints);
                
                let totalMeters = 0;
                for (let i = 0; i < rulerPoints.length - 1; i++) {
                    totalMeters += rulerPoints[i].distanceTo(rulerPoints[i+1]);
                }
                const totalFt = totalMeters * 3.28084;
                const totalNM = totalMeters / 1852;
                
                const startPt = rulerPoints[0];
                const endPt = rulerPoints[rulerPoints.length - 1];
                const bearing = getBearing(startPt, endPt);
                
                const dec = parseFloat(document.getElementById('mag-declination') ? document.getElementById('mag-declination').value : 0) || 0;
                const magBearing = Math.round((bearing - dec + 360) % 360);
                
                let labelText = `${Math.round(totalMeters)} m / ${Math.round(totalFt)} ft / ${totalNM.toFixed(1)} NM | Eixo: ${String(magBearing).padStart(3, '0')}° (MAG)`;
                
                rulerPolyline.setTooltipContent(labelText);
            }
        });

        rulerMarkers.push(marker);

        if (rulerPoints.length > 1) {
            if (rulerPolyline) map.removeLayer(rulerPolyline);
            rulerPolyline = L.polyline(rulerPoints, {color: '#00d2ff', weight: 3, dashArray: '5, 5'}).addTo(map);
            
            let totalMeters = 0;
            for (let i = 0; i < rulerPoints.length - 1; i++) {
                totalMeters += rulerPoints[i].distanceTo(rulerPoints[i+1]);
            }
            const totalFt = totalMeters * 3.28084;
            
            const startPt = rulerPoints[0];
            const endPt = rulerPoints[rulerPoints.length - 1];
            const bearing = getBearing(startPt, endPt);
            
            const dec = parseFloat(document.getElementById('mag-declination') ? document.getElementById('mag-declination').value : 0) || 0;
            const magBearing = Math.round((bearing - dec + 360) % 360);
            
            let labelText = `${Math.round(totalMeters)} m / ${Math.round(totalFt)} ft | Eixo: ${String(magBearing).padStart(3, '0')}° (MAG)`;
            
            if (rulerPolyline) {
                rulerPolyline.bindTooltip(labelText, { permanent: true, direction: 'center', className: 'ruler-tooltip' }).openTooltip();
            }
        }
    });

    map.on('dblclick', (e) => {
        if (typeof activeTacticalMode !== 'undefined' && activeTacticalMode) { addTacticalPoint(activeTacticalMode, e.latlng); return; }
        if (activeCustomTargetPoint) {
            finishCustomTargetDrawing(true);
            return;
        }
        if (targetDrawingActive) {
            finishTargetDrawing(true);
        }
    });

    // Rastreia a posiÃ§Ã£o atual do mouse no mapa
    map.on('mousemove', (e) => {
        lastMapMouseLatLng = e.latlng;
    });

    // Atalho CTRL para marcar pontos no desenho manual de alvo
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Control' && !e.repeat && activeCustomTargetPoint && lastMapMouseLatLng) {
            activeCustomTargetPoints.push(lastMapMouseLatLng);
            const marker = L.circleMarker(lastMapMouseLatLng, { radius: 4, color: 'red', fillColor: 'red', fillOpacity: 1 }).addTo(map);
            activeCustomTargetMarkers.push(marker);
            
            if (activeCustomTargetPoints.length > 1) {
                if (activeCustomTargetPolyline) map.removeLayer(activeCustomTargetPolyline);
                activeCustomTargetPolyline = L.polyline(activeCustomTargetPoints, { color: 'red', weight: 2, dashArray: '5, 5' }).addTo(map);
            }
            e.preventDefault();
            return;
        }
        if (e.key === 'Control' && !e.repeat && targetDrawingActive && lastMapMouseLatLng) {
            drawnTargetPoints.push(lastMapMouseLatLng);
            const marker = L.circleMarker(lastMapMouseLatLng, { radius: 4, color: '#00ffff', fillColor: '#00ffff', fillOpacity: 1 }).addTo(map);
            drawnTargetMarkers.push(marker);
            
            if (drawnTargetPoints.length > 1) {
                if (drawnTargetPolyline) map.removeLayer(drawnTargetPolyline);
                drawnTargetPolyline = L.polyline(drawnTargetPoints, { color: '#00ffff', weight: 2, dashArray: '5, 5' }).addTo(map);
            }
            e.preventDefault();
        }
    });

    let activeCustomTargetPoint = null;
    let activeCustomTargetPoints = [];
    let activeCustomTargetPolyline = null;
    let activeCustomTargetMarkers = [];

    window.startCustomTargetDrawing = function(pt) {
        if (activeCustomTargetPoint) {
            alert("Já existe um desenho de alvo em andamento. Conclua-o primeiro (duplo clique).");
            return;
        }
        activeCustomTargetPoint = pt;
        activeCustomTargetPoints = [];
        document.getElementById('map').style.cursor = 'crosshair';
        alert(`Desenhando polígono para ${pt.name}. Clique no mapa para adicionar os vértices e faça um DUPLO CLIQUE em qualquer lugar para finalizar.`);
    };

    window.finishCustomTargetDrawing = function(shouldSave = true) {
        if (!activeCustomTargetPoint) return;
        
        document.getElementById('map').style.cursor = '';
        activeCustomTargetMarkers.forEach(m => map.removeLayer(m));
        activeCustomTargetMarkers = [];
        if (activeCustomTargetPolyline) { map.removeLayer(activeCustomTargetPolyline); activeCustomTargetPolyline = null; }
        
        if (shouldSave && activeCustomTargetPoints.length >= 3) {
            const pt = activeCustomTargetPoint;
            pt.customPolygonPoints = [...activeCustomTargetPoints];
            
            if (pt.customPolygonLayer) map.removeLayer(pt.customPolygonLayer);
            
            pt.customPolygonLayer = L.polygon(pt.customPolygonPoints, {
                color: 'red',
                fillColor: 'red',
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 5'
            });
            
            const globalShow = document.getElementById('show-targets-list') ? document.getElementById('show-targets-list').checked : true;
            if (pt.showPolygon !== false && globalShow) {
                pt.customPolygonLayer.addTo(map);
            }
            
            alert(`Polígono salvo para ${pt.name}`);
        } else if (shouldSave) {
            alert('Cancelado: o polígono precisa de pelo menos 3 pontos.');
        }
        
        activeCustomTargetPoint = null;
        activeCustomTargetPoints = [];
    };

    let activeTacticalMode = null;
    let pointCounters = { waypoints: 1, targets: 31, artillery: 41, navigation: 50, friendly: 60, threats: 71, scenario: 1 };
    
    // Defer adding listeners until DOM is ready just in case
    setTimeout(() => {
        document.querySelectorAll('.add-tactical-btn').forEach((btn, idx) => {
            const modes = ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats', 'scenario'];
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

        ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats', 'scenario'].forEach(mode => {
            const chk = document.getElementById(`show-${mode}-list`);
            if(chk) {
                chk.addEventListener('change', (e) => {
                    const show = e.target.checked;
                    if (mode === 'targets') {
                        if (typeof checkTargetsTimeSync === 'function') checkTargetsTimeSync();
                        return;
                    }
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
        if (mode === 'navigation') color = '#00ff00';
        if (mode === 'waypoints') color = '#00ff00';
        if (mode === 'scenario') color = 'yellow';
        
        let shape = `<circle cx="15" cy="15" r="12" stroke="${color}" stroke-width="2.5" fill="none" />`;
        if (mode === 'targets' || mode === 'threats') {
            shape = `<polygon points="15,5 28,25 2,25" stroke="${color}" stroke-width="2.5" fill="none" />`;
        } else if (mode === 'waypoints' || mode === 'friendly') {
            shape = `<polygon points="15,3 27,15 15,27 3,15" stroke="${color}" stroke-width="2.5" fill="none" />`;
        }
        
        return L.divIcon({ 
            className: `tactical-icon-${mode}`, 
            html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;">${shape}</svg>`, 
            iconSize: [30, 30], 
            iconAnchor: [15, 15] 
        });
    }

    window.drawTargetDmpis = drawTargetDmpis;
    function drawTargetDmpis(pt) {
        if (pt.dmpiMarkers) {
            pt.dmpiMarkers.forEach(m => map.removeLayer(m));
        }
        pt.dmpiMarkers = [];

        if (pt.mode !== 'targets') return;
        if (!pt.ninelineData || !pt.ninelineData.dmpis) return;

        const icon = getHollowIcon('targets');

        pt.ninelineData.dmpis.forEach((dmpiCoordStr, idx) => {
            if (!dmpiCoordStr) return;
            const latlng = parseCoordsToLatLng(dmpiCoordStr);
            if (latlng) {
                const dmpiMarker = L.marker(latlng, { icon: icon, draggable: true });
                dmpiMarker.bindTooltip(`${pt.name} - DMPI ${idx + 2}`);
                
                const currentGlobalTimeMs = (typeof window.getCurrentTelemetryTime === 'function') ? window.getCurrentTelemetryTime() : 0;
                let visible = (pt.visible !== false);
                if (visible && pt.timeSyncEnabled && pt.ninelineData && pt.ninelineData.time) {
                    const targetTimeMs = parseTimeStr(pt.ninelineData.time);
                    if (targetTimeMs !== null) {
                        visible = currentGlobalTimeMs >= targetTimeMs;
                    }
                }
                const showGlobal = document.getElementById('show-targets-list') ? document.getElementById('show-targets-list').checked : true;
                
                if (visible && showGlobal) {
                    dmpiMarker.addTo(map);
                    if (showLegends) dmpiMarker.openTooltip();
                }

                dmpiMarker.on('dragend', (e) => {
                    const newLatLng = e.target.getLatLng();
                    let format = document.getElementById('coord-format').value;
                    const casTabActive = document.querySelector('.tab[data-target="cas-tab"]') && document.querySelector('.tab[data-target="cas-tab"]').classList.contains('active');
                    if (casTabActive) format = 'MGRS';
                    
                    const formatted = formatCoords(newLatLng.lat, newLatLng.lng, format);
                    pt.ninelineData.dmpis[idx] = formatted;
                    
                    if (currentNineLinePt === pt) {
                        const inputs = document.querySelectorAll('.nineline-dmpi-input');
                        if (inputs[idx]) {
                            inputs[idx].value = formatted;
                        }
                    }
                    
                    drawTargetDmpis(pt);
                    if (typeof drawAttackAxis === 'function') {
                        drawAttackAxis(pt, map);
                    }
                });

                pt.dmpiMarkers.push(dmpiMarker);
            }
        });
    }

    window.checkTargetsTimeSync = checkTargetsTimeSync;
    function checkTargetsTimeSync() {
        if (typeof tacticalPoints === 'undefined' || !tacticalPoints.targets) return;
        
        const currentGlobalTimeMs = (typeof window.getCurrentTelemetryTime === 'function') ? window.getCurrentTelemetryTime() : 0;
        const showGlobal = document.getElementById('show-targets-list') ? document.getElementById('show-targets-list').checked : true;
        
        tacticalPoints.targets.forEach(pt => {
            let visible = (pt.visible !== false);
            if (visible && pt.timeSyncEnabled && pt.ninelineData && pt.ninelineData.time) {
                const targetTimeMs = parseTimeStr(pt.ninelineData.time);
                if (targetTimeMs !== null) {
                    visible = currentGlobalTimeMs >= targetTimeMs;
                }
            }
            
            if (pt.marker) {
                const hasMarker = map.hasLayer(pt.marker);
                if (visible && showGlobal) {
                    if (!hasMarker) {
                        pt.marker.addTo(map);
                        if (showLegends) pt.marker.openTooltip();
                    }
                } else {
                    if (hasMarker) {
                        map.removeLayer(pt.marker);
                    }
                }
            }
            
            if (pt.customPolygonLayer) {
                const hasPoly = map.hasLayer(pt.customPolygonLayer);
                const showPoly = pt.showPolygon !== false;
                if (visible && showGlobal && showPoly) {
                    if (!hasPoly) {
                        pt.customPolygonLayer.addTo(map);
                    }
                } else {
                    if (hasPoly) {
                        map.removeLayer(pt.customPolygonLayer);
                    }
                }
            }

            if (pt.dmpiMarkers) {
                pt.dmpiMarkers.forEach(dmpiMarker => {
                    const hasDmpi = map.hasLayer(dmpiMarker);
                    if (visible && showGlobal) {
                        if (!hasDmpi) {
                            dmpiMarker.addTo(map);
                            if (showLegends) dmpiMarker.openTooltip();
                        }
                    } else {
                        if (hasDmpi) {
                            map.removeLayer(dmpiMarker);
                        }
                    }
                });
            }
            if (pt.axisGroup) {
                const hasAxis = map.hasLayer(pt.axisGroup);
                if (visible && showGlobal) {
                    if (!hasAxis) {
                        pt.axisGroup.addTo(map);
                    }
                } else {
                    if (hasAxis) {
                        map.removeLayer(pt.axisGroup);
                    }
                }
            }
        });
    }

    window.addTacticalPoint = addTacticalPoint;
    function addTacticalPoint(mode, latlng, isSequential = false, nameOverride = null) {
        const id = Date.now() + Math.floor(Math.random() * 1000);
                let namePrefix = 'WPT';
        if (mode === 'scenario') namePrefix = 'SCE';
        
        const pt = {
            id: id,
            name: nameOverride ? nameOverride : `${namePrefix} ${pointCounters[mode]++}`,
            latlng: latlng,
            mode: mode
        };
        
        const icon = getHollowIcon(mode);
        pt.marker = L.marker(latlng, { icon: icon, draggable: true });
        pt.marker.bindTooltip(pt.name);
        pt.marker.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            let itemEl = null;
            const lists = ['waypoints-list', 'targets-list', 'artillery-list', 'navigation-list', 'friendly-list', 'threats-list', 'scenario-list'];
            for (let listId of lists) {
                const listContainer = document.getElementById(listId);
                if (listContainer) {
                    const items = Array.from(listContainer.children);
                    const idx = tacticalPoints[listId.split('-')[0]]?.findIndex(x => x.id === pt.id);
                    if (idx !== -1 && idx !== undefined && items[idx]) itemEl = items[idx];
                }
            }
            if (typeof selectTacticalPoint === 'function' && itemEl) {
                selectTacticalPoint(pt, itemEl);
                itemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        
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
            
            if (typeof drawFriendlyPosition === 'function') {
                drawFriendlyPosition(pt, map);
            }
            if (mode === 'targets' && typeof drawAttackAxis === 'function') {
                drawAttackAxis(pt, map);
            }
            
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
        
        if (!isSequential) {
            activeTacticalMode = null;
            document.getElementById('map').style.cursor = 'grab';
            document.querySelectorAll('.add-tactical-btn').forEach(b => b.style.color = 'var(--primary)');
        }
    }

    // --- DEBRIEFING MODAL LOGIC ---
    const debriefingMainBtn = document.getElementById('debriefing-start-main-btn');
    const debriefingModal = document.getElementById('debriefing-modal');
    const closeDebriefingBtn = document.getElementById('close-debriefing-btn');
    
    if (debriefingMainBtn && debriefingModal) {
        debriefingMainBtn.addEventListener('click', () => {
            debriefingModal.style.display = 'flex';
        });
    }

    if (closeDebriefingBtn && debriefingModal) {
        closeDebriefingBtn.addEventListener('click', () => {
            debriefingModal.style.display = 'none';
        });
    }

    if (debriefingModal) {
        debriefingModal.addEventListener('click', (e) => {
            if (e.target === debriefingModal) {
                debriefingModal.style.display = 'none';
            }
        });
    }

    const debriefTabBtns = document.querySelectorAll('.debrief-tab-btn');
    const debriefTabContents = document.querySelectorAll('.debrief-tab-content');
    const debriefMenu = document.getElementById('debrief-tabs-menu');
    const debriefContentArea = document.getElementById('debrief-tabs-content-area');
    const btnBackToMenu = document.getElementById('btn-back-to-menu');

    debriefTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            debriefTabBtns.forEach(b => b.classList.remove('active'));
            debriefTabContents.forEach(c => c.style.display = 'none');
            
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if(targetEl) targetEl.style.display = 'block';
            
            if (targetId === 'debrief-tab-rotas' && typeof window.updateDebriefRotasUI === 'function') {
                window.updateDebriefRotasUI();
            }
            if (targetId === 'debrief-tab-empregos' && typeof window.updateDebriefEmpregosUI === 'function') {
                window.updateDebriefEmpregosUI();
            }

            // Hide menu, show content area
            debriefMenu.style.display = 'none';
            debriefContentArea.style.display = 'block';
        });
    });

    if (btnBackToMenu) {
        btnBackToMenu.addEventListener('click', () => {
            debriefMenu.style.display = 'flex';
            debriefContentArea.style.display = 'none';
        });
    }

    // --- DEBRIEFING INSERIR EMPREGOS LOGIC ---
    const debriefEmpregosUpload = document.getElementById('debrief-empregos-upload');
    const debriefEmpregosBtn = document.getElementById('btn-debrief-load-empregos');
    if (debriefEmpregosBtn && debriefEmpregosUpload) {
        debriefEmpregosBtn.addEventListener('click', () => debriefEmpregosUpload.click());
        debriefEmpregosUpload.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            let loadedCount = 0;
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const xmlString = event.target.result;
                    processXMLTelemetry(xmlString, file.name);
                    loadedCount++;
                    if (loadedCount === files.length) {
                        window.updateDebriefEmpregosUI();
                        renderEmploymentList();
                    }
                };
                reader.readAsText(file);
            });
            debriefEmpregosUpload.value = ''; // Reset
        });
    }

    window.updateDebriefEmpregosUI = function() {
        const overview = document.getElementById('debrief-empregos-overview');
        if (!overview) return;
        
        overview.innerHTML = '';
        if (savedEmployments.length === 0) {
            overview.innerHTML = '<div style="color: var(--text-dim); font-style: italic; font-size: 0.9rem; text-align: center; padding: 20px;">Nenhum emprego importado via XML ou salvo.</div>';
            return;
        }

        savedEmployments.forEach(emp => {
            const item = document.createElement('div');
            item.style.cssText = `background: rgba(255,255,255,0.05); border-left: 4px solid ${emp.color}; border-radius: 6px; padding: 10px 15px; display: flex; align-items: center; justify-content: space-between; gap: 10px; transition: 0.2s;`;

            // Info Container
            const infoGroup = document.createElement('div');
            infoGroup.style.cssText = `display: flex; align-items: center; gap: 15px; flex-grow: 1; min-width: 0;`;

            const nameEl = document.createElement('div');
            nameEl.style.cssText = `font-weight: bold; font-size: 0.95rem; color: #fff; width: 140px; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
            nameEl.textContent = emp.name;
            nameEl.title = emp.name;

            const trigraphEl = document.createElement('div');
            trigraphEl.style.cssText = `background: rgba(0, 210, 255, 0.15); color: var(--primary); border: 1px solid rgba(0, 210, 255, 0.3); border-radius: 4px; padding: 2px 6px; font-weight: bold; font-size: 0.75rem; width: 65px; text-align: center; text-transform: uppercase;`;
            trigraphEl.textContent = emp.trigraph || "MANUAL";

            const weaponEl = document.createElement('div');
            weaponEl.style.cssText = `font-size: 0.85rem; color: #ccc; width: 90px; font-weight: 500;`;
            weaponEl.textContent = emp.weapon || "-";

            const timeEl = document.createElement('div');
            timeEl.style.cssText = `font-family: monospace; font-size: 0.85rem; color: #aaa; width: 70px;`;
            const formatTime = (ms) => { if (!ms) return '--:--:--'; const d = new Date(ms); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ':' + String(d.getUTCSeconds()).padStart(2, '0'); };
            timeEl.textContent = formatTime(emp.telemetryTimeMs);

            infoGroup.appendChild(nameEl);
            infoGroup.appendChild(trigraphEl);
            infoGroup.appendChild(weaponEl);
            infoGroup.appendChild(timeEl);

            // Actions Container
            const actionsGroup = document.createElement('div');
            actionsGroup.style.cssText = `display: flex; align-items: center; gap: 10px;`;

            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
            deleteBtn.title = "Excluir emprego";
            deleteBtn.style.cssText = `background: none; border: none; color: #ff6b6b; cursor: pointer; font-size: 1rem; transition: transform 0.2s;`;
            deleteBtn.addEventListener('mouseenter', () => deleteBtn.style.transform = 'scale(1.15)');
            deleteBtn.addEventListener('mouseleave', () => deleteBtn.style.transform = 'scale(1)');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Tem certeza que deseja excluir o emprego "${emp.name}"?`)) {
                    map.removeLayer(emp.layerGroup);
                    savedEmployments = savedEmployments.filter(e => e.id !== emp.id);
                    if (editingEmploymentId === emp.id) stopEditing();
                    renderEmploymentList();
                    window.updateDebriefEmpregosUI();
                }
            });

            actionsGroup.appendChild(deleteBtn);

            item.appendChild(infoGroup);
            item.appendChild(actionsGroup);
            overview.appendChild(item);
        });
    };

    if (debriefingMainBtn && debriefingModal) {
        // Reset view when opening modal
        debriefingMainBtn.addEventListener('click', () => {
            debriefMenu.style.display = 'flex';
            debriefContentArea.style.display = 'none';
        });
    }

    // --- DEBRIEFING INSERIR PLAYERS LOGIC ---
    const btnAddPlayerCard = document.getElementById('btn-add-player-card');
    const playersContainer = document.getElementById('players-cards-container');

    const playerTypesMap = {
        'Aeronave': ['RQ-900', 'SC-105', 'A-1', 'A-29', 'H-60'],
        'Veículo': ['Viatura', 'Blindado'],
        'Tropa': ['Grupamento', 'JTAC']
    };

    const playerIconsMap = {
        'Aeronave': '<i class="fa-solid fa-plane" style="font-size: 3rem; color: var(--primary);"></i>',
        'Veículo': '<i class="fa-solid fa-truck" style="font-size: 3rem; color: var(--primary);"></i>',
        'Tropa': '<i class="fa-solid fa-person-rifle" style="font-size: 3rem; color: var(--primary);"></i>'
    };

    function addPlayerCard(pData = null) {
        const card = document.createElement('div');
        card.style.cssText = `background: rgba(255,255,255,0.05); border: 1px solid rgba(0, 210, 255, 0.2); border-radius: 8px; width: 100%; max-width: 950px; display: flex; flex-direction: row; align-items: flex-start; padding: 15px; position: relative; transition: 0.3s; gap: 20px;`;
        
        if (pData && pData.trackId) {
            card.dataset.trackId = pData.trackId;
        }

        // Delete button inside card
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
        delBtn.style.cssText = `position: absolute; top: 5px; right: 5px; background: none; border: none; color: #ff3333; cursor: pointer; opacity: 0.7;`;
        delBtn.onmouseover = () => delBtn.style.opacity = '1';
        delBtn.onmouseout = () => delBtn.style.opacity = '0.7';
        delBtn.addEventListener('click', () => {
            if (card.dataset.trackId && window.removeSimulatedTrack) {
                window.removeSimulatedTrack(card.dataset.trackId);
            }
            card.remove();
        });

        // Image/Icon placeholder
        const iconBox = document.createElement('div');
        iconBox.style.cssText = `width: 100px; height: 100px; background: rgba(0,0,0,0.5); border: 1px solid var(--primary); border-radius: 6px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;`;
        iconBox.innerHTML = playerIconsMap[pData ? pData.category : 'Aeronave'] || playerIconsMap['Aeronave'];

        // Category Select
        const catSelect = document.createElement('select');
        catSelect.className = 'player-category-select';
        catSelect.style.cssText = `width: 100%; background: rgba(0,0,0,0.5); color: #fff; border: 1px solid var(--text-dim); border-radius: 4px; padding: 5px; margin-bottom: 10px; outline: none;`;
        Object.keys(playerTypesMap).forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            if (pData && pData.category === cat) opt.selected = true;
            catSelect.appendChild(opt);
        });

        // Specific Type Select
        const typeSelect = document.createElement('select');
        typeSelect.className = 'player-type-select';
        typeSelect.style.cssText = `width: 100%; background: rgba(0,0,0,0.5); color: var(--primary); border: 1px solid var(--primary); border-radius: 4px; padding: 5px; outline: none; font-weight: bold;`;
        
        const updateCardBackground = () => {
            if (typeSelect.value === 'A-29') {
                card.style.backgroundImage = 'linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.95)), url("bg-a29.jpg")';
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
                card.style.borderColor = 'rgba(0, 210, 255, 0.5)';
            } else if (typeSelect.value === 'RQ-900') {
                card.style.backgroundImage = 'linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.95)), url("bg-rq900.jpg")';
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
                card.style.borderColor = 'rgba(0, 210, 255, 0.5)';
            } else if (typeSelect.value === 'H-60') {
                card.style.backgroundImage = 'linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.95)), url("bg-h60.jpg")';
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
                card.style.borderColor = 'rgba(0, 210, 255, 0.5)';
            } else if (typeSelect.value === 'SC-105') {
                card.style.backgroundImage = 'linear-gradient(rgba(10, 10, 10, 0.75), rgba(10, 10, 10, 0.95)), url("bg-sc105.png")';
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
                card.style.borderColor = 'rgba(0, 210, 255, 0.5)';
            } else {
                card.style.backgroundImage = 'none';
                card.style.background = 'rgba(255,255,255,0.05)';
                card.style.borderColor = 'rgba(0, 210, 255, 0.2)';
            }
        };
        
        typeSelect.addEventListener('change', updateCardBackground);
        
        const aeroOptions = document.createElement('div');
        aeroOptions.className = 'aero-options-panel';
        aeroOptions.style.cssText = 'flex-grow: 1; display: none; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: start; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 20px;';
        
        const tropaOptions = document.createElement('div');
        tropaOptions.className = 'tropa-options-panel';
        tropaOptions.style.cssText = 'flex-grow: 1; display: none; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; align-items: start; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 20px;';

        const updateTypeSelect = () => {
            typeSelect.innerHTML = '';
            const cat = catSelect.value;
            iconBox.innerHTML = playerIconsMap[cat] || playerIconsMap['Aeronave'];
            const types = playerTypesMap[cat] || [];
            types.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.textContent = t;
                if (pData && pData.type === t) opt.selected = true;
                typeSelect.appendChild(opt);
            });
            
            updateCardBackground();
            
            if (cat === 'Aeronave') {
                aeroOptions.style.display = 'grid';
                aeroOptions.innerHTML = `
            <datalist id="cp-datalist"></datalist>
            <div>
                <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Trigrama / Callsign</label>
                <input type="text" class="player-trigrama" placeholder="Ex: FALCÃO 01" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; font-weight: bold; color: var(--primary);">
            </div>
            <div>
                <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Local Decolagem</label>
                <input type="text" class="player-takeoff" ondblclick="if(window.openCPModal) window.openCPModal(this)" value="21KYT 43504 35727" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; cursor: pointer;">
            </div>
            <div>
                <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Local Pouso</label>
                <input type="text" class="player-landing" ondblclick="if(window.openCPModal) window.openCPModal(this)" value="21KYT 43504 35727" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; cursor: pointer;">
            </div>
            <div style="display: flex; gap: 5px;">
                <div style="flex: 1;">
                    <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Hora Decol.</label>
                    <input type="time" class="player-takeoff-time" step="1" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;">
                </div>
                <div style="flex: 1;">
                    <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Hora Pouso</label>
                    <input type="time" class="player-landing-time" step="1" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;">
                </div>
            </div>
            
            <div class="player-routes-container" style="border: 1px solid rgba(255,255,255,0.1); padding: 5px; border-radius: 4px; margin-top: 5px;">
                <label style="color: var(--text-dim); margin-bottom: 2px; display: flex; justify-content: space-between; align-items: center;">Pontos em Rota <button class="btn-add-route" title="Adicionar Ponto" style="background:rgba(0, 210, 255, 0.2); border:1px solid var(--primary); color:white; border-radius:4px; cursor:pointer; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;"><i class="fa-solid fa-plus" style="font-size: 0.6rem;"></i></button></label>
                <div class="route-inputs-wrapper" style="display:flex; flex-direction:column; gap:4px;">
                </div>
            </div>
            
            <div style="margin-top: 5px;">
                <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Coord. Ancoragem</label>
                <input type="text" class="player-anchor" ondblclick="if(window.openCPModal) window.openCPModal(this)" list="cp-datalist" placeholder="MGRS/Geog" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; cursor: pointer;">
            </div>
            <div style="display: flex; gap: 5px; margin-top: 5px;">
                <div style="flex: 1;">
                    <label style="color: var(--text-dim); margin-bottom: 2px; display: block; font-size: 0.8rem;">Hora Ancoragem (Opcional)</label>
                    <input type="time" class="player-anchor-time" step="1" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; font-size: 0.85rem;">
                </div>
                <div style="flex: 1;">
                    <label style="color: var(--text-dim); margin-bottom: 2px; display: block; font-size: 0.8rem;">Perfil de Ancoragem</label>
                    <select class="player-profile" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; font-size: 0.85rem;">
                        <option value="wheel">Wheel</option>
                        <option value="racetrack">Racetrack</option>
                        <option value="figure8">Figure 8</option>
                        <option value="hold">Pouso / Hold</option>
                    </select>
                </div>
            </div>
            
            <!-- Dynamic Anchor Options -->
            <div class="anchor-options-container" style="display: flex; gap: 5px; margin-top: 5px;">
                <!-- Hold -->
                <div class="hold-opts" style="display:none; flex-wrap: wrap; gap: 5px; width:100%;">
                    <div style="flex:1; min-width: 100%;">
                        <label style="color: var(--text-dim); font-size: 0.7rem;">Tempo (minutos)</label>
                        <input type="number" class="player-hold-time" value="10" step="1" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;">
                    </div>
                </div>
                <!-- Wheel -->
                <div class="wheel-opts" style="display:flex; gap: 5px; width:100%;">
                    <div style="flex:1;">
                        <label style="color: var(--text-dim); font-size: 0.7rem;">Raio (NM)</label>
                        <input type="number" class="player-wheel-radius" value="3" step="0.1" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;">
                    </div>
                    <div style="flex:1;">
                        <label style="color: var(--text-dim); font-size: 0.7rem;">Curva</label>
                        <select class="player-wheel-dir" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;">
                            <option value="right">Direita</option>
                            <option value="left">Esquerda</option>
                        </select>
                    </div>
                </div>
                <!-- Racetrack -->
                <div class="racetrack-opts" style="display:none; flex-wrap: wrap; gap: 5px; width:100%;">
                    <div style="flex:1; min-width: 45%;">
                        <label style="color: var(--text-dim); font-size: 0.7rem;">Medida</label>
                        <select class="player-rt-measure" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;">
                            <option value="time">Tempo (min)</option>
                            <option value="dist">Distância (NM)</option>
                        </select>
                    </div>
                    <div style="flex:1; min-width: 45%;">
                        <label style="color: var(--text-dim); font-size: 0.7rem;">Valor</label>
                        <input type="number" class="player-rt-value" value="1" step="0.1" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;">
                    </div>
                    <div style="flex:1; min-width: 100%;">
                        <label style="color: var(--text-dim); font-size: 0.7rem;">Proa Base (Mag)</label>
                        <input type="number" class="player-base-hdg" placeholder="Automático" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;">
                    </div>
                </div>
            </div>

            <button class="btn-insert-scenario" style="grid-column: 1 / -1; margin-top: 10px; width: 100%; background: #28a745; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s;"><i class="fa-solid fa-play" style="margin-right: 5px;"></i> INSERIR NO CENÁRIO</button>
        `;

                // Populate Datalist
                const datalist = aeroOptions.querySelector('#cp-datalist');
                if (datalist && typeof tacticalPoints !== 'undefined') {
                    ['checkpoints', 'targets', 'anchors', 'artillery'].forEach(mode => {
                        if (tacticalPoints[mode]) {
                            tacticalPoints[mode].forEach(pt => {
                                if (pt.name) {
                                    const opt = document.createElement('option');
                                    opt.value = pt.name;
                                    datalist.appendChild(opt);
                                }
                            });
                        }
                    });
                }

                // Route Points logic
                const btnAddRoute = aeroOptions.querySelector('.btn-add-route');
                const routeWrapper = aeroOptions.querySelector('.route-inputs-wrapper');
                
                const addRouteInput = (val = "") => {
                    const row = document.createElement('div');
                    row.style.cssText = 'display:flex; gap: 4px; align-items: center; margin-top: 4px;';
                    
                    const newInp = document.createElement('input');
                    newInp.type = 'text';
                    newInp.className = 'player-route-input';
                    newInp.setAttribute('list', 'cp-datalist');
                    newInp.placeholder = 'Coord ou Nome do Ponto';
                    newInp.style.cssText = 'width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; cursor: pointer;';
                    newInp.value = val;
                    newInp.ondblclick = () => { if(window.openCPModal) window.openCPModal(newInp); };
                    
                    const delBtnInp = document.createElement('button');
                    delBtnInp.className = 'btn-del-route';
                    delBtnInp.title = 'Excluir Ponto';
                    delBtnInp.innerHTML = '<i class="fa-solid fa-times"></i>';
                    delBtnInp.style.cssText = 'background:none; border:none; color:#ff3333; cursor:pointer; padding: 0 4px;';
                    delBtnInp.onclick = () => row.remove();
                    
                    row.appendChild(newInp);
                    row.appendChild(delBtnInp);
                    routeWrapper.appendChild(row);
                };

                btnAddRoute.addEventListener('click', () => addRouteInput(""));

                // Populate existing routes if loading
                if (pData && Array.isArray(pData.route)) {
                    pData.route.forEach(rVal => addRouteInput(rVal));
                } else {
                    addRouteInput(""); // add one default empty input
                }

                // Anchor logic UI toggle
                const profSelect = aeroOptions.querySelector('.player-profile');
                const wOpts = aeroOptions.querySelector('.wheel-opts');
                const rtOpts = aeroOptions.querySelector('.racetrack-opts');
                const hOpts = aeroOptions.querySelector('.hold-opts');

                profSelect.addEventListener('change', () => {
                    wOpts.style.display = profSelect.value === 'wheel' ? 'flex' : 'none';
                    rtOpts.style.display = (profSelect.value === 'racetrack' || profSelect.value === 'figure8') ? 'flex' : 'none';
                    if (hOpts) hOpts.style.display = profSelect.value === 'hold' ? 'flex' : 'none';
                });

                // Populate anchor profile inputs if loading
                if (pData) {
                    profSelect.value = pData.profile || 'wheel';
                    wOpts.style.display = profSelect.value === 'wheel' ? 'flex' : 'none';
                    rtOpts.style.display = (profSelect.value === 'racetrack' || profSelect.value === 'figure8') ? 'flex' : 'none';
                    if (hOpts) hOpts.style.display = profSelect.value === 'hold' ? 'flex' : 'none';

                    if (pData.profile === 'hold') {
                        aeroOptions.querySelector('.player-hold-time').value = pData.holdTime;
                    } else if (pData.profile === 'wheel') {
                        aeroOptions.querySelector('.player-wheel-radius').value = pData.wheelRadius;
                        aeroOptions.querySelector('.player-wheel-dir').value = pData.wheelDir;
                    } else if (pData.profile === 'racetrack' || pData.profile === 'figure8') {
                        aeroOptions.querySelector('.player-rt-measure').value = pData.rtMeasure;
                        aeroOptions.querySelector('.player-rt-value').value = pData.rtValue;
                        aeroOptions.querySelector('.player-base-hdg').value = pData.baseHdg;
                    }
                    
                    card.querySelector('.player-trigrama').value = pData.trigrama || '';
                    card.querySelector('.player-takeoff').value = pData.takeoff || '';
                    card.querySelector('.player-landing').value = pData.landing || '';
                    card.querySelector('.player-takeoff-time').value = pData.takeoffTime || '';
                    card.querySelector('.player-landing-time').value = pData.landingTime || '';
                    card.querySelector('.player-anchor').value = pData.anchor || '';
                    const anchorTimeInp = card.querySelector('.player-anchor-time');
                    if (anchorTimeInp) anchorTimeInp.value = pData.anchorTime || '';
                }

                const insertBtn = aeroOptions.querySelector('.btn-insert-scenario');
                if (insertBtn) {
                    if (pData && pData.trackId) {
                        insertBtn.style.background = '#17a2b8';
                        insertBtn.innerHTML = '<i class="fa-solid fa-save" style="margin-right: 5px;"></i> SALVAR ALTERAÇÕES';
                    }
                    insertBtn.addEventListener('mouseover', () => insertBtn.style.filter = 'brightness(1.2)');
                    insertBtn.addEventListener('mouseout', () => insertBtn.style.filter = 'brightness(1)');
                    insertBtn.addEventListener('click', () => {
                        const routeInputs = Array.from(routeWrapper.querySelectorAll('.player-route-input')).map(inp => inp.value).filter(val => val.trim() !== '');
                        const routeStr = routeInputs.join(',');

                        const params = {
                            name: card.querySelector('.player-trigrama').value || typeSelect.value,
                            type: typeSelect.value,
                            takeoffStr: card.querySelector('.player-takeoff').value,
                            landingStr: card.querySelector('.player-landing').value,
                            takeoffTimeStr: card.querySelector('.player-takeoff-time').value,
                            landingTimeStr: card.querySelector('.player-landing-time').value,
                            routeStr: routeStr,
                            anchorStr: card.querySelector('.player-anchor').value,
                            anchorTimeStr: card.querySelector('.player-anchor-time')?.value || '',
                            profile: profSelect.value,
                            wheelRadiusNM: parseFloat(aeroOptions.querySelector('.player-wheel-radius').value),
                            wheelDir: aeroOptions.querySelector('.player-wheel-dir').value,
                            rtMeasure: aeroOptions.querySelector('.player-rt-measure').value,
                            rtValue: parseFloat(aeroOptions.querySelector('.player-rt-value').value),
                            baseHeadingMag: parseFloat(aeroOptions.querySelector('.player-base-hdg').value),
                            holdMin: parseFloat(aeroOptions.querySelector('.player-hold-time') ? aeroOptions.querySelector('.player-hold-time').value : 0),
                            color: card.querySelector('.player-color') ? card.querySelector('.player-color').value : '#00d2ff'
                        };
                        
                        if (card.dataset.trackId) {
                            params.id = card.dataset.trackId;
                        }
                        
                        if (typeof window.generateSimulatedTrack === 'function') {
                            const result = window.generateSimulatedTrack(params);
                            if (result && result.id) {
                                const isUpdate = !!card.dataset.trackId;
                                card.dataset.trackId = result.id;
                                card.dataset.trackColor = result.color;
                                
                                // Update card UI with calculated takeoff time if anchor-time was specified
                                if (result.calculatedTakeoffTime) {
                                    const takeoffTimeInp = card.querySelector('.player-takeoff-time');
                                    if (takeoffTimeInp) {
                                        takeoffTimeInp.value = result.calculatedTakeoffTime;
                                    }
                                }
                                
                                insertBtn.style.background = '#007bff';
                                insertBtn.innerHTML = '<i class="fa-solid fa-check"></i> ' + (isUpdate ? 'ATUALIZADO' : 'INSERIDO');
                                
                                if (!isUpdate) {
                                    const addBtn = document.getElementById('btn-add-player-card');
                                    if (addBtn) addBtn.click();
                                }
                                
                                setTimeout(() => {
                                    insertBtn.style.background = '#17a2b8';
                                    insertBtn.innerHTML = '<i class="fa-solid fa-save" style="margin-right: 5px;"></i> SALVAR ALTERAÇÕES';
                                }, 2000);
                            } else {
                                alert("Erro ao inserir. Verifique as coordenadas e os horários.");
                            }
                        } else {
                            console.error("generateSimulatedTrack function not found!");
                        }
                    });
                }
            } else if (cat === 'Tropa') {
                aeroOptions.style.display = 'none';
                tropaOptions.style.display = 'grid';
                tropaOptions.innerHTML = `
            <div>
                <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Trigrama / Callsign</label>
                <input type="text" class="player-trigrama" placeholder="Ex: TROPA 01" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; font-weight: bold; color: var(--primary);">
            </div>
            <div>
                <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Waypoint Inicial (Friendly)</label>
                <select class="tropa-start-waypoint" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none;"></select>
            </div>
            <div>
                <label style="color: var(--text-dim); margin-bottom: 2px; display: block;">Ação</label>
                <button class="btn-tropa-montar-rota" style="width: 100%; background: var(--primary); color: #000; border: none; padding: 6px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s;"><i class="fa-solid fa-map-pin" style="margin-right: 5px;"></i> MONTAR ROTA</button>
            </div>

            <div class="tropa-route-coordinates-container" style="grid-column: 1 / -1; border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; margin-top: 5px; display: none;">
                <label style="color: var(--text-dim); margin-bottom: 5px; display: block; font-weight: bold;">Coordenadas e Horários de Passagem</label>
                <div class="tropa-route-list-wrapper" style="display:flex; flex-direction:column; gap:6px; max-height: 150px; overflow-y: auto;">
                </div>
            </div>

            <div style="grid-column: 1 / -1; display: flex; align-items: center; gap: 8px; margin-top: 10px; padding: 5px; background: rgba(255,255,255,0.05); border-radius: 4px;">
                <label style="color: var(--primary); font-weight: bold; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
                    <input type="checkbox" class="tropa-enable-limits" style="cursor: pointer; width: 16px; height: 16px;">
                    Ativar Spawn / Despawn
                </label>
            </div>
            <div class="tropa-limits-container" style="grid-column: 1 / -1; display: none; gap: 10px; margin-top: 5px;">
                <div style="flex: 1;">
                    <label style="color: var(--text-dim); margin-bottom: 2px; display: block; font-size: 0.8rem;">Hora Spawn</label>
                    <input type="time" class="tropa-spawn-time" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; font-size: 0.85rem;">
                </div>
                <div style="flex: 1;">
                    <label style="color: var(--text-dim); margin-bottom: 2px; display: block; font-size: 0.8rem;">Hora Despawn</label>
                    <input type="time" class="tropa-despawn-time" style="width: 100%; background: rgba(0,0,0,0.5); color: white; border: 1px solid var(--text-dim); border-radius: 4px; padding: 4px; outline: none; font-size: 0.85rem;">
                </div>
            </div>

            <button class="btn-insert-tropa-scenario" style="grid-column: 1 / -1; margin-top: 10px; width: 100%; background: #28a745; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; transition: 0.2s;"><i class="fa-solid fa-play" style="margin-right: 5px;"></i> INSERIR NO CENÁRIO</button>
                `;

                // Populate Friendly Waypoints Dropdown
                const wpSelect = tropaOptions.querySelector('.tropa-start-waypoint');
                if (wpSelect) {
                    wpSelect.innerHTML = '';
                    const friendlyPoints = (window.tacticalPoints && window.tacticalPoints['friendly']) || [];
                    if (friendlyPoints.length === 0) {
                        const opt = document.createElement('option');
                        opt.value = '';
                        opt.textContent = 'Nenhum friendly WPT';
                        wpSelect.appendChild(opt);
                    } else {
                        friendlyPoints.forEach(pt => {
                            const opt = document.createElement('option');
                            opt.value = pt.id;
                            opt.textContent = pt.name;
                            if (pData && String(pData.friendlyWpId) === String(pt.id)) {
                                opt.selected = true;
                            }
                            wpSelect.appendChild(opt);
                        });
                    }
                }

                // Helper to format ms to HH:MM
                const formatMsToTime = (ms) => {
                    const totalSecs = Math.floor(ms / 1000);
                    const hrs = Math.floor(totalSecs / 3600) % 24;
                    const mins = Math.floor((totalSecs % 3600) / 60);
                    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                };

                const coordsContainer = tropaOptions.querySelector('.tropa-route-coordinates-container');
                const listWrapper = tropaOptions.querySelector('.tropa-route-list-wrapper');

                // Render function for coordinates list
                const renderTropaCoordinates = (points, friendlyName) => {
                    listWrapper.innerHTML = '';
                    coordsContainer.style.display = 'block';
                    
                    const getMGRS = (lat, lng) => {
                        if (typeof mgrs !== 'undefined') {
                            try {
                                let m = mgrs.forward([lng, lat]);
                                return m.replace(/^(\d+[A-Z])([A-Z]{2})(\d{5})(\d{5})$/, '$1 $2 $3 $4');
                            } catch(e) {
                                return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                            }
                        }
                        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    };

                    points.forEach((pt, index) => {
                        const row = document.createElement('div');
                        row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:4px 8px; border-radius:4px; gap: 8px;';
                        
                        const label = document.createElement('span');
                        label.style.cssText = 'font-size:0.75rem; color:#fff; font-family:monospace; width: 60px; flex-shrink: 0;';
                        if (index === 0) {
                            label.textContent = `Início:`;
                            label.style.color = 'var(--primary)';
                        } else {
                            label.textContent = `Pto ${index}:`;
                        }
                        
                        const coordInp = document.createElement('input');
                        coordInp.type = 'text';
                        coordInp.className = 'tropa-point-coords';
                        coordInp.style.cssText = 'width: 150px; background:rgba(0,0,0,0.5); color:white; border:1px solid var(--text-dim); border-radius:4px; padding:2px; outline:none; font-size:0.75rem; font-family:monospace; cursor: pointer;';
                        coordInp.value = pt.mgrs || getMGRS(pt.lat, pt.lng);
                        coordInp.ondblclick = () => { if(window.openCPModal) window.openCPModal(coordInp); };
                        
                        const timeInp = document.createElement('input');
                        timeInp.type = 'time';
                        timeInp.className = 'tropa-point-time';
                        timeInp.style.cssText = 'background:rgba(0,0,0,0.5); color:white; border:1px solid var(--text-dim); border-radius:4px; padding:2px; outline:none; font-size:0.75rem;';
                        
                        let defaultMs = (typeof currentRelativeTimeMs !== 'undefined' ? currentRelativeTimeMs : 0) + (index * 10 * 60000);
                        timeInp.value = pt.timeStr || formatMsToTime(defaultMs);
                        
                        row.appendChild(label);
                        row.appendChild(coordInp);
                        row.appendChild(timeInp);
                        listWrapper.appendChild(row);
                    });
                };

                // Setup Toggle for Spawn/Despawn limits
                const cbEnable = card.querySelector('.tropa-enable-limits');
                const limitsContainer = card.querySelector('.tropa-limits-container');
                if (cbEnable && limitsContainer) {
                    cbEnable.addEventListener('change', () => {
                        limitsContainer.style.display = cbEnable.checked ? 'flex' : 'none';
                    });
                }

                // Restore if loading
                if (pData && Array.isArray(pData.tropaPoints)) {
                    card.dataset.tropaPointsJson = JSON.stringify(pData.tropaPoints.map(p => ({ lat: p.lat, lng: p.lng })));
                    renderTropaCoordinates(pData.tropaPoints, pData.friendlyWpName);
                    card.querySelector('.player-trigrama').value = pData.trigrama || '';
                    
                    if (cbEnable) {
                        cbEnable.checked = pData.enableSpawnDespawn || false;
                        if (limitsContainer) {
                            limitsContainer.style.display = cbEnable.checked ? 'flex' : 'none';
                        }
                    }
                    const tSpawn = card.querySelector('.tropa-spawn-time');
                    const tDespawn = card.querySelector('.tropa-despawn-time');
                    if (tSpawn) tSpawn.value = pData.spawnTime || '';
                    if (tDespawn) tDespawn.value = pData.despawnTime || '';
                }

                // Montar Rota logic
                const btnMontar = tropaOptions.querySelector('.btn-tropa-montar-rota');
                btnMontar.addEventListener('click', () => {
                    const selectedWpId = wpSelect.value;
                    const friendlyPoints = (window.tacticalPoints && window.tacticalPoints['friendly']) || [];
                    const startWp = friendlyPoints.find(pt => String(pt.id) === String(selectedWpId));
                    if (!startWp) {
                        alert("Por favor, selecione ou crie um waypoint friendly primeiro!");
                        return;
                    }

                    // Minimize debrief modal
                    const debriefModal = document.getElementById('debriefing-modal');
                    if (debriefModal) debriefModal.style.display = 'none';

                    document.getElementById('map').style.cursor = 'crosshair';
                    let drawnRoutePoints = [startWp.latlng];
                    let drawingMarkers = [];

                    let drawingPolyline = L.polyline(drawnRoutePoints, { color: '#00d2ff', weight: 3, dashArray: '5, 5' }).addTo(map);

                    const onMapClickForTropa = (e) => {
                        const clickedLatLng = e.latlng;
                        drawnRoutePoints.push(clickedLatLng);
                        drawingPolyline.setLatLngs(drawnRoutePoints);

                        const m = L.circleMarker(clickedLatLng, { radius: 5, color: '#00d2ff', fillColor: '#00d2ff', fillOpacity: 1 }).addTo(map);
                        drawingMarkers.push(m);
                    };
                    map.on('click', onMapClickForTropa);

                    // Create floating button
                    const finishBtn = document.createElement('button');
                    finishBtn.id = 'btn-finish-tropa-route';
                    finishBtn.innerHTML = '<i class="fa-solid fa-check" style="margin-right: 8px;"></i> ENCERRAR ROTA';
                    finishBtn.style.cssText = `
                        position: fixed;
                        bottom: 30px;
                        left: 50%;
                        transform: translateX(-50%);
                        z-index: 99999;
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-size: 1.1rem;
                        font-weight: bold;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(40,167,69,0.5);
                        transition: 0.2s;
                    `;
                    finishBtn.onmouseover = () => finishBtn.style.filter = 'brightness(1.2)';
                    finishBtn.onmouseout = () => finishBtn.style.filter = 'brightness(1)';

                    finishBtn.addEventListener('click', () => {
                        map.off('click', onMapClickForTropa);
                        document.getElementById('map').style.cursor = '';
                        if (drawingPolyline) map.removeLayer(drawingPolyline);
                        drawingMarkers.forEach(m => map.removeLayer(m));
                        finishBtn.remove();

                        if (debriefModal) debriefModal.style.display = 'flex';

                        // Save coordinates
                        const coordsArray = drawnRoutePoints.map(p => ({ lat: p.lat, lng: p.lng }));
                        card.dataset.tropaPointsJson = JSON.stringify(coordsArray);

                        // Render timing inputs
                        renderTropaCoordinates(coordsArray, startWp.name);
                    });

                    document.body.appendChild(finishBtn);
                });

                // Insert into Scenario logic
                const insertTropaBtn = tropaOptions.querySelector('.btn-insert-tropa-scenario');
                if (pData && pData.trackId) {
                    insertTropaBtn.style.background = '#17a2b8';
                    insertTropaBtn.innerHTML = '<i class="fa-solid fa-save" style="margin-right: 5px;"></i> SALVAR ALTERAÇÕES';
                }
                insertTropaBtn.addEventListener('mouseover', () => insertTropaBtn.style.filter = 'brightness(1.2)');
                insertTropaBtn.addEventListener('mouseout', () => insertTropaBtn.style.filter = 'brightness(1)');

                insertTropaBtn.addEventListener('click', () => {
                    const coordInputs = Array.from(listWrapper.querySelectorAll('.tropa-point-coords'));
                    const timeInputs = Array.from(listWrapper.querySelectorAll('.tropa-point-time'));
                    
                    if (coordInputs.length === 0) {
                        alert("Por favor, monte a rota antes de inserir!");
                        return;
                    }

                    const tropaPoints = [];
                    for (let i = 0; i < coordInputs.length; i++) {
                        const val = coordInputs[i].value;
                        const latlng = window.parseCoordsToLatLng ? window.parseCoordsToLatLng(val) : null;
                        if (!latlng) {
                            alert(`Coordenada inválida no ponto ${i === 0 ? 'de Início' : i}!`);
                            return;
                        }
                        tropaPoints.push({
                            lat: latlng.lat,
                            lng: latlng.lng,
                            timeStr: timeInputs[i] ? timeInputs[i].value : ''
                        });
                    }

                    // Save the updated coordinates back to dataset so they are preserved
                    card.dataset.tropaPointsJson = JSON.stringify(tropaPoints.map(p => ({ lat: p.lat, lng: p.lng })));

                    const params = {
                        name: card.querySelector('.player-trigrama').value || typeSelect.value,
                        type: typeSelect.value,
                        category: 'Tropa',
                        tropaPoints: tropaPoints,
                        color: card.querySelector('.player-color') ? card.querySelector('.player-color').value : '#00d2ff',
                        enableSpawnDespawn: card.querySelector('.tropa-enable-limits')?.checked || false,
                        spawnTime: card.querySelector('.tropa-spawn-time')?.value || '',
                        despawnTime: card.querySelector('.tropa-despawn-time')?.value || ''
                    };

                    if (card.dataset.trackId) {
                        params.id = card.dataset.trackId;
                    }

                    if (typeof window.generateSimulatedTrack === 'function') {
                        const result = window.generateSimulatedTrack(params);
                        if (result && result.id) {
                            const isUpdate = !!card.dataset.trackId;
                            card.dataset.trackId = result.id;
                            card.dataset.trackColor = result.color;

                            insertTropaBtn.style.background = '#007bff';
                            insertTropaBtn.innerHTML = '<i class="fa-solid fa-check"></i> ' + (isUpdate ? 'ATUALIZADO' : 'INSERIDO');

                            if (!isUpdate) {
                                const addBtn = document.getElementById('btn-add-player-card');
                                if (addBtn) addBtn.click();
                            }

                            setTimeout(() => {
                                insertTropaBtn.style.background = '#17a2b8';
                                insertTropaBtn.innerHTML = '<i class="fa-solid fa-save" style="margin-right: 5px;"></i> SALVAR ALTERAÇÕES';
                            }, 2000);
                        } else {
                            alert("Erro ao inserir a rota da tropa. Verifique as coordenadas e os horários.");
                        }
                    } else {
                        console.error("generateSimulatedTrack function not found!");
                    }
                });

            } else {
                aeroOptions.style.display = 'none';
                tropaOptions.style.display = 'none';
            }
        };

        catSelect.addEventListener('change', updateTypeSelect);
        
        const leftCol = document.createElement('div');
        leftCol.style.cssText = 'display: flex; flex-direction: column; width: 140px; flex-shrink: 0; align-items: stretch; gap: 10px;';
        leftCol.appendChild(iconBox);
        leftCol.appendChild(catSelect);
        leftCol.appendChild(typeSelect);
        
        const colorContainer = document.createElement('div');
        colorContainer.style.cssText = `display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.5); border: 1px solid var(--text-dim); border-radius: 4px; padding: 2px 5px;`;
        const colorLabel = document.createElement('label');
        colorLabel.textContent = "Cor:";
        colorLabel.style.cssText = `color: var(--text-dim); font-size: 0.8rem;`;
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = pData ? pData.color : '#00d2ff';
        colorInput.className = 'player-color';
        colorInput.style.cssText = `background: none; border: none; outline: none; cursor: pointer; width: 30px; height: 30px; padding: 0;`;
        colorContainer.appendChild(colorLabel);
        colorContainer.appendChild(colorInput);
        leftCol.appendChild(colorContainer);

        card.appendChild(delBtn);
        card.appendChild(leftCol);
        card.appendChild(aeroOptions);
        card.appendChild(tropaOptions);
        
        updateTypeSelect(); // init
        
        playersContainer.appendChild(card);
    }

    if (btnAddPlayerCard && playersContainer) {
        btnAddPlayerCard.addEventListener('click', () => addPlayerCard());
    }

    function getExportedPlayers() {
        const players = [];
        if (!playersContainer) return players;
        const cards = Array.from(playersContainer.querySelectorAll('div[style*="position: relative"]'));
        cards.forEach(card => {
            const catSelect = card.querySelector('.player-category-select');
            const typeSelect = card.querySelector('.player-type-select');
            if (!catSelect || !typeSelect) return;
            
            const cat = catSelect.value;
            const type = typeSelect.value;
            
            const item = {
                category: cat,
                type: type,
                trigrama: card.querySelector('.player-trigrama')?.value || '',
                takeoff: card.querySelector('.player-takeoff')?.value || '',
                landing: card.querySelector('.player-landing')?.value || '',
                takeoffTime: card.querySelector('.player-takeoff-time')?.value || '',
                landingTime: card.querySelector('.player-landing-time')?.value || '',
                anchor: card.querySelector('.player-anchor')?.value || '',
                anchorTime: card.querySelector('.player-anchor-time')?.value || '',
                profile: card.querySelector('.player-profile')?.value || 'wheel',
                holdTime: card.querySelector('.player-hold-time')?.value || '10',
                wheelRadius: card.querySelector('.player-wheel-radius')?.value || '3',
                wheelDir: card.querySelector('.player-wheel-dir')?.value || 'right',
                rtMeasure: card.querySelector('.player-rt-measure')?.value || 'NM',
                rtValue: card.querySelector('.player-rt-value')?.value || '1',
                baseHdg: card.querySelector('.player-base-hdg')?.value || '',
                color: card.querySelector('.player-color')?.value || '#00d2ff',
                trackId: card.dataset.trackId || null
            };
            
            const routeInputs = Array.from(card.querySelectorAll('.player-route-input')).map(inp => inp.value);
            item.route = routeInputs;
            
            if (cat === 'Tropa') {
                const tropaPoints = [];
                const coordInputs = Array.from(card.querySelectorAll('.tropa-point-coords'));
                const timeInputs = Array.from(card.querySelectorAll('.tropa-point-time'));
                coordInputs.forEach((inp, idx) => {
                    const latlng = window.parseCoordsToLatLng ? window.parseCoordsToLatLng(inp.value) : null;
                    if (latlng) {
                        tropaPoints.push({
                            lat: latlng.lat,
                            lng: latlng.lng,
                            timeStr: timeInputs[idx] ? timeInputs[idx].value : '',
                            mgrs: inp.value
                        });
                    }
                });
                item.tropaPoints = tropaPoints;
                
                const startWpSelect = card.querySelector('.tropa-start-waypoint');
                if (startWpSelect) {
                    item.friendlyWpId = startWpSelect.value;
                    const opt = startWpSelect.options[startWpSelect.selectedIndex];
                    if (opt) item.friendlyWpName = opt.textContent;
                }
                
                item.enableSpawnDespawn = card.querySelector('.tropa-enable-limits')?.checked || false;
                item.spawnTime = card.querySelector('.tropa-spawn-time')?.value || '';
                item.despawnTime = card.querySelector('.tropa-despawn-time')?.value || '';
            }
            
            players.push(item);
        });
        return players;
    }

    function clearAllPlayers() {
        if (playersContainer) playersContainer.innerHTML = '';
    }

    window.getExportedPlayers = getExportedPlayers;
    window.clearAllPlayers = clearAllPlayers;
    window.addPlayerCard = addPlayerCard;
    // --- 9-LINE MODAL LOGIC ---
    let currentNineLinePt = null;
    let globalAtkIdCounter = 1;
    const nineLineModal = document.getElementById('nineline-modal');
    const closeNineLineBtn = document.getElementById('close-nineline-btn');
    
    const ninelineTimeInput = document.getElementById('nineline-time');
    if (ninelineTimeInput) {
        ninelineTimeInput.placeholder = "00:00:00";
        
        ninelineTimeInput.addEventListener('blur', function() {
            let val = this.value.replace(/\D/g, '');
            if (val.length === 0) return;
            while (val.length < 6) {
                val += '0';
            }
            this.value = val.substring(0, 2) + ':' + val.substring(2, 4) + ':' + val.substring(4, 6);
        });

        ninelineTimeInput.addEventListener('input', function(e) {
            let val = this.value.replace(/\D/g, '');
            if (val.length > 6) {
                val = val.substring(0, 6);
            }
            let formatted = '';
            if (val.length > 0) {
                formatted += val.substring(0, 2);
            }
            if (val.length > 2) {
                formatted += ':' + val.substring(2, 4);
            }
            if (val.length > 4) {
                formatted += ':' + val.substring(4, 6);
            }
        });
    }

    function setupFahInput(id) {
        const inputEl = document.getElementById(id);
        if (!inputEl) return;
        
        inputEl.addEventListener('input', function() {
            let raw = this.value.replace(/\D/g, '');
            if (raw === '') {
                this.value = '';
                return;
            }
            let val = parseInt(raw, 10);
            if (val >= 360) {
                val = val % 360;
            }
            this.value = val;
        });
        
        inputEl.addEventListener('blur', function() {
            if (this.value === '') return;
            let val = parseInt(this.value, 10);
            this.value = String(val).padStart(3, '0');
        });
    }
    setupFahInput('nineline-axis-hdg');
    setupFahInput('nineline-axis-min');
    setupFahInput('nineline-axis-max');

    if (closeNineLineBtn) {
        closeNineLineBtn.addEventListener('click', () => {
            saveNineLineData();
            nineLineModal.style.display = 'none';
        });
    }

    if (nineLineModal) {
        nineLineModal.addEventListener('click', (e) => {
            if (e.target === nineLineModal) {
                saveNineLineData();
                nineLineModal.style.display = 'none';
            }
        });
    }

    const axisTypeSelect = document.getElementById('nineline-axis-type');
    if (axisTypeSelect) {
        axisTypeSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'JA') {
                document.getElementById('nineline-axis-single-container').style.display = 'none';
                document.getElementById('nineline-axis-range-container').style.display = 'flex';
            } else {
                document.getElementById('nineline-axis-single-container').style.display = 'block';
                document.getElementById('nineline-axis-range-container').style.display = 'none';
            }
        });
    }

        function openNineLineModal(pt) {
        currentNineLinePt = pt;
        if (!pt.ninelineData) {
            pt.ninelineData = { atkId: globalAtkIdCounter + "A" };
            globalAtkIdCounter++;
        }
        const d = pt.ninelineData;

        document.getElementById('nineline-atk-id').value = d.atkId;
        if (!d.time) {
            d.time = window.currentXMLTime || '';
        }
        document.getElementById('nineline-time').value = d.time;
        
        const typeVal = d.type || '2';
        document.getElementById('nineline-type').value = typeVal;
        if (typeof setType === 'function') setType(typeVal);
        
        document.getElementById('nineline-method').value = d.method || 'BOC';
        document.getElementById('nineline-ordnance').value = d.ordnance || '';
        document.getElementById('nineline-interv').value = d.interv || '';
        
        document.getElementById('nineline-ip').value = d.ip || '';
        document.getElementById('nineline-hdg').value = d.hdg || '';
        document.getElementById('nineline-dist').value = d.dist || '';
        
        // Auto-fill Elevation
        if (!d.elev) {
            if (pt.elevation) {
                d.elev = Math.round(pt.elevation * 3.28084) + " FT";
                document.getElementById('nineline-elev').value = d.elev;
            } else if (pt.latlng) {
                document.getElementById('nineline-elev').value = "Buscando...";
                fetch(`https://api.open-meteo.com/v1/elevation?latitude=${pt.latlng.lat}&longitude=${pt.latlng.lng}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.elevation && data.elevation.length > 0) {
                            const meters = data.elevation[0];
                            pt.elevation = meters;
                            if (currentNineLinePt === pt) {
                                d.elev = Math.round(meters * 3.28084) + " FT";
                                document.getElementById('nineline-elev').value = d.elev;
                            }
                        } else {
                            if (currentNineLinePt === pt) document.getElementById('nineline-elev').value = "";
                        }
                    })
                    .catch(err => {
                        console.error("Erro ao buscar elevação:", err);
                        if (currentNineLinePt === pt) document.getElementById('nineline-elev').value = "";
                    });
            } else {
                document.getElementById('nineline-elev').value = "";
            }
        } else {
            document.getElementById('nineline-elev').value = d.elev;
        }
        
        document.getElementById('nineline-desc').value = d.desc || '';

        // Auto-fill coordinates
        if (!d.coord) {
            const isDD = document.getElementById('format-toggle') && document.getElementById('format-toggle').checked;
            d.coord = isDD ? 
                formatDD(pt.latlng.lat, pt.latlng.lng) : 
                (typeof mgrs !== 'undefined' ? mgrs.forward([pt.latlng.lng, pt.latlng.lat]).replace(/^(\d+[A-Z])([A-Z]{2})(\d{5})(\d{5})$/, '$1 $2 $3 $4') : `${pt.latlng.lat.toFixed(5)}, ${pt.latlng.lng.toFixed(5)}`);
        }
        document.getElementById('nineline-coord').value = d.coord;
        
        document.getElementById('nineline-mark').value = d.mark || '';
        
        const fParts = (d.friendly || '').trim().split(/\s+/);
        document.getElementById('nineline-friendly-dist').value = fParts[0] || '';
        if (fParts.length > 1) {
            document.getElementById('nineline-friendly-dir').value = fParts[1];
        } else {
            document.getElementById('nineline-friendly-dir').value = 'N';
        }
        
        document.getElementById('nineline-egress').value = d.egress || '';
        document.getElementById('nineline-rmk').value = d.rmk || '';
        document.getElementById('nineline-restric').value = d.restric || '';
        const formatFahLoadValue = (val) => {
            if (!val && val !== 0 && val !== '0') return '';
            let num = parseInt(val, 10);
            if (isNaN(num)) return val;
            num = (num % 360 + 360) % 360;
            return String(num).padStart(3, '0');
        };
        document.getElementById('nineline-axis-hdg').value = formatFahLoadValue(d.axisHdg);
        document.getElementById('nineline-axis-min').value = formatFahLoadValue(d.axisMin);
        document.getElementById('nineline-axis-max').value = formatFahLoadValue(d.axisMax);
        document.getElementById('nineline-axis-type').value = d.axisType || '';
        document.getElementById('nineline-axis-rc').checked = !!d.axisRc;

        // Toggle container visibility depending on axisType
        if (d.axisType === 'JA') {
            document.getElementById('nineline-axis-single-container').style.display = 'none';
            document.getElementById('nineline-axis-range-container').style.display = 'flex';
        } else {
            document.getElementById('nineline-axis-single-container').style.display = 'block';
            document.getElementById('nineline-axis-range-container').style.display = 'none';
        }

        document.getElementById('f2f-f').value = d.f2f_f || '';
        document.getElementById('f2f-r').value = d.f2f_r || '';
        document.getElementById('f2f-o').value = d.f2f_o || '';
        document.getElementById('f2f-t').value = d.f2f_t || '';
        document.getElementById('f2f-i').value = d.f2f_i || '';
        document.getElementById('f2f-e').value = d.f2f_e || '';
        document.getElementById('f2f-s').value = d.f2f_s || '';
        
        document.getElementById('nineline-bda').value = d.bda || '';

        // Setup DMPIs container and add button
        const dmpisContainer = document.getElementById('nineline-dmpis-container');
        if (dmpisContainer) {
            dmpisContainer.innerHTML = '';
            
            const createDmpiInputRow = (val = '') => {
                const row = document.createElement('div');
                row.style.cssText = 'display:grid; grid-template-columns:80px 1fr; align-items:center; gap:6px; margin-top:2px;';
                
                const label = document.createElement('label');
                label.style.cssText = 'margin:0; font-size:0.7rem; font-weight:bold; color:var(--text-dim);';
                const count = dmpisContainer.children.length + 2;
                label.textContent = `DMPI ${count}`;
                
                const inputWrapper = document.createElement('div');
                inputWrapper.style.cssText = 'display:flex; gap:4px; align-items:center; width:100%;';
                
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'nineline-dmpi-input';
                input.value = val;
                input.style.cssText = 'flex:1; padding:3px 7px; font-size:0.8rem; font-family:monospace; color:#00ff00; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.15); border-radius:4px;';
                
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
                removeBtn.style.cssText = 'padding:4px 8px; font-size:0.75rem; background:rgba(255,0,0,0.2); border:1px solid red; color:red; border-radius:4px; cursor:pointer;';
                removeBtn.addEventListener('click', () => {
                    dmpisContainer.removeChild(row);
                    // Renumber remaining DMPI labels
                    Array.from(dmpisContainer.children).forEach((child, index) => {
                        const childLabel = child.querySelector('label');
                        if (childLabel) childLabel.textContent = `DMPI ${index + 2}`;
                    });
                });
                
                inputWrapper.appendChild(input);
                inputWrapper.appendChild(removeBtn);
                row.appendChild(label);
                row.appendChild(inputWrapper);
                dmpisContainer.appendChild(row);
            };

            // Render existing DMPIs
            if (d.dmpis && Array.isArray(d.dmpis)) {
                d.dmpis.forEach(val => createDmpiInputRow(val));
            }

            // Bind the + DMPI button
            const addDmpiBtn = document.getElementById('add-nineline-dmpi-btn');
            if (addDmpiBtn) {
                const newAddDmpiBtn = addDmpiBtn.cloneNode(true);
                addDmpiBtn.parentNode.replaceChild(newAddDmpiBtn, addDmpiBtn);
                newAddDmpiBtn.addEventListener('click', () => {
                    createDmpiInputRow('');
                });
            }

            // Bind the + DMPI (Mapa) button
            const addDmpiMapBtn = document.getElementById('add-nineline-dmpi-map-btn');
            if (addDmpiMapBtn) {
                const newAddDmpiMapBtn = addDmpiMapBtn.cloneNode(true);
                addDmpiMapBtn.parentNode.replaceChild(newAddDmpiMapBtn, addDmpiMapBtn);
                newAddDmpiMapBtn.addEventListener('click', () => {
                    // Temporarily save 9-line data to avoid losing other unsaved edits before selecting on map
                    saveNineLineData();
                    window.activeDmpiTargetPt = currentNineLinePt;
                    window.dmpiMapSelectionActive = true;
                    nineLineModal.style.display = 'none';
                    document.getElementById('map').style.cursor = 'crosshair';
                });
            }
        }

        const timesyncChk = document.getElementById('nineline-timesync-chk');
        if (timesyncChk) {
            timesyncChk.checked = !!pt.timeSyncEnabled;
        }

        nineLineModal.style.display = 'flex';
    }

    function saveNineLineData() {
        if (!currentNineLinePt) return;
        try {
            const timesyncChk = document.getElementById('nineline-timesync-chk');
            if (timesyncChk) {
                currentNineLinePt.timeSyncEnabled = timesyncChk.checked;
            }
            currentNineLinePt.ninelineData = {
                atkId: document.getElementById('nineline-atk-id').value,
                time: document.getElementById('nineline-time').value,
                type: document.getElementById('nineline-type').value,
                method: document.getElementById('nineline-method').value,
                ordnance: document.getElementById('nineline-ordnance').value,
                interv: document.getElementById('nineline-interv').value,
                ip: document.getElementById('nineline-ip').value,
                hdg: document.getElementById('nineline-hdg').value,
                dist: document.getElementById('nineline-dist').value,
                elev: document.getElementById('nineline-elev').value,
                desc: document.getElementById('nineline-desc').value,
                coord: document.getElementById('nineline-coord').value,
                mark: document.getElementById('nineline-mark').value,
                friendly: document.getElementById('nineline-friendly-dist').value ? document.getElementById('nineline-friendly-dist').value + ' ' + document.getElementById('nineline-friendly-dir').value : '',
                egress: document.getElementById('nineline-egress').value,
                rmk: document.getElementById('nineline-rmk').value,
                restric: document.getElementById('nineline-restric').value,
                axisHdg: document.getElementById('nineline-axis-hdg').value,
                axisMin: document.getElementById('nineline-axis-min').value,
                axisMax: document.getElementById('nineline-axis-max').value,
                axisType: document.getElementById('nineline-axis-type').value,
                axisRc: document.getElementById('nineline-axis-rc').checked,
                f2f_f: document.getElementById('f2f-f').value,
                f2f_r: document.getElementById('f2f-r').value,
                f2f_o: document.getElementById('f2f-o').value,
                f2f_t: document.getElementById('f2f-t').value,
                f2f_i: document.getElementById('f2f-i').value,
                f2f_e: document.getElementById('f2f-e').value,
                f2f_s: document.getElementById('f2f-s').value,
                bda: document.getElementById('nineline-bda').value
            };
            
            // Read and save DMPI inputs
            const dmpiInputs = document.querySelectorAll('.nineline-dmpi-input');
            if (dmpiInputs) {
                const dmpis = Array.from(dmpiInputs).map(inp => inp.value.trim()).filter(val => val !== '');
                currentNineLinePt.ninelineData.dmpis = dmpis;
            }
            
            // Re-render DMPI markers on the map
            if (typeof drawTargetDmpis === 'function') {
                drawTargetDmpis(currentNineLinePt);
            }
            
            // Apply time sync immediately if enabled
            if (typeof checkTargetsTimeSync === 'function') {
                checkTargetsTimeSync();
            }

            updateCasSummary(currentNineLinePt);
            if (typeof drawFriendlyPosition === 'function') drawFriendlyPosition(currentNineLinePt, map);
            if (typeof drawAttackAxis === 'function') drawAttackAxis(currentNineLinePt, map);
        } catch (error) {
            alert("Erro ao salvar 9-Line: " + error.message);
        }
    }

    // Settings Modal Logic
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModalOverlay = document.getElementById('settings-modal-overlay');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    if (settingsBtn && settingsModalOverlay && closeSettingsBtn) {
        settingsBtn.addEventListener('click', () => {
            settingsModalOverlay.style.display = 'flex';
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsModalOverlay.style.display = 'none';
        });

        // Tabs Logic inside Settings
        const settingsTabBtns = document.querySelectorAll('.settings-tab-btn');
        const settingsTabContents = document.querySelectorAll('.settings-tab-content');

        settingsTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                settingsTabBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.color = 'var(--text-dim)';
                });
                settingsTabContents.forEach(c => c.style.display = 'none');

                btn.classList.add('active');
                btn.style.color = 'var(--primary)';
                const targetId = btn.getAttribute('data-target');
                document.getElementById(targetId).style.display = 'block';
            });
        });

        // Save Scenario Logic
        const btnSaveScenario = document.getElementById('btn-save-scenario');
        btnSaveScenario.addEventListener('click', () => {
            try {
                const exportTacticalPoints = [];
                ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats', 'scenario'].forEach(mode => {
                    if(tacticalPoints[mode]) {
                        tacticalPoints[mode].forEach(p => {
                            if (mode === 'scenario') {
                                exportTacticalPoints.push({
                                    id: p.id,
                                    mode: mode,
                                    name: p.name,
                                    type: p.type,
                                    geoData: p.geoData,
                                    color: p.color,
                                    fill: p.fill,
                                    fillColor: p.fillColor,
                                    fillOpacity: p.fillOpacity,
                                    visible: p.visible
                                });
                            } else {
                                const exportItem = {
                                    id: p.id,
                                    mode: mode,
                                    lat: p.latlng ? p.latlng.lat : undefined,
                                    lng: p.latlng ? p.latlng.lng : undefined,
                                    name: p.name,
                                    ninelineData: p.ninelineData || null
                                };
                                if (mode === 'targets') {
                                    exportItem.showPolygon = p.showPolygon;
                                    exportItem.timeSyncEnabled = p.timeSyncEnabled;
                                    exportItem.visible = p.visible !== false;
                                    exportItem.customPolygonPoints = p.customPolygonPoints ? p.customPolygonPoints.map(pt => ({lat: pt.lat, lng: pt.lng})) : null;
                                }
                                if (mode === 'threats') {
                                    exportItem.radiusNM = p.radiusNM !== undefined ? p.radiusNM : 2.0;
                                }
                                if (mode === 'artillery') {
                                    exportItem.gtl = p.gtl;
                                    exportItem.range = p.range;
                                    exportItem.rangeUnit = p.rangeUnit;
                                    exportItem.maxOrd = p.maxOrd;
                                    exportItem.startTime = p.startTime;
                                    exportItem.endTime = p.endTime;
                                    exportItem.timeSyncEnabled = p.timeSyncEnabled;
                                    exportItem.artilleryType = p.artilleryType;
                                    exportItem.impactCoords = p.impactCoords;
                                    exportItem.cadence = p.cadence;
                                    // Advanced artillery fields
                                    exportItem.startTime2 = p.startTime2;
                                    exportItem.endTime2 = p.endTime2;
                                    exportItem.startTime3 = p.startTime3;
                                    exportItem.endTime3 = p.endTime3;
                                    exportItem.structure = p.structure;
                                    exportItem.artilleryName = p.artilleryName;
                                }
                                exportTacticalPoints.push(exportItem);
                            }
                        });
                    }
                });

                const exportEmployments = savedEmployments.map(emp => {
                    const { layerGroup, ...rest } = emp;
                    return rest;
                });

                const exportTracks = (typeof window.getLoadedTracks === 'function') ? window.getLoadedTracks() : [];
                const exportPlayers = (typeof window.getExportedPlayers === 'function') ? window.getExportedPlayers() : [];

                const fullExport = {
                    version: "2.0",
                    tacticalPoints: exportTacticalPoints,
                    employments: exportEmployments,
                    tracks: exportTracks,
                    players: exportPlayers
                };
                
                const dataStr = JSON.stringify(fullExport, null, 2);
                const blob = new Blob([dataStr], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                let defaultName = "Cenario_PDE";
                let filename = prompt("Digite o nome para salvar o cenário:", defaultName);
                if (filename === null) {
                    URL.revokeObjectURL(url);
                    return; // Usuário cancelou
                }
                filename = filename.trim();
                if (filename === "") filename = defaultName;
                if (!filename.toLowerCase().endsWith(".txt")) filename += ".txt";

                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
                URL.revokeObjectURL(url);
                
            } catch (e) {
                alert('Erro ao salvar cenário: ' + e.message);
            }
        });

        // Load Scenario Logic
        const btnLoadScenario = document.getElementById('btn-load-scenario');
        const fileInput = document.getElementById('load-scenario-file');
        btnLoadScenario.addEventListener('click', () => {
            if (!fileInput.files || fileInput.files.length === 0) {
                alert('Selecione um arquivo .txt primeiro!');
                return;
            }
            
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const loadedData = JSON.parse(e.target.result);
                    
                    let loadedPoints = [];
                    let loadedEmployments = [];
                    let loadedTracks = [];
                    let loadedPlayers = [];
                    
                    if (loadedData && loadedData.version === "2.0") {
                        loadedPoints = loadedData.tacticalPoints || [];
                        loadedEmployments = loadedData.employments || [];
                        loadedTracks = loadedData.tracks || [];
                        loadedPlayers = loadedData.players || [];
                    } else if (Array.isArray(loadedData)) {
                        loadedPoints = loadedData;
                    } else {
                        throw new Error('Formato de arquivo inválido.');
                    }
                    
                    // Clear current map
                    ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats'].forEach(mode => {
                        if(tacticalPoints[mode]) {
                            tacticalPoints[mode].forEach(p => {
                                if (p.marker) map.removeLayer(p.marker);
                                if (p.circle) map.removeLayer(p.circle);
                                if (p.axisGroup) map.removeLayer(p.axisGroup);
                                if (p.friendlyGroup) map.removeLayer(p.friendlyGroup);
                                if (p.impactLine) map.removeLayer(p.impactLine);
                                if (p.impactMarker) map.removeLayer(p.impactMarker);
                                if (p.bombCircle) map.removeLayer(p.bombCircle);
                                if (p.rocketCircle) map.removeLayer(p.rocketCircle);
                                if (p.bulletsCircle) map.removeLayer(p.bulletsCircle);
                                if (p.activeGreenLine) map.removeLayer(p.activeGreenLine);
                                if (p.corridorLines) p.corridorLines.forEach(l => map.removeLayer(l));
                                if (p.corridorPolygon) map.removeLayer(p.corridorPolygon);
                                if (p.cannonMarkers) p.cannonMarkers.forEach(m => map.removeLayer(m));
                                if (p.batteryPolygon) map.removeLayer(p.batteryPolygon);
                                if (p.impactPolygon) map.removeLayer(p.impactPolygon);
                                if (p.projectileMarkers) {
                                    p.projectileMarkers.forEach(m => map.removeLayer(m));
                                }
                                if (p.blastCircles) {
                                    p.blastCircles.forEach(c => map.removeLayer(c));
                                }
                            });
                            tacticalPoints[mode] = [];
                        }
                    });
                    if (tacticalPoints['scenario']) {
                        tacticalPoints['scenario'].forEach(p => {
                            if (p.layer && map) map.removeLayer(p.layer);
                        });
                        tacticalPoints['scenario'] = [];
                    }
                    
                    // Clear all extra components
                    if (typeof window.clearAllEmployments === 'function') window.clearAllEmployments();
                    if (typeof window.clearAllTracks === 'function') window.clearAllTracks();
                    if (typeof window.clearAllPlayers === 'function') window.clearAllPlayers();

                    if (typeof window.renderScenarioList === 'function') window.renderScenarioList();
                    
                    selectedTacticalPoint = null;
                    document.getElementById('cas-summary-container').innerHTML = '';
                    
                    if (typeof window.checkFloatingNineLine === 'function') window.checkFloatingNineLine();
                    
                    // Import points
                    loadedPoints.forEach(pData => {
                        if (pData.mode === 'scenario') {
                            const newPt = {
                                id: pData.id,
                                name: pData.name,
                                mode: 'scenario',
                                type: pData.type,
                                geoData: pData.geoData,
                                color: pData.color,
                                fill: pData.fill,
                                fillColor: pData.fillColor,
                                fillOpacity: pData.fillOpacity,
                                visible: pData.visible !== false,
                                layer: null
                            };
                            if (typeof window.rebuildScenarioLayer === 'function') {
                                newPt.layer = window.rebuildScenarioLayer(newPt);
                                if (typeof window.bindScenarioEditPopup === 'function') {
                                    window.bindScenarioEditPopup(newPt);
                                }
                            }
                            if (!tacticalPoints['scenario']) tacticalPoints['scenario'] = [];
                            tacticalPoints['scenario'].push(newPt);
                            return;
                        }

                        if (pData.lat === undefined || pData.lng === undefined) {
                            console.warn("Ponto tático ignorado pois não possui coordenadas válidas:", pData);
                            return;
                        }

                        const newPt = {
                            id: pData.id,
                            name: pData.name || 'WPT',
                            latlng: L.latLng(pData.lat, pData.lng),
                            ninelineData: pData.ninelineData,
                            mode: pData.mode
                        };
                        if (pData.mode === 'artillery') {
                            newPt.gtl = pData.gtl;
                            newPt.range = pData.range;
                            newPt.rangeUnit = pData.rangeUnit;
                            newPt.maxOrd = pData.maxOrd;
                            newPt.startTime = pData.startTime;
                            newPt.endTime = pData.endTime;
                            newPt.timeSyncEnabled = pData.timeSyncEnabled;
                            newPt.artilleryType = pData.artilleryType;
                            newPt.impactCoords = pData.impactCoords || '';
                            newPt.cadence = pData.cadence || 3;
                            // Advanced artillery fields
                            newPt.startTime2 = pData.startTime2;
                            newPt.endTime2 = pData.endTime2;
                            newPt.startTime3 = pData.startTime3;
                            newPt.endTime3 = pData.endTime3;
                            newPt.structure = pData.structure;
                            newPt.artilleryName = pData.artilleryName;
                        }
                        if (pData.mode === 'targets') {
                            newPt.showPolygon = pData.showPolygon;
                            newPt.timeSyncEnabled = pData.timeSyncEnabled;
                            newPt.visible = pData.visible !== false;
                            if (pData.customPolygonPoints) {
                                newPt.customPolygonPoints = pData.customPolygonPoints.map(pt => ({ lat: pt.lat, lng: pt.lng }));
                                newPt.customPolygonLayer = L.polygon(newPt.customPolygonPoints, {
                                    color: 'red', fillColor: 'red', fillOpacity: 0.15, weight: 2, dashArray: '5, 5'
                                });
                                if (newPt.showPolygon !== false) {
                                    newPt.customPolygonLayer.addTo(map);
                                }
                            }
                            if (typeof drawTargetDmpis === 'function') {
                                drawTargetDmpis(newPt);
                            }
                        }
                        if (pData.mode === 'threats') {
                            newPt.radiusNM = pData.radiusNM !== undefined ? pData.radiusNM : 2.0;
                            newPt.circle = L.circle(newPt.latlng, { radius: newPt.radiusNM * 1852, color: 'red', fillOpacity: 0.1, dashArray: '5, 5' });
                            if (document.getElementById('show-threats-list') && document.getElementById('show-threats-list').checked) {
                                newPt.circle.addTo(map);
                            }
                        }
                        
                        const icon = getHollowIcon(pData.mode);
                        
                        const marker = L.marker(newPt.latlng, { icon, draggable: true }).addTo(map);
                        
                        marker.on('click', () => {
                            if (typeof selectTacticalPoint === 'function') selectTacticalPoint(newPt);
                        });
                        
                        marker.on('dragend', (evt) => {
                            newPt.latlng = evt.target.getLatLng();
                            if (newPt.ninelineData && newPt.ninelineData.coord) {
                                newPt.ninelineData.coord = formatCoords(newPt.latlng, document.getElementById('coord-format').value);
                            }
                            if (pData.mode === 'artillery') {
                                if (typeof drawArtilleryImpact === 'function') drawArtilleryImpact(newPt);
                            }
                            if (selectedTacticalPoint && selectedTacticalPoint.pt && selectedTacticalPoint.pt.id === newPt.id) {
                                if (typeof updateTacticalSelectionUI === 'function') updateTacticalSelectionUI(newPt);
                            }
                        });
                        
                        newPt.marker = marker;
                        
                        if(!tacticalPoints[pData.mode]) tacticalPoints[pData.mode] = [];
                        tacticalPoints[pData.mode].push(newPt);
                        
                        if (newPt.ninelineData) {
                            if (typeof drawFriendlyPosition === 'function') drawFriendlyPosition(newPt, map);
                            if (typeof drawAttackAxis === 'function') drawAttackAxis(newPt, map);
                        }

                        // Immediately draw artillery range footprint if mode is artillery
                        if (pData.mode === 'artillery') {
                            if (typeof drawArtilleryImpact === 'function') drawArtilleryImpact(newPt);
                        }
                    });
                    
                    // Import other components
                    loadedEmployments.forEach(empData => {
                        if (typeof window.loadExportedEmployment === 'function') {
                            window.loadExportedEmployment(empData);
                        }
                    });
                    
                    loadedTracks.forEach(trackData => {
                        if (typeof window.loadExportedTrack === 'function') {
                            window.loadExportedTrack(trackData);
                        }
                    });

                    loadedPlayers.forEach(playerData => {
                        if (typeof window.addPlayerCard === 'function') {
                            window.addPlayerCard(playerData);
                        }
                    });
                    
                    // Update all lists
                    ['waypoints', 'targets', 'artillery', 'navigation', 'friendly', 'threats'].forEach(mode => {
                        if(typeof updateTacticalList === 'function') updateTacticalList(mode);
                    });
                    if (typeof checkTargetsTimeSync === 'function') checkTargetsTimeSync();
                    if (typeof window.renderScenarioList === 'function') window.renderScenarioList();
                    
                    alert(`Cenário carregado com sucesso! ${loadedPoints.length} pontos e outros dados recuperados.`);
                    settingsModalOverlay.style.display = 'none';
                    
                } catch (err) {
                    alert('Erro ao ler o arquivo. Certifique-se que é um arquivo de cenário PDE válido. Detalhes: ' + err.message);
                }
            };
            
            reader.readAsText(file);
        });

    // Load Hawg View Logic
    const btnLoadHawgView = document.getElementById('btn-load-hawgview');
    const fileInputHV = document.getElementById('load-hawgview-file');
    if (btnLoadHawgView && fileInputHV) {
        btnLoadHawgView.addEventListener('click', () => {
            if (!fileInputHV.files || fileInputHV.files.length === 0) {
                alert('Selecione um arquivo .txt do Hawg View primeiro!');
                return;
            }
            const file = fileInputHV.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const hvData = JSON.parse(e.target.result);
                    if (!hvData.markers && !hvData.shapes) {
                        throw new Error('Formato Hawg View inválido.');
                    }
                    
                    let importedCount = 0;
                    
                    // Parse Markers (Targets and IPs)
                    if (hvData.markers) {
                        hvData.markers.forEach(m => {
                            if (!m.point || !m.point.latlng) return;
                            const latlng = L.latLng(m.point.latlng.lat, m.point.latlng.lng);
                            const title = m.title || m.point.name || '';
                            
                            if (m.layer === 'Targets' || title.toUpperCase().includes('TGT')) {
                                if (typeof addTacticalPoint === 'function') addTacticalPoint('targets', latlng, false, title);
                                importedCount++;
                            } else if (m.layer === 'Initial points' || title.toUpperCase() === 'IP') {
                                if (typeof addTacticalPoint === 'function') addTacticalPoint('navigation', latlng, false, title);
                                importedCount++;
                            }
                        });
                    }
                    
                    // Parse Shapes
                    if (hvData.shapes) {
                        hvData.shapes.forEach(s => {
                            if (!s.positions || s.positions.length === 0) return;
                            
                            const newPt = {
                                id: Date.now() + Math.floor(Math.random() * 1000) + importedCount,
                                name: s.title || s.type,
                                mode: 'scenario',
                                color: s.color || '#ffff00',
                                fill: s.fill || '',
                                fillColor: s.color || '#ffff00',
                                fillOpacity: 0.2,
                                visible: s.visible !== false,
                                layer: null
                            };
                            
                            if (s.type === 'Circle') {
                                newPt.type = 'circle';
                                const center = s.positions[0].latlng;
                                const radiusM = (s.radius || 1) * 1852;
                                newPt.geoData = { center: [center.lat, center.lng], radius: radiusM };
                            } else if (s.type === 'Rectangle') {
                                newPt.type = 'square';
                                if (s.positions.length >= 2) {
                                    const bounds = L.latLngBounds(
                                        [s.positions[0].latlng.lat, s.positions[0].latlng.lng],
                                        [s.positions[1].latlng.lat, s.positions[1].latlng.lng]
                                    );
                                    newPt.geoData = { bounds: [[bounds.getSouthWest().lat, bounds.getSouthWest().lng], [bounds.getNorthEast().lat, bounds.getNorthEast().lng]] };
                                } else { return; }
                            } else if (s.type === 'Line') {
                                newPt.type = 'line';
                                newPt.geoData = { points: s.positions.map(p => [p.latlng.lat, p.latlng.lng]) };
                            } else {
                                return; // unsupported shape
                            }
                            
                            if (typeof window.rebuildScenarioLayer === 'function') {
                                newPt.layer = window.rebuildScenarioLayer(newPt);
                            }
                            tacticalPoints['scenario'].push(newPt);
                            importedCount++;
                        });
                        
                        if (typeof window.renderScenarioList === 'function') window.renderScenarioList();
                        else if (typeof updateTacticalList === 'function') updateTacticalList('scenario');
                    }
                    
                    alert(`Hawg View importado com sucesso! ${importedCount} itens carregados.`);
                    const settingsModalOverlay = document.getElementById('settings-modal-overlay');
                    if(settingsModalOverlay) settingsModalOverlay.style.display = 'none';
                    fileInputHV.value = ''; // reset
                } catch (err) {
                    console.error(err);
                    alert('Erro ao carregar arquivo Hawg View: ' + err.message);
                }
            };
            reader.readAsText(file);
        });
    }

    if (magDeclinationInput) {
        magDeclinationInput.addEventListener('input', () => {
            if (typeof updateNorthIndicators === 'function') updateNorthIndicators();
            
            ['targets', 'threats'].forEach(mode => {
                if (tacticalPoints[mode]) {
                    tacticalPoints[mode].forEach(pt => {
                        if (pt.ninelineData) {
                            if (typeof drawFriendlyPosition === 'function') drawFriendlyPosition(pt, map);
                            if (typeof drawAttackAxis === 'function') drawAttackAxis(pt, map);
                        }
                    });
                }
            });
            
            if (tacticalPoints['artillery']) {
                tacticalPoints['artillery'].forEach(pt => {
                    if (typeof drawArtilleryImpact === 'function') drawArtilleryImpact(pt);
                });
            }
        });
    }

    }


    window.map = map;
    window.tacticalPoints = tacticalPoints;

    // --- ARTILLERY EDIT MODAL LOGIC ---
    let currentArtilleryPt = null;
    const artilleryEditModal = document.getElementById('artillery-edit-modal');
    const closeArtilleryModalBtn = document.getElementById('close-artillery-modal-btn');
    const saveArtilleryBtn = document.getElementById('save-artillery-btn');
    const artEditName = document.getElementById('art-edit-name');
    const artEditType = document.getElementById('art-edit-type');
    const artEditStructure = document.getElementById('art-edit-structure');
    const artEditCoords = document.getElementById('art-edit-coords');
    const artEditGtl = document.getElementById('art-edit-gtl');
    const artEditRange = document.getElementById('art-edit-range');
    const artEditRangeUnit = document.getElementById('art-edit-range-unit');
    const artEditMaxOrd = document.getElementById('art-edit-max-ord');
    const artEditStart = document.getElementById('art-edit-start');
    const artEditEnd = document.getElementById('art-edit-end');
    const artEditStart2 = document.getElementById('art-edit-start2');
    const artEditEnd2 = document.getElementById('art-edit-end2');
    const artEditStart3 = document.getElementById('art-edit-start3');
    const artEditEnd3 = document.getElementById('art-edit-end3');
    const artEditCadence = document.getElementById('art-edit-cadence');
    const artEditSync = document.getElementById('art-edit-sync');
    
    const timeInputsList = [
        artEditStart, artEditEnd,
        artEditStart2, artEditEnd2,
        artEditStart3, artEditEnd3
    ];
    timeInputsList.forEach(input => {
        if (!input) return;
        input.addEventListener('input', function() {
            let v = this.value.replace(/\D/g, '');
            if (v.length > 6) v = v.slice(0, 6);
            let formatted = '';
            if (v.length > 0) formatted += v.substring(0, 2);
            if (v.length > 2) formatted += ':' + v.substring(2, 4);
            if (v.length > 4) formatted += ':' + v.substring(4, 6);
            this.value = formatted;
        });
    });
    const artilleryPreviewImage = document.getElementById('artillery-preview-image');

    const artilleryImages = {
        'Outros': 'generic_artillery.jpg',
        'M114': 'm114.jpg',
        'Astros II': 'astros.jpg',
        'L118': 'l118.jpg',
        'M109': 'm109.jpg'
    };

    const artilleryImagePositions = {
        'Outros': 'center 15%',
        'M114': 'center',
        'Astros II': 'center 85%',
        'L118': 'center',
        'M109': 'center'
    };

    if (artEditType && artilleryPreviewImage) {
        artEditType.addEventListener('change', () => {
            const typeVal = artEditType.value;
            artilleryPreviewImage.src = artilleryImages[typeVal] || 'generic_artillery.jpg';
            artilleryPreviewImage.style.objectPosition = artilleryImagePositions[typeVal] || 'center';
        });
    }

    if (closeArtilleryModalBtn) {
        closeArtilleryModalBtn.addEventListener('click', () => {
            saveArtilleryData();
            artilleryEditModal.style.display = 'none';
        });
    }

    if (saveArtilleryBtn) {
        saveArtilleryBtn.addEventListener('click', () => {
            saveArtilleryData();
            artilleryEditModal.style.display = 'none';
        });
    }

    if (artilleryEditModal) {
        artilleryEditModal.addEventListener('click', (e) => {
            if (e.target === artilleryEditModal) {
                saveArtilleryData();
                artilleryEditModal.style.display = 'none';
            }
        });
    }

    function syncModalToPt() {
        if (!currentArtilleryPt) return;
        if (artEditName) currentArtilleryPt.artilleryName = artEditName.value;
        currentArtilleryPt.artilleryType = artEditType.value;
        if (artEditStructure) currentArtilleryPt.structure = artEditStructure.value;
        currentArtilleryPt.gtl = parseFloat(artEditGtl.value) || 0;
        currentArtilleryPt.range = parseFloat(artEditRange.value) || 0;
        currentArtilleryPt.rangeUnit = artEditRangeUnit.value;
        currentArtilleryPt.maxOrd = parseFloat(artEditMaxOrd.value) || 0;
        currentArtilleryPt.startTime = artEditStart.value;
        currentArtilleryPt.endTime = artEditEnd.value;
        currentArtilleryPt.startTime2 = artEditStart2.value;
        currentArtilleryPt.endTime2 = artEditEnd2.value;
        currentArtilleryPt.startTime3 = artEditStart3.value;
        currentArtilleryPt.endTime3 = artEditEnd3.value;
        currentArtilleryPt.cadence = parseFloat(artEditCadence.value) || 3;
        currentArtilleryPt.timeSyncEnabled = artEditSync.checked;
        currentArtilleryPt.impactCoords = artEditCoords ? artEditCoords.value.trim() : '';

        // Recalculate impact coordinates from GTL + Range only if GTL or Range inputs are currently being edited by the user
        const activeEl = document.activeElement;
        const isEditingGtlOrRange = (activeEl === artEditGtl || activeEl === artEditRange || activeEl === artEditRangeUnit);
        if (artEditCoords && isEditingGtlOrRange) {
            const magDec = parseFloat(document.getElementById('mag-declination').value || 0);
            let rangeMeters = currentArtilleryPt.range;
            if (currentArtilleryPt.rangeUnit === 'NM') {
                rangeMeters = currentArtilleryPt.range * 1852;
            }
            const trueHeading = (currentArtilleryPt.gtl + magDec + 360) % 360;
            const rad = (trueHeading * Math.PI) / 180;
            const distDegLat = (rangeMeters / 111111) * Math.cos(rad);
            const distDegLng = (rangeMeters / (111111 * Math.cos(currentArtilleryPt.latlng.lat * Math.PI / 180))) * Math.sin(rad);
            const impactLatLng = L.latLng(currentArtilleryPt.latlng.lat + distDegLat, currentArtilleryPt.latlng.lng + distDegLng);
            try {
                if (window.mgrs && typeof window.mgrs.forward === 'function') {
                    const m = window.mgrs.forward([impactLatLng.lng, impactLatLng.lat]);
                    const formattedMGRS = m.replace(/^(\d+[A-Z])([A-Z]{2})(\d{5})(\d{5})$/, '$1 $2 $3 $4');
                    artEditCoords.value = formattedMGRS;
                    currentArtilleryPt.impactCoords = formattedMGRS;
                }
            } catch(e) {}
        }

        // Redraw the impact line/marker with updated parameters
        drawArtilleryImpact(currentArtilleryPt);

        // Find and update the inputs in the sidebar list so they match in real-time
        const listContainer = document.getElementById('artillery-list');
        if (listContainer) {
            const items = Array.from(listContainer.children);
            const idx = tacticalPoints.artillery.findIndex(x => x.id === currentArtilleryPt.id);
            if (idx !== -1 && items[idx]) {
                const itemEl = items[idx];
                const gtlIn = itemEl.querySelector('input[placeholder="GTL (Mag)"]');
                if (gtlIn) gtlIn.value = currentArtilleryPt.gtl || '';
                const rangeIn = itemEl.querySelector('input[placeholder^="Range"]');
                if (rangeIn) {
                    rangeIn.value = currentArtilleryPt.range || '';
                    rangeIn.placeholder = currentArtilleryPt.rangeUnit === 'NM' ? 'Range (NM)' : 'Range (m)';
                }
            }
        }
    }

    if (artEditCoords) {
        artEditCoords.addEventListener('change', () => {
            const coordsVal = artEditCoords.value.trim();
            const impactLatLng = parseCoordsToLatLng(coordsVal);
            if (impactLatLng && currentArtilleryPt) {
                const stats = calculateGtlAndRange(currentArtilleryPt.latlng, impactLatLng);
                let finalRange = stats.range;
                if (artEditRangeUnit.value === 'NM') {
                    finalRange = parseFloat((stats.range / 1852).toFixed(1));
                } else {
                    finalRange = Math.round(stats.range);
                }
                
                artEditGtl.value = stats.gtl;
                artEditRange.value = finalRange;
                
                currentArtilleryPt.gtl = stats.gtl;
                currentArtilleryPt.range = finalRange;
                currentArtilleryPt.impactCoords = coordsVal;
                
                syncModalToPt();
            }
        });
    }

    [artEditName, artEditType, artEditStructure, artEditGtl, artEditRange, artEditRangeUnit, artEditMaxOrd, artEditStart, artEditEnd, artEditStart2, artEditEnd2, artEditStart3, artEditEnd3, artEditCadence, artEditSync].forEach(input => {
        if (input) {
            input.addEventListener('input', syncModalToPt);
            input.addEventListener('change', syncModalToPt);
        }
    });

    function openArtilleryModal(pt) {
        currentArtilleryPt = pt;
        
        if (artEditName) artEditName.value = pt.artilleryName || '';
        artEditType.value = pt.artilleryType || 'Outros';
        if (artEditStructure) artEditStructure.value = pt.structure || 'Bateria';
        artilleryPreviewImage.src = artilleryImages[artEditType.value] || 'generic_artillery.jpg';
        artilleryPreviewImage.style.objectPosition = artilleryImagePositions[artEditType.value] || 'center';
        
        artEditGtl.value = pt.gtl || '';
        artEditRange.value = pt.range || '';
        artEditRangeUnit.value = pt.rangeUnit || 'm';
        artEditMaxOrd.value = pt.maxOrd || '';
        artEditStart.value = pt.startTime || '';
        artEditEnd.value = pt.endTime || '';
        artEditStart2.value = pt.startTime2 || '';
        artEditEnd2.value = pt.endTime2 || '';
        artEditStart3.value = pt.startTime3 || '';
        artEditEnd3.value = pt.endTime3 || '';
        artEditCadence.value = pt.cadence || 3;
        artEditSync.checked = !!pt.timeSyncEnabled;

        // Load or pre-calculate MGRS coordinates
        if (!pt.impactCoords && pt.gtl && pt.range) {
            const magDec = parseFloat(document.getElementById('mag-declination').value || 0);
            let rangeMeters = pt.range;
            if (pt.rangeUnit === 'NM') rangeMeters = pt.range * 1852;
            const trueHeading = (pt.gtl + magDec + 360) % 360;
            const rad = (trueHeading * Math.PI) / 180;
            const distDegLat = (rangeMeters / 111111) * Math.cos(rad);
            const distDegLng = (rangeMeters / (111111 * Math.cos(pt.latlng.lat * Math.PI / 180))) * Math.sin(rad);
            const impactLatLng = L.latLng(pt.latlng.lat + distDegLat, pt.latlng.lng + distDegLng);
            try {
                if (window.mgrs && typeof window.mgrs.forward === 'function') {
                    const m = window.mgrs.forward([impactLatLng.lng, impactLatLng.lat]);
                    pt.impactCoords = m.replace(/^(\d+[A-Z])([A-Z]{2})(\d{5})(\d{5})$/, '$1 $2 $3 $4');
                }
            } catch(e) {}
        }
        artEditCoords.value = pt.impactCoords || '';

        artilleryEditModal.style.display = 'flex';
    }

    function saveArtilleryData() {
        if (!currentArtilleryPt) return;
        syncModalToPt();
        updateTacticalList('artillery');
    }

    window.syncEmploymentColorsWithTracks = function() {
        if (!savedEmployments || savedEmployments.length === 0) return;
        
        const tracks = (typeof window.getLoadedTracks === 'function') ? window.getLoadedTracks() : [];
        if (tracks.length === 0) return;

        let changed = false;
        savedEmployments.forEach(emp => {
            if (!emp.trigraph) return;
            const cleanTri = emp.trigraph.trim().toUpperCase().substring(0, 3);
            
            // Find a matching track
            const matchingTrack = tracks.find(track => {
                let trackTri = track.name;
                if (trackTri.includes('.')) {
                    trackTri = trackTri.split('.')[0];
                }
                trackTri = trackTri.trim().toUpperCase();
                const cleanTrackTri = trackTri.substring(0, 3);
                return cleanTrackTri === cleanTri || trackTri.startsWith(cleanTri) || cleanTri.startsWith(trackTri);
            });

            if (matchingTrack && emp.color !== matchingTrack.color) {
                const newColor = matchingTrack.color;
                emp.color = newColor;
                if (emp.layerGroup) {
                    emp.layerGroup.eachLayer(layer => {
                        if (layer.setStyle) {
                            layer.setStyle({ color: newColor, fillColor: newColor });
                        }
                    });
                }
                changed = true;
            }
        });

        if (changed) {
            renderEmploymentList();
            if (typeof window.updateDebriefEmpregosUI === 'function') {
                window.updateDebriefEmpregosUI();
            }
        }
    };

    // Expor globalmente para manter compatibilidade
    window.openArtilleryModal = openArtilleryModal;
    window.saveArtilleryData = saveArtilleryData;
});
function updateCasSummary(pt) {
    const container = document.getElementById('cas-summary-container');
    const floatingContent = document.getElementById('floating-9line-content');
    
    if (!container) return;
    
    if (!pt || !pt.ninelineData) {
        container.innerHTML = '<div style="color:var(--text-dim); text-align:center; padding: 10px; font-size: 0.8rem; font-style:italic;">Selecione um alvo com 9-Line para visualizar o resumo.</div>';
        if (floatingContent) floatingContent.innerHTML = '';
        if (typeof window.checkFloatingNineLine === 'function') window.checkFloatingNineLine();
        return;
    }
    
    const d = pt.ninelineData;
    
    const htmlContent = `
        <div style="border-bottom: 1px solid rgba(0, 210, 255, 0.3); padding-bottom: 5px; margin-bottom: 5px; display: flex; justify-content: space-between; font-weight: bold; color: var(--primary);">
            <span><i class="fa-solid fa-clipboard-list"></i> 9-LINE SUMMARY ${d.time ? `(${d.time})` : ''}</span>
            <span style="color: #00ff00;">ID: ${d.atkId || '-'}</span>
        </div>
        <div style="display: grid; grid-template-columns: 20px 1fr; gap: 2px; font-size: 0.8rem; text-align: left;">
            <span style="color:var(--text-dim); font-weight:bold;">1.</span> <span>${d.ip || '-'}</span>
            <span style="color:var(--text-dim); font-weight:bold;">2.</span> <span>${d.hdg || '-'}</span>
            <span style="color:var(--text-dim); font-weight:bold;">3.</span> <span>${d.dist || '-'}</span>
            <span style="color:var(--primary); font-weight:bold;">4.</span> <span style="color:var(--primary);">${d.elev || '-'}</span>
            <span style="color:var(--text-dim); font-weight:bold;">5.</span> <span>${d.desc || '-'}</span>
            <span style="color:#00ff00; font-weight:bold;">6.</span> <span style="color:#00ff00; font-family:monospace;">${d.coord || '-'}</span>
            <span style="color:var(--text-dim); font-weight:bold;">7.</span> <span>${d.mark || '-'}</span>
            <span style="color:var(--text-dim); font-weight:bold;">8.</span> <span>${d.friendly || '-'}</span>
            <span style="color:var(--text-dim); font-weight:bold;">9.</span> <span>${d.egress || '-'}</span>
        </div>
        <div style="margin-top: 5px; padding-top: 5px; border-top: 1px dashed rgba(255,255,255,0.1); font-size: 0.75rem; text-align: left;">
            <span style="color:var(--text-dim);">RMK:</span> ${d.rmk || '-'}
        </div>
        <div style="margin-top: 2px; font-size: 0.75rem; text-align: left;">
            <span style="color:var(--text-dim);">RESTRIC:</span> ${d.restric || '-'}
        </div>
    `;
    
    container.innerHTML = htmlContent;
    if (floatingContent) {
        floatingContent.innerHTML = htmlContent;
        // Strip the duplicate title since the floating container already has a title
        floatingContent.innerHTML = floatingContent.innerHTML.replace(/<div style="border-bottom: 1px solid rgba.*?<\/div>/s, '');
    }
    
    window.floatingNineLineDismissed = false; // Reset dismissal on new target selection
    if (typeof window.checkFloatingNineLine === 'function') window.checkFloatingNineLine();
}

// Math for drawing friendly position based on distance and bearing
function computeDestinationPoint(lat, lng, distanceMeters, bearingDegrees) {
    const R = 6371000; // Earth radius in meters
    const d = distanceMeters;
    const brng = bearingDegrees * Math.PI / 180;
    const lat1 = lat * Math.PI / 180;
    const lon1 = lng * Math.PI / 180;

    let lat2 = Math.asin(Math.sin(lat1) * Math.cos(d / R) + Math.cos(lat1) * Math.sin(d / R) * Math.cos(brng));
    let lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d / R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));

    return L.latLng(lat2 * 180 / Math.PI, lon2 * 180 / Math.PI);
}

const cardinalToDegrees = {
    'N': 0, 'NNE': 22.5, 'NE': 45, 'ENE': 67.5,
    'E': 90, 'ESE': 112.5, 'SE': 135, 'SSE': 157.5,
    'S': 180, 'SSW': 202.5, 'SW': 225, 'WSW': 247.5,
    'W': 270, 'WNW': 292.5, 'NW': 315, 'NNW': 337.5
};

function drawFriendlyPosition(pt, mapObj) {
    if (pt.friendlyDot) {
        mapObj.removeLayer(pt.friendlyDot);
        pt.friendlyDot = null;
    }
    if (pt.friendlyLine) {
        mapObj.removeLayer(pt.friendlyLine);
        pt.friendlyLine = null;
    }

    if (!pt.ninelineData || !pt.ninelineData.friendly) return;
    
    const friendlyStr = pt.ninelineData.friendly.trim().toUpperCase();
    if (!friendlyStr) return;

    // Matches numbers followed by optional space and letters
    const match = friendlyStr.match(/^([\d\.]+)\s*([A-Z]+)$/);
    if (match) {
        const distance = parseFloat(match[1]);
        const direction = match[2];
        let degrees = cardinalToDegrees[direction];
        
        if (degrees === undefined) return; // Invalid direction

        const destLatLng = computeDestinationPoint(pt.latlng.lat, pt.latlng.lng, distance, degrees);

        pt.friendlyDot = L.circleMarker(destLatLng, {
            radius: 4,
            color: '#00aaff',
            fillColor: '#00aaff',
            fillOpacity: 1,
            weight: 1
        }).addTo(mapObj);
        
        pt.friendlyDot.bindTooltip("Friendly: " + friendlyStr);

        pt.friendlyLine = L.polyline([pt.latlng, destLatLng], {
            color: '#00aaff',
            weight: 2,
            dashArray: '4, 4',
            opacity: 0.6
        }).addTo(mapObj);
    }
}
function drawAttackAxis(pt, mapObj) {
    if (pt.axisGroup) {
        mapObj.removeLayer(pt.axisGroup);
        pt.axisGroup = null;
    }

    if (!pt.ninelineData) return;

    const type = pt.ninelineData.axisType || '';
    const rc = pt.ninelineData.axisRc;
    const distance = 1000; // 1000 meters visual length
    const layers = [];

    const magDecStr = document.getElementById('mag-declination') ? document.getElementById('mag-declination').value : "-18";
    const magDec = parseFloat(magDecStr);

    const targetCoords = [];
    if (pt.latlng) {
        targetCoords.push(pt.latlng);
    }
    if (pt.ninelineData.dmpis && Array.isArray(pt.ninelineData.dmpis)) {
        pt.ninelineData.dmpis.forEach(dmpiCoordStr => {
            if (!dmpiCoordStr) return;
            const latlng = parseCoordsToLatLng(dmpiCoordStr);
            if (latlng) {
                targetCoords.push(latlng);
            }
        });
    }

    targetCoords.forEach(coord => {
        if (type === 'JA') {
            const minStr = pt.ninelineData.axisMin ? pt.ninelineData.axisMin.trim() : '';
            const maxStr = pt.ninelineData.axisMax ? pt.ninelineData.axisMax.trim() : '';
            if (!minStr || !maxStr) return;

            const magMin = parseFloat(minStr);
            const magMax = parseFloat(maxStr);
            if (isNaN(magMin) || isNaN(magMax)) return;

            const trueMin = (magMin + magDec + 360) % 360;
            const trueMax = (magMax + magDec + 360) % 360;

            function drawWedge(minHdg, maxHdg) {
                const approachMin = (minHdg + 180) % 360;
                const approachMax = (maxHdg + 180) % 360;
                
                const p1 = computeDestinationPoint(coord.lat, coord.lng, distance, approachMin);
                const p2 = computeDestinationPoint(coord.lat, coord.lng, distance, approachMax);
                
                layers.push(L.polygon([coord, p1, p2], {
                    color: 'red',
                    weight: 1,
                    fillColor: 'red',
                    fillOpacity: 0.15,
                    dashArray: '5, 5'
                }));
                
                layers.push(L.polyline([coord, p1], {
                    color: 'red',
                    weight: 2,
                    opacity: 0.8
                }));
                layers.push(L.polyline([coord, p2], {
                    color: 'red',
                    weight: 2,
                    opacity: 0.8
                }));
            }

            drawWedge(trueMin, trueMax);
            if (rc) {
                drawWedge((trueMin + 180) % 360, (trueMax + 180) % 360);
            }
        } else {
            if (!pt.ninelineData.axisHdg) return;
            const hdgStr = pt.ninelineData.axisHdg.trim();
            if (!hdgStr) return;
            
            const magHdg = parseFloat(hdgStr);
            if (isNaN(magHdg)) return;

            const trueHdg = (magHdg + magDec + 360) % 360;

            function drawConeOrLine(hdg) {
                const approachHdg = (hdg + 180) % 360;
                
                if (type === 'ER' || type === 'EM') {
                    const spread = type === 'ER' ? 30 : 5;
                    const p1 = computeDestinationPoint(coord.lat, coord.lng, distance, (approachHdg - spread + 360) % 360);
                    const p2 = computeDestinationPoint(coord.lat, coord.lng, distance, (approachHdg + spread + 360) % 360);
                    
                    layers.push(L.polygon([coord, p1, p2], {
                        color: 'red',
                        weight: 1,
                        fillColor: 'red',
                        fillOpacity: 0.15,
                        dashArray: '5, 5'
                    }));
                    
                    const pCenter = computeDestinationPoint(coord.lat, coord.lng, distance, approachHdg);
                    layers.push(L.polyline([coord, pCenter], {
                        color: 'red',
                        weight: 2,
                        opacity: 0.8
                    }));
                } else {
                    const pCenter = computeDestinationPoint(coord.lat, coord.lng, distance, approachHdg);
                    layers.push(L.polyline([coord, pCenter], {
                        color: 'red',
                        weight: 2,
                        opacity: 0.8
                    }));
                }
            }

            drawConeOrLine(trueHdg);
            if (rc) {
                drawConeOrLine((trueHdg + 180) % 360);
            }
        }
    });

    if (layers.length > 0) {
        pt.axisGroup = L.featureGroup(layers);
        const currentGlobalTimeMs = (typeof window.getCurrentTelemetryTime === 'function') ? window.getCurrentTelemetryTime() : 0;
        let visible = (pt.visible !== false);
        if (visible && pt.timeSyncEnabled && pt.ninelineData && pt.ninelineData.time) {
            const targetTimeMs = parseTimeStr(pt.ninelineData.time);
            if (targetTimeMs !== null) {
                visible = currentGlobalTimeMs >= targetTimeMs;
            }
        }
        const showGlobal = document.getElementById('show-targets-list') ? document.getElementById('show-targets-list').checked : true;
        if (visible && showGlobal) {
            pt.axisGroup.addTo(mapObj);
        }
    }
}

// Modais e funções auxiliares de artilharia movidos para dentro do DOMContentLoaded.









