document.addEventListener('DOMContentLoaded', () => {
    const simModal = document.getElementById('sim-flight-modal');
    const openSimBtn = document.getElementById('btn-open-sim-modal');
    const cancelSimBtn = document.getElementById('sim-btn-cancel');
    const createSimBtn = document.getElementById('sim-btn-create');
    
    const orbitTypeSelect = document.getElementById('sim-orbit-type');
    const rtParams = document.getElementById('sim-racetrack-params');
    const wheelParams = document.getElementById('sim-wheel-params');
    
    if (!simModal || !openSimBtn) return;

    // UI Toggles
    openSimBtn.addEventListener('click', () => { simModal.style.display = 'flex'; });
    cancelSimBtn.addEventListener('click', () => { simModal.style.display = 'none'; });
    
    orbitTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'wheel') {
            rtParams.style.display = 'none';
            wheelParams.style.display = 'flex';
        } else {
            rtParams.style.display = 'flex';
            wheelParams.style.display = 'none';
        }
    });

    // Create Logic
    createSimBtn.addEventListener('click', () => {
        const type = orbitTypeSelect.value;
        const acType = document.getElementById('sim-ac-type').value;
        const coordRaw = document.getElementById('sim-coord').value.trim();
        const timeStart = document.getElementById('sim-time-start').value;
        const timeEnd = document.getElementById('sim-time-end').value;
        const alt = parseFloat(document.getElementById('sim-alt').value);
        const speedKtas = parseFloat(document.getElementById('sim-speed').value);
        
        if (!coordRaw || !timeStart || !timeEnd) {
            alert('Preencha os campos obrigatórios (Ponto Inicial e Janela de Tempo).');
            return;
        }

        function parseTimeSec(ts) {
            if(!ts) return 0;
            const pts = ts.split(':');
            return parseInt(pts[0]||0)*3600 + parseInt(pts[1]||0)*60 + parseInt(pts[2]||0);
        }
        const startSec = parseTimeSec(timeStart);
        let endSec = parseTimeSec(timeEnd);
        if (endSec < startSec) endSec += 86400; // crosses midnight
        const durationSec = endSec - startSec;
        
        if (durationSec <= 0) {
            alert("Janela de tempo inválida.");
            return;
        }

        let baseTimeMs = 0;
        if (window.globalStartTime) {
            const d = new Date(window.globalStartTime);
            d.setUTCHours(0,0,0,0);
            baseTimeMs = d.getTime();
        }

        // Parse coordinate
        let latlng = parseCoordinatesToLatLng(coordRaw);
        if (!latlng) {
            alert('Coordenada inválida. Use MGRS (ex: 22J CG 1234 5678) ou Lat/Lon decimal (ex: -23.5, -46.6).');
            return;
        }

        const speedMs = speedKtas * 0.514444; // knots to m/s
        const trackData = [];
        
        // UTM projection for precise cartesian math
        const utmZone = Math.floor((latlng[1] + 180) / 6) + 1;
        const utmDef = `+proj=utm +zone=${utmZone} +datum=WGS84 +units=m +no_defs`;
        const centerUtm = proj4('WGS84', utmDef, [latlng[1], latlng[0]]); // [E, N]

        // 3 deg/sec standard rate turn
        const turnRadiusMeters = speedMs / (Math.PI / 60);

        if (type === 'wheel') {
            const radiusNm = parseFloat(document.getElementById('sim-wheel-radius').value);
            const radiusMeters = radiusNm * 1852;
            const angularVelocity = speedMs / radiusMeters; // rad/sec
            
            for (let t = 0; t <= durationSec; t++) {
                // start at 12 o'clock, clockwise
                const angle = t * angularVelocity;
                const e = centerUtm[0] + radiusMeters * Math.sin(angle);
                const n = centerUtm[1] + radiusMeters * Math.cos(angle);
                
                const ll = proj4(utmDef, 'WGS84', [e, n]);
                let hdg = (angle * 180 / Math.PI + 90) % 360; // tangent heading
                
                trackData.push({
                    timeMs: baseTimeMs + (startSec + t) * 1000,
                    lat: ll[1],
                    lng: ll[0],
                    hdg: hdg,
                    ias: speedKtas,
                    alt: alt
                });
            }
        } else {
            // Racetrack
            const hdgInbound = parseFloat(document.getElementById('sim-rt-hdg').value);
            const legMin = parseFloat(document.getElementById('sim-rt-leg').value);
            const legMeters = speedMs * (legMin * 60);
            
            const hdgOutbound = (hdgInbound + 180) % 360;
            const hdgInRad = hdgInbound * Math.PI / 180;
            const hdgOutRad = hdgOutbound * Math.PI / 180;
            
            const tStraight = legMin * 60;
            const tTurn = 60; // 180 deg at 3 deg/sec
            const tCircuit = (tStraight * 2) + (tTurn * 2);
            
            // Anchor is centerUtm (Start of Inbound Leg).
            const inbStartE = centerUtm[0];
            const inbStartN = centerUtm[1];
            
            // End of Inbound Leg (Start of Turn 1)
            const turn1StartE = inbStartE + legMeters * Math.sin(hdgInRad);
            const turn1StartN = inbStartN + legMeters * Math.cos(hdgInRad);
            
            // Center of Turn 1 is 90 deg right of HdgInbound from turn1Start.
            const centerTurn1E = turn1StartE + turnRadiusMeters * Math.sin(hdgInRad + Math.PI/2);
            const centerTurn1N = turn1StartN + turnRadiusMeters * Math.cos(hdgInRad + Math.PI/2);
            
            // Start of Outbound Leg (End of Turn 1). 180 deg right of HdgInbound from centerTurn1.
            const outbStartE = centerTurn1E + turnRadiusMeters * Math.sin(hdgInRad + Math.PI/2);
            const outbStartN = centerTurn1N + turnRadiusMeters * Math.cos(hdgInRad + Math.PI/2);
            
            // End of Outbound Leg (Start of Turn 2).
            const turn2StartE = outbStartE + legMeters * Math.sin(hdgOutRad);
            const turn2StartN = outbStartN + legMeters * Math.cos(hdgOutRad);
            
            // Center of Turn 2 is 90 deg right of HdgOutbound from turn2Start.
            const centerTurn2E = turn2StartE + turnRadiusMeters * Math.sin(hdgOutRad + Math.PI/2);
            const centerTurn2N = turn2StartN + turnRadiusMeters * Math.cos(hdgOutRad + Math.PI/2);
            
            for (let t = 0; t <= durationSec; t++) {
                const tMod = t % tCircuit;
                let e, n, hdg;
                
                if (tMod < tStraight) {
                    // Inbound Leg
                    const dist = tMod * speedMs;
                    e = inbStartE + dist * Math.sin(hdgInRad);
                    n = inbStartN + dist * Math.cos(hdgInRad);
                    hdg = hdgInbound;
                } else if (tMod < tStraight + tTurn) {
                    // Turn 1
                    const tT1 = tMod - tStraight;
                    // Angle starts at (HdgInbound - 90), goes to (HdgInbound + 90)
                    const angle = (hdgInRad - Math.PI/2) + (tT1 / tTurn) * Math.PI;
                    e = centerTurn1E + turnRadiusMeters * Math.sin(angle);
                    n = centerTurn1N + turnRadiusMeters * Math.cos(angle);
                    hdg = (hdgInbound + (tT1 / tTurn) * 180) % 360;
                } else if (tMod < tStraight * 2 + tTurn) {
                    // Outbound Leg
                    const tOut = tMod - (tStraight + tTurn);
                    const dist = tOut * speedMs;
                    e = outbStartE + dist * Math.sin(hdgOutRad);
                    n = outbStartN + dist * Math.cos(hdgOutRad);
                    hdg = hdgOutbound;
                } else {
                    // Turn 2
                    const tT2 = tMod - (tStraight * 2 + tTurn);
                    // Angle starts at (HdgOutbound - 90), goes to (HdgOutbound + 90)
                    const angle = (hdgOutRad - Math.PI/2) + (tT2 / tTurn) * Math.PI;
                    e = centerTurn2E + turnRadiusMeters * Math.sin(angle);
                    n = centerTurn2N + turnRadiusMeters * Math.cos(angle);
                    hdg = (hdgOutbound + (tT2 / tTurn) * 180) % 360;
                }
                
                const ll = proj4(utmDef, 'WGS84', [e, n]);
                
                trackData.push({
                    timeMs: baseTimeMs + (startSec + t) * 1000,
                    lat: ll[1],
                    lng: ll[0],
                    hdg: hdg,
                    ias: speedKtas,
                    alt: alt
                });
            }
        }
        
        simModal.style.display = 'none';
        
        // Inject!
        if (window.injectSimulatedTrack) {
            window.injectSimulatedTrack(trackData, `${acType} SIM`);
        } else {
            alert('Erro: Módulo de telemetria não carregado corretamente.');
        }
    });

    function parseCoordinatesToLatLng(input) {
        input = input.trim();
        if (!input) return null;

        // Try Lat/Lon decimal
        const llMatch = input.match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
        if (llMatch) {
            const lat = parseFloat(llMatch[1]);
            const lon = parseFloat(llMatch[3]);
            if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                return [lat, lon];
            }
        }

        // Try MGRS
        try {
            if (typeof mgrs !== 'undefined') {
                const cleanInput = input.replace(/\s+/g, '').toUpperCase();
                const ll = mgrs.toPoint(cleanInput); // Returns [lon, lat]
                return [ll[1], ll[0]]; // Return [lat, lon]
            }
        } catch(e) {}
        
        return null;
    }
});
