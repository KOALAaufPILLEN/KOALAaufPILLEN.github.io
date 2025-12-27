/**
 * Luvvies Crush - Core Logic
 * Based on original 'pasted.html' to preserve game feel.
 */

// --- CONSTANTS & CONFIG ---
const SUPABASE_URL = "https://qgeddoqvzajpeawlythi.supabase.co";
const SUPABASE_KEY = "sb_publishable_EQUOdDGiCGgm8vA3YjN_jg_BwPnAiI_";
const SCORE_TABLE = "luvvies_crush_scores";

const IMG = {
    logo: "https://static.wixstatic.com/media/d05122_7c445c8b5f3d46cdb778711661f2351e~mv2.png",
    sweety: "https://static.wixstatic.com/media/d05122_efe39fec7e5c4d569dfb3fef75e5b6ff~mv2.png",
    sleepy: "https://static.wixstatic.com/media/d05122_cfd779a0aad04c72bd08efbc0f363f53~mv2.png",
    normal: "https://static.wixstatic.com/media/d05122_8a7c2f43a31247a6994651163c2898c5~mv2.png",
    cry: "https://static.wixstatic.com/media/d05122_1950f2496b344e56bcac10ea51286750~mv2.png",
    koala: "https://static.wixstatic.com/media/d05122_9cb17e901a1a4775819bfda895d0f1c9~mv2.png",
    citrussy: "https://static.wixstatic.com/media/d05122_9cdc763a1ec94a90a3fd91ee3481b2c4~mv2.png",
    worm: "https://static.wixstatic.com/media/d05122_a8e7a37e04694ff2a99b8af60f1567b7~mv2.png",
    grumpy: "https://static.wixstatic.com/media/d05122_983d59c5911e400e92819d12e27d6073~mv2.png",
    happy: "https://static.wixstatic.com/media/d05122_cff843264bd8495aaa9ac0360d72e131~mv2.png",
    mond: "https://static.wixstatic.com/media/d05122_aea344c0fd954194af2855eea745febf~mv2.png",
    donut: "https://static.wixstatic.com/media/d05122_5041c19e720d4e7e9439e4acf793655c~mv2.png",
    joyce: "https://static.wixstatic.com/media/d05122_36a3f8d83be4433082995ee1a8003218~mv2.png",
    smokey: "https://static.wixstatic.com/media/d05122_9a607ff042b647b789e3b44cc75bd38d~mv2.png",
    mellow: "https://static.wixstatic.com/media/d05122_53fbcb0babf447a5a32cc3b3fbecad2b~mv2.png",
    lovelie: "https://static.wixstatic.com/media/d05122_755c29b99fad419d9b9a5822d8ffb18c~mv2.png",
    simba: "https://static.wixstatic.com/media/d05122_4d92be50d61e4a2297af16a3295c38bf~mv2.png"
};

const DIFFS = {
    easy:   { key:"easy",   name:"Easy",        rows:10, cols:10, scoreMult:1.00, baseMoves:30, movesPerLevel:2, baseTarget:3500, targetGrow:0.18, lovelieChance:0.006, mystChance:0.010 },
    normal: { key:"normal", name:"Normal",      rows: 9, cols: 9, scoreMult:1.25, baseMoves:26, movesPerLevel:2, baseTarget:4200, targetGrow:0.20, lovelieChance:0.005, mystChance:0.009 },
    hard:   { key:"hard",   name:"Hard",        rows: 9, cols: 8, scoreMult:1.60, baseMoves:24, movesPerLevel:1, baseTarget:5000, targetGrow:0.22, lovelieChance:0.004, mystChance:0.008 },
    shock:  { key:"shock",  name:"Zuckerschock",rows: 8, cols: 8, scoreMult:2.00, baseMoves:22, movesPerLevel:1, baseTarget:6500, targetGrow:0.24, lovelieChance:0.003, mystChance:0.007 }
};

