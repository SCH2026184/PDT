document.addEventListener('DOMContentLoaded', () => {
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
   const distanceInfo = document.getElementById('distance-info');
   const distM = document.getElementById('dist-m');
   const distFt = document.getElementById('dist-ft');
   const bombQtyInput = document.getElementById('bomb-qty');
   const bombQtyText = document.getElementById('bomb-qty-text');
   const releaseModeSelect = document.getElementById('release-mode');
   const rippleDistInput = document.getElementById('ripple-dist');
   const ameRadiusInput = document.getElementById('ame-radius');
   
   // Novas variaveis para Designacao
   const designationQtyInput = document.getElementById('designation-qty');
   const designationRippleInput = document.getElementById('designation-ripple');
   const legendToggleBtn = document.getElementById('legend-toggle-btn');
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
           setTimeout(() => { if (map) map.invalidateSize(); }, 350);
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
           
           if (coordFormatSelect) {
               if (targetId === 'cas-tab') {
                   coordFormatSelect.value = 'MGRS';
                   coordFormatSelect.dispatchEvent(new Event('change'));
               } else if (targetId === 'ai-tab') {
                   coordFormatSelect.value = 'DMS';
                   coordFormatSelect.dispatchEvent(new Event('change'));
               }
           }
       });
   });

   if (toggleRightPanelBtn && miniMapContainerElem) {
       toggleRightPanelBtn.addEventListener('click', () => {
           miniMapContainerElem.classList.toggle('collapsed');
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
   const targetListContainer = document.getElementById('target-list');
   const showTgtListCheck = document.querySelector('.toggle-visibility-check[data-mode="TARGET"]');
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
   let tgtCreationActive = false; let currentPointMode = null; let tacticalPoints = { 'WAYPOINT': [], 
   let miniMapTargetMarker = null;
   let designationLatLng = null;
   let cachedPdfText = null;
   let savedEmployments = []; // Array de empregos salvos
   let showLegends = true;
   let employmentCounter = 1;
   let editingEmploymentId = null;
   let currentTargetMetadata = null; // metadata de alvo do PDF
   let drawnTargetPolygon = null;
   let drawnTargetMiniPolygon = null;
   let targetPolygonPoints = null; // Coordenadas do polǟ�'�'�gono do alvo
   let targetDrawingActive = false;
   let drawnTargetPoints = [];
   let drawnTargetMarkers = [];
   let drawnTargetPolyline = null;
   
   // Cache de alvos/desenhos por DMPI
   const dmpiTargetsCache = {};
   let currentDmpiId = '1';
   let lastMapMouseLatLng = null;

   // Localizaǟ�'�'�ǟ�'�'�o padrǟ�'�'�o corrigida
   const DEFAULT_LAT = -20.464787;
   const DEFAULT_LNG = -54.664863;

   function initMap() {
       if (map) return;
       const initialDec = parseFloat(document.getElementById('mag-declination') ? 
       map = L.map('map', { 
           center: [DEFAULT_LAT, DEFAULT_LNG], 
           zoom: 17, 
           zoomControl: false, 
           attributionControl: false,
           rotate: true,
           rotateControl: false,
           bearing: -initialDec
       });
       tileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, 
       impactLayer = L.layerGroup().addTo(map);
       gridLayer = L.gridLayer({ tileSize: 256, opacity: 0.2 });
       gridLayer.createTile = function(coords) {
           const tile = document.createElement('div');
           tile.style.outline = '1px solid rgba(255, 255, 255, 0.3)';
           return tile;
       };
       gridLayer.addTo(map);
       map.on('move', () => {
           const center = map.getCenter();
           cursorCoordsVal.textContent = formatCoords(center.lat, center.lng);
       });
       const initialCenter = map.getCenter();
       cursorCoordsVal.textContent = formatCoords(initialCenter.lat, initialCenter.lng);

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
           });
       }



       // Init Mini-map
       miniMap = L.map('mini-map', {
           center: [DEFAULT_LAT, DEFAULT_LNG],
           zoom: 19, // zoom imediatamente inferior ao mǟ�'�'�ximo
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
       miniTileLayer = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 20, 
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

   // Atualiza o limite mǟ�'�'�ximo da AME conforme a unidade selecionada (100m ou 328ft)
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

   pdfjsLib.GlobalWorkerOptions.workerSrc = 

   targetFolderInput.addEventListener('change', async (e) => {
       const file = e.target.files[0];
       if (!file || file.type !== 'application/pdf') {
           document.getElementById('target-folder-name').textContent = "Nenhum arquivo";
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
               
               // Lǟ�'�'� todas as pǟ�'�'�ginas do PDF
               for (let i = 1; i <= pdf.numPages; i++) {
                   const page = await pdf.getPage(i);
                   const textContent = await page.getTextContent();
                   let lastY;
                   for (let item of textContent.items) {
                       if (lastY !== undefined && lastY !== item.transform[5]) fullText += "\n";
                       fullText += item.str + " ";
                       lastY = item.transform[5];
                   }
                   fullText += "\n"; // Quebra de linha entre pǟ�'�'�ginas
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
           targetPolygonPoints: targetPolygonPoints ? targetPolygonPoints.map(pt => L.latLng(pt.lat, 
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
           const triIcon = L.divIcon({ className: 'target-triangle', html: `<svg width="30" height="30" 
           targetMarker = L.marker(targetLatLng, { icon: triIcon }).addTo(map);
           targetMarker.bindTooltip("Alvo");
           if (showLegends) targetMarker.openTooltip();
       }
       
       // Restaura modo de aquisiǟ�'�'�ǟ�'�'�o
       targetAcquisitionSelect.value = cached.acquisitionMode;
       
       // Remove polǟ�'�'�gonos antigos e alǟ�'�'�as
       if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
       if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
       clearDragHandles();
       
       // Restaura pontos do polǟ�'�'�gono
       targetPolygonPoints = cached.targetPolygonPoints ? cached.targetPolygonPoints.map(pt => 
       
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
       
       // Recria marcador de designaǟ�'�'�ǟ�'�'�o
       const desPos = parseInputCoords(cached.designationCoords);
       if (desPos) {
           designationLatLng = L.latLng(desPos.lat, desPos.lng);
           if (designationMarker) map.removeLayer(designationMarker);
           const dIcon = L.divIcon({ className: 'design-marker-icon', html: `<svg width="30" 
           designationMarker = L.marker(designationLatLng, { icon: dIcon }).addTo(map);
           designationMarker.bindTooltip("Designaǟ�'�'�ǟ�'�'�o");
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
       
       // Se nǟ�'�'�o existir no cache, lǟ�'�'� do PDF
       if (!loaded) {
           if (cachedPdfText) {
               findCoordsInText(cachedPdfText, newDmpiId);
           } else {
               // Se nǟ�'�'�o tem PDF e nǟ�'�'�o estǟ�'�'� no cache, limpa a tela para o novo DMPI
               if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = 
               if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
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

       // Padrǟ�'�'�o que identifica PMDI ou DMPI com suporte a espaǟ�'�'�os extras
       const pmdiStr = `P\\s*M\\s*D\\s*I`;
       const dmpiStr = `D\\s*M\\s*P\\s*I`;
       
       // Divide o texto sempre ANTES de um "PMDI", criando "blocos" onde o 1ǟ�?s�'� item ǟ�'�'� o 
       const splitRegex = new RegExp(`(?=${pmdiStr}|${dmpiStr})`, 'ig');
       const chunks = cleanText.split(splitRegex);
       
       // Padrǟ�'�'�o para verificar se o bloco comeǟ�'�'�a com o PMDI que queremos
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
           // Fallback para o documento inteiro caso nǟ�'�'�o ache o PMDI especǟ�'�'�fico (ex: 
           coords = extractCoordsFromText(cleanText);
       }

       // Extrai tipo do alvo e dimensǟ�'�'�es (Sugestǟ�'�'�o 3)
       let targetType = "Alvo";
       let width = 30; // padrǟ�'�'�o
       let length = 20; // padrǟ�'�'�o

       if (/hangar/i.test(matchChunk)) targetType = "Hangar";
       else if (/pista/i.test(matchChunk)) targetType = "Pista";
       else if (/edif/i.test(matchChunk)) targetType = "Edificaǟ�'�'�ǟ�'�'�o";
       else if (/radar|antena/i.test(matchChunk)) targetType = "Radar";
       else if (/deposito/i.test(matchChunk)) targetType = "Depǟ�'�'�sito";
       
       // Procura dimensǟ�'�'�es: ex 30x15m, 120x30, 20 x 20m
       const dimRegex = /\b(\d+)\s*[xX]\s*(\d+)\s*(?:m|metros|meters)?\b/;
       const dimMatch = dimRegex.exec(matchChunk);
       if (dimMatch) {
           width = parseInt(dimMatch[1]);
           length = parseInt(dimMatch[2]);
       } else {
           if (targetType === "Hangar") { width = 30; length = 20; }
           else if (targetType === "Pista") { width = 100; length = 25; }
           else if (targetType === "Edificaǟ�'�'�ǟ�'�'�o") { width = 25; length = 25; }
           else if (targetType === "Radar") { width = 15; length = 15; }
           else if (targetType === "Depǟ�'�'�sito") { width = 40; length = 20; }
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
       console.warn(`Nǟ�'�'�o consegui identificar as coordenadas do DMPI ${dmpiId} no PDF.\n\nVeja o 
   }

   function extractCoordsFromText(tempText) {
       let match;
       let latFound = null;
       let lonFound = null;

       // --- PRIORIDADE 1: DMM (ex: S16ǟ�?s�'�01.433' W049ǟ�?s�'�46.313') ---
       // Prefixo: letra direcional ANTES dos graus
       const dmmPrefixRegex = /([NS])\s*(\d{1,3})[ǟ�?s�'�ǟ�?s�'�]\s*(\d{1,2}[\.,]\d+)['ǟ�ǽ�?s�'
       while ((match = dmmPrefixRegex.exec(tempText)) !== null) {
           const latDir = match[1].toUpperCase();
           const latDeg = match[2];
           const latMin = match[3].replace(',', '.');
           const lonDir = match[4].toUpperCase() === 'O' ? 'W' : match[4].toUpperCase();
           const lonDeg = match[5];
           const lonMin = match[6].replace(',', '.');
           if (!latFound) latFound = { str: `${latDeg}ǟ�?s�'� ${latMin}' ${latDir}`, type: 'DMM' };
           if (!lonFound) lonFound = { str: `${lonDeg}ǟ�?s�'� ${lonMin}' ${lonDir}`, type: 'DMM' };
           break;
       }

       // Tambǟ�'�'�m tenta DMM com lat e lon separadas (fallback)
       if (!latFound || !lonFound) {
           const dmmSingleRegex = 
           while ((match = dmmSingleRegex.exec(tempText)) !== null) {
               const dir = match[1].toUpperCase() === 'O' ? 'W' : match[1].toUpperCase();
               const deg = match[2];
               const min = match[3].replace(',', '.');
               const isLat = ['N', 'S'].includes(dir);
               const isLon = ['E', 'W'].includes(dir);
               if (isLat && !latFound) latFound = { str: `${deg}ǟ�?s�'� ${min}' ${dir}`, type: 'DMM' 
               if (isLon && !lonFound) lonFound = { str: `${deg}ǟ�?s�'� ${min}' ${dir}`, type: 'DMM' 
           }
       }

       // --- PRIORIDADE 2: DMS como fallback (ex: S16ǟ�?s�'�01'26" W049ǟ�?s�'�46'19") ---
       if (!latFound || !lonFound) {
           const dmsRegex = /([NS])\s*(\d{1,3})[ǟ�?s�'�ǟ�?s�'�]\s*(\d{1,2})['ǟ�ǽ�?s�'�]\s*([\d
           while ((match = dmsRegex.exec(tempText)) !== null) {
               const latDir = match[1].toUpperCase();
               const lonDir = match[5].toUpperCase() === 'O' ? 'W' : match[5].toUpperCase();
               if (!latFound) latFound = { str: `${match[2]}ǟ�?s�'� ${match[3]}' 
               if (!lonFound) lonFound = { str: `${match[6]}ǟ�?s�'� ${match[7]}' 
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
       const triIcon = L.divIcon({ className: 'target-triangle', html: `<svg width="30" height="30" 
       targetMarker = L.marker(targetLatLng, { icon: triIcon }).addTo(map);
       targetMarker.bindTooltip("Alvo");
       if (showLegends) targetMarker.openTooltip();

       // Clique duplo no triǟ�'�'�ngulo ativa/desativa modo de arrasto do DMPI
       targetMarker.on('dblclick', (e) => {
           L.DomEvent.stopPropagation(e); // Impede o zoom do mapa
           if (targetMarker.dragging.enabled()) {
               targetMarker.dragging.disable();
               targetMarker.bindTooltip("Alvo");
               if (showLegends) targetMarker.openTooltip();
               
               // Recalcula e salva a nova posiǟ�'�'�ǟ�'�'�o final no cache do DMPI
               updateDistance();
               drawImpactsOnMap();
               saveCurrentDmpiToCache();
           } else {
               targetMarker.dragging.enable();
               targetMarker.bindTooltip("Modo Ediǟ�'�'�ǟ�'�'�o: Arraste o DMPI. Clique duplo para 
           }
       });

       // Suporta movimentaǟ�'�'�ǟ�'�'�o e deslocamento dinǟ�'�'�mico em tempo real
       targetMarker.on('drag', (e) => {
           const newPos = e.target.getLatLng();
           const deltaLat = newPos.lat - targetLatLng.lat;
           const deltaLng = newPos.lng - targetLatLng.lng;
           
           targetLatLng = newPos;
           targetCoordsInput.value = formatCoords(newPos.lat, newPos.lng);
           
           // Se o alvo for manual, translada todos os vǟ�'�'�rtices junto com o DMPI
           if (targetPolygonPoints && targetAcquisitionSelect.value === 'manual') {
               targetPolygonPoints = targetPolygonPoints.map(pt => L.latLng(pt.lat + deltaLat, pt.lng + 
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
                   createAutoTargetPolygon(targetLatLng, currentTargetMetadata.width, 
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
               createAutoTargetPolygon(targetLatLng, currentTargetMetadata.width, 
           } else {
               createAutoTargetPolygon(targetLatLng, 32, 18, "Hangar (Contraste Terreno)");
           }
       } else {
           // Manual mode: remove old polygons if coordinate changes
           if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
           if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
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

   document.querySelectorAll('input[name="ame-unit"]').forEach(radio => 
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
       if (designationMarker) map.removeLayer(designationMarker);
       const dIcon = L.divIcon({ className: 'design-marker-icon', html: <svg width="30" height="30" 
       designationLatLng = L.latLng(center.lat, center.lng);
       designationMarker = L.marker(designationLatLng, { icon: dIcon }).addTo(map);
       designationMarker.bindTooltip("Designa�o");
       if (showLegends) designationMarker.openTooltip();
       updateDistance();
       drawImpactsOnMap();
   });

   function formatCoords(lat, lng) {
       const format = coordFormatSelect.value;
       if (format === 'DEC') return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
       if (format === 'DMM') return toDMM(lat, lng);
       if (format === 'DMS') return toDMS(lat, lng);
       if (format === 'MGRS') { 
           try { 
               const m = mgrs.forward([lng, lat]);
               const match = m.match(/^(\d+[A-Z])([A-Z]{2})(\d+)$/);
               if (match) {
                   const gzd = match[1];
                   const sq = match[2];
                   const nums = match[3];
                   const half = nums.length / 2;
                   const e = nums.substring(0, half);
                   const n = nums.substring(half);
                   return `${gzd} ${sq} ${e} ${n}`;
               }
               return m;
           } catch(e) { 
               return 'N/A'; 
           } 
       }
       return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
   }

   function toDMM(lat, lng) {
       const latDir = lat >= 0 ? 'N' : 'S', lngDir = lng >= 0 ? 'E' : 'W';
       const absLat = Math.abs(lat), absLng = Math.abs(lng);
       const latDeg = Math.floor(absLat), latMin = ((absLat - latDeg) * 60).toFixed(4);
       const lngDeg = Math.floor(absLng), lngMin = ((absLng - lngDeg) * 60).toFixed(4);
       return `${latDeg}ǟ�?s�'� ${latMin}' ${latDir}, ${lngDeg}ǟ�?s�'� ${lngMin}' ${lngDir}`;
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
       return `${la.d}ǟ�?s�'� ${la.m}' ${la.s}" ${latDir}, ${lo.d}ǟ�?s�'� ${lo.m}' ${lo.s}" 
   }

   // PARSER UNIVERSAL SEGURO
   function parseInputCoords(input) {
       if (!input) return null;
       const format = coordFormatSelect.value;
       if (format === 'MGRS') {
           try { const lonlat = mgrs.toPoint(input.trim().replace(/\s+/g, '')); return { lat: 
       }

       const parts = input.split(',').map(p => p.trim());
       if (parts.length !== 2) return null;

       const parseSingle = (str) => {
           str = str.toUpperCase().trim();
           let val = NaN;
           let dir = '';

           const dmsPrefix = str.match(/([NSEWO])\s*(\d+)[ǟ�?s�'�\s-]+(\d+)['\s-]+([\d.,]+)"?/i);
           const dmsPostfix = str.match(/(\d+)[ǟ�?s�'�\s-]+(\d+)['\s-]+([\d.,]+)"?\s*([NSEWO])/i);
           const dmmPrefix = str.match(/([NSEWO])\s*(\d+)[ǟ�?s�'�\s-]+([\d.,]+)'?/i);
           const dmmPostfix = str.match(/(\d+)[ǟ�?s�'�\s-]+([\d.,]+)'?\s*([NSEWO])/i);
           const dec = str.match(/(-?[\d.]+)/);

           if (dmsPrefix) {
               val = parseInt(dmsPrefix[2]) + (parseInt(dmsPrefix[3]) / 60) + 
               dir = dmsPrefix[1].toUpperCase();
           } else if (dmsPostfix) {
               val = parseInt(dmsPostfix[1]) + (parseInt(dmsPostfix[2]) / 60) + 
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

       // Se o usuǟ�'�'�rio digitou Lon, Lat (Ex: 48 W, 16 S), o sistema inverte para o padrǟ�'�'�o 
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
   showCalculatedCheck.addEventListener('change', drawImpactsOnMap);
   showEffectedCheck.addEventListener('change', drawImpactsOnMap);
   showFragmentationCheck.addEventListener('change', drawImpactsOnMap);
   function updatePlaceholders() {
       const format = coordFormatSelect.value;
       let example = "";
       if (format === 'DMS') example = "Ex: 16ǟ�?s�'� 14' 02\" S, 48ǟ�?s�'� 57' 58\" W";
       else if (format === 'DMM') example = "Ex: 16ǟ�?s�'� 14.043' S, 48ǟ�?s�'� 57.975' W";
       else if (format === 'DEC') example = "Ex: -16.234061, -48.966258";
       else if (format === 'MGRS') example = "Ex: 22L CH 01234 56789";
       
       targetCoordsInput.placeholder = example;
       designationCoordsInput.placeholder = example;
   }

       coordFormatSelect.addEventListener('change', () => {
       const center = map.getCenter();
       cursorCoordsVal.textContent = formatCoords(center.lat, center.lng);
       if (typeof updatePlaceholders === 'function') updatePlaceholders();
       
       if (typeof updateTargetListUI === 'function') updateTargetListUI();
       if (typeof updateTacticalList === 'function') {
           ['WAYPOINT', 'THREAT', 'FRIENDLY', 'ARTILLERY', 'SCENARIO'].forEach(mode => 
       }
   });
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
               createAutoTargetPolygon(targetLatLng, currentTargetMetadata.width, 
           } else {
               createAutoTargetPolygon(targetLatLng, 32, 18, "Hangar (Contraste Terreno)");
           }
       } else if (targetAcquisitionSelect.value === 'manual') {
           if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
           if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
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
               alert("Nenhuma coordenada de designaǟ�'�'�ǟ�'�'�o definida.");
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
                   // Garantir que o selecionado esteja visǟ�'�'�vel
                   if (i === idx) {
                       parsedTelemetryReleasesVisibility[i] = true;
                       const cb = lbl.querySelector('input[type="checkbox"]');
                       if (cb) cb.checked = true;
                   }
               });
           }
       });
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
           const releases = xmlDoc.getElementsByTagName("AG_Release");
           
           parsedXMLReleases = [];
           createdTargets.forEach(t => t.linkedXmlReleaseIndex = null);
           for (let i = 0; i < releases.length; i++) {
               const rel = releases[i];
               const timeUTCNode = rel.getElementsByTagName("UTC")[0] || 
               let timeUTC = timeUTCNode ? timeUTCNode.textContent.trim() : "00:00:00";
               
               // Se vier como milissegundos (ex: 61918700), converter para HH:MM:SS
               if (/^\d+$/.test(timeUTC) && timeUTC.length > 6) {
                   const totalMs = parseInt(timeUTC);
                   const totalSec = Math.floor(totalMs / 1000);
                   const h = Math.floor(totalSec / 3600);
                   const m = Math.floor((totalSec % 3600) / 60);
                   const s = totalSec % 60;
                   timeUTC = 
               }
               
               const weaponNode = rel.getElementsByTagName("Weapon_Type")[0];
               const rawWeapon = weaponNode ? weaponNode.textContent.trim().toUpperCase() : "";
               let mappedWeapon = "-";
               if (rawWeapon) {
                   if (rawWeapon.includes("FG230") || rawWeapon.includes("230")) {
                       mappedWeapon = "BAFG-230";
                   } else if (rawWeapon.includes("FG120") || rawWeapon.includes("120")) {
                       mappedWeapon = "BAFG-120";
                   } else if (rawWeapon.includes("SBAT") || rawWeapon.includes("70") || 
                       mappedWeapon = "SBAT-70";
                   } else if (rawWeapon.includes("GUN") || rawWeapon.includes("INGUN")) {
                       mappedWeapon = "GUNS";
                   } else {
                       mappedWeapon = rawWeapon; // Fallback
                   }
               }
               
               parsedXMLReleases.push({
                   tgtLat: parseFloat(rel.getElementsByTagName("TGT_Lat")[0]?.textContent || 0),
                   tgrLong: parseFloat((rel.getElementsByTagName("TGR_Long")[0] || 
                   trueHeading: parseFloat(rel.getElementsByTagName("True_Heading")[0]?.textContent || 
                   calcMisAL: parseFloat(rel.getElementsByTagName("Calculated_Mis_AL")[0]?.textContent 
                   calcMisAC: parseFloat(rel.getElementsByTagName("Calculated_Mis_AC")[0]?.textContent 
                   timeUTC: timeUTC,
                   wdTitle: trigraph ? `${trigraph} WD${i + 1}` : `WD ${timeUTC}`,
                   quantity: parseInt(rel.getElementsByTagName("Quantity")[0]?.textContent || 0) || 
                   ripple:   parseFloat(rel.getElementsByTagName("Interval")[0]?.textContent || 0) || 
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
                   applyXMLRelease(index);
                   executeSaveEmployment(rel.wdTitle);
               });
               
               // Limpa a telemetria pendente para evitar visualizaǟ�'�'�ǟ�'�'�o duplicada
               parsedXMLReleases = [];
               
               updateTargetListUI();
           } else {
               alert("Nenhum dado de 'AG_Release' encontrado no arquivo XML.");
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
       
       // Conversǟ�'�'�o: valores do XML multiplicar por 180
       const latDeg = rel.tgtLat * 180;
       const lngDeg = rel.tgrLong * 180;
       let headingDeg = rel.trueHeading; // Jǟ�'�'� em graus
       
       // Eixo Magnǟ�'�'�tico = Eixo Verdadeiro - Declinaǟ�'�'�ǟ�'�'�o
       const dec = parseFloat(document.getElementById('mag-declination') ? 
       headingDeg = (headingDeg - dec + 360) % 360;
       
       // Atualizando os campos da Designaǟ�'�'�ǟ�'�'�o (Real)
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
               ameRadiusInput.value = isFt ? Math.min(328, Math.round(valueM * 3.28084 * 10) / 10) : 
           }
       }

       // Quantidade e Ripple do XML (sǟ�'�'� sobrescreve se o XML tiver o dado)
       const desQtyInput = document.getElementById('designation-qty');
       const desRippleInput = document.getElementById('designation-ripple');
       if (rel.quantity !== null && desQtyInput) desQtyInput.value = rel.quantity;
       if (rel.ripple !== null && desRippleInput) desRippleInput.value = rel.ripple;
       
       if (showEffectedCheck) showEffectedCheck.checked = true;

       // Definir designationLatLng globalmente ǟ�ǽ�?s�ǽ�'�? drawImpactsOnMap vai renderizar o 
       designationLatLng = L.latLng(latDeg, lngDeg);
       if (designationMarker) { map.removeLayer(designationMarker); designationMarker = null; }

       drawImpactsOnMap();
   }
   document.getElementById('lat-error').addEventListener('input', drawImpactsOnMap);
   document.getElementById('long-error').addEventListener('input', drawImpactsOnMap);
   if (document.getElementById('designation-qty')) 
   if (document.getElementById('designation-ripple')) 
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
       if (designationMarker) { if (show) designationMarker.openTooltip(); else 
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
                   const dIcon = L.divIcon({ className: 'design-marker-icon', html: `<svg width="30" 
                   designationLatLng = L.latLng(pos.lat, pos.lng);
                   designationMarker = L.marker(designationLatLng, { icon: dIcon }).addTo(map);
                   designationMarker.bindTooltip("Designaǟ�'�'�ǟ�'�'�o");
                   if (showLegends) designationMarker.openTooltip();
                   map.setView(designationLatLng, 18);
               }
               updateDistance();
               drawImpactsOnMap();
           } else { alert('Formato de coordenada invǟ�'�'�lido.'); }
       }
   }

   targetCoordsInput.addEventListener('keypress', (e) => handleEnter(e, 'target'));
   designationCoordsInput.addEventListener('keypress', (e) => handleEnter(e, 'designation'));

   function updateDistance() {
       if (!targetLatLng || !designationLatLng) { distanceInfo.style.display = 'none'; return; }
       const dist = targetLatLng.distanceTo(designationLatLng);
       distanceInfo.style.display = 'block';
       distM.textContent = dist.toFixed(1);
       distFt.textContent = (dist * 3.28084).toFixed(1);
   }

   function saveFormToActiveXMLRelease() {
       if (!targetAcquisitionSelect || targetAcquisitionSelect.value !== 'telemetry') return;
       const idx = parsedXMLReleases.length > 0 ? parseInt(telemetryReleaseSelect.value || 0) : -1;
       if (idx === -1 || !parsedXMLReleases[idx]) return;
       
       const rel = parsedXMLReleases[idx];
       
       // Coordenadas (em semicǟ�'�'�rculos: graus / 180)
       if (designationLatLng) {
           rel.tgtLat = designationLatLng.lat / 180;
           rel.tgrLong = designationLatLng.lng / 180;
       }
       
       // Eixo Verdadeiro = Eixo Magnǟ�'�'�tico + Declinaǟ�'�'�ǟ�'�'�o
       const desHeadingInput = document.getElementById('designation-heading');
       const dec = parseFloat(document.getElementById('mag-declination') ? 
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
       if (showCalculatedCheck.checked && targetLatLng) { drawEmploymentSet(targetLatLng, heading, 
       if (showEffectedCheck.checked && designationLatLng && editingEmploymentId === null) {
           const desHeadingInput = document.getElementById('designation-heading');
           let desHeading = heading;
           if (desHeadingInput && desHeadingInput.value !== "") {
               desHeading = parseInt(desHeadingInput.value || 0) + dec;
           }
           
           // Le os parametros proprios da designacao, se existirem, senao fallback
           const desQty = designationQtyInput ? parseInt(designationQtyInput.value || 1) : qty;
           const desRipple = designationRippleInput ? parseFloat(designationRippleInput.value || 13) : 
           
           const rad = (desHeading * Math.PI / 180);
           const latErr = parseFloat(document.getElementById('lat-error').value || 0);
           const longErr = parseFloat(document.getElementById('long-error').value || 0);
           const latErrM = latErr * 0.3048;
           const longErrM = longErr * 0.3048;
           const dLatLong = (longErrM * Math.cos(rad)) / 111111;
           const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(designationLatLng.lat * 
           const latHead = (desHeading + 90) % 360;
           const dLatLat = (latErrM * Math.cos(latHead * Math.PI / 180)) / 111111;
           const dLngLat = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * 
           const effectedCenter = L.latLng(designationLatLng.lat + dLatLong + dLatLat, 
           let desWeapon = document.getElementById('designation-weapon')?.value || 'BAFG-230';
           if (desWeapon === '-') desWeapon = weaponSelect.value;
           drawEmploymentSet(effectedCenter, desHeading, desQty, desRipple, ame, '#00ff00', 
       }
       
       // Renderizar outros Empregos XML marcados como visǟ�'�'�veis
       // O ǟ�'�'�ndice ativo ǟ�'�'� sempre o do select quando hǟ�'�'� empregos XML carregados.
       // Nǟ�'�'�o depende da visibilidade do painel (que some quando hǟ�'�'� sǟ�'�'� 1 emprego).
       const activeTelemetryIndex = parsedXMLReleases.length > 0 ? 
       
       parsedXMLReleases.forEach((rel, index) => {
           if (index === activeTelemetryIndex) return; // Jǟ�'�'� ǟ�'�'� renderizado pelo 
           if (!parsedTelemetryReleasesVisibility[index]) return; // Visibilidade desativada
           
           const rLatDeg = rel.tgtLat * 180;
           const rLngDeg = rel.tgrLong * 180;
           
           // Usar Eixo Verdadeiro (True Heading) direto para cǟ�'�'�lculos e 
           const rHeadingDeg = rel.trueHeading;
           
           const rCenter = L.latLng(rLatDeg, rLngDeg);
           
           // Mapeando erro (AL = Longitudinal, AC = Lateral)
           const rLongErrM = rel.calcMisAL * 0.3048; // AL = Longitudinal
           const rLatErrM = rel.calcMisAC * 0.3048;  // AC = Lateral
           
           const rRad = (rHeadingDeg * Math.PI / 180);
           const rLatLong = (rLongErrM * Math.cos(rRad)) / 111111;
           const rLngLong = (rLongErrM * Math.sin(rRad)) / (111111 * Math.cos(rLatDeg * Math.PI / 
           
           const rLatHead = (rHeadingDeg + 90) % 360;
           const rdLatLat = (rLatErrM * Math.cos(rLatHead * Math.PI / 180)) / 111111;
           const rdLngLat = (rLatErrM * Math.sin(rLatHead * Math.PI / 180)) / (111111 * 
           
           const rEffectedCenter = L.latLng(rLatDeg + rLatLong + rdLatLat, rLngDeg + rLngLong + 
           
           const rQty = rel.quantity || 1;
           const rRipple = rel.ripple || 0;
           let rWeapon = rel.weaponType || 'BAFG-230';
           if (rWeapon === '-') rWeapon = weaponSelect.value;
           drawEmploymentSet(rEffectedCenter, rHeadingDeg, rQty, rRipple, ame, '#00ff00', impactLayer, 
       });
       
       // Recalcular eficǟ�'�'�cia do emprego contra o alvo
       validateEmploymentEfficacy();
   }

   function drawEmploymentSet(center, heading, qty, ripple, ame, color, layer, releaseMode = 'SGL', 
       const rad = (heading * Math.PI / 180);
       const lineDist = 100;
       const p1Lat = center.lat - (lineDist * Math.cos(rad)) / 111111;
       const p1Lng = center.lng - (lineDist * Math.sin(rad)) / (111111 * Math.cos(center.lat * Math.PI 
       const p2Lat = center.lat + (lineDist * Math.cos(rad)) / 111111;
       const p2Lng = center.lng + (lineDist * Math.sin(rad)) / (111111 * Math.cos(center.lat * Math.PI 
       
       if (isDesignation) {
           // Padrǟ�'�'�o anterior: linha tracejada, sem seta
           L.polyline([[p1Lat, p1Lng], [p2Lat, p2Lng]], { color: color, weight: 1.5, dashArray: '10, 
       } else {
           // Novo padrǟ�'�'�o (Targeting): linha contǟ�'�'�nua com ponta de seta discreta
           L.polyline([[p1Lat, p1Lng], [p2Lat, p2Lng]], { color: color, weight: 1.5, opacity: 0.8 
           
           const arrowSize = 8; // seta mais discreta
           const arrowAngle1 = (heading + 180 + 30) * Math.PI / 180;
           const arrowAngle2 = (heading + 180 - 30) * Math.PI / 180;
           
           const a1Lat = p2Lat + (arrowSize * Math.cos(arrowAngle1)) / 111111;
           const a1Lng = p2Lng + (arrowSize * Math.sin(arrowAngle1)) / (111111 * Math.cos(center.lat * 
           
           const a2Lat = p2Lat + (arrowSize * Math.cos(arrowAngle2)) / 111111;
           const a2Lng = p2Lng + (arrowSize * Math.sin(arrowAngle2)) / (111111 * Math.cos(center.lat * 
           
           L.polyline([[a1Lat, a1Lng], [p2Lat, p2Lng], [a2Lat, a2Lng]], { color: color, weight: 1.5, 
       }

       const points = getImpactPoints(center, heading, qty, ripple, releaseMode, weapon);

       if (weapon === 'SBAT-70' || weapon === 'GUNS') {
           // Desenha as duas Elipses de Dispersǟ�'�'�o no Leaflet (pods gǟ�'�'�meos)
           let R = ame; 
           let a = 20, b = 6;
           if (weapon === 'SBAT-70') {
               a = R * 10;
               b = R * 3;
           } else if (weapon === 'GUNS') {
               a = R * 20;
               b = R * 5;
           }

           // Calcula os dois centros com afastamento de 2m para cada lado (espaǟ�'�'�amento total 
           const radPerp = ((heading + 90) % 360) * Math.PI / 180;
           const shiftDist = 2; // metros
           const dLat1 = (-shiftDist * Math.cos(radPerp)) / 111111;
           const dLng1 = (-shiftDist * Math.sin(radPerp)) / (111111 * Math.cos(center.lat * Math.PI / 
           const center1 = L.latLng(center.lat + dLat1, center.lng + dLng1);

           const dLat2 = (shiftDist * Math.cos(radPerp)) / 111111;
           const dLng2 = (shiftDist * Math.sin(radPerp)) / (111111 * Math.cos(center.lat * Math.PI / 
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
                   const dLng = (x * Math.sin(rad) + y * Math.cos(rad)) / (111111 * Math.cos(c.lat * 
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
               L.circle([pt.lat, pt.lng], { radius: ame, color: color, fillColor: 'transparent', 
           }
           L.circleMarker([pt.lat, pt.lng], { radius: 2, color: color, fillColor: color, fillOpacity: 
       });
   }

   // ---- SISTEMA DE EMPREGOS SALVOS ----
   const COLORS = ['#00a2ff', '#2ecc71', '#f1c40f', '#a855f7', '#FF6B6B', '#FF922B', '#20C997', 

   function saveEmployment() {
       if (editingEmploymentId !== null) {
           alert('As alteraǟ�'�'�ǟ�'�'�es do emprego atual jǟ�'�'� foram salvas em tempo real. 
           stopEditing();
           return;
       }

       if (!designationLatLng) {
           alert('Por favor, defina a Coordenada de Designaǟ�'�'�ǟ�'�'�o (Resultado Piloto) antes 
           return;
       }
       
       // Open the custom tactical modal instead of prompt
       const defaultSuggestedName = (employmentCounter === 1) ? "ǟ�'�'�?s" : `#${employmentCounter}`;
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
       const color = COLORS[(employmentCounter - 1) % COLORS.length];

       const layerGroup = L.layerGroup().addTo(map);

       // Desenha apenas o emprego correspondente aos dados de RESULTADO PILOTO (Emprego Efetuado / 
       const desHeadingInput = document.getElementById('designation-heading');
       let desHeading = heading;
       let displayHeading = magHeading; // planejado como padrǟ�'�'�o
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
       const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(designationLatLng.lat * 
       const latHead = (desHeading + 90) % 360;
       const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * 
       const effectedCenter = L.latLng(designationLatLng.lat + dLatLong + (latErrM * Math.cos(latHead 
       
       const emp = { 
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
           designationWeaponText: document.getElementById('designation-weapon') ? 
           
           // Persistent Target Area Details
           targetCoordsText: targetCoordsInput.value,
           targetLatLng: targetLatLng ? L.latLng(targetLatLng.lat, targetLatLng.lng) : null,
           targetPolygonPoints: targetPolygonPoints ? targetPolygonPoints.map(pt => L.latLng(pt.lat, 
           currentTargetMetadata: currentTargetMetadata ? { ...currentTargetMetadata } : null,
           targetAcquisition: targetAcquisitionSelect ? targetAcquisitionSelect.value : 'manual',
           targetType: targetTypeSelect ? targetTypeSelect.value : 'infrastructure',
           dmpiValue: document.getElementById('dmpi-id').value,
           targetFolderName: document.getElementById('target-folder-name').textContent
        };
        
       let finalWeapon = emp.designationWeaponText;
       if (!finalWeapon || finalWeapon === '-') finalWeapon = emp.weapon;
        
       drawEmploymentSet(effectedCenter, desHeading, emp.desQty, emp.desRipple, ame, color, 
       savedEmployments.push(emp);
       employmentCounter++;

       // Clear active designation coordinates and marker so temporary green circles disappear
       designationLatLng = null;
       if (designationMarker) {
           map.removeLayer(designationMarker);
           designationMarker = null;
       }
       document.getElementById('designation-coords').value = '';
       if (document.getElementById('designation-weapon')) 
       document.getElementById('lat-error').value = 0;
       document.getElementById('long-error').value = 0;
       document.getElementById('designation-heading').value = '';

       drawImpactsOnMap();
       renderEmploymentList();
   }

   function renderEmploymentList() {
       const list = document.getElementById('employment-list');
       list.innerHTML = '';
       savedEmployments.forEach(emp => {
           const isEditing = emp.id === editingEmploymentId;
           const item = document.createElement('div');
           item.style.cssText = `display:flex; align-items:center; gap:8px; padding:8px; 
               (isEditing 
                   ? 'background:rgba(0, 210, 255, 0.15); border:1px solid var(--primary); 
                   : 'background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);');

           // Go to Employment Button
           const goToBtn = document.createElement('button');
           goToBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
           goToBtn.title = "Ir para o emprego";
           goToBtn.style.cssText = 'background:none; border:none; color:var(--primary); 
           goToBtn.addEventListener('click', (e) => {
               e.stopPropagation();
               if (emp.designationLatLng) {
                   map.setView(emp.designationLatLng, 18, { animate: true });
               } else if (emp.targetLatLng) {
                   map.setView(emp.targetLatLng, 18, { animate: true });
               }
           });
           goToBtn.addEventListener('mouseover', () => goToBtn.style.transform = 'scale(1.2)');
           goToBtn.addEventListener('mouseout', () => goToBtn.style.transform = 'scale(1)');

           // Clickable color dot to change color
           const colorDot = document.createElement('span');
           colorDot.style.cssText = `width:12px; height:12px; border-radius:50%; 
           colorDot.title = "Alterar cor";

           const colorInput = document.createElement('input');
           colorInput.type = 'color';
           colorInput.value = emp.color;
           colorInput.style.cssText = 'position:absolute; opacity:0; width:100%; height:100%; left:0; 
           colorDot.appendChild(colorInput);

           colorInput.addEventListener('input', (e) => {
               const newColor = e.target.value;
               emp.color = newColor;
               colorDot.style.background = newColor;
               emp.layerGroup.eachLayer(layer => {
                   if (layer.setStyle) {
                       layer.setStyle({ color: newColor, fillColor: newColor });
                   }
               });
           });

           const infoContainer = document.createElement('div');
           infoContainer.style.cssText = 'flex:1; display:flex; flex-direction:column; gap:2px; 

           const nameEl = document.createElement('span');
           nameEl.textContent = emp.name;
           nameEl.contentEditable = 'true';
           nameEl.title = "Clique para editar nome / Clique fora para salvar";
           nameEl.style.cssText = 'font-size:0.85rem; font-weight:bold; color:var(--text-main); 
           
           nameEl.addEventListener('blur', () => {
               emp.name = nameEl.textContent.trim() || `Ataque ${emp.id}`;
               nameEl.textContent = emp.name;
           });
           nameEl.addEventListener('keydown', (e) => {
               if (e.key === 'Enter') {
                   e.preventDefault();
                   nameEl.blur();
               }
           });

           const detailsEl = document.createElement('span');
           detailsEl.id = `details-${emp.id}`;
           const modeText = emp.releaseMode === 'PAIR' ? 'PAIR' : 'SGL';
           detailsEl.textContent = `${emp.qty}x ${emp.weapon} [${modeText}] | Rip: 
           detailsEl.style.cssText = 'font-size:0.7rem; color:var(--text-dim);';

           infoContainer.appendChild(nameEl);
           infoContainer.appendChild(detailsEl);

           const toggle = document.createElement('input');
           toggle.type = 'checkbox';
           toggle.checked = emp.visible;
           toggle.style.cssText = 'width:16px; height:16px; cursor:pointer; flex-shrink:0;';
           toggle.addEventListener('change', (e) => {
               emp.visible = toggle.checked;
               if (emp.visible) map.addLayer(emp.layerGroup);
               else map.removeLayer(emp.layerGroup);
           });

           const delBtn = document.createElement('button');
           delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
           delBtn.title = 'Remover emprego';
           delBtn.style.cssText = 'background:none; border:none; color:#FF6B6B; cursor:pointer; 
           delBtn.addEventListener('click', (e) => {
               map.removeLayer(emp.layerGroup);
               savedEmployments = savedEmployments.filter(e => e.id !== emp.id);
               if (editingEmploymentId === emp.id) {
                   stopEditing();
               } else {
                   renderEmploymentList();
               }
           });

           // Click to start editing (ignore clicks on interactive controls)
           item.addEventListener('click', (e) => {
               if (e.target.type === 'checkbox' || e.target.closest('button') || e.target === 
                   return;
               }
               startEditing(emp);
           });

           item.appendChild(goToBtn);
           item.appendChild(colorDot);
           item.appendChild(infoContainer);
           item.appendChild(toggle);
           item.appendChild(delBtn);
           list.appendChild(item);
       });
   }

   function startEditing(emp) {
       editingEmploymentId = emp.id;
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
           const dIcon = L.divIcon({ className: 'design-marker-icon', html: `<svg width="30" 
           designationMarker = L.marker(designationLatLng, { icon: dIcon }).addTo(map);
           designationMarker.bindTooltip("Designaǟ�'�'�ǟ�'�'�o");
           if (showLegends) designationMarker.openTooltip();
       }
       
       if (designationQtyInput && emp.desQty !== undefined) designationQtyInput.value = emp.desQty;
       if (designationRippleInput && emp.desRipple !== undefined) designationRippleInput.value = 
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
       document.getElementById('target-folder-name').textContent = emp.targetFolderName || 'Nenhum 
       document.getElementById('target-dmpi-display').textContent = 'DMPI ' + (emp.dmpiValue || '1');
       
       if (targetMarker) map.removeLayer(targetMarker);
       if (targetLatLng) {
           const triIcon = L.divIcon({ className: 'target-triangle', html: `<svg width="30" 
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
           
           let typeText = (currentTargetMetadata && currentTargetMetadata.type) ? 
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
       editingEmploymentId = null;
       document.getElementById('new-employment-btn').style.display = 'none';

       // Clear active designation coordinates and marker
       designationLatLng = null;
       if (designationMarker) {
           map.removeLayer(designationMarker);
           designationMarker = null;
       }
       document.getElementById('designation-coords').value = '';
       if (document.getElementById('designation-weapon')) 
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
       document.getElementById('target-folder-name').textContent = 'Nenhum arquivo';
       document.getElementById('target-dmpi-display').textContent = 'DMPI 1';
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
       emp.weapon = weaponSelect.value;
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
       
       // Update Persistent Target Area Details in real-time
       emp.targetCoordsText = targetCoordsInput.value;
       emp.targetLatLng = targetLatLng ? L.latLng(targetLatLng.lat, targetLatLng.lng) : null;
       emp.targetPolygonPoints = targetPolygonPoints ? targetPolygonPoints.map(pt => L.latLng(pt.lat, 
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
           const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(emp.designationLatLng.lat 
           const latHead = (desHeading + 90) % 360;
           const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * 
           const effectedCenter = L.latLng(emp.designationLatLng.lat + dLatLong + (latErrM * 
           
           drawEmploymentSet(effectedCenter, desHeading, emp.desQty !== undefined ? emp.desQty : 
       }

       const detailsEl = document.getElementById(`details-${emp.id}`);
       if (detailsEl) {
           const modeText = emp.releaseMode === 'PAIR' ? 'PAIR' : 'SGL';
           detailsEl.textContent = `${emp.qty}x ${emp.weapon} [${modeText}] | Rip: 
       }
       return true;
   }

   document.getElementById('new-employment-btn').addEventListener('click', stopEditing);  

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

   function updateNorthIndicators() {
       const dec = parseFloat(document.getElementById('mag-declination') ? 
       const tnArrow = document.querySelector('.tn-arrow');
       const mnArrow = document.querySelector('.mn-arrow');
       
       // Como o mapa gira para o Norte Magnǟ�'�'�tico ficar para cima (0deg na tela),
       // a seta do Norte Verdadeiro deve apontar para onde ele fisicamente estǟ�'�'� na tela.
       if (tnArrow) tnArrow.style.transform = `translateX(-50%) rotate(${-dec}deg)`;
       if (mnArrow) mnArrow.style.transform = `translateX(-50%) rotate(0deg)`;
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
       const startPt = rulerPoints[0];
       const endPt = rulerPoints[rulerPoints.length - 1];
       const bearing = getBearing(startPt, endPt);
       
       const dec = parseFloat(magDeclinationInput ? magDeclinationInput.value : 0) || 0;
       const magBearing = Math.round((bearing - dec + 360) % 360);
       
       let labelText = `${Math.round(totalMeters)} m / ${Math.round(totalFt)} ft | Eixo: 
       rulerPolyline.setTooltipContent(labelText);
   }

   if (magDeclinationInput) {
       magDeclinationInput.addEventListener('input', () => {
           const dec = parseFloat(magDeclinationInput.value) || 0;
           if (map && map.setBearing) {
               map.setBearing(-dec);
           }
           drawImpactsOnMap();
           if (typeof renderCompassSVG === 'function') renderCompassSVG();
           updateNorthIndicators();
           updateRulerTooltip();
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
                   map.setView(targetLatLngLoc, 17, { animate: true });
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
               // Desativa criaǟ�'�'�ǟ�'�'�o de alvos se ativa
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

   // Funcionalidade de Desenhar Alvo
   const drawTargetBtn = document.getElementById('draw-target-btn');
   if (drawTargetBtn) {
       drawTargetBtn.addEventListener('click', () => {
           targetDrawingActive = !targetDrawingActive;
           if (targetDrawingActive) {
               // Desativa a rǟ�'�'�gua se ativa
               if (rulerActive && rulerBtn) rulerBtn.click();
               // Desativa criaǟ�'�'�ǟ�'�'�o de alvos se ativa
               if (tgtCreationActive && tgtCreationBtn) tgtCreationBtn.click();
               
               // Ativa modo desenho
               drawTargetBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> SALVAR DESENHO';
               drawTargetBtn.style.background = '#00d2ff';
               drawTargetBtn.style.color = '#000';
               document.getElementById('map').style.cursor = 'crosshair';
               
               // Limpa o polǟ�'�'�gono antigo
               if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = 
               if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
               clearDragHandles();
               targetPolygonPoints = null;
               drawnTargetPoints = [];
               drawnTargetMarkers = [];
               if (drawnTargetPolyline) { map.removeLayer(drawnTargetPolyline); drawnTargetPolyline = 
           } else {
               finishTargetDrawing(true);
           }
       });
   }

   // Funcionalidade de Criaǟ�'�'�ǟ�'�'�o de Alvos (TGT) por clique
   if (tgtCreationBtn) {
       tgtCreationBtn.addEventListener('click', (e) => {
           const btn = e.currentTarget;
           tgtCreationActive = !tgtCreationActive;
                   if (currentPointMode) { addTacticalPoint(currentPointMode, e.latlng); return; }
       if (tgtCreationActive) {
               btn.style.color = '#000';
               btn.style.background = 'var(--primary)';
               document.getElementById('map').style.cursor = 'crosshair';
               
               // Desativa a rǟ�'�'�gua se ativa
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

   function updatePolygonVisibility() {
       const show = showTargetPolygonsCheck ? showTargetPolygonsCheck.checked : true;
       
       if (drawnTargetPolygon) {
           if (show) {
               if (!map.hasLayer(drawnTargetPolygon)) {
                   drawnTargetPolygon.addTo(map);
               }
           } else {
               if (map.hasLayer(drawnTargetPolygon)) {
                   map.removeLayer(drawnTargetPolygon);
               }
           }
       }
       
       if (drawnTargetMiniPolygon && miniMap) {
           if (show) {
               if (!miniMap.hasLayer(drawnTargetMiniPolygon)) {
                   drawnTargetMiniPolygon.addTo(miniMap);
               }
           } else {
               if (miniMap.hasLayer(drawnTargetMiniPolygon)) {
                   miniMap.removeLayer(drawnTargetMiniPolygon);
               }
           }
       }
       
       if (targetDragHandles) {
           targetDragHandles.forEach(h => {
               if (show) {
                   if (!map.hasLayer(h)) h.addTo(map);
               } else {
                   if (map.hasLayer(h)) map.removeLayer(h);
               }
           });
       }
   }

   if (showTargetPolygonsCheck) {
       showTargetPolygonsCheck.addEventListener('change', () => {
           updatePolygonVisibility();
       });
   }

   function createCustomTarget(latlng) {
       const name = `TGT${targetCounter}`;
       
       const triIcon = L.divIcon({ 
           className: 'target-triangle-custom', 
           html: `<svg width="30" height="30" viewBox="0 0 30 30" style="display: block;"><polygon 
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
           const triIconMini = L.divIcon({ className: 'target-triangle-mini', html: `<svg width="20" 
           miniMapTargetMarker = L.marker(tgt.latLng, { icon: triIconMini }).addTo(miniMap);
       }
       
       // Re-render target polygon associated with this custom target
       if (tgt.polygonPoints && tgt.polygonPoints.length > 0) {
           targetPolygonPoints = [...tgt.polygonPoints];
           
           if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
           if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
           
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
           if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
           clearDragHandles();
       }
       
       if (tgt.linkedXmlReleaseIndex !== undefined && tgt.linkedXmlReleaseIndex !== null && 
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
           
           if (targetLatLng && targetLatLng.lat === tgt.latLng.lat && targetLatLng.lng === 
               targetLatLng = null;
               targetMarker = null;
               targetCoordsInput.value = '';
               document.getElementById('target-folder-name').textContent = 'Nenhum arquivo';
               document.getElementById('target-dmpi-display').textContent = 'DMPI 1';
               
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

   function updateTargetListUI() {
       if (!targetListContainer) return;
       targetListContainer.innerHTML = '';

       createdTargets.forEach(tgt => {
           const item = document.createElement('div');
           const isActive = targetLatLng && targetLatLng.lat === tgt.latLng.lat && targetLatLng.lng 
           
           item.style.cssText = `display:flex; align-items:center; gap:10px; margin-bottom:8px; 

           const infoContainer = document.createElement('div');
           infoContainer.style.cssText = 'flex:1; display:flex; flex-direction:column; gap:2px; 

           const nameEl = document.createElement('span');
           nameEl.style.cssText = 'font-size:0.85rem; font-weight:bold; color:#ff3333; outline:none; 
           nameEl.textContent = tgt.name;

           const coordsEl = document.createElement('span');
           coordsEl.style.cssText = 'font-size:0.65rem; color:var(--text-dim);';
           coordsEl.textContent = formatCoords(tgt.latLng.lat, tgt.latLng.lng);

           infoContainer.appendChild(nameEl);
           infoContainer.appendChild(coordsEl);

           // Atrelar emprego XML ao alvo
           if (parsedXMLReleases && parsedXMLReleases.length > 0) {
               const linkSelect = document.createElement('select');
               linkSelect.style.cssText = 'width:100%; margin-top:5px; padding:3px 6px; 
               
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

               linkSelect.value = (tgt.linkedXmlReleaseIndex !== undefined && 

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
           zoomBtn.style.cssText = 'background:rgba(0, 210, 255, 0.1); border:1px solid 
           zoomBtn.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i>';
           zoomBtn.addEventListener('click', (e) => {
               e.stopPropagation();
               map.setView(tgt.latLng, 18);
               if (miniMap) miniMap.setView(tgt.latLng, 20);
               selectActiveTarget(tgt);
           });

           const delBtn = document.createElement('button');
           delBtn.title = 'Excluir Alvo';
           delBtn.style.cssText = 'background:rgba(255, 51, 51, 0.1); border:1px solid #ff3333; 
           delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
           delBtn.addEventListener('click', (e) => {
               e.stopPropagation();
               deleteTarget(tgt.id);
           });

           actions.appendChild(zoomBtn);
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
                   html: `<div style="width: 12px; height: 12px; background: #00ffff; border: 2.5px 
                   iconSize: [12, 12],
                   iconAnchor: [6, 6]
               })
           }).addTo(map);
           
           handle.on('drag', (e) => {
               const newLatLng = e.target.getLatLng();
               targetPolygonPoints[idx] = newLatLng;
               
               // Atualiza polǟ�'�'�gonos
               if (drawnTargetPolygon) drawnTargetPolygon.setLatLngs(targetPolygonPoints);
               if (drawnTargetMiniPolygon) drawnTargetMiniPolygon.setLatLngs(targetPolygonPoints);
               
               // Se estiver editando um emprego, atualiza o polǟ�'�'�gono dele em tempo real
               if (editingEmploymentId !== null) {
                   const emp = savedEmployments.find(empEl => empEl.id === editingEmploymentId);
                   if (emp) {
                       emp.targetPolygonPoints = targetPolygonPoints.map(pt => L.latLng(pt.lat, 
                   }
               }
               
               // --- NOVO: Salva os pontos no alvo customizado ativo ---
               const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === 
               if (activeCustomTgt) {
                   activeCustomTgt.polygonPoints = [...targetPolygonPoints];
               }
               
               // Recalcula a eficǟ�'�'�cia na hora
               validateEmploymentEfficacy();
           });
           
           handle.on('dragend', () => {
               // Reconstrǟ�'�'�i para manter sincronia
               createDragHandles();
               updatePolygonVisibility();
           });

           // Clique duplo no vǟ�'�'�rtice remove o ponto do polǟ�'�'�gono
           handle.on('dblclick', (e) => {
               L.DomEvent.stopPropagation(e); // Evita o zoom do mapa e outras 
               
               if (targetPolygonPoints.length <= 3) {
                   alert('Um polǟ�'�'�gono de alvo precisa ter no mǟ�'�'�nimo 3 pontos.');
                   return;
               }
               
               targetPolygonPoints.splice(idx, 1);
               
               if (drawnTargetPolygon) drawnTargetPolygon.setLatLngs(targetPolygonPoints);
               if (drawnTargetMiniPolygon) drawnTargetMiniPolygon.setLatLngs(targetPolygonPoints);
               
               if (editingEmploymentId !== null) {
                   const emp = savedEmployments.find(empEl => empEl.id === editingEmploymentId);
                   if (emp) {
                       emp.targetPolygonPoints = targetPolygonPoints.map(pt => L.latLng(pt.lat, 
                   }
               }
               
               // --- NOVO: Salva os pontos no alvo customizado ativo ---
               const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === 
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
           drawTargetBtn.innerHTML = '<i class="fa-solid fa-pencil"></i> DESENHAR ALVO 
           drawTargetBtn.style.background = '';
           drawTargetBtn.style.color = '';
       }
       document.getElementById('map').style.cursor = '';
       
       // Remove marcadores temporǟ�'�'�rios
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
           alert('Por favor, clique em pelo menos 3 pontos para formar o polǟ�'�'�gono do alvo.');
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
       const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === 
       
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
           const triIcon = L.divIcon({ className: 'target-triangle', html: `<svg width="30" 
           targetMarker = L.marker(targetLatLng, { icon: triIcon }).addTo(map);
           targetMarker.bindTooltip("Alvo");
           if (typeof showLegends !== 'undefined' && showLegends) targetMarker.openTooltip();
       }
       if (targetCoordsInput) {
           targetCoordsInput.value = typeof formatCoords === 'function' ? formatCoords(centroidLat, 
       }
       if (typeof updateDistance === 'function') updateDistance();
       if (typeof drawImpactsOnMap === 'function') drawImpactsOnMap();
       if (typeof saveCurrentDmpiToCache === 'function') saveCurrentDmpiToCache();
       
       // Cria polǟ�'�'�gono no mapa principal
       drawnTargetPolygon = L.polygon(targetPolygonPoints, {
           color: '#00ffff',
           fillColor: '#00ffff',
           fillOpacity: 0.25,
           weight: 2
       }).addTo(map);
       drawnTargetPolygon.bindTooltip("Alvo Customizado");
       
       // Cria polǟ�'�'�gono no mini mapa
       if (miniMap) {
           drawnTargetMiniPolygon = L.polygon(targetPolygonPoints, {
               color: '#00ffff',
               fillColor: '#00ffff',
               fillOpacity: 0.25,
               weight: 2
           }).addTo(miniMap);
       }
       
       // Cria alǟ�'�'�as de ajuste manual
       createDragHandles();
       
       updatePolygonVisibility();
       
       validateEmploymentEfficacy();
   }

   function createAutoTargetPolygon(center, W, L_dim, type) {
       // Limpa polǟ�'�'�gonos antigos e alǟ�'�'�as
       if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
       if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
       clearDragHandles();

       const feedbackBox = document.getElementById('feedback-box');
       const feedbackText = document.getElementById('feedback-text');
       if (feedbackBox && feedbackText) {
           feedbackBox.style.display = 'block';
           feedbackText.innerHTML = `<span style="color:#00e5ff; font-size:0.75rem;"><i 
       }

       // Tenta segmentar utilizando visǟ�'�'�o computacional em tempo real a partir da imagem do 
       segmentTargetFromSatellite(center, W, L_dim, type);
   }

   function segmentTargetFromSatellite(center, W, L_dim, type) {
       const zoom = 20; // Alta resoluǟ�'�'�ǟ�'�'�o (aprox 15cm por pixel)
       
       // Conversǟ�'�'�o de Lat/Lng para coordenadas de tile
       function getTileCoords(lat, lng, z) {
           const x = Math.floor((lng + 180) / 360 * Math.pow(2, z));
           const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * 
           return { x, y };
       }
       
       // Conversǟ�'�'�o de Lat/Lng para pixel dentro do tile de 256x256
       function getPixelOffset(lat, lng, tileX, tileY, z) {
           const totalPixels = Math.pow(2, z) * 256;
           const pixelX = ((lng + 180) / 360 * totalPixels);
           const latRad = lat * Math.PI / 180;
           const pixelY = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * 
           
           const px = Math.floor(pixelX - tileX * 256);
           const py = Math.floor(pixelY - tileY * 256);
           return { px, py };
       }
       
       // Conversǟ�'�'�o de pixel de tile de volta para Lat/Lng
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
               
               // Variǟ�'�'�ncia local para medir o contraste do terreno
               let varianceSum = 0;
               for (let i = 0; i < lumas.length; i++) {
                   varianceSum += Math.pow(lumas[i] - mean, 2);
               }
               const stdDev = Math.sqrt(varianceSum / lumas.length);
               
               // Se o contraste do terreno for extremamente baixo, aborta e cai no fallback 
               if (stdDev < 6) throw new Error("Contraste de satǟ�'�'�lite insuficiente.");
               
               // Limiar adaptativo
               const centerIdx = Math.floor(patchSize / 2) * patchSize + Math.floor(patchSize / 2);
               const centerLuma = lumas[centerIdx];
               const threshold = mean + (centerLuma < mean ? -0.2 * stdDev : 0.2 * stdDev);
               const isDarkTarget = centerLuma < mean;
               
               // Binariza a imagem local baseando-se no contraste do objeto 
               const binary = new Uint8Array(patchSize * patchSize);
               for (let i = 0; i < lumas.length; i++) {
                   binary[i] = isDarkTarget ? (lumas[i] < threshold ? 1 : 0) : (lumas[i] > threshold ? 
               }
               
               // Region Growing (Crescimento de Regiǟ�'�'�o) para contornar perfeitamente a 
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
               
               // Valida o tamanho do blob extraǟ�'�'�do para evitar ruǟ�'�'�dos de satǟ�'�'�lite
               if (blobPoints.length < 40 || blobPoints.length > (patchSize * patchSize) * 0.75) {
                   throw new Error("Tamanho de blob de contraste incompatǟ�'�'�vel.");
               }
               
               // Encontra a Casca Convexa (Convex Hull) do blob para um contorno fidedigno e perfeito
               blobPoints.sort((a, b) => a.x === b.x ? a.y - b.y : a.x - b.x);
               
               const lower = [];
               for (let i = 0; i < blobPoints.length; i++) {
                   while (lower.length >= 2 && crossProduct(lower[lower.length - 2], 
                       lower.pop();
                   }
                   lower.push(blobPoints[i]);
               }
               
               const upper = [];
               for (let i = blobPoints.length - 1; i >= 0; i--) {
                   while (upper.length >= 2 && crossProduct(upper[upper.length - 2], 
                       upper.pop();
                   }
                   upper.push(blobPoints[i]);
               }
               
               upper.pop();
               lower.pop();
               const hull = lower.concat(upper);
               
               // Simplifica o polǟ�'�'�gono para remover pequenos serrilhados de pixels e deixar o 
               const simplified = simplifyPolygon(hull, 2.2);
               
               // Mapeia os pixels binarizados de volta para coordenadas Lat/Lng exatas no mapa
               const finalLatLngs = simplified.map(pt => {
                   const absPx = startX + pt.x;
                   const absPy = startY + pt.y;
                   return pixelToLatLng(absPx, absPy, tile.x, tile.y, zoom);
               });
               
               // Desenha o polǟ�'�'�gono segmentado real ajustado fidedignamente!
               applySegmentedTarget(finalLatLngs, type);
               
           } catch (err) {
               console.warn("Falha ou falta de suporte a CORS no satǟ�'�'�lite. Usando fallback 
               useHighFidelityFallback(center, W, L_dim, type);
           }
       };
       
       img.onerror = function() {
           console.warn("Erro ao buscar imagem de satǟ�'�'�lite. Ativando fallback 
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
           
           const area = Math.abs((next.y - prev.y) * curr.x - (next.x - prev.x) * curr.y + next.x * 
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
       // Limpa polǟ�'�'�gonos antigos
       if (drawnTargetPolygon) { map.removeLayer(drawnTargetPolygon); drawnTargetPolygon = null; }
       if (drawnTargetMiniPolygon) { miniMap.removeLayer(drawnTargetMiniPolygon); 
       
       targetPolygonPoints = latlngs;
       
       // --- NOVO: Salva os pontos no alvo customizado ativo ---
       const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === 
       if (activeCustomTgt) {
           activeCustomTgt.polygonPoints = [...targetPolygonPoints];
       }
       
       // Cria polǟ�'�'�gono no mapa principal
       drawnTargetPolygon = L.polygon(targetPolygonPoints, {
           color: '#00ffff',
           fillColor: '#00ffff',
           fillOpacity: 0.28,
           weight: 2
       }).addTo(map);
       drawnTargetPolygon.bindTooltip(`Alvo: ${type} (Ajustado por Contraste Real)`);
       
       // Cria polǟ�'�'�gono no mini mapa
       if (miniMap) {
           drawnTargetMiniPolygon = L.polygon(targetPolygonPoints, {
               color: '#00ffff',
               fillColor: '#00ffff',
               fillOpacity: 0.28,
               weight: 2
           }).addTo(miniMap);
       }
       
       // Adiciona alǟ�'�'�as para micro-ajustes manuais
       createDragHandles();
       
       updatePolygonVisibility();
       
       // Mostra feedback de sucesso no painel
       const feedbackBox = document.getElementById('feedback-box');
       const feedbackText = document.getElementById('feedback-text');
       if (feedbackBox && feedbackText) {
           feedbackBox.style.display = 'block';
           feedbackText.innerHTML = `<span style="color:#00ff55; font-size:0.75rem;"><i 
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
           const dLng = (distL * Math.sin(rad) + distW * Math.cos(rad)) / (111111 * Math.cos(pt.lat * 
           return L.latLng(pt.lat + dLat, pt.lng + dLng);
       }
       
       const p1 = getOffsetPoint(center, halfL, halfW);
       const p2 = getOffsetPoint(center, halfL, -halfW);
       const p3 = getOffsetPoint(center, -halfL, -halfW);
       const p4 = getOffsetPoint(center, -halfL, halfW);
       
       targetPolygonPoints = [p1, p2, p3, p4];
       
       // --- NOVO: Salva os pontos no alvo customizado ativo ---
       const activeCustomTgt = createdTargets.find(t => targetLatLng && t.latLng.lat === 
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
           feedbackText.innerHTML = `<span style="color:#ffcc00; font-size:0.75rem;"><i 
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
       
       // Atualiza a visualizaǟ�'�'�ǟ�'�'�o 2D live (inicial)!
       drawTargetGeometry2D(null, 0);
       
       if (!targetPolygonPoints || !feedbackBox || !feedbackText) {
           if (feedbackBox) feedbackBox.style.display = 'none';
           if (wrapper) wrapper.style.borderColor = 'var(--primary)';
           return;
       }
       
       feedbackBox.style.display = 'block';
       
       // Coleta os pontos de impacto do emprego ativo ou em ediǟ�'�'�ǟ�'�'�o
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
               const dLngLong = (longErrM * Math.sin(rad)) / (111111 * 
               const latHead = (desHeading + 90) % 360;
               const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * 
               const effectedCenter = L.latLng(
                   emp.designationLatLng.lat + dLatLong + (latErrM * Math.cos(latHead * Math.PI / 
                   emp.designationLatLng.lng + dLngLong + dLngLatCalc
               );
               
               impactPoints = getImpactPoints(effectedCenter, desHeading, emp.qty, emp.ripple, 
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
               const dLngLong = (longErrM * Math.sin(rad)) / (111111 * Math.cos(designationLatLng.lat 
               const latHead = (desHeading + 90) % 360;
               const dLngLatCalc = (latErrM * Math.sin(latHead * Math.PI / 180)) / (111111 * 
               const effectedCenter = L.latLng(designationLatLng.lat + dLatLong + (latErrM * 
               
               impactPoints = getImpactPoints(effectedCenter, desHeading, qty, 
           }
       }
       
       // Atualiza a visualizaǟ�'�'�ǟ�'�'�o 2D live com os impactos calculados!
       drawTargetGeometry2D(impactPoints, ameM);
       
       if (impactPoints.length === 0) {
           feedbackText.innerHTML = `<span style="color:var(--text-dim)">Aguardando 
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
                       hits += 0.5; // impacto prǟ�'�'�ximo conta como dano de 
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
                       // Se estiver um pouco dentro (distǟ�'�'�ncia menor que 70% do raio AME), 
                       if (ratio < 0.7) {
                           bestResult = 'valid';
                       } else {
                           // Se sǟ�'�'� encostar (entre 70% e 100% do raio AME), ǟ�'�'� Parcial
                           if (bestResult !== 'valid') {
                               bestResult = 'partial';
                           }
                       }
                   }
               }
           });
       }
       
       if (bestResult === 'invalid') {
           feedbackText.innerHTML = `<span style="color:#ff3333;"><i class="fa-solid 
           if (wrapper) wrapper.style.borderColor = '#ff3333';
       } else if (bestResult === 'partial') {
           feedbackText.innerHTML = `<span style="color:#ffcc00;"><i class="fa-solid 
           if (wrapper) wrapper.style.borderColor = '#ffcc00';
       } else {
           feedbackText.innerHTML = `<span style="color:#00ff00;"><i class="fa-solid 
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

       // 2. Simplifica vǟ�'�'�rtices para mesclar arestas com diferenǟ�'�'�a angular muito baixa 
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
                   
                   // cos(15 deg) ǟ�ǽ�'�<�? 0.966. Se o cosseno for maior, a curvatura ǟ�'�'� 
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

       // --- RENDERIZAǟ�'ǽ�'�ǟ�'�Ń?TO ---
       // Desenha grade de fundo tǟ�'�'�tica
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

       // Cǟ�'�'�rculos tǟ�'�'�ticos de radar
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

       // Desenha o polǟ�'�'�gono simplificado
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

       // Remove sombra para os vǟ�'�'�rtices e textos
       ctx.shadowBlur = 0;

       // Desenha cǟ�'�'�rculos de impacto das bombas (se fornecidos)
       if (impactPoints && impactPoints.length > 0 && ameM > 0) {
           const activeWeapon = (editingEmploymentId !== null) ? 
               (savedEmployments.find(e => e.id === editingEmploymentId)?.weapon || 'BAFG-230') : 
               weaponSelect.value;

           if (activeWeapon === 'SBAT-70' || activeWeapon === 'GUNS') {
               // Desenha as duas Elipses de Dispersǟ�'�'�o no Canvas 2D (lanǟ�'�'�adores 
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
                       heading = emp.displayHeading !== "" ? (parseInt(emp.displayHeading || 0) + dec) 
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

       // Desenha vǟ�'�'�rtices como cǟ�'�'�rculos
       ctx.fillStyle = 'white';
       canvasPts.forEach(pt => {
           ctx.beginPath();
           ctx.arc(pt.px, pt.py, 3, 0, 2 * Math.PI);
           ctx.fill();
           ctx.strokeStyle = 'black';
           ctx.lineWidth = 1;
           ctx.stroke();
       });

       // Desenha as medidas de cada parede/aresta (tamanho maior e mais visǟ�'�'�vel)
       canvasPts.forEach((pt, i) => {
           const nextPt = canvasPts[(i + 1) % canvasPts.length];
           
           // Ponto mǟ�'�'�dio da parede
           const mx = (pt.px + nextPt.px) / 2;
           const my = (pt.py + nextPt.py) / 2;

           // Calcula o vetor normal externo da aresta
           const dx = nextPt.px - pt.px;
           const dy = nextPt.py - pt.py;
           const len = Math.sqrt(dx*dx + dy*dy);
           if (len === 0) return;

           let nx = -dy / len;
           let ny = dx / len;

           // Vetor partindo do centro do polǟ�'�'�gono ao ponto mǟ�'�'�dio da parede
           const vx = mx - cxCanvas;
           const vy = my - cyCanvas;
           
           // Garante que o vetor normal aponte para fora do polǟ�'�'�gono
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

           // Desenha o fundo da etiqueta para mǟ�'�'�xima legibilidade (tamanho aumentado)
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

           // Calcula os dois centros com afastamento de 2m para cada lado (espaǟ�'�'�amento total 
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
               
               // Distribui alternadamente os pontos de impacto entre o lanǟ�'�'�ador 1 e o 
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

               // Par da frente (5m de distǟ�'�'�ncia, +ripple/2 ǟ�'�'� frente)
               frontLatOffsets.forEach(latOffset => {
                   const dLatLong = ((ripple / 2) * Math.cos(rad)) / 111111;
                   const dLngLong = ((ripple / 2) * Math.sin(rad)) / (111111 * cosLat);
                   const dLatLat = (latOffset * Math.cos(radPerp)) / 111111;
                   const dLngLat = (latOffset * Math.sin(radPerp)) / (111111 * cosLat);
                   points.push(L.latLng(center.lat + dLatLong + dLatLat, center.lng + dLngLong + 
               });

               // Par de trǟ�'�'�s (8m de distǟ�'�'�ncia, -ripple/2 atrǟ�'�'�s)
               rearLatOffsets.forEach(latOffset => {
                   const dLatLong = ((-ripple / 2) * Math.cos(rad)) / 111111;
                   const dLngLong = ((-ripple / 2) * Math.sin(rad)) / (111111 * cosLat);
                   const dLatLat = (latOffset * Math.cos(radPerp)) / 111111;
                   const dLngLat = (latOffset * Math.sin(radPerp)) / (111111 * cosLat);
                   points.push(L.latLng(center.lat + dLatLong + dLatLat, center.lng + dLngLong + 
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

   // Ray-casting algorithm para checar se ponto estǟ�'�'� em polǟ�'�'�gono
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

   // Calcula distǟ�'�'�ncia mǟ�'�'�nima de um ponto a um segmento de reta
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

   // Verifica sobreposiǟ�'�'�ǟ�'�'�o entre cǟ�'�'�rculo e polǟ�'�'�gono
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
       if (targetDrawingActive) {
           drawnTargetPoints.push(e.latlng);
           const marker = L.circleMarker(e.latlng, { radius: 4, color: '#00ffff', fillColor: 
           drawnTargetMarkers.push(marker);
           
           if (drawnTargetPoints.length > 1) {
               if (drawnTargetPolyline) map.removeLayer(drawnTargetPolyline);
               drawnTargetPolyline = L.polyline(drawnTargetPoints, { color: '#00ffff', weight: 2, 
           }
           return;
       }

               if (currentPointMode) { addTacticalPoint(currentPointMode, e.latlng); return; }
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
               html: `<div style="width: 10px; height: 10px; background: #00d2ff; border: 2px solid 
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
               
               const startPt = rulerPoints[0];
               const endPt = rulerPoints[rulerPoints.length - 1];
               const bearing = getBearing(startPt, endPt);
               
               const dec = parseFloat(document.getElementById('mag-declination') ? 
               const magBearing = Math.round((bearing - dec + 360) % 360);
               
               let labelText = `${Math.round(totalMeters)} m / ${Math.round(totalFt)} ft | Eixo: 
               
               rulerPolyline.setTooltipContent(labelText);
           }
       });

       rulerMarkers.push(marker);

       if (rulerPoints.length > 1) {
           if (rulerPolyline) map.removeLayer(rulerPolyline);
           rulerPolyline = L.polyline(rulerPoints, {color: '#00d2ff', weight: 3, dashArray: '5, 
           
           let totalMeters = 0;
           for (let i = 0; i < rulerPoints.length - 1; i++) {
               totalMeters += rulerPoints[i].distanceTo(rulerPoints[i+1]);
           }
           const totalFt = totalMeters * 3.28084;
           
           const startPt = rulerPoints[0];
           const endPt = rulerPoints[rulerPoints.length - 1];
           const bearing = getBearing(startPt, endPt);
           
           const dec = parseFloat(document.getElementById('mag-declination') ? 
           const magBearing = Math.round((bearing - dec + 360) % 360);
           
           let labelText = `${Math.round(totalMeters)} m / ${Math.round(totalFt)} ft | Eixo: 
           
           if (rulerPolyline) {
               rulerPolyline.bindTooltip(labelText, { permanent: true, direction: 'center', className: 
           }
       }
   });

   map.on('dblclick', (e) => {
       if (targetDrawingActive) {
           finishTargetDrawing(true);
       }
   });

   // Rastreia a posiǟ�'�'�ǟ�'�'�o atual do mouse no mapa
   map.on('mousemove', (e) => {
       lastMapMouseLatLng = e.latlng;
   });

   // Atalho CTRL para marcar pontos no desenho manual de alvo
   window.addEventListener('keydown', (e) => {
       if (e.key === 'Control' && !e.repeat && targetDrawingActive && lastMapMouseLatLng) {
           drawnTargetPoints.push(lastMapMouseLatLng);
           const marker = L.circleMarker(lastMapMouseLatLng, { radius: 4, color: '#00ffff', fillColor: 
           drawnTargetMarkers.push(marker);
           
           if (drawnTargetPoints.length > 1) {
               if (drawnTargetPolyline) map.removeLayer(drawnTargetPolyline);
               drawnTargetPolyline = L.polyline(drawnTargetPoints, { color: '#00ffff', weight: 2, 
           }
           e.preventDefault();
       }
   });


   // --- TACTICAL POINTS LOGIC ---
   document.querySelectorAll('.add-point-btn').forEach(btn => {
       btn.addEventListener('click', () => {
           const mode = btn.getAttribute('data-mode');
           if (currentPointMode === mode) {
               currentPointMode = null;
               btn.classList.remove('active');
               document.getElementById('map').style.cursor = '';
               document.getElementById('map').classList.remove('map-crosshair-cursor');
               return;
           }
           document.querySelectorAll('.add-point-btn').forEach(b => b.classList.remove('active'));
           if (rulerActive) document.getElementById('ruler-btn').click();
           if (targetDrawingActive) document.getElementById('draw-target-btn').click();
           
           currentPointMode = mode;
           btn.classList.add('active');
           document.getElementById('map').style.cursor = 'crosshair';
           document.getElementById('map').classList.add('map-crosshair-cursor');
       });
   });

   // Generic Toggle Visibility Listener
   document.querySelectorAll('.toggle-visibility-check').forEach(checkbox => {
       checkbox.addEventListener('change', (e) => {
           const mode = e.target.getAttribute('data-mode');
           if (mode === 'TARGET') return; // Target handled elsewhere
           
           const show = e.target.checked;
           if (tacticalPoints[mode]) {
               tacticalPoints[mode].forEach(pt => {
                   if (show) {
                       if (pt.marker && !map.hasLayer(pt.marker)) pt.marker.addTo(map);
                       if (pt.circle && !map.hasLayer(pt.circle)) pt.circle.addTo(map);
                       if (pt.impactLine && !map.hasLayer(pt.impactLine)) pt.impactLine.addTo(map);
                                               if (pt.impactMarker && !map.hasLayer(pt.impactMarker)) 
                       if (pt.bombCircle && !map.hasLayer(pt.bombCircle)) pt.bombCircle.addTo(map);
                       if (pt.rocketCircle && !map.hasLayer(pt.rocketCircle)) 
                       if (pt.bulletsCircle && !map.hasLayer(pt.bulletsCircle)) 
                   } else {
                       if (pt.marker && map.hasLayer(pt.marker)) map.removeLayer(pt.marker);
                       if (pt.circle && map.hasLayer(pt.circle)) map.removeLayer(pt.circle);
                       if (pt.impactLine && map.hasLayer(pt.impactLine)) 
                       if (pt.impactMarker && map.hasLayer(pt.impactMarker)) 
                       if (pt.bombCircle && map.hasLayer(pt.bombCircle)) 
                       if (pt.rocketCircle && map.hasLayer(pt.rocketCircle)) 
                       if (pt.bulletsCircle && map.hasLayer(pt.bulletsCircle)) 
                   }
               });
           }
       });
   });

   window.addTacticalPoint = function(mode, latlng) {
       if (mode === 'TARGET') {
           createCustomTarget(latlng);
           return;
       }
       
       let svgHtml = '';
       switch(mode) {
           case 'WAYPOINT':
               svgHtml = '<svg width="24" height="24" viewBox="0 0 24 24" style="display: 
               break;
           case 'THREAT':
               svgHtml = '<svg width="24" height="24" viewBox="0 0 24 24" style="display: 
               break;
           case 'FRIENDLY':
               svgHtml = '<svg width="24" height="24" viewBox="0 0 24 24" style="display: 
               break;
           case 'ARTILLERY':
               svgHtml = '<svg width="24" height="24" viewBox="0 0 24 24" style="display: 
               break;
           case 'SCENARIO':
               svgHtml = '<svg width="24" height="24" viewBox="0 0 24 24" style="display: 
               break;
       }
       
       const icon = L.divIcon({
           className: 'custom-div-icon',
           html: '<div class="custom-map-marker">' + svgHtml + '</div>',
           iconSize: [24, 24],
           iconAnchor: [12, 12]
       });
       
       const checkbox = document.querySelector('.toggle-visibility-check[data-mode="' + mode + '"]');
       const show = checkbox ? checkbox.checked : true;
       
       const marker = L.marker(latlng, { icon });
       if (show) marker.addTo(map);
       
       const pointData = { id: Date.now(), latlng, marker, mode };
       
       if (mode === 'THREAT') {
           const circle = L.circle(latlng, { radius: 2.0 * 1852, color: '#ff3333', fillOpacity: 0.1, 
           if (show) circle.addTo(map);
           pointData.circle = circle;
       }
       
       tacticalPoints[mode].push(pointData);
       updateTacticalList(mode);
   };

   window.updateTacticalList = function(mode) {
       let listId = '';
       let namePrefix = '';
       switch(mode) {
           case 'WAYPOINT': listId = 'waypoints-list'; namePrefix = 'WP'; break;
           case 'THREAT': listId = 'threats-list'; namePrefix = 'Threat'; break;
           case 'FRIENDLY': listId = 'friendly-position-list'; namePrefix = 'Friendly'; break;
           case 'ARTILLERY': listId = 'artillery-list'; namePrefix = 'Arty'; break;
           case 'SCENARIO': listId = 'scenario-list'; namePrefix = 'Nav'; break;
       }
       
       const container = document.getElementById(listId);
       if (!container) return;
       
       container.innerHTML = '';
       tacticalPoints[mode].forEach((pt, idx) => {
           const item = document.createElement('div');
           item.className = 'tactical-list-item';
           
           let content = '<div style="display:flex; flex-direction:column; gap:6px; width:100%;">' +
                         '<div style="display:flex; justify-content:space-between; 
                         '<span>' + namePrefix + ' ' + (idx + 1) + '</span>' +
                         '<span style="font-family: monospace; font-size: 0.7rem;">' + 
                         '<button class="remove-point-btn" data-mode="' + mode + '" data-id="' + pt.id 
                         '</div>';
           
           if (mode === 'THREAT') {
               const currentRadius = pt.circle ? (pt.circle.getRadius() / 1852).toFixed(1) : 2.0;
               content += '<div style="display:flex; align-items:center; gap:5px; font-size: 
           }
           if (mode === 'ARTILLERY') {
               const gtl = pt.gtl !== undefined ? pt.gtl : '';
               const range = pt.range !== undefined ? pt.range : '';
               content += '<div style="display:flex; gap:5px;"><input type="number" class="arty-gtl" 
           }
           if (mode === 'FRIENDLY') {
               const bombChecked = pt.bombChecked ? 'checked' : '';
               const rocketChecked = pt.rocketChecked ? 'checked' : '';
               const bulletsChecked = pt.bulletsChecked ? 'checked' : '';
               
               content += '<div style="display:flex; gap:12px; margin-top:4px; font-size:0.8rem; 
                          '<label style="display:flex; align-items:center; gap:4px; cursor:pointer;" 
                          '<label style="display:flex; align-items:center; gap:4px; cursor:pointer;" 
                          '<label style="display:flex; align-items:center; gap:4px; cursor:pointer;" 
                          '</div>';
           }
           
           content += '</div>';
           item.innerHTML = content;
           container.appendChild(item);
       });
       
       if (mode === 'THREAT') {
           container.querySelectorAll('.threat-radius-input').forEach(input => {
               input.addEventListener('change', (e) => {
                   const id = parseInt(e.target.getAttribute('data-id'));
                   const val = parseFloat(e.target.value);
                   const pt = tacticalPoints['THREAT'].find(p => p.id === id);
                   if (pt && pt.circle && !isNaN(val)) {
                       pt.circle.setRadius(val * 1852);
                   }
               });
           });
       }
       
       if (mode === 'ARTILLERY') {
           container.querySelectorAll('.arty-gtl, .arty-range').forEach(input => {
               input.addEventListener('change', (e) => {
                   const id = parseInt(e.target.getAttribute('data-id'));
                   const pt = tacticalPoints['ARTILLERY'].find(p => p.id === id);
                   if (pt) {
                       if (e.target.classList.contains('arty-gtl')) pt.gtl = 
                       if (e.target.classList.contains('arty-range')) pt.range = 
                       
                                               if (pt.impactLine) map.removeLayer(pt.impactLine);
                       if (pt.impactMarker) map.removeLayer(pt.impactMarker);
                       
                       if (!isNaN(pt.gtl) && !isNaN(pt.range)) {
                           const dec = parseFloat(document.getElementById('mag-declination') ? 
                           const R = 6371e3; // Earth radius in meters
                           const trueGtl = pt.gtl + dec;
                           const brng = trueGtl * Math.PI / 180;
                           const d = pt.range;
                           const lat1 = pt.latlng.lat * Math.PI / 180;
                           const lon1 = pt.latlng.lng * Math.PI / 180;
                           const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d/R) + Math.cos(lat1) * 
                           const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d/R) * 
                           const impactLatLng = L.latLng(lat2 * 180 / Math.PI, lon2 * 180 / Math.PI);
                           
                           const checkbox = 
                           const show = checkbox ? checkbox.checked : true;
                           
                           pt.impactLine = L.polyline([pt.latlng, impactLatLng], { color: '#00d2ff', 
                           pt.impactMarker = L.marker(impactLatLng, {
                               icon: L.divIcon({
                                   className: 'impact-x-icon',
                                   html: '<svg width="24" height="24" viewBox="0 0 24 24" 
                                   iconSize: [24, 24],
                                   iconAnchor: [12, 12]
                               })
                           });
                           
                                                       if (show) {
                                 pt.impactLine.addTo(map);
                                 pt.impactMarker.addTo(map);
                             }
                         }
                     }
                 });
             });
         }
         
         if (mode === 'FRIENDLY') {
             container.querySelectorAll('.friendly-weapon-check').forEach(input => {
                 input.addEventListener('change', (e) => {
                     const id = parseInt(e.target.getAttribute('data-id'));
                     const weapon = e.target.getAttribute('data-weapon');
                     const isChecked = e.target.checked;
                     const pt = tacticalPoints['FRIENDLY'].find(p => p.id === id);
                     if (pt) {
                         const checkbox = 
                         const show = checkbox ? checkbox.checked : true;
                         
                         if (weapon === 'bomb') {
                             pt.bombChecked = isChecked;
                             if (pt.bombCircle) { map.removeLayer(pt.bombCircle); delete 
                             if (isChecked) {
                                 pt.bombCircle = L.circle(pt.latlng, { radius: 310, color: '#00d2ff', 
                                 if (show) pt.bombCircle.addTo(map);
                             }
                         }
                         if (weapon === 'rocket') {
                             pt.rocketChecked = isChecked;
                             if (pt.rocketCircle) { map.removeLayer(pt.rocketCircle); delete 
                             if (isChecked) {
                                 pt.rocketCircle = L.circle(pt.latlng, { radius: 300, color: 
                                 if (show) pt.rocketCircle.addTo(map);
                             }
                         }
                         if (weapon === 'bullets') {
                             pt.bulletsChecked = isChecked;
                             if (pt.bulletsCircle) { map.removeLayer(pt.bulletsCircle); delete 
                             if (isChecked) {
                                 pt.bulletsCircle = L.circle(pt.latlng, { radius: 100, color: 
                                 if (show) pt.bulletsCircle.addTo(map);
                             }
                         }
                     }
                 });
             });
         }
       
       container.querySelectorAll('.remove-point-btn').forEach(btn => {
           btn.addEventListener('click', (e) => {
               const btnEl = e.target.closest('button');
               const m = btnEl.getAttribute('data-mode');
               const id = parseInt(btnEl.getAttribute('data-id'));
               
               const ptIndex = tacticalPoints[m].findIndex(p => p.id === id);
               if (ptIndex > -1) {
                   const pt = tacticalPoints[m][ptIndex];
                                       if (pt.marker) map.removeLayer(pt.marker);
                   if (pt.circle) map.removeLayer(pt.circle);
                   if (pt.impactLine) map.removeLayer(pt.impactLine);
                   if (pt.impactMarker) map.removeLayer(pt.impactMarker);
                   if (pt.bombCircle) map.removeLayer(pt.bombCircle);
                   if (pt.rocketCircle) map.removeLayer(pt.rocketCircle);
                   if (pt.bulletsCircle) map.removeLayer(pt.bulletsCircle);
                   tacticalPoints[m].splice(ptIndex, 1);
                   updateTacticalList(m);
               }
           });
       });
   };
});





