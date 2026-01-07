/**
 * Luvvies Rogue 2.0 - Meta Logic
 */
console.log("Rogue Engine 2.4 booting...");

window.rogueEngine = {
    state: {
        hero: null,
        gold: 200,
        hp: 100,
        maxHp: 100,
        map: [],
        mapCols: 5,
        mapRows: 0,
        currentNode: -1,
        path: [],
        customCombos: {}, 
        deck: [] 
    },
    
    biomes: [
        { id: "forest", name: "Wald", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Grass/Grass_2_Middle.png", filter: "blur(0.3px) saturate(1.05)", opacity: 0.36, size: "48px 48px", blend: "soft-light", mapSize: "48px 48px" },
        { id: "path", name: "Pfad", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Grass/Path_Middle.png", filter: "blur(0.2px) saturate(0.95) brightness(1.05)", opacity: 0.28, size: "48px 48px", blend: "soft-light", mapSize: "48px 48px" },
        { id: "swamp", name: "Sumpf", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Water/Water_Middle.png", filter: "blur(0.35px) saturate(0.8)", opacity: 0.3, size: "48px 48px", blend: "multiply", mapSize: "48px 48px" },
        { id: "cave", name: "Hoehle", bg: "Images/Zip/Cute_Fantasy/Cute_Fantasy/Tiles/Cave/Cave_Floor_Middle.png", filter: "blur(0.25px) brightness(0.85) saturate(0.8)", opacity: 0.3, size: "48px 48px", blend: "soft-light", mapSize: "48px 48px" },
        { id: "beach", name: "Strand", bg: "Images/Zip/Cute_Fantasy_Free/Cute_Fantasy_Free/Tiles/Beach_Tile.png", filter: "blur(0.2px) brightness(1.08) saturate(1.1)", opacity: 0.3, size: "48px 48px", blend: "soft-light", mapSize: "48px 48px" },
        { id: "farmland", name: "Felder", bg: "Images/Zip/Cute_Fantasy_Free/Cute_Fantasy_Free/Tiles/FarmLand_Tile.png", filter: "blur(0.2px) saturate(1.1) brightness(1.02)", opacity: 0.34, size: "48px 48px", blend: "soft-light", mapSize: "48px 48px" }
    ],

    init: function() {
        console.log("Rogue Init: Checking for BASES...");
        // Wait for main engine data
        if(typeof BASES === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }
        this.showScene('charView');
        this.renderCharSelect();
    },

    renderCharSelect: function() {
        const list = document.getElementById("charList");
        if(!list) return;
        list.innerHTML = "";
        
        // Alle normalen Luvvies als Starter
        const starters = BASES.filter(b => !b.tag || b.tag === 'normal');
        
        starters.forEach(b => {
            const div = document.createElement("div");
            div.className = "char-card";
            div.innerHTML = `
                <img src="${IMG_LARGE[b.key] || b.img}" style="width:80px; height:80px; object-fit:contain;">
                <h3>${b.name}</h3>
            `;
            div.onclick = () => {
                document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
                div.classList.add('selected');
                this.tempHero = b.key;
            };
            list.appendChild(div);
        });
    },

    confirmChar: function() {
        if(!this.tempHero) { alert("Wähle deinen Helden!"); return; }
        this.state.hero = this.tempHero;
        console.log("Hero selected:", this.state.hero);
        this.generateMap();
        this.showMap();
    },

    startNewRun: function() {
        this.state.hero = null;
        this.tempHero = null;
        this.state.gold = 200;
        this.state.hp = 100;
        this.state.maxHp = 100;
        this.state.customCombos = {};
        this.state.deck = [];
        this.generateMap();
        this.showScene('charView');
        this.renderCharSelect();
    },

    generateMap: function() {
        const rows = 15;
        const cols = 5;
        const minNodes = 3;
        const maxNodes = 5;
        const nodes = [];
        const rowNodes = [];
        let id = 0;

        this.state.map = [];
        this.state.currentNode = -1;
        this.state.path = [];
        this.state.mapCols = cols;
        this.state.mapRows = rows;

        const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
        const pickCols = (count) => {
            const pool = Array.from({length: cols}, (_, i) => i);
            for(let i = pool.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * (i + 1));
                const tmp = pool[i];
                pool[i] = pool[j];
                pool[j] = tmp;
            }
            return pool.slice(0, count).sort((a,b) => a - b);
        };
        const pickBiome = () => this.biomes[Math.floor(Math.random() * this.biomes.length)];

        const typeForRow = (row) => {
            if(row === rows - 1) return "boss";
            if(row > 0 && row % 3 === 0) return "shop";
            return "combat";
        };

        for(let r=0; r<rows; r++){
            const count = randInt(minNodes, maxNodes);
            const colsPicked = pickCols(count);
            const rowList = [];
            colsPicked.forEach(c => {
                const node = { id: id++, row: r, col: c, type: typeForRow(r), biome: pickBiome(), next: [] };
                nodes.push(node);
                rowList.push(node);
            });
            rowNodes.push(rowList);
        }

        const pickClosest = (list, col) => {
            if(!list || !list.length) return null;
            const sorted = [...list].sort((a,b) => Math.abs(a.col - col) - Math.abs(b.col - col));
            const top = sorted.slice(0, Math.min(2, sorted.length));
            return top[Math.floor(Math.random() * top.length)];
        };

        for(let r=0; r<rows-1; r++){
            const curr = rowNodes[r];
            const next = rowNodes[r+1];
            curr.forEach(n => { n.next = new Set(); });

            next.forEach(n => {
                const parent = pickClosest(curr, n.col);
                if(parent) parent.next.add(n.id);
            });

            curr.forEach(n => {
                const extra = Math.random() < 0.5 ? 1 : 0;
                for(let i=0; i<extra; i++){
                    const target = pickClosest(next, n.col);
                    if(target) n.next.add(target.id);
                }
                if(n.next.size === 0){
                    const target = pickClosest(next, n.col);
                    if(target) n.next.add(target.id);
                }
                n.next = Array.from(n.next);
            });
        }

        this.state.map = nodes;
    },

    getActiveNodes: function() {
        if(this.state.currentNode < 0){
            return this.state.map.filter(n => n.row === 0);
        }
        const current = this.state.map.find(n => n.id === this.state.currentNode);
        if(!current) return [];
        const nextIds = new Set(current.next || []);
        return this.state.map.filter(n => nextIds.has(n.id));
    },


    showMap: function() {
        this.showScene('mapView');
        const con = document.getElementById("mapNodes");
        if(!con) return;
        con.innerHTML = "";

        const nodes = this.state.map;
        if(!nodes.length) return;

        const rows = this.state.mapRows || (Math.max.apply(null, nodes.map(n => n.row)) + 1);
        const cols = this.state.mapCols || (Math.max.apply(null, nodes.map(n => n.col)) + 1);
        con.style.setProperty("--map-cols", cols);

        const activeNodes = this.getActiveNodes();
        const activeIds = new Set(activeNodes.map(n => n.id));
        const visited = new Set(this.state.path || []);

        const byRow = new Map();
        nodes.forEach(n => {
            if(!byRow.has(n.row)) byRow.set(n.row, new Map());
            byRow.get(n.row).set(n.col, n);
        });

        for(let r=0; r<rows; r++){
            const rowEl = document.createElement("div");
            rowEl.className = "map-row";
            const rowMap = byRow.get(r) || new Map();
            for(let c=0; c<cols; c++){
                const node = rowMap.get(c);
                if(!node){
                    const slot = document.createElement("div");
                    slot.className = "map-slot";
                    rowEl.appendChild(slot);
                    continue;
                }
                const el = document.createElement("div");
                el.className = "map-node " + node.type;
                if(visited.has(node.id)) el.classList.add("done");
                else if(activeIds.has(node.id)) el.classList.add("active");
                else el.classList.add("locked");

                const mapSize = node.biome.mapSize || node.biome.size || "48px 48px";
                el.style.setProperty("--map-tile-size", mapSize);
                el.style.backgroundImage = `url('${node.biome.bg}')`;
                el.title = node.biome.name + " - " + node.type;
                el.textContent = node.type === "shop" ? "S" : (node.type === "boss" ? "B" : "C");
                el.onclick = () => { if(activeIds.has(node.id)) this.enterNode(node); };
                rowEl.appendChild(el);
            }
            con.appendChild(rowEl);
        }

        const biomeNames = [...new Set(activeNodes.map(n => n.biome.name))];
        document.getElementById("mapBiomeName").textContent = biomeNames.length ? biomeNames.join(" / ") : "Ende";
        document.getElementById("mapGold").textContent = this.state.gold;
    },



    enterNode: function(node) {
        if(!node) return;
        this.state.currentNode = node.id;
        if(!this.state.path.includes(node.id)) this.state.path.push(node.id);

        const biome = node.biome || this.biomes[0];
        const filter = biome.filter || "blur(0.2px)";
        const opacity = (biome.opacity != null) ? biome.opacity : 0.32;
        const size = biome.size || "48px 48px";
        const blend = biome.blend || "soft-light";
        document.documentElement.style.setProperty('--board-texture', `url('${biome.bg}')`);
        document.documentElement.style.setProperty('--board-texture-filter', filter);
        document.documentElement.style.setProperty('--board-texture-opacity', String(opacity));
        document.documentElement.style.setProperty('--board-texture-size', size);
        document.documentElement.style.setProperty('--board-texture-blend', blend);

        if(node.type === "shop") this.openShop();
        else this.startCombat(node);
    },



    openShop: function() {
        this.showScene('shopView');
        const grid = document.getElementById("shopContent");
        grid.innerHTML = "";
        
        // Build random combo offers
        const pool = BASES.filter(b => !b.tag || b.tag === 'normal');
        for(let i=0; i<2; i++){
            const b1 = pool[Math.floor(Math.random()*pool.length)];
            const b2 = pool[Math.floor(Math.random()*pool.length)];
            const key = [b1.key, b2.key].sort().join(":");
            const current = this.state.customCombos[key];
            const lvl = current ? current.lvl + 1 : 1;
            
            const div = document.createElement("div");
            div.className = "shop-item";
            div.innerHTML = `<b>${b1.name} + ${b2.name}</b><br>Lv.${lvl}<br>${100*lvl} G`;
            div.onclick = () => {
                if(this.state.gold >= 100*lvl){
                    this.state.gold -= 100*lvl;
                    if(!this.state.customCombos[key]) this.state.customCombos[key] = {lvl:0};
                    this.state.customCombos[key].lvl++;
                    alert("Combo aufgewertet!");
                    this.openShop();
                }
            };
            grid.appendChild(div);
        }
    },

    startCombat: function(node) {
        console.log("Starting Combat Node", node.id);
        this.showScene('gameView');

        // Injektion in Original Engine
        window.cols = 7;
        window.rows = 9;
        const lvl = (node && typeof node.row === "number") ? node.row + 1 : (node.id + 1);
        window.level = lvl;
        window.ROGUE_DIFFICULTY = { match4: lvl >= 5, match5: lvl >= 8 };

        if(typeof newGame === 'function') {
            newGame(true);
        }
    },


    showScene: function(id) {
        // All containers visible/hidden logic
        const scenes = ['charView', 'mapView', 'shopView'];
        scenes.forEach(s => {
            const el = document.getElementById(s);
            if(el) el.style.display = (s === id) ? 'flex' : 'none';
        });
        const page = document.getElementById("page");
        if(page) page.style.display = (id === 'gameView') ? 'block' : 'none';
        const gameView = document.getElementById("gameView");
        if(gameView) gameView.style.display = 'none';
    }
};


