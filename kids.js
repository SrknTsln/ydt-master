const KW = (() => {

const WORLDS = {
    animals:{name:'Animals',icon:'🐾',words:[
        {en:'cat',tr:'kedi',emoji:'🐱'},{en:'dog',tr:'köpek',emoji:'🐶'},
        {en:'bird',tr:'kuş',emoji:'🐦'},{en:'fish',tr:'balık',emoji:'🐟'},
        {en:'horse',tr:'at',emoji:'🐴'},{en:'cow',tr:'inek',emoji:'🐮'},
        {en:'sheep',tr:'koyun',emoji:'🐑'},{en:'duck',tr:'ördek',emoji:'🦆'},
        {en:'frog',tr:'kurbağa',emoji:'🐸'},{en:'rabbit',tr:'tavşan',emoji:'🐰'},
        {en:'lion',tr:'aslan',emoji:'🦁'},{en:'elephant',tr:'fil',emoji:'🐘'}
    ],sentences:[
        {en:['The','cat','is','small'],tr:'Kedi küçük.'},
        {en:['I','have','a','dog'],tr:'Benim bir köpeğim var.'},
        {en:['The','bird','can','fly'],tr:'Kuş uçabilir.'},
        {en:['The','fish','is','in','water'],tr:'Balık suda.'},
        {en:['A','lion','is','big'],tr:'Aslan büyük.'},
        {en:['The','rabbit','is','white'],tr:'Tavşan beyaz.'}
    ]},
    colors:{name:'Colors',icon:'🎨',words:[
        {en:'red',tr:'kırmızı',emoji:'🔴'},{en:'blue',tr:'mavi',emoji:'🔵'},
        {en:'green',tr:'yeşil',emoji:'🟢'},{en:'yellow',tr:'sarı',emoji:'🟡'},
        {en:'orange',tr:'turuncu',emoji:'🟠'},{en:'purple',tr:'mor',emoji:'🟣'},
        {en:'white',tr:'beyaz',emoji:'⬜'},{en:'black',tr:'siyah',emoji:'⬛'},
        {en:'pink',tr:'pembe',emoji:'🩷'},{en:'brown',tr:'kahverengi',emoji:'🟤'}
    ],sentences:[
        {en:['The','sky','is','blue'],tr:'Gökyüzü mavi.'},
        {en:['I','like','red','apples'],tr:'Kırmızı elmaları severim.'},
        {en:['The','grass','is','green'],tr:'Çimen yeşil.'},
        {en:['She','has','a','pink','bag'],tr:'Onun pembe bir çantası var.'},
        {en:['The','sun','is','yellow'],tr:'Güneş sarı.'},
        {en:['My','dog','is','black'],tr:'Köpeğim siyah.'}
    ]},
    numbers:{name:'Numbers',icon:'🔢',words:[
        {en:'one',tr:'bir',emoji:'1️⃣'},{en:'two',tr:'iki',emoji:'2️⃣'},
        {en:'three',tr:'üç',emoji:'3️⃣'},{en:'four',tr:'dört',emoji:'4️⃣'},
        {en:'five',tr:'beş',emoji:'5️⃣'},{en:'six',tr:'altı',emoji:'6️⃣'},
        {en:'seven',tr:'yedi',emoji:'7️⃣'},{en:'eight',tr:'sekiz',emoji:'8️⃣'},
        {en:'nine',tr:'dokuz',emoji:'9️⃣'},{en:'ten',tr:'on',emoji:'🔟'}
    ],sentences:[
        {en:['I','have','two','cats'],tr:'İki kedim var.'},
        {en:['She','is','five','years','old'],tr:'O beş yaşında.'},
        {en:['I','see','three','birds'],tr:'Üç kuş görüyorum.'},
        {en:['He','has','ten','books'],tr:'Onun on kitabı var.'},
        {en:['There','are','six','apples'],tr:'Altı elma var.'},
        {en:['We','have','four','legs'],tr:'Dört bacağımız var.'}
    ]},
    food:{name:'Food',icon:'🍕',words:[
        {en:'apple',tr:'elma',emoji:'🍎'},{en:'bread',tr:'ekmek',emoji:'🍞'},
        {en:'milk',tr:'süt',emoji:'🥛'},{en:'egg',tr:'yumurta',emoji:'🥚'},
        {en:'water',tr:'su',emoji:'💧'},{en:'cake',tr:'pasta',emoji:'🎂'},
        {en:'pizza',tr:'pizza',emoji:'🍕'},{en:'rice',tr:'pirinç',emoji:'🍚'},
        {en:'cheese',tr:'peynir',emoji:'🧀'},{en:'orange',tr:'portakal',emoji:'🍊'},
        {en:'banana',tr:'muz',emoji:'🍌'},{en:'cookie',tr:'kurabiye',emoji:'🍪'}
    ],sentences:[
        {en:['I','eat','an','apple'],tr:'Elma yerim.'},
        {en:['She','drinks','milk'],tr:'O süt içer.'},
        {en:['We','love','pizza'],tr:'Pizzayı severiz.'},
        {en:['The','cake','is','sweet'],tr:'Pasta tatlı.'},
        {en:['I','want','some','bread'],tr:'Biraz ekmek istiyorum.'},
        {en:['He','eats','rice','every','day'],tr:'Her gün pirinç yer.'}
    ]},
    school:{name:'School',icon:'✏️',words:[
        {en:'pen',tr:'kalem',emoji:'🖊️'},{en:'pencil',tr:'kurşun kalem',emoji:'✏️'},
        {en:'book',tr:'kitap',emoji:'📚'},{en:'bag',tr:'çanta',emoji:'🎒'},
        {en:'ruler',tr:'cetvel',emoji:'📏'},{en:'eraser',tr:'silgi',emoji:'🧹'},
        {en:'scissors',tr:'makas',emoji:'✂️'},{en:'notebook',tr:'defter',emoji:'📓'},
        {en:'teacher',tr:'öğretmen',emoji:'👩‍🏫'},{en:'desk',tr:'masa',emoji:'🪑'}
    ],sentences:[
        {en:['I','have','a','book'],tr:'Kitabım var.'},
        {en:['She','uses','a','pencil'],tr:'O kurşun kalem kullanır.'},
        {en:['My','bag','is','heavy'],tr:'Çantam ağır.'},
        {en:['The','teacher','is','kind'],tr:'Öğretmen nazik.'},
        {en:['I','need','an','eraser'],tr:'Bir silgiye ihtiyacım var.'},
        {en:['He','reads','the','book'],tr:'O kitabı okur.'}
    ]},
    body:{name:'Body Parts',icon:'🙌',words:[
        {en:'head',tr:'baş',emoji:'🗣️'},{en:'eye',tr:'göz',emoji:'👁️'},
        {en:'nose',tr:'burun',emoji:'👃'},{en:'mouth',tr:'ağız',emoji:'👄'},
        {en:'ear',tr:'kulak',emoji:'👂'},{en:'hand',tr:'el',emoji:'🤚'},
        {en:'foot',tr:'ayak',emoji:'🦶'},{en:'leg',tr:'bacak',emoji:'🦵'},
        {en:'arm',tr:'kol',emoji:'💪'},{en:'tooth',tr:'diş',emoji:'🦷'}
    ],sentences:[
        {en:['I','have','two','eyes'],tr:'İki gözüm var.'},
        {en:['She','has','big','ears'],tr:'Onun büyük kulakları var.'},
        {en:['My','hand','is','small'],tr:'Elim küçük.'},
        {en:['He','hurt','his','leg'],tr:'Bacağını incitti.'},
        {en:['Wash','your','hands'],tr:'Ellerini yıka.'},
        {en:['My','tooth','hurts'],tr:'Dişim acıyor.'}
    ]}
};

const BADGES = [
    {id:'first_game',icon:'🎮',name:'İlk Oyun!',cond:p=>Object.keys(p.wp||{}).length>=1},
    {id:'ten_xp',icon:'⭐',name:'10 XP',cond:p=>p.xp>=10},
    {id:'fifty_xp',icon:'🌟',name:'50 XP',cond:p=>p.xp>=50},
    {id:'hundred_xp',icon:'💫',name:'100 XP',cond:p=>p.xp>=100},
    {id:'perfect',icon:'🎯',name:'Nişancı!',cond:p=>p.perf},
    {id:'memwin',icon:'🃏',name:'Hafıza Ustası',cond:p=>p.memw},
    {id:'bee',icon:'🐝',name:'Arı Kraliçe',cond:p=>p.bee},
    {id:'builder',icon:'🧩',name:'İnşaatçı',cond:p=>p.bld},
    {id:'worlds2',icon:'🌏',name:'Kaşif',cond:p=>Object.keys(p.wp||{}).length>=2},
    {id:'worldsall',icon:'🌍',name:'Dünya Ustası',cond:p=>Object.keys(p.wp||{}).length>=6},
    {id:'streak3',icon:'🔥',name:'Ateş!',cond:p=>p.streak>=3},
    {id:'level5',icon:'🏆',name:'Şampiyon!',cond:p=>p.level>=5}
];

let P = JSON.parse(localStorage.getItem('ww_p')) || {
    name:'',xp:0,level:1,lives:5,ml:5,streak:0,
    lastPlay:null,badges:[],ws:{},wp:{},
    perf:false,memw:false,bee:false,bld:false
};
let CW=null, CFn=null, wm={}, pq={}, mem={}, sp={}, sb_={};

function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a,n){return shuffle(a).slice(0,n);}
function xpL(l){return l*50;}
function txpL(l){let t=0;for(let i=1;i<l;i++)t+=xpL(i);return t;}
function save(){localStorage.setItem('ww_p',JSON.stringify(P));}
function $id(id){return document.getElementById(id);}

// ── OPEN ──
function open(){
    const today=new Date().toDateString();
    if(P.lastPlay){
        const last=new Date(P.lastPlay).toDateString();
        const yest=new Date(Date.now()-86400000).toDateString();
        if(last===yest&&last!==today)P.streak++;
        else if(last!==today&&last!==yest)P.streak=1;
    }else P.streak=1;
    P.lastPlay=Date.now();
    // lives regen
    if(P.lives<P.ml){
        const r=Math.floor((Date.now()-(P.lastLR||Date.now()))/(5*60*1000));
        if(r>0){P.lives=Math.min(P.ml,P.lives+r);P.lastLR=Date.now();}
    }
    save();

    // Hide all other pages
    document.querySelectorAll('.container').forEach(c=>c.classList.add('hidden'));
    document.querySelectorAll('.arsiv-full-page').forEach(c=>c.classList.add('hidden'));
    const pg=$id('kids-page');
    if(pg)pg.classList.remove('hidden');

    // Nav active
    document.querySelectorAll('.sb-btn,.mob-drawer-btn').forEach(e=>e.classList.remove('active'));
    ['sb-kids','di-kids'].forEach(id=>{const e=$id(id);if(e)e.classList.add('active');});

    render(P.name?'home':'name');
}

// ── RENDER ──
function render(view, data){
    const pg=$id('kids-page');
    if(!pg)return;
    let html='';
    if(view==='name')    html=vName();
    else if(view==='home')    html=vHome();
    else if(view==='world')   html=vWorld(data);
    else if(view==='wm')      {html=vGame('Word Match 🎯');setTimeout(startWM,10);}
    else if(view==='pq')      {html=vGame('Picture Quiz 🖼️');setTimeout(startPQ,10);}
    else if(view==='memory')  {html=vMem();setTimeout(startMem,10);}
    else if(view==='spell')   {html=vGame('Spelling Bee 🐝');setTimeout(startSpell,10);}
    else if(view==='sentence'){html=vGame('Sentence Builder 🧩');setTimeout(startSent,10);}
    else if(view==='badges')  html=vBadges();
    else if(view==='result')  html=vResult(data);
    pg.innerHTML=`<div class="kw-inner">${html}</div>`;
    pg.scrollTop=0;
}

// ── HUD ──
function hud(){
    const lvl=P.level, xpIn=P.xp-txpL(lvl), pct=Math.min(100,Math.round(xpIn/xpL(lvl)*100));
    let hearts='';
    for(let i=0;i<P.ml;i++) hearts+=`<span style="font-size:1.1rem;opacity:${i<P.lives?1:.25}">❤️</span>`;
    return `<div class="kw-hud">
        <div style="display:flex;gap:2px;">${hearts}</div>
        <div style="flex:1;">
            <div style="font-family:'Fredoka One',cursive;font-size:.75rem;color:#5C6BC0;margin-bottom:3px;">Seviye ${lvl}</div>
            <div style="height:8px;background:#E8EAF6;border-radius:8px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#7E57C2,#AB47BC);border-radius:8px;"></div>
            </div>
        </div>
        <div style="font-family:'Fredoka One',cursive;color:#FF7043;">🔥 ${P.streak}</div>
    </div>`;
}
function back(v,d){return `<button class="kw-back" onclick="KW._go('${v}'${d?`,'${d}'`:''})">← Geri</button>`;}
function prog(id,i,n,liv,ml){
    const hrt=liv!=null?`<span>${'❤️'.repeat(liv)+'🖤'.repeat((ml||3)-liv)}</span>`:'';
    return `<div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;font-size:.72rem;font-weight:800;color:#5C6BC0;margin-bottom:4px;"><span>Soru ${i+1}/${n}</span>${hrt}</div>
        <div style="height:8px;background:#E8EAF6;border-radius:8px;overflow:hidden;"><div id="${id}" style="height:100%;width:${i/n*100}%;background:linear-gradient(90deg,#4FC3F7,#7E57C2);border-radius:8px;transition:width .5s;"></div></div>
    </div>`;
}

// ── VIEWS ──
function vName(){
    return `${hud()}<div class="kw-card kw-center" style="max-width:480px;margin:0 auto;">
        <div style="font-size:5rem;animation:kwBounce 2s infinite;display:block;margin-bottom:4px;">🦄</div>
        <div class="kw-title-grad">WordWorld!</div>
        <div style="color:#5C6BC0;font-weight:700;margin-bottom:20px;">İngilizce öğrenmenin en eğlenceli yolu!</div>
        <input class="kw-input" id="kw-ni" type="text" placeholder="Adını yaz..." maxlength="12" style="text-align:center;font-size:1.1rem;margin-bottom:14px;">
        <button class="kw-btn-primary" onclick="KW._name()" style="width:100%;font-size:1.05rem;padding:15px;">🚀 Maceraya Başla!</button>
    </div>`;
}

function vHome(){
    const ranks=[[0,'🌱 Başlangıç'],[50,'🌿 Öğrenci'],[150,'🌸 Gelişiyor'],[300,'⚡ Usta'],[500,'🌟 Uzman'],[1000,'🏆 Efsane']];
    let rank=ranks[0][1]; for(const[t,r]of ranks)if(P.xp>=t)rank=r;
    const cm={animals:'#E8F5E9,#C8E6C9,#A5D6A7',colors:'#FFF3E0,#FFE0B2,#FFCC80',
        numbers:'#E3F2FD,#BBDEFB,#90CAF9',food:'#FCE4EC,#F8BBD0,#F48FB1',
        school:'#EDE7F6,#D1C4E9,#B39DDB',body:'#E0F7FA,#B2EBF2,#80DEEA'};
    const wc=Object.entries(WORLDS).map(([wid,w])=>{
        const s=P.ws[wid]||0, [c1,c2,cb]=cm[wid].split(',');
        return `<div class="kw-world-card" style="background:linear-gradient(135deg,${c1},${c2});border-color:${cb};" onclick="KW._go('world','${wid}')">
            <div style="font-size:2.5rem;margin-bottom:6px;">${w.icon}</div>
            <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#1A237E;">${w.name}</div>
            <div style="font-size:.65rem;color:#5C6BC0;font-weight:700;">${w.words.length} kelime</div>
            <div style="font-size:.9rem;letter-spacing:2px;margin-top:4px;">${'★'.repeat(s)+'☆'.repeat(3-s)}</div>
        </div>`;
    }).join('');
    return `${hud()}
    <div class="kw-card kw-center" style="margin-bottom:18px;">
        <div style="font-size:3.5rem;animation:kwBounce 2s infinite;display:block;margin-bottom:4px;">🦄</div>
        <div class="kw-title-grad" style="font-size:1.9rem;">Merhaba, ${P.name}! 👋</div>
        <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:8px;">
            <span class="kw-badge-pill" style="background:linear-gradient(135deg,#7E57C2,#AB47BC);">${rank}</span>
            <span class="kw-badge-pill" style="background:linear-gradient(135deg,#FF7043,#FF5722);">⭐ ${P.xp} XP</span>
        </div>
    </div>
    <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#5C6BC0;margin-bottom:12px;">🌍 Dünyaları Keşfet</div>
    <div class="kw-world-grid">${wc}</div>
    <button class="kw-btn-secondary" style="width:100%;margin-top:8px;" onclick="KW._go('badges')">🏆 Rozetlerim</button>`;
}

function vWorld(wid){
    const w=WORLDS[wid];
    const modes=[
        {icon:'🎯',n:'Word Match',d:'Kelimeyi doğru çeviriyle eşleştir',xp:'+10 XP',v:'wm',mi:'mi-match'},
        {icon:'🖼️',n:'Picture Quiz',d:'Resmi gör, doğru kelimeyi seç',xp:'+10 XP',v:'pq',mi:'mi-pic'},
        {icon:'🃏',n:'Memory Flip',d:'Eşleşen İngilizce ↔ Türkçe kartları bul',xp:'+15 XP',v:'memory',mi:'mi-mem'},
        {icon:'🐝',n:'Spelling Bee',d:'Kelimeyi doğru yaz',xp:'+20 XP',v:'spell',mi:'mi-spell'},
        {icon:'🧩',n:'Sentence Builder',d:'Cümleyi doğru sıraya diz',xp:'+25 XP',v:'sentence',mi:'mi-build'},
    ].map(m=>`<button class="kw-mode-btn" onclick="KW._go('${m.v}')">
        <div class="kw-mode-icon ${m.mi}">${m.icon}</div>
        <div style="flex:1;text-align:left;">
            <div style="font-family:'Fredoka One',cursive;font-size:1.05rem;color:#1A237E;">${m.n}</div>
            <div style="font-size:.73rem;color:#5C6BC0;font-weight:700;margin-top:2px;">${m.d}</div>
        </div>
        <div style="font-size:.72rem;font-weight:800;color:#22c55e;background:#E8F5E9;padding:3px 10px;border-radius:20px;flex-shrink:0;">${m.xp}</div>
    </button>`).join('');
    return `${hud()}${back('home')}
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:22px;">
        <div><div style="font-family:'Fredoka One',cursive;font-size:1.6rem;color:#1A237E;">${w.name}</div>
        <div style="font-size:.76rem;color:#5C6BC0;font-weight:700;">${w.words.length} kelime • 5 oyun modu</div></div>
        <span style="font-size:2.6rem;margin-left:auto;">${w.icon}</span>
    </div>
    <div class="kw-modes">${modes}</div>`;
}

function vGame(title){
    return `${hud()}${back('world',CW)}
    <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#1A237E;margin-bottom:14px;">${title}</div>
    <div id="kw-ga"></div>`;
}
function vMem(){
    return `${hud()}${back('world',CW)}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#1A237E;">Memory Flip 🃏</div>
        <div id="kw-mp" style="font-size:.9rem;font-weight:800;color:#5C6BC0;">0/6 çift</div>
    </div>
    <div class="kw-mem-grid" id="kw-ga"></div>`;
}
function vBadges(){
    const g=BADGES.map(b=>{
        const ok=P.badges.includes(b.id);
        return `<div class="kw-badge-item${ok?'':' kw-badge-locked'}">
            <div style="font-size:2.2rem;margin-bottom:5px;">${b.icon}</div>
            <div style="font-size:.67rem;font-weight:800;color:#1A237E;">${b.name}</div>
        </div>`;
    }).join('');
    return `${hud()}${back('home')}
    <div style="font-family:'Fredoka One',cursive;font-size:1.4rem;color:#1A237E;margin-bottom:16px;">Rozetlerim 🏆</div>
    <div class="kw-badges-grid">${g}</div>`;
}
function vResult(d){
    const pct=d.total>0?d.correct/d.total:0, stars=pct>=.9?3:pct>=.6?2:pct>=.3?1:0;
    const em=['😢','😅','😊','🎉'],ti=['Tekrar Dene!','Fena Değil!','İyi İş!','Mükemmel!'];
    return `${hud()}<div class="kw-card kw-center" style="max-width:460px;margin:0 auto;">
        <div style="font-size:4.5rem;animation:kwBounce 2s infinite;display:block;margin-bottom:8px;">${em[stars]}</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.9rem;color:#1A237E;margin-bottom:4px;">${ti[stars]}</div>
        <div style="font-weight:800;color:#7E57C2;margin-bottom:12px;">+${d.xp} XP • ${d.correct}/${d.total} doğru</div>
        <div style="font-size:2rem;letter-spacing:6px;margin-bottom:22px;">${'⭐'.repeat(stars)+'☆'.repeat(3-stars)}</div>
        <div style="display:flex;gap:10px;">
            <button class="kw-btn-secondary" style="flex:1;" onclick="KW._go('world','${CW}')">🏠 Menü</button>
            <button class="kw-btn-primary" style="flex:1;" onclick="KW._replay()">🔄 Tekrar</button>
        </div>
    </div>`;
}

// ── XP / BADGES ──
function addXP(n){
    P.xp+=n; let lv=false;
    while(P.xp>=txpL(P.level+1)){P.level++;lv=true;}
    if(lv)toast(`🎊 Seviye ${P.level}!`,'good',3000);
    save(); chkBadges();
}
function chkBadges(){
    let nw=false;
    BADGES.forEach(b=>{
        if(!P.badges.includes(b.id)&&b.cond(P)){
            P.badges.push(b.id); nw=true;
            const bd=BADGES.find(x=>x.id===b.id);
            setTimeout(()=>toast(`🏆 Rozet: ${bd.icon} ${bd.name}`,'good',3000),800);
        }
    });
    if(nw)save();
}
function endGame(ok,tot,xp,flag){
    addXP(xp);
    if(flag){P[flag]=true;save();}
    const pv=P.ws[CW]||0, pct=tot>0?ok/tot:0;
    const s=pct>=.9?3:pct>=.6?2:pct>=.3?1:0;
    if(s>pv)P.ws[CW]=s;
    P.wp=P.wp||{}; P.wp[CW]=(P.wp[CW]||0)+1;
    save(); chkBadges();
    render('result',{correct:ok,total:tot,xp});
}

// ── TOAST ──
let _tt=null;
function toast(msg,cls='good',dur=1800){
    let t=$id('kw-toast');
    if(!t){t=document.createElement('div');t.id='kw-toast';t.className='kw-toast';document.body.appendChild(t);}
    clearTimeout(_tt);
    t.textContent=msg; t.className=`kw-toast kw-toast-${cls} kw-toast-show`;
    _tt=setTimeout(()=>t.classList.remove('kw-toast-show'),dur);
}
function xpPop(n){
    const e=document.createElement('div');
    e.textContent=`+${n} XP`;
    e.style.cssText='position:fixed;top:25%;left:50%;transform:translateX(-50%);z-index:9999;font-family:"Fredoka One",cursive;font-size:1.6rem;color:#FFD54F;text-shadow:0 2px 8px rgba(0,0,0,.3);pointer-events:none;animation:kwXpFloat 1.2s forwards;';
    document.body.appendChild(e);
    setTimeout(()=>e.remove(),1200);
}
// inject animation if not already
(()=>{if(!$id('kw-anim-style')){const s=document.createElement('style');s.id='kw-anim-style';s.textContent='@keyframes kwXpFloat{0%{opacity:1;transform:translateX(-50%) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-80px) scale(1.4)}}';document.head.appendChild(s);}})();

// ── NAV ──
function _go(v,d){if(d)CW=d;render(v,d);}
function _replay(){if(CFn)CFn();}
function _name(){
    const i=$id('kw-ni'), n=(i&&i.value.trim())||'';
    if(!n){if(i){i.style.borderColor='#ef4444';setTimeout(()=>i.style.borderColor='',800);}return;}
    P.name=n; save(); render('home');
}

// ── GAME 1: WORD MATCH ──
function startWM(){
    CFn=()=>render('wm'); CW=CW;
    wm.qs=shuffle(WORLDS[CW].words).slice(0,10);
    wm.i=0; wm.ok=0; wm.lives=3;
    rwm();
}
function rwm(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(wm.i>=wm.qs.length){endGame(wm.ok,wm.qs.length,Math.round(wm.ok*1.5),wm.ok===wm.qs.length?'perf':null);return;}
    if(wm.lives<=0){endGame(wm.ok,wm.qs.length,Math.round(wm.ok*.5));return;}
    const q=wm.qs[wm.i];
    const opts=shuffle([q,...shuffle(WORLDS[CW].words.filter(w=>w.en!==q.en)).slice(0,3)]);
    ga.innerHTML=`${prog('wm-p',wm.i,wm.qs.length,wm.lives,3)}
        <div class="kw-card"><div class="kw-q-word">${q.en}</div>
        <div style="text-align:center;font-size:.85rem;font-weight:700;color:#5C6BC0;">Türkçe karşılığı nedir?</div></div>
        <div class="kw-ans-grid" id="kw-opts"></div>`;
    const c=$id('kw-opts');
    opts.forEach(o=>{
        const b=document.createElement('button'); b.className='kw-ans-btn';
        b.innerHTML=`<span style="font-size:1.5rem;">${o.emoji}</span><span>${o.tr}</span>`;
        b.onclick=()=>{
            c.querySelectorAll('.kw-ans-btn').forEach(x=>x.onclick=null);
            if(o.en===q.en){b.classList.add('kw-ans-correct');wm.ok++;toast('✅ Doğru!');xpPop(2);}
            else{b.classList.add('kw-ans-wrong');wm.lives--;toast('❌ Yanlış!','bad');
                const cw=WORLDS[CW].words.find(w=>w.en===q.en);
                if(cw)c.querySelectorAll('.kw-ans-btn').forEach(x=>{if(x.textContent.includes(cw.tr))x.classList.add('kw-ans-correct');});}
            wm.i++; setTimeout(rwm,1100);
        };
        c.appendChild(b);
    });
}

// ── GAME 2: PICTURE QUIZ ──
function startPQ(){
    CFn=()=>render('pq');
    pq.qs=shuffle(WORLDS[CW].words).slice(0,10); pq.i=0; pq.ok=0;
    rpq();
}
function rpq(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(pq.i>=pq.qs.length){endGame(pq.ok,pq.qs.length,Math.round(pq.ok*1.5));return;}
    const q=pq.qs[pq.i];
    const opts=shuffle([q,...shuffle(WORLDS[CW].words.filter(w=>w.en!==q.en)).slice(0,3)]);
    ga.innerHTML=`${prog('pq-p',pq.i,pq.qs.length)}
        <div style="font-size:6rem;text-align:center;padding:18px;background:linear-gradient(135deg,#FFF3E0,#FCE4EC);border-radius:20px;margin-bottom:14px;animation:kwWordPop .4s cubic-bezier(.34,1.56,.64,1);">${q.emoji}</div>
        <div style="text-align:center;font-size:.9rem;font-weight:800;color:#5C6BC0;margin-bottom:14px;">Bu resim hangi kelime?</div>
        <div class="kw-ans-grid" id="kw-opts"></div>`;
    const c=$id('kw-opts');
    opts.forEach(o=>{
        const b=document.createElement('button'); b.className='kw-ans-btn'; b.style.fontSize='1.1rem'; b.textContent=o.en;
        b.onclick=()=>{
            c.querySelectorAll('.kw-ans-btn').forEach(x=>x.onclick=null);
            if(o.en===q.en){b.classList.add('kw-ans-correct');pq.ok++;toast('✅ Doğru!');xpPop(2);}
            else{b.classList.add('kw-ans-wrong');toast('❌ Yanlış!','bad');
                c.querySelectorAll('.kw-ans-btn').forEach(x=>{if(x.textContent===q.en)x.classList.add('kw-ans-correct');});}
            pq.i++; setTimeout(rpq,1100);
        };
        c.appendChild(b);
    });
}

// ── GAME 3: MEMORY ──
function startMem(){
    CFn=()=>render('memory');
    const words=pick(WORLDS[CW].words,6); let cards=[];
    words.forEach((w,i)=>{
        cards.push({id:i*2,pairId:i,text:w.en,type:'en',emoji:w.emoji});
        cards.push({id:i*2+1,pairId:i,text:w.tr,type:'tr'});
    });
    mem.cards=shuffle(cards); mem.m=0; mem.f=[]; mem.lk=false; mem.mv=0;
    const ga=$id('kw-ga'); if(!ga)return;
    ga.innerHTML='';
    mem.cards.forEach((_,i)=>{
        const d=document.createElement('div'); d.className='kw-mem-card';
        d.innerHTML=`<div class="kw-mem-f">?</div><div class="kw-mem-b">${mem.cards[i].type==='en'?mem.cards[i].emoji+' ':''}${mem.cards[i].text}</div>`;
        d.onclick=()=>fmem(i); ga.appendChild(d);
    });
}
function fmem(i){
    if(mem.lk)return;
    const cards=document.querySelectorAll('#kw-ga .kw-mem-card');
    const e=cards[i];
    if(!e||e.dataset.d==='1'||e.dataset.f==='1')return;
    e.dataset.f='1'; e.classList.add('kw-mem-flip');
    mem.f.push({i,card:mem.cards[i],el:e});
    if(mem.f.length===2){
        mem.lk=true; mem.mv++;
        const[a,b]=mem.f;
        if(a.card.pairId===b.card.pairId&&a.card.type!==b.card.type){
            setTimeout(()=>{
                [a.el,b.el].forEach(el=>{el.dataset.d='1';el.classList.add('kw-mem-match');el.classList.remove('kw-mem-flip');delete el.dataset.f;});
                mem.m++; mem.f=[]; mem.lk=false;
                const mp=$id('kw-mp'); if(mp)mp.textContent=`${mem.m}/${mem.cards.length/2} çift`;
                toast('✅ Eşleşti!'); xpPop(3);
                if(mem.m===mem.cards.length/2)endGame(mem.m,mem.m,Math.max(15,30-mem.mv),'memw');
            },400);
        }else{
            setTimeout(()=>{
                [a.el,b.el].forEach(el=>{el.classList.remove('kw-mem-flip');delete el.dataset.f;});
                mem.f=[]; mem.lk=false; toast('❌ Eşleşmedi!','bad');
            },900);
        }
    }
}

// ── GAME 4: SPELLING ──
function startSpell(){
    CFn=()=>render('spell');
    sp.qs=shuffle(WORLDS[CW].words).slice(0,8); sp.i=0; sp.ok=0; sp.lives=3; sp.hr=0;
    rsp();
}
function rsp(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(sp.i>=sp.qs.length||sp.lives<=0){endGame(sp.ok,Math.min(sp.i,sp.qs.length),sp.ok*3,sp.ok>=5?'bee':null);return;}
    const q=sp.qs[sp.i]; sp.hr=0;
    const tiles=q.en.split('').map((_,j)=>`<div id="st${j}" style="min-width:32px;height:38px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;font-family:'Fredoka One',cursive;font-size:1rem;background:white;border:2px dashed #C5CAE9;color:#C5CAE9;margin:2px;">_</div>`).join('');
    ga.innerHTML=`${prog('sp-p',sp.i,sp.qs.length,sp.lives,3)}
        <div class="kw-card">
            <div style="font-size:5rem;text-align:center;animation:kwBounce 2s infinite;margin-bottom:6px;">${q.emoji||'📝'}</div>
            <div style="text-align:center;font-size:.9rem;font-weight:700;color:#5C6BC0;margin-bottom:10px;">Bu resim <strong style="color:#7E57C2;">${q.tr}</strong> demek. İngilizce yaz:</div>
            <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;">${tiles}</div>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
                <input id="kw-si" class="kw-input" type="text" placeholder="Yaz..." autocomplete="off" autocorrect="off" spellcheck="false" style="text-align:center;font-family:'Fredoka One',cursive;font-size:1.3rem;flex:1;">
                <button class="kw-btn-primary" onclick="KW._csp()" style="width:52px;height:52px;border-radius:14px;padding:0;font-size:1.4rem;flex-shrink:0;">✓</button>
            </div>
            <button class="kw-btn-secondary" onclick="KW._sph()" style="width:100%;font-size:.85rem;padding:10px;">💡 İpucu</button>
        </div>`;
    setTimeout(()=>{const i=$id('kw-si');if(i)i.focus();},100);
}
function _sph(){
    const q=sp.qs[sp.i]; if(!q)return;
    if(sp.hr<Math.ceil(q.en.length/2)){
        const t=$id('st'+sp.hr);
        if(t){t.textContent=q.en[sp.hr];t.style.background='linear-gradient(135deg,#7E57C2,#AB47BC)';t.style.color='white';t.style.borderColor='transparent';}
        sp.hr++;
    }
}
function _csp(){
    const q=sp.qs[sp.i]; if(!q)return;
    const i=$id('kw-si'), v=(i&&i.value.trim().toLowerCase())||''; if(!v)return;
    if(v===q.en.toLowerCase()){toast('✅ Doğru yazdın!');xpPop(3);sp.ok++;}
    else{toast(`❌ Yanlış! Doğrusu: ${q.en}`,'bad');sp.lives--;
        q.en.split('').forEach((l,j)=>{const t=$id('st'+j);if(t){t.textContent=l;t.style.background='linear-gradient(135deg,#7E57C2,#AB47BC)';t.style.color='white';t.style.borderColor='transparent';}});}
    sp.i++; setTimeout(rsp,1200);
}

// ── GAME 5: SENTENCE ──
function startSent(){
    CFn=()=>render('sentence');
    sb_.qs=shuffle(WORLDS[CW].sentences).slice(0,6); sb_.i=0; sb_.ok=0; sb_.b=[]; sb_.bk=[];
    rsent();
}
function rsent(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(sb_.i>=sb_.qs.length){endGame(sb_.ok,sb_.qs.length,sb_.ok*5,sb_.ok>=3?'bld':null);return;}
    const q=sb_.qs[sb_.i]; sb_.b=[]; sb_.bk=shuffle([...q.en]); sb_._q=q;
    rsentState(q,ga);
}
function rsentState(q,ga){
    if(!q)q=sb_._q;
    if(!ga)ga=$id('kw-ga'); if(!ga)return;
    const dc=sb_.b.map((w,i)=>`<div class="kw-chip kw-chip-in" onclick="KW._srm(${i})">${w}</div>`).join('');
    const bk=sb_.bk.map((w,i)=>`<div class="kw-chip" onclick="KW._sad(${i})">${w}</div>`).join('');
    ga.innerHTML=`${prog('sb-p',sb_.i,sb_.qs.length)}
        <div class="kw-card">
            <div style="background:linear-gradient(135deg,#E3F2FD,#EDE7F6);border-radius:14px;padding:12px;margin-bottom:12px;text-align:center;font-size:.85rem;font-weight:700;color:#5C6BC0;">
                Türkçesi: <strong style="color:#7E57C2;">${q.tr}</strong>
            </div>
            <div style="font-size:.78rem;font-weight:700;color:#5C6BC0;margin-bottom:6px;">Kelimeleri doğru sıraya diz:</div>
            <div style="min-height:52px;border:2.5px dashed ${sb_.b.length?'#9FA8DA':'#C5CAE9'};border-radius:14px;padding:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px;background:#FAFAFE;">
                ${dc||'<span style="color:#C5CAE9;font-size:.8rem;font-weight:700;">Buraya ekle...</span>'}
            </div>
            <div style="font-size:.78rem;font-weight:700;color:#5C6BC0;margin-bottom:8px;">Kelimeler:</div>
            <div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px;">${bk}</div>
            <button class="kw-btn-primary" onclick="KW._ckst()" style="width:100%;">Kontrol Et ✓</button>
        </div>`;
}
function _sad(i){sb_.b.push(sb_.bk[i]);sb_.bk.splice(i,1);rsentState(sb_._q);}
function _srm(i){sb_.bk.push(sb_.b[i]);sb_.b.splice(i,1);rsentState(sb_._q);}
function _ckst(){
    const q=sb_._q, built=sb_.b.join(' '), correct=q.en.join(' ');
    if(built.toLowerCase()===correct.toLowerCase()){toast('✅ Mükemmel!');xpPop(5);sb_.ok++;}
    else toast(`❌ Yanlış! "${correct}"`, 'bad', 2500);
    sb_.i++; setTimeout(rsent,1400);
}

// ── KEYBOARD ──
document.addEventListener('keydown',e=>{
    const pg=$id('kids-page');
    if(!pg||pg.classList.contains('hidden'))return;
    if(e.key==='Enter'){
        if($id('kw-si'))_csp();
        else if($id('kw-ni'))_name();
    }
});

return {open,_go,_replay,_name,_csp,_sph,_sad,_srm,_ckst};
})();