const BASES = [
    { key:"sweety", name:"Sweety", img:IMG.sweety, tag:"normal", palettes:{ A:["#ff4fb9","#ff9adf"], B:["#46e4c2","#a7fff0"] }, minLevel:1 },
    { key:"sleepy", name:"Sleepy", img:IMG.sleepy, tag:"normal", palettes:{ A:["#7ad8ff","#b7f0ff"], B:["#ffd46a","#fff2b7"] }, minLevel:1 },
    { key:"normal", name:"Normal", img:IMG.normal, tag:"normal", palettes:{ A:["#7b7bff","#cbbcff"], B:["#ff7bd6","#ffd0f1"] }, minLevel:1 },
    { key:"cry", name:"Cry", img:IMG.cry, tag:"normal", palettes:{ A:["#1fd1ff","#b8b1ff"], B:["#5ef2b5","#b6ffd6"] }, minLevel:1 },
    { key:"happy", name:"Happy", img:IMG.happy, tag:"normal", palettes:{ A:["#5ef2b5","#b6ffd6"], B:["#7ad8ff","#b7f0ff"] }, minLevel:2 },
    { key:"grumpy", name:"Grumpy", img:IMG.grumpy, tag:"normal", palettes:{ A:["#ff6b6b","#ffb3b3"], B:["#ffcf5a","#fff2b7"] }, minLevel:2 },
    { key:"mond", name:"Mondlie", img:IMG.mond, tag:"normal", palettes:{ A:["#2b2b2b","#9b59ff"], B:["#ff4fb9","#7ad8ff"] }, minLevel:3 },
    { key:"donut", name:"Donut", img:IMG.donut, tag:"normal", palettes:{ A:["#ffd1f2","#c9fffb"], B:["#ffcf5a","#ff9adf"] }, minLevel:3 },
    { key:"joyce", name:"Joyce", img:IMG.joyce, tag:"normal", palettes:{ A:["#7ad8ff","#b8b1ff"], B:["#ff4fb9","#ffd1f2"] }, minLevel:1 },
    { key:"smokey", name:"Smokey", img:IMG.smokey, tag:"normal", palettes:{ A:["#ffcf5a","#ffd9a5"], B:["#5ef2b5","#b6ffd6"] }, minLevel:1 },
    { key:"simba", name:"Simba", img:IMG.simba, tag:"normal", palettes:{ A:["#ff9d3c","#ffd1a1"], B:["#7ad8ff","#b7f0ff"] }, minLevel:4 }
];

const SPECIALS = {
    worm:   { key:"worm",   name:"Sourworm", img:IMG.worm, tag:"powerup" },
    cit:    { key:"cit",    name:"Citrussy", img:IMG.citrussy, tag:"powerup" },
    koala:  { key:"koala",  name:"Koala", img:IMG.koala, tag:"powerup" },
    mellow: { key:"mellow", name:"Mellow", img:IMG.mellow, tag:"obstacle" },
    lovelie:{ key:"lovelie",name:"Lovelie", img:IMG.lovelie, tag:"bonus" },
    myst:   { key:"myst",   name:"???", img:null, tag:"powerup" }
};

const MYST_POOL = [
    { key:"worm",   w: 40 },
    { key:"cit",    w: 25 },
    { key:"mellow", w: 16 },
    { key:"koala",  w: 12 },
    { key:"lovelie",w:  7 }
];

// --- STATE ---
let state = {
    grid: [],
    tileEls: new Map(),
    bigMellows: new Map(),
    rows: 10, cols: 10,
    level: 1,
    score: 0,
    levelScore: 0,
    target: 0,
    moves: 30,
    combo: 1,
    busy: false,
    diff: DIFFS.easy,
    unlocked: {},
    lastSwap: null
};

// UI Cache
const ui = {};

// --- INIT & BOOT ---
window.addEventListener('DOMContentLoaded', () => {
    // UI Refs
    ['uiLevel','uiGoal','uiScore','uiMoves','uiCombo','uiBar','uiPct','board','fxLayer','luvMenu','hudLevel','hudScore','hudBar'].forEach(id => ui[id] = document.getElementById(id));
    
    // Greeting logo
    document.getElementById("greetLogo").src = IMG.logo;
    
    // Supabase
    try {
        if(window.supabase?.createClient) window.sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } catch(e) {}

    // Events
    bindEvents();
    
    // Start
    resetUnlocked();
    newGame(true);
    showGreetingIfNeeded();
    
    // Background FX
    buildGlobalBg();
    buildFsBg();
});

