// ════════════════════════════════════════════════════════════════
// kids.js  —  WordWorld Kids Modülü  (Büyük Yenileme v2.0)
// 10 Dünya · 9 Oyun Modu · Günlük Görev · Listen & Speak
// ════════════════════════════════════════════════════════════════

const KW = (() => {

// ══════════════════════════════════════════════════════
// DÜNYALAR (10 kategori)
// ══════════════════════════════════════════════════════
const WORLDS = {
    animals:{name:'Animals',icon:'🐾',color:'#E8F5E9,#C8E6C9,#81C784',words:[
        {en:'cat',tr:'kedi',emoji:'🐱'},{en:'dog',tr:'köpek',emoji:'🐶'},
        {en:'bird',tr:'kuş',emoji:'🐦'},{en:'fish',tr:'balık',emoji:'🐟'},
        {en:'horse',tr:'at',emoji:'🐴'},{en:'cow',tr:'inek',emoji:'🐮'},
        {en:'sheep',tr:'koyun',emoji:'🐑'},{en:'duck',tr:'ördek',emoji:'🦆'},
        {en:'frog',tr:'kurbağa',emoji:'🐸'},{en:'rabbit',tr:'tavşan',emoji:'🐰'},
        {en:'lion',tr:'aslan',emoji:'🦁'},{en:'elephant',tr:'fil',emoji:'🐘'},
        {en:'butterfly',tr:'kelebek',emoji:'🦋'},{en:'penguin',tr:'penguen',emoji:'🐧'},
        {en:'tiger',tr:'kaplan',emoji:'🐯'}
    ],sentences:[
        {en:['The','cat','is','small'],tr:'Kedi küçük.'},
        {en:['I','have','a','dog'],tr:'Benim bir köpeğim var.'},
        {en:['The','bird','can','fly'],tr:'Kuş uçabilir.'},
        {en:['The','fish','is','in','water'],tr:'Balık suda.'},
        {en:['A','lion','is','big'],tr:'Aslan büyük.'},
        {en:['The','rabbit','is','white'],tr:'Tavşan beyaz.'},
        {en:['The','elephant','is','very','big'],tr:'Fil çok büyük.'},
        {en:['I','like','butterflies'],tr:'Kelebekleri severim.'}
    ]},

    colors:{name:'Colors',icon:'🎨',color:'#FFF3E0,#FFE0B2,#FFB74D',words:[
        {en:'red',tr:'kırmızı',emoji:'🔴'},{en:'blue',tr:'mavi',emoji:'🔵'},
        {en:'green',tr:'yeşil',emoji:'🟢'},{en:'yellow',tr:'sarı',emoji:'🟡'},
        {en:'orange',tr:'turuncu',emoji:'🟠'},{en:'purple',tr:'mor',emoji:'🟣'},
        {en:'white',tr:'beyaz',emoji:'⬜'},{en:'black',tr:'siyah',emoji:'⬛'},
        {en:'pink',tr:'pembe',emoji:'🩷'},{en:'brown',tr:'kahverengi',emoji:'🟤'},
        {en:'grey',tr:'gri',emoji:'🩶'},{en:'gold',tr:'altın sarısı',emoji:'🟨'}
    ],sentences:[
        {en:['The','sky','is','blue'],tr:'Gökyüzü mavi.'},
        {en:['I','like','red','apples'],tr:'Kırmızı elmaları severim.'},
        {en:['The','grass','is','green'],tr:'Çimen yeşil.'},
        {en:['She','has','a','pink','bag'],tr:'Onun pembe bir çantası var.'},
        {en:['The','sun','is','yellow'],tr:'Güneş sarı.'},
        {en:['My','dog','is','black'],tr:'Köpeğim siyah.'},
        {en:['I','want','a','purple','pen'],tr:'Mor bir kalem istiyorum.'},
        {en:['The','flower','is','orange'],tr:'Çiçek turuncu.'}
    ]},

    numbers:{name:'Numbers',icon:'🔢',color:'#E3F2FD,#BBDEFB,#64B5F6',words:[
        {en:'one',tr:'bir',emoji:'1️⃣'},{en:'two',tr:'iki',emoji:'2️⃣'},
        {en:'three',tr:'üç',emoji:'3️⃣'},{en:'four',tr:'dört',emoji:'4️⃣'},
        {en:'five',tr:'beş',emoji:'5️⃣'},{en:'six',tr:'altı',emoji:'6️⃣'},
        {en:'seven',tr:'yedi',emoji:'7️⃣'},{en:'eight',tr:'sekiz',emoji:'8️⃣'},
        {en:'nine',tr:'dokuz',emoji:'9️⃣'},{en:'ten',tr:'on',emoji:'🔟'},
        {en:'twenty',tr:'yirmi',emoji:'2️⃣0️⃣'},{en:'hundred',tr:'yüz',emoji:'💯'}
    ],sentences:[
        {en:['I','have','two','cats'],tr:'İki kedim var.'},
        {en:['She','is','five','years','old'],tr:'O beş yaşında.'},
        {en:['I','see','three','birds'],tr:'Üç kuş görüyorum.'},
        {en:['He','has','ten','books'],tr:'Onun on kitabı var.'},
        {en:['There','are','six','apples'],tr:'Altı elma var.'},
        {en:['I','count','to','twenty'],tr:'Yirmiye kadar sayıyorum.'},
        {en:['We','have','four','legs'],tr:'Dört bacağımız var.'},
        {en:['There','are','nine','planets'],tr:'Dokuz gezegen var.'}
    ]},

    food:{name:'Food',icon:'🍕',color:'#FCE4EC,#F8BBD0,#F06292',words:[
        {en:'apple',tr:'elma',emoji:'🍎'},{en:'bread',tr:'ekmek',emoji:'🍞'},
        {en:'milk',tr:'süt',emoji:'🥛'},{en:'egg',tr:'yumurta',emoji:'🥚'},
        {en:'water',tr:'su',emoji:'💧'},{en:'cake',tr:'pasta',emoji:'🎂'},
        {en:'pizza',tr:'pizza',emoji:'🍕'},{en:'rice',tr:'pirinç',emoji:'🍚'},
        {en:'cheese',tr:'peynir',emoji:'🧀'},{en:'orange',tr:'portakal',emoji:'🍊'},
        {en:'banana',tr:'muz',emoji:'🍌'},{en:'cookie',tr:'kurabiye',emoji:'🍪'},
        {en:'soup',tr:'çorba',emoji:'🍜'},{en:'chocolate',tr:'çikolata',emoji:'🍫'},
        {en:'strawberry',tr:'çilek',emoji:'🍓'}
    ],sentences:[
        {en:['I','eat','an','apple'],tr:'Elma yerim.'},
        {en:['She','drinks','milk'],tr:'O süt içer.'},
        {en:['We','love','pizza'],tr:'Pizzayı severiz.'},
        {en:['The','cake','is','sweet'],tr:'Pasta tatlı.'},
        {en:['I','want','some','bread'],tr:'Biraz ekmek istiyorum.'},
        {en:['He','eats','rice','every','day'],tr:'Her gün pirinç yer.'},
        {en:['I','love','chocolate'],tr:'Çikolatayı severim.'},
        {en:['She','has','a','banana'],tr:'Onun bir muzu var.'}
    ]},

    school:{name:'School',icon:'✏️',color:'#EDE7F6,#D1C4E9,#9575CD',words:[
        {en:'pen',tr:'kalem',emoji:'🖊️'},{en:'pencil',tr:'kurşun kalem',emoji:'✏️'},
        {en:'book',tr:'kitap',emoji:'📚'},{en:'bag',tr:'çanta',emoji:'🎒'},
        {en:'ruler',tr:'cetvel',emoji:'📏'},{en:'eraser',tr:'silgi',emoji:'⬜'},
        {en:'scissors',tr:'makas',emoji:'✂️'},{en:'notebook',tr:'defter',emoji:'📓'},
        {en:'teacher',tr:'öğretmen',emoji:'👩‍🏫'},{en:'desk',tr:'masa',emoji:'🪑'},
        {en:'board',tr:'tahta',emoji:'🟫'},{en:'glue',tr:'yapıştırıcı',emoji:'🧴'},
        {en:'paint',tr:'boya',emoji:'🎨'},{en:'clock',tr:'saat',emoji:'🕐'}
    ],sentences:[
        {en:['I','have','a','book'],tr:'Kitabım var.'},
        {en:['She','uses','a','pencil'],tr:'O kurşun kalem kullanır.'},
        {en:['My','bag','is','heavy'],tr:'Çantam ağır.'},
        {en:['The','teacher','is','kind'],tr:'Öğretmen nazik.'},
        {en:['I','need','an','eraser'],tr:'Bir silgiye ihtiyacım var.'},
        {en:['He','reads','the','book'],tr:'O kitabı okur.'},
        {en:['The','clock','is','on','the','wall'],tr:'Saat duvarda.'},
        {en:['I','draw','with','paint'],tr:'Boya ile çiziyorum.'}
    ]},

    body:{name:'Body Parts',icon:'🙌',color:'#E0F7FA,#B2EBF2,#4DD0E1',words:[
        {en:'head',tr:'baş',emoji:'🗣️'},{en:'eye',tr:'göz',emoji:'👁️'},
        {en:'nose',tr:'burun',emoji:'👃'},{en:'mouth',tr:'ağız',emoji:'👄'},
        {en:'ear',tr:'kulak',emoji:'👂'},{en:'hand',tr:'el',emoji:'🤚'},
        {en:'foot',tr:'ayak',emoji:'🦶'},{en:'leg',tr:'bacak',emoji:'🦵'},
        {en:'arm',tr:'kol',emoji:'💪'},{en:'tooth',tr:'diş',emoji:'🦷'},
        {en:'hair',tr:'saç',emoji:'💇'},{en:'finger',tr:'parmak',emoji:'☝️'},
        {en:'shoulder',tr:'omuz',emoji:'🫱'},{en:'knee',tr:'diz',emoji:'🦵'}
    ],sentences:[
        {en:['I','have','two','eyes'],tr:'İki gözüm var.'},
        {en:['She','has','big','ears'],tr:'Onun büyük kulakları var.'},
        {en:['My','hand','is','small'],tr:'Elim küçük.'},
        {en:['He','hurt','his','leg'],tr:'Bacağını incitti.'},
        {en:['Wash','your','hands'],tr:'Ellerini yıka.'},
        {en:['My','tooth','hurts'],tr:'Dişim acıyor.'},
        {en:['She','has','long','hair'],tr:'Onun uzun saçları var.'},
        {en:['I','can','move','my','fingers'],tr:'Parmaklarımı oynatabiliyorum.'}
    ]},

    family:{name:'Family',icon:'👨‍👩‍👧',color:'#FFF8E1,#FFECB3,#FFD54F',words:[
        {en:'mother',tr:'anne',emoji:'👩'},{en:'father',tr:'baba',emoji:'👨'},
        {en:'sister',tr:'kız kardeş',emoji:'👧'},{en:'brother',tr:'erkek kardeş',emoji:'👦'},
        {en:'grandmother',tr:'büyükanne',emoji:'👵'},{en:'grandfather',tr:'büyükbaba',emoji:'👴'},
        {en:'baby',tr:'bebek',emoji:'👶'},{en:'aunt',tr:'teyze/hala',emoji:'👩'},
        {en:'uncle',tr:'amca/dayı',emoji:'👨'},{en:'family',tr:'aile',emoji:'👨‍👩‍👧‍👦'},
        {en:'cousin',tr:'kuzen',emoji:'🧒'},{en:'son',tr:'oğul',emoji:'👦'},
        {en:'daughter',tr:'kız evlat',emoji:'👧'}
    ],sentences:[
        {en:['I','love','my','mother'],tr:'Annemi seviyorum.'},
        {en:['My','father','is','tall'],tr:'Babam uzun boylu.'},
        {en:['She','is','my','sister'],tr:'O benim kız kardeşim.'},
        {en:['He','is','my','brother'],tr:'O benim erkek kardeşim.'},
        {en:['My','grandmother','is','kind'],tr:'Büyükannem nazik.'},
        {en:['We','are','a','happy','family'],tr:'Biz mutlu bir aileyiz.'},
        {en:['The','baby','is','sleeping'],tr:'Bebek uyuyor.'},
        {en:['My','grandfather','tells','stories'],tr:'Büyükbabam hikaye anlatır.'}
    ]},

    transport:{name:'Transport',icon:'🚗',color:'#E8EAF6,#C5CAE9,#7986CB',words:[
        {en:'car',tr:'araba',emoji:'🚗'},{en:'bus',tr:'otobüs',emoji:'🚌'},
        {en:'train',tr:'tren',emoji:'🚂'},{en:'plane',tr:'uçak',emoji:'✈️'},
        {en:'bicycle',tr:'bisiklet',emoji:'🚲'},{en:'boat',tr:'tekne',emoji:'⛵'},
        {en:'truck',tr:'kamyon',emoji:'🚚'},{en:'taxi',tr:'taksi',emoji:'🚕'},
        {en:'helicopter',tr:'helikopter',emoji:'🚁'},{en:'rocket',tr:'roket',emoji:'🚀'},
        {en:'scooter',tr:'scooter',emoji:'🛴'},{en:'ship',tr:'gemi',emoji:'🚢'}
    ],sentences:[
        {en:['I','go','by','bus'],tr:'Otobüsle gidiyorum.'},
        {en:['The','car','is','fast'],tr:'Araba hızlı.'},
        {en:['We','ride','a','bicycle'],tr:'Bisiklete biniyoruz.'},
        {en:['The','plane','flies','high'],tr:'Uçak yüksekte uçar.'},
        {en:['The','train','is','long'],tr:'Tren uzun.'},
        {en:['He','drives','a','truck'],tr:'O kamyon sürer.'},
        {en:['The','rocket','goes','to','space'],tr:'Roket uzaya gider.'},
        {en:['She','takes','a','taxi'],tr:'O taksi alır.'}
    ]},

    weather:{name:'Weather',icon:'⛅',color:'#E1F5FE,#B3E5FC,#4FC3F7',words:[
        {en:'sun',tr:'güneş',emoji:'☀️'},{en:'rain',tr:'yağmur',emoji:'🌧️'},
        {en:'snow',tr:'kar',emoji:'❄️'},{en:'wind',tr:'rüzgar',emoji:'💨'},
        {en:'cloud',tr:'bulut',emoji:'☁️'},{en:'thunder',tr:'gök gürültüsü',emoji:'⛈️'},
        {en:'rainbow',tr:'gökkuşağı',emoji:'🌈'},{en:'fog',tr:'sis',emoji:'🌫️'},
        {en:'storm',tr:'fırtına',emoji:'🌪️'},{en:'hot',tr:'sıcak',emoji:'🥵'},
        {en:'cold',tr:'soğuk',emoji:'🥶'},{en:'warm',tr:'ılık',emoji:'🌤️'}
    ],sentences:[
        {en:['The','sun','is','shining'],tr:'Güneş parlıyor.'},
        {en:['It','is','raining','today'],tr:'Bugün yağmur yağıyor.'},
        {en:['I','love','snow'],tr:'Karı seviyorum.'},
        {en:['The','wind','is','strong'],tr:'Rüzgar kuvvetli.'},
        {en:['There','is','a','rainbow'],tr:'Gökkuşağı var.'},
        {en:['It','is','very','hot'],tr:'Çok sıcak.'},
        {en:['The','storm','is','coming'],tr:'Fırtına geliyor.'},
        {en:['I','wear','a','coat','in','winter'],tr:'Kışın mont giyerim.'}
    ]},

    sports:{name:'Sports',icon:'⚽',color:'#F3E5F5,#E1BEE7,#CE93D8',words:[
        {en:'football',tr:'futbol',emoji:'⚽'},{en:'basketball',tr:'basketbol',emoji:'🏀'},
        {en:'swimming',tr:'yüzme',emoji:'🏊'},{en:'running',tr:'koşma',emoji:'🏃'},
        {en:'tennis',tr:'tenis',emoji:'🎾'},{en:'volleyball',tr:'voleybol',emoji:'🏐'},
        {en:'cycling',tr:'bisiklet yarışı',emoji:'🚴'},{en:'boxing',tr:'boks',emoji:'🥊'},
        {en:'gymnastics',tr:'jimnastik',emoji:'🤸'},{en:'skiing',tr:'kayak',emoji:'⛷️'},
        {en:'baseball',tr:'beyzbol',emoji:'⚾'},{en:'golf',tr:'golf',emoji:'⛳'}
    ],sentences:[
        {en:['I','play','football'],tr:'Futbol oynuyorum.'},
        {en:['She','is','swimming'],tr:'O yüzüyor.'},
        {en:['He','runs','every','day'],tr:'Her gün koşuyor.'},
        {en:['We','play','basketball'],tr:'Basketbol oynuyoruz.'},
        {en:['I','love','tennis'],tr:'Tenisi seviyorum.'},
        {en:['She','does','gymnastics'],tr:'O jimnastik yapıyor.'},
        {en:['He','is','good','at','boxing'],tr:'Boksta iyi.'},
        {en:['They','go','skiing'],tr:'Onlar kayağa gidiyorlar.'}
    ]}
};

// ══════════════════════════════════════════════════════
// ROZETLER (20+)
// ══════════════════════════════════════════════════════
const BADGES = [
    {id:'first_game',   icon:'🎮', name:'İlk Oyun!',       cond:p=>Object.keys(p.wp||{}).length>=1},
    {id:'ten_xp',       icon:'⭐', name:'10 XP',            cond:p=>p.xp>=10},
    {id:'fifty_xp',     icon:'🌟', name:'50 XP',            cond:p=>p.xp>=50},
    {id:'hundred_xp',   icon:'💫', name:'100 XP',           cond:p=>p.xp>=100},
    {id:'fivehund_xp',  icon:'💥', name:'500 XP',           cond:p=>p.xp>=500},
    {id:'perfect',      icon:'🎯', name:'Nişancı!',         cond:p=>p.perf},
    {id:'memwin',       icon:'🃏', name:'Hafıza Ustası',    cond:p=>p.memw},
    {id:'bee',          icon:'🐝', name:'Arı Kraliçe',      cond:p=>p.bee},
    {id:'builder',      icon:'🧩', name:'İnşaatçı',         cond:p=>p.bld},
    {id:'scrambler',    icon:'🔤', name:'Harfçi',           cond:p=>p.scr},
    {id:'listener',     icon:'🎧', name:'İyi Dinleyici',    cond:p=>p.lst},
    {id:'speaker',      icon:'🗣️', name:'Konuşmacı',        cond:p=>p.spk},
    {id:'sorter',       icon:'🗂️', name:'Düzenli Düşünür',  cond:p=>p.srt},
    {id:'worlds2',      icon:'🌏', name:'Kaşif',            cond:p=>Object.keys(p.wp||{}).length>=2},
    {id:'worlds5',      icon:'🗺️', name:'Seyyah',           cond:p=>Object.keys(p.wp||{}).length>=5},
    {id:'worldsall',    icon:'🌍', name:'Dünya Ustası',     cond:p=>Object.keys(p.wp||{}).length>=10},
    {id:'streak3',      icon:'🔥', name:'3 Günlük Seri!',   cond:p=>p.streak>=3},
    {id:'streak7',      icon:'🌋', name:'Haftalık Ateş!',   cond:p=>p.streak>=7},
    {id:'level5',       icon:'🏆', name:'Şampiyon!',        cond:p=>p.level>=5},
    {id:'level10',      icon:'👑', name:'Efsane!',          cond:p=>p.level>=10},
    {id:'quest3',       icon:'📋', name:'Görev Uzmanı',     cond:p=>(p.questsDone||0)>=3},
    {id:'quest10',      icon:'🏅', name:'Görev Ustası',     cond:p=>(p.questsDone||0)>=10},
];

// ══════════════════════════════════════════════════════
// GÜNLÜK GÖREV ŞABLONLARı
// ══════════════════════════════════════════════════════
const QUEST_TEMPLATES = [
    {id:'play2',   icon:'🎮', text:'2 oyun tamamla',         type:'games',   target:2,  xpR:20},
    {id:'play5',   icon:'🎮', text:'5 oyun tamamla',         type:'games',   target:5,  xpR:40},
    {id:'wm3',     icon:'🎯', text:'Word Match 3 kez oyna',  type:'wm',      target:3,  xpR:25},
    {id:'spell80', icon:'🐝', text:'Spelling Bee\'de 6+ doğru yap',type:'spell80',target:6,xpR:30},
    {id:'mem2',    icon:'🃏', text:'Memory Flip 2 kez bitir',type:'mem',     target:2,  xpR:30},
    {id:'listen3', icon:'🎧', text:'Listen & Choose 3 kez oyna',type:'listen',target:3, xpR:25},
    {id:'scr3',    icon:'🔤', text:'Word Scramble 3 kez oyna',type:'scram',  target:3,  xpR:25},
    {id:'worlds3', icon:'🌍', text:'3 farklı dünyayı ziyaret et',type:'worlds',target:3,xpR:35},
    {id:'xp50',    icon:'⭐', text:'Bugün 50 XP kazan',      type:'dailyxp', target:50, xpR:50},
    {id:'perfect1',icon:'🎯', text:'Bir oyunu mükemmel bitir',type:'perfect', target:1, xpR:40},
];

// ══════════════════════════════════════════════════════
// PLAYER STATE
// ══════════════════════════════════════════════════════
let P = JSON.parse(localStorage.getItem('ww_p2')) || {
    name:'', xp:0, level:1, lives:5, ml:5, streak:0,
    lastPlay:null, lastLR:null, badges:[], ws:{}, wp:{},
    perf:false, memw:false, bee:false, bld:false,
    scr:false, lst:false, spk:false, srt:false,
    questsDone:0, dailyQuests:null, dailyQuestDate:'',
    dailyXP:0, totalGames:0, worldsVisited:{}
};

// Eski veri formatını destekle
if(!P.dailyQuests) P.dailyQuests=null;
if(!P.worldsVisited) P.worldsVisited={};
if(!P.totalGames) P.totalGames=0;
if(!P.questsDone) P.questsDone=0;

let CW=null, CFn=null;
let wm={}, pq={}, mem_={}, sp_={}, sb_={}, scr_={}, ls_={}, cat_={};

// ══════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pick(a,n){return shuffle(a).slice(0,n);}
function xpL(l){return l*60;}
function txpL(l){let t=0;for(let i=1;i<l;i++)t+=xpL(i);return t;}
function save(){
    localStorage.setItem('ww_p2', JSON.stringify(P));
    // allData'ya da yaz — Firebase sync için (debounced)
    if (typeof window.allData !== 'undefined') {
        window.allData.kidsPlayer = JSON.parse(JSON.stringify(P));
        clearTimeout(window._kwSyncTimer);
        window._kwSyncTimer = setTimeout(() => {
            if (typeof window._saveData === 'function') window._saveData();
        }, 2000); // 2 saniye bekle — sık kaydetmelerde Firebase flood olmasın
    }
}
function $id(id){return document.getElementById(id);}

// ══════════════════════════════════════════════════════
// GÜNLÜK GÖREV MOTORU
// ══════════════════════════════════════════════════════
function getDailyQuests(){
    const today=new Date().toDateString();
    if(P.dailyQuestDate!==today||!P.dailyQuests){
        // Yeni gün: görevleri resetle
        P.dailyQuestDate=today;
        P.dailyXP=0;
        const picked=shuffle(QUEST_TEMPLATES).slice(0,3);
        P.dailyQuests=picked.map(q=>({...q,progress:0,done:false}));
        save();
    }
    return P.dailyQuests;
}

function updateQuest(type, amount=1){
    const qs=getDailyQuests();
    let changed=false;
    qs.forEach(q=>{
        if(q.done) return;
        let match=false;
        if(q.type===type) match=true;
        if(q.type==='games'&&['wm','pq','mem','spell','sentence','listen','scram','sort','speak'].includes(type)) match=true;
        if(q.type==='worlds'&&type==='world_visit') match=true;
        if(match){
            q.progress=Math.min(q.target,(q.progress||0)+amount);
            if(q.progress>=q.target&&!q.done){
                q.done=true;
                P.questsDone=(P.questsDone||0)+1;
                addXP(q.xpR, true);
                toast(`📋 Görev Tamamlandı! +${q.xpR} XP bonus!`,'good',3000);
                changed=true;
            }
            changed=true;
        }
    });
    if(changed){P.dailyQuests=qs;save();chkBadges();}
}

function questProgressFor(type){
    const qs=getDailyQuests();
    for(const q of qs){
        if(q.type===type||(q.type==='games'&&['wm','pq','mem','spell','sentence','listen','scram','sort','speak'].includes(type)))
            return {p:q.progress||0,t:q.target,done:q.done};
    }
    return null;
}

// ══════════════════════════════════════════════════════
// AÇILIŞ
// ══════════════════════════════════════════════════════
function open(){
    const today=new Date().toDateString();
    if(P.lastPlay){
        const last=new Date(P.lastPlay).toDateString();
        const yest=new Date(Date.now()-86400000).toDateString();
        if(last===yest&&last!==today) P.streak++;
        else if(last!==today&&last!==yest) P.streak=1;
    }else P.streak=1;
    P.lastPlay=Date.now();
    if(P.lives<P.ml){
        const r=Math.floor((Date.now()-(P.lastLR||Date.now()))/(5*60*1000));
        if(r>0){P.lives=Math.min(P.ml,P.lives+r);P.lastLR=Date.now();}
    }
    save(); getDailyQuests();

    document.querySelectorAll('.container').forEach(c=>c.classList.add('hidden'));
    document.querySelectorAll('.arsiv-full-page').forEach(c=>c.classList.add('hidden'));
    const pg=$id('kids-page');
    if(pg) pg.classList.remove('hidden');
    document.querySelectorAll('.sb-btn,.mob-drawer-btn').forEach(e=>e.classList.remove('active'));
    ['sb-kids','di-kids'].forEach(id=>{const e=$id(id);if(e)e.classList.add('active');});
    // Firebase allData'da kidsPlayer varsa yükle (cihazlar arası sync)
    if (typeof window.allData !== 'undefined' && window.allData.kidsPlayer) {
        const remote = window.allData.kidsPlayer;
        // Sadece XP, seviye ve badge gibi ilerleme alanlarını merge et
        // (yerel veri daha eskiyse remote ile güncelle)
        if ((remote.xp || 0) > P.xp) {
            P = { ...P, ...remote };
            localStorage.setItem('ww_p2', JSON.stringify(P));
        }
    }
    render(P.name?'home':'name');
}

// ══════════════════════════════════════════════════════
// RENDER ROUTER
// ══════════════════════════════════════════════════════
function render(view, data){
    const pg=$id('kids-page');
    if(!pg) return;
    let html='';
    if(view==='name')      html=vName();
    else if(view==='home') html=vHome();
    else if(view==='world')    html=vWorld(data);
    else if(view==='quests')   html=vQuests();
    else if(view==='badges')   html=vBadges();
    else if(view==='result')   html=vResult(data);
    else if(view==='wm')       {html=vGame('Word Match 🎯');      setTimeout(startWM,10);}
    else if(view==='pq')       {html=vGame('Picture Quiz 🖼️');    setTimeout(startPQ,10);}
    else if(view==='memory')   {html=vMem();                      setTimeout(startMem,10);}
    else if(view==='spell')    {html=vGame('Spelling Bee 🐝');    setTimeout(startSpell,10);}
    else if(view==='sentence') {html=vGame('Sentence Builder 🧩');setTimeout(startSent,10);}
    else if(view==='listen')   {html=vGame('Listen & Choose 🎧'); setTimeout(startListen,10);}
    else if(view==='scramble') {html=vGame('Word Scramble 🔤');   setTimeout(startScramble,10);}
    else if(view==='sort')     {html=vSort();                     setTimeout(startSort,10);}
    pg.innerHTML=`<div class="kw-inner">${html}</div>`;
    pg.scrollTop=0;
}

function _go(v,d){ CW=d||CW; render(v,d); }
function _replay(){ if(CFn) CFn(); }
function _name(){
    const v=($id('kw-ni')||{}).value;
    if(v&&v.trim()){
        P.name=v.trim();
        save();
        // Kids verisini global allData'ya da yaz — Firebase sync için
        if(typeof window.allData !== 'undefined'){
            window.allData.kidsPlayer = JSON.parse(JSON.stringify(P));
            if(typeof window._saveData === 'function') window._saveData();
        }
        render('home');
    }
}

// ══════════════════════════════════════════════════════
// HUD & ORTAK PARÇALAR
// ══════════════════════════════════════════════════════
function hud(){
    const lvl=P.level, xpIn=P.xp-txpL(lvl), pct=Math.min(100,Math.round(xpIn/xpL(lvl)*100));
    let hearts='';
    for(let i=0;i<P.ml;i++) hearts+=`<span style="font-size:1.1rem;opacity:${i<P.lives?1:.22}">❤️</span>`;
    const qs=getDailyQuests(), doneQ=qs.filter(q=>q.done).length;
    return `<div class="kw-hud">
        <div style="display:flex;gap:2px;">${hearts}</div>
        <div style="flex:1;">
            <div style="font-family:'Fredoka One',cursive;font-size:.72rem;color:#5C6BC0;margin-bottom:3px;">Seviye ${lvl} &nbsp;·&nbsp; ${P.xp} XP</div>
            <div style="height:7px;background:#E8EAF6;border-radius:8px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#7E57C2,#AB47BC);border-radius:8px;transition:width .6s;"></div>
            </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
            <span style="font-family:'Fredoka One',cursive;color:#FF7043;font-size:.9rem;">🔥 ${P.streak}</span>
            <span onclick="KW._go('quests')" style="font-family:'Fredoka One',cursive;font-size:.78rem;background:${doneQ===3?'linear-gradient(135deg,#22c55e,#16a34a)':'#EDE7F6'};color:${doneQ===3?'white':'#7E57C2'};padding:3px 10px;border-radius:20px;cursor:pointer;">📋 ${doneQ}/3</span>
        </div>
    </div>`;
}

function back(v,d){return `<button class="kw-back" onclick="KW._go('${v}'${d?`,'${d}'`:''})">← Geri</button>`;}

function prog(id,i,n,liv,ml){
    const hrt=liv!=null?`<span>${'❤️'.repeat(liv)+'🖤'.repeat((ml||3)-liv)}</span>`:'';
    return `<div style="margin-bottom:14px;">
        <div style="display:flex;justify-content:space-between;font-size:.72rem;font-weight:800;color:#5C6BC0;margin-bottom:4px;"><span>Soru ${i+1}/${n}</span>${hrt}</div>
        <div style="height:7px;background:#E8EAF6;border-radius:8px;overflow:hidden;"><div id="${id}" style="height:100%;width:${i/n*100}%;background:linear-gradient(90deg,#4FC3F7,#7E57C2);border-radius:8px;transition:width .5s;"></div></div>
    </div>`;
}

// ══════════════════════════════════════════════════════
// VIEWS
// ══════════════════════════════════════════════════════
function vName(){
    return `${hud()}<div class="kw-card kw-center" style="max-width:480px;margin:0 auto;">
        <div style="font-size:5rem;animation:kwBounce 2s infinite;display:block;margin-bottom:4px;">🦄</div>
        <div class="kw-title-grad">WordWorld!</div>
        <div style="color:#5C6BC0;font-weight:700;margin-bottom:20px;">İngilizce öğrenmenin en eğlenceli yolu!</div>
        <input class="kw-input" id="kw-ni" type="text" placeholder="Adını yaz..." maxlength="14" style="text-align:center;font-size:1.1rem;margin-bottom:14px;">
        <button class="kw-btn-primary" onclick="KW._name()" style="width:100%;font-size:1.05rem;padding:15px;">🚀 Maceraya Başla!</button>
    </div>`;
}

function vHome(){
    const ranks=[[0,'🌱 Başlangıç'],[60,'🌿 Öğrenci'],[200,'🌸 Gelişiyor'],[400,'⚡ Usta'],[700,'🌟 Uzman'],[1200,'🏆 Efsane'],[2000,'👑 Efsaneler Efsanesi']];
    let rank=ranks[0][1]; for(const[t,r]of ranks)if(P.xp>=t)rank=r;

    const wc=Object.entries(WORLDS).map(([wid,w])=>{
        const s=P.ws[wid]||0, [c1,c2]=w.color.split(',');
        const visited=P.worldsVisited&&P.worldsVisited[wid];
        return `<div class="kw-world-card" style="background:linear-gradient(135deg,${c1},${c2});" onclick="KW._go('world','${wid}')">
            <div style="font-size:2.3rem;margin-bottom:5px;">${w.icon}</div>
            <div style="font-family:'Fredoka One',cursive;font-size:.92rem;color:#1A237E;">${w.name}</div>
            <div style="font-size:.62rem;color:#5C6BC0;font-weight:700;">${w.words.length} kelime</div>
            <div style="font-size:.85rem;letter-spacing:2px;margin-top:4px;">${'★'.repeat(s)+'☆'.repeat(3-s)}</div>
            ${visited?'':'<div style="font-size:.58rem;font-weight:800;color:#e63946;margin-top:2px;">YENİ</div>'}
        </div>`;
    }).join('');

    // Günlük görevler özeti
    const qs=getDailyQuests();
    const questHtml=qs.map(q=>{
        const pct=Math.min(100,Math.round((q.progress||0)/q.target*100));
        return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F0F0FF;">
            <span style="font-size:1.3rem;">${q.icon}</span>
            <div style="flex:1;">
                <div style="font-size:.8rem;font-weight:800;color:${q.done?'#16a34a':'#1A237E'};text-decoration:${q.done?'line-through':'none'};">${q.text}</div>
                <div style="height:5px;background:#E8EAF6;border-radius:4px;margin-top:4px;">
                    <div style="height:100%;width:${pct}%;background:${q.done?'linear-gradient(90deg,#22c55e,#16a34a)':'linear-gradient(90deg,#7E57C2,#AB47BC)'};border-radius:4px;transition:width .5s;"></div>
                </div>
            </div>
            <span style="font-size:1rem;">${q.done?'✅':'⭕'}</span>
        </div>`;
    }).join('');

    return `${hud()}
    <div class="kw-card kw-center" style="margin-bottom:14px;padding:18px 20px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
            <div style="text-align:left;">
                <div class="kw-title-grad" style="font-size:1.6rem;margin-bottom:2px;">Merhaba, ${P.name}! 👋</div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;align-items:center;">
                    <span class="kw-badge-pill" style="background:linear-gradient(135deg,#7E57C2,#AB47BC);font-size:.75rem;">${rank}</span>
                    <span class="kw-badge-pill" style="background:linear-gradient(135deg,#FF7043,#FF5722);font-size:.75rem;">⭐ ${P.xp} XP</span>
                    <button onclick="KW._go('name')" style="font-size:.62rem;font-weight:700;color:#5C6BC0;background:#EDE7F6;border:none;border-radius:20px;padding:3px 10px;cursor:pointer;">✏️ İsim Değiştir</button>
                </div>
            </div>
            <div style="font-size:3.5rem;animation:kwBounce 2s infinite;">🦄</div>
        </div>
    </div>

    <!-- Günlük Görevler -->
    <div class="kw-card" style="margin-bottom:14px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
            <div style="font-family:'Fredoka One',cursive;font-size:1.1rem;color:#1A237E;">📋 Günlük Görevler</div>
            <button onclick="KW._go('quests')" style="font-size:.75rem;font-weight:800;color:#7E57C2;background:#EDE7F6;border:none;border-radius:20px;padding:4px 12px;cursor:pointer;">Tümünü Gör</button>
        </div>
        ${questHtml}
    </div>

    <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#5C6BC0;margin-bottom:10px;">🌍 Dünyaları Keşfet</div>
    <div class="kw-world-grid">${wc}</div>
    <button class="kw-btn-secondary" style="width:100%;margin-top:8px;" onclick="KW._go('badges')">🏆 Rozetlerim (${P.badges.length}/${BADGES.length})</button>`;
}

function vWorld(wid){
    const w=WORLDS[wid];
    // Dünya ziyaret kaydı
    if(!P.worldsVisited) P.worldsVisited={};
    if(!P.worldsVisited[wid]){
        P.worldsVisited[wid]=true;
        updateQuest('world_visit');
        save();
    }
    const modes=[
        {icon:'🎯',n:'Word Match',       d:'Kelimeyi doğru çeviriyle eşleştir',      xp:'+10',  v:'wm',       mi:'mi-match'},
        {icon:'🖼️',n:'Picture Quiz',     d:'Resmi gör, doğru kelimeyi seç',          xp:'+10',  v:'pq',       mi:'mi-pic'},
        {icon:'🃏',n:'Memory Flip',      d:'Eşleşen İngilizce ↔ Türkçe kartları bul',xp:'+15',  v:'memory',   mi:'mi-mem'},
        {icon:'🐝',n:'Spelling Bee',     d:'Kelimeyi doğru yaz',                     xp:'+20',  v:'spell',    mi:'mi-spell'},
        {icon:'🧩',n:'Sentence Builder', d:'Cümleyi doğru sıraya diz',               xp:'+25',  v:'sentence', mi:'mi-build'},
        {icon:'🎧',n:'Listen & Choose',  d:'Sesli telaffuzu duy, doğru cevabı seç',  xp:'+15',  v:'listen',   mi:'mi-listen'},
        {icon:'🔤',n:'Word Scramble',    d:'Karışık harfleri doğru sıraya diz',       xp:'+20',  v:'scramble', mi:'mi-scram'},
        {icon:'🗂️',n:'Category Sort',   d:'Kelimeleri doğru kategorilere taşı',     xp:'+20',  v:'sort',     mi:'mi-sort'},
    ].map(m=>`<button class="kw-mode-btn" onclick="KW._go('${m.v}')">
        <div class="kw-mode-icon ${m.mi}">${m.icon}</div>
        <div style="flex:1;text-align:left;">
            <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:#1A237E;">${m.n}</div>
            <div style="font-size:.71rem;color:#5C6BC0;font-weight:700;margin-top:2px;">${m.d}</div>
        </div>
        <div style="font-size:.7rem;font-weight:800;color:#22c55e;background:#E8F5E9;padding:3px 9px;border-radius:20px;flex-shrink:0;">${m.xp} XP</div>
    </button>`).join('');
    return `${hud()}${back('home')}
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
        <span style="font-size:3rem;">${w.icon}</span>
        <div>
            <div style="font-family:'Fredoka One',cursive;font-size:1.5rem;color:#1A237E;">${w.name}</div>
            <div style="font-size:.74rem;color:#5C6BC0;font-weight:700;">${w.words.length} kelime · 8 oyun modu</div>
        </div>
    </div>
    <div class="kw-modes">${modes}</div>`;
}

function vGame(title){
    return `${hud()}${back('world',CW)}
    <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:#1A237E;margin-bottom:14px;">${title}</div>
    <div id="kw-ga"></div>`;
}

function vMem(){
    return `${hud()}${back('world',CW)}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
        <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:#1A237E;">Memory Flip 🃏</div>
        <div id="kw-mp" style="font-size:.85rem;font-weight:800;color:#5C6BC0;">0/6 çift</div>
    </div>
    <div class="kw-mem-grid" id="kw-ga"></div>`;
}

function vSort(){
    return `${hud()}${back('world',CW)}
    <div style="font-family:'Fredoka One',cursive;font-size:1.2rem;color:#1A237E;margin-bottom:14px;">Category Sort 🗂️</div>
    <div id="kw-ga"></div>`;
}

function vQuests(){
    const qs=getDailyQuests();
    const today=new Date().toLocaleDateString('tr-TR',{weekday:'long',day:'numeric',month:'long'});
    const html=qs.map((q,i)=>{
        const pct=Math.min(100,Math.round((q.progress||0)/q.target*100));
        return `<div class="kw-card" style="margin-bottom:12px;${q.done?'border:2px solid #22c55e;':''}" >
            <div style="display:flex;align-items:center;gap:12px;">
                <div style="font-size:2.2rem;width:52px;height:52px;border-radius:14px;background:${q.done?'#E8F5E9':'#EDE7F6'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${q.icon}</div>
                <div style="flex:1;">
                    <div style="font-family:'Fredoka One',cursive;font-size:1rem;color:${q.done?'#16a34a':'#1A237E'};text-decoration:${q.done?'line-through':'none'};">${q.text}</div>
                    <div style="font-size:.72rem;color:#7E57C2;font-weight:800;margin-top:2px;">+${q.xpR} XP ödül</div>
                    <div style="height:6px;background:#E8EAF6;border-radius:4px;margin-top:6px;">
                        <div style="height:100%;width:${pct}%;background:${q.done?'linear-gradient(90deg,#22c55e,#16a34a)':'linear-gradient(90deg,#7E57C2,#EC407A)'};border-radius:4px;transition:width .5s;"></div>
                    </div>
                    <div style="font-size:.67rem;color:#5C6BC0;font-weight:700;margin-top:3px;">${q.progress||0} / ${q.target}</div>
                </div>
                <div style="font-size:1.6rem;">${q.done?'✅':'⏳'}</div>
            </div>
        </div>`;
    }).join('');
    return `${hud()}${back('home')}
    <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#1A237E;margin-bottom:4px;">📋 Günlük Görevler</div>
    <div style="font-size:.78rem;color:#5C6BC0;font-weight:700;margin-bottom:16px;">${today}</div>
    ${html}
    <div class="kw-card kw-center" style="background:linear-gradient(135deg,#F3E5F5,#EDE7F6);">
        <div style="font-size:.82rem;font-weight:700;color:#5C6BC0;">Toplam tamamlanan görev</div>
        <div style="font-family:'Fredoka One',cursive;font-size:2rem;color:#7E57C2;margin:4px 0;">${P.questsDone||0}</div>
        <div style="font-size:.72rem;color:#AB47BC;font-weight:700;">Her tamamlanan görevde bonus XP kazanırsın! 🎁</div>
    </div>`;
}

function vBadges(){
    const groups=[
        {name:'XP Rozetleri',ids:['ten_xp','fifty_xp','hundred_xp','fivehund_xp']},
        {name:'Oyun Ustalığı',ids:['perfect','memwin','bee','builder','scrambler','listener','speaker','sorter']},
        {name:'Keşif',ids:['worlds2','worlds5','worldsall','first_game']},
        {name:'Seri',ids:['streak3','streak7']},
        {name:'Seviye',ids:['level5','level10']},
        {name:'Görevler',ids:['quest3','quest10']},
    ];
    let html='';
    groups.forEach(g=>{
        const items=g.ids.map(id=>{
            const b=BADGES.find(x=>x.id===id);
            if(!b) return '';
            const ok=P.badges.includes(id);
            return `<div class="kw-badge-item${ok?'':' kw-badge-locked'}" title="${b.name}">
                <div style="font-size:2rem;margin-bottom:4px;">${b.icon}</div>
                <div style="font-size:.62rem;font-weight:800;color:#1A237E;line-height:1.3;">${b.name}</div>
            </div>`;
        }).join('');
        html+=`<div style="font-family:'Fredoka One',cursive;font-size:.82rem;color:#5C6BC0;margin:14px 0 8px;">${g.name}</div>
               <div class="kw-badges-grid">${items}</div>`;
    });
    return `${hud()}${back('home')}
    <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:#1A237E;margin-bottom:4px;">🏆 Rozetlerim</div>
    <div style="font-size:.78rem;color:#5C6BC0;font-weight:700;margin-bottom:14px;">${P.badges.length}/${BADGES.length} rozet kazanıldı</div>
    ${html}`;
}

function vResult(d){
    const pct=d.total>0?d.correct/d.total:0, stars=pct>=.9?3:pct>=.6?2:pct>=.3?1:0;
    const em=['😢','😅','😊','🎉'], ti=['Tekrar Dene!','Fena Değil!','İyi İş!','Mükemmel!'];
    return `${hud()}<div class="kw-card kw-center" style="max-width:460px;margin:0 auto;">
        <div style="font-size:4.5rem;animation:kwBounce 2s infinite;display:block;margin-bottom:8px;">${em[stars]}</div>
        <div style="font-family:'Fredoka One',cursive;font-size:1.9rem;color:#1A237E;margin-bottom:4px;">${ti[stars]}</div>
        <div style="font-weight:800;color:#7E57C2;margin-bottom:12px;">+${d.xp} XP &nbsp;·&nbsp; ${d.correct}/${d.total} doğru</div>
        <div style="font-size:2rem;letter-spacing:6px;margin-bottom:22px;">${'⭐'.repeat(stars)+'☆'.repeat(3-stars)}</div>
        <div style="display:flex;gap:10px;">
            <button class="kw-btn-secondary" style="flex:1;" onclick="KW._go('world','${CW}')">🏠 Menü</button>
            <button class="kw-btn-primary" style="flex:1;" onclick="KW._replay()">🔄 Tekrar</button>
        </div>
    </div>`;
}

// ══════════════════════════════════════════════════════
// XP & ROZETLER
// ══════════════════════════════════════════════════════
function addXP(n, fromQuest=false){
    P.xp+=n;
    if(!fromQuest){ P.dailyXP=(P.dailyXP||0)+n; updateQuest('dailyxp'); }
    let lv=false;
    while(P.xp>=txpL(P.level+1)){P.level++;lv=true;}
    if(lv) toast(`🎊 Seviye ${P.level}! Tebrikler!`,'good',3000);
    save(); chkBadges();
}
function chkBadges(){
    BADGES.forEach(b=>{
        if(!P.badges.includes(b.id)&&b.cond(P)){
            P.badges.push(b.id);
            const bd=BADGES.find(x=>x.id===b.id);
            setTimeout(()=>toast(`🏆 Yeni Rozet: ${bd.icon} ${bd.name}`,'good',3500),600);
            save();
        }
    });
}
function endGame(ok,tot,xp,flag,gameType){
    addXP(xp);
    if(flag){P[flag]=true;}
    if(ok===tot&&tot>0) P.perf=true;
    P.totalGames=(P.totalGames||0)+1;
    const s=tot>0?(ok/tot>=.9?3:ok/tot>=.6?2:ok/tot>=.3?1:0):0;
    if(s>(P.ws[CW]||0)) P.ws[CW]=s;
    P.wp=P.wp||{}; P.wp[CW]=(P.wp[CW]||0)+1;
    save(); chkBadges();
    if(gameType) updateQuest(gameType);
    updateQuest('games');
    if(ok===tot&&tot>0) updateQuest('perfect');
    render('result',{correct:ok,total:tot,xp});
}

// ══════════════════════════════════════════════════════
// TOAST & XP POP
// ══════════════════════════════════════════════════════
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
// Inject XP float animation
(()=>{
    if(!document.getElementById('kw-xp-style')){
        const s=document.createElement('style');
        s.id='kw-xp-style';
        s.textContent='@keyframes kwXpFloat{0%{opacity:1;transform:translateX(-50%) translateY(0)}100%{opacity:0;transform:translateX(-50%) translateY(-60px)}}';
        document.head.appendChild(s);
    }
})();

// ══════════════════════════════════════════════════════
// OYUN 1: WORD MATCH
// ══════════════════════════════════════════════════════
function startWM(){
    CFn=()=>render('wm');
    wm.qs=shuffle(WORLDS[CW].words).slice(0,10); wm.i=0; wm.ok=0;
    rwm();
}
function rwm(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(wm.i>=wm.qs.length){endGame(wm.ok,wm.qs.length,wm.ok*2,null,'wm');return;}
    const q=wm.qs[wm.i];
    const opts=shuffle([q,...pick(WORLDS[CW].words.filter(w=>w.en!==q.en),3)]);
    ga.innerHTML=`${prog('wm-p',wm.i,wm.qs.length)}
        <div class="kw-q-word"><div style="font-size:1.2rem;margin-bottom:8px;">${q.emoji||'📝'}</div>${q.en}</div>
        <div class="kw-ans-grid">
        ${opts.map(o=>`<button class="kw-ans-btn" onclick="KW._wma(this,'${o.en}','${q.en}')">
            <span style="font-size:1.4rem;">${o.emoji||'📝'}</span><span>${o.tr}</span>
        </button>`).join('')}
        </div>`;
}
function _wma(btn,ans,correct){
    const ga=$id('kw-ga'); if(!ga)return;
    ga.querySelectorAll('.kw-ans-btn').forEach(b=>b.disabled=true);
    if(ans===correct){btn.classList.add('kw-ans-correct');wm.ok++;toast('✅ Doğru!');xpPop(2);}
    else{btn.classList.add('kw-ans-wrong');toast('❌ Yanlış!','bad');
        ga.querySelectorAll('.kw-ans-btn').forEach(b=>{if(b.children[1]&&WORLDS[CW].words.find(w=>w.en===correct&&w.tr===b.children[1].textContent))b.classList.add('kw-ans-correct');});}
    wm.i++; setTimeout(rwm,1100);
}

// ══════════════════════════════════════════════════════
// OYUN 2: PICTURE QUIZ
// ══════════════════════════════════════════════════════
function startPQ(){
    CFn=()=>render('pq');
    pq.qs=shuffle(WORLDS[CW].words).slice(0,10); pq.i=0; pq.ok=0;
    rpq();
}
function rpq(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(pq.i>=pq.qs.length){endGame(pq.ok,pq.qs.length,pq.ok*2,null,'pq');return;}
    const q=pq.qs[pq.i];
    const opts=shuffle([q,...pick(WORLDS[CW].words.filter(w=>w.en!==q.en),3)]);
    const c=document.createElement('div');
    c.innerHTML=`${prog('pq-p',pq.i,pq.qs.length)}
        <div style="font-size:6rem;text-align:center;animation:kwWordPop .4s cubic-bezier(.34,1.56,.64,1);margin-bottom:10px;">${q.emoji||'📝'}</div>
        <div style="text-align:center;font-size:.85rem;font-weight:700;color:#5C6BC0;margin-bottom:14px;">Bu resim hangi kelime?</div>
        <div class="kw-ans-grid"></div>`;
    ga.innerHTML=''; ga.appendChild(c);
    opts.forEach(o=>{
        const b=document.createElement('button'); b.className='kw-ans-btn';
        b.innerHTML=`<span style="font-size:.9rem;font-weight:800;">${o.en}</span>`;
        b.onclick=()=>{
            ga.querySelectorAll('.kw-ans-btn').forEach(x=>x.disabled=true);
            if(o.en===q.en){b.classList.add('kw-ans-correct');pq.ok++;toast('✅ Doğru!');xpPop(2);}
            else{b.classList.add('kw-ans-wrong');toast('❌ Yanlış!','bad');
                c.querySelectorAll('.kw-ans-btn').forEach(x=>{if(x.textContent===q.en)x.classList.add('kw-ans-correct');});}
            pq.i++; setTimeout(rpq,1100);
        };
        c.querySelector('.kw-ans-grid').appendChild(b);
    });
}

// ══════════════════════════════════════════════════════
// OYUN 3: MEMORY FLIP
// ══════════════════════════════════════════════════════
function startMem(){
    CFn=()=>render('memory');
    const words=pick(WORLDS[CW].words,6); let cards=[];
    words.forEach((w,i)=>{
        cards.push({id:i*2,pairId:i,text:w.en,type:'en',emoji:w.emoji});
        cards.push({id:i*2+1,pairId:i,text:w.tr,type:'tr'});
    });
    mem_.cards=shuffle(cards); mem_.m=0; mem_.f=[]; mem_.lk=false; mem_.mv=0;
    const ga=$id('kw-ga'); if(!ga)return;
    ga.innerHTML='';
    mem_.cards.forEach((_,i)=>{
        const d=document.createElement('div'); d.className='kw-mem-card';
        d.innerHTML=`<div class="kw-mem-f">?</div><div class="kw-mem-b">${mem_.cards[i].type==='en'?mem_.cards[i].emoji+' ':''}${mem_.cards[i].text}</div>`;
        d.onclick=()=>fmem(i); ga.appendChild(d);
    });
}
function fmem(i){
    if(mem_.lk)return;
    const cards=document.querySelectorAll('#kw-ga .kw-mem-card');
    const e=cards[i];
    if(!e||e.dataset.d==='1'||e.dataset.f==='1')return;
    e.dataset.f='1'; e.classList.add('kw-mem-flip');
    mem_.f.push({i,card:mem_.cards[i],el:e});
    if(mem_.f.length===2){
        mem_.lk=true; mem_.mv++;
        const[a,b]=mem_.f;
        if(a.card.pairId===b.card.pairId&&a.card.type!==b.card.type){
            setTimeout(()=>{
                [a.el,b.el].forEach(el=>{el.dataset.d='1';el.classList.add('kw-mem-match');el.classList.remove('kw-mem-flip');delete el.dataset.f;});
                mem_.m++; mem_.f=[]; mem_.lk=false;
                const mp=$id('kw-mp'); if(mp)mp.textContent=`${mem_.m}/${mem_.cards.length/2} çift`;
                toast('✅ Eşleşti!'); xpPop(3);
                if(mem_.m===mem_.cards.length/2) endGame(mem_.m,mem_.m,Math.max(15,30-mem_.mv),'memw','mem');
            },400);
        }else{
            setTimeout(()=>{
                [a.el,b.el].forEach(el=>{el.classList.remove('kw-mem-flip');delete el.dataset.f;});
                mem_.f=[]; mem_.lk=false; toast('❌ Eşleşmedi!','bad');
            },900);
        }
    }
}

// ══════════════════════════════════════════════════════
// OYUN 4: SPELLING BEE
// ══════════════════════════════════════════════════════
function startSpell(){
    CFn=()=>render('spell');
    sp_.qs=shuffle(WORLDS[CW].words).slice(0,8); sp_.i=0; sp_.ok=0; sp_.lives=3; sp_.hr=0;
    rsp();
}
function rsp(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(sp_.i>=sp_.qs.length||sp_.lives<=0){endGame(sp_.ok,Math.min(sp_.i,sp_.qs.length),sp_.ok*3,sp_.ok>=6?'bee':null,'spell');return;}
    const q=sp_.qs[sp_.i]; sp_.hr=0;
    const tiles=q.en.split('').map((_,j)=>`<div id="st${j}" style="min-width:32px;height:38px;border-radius:9px;display:inline-flex;align-items:center;justify-content:center;font-family:'Fredoka One',cursive;font-size:1rem;background:white;border:2px dashed #C5CAE9;color:#C5CAE9;margin:2px;">_</div>`).join('');
    ga.innerHTML=`${prog('sp-p',sp_.i,sp_.qs.length,sp_.lives,3)}
        <div class="kw-card">
            <div style="font-size:5rem;text-align:center;animation:kwBounce 2s infinite;margin-bottom:6px;">${q.emoji||'📝'}</div>
            <div style="text-align:center;font-size:.88rem;font-weight:700;color:#5C6BC0;margin-bottom:10px;">Bu resim <strong style="color:#7E57C2;">${q.tr}</strong> demek. İngilizce yaz:</div>
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
    const q=sp_.qs[sp_.i]; if(!q)return;
    if(sp_.hr<Math.ceil(q.en.length/2)){
        const t=$id('st'+sp_.hr);
        if(t){t.textContent=q.en[sp_.hr];t.style.background='linear-gradient(135deg,#7E57C2,#AB47BC)';t.style.color='white';t.style.borderColor='transparent';}
        sp_.hr++;
    }
}
function _csp(){
    const q=sp_.qs[sp_.i]; if(!q)return;
    const i=$id('kw-si'), v=(i&&i.value.trim().toLowerCase())||''; if(!v)return;
    if(v===q.en.toLowerCase()){toast('✅ Doğru yazdın!');xpPop(3);sp_.ok++;}
    else{toast(`❌ Yanlış! Doğrusu: ${q.en}`,'bad');sp_.lives--;
        q.en.split('').forEach((l,j)=>{const t=$id('st'+j);if(t){t.textContent=l;t.style.background='linear-gradient(135deg,#22c55e,#16a34a)';t.style.color='white';t.style.borderColor='transparent';}});}
    sp_.i++; setTimeout(rsp,1200);
}

// ══════════════════════════════════════════════════════
// OYUN 5: SENTENCE BUILDER
// ══════════════════════════════════════════════════════
function startSent(){
    CFn=()=>render('sentence');
    sb_.qs=shuffle(WORLDS[CW].sentences).slice(0,6); sb_.i=0; sb_.ok=0; sb_.b=[]; sb_.bk=[];
    rsent();
}
function rsent(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(sb_.i>=sb_.qs.length){endGame(sb_.ok,sb_.qs.length,sb_.ok*5,sb_.ok>=3?'bld':null,'sentence');return;}
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

// ══════════════════════════════════════════════════════
// OYUN 6: LISTEN & CHOOSE 🎧
// Web Speech Synthesis API ile sesli telaffuz
// ══════════════════════════════════════════════════════
function startListen(){
    CFn=()=>render('listen');
    ls_.qs=shuffle(WORLDS[CW].words).slice(0,10); ls_.i=0; ls_.ok=0;
    rls();
}
function speakWord(word, btn){
    if(!window.speechSynthesis){toast('Bu tarayıcı sesi desteklemiyor 😔','bad');return;}
    window.speechSynthesis.cancel();
    const utt=new SpeechSynthesisUtterance(word);
    utt.lang='en-US'; utt.rate=0.85; utt.pitch=1.1;
    if(btn){
        btn.classList.add('kw-listen-active');
        utt.onend=()=>btn.classList.remove('kw-listen-active');
    }
    window.speechSynthesis.speak(utt);
}
function rls(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(ls_.i>=ls_.qs.length){endGame(ls_.ok,ls_.qs.length,ls_.ok*2,ls_.ok>=7?'lst':null,'listen');return;}
    const q=ls_.qs[ls_.i];
    const opts=shuffle([q,...pick(WORLDS[CW].words.filter(w=>w.en!==q.en),3)]);
    ga.innerHTML=`${prog('ls-p',ls_.i,ls_.qs.length)}
        <div class="kw-card kw-center" style="margin-bottom:14px;">
            <div style="font-size:.85rem;font-weight:700;color:#5C6BC0;margin-bottom:12px;">Sesi dinle ve doğru kelimeyi seç 👂</div>
            <button id="kw-spk-btn" class="kw-listen-btn" onclick="speakWord('${q.en}',this)">
                <span style="font-size:2.5rem;">🎧</span>
                <span style="font-family:'Fredoka One',cursive;font-size:1rem;">Dinle</span>
            </button>
            <div style="font-size:.75rem;color:#AB47BC;font-weight:700;margin-top:10px;">Tekrar dinlemek için tekrar tıkla</div>
        </div>
        <div class="kw-ans-grid" id="ls-opts">
        ${opts.map(o=>`<button class="kw-ans-btn" onclick="KW._lsa(this,'${o.en}','${q.en}')">
            <span style="font-size:1.4rem;">${o.emoji}</span>
            <span style="font-size:.85rem;">${o.tr}</span>
        </button>`).join('')}
        </div>`;
    // Otomatik ilk ses
    setTimeout(()=>{
        const btn=$id('kw-spk-btn');
        if(btn) speakWord(q.en,btn);
    },500);
}
function _lsa(btn,ans,correct){
    const ga=$id('kw-ga'); if(!ga)return;
    ga.querySelectorAll('.kw-ans-btn').forEach(b=>b.disabled=true);
    if(ans===correct){btn.classList.add('kw-ans-correct');ls_.ok++;toast('✅ Doğru!');xpPop(2);}
    else{btn.classList.add('kw-ans-wrong');toast('❌ Yanlış!','bad');
        ga.querySelectorAll('.kw-ans-btn').forEach(b=>{
            const w=WORLDS[CW].words.find(w=>w.en===correct);
            if(w&&b.querySelector('span:last-child')&&b.querySelector('span:last-child').textContent===w.tr) b.classList.add('kw-ans-correct');
        });}
    ls_.i++; setTimeout(rls,1200);
}

// ══════════════════════════════════════════════════════
// OYUN 7: WORD SCRAMBLE 🔤
// Karışık harfleri doğru sıraya diz
// ══════════════════════════════════════════════════════
function startScramble(){
    CFn=()=>render('scramble');
    scr_.qs=shuffle(WORLDS[CW].words.filter(w=>w.en.length>=3)).slice(0,8);
    scr_.i=0; scr_.ok=0; scr_.sel=[];
    rscr();
}
function rscr(){
    const ga=$id('kw-ga'); if(!ga)return;
    if(scr_.i>=scr_.qs.length){endGame(scr_.ok,scr_.qs.length,scr_.ok*3,scr_.ok>=6?'scr':null,'scram');return;}
    const q=scr_.qs[scr_.i];
    // Harfleri karıştır ama kelimeyle aynı olmasın
    let scrambled=shuffle(q.en.split(''));
    if(scrambled.join('')===q.en) scrambled=shuffle(scrambled);
    scr_._q=q; scr_._letters=scrambled; scr_.sel=[];
    rscrState(ga);
}
function rscrState(ga){
    if(!ga)ga=$id('kw-ga'); if(!ga)return;
    const q=scr_._q;
    const ansHtml=Array.from({length:q.en.length},(_,i)=>{
        const l=scr_.sel[i];
        return `<div class="kw-scr-slot${l?' kw-scr-filled':''}" onclick="${l?`KW._scrRm(${i})`:''}">
            ${l||'&nbsp;'}
        </div>`;
    }).join('');
    const letHtml=scr_._letters.map((l,i)=>{
        const used=scr_.sel.includes(l)&&scr_._letters.filter((x,j)=>x===l&&j<=i).length<=scr_.sel.filter(x=>x===l).length;
        return `<button class="kw-scr-tile${used?' kw-scr-used':''}" onclick="KW._scrAdd('${l}',${i})" ${used?'disabled':''}>
            ${l.toUpperCase()}
        </button>`;
    }).join('');
    ga.innerHTML=`${prog('scr-p',scr_.i,scr_.qs.length)}
        <div class="kw-card">
            <div style="font-size:5rem;text-align:center;animation:kwBounce 2s infinite;margin-bottom:8px;">${q.emoji||'📝'}</div>
            <div style="text-align:center;font-size:.85rem;font-weight:700;color:#5C6BC0;margin-bottom:14px;">
                <strong style="color:#7E57C2;">${q.tr}</strong> kelimesini harfleri sırala
            </div>
            <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:18px;">
                ${ansHtml}
            </div>
            <div style="font-size:.75rem;font-weight:700;color:#5C6BC0;margin-bottom:8px;text-align:center;">Harflere tıkla:</div>
            <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;">
                ${letHtml}
            </div>
            <div style="display:flex;gap:8px;">
                <button class="kw-btn-secondary" onclick="KW._scrClear()" style="flex:1;padding:12px;">🗑️ Temizle</button>
                <button class="kw-btn-primary" onclick="KW._scrCheck()" style="flex:1;">Kontrol ✓</button>
            </div>
        </div>`;
}
function _scrAdd(letter, idx){
    if(scr_.sel.length>=scr_._q.en.length) return;
    // find first unused occurrence
    const usedCount=scr_.sel.filter(x=>x===letter).length;
    const totalCount=scr_._letters.filter(x=>x===letter).length;
    if(usedCount>=totalCount) return;
    scr_.sel.push(letter);
    rscrState();
}
function _scrRm(i){scr_.sel.splice(i,1);rscrState();}
function _scrClear(){scr_.sel=[];rscrState();}
function _scrCheck(){
    const q=scr_._q;
    const built=scr_.sel.join('');
    if(built.toLowerCase()===q.en.toLowerCase()){
        toast('✅ Mükemmel sıralama!');xpPop(3);scr_.ok++;
        scr_.i++; setTimeout(rscr,1200);
    }else if(scr_.sel.length<q.en.length){
        toast('⚠️ Tüm harfleri diz!','bad');
    }else{
        toast(`❌ Yanlış! Doğrusu: ${q.en}`,'bad');
        scr_.i++; setTimeout(rscr,1400);
    }
}

// ══════════════════════════════════════════════════════
// OYUN 8: CATEGORY SORT 🗂️
// İki kategori: kelime ve emoji eşleştirme
// ══════════════════════════════════════════════════════
function startSort(){
    CFn=()=>render('sort');
    const words=pick(WORLDS[CW].words,8);
    // 2 gruba böl
    cat_.a=shuffle(words).slice(0,4); // "English" grubu
    cat_.b=words.filter(w=>!cat_.a.includes(w));
    // Her iki grubun kelimelerini karıştır
    cat_.items=shuffle([...cat_.a.map(w=>({...w,group:'a',placed:null})),...cat_.b.map(w=>({...w,group:'b',placed:null}))]);
    cat_.ok=0; cat_.checked=false;
    rcatState();
}
function rcatState(){
    const ga=$id('kw-ga'); if(!ga)return;
    const aLabel=cat_.a[0]?`${cat_.a[0].emoji} & Arkadaşları`:'Grup A';
    const bLabel=cat_.b[0]?`${cat_.b[0].emoji} & Arkadaşları`:'Grup B';

    // "emoji → İngilizce eşleştir" formatı — emoji gör, sürükle değil, tıklayarak yerleştir
    // Şu an seçili kelime
    const sel=cat_._selected;

    const itemsHtml=cat_.items.map((w,i)=>{
        if(w.placed!==null) return `<div class="kw-sort-slot kw-sort-placed" style="opacity:.35;">${w.emoji}</div>`;
        const active=(sel!==undefined&&sel===i);
        return `<button class="kw-sort-item${active?' kw-sort-active':''}" onclick="KW._catSel(${i})">
            <span style="font-size:1.6rem;">${w.emoji}</span>
            <span style="font-size:.7rem;font-weight:800;color:#1A237E;">${w.tr}</span>
        </button>`;
    }).join('');

    const zoneA=cat_.items.filter(w=>w.placed==='a').map(w=>`<span class="kw-sort-placed-tag">${w.emoji} ${w.en}</span>`).join('');
    const zoneB=cat_.items.filter(w=>w.placed==='b').map(w=>`<span class="kw-sort-placed-tag">${w.emoji} ${w.en}</span>`).join('');

    ga.innerHTML=`<div class="kw-card" style="margin-bottom:12px;">
        <div style="font-size:.82rem;font-weight:800;color:#5C6BC0;margin-bottom:10px;text-align:center;">
            Kelimeyi seç, sonra doğru gruba tıkla 👇
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px;">${itemsHtml}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div class="kw-drop-zone" onclick="KW._catDrop('a')">
                <div style="font-size:1.1rem;margin-bottom:6px;">${cat_.a.slice(0,2).map(w=>w.emoji).join('')}</div>
                <div style="font-size:.72rem;font-weight:800;color:#7E57C2;margin-bottom:6px;">${aLabel}</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;">${zoneA}</div>
            </div>
            <div class="kw-drop-zone kw-drop-zone-b" onclick="KW._catDrop('b')">
                <div style="font-size:1.1rem;margin-bottom:6px;">${cat_.b.slice(0,2).map(w=>w.emoji).join('')}</div>
                <div style="font-size:.72rem;font-weight:800;color:#EC407A;margin-bottom:6px;">${bLabel}</div>
                <div style="display:flex;flex-wrap:wrap;gap:4px;min-height:24px;">${zoneB}</div>
            </div>
        </div>
        ${cat_.items.every(w=>w.placed!==null)?`<button class="kw-btn-primary" onclick="KW._catCheck()" style="width:100%;margin-top:14px;">Kontrol Et ✓</button>`:''}
    </div>`;
}
function _catSel(i){ cat_._selected=i; rcatState(); }
function _catDrop(zone){
    const i=cat_._selected;
    if(i===undefined||i===null) return;
    cat_.items[i].placed=zone;
    cat_._selected=undefined;
    rcatState();
}
function _catCheck(){
    let ok=0;
    cat_.items.forEach(w=>{if(w.placed===w.group)ok++;});
    cat_.ok=ok;
    P.srt=ok===cat_.items.length;
    endGame(ok,cat_.items.length,ok*3,P.srt?'srt':null,'sort');
}

// ══════════════════════════════════════════════════════
// KLAVYE
// ══════════════════════════════════════════════════════
document.addEventListener('keydown',e=>{
    const pg=$id('kids-page');
    if(!pg||pg.classList.contains('hidden'))return;
    if(e.key==='Enter'){
        if($id('kw-si')) _csp();
        else if($id('kw-ni')) _name();
    }
});

// ══════════════════════════════════════════════════════
// PUBLIC API
// ══════════════════════════════════════════════════════
return {
    open, _go, _replay, _name,
    // Word Match
    _wma,
    // Spelling
    _csp, _sph,
    // Sentence
    _sad, _srm, _ckst,
    // Listen
    _lsa,
    // Scramble
    _scrAdd, _scrRm, _scrClear, _scrCheck,
    // Category Sort
    _catSel, _catDrop, _catCheck,
};
})();
