// --- AIRCRAFT TELEMETRY PLAYBACK LOGIC (MULTI-TRACK) ---
document.addEventListener('DOMContentLoaded', () => {
    const uploadInput = document.getElementById('telemetry-txt-upload');
    const loadBtn = document.getElementById('btn-load-telemetry');
    const playPauseBtn = document.getElementById('btn-play-pause-telemetry');
    const sliderGroup = document.getElementById('telemetry-slider-group');
    const slider = document.getElementById('telemetry-slider');
    const timeDisplay = document.getElementById('telemetry-time-display');
    const speedSelect = document.getElementById('telemetry-speed-select');
    const tracksContainer = document.getElementById('telemetry-tracks-container');
    const trailControls = document.getElementById('telemetry-trail-controls');
    const trailInput = document.getElementById('telemetry-trail-input');
    const leadInput = document.getElementById('telemetry-lead-input');
    const forward10xBtn = document.getElementById('btn-forward-10x');
    const rewind10xBtn = document.getElementById('btn-rewind-10x');

    // Make controls visible by default so manual timing works without airplanes
    if (playPauseBtn) playPauseBtn.style.display = 'block';
    if (forward10xBtn) forward10xBtn.style.display = 'flex';
    if (rewind10xBtn) rewind10xBtn.style.display = 'flex';
    if (sliderGroup) sliderGroup.style.display = 'flex';
    if (timeDisplay) timeDisplay.style.display = 'block';
    if (speedSelect) speedSelect.style.display = 'block';
    if (trailControls) trailControls.style.display = 'flex';

    window.timelineStartMs = 0;
    window.timelineEndMs = 86400000;

    const timelineConfigBtn = document.getElementById('btn-timeline-config');
    const timelineConfigModal = document.getElementById('timeline-config-modal');
    const closeTimelineModalBtn = document.getElementById('btn-close-timeline-modal');
    const resetTimelineWindowBtn = document.getElementById('btn-reset-timeline-window');
    const applyTimelineWindowBtn = document.getElementById('btn-apply-timeline-window');
    const timelineStartInput = document.getElementById('timeline-start-input');
    const timelineEndInput = document.getElementById('timeline-end-input');

    if (timelineConfigBtn) timelineConfigBtn.style.display = 'flex';

    let loadedTracks = []; // { id, name, data, color, marker, polyline }
    let globalStartTime = 0;
    let globalEndTime = 0;
    
    let isPlaying = false;
    let playbackSpeed = 1;
    let currentRelativeTimeMs = 0; // Relative to global start
    let lastAnimFrameTime = 0;
    let lastUIUpdateTime = 0;
    let animFrameId = null;
    window.getCurrentTelemetryTime = () => globalStartTime + currentRelativeTimeMs;
    
    const parseTimeStr = (tStr) => {
        if (!tStr) return null;
        const parts = tStr.split(':');
        if (parts.length < 2) return null;
        let secs = 0;
        if (parts.length >= 3) {
            secs = parseInt(parts[2]) || 0;
        }
        return (parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + secs) * 1000;
    };
    
    const formatMsToTime = (ms, includeSeconds = true) => {
        const totalSecs = Math.max(0, Math.floor(ms / 1000));
        const hrs = Math.floor(totalSecs / 3600) % 24;
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        if (includeSeconds) {
            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };
    
    window.getAirplaneSVG = function(type, color, heading = 0) {
        if (type === 'JTAC') {
            return `<img src="jtac.png" style="width: 40px; height: 40px; display: block;" />`;
        }
        if (type === 'Grupamento' || type === 'Tropa') {
            return `<svg viewBox="0 0 100 100" width="40" height="40" style="color: ${color}; filter: drop-shadow(0px 0px 5px ${color}); transform-origin: center;">
                <rect x="25" y="25" width="50" height="50" fill="${color}" stroke="#fff" stroke-width="3" rx="4"/>
            </svg>`;
        }
        if (type === 'H-60') {
            return `<svg viewBox="0 0 100 100" width="40" height="40" style="color: ${color}; transform: rotate(${heading}deg); filter: drop-shadow(0px 0px 5px ${color}); transform-origin: center;">
                <path d="M 46 15 L 54 15 L 57 40 L 53 80 L 47 80 L 43 40 Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
                <circle cx="50" cy="45" r="35" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="10, 10" opacity="0.8"/>
                <line x1="50" y1="10" x2="50" y2="80" stroke="#fff" stroke-width="1.5" opacity="0.6"/>
                <line x1="15" y1="45" x2="85" y2="45" stroke="#fff" stroke-width="1.5" opacity="0.6"/>
                <path d="M 47 80 L 53 80 L 51 90 L 49 90 Z" fill="currentColor" stroke="#fff" stroke-width="1"/>
                <line x1="45" y1="88" x2="55" y2="88" stroke="#fff" stroke-width="2"/>
                <path d="M 48 22 L 52 22 L 53 30 L 47 30 Z" fill="#111" stroke="#fff" stroke-width="0.5"/>
            </svg>`;
        }
        if (type === 'RQ-900') {
            return `<svg viewBox="0 0 100 100" width="40" height="40" style="color: ${color}; transform: rotate(${heading}deg); filter: drop-shadow(0px 0px 5px ${color}); transform-origin: center;">
                <path d="M 48 10 C 48 5, 52 5, 52 10 L 52 80 C 52 85, 48 85, 48 80 Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
                <rect x="5" y="42" width="90" height="4" fill="currentColor" stroke="#fff" stroke-width="1.5"/>
                <path d="M 50 75 L 35 90 L 40 92 L 50 82 L 60 92 L 65 90 Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
                <line x1="45" y1="90" x2="55" y2="90" stroke="#fff" stroke-width="2"/>
                <circle cx="50" cy="15" r="4" fill="#111" stroke="#fff" stroke-width="0.5"/>
            </svg>`;
        }
        if (type === 'SC-105') {
            return `<svg viewBox="0 0 100 100" width="40" height="40" style="color: ${color}; transform: rotate(${heading}deg); filter: drop-shadow(0px 0px 5px ${color}); transform-origin: center;">
                <!-- Wings -->
                <path d="M 44.5 36 L 3 37.5 C 1.5 37.5, 1.5 41.5, 3 41.5 L 44.5 44 Z M 55.5 36 L 97 37.5 C 98.5 37.5, 98.5 41.5, 97 41.5 L 55.5 44 Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
                <!-- Tailplane -->
                <path d="M 44.5 81 L 24 82 C 22.5 82, 22.5 86, 24 86 L 44.5 85 Z M 55.5 81 L 76 82 C 77.5 82, 77.5 86, 76 86 L 55.5 85 Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
                <!-- Fuselage with Sponsons -->
                <path d="M 50 8 C 47 8, 44.5 12, 44.5 16 L 44.5 40 C 40 42, 40 58, 44.5 60 L 44.5 82 C 44.5 86, 48 92, 49.5 96 L 50.5 96 C 52 92, 55.5 86, 55.5 82 L 55.5 60 C 60 58, 60 42, 55.5 40 L 55.5 16 C 55.5 12, 53 8, 50 8 Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
                <!-- Engine Nacelles -->
                <rect x="25.5" y="32" width="5" height="15" rx="1.5" fill="currentColor" stroke="#fff" stroke-width="1"/>
                <rect x="69.5" y="32" width="5" height="15" rx="1.5" fill="currentColor" stroke="#fff" stroke-width="1"/>
                <!-- Propeller Spinner Caps -->
                <path d="M 26.5 32 C 26.5 30, 29.5 30, 29.5 32 Z" fill="currentColor" stroke="#fff" stroke-width="0.8"/>
                <path d="M 70.5 32 C 70.5 30, 73.5 30, 73.5 32 Z" fill="currentColor" stroke="#fff" stroke-width="0.8"/>
                <!-- Propellers -->
                <line x1="19" y1="32" x2="37" y2="32" stroke="#fff" stroke-width="2"/>
                <line x1="63" y1="32" x2="81" y2="32" stroke="#fff" stroke-width="2"/>
                <!-- Cockpit Window -->
                <path d="M 47.5 16 C 47.5 14, 52.5 14, 52.5 16 L 53.5 21 C 53.5 22, 46.5 22, 46.5 21 Z" fill="#111" stroke="#fff" stroke-width="0.8"/>
            </svg>`;
        }
        
        return `<svg viewBox="0 0 100 100" width="40" height="40" style="color: ${color}; transform: rotate(${heading}deg); filter: drop-shadow(0px 0px 5px ${color}); transform-origin: center;">
            <path d="M 50 2 L 48 6 L 45 28 L 10 28 C 8 28, 8 40, 10 40 L 45 45 L 47 82 L 22 82 C 20 82, 20 88, 22 88 L 48 88 L 50 95 L 52 88 L 78 88 C 80 88, 80 82, 78 82 L 53 82 L 55 45 L 90 40 C 92 40, 92 28, 90 28 L 55 28 L 52 6 Z" fill="currentColor" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/>
            <line x1="38" y1="6" x2="62" y2="6" stroke="#fff" stroke-width="2" />
            <path d="M 47 30 C 47 25, 53 25, 53 30 L 53 48 C 53 53, 47 53, 47 48 Z" fill="#111" stroke="#fff" stroke-width="0.5"/>
        </svg>`;
    };
    window.flashAirplanes = function() {
        loadedTracks.forEach(track => {
            if (track.marker && track.marker._icon) {
                const elem = track.marker._icon.querySelector('svg, img');
                if (elem) {
                    const originalColor = elem.style.color;
                    const originalFilter = elem.style.filter;
                    elem.style.color = '#ff0000';
                    elem.style.filter = 'drop-shadow(0px 0px 15px #ff0000)';
                    setTimeout(() => {
                        elem.style.color = originalColor;
                        elem.style.filter = originalFilter;
                    }, 500);
                }
            }
        });
    };
    let telemetryLayer = null;

    // Palette for random colors
    const colors = ['#0033cc', '#00ff00', '#ff3333', '#ffff00', '#ffffff', '#ffa500', '#ff00ff'];
    let colorIndex = 0;

    // Handle Upload Click
    // Handle Upload Click (Bottom Bar)
    if (loadBtn && uploadInput) {
        loadBtn.addEventListener('click', () => {
            uploadInput.click();
        });
        
        uploadInput.addEventListener('change', (e) => {
            Array.from(e.target.files).forEach(file => {
                const fileName = file.name;
                const reader = new FileReader();
                reader.onload = (event) => {
                    parseTelemetryFile(event.target.result, fileName);
                };
                reader.readAsText(file);
            });
            uploadInput.value = ''; // Reset
        });
    }

    // Handle Upload Click (Debriefing Menu)
    const debriefRotasUpload = document.getElementById('debrief-rotas-upload');
    const debriefRotasBtn = document.getElementById('btn-debrief-load-rotas');
    if (debriefRotasBtn && debriefRotasUpload) {
        debriefRotasBtn.addEventListener('click', () => debriefRotasUpload.click());
        debriefRotasUpload.addEventListener('change', (e) => {
            Array.from(e.target.files).forEach(file => {
                const fileName = file.name;
                const reader = new FileReader();
                reader.onload = (event) => {
                    parseTelemetryFile(event.target.result, fileName);
                };
                reader.readAsText(file);
            });
            debriefRotasUpload.value = ''; // Reset
        });
    }

    function addTelemetryTrackPill(track) {
        if (!tracksContainer) return;
        const pill = document.createElement('div');
        pill.style.cssText = `background: rgba(0,0,0,0.8); border: 1px solid ${track.color}; border-radius: 15px; padding: 4px 10px; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: white; position: relative;`;
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = track.name.includes('.') ? track.name.split('.')[0].substring(0, 3).toUpperCase() : track.name;
        nameSpan.style.cursor = 'pointer';
        nameSpan.title = 'Focar câmera nesta aeronave';
        nameSpan.addEventListener('click', () => {
            if (track.marker && track.marker.getLatLng) {
                const latlng = track.marker.getLatLng();
                if (latlng && latlng.lat && latlng.lng) {
                    map.setView(latlng, 15, { animate: true });
                }
            }
        });
        
        const removeBtn = document.createElement('i');
        removeBtn.className = 'fa-solid fa-times';
        removeBtn.style.cursor = 'pointer';
        removeBtn.title = 'Remover voo';
        removeBtn.addEventListener('click', () => {
            telemetryLayer.removeLayer(track.marker);
            telemetryLayer.removeLayer(track.polyline);
            loadedTracks = loadedTracks.filter(t => t.id !== track.id);
            pill.remove();
            updateGlobalTimeline();
            if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();
            if (loadedTracks.length === 0 && isPlaying) {
                togglePlay();
            }
            updateAllAirplanes();
        });

        const predefinedColors = {
            'Azul': '#0033cc',
            'Verde': '#00ff00',
            'Vermelho': '#ff3333',
            'Amarelo': '#ffff00',
            'Branco': '#ffffff',
            'Laranja': '#ffa500',
            'Roxo': '#ff00ff'
        };

        const colorBtn = document.createElement('div');
        colorBtn.style.cssText = `background: ${track.color}; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; border: 2px solid rgba(255,255,255,0.8); flex-shrink: 0; box-shadow: 0 0 5px rgba(0,0,0,0.5);`;

        const colorPopup = document.createElement('div');
        colorPopup.style.cssText = `display: none; position: absolute; bottom: calc(100% + 10px); left: 0; background: rgba(10,10,10,0.95); border: 1px solid var(--primary); border-radius: 8px; padding: 8px; gap: 6px; z-index: 2000; flex-wrap: wrap; width: 84px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); cursor: default;`;

        for (let [name, hex] of Object.entries(predefinedColors)) {
            let dot = document.createElement('div');
            dot.style.cssText = `width: 18px; height: 18px; border-radius: 50%; background: ${hex}; cursor: pointer; border: 2px solid transparent; transition: 0.2s;`;
            if (hex === track.color) dot.style.borderColor = 'white';
            
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                track.color = hex;
                colorBtn.style.background = hex;
                pill.style.borderColor = hex;
                
                Array.from(colorPopup.children).forEach(c => c.style.borderColor = 'transparent');
                dot.style.borderColor = 'white';
                
                const newIcon = L.divIcon({
                    className: 'custom-airplane-icon',
                    html: window.getAirplaneSVG(track.type || 'Aeronave', track.color, 0),
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                });
                track.marker.setIcon(newIcon);
                track.polyline.setStyle({ color: track.color });
                
                updateAllAirplanes();
                if (typeof window.syncEmploymentColorsWithTracks === 'function') {
                    window.syncEmploymentColorsWithTracks();
                }
                
                colorPopup.style.display = 'none';
            });
            colorPopup.appendChild(dot);
        }

        colorBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            colorPopup.style.display = colorPopup.style.display === 'none' ? 'flex' : 'none';
        });

        document.addEventListener('click', () => {
            colorPopup.style.display = 'none';
        });

        pill.appendChild(colorPopup);
        pill.appendChild(colorBtn);
        pill.appendChild(nameSpan);
        pill.appendChild(removeBtn);
        tracksContainer.appendChild(pill);
    }

    function parseTelemetryFile(content, fileName) {
        if (!telemetryLayer && window.map) { telemetryLayer = L.layerGroup().addTo(window.map); }
        const lines = content.split('\n');
        let trackData = [];
        const decInput = document.getElementById('mag-declination');
        const dec = decInput ? parseFloat(decInput.value) || 0 : 0;

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            if (parts.length > 10) {
                const absoluteTimeMs = parseInt(parts[0]);
                const d = new Date(absoluteTimeMs);
                const timeMs = (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()) * 1000 + d.getMilliseconds();
                const lat = parseFloat(parts[4]);
                const lng = parseFloat(parts[5]);
                const hdg = parseFloat(parts[10]);
                const ias = parts.length > 18 ? parseFloat(parts[18]) : 0;
                const alt = parts.length > 24 ? parseFloat(parts[24]) : 0;

                if (!isNaN(timeMs) && !isNaN(lat) && !isNaN(lng)) {
                    // Converter proa magnética do arquivo para proa verdadeira
                    // Verdadeira = Magnética + Declinação
                    const trueHdg = isNaN(hdg) ? 0 : (hdg + dec + 360) % 360;
                    trackData.push({ timeMs, lat, lng, hdg: trueHdg, ias: isNaN(ias) ? 0 : ias, alt: isNaN(alt) ? 0 : alt });
                }
            }
        });

        if (trackData.length === 0) {
            alert('Falha ao processar arquivo. Verifique se o formato está correto.');
            return;
        }

        // Sort by time
        trackData.sort((a, b) => a.timeMs - b.timeMs);
        const uniqueTrackData = [];
        for (let i = 0; i < trackData.length; i++) {
            if (i === 0 || trackData[i].timeMs !== trackData[i - 1].timeMs) {
                uniqueTrackData.push(trackData[i]);
            }
        }
        const sortedUniqueData = uniqueTrackData;

        const trackColor = colors[colorIndex % colors.length];
        colorIndex++;

        const trackId = 'track-' + Date.now();
        
        // Create Marker
        const airplaneIcon = L.divIcon({
            className: 'custom-airplane-icon',
            html: window.getAirplaneSVG('Aeronave', trackColor, 0),
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const trackMarker = L.marker([sortedUniqueData[0].lat, sortedUniqueData[0].lng], { icon: airplaneIcon, zIndexOffset: 1000 }).addTo(telemetryLayer);
        const polyline = L.polyline([], { color: trackColor, weight: 3, opacity: 0.8 }).addTo(telemetryLayer);

        const track = {
            id: trackId,
            name: fileName,
            data: sortedUniqueData,
            color: trackColor,
            marker: trackMarker,
            polyline: polyline,
            type: 'Aeronave',
            role: 'Ás'
        };

        loadedTracks.push(track);
        
        updateGlobalTimeline();
        if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();

        // Create UI Pill
        addTelemetryTrackPill(track);
    }

    function updateGlobalTimeline() {
        globalStartTime = 0;
        slider.min = window.timelineStartMs;
        slider.max = window.timelineEndMs;
        updateTimeDisplay();
        updateAllAirplanes();
        if (typeof window.updateTimelineMarkers === 'function') window.updateTimelineMarkers();
        if (typeof window.syncEmploymentColorsWithTracks === 'function') {
            window.syncEmploymentColorsWithTracks();
        }
    }

    // Playback Controls
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlay);
    }
    
    if (speedSelect) {
        speedSelect.addEventListener('change', (e) => {
            playbackSpeed = parseFloat(e.target.value);
        });
    }

    if (forward10xBtn) {
        forward10xBtn.addEventListener('click', () => {
            const advanceMs = playbackSpeed * 10 * 1000;
            currentRelativeTimeMs = Math.max(window.timelineStartMs, Math.min(window.timelineEndMs, currentRelativeTimeMs + advanceMs));
            if (slider) {
                slider.value = currentRelativeTimeMs;
            }
            updateTimeDisplay();
            updateAllAirplanes();
        });
    }

    if (rewind10xBtn) {
        rewind10xBtn.addEventListener('click', () => {
            const rewindMs = playbackSpeed * 10 * 1000;
            currentRelativeTimeMs = Math.max(window.timelineStartMs, Math.min(window.timelineEndMs, currentRelativeTimeMs - rewindMs));
            if (slider) {
                slider.value = currentRelativeTimeMs;
            }
            updateTimeDisplay();
            updateAllAirplanes();
        });
    }

    if (slider) {
        slider.addEventListener('input', (e) => {
            currentRelativeTimeMs = parseInt(e.target.value);
            updateTimeDisplay();
            updateAllAirplanes();
        });
    }

    if (timeDisplay) {
        timeDisplay.addEventListener('change', (e) => {
            const val = e.target.value; // HH:MM:SS
            if (!val) return;
            const parts = val.split(':');
            const h = parseInt(parts[0] || 0);
            const m = parseInt(parts[1] || 0);
            const s = parseInt(parts[2] || 0);
            const msSinceMidnight = (h * 3600 + m * 60 + s) * 1000;
            
            currentRelativeTimeMs = Math.max(window.timelineStartMs, Math.min(window.timelineEndMs, msSinceMidnight));
            slider.value = currentRelativeTimeMs;
            
            updateTimeDisplay();
            updateAllAirplanes();
        });
    }
    
    [trailInput, leadInput].forEach(inp => {
        if(inp) inp.addEventListener('input', updateAllAirplanes);
    });

    // Time Window Config Modal Actions
    function formatMsToTimeString(ms) {
        const totalSec = Math.floor(ms / 1000);
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    function parseTimeToMs(timeStr) {
        if (!timeStr) return 0;
        const parts = timeStr.split(':');
        const h = parseInt(parts[0] || 0);
        const m = parseInt(parts[1] || 0);
        const s = parseInt(parts[2] || 0);
        return (h * 3600 + m * 60 + s) * 1000;
    }

    if (timelineConfigBtn && timelineConfigModal) {
        timelineConfigBtn.addEventListener('click', () => {
            timelineStartInput.value = formatMsToTimeString(window.timelineStartMs);
            timelineEndInput.value = formatMsToTimeString(window.timelineEndMs);
            timelineConfigModal.style.display = 'flex';
        });
    }

    if (closeTimelineModalBtn && timelineConfigModal) {
        closeTimelineModalBtn.addEventListener('click', () => {
            timelineConfigModal.style.display = 'none';
        });
    }

    if (resetTimelineWindowBtn && timelineConfigModal) {
        resetTimelineWindowBtn.addEventListener('click', () => {
            window.timelineStartMs = 0;
            window.timelineEndMs = 86400000;
            slider.min = window.timelineStartMs;
            slider.max = window.timelineEndMs;
            if (currentRelativeTimeMs < window.timelineStartMs || currentRelativeTimeMs > window.timelineEndMs) {
                currentRelativeTimeMs = window.timelineStartMs;
                slider.value = currentRelativeTimeMs;
            }
            updateTimeDisplay();
            updateAllAirplanes();
            if (typeof window.updateTimelineMarkers === 'function') window.updateTimelineMarkers();
            timelineConfigModal.style.display = 'none';
        });
    }

    if (applyTimelineWindowBtn && timelineConfigModal) {
        applyTimelineWindowBtn.addEventListener('click', () => {
            const startMs = parseTimeToMs(timelineStartInput.value);
            const endMs = parseTimeToMs(timelineEndInput.value);
            
            if (startMs >= endMs) {
                alert("O horário de início deve ser menor que o horário de fim.");
                return;
            }
            
            window.timelineStartMs = startMs;
            window.timelineEndMs = endMs;
            
            slider.min = window.timelineStartMs;
            slider.max = window.timelineEndMs;
            
            if (currentRelativeTimeMs < window.timelineStartMs || currentRelativeTimeMs > window.timelineEndMs) {
                currentRelativeTimeMs = window.timelineStartMs;
                slider.value = currentRelativeTimeMs;
            }
            
            updateTimeDisplay();
            updateAllAirplanes();
            if (typeof window.updateTimelineMarkers === 'function') window.updateTimelineMarkers();
            timelineConfigModal.style.display = 'none';
        });
    }

    // Timeline markers function
    window.updateTimelineMarkers = function() {
        const container = document.getElementById('telemetry-timeline-markers');
        if (!container) return;
        container.innerHTML = '';
        
        const startMs = window.timelineStartMs || 0;
        const endMs = window.timelineEndMs || 86400000;
        const range = endMs - startMs;
        if (range <= 0) return;
        
        const employments = window.savedEmployments || [];
        employments.forEach(emp => {
            const timeMs = emp.telemetryTimeMs;
            if (timeMs >= startMs && timeMs <= endMs) {
                const pct = ((timeMs - startMs) / range) * 100;
                const marker = document.createElement('div');
                marker.className = 'timeline-marker-wd';
                marker.style.left = `${pct}%`;
                marker.title = `Emprego: ${emp.name} (${emp.weapon})`;
                container.appendChild(marker);
            }
        });
    };

    function togglePlay() {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
            lastAnimFrameTime = performance.now();
            lastUIUpdateTime = 0; // Force immediate update
            animFrameId = requestAnimationFrame(playbackLoop);
            
            // If finished, restart
            if (currentRelativeTimeMs >= window.timelineEndMs) {
                currentRelativeTimeMs = window.timelineStartMs;
                slider.value = currentRelativeTimeMs;
            }
        } else {
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            cancelAnimationFrame(animFrameId);
            slider.value = currentRelativeTimeMs;
            updateTimeDisplay();
        }
    }

    function playbackLoop(timestamp) {
        if (!isPlaying) return;

        const deltaMs = timestamp - lastAnimFrameTime;
        lastAnimFrameTime = timestamp;

        currentRelativeTimeMs += (deltaMs * playbackSpeed);
        
        if (currentRelativeTimeMs >= window.timelineEndMs) {
            currentRelativeTimeMs = window.timelineEndMs;
            togglePlay(); // Pause at end
        }

        if (timestamp - lastUIUpdateTime > 100) {
            slider.value = currentRelativeTimeMs;
            updateTimeDisplay();
            lastUIUpdateTime = timestamp;
        }
        updateAllAirplanes();

        if (isPlaying) {
            animFrameId = requestAnimationFrame(playbackLoop);
        }
    }

    function updateTimeDisplay() {
        if (!timeDisplay) return;
        globalStartTime = 0;
        slider.min = window.timelineStartMs;
        slider.max = window.timelineEndMs;
        
        let ms = Math.max(window.timelineStartMs, Math.min(window.timelineEndMs, currentRelativeTimeMs));
        
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        timeDisplay.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateAllAirplanes() {
        if (window.onTelemetryTimeUpdate) window.onTelemetryTimeUpdate(globalStartTime + currentRelativeTimeMs);
        if (loadedTracks.length === 0) return;

        const currentGlobalTime = globalStartTime + currentRelativeTimeMs;
        const trailMs = (parseInt(trailInput?.value) || 0) * 1000;
        const leadMs = (parseInt(leadInput?.value) || 0) * 1000;

        const interpolateHeading = (hdg1, hdg2, f) => {
            let diff = (hdg2 - hdg1 + 360) % 360;
            if (diff > 180) diff -= 360;
            return (hdg1 + diff * f + 360) % 360;
        };

        loadedTracks.forEach(track => {
            let isVisible = true;
            if (track.enableSpawnDespawn) {
                const spawnMs = parseTimeStr(track.spawnTime);
                const despawnMs = parseTimeStr(track.despawnTime);
                if (spawnMs !== null && despawnMs !== null) {
                    if (currentGlobalTime < spawnMs || currentGlobalTime > despawnMs) {
                        isVisible = false;
                    }
                }
            }

            if (!isVisible) {
                if (typeof telemetryLayer !== 'undefined' && telemetryLayer) {
                    if (telemetryLayer.hasLayer(track.marker)) telemetryLayer.removeLayer(track.marker);
                    if (telemetryLayer.hasLayer(track.polyline)) telemetryLayer.removeLayer(track.polyline);
                } else if (typeof map !== 'undefined' && map) {
                    if (map.hasLayer(track.marker)) map.removeLayer(track.marker);
                    if (map.hasLayer(track.polyline)) map.removeLayer(track.polyline);
                }
                return; // Skip updating hidden track
            } else {
                if (typeof telemetryLayer !== 'undefined' && telemetryLayer) {
                    if (!telemetryLayer.hasLayer(track.marker)) telemetryLayer.addLayer(track.marker);
                    if (!telemetryLayer.hasLayer(track.polyline)) telemetryLayer.addLayer(track.polyline);
                } else if (typeof map !== 'undefined' && map) {
                    if (!map.hasLayer(track.marker)) map.addLayer(track.marker);
                    if (!map.hasLayer(track.polyline)) map.addLayer(track.polyline);
                }
            }

            const data = track.data;
            const p1Idx = findInterpolationIndex(data, currentGlobalTime);
            
            let currentLat, currentLng, currentHdg, currentIas, currentAlt;

            if (p1Idx === -1) { // Before start
                currentLat = data[0].lat; currentLng = data[0].lng; currentHdg = data[0].hdg; currentIas = data[0].ias; currentAlt = data[0].alt;
            } else if (p1Idx >= data.length - 1) { // After end
                currentLat = data[data.length-1].lat; currentLng = data[data.length-1].lng; currentHdg = data[data.length-1].hdg; currentIas = data[data.length-1].ias; currentAlt = data[data.length-1].alt;
            } else {
                const p1 = data[p1Idx];
                const p2 = data[p1Idx + 1];
                const timeDiff = p2.timeMs - p1.timeMs;
                let f = timeDiff === 0 ? 0 : (currentGlobalTime - p1.timeMs) / timeDiff;
                f = Math.max(0, Math.min(1, f));

                currentLat = p1.lat + (p2.lat - p1.lat) * f;
                currentLng = p1.lng + (p2.lng - p1.lng) * f;
                currentIas = p1.ias + (p2.ias - p1.ias) * f;
                currentAlt = p1.alt + (p2.alt - p1.alt) * f;
                
                // Interpolate heading smoothly
                let hdg1 = p1.hdg;
                let hdg2 = p2.hdg;
                
                if (hdg1 === 0 && hdg2 === 0) {
                    if (p2.lat !== p1.lat || p2.lng !== p1.lng) {
                        if (window.map) {
                            const pA = map.project([p1.lat, p1.lng]);
                            const pB = map.project([p2.lat, p2.lng]);
                            const angle = Math.atan2(pB.x - pA.x, pA.y - pB.y) * (180 / Math.PI);
                            hdg1 = (angle + 360) % 360;
                            
                            const p3 = data[p1Idx + 2];
                            if (p3 && (p3.lat !== p2.lat || p3.lng !== p2.lng)) {
                                const pC = map.project([p3.lat, p3.lng]);
                                const angleNext = Math.atan2(pC.x - pB.x, pB.y - pC.y) * (180 / Math.PI);
                                hdg2 = (angleNext + 360) % 360;
                            } else {
                                hdg2 = hdg1;
                            }
                        }
                    }
                }
                currentHdg = interpolateHeading(hdg1, hdg2, f);
            }

            // Update Marker
            track.marker.setLatLng([currentLat, currentLng]);
            const decInput = document.getElementById('mag-declination');
            const dec = decInput ? parseFloat(decInput.value) || 0 : 0;
            const magHdg = (currentHdg - dec + 360) % 360;
            
            const isTropa = (track.type === 'Grupamento' || track.type === 'JTAC' || track.type === 'Tropa');
            const displayRotation = isTropa ? 0 : ((window.isMagneticNorthUp !== false) ? magHdg : currentHdg);

            if (track.marker._icon) {
                // Remove CSS transitions to keep airplane markers perfectly aligned on their routes
                if (track.marker._icon.style.transition) {
                    track.marker._icon.style.transition = '';
                }
                const svgElem = track.marker._icon.querySelector('svg');
                if (svgElem) {
                    if (svgElem.style.transition) {
                        svgElem.style.transition = '';
                    }
                    svgElem.style.transform = `rotate(${displayRotation}deg)`;
                }
            }
            
            if (isTropa) {
                const tooltipHtml = `<b>${track.name}</b>`;
                if (tooltipHtml !== track.lastTooltipHtml) {
                    if (!track.marker.getTooltip()) {
                        track.marker.bindTooltip(tooltipHtml, { permanent: true, direction: 'top', offset: [0, -10] }).openTooltip();
                    } else {
                        track.marker.setTooltipContent(tooltipHtml);
                    }
                    track.lastTooltipHtml = tooltipHtml;
                }
            } else {
                const hdgDisplay = Math.round(magHdg).toString().padStart(3, '0');
                const tooltipHtml = `<div style="text-align:center; font-family:monospace; line-height:1.2;"><b>${track.name}</b><br>HDG: ${hdgDisplay}&deg;<br>IAS: ${Math.round(currentIas)} kt<br>ALT: ${Math.round(currentAlt)} ft</div>`;
                
                if (tooltipHtml !== track.lastTooltipHtml) {
                    if (!track.marker.getTooltip()) {
                        track.marker.bindTooltip(tooltipHtml, { direction: 'top', offset: [0, -10] });
                    } else {
                        track.marker.setTooltipContent(tooltipHtml);
                    }
                    track.lastTooltipHtml = tooltipHtml;
                }
            }

            // Draw Trajectory (Trail / Lead)
            if (trailMs === 0 && leadMs === 0) {
                track.polyline.setLatLngs([]);
            } else {
                const minTime = currentGlobalTime - trailMs;
                const maxTime = currentGlobalTime + leadMs;
                
                let pathPoints = [];
                
                // A simpler, very accurate approach for trajectory rendering:
                const precisePoints = [];
                let addedCurrent = false;
                
                for(let i=0; i < data.length; i++) {
                    if (data[i].timeMs >= minTime && data[i].timeMs <= maxTime) {
                        // If we are passing the current time, insert the interpolated point first
                        if (!addedCurrent && data[i].timeMs > currentGlobalTime) {
                            precisePoints.push([currentLat, currentLng]);
                            addedCurrent = true;
                        }
                        precisePoints.push([data[i].lat, data[i].lng]);
                    }
                    if (data[i].timeMs > maxTime) break;
                }
                
                if (!addedCurrent && minTime <= currentGlobalTime && currentGlobalTime <= maxTime) {
                    precisePoints.push([currentLat, currentLng]);
                }

                track.polyline.setLatLngs(precisePoints);
            }
        });
    }

    // Binary search to find the lower bound index
    function findInterpolationIndex(arr, targetTime) {
        if (targetTime < arr[0].timeMs) return -1;
        if (targetTime >= arr[arr.length - 1].timeMs) return arr.length;
        
        let low = 0;
        let high = arr.length - 1;
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (arr[mid].timeMs === targetTime) {
                return mid;
            } else if (arr[mid].timeMs < targetTime) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return high; // The index immediately preceding targetTime
    }

    window.updateDebriefRotasUI = function() {
        const overview = document.getElementById('debrief-rotas-overview');
        if (!overview) return;
        
        overview.innerHTML = '';
        if (loadedTracks.length === 0) {
            overview.innerHTML = '<div style="color: var(--text-dim); font-style: italic; font-size: 0.9rem; text-align: center; padding: 20px;">Nenhuma rota carregada.</div>';
            return;
        }

        loadedTracks.forEach(track => {
            // Extract trigram from fileName (e.g. ABC.txt -> ABC)
            let defaultName = track.name;
            if (track.name.includes('.')) {
                defaultName = track.name.split('.')[0].substring(0, 3).toUpperCase();
            }

            const item = document.createElement('div');
            item.style.cssText = `background: rgba(255,255,255,0.05); border-left: 4px solid ${track.color}; border-radius: 6px; padding: 10px 15px; display: flex; align-items: center; justify-content: space-between; gap: 10px; transition: 0.2s;`;

            // Info Container
            const infoGroup = document.createElement('div');
            infoGroup.style.cssText = `display: flex; align-items: center; gap: 15px; flex-grow: 1;`;

            const nameEl = document.createElement('div');
            nameEl.style.cssText = `font-weight: bold; font-size: 1.1rem; color: #fff; width: 80px; text-transform: uppercase; letter-spacing: 1px;`;
            nameEl.textContent = defaultName;

            const roleSelect = document.createElement('select');
            roleSelect.style.cssText = `background: rgba(0,0,0,0.5); color: var(--primary); border: 1px solid var(--primary); border-radius: 4px; padding: 2px 4px; font-weight: bold; outline: none; cursor: pointer; font-size: 0.8rem; width: 60px;`;
            const roles = ['Ás', '#2', '#3', '#4', 'CAA'];
            roles.forEach(r => {
                const opt = document.createElement('option');
                opt.value = r;
                opt.textContent = r;
                if (track.role === r) opt.selected = true;
                roleSelect.appendChild(opt);
            });
            roleSelect.addEventListener('change', (e) => {
                track.role = e.target.value;
            });

            const predefinedColors = {
                'Azul': '#0033cc',
                'Verde': '#00ff00',
                'Vermelho': '#ff3333',
                'Amarelo': '#ffff00',
                'Branco': '#ffffff',
                'Laranja': '#ffa500',
                'Roxo': '#ff00ff'
            };

            const colorSelect = document.createElement('select');
            colorSelect.style.cssText = `background: rgba(0,0,0,0.5); color: #fff; border: 1px solid var(--primary); border-radius: 4px; padding: 2px 4px; font-weight: bold; outline: none; cursor: pointer; font-size: 0.8rem;`;
            
            for (const [colorName, colorHex] of Object.entries(predefinedColors)) {
                const opt = document.createElement('option');
                opt.value = colorHex;
                opt.textContent = colorName;
                opt.style.background = colorHex;
                opt.style.color = (colorHex === '#ffffff' || colorHex === '#ffff00') ? '#000' : '#fff';
                // Find matching color (ignoring case/spaces just in case, but direct match should work since we assign from colors array)
                if (track.color === colorHex) {
                    opt.selected = true;
                }
                colorSelect.appendChild(opt);
            }

            colorSelect.addEventListener('change', (e) => {
                track.color = e.target.value;
                item.style.borderLeftColor = track.color;
                
                if (track.marker) {
                    const hdg = track.data && track.data.length > 0 ? track.data[0].hdg : 0;
                    const newIcon = L.divIcon({
                        className: 'custom-airplane-icon',
                        html: window.getAirplaneSVG(track.type || 'Aeronave', track.color, hdg),
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    });
                    track.marker.setIcon(newIcon);
                }
                
                if (track.polyline) {
                    track.polyline.setStyle({ color: track.color });
                }
                
                if (typeof updateAllAirplanes === 'function') updateAllAirplanes();
                if (typeof window.syncEmploymentColorsWithTracks === 'function') {
                    window.syncEmploymentColorsWithTracks();
                }

                // Sincroniza a pílula da barra inferior se existir
                const pills = document.querySelectorAll('#telemetry-tracks-container > div');
                pills.forEach(p => {
                    const span = p.querySelector('span');
                    if (span && span.textContent === defaultName) {
                        p.style.borderColor = track.color;
                        const divs = p.querySelectorAll('div');
                        divs.forEach(d => {
                            if (d.style.borderRadius === '50%') {
                                d.style.background = track.color;
                            }
                        });
                    }
                });
            });

            infoGroup.appendChild(nameEl);
            infoGroup.appendChild(roleSelect);
            infoGroup.appendChild(colorSelect);

            // Delete Action
            const delBtn = document.createElement('button');
            delBtn.style.cssText = `background: none; border: none; color: #ff3333; cursor: pointer; padding: 5px; opacity: 0.7; transition: 0.2s;`;
            delBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            delBtn.title = "Excluir Rota";
            delBtn.onmouseover = () => delBtn.style.opacity = '1';
            delBtn.onmouseout = () => delBtn.style.opacity = '0.7';
            delBtn.addEventListener('click', () => {
                if (telemetryLayer) {
                    telemetryLayer.removeLayer(track.marker);
                    telemetryLayer.removeLayer(track.polyline);
                }
                loadedTracks = loadedTracks.filter(t => t.id !== track.id);
                // Atualiza tudo
                updateGlobalTimeline();
                if (loadedTracks.length === 0 && isPlaying) togglePlay();
                updateAllAirplanes();
                
                // Remove da barra inferior
                const pills = document.querySelectorAll('#telemetry-tracks-container > div');
                pills.forEach(p => {
                    const span = p.querySelector('span');
                    if (span && span.textContent === defaultName) {
                        p.remove();
                    }
                });
                
                // Re-render
                window.updateDebriefRotasUI();
            });

            item.appendChild(infoGroup);
            item.appendChild(delBtn);
            overview.appendChild(item);
        });
    };

    window.removeSimulatedTrack = function(trackId) {
        const existingIdx = loadedTracks.findIndex(t => t.id === trackId);
        if (existingIdx > -1) {
            const t = loadedTracks[existingIdx];
            if (typeof telemetryLayer !== 'undefined' && telemetryLayer) {
                telemetryLayer.removeLayer(t.marker);
                telemetryLayer.removeLayer(t.polyline);
            } else if (typeof map !== 'undefined' && map) {
                map.removeLayer(t.marker);
                map.removeLayer(t.polyline);
            }
            loadedTracks.splice(existingIdx, 1);
            const pill = document.getElementById('pill-' + trackId);
            if (pill) pill.remove();
        }
    };

    window.generateSimulatedTrack = function(params) {
        try {
            if (!window.parseCoordsToLatLng) {
                console.error("parseCoordsToLatLng not found");
                return false;
            }


        if (params.category === 'Tropa') {
            if (!params.tropaPoints || params.tropaPoints.length === 0) {
                console.error("No points defined for Tropa");
                return false;
            }
            
            let trackData = [];
            const speedKts = 5;
            const speedMs = speedKts * 0.514444; // 2.57222 m/s
            
            let pts = [];
            params.tropaPoints.forEach(pt => {
                const timeMs = parseTimeStr(pt.timeStr);
                if (timeMs !== null) {
                    pts.push({
                        lat: pt.lat,
                        lng: pt.lng,
                        timeMs: timeMs,
                        timeStr: pt.timeStr
                    });
                }
            });
            
            if (pts.length === 0) {
                alert("Nenhum horário de passagem válido preenchido!");
                return false;
            }
            
            pts.sort((a, b) => a.timeMs - b.timeMs);
            
            const getHeading = (pt1, pt2) => {
                const lat1 = pt1.lat * Math.PI / 180;
                const lat2 = pt2.lat * Math.PI / 180;
                const dLon = (pt2.lng - pt1.lng) * Math.PI / 180;
                const y = Math.sin(dLon) * Math.cos(lat2);
                const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
                const brng = Math.atan2(y, x);
                return (brng * 180 / Math.PI + 360) % 360;
            };
            
            for (let i = 0; i < pts.length; i++) {
                const currentPt = pts[i];
                if (i === pts.length - 1) {
                    let lastHdg = i > 0 ? getHeading(pts[i-1], currentPt) : 0;
                    trackData.push({
                        lat: currentPt.lat,
                        lng: currentPt.lng,
                        timeMs: currentPt.timeMs,
                        hdg: lastHdg,
                        ias: 0,
                        alt: 0
                    });
                } else {
                    const nextPt = pts[i+1];
                    const distM = L.latLng(currentPt.lat, currentPt.lng).distanceTo(L.latLng(nextPt.lat, nextPt.lng));
                    const travelTimeMs = (distM / speedMs) * 1000;
                    const timeDiffMs = nextPt.timeMs - currentPt.timeMs;
                    const hdg = getHeading(currentPt, nextPt);
                    
                    if (timeDiffMs >= travelTimeMs) {
                        trackData.push({
                            lat: currentPt.lat,
                            lng: currentPt.lng,
                            timeMs: currentPt.timeMs,
                            hdg: hdg,
                            ias: 0,
                            alt: 0
                        });
                        trackData.push({
                            lat: currentPt.lat,
                            lng: currentPt.lng,
                            timeMs: nextPt.timeMs - travelTimeMs,
                            hdg: hdg,
                            ias: 5,
                            alt: 0
                        });
                    } else {
                        const actualSpeedKts = (distM / (timeDiffMs / 1000)) / 0.514444;
                        trackData.push({
                            lat: currentPt.lat,
                            lng: currentPt.lng,
                            timeMs: currentPt.timeMs,
                            hdg: hdg,
                            ias: actualSpeedKts,
                            alt: 0
                        });
                    }
                }
            }
            
            const trackId = params.id || 'sim_' + Date.now();
            const trackColor = params.color || '#00d2ff';
            if (params.id) { window.removeSimulatedTrack(params.id); }
            
            let iconHtml = window.getAirplaneSVG(params.type, trackColor, 0);
            let iconSize = [40, 40];
            let iconAnchor = [20, 20];
            
            const marker = L.marker([trackData[0].lat, trackData[0].lng], {
                icon: L.divIcon({
                    className: 'custom-airplane-icon',
                    html: iconHtml,
                    iconSize: iconSize,
                    iconAnchor: iconAnchor
                })
            });
            
            const polyline = L.polyline([], { color: trackColor, weight: 2, dashArray: '5, 5', opacity: 0.6 });
            
            if (!telemetryLayer && window.map) { telemetryLayer = L.layerGroup().addTo(window.map); }
            if (telemetryLayer && map.hasLayer(telemetryLayer)) {
                telemetryLayer.addLayer(marker);
                telemetryLayer.addLayer(polyline);
            } else {
                marker.addTo(map);
                polyline.addTo(map);
            }
            
            const newTrack = {
                id: trackId,
                name: params.name,
                color: trackColor,
                data: trackData,
                marker: marker,
                polyline: polyline,
                type: params.type || 'Tropa',
                enableSpawnDespawn: params.enableSpawnDespawn || false,
                spawnTime: params.spawnTime || '',
                despawnTime: params.despawnTime || ''
            };
            
            loadedTracks.push(newTrack);
            
            if (typeof updateGlobalTimeline === 'function') updateGlobalTimeline();
            
            const tStartMs = pts[0].timeMs;
            const slider = document.getElementById('telemetry-slider');
            if (slider && typeof globalStartTime !== 'undefined') {
                let offsetMs = tStartMs - globalStartTime;
                if (offsetMs >= slider.min && offsetMs <= slider.max) {
                    slider.value = offsetMs;
                    if (typeof currentRelativeTimeMs !== 'undefined') currentRelativeTimeMs = offsetMs;
                } else {
                    slider.value = slider.min;
                    if (typeof currentRelativeTimeMs !== 'undefined') currentRelativeTimeMs = slider.min;
                }
            }
            
            if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();
            if (typeof updateAllAirplanes === 'function') updateAllAirplanes();
            
            const pillsContainer = document.getElementById('telemetry-tracks-container');
            if (pillsContainer) {
                const pill = document.createElement('div');
                pill.id = 'pill-' + trackId;
                pill.style.cssText = `background: rgba(0,0,0,0.8); border: 1px solid ${trackColor}; border-radius: 15px; padding: 4px 10px; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: white; position: relative;`;
                
                const colorBtn = document.createElement('div');
                colorBtn.style.cssText = `background: ${trackColor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); flex-shrink: 0; box-shadow: 0 0 5px rgba(0,0,0,0.5);`;
                
                const label = document.createElement('span');
                label.textContent = params.name;
                label.style.fontWeight = 'bold';
                label.style.cursor = 'pointer';
                label.title = 'Focar câmera nesta tropa';
                label.addEventListener('click', () => {
                    if (newTrack.marker && newTrack.marker.getLatLng) {
                        const latlng = newTrack.marker.getLatLng();
                        if (latlng && latlng.lat && latlng.lng) {
                            map.setView(latlng, 15, { animate: true });
                        }
                    }
                });
                
                const removeBtn = document.createElement('i');
                removeBtn.className = 'fa-solid fa-times';
                removeBtn.title = 'Remover tropa';
                removeBtn.style.cssText = `cursor: pointer; color: #ff3333; margin-left: 5px;`;
                
                removeBtn.addEventListener('click', () => {
                    if (telemetryLayer) {
                        telemetryLayer.removeLayer(newTrack.marker);
                        telemetryLayer.removeLayer(newTrack.polyline);
                    } else {
                        map.removeLayer(newTrack.marker);
                        map.removeLayer(newTrack.polyline);
                    }
                    loadedTracks = loadedTracks.filter(t => t.id !== trackId);
                    pill.remove();
                    if (typeof updateGlobalTimeline === 'function') updateGlobalTimeline();
                    if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();
                    if (typeof updateAllAirplanes === 'function') updateAllAirplanes();
                });
                
                pill.appendChild(colorBtn);
                pill.appendChild(label);
                pill.appendChild(removeBtn);
                pillsContainer.appendChild(pill);
            }
            
            return { id: trackId, color: trackColor };
        }
        
        let tStartMs = parseTimeStr(params.takeoffTimeStr);
        let tEndMs = parseTimeStr(params.landingTimeStr);
        
        if (tStartMs === null) {
            tStartMs = currentRelativeTimeMs; // Start exactly at the current slider position!
        }
        if (tEndMs === null) {
            tEndMs = tStartMs + (2 * 3600 * 1000); // 2 hours default
        }
        if (tStartMs >= tEndMs) tEndMs = tStartMs + (2 * 3600 * 1000);
        
        let speedKts = 250;
        if (params.type === 'A-1') speedKts = 420;
        else if (params.type === 'A-29' || params.type === 'SC-105') speedKts = 210;
        else if (params.type === 'H-60' || params.type === 'RQ-900') speedKts = 120;
        const speedMs = speedKts * 0.514444;
        
        const parseCoords = (str) => {
            if (!str) return null;
            return window.parseCoordsToLatLng(str);
        };
        
        const takeoffPt = parseCoords(params.takeoffStr);
        const landingPt = parseCoords(params.landingStr) || takeoffPt;
        const anchorPt = parseCoords(params.anchorStr) || takeoffPt;
        if (!takeoffPt) return false;
        
        let routePts = [];
        if (params.routeStr) {
            const parts = params.routeStr.split(',');
            parts.forEach(p => {
                const pt = parseCoords(p);
                if (pt) routePts.push(pt);
            });
        }
        
        let trackData = [];
        
        const getHeading = (pt1, pt2) => {
            const lat1 = pt1.lat * Math.PI / 180;
            const lat2 = pt2.lat * Math.PI / 180;
            const dLon = (pt2.lng - pt1.lng) * Math.PI / 180;
            const y = Math.sin(dLon) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
            const brng = Math.atan2(y, x);
            return (brng * 180 / Math.PI + 360) % 360;
        };
        
        const movePoint = (pt, hdg, distM) => {
            const R = 6378137;
            const d = distM / R;
            const lat1 = pt.lat * Math.PI / 180;
            const lon1 = pt.lng * Math.PI / 180;
            const brng = hdg * Math.PI / 180;
            
            const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng));
            const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(lat1), Math.cos(d) - Math.sin(lat1) * Math.sin(lat2));
            return L.latLng(lat2 * 180 / Math.PI, lon2 * 180 / Math.PI);
        };
        
        let currentTime = tStartMs;
        let currentPt = takeoffPt;
        
        const decInput = document.getElementById('mag-declination');
        const magDec = decInput ? parseFloat(decInput.value) || 0 : 0;
        
        let takeoffHdg = (240 + magDec + 360) % 360;
        
        trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: takeoffHdg, ias: speedKts, alt: 3000 });
        
        let afterTakeoffPt = movePoint(currentPt, takeoffHdg, 2600);
        let dtTakeoff = (2600 / speedMs) * 1000;
        currentTime += dtTakeoff;
        currentPt = afterTakeoffPt;
        trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: takeoffHdg, ias: speedKts, alt: 10000 });
        
        let currentHdg = takeoffHdg;
        const turnRate = 3; 
        const dtTurnStep = 5000; 
        const hdgStep = turnRate * (dtTurnStep / 1000); 

        const flyToPointWithCurve = (targetPt, alt) => {
            let iter = 0;
            const maxIter = 10000;
            while (iter++ < maxIter) {
                let targetHdg = getHeading(currentPt, targetPt);
                let diffNow = (targetHdg - currentHdg + 360) % 360;
                if (diffNow <= hdgStep || diffNow >= 360 - hdgStep) {
                    currentHdg = targetHdg;
                    break;
                }
                let dirSign = diffNow < 180 ? 1 : -1;
                currentHdg = (currentHdg + (hdgStep * dirSign) + 360) % 360;
                let stepDist = speedMs * (dtTurnStep / 1000);
                
                // Prevent overshooting if very close
                let distToTgt = currentPt.distanceTo(targetPt);
                if (distToTgt < stepDist) break;
                
                currentPt = movePoint(currentPt, currentHdg, stepDist);
                currentTime += dtTurnStep;
                trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: alt });
            }
            
            if (iter >= maxIter) console.warn("flyToPointWithCurve hit max iterations");
            
            let dist = currentPt.distanceTo(targetPt);
            let dt = (dist / speedMs) * 1000;
            currentTime += dt;
            currentPt = targetPt;
            trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: alt });
        };
        
        for (let rPt of routePts) {
            flyToPointWithCurve(rPt, 15000);
        }
        
        flyToPointWithCurve(anchorPt, 20000);
        
        let anchorTimeMs = params.anchorTimeStr ? parseTimeStr(params.anchorTimeStr) : null;
        if (anchorTimeMs !== null) {
            let flightDurationToAnchor = currentTime - tStartMs;
            let actualTakeoffTimeMs = anchorTimeMs - flightDurationToAnchor;
            
            // Shift all computed track points
            trackData.forEach(p => {
                p.timeMs = p.timeMs - tStartMs + actualTakeoffTimeMs;
            });
            
            // Shift tStartMs and currentTime
            tStartMs = actualTakeoffTimeMs;
            currentTime = anchorTimeMs;
            
            // Re-calculate tEndMs if needed
            let realLandingMs = parseTimeStr(params.landingTimeStr);
            if (realLandingMs === null || realLandingMs <= tStartMs) {
                tEndMs = tStartMs + (2 * 3600 * 1000);
            } else {
                tEndMs = realLandingMs;
            }
        }
        
        let hdgAnchor = getHeading(trackData[trackData.length - 2] || takeoffPt, anchorPt);
        if (!isNaN(params.baseHeadingMag)) {
            hdgAnchor = (params.baseHeadingMag + magDec + 360) % 360;
        }
        
        let timeToLeaveAnchor = tEndMs - ((anchorPt.distanceTo(landingPt) / speedMs) * 1000);
        
        if (timeToLeaveAnchor > currentTime) {
            if (params.profile === 'hold') {
                const holdMs = (params.holdMin || 10) * 60000;
                let actualHold = Math.min(holdMs, timeToLeaveAnchor - currentTime);
                trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: hdgAnchor, ias: 0, alt: 0 });
                currentTime += actualHold;
                trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: hdgAnchor, ias: 0, alt: 0 });
            } else if (params.profile === 'racetrack') {
                const turnRate = 3; 
                const dtTurnStep = 5000; 
                const hdgStep = turnRate * (dtTurnStep / 1000); 
                const turnRadiusM = speedMs * (180 / (turnRate * Math.PI)); 
                
                let legDistM = params.rtMeasure === 'dist' ? (params.rtValue * 1852) : (params.rtValue * 60 * speedMs);
                let legDtMs = (legDistM / speedMs) * 1000;
                let currentHdg = hdgAnchor;
                
                while (currentTime < timeToLeaveAnchor) {
                    let turnCenter = movePoint(currentPt, currentHdg + 90, turnRadiusM);
                    for (let i = 0; i < 180 / hdgStep; i++) {
                        if (currentTime >= timeToLeaveAnchor) break;
                        currentHdg = (currentHdg + hdgStep) % 360;
                        let p = movePoint(turnCenter, currentHdg - 90, turnRadiusM);
                        currentTime += dtTurnStep;
                        currentPt = p;
                        trackData.push({ lat: p.lat, lng: p.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: 20000 });
                    }
                    if (currentTime >= timeToLeaveAnchor) break;
                    
                    currentPt = movePoint(currentPt, currentHdg, legDistM);
                    currentTime += legDtMs;
                    trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: 20000 });
                    if (currentTime >= timeToLeaveAnchor) break;
                    
                    turnCenter = movePoint(currentPt, currentHdg + 90, turnRadiusM);
                    for (let i = 0; i < 180 / hdgStep; i++) {
                        if (currentTime >= timeToLeaveAnchor) break;
                        currentHdg = (currentHdg + hdgStep) % 360;
                        let p = movePoint(turnCenter, currentHdg - 90, turnRadiusM);
                        currentTime += dtTurnStep;
                        currentPt = p;
                        trackData.push({ lat: p.lat, lng: p.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: 20000 });
                    }
                    if (currentTime >= timeToLeaveAnchor) break;
                    
                    currentPt = movePoint(currentPt, currentHdg, legDistM);
                    currentTime += legDtMs;
                    trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: 20000 });
                }
            } 
            else if (params.profile === 'figure8') {
                const turnRate = 3; 
                const dtTurnStep = 5000;
                const hdgStep = turnRate * (dtTurnStep / 1000);
                const turnRadiusM = speedMs * (180 / (turnRate * Math.PI));
                let currentHdg = hdgAnchor;
                
                while (currentTime < timeToLeaveAnchor) {
                    let turnCenter = movePoint(currentPt, currentHdg + 90, turnRadiusM);
                    for (let i = 0; i < 360 / hdgStep; i++) {
                        if (currentTime >= timeToLeaveAnchor) break;
                        currentHdg = (currentHdg + hdgStep) % 360;
                        let p = movePoint(turnCenter, currentHdg - 90, turnRadiusM);
                        currentTime += dtTurnStep;
                        currentPt = p;
                        trackData.push({ lat: p.lat, lng: p.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: 20000 });
                    }
                    if (currentTime >= timeToLeaveAnchor) break;
                    
                    turnCenter = movePoint(currentPt, currentHdg - 90, turnRadiusM);
                    for (let i = 0; i < 360 / hdgStep; i++) {
                        if (currentTime >= timeToLeaveAnchor) break;
                        currentHdg = (currentHdg - hdgStep + 360) % 360;
                        let p = movePoint(turnCenter, currentHdg + 90, turnRadiusM);
                        currentTime += dtTurnStep;
                        currentPt = p;
                        trackData.push({ lat: p.lat, lng: p.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: 20000 });
                    }
                }
            } 
            else if (params.profile === 'wheel') {
                const radiusM = (params.wheelRadiusNM || 3) * 1852;
                const dirSign = params.wheelDir === 'left' ? -1 : 1;
                const turnRate = (speedMs / radiusM) * (180 / Math.PI); 
                const dtTurnStep = 5000;
                const hdgStep = turnRate * (dtTurnStep / 1000);
                
                const entryAngle = hdgAnchor; 
                currentPt = movePoint(anchorPt, entryAngle, radiusM);
                currentTime += (radiusM / speedMs) * 1000;
                if (currentTime <= timeToLeaveAnchor) {
                    trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: entryAngle, ias: speedKts, alt: 20000 });
                    
                    let currentHdg = (entryAngle + (90 * dirSign) + 360) % 360; 
                    let angleFromCenter = entryAngle;
                    
                    while (currentTime < timeToLeaveAnchor) {
                        angleFromCenter = (angleFromCenter + (hdgStep * dirSign) + 360) % 360;
                        currentHdg = (currentHdg + (hdgStep * dirSign) + 360) % 360;
                        let p = movePoint(anchorPt, angleFromCenter, radiusM);
                        currentTime += dtTurnStep;
                        currentPt = p;
                        trackData.push({ lat: p.lat, lng: p.lng, timeMs: currentTime, hdg: currentHdg, ias: speedKts, alt: 20000 });
                    }
                }
            }
        }
        
        let hdgLanding = getHeading(currentPt, landingPt);
        currentTime = tEndMs;
        currentPt = landingPt;
        trackData.push({ lat: currentPt.lat, lng: currentPt.lng, timeMs: currentTime, hdg: hdgLanding, ias: speedKts, alt: 0 });
        
        const trackId = params.id || 'sim_' + Date.now();
        const trackColor = params.color || '#00d2ff';
        if (params.id) { window.removeSimulatedTrack(params.id); }
        
        let iconHtml = window.getAirplaneSVG(params.type, trackColor, trackData[0].hdg);
        let iconSize = [40, 40];
        let iconAnchor = [20, 20];
        
        const marker = L.marker([trackData[0].lat, trackData[0].lng], {
            icon: L.divIcon({
                className: 'custom-airplane-icon',
                html: iconHtml,
                iconSize: iconSize,
                iconAnchor: iconAnchor
            })
        });
        
        const polyline = L.polyline([], { color: trackColor, weight: 2, dashArray: '5, 5', opacity: 0.6 });
        
        if (!telemetryLayer && window.map) { telemetryLayer = L.layerGroup().addTo(window.map); }
        if (telemetryLayer && map.hasLayer(telemetryLayer)) {
            telemetryLayer.addLayer(marker);
            telemetryLayer.addLayer(polyline);
        } else {
            marker.addTo(map);
            polyline.addTo(map);
        }
        
        const newTrack = {
            id: trackId,
            name: params.name,
            color: trackColor,
            data: trackData,
            marker: marker,
            polyline: polyline,
            type: params.type || 'Aeronave'
        };
        
        loadedTracks.push(newTrack);
        
        if (typeof updateGlobalTimeline === 'function') updateGlobalTimeline();
        
        const slider = document.getElementById('telemetry-slider');
        if (slider && typeof globalStartTime !== 'undefined') {
            let offsetMs = tStartMs - globalStartTime;
            if (offsetMs >= slider.min && offsetMs <= slider.max) {
                slider.value = offsetMs;
                if (typeof currentRelativeTimeMs !== 'undefined') currentRelativeTimeMs = offsetMs;
            } else {
                slider.value = slider.min;
                if (typeof currentRelativeTimeMs !== 'undefined') currentRelativeTimeMs = slider.min;
            }
        }
        
        if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();
        if (typeof updateAllAirplanes === 'function') updateAllAirplanes();
        
        const pillsContainer = document.getElementById('telemetry-tracks-container');
        if (pillsContainer) {
            const pill = document.createElement('div');
            pill.id = 'pill-' + trackId;
            pill.style.cssText = `background: rgba(0,0,0,0.8); border: 1px solid ${trackColor}; border-radius: 15px; padding: 4px 10px; display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: white; position: relative;`;
            
            const colorBtn = document.createElement('div');
            colorBtn.style.cssText = `background: ${trackColor}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); flex-shrink: 0; box-shadow: 0 0 5px rgba(0,0,0,0.5);`;
            
            const label = document.createElement('span');
            label.textContent = params.name;
            label.style.fontWeight = 'bold';
            label.style.cursor = 'pointer';
            label.title = 'Focar cǽmera nesta aeronave';
            label.addEventListener('click', () => {
                if (newTrack.marker && newTrack.marker.getLatLng) {
                    const latlng = newTrack.marker.getLatLng();
                    if (latlng && latlng.lat && latlng.lng) {
                        map.setView(latlng, 15, { animate: true });
                    }
                }
            });
            
            const removeBtn = document.createElement('i');
            removeBtn.className = 'fa-solid fa-times';
            removeBtn.title = 'Remover voo';
            removeBtn.style.cssText = `cursor: pointer; color: #ff3333; margin-left: 5px;`;
            
            removeBtn.addEventListener('click', () => {
                if (telemetryLayer) {
                    telemetryLayer.removeLayer(newTrack.marker);
                    telemetryLayer.removeLayer(newTrack.polyline);
                } else {
                    map.removeLayer(newTrack.marker);
                    map.removeLayer(newTrack.polyline);
                }
                loadedTracks = loadedTracks.filter(t => t.id !== trackId);
                pill.remove();
                if (typeof updateGlobalTimeline === 'function') updateGlobalTimeline();
                if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();
                if (typeof updateAllAirplanes === 'function') updateAllAirplanes();
            });
            
            pill.appendChild(colorBtn);
            pill.appendChild(label);
            pill.appendChild(removeBtn);
            pillsContainer.appendChild(pill);
        }
        
        return { id: trackId, color: trackColor, calculatedTakeoffTime: formatMsToTime(tStartMs, true) };
        } catch (error) {
            console.error("Simulation error: ", error);
            alert("Erro ao simular: " + error.message + "\nLinha: " + error.stack);
            return false;
        }
    };

    window.getLoadedTracks = () => {
        return loadedTracks.map(t => ({
            id: t.id,
            name: t.name,
            data: t.data,
            color: t.color,
            type: t.type || 'Aeronave',
            role: t.role || 'Ás'
        }));
    };

    window.clearAllTracks = () => {
        if (telemetryLayer) {
            loadedTracks.forEach(track => {
                if (track.marker) telemetryLayer.removeLayer(track.marker);
                if (track.polyline) telemetryLayer.removeLayer(track.polyline);
            });
        }
        loadedTracks = [];
        if (tracksContainer) tracksContainer.innerHTML = '';
        const pillsContainer = document.getElementById('simulated-tracks-pills');
        if (pillsContainer) pillsContainer.innerHTML = '';
        if (typeof updateGlobalTimeline === 'function') updateGlobalTimeline();
        if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();
        if (typeof updateAllAirplanes === 'function') updateAllAirplanes();
    };

    window.loadExportedTrack = (trackDataObj) => {
        if (!telemetryLayer && window.map) { telemetryLayer = L.layerGroup().addTo(window.map); }
        
        const trackColor = trackDataObj.color || '#00d2ff';
        const trackId = trackDataObj.id || 'track-' + Date.now();
        const fileName = trackDataObj.name || 'Sem Nome';
        const trackType = trackDataObj.type || 'Aeronave';
        const trackRole = trackDataObj.role || 'Ás';
        
        // Defensive time & coordinate parsing to numbers, and sort by time
        const rawTrackData = (trackDataObj.data || []).map(pt => ({
            timeMs: Number(pt.timeMs),
            lat: Number(pt.lat),
            lng: Number(pt.lng),
            hdg: Number(pt.hdg || 0),
            ias: Number(pt.ias || 0),
            alt: Number(pt.alt || 0)
        }));
        rawTrackData.sort((a, b) => a.timeMs - b.timeMs);
        
        const trackData = [];
        for (let i = 0; i < rawTrackData.length; i++) {
            if (i === 0 || rawTrackData[i].timeMs !== rawTrackData[i - 1].timeMs) {
                trackData.push(rawTrackData[i]);
            }
        }
        
        if (trackData.length === 0) return;
        
        const airplaneIcon = L.divIcon({
            className: 'custom-airplane-icon',
            html: window.getAirplaneSVG(trackType, trackColor, trackData[0].hdg || 0),
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        });
        
        const trackMarker = L.marker([trackData[0].lat, trackData[0].lng], { icon: airplaneIcon, zIndexOffset: 1000 }).addTo(telemetryLayer);
        const polyline = L.polyline([], { color: trackColor, weight: 3, opacity: 0.8 }).addTo(telemetryLayer);

        const track = {
            id: trackId,
            name: fileName,
            data: trackData,
            color: trackColor,
            marker: trackMarker,
            polyline: polyline,
            type: trackType,
            role: trackRole
        };

        loadedTracks.push(track);
        
        if (typeof updateGlobalTimeline === 'function') updateGlobalTimeline();
        if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();

        const isSimulated = trackId.startsWith('sim_');
        
        if (isSimulated) {
            const pillsContainer = document.getElementById('simulated-tracks-pills');
            if (pillsContainer) {
                const pill = document.createElement('div');
                pill.className = 'sim-track-pill';
                pill.style.cssText = `background: rgba(0,0,0,0.5); border: 1px solid ${trackColor}; padding: 5px 10px; border-radius: 20px; display: inline-flex; align-items: center; gap: 5px; color: #fff; font-size: 0.8rem;`;
                pill.dataset.trackId = trackId;
                
                const colorBtn = document.createElement('span');
                colorBtn.style.cssText = `width: 10px; height: 10px; border-radius: 50%; background: ${trackColor}; display: inline-block;`;
                
                const label = document.createElement('span');
                label.textContent = fileName;
                label.style.cursor = 'pointer';
                label.addEventListener('click', () => {
                    if (track.marker && track.marker.getLatLng) {
                        const latlng = track.marker.getLatLng();
                        if (latlng && latlng.lat && latlng.lng) {
                            window.map.setView(latlng, 15, { animate: true });
                        }
                    }
                });
                
                const removeBtn = document.createElement('i');
                removeBtn.className = 'fa-solid fa-times';
                removeBtn.title = 'Remover voo';
                removeBtn.style.cssText = `cursor: pointer; color: #ff3333; margin-left: 5px;`;
                removeBtn.addEventListener('click', () => {
                    if (telemetryLayer) {
                        telemetryLayer.removeLayer(track.marker);
                        telemetryLayer.removeLayer(track.polyline);
                    }
                    loadedTracks = loadedTracks.filter(t => t.id !== trackId);
                    pill.remove();
                    
                    const playerContainer = document.getElementById('players-cards-container');
                    if (playerContainer) {
                        const card = playerContainer.querySelector(`div[data-track-id="${trackId}"]`);
                        if (card) card.remove();
                    }
                    
                    if (typeof updateGlobalTimeline === 'function') updateGlobalTimeline();
                    if (typeof window.updateDebriefRotasUI === 'function') window.updateDebriefRotasUI();
                    if (typeof updateAllAirplanes === 'function') updateAllAirplanes();
                });
                
                pill.appendChild(colorBtn);
                pill.appendChild(label);
                pill.appendChild(removeBtn);
                pillsContainer.appendChild(pill);
            }
        } else {
            addTelemetryTrackPill(track);
        }
    };
});
