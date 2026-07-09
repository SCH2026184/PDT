"use strict";

class HUDVideoPlayer {
    constructor(slot) {
        this.slot = slot; // "L" (Líder) ou "A" (Ala)
        this.prefix = "hud-video-" + slot;
        
        // Elementos DOM
        this.panel        = document.getElementById(this.prefix + "-panel");
        this.header       = document.getElementById(this.prefix + "-header");
        this.openBtn      = document.getElementById("btn-hud-video-" + slot);
        this.closeBtn     = document.getElementById(this.prefix + "-close-btn");
        this.minimizeBtn  = document.getElementById(this.prefix + "-minimize-btn");
        
        this.videoEl      = document.getElementById(this.prefix + "-player");
        this.placeholder  = document.getElementById(this.prefix + "-placeholder");
        this.syncBadge    = document.getElementById(this.prefix + "-sync-badge");
        this.activeLabel  = document.getElementById(this.prefix + "-active-label");
        this.syncEnabled  = document.getElementById(this.prefix + "-sync-enabled");
        this.listEl       = document.getElementById(this.prefix + "-list");
        this.emptyMsg     = document.getElementById(this.prefix + "-empty-msg");
        this.countEl      = document.getElementById(this.prefix + "-count");
        this.addInput     = document.getElementById(this.prefix + "-add-input");
        
        this.playPauseBtn = document.getElementById("btn-play-pause-telemetry");
        
        // Estado
        this.videos = [];
        this.nextId = 1;
        this.activeId = null;
        this.minimized = false;
        this.DRIFT = 0.4;
        
        this.init();
    }
    
    // Helpers internos
    msToHMS(ms) {
        const t = Math.floor(Math.max(0, ms) / 1000);
        const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
        return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }

    hmsToMs(str) {
        const [h = 0, m = 0, s = 0] = (str || "").split(":").map(Number);
        return (h * 3600 + m * 60 + s) * 1000;
    }

    getCurMs() {
        return typeof window.getCurrentTelemetryTime === "function" ? window.getCurrentTelemetryTime() : null;
    }

    findEntry(id) {
        return this.videos.find(v => v.id === id);
    }
    