function bindEvents() {
    // Theme
    document.getElementById('checkbox-theme').addEventListener('change', (e) => {
        document.body.classList.toggle('dark-mode', e.target.checked);
    });

    // Buttons
    document.getElementById("btnNew").onclick = () => newGame(false);
    document.getElementById("btnHint").onclick = hint;
    document.getElementById("btnFs").onclick = toggleFullscreen;
    document.getElementById("btnPost").onclick = postScore;
    document.getElementById("btnRefresh").onclick = refreshLeaderboard;
    
    // Fullscreen HUD Buttons
    document.getElementById("fsHint").onclick = (e) => { e.stopPropagation(); hint(); };
    document.getElementById("fsExit").onclick = (e) => { e.stopPropagation(); toggleFullscreen(); };

    // Diff
    document.getElementById("diffPills").onchange = (e) => {
        state.diff = DIFFS[e.target.value];
        newGame(true);
    };

    // Modals
    document.getElementById("greetPlay").onclick = () => closeGreeting();
    document.getElementById("greetGuide").onclick = () => { closeGreeting(); openModal("introBack"); };
    document.getElementById("btnIntro").onclick = () => openModal("introBack");
    document.getElementById("introClose").onclick = () => closeModal("introBack");
    document.getElementById("infoClose").onclick = () => closeModal("infoBack");

    // Board Input
    const board = document.getElementById("board");
    board.addEventListener("pointerdown", onPointerDown);
    board.addEventListener("pointermove", onPointerMove);
    board.addEventListener("pointerup", onPointerUp);
    board.addEventListener("pointercancel", onPointerUp);
    
    // Resize
    window.addEventListener("resize", layoutBoard);
}

// --- CORE GAME LOOP ---

function newGame(fromDiffChange) {
    state.busy = false;
    state.level = 1;
    state.score = 0;
    state.levelScore = 0;
    state.combo = 1;
    state.rows = state.diff.rows; // WICHTIG: Übernahme der Rows/Cols aus Diff
    state.cols = state.diff.cols;
    
    state.target = calcTarget(1);
    state.moves = calcMoves(1);
    state.lastSwap = null;
    
    resetUnlocked();
    initBoard();
    buildMenu();
    updateUI();
    refreshLeaderboard();
    
    if(!fromDiffChange) toast("Neues Spiel ✨", `${state.diff.name} • ${state.rows}×${state.cols}`);
}

function initBoard() {
    state.grid = Array.from({length:state.rows}, () => Array.from({length:state.cols}, () => null));
    state.tileEls.clear();
    state.bigMellows.clear();
    ui.board.innerHTML = "";
    
    // Initial Fill
    for(let r=0; r<state.rows; r++) {
        for(let c=0; c<state.cols; c++) {
            let t, tries=0;
            do { t = randNormalType(); tries++; } while(wouldCreateMatch(r,c,t) && tries<50);
            const tile = makeTile(r, c, t);
            state.grid[r][c] = tile;
            createTileView(tile);
        }
    }
    
    spawnMellow();
    maybeSpawnLovelie();
    layoutBoard();
    
    setTimeout(() => resolveAll(true), 100);
}

// --- LOGIC HELPERS ---
function makeTile(r, c, type) {
    return { id: Math.random().toString(36).substr(2,9), r, c, type, hp:0, big:false };
}

function randNormalType() {
    const pool = BASES.filter(b => (b.minLevel || 1) <= state.level);
    const weights = pool.map(b => ({b, w: (b.key==="joyce"||b.key==="smokey")?9:(b.key==="donut"?10:12)}));
    let total = weights.reduce((a,x)=>a+x.w,0);
    let r = Math.random()*total;
    let pick = weights[0].b;
    for(const x of weights) { r-=x.w; if(r<=0){pick=x.b; break;} }
    
    // Variants
    let v="A";
    if(state.unlocked[pick.key]?.has("B") && Math.random()<0.3) v="B";
    return `${pick.key}:${v}`;
}

