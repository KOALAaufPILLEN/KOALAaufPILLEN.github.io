// Mechanics Patch for Custom Combos & Scaling

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
            // Level 5+: Match 4 no longer creates Worms? Or Worms are weaker?
            // User request: "Powerups schwerer zu bauen"
            
            // Logic:
            // If Level >= 5, downgrade Match-4 (Worm) to nothing?
            // If Level >= 8, downgrade Match-5 (Cit/Koala) to Worm?
            
            const isMatch5 = val.prio >= 2; // Cit/Koala
            const isMatch4 = val.prio === 1; // Worm
            
            if(window.ROGUE_DIFFICULTY.match5 && isMatch5) {
                // Downgrade to Worm (make it harder to get big ones)
                val.type = typeId("worm","P");
            }
            if(window.ROGUE_DIFFICULTY.match4 && isMatch4) {
                // Remove spawn (Match 4 does nothing special)
                result.spawn.delete(key);
            }
        }
    }
    return result;
};

console.log("Mechanics Patch Loaded");
