
// ALIŞTIRMALAR SAYFASI
// ══════════════════════════════════════════════
function showExercisePage() {
    const sel = document.getElementById('exercise-list-selector');
    if (sel) {
        sel.innerHTML = '';
        Object.keys(allData).filter(k => Array.isArray(allData[k]))
            .forEach(n => sel.add(new Option(n, n)));
        const mainSel = document.getElementById('list-selector');
        if (mainSel && mainSel.value) sel.value = mainSel.value;
    }
    const due   = typeof countSM2Due === 'function' ? countSM2Due() : 0;
    const badge = document.getElementById('sm2-due-badge');
    if (badge) badge.innerText = due > 0 ? due + ' bekliyor' : '';
    showPage('exercise-page');
}

// ════════════════════════════════════════════════════════════════════
// games.js  —  YDT Master Pro  ·  Oyun Merkezi v2.0
// 10 Oyun: Kelime · Cümle · Seviye odaklı
// allData (global) kullanılır — motor.js'den gelir
// ════════════════════════════════════════════════════════════════════

/* ── Oyun Merkezi Ana Nesnesi ── */
const GM = (() => {

// ══════════════════════════════════════════════════════
// YARDIMCI FONKSİYONLAR
// ══════════════════════════════════════════════════════
function shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function pick(a,n){ return shuffle(a).slice(0,n); }
function rand(a){ return a[Math.floor(Math.random()*a.length)]; }
function $id(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// allData'dan kelime havuzu al
function getPool(listName){
    // listName boşsa tüm listeler birleştirilir
    if(!listName){
        const all = Object.values(allData).flat().filter(w=>w.eng&&w.tr);
        // eng'e göre tekrar temizle (aynı kelime birden fazla listede olabilir)
        const seen = new Set();
        return all.filter(w=>{ if(seen.has(w.eng)) return false; seen.add(w.eng); return true; });
    }
    const d = allData[listName];
    if(!d||!d.length) return [];
    return d.filter(w=>w.eng&&w.tr);
}

// En az n kelime olan liste seç
function requirePool(listName, minLen=4){
    const p = getPool(listName);
    if(p.length<minLen){ gmToast(`Bu oyun için en az ${minLen} kelime gerekli!`,'err'); return null; }
    return p;
}

// Yanlış şık üret (aynı listeden, hedef hariç)
function distractors(pool, correct, n=3, field='tr'){
    return pick(pool.filter(w=>w.eng!==correct.eng), n).map(w=>w[field]);
}

// XP → localStorage
function addScore(pts){
    const k='gm_score'; const v=parseInt(localStorage.getItem(k)||'0')+pts;
    localStorage.setItem(k,v); return v;
}
function getScore(){ return parseInt(localStorage.getItem('gm_score')||'0'); }

// Seviye tespiti (errorCount / correctStreak'e göre)
function wordLevel(w){
    const e=w.errorCount||0, c=w.correctStreak||0;
    if(c>=3) return {lbl:'Ustalaştı',color:'#16a34a',icon:'🏆'};
    if(e===0&&c===0) return {lbl:'Yeni',color:'#6366f1',icon:'🆕'};
    if(e>c)  return {lbl:'Zor',color:'#e63946',icon:'🔴'};
    return {lbl:'Öğreniliyor',color:'#f59e0b',icon:'🟡'};
}

// Toast
let _toastT=null;
function gmToast(msg,type='ok',dur=1800){
    let t=$id('gm-toast');
    if(!t){ t=document.createElement('div'); t.id='gm-toast';
        t.style.cssText='position:fixed;top:74px;left:50%;transform:translateX(-50%) translateY(-120px);z-index:9998;border-radius:50px;padding:10px 24px;font-weight:800;font-size:.95rem;font-family:inherit;transition:transform .35s cubic-bezier(.34,1.56,.64,1);white-space:nowrap;pointer-events:none;color:white;box-shadow:0 6px 20px rgba(0,0,0,.18);';
        document.body.appendChild(t);
    }
    clearTimeout(_toastT);
    t.textContent=msg;
    t.style.background=type==='ok'?'linear-gradient(135deg,#22c55e,#16a34a)':type==='err'?'linear-gradient(135deg,#ef4444,#dc2626)':'linear-gradient(135deg,#6366f1,#4f46e5)';
    t.style.transform='translateX(-50%) translateY(0)';
    _toastT=setTimeout(()=>{ t.style.transform='translateX(-50%) translateY(-120px)'; },dur);
}

// ══════════════════════════════════════════════════════
// OYUN MERKEZİ ANA SAYFA
// ══════════════════════════════════════════════════════
function showGamesPage(){
    const pg=$id('games-page');
    if(pg){
        // container class masaüstünde max-width kısıtlıyor — kaldır
        pg.classList.remove('container');
        pg.style.cssText='padding:0;max-width:none;';
    }
    renderHub();
    showPage('games-page');
}

const GAME_META = [
    { id:'memory',   icon:'🃏', name:'Memory Flip',       desc:'Kartları çevir, İng-Türkçe çiftleri eşleştir',       tag:'Kelime',   color:'#6366f1', min:4  },
    { id:'rainfall', icon:'🌧️', name:'Kelime Yağmuru',    desc:'Düşen kelimeleri hızla yaz, can kaybetme!',           tag:'Kelime',   color:'#0ea5e9', min:6  },
    { id:'anagram',  icon:'🔤', name:'Anagram',           desc:'Karışık harfleri doğru sırala',                       tag:'Kelime',   color:'#f59e0b', min:4  },
    { id:'hangman',  icon:'🪢', name:'Hangman',           desc:'Kelimeyi harfleri tahmin ederek bul',                 tag:'Kelime',   color:'#e63946', min:4  },
    { id:'flashrace',icon:'⚡', name:'Flash Race',        desc:'En hızlı flash kart — süre bitmeden cevapla',         tag:'Kelime',   color:'#8b5cf6', min:5  },
    { id:'builder',  icon:'🧩', name:'Sentence Builder',  desc:'Verilen kelimelerle doğru cümleyi kur',               tag:'Cümle',    color:'#10b981', min:4  },
    { id:'fillblank',icon:'📝', name:'Fill in the Blank', desc:'Cümledeki boşluğu bağlamdan çıkar',                   tag:'Cümle',    color:'#f97316', min:4  },
    { id:'translate',icon:'🌐', name:'Hızlı Çeviri Düellosu',desc:'Türkçe → İngilizce, süre baskısıyla',             tag:'Kelime',   color:'#ec4899', min:5  },
    { id:'levelup',  icon:'📊', name:'Seviye Haritası',   desc:'Kelimelerini sev. durumuna göre gör & pekiştir',      tag:'Seviye',   color:'#14b8a6', min:1  },
    { id:'spelling', icon:'🐝', name:'Spelling Bee Pro',  desc:'Sesi duy, kelimeyi yaz — telaffuzdan öğren',          tag:'Kelime',   color:'#a855f7', min:4  },
];

function renderHub(){
    const pg=$id('games-page'); if(!pg) return;
    const score=getScore();
    const pool=getPool(''); // tüm listeler birleşik
    const poolSize=pool.length;

    const tags=['Tümü','Kelime','Cümle','Seviye'];
    const activeTag=pg.dataset.tag||'Tümü';

    const tagHtml=tags.map(t=>`<button class="gm-tag-btn${t===activeTag?' active':''}" onclick="GM._tag('${t}')">${t}</button>`).join('');

    const filtered=GAME_META.filter(g=>activeTag==='Tümü'||g.tag===activeTag);

    const cards=filtered.map(g=>{
        const ok=poolSize>=g.min;
        return `<div class="gm-game-card${ok?'':' gm-disabled'}" ${!ok?`data-disabled-reason="En az ${g.min} kelime gerekli"`:''} onclick="${ok?`GM.start('${g.id}')`:''}">\n            <div class="gm-game-icon" style="background:${g.color}18;color:${g.color};">${g.icon}</div>\n            <div class="gm-game-body">\n                <div class="gm-game-name">${g.name}</div>\n                <div class="gm-game-desc">${g.desc}</div>\n            </div>\n            <div class="gm-game-tag" style="background:${g.color}18;color:${g.color};">${g.tag}</div>\n        </div>`;
    }).join('');

    pg.innerHTML=`
    <div class="gm-hub">
        <div class="gm-hub-header">
            <div>
                <div class="gm-hub-title">🎮 Oyun Merkezi</div>
                <div class="gm-hub-sub">Kelimelerini oynayarak öğren, pekiştir, ustalaş</div>
            </div>
            <div class="gm-hub-score">
                <div style="font-size:.65rem;font-weight:800;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;">Toplam Puan</div>
                <div style="font-size:1.6rem;font-weight:900;color:var(--color-primary);">🏆 ${score}</div>
            </div>
        </div>
        <div class="gm-list-row">
            <span class="gm-list-label">📚 Tüm Kelimeler</span>
            <span class="gm-list-count">${poolSize} kelime</span>
        </div>
        <div class="gm-tags">${tagHtml}</div>
        <div class="gm-grid">${cards}</div>
    </div>`;
}

function _tag(t){ const pg=$id('games-page'); if(pg) pg.dataset.tag=t; renderHub(); }
function _reload(){ renderHub(); }

// Oyun başlatıcı
function start(gameId){
    const listName=''; // tüm kelimeler
    window._gmCurrentList=listName;
    if(typeof startModule==='function') startModule();
    switch(gameId){
        case 'memory':    startMemory(listName);    break;
        case 'rainfall':  startRainfall(listName);  break;
        case 'anagram':   startAnagram(listName);   break;
        case 'hangman':   startHangman(listName);   break;
        case 'flashrace': startFlashRace(listName); break;
        case 'builder':   startBuilder(listName);   break;
        case 'fillblank': startFillBlank(listName); break;
        case 'translate': startTranslate(listName); break;
        case 'levelup':   startLevelMap(listName);  break;
        case 'spelling':  startSpellingPro(listName);break;
    }
}

// ── Oyun sayfası çerçevesi ──
function gameShell(title, icon, color, extra=''){
    return `<div class="gm-game-shell">
        <div class="gm-game-topbar" style="border-bottom:3px solid ${color}20;">
            <button class="gm-back-btn" onclick="GM._back()">← Geri</button>
            <div class="gm-game-topbar-title"><span style="margin-right:6px;">${icon}</span>${title}</div>
            ${extra}
        </div>
        <div class="gm-area-wrap"><div id="gm-area" class="gm-area"></div></div>
    </div>`;
}

function _back(){
    if(typeof exitModule==='function') exitModule();
    else showGamesPage();
}

// Sonuç ekranı
function showResult(opts){
    // opts: {correct, total, xp, time, title, onReplay}
    const pct=opts.total>0?Math.round(opts.correct/opts.total*100):0;
    const stars=pct>=90?3:pct>=60?2:pct>=30?1:0;
    const em=['😢','😅','😊','🎉'][stars];
    const ti=['Daha fazla pratik!','İyi başlangıç!','Güzel iş!','Mükemmel!'][stars];
    addScore(opts.xp||0);
    const area=$id('gm-area');
    if(!area) return;
    area.innerHTML=`<div class="gm-result">
        <div style="font-size:4rem;animation:gmBounce 1.5s infinite;">${em}</div>
        <div class="gm-result-title">${ti}</div>
        <div class="gm-result-stats">
            <div class="gm-rs-item"><span class="gm-rs-val">${opts.correct}/${opts.total}</span><span class="gm-rs-lbl">Doğru</span></div>
            <div class="gm-rs-item"><span class="gm-rs-val">${pct}%</span><span class="gm-rs-lbl">Başarı</span></div>
            ${opts.time?`<div class="gm-rs-item"><span class="gm-rs-val">${opts.time}</span><span class="gm-rs-lbl">Süre</span></div>`:''}
            <div class="gm-rs-item"><span class="gm-rs-val" style="color:#e63946;">+${opts.xp||0}</span><span class="gm-rs-lbl">Puan</span></div>
        </div>
        <div style="font-size:1.8rem;letter-spacing:6px;margin:14px 0;">${'⭐'.repeat(stars)+'☆'.repeat(3-stars)}</div>
        <div style="display:flex;gap:10px;justify-content:center;">
            <button class="gm-btn-sec" onclick="GM.showGamesPage()">🏠 Menü</button>
            <button class="gm-btn-pri" onclick="${opts.onReplay||'GM.showGamesPage()'}">🔄 Tekrar</button>
        </div>
    </div>`;
}

// ══════════════════════════════════════════════════════
// OYUN 1: MEMORY FLIP 🃏
// ══════════════════════════════════════════════════════
let _mem={};
function startMemory(listName){
    const pool=requirePool(listName,4); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Memory Flip','🃏','#6366f1',`<div id="gm-mem-stats" class="gm-mem-stats">🔁 <span id="gm-mem-mv">0</span> &nbsp;✅ <span id="gm-mem-mc">0</span>/<span id="gm-mem-mt">0</span> &nbsp;⏱ <span id="gm-mem-t">0:00</span></div>`);

    const chosen=pick(pool, Math.min(8,pool.length));
    let cards=[];
    chosen.forEach((w,i)=>{
        cards.push({id:i*2,pairId:i,type:'eng',text:w.eng});
        cards.push({id:i*2+1,pairId:i,type:'tr',text:w.tr});
    });
    _mem.cards=shuffle(cards); _mem.fl=[]; _mem.mc=0; _mem.mv=0; _mem.lk=false; _mem.sec=0;
    clearInterval(_mem.tmr);
    _mem.tmr=setInterval(()=>{
        _mem.sec++;
        const m=Math.floor(_mem.sec/60), s=String(_mem.sec%60).padStart(2,'0');
        const el=$id('gm-mem-t'); if(el) el.textContent=`${m}:${s}`;
    },1000);

    const area=$id('gm-area'); if(!area) return;
    $id('gm-mem-mt').textContent=chosen.length;
    area.style.cssText='display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:16px;';
    area.innerHTML='';

    _mem.cards.forEach((card,i)=>{
        const el=document.createElement('div');
        el.className='gm-mem-card';
        el.innerHTML=`<div class="gm-mc-inner"><div class="gm-mc-front">❓</div><div class="gm-mc-back gm-mc-${card.type}">${esc(card.text)}</div></div>`;
        el.onclick=()=>_memClick(i);
        area.appendChild(el);
    });
}
function _memClick(i){
    if(_mem.lk) return;
    const cards=document.querySelectorAll('#gm-area .gm-mem-card');
    const el=cards[i]; if(!el||el.dataset.done==='1'||el.dataset.flip==='1') return;
    el.dataset.flip='1'; el.classList.add('gm-mc-flip');
    _mem.fl.push({i,el,card:_mem.cards[i]});
    if(_mem.fl.length===2){
        _mem.lk=true; _mem.mv++;
        const el_mv=$id('gm-mem-mv'); if(el_mv) el_mv.textContent=_mem.mv;
        const [a,b]=_mem.fl;
        if(a.card.pairId===b.card.pairId&&a.card.type!==b.card.type){
            setTimeout(()=>{
                [a.el,b.el].forEach(e=>{e.dataset.done='1';e.classList.add('gm-mc-match');e.classList.remove('gm-mc-flip');delete e.dataset.flip;});
                _mem.fl=[]; _mem.lk=false; _mem.mc++;
                const mc=$id('gm-mem-mc'); if(mc) mc.textContent=_mem.mc;
                gmToast('✅ Eşleşti!','ok',1000);
                if(_mem.mc===_mem.cards.length/2){
                    clearInterval(_mem.tmr);
                    const m=Math.floor(_mem.sec/60), s=String(_mem.sec%60).padStart(2,'0');
                    const xp=Math.max(20, 60-_mem.mv);
                    showResult({correct:_mem.mc,total:_mem.mc,xp,time:`${m}:${s}`,onReplay:`GM.start('memory')`});
                }
            },350);
        } else {
            setTimeout(()=>{
                [a.el,b.el].forEach(e=>{e.classList.add('gm-mc-wrong');});
                setTimeout(()=>{
                    [a.el,b.el].forEach(e=>{e.classList.remove('gm-mc-flip','gm-mc-wrong');delete e.dataset.flip;});
                    _mem.fl=[]; _mem.lk=false;
                },450);
            },600);
        }
    }
}

// ══════════════════════════════════════════════════════
// OYUN 2: KELIME YAĞMURU 🌧️
// ══════════════════════════════════════════════════════
let _rf={};
function startRainfall(listName){
    const pool=requirePool(listName,6); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Kelime Yağmuru','🌧️','#0ea5e9',
        `<div class="gm-rf-hud">❤️ <span id="gm-rf-lives">3</span> &nbsp; ⭐ <span id="gm-rf-score">0</span> &nbsp; 📶 <span id="gm-rf-level">1</span></div>`);

    _rf.pool=[...pool]; _rf.lives=3; _rf.score=0; _rf.speed=2800; _rf.level=1;
    _rf.words=[]; _rf.paused=false; _rf.loop=null; _rf.spawnI=null; _rf.active=true;
    _rf.pool=shuffle(_rf.pool);

    const area=$id('gm-area');
    area.style.cssText='position:relative;height:380px;overflow:hidden;background:linear-gradient(180deg,#e0f2fe,#f0f9ff);border-radius:16px;margin:12px 16px;';
    area.innerHTML=`<div id="gm-rf-input-wrap" style="position:absolute;bottom:12px;left:0;right:0;padding:0 16px;z-index:10;">
        <input id="gm-rf-inp" class="gm-rf-input" placeholder="Türkçesini yaz..." autocomplete="off" autocorrect="off" spellcheck="false">
    </div>`;

    const inp=$id('gm-rf-inp');
    inp.addEventListener('input',()=>_rfCheck());
    inp.focus();
    _rfSpawn();
    _rf.loop=setInterval(()=>_rfTick(),100);
    _rf.spawnI=setInterval(()=>_rfSpawn(),_rf.speed);
}
function _rfSpawn(){
    if(!_rf.active) return;
    const area=$id('gm-area'); if(!area) return;
    const w=rand(_rf.pool);
    const el=document.createElement('div');
    el.className='gm-rf-word';
    el.dataset.eng=w.eng.toLowerCase();
    el.textContent=w.eng;
    el.style.left=Math.random()*75+'%';
    el.style.top='-40px';
    area.insertBefore(el,area.firstChild);
    _rf.words.push({el,y:-40,eng:w.eng.toLowerCase()});
}
function _rfTick(){
    if(!_rf.active) return;
    const area=$id('gm-area'); if(!area) return;
    const speed=1.2+(_rf.level*0.3);
    _rf.words=[..._rf.words].filter(w=>{
        if(!w.el.parentNode) return false;
        w.y+=speed; w.el.style.top=w.y+'px';
        if(w.y>340){
            w.el.remove();
            _rf.lives--;
            const lv=$id('gm-rf-lives'); if(lv) lv.textContent=_rf.lives;
            gmToast(`❌ Kaçırdın! "${w.eng}"`, 'err',1500);
            if(_rf.lives<=0) _rfEnd();
            return false;
        }
        return true;
    });
}
function _rfCheck(){
    const inp=$id('gm-rf-inp'); if(!inp) return;
    const val=inp.value.trim().toLowerCase();
    const idx=_rf.words.findIndex(w=>w.eng===val);
    if(idx>=0){
        _rf.words[idx].el.remove();
        _rf.words.splice(idx,1);
        _rf.score++;
        const sv=$id('gm-rf-score'); if(sv) sv.textContent=_rf.score;
        inp.value='';
        gmToast('✅ +1','ok',800);
        // Seviye atla
        if(_rf.score>0&&_rf.score%8===0){
            _rf.level++;
            _rf.speed=Math.max(1200,_rf.speed-200);
            clearInterval(_rf.spawnI);
            _rf.spawnI=setInterval(()=>_rfSpawn(),_rf.speed);
            const lv=$id('gm-rf-level'); if(lv) lv.textContent=_rf.level;
            gmToast(`🔥 Seviye ${_rf.level}!`,'info',2000);
        }
    }
}
function _rfEnd(){
    _rf.active=false;
    clearInterval(_rf.loop); clearInterval(_rf.spawnI);
    const xp=_rf.score*3;
    showResult({correct:_rf.score,total:_rf.score+_rf.lives<0?_rf.score:_rf.score+3,xp,onReplay:`GM.start('rainfall')`});
}

// ══════════════════════════════════════════════════════
// OYUN 3: ANAGRAM 🔤
// ══════════════════════════════════════════════════════
let _ag={};
function startAnagram(listName){
    const pool=requirePool(listName,4); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Anagram','🔤','#f59e0b',
        `<div class="gm-rf-hud">✅ <span id="gm-ag-ok">0</span>/<span id="gm-ag-tot">0</span> &nbsp; ❤️ <span id="gm-ag-lives">3</span></div>`);
    _ag.pool=shuffle(pool.filter(w=>w.eng.length>=3)); _ag.i=0; _ag.ok=0; _ag.lives=3; _ag.sel=[];
    $id('gm-ag-tot').textContent=Math.min(_ag.pool.length,10);
    _agNext();
}
function _agNext(){
    if(_ag.i>=10||_ag.i>=_ag.pool.length||_ag.lives<=0){
        showResult({correct:_ag.ok,total:Math.min(_ag.i,10),xp:_ag.ok*4,onReplay:`GM.start('anagram')`});
        return;
    }
    const area=$id('gm-area'); if(!area) return;
    const w=_ag.pool[_ag.i]; _ag._w=w; _ag.sel=[];
    let sc=shuffle(w.eng.split(''));
    while(sc.join('')===w.eng) sc=shuffle(sc);
    _ag._letters=sc;
    _agRender();
}
function _agRender(){
    const area=$id('gm-area'); if(!area) return;
    const w=_ag._w;
    const ansHtml=Array.from({length:w.eng.length},(_,i)=>{
        const l=_ag.sel[i];
        return `<div class="gm-ag-slot${l?' filled':''}" onclick="GM._agRm(${i})">${l?l.toUpperCase():'&nbsp;'}</div>`;
    }).join('');
    const letHtml=_ag._letters.map((l,i)=>{
        const usedN=_ag.sel.filter(x=>x===l).length;
        const totalN=_ag._letters.filter(x=>x===l).length;
        const used=usedN>=(totalN- (_ag.sel.slice(0,_ag.sel.length).filter(x=>x===l).length - _ag._letters.slice(0,i).filter(x=>x===l).length));
        // simpler: track by index
        return `<button class="gm-ag-tile" id="gm-ag-t-${i}" onclick="GM._agAdd('${l}',${i})">${l.toUpperCase()}</button>`;
    }).join('');

    area.innerHTML=`<div style="padding:16px;">
        <div class="gm-prog-bar-wrap"><div class="gm-prog-bar" style="width:${(_ag.i/Math.min(_ag.pool.length,10))*100}%"></div></div>
        <div class="gm-ag-hint">
            <span style="font-size:.82rem;font-weight:700;color:var(--ink3);">Türkçe anlamı:</span>
            <span style="font-size:1.1rem;font-weight:900;color:var(--ink);">${esc(w.tr)}</span>
            ${w.mnemonic?`<div style="font-size:.72rem;color:var(--ink3);margin-top:4px;font-style:italic;">💡 ${esc(w.mnemonic)}</div>`:''}
        </div>
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin:16px 0 10px;">${ansHtml}</div>
        <div style="font-size:.72rem;font-weight:700;color:var(--ink3);text-align:center;margin-bottom:10px;">Harflere tıkla:</div>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;" id="gm-ag-tiles">${letHtml}</div>
        <div style="display:flex;gap:10px;">
            <button class="gm-btn-sec" style="flex:1;" onclick="GM._agClear()">🗑️ Temizle</button>
            <button class="gm-btn-pri" style="flex:1;" onclick="GM._agCheck()">Kontrol ✓</button>
        </div>
    </div>`;
    // disable used tiles
    _agSyncTiles();
}
function _agSyncTiles(){
    // track which indices are used
    const used=new Array(_ag._letters.length).fill(false);
    const sel=[..._ag.sel];
    _ag._letters.forEach((l,i)=>{
        const idx=sel.indexOf(l);
        if(idx>=0){ used[i]=true; sel.splice(idx,1); }
    });
    // partial - simpler: disable first N occurrences
    const counts={};
    _ag._letters.forEach((l,i)=>{
        counts[l]=(counts[l]||0);
        const btn=$id(`gm-ag-t-${i}`);
        if(!btn) return;
        const selCount=_ag.sel.filter(x=>x===l).length;
        const passedCount=_ag._letters.slice(0,i).filter(x=>x===l).length;
        btn.disabled=(passedCount < selCount);
        btn.classList.toggle('gm-ag-used', btn.disabled);
    });
}
function _agAdd(l,i){
    if(_ag.sel.length>=_ag._w.eng.length) return;
    _ag.sel.push(l);
    _agRender();
}
function _agRm(i){
    if(i>=_ag.sel.length) return;
    _ag.sel.splice(i,1);
    _agRender();
}
function _agClear(){ _ag.sel=[]; _agRender(); }
function _agCheck(){
    const built=_ag.sel.join('');
    if(built.length<_ag._w.eng.length){ gmToast('Tüm harfleri diz!','err'); return; }
    const w=_ag._w;
    if(built.toLowerCase()===w.eng.toLowerCase()){
        gmToast('✅ Doğru!','ok'); _ag.ok++;
        const ok=$id('gm-ag-ok'); if(ok) ok.textContent=_ag.ok;
    } else {
        gmToast(`❌ Doğrusu: ${w.eng}`,'err',2500);
        _ag.lives--;
        const lv=$id('gm-ag-lives'); if(lv) lv.textContent=_ag.lives;
    }
    _ag.i++;
    setTimeout(_agNext,1300);
}

// ══════════════════════════════════════════════════════
// OYUN 4: HANGMAN 🪢
// ══════════════════════════════════════════════════════
let _hg={};
function startHangman(listName){
    const pool=requirePool(listName,4); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Hangman','🪢','#e63946',
        `<div class="gm-rf-hud">✅ <span id="gm-hg-ok">0</span> &nbsp; ❌ <span id="gm-hg-wr">0</span></div>`);
    _hg.pool=shuffle(pool); _hg.i=0; _hg.ok=0; _hg.wr=0;
    _hgNext();
}
function _hgNext(){
    if(_hg.i>=Math.min(_hg.pool.length,10)){
        showResult({correct:_hg.ok,total:Math.min(_hg.pool.length,10),xp:_hg.ok*5,onReplay:`GM.start('hangman')`});
        return;
    }
    const w=_hg.pool[_hg.i]; _hg._w=w;
    _hg._wrong=[]; _hg._guessed=new Set();
    _hgRender();
}
const HG_PARTS=['😐','😟','😨','😰','😱','💀'];
function _hgRender(){
    const area=$id('gm-area'); if(!area) return;
    const w=_hg._w, wrong=_hg._wrong, guessed=_hg._guessed;
    const maxWrong=5;
    const display=w.eng.split('').map(c=>c===' '?' ':(guessed.has(c.toLowerCase())?c.toUpperCase():'_')).join('  ');
    const face=HG_PARTS[Math.min(wrong.length,5)];
    const hint=w.tr;

    const keyboard='abcdefghijklmnopqrstuvwxyz'.split('').map(c=>{
        const state=wrong.includes(c)?'wrong':guessed.has(c)?'right':'';
        return `<button class="gm-hg-key${state?' '+state:''}" onclick="GM._hgGuess('${c}')" ${state?'disabled':''}>${c.toUpperCase()}</button>`;
    }).join('');

    area.innerHTML=`<div style="padding:16px;">
        <div class="gm-prog-bar-wrap"><div class="gm-prog-bar" style="width:${(_hg.i/Math.min(_hg.pool.length,10))*100}%"></div></div>
        <div style="text-align:center;margin:14px 0;">
            <div style="font-size:4rem;margin-bottom:4px;">${face}</div>
            <div style="font-size:.7rem;font-weight:800;color:var(--ink3);">Kalan can: ${maxWrong-wrong.length+1} / ${maxWrong+1}</div>
            <div style="height:5px;background:var(--border);border-radius:4px;margin:8px auto;max-width:200px;overflow:hidden;">
                <div style="height:100%;width:${((maxWrong+1-wrong.length)/(maxWrong+1))*100}%;background:${wrong.length>=4?'#e63946':'#22c55e'};border-radius:4px;transition:width .3s;"></div>
            </div>
        </div>
        <div style="background:var(--bg);border-radius:14px;padding:12px;text-align:center;margin-bottom:10px;">
            <div style="font-size:.78rem;font-weight:700;color:var(--ink3);margin-bottom:6px;">💡 Türkçe anlamı: <strong style="color:var(--ink);">${esc(hint)}</strong></div>
            <div style="font-family:monospace;font-size:1.8rem;font-weight:900;letter-spacing:6px;color:var(--ink);">${display}</div>
        </div>
        ${wrong.length?`<div style="text-align:center;font-size:.78rem;color:var(--red);font-weight:700;margin-bottom:10px;">Yanlış: ${wrong.map(c=>c.toUpperCase()).join(' ')}</div>`:''}
        <div class="gm-hg-keyboard">${keyboard}</div>
    </div>`;
}
function _hgGuess(c){
    const w=_hg._w;
    if(w.eng.toLowerCase().includes(c)){
        _hg._guessed.add(c);
        const all=w.eng.split('').every(l=>l===' '||_hg._guessed.has(l.toLowerCase()));
        _hgRender();
        if(all){
            gmToast('🎉 Kelimeyi buldun!','ok',2000);
            _hg.ok++;
            const ok=$id('gm-hg-ok'); if(ok) ok.textContent=_hg.ok;
            _hg.i++;
            setTimeout(_hgNext,1800);
        }
    } else {
        _hg._wrong.push(c);
        _hgRender();
        if(_hg._wrong.length>5){
            gmToast(`💀 Kaybettin! "${w.eng}"`, 'err',2200);
            _hg.wr++;
            const wr=$id('gm-hg-wr'); if(wr) wr.textContent=_hg.wr;
            _hg.i++;
            setTimeout(_hgNext,2000);
        }
    }
}

// ══════════════════════════════════════════════════════
// OYUN 5: FLASH RACE ⚡
// ══════════════════════════════════════════════════════
let _fr={};
function startFlashRace(listName){
    const pool=requirePool(listName,5); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Flash Race','⚡','#8b5cf6',
        `<div class="gm-rf-hud">⏱ <span id="gm-fr-t">10</span>s &nbsp; ✅ <span id="gm-fr-ok">0</span> &nbsp; ❌ <span id="gm-fr-wr">0</span></div>`);
    _fr.pool=shuffle(pool); _fr.i=0; _fr.ok=0; _fr.wr=0; _fr.timeLeft=10;
    _frNext();
}
function _frNext(){
    if(_fr.i>=Math.min(_fr.pool.length,15)){
        clearInterval(_fr.tmr);
        showResult({correct:_fr.ok,total:Math.min(_fr.pool.length,15),xp:_fr.ok*3,onReplay:`GM.start('flashrace')`});
        return;
    }
    clearInterval(_fr.tmr);
    _fr.timeLeft=10; _fr.answered=false;
    const w=_fr.pool[_fr.i]; _fr._w=w;
    const opts=shuffle([w.tr,...distractors(_fr.pool,w,3,'tr')]);
    const area=$id('gm-area'); if(!area) return;
    area.innerHTML=`<div style="padding:16px;">
        <div class="gm-prog-bar-wrap"><div class="gm-prog-bar" style="width:${(_fr.i/Math.min(_fr.pool.length,15))*100}%"></div></div>
        <div id="gm-fr-timer-bar" style="height:6px;background:#e63946;border-radius:4px;margin-bottom:14px;transition:width .9s linear;"></div>
        <div class="gm-flash-word">${esc(w.eng)}</div>
        ${w.mnemonic?`<div style="text-align:center;font-size:.72rem;color:var(--ink3);margin-bottom:10px;font-style:italic;">💡 ${esc(w.mnemonic)}</div>`:''}
        <div class="gm-ans-grid">
            ${opts.map(o=>`<button class="gm-ans-btn" onclick="GM._frAns(this,'${esc(o)}','${esc(w.tr)}')">${esc(o)}</button>`).join('')}
        </div>
    </div>`;
    // Timer
    setTimeout(()=>{
        const bar=$id('gm-fr-timer-bar');
        if(bar) bar.style.width='0%';
    },50);
    _fr.tmr=setInterval(()=>{
        _fr.timeLeft--;
        const t=$id('gm-fr-t'); if(t) t.textContent=_fr.timeLeft;
        if(_fr.timeLeft<=0&&!_fr.answered){
            clearInterval(_fr.tmr);
            gmToast(`⏰ Süre Doldu! "${w.eng}" = ${w.tr}`,'err',2200);
            _fr.wr++;
            const wr=$id('gm-fr-wr'); if(wr) wr.textContent=_fr.wr;
            _fr.answered=true; _fr.i++;
            setTimeout(_frNext,2000);
        }
    },1000);
}
function _frAns(btn,ans,correct){
    if(_fr.answered) return;
    _fr.answered=true; clearInterval(_fr.tmr);
    const area=$id('gm-area');
    area.querySelectorAll('.gm-ans-btn').forEach(b=>b.disabled=true);
    if(ans===correct){
        btn.classList.add('gm-ans-correct'); _fr.ok++;
        gmToast('✅ Doğru!','ok');
        const ok=$id('gm-fr-ok'); if(ok) ok.textContent=_fr.ok;
    } else {
        btn.classList.add('gm-ans-wrong');
        area.querySelectorAll('.gm-ans-btn').forEach(b=>{if(b.textContent===correct)b.classList.add('gm-ans-correct');});
        gmToast(`❌ Yanlış! "${_fr._w.eng}" = ${correct}`,'err',2200);
        _fr.wr++;
        const wr=$id('gm-fr-wr'); if(wr) wr.textContent=_fr.wr;
    }
    _fr.i++;
    setTimeout(_frNext,1300);
}

// ══════════════════════════════════════════════════════
// OYUN 6: SENTENCE BUILDER 🧩
// ══════════════════════════════════════════════════════
let _sb={};

// Hazır cümle şablonları (kelime listeleriyle dinamik doldurulur)
const SB_TEMPLATES=[
    {tr:'___ çok [ADJ].',   en:['[WORD]','is','very','[ADJ].'],  adjs:['beautiful','important','difficult','common','useful','popular']},
    {tr:'Ben ___ biliyorum.',en:['I','know','[WORD].'],           adjs:[]},
    {tr:'___ öğrenmek istiyorum.',en:['I','want','to','learn','[WORD].'],adjs:[]},
    {tr:'___ kelimesi zordur.',en:['The','word','[WORD]','is','hard.'],adjs:[]},
    {tr:'___ anlamına gelir.',en:['[WORD]','means','[TR].'],     adjs:[]},
];

function startBuilder(listName){
    const pool=requirePool(listName,4); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Sentence Builder','🧩','#10b981',
        `<div class="gm-rf-hud">✅ <span id="gm-sb-ok">0</span>/<span id="gm-sb-tot">8</span></div>`);
    _sb.pool=shuffle(pool); _sb.i=0; _sb.ok=0; _sb.b=[]; _sb.bk=[];
    // Cümleleri üret
    _sb.qs=[];
    for(let i=0;i<Math.min(pool.length,8);i++){
        const w=_sb.pool[i];
        const tmpl=rand(SB_TEMPLATES);
        let words=tmpl.en.map(t=>{
            if(t==='[WORD]') return w.eng;
            if(t==='[TR].') return w.tr+'.';
            if(t==='[ADJ].'&&tmpl.adjs.length) return rand(tmpl.adjs)+'.';
            return t;
        });
        const tr=tmpl.tr.replace('___',w.eng).replace('[ADJ]',tmpl.adjs.length?rand(tmpl.adjs):'');
        _sb.qs.push({words,tr,eng:words.join(' ')});
    }
    $id('gm-sb-tot').textContent=_sb.qs.length;
    _sbNext();
}
function _sbNext(){
    if(_sb.i>=_sb.qs.length){
        showResult({correct:_sb.ok,total:_sb.qs.length,xp:_sb.ok*6,onReplay:`GM.start('builder')`});
        return;
    }
    const q=_sb.qs[_sb.i]; _sb._q=q; _sb.b=[]; _sb.bk=shuffle([...q.words]);
    _sbRender();
}
function _sbRender(){
    const area=$id('gm-area'); if(!area) return;
    const q=_sb._q;
    const dc=_sb.b.map((w,i)=>`<div class="gm-chip gm-chip-in" onclick="GM._sbRm(${i})">${esc(w)}</div>`).join('');
    const bk=_sb.bk.map((w,i)=>`<div class="gm-chip" onclick="GM._sbAdd(${i})">${esc(w)}</div>`).join('');
    area.innerHTML=`<div style="padding:16px;">
        <div class="gm-prog-bar-wrap"><div class="gm-prog-bar" style="width:${(_sb.i/_sb.qs.length)*100}%"></div></div>
        <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:14px;padding:12px;margin-bottom:14px;text-align:center;">
            <div style="font-size:.75rem;font-weight:700;color:var(--ink3);">Bu cümleyi İngilizce yaz:</div>
            <div style="font-size:1rem;font-weight:900;color:var(--ink);margin-top:4px;">${esc(q.tr)}</div>
        </div>
        <div style="min-height:52px;border:2.5px dashed ${_sb.b.length?'#6ee7b7':'#d1fae5'};border-radius:14px;padding:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px;background:#f0fdf4;">
            ${dc||'<span style="color:#d1fae5;font-size:.8rem;font-weight:700;">Kelimeler buraya gelecek...</span>'}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">${bk}</div>
        <button class="gm-btn-pri" onclick="GM._sbCheck()" style="width:100%;">Kontrol Et ✓</button>
    </div>`;
}
function _sbAdd(i){ _sb.b.push(_sb.bk[i]); _sb.bk.splice(i,1); _sbRender(); }
function _sbRm(i){ _sb.bk.push(_sb.b[i]); _sb.b.splice(i,1); _sbRender(); }
function _sbCheck(){
    const built=_sb.b.join(' '), correct=_sb._q.words.join(' ');
    if(built===correct){ gmToast('✅ Mükemmel!','ok'); _sb.ok++; const ok=$id('gm-sb-ok'); if(ok) ok.textContent=_sb.ok; }
    else gmToast(`❌ Doğrusu: "${correct}"`, 'err', 2500);
    _sb.i++; setTimeout(_sbNext,1500);
}

