// Rogue Glue Logic - Extracted from rogue.html

const ROGUE_STARTERS = ["sweety","sleepy","normal","cry"]; // Default if not defined globally

function renderRogueCharSelect(engine){
  const list = document.getElementById("charList");
  if(!list) return;
  list.innerHTML = "";
  const starters = new Set(ROGUE_STARTERS);
  const all = BASES.filter(b => (!b.tag || b.tag === "normal"));
  const sorted = all.slice().sort((a,b)=>{
    const ia = ROGUE_STARTERS.indexOf(a.key);
    const ib = ROGUE_STARTERS.indexOf(b.key);
    if(ia !== -1 || ib !== -1){
      if(ia === -1) return 1;
      if(ib === -1) return -1;
      return ia - ib;
    }
    return (a.name || "").localeCompare(b.name || "");
  });
  const selectedKey = (engine && engine.tempHero) ? engine.tempHero : (ROGUE.meta.mainHero || "");
  sorted.forEach(b => {
    const locked = !isHeroUnlocked(b.key);
    const card = document.createElement("div");
    card.className = "char-card" + (locked ? " locked" : "");
    if(selectedKey && selectedKey === b.key) card.classList.add("selected");
    const imgSrc = locked ? (IMG_SOURCES.mystBtn || "") : (IMG_SOURCES[b.key] || b.img || ""); // Use IMG_SOURCES from game.js
    const label = locked ? "???" : b.name;
    const lvl = heroComboLevel(b.key);
    const cap = heroComboDisplayCap(b.key);
    const reqAct = heroUnlockRequirement(b.key);
    const note = locked ? `Akt ${reqAct}` : (starters.has(b.key) ? "Starter" : "Freigeschaltet");
    card.innerHTML = `
      <div class="charArt">${imgSrc ? `<img src="${imgSrc}" alt="${label}">` : ""}</div>
      <h3>${label}</h3>
      <div class="charLvl">${lvl}/${cap}</div>
      <div class="charNote">${note}</div>
    `;
    if(locked){
      card.addEventListener("click", ()=>{
        toast("Gesperrt", `In der Stadt freischalten (Akt ${reqAct}).`, 2200);
      });
    } else {
      card.addEventListener("click", ()=>{
        list.querySelectorAll(".char-card").forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        if(engine) engine.tempHero = b.key;
      });
    }
    list.appendChild(card);
  });
}

function setupRogueHooks(){
  window.ROGUE_MODE = true; 
  if(!window.rogueEngine || window.rogueEngine._roguePatched) return;
  window.rogueEngine._roguePatched = true;
  
  window.rogueEngine.renderCharSelect = function(){
    renderRogueCharSelect(this);
  };
  
  const origStartCombat = window.rogueEngine.startCombat.bind(window.rogueEngine);
  window.rogueEngine.startCombat = function(node){
    window.ROGUE_PENDING_NODE = node;
    origStartCombat(node);
    // Ensure Game UI is visible and board is ready
    const p = document.getElementById("page");
    if(p) p.style.display = "block";
    setTimeout(()=> {
        if(typeof setupRogueCombat === "function") setupRogueCombat(node);
    }, 60);
  };
  
  const origConfirmChar = window.rogueEngine.confirmChar.bind(window.rogueEngine);
  window.rogueEngine.confirmChar = function(){
    if(this.tempHero){
      ROGUE.run.heroKey = this.tempHero;
      ROGUE.meta.mainHero = this.tempHero;
      saveRogueMeta();
    }
    origConfirmChar();
  };
  
  const origShowMap = window.rogueEngine.showMap.bind(window.rogueEngine);
  window.rogueEngine.showMap = function(){
    if(ROGUE.run.inCombat){
      toast("Im Kampf gesperrt", "Beende den Kampf zuerst.", 1800);
      return;
    }
    ROGUE.run.inCombat = false;
    origShowMap();
    try{
      applyMapFog();
    }catch(e){}
  };
  
  window.rogueEngine.openShop = function(){
    ROGUE.run.inCombat = false;
    window.rogueEngine.showScene("shopView");
    // renderShop(); // Assumed defined in mechanics_patch or rogue.js?
  };
  
  const origStartNewRun = window.rogueEngine.startNewRun.bind(window.rogueEngine);
  ROGUE._origStartNewRun = origStartNewRun;
  window.rogueEngine.startNewRun = function(){
    resetRogueRun();
    ROGUE.run.active = false;
    if(typeof showTown === "function") showTown(true);
    else origStartNewRun();
  };
}

function applyMapFog(){
  const nodes = document.querySelectorAll("#mapNodes .map-node");
  nodes.forEach(el => {
    const locked = el.classList.contains("locked");
    const active = el.classList.contains("active");
    const done = el.classList.contains("done");
    const wiggle = (Math.random() * 16 - 8).toFixed(1);
    el.style.setProperty("--wiggle-x", wiggle + "px");
    if(locked){
      el.classList.add("fogged");
      if(!el.dataset.realLabel) el.dataset.realLabel = el.textContent;
      el.textContent = "?";
    } else {
      el.classList.remove("fogged");
      if(el.dataset.realLabel && (active || done)) el.textContent = el.dataset.realLabel;
    }
  });
}

// Helpers needed for glue
function isHeroUnlocked(key) { 
    return (ROGUE.meta.unlockedHeroes || []).includes(key); 
}
function heroComboLevel(key) { return 1; } // Placeholder
function heroComboDisplayCap(key) { return 5; } // Placeholder
function heroUnlockRequirement(key) { return 1; } // Placeholder

// Global Background Logic (Corrected)
let globalBgSize = {w:0, h:0};
let fsBgSize = {w:0, h:0};
let bgSpeechTimer = null;
let bgCycleTimer = null;
window.bgIntervals = window.bgIntervals || [];

window.buildGlobalBg = function(force=false){
  // Basic implementation to stop errors, visual candy optional
  const cont = document.getElementById("globalBg");
  if(!cont) return;
  cont.innerHTML = "";
  if(window.bgIntervals){
      window.bgIntervals.forEach(i => clearInterval(i));
      window.bgIntervals = [];
  }
};

// Boot
(function boot() {
    // Force hide main game page initially
    const p = document.getElementById("page");
    if(p) p.style.display = "none";
    
    // Ensure Game Engine is ready
    if(typeof newGame === 'function' && window.rogueEngine) {
        console.log("Rogue Engine detected, initializing...");
        setupRogueHooks();
        // initRogueUI(); // If this was inline, we might need to recreate it or skip it if town logic handles it
        window.rogueEngine.init();
        
        // Use timeout to allow UI to settle
        setTimeout(() => {
            if(ROGUE_MODE) {
                if(typeof showTown === "function") showTown(true);
                else if(window.rogueEngine.showScene) window.rogueEngine.showScene('charView');
            }
        }, 100);
    } else {
        console.log("Waiting for game scripts...");
        setTimeout(boot, 100);
    }
})();
