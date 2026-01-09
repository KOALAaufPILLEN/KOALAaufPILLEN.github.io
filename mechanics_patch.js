// Mechanics Patch for Custom Combos & Scaling & Town

// Define Town Buildings (German)
window.TOWN_BUILDINGS = [
    { key: "forge", name: "Schmiede", map: {x:0.2, y:0.4, icon:"house"} },
    { key: "bank", name: "Bank", map: {x:0.7, y:0.4, icon:"house"} }, // Was "Bank", kept as "Bank" (German is same)
    { key: "armory", name: "Rüstkammer", map: {x:0.5, y:0.2, icon:"house"} },
    { key: "library", name: "Bibliothek", map: {x:0.3, y:0.7, icon:"house"} }
];

// Backup original trySwap to wrap it
const originalTrySwap = window.trySwap;

window.trySwap = function(r1, c1, r2, c2) {
    // 1. Access Grid directly
    const a = grid[r1][c1];
    const b = grid[r2][c2];
    
    if(!a || !b) return;
    
    // 2. Check Custom Combos
    if(window.rogueEngine && window.rogueEngine.state) {
        const k1 = parseTypeId(a.type).baseKey;
        const k2 = parseTypeId(b.type).baseKey;
        const key = [k1, k2].sort().join(":");
        
        const combo = window.rogueEngine.state.customCombos[key];
        
        if(combo) {
            // Trigger Custom Effect!
            // Consume moves
            if(typeof spendMoves === 'function') spendMoves(1);
            
            // Visuals
            toast(`CUSTOM COMBO Lv.${combo.lvl}!`, "Self-made Power! 💥", 2000);
            
            // Logic based on Level
            if(combo.lvl >= 10) {
                clearWholeBoard(); // Wipe
            } else if(combo.lvl >= 5) {
                // Star Burst (3 Rows/Cols)
                const cells = [];
                for(let r=0; r<rows; r++) cells.push({r, c:c2}); // Col
                for(let c=0; c<cols; c++) cells.push({r:r2, c}); // Row
                // Diagonals
                for(let d=-5; d<=5; d++) {
                    if(inBounds(r2+d, c2+d)) cells.push({r:r2+d, c:c2+d});
                    if(inBounds(r2+d, c2-d)) cells.push({r:r2+d, c:c2-d});
                }
                clearCells(cells);
            } else {
                // Simple Cross (1 Row/Col)
                const cells = [];
                for(let r=0; r<rows; r++) cells.push({r, c:c2});
                for(let c=0; c<cols; c++) cells.push({r:r2, c});
                clearCells(cells);
            }
            
            // Aftermath
            setTimeout(()=>{ dropDown(); mergeMellows(); resolveAll(false); }, 300);
            return; // Skip normal swap logic
        }
    }
    
    // Fallback to original logic
    if(originalTrySwap) originalTrySwap(r1, c1, r2, c2);
};

// Override Powerup Creation Difficulty based on Level
const originalFindLineMatches = window.findLineMatches;
window.findLineMatches = function() {
    // Run original detection
    const result = originalFindLineMatches.apply(this, arguments);
    
    // Modify spawns based on Rogue Difficulty
    if(window.ROGUE_DIFFICULTY && result.spawn.size > 0) {
        for(const [key, val] of result.spawn) {
            const isMatch5 = val.prio >= 2; // Cit/Koala
            const isMatch4 = val.prio === 1; // Worm
            
            if(window.ROGUE_DIFFICULTY.match5 && isMatch5) {
                val.type = typeId("worm","P");
            }
            if(window.ROGUE_DIFFICULTY.match4 && isMatch4) {
                result.spawn.delete(key);
            }
        }
    }
    return result;
};

// Override Bag Refill to use Deck
if(typeof window.rogueEngine !== 'undefined') {
    // Override newGame to Filter BASES based on Deck
    const originalNewGame = window.newGame;
    window.newGame = function(isRogue) {
        if(isRogue && window.rogueEngine && window.rogueEngine.state.deck.length > 0) {
            BASES.forEach(b => {
                if(window.rogueEngine.state.deck.includes(b.key)) {
                    b.minLevel = 0; // Always available
                } else {
                    b.minLevel = 999; // Locked
                }
            });
            console.log("Deck injected into BASES:", window.rogueEngine.state.deck);
        }
        
        if(originalNewGame) originalNewGame();
        
        // Sync HP for Boss Logic safety
        if(window.GAME_SESSION && window.rogueEngine) {
             window.GAME_SESSION.hp = window.rogueEngine.state.hp;
             window.GAME_SESSION.maxHp = window.rogueEngine.state.maxHp;
        }
    };
}

// Override Enemy Processing to prevent premature Game Over
// We redefine the global `processEnemy` from game.js
window.processEnemy = function(){
    // Enemy Logic
    let dmg = 5;
    if(window.rogueEngine && window.rogueEngine.state.currentEnemy) {
        dmg = window.rogueEngine.state.currentEnemy.dmg || 5;
    }
    
    if(window.GAME_SESSION) {
        window.GAME_SESSION.hp -= dmg;
        if(window.rogueEngine) window.rogueEngine.state.hp = window.GAME_SESSION.hp; // Sync back
        
        if(window.GAME_SESSION.hp <= 0) { 
            currentState = 9; // STATE.GAME_OVER
            alert("Game Over! (No HP)"); 
            // In Rogue, we should probably return to Map/Char Select instead of reloading?
            // For now, alert is fine.
        } else {
            currentState = 0; // STATE.IDLE
        }
        updateUI();
    }
}

console.log("Mechanics Patch Loaded");
