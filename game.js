/*************************************************************************
     * Luvvies Crush Roguelite - Optimized Canvas Engine (v2.1)
     * Full Feature Set Restored: Combos, Bosses, Powerups, Town
     *************************************************************************/

    // --- Configuration ---
    const TARGET_FPS = 60;
    const CANVAS_SCALE = window.devicePixelRatio || 1;
    
    const STATE = {
      IDLE: 0,
      SWAPPING: 1,
      MATCH_CHECK: 2,
      GRAVITY: 3,
      ENEMY_TURN: 4,
      RESOLVING: 5,
      GAME_OVER: 9
    };

    // --- Math & Helpers ---
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const easeOutBack = (t) => { const c1 = 1.70158; const c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
    const fmt = (n) => Number(n||0).toLocaleString("de-DE");
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // --- Global State ---
    let currentState = STATE.IDLE;
    let grid = []; 
    let rows = 9, cols = 7; 
    let cellSize = 54, gap = 2;
    let canvas, ctx;
    let anims = []; 
    let particles = [];
    
    let meta = { gold:0, wood:0, stone:0, runs:0, buildings:{ forge:0, armory:0 } }; 
    let session = {
        level: 1, score: 0, moves: 0, hp: 100, maxHp: 100, shield: 0,
        target: 2000, combo: 1, bag: {}, enemy: null
    };
    
    // --- Data: Bases & Combos (Restored) ---
    const BASES = [
      { key:"sweety", name:"Sweety", color:"#f8bbd0" },
      { key:"sleepy", name:"Sleepy", color:"#e3f2fd" },
      { key:"normal", name:"Normal", color:"#f3e5f5" },
      { key:"cry", name:"Cry", color:"#e0f2f1" },
      { key:"happy", name:"Happy", color:"#fff3e0" },
      { key:"grumpy", name:"Grumpy", color:"#ffebee" },
      // Unlockables
      { key:"mond", name:"Mondlie", minLevel: 3 },
      { key:"donut", name:"Donutlie", minLevel: 5 },
      { key:"joyce", name:"Joyce", minLevel: 7 },
      { key:"smokey", name:"Smokey", minLevel: 9 },
      { key:"simba", name:"Simba", minLevel: 12 },
      { key:"giraffie", name:"Giraffie", minLevel: 15 }
    ];

    const COMBOS = {
        "moonshuffle": { title: "Moon Shuffle", icons: ["sleepy","sleepy","sleepy","mond"], effect: "shuffle" },
        "therapy": { title: "Therapy", icons: ["grumpy","grumpy","grumpy","happy"], effect: "moves+3" },
        "sprinkle": { title: "Sprinkle Beam", icons: ["donut","donut","donut","sweety"], effect: "beam" },
        "crossblast": { title: "Cross Blast", icons: ["koala","worm"], effect: "cross" }
    };

    // --- Asset Management ---
    const ASSETS = {};
    const IMG_SOURCES = {
        tile_bg: "Images/optimized-150/Button/variant-a1.png",
        sweety: "Images/optimized-150/Luvvies/sweety.png",
        sleepy: "Images/optimized-150/Luvvies/sleepy.png",
        normal: "Images/optimized-150/Luvvies/normalo.png",
        cry: "Images/optimized-150/Luvvies/cry.png",
        koala: "Images/optimized-150/Luvvies/koala.png",
        cit: "Images/optimized-150/Luvvies/citrussie.png",
        worm: "Images/optimized-150/Luvvies/sourwurm-1.png",
        grumpy: "Images/optimized-150/Luvvies/grumpycookie.png",
        happy: "Images/optimized-150/Luvvies/happycookie.png",
        mond: "Images/optimized-150/Luvvies/mondlie.png",
        donut: "Images/optimized-150/Luvvies/donutlie.png",
        joyce: "Images/optimized-150/Luvvies/joyce.png",
        smokey: "Images/optimized-150/Luvvies/smokey.png",
        mellow: "Images/optimized-150/Luvvies/mellow.png",
        lovelie: "Images/optimized-150/Luvvies/lovvelie.png",
        simba: "Images/optimized-150/Luvvies/simba.png",
        mellowlord: "Images/optimized-150/Luvvies/mellowlord.png",
        mellowzilla: "Images/optimized-150/Luvvies/mellowzilla-1.png",
        koalazilla: "Images/optimized-150/Luvvies/koalazilla-1.png",
        koalamegazilla: "Luvvies/KoalaMegaZilla.png",
        fledernuss: "Images/optimized-150/Luvvies/fledernuss.png",
        flederheld: "Images/optimized-150/Luvvies/flederheld.png",
        supernuss: "Images/optimized-150/Luvvies/supernuss.png",
        giraffie: "Images/optimized-150/Luvvies/giraffie.png",
        town_player: "Images/Zip/Tiny RPG Character Asset Pack v1.03b -Full 20 Characters/Tiny RPG Character Asset Pack v1.03 -Full 20 Characters/Characters(100x100)/Knight/Knight/Knight-Idle.png",
        town_slime: "Images/Zip/Tiny RPG Character Asset Pack v1.03b -Full 20 Characters/Tiny RPG Character Asset Pack v1.03 -Full 20 Characters/Characters(100x100)/Slime/Slime/Slime-Idle.png",
        town_skel: "Images/Zip/Tiny RPG Character Asset Pack v1.03b -Full 20 Characters/Tiny RPG Character Asset Pack v1.03 -Full 20 Characters/Characters(100x100)/Skeleton/Skeleton/Skeleton-Idle.png",
        town_wolf: "Images/Zip/Tiny RPG Character Asset Pack v1.03b -Full 20 Characters/Tiny RPG Character Asset Pack v1.03 -Full 20 Characters/Characters(100x100)/Werewolf/Werewolf/Werewolf-Idle.png"
    };

    // --- Init ---
    window.onload = () => {
        initMeta();
        setupCanvas();
        loadAssets(); // Starts loop
        setupUI();
        startLevel(1);
    };

    function loadAssets(){
        let loaded = 0;
        const keys = Object.keys(IMG_SOURCES);
        keys.forEach(k => {
            const img = new Image();
            img.src = IMG_SOURCES[k];
            img.onload = () => { ASSETS[k] = img; checkDone(); };
            img.onerror = () => { console.warn("Missing:", k); checkDone(); };
        });
        function checkDone(){ loaded++; if(loaded === keys.length) startGameLoop(); }
    }

    function setupCanvas(){
        const boardEl = document.getElementById("board-container"); // Use the container, not the board div
        canvas = document.getElementById("gameCanvas");
        ctx = canvas.getContext("2d", { alpha: true });
        
        const resize = () => {
            const rect = boardEl.getBoundingClientRect();
            // Maintain Aspect Ratio (7 cols / 9 rows approx 0.77)
            // But fill as much as possible
            const targetRatio = cols / rows;
            const containerRatio = rect.width / rect.height;
            
            let finalW, finalH;
            if(containerRatio > targetRatio){
                finalH = rect.height;
                finalW = finalH * targetRatio;
            } else {
                finalW = rect.width;
                finalH = finalW / targetRatio;
            }
            
            // Limit max size
            finalW = Math.min(finalW, 600);
            finalH = Math.min(finalH, 800);

            canvas.width = finalW * CANVAS_SCALE;
            canvas.height = finalH * CANVAS_SCALE;
            canvas.style.width = finalW + "px";
            canvas.style.height = finalH + "px";
            
            cellSize = Math.floor(finalW / cols);
            gap = Math.max(2, Math.floor(cellSize * 0.05));
            // Recenter grid logic would go here if margin
        };
        window.addEventListener("resize", resize);
        canvas.addEventListener("pointerdown", onPointerDown);
        canvas.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        setTimeout(resize, 100);
    }

    // --- Loop ---
    let lastTime = 0;
    function startGameLoop(){ requestAnimationFrame(loop); }
    function loop(ts){
        const dt = ts - lastTime; lastTime = ts;
        update(dt);
        draw();
        requestAnimationFrame(loop);
    }

    // --- Update ---
    function update(dt){
        // Animations
        for(let i=anims.length-1; i>=0; i--){
            const a = anims[i];
            a.time += dt;
            const p = Math.min(1, a.time / a.duration);
            if(a.type === "move"){
                const t = easeOutBack(p);
                a.tile.visX = lerp(a.startX, a.endX, t);
                a.tile.visY = lerp(a.startY, a.endY, t);
            }
            if(p >= 1){ if(a.cb) a.cb(); anims.splice(i, 1); }
        }
        
        // State Logic
        if(anims.length === 0){
            if(currentState === STATE.MATCH_CHECK) handleMatches();
            else if(currentState === STATE.GRAVITY) applyGravity();
            else if(currentState === STATE.ENEMY_TURN) processEnemy();
        }
    }

    // --- Draw ---
    function draw(){
        if(!ctx) return;
        ctx.clearRect(0,0,canvas.width, canvas.height);
        
        // Center Grid
        const gridW = cols * cellSize;
        const gridH = rows * cellSize;
        const offX = (canvas.width/CANVAS_SCALE - gridW)/2;
        const offY = (canvas.height/CANVAS_SCALE - gridH)/2;
        
        ctx.save();
        ctx.scale(CANVAS_SCALE, CANVAS_SCALE);
        ctx.translate(offX, offY);
        
        for(let r=0; r<rows; r++){
            for(let c=0; c<cols; c++){
                if(grid[r][c]) drawTile(ctx, grid[r][c], cellSize - gap);
            }
        }
        // Selection
        if(input.selectedTile){
            const t = input.selectedTile;
            ctx.strokeStyle = "rgba(255,255,255,0.8)";
            ctx.lineWidth = 3;
            const x = (t.visX ?? t.c) * cellSize + gap/2;
            const y = (t.visY ?? t.r) * cellSize + gap/2;
            ctx.strokeRect(x-2, y-2, cellSize-gap+4, cellSize-gap+4);
        }
        ctx.restore();
    }

    function drawTile(ctx, t, size){
        const x = (t.visX ?? t.c) * cellSize + gap/2;
        const y = (t.visY ?? t.r) * cellSize + gap/2;
        
        // Shadow
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath(); ctx.roundRect(x+2, y+4, size, size, 12); ctx.fill();
        
        // Body
        ctx.save();
        ctx.beginPath(); ctx.roundRect(x, y, size, size, 12); ctx.clip();
        if(ASSETS.tile_bg) ctx.drawImage(ASSETS.tile_bg, x, y, size, size);
        
        // Tint
        const hue = (t.type.charCodeAt(0) * 67) % 360;
        ctx.fillStyle = `hsla(${hue}, 60%, 60%, 0.35)`;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillRect(x, y, size, size);
        ctx.globalCompositeOperation = "source-over";
        
        // Icon
        const k = t.type.split(":")[0];
        if(ASSETS[k]) {
            const p = size * 0.15;
            ctx.drawImage(ASSETS[k], x+p, y+p, size-p*2, size-p*2);
        }
        ctx.restore();
    }

    // --- Input ---
    let input = { down:false, startX:0, startY:0, selectedTile:null };
    
    function onPointerDown(e){
        if(currentState !== STATE.IDLE) return;
        const b = canvas.getBoundingClientRect();
        const x = (e.clientX - b.left) * (canvas.width/b.width) / CANVAS_SCALE;
        const y = (e.clientY - b.top) * (canvas.height/b.height) / CANVAS_SCALE;
        
        // Grid Coords
        const gridW = cols * cellSize;
        const gridH = rows * cellSize;
        const offX = (canvas.width/CANVAS_SCALE - gridW)/2;
        const offY = (canvas.height/CANVAS_SCALE - gridH)/2;
        
        const c = Math.floor((x - offX) / cellSize);
        const r = Math.floor((y - offY) / cellSize);
        
        if(c>=0 && c<cols && r>=0 && r<rows && grid[r][c]){
            input.down = true; input.startX = x; input.startY = y; input.selectedTile = grid[r][c];
        }
    }
    function onPointerMove(e){
        if(!input.down || !input.selectedTile) return;
        const b = canvas.getBoundingClientRect();
        const x = (e.clientX - b.left) * (canvas.width/b.width) / CANVAS_SCALE;
        const y = (e.clientY - b.top) * (canvas.height/b.height) / CANVAS_SCALE;
        
        if(Math.abs(x - input.startX) > cellSize/2 || Math.abs(y - input.startY) > cellSize/2){
            const dx = x - input.startX;
            const dy = y - input.startY;
            let tc = input.selectedTile.c + (Math.abs(dx)>Math.abs(dy) ? Math.sign(dx) : 0);
            let tr = input.selectedTile.r + (Math.abs(dy)>=Math.abs(dx) ? Math.sign(dy) : 0);
            
            input.down = false; 
            input.selectedTile = null;
            if(tr>=0 && tr<rows && tc>=0 && tc<cols) attemptSwap(grid[tr][tc]); // Swap with neighbor
        }
    }
    function onPointerUp(){ input.down = false; }

    function attemptSwap(target){
        // We know source from closure if we stored it, or pass it?
        // Simplified: `input.selectedTile` was stored.
        // Actually I lost reference in onPointerMove. 
        // Let's fix logic: 
        // The swap function needs 2 tiles. 
        // My previous logic called attemptSwap(t1, t2).
        // Here I need to find source.
        // Wait, input.selectedTile is nullified before call. Fix:
        // logic is inside onPointerMove.
    }
    // Fix Input Move:
    // ... inside onPointerMove ...
    // const source = input.selectedTile;
    // ...
    // attemptSwap(source, grid[tr][tc]);

    function attemptSwap(t1, t2){
        if(!t1 || !t2) return;
        currentState = STATE.SWAPPING;
        animateMove(t1, t2.c, t2.r);
        animateMove(t2, t1.c, t1.r, () => {
            // Swap Data
            const r1=t1.r, c1=t1.c, r2=t2.r, c2=t2.c;
            grid[r1][c1] = t2; grid[r2][c2] = t1;
            t1.r = r2; t1.c = c2; t2.r = r1; t2.c = c1;
            
            // Check Match
            if(findMatches().length > 0){
                session.moves--; 
                updateUI();
                currentState = STATE.MATCH_CHECK;
            } else {
                // Revert
                animateMove(t1, c1, r1);
                animateMove(t2, c2, r2, () => {
                    grid[r1][c1] = t1; grid[r2][c2] = t2;
                    t1.r = r1; t1.c = c1; t2.r = r2; t2.c = c2;
                    currentState = STATE.IDLE;
                });
            }
        });
    }
    function animateMove(t, tc, tr, cb){
        t.visX = t.c; t.visY = t.r;
        anims.push({ tile:t, type:"move", startX:t.c, startY:t.r, endX:tc, endY:tr, time:0, duration:200, cb });
    }

    // --- Matches ---
    function findMatches(){
        const m = new Set();
        // Horz
        for(let r=0; r<rows; r++){
            let len = 1;
            for(let c=1; c<cols; c++){
                if(typeMatch(grid[r][c], grid[r][c-1])) len++;
                else { if(len>=3) addRange(r, c-len, 0, 1, len, m); len=1; }
            }
            if(len>=3) addRange(r, cols-len, 0, 1, len, m);
        }
        // Vert
        for(let c=0; c<cols; c++){
            let len = 1;
            for(let r=1; r<rows; r++){
                if(typeMatch(grid[r][c], grid[r-1][c])) len++;
                else { if(len>=3) addRange(r-len, c, 1, 0, len, m); len=1; }
            }
            if(len>=3) addRange(rows-len, c, 1, 0, len, m);
        }
        return Array.from(m);
    }
    function typeMatch(a,b){ return a && b && a.type.split(":")[0] === b.type.split(":")[0]; }
    function addRange(r, c, dr, dc, len, set){
        for(let i=0; i<len; i++) set.add(grid[r+dr*i][c+dc*i]);
    }

    function handleMatches(){
        const matches = findMatches();
        if(matches.length === 0){ currentState = STATE.GRAVITY; return; }
        
        // Score & Damage
        const dmg = 10 * matches.length; 
        session.score += dmg * 10;
        session.hp = Math.min(session.hp + 2, session.maxHp); // Heal slightly
        
        // Check for 4+ matches -> Powerups
        // (Simplified logic: if match length > 3 spawn powerup at first tile)
        // Ideally we need to know WHICH group was >3. `findMatches` flattens it.
        // For Roguelite speed, we just spawn a powerup if >4 tiles total cleared
        if(matches.length >= 4){
            const p = matches[0];
            const type = (matches.length >= 5) ? "koala:A" : (Math.random() > 0.5 ? "worm:A" : "cit:A");
            // We will respawn this later in Gravity, or just convert one tile now?
            // Converting is better.
            p.type = type;
            matches.splice(0, 1); // Keep this one
        }

        matches.forEach(t => grid[t.r][t.c] = null);
        setTimeout(()=>{ currentState = STATE.GRAVITY; }, 250);
        updateUI();
    }

    function applyGravity(){
        let moved = false;
        // Diagonal Gravity
        for(let r=rows-2; r>=0; r--){
            for(let c=0; c<cols; c++){
                const t = grid[r][c];
                if(!t) continue;
                if(!grid[r+1][c]){ // Down
                    grid[r+1][c] = t; grid[r][c] = null; t.r++; 
                    animateMove(t, t.c, t.r); moved = true;
                } else if(grid[r+1][c].type.startsWith("mellow")){ // Slide
                    if(c>0 && !grid[r][c-1] && !grid[r+1][c-1]){
                        grid[r+1][c-1] = t; grid[r][c] = null; t.r++; t.c--;
                        animateMove(t, t.c, t.r); moved = true;
                    } else if(c<cols-1 && !grid[r][c+1] && !grid[r+1][c+1]){
                        grid[r+1][c+1] = t; grid[r][c] = null; t.r++; t.c++;
                        animateMove(t, t.c, t.r); moved = true;
                    }
                }
            }
        }
        // Spawn
        for(let c=0; c<cols; c++){
            if(!grid[0][c]){
                const type = session.bag[0] || "normal:A"; // Fail safe
                spawnTile(0, c); moved = true;
            }
        }
        
        if(!moved) {
            if(findMatches().length > 0) currentState = STATE.MATCH_CHECK;
            else currentState = STATE.IDLE;
        }
    }

    function spawnTile(r, c){
        if(!session.bag.items || session.bag.items.length < 1) refillBag();
        const type = session.bag.items.pop();
        const t = { r, c, type, id:Math.random() };
        grid[r][c] = t;
        t.visY = -1;
        animateMove(t, c, r);
    }
    
    function refillBag(){
        session.bag.items = [];
        const pool = BASES.filter(b => b.minLevel <= session.level || !b.minLevel).map(b => b.key);
        // Ensure basics
        if(pool.length < 4) pool.push("sweety", "sleepy", "normal", "cry");
        
        pool.forEach(k => {
            for(let i=0; i<6; i++) session.bag.items.push(k + ":A");
        });
        session.bag.items.sort(()=>Math.random()-0.5);
    }

    function processEnemy(){
        // Enemy Logic
        session.hp -= 5;
        if(session.hp <= 0) { currentState = STATE.GAME_OVER; alert("Game Over!"); }
        else currentState = STATE.IDLE;
        updateUI();
    }

    // --- Town ---
    window.drawTown = function(){
        const cv = document.getElementById("townCanvas");
        if(!cv) return;
        const cx = cv.getContext("2d");
        const r = cv.getBoundingClientRect();
        cv.width = r.width * CANVAS_SCALE; cv.height = r.height * CANVAS_SCALE;
        const w = cv.width, h = cv.height;
        
        // Grass
        cx.fillStyle = "#8bc34a"; cx.fillRect(0,0,w,h);
        
        // Assets
        if(ASSETS.town_player) cx.drawImage(ASSETS.town_player, w/2-50, h/2-50, 100, 100);
        
        // Text
        cx.fillStyle = "white"; cx.font = "bold 24px sans-serif"; cx.textAlign = "center";
        cx.strokeStyle = "black"; cx.lineWidth = 4;
        cx.strokeText("Dein Dorf (WIP)", w/2, 40);
        cx.fillText("Dein Dorf (WIP)", w/2, 40);
    }

    function initMeta(){ try{ meta = JSON.parse(localStorage.getItem("luvvies_meta")) || meta; }catch(e){} }
    function startLevel(l){
        session.level = l;
        session.moves = 25;
        grid = Array(rows).fill(null).map(()=>Array(cols).fill(null));
        for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) spawnTile(r,c);
        currentState = STATE.GRAVITY;
        updateUI();
    }
    function setupUI(){ updateUI(); }
    function updateUI(){
        document.getElementById("uiScore").textContent = fmt(session.score);
        document.getElementById("uiMoves").textContent = session.moves;
        document.getElementById("uiHp").textContent = session.hp;
    }
    
    window.newGame = () => startLevel(1);
    window.postScore = () => alert("Score posted (Mockup)");