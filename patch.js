// Monkey Patching Luvvies Original with new Assets & Features
// V2.1 - Collision Safe

(function() {
    console.log("Applying Luvvies Patch...");

    // Local Helper for Path (rename to avoid collision with global RPG_ROOT if it exists)
    const PATCH_RPG_ROOT = "Images/Zip/Tiny RPG Character Asset Pack v1.03b -Full 20 Characters/Tiny RPG Character Asset Pack v1.03 -Full 20 Characters/Characters(100x100)";
    
    // Use existing global OPT or fallback, do NOT redeclare const OPT
    const PATCH_OPT = (typeof OPT !== 'undefined') ? OPT : "Images/optimized-150";
    const PATCH_OPT_SMALL = (typeof OPT_SMALL !== 'undefined') ? OPT_SMALL : PATCH_OPT;

    // 1. Update TOWN_ASSETS globally if it exists
    if(typeof TOWN_ASSETS !== 'undefined'){
        Object.assign(TOWN_ASSETS, {
          grass: "Images/roguelite/cute_fantasy_free/Tiles/Grass_Middle.png",
          path: "Images/roguelite/cute_fantasy_free/Tiles/Path_Middle.png",
          water: "Images/roguelite/cute_fantasy_free/Tiles/Water_Middle.png",
          house: "Images/roguelite/cute_fantasy_free/Outdoor%20decoration/House_1_Wood_Base_Blue.png",
          chest: "Images/roguelite/cute_fantasy_free/Outdoor%20decoration/Chest.png",
          tree: "Images/roguelite/cute_fantasy_free/Outdoor%20decoration/Oak_Tree.png",
          player: `${PATCH_RPG_ROOT}/Knight/Knight/Knight-Idle.png`,
          slime: `${PATCH_RPG_ROOT}/Slime/Slime/Slime-Idle.png`,
          skeleton: `${PATCH_RPG_ROOT}/Skeleton/Skeleton/Skeleton-Idle.png`,
          werewolf: `${PATCH_RPG_ROOT}/Werewolf/Werewolf/Werewolf-Idle.png`
        });
    }

    // 2. Add KoalaMegaZilla to IMG
    if(typeof IMG !== 'undefined'){
        IMG.koalamegazilla = "Luvvies/KoalaMegaZilla.png";
    }
    if(typeof IMG_SMALL !== 'undefined'){
        IMG_SMALL.koalamegazilla = "Luvvies/KoalaMegaZilla.png";
    }
    if(typeof IMG_LARGE !== 'undefined'){
        IMG_LARGE.koalamegazilla = "Luvvies/KoalaMegaZilla.png";
    }

    // 3. Add KoalaMegaZilla to BASES
    if(typeof BASES !== 'undefined'){
        const exists = BASES.find(b => b.key === "koalamegazilla");
        if(!exists){
            BASES.push({ 
                key:"koalamegazilla", name:"Koala MegaZilla", img:IMG.koalamegazilla, tag:"boss", minLevel:999,
                palettes:{ A:["#4a148c","#7b1fa2"], B:["#7b1fa2","#ae52d4"] },
                ability:"Die ultimative Bedrohung.",
                story:"Er hat zu viele Eukalyptus-Bonbons gegessen.",
                lines:{ easy:["ROAAAR!"], normal:["MEGA!"], hard:["CRUSH!"], shock:["ZILLA!!!"] }
            });
        }
    }

    // 4. Override drawTown with better visuals
    window.drawTown = function(){
          if(!ui.townCanvas) return;
          const canvas = ui.townCanvas;
          // Safety check for size
          if(!canvas.offsetWidth || !canvas.offsetHeight) return;

          const dpr = window.devicePixelRatio || 1;
          const w = Math.max(1, Math.round(canvas.getBoundingClientRect().width * dpr));
          const h = Math.max(1, Math.round(canvas.getBoundingClientRect().height * dpr));
          
          if(canvas.width !== w || canvas.height !== h){
            canvas.width = w;
            canvas.height = h;
          }
          const ctx = canvas.getContext("2d");
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctx.imageSmoothingEnabled = false;

          const cw = canvas.getBoundingClientRect().width;
          const ch = canvas.getBoundingClientRect().height;
          
          // Use safe tile size
          const tileSize = Math.max(24, Math.min(36, Math.round(cw / 16)));
          const cols = Math.ceil(cw / tileSize) + 1;
          const rows = Math.ceil(ch / tileSize) + 1;

          // --- Background ---
          const grass = new Image(); 
          // Use the property from global object which we just updated
          grass.src = (typeof TOWN_ASSETS !== 'undefined') ? TOWN_ASSETS.grass : "";
          
          if(grass.src && grass.complete && grass.naturalWidth){
            for(let y=0; y<rows; y++){
              for(let x=0; x<cols; x++){
                ctx.drawImage(grass, x*tileSize, y*tileSize, tileSize, tileSize);
              }
            }
          } else {
            ctx.fillStyle = "#81c784";
            ctx.fillRect(0,0,cw,ch);
          }

          if(typeof TOWN_ASSETS === 'undefined') return;

          // --- Props & Buildings ---
          const deco = [];
          const house = new Image(); house.src = TOWN_ASSETS.house;
          const tree = new Image(); tree.src = TOWN_ASSETS.tree;
          const chest = new Image(); chest.src = TOWN_ASSETS.chest;
          
          const isLoaded = (img) => img && img.complete && img.naturalWidth > 0;

          // Buildings from meta
          if(typeof TOWN_BUILDINGS !== 'undefined' && typeof meta !== 'undefined'){
              for(const b of TOWN_BUILDINGS){
                  const mp = b.map;
                  if(!mp) continue;
                  let sprite = house; 
                  if(mp.icon === "chest") sprite = chest;
                  if(mp.icon === "tree") sprite = tree;
                  
                  // Always push to deco list even if not loaded immediately (next frame draw will catch it)
                  const bSize = tileSize * 2.5;
                  deco.push({
                      img: sprite,
                      x: cw * mp.x - bSize/2, 
                      y: ch * mp.y - bSize/2,
                      s: bSize,
                      label: b.name,
                      lvl: (meta.buildings && meta.buildings[b.key]) || 0
                  });
              }
          }

          // Random trees
          const treeSize = tileSize * 2.2;
          deco.push({img:tree, x: cw*0.05, y: ch*0.05, s: treeSize});
          deco.push({img:tree, x: cw*0.85, y: ch*0.08, s: treeSize});
          deco.push({img:tree, x: cw*0.90, y: ch*0.85, s: treeSize});

          // Sort by Y
          deco.sort((a,b) => (a.y + a.s) - (b.y + b.s));

          for(const d of deco){
            if(isLoaded(d.img)){
                ctx.drawImage(d.img, d.x, d.y, d.s, d.s);
            }
          }

          // --- Player & Enemies ---
          const actorSize = tileSize * 1.5;
          const player = new Image(); player.src = TOWN_ASSETS.player;
          if(isLoaded(player)){
            ctx.drawImage(player, cw/2 - actorSize/2, ch/2 - actorSize/2, actorSize, actorSize);
          }
          
          const slime = new Image(); slime.src = TOWN_ASSETS.slime;
          const skel = new Image(); skel.src = TOWN_ASSETS.skeleton;
          const wolf = new Image(); wolf.src = TOWN_ASSETS.werewolf;
          
          if(isLoaded(slime)) ctx.drawImage(slime, cw*0.2, ch*0.3, actorSize, actorSize);
          if(isLoaded(skel)) ctx.drawImage(skel, cw*0.8, ch*0.3, actorSize, actorSize);
          if(isLoaded(wolf)) ctx.drawImage(wolf, cw*0.3, ch*0.75, actorSize, actorSize);

          // --- Labels ---
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.font = `900 ${Math.max(10, Math.round(tileSize * 0.45))}px ui-sans-serif, system-ui`;
          ctx.lineWidth = 3;
          
          for(const d of deco){
              if(d.label && d.lvl > 0){
                 const tx = d.x + d.s/2;
                 const ty = d.y;
                 ctx.strokeStyle = "rgba(0,0,0,0.6)";
                 ctx.fillStyle = "#fff";
                 ctx.strokeText(`Lv.${d.lvl}`, tx, ty);
                 ctx.fillText(`Lv.${d.lvl}`, tx, ty);
              }
          }
    }

    // Update Board Texture safely
    if(typeof TOWN_ASSETS !== 'undefined'){
        document.documentElement.style.setProperty("--board-texture", `url('${TOWN_ASSETS.grass}')`);
        document.documentElement.style.setProperty("--board-texture-opacity", ".45");
    }

    console.log("Luvvies Patch applied successfully!");

})();