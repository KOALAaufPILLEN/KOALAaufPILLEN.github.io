    /**********************
     * Helpers
     **********************/
    function fmt(n){ return Number(n||0).toLocaleString("de-DE"); }
    function diffLabel(k){
      const key = (k||"").toLowerCase();
      if(key==="shock" || key==="schock" || key==="zuschock" || key==="zuckerschock") return "Zuckerschock";
      if(key==="easy") return "Easy";
      if(key==="normal") return "Normal";
      if(key==="hard") return "Hard";
      return k || "";
    }

    /**********************
     * Supabase (intern)
     **********************/
    const SUPABASE_URL = "https://qgeddoqvzajpeawlythi.supabase.co";
    const SUPABASE_KEY_PUBLISHABLE = "sb_publishable_EQUOdDGiCGgm8vA3YjN_jg_BwPnAiI_";
    const SCORE_TABLE = "luvvies_crush_scores";

    let sb = null;
    try{
      if(typeof window !== 'undefined' && window.supabase?.createClient){
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY_PUBLISHABLE, {
          auth: { persistSession:false, autoRefreshToken:false }
        });
      }
    }catch(e){ sb = null; }

    /**********************
     * Cookies (1x/day greeting)
     **********************/
    function getCookie(name){
      if (typeof document === 'undefined') return "";
      const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([$?*|{}\(\)\[\]\\\/\+^])/g,'\\$1') + '=([^;]*)'));
      return m ? decodeURIComponent(m[1]) : "";
    }
    function setCookie(name, value, days=7){
      if (typeof document === 'undefined') return;
      const maxAge = days * 24 * 60 * 60;
      document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
    }
    const todayKey = ()=>new Date().toISOString().slice(0,10);

    /**********************
     * Difficulty
     **********************/
    const DIFFS = {
      easy:   { key:"easy",   name:"Easy",        rows:10, cols:10, scoreMult:1.00, baseMoves:30, movesPerLevel:2, baseTarget:3500, targetGrow:0.18, lovelieChance:0.006, mystChance:0.010 },
      normal: { key:"normal", name:"Normal",      rows: 9, cols: 9, scoreMult:1.25, baseMoves:26, movesPerLevel:2, baseTarget:4200, targetGrow:0.20, lovelieChance:0.005, mystChance:0.009 },
      hard:   { key:"hard",   name:"Hard",        rows: 9, cols: 8, scoreMult:1.60, baseMoves:24, movesPerLevel:1, baseTarget:5000, targetGrow:0.22, lovelieChance:0.004, mystChance:0.008 },
      shock:  { key:"shock",  name:"Zuckerschock",rows: 8, cols: 8, scoreMult:2.00, baseMoves:22, movesPerLevel:1, baseTarget:6500, targetGrow:0.24, lovelieChance:0.003, mystChance:0.007 }
    };
    let diff = DIFFS.easy;

    /**********************
     * Images
     **********************/
    const IMG = {
      logo:     "https://static.wixstatic.com/media/d05122_7c445c8b5f3d46cdb778711661f2351e~mv2.png",
      sweety:   "https://static.wixstatic.com/media/d05122_efe39fec7e5c4d569dfb3fef75e5b6ff~mv2.png",
      sleepy:   "https://static.wixstatic.com/media/d05122_cfd779a0aad04c72bd08efbc0f363f53~mv2.png",
      normal:   "https://static.wixstatic.com/media/d05122_8a7c2f43a31247a6994651163c2898c5~mv2.png",
      cry:      "https://static.wixstatic.com/media/d05122_1950f2496b344e56bcac10ea51286750~mv2.png",
      koala:    "https://static.wixstatic.com/media/d05122_9cb17e901a1a4775819bfda895d0f1c9~mv2.png",
      citrussy: "https://static.wixstatic.com/media/d05122_9cdc763a1ec94a90a3fd91ee3481b2c4~mv2.png",
      worm:     "https://static.wixstatic.com/media/d05122_a8e7a37e04694ff2a99b8af60f1567b7~mv2.png",
      grumpy:   "https://static.wixstatic.com/media/d05122_983d59c5911e400e92819d12e27d6073~mv2.png",
      happy:    "https://static.wixstatic.com/media/d05122_cff843264bd8495aaa9ac0360d72e131~mv2.png",
      mond:     "https://static.wixstatic.com/media/d05122_aea344c0fd954194af2855eea745febf~mv2.png",
      donut:    "https://static.wixstatic.com/media/d05122_5041c19e720d4e7e9439e4acf793655c~mv2.png",
      joyce:    "https://static.wixstatic.com/media/d05122_36a3f8d83be4433082995ee1a8003218~mv2.png",
      smokey:   "https://static.wixstatic.com/media/d05122_9a607ff042b647b789e3b44cc75bd38d~mv2.png",
      mellow:   "https://static.wixstatic.com/media/d05122_53fbcb0babf447a5a32cc3b3fbecad2b~mv2.png",
      lovelie:  "https://static.wixstatic.com/media/d05122_755c29b99fad419d9b9a5822d8ffb18c~mv2.png",
      simba:    "https://static.wixstatic.com/media/d05122_4d92be50d61e4a2297af16a3295c38bf~mv2.png",
      fledernuss: "https://static.wixstatic.com/media/d05122_placeholder_fledernuss.png"
    };
    if (typeof document !== 'undefined') document.getElementById("greetLogo").src = IMG.logo;

    /**********************
     * Mystery reveal weights
     **********************/
    const MYST_POOL = [
      { key:"worm",   w: 40 },
      { key:"cit",    w: 25 },
      { key:"mellow", w: 16 },
      { key:"koala",  w: 12 },
      { key:"lovelie",w:  7 }
    ];

    /**********************
     * Bases
     **********************/
    const BASES = [
      { key:"sweety", name:"Sweety", img:IMG.sweety, tag:"normal", minLevel:1,
        palettes:{ A:["#ff4fb9","#ff9adf"], B:["#46e4c2","#a7fff0"] },
        ability:"Glitzer-Queen: cleanes Match 3+.",
        story:"Sweety liebt Kettenreaktionen – je mehr es bounct, desto besser.",
        lines:{
          easy:["Zucker-Boom! ✨","Glitzer time!","Noch ein Match! 💖"],
          normal:["Sauberer Swap 😌","Combo? Ich seh’s!","Keep the vibe ✨"],
          hard:["No panic — precision.","Du bist fast da.","Tight! 😈"],
          shock:["ZUCKERSCHOCK!","Mehr Chaos!","Ich will Ketten! 🔥"]
        }
      },
      { key:"sleepy", name:"Sleepy", img:IMG.sleepy, tag:"normal", minLevel:1,
        palettes:{ A:["#7ad8ff","#b7f0ff"], B:["#ffd46a","#fff2b7"] },
        ability:"2× Sleepy + 1× Mondlie → Shuffle 4×4 ✨",
        story:"Wirkt müde… aber sein Shuffle ist brutal effektiv.",
        lines:{
          easy:["Zzz… aber ok 😴","Sanfter Swap…","Wach für Combo!"],
          normal:["Nicht einschlafen.","Smooth & bouncy.","Weiter… ✨"],
          hard:["Timing ist alles.","Kein Tilt.","Mach’s clean."],
          shock:["ICH BIN WACH!","Shuffle oder RIP.","Mehr! 😈"]
        }
      },
      { key:"normal", name:"Normal", img:IMG.normal, tag:"normal", minLevel:1,
        palettes:{ A:["#7b7bff","#cbbcff"], B:["#ff7bd6","#ffd0f1"] },
        ability:"Klassiker: stabiler Tile für sichere Lines.",
        story:"Normal ist der Anker – wenn’s brennt, rettet er dein Board.",
        lines:{
          easy:["Easy going.","Alles chill.","Noch eins!"],
          normal:["Stabil.","Rund.","Passt."],
          hard:["Disziplin.","Konsequent.","Kein Fehler."],
          shock:["Ich bleib ruhig.","Präzise.","Durchziehen."]
        }
      },
      { key:"cry", name:"Cry", img:IMG.cry, tag:"normal", minLevel:1,
        palettes:{ A:["#1fd1ff","#b8b1ff"], B:["#5ef2b5","#b6ffd6"] },
        ability:"Emo-Boost: fühlt jede Chain-Reaction.",
        story:"Cry weint… aber nur weil’s so schön glitzert.",
        lines:{
          easy:["😭✨ so schön","Bitte noch ein Match","Ich fühl das!"],
          normal:["Combo macht happy.","Nicht aufgeben.","Weiter!"],
          hard:["Tough love.","Du packst das.","Sauber bleiben."],
          shock:["AAAA 😭","Nur noch Kette!","Chaos is love."]
        }
      },
      { key:"happy", name:"Happy Cookie", img:IMG.happy, tag:"normal", minLevel:2,
        palettes:{ A:["#5ef2b5","#b6ffd6"], B:["#7ad8ff","#b7f0ff"] },
        ability:"Therapy Time (2× Grumpy + 1× Happy) → +3 Moves, Grumpy→Happy.",
        story:"Happy macht selbst Grumpy weich. 🍪✨",
        lines:{
          easy:["Smile! 🍪","Alles wird gut!","Süß & stark!"],
          normal:["Therapy incoming.","Du schaffst das.","Nice chain!"],
          hard:["Atmen. Fokus.","Guter Move.","Keep going."],
          shock:["HAPPY RAGE 😈","Wir gewinnen!","Mehr Moves!!"]
        }
      },
      { key:"grumpy", name:"Grumpy Cookie", img:IMG.grumpy, tag:"normal", minLevel:2,
        palettes:{ A:["#ff6b6b","#ffb3b3"], B:["#ffcf5a","#fff2b7"] },
        ability:"Therapy Time (2× Grumpy + 1× Happy).",
        story:"Grumpy sagt 'nein'… aber liebt +Moves heimlich.",
        lines:{
          easy:["Hmpf.","Mach schneller.","Ok…"],
          normal:["Weniger Fehler.","Konzentrier dich.","Weiter."],
          hard:["Sauber oder raus.","Nicht tilten.","Knapp!"],
          shock:["Zuckerschock?!","Du bist verrückt.","…gefällt mir."]
        }
      },
      { key:"mond", name:"Mondlie", img:IMG.mond, tag:"normal", minLevel:2,
        palettes:{ A:["#2b2b2b","#9b59ff"], B:["#ff4fb9","#7ad8ff"] },
        ability:"2× Sleepy + 1× Mondlie → Shuffle 4×4 ✨",
        story:"Mondlie ist selten ruhig… sein Shuffle ist Nachtmagie.",
        lines:{
          easy:["🌙 leise…","Moon vibes.","Shuffle? 😴"],
          normal:["Nacht-Combo.","Elegant.","Weiter."],
          hard:["Kein Risiko.","Nur Timing.","Mond-Plan."],
          shock:["NACHTCHAOS 😈","Alles mischen!","Mehr!"]
        }
      },
      { key:"donut", name:"Donutlie", img:IMG.donut, tag:"normal", minLevel:3,
        palettes:{ A:["#ffd1f2","#c9fffb"], B:["#ffcf5a","#ff9adf"] },
        ability:"2× Donut + Sweety → Sprinkle Beam • 2× Donut + Happy → Sugar Rush.",
        story:"Wenn Donut kommt, wird’s zuckrig gefährlich. 🍩",
        lines:{
          easy:["Sprinkles! ✨","Mehr Donuts!","Süßes Chaos!"],
          normal:["Beam ready.","Zucker-Schub!","Let’s go!"],
          hard:["Timing!","Nicht verschwenden.","Power!"],
          shock:["OVERLOAD!","LASER 🍩","MEHR!!!"]
        }
      },
      { key:"joyce", name:"Joyce Podenko", img:IMG.joyce, tag:"normal", minLevel:3,
        palettes:{ A:["#7ad8ff","#b8b1ff"], B:["#ff4fb9","#ffd1f2"] },
        ability:"2× Joyce + 1× Smokey (oder umgekehrt) → Buddy Burst.",
        story:"Joyce ist loyal – wenn Smokey da ist, zündet’s richtig.",
        lines:{
          easy:["Wuff! 🐾","Guter Swap!","Ich helf!"],
          normal:["Buddy time!","Ich bin dabei!","Nice!"],
          hard:["Wir schaffen’s.","Bleib dran.","Clean!"],
          shock:["WUFF ZUCKER!","Vollgas!","No fear!"]
        }
      },
      { key:"smokey", name:"Smokey", img:IMG.smokey, tag:"normal", minLevel:3,
        palettes:{ A:["#ffcf5a","#ffd9a5"], B:["#5ef2b5","#b6ffd6"] },
        ability:"2× Smokey + 1× Joyce (oder umgekehrt) → Buddy Burst.",
        story:"Smokey ist Boss-Katze – und Boss-Katzen räumen auf.",
        lines:{
          easy:["Miau.","Ok.","Weiter."],
          normal:["Nicht schlecht.","Hmm.","Passt."],
          hard:["Ich bewerte dich.","Konsequent.","Sauber."],
          shock:["miau… RESPEKT.","Heftig.","No mercy."]
        }
      },
      { key:"simba", name:"Simba", img:IMG.simba, tag:"normal", minLevel:4,
        palettes:{ A:["#ff9d3c","#ffd1a1"], B:["#7ad8ff","#b7f0ff"] },
        ability:"Best Buddies: 2× Smokey + 1× Simba (oder umgekehrt) → Buddy Wave ✨",
        story:"Simba ist mutig und liebt Smokey – zusammen sind sie unaufhaltbar.",
        lines:{
          easy:["Roar! 🦁","Best Buddies!","Wir schaffen’s!"],
          normal:["Starker Move!","Buddy Power!","Nice!"],
          hard:["Fokus.","Clean.","Weiter so."],
          shock:["ROAR SCHOCK!","Buddy Chaos!","No Mercy!"]
        }
      },
      { key:"fledernuss", name:"Fledernuss", img:IMG.fledernuss, tag:"normal", minLevel:10,
        palettes:{ A:["#4a0e4e","#813386"], B:["#2c0430","#5e1863"] },
        ability:"Evolution: Fledernuss -> FlederHeld -> SuperNuss.",
        story:"Die Nuss der Nacht. Entwickelt sich weiter!",
        lines:{
          easy:["Flatter! 🦇","Nuss-Power!","Nachtaktiv!"],
          normal:["Evolution!","Stärker!","Dunkelheit!"],
          hard:["Maximale Kraft.","SuperNuss!","Unaufhaltsam."],
          shock:["BAT-CHAOS!","EVOLUTION COMPLETE!","NIGHTMARE!"]
        }
      }
    ];

    const SPECIALS = {
      worm:   { key:"worm",   name:"Sourworm", img:IMG.worm, tag:"powerup" },
      cit:    { key:"cit",    name:"Citrussy", img:IMG.citrussy, tag:"powerup" },
      koala:  { key:"koala",  name:"Koala", img:IMG.koala, tag:"powerup" },
      mellow: { key:"mellow", name:"Mellow", img:IMG.mellow, tag:"obstacle" },
      lovelie:{ key:"lovelie",name:"Lovelie", img:IMG.lovelie, tag:"bonus" },
      myst:   { key:"myst",   name:"???", img:null, tag:"powerup" }
    };

    /**********************
     * Variant unlock
     **********************/
    let unlocked = {};
    function resetUnlocked(){
      unlocked = {};
      for(const b of BASES) unlocked[b.key] = new Set(["A"]);
    }
    // Initialize unlocked for Node context immediately
    if (typeof module !== 'undefined') resetUnlocked();
    function maybeUnlockVariant(){
      if(level < 5) return;
      if(level % 5 !== 0) return;
      const candidates = BASES.filter(b => !unlocked[b.key].has("B"));
      if(!candidates.length) return;
      const pick = candidates[Math.floor(Math.random()*candidates.length)];
      unlocked[pick.key].add("B");
      toast(`Neue Variante 🎨`, `${pick.name} hat jetzt auch Farbe B ✨`, 3200);
    }

    /**********************
     * State
     **********************/
    let rows=10, cols=10;
    let grid = [];
    let tileEls = new Map();
    let busy = false;
    const bigMellows = new Map();

    let pointer = {down:false, id:null, startX:0, startY:0};
    let level = 1;
    let totalScore = 0;
    let levelScore = 0;
    let target = 4000;
    let moves = 30;
    let combo = 1;

    let lastSwap = null;

    // cached sizing
    let CELL = 54;
    let GAP = 8;
    let PAD = 14;

    /**********************
     * UI refs
     **********************/
    let ui = {};
    if (typeof document !== 'undefined') {
        ui = {
          level: document.getElementById("uiLevel"),
          goal:  document.getElementById("uiGoal"),
          score: document.getElementById("uiScore"),
          moves: document.getElementById("uiMoves"),
          combo: document.getElementById("uiCombo"),
          bar:   document.getElementById("uiBar"),
          pct:   document.getElementById("uiPct"),
          board: document.getElementById("board"),
          fx:    document.getElementById("fxLayer"),
          menu:  document.getElementById("luvMenu"),
          tips:  document.getElementById("quickTips"),
          hudLevel: document.getElementById("hudLevel"),
          hudScore: document.getElementById("hudScore"),
          hudMoves: document.getElementById("hudMoves"),
          hudCombo: document.getElementById("hudCombo"),
          hudBar:   document.getElementById("hudBar"),
          hudPct:   document.getElementById("hudPct"),
        };
    }

    /**********************
     * Helpers
     **********************/
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
    const posKey=(r,c)=>`${r},${c}`;
    function toast(title, subtitle="", ms=2600){
      if (typeof document === 'undefined') return;
      document.documentElement.style.setProperty("--toastMs", ms+"ms");
      const wrap = document.getElementById("toast");
      const t = document.createElement("div");
      t.className="toast";
      t.innerHTML = `${title}${subtitle?`<small>${subtitle}</small>`:""}`;
      wrap.appendChild(t);
      setTimeout(()=>t.remove(), ms);
    }

    function typeId(baseKey, variant){ return `${baseKey}:${variant}`; }
    function parseTypeId(id){
      if(!id) return {baseKey:"", variant:"P"};
      if(!id.includes(":")) return {baseKey:id, variant:"P"};
      const [baseKey, variant] = id.split(":");
      return {baseKey, variant};
    }
    function getBase(baseKey){ return BASES.find(b=>b.key===baseKey) || null; }
    function getSpecial(baseKey){ return SPECIALS[baseKey] || null; }
    function inBounds(r,c){ return r>=0 && c>=0 && r<rows && c<cols; }

    function isPowerupKey(k){ return k==="worm" || k==="cit" || k==="koala"; }

    function isPlaceholder(t){ return t && t.type==="mellow_part"; }
    function isBlocker(t){
      if(!t) return false;
      const bk = parseTypeId(t.type).baseKey;
      if(bk==="mellow") return true;
      if(isPlaceholder(t)) return true;
      return false;
    }

    function isSwappable(tile){
      if(!tile) return false;
      if(isBlocker(tile)) return false;
      const {baseKey} = parseTypeId(tile.type);
      if(baseKey==="myst") return false;
      return true;
    }
    
    // Updated isMatchable to check Background Color (variant)
    function isMatchable(tile){
      if(!tile) return false;
      if(isBlocker(tile)) return false;
      const {baseKey} = parseTypeId(tile.type);
      if(getSpecial(baseKey)) return false;
      return true;
    }

    function calcTarget(lv){
      return Math.round(diff.baseTarget * (1 + (lv-1)*diff.targetGrow));
    }
    function calcMoves(lv){
      const m = diff.baseMoves + (lv-1)*diff.movesPerLevel;
      return Math.min(m, diff.key==="easy" ? 70 : diff.key==="normal" ? 60 : diff.key==="hard" ? 50 : 45);
    }
    function scorePerTile(){ return Math.round(60 * diff.scoreMult); }

    function clearHints(){
      if (typeof document === 'undefined') return;
      for(const el of tileEls.values()) el.classList.remove("hint");
    }

    /**********************
     * FX helpers
     **********************/
    function tileCenter(r,c){
      const x = PAD + c*(CELL+GAP) + CELL/2;
      const y = PAD + r*(CELL+GAP) + CELL/2;
      return {x, y};
    }
    function makeStar(x,y, big=false){
      if (typeof document === 'undefined') return;
      const s = document.createElement("div");
      s.className="star";
      s.style.left = x+"px";
      s.style.top  = y+"px";
      s.style.width = big ? "16px":"12px";
      s.style.height= big ? "16px":"12px";
      ui.fx.appendChild(s);
      setTimeout(()=>s.remove(), 900);
    }
    function ringFx(x,y){
      if (typeof document === 'undefined') return;
      const r=document.createElement("div");
      r.className="ring";
      r.style.left=x+"px"; r.style.top=y+"px";
      ui.fx.appendChild(r);
      setTimeout(()=>r.remove(), 760);
    }
    function burstFx(x,y, count=12){
      ringFx(x,y);
      for(let i=0;i<count;i++){
        const ang = Math.random()*Math.PI*2;
        const dist = 8 + Math.random()*30;
        makeStar(x + Math.cos(ang)*dist, y + Math.sin(ang)*dist, Math.random()<0.35);
      }
    }

    /**********************
     * Responsive sizing
     **********************/
    function computeCell(){
      if (typeof document === 'undefined') return 54;
      const wrap = document.getElementById("boardWrap");
      if (!wrap) return 54;
      const wrapW = wrap.clientWidth;
      const wrapH = wrap.clientHeight || (window.innerHeight*0.7);

      const usableW = Math.max(260, wrapW - 40);
      const usableH = Math.max(260, wrapH - 40);

      const cellW = Math.floor((usableW - (cols-1)*GAP - PAD*2) / cols);
      const cellH = Math.floor((usableH - (rows-1)*GAP - PAD*2) / rows);

      const max = document.body.classList.contains("fs") ? 124 : 98;
      return clamp(Math.min(cellW, cellH), 34, max);
    }

    function setTileXY(el, r, c){
      const x = c*(CELL+GAP) + PAD;
      const y = r*(CELL+GAP) + PAD;
      el.style.setProperty("--x", x+"px");
      el.style.setProperty("--y", y+"px");
    }

    function layoutBoard(){
      CELL = computeCell();
      if (typeof document !== 'undefined') {
          document.documentElement.style.setProperty("--cell", CELL+"px");
          document.documentElement.style.setProperty("--gap", GAP+"px");
          document.documentElement.style.setProperty("--cols", cols);
          document.documentElement.style.setProperty("--rows", rows);

          const w = PAD*2 + cols*CELL + (cols-1)*GAP;
          const h = PAD*2 + rows*CELL + (rows-1)*GAP;
          ui.board.style.width = w+"px";
          ui.board.style.height = h+"px";

          for(const [id, el] of tileEls){
            const tile = findTileById(id);
            if(!tile) continue;
            setTileXY(el, tile.r, tile.c);
          }
          syncLbHeight();
      }
    }

    let ro=null;
    function attachResize(){
      if (typeof window === 'undefined') return;
      try{
        ro = new ResizeObserver(()=>layoutBoard());
        ro.observe(document.getElementById("boardWrap"));
      }catch(e){
        window.addEventListener("resize", layoutBoard);
      }
      window.addEventListener("resize", syncBgHeight);
      document.getElementById("page").addEventListener("scroll", syncBgHeight, {passive:true});
      window.addEventListener("resize", ()=>{ buildGlobalBg(); buildFsBg(); });
    }

    function syncBgHeight(){
      if (typeof document === 'undefined') return;
      const page = document.getElementById("page");
      const h = Math.max(page.scrollHeight, window.innerHeight);
      document.getElementById("scrollBg").style.height = h + "px";
      document.getElementById("globalBg").style.height = h + "px";
    }

    /**********************
     * Tile DOM
     **********************/
    function createTileEl(tile, spawnDrop=false){
      if (typeof document === 'undefined') return null;
      const el = document.createElement("div");
      el.className="tile";
      el.dataset.id = tile.id;

      const {baseKey, variant} = parseTypeId(tile.type);
      const base = getBase(baseKey);
      const spec = getSpecial(baseKey);
      const meta = base || spec;

      // palettes
      let pal = ["#7ad8ff","#ff4fb9"];
      if(base){
        pal = (base.palettes?.[variant]) || (base.palettes?.A) || pal;
      }
      el.style.setProperty("--p1", pal[0]);
      el.style.setProperty("--p2", pal[1]);

      const plate = document.createElement("div");
      plate.className="plate";

      if(isPowerupKey(baseKey) || baseKey==="lovelie" || baseKey==="myst" || baseKey==="cit" || baseKey==="worm" || baseKey==="koala"){
        el.classList.add("powerAnim");
      }

      if(tile.big){
        el.classList.add("bigMellow");
      }

      if(baseKey === "myst"){
        const qm = document.createElement("div");
        qm.className="qmark";
        qm.textContent = "?";
        plate.appendChild(qm);
      }else{
        const img = document.createElement("img");
        img.src = meta?.img || "";
        img.alt = meta?.name || baseKey;
        plate.appendChild(img);
      }

      el.appendChild(plate);
      if(baseKey==="mellow"){
        const hp = document.createElement("div");
        hp.className="hp";
        hp.textContent = tile.hp;
        el.appendChild(hp);
      }

      setTileXY(el, tile.r, tile.c);

      if(spawnDrop){
        const fallDist = (tile.r + 3) * (CELL+GAP);
        plate.style.setProperty("--oy", `-${fallDist}px`);
        plate.style.setProperty("--op", "0");
        requestAnimationFrame(()=>{
          plate.style.setProperty("--oy", "0px");
          plate.style.setProperty("--op", "1");
        });
        const onEnd = (ev)=>{
          if(ev.propertyName !== "transform") return;
          plate.removeEventListener("transitionend", onEnd);
          el.classList.add("land");
          const center = tileCenter(tile.r, tile.c);
          makeStar(center.x, center.y, true);
          setTimeout(()=>el.classList.remove("land"), 560);
        };
        plate.addEventListener("transitionend", onEnd);
      }

      el.addEventListener("pointerdown", onPointerDown);
      el.addEventListener("pointerup", onPointerUp);
      return el;
    }

    function updateMellowHp(tile){
      const el = tileEls.get(tile.id);
      if(!el) return;
      const hp = el.querySelector(".hp");
      if(hp) hp.textContent = tile.hp;
    }

    function findTileById(id){
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const t = grid[r][c];
          if(t && t.id===id) return t;
        }
      }
      return null;
    }

    /**********************
     * Random tile generation
     **********************/
    function randNormalType(){
      let pool = BASES.filter(b => (b.minLevel||1) <= level);

      // Dynamic Character Variety: Limit to 4 specific base chars for levels 1-3
      if (level <= 3) {
          pool = pool.filter(b => ["sweety", "sleepy", "normal", "cry"].includes(b.key));
      }

      const weights = pool.map(b=>{
        const w = (b.key==="joyce"||b.key==="smokey") ? 9 : (b.key==="donut") ? 10 : 12;
        return {b, w};
      });
      const totalW = weights.reduce((a,x)=>a+x.w,0);
      let r = Math.random()*totalW;
      let pick = weights[0].b;
      for(const x of weights){
        r -= x.w;
        if(r<=0){ pick = x.b; break; }
      }

      // Background Variants Logic (using variants A/B)
      const variants = Array.from(unlocked[pick.key]);
      let v="A";
      if(variants.includes("B")){
        v = (Math.random() < 0.28) ? "B" : "A";
      }
      return typeId(pick.key, v);
    }

    function makeId(){
      return (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(16).slice(2)+Date.now().toString(16)));
    }

    function makeTile(r,c,type){
      const id = makeId();
      return { id, r, c, type, hp:0, big:false };
    }

    function wouldCreateMatch(r,c,type){
      // Match now requires EXACT type match (including variant/background)
      if(c>=2){
        const a=grid[r][c-1], b=grid[r][c-2];
        if(a && b && a.type===type && b.type===type && isMatchable(a) && isMatchable(b)) return true;
      }
      if(r>=2){
        const a=grid[r-1][c], b=grid[r-2][c];
        if(a && b && a.type===type && b.type===type && isMatchable(a) && isMatchable(b)) return true;
      }
      return false;
    }

    /**********************
     * Background (no bubbles) + subtle twinkles
     **********************/
    function buildGlobalBg(){
      syncBgHeight();
      if (typeof document === 'undefined') return;
      const cont = document.getElementById("globalBg");
      cont.innerHTML = "";

      const page = document.getElementById("page");
      const W = page.clientWidth;
      const H = Math.max(page.scrollHeight, window.innerHeight);
      const bgChars = [...BASES].sort(()=>Math.random()-0.5).slice(0,8);

      bgChars.forEach((b)=>{
        const wrap = document.createElement("div");
        wrap.className="bgLuv";
        const img = document.createElement("img");
        img.src=b.img; img.alt=b.name;

        const leftZone = Math.random() < 0.5;
        const x = leftZone
          ? Math.random()*(Math.max(240, W*0.26) - 120)
          : (W - 300) - Math.random()*(Math.max(240, W*0.26) - 120);

        const y = Math.random()*(Math.max(520,H)-280);

        wrap.style.left = Math.max(0, x)+"px";
        wrap.style.top  = y+"px";
        wrap.style.animationDuration = (16 + Math.random()*10)+"s";

        wrap.appendChild(img);
        cont.appendChild(wrap);

        // subtle twinkles around them (rare)
        const tick = ()=>{
          if(Math.random() < 0.28){
            const rect = wrap.getBoundingClientRect();
            const px = rect.left + rect.width * (0.2 + Math.random()*0.6);
            const py = rect.top  + rect.height* (0.2 + Math.random()*0.6);
            const t = document.createElement("div");
            t.className="twinkle";
            t.style.left = px + "px";
            t.style.top  = (py + window.scrollY) + "px";
            cont.appendChild(t);
            setTimeout(()=>t.remove(), 1300);
          }
        };
        setInterval(tick, 2200 + Math.random()*1400);
      });
    }

    function buildFsBg(){
      if (typeof document === 'undefined') return;
      const fs = document.getElementById("fsBg");
      fs.innerHTML = "";
      if(!document.body.classList.contains("fs")) return;
      const W = fs.clientWidth || window.innerWidth;
      const H = fs.clientHeight || window.innerHeight;
      const pick = [...BASES].sort(()=>Math.random()-0.5).slice(0,7);
      pick.forEach((b)=>{
        const wrap = document.createElement("div");
        wrap.className="bgLuv";
        wrap.style.opacity = ".78";
        wrap.style.width = "min(260px, 42vw)";
        const img = document.createElement("img");
        img.src=b.img; img.alt=b.name;

        const leftZone = Math.random() < 0.5;
        const x = leftZone ? Math.random()*(W*0.28) : (W-280) - Math.random()*(W*0.28);
        const y = Math.random()*(H-240);
        wrap.style.left = Math.max(0,x)+"px";
        wrap.style.top  = Math.max(0,y)+"px";
        wrap.style.animationDuration = (16 + Math.random()*10)+"s";

        wrap.appendChild(img);
        fs.appendChild(wrap);
      });
    }

    /**********************
     * Game Mechanics Logic
     **********************/
    
    function spawnMellow(){
      // Check for MellowZilla Boss Round (Every 20 levels)
      if (level % 20 === 0) {
          spawnMellowZilla();
          return;
      }

      if(!shouldSpawnMellowThisLevel()) return;
      const count = clamp(1 + Math.floor(level/4), 1, Math.floor(rows*cols/10));
      for(let i=0;i<count;i++){
        for(let tries=0;tries<260;tries++){
          const r=Math.floor(Math.random()*rows);
          const c=Math.floor(Math.random()*cols);
          const cur=grid[r][c];
          if(!cur) continue;
          if(isBlocker(cur)) continue;

          const bk = parseTypeId(cur.type).baseKey;
          if(getSpecial(bk)) continue;

          const m = makeTile(r,c,typeId("mellow","P"));
          m.hp = 3;
          const oldEl = tileEls.get(cur.id);
          if(oldEl){ oldEl.remove(); tileEls.delete(cur.id); }

          grid[r][c]=m;
          const el = createTileEl(m, false);
          el.classList.add("spawnGlow");
          tileEls.set(m.id, el);
          ui.board.appendChild(el);
          const center = tileCenter(r,c);
          burstFx(center.x, center.y, 10);
          break;
        }
      }
    }

    function spawnMellowZilla() {
        const size = 3;
        const centerR = Math.floor(rows/2) - 1;
        const centerC = Math.floor(cols/2) - 1;
        
        const bigId = makeId();
        const bigHp = 25 + (level * 2); // Boss HP scales

        // Register Big MellowZilla
        bigMellows.set(bigId, {id:bigId, r:centerR, c:centerC, hp:bigHp, isZilla: true});

        for(let r=centerR; r<centerR+size; r++){
            for(let c=centerC; c<centerC+size; c++){
                if (!inBounds(r, c)) continue;

                // Remove existing
                const existing = grid[r][c];
                if (existing) {
                    const el = tileEls.get(existing.id);
                    if(el) el.remove();
                    tileEls.delete(existing.id);
                }

                if (r===centerR && c===centerC) {
                    // Anchor
                    const zilla = { id: bigId, r, c, type: typeId("mellow","P"), hp: bigHp, big:true, zilla: true };
                    grid[r][c] = zilla;
                    const el = createTileEl(zilla, false);
                    el.classList.add("spawnGlow");
                    // Make it even bigger visually
                    el.style.width = `calc(var(--cell) * ${size} + var(--gap) * ${size-1})`;
                    el.style.height = `calc(var(--cell) * ${size} + var(--gap) * ${size-1})`;
                    el.style.zIndex = "30";
                    tileEls.set(bigId, el);
                    ui.board.appendChild(el);
                } else {
                    // Parts
                    grid[r][c] = { type: "mellow_part", partOf: bigId };
                }
            }
        }
        toast("MELLOWZILLA!", "Boss Round! 20.000 Pts!", 4000);
    }

    // Hint System Cost
    function hint(){
      const cost = diff.key === "easy" ? 1 : diff.key === "normal" ? 2 : 3;
      if (moves < cost) {
          toast("Nicht genug Moves!", "Benötigt: " + cost, 2000);
          return;
      }

      clearHints();
      for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){
          const t=grid[r][c];
          if(!t || isBlocker(t)) continue;
          if(!isSwappable(t)) continue;

          const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
          for(const [dr,dc] of dirs){
            const rr=r+dr, cc=c+dc;
            if(!inBounds(rr,cc)) continue;
            const u=grid[rr][cc];
            if(!u || isBlocker(u)) continue;
            if(!isSwappable(u)) continue;

            doSwap(r,c,rr,cc);
            const ok = hasAnyMatchOrSpecial();
            doSwap(r,c,rr,cc);
            if(ok){
              const el1=tileEls.get(t.id);
              const el2=tileEls.get(u.id);
              if(el1) el1.classList.add("hint");
              if(el2) el2.classList.add("hint");
              moves -= cost;
              updateUI();
              toast("Hint ✨", `-${cost} Move${cost>1?'s':''}`, 3000);
              return;
            }
          }
        }
      }
      toast("Keine direkten Moves 😵","Shuffle kommt gleich…", 3000);
      ensureMovesOrShuffle();
    }

    // Special Shuffle (Outer Frame Preserved)
    function shuffleRestricted(){
        const coords=[];
        const tiles=[];
        // Identify inner board (exclude outer 2 rows/cols)
        const innerStartR = 2;
        const innerEndR = rows - 2;
        const innerStartC = 2;
        const innerEndC = cols - 2;

        if (innerEndR <= innerStartR || innerEndC <= innerStartC) {
            shuffleAll(); // Fallback if board too small
            return;
        }

        for(let r=innerStartR; r<innerEndR; r++){
            for(let c=innerStartC; c<innerEndC; c++){
                const t=grid[r][c];
                if(!t) continue;
                if(isBlocker(t)) continue;
                const bk = parseTypeId(t.type).baseKey;
                if(bk==="myst") continue;
                coords.push({r,c});
                tiles.push(t);
            }
        }

        for(let i=tiles.length-1;i>0;i--){
            const j=Math.floor(Math.random()*(i+1));
            [tiles[i],tiles[j]]=[tiles[j],tiles[i]];
        }

        coords.forEach((p,i)=>{
            const t=tiles[i];
            grid[p.r][p.c]=t;
            t.r=p.r; t.c=p.c;
            const el = tileEls.get(t.id);
            if(el){
                setTileXY(el, t.r, t.c);
                el.classList.add("spawnGlow");
                setTimeout(()=>el.classList.remove("spawnGlow"), 700);
            }
        });
    }

    // Modified: Citrussie diagonal effect (3 rows range roughly, but let's do cross diagonal)
    function citDiagonal(r,c, range=3){
        const cells=[];
        // Diagonals X shape
        const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]];
        cells.push({r,c});
        
        // Full board diagonal clear
        for(const [dr,dc] of dirs){
            let i=1;
            while(true){
                const rr=r+dr*i, cc=c+dc*i;
                if(!inBounds(rr,cc)) break;
                cells.push({r:rr,c:cc});
                i++;
            }
        }
        
        clearCells(cells);
        totalScore += 400; levelScore += 400;
        toast("Citrussie!", "Diagonal Blast! 🍋", 2000);
    }

    function clearWholeBoard(limitBossDamage=false){
      const cells=[];
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        const t=grid[r][c];
        if(!t) continue;
        // Don't clear blockers directly, let clearCells handle dmg logic
        const bk=parseTypeId(t.type).baseKey;
        if(bk==="myst") continue;
        
        // Special: If limitBossDamage is true, we skip adding Boss Tiles directly to clear list
        // clearCells calls hitMellowAt which handles damage.
        // We just add coordinates.
        cells.push({r,c});
      }

      // We need a way to pass limitBossDamage to clearCells or handle it here.
      // Modifying clearCells to accept a maxDmg param is cleaner.
      clearCells(cells, limitBossDamage ? 1 : 999);
      totalScore += 800; levelScore += 800;
    }

    function wormWave6(r1,c1,r2,c2){
      const mid = Math.round((c1+c2)/2);
      let start = mid-2;
      let end = mid+3;
      if(start<0){ end += -start; start=0; }
      if(end>cols){ start -= (end-cols); end=cols; start=Math.max(0,start); }

      const cells=[];
      for(let r=0;r<rows;r++){
        for(let c=start;c<end;c++) cells.push({r,c});
      }
      clearCells(cells);
      totalScore += 500; levelScore += 500;
    }
    function koalaMagicOn(targetBaseKey){
      const base = getBase(targetBaseKey);
      toast("🐨 Koala-Magie!", "Alles von "+(base?.name||targetBaseKey)+" weg!", 3200);
      const cells=[];
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        const t=grid[r][c];
        if(!t) continue;
        if(isBlocker(t)) continue;
        const bk=parseTypeId(t.type).baseKey;
        if(bk===targetBaseKey) cells.push({r,c});
      }
      clearCells(cells);
    }

    function resolvePowerSwap(A,B,dir){
      const aBk = parseTypeId(A.type).baseKey;
      const bBk = parseTypeId(B.type).baseKey;

      if((aBk==="koala" && bBk==="cit") || (aBk==="cit" && bBk==="koala")){
        toast("🐨🍋 KOALA × Citrussy!", "DOUBLE BOARD CLEAN ×2 💥💥", 3800);

        // 1) first clear
        clearWholeBoard(true); // true = limited boss damage

        // 2) after refill -> clear again
        setTimeout(()=>{
          dropDown();
          mergeMellows();

          setTimeout(()=>{
            clearWholeBoard(true); // true = limited boss damage

            // double points reward (explicitly requested double)
            const bonus = Math.round(2200 * diff.scoreMult * 2);
            totalScore += bonus;
            levelScore += bonus;

            setTimeout(()=>{
              dropDown();
              mergeMellows();
              resolveAll(false);
            }, 240);

          }, 260);
        }, 260);

        clearCells([{r:A.r,c:A.c},{r:B.r,c:B.c}]);
        return;
      }

      if(aBk==="worm" && bBk==="worm"){
        toast("🪱🪱 Zu sauer!","Welle down!", 3200);
        wormWave6(A.r,A.c,B.r,B.c);
        clearCells([{r:A.r,c:A.c},{r:B.r,c:B.c}]);
        return;
      }

      if(aBk==="koala" && !getSpecial(bBk)){
        koalaMagicOn(bBk);
        clearCells([{r:A.r,c:A.c}]);
        return;
      }
      if(bBk==="koala" && !getSpecial(aBk)){
        koalaMagicOn(aBk);
        clearCells([{r:B.r,c:B.c}]);
        return;
      }

      if(aBk==="worm"){
        if(dir.dr !== 0) clearCol(A.c);
        else clearRow(A.r);
        clearCells([{r:A.r,c:A.c}]);
      }
      if(bBk==="worm"){
        if(dir.dr !== 0) clearCol(B.c);
        else clearRow(B.r);
        clearCells([{r:B.r,c:B.c}]);
      }

      if(aBk==="cit"){
        citDiagonal(A.r,A.c,3);
        clearCells([{r:A.r,c:A.c}]);
      }
      if(bBk==="cit"){
        citDiagonal(B.r,B.c,3);
        clearCells([{r:B.r,c:B.c}]);
      }
    }

    function resolveAll(){
      const step = ()=>{
        const specials = findSpecialTriples();
        const mm = findLineMatches();

        if(mm.clear.size===0 && specials.length===0){
          busy=false;
          updateUI();
          ensureMovesOrShuffle();
          return;
        }

        combo = clamp(combo+1, 1, 99);
        if(specials.length){
          for(const sp of specials){
            const center = sp.cells[Math.floor(sp.cells.length/2)];
            const ctr = tileCenter(center.r, center.c);
            burstFx(ctr.x, ctr.y, 14);

            if(sp.kind==="moonshuffle"){
              toast("🌙😴 Mond-Shuffle!", "4×4 Bereich ✨", 3200);
              clearCells(sp.cells);
              shuffleArea4x4(center.r, center.c);
              continue;
            }

            if(sp.kind==="therapy"){
              toast("🩹 Therapy Time!", "+3 Moves ✨", 3200);
              moves += 3;

              // Clear the triggering cells
              clearCells(sp.cells);

              // Transform Grumpys to Happys
              for(let r=0;r<rows;r++){
                for(let c=0;c<cols;c++){
                  const t=grid[r][c];
                  if(!t) continue;
                  const p=parseTypeId(t.type);
                  if(p.baseKey==="grumpy"){
                    t.type = typeId("happy", p.variant);
                    const el=tileEls.get(t.id);
                    if(el){
                      const img=el.querySelector("img");
                      if(img) img.src = IMG.happy;
                      // Add effect
                      el.classList.add("spawnGlow");
                    }
                  }
                }
              }
              continue;
            }

            if(sp.kind==="sprinkle"){
              toast("🍩✨ Sprinkle Beam!", "Beam Clear!", 3200);
              clearCells(sp.cells);
              const rr=center.r, cc=center.c;
              const beam = [];
              for(let d=-Math.max(rows,cols); d<=Math.max(rows,cols); d++){
                if(inBounds(rr, cc+d)) beam.push({r:rr,c:cc+d});
                if(inBounds(rr+d, cc)) beam.push({r:rr+d,c:cc});
                if(inBounds(rr+d, cc+d)) beam.push({r:rr+d,c:cc+d});
                if(inBounds(rr+d, cc-d)) beam.push({r:rr+d,c:cc-d});
              }
              clearCells(beam);
              continue;
            }

            if(sp.kind==="sugar"){
              toast("🍬 Sugar Rush!", "+5 Moves & Clears!", 3400);
              moves += 5;
              clearCells(sp.cells);
              const picks = [];
              for(let i=0;i<14;i++){
                const r=Math.floor(Math.random()*rows);
                const c=Math.floor(Math.random()*cols);
                picks.push({r,c});
              }
              clearCells(picks);
              continue;
            }

            if(sp.kind==="buddies"){
              toast("🐱🐶 Buddy Burst!", "Boom!", 3200);
              const area=[];
              for(const p of sp.cells){
                for(let dr=-1; dr<=1; dr++){
                  for(let dc=-1; dc<=1; dc++){
                    const rr=p.r+dr, cc=p.c+dc;
                    if(inBounds(rr,cc)) area.push({r:rr,c:cc});
                  }
                }
              }
              clearCells(sp.cells);
              clearCells(area);
              continue;
            }

            if(sp.kind==="bestbuddies"){
              toast("🦁🐱 BEST BUDDIES!", "Buddy Wave ✨", 3400);
              clearCells(sp.cells);

              // Row+Col vom Center + extra Punkte
              clearRow(center.r);
              clearCol(center.c);
              totalScore += Math.round(1200*diff.scoreMult);
              levelScore += Math.round(1200*diff.scoreMult);
              continue;
            }
          }

          setTimeout(()=>{
            dropDown();
            mergeMellows();
            setTimeout(step, 260);
          }, 240);
          checkLevelUp();
          updateUI();
          return;
        }

        const toClear = new Set(mm.clear);
        const scoreAdd = toClear.size * scorePerTile() * (1 + (combo-1)*0.12);
        totalScore += Math.round(scoreAdd);
        levelScore += Math.round(scoreAdd);

        const clearedCells = [];
        for(const key of toClear){
          const [r,c] = key.split(",").map(Number);
          const t = grid[r][c];
          if(!t) continue;

          if(hitMellowAt(r,c,1)) continue;

          const el = tileEls.get(t.id);
          if(el){
            el.classList.add("pop");
            const ctr = tileCenter(r,c);
            makeStar(ctr.x, ctr.y, true);
            setTimeout(()=>{ el.remove(); tileEls.delete(t.id); }, 420);
          }
          grid[r][c]=null;
          clearedCells.push({r,c});
        }

        damageMellowsAround(clearedCells);

        for(const [k, s] of mm.spawn){
          const [r,c]=k.split(",").map(Number);

          // FIX: Alten Tile entfernen, falls noch da (da er aus 'clear' entfernt wurde)
          const old = grid[r][c];
          if(old){
            const oldEl = tileEls.get(old.id);
            if(oldEl) oldEl.remove();
            tileEls.delete(old.id);
          }

          const t = makeTile(r,c,s.type);
          grid[r][c]=t;
          const el = createTileEl(t, false);
          el.classList.add("spawnGlow");
          tileEls.set(t.id, el);
          ui.board.appendChild(el);

          const ctr = tileCenter(r,c);
          makeStar(ctr.x, ctr.y, true);
        }

        setTimeout(()=>{
          dropDown();
          mergeMellows();
          setTimeout(step, 260);
        }, 240);
        checkLevelUp();
        updateUI();
      };

      step();
    }

    function hitMellowAt(r,c, dmg=1){
      const t = grid[r][c];
      if(!t) return false;
      if(isPlaceholder(t)){
        const bigId = t.partOf;
        const big = bigMellows.get(bigId);
        if(!big) return false;

        // Special Boss Logic: MellowZilla might have damage cap per hit or immunity phases?
        // Requirement: "Bosse verlieren nur 1 HP" in Koala+Citrussy combo.
        // That is handled by passing dmg=1.

        big.hp = Math.max(0, big.hp - dmg);

        const anchorTile = grid[big.r][big.c];
        if(anchorTile){
          anchorTile.hp = big.hp;
          updateMellowHp(anchorTile);
        }
        if(big.hp<=0) removeBigMellow(bigId);
        return true;
      }

      const bk = parseTypeId(t.type).baseKey;
      if(bk==="mellow"){
        t.hp = Math.max(0, t.hp - dmg);
        updateMellowHp(t);
        if(t.hp<=0){
          const el = tileEls.get(t.id);
          if(el){
            el.classList.add("pop");
            setTimeout(()=>{ el.remove(); tileEls.delete(t.id); }, 420);
          }
          grid[r][c]=null;
          toast("Mellow gelöst! ✨","Weiter!", 2600);
        }
        return true;
      }
      return false;
    }

    function clearCells(cells, maxDmg=1){
      const uniq = new Set(cells.map(p=>posKey(p.r,p.c)));
      const cleared = [];

      for(const key of uniq){
        const [r,c] = key.split(",").map(Number);
        const t = grid[r][c];
        if(!t) continue;

        // Apply damage to Mellow/Blocker.
        // If maxDmg is 1 (like in Koala+Cit combo for bosses), we pass 1.
        if(hitMellowAt(r,c,maxDmg)){
          const center = tileCenter(r,c);
          makeStar(center.x, center.y, false);
          continue;
        }
        if(isPlaceholder(t)) continue;

        const el = tileEls.get(t.id);
        if(el){
          el.classList.add("pop");
          const center = tileCenter(r,c);
          makeStar(center.x, center.y, true);
          setTimeout(()=>{ el.remove(); tileEls.delete(t.id); }, 420);
        }
        grid[r][c]=null;
        cleared.push({r,c});
      }

      damageMellowsAround(cleared);

      const add = Math.round(cleared.length * scorePerTile() * 1.10);
      totalScore += add;
      levelScore += add;
    }

    /**********************
     * Leaderboard
     **********************/
    const BAD_WORDS = ["badword", "schimpfwort", "insult"]; // Add real filter list here
    const WHITELIST = ["KOALAaufPILLEN"];

    function isNameAllowed(name) {
        if (WHITELIST.includes(name)) return true;
        const lower = name.toLowerCase();
        for (const bad of BAD_WORDS) {
            if (lower.includes(bad)) return false;
        }
        return true;
    }

    async function postScore(){
      if(!sb){ toast("Leaderboard offline","(Supabase nicht erreichbar)", 3200); return; }
      const nameInput = document.getElementById("lbName");
      let name = (nameInput.value || "Anonymous").trim().slice(0,24);

      if (!isNameAllowed(name)) {
          toast("Name unzulässig 🚫", "Bitte wähle einen anderen Namen.", 3000);
          return;
      }

      try{
        const payload = { player_name: name, score: totalScore, level: level, difficulty: diff.key, version:"luvvies-crush" };
        const { error } = await sb.from(SCORE_TABLE).insert(payload);
        if(error) throw error;
        toast("Score gepostet ✅", name+" • "+fmt(totalScore), 3200);
        await refreshLeaderboard();
      }catch(e){
        toast("Post fehlgeschlagen ❌", String(e.message||e), 3400);
      }
    }

    async function refreshLeaderboard(){
      const list = document.getElementById("lbList");
      list.innerHTML = "";
      if(!sb){
        list.innerHTML = `<div class="tiny">Leaderboard aktuell nicht verfügbar.</div>`;
        return;
      }
      try{
        const { data, error } = await sb
          .from(SCORE_TABLE)
          .select("player_name,score,level,difficulty,created_at")
          .order("score", { ascending:false })
          .limit(25);
        if(error) throw error;

        (data||[]).forEach((x, i)=>{
          const item = document.createElement("div");
          item.className="lbItem";
          if(i===0) item.classList.add("rank1");
          if(i===1) item.classList.add("rank2");
          if(i===2) item.classList.add("rank3");

          const d = new Date(x.created_at);
          const stamp = `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
          item.innerHTML = `
            <div class="left">
              <b>${i+1}. ${escapeHtml(x.player_name||"Anonymous")}</b>
              <small>Lvl ${x.level} • ${diffLabel(x.difficulty)} • ${stamp}</small>
            </div>
            <div class="score">${fmt(x.score)}</div>
          `;
          list.appendChild(item);
        });
        if(!data || data.length===0){
          list.innerHTML = `<div class="tiny">Noch keine Scores. Sei die/der Erste 😈✨</div>`;
        }
      }catch(e){
        list.innerHTML = `<div class="tiny">Leaderboard Fehler.</div>`;
      }
      syncLbHeight();
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, (m)=>({
        "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
      }[m]));
    }

    /**********************
     * Make Leaderboard same height as luvvies panel
     **********************/
    function syncLbHeight(){
      const luvPanel = document.getElementById("luvPanel");
      const rightPanel = document.getElementById("rightPanel");
      const lbList = document.getElementById("lbList");
      if(!luvPanel || !rightPanel || !lbList) return;

      const a = luvPanel.getBoundingClientRect();
      const b = rightPanel.getBoundingClientRect();
      const listTop = lbList.getBoundingClientRect().top;

      const targetBottom = b.top + a.height;
      const avail = targetBottom - listTop - 10;

      if(avail > 180){
        lbList.style.maxHeight = Math.floor(avail) + "px";
      }
    }

    /**********************
     * Intro/Greet events
     **********************/
    function showGreetingIfNeeded(){
      const k = "luvvies_greet_seen";
      const seen = getCookie(k);
      const today = todayKey();
      if(seen !== today){
        document.getElementById("greetBack").style.display="flex";
      }
    }
    function closeGreeting(setToday=true){
      if(setToday) setCookie("luvvies_greet_seen", todayKey(), 14);
      document.getElementById("greetBack").style.display="none";
    }

    if (typeof document !== 'undefined') {
        document.getElementById("greetPlay").addEventListener("click", ()=>{
          closeGreeting(true);
          toast("Let’s go! ✨","Viel Spaß!", 2600);
        });
        document.getElementById("greetGuide").addEventListener("click", ()=>{
          closeGreeting(true);
          document.getElementById("introBack").style.display="flex";
        });

        document.getElementById("btnIntro").addEventListener("click", ()=>document.getElementById("introBack").style.display="flex");
        document.getElementById("introClose").addEventListener("click", ()=>document.getElementById("introBack").style.display="none");
        document.getElementById("infoClose").addEventListener("click", ()=>document.getElementById("infoBack").style.display="none");

        /**********************
         * Buttons
         **********************/
        document.getElementById("btnNew").addEventListener("click", ()=>newGame(false));
        document.getElementById("btnHint").addEventListener("click", hint);
        document.getElementById("btnFs").addEventListener("click", toggleFullscreen);
        document.getElementById("btnPost").addEventListener("click", postScore);
        document.getElementById("btnRefresh").addEventListener("click", refreshLeaderboard);

        document.getElementById("diffPills").addEventListener("change", ()=>{
          const v = document.querySelector('input[name="diff"]:checked').value;
          diff = DIFFS[v];
          newGame(true);
          buildGlobalBg();
          buildFsBg();
        });
        document.getElementById("fsHint").addEventListener("click", hint);
        document.getElementById("fsIntro").addEventListener("click", ()=>document.getElementById("introBack").style.display="flex");
        document.getElementById("fsExit").addEventListener("click", async ()=>{
          if(document.fullscreenElement) await document.exitFullscreen();
        });
    }

    /**********************
     * Boot
     **********************/
    // Exportable for testing
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            setLevel: (l) => { level = l; },
            setMoves: (m) => { moves = m; },
            getMoves: () => moves,
            setDiff: (d) => { diff = DIFFS[d]; },
            randNormalType: () => randNormalType(),
            deductHintCost: () => {
                const cost = diff.key === "easy" ? 1 : diff.key === "normal" ? 2 : 3;
                moves = Math.max(0, moves - cost);
            },
            // expose other functions as needed
        };
    } else if (typeof window !== 'undefined') {
        // Run boot sequence only in browser
        window.addEventListener('DOMContentLoaded', () => {
            if (document.getElementById('boardWrap')) {
                attachResize();
                syncBgHeight();
                resetUnlocked();
                newGame(true);
                showGreetingIfNeeded();
            }
        });
    }