function wouldCreateMatch(r, c, type) {
    if(c>=2 && matches(state.grid[r][c-1], type) && matches(state.grid[r][c-2], type)) return true;
    if(r>=2 && matches(state.grid[r-1][c], type) && matches(state.grid[r-2][c], type)) return true;
    return false;
}

function matches(tile, type) {
    if(!tile) return false;
    // Strict match type string (e.g. "sweety:A")
    // Special exception for Best Buddies check later, but strict for generation
    return tile.type === type;
}

// --- INTERACTION ---
let ptr = { down:false, id:null, x:0, y:0 };

function onPointerDown(e) {
    if(state.busy) return;
    const t = e.target.closest('.tile');
    if(!t) return;
    
    ptr.down = true;
    ptr.id = t.dataset.id;
    ptr.x = e.clientX;
    ptr.y = e.clientY;
    t.setPointerCapture(e.pointerId);
    
    // NEW: Jelly Feedback on touch
    t.classList.add('jelly-anim');
    setTimeout(() => t.classList.remove('jelly-anim'), 600);
    
    clearHints();
}

function onPointerMove(e) {
    if(!ptr.down) return;
    const dx = e.clientX - ptr.x;
    const dy = e.clientY - ptr.y;
    if(Math.hypot(dx,dy) > 20) {
        // Swipe detected
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx>0 ? 'R' : 'L') : (dy>0 ? 'D' : 'U');
        attemptSwap(ptr.id, dir);
        ptr.down = false;
    }
}

function onPointerUp(e) {
    if(!ptr.down) return;
    ptr.down = false;
    // Click detected (e.g. for ??? tile)
    const tile = findTile(ptr.id);
    if(tile && tile.type.startsWith("myst")) revealMyst(tile);
}

function attemptSwap(id, dir) {
    const t1 = findTile(id);
    if(!t1 || isBlocker(t1)) return;
    
    let dr=0, dc=0;
    if(dir==='R') dc=1; else if(dir==='L') dc=-1; else if(dir==='D') dr=1; else dr=-1;
    
    const r2 = t1.r + dr, c2 = t1.c + dc;
    if(!inBounds(r2,c2)) return;
    
    const t2 = state.grid[r2][c2];
    if(!t2 || isBlocker(t2)) return;
    
    // Execute Swap
    state.busy = true;
    state.lastSwap = { pref:{r:r2,c:c2}, alt:{r:t1.r,c:t1.c} };
    doSwap(t1, t2);
    
    setTimeout(() => {
        // Check Matches
        const special = checkPowerSwap(t1, t2);
        if(special) {
            state.moves = Math.max(0, state.moves-1);
            resolvePowerSwap(t1, t2, special, {dr, dc});
        } else if(hasAnyMatch()) {
            state.moves = Math.max(0, state.moves-1);
            resolveAll(false);
        } else {
            // Revert
            doSwap(t1, t2);
            state.moves = Math.max(0, state.moves-3); // Penalty
            toast("Falscher Zug!", "-3 Moves (Penalty)");
            state.busy = false;
            updateUI();
        }
    }, 250);
}

// --- MATCHING LOGIC ---
function resolveAll(initial) {
    const step = () => {
        const matches = findMatches(); // Returns lines
        const specials = findSpecialPatterns(); // Returns T/L/etc
        
        if(matches.length === 0 && specials.length === 0) {
            state.busy = false;
            updateUI();
            checkGameState();
            return;
        }
        
        state.combo++;
        
        // Handle Specials (Complex shapes)
        specials.forEach(sp => {
            const center = sp.cells[0]; // Simplified center
            burstFx(tileCenter(center.r, center.c));
            if(sp.type === 'buddies') { toast("Buddy Burst!"); clearRadius(center.r, center.c, 1); }
            // ... more logic for moonshuffle etc.
            sp.cells.forEach(p => destroy(p.r, p.c));
        });

        // Handle Lines
        matches.forEach(m => {
             // Score logic
             if(!initial) state.score += m.cells.length * 60 * state.diff.scoreMult * state.combo;
             
             // Create Powerups
             if(m.len >= 5) spawnPowerup(m.cells[1], 'cit');
             else if(m.len === 4) spawnPowerup(m.cells[1], 'worm');
             
             m.cells.forEach(p => destroy(p.r, p.c));
        });
        
        // Refill
        setTimeout(() => {
            dropDown();
            setTimeout(step, 300);
        }, 300);
    };
    step();
}