    init() {
        if (!this.panel) return;
        
        // Abrir/Fechar
        if (this.openBtn) {
            this.openBtn.addEventListener("click", () => {
                const vis = this.panel.style.display === "flex";
                this.panel.style.display = vis ? "none" : "flex";
                const activeColor = this.slot === "L" ? "var(--primary)" : "#ffa500";
                const activeBorder = this.slot === "L" ? "rgba(0,210,255,0.4)" : "rgba(255,165,0,0.4)";
                this.openBtn.style.color       = vis ? "var(--text-dim)" : activeColor;
                this.openBtn.style.borderColor = vis ? activeBorder    : activeColor;
            });
        }
        
        if (this.closeBtn) {
            this.closeBtn.addEventListener("click", () => {
                this.panel.style.display = "none";
                if (this.openBtn) {
                    const activeBorder = this.slot === "L" ? "rgba(0,210,255,0.4)" : "rgba(255,165,0,0.4)";
                    this.openBtn.style.color = "var(--text-dim)";
                    this.openBtn.style.borderColor = activeBorder;
                }
            });
        }
        
        // Minimizar
        if (this.minimizeBtn) {
            this.minimizeBtn.addEventListener("click", () => {
                this.minimized = !this.minimized;
                const wrapper = document.getElementById(this.prefix + "-wrapper");
                const listWrap = this.listEl ? this.listEl.parentElement.parentElement : null;
                [wrapper, listWrap].forEach(el => {
                    if (el) el.style.display = this.minimized ? "none" : "flex";
                });
                this.panel.style.resize = this.minimized ? "none" : "both";
                this.minimizeBtn.innerHTML = this.minimized ? '<i class="fa-solid fa-expand"></i>' : '<i class="fa-solid fa-minus"></i>';
            });
        }
        
        // Arrastar
        if (this.header) {
            let ox = 0, oy = 0, drag = false;
            this.header.addEventListener("mousedown", e => {
                if (["BUTTON", "I", "INPUT", "SELECT", "LABEL"].includes(e.target.tagName)) return;
                drag = true;
                const r = this.panel.getBoundingClientRect(); ox = e.clientX - r.left; oy = e.clientY - r.top;
                this.panel.style.right = "auto"; e.preventDefault();
            });
            document.addEventListener("mousemove", e => {
                if (drag) {
                    this.panel.style.left = (e.clientX - ox) + "px";
                    this.panel.style.top = (e.clientY - oy) + "px";
                }
            });
            document.addEventListener("mouseup", () => drag = false);
        }
        
        // Adicionar vídeos
        if (this.addInput) {
            this.addInput.addEventListener("change", e => {
                Array.from(e.target.files || []).forEach(f => this.addVideo(f));
                this.addInput.value = "";
            });
        }
        
        // Sincronizar play/pause do player com a timeline
        if (this.playPauseBtn) {
            new MutationObserver(() => {
                if (!this.syncEnabled || !this.syncEnabled.checked) return;
                if (this.videos.length === 0 || this.activeId === null) return;
                if (this.videoEl.readyState < 2) return;
                
                const isPlaying = !!this.playPauseBtn.querySelector(".fa-pause");
                if (isPlaying) this.videoEl.play().catch(() => {});
                else this.videoEl.pause();
            }).observe(this.playPauseBtn, { childList: true, subtree: true });
        }
        
        // Tamanho do player
        const sizeBtns = document.querySelectorAll(`.${this.prefix}-size-btn`);
        const wrapperEl = document.getElementById(`${this.prefix}-wrapper`);
        if (sizeBtns && wrapperEl) {
            const savedHeight = localStorage.getItem(`${this.prefix}-height`) || "220";
            if (savedHeight !== "220") {
                wrapperEl.style.height = savedHeight + "px";
                this.updateSizeButtons(sizeBtns, savedHeight);
            }
            
            sizeBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    const h = btn.getAttribute("data-height");
                    if (h) {
                        wrapperEl.style.height = h + "px";
                        localStorage.setItem(`${this.prefix}-height`, h);
                        this.updateSizeButtons(sizeBtns, h);
                    }
                });
            });
        }
    }
    
    updateSizeButtons(btns, activeHeight) {
        const primaryColor = this.slot === "L" ? "var(--primary)" : "#ffa500";
        const bgActive = this.slot === "L" ? "rgba(0,210,255,0.15)" : "rgba(255,165,0,0.15)";
        btns.forEach(b => {
            const h = b.getAttribute("data-height");
            const active = h === activeHeight;
            b.style.background = active ? bgActive : "none";
            b.style.color = active ? primaryColor : "var(--text-dim)";
        });
    }
    
    addVideo(file) {
        const id = this.nextId++;
        console.log(`HUD [${this.slot}] addVideo - Nome:`, file.name, "MIME:", file.type, "Tamanho:", file.size);
        
        let blob = file;
        const lowerName = file.name.toLowerCase();
        if (!file.type || file.type === "application/octet-stream" || lowerName.endsWith(".mov") || lowerName.endsWith(".ts") || lowerName.endsWith(".avi")) {
            console.log(`HUD [${this.slot}]: Forçando tipo MIME 'video/mp4' para compatibilidade`);
            blob = new Blob([file], { type: "video/mp4" });
        }
        
        const url = URL.createObjectURL(blob);
        
        let autoMs = null;
        if (typeof window.getLoadedTracks === "function") {
            const tracks = window.getLoadedTracks();
            if (tracks && tracks[0] && tracks[0].data && tracks[0].data[0]) {
                autoMs = tracks[0].data[0].timeMs;
            }
        }
        
        const entry = { id, name: file.name, url, syncTimelineMs: autoMs, videoOffsetSec: 0, durationSec: 0, rowEl: null };
        this.videos.push(entry);
        this.buildRow(entry);
        this.updateCount();
        
        if (this.videos.length === 1) {
            this.showVideo(id);
        }
    }
    
    removeVideo(id) {
        const idx = this.videos.findIndex(v => v.id === id);
        if (idx === -1) return;
        const entry = this.videos[idx];
        URL.revokeObjectURL(entry.url);
        if (entry.rowEl) entry.rowEl.remove();
        this.videos.splice(idx, 1);
        this.updateCount();
        
        if (this.activeId === id) {
            this.activeId = null;
            this.videoEl.pause();
            this.videoEl.removeAttribute("src");
            this.videoEl.style.display = "none";
            if (this.placeholder) this.placeholder.style.display = "flex";
            if (this.syncBadge) this.syncBadge.style.display = "none";
            if (this.activeLabel) this.activeLabel.textContent = "";
            if (this.videos.length > 0) this.showVideo(this.videos[0].id);
        }
    }
    
    updateCount() {
        if (this.countEl) this.countEl.textContent = this.videos.length + " video(s)";
        if (this.emptyMsg) this.emptyMsg.style.display = this.videos.length === 0 ? "block" : "none";
    }
    
    buildRow(entry) {
        if (this.emptyMsg) this.emptyMsg.style.display = "none";
        
        const row = document.createElement("div");
        const activeColor = this.slot === "L" ? "var(--primary)" : "#ffa500";
        row.style.cssText = "display:flex;flex-direction:column;gap:5px;padding:7px 12px;border-bottom:1px solid rgba(255,255,255,0.04);cursor:pointer;transition:background 0.15s;border-left:2px solid transparent;";
        
        const top = document.createElement("div");
        top.style.cssText = "display:flex;align-items:center;gap:7px;";
        
        const liveTag = document.createElement("span");
        liveTag.id = `${this.prefix}-live-${entry.id}`;
        liveTag.style.cssText = "font-size:0.55rem;font-family:monospace;padding:1px 5px;border-radius:3px;font-weight:700;letter-spacing:1px;background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.1);white-space:nowrap;flex-shrink:0;";
        liveTag.textContent = "INATIVO";
        
        const nameEl = document.createElement("span");
        nameEl.style.cssText = "font-size:0.72rem;color:var(--text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
        nameEl.textContent = entry.name;
        nameEl.title = entry.name;
        
        const eyeBtn = document.createElement("button");
        eyeBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
        eyeBtn.title = "Exibir este vídeo";
        eyeBtn.style.cssText = `background:none;border:1px solid ${activeColor};color:${activeColor};border-radius:3px;padding:2px 7px;cursor:pointer;font-size:0.65rem;flex-shrink:0;outline:none;`;
        eyeBtn.addEventListener("click", e => { e.stopPropagation(); this.showVideo(entry.id); });
        
        const delBtn = document.createElement("button");
        delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        delBtn.title = "Remover";
        delBtn.style.cssText = "background:none;border:none;color:rgba(255,100,100,0.5);cursor:pointer;font-size:0.8rem;padding:2px 4px;flex-shrink:0;outline:none;";
        delBtn.addEventListener("click", e => { e.stopPropagation(); this.removeVideo(entry.id); });
        
        top.append(liveTag, nameEl, eyeBtn, delBtn);
        
        const ctrl = document.createElement("div");
        ctrl.style.cssText = "display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-left:2px;";
        
        const mk = (tag, css, title) => { const el = document.createElement(tag); el.style.cssText = css; if (title) el.title = title; return el; };
        
        const lbl1 = mk("span", "font-size:0.62rem;color:var(--text-dim);white-space:nowrap;");
        lbl1.textContent = "Inicio na timeline:";
        
        const timeInp = mk("input", `width:82px;height:22px;background:rgba(0,0,0,0.5);border:1px solid ${activeColor};color:${activeColor};border-radius:4px;padding:1px 4px;font-family:monospace;font-size:0.7rem;text-align:center;outline:none;`, "Horário da timeline que corresponde ao tempo de início do vídeo");
        timeInp.type = "time"; timeInp.step = "1";
        timeInp.value = entry.syncTimelineMs !== null ? this.msToHMS(entry.syncTimelineMs) : "00:00:00";
        timeInp.addEventListener("change", e => { e.stopPropagation(); entry.syncTimelineMs = this.hmsToMs(timeInp.value); });
        timeInp.addEventListener("click", e => e.stopPropagation());
        
        const lbl2 = mk("span", "font-size:0.62rem;color:var(--text-dim);white-space:nowrap;");
        lbl2.textContent = "Inicio video(s):";
        
        const offInp = mk("input", `width:50px;height:22px;background:rgba(0,0,0,0.5);border:1px solid ${activeColor};color:${activeColor};border-radius:4px;padding:1px 4px;font-family:monospace;font-size:0.7rem;text-align:center;outline:none;`, "Segundo do vídeo que coincide com o horário da timeline configurado");
        offInp.type = "number"; offInp.min = "0"; offInp.step = "0.1"; offInp.value = "0";
        offInp.addEventListener("change", e => { e.stopPropagation(); entry.videoOffsetSec = parseFloat(offInp.value) || 0; });
        offInp.addEventListener("click", e => e.stopPropagation());
        
        const syncBtn = mk("button", `background:rgba(0,210,255,0.08);border:1px solid ${activeColor};color:${activeColor};padding:2px 8px;border-radius:4px;font-size:0.62rem;cursor:pointer;font-weight:700;display:flex;align-items:center;gap:4px;white-space:nowrap;`, "Capturar instante atual da timeline e do vídeo como referência de sincronização");
        syncBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i> Sync';
        syncBtn.addEventListener("click", e => {
            e.stopPropagation();
            const curMs = this.getCurMs();
            if (curMs === null) { alert("Nenhuma timeline ativa."); return; }
            entry.syncTimelineMs = curMs;
            
            entry.videoOffsetSec = this.activeId === entry.id ? this.videoEl.currentTime : parseFloat(offInp.value) || 0;
            
            timeInp.value = this.msToHMS(curMs);
            offInp.value = entry.videoOffsetSec.toFixed(1);
            syncBtn.style.background = "rgba(0,255,136,0.2)";
            setTimeout(() => { syncBtn.style.background = "rgba(0,210,255,0.08)"; }, 900);
        });
        syncBtn.addEventListener("click", e => e.stopPropagation());
        
        ctrl.append(lbl1, timeInp, lbl2, offInp, syncBtn);
        row.append(top, ctrl);
        
        row.addEventListener("click", () => this.showVideo(entry.id));
        row.addEventListener("mouseenter", () => { if (this.activeId !== entry.id) row.style.background = "rgba(255,255,255,0.02)"; });
        row.addEventListener("mouseleave", () => { if (this.activeId !== entry.id) row.style.background = ""; });
        
        entry.rowEl = row;
        this.listEl.appendChild(row);
    }
    
    showVideo(id) {
        const entry = this.findEntry(id);
        if (!entry) { console.error(`HUD [${this.slot}]: entry not found`, id); return; }
        this.activeId = id;
        console.log(`HUD [${this.slot}] showVideo:`, entry.name, entry.url);
        
        this.videoEl.pause();
        this.videoEl.removeAttribute("src");
        try {
            this.videoEl.load();
        } catch(e) {
            console.warn(`HUD [${this.slot}] load() error during reset:`, e);
        }
        
        this.videoEl.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;z-index:3;display:block;";
        this.videoEl.muted = true;
        if (this.placeholder) {
            this.placeholder.style.display = "none";
        }
        
        this.videoEl.onerror = () => {
            const err = this.videoEl.error;
            console.error(`HUD [${this.slot}] video error:`, err);
            let msg = "Erro desconhecido";
            if (err) {
                switch (err.code) {
                    case 1: msg = "Carregamento abortado pelo navegador."; break;
                    case 2: msg = "Erro de rede ao carregar o vídeo."; break;
                    case 3: msg = "Erro de decodificação. O arquivo pode estar corrompido ou usa um codec incompatível."; break;
                    case 4: msg = "Formato ou codec de vídeo não suportado pelo navegador."; break;
                }
                if (err.message) msg += " (" + err.message + ")";
            }
            if (this.placeholder) {
                this.placeholder.innerHTML = `
                    <i class="fa-solid fa-circle-exclamation" style="font-size:1.8rem;color:#ff6b6b;margin-bottom:5px;"></i>
                    <span style="font-size:0.75rem;color:#ff6b6b;font-weight:bold;max-width:90%;line-height:1.3;">${msg}</span>
                    <span style="font-size:0.65rem;color:var(--text-dim);margin-top:5px;max-width:90%;">Recomendado: MP4 codificado em H.264 com áudio AAC.</span>
                `;
                this.placeholder.style.display = "flex";
                this.videoEl.style.display = "none";
            }
        };
        
        const curMs = this.getCurMs();
        let targetSec = entry.videoOffsetSec || 0;
        if (curMs !== null && entry.syncTimelineMs !== null) {
            targetSec = Math.max(0, (curMs - entry.syncTimelineMs) / 1000 + entry.videoOffsetSec);
        }
        
        this.videoEl.addEventListener("loadedmetadata", () => {
            console.log(`HUD [${this.slot}] loadedmetadata, duration:`, this.videoEl.duration);
            entry.durationSec = this.videoEl.duration;
            
            if (targetSec > 0 && targetSec < this.videoEl.duration) {
                this.videoEl.currentTime = targetSec;
            } else {
                this.videoEl.currentTime = 0;
            }
            
            const isPlaying = this.playPauseBtn && !!this.playPauseBtn.querySelector(".fa-pause");
            if (isPlaying) {
                this.videoEl.play().catch(err => console.warn(`HUD [${this.slot}] play() blocked:`, err.message));
            } else {
                this.videoEl.pause();
            }
        }, { once: true });
        
        this.videoEl.src = entry.url;
        this.videoEl.load();
        
        this.updateRowVisuals();
    }
    
    updateRowVisuals() {
        const activeColor = this.slot === "L" ? "var(--primary)" : "#ffa500";
        const activeBg = this.slot === "L" ? "rgba(0,210,255,0.06)" : "rgba(255,165,0,0.06)";
        
        this.videos.forEach(v => {
            if (!v.rowEl) return;
            const isActive = v.id === this.activeId;
            v.rowEl.style.background = isActive ? activeBg : "";
            v.rowEl.style.borderLeft = isActive ? `2px solid ${activeColor}` : "2px solid transparent";
            
            const tag = document.getElementById(`${this.prefix}-live-${v.id}`);
            if (tag) {
                tag.textContent = isActive ? "EXIBINDO" : "INATIVO";
                tag.style.color = isActive ? activeColor : "rgba(255,255,255,0.2)";
                tag.style.background = isActive ? (this.slot === "L" ? "rgba(0,210,255,0.12)" : "rgba(255,165,0,0.12)") : "rgba(255,255,255,0.05)";
                tag.style.borderColor = isActive ? (this.slot === "L" ? "rgba(0,210,255,0.35)" : "rgba(255,165,0,0.35)") : "rgba(255,255,255,0.1)";
            }
        });
        
        if (this.activeLabel) {
            const cur = this.findEntry(this.activeId);
            this.activeLabel.textContent = cur ? cur.name : "";
        }
    }
    
    getBestId(curMs) {
        let best = null;
        for (const v of this.videos) {
            if (v.syncTimelineMs === null) continue;
            const startMs = v.syncTimelineMs - v.videoOffsetSec * 1000;
            const durationMs = (v.durationSec || 7200) * 1000;
            const endMs = startMs + durationMs;
            if (curMs >= startMs && curMs <= endMs) {
                if (!best || v.syncTimelineMs > best.syncTimelineMs) best = v;
            }
        }
        return best ? best.id : null;
    }
    
    onTimeUpdate(curMs) {
        if (!this.panel || this.panel.style.display !== "flex") return;
        if (!this.syncEnabled || !this.syncEnabled.checked) return;
        if (this.videos.length === 0) return;
        
        const bestId = this.getBestId(curMs);
        if (bestId !== null && bestId !== this.activeId) {
            this.showVideo(bestId);
        }
        
        const active = this.findEntry(this.activeId);
        if (!active || active.syncTimelineMs === null) return;
        if (this.videoEl.readyState < 2) return;
        
        const target = (curMs - active.syncTimelineMs) / 1000 + active.videoOffsetSec;
        if (target < 0 || (this.videoEl.duration > 0 && target > this.videoEl.duration)) {
            if (!this.videoEl.paused) this.videoEl.pause();
            if (this.syncBadge) this.syncBadge.style.display = "none";
            return;
        }
        
        if (Math.abs(this.videoEl.currentTime - target) > this.DRIFT) {
            this.videoEl.currentTime = target;
        }
        
        const isPlaying = this.playPauseBtn && !!this.playPauseBtn.querySelector(".fa-pause");
        if (isPlaying) {
            if (this.videoEl.paused) this.videoEl.play().catch(() => {});
        } else {
            if (!this.videoEl.paused) this.videoEl.pause();
        }
        
        if (this.syncBadge) this.syncBadge.style.display = "block";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.hudPlayerL = new HUDVideoPlayer("L");
    window.hudPlayerA = new HUDVideoPlayer("A");
    
    // Hook na timeline global
    const _orig = window.onTelemetryTimeUpdate;
    window.onTelemetryTimeUpdate = curMs => {
        if (typeof _orig === "function") _orig(curMs);
        
        if (window.hudPlayerL) window.hudPlayerL.onTimeUpdate(curMs);
        if (window.hudPlayerA) window.hudPlayerA.onTimeUpdate(curMs);
    };
});
