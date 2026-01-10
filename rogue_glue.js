
<script>
    // ROGUE GLUE - Connects Legacy HTML to Rogue Engine

    // 1. Override initBoard to use Engine Settings
    const originalInitBoard = window.initBoard;
    window.initBoard = function() {
        // Force dimensions from Engine if available
        if(window.rogueEngine && window.level) {
            const r = window.rows || 9;
            const c = window.cols || 7;

            // Hack: Update the 'diff' object so originalInitBoard uses our size
            if(typeof diff !== 'undefined') {
                diff.rows = r;
                diff.cols = c;
            }
            rows = r;
            cols = c;

            // Set CSS Vars
            document.documentElement.style.setProperty('--rows', rows);
            document.documentElement.style.setProperty('--cols', cols);

            // Update Biome BG
            if(window.CURRENT_BIOME) {
                const b = rogueEngine.state.map.find(n => n.biome.id === window.CURRENT_BIOME)?.biome;
                const bg = b ? b.bg : "";
                const wrap = document.getElementById("boardWrap");
                if(wrap && bg) wrap.style.backgroundImage = `url('${bg}')`;
            }
        }

        // Call original logic (which fills grid, etc.)
        if(typeof originalInitBoard === "function") originalInitBoard();

        // Post-Init: Spawn Rogue Specifics? (Maybe handled by engine)
    };

    // 2. Override updateUI to show Rogue Stats
    const originalUpdateUI = window.updateUI;
    window.updateUI = function() {
        if(typeof originalUpdateUI === "function") originalUpdateUI();
        
        // Rogue Overrides
        const s = window.rogueEngine ? window.rogueEngine.state : null;
        if(s) {
            const hpEl = document.getElementById("uiHp");
            const goldEl = document.getElementById("uiGold");
            if(hpEl) hpEl.innerText = Math.round(s.hp) + "/" + s.maxHp;
            if(goldEl) goldEl.innerText = s.gold;

            // Update Enemy UI
            if(window.CURRENT_ENEMY) {
                const e = window.CURRENT_ENEMY;
                const enName = document.getElementById("uiEnemy");
                if(enName) enName.innerText = e.name;

                // Stack Logic
                const container = document.getElementById("uiEnemyBars");
                const countEl = document.getElementById("uiStackCount");
                if(container && countEl) {
                    const stackSize = 1000;
                    const totalStacks = Math.ceil(e.maxHp / stackSize);
                    const currentStacks = Math.ceil(e.hp / stackSize);
                    const currentRemainder = e.hp % stackSize || (e.hp > 0 ? stackSize : 0);

                    if(currentStacks > 5) countEl.innerText = "x" + currentStacks;
                    else countEl.innerText = "";

                    container.innerHTML = "";
                    const renderCount = Math.min(currentStacks, 5);
                    for(let i=0; i<renderCount; i++) {
                        const bar = document.createElement("div");
                        bar.className = "hp-stack filled";
                        if(i === renderCount - 1) {
                            const pct = (currentRemainder / stackSize) * 100;
                            bar.style.width = pct + "%";
                            bar.style.flex = "none";
                            bar.style.background = `linear-gradient(90deg, #e91e63 ${pct}%, #333 ${pct}%)`;
                        }
                        container.appendChild(bar);
                    }
                }
            }
        }
    };

    // 3. Game Over Hook
    const originalGameOver = window.gameOver;
    window.gameOver = function() {
        // Call Original Visuals
        if(typeof originalGameOver === "function") originalGameOver();

        // Reset Run in Engine (maybe after delay?)
        // setTimeout(() => rogueEngine.init(), 2000);
    };

    // 4. Boot
    window.addEventListener('load', () => {
        if(window.rogueEngine) {
            window.rogueEngine.init();

            // Hide "Classic" containers if they leaked through
            document.querySelectorAll('.topRow, .stats, .progressRow').forEach(e => e.style.display = 'none');
        }
    });
</script>