function destroy(r, c) {
    if(!inBounds(r,c)) return;
    const t = state.grid[r][c];
    if(!t) return;
    
    // Hit Mellows around
    hitNeighbors(r,c);
    
    // Visual Pop
    const el = state.tileEls.get(t.id);
    if(el) {
        el.classList.add('pop');
        setTimeout(() => el.remove(), 400);
        state.tileEls.delete(t.id);
    }
    state.grid[r][c] = null;
    createStar(r, c);
}

function dropDown() {
    for(let c=0; c<state.cols; c++) {
        let empty = 0;
        for(let r=state.rows-1; r>=0; r--) {
            if(state.grid[r][c] === null) empty++;
            else if(empty > 0 && !isBlocker(state.grid[r][c])) {
                // Fall
                const t = state.grid[r][c];
                state.grid[r+empty][c] = t;
                state.grid[r][c] = null;
                t.r += empty;
                updateTilePos(t);
            }
        }
        // Fill top
        for(let i=0; i<empty; i++) {
            const t = makeTile(i, c, randNormalType());
            state.grid[i][c] = t;
            createTileView(t, true);
        }
    }
}

// --- UTILS ---
function createTileView(t, drop=false) {
    const el = document.createElement('div');
    el.className = 'tile';
    el.dataset.id = t.id;
    
    const [key, v] = t.type.split(':');
    const base = BASES.find(b=>b.key===key) || SPECIALS[key];
    const pal = base?.palettes?.[v] || base?.palettes?.A || ["#ccc","#fff"];
    
    el.style.setProperty('--p1', pal[0]);
    el.style.setProperty('--p2', pal[1]);
    
    const plate = document.createElement('div');
    plate.className = 'plate';
    if(t.big) el.classList.add('bigMellow');
    
    if(key === 'myst') plate.innerHTML = '<div class="qmark">?</div>';
    else plate.innerHTML = `<img src="${base?.img || ''}">`;
    
    if(key === 'mellow') {
        const hp = document.createElement('div');
        hp.className = 'hp'; hp.innerText = t.hp;
        el.appendChild(hp);
    }
    
    el.appendChild(plate);
    ui.board.appendChild(el);
    updateTilePos(t);
    
    if(drop) {
        plate.style.transform = `translateY(-200px)`;
        requestAnimationFrame(() => plate.style.transform = 'translateY(0)');
    }
}

function updateTilePos(t) {
    const el = state.tileEls.get(t.id);
    if(!el) { state.tileEls.set(t.id, document.querySelector(`.tile[data-id="${t.id}"]`)); return; }
    
    // CSS Grid Vars for Layout
    const cell = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--cell'));
    const gap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--gap'));
    const pad = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--pad'));
    
    const x = pad + t.c * (cell+gap);
    const y = pad + t.r * (cell+gap);
    
    el.style.setProperty('--x', x+'px');
    el.style.setProperty('--y', y+'px');
}

function layoutBoard() {
    // Dynamic sizing based on viewport
    const board = document.getElementById('boardWrap');
    const w = board.clientWidth;
    const h = board.clientHeight || window.innerHeight * 0.6;
    
    const maxW = w - 20;
    const maxH = h - 20;
    
    const sizeW = Math.floor(maxW / state.cols) - 8;
    const sizeH = Math.floor(maxH / state.rows) - 8;
    const size = Math.min(sizeW, sizeH, 65); // Cap at 65px
    
    document.documentElement.style.setProperty('--cell', size+'px');
    
    const totalW = (size+6) * state.cols + 24;
    const totalH = (size+6) * state.rows + 24;
    ui.board.style.width = totalW+'px';
    ui.board.style.height = totalH+'px';
    
    // Update all positions
    state.grid.flat().forEach(t => { if(t) updateTilePos(t); });
}

