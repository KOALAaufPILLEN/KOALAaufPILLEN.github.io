
/**
 * Luvvies Rogue 3.0
 * Engine Logic, Meta Progression, Map, and Systems
 */
console.log("Rogue Engine 3.0 booting...");

// --- Constants ---

const ROGUE_TIERS = [
    { id: 0, name: "Süß", mul: 1.0 },
    { id: 1, name: "Sauer", mul: 1.5 },
    { id: 2, name: "Pikant", mul: 2.5 },
    { id: 3, name: "Bitter", mul: 4.0 },
    { id: 4, name: "Knusprig", mul: 6.5 },
    { id: 5, name: "Hartbonbon", mul: 10.0 },
    { id: 6, name: "Kieferbrecher", mul: 25.0 },
    { id: 7, name: "Zuckerrausch", mul: 60.0 },
    { id: 8, name: "Zuckerschock", mul: 150.0 },
    { id: 9, name: "Koma", mul: 500.0 }
];

const ROGUE_BIOMES = [
    { id: "forest", name: "Wald", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Grass/Grass_2_Middle.png", filter: "none", opacity: 0.3 },
    { id: "neon", name: "Neon City", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Water/Water_Middle.png", filter: "hue-rotate(180deg) saturate(2)", opacity: 0.25 },
    { id: "candy", name: "Schokoschlucht", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Grass/Path_Middle.png", filter: "sepia(0.8) hue-rotate(-30deg)", opacity: 0.3 },
    { id: "cloud", name: "Wolkenreich", bg: "Images/Zip/Cute_Fantasy_Free/Cute_Fantasy_Free/Tiles/Water_Tile.png", filter: "brightness(1.5) grayscale(0.5)", opacity: 0.2 },
    { id: "spooky", name: "Geistergrotte", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Cave/Cave_Floor_Middle.png", filter: "invert(0.8) hue-rotate(180deg)", opacity: 0.25 },
    { id: "magma", name: "Lavasee", bg: "Images/Zip/Cute_Fantasy_Free/Cute_Fantasy_Free/Tiles/FarmLand_Tile.png", filter: "hue-rotate(-50deg) saturate(3)", opacity: 0.3 },
    { id: "crystal", name: "Kristallgipfel", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Water/Water_Middle.png", filter: "hue-rotate(220deg) brightness(1.2)", opacity: 0.3 },
    { id: "cyber", name: "Cyber Slums", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Cave/Cave_Floor_Middle.png", filter: "contrast(1.5) hue-rotate(90deg)", opacity: 0.3 }
];

const ROGUE_ENEMIES = [
    { id: "slime", name: "Schleim", hp: 100, dmg: 5 },
    { id: "rat", name: "Ratte", hp: 80, dmg: 8 },
    { id: "bat", name: "Fledermaus", hp: 60, dmg: 6 },
    { id: "ghost", name: "Geist", hp: 90, dmg: 7 },
    { id: "golem", name: "Stein", hp: 150, dmg: 4 },
    { id: "robot", name: "Bot X", hp: 120, dmg: 9 }
];

// --- Engine ---

window.rogueEngine = {
    state: {
        hero: null,
        gold: 50, // Base Gold
        hp: 100,
        maxHp: 100,
        tier: 0,
        unlockedTier: 0,
        map: [],
        currentNode: -1,
        path: [],
        deck: ["sweety", "sleepy", "normal", "cry"],
        inventory: [],
        talents: { might: 0, vitality: 0, greed: 0, mastery: 0 },
        equip: { head:null, body:null, weapon:null, pet:null }
    },

    init: function() {
        console.log("Initializing Rogue Engine...");
        this.loadSave();
        this.bindNav();
        this.renderDiffSelect();
        this.renderTalents();
        this.renderEquipment();

        // Auto-select town tab
        const townTab = document.querySelector('.navBtn[data-tab="town"]');
        if(townTab) townTab.click();
    },

    loadSave: function() {
        try {
            const s = localStorage.getItem("rogue_save_v3");
            if(s) {
                const data = JSON.parse(s);
                this.state.talents = data.talents || this.state.talents;
                this.state.unlockedTier = data.unlockedTier || 0;
                this.state.gold = (data.gold !== undefined) ? data.gold : 50;
                this.state.equip = data.equip || this.state.equip;
                this.updateResources();
            }
        } catch(e) { console.error("Save load failed", e); }
    },

    saveGame: function() {
        const data = {
            talents: this.state.talents,
            unlockedTier: this.state.unlockedTier,
            gold: this.state.gold,
            equip: this.state.equip
        };
        localStorage.setItem("rogue_save_v3", JSON.stringify(data));
        this.updateResources();
    },

    updateResources: function(){
        const els = document.querySelectorAll("#townResources");
        els.forEach(el => {
            el.innerHTML = `🪙 ${this.state.gold} <span style="opacity:0.5">|</span> 🧪 ${this.state.talents.mastery || 0}`;
        });
    },

    bindNav: function(){
        document.querySelectorAll('.navBtn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.navBtn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tabContent').forEach(t => t.style.display = 'none');

                btn.classList.add('active');
                const tabId = 'tab-' + btn.dataset.tab;
                const content = document.getElementById(tabId);
                if(content) content.style.display = 'block';

                // Trigger refreshes
                if(btn.dataset.tab === 'equip') this.renderEquipment();
                if(btn.dataset.tab === 'talents') this.renderTalents();
            });
        });
    },

    // --- Core Gameplay Start ---

    startNewRun: function() {
        // Reset Run State
        const vitality = this.state.talents.vitality || 0;
        this.state.hp = 100 + (vitality * 10);
        this.state.maxHp = this.state.hp;
        this.state.path = [];
        this.state.inventory = [];

        this.generateMap();
        this.showMap();
    },

    generateMap: function() {
        const rows = 15;
        const cols = 5;
        const nodes = [];
        let id = 0;

        // Random Biome Sequence (4 biomes per run)
        const seq = [];
        for(let i=0; i<4; i++) seq.push(ROGUE_BIOMES[Math.floor(Math.random()*ROGUE_BIOMES.length)]);

        for(let r=0; r<rows; r++){
            const isBoss = (r === rows-1);
            const biome = seq[Math.floor(r / 4)] || seq[3];

            // 3 nodes per row logic
            const activeCols = new Set();
            if(isBoss) activeCols.add(2); // Center
            else {
               while(activeCols.size < 3) activeCols.add(Math.floor(Math.random()*cols));
            }

            activeCols.forEach(c => {
                let type = "combat";
                if(isBoss) type = "boss";
                else if(Math.random() < 0.15) type = "shop";
                else if(Math.random() < 0.1) type = "elite";

                // Determine board shape
                let shape = "full";
                if(type === "combat" || type === "elite"){
                    const shapes = ["full", "diamond", "hourglass", "donut", "random"];
                    shape = shapes[Math.floor(Math.random()*shapes.length)];
                }

                nodes.push({
                    id: id++,
                    row: r,
                    col: c,
                    type: type,
                    biome: biome,
                    shape: shape,
                    next: []
                });
            });
        }

         const byRow = [];
         for(let r=0; r<rows; r++) byRow[r] = nodes.filter(n=>n.row===r);

         for(let r=0; r<rows-1; r++){
             byRow[r].forEach(n => {
                 // Connect to nearest neighbor
                 let nearest = null;
                 let minD = 999;
                 byRow[r+1].forEach(next => {
                     const d = Math.abs(next.col - n.col);
                     if(d < minD) { minD = d; nearest = next; }
                 });
                 if(nearest) n.next.push(nearest.id);

                 // Also random connect to nearby
                 byRow[r+1].forEach(next => {
                     if(Math.abs(next.col - n.col) <= 1 && next.id !== nearest.id) n.next.push(next.id);
                 });
             });
         }

         this.state.map = nodes;
         this.state.currentNode = -1;
    },

    startCombat: function(node) {
        console.log("Combat Start:", node);
        const tier = ROGUE_TIERS[this.state.tier];
        const baseHp = 50 + (node.row * 25);
        const scaledHp = Math.floor(baseHp * tier.mul);

        // Setup Globals for rogue.html to read
        window.level = node.row + 1;
        // Force 7x9
        window.rows = 9;
        window.cols = 7;

        window.CURRENT_BIOME = node.biome.id;
        window.CURRENT_SHAPE = node.shape || "full";

        window.IS_BOSS_LEVEL = (node.type === 'boss');

        const enemyBase = ROGUE_ENEMIES[Math.floor(Math.random()*ROGUE_ENEMIES.length)];
        window.CURRENT_ENEMY = {
            name: (node.type==='elite' ? "Elite " : "") + enemyBase.name,
            hp: scaledHp * (node.type==='elite' ? 1.5 : 1),
            maxHp: scaledHp * (node.type==='elite' ? 1.5 : 1),
            stacks: 0 // Will be calc in updateUI
        };

        // Hide map, show game
        this.showScene('gameView');

        // Trigger board init in rogue.html
        if(typeof window.newGame === 'function') {
            window.newGame(true);
        }

        // Trigger resize
        this.resizeBoard();
    },

    // --- UI Renderers ---

    renderDiffSelect: function() {
        const wrap = document.getElementById("townDiffPills");
        if(!wrap) return;
        wrap.innerHTML = "";

        ROGUE_TIERS.forEach(t => {
            const isLocked = t.id > this.state.unlockedTier;
            const pill = document.createElement("label");
            pill.className = isLocked ? "locked" : "";
            pill.style.display = "inline-flex";
            pill.style.flexDirection = "column";
            pill.style.alignItems = "center";
            pill.style.justifyContent = "center";
            pill.style.minWidth = "90px";
            pill.style.height = "50px";
            pill.style.marginRight = "6px";
            pill.style.border = "1px solid rgba(255,255,255,0.1)";
            pill.style.borderRadius = "12px";
            pill.style.background = (this.state.tier === t.id) ? "var(--accent)" : "rgba(255,255,255,0.05)";
            pill.style.cursor = isLocked ? "default" : "pointer";
            pill.style.opacity = isLocked ? "0.5" : "1";

            pill.innerHTML = `
                <div style="font-weight:800; font-size:12px;">${t.name}</div>
                <div style="font-size:10px; opacity:0.7;">x${t.mul}</div>
            `;

            if(!isLocked){
                pill.onclick = () => {
                    this.state.tier = t.id;
                    this.renderDiffSelect();
                };
            }
            wrap.appendChild(pill);
        });
    },

    renderEquipment: function() {
        const view = document.getElementById("equipView");
        if(!view) return;
        view.innerHTML = "";

        const slots = ["head", "body", "weapon", "pet", "trinket"];
        const icons = { head:"🧢", body:"👕", weapon:"⚔️", pet:"🐕", trinket:"💍" };

        slots.forEach(slot => {
            const div = document.createElement("div");
            div.className = "equipSlot";
            div.style.background = "rgba(255,255,255,0.05)";
            div.style.border = "1px dashed rgba(255,255,255,0.1)";
            div.style.borderRadius = "12px";
            div.style.aspectRatio = "1";
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.justifyContent = "center";
            div.style.fontSize = "24px";
            div.style.position = "relative";

            const equipped = this.state.equip[slot];
            if(equipped) {
                div.style.border = "1px solid var(--accent)";
                div.style.background = "rgba(145, 71, 255, 0.1)";
                div.innerHTML = `<span>${equipped.icon||"📦"}</span>`;
            } else {
                div.innerHTML = `<span style="opacity:0.2">${icons[slot]}</span>`;
            }

            div.innerHTML += `<div style="position:absolute; bottom:-8px; right:-4px; background:#18181b; padding:2px 6px; border-radius:8px; font-size:10px; border:1px solid rgba(255,255,255,0.1)">${slot.toUpperCase()}</div>`;

            view.appendChild(div);
        });
    },

    renderTalents: function() {
        const view = document.getElementById("talentView");
        if(!view) return;
        view.innerHTML = "";
        // Do not force display here, let switchTab handle visibility

        const grid = document.createElement("div");
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "1fr 1fr";
        grid.style.gap = "12px";

        const talents = [
            { id: "might", name: "Macht", icon: "💪", desc: "+Start Dmg" },
            { id: "vitality", name: "Vitalität", icon: "❤️", desc: "+10 Max HP" },
            { id: "greed", name: "Gier", icon: "💰", desc: "+5% Gold" },
            { id: "mastery", name: "Meisterschaft", icon: "🧠", desc: "+EXP Gain" }
        ];

        talents.forEach(t => {
            const lvl = this.state.talents[t.id] || 0;
            const cost = (lvl + 1) * 100;

            const card = document.createElement("div");
            card.style.background = "rgba(255,255,255,0.05)";
            card.style.border = "1px solid rgba(255,255,255,0.1)";
            card.style.borderRadius = "12px";
            card.style.padding = "12px";
            card.style.display = "flex";
            card.style.flexDirection = "column";
            card.style.gap = "6px";

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="font-weight:800; display:flex; align-items:center; gap:6px;">${t.icon} ${t.name}</div>
                    <div style="font-size:12px; opacity:0.7;">Lvl ${lvl}</div>
                </div>
                <div style="font-size:11px; opacity:0.6;">${t.desc}</div>
                <button class="upgradeBtn" style="margin-top:auto; background:var(--accent); border:none; border-radius:6px; color:white; font-weight:700; padding:6px; cursor:pointer;">
                    Upgrade (${cost}G)
                </button>
            `;

            const btn = card.querySelector(".upgradeBtn");
            btn.onclick = () => {
                if(this.state.gold >= cost) {
                    this.state.gold -= cost;
                    this.state.talents[t.id]++;
                    this.saveGame();
                    this.renderTalents();
                } else {
                    alert("Nicht genug Gold!");
                }
            };

            grid.appendChild(card);
        });
        view.appendChild(grid);
    },

    // --- Helpers ---

    resizeBoard: function() {
        const wrap = document.getElementById("boardWrap");
        if(!wrap) return;

        // Account for headers/footers
        const totalH = window.innerHeight;
        const availableH = totalH - 180; // approx header + nav height
        const availableW = wrap.clientWidth - 20; // padding

        const cols = 7;
        const rows = 9;
        const gap = 2;

        // Calculate max possible cell size
        const cellW = (availableW - (cols-1)*gap) / cols;
        const cellH = (availableH - (rows-1)*gap) / rows;

        const finalCell = Math.floor(Math.min(cellW, cellH));
        document.documentElement.style.setProperty("--cell", finalCell + "px");
    },

    showMap: function() {
        this.showScene('mapView');
        const mapDiv = document.getElementById("mapNodes");
        if(!mapDiv) return;
        mapDiv.innerHTML = "";

        // Group nodes by row
        const rows = [];
        this.state.map.forEach(n => {
            if(!rows[n.row]) rows[n.row] = [];
            rows[n.row].push(n);
        });

        // Render rows
        rows.forEach((rowNodes, rIndex) => {
            const rowDiv = document.createElement("div");
            rowDiv.style.display = "flex";
            rowDiv.style.gap = "20px";
            rowDiv.style.justifyContent = "center";
            rowDiv.style.width = "100%";

            rowNodes.forEach(node => {
                const nDiv = document.createElement("div");
                nDiv.className = "map-node " + node.type;
                nDiv.style.width = "60px";
                nDiv.style.height = "60px";
                nDiv.style.borderRadius = "50%";
                nDiv.style.background = `url('${node.biome.bg}')`;
                nDiv.style.backgroundSize = "cover";
                nDiv.style.border = "2px solid #333";
                nDiv.style.position = "relative";
                nDiv.style.cursor = "pointer";

                // Logic: Active if Row 0 (start) OR connected to current
                let active = false;
                if(this.state.currentNode === -1 && node.row === 0) active = true;
                else {
                    const curr = this.state.map.find(x => x.id === this.state.currentNode);
                    if(curr && curr.next.includes(node.id)) active = true;
                }

                if(active) {
                    nDiv.style.borderColor = "var(--accent)";
                    nDiv.style.boxShadow = "0 0 10px var(--accent)";
                    nDiv.onclick = () => {
                        this.state.currentNode = node.id;
                        this.startCombat(node);
                    };
                } else {
                    nDiv.style.opacity = "0.5";
                    nDiv.style.filter = "grayscale(1)";
                }

                // Type Icon
                if(node.type === 'boss') nDiv.innerHTML = "💀";
                else if(node.type === 'shop') nDiv.innerHTML = "🛒";
                else if(node.type === 'elite') nDiv.innerHTML = "⚔️";
                nDiv.style.display = "flex";
                nDiv.style.alignItems = "center";
                nDiv.style.justifyContent = "center";
                nDiv.style.fontSize = "24px";
                nDiv.style.color = "#fff";
                nDiv.style.textShadow = "0 2px 4px black";

                rowDiv.appendChild(nDiv);
            });

            mapDiv.appendChild(rowDiv);
        });
    },

    showScene: function(id) {
        ['townView', 'gameView', 'mapView', 'shopView', 'charView'].forEach(v => {
            const el = document.getElementById(v);
            if(el) el.style.display = (v === id) ? 'flex' : 'none';
        });
        if(id === 'gameView'){
            document.getElementById("page").style.display = 'block';
            document.getElementById("townView").style.display = 'none';
        } else {
            document.getElementById("page").style.display = 'none';
        }
    }
};

// Add resize listener
window.addEventListener("resize", () => {
    if(window.rogueEngine && document.getElementById("page").style.display !== 'none') {
        window.rogueEngine.resizeBoard();
    }
});
