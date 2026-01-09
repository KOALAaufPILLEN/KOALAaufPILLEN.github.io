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
        biomeSequence: [],
        mapCols: 5,
        mapRows: 0,
        currentNode: -1,
        path: [],
        customCombos: {}, 
        deck: [], // Current available tiles in bag
        inventory: [], // Relics / Items
        currentEnemy: null
    },

    // --- Databases ---
    
    // Kawaii Enemies
    enemyDB: [
        { id: "slime", name: "Glibber-Pudding", hp: 80, dmg: 4, img: "town_slime", biome: ["forest", "swamp"] },
        { id: "rat", name: "Käse-Dieb", hp: 60, dmg: 6, img: "town_wolf", biome: ["cave", "forest"] }, 
        { id: "bat", name: "Fleder-Mausi", hp: 50, dmg: 5, img: "fledernuss", biome: ["cave", "night"] },
        { id: "stump", name: "Grantiger Baumstumpf", hp: 120, dmg: 3, img: "town_skel", biome: ["forest"] }, 
        { id: "ghost", name: "Grusel-Beere", hp: 70, dmg: 7, img: "town_skel", biome: ["swamp", "cave"] },
        { id: "crab", name: "Zwick-Zwack", hp: 90, dmg: 5, img: "town_player", biome: ["beach"] }, 
        { id: "cacty", name: "Stachel-Kaktus", hp: 80, dmg: 6, img: "town_player", biome: ["farmland"] },
        { id: "boss_zilla", name: "KoalaMegaZilla", hp: 500, dmg: 10, img: "koalamegazilla", biome: ["boss"], tier: "boss" }
    ],

    // Shop Items
    itemDB: [
        { id: "potion_s", name: "Sweet Juice", type: "consumable", cost: 50, desc: "Heal 30 HP", effect: (s)=>{ s.hp = Math.min(s.hp+30, s.maxHp); } },
        { id: "potion_m", name: "Mega Shake", type: "consumable", cost: 90, desc: "Heal 60 HP", effect: (s)=>{ s.hp = Math.min(s.hp+60, s.maxHp); } },
        { id: "moves_up", name: "Coffee Bean", type: "relic", cost: 120, desc: "+5 Max Moves", effect: "moves+5" },
        { id: "gold_up", name: "Golden Spoon", type: "relic", cost: 150, desc: "+20% Gold", effect: "gold+20" },
        { id: "dmg_up", name: "Spicy Candy", type: "relic", cost: 140, desc: "+1 Base Dmg", effect: "dmg+1" }
    ],
    
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
        this.startNewRun();
        this.showMap();
    },

    startNewRun: function() {
        this.state.gold = 200;
        this.state.hp = 100;
        this.state.maxHp = 100;
        this.state.customCombos = {};
        this.state.deck = ["sweety", "sleepy", "normal", "cry"]; // Starter Deck
        this.state.inventory = [];
        this.generateMap();
    },

    generateMap: function() {
        const rows = 18;
        const cols = 7;
        const nodes = [];
        const rowNodes = [];
        let id = 0;

        this.state.map = [];
        this.state.currentNode = -1;
        this.state.path = [];
        this.state.mapCols = cols;
        this.state.mapRows = rows;

        const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
        const pickedBiomes = shuffle(this.biomes.slice()).slice(0, 4);
        const rowsPerBiome = Math.ceil(rows / pickedBiomes.length);

        // Structured Paths: Define 3-4 distinct paths (indices)
        // e.g. [1, 3, 5]
        const paths = [1, 3, 5]; 
        
        for (let r = 0; r < rows; r++) {
            const rowList = [];
            const isBossRow = (r === rows - 1);
            
            // Determine active columns for this row
            // Randomly shift paths slightly or merge them
            let activeCols = new Set();
            if(isBossRow) {
                activeCols.add(3); // Center Boss
            } else {
                paths.forEach(p => {
                    // Wiggle path: p-1, p, or p+1 (clamped)
                    let c = p;
                    if(Math.random() < 0.3) c += (Math.random() < 0.5 ? -1 : 1);
                    c = Math.max(0, Math.min(cols-1, c));
                    activeCols.add(c);
                });
                // Ensure at least 3 nodes per row for variety
                while(activeCols.size < 3){
                    activeCols.add(Math.floor(Math.random()*cols));
                }
            }
            
            const sortedCols = Array.from(activeCols).sort((a,b)=>a-b);

            sortedCols.forEach(c => {
                let type = "combat";
                const rng = Math.random();
                if (isBossRow) type = "boss";
                else if (r > 0 && r % 5 === 0 && rng < 0.5) type = "shop";
                else if (rng < 0.1) type = "shop";
                else if (rng < 0.25) type = "elite";
                
                const biome = pickedBiomes[Math.min(Math.floor(r / rowsPerBiome), pickedBiomes.length - 1)];
                const node = { id: id++, row: r, col: c, type: type, biome: biome, next: [] };
                nodes.push(node);
                rowList.push(node);
            });
            rowNodes.push(rowList);
        }

        // Connect Forward (Only to near neighbors)
        for (let r = 0; r < rows - 1; r++) {
            const curr = rowNodes[r];
            const next = rowNodes[r + 1];
            
            curr.forEach(n => {
                // Connect to closest nodes in next row (dist <= 1 or 2)
                // Prefer closer ones.
                const neighbors = next.filter(tn => Math.abs(tn.col - n.col) <= 1);
                if(neighbors.length === 0){
                    // Force connection to closest if no immediate neighbor (gap jump)
                    // Find absolute closest
                    let closest = next[0];
                    let minD = 999;
                    next.forEach(tn => {
                        const d = Math.abs(tn.col - n.col);
                        if(d < minD){ minD = d; closest = tn; }
                    });
                    neighbors.push(closest);
                }
                
                neighbors.forEach(tn => n.next.push(tn.id));
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
        const nodeEls = new Map();

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
                nodeEls.set(node.id, el);
                rowEl.appendChild(el);
            }
            con.appendChild(rowEl);
        }

        const biomeNames = [...new Set(activeNodes.map(n => n.biome.name))];
        document.getElementById("mapBiomeName").textContent = biomeNames.length ? biomeNames.join(" / ") : "Ende";
        document.getElementById("mapGold").textContent = this.state.gold;
        requestAnimationFrame(() => this.drawMapLines(nodeEls, con, visited));
        this.bindMapResize();
    },

    bindMapResize: function() {
        if(this._mapResizeBound) return;
        this._mapResizeBound = true;
        window.addEventListener("resize", () => {
            const mapView = document.getElementById("mapView");
            if(mapView && mapView.style.display === "flex") this.showMap();
        });
    },

    drawMapLines: function(nodeEls, container, visited) {
        const svg = document.getElementById("mapLines");
        if(!svg || !container) return;
        while(svg.firstChild) svg.removeChild(svg.firstChild);

        const conRect = container.getBoundingClientRect();
        if(conRect.width === 0 || conRect.height === 0) return;
        svg.setAttribute("width", conRect.width);
        svg.setAttribute("height", conRect.height);
        svg.setAttribute("viewBox", `0 0 ${conRect.width} ${conRect.height}`);

        const centers = new Map();
        nodeEls.forEach((el, id) => {
            const r = el.getBoundingClientRect();
            centers.set(id, {
                x: r.left - conRect.left + (r.width / 2),
                y: r.top - conRect.top + (r.height / 2)
            });
        });

        const currentId = this.state.currentNode;

        this.state.map.forEach(node => {
            if(!node.next || !node.next.length) return;
            const from = centers.get(node.id);
            if(!from) return;
            node.next.forEach(nextId => {
                const to = centers.get(nextId);
                if(!to) return;
                const c1x = from.x;
                const c1y = from.y + (to.y - from.y) * 0.35;
                const c2x = to.x;
                const c2y = from.y + (to.y - from.y) * 0.65;
                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                path.setAttribute("d", `M ${from.x} ${from.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${to.x} ${to.y}`);
                let cls = "map-line";
                if(currentId === node.id) cls += " active";
                else if(visited && visited.has(node.id) && visited.has(nextId)) cls += " done";
                path.setAttribute("class", cls);
                svg.appendChild(path);
            });
        });
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
        
        // 1. Sell Luvvies (Biome Specific Unlocks)
        const currentNode = this.state.map.find(n => n.id === this.state.currentNode);
        const biomeId = currentNode ? currentNode.biome.id : "forest";
        
        let biomePool = [];
        switch(biomeId) {
            case "forest": biomePool = ["mond"]; break;
            case "swamp": biomePool = ["smokey", "grumpy"]; break;
            case "cave": biomePool = ["joyce", "cry"]; break;
            case "beach": biomePool = ["donut", "happy"]; break;
            case "farmland": biomePool = ["giraffie", "simba", "cit"]; break;
            default: biomePool = ["normal"];
        }
        
        const offerPool = biomePool.filter(k => !this.state.deck.includes(k));
        const generalPool = BASES.filter(b => !this.state.deck.includes(b.key) && !b.tag);
        const finalPool = offerPool.length > 0 ? offerPool : generalPool;
        
        if(finalPool.length > 0) {
            const luvKey = finalPool[Math.floor(Math.random() * finalPool.length)];
            const luv = BASES.find(b => b.key === luvKey) || BASES[0];
            
            // Cost: 80 G (approx 2 levels of play)
            const cost = 80;
            
            const div = document.createElement("div");
            div.className = "shop-item luv";
            div.innerHTML = `
                <img src="${IMG_SOURCES[luv.key] || luv.img}" style="width:40px;">
                <b>${luv.name}</b><br><span style="font-size:10px; opacity:0.8;">${biomeId.toUpperCase()} SPECIAL</span><br>Join Team<br>${cost} G
            `;
            div.onclick = () => {
                if(this.state.gold >= cost){
                    this.state.gold -= cost;
                    this.state.deck.push(luv.key);
                    alert(`${luv.name} joined!`);
                    this.openShop();
                }
            };
            grid.appendChild(div);
        }

        // 2. Sell Items
        // Lowered costs
        const items = this.itemDB.sort(()=>Math.random()-0.5).slice(0, 2);
        items.forEach(it => {
            // Re-scale item costs for display/logic
            // Base Item Cost logic override
            let realCost = 30; // Default
            if(it.id.includes("potion")) realCost = 25;
            if(it.type === "relic") realCost = 60;
            
            const div = document.createElement("div");
            div.className = "shop-item";
            div.innerHTML = `<b>${it.name}</b><br>${it.desc}<br>${realCost} G`;
            div.onclick = () => {
                if(this.state.gold >= realCost){
                    this.state.gold -= realCost;
                    if(it.type === 'consumable') it.effect(this.state);
                    else this.state.inventory.push(it);
                    alert(`Bought ${it.name}!`);
                    this.openShop(); // Refresh
                }
            };
            grid.appendChild(div);
        });

        // 3. Custom Combo
        const pool = BASES.filter(b => this.state.deck.includes(b.key)); 
        if(pool.length >= 2){
            const b1 = pool[Math.floor(Math.random()*pool.length)];
            const b2 = pool[Math.floor(Math.random()*pool.length)];
            if(b1.key !== b2.key){
                const key = [b1.key, b2.key].sort().join(":");
                const current = this.state.customCombos[key];
                const lvl = current ? current.lvl + 1 : 1;
                
                // Cost: 25 * lvl
                const cost = 25 * lvl;
                
                const div = document.createElement("div");
                div.className = "shop-item combo";
                div.innerHTML = `<b>${b1.name} + ${b2.name}</b><br>Combo Lv.${lvl}<br>${cost} G`;
                div.onclick = () => {
                    if(this.state.gold >= cost){
                        this.state.gold -= cost;
                        if(!this.state.customCombos[key]) this.state.customCombos[key] = {lvl:0};
                        this.state.customCombos[key].lvl++;
                        alert("Combo Upgraded!");
                        this.openShop();
                    }
                };
                grid.appendChild(div);
            }
        }
    },

    startCombat: function(node) {
        console.log("Starting Combat Node", node.id);
        
        // 1. Pick Enemy
        const biomeId = node.biome.id;
        const potential = this.enemyDB.filter(e => e.biome.includes(biomeId) || (node.type==='boss' && e.tier==='boss'));
        let enemy = potential[Math.floor(Math.random() * potential.length)];
        
        // Fallback
        if(!enemy) enemy = this.enemyDB[0];

        // Scale Stats
        const lvl = (node.row + 1);
        let scale = 1 + (lvl * 0.15); // +15% per level
        
        // Elite Scaling
        if (node.type === 'elite') {
            scale *= 1.5; // 50% stronger
            enemy = { ...enemy, name: "Elite " + enemy.name, tier: "elite" };
        }
        
        this.state.currentEnemy = {
            ...enemy,
            maxHp: Math.floor(enemy.hp * scale),
            hp: Math.floor(enemy.hp * scale),
            dmg: Math.floor(enemy.dmg * (1 + lvl * 0.05))
        };
        
        console.log("VS", this.state.currentEnemy.name);

        this.showScene('gameView');

        // Randomized Board Shapes
        const shapes = [
            { c: 7, r: 9 }, // Standard
            { c: 6, r: 9 }, // Narrow
            { c: 8, r: 8 }, // Square-ish
            { c: 7, r: 8 }  // Shorter
        ];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Injektion in Original Engine
        window.cols = shape.c;
        window.rows = shape.r;
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