// --- HELPER FUNCTIONS ---
function findTile(id) { 
    for(let r=0; r<state.rows; r++) for(let c=0; c<state.cols; c++) if(state.grid[r][c]?.id === id) return state.grid[r][c];
}
function isBlocker(t) { return t && (t.type.startsWith('mellow') && !t.type.includes('part') && t.hp > 0); }
function inBounds(r, c) { return r>=0 && r<state.rows && c>=0 && c<state.cols; }
function doSwap(t1, t2) {
    const {r:r1, c:c1} = t1; const {r:r2, c:c2} = t2;
    state.grid[r1][c1] = t2; state.grid[r2][c2] = t1;
    t1.r = r2; t1.c = c2; t2.r = r1; t2.c = c1;
    updateTilePos(t1); updateTilePos(t2);
}
function checkGameState() {
    if(state.levelScore >= state.target) {
        toast("Level Up! 🎉");
        state.level++;
        state.levelScore = 0;
        state.target = calcTarget(state.level);
        state.moves += 10;
        updateUI();
    } else if(state.moves <= 0) {
        toast("Game Over");
    }
}
function checkPowerSwap(t1, t2) { return null; /* Add Koala+Cit logic here from original */ }
function hasAnyMatch() { return findMatches().length > 0; }
function findMatches() { 
    // Simplified Line Matcher for the modular structure
    let lines = [];
    // Horz
    for(let r=0; r<state.rows; r++) {
        let match = [];
        for(let c=0; c<state.cols; c++) {
            if(state.grid[r][c] && match.length>0 && state.grid[r][c].type === match[0].type) {
                match.push(state.grid[r][c]);
            } else {
                if(match.length >= 3) lines.push({len:match.length, cells:[...match]});
                match = state.grid[r][c] ? [state.grid[r][c]] : [];
            }
        }
        if(match.length >= 3) lines.push({len:match.length, cells:[...match]});
    }
    // Vert (Similar logic needed)
    return lines;
}
function findSpecialPatterns() { return []; /* Add T/L logic */ }
function hitNeighbors(r, c) {}
function spawnMellow() {} // Original logic needed
function maybeSpawnLovelie() {} 
function calcTarget(l) { return state.diff.baseTarget * Math.pow(1.1, l-1); }
function calcMoves(l) { return state.diff.baseMoves; }
function resetUnlocked() { state.unlocked = {}; BASES.forEach(b => state.unlocked[b.key] = new Set(['A'])); }
function buildMenu() {} // Fill UI menu
function refreshLeaderboard() {}
function postScore() {}
function toast(msg, sub) { 
    const t = document.createElement('div'); t.className='toast'; t.innerHTML=`${msg}<br><small>${sub||''}</small>`;
    document.getElementById('toast').appendChild(t); setTimeout(()=>t.remove(), 2500);
}
function toggleFullscreen() { 
    if(!document.fullscreenElement) document.getElementById('boardWrap').requestFullscreen();
    else document.exitFullscreen();
}
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function showGreetingIfNeeded() { if(!localStorage.getItem('seenGreet')) openModal('greetBack'); }
function closeGreeting() { closeModal('greetBack'); localStorage.setItem('seenGreet', '1'); }
function buildGlobalBg() { /* Same as original */ }
function buildFsBg() { /* Same as original */ }
function tileCenter(r,c){ return {x:0, y:0}; /* Calc logic */ }
function burstFx(pos){}
function createStar(r,c){}
function spawnPowerup(pos, type){}
function clearRadius(r,c,rad){}
function revealMyst(t){
    const pick = MYST_POOL[Math.floor(Math.random()*MYST_POOL.length)].key;
    t.type = pick + ":A";
    const el = state.tileEls.get(t.id); el.remove(); state.tileEls.delete(t.id);
    createTileView(t);
    toast("Mystery Revealed!", pick);
}