// ══════════════════════════════════════════════════════
// OYUN 7: FILL IN THE BLANK 📝
// ══════════════════════════════════════════════════════
let _fb={};
function startFillBlank(listName){
    const pool=requirePool(listName,4); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Fill in the Blank','📝','#f97316',
        `<div class="gm-rf-hud">✅ <span id="gm-fb-ok">0</span>/<span id="gm-fb-tot">0</span></div>`);
    // Cümle listesinden al (story veya örnek cümle üret)
    _fb.pool=shuffle(pool.filter(w=>w.eng&&w.tr));
    _fb.qs=_fb.pool.slice(0,Math.min(10,_fb.pool.length));
    _fb.i=0; _fb.ok=0;
    $id('gm-fb-tot').textContent=_fb.qs.length;
    _fbNext();
}
function _fbNext(){
    if(_fb.i>=_fb.qs.length){
        showResult({correct:_fb.ok,total:_fb.qs.length,xp:_fb.ok*4,onReplay:`GM.start('fillblank')`});
        return;
    }
    const w=_fb.qs[_fb.i];
    // Cümle: story varsa onu kullan, yoksa basit şablon
    let sentence='', blankEng=w.eng;
    if(w.story&&w.story.toLowerCase().includes(w.eng.toLowerCase())){
        sentence=w.story;
    } else {
        // Basit şablon cümleleri
        const templates=[
            `The word "${w.eng}" means ${w.tr} in Turkish.`,
            `She used the word "${w.eng}" correctly in the sentence.`,
            `"${w.eng}" is an important word to know.`,
            `Can you remember what "${w.eng}" means?`,
            `The teacher explained "${w.eng}" to the class.`,
        ];
        sentence=rand(templates);
    }
    // Kelimeyi boşluğa çevir
    const displaySentence=sentence.replace(new RegExp(w.eng.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi'),'_____');
    const opts=shuffle([w.eng,...distractors(_fb.pool,w,3,'eng')]);
    const area=$id('gm-area'); if(!area) return;
    area.innerHTML=`<div style="padding:16px;">
        <div class="gm-prog-bar-wrap"><div class="gm-prog-bar" style="width:${(_fb.i/_fb.qs.length)*100}%"></div></div>
        <div style="background:var(--bg);border-radius:14px;padding:16px;margin-bottom:14px;">
            <div style="font-size:.72rem;font-weight:800;color:var(--ink3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">📖 Cümledeki boşluğu doldur</div>
            <div style="font-size:1.05rem;color:var(--ink);line-height:1.8;font-weight:600;">${esc(displaySentence)}</div>
            ${w.tr?`<div style="font-size:.78rem;color:var(--ink3);margin-top:8px;">Türkçe ipucu: <em>${esc(w.tr)}</em></div>`:''}
        </div>
        <div class="gm-ans-grid">
            ${opts.map(o=>`<button class="gm-ans-btn" onclick="GM._fbAns(this,'${esc(o)}','${esc(w.eng)}')">${esc(o)}</button>`).join('')}
        </div>
    </div>`;
}
function _fbAns(btn,ans,correct){
    const area=$id('gm-area');
    area.querySelectorAll('.gm-ans-btn').forEach(b=>b.disabled=true);
    if(ans===correct){ btn.classList.add('gm-ans-correct'); _fb.ok++; gmToast('✅ Doğru!','ok');
        const ok=$id('gm-fb-ok'); if(ok) ok.textContent=_fb.ok;
    } else { btn.classList.add('gm-ans-wrong'); gmToast(`❌ Doğrusu: ${correct}`,'err',2200);
        area.querySelectorAll('.gm-ans-btn').forEach(b=>{ if(b.textContent===correct) b.classList.add('gm-ans-correct'); });
    }
    _fb.i++; setTimeout(_fbNext,1400);
}

// ══════════════════════════════════════════════════════
// OYUN 8: HIZLI ÇEVİRİ DÜELLOSU 🌐
// ══════════════════════════════════════════════════════
let _td={};
function startTranslate(listName){
    const pool=requirePool(listName,5); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Hızlı Çeviri Düellosu','🌐','#ec4899',
        `<div class="gm-rf-hud">🔥 <span id="gm-td-streak">0</span> seri &nbsp; ✅ <span id="gm-td-ok">0</span> &nbsp; ⭐ <span id="gm-td-xp">0</span></div>`);
    _td.pool=shuffle(pool); _td.i=0; _td.ok=0; _td.streak=0; _td.xp=0;
    _tdNext();
}
function _tdNext(){
    if(_td.i>=Math.min(_td.pool.length,20)){
        showResult({correct:_td.ok,total:Math.min(_td.pool.length,20),xp:_td.xp,onReplay:`GM.start('translate')`});
        return;
    }
    const w=_td.pool[_td.i]; _td._w=w;
    // Rastgele yön: Türkçe→İng veya İng→Türkçe
    const dir=Math.random()>.5?'tr2en':'en2tr';
    _td._dir=dir;
    const question=dir==='tr2en'?w.tr:w.eng;
    const correctAns=dir==='tr2en'?w.eng:w.tr;
    const opts=shuffle([correctAns,...distractors(_td.pool,w,3,dir==='tr2en'?'eng':'tr')]);
    const area=$id('gm-area'); if(!area) return;
    area.innerHTML=`<div style="padding:16px;">
        <div class="gm-prog-bar-wrap"><div class="gm-prog-bar" style="width:${(_td.i/Math.min(_td.pool.length,20))*100}%"></div></div>
        <div style="text-align:center;margin-bottom:8px;">
            <div class="gm-td-dir-badge">${dir==='tr2en'?'🇹🇷 → 🇬🇧  Türkçeden İngilizceye':'🇬🇧 → 🇹🇷  İngilizceden Türkçeye'}</div>
        </div>
        <div class="gm-flash-word" style="font-size:2rem;">${esc(question)}</div>
        ${_td.streak>=3?`<div style="text-align:center;font-size:.8rem;color:#f59e0b;font-weight:800;margin:-6px 0 10px;">🔥 ${_td.streak} seri bonus! ×${Math.min(3,Math.floor(_td.streak/3)+1)}</div>`:''}
        <div class="gm-ans-grid">
            ${opts.map(o=>`<button class="gm-ans-btn" onclick="GM._tdAns(this,'${esc(o)}','${esc(correctAns)}')">${esc(o)}</button>`).join('')}
        </div>
    </div>`;
}
function _tdAns(btn,ans,correct){
    const area=$id('gm-area');
    area.querySelectorAll('.gm-ans-btn').forEach(b=>b.disabled=true);
    if(ans===correct){
        btn.classList.add('gm-ans-correct'); _td.streak++;
        const multiplier=Math.min(3,Math.floor(_td.streak/3)+1);
        const pts=2*multiplier; _td.xp+=pts; _td.ok++;
        gmToast(`✅ +${pts} XP ${_td.streak>=3?'🔥':''}`, 'ok');
        const sk=$id('gm-td-streak'); if(sk) sk.textContent=_td.streak;
        const ok=$id('gm-td-ok'); if(ok) ok.textContent=_td.ok;
        const xp=$id('gm-td-xp'); if(xp) xp.textContent=_td.xp;
    } else {
        btn.classList.add('gm-ans-wrong'); _td.streak=0;
        area.querySelectorAll('.gm-ans-btn').forEach(b=>{if(b.textContent===correct)b.classList.add('gm-ans-correct');});
        gmToast(`❌ ${_td._dir==='tr2en'?_td._w.tr:_td._w.eng} → ${correct}`,'err',2200);
        const sk=$id('gm-td-streak'); if(sk) sk.textContent=0;
    }
    _td.i++; setTimeout(_tdNext,1300);
}

// ══════════════════════════════════════════════════════
// OYUN 9: SEVİYE HARİTASI 📊
// ══════════════════════════════════════════════════════
function startLevelMap(listName){
    const pool=getPool(listName); if(!pool.length){ gmToast('Liste boş!','err'); return; }
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Seviye Haritası','📊','#14b8a6');
    const aw=pg.querySelector('.gm-area-wrap'); if(aw) aw.classList.add('gm-area-full');
    const area=$id('gm-area'); if(!area) return;

    // Gruplandır
    const groups={ '🏆 Ustalaştı':[], '🟡 Öğreniliyor':[], '🔴 Zor':[], '🆕 Yeni':[] };
    pool.forEach(w=>{
        const lv=wordLevel(w);
        if(lv.icon==='🏆') groups['🏆 Ustalaştı'].push(w);
        else if(lv.icon==='🟡') groups['🟡 Öğreniliyor'].push(w);
        else if(lv.icon==='🔴') groups['🔴 Zor'].push(w);
        else groups['🆕 Yeni'].push(w);
    });

    const total=pool.length;
    const mastered=groups['🏆 Ustalaştı'].length;
    const pct=Math.round(mastered/total*100);

    let html=`<div style="padding:16px;">
        <div style="background:linear-gradient(135deg,#0d9488,#14b8a6);border-radius:16px;padding:16px;color:white;margin-bottom:16px;text-align:center;">
            <div style="font-size:.78rem;font-weight:800;opacity:.85;margin-bottom:4px;">${listName} — Genel İlerleme</div>
            <div style="font-size:2.2rem;font-weight:900;margin-bottom:4px;">${pct}%</div>
            <div style="height:8px;background:rgba(255,255,255,.25);border-radius:8px;overflow:hidden;margin:0 20px;">
                <div style="height:100%;width:${pct}%;background:white;border-radius:8px;transition:width 1s;"></div>
            </div>
            <div style="font-size:.72rem;margin-top:6px;opacity:.85;">${mastered}/${total} kelime ustalaşıldı</div>
        </div>`;

    Object.entries(groups).forEach(([label,words])=>{
        if(!words.length) return;
        const color=label.includes('🏆')?'#16a34a':label.includes('🟡')?'#f59e0b':label.includes('🔴')?'#e63946':'#6366f1';
        const cards=words.map(w=>`
            <div style="background:white;border-radius:12px;padding:10px 12px;border-left:4px solid ${color};display:flex;align-items:center;gap:10px;cursor:pointer;" onclick="GM._lvFlip(this,'${esc(w.eng)}','${esc(w.tr)}')">
                <div style="flex:1;">
                    <div style="font-weight:800;font-size:.9rem;color:var(--ink);">${esc(w.eng)}</div>
                    <div class="gm-lv-tr" style="font-size:.75rem;color:var(--ink3);display:none;">${esc(w.tr)}</div>
                </div>
                <div style="font-size:.65rem;font-weight:800;background:${color}18;color:${color};padding:3px 8px;border-radius:20px;">${w.errorCount||0}❌ ${w.correctStreak||0}✅</div>
            </div>`).join('');
        html+=`<div style="margin-bottom:14px;">
            <div style="font-size:.78rem;font-weight:800;color:${color};margin-bottom:8px;display:flex;align-items:center;gap:6px;">
                <span>${label}</span><span style="background:${color}15;padding:2px 10px;border-radius:20px;">${words.length} kelime</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:6px;">${cards}</div>
        </div>`;
    });

    // Zor kelimelere odaklan butonu
    const hardWords=groups['🔴 Zor'];
    if(hardWords.length>=4){
        html+=`<button class="gm-btn-pri" style="width:100%;margin-top:8px;" onclick="GM._lvPractice()">🎯 Zor Kelimeleri Pratik Et (${hardWords.length})</button>`;
    }
    html+='</div>';
    area.innerHTML=html;
    // Streak verisi için
    window._lvHardWords=hardWords;
}
function _lvFlip(el,eng,tr){
    const trEl=el.querySelector('.gm-lv-tr');
    if(trEl) trEl.style.display=trEl.style.display==='none'?'block':'none';
}
function _lvPractice(){
    const words=window._lvHardWords;
    if(!words||words.length<4) return;
    // Mini quiz - zor kelimelerle Flash Race başlat
    const tmpList='__zor_kelimeler__';
    allData[tmpList]=words;
    startFlashRace(tmpList);
}

// ══════════════════════════════════════════════════════
// OYUN 10: SPELLING BEE PRO 🐝
// Web Speech Synthesis ile sesli telaffuz
// ══════════════════════════════════════════════════════
let _sp={};
function startSpellingPro(listName){
    const pool=requirePool(listName,4); if(!pool) return;
    const pg=$id('games-page');
    pg.innerHTML=gameShell('Spelling Bee Pro','🐝','#a855f7',
        `<div class="gm-rf-hud">✅ <span id="gm-sp-ok">0</span>/<span id="gm-sp-tot">0</span> &nbsp; ❤️ <span id="gm-sp-lives">3</span></div>`);
    _sp.pool=shuffle(pool); _sp.i=0; _sp.ok=0; _sp.lives=3;
    $id('gm-sp-tot').textContent=Math.min(_sp.pool.length,10);
    _spNext();
}
function _spSpeak(word,btn){
    if(!window.speechSynthesis){ gmToast('Tarayıcınız sesi desteklemiyor','err'); return; }
    window.speechSynthesis.cancel();
    const utt=new SpeechSynthesisUtterance(word);
    utt.lang='en-US'; utt.rate=0.8; utt.pitch=1;
    if(btn){ btn.classList.add('gm-sp-speaking'); utt.onend=()=>btn.classList.remove('gm-sp-speaking'); }
    window.speechSynthesis.speak(utt);
}
function _spNext(){
    if(_sp.i>=10||_sp.i>=_sp.pool.length||_sp.lives<=0){
        showResult({correct:_sp.ok,total:Math.min(_sp.i,10),xp:_sp.ok*5,onReplay:`GM.start('spelling')`});
        return;
    }
    const w=_sp.pool[_sp.i]; _sp._w=w; _sp._hints=0;
    const area=$id('gm-area'); if(!area) return;
    const blanks=w.eng.split('').map((_,i)=>`<div id="spb${i}" class="gm-sp-blank">_</div>`).join('');
    area.innerHTML=`<div style="padding:16px;">
        <div class="gm-prog-bar-wrap"><div class="gm-prog-bar" style="width:${(_sp.i/Math.min(_sp.pool.length,10))*100}%"></div></div>
        <div class="gm-sp-card">
            <div style="font-size:.8rem;font-weight:700;color:var(--ink3);margin-bottom:12px;text-align:center;">Sesi duy, kelimeyi yaz 👂</div>
            <button id="gm-sp-btn" class="gm-sp-listen-btn" onclick="GM._spListen(this)">
                🔊 Dinle
            </button>
            <div style="font-size:.72rem;color:var(--ink3);margin:8px 0 14px;text-align:center;">Tekrar duymak için tıkla</div>
            <div style="background:var(--bg);border-radius:12px;padding:10px;text-align:center;margin-bottom:14px;">
                <div style="font-size:.72rem;font-weight:700;color:var(--ink3);">Türkçe:</div>
                <div style="font-size:1.1rem;font-weight:900;color:var(--ink);">${esc(w.tr)}</div>
            </div>
            <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;">${blanks}</div>
            <div style="display:flex;gap:8px;margin-bottom:10px;">
                <input id="gm-sp-inp" class="gm-inp" type="text" placeholder="Kelimeyi yaz..." autocomplete="off" autocorrect="off" spellcheck="false">
                <button class="gm-btn-pri" onclick="GM._spCheck()" style="flex-shrink:0;padding:0 20px;">✓</button>
            </div>
            <button class="gm-btn-sec" onclick="GM._spHint()" style="width:100%;font-size:.82rem;padding:10px;">💡 İpucu (harf göster)</button>
        </div>
    </div>`;
    setTimeout(()=>{ const b=$id('gm-sp-btn'); if(b) _spSpeak(w.eng,b); },400);
    setTimeout(()=>{ const i=$id('gm-sp-inp'); if(i) i.focus(); },500);
}
function _spListen(btn){ _spSpeak(_sp._w.eng,btn); }
function _spHint(){
    const w=_sp._w;
    if(_sp._hints<Math.ceil(w.eng.length/2)){
        const el=$id('spb'+_sp._hints);
        if(el){ el.textContent=w.eng[_sp._hints].toUpperCase(); el.style.background='linear-gradient(135deg,#a855f7,#7c3aed)'; el.style.color='white'; el.style.border='none'; }
        _sp._hints++;
    } else gmToast('Tüm ipuçları kullandın!','err');
}
function _spCheck(){
    const inp=$id('gm-sp-inp'); if(!inp) return;
    const v=inp.value.trim().toLowerCase(), w=_sp._w;
    if(!v) return;
    if(v===w.eng.toLowerCase()){
        gmToast('✅ Doğru yazdın!','ok'); _sp.ok++;
        const ok=$id('gm-sp-ok'); if(ok) ok.textContent=_sp.ok;
        // Doğru harfleri göster
        w.eng.split('').forEach((l,i)=>{ const el=$id('spb'+i); if(el){el.textContent=l.toUpperCase();el.style.background='linear-gradient(135deg,#22c55e,#16a34a)';el.style.color='white';el.style.border='none';} });
    } else {
        gmToast(`❌ Yanlış! Doğrusu: ${w.eng}`,'err',2500);
        _sp.lives--;
        const lv=$id('gm-sp-lives'); if(lv) lv.textContent=_sp.lives;
        w.eng.split('').forEach((l,i)=>{ const el=$id('spb'+i); if(el){el.textContent=l.toUpperCase();el.style.background='linear-gradient(135deg,#e63946,#dc2626)';el.style.color='white';el.style.border='none';} });
    }
    _sp.i++; setTimeout(_spNext,1400);
}

// ══════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════
return {
    showGamesPage, start, renderHub,
    _tag, _reload, _back,
    // Memory
    _memClick,
    // Anagram
    _agAdd, _agRm, _agClear, _agCheck,
    // Hangman
    _hgGuess,
    // Flash Race
    _frAns,
    // Sentence Builder
    _sbAdd, _sbRm, _sbCheck,
    // Fill Blank
    _fbAns,
    // Translate Duel
    _tdAns,
    // Level Map
    _lvFlip, _lvPractice,
    // Spelling Pro
    _spListen, _spHint, _spCheck,
};
})();

// Global köprüler — motor.js uyumluluğu
function showGamesPage(){ GM.showGamesPage(); }
function startMemoryGame(listName){ window._gmCurrentList=listName||window._gmCurrentList; GM.start('memory'); }
function exitMemoryGame(){ GM._back(); }
