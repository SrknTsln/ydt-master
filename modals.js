// ════════════════════════════════════════════════════════════════
// modals.js  —  Modals Grammar Modülü
// YDT Master Pro — showPage/navTo sistemiyle tam entegre
// Kaynak: 10'da10 YDT Modal Verbs notları (s. 23–31)
// ════════════════════════════════════════════════════════════════

/* ── State ── */
let _mdCurrentSection = 'overview';
let _mdAnswers = {};
let _mdChecked = {};
let _mdScore = 0;
const MD_TOTAL = 15;

/* ── Section metadata ── */
const MD_SECTIONS = [
    { id: 'overview',      label: 'Genel Bakış',             grp: 'Genel' },
    { id: 'ability',       label: 'Ability — Yetenek',        grp: 'Kullanımlar' },
    { id: 'request',       label: 'Request — Rica',           grp: 'Kullanımlar' },
    { id: 'obligation',    label: 'Obligation — Zorunluluk',  grp: 'Kullanımlar' },
    { id: 'lack-obl',      label: 'Lack of Obligation',       grp: 'Kullanımlar' },
    { id: 'prohibition',   label: 'Prohibition — Yasaklama',  grp: 'Kullanımlar' },
    { id: 'advice',        label: 'Advice — Tavsiye',         grp: 'Kullanımlar' },
    { id: 'expectation',   label: 'Expectation — Beklenti',   grp: 'Kullanımlar' },
    { id: 'preference',    label: 'Preference — Tercih',      grp: 'Kullanımlar' },
    { id: 'habitual',      label: 'Habitual Past',            grp: 'Kullanımlar' },
    { id: 'deduction',     label: 'Deduction — Çıkarım',      grp: 'Kullanımlar' },
    { id: 'offer',         label: 'Offer & Invitation',       grp: 'Kullanımlar' },
    { id: 'tips',          label: '🎯 Soru İpuçları',         grp: 'Özel' },
    { id: 'exercises',     label: '✨ Alıştırmalar',          grp: 'Özel' },
];

/* ── Dot colors per group ── */
const MD_DOT = { 'Genel': '#6366f1', 'Kullanımlar': '#d97706', 'Özel': '#e63946' };

/* ════════════════════════════════════════════════════
   ENTRY POINT
════════════════════════════════════════════════════ */
function openModalsSection(sectionId) {
    _mdCurrentSection = sectionId || 'overview';

    // Show modals-page using existing showPage mechanism
    document.querySelectorAll('.container').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.arsiv-full-page').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.cx-page, .sr-page, .tw-page').forEach(c => c.classList.add('hidden'));
    const page = document.getElementById('modals-page');
    if (page) page.classList.remove('hidden');

    // Mark sidebar active
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(el => el.classList.remove('active'));
    const sb = document.getElementById('sb-grammar-modals');
    if (sb) sb.classList.add('active');
    const di = document.getElementById('di-grammar-modals');
    if (di) di.classList.add('active');

    _mdRenderPage();
}

/* ════════════════════════════════════════════════════
   PAGE STRUCTURE
════════════════════════════════════════════════════ */
function _mdRenderPage() {
    const page = document.getElementById('modals-page');
    if (!page) return;

    page.innerHTML = `
        <div class="gr-topbar">
            <button class="gr-back-btn" onclick="navTo('index-page')">←</button>
            <div>
                <div class="gr-topbar-label">Grammar Modülü</div>
                <div class="gr-topbar-title">Modals</div>
            </div>
        </div>
        <div class="gr-body">
            <nav class="gr-sidenav" id="md-sidenav"></nav>
            <div class="gr-content" id="md-content"></div>
        </div>`;

    _mdBuildSidenav();
    _mdRenderSection(_mdCurrentSection);
}

/* ════════════════════════════════════════════════════
   SIDENAV
════════════════════════════════════════════════════ */
function _mdBuildSidenav() {
    const nav = document.getElementById('md-sidenav');
    if (!nav) return;

    const groups = {};
    MD_SECTIONS.forEach(s => {
        if (!groups[s.grp]) groups[s.grp] = [];
        groups[s.grp].push(s);
    });

    let html = '';
    ['Genel', 'Kullanımlar', 'Özel'].forEach(grp => {
        const list = groups[grp];
        if (!list) return;
        html += `<div class="gr-sn-sec">${grp}</div>`;
        list.forEach(s => {
            const active = s.id === _mdCurrentSection ? ' active' : '';
            html += `<button class="gr-sn-btn${active}" onclick="_mdRenderSection('${s.id}')">
                <span class="gr-sn-dot" style="background:${MD_DOT[grp]}"></span>${s.label}
            </button>`;
        });
    });
    nav.innerHTML = html;
}

/* ════════════════════════════════════════════════════
   SECTION ROUTER
════════════════════════════════════════════════════ */
function _mdRenderSection(id) {
    _mdCurrentSection = id;
    _mdBuildSidenav();

    const content = document.getElementById('md-content');
    if (!content) return;
    content.scrollTop = 0;

    const map = {
        'overview':    mdOverview,
        'ability':     mdAbility,
        'request':     mdRequest,
        'obligation':  mdObligation,
        'lack-obl':    mdLackObl,
        'prohibition': mdProhibition,
        'advice':      mdAdvice,
        'expectation': mdExpectation,
        'preference':  mdPreference,
        'habitual':    mdHabitual,
        'deduction':   mdDeduction,
        'offer':       mdOffer,
        'tips':        mdTips,
        'exercises':   mdExercises,
    };

    const fn = map[id];
    content.innerHTML = fn ? fn() : '<div style="padding:40px">Yakında...</div>';

    if (id === 'exercises') {
        _mdScore = 0; _mdAnswers = {}; _mdChecked = {};
        _mdUpdScore();
        document.querySelectorAll('.md-inp').forEach((inp, i) => {
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); mdCheckBlank(i); } });
        });
    }
}

/* ════════════════════════════════════════════════════
   HTML BUILDER HELPERS (reuse grammar.js patterns)
════════════════════════════════════════════════════ */
function mdH(eyebrow, title, sub) {
    return `<div class="gr-hero gr-hero-modal">
        <div class="gr-hero-eyebrow">${eyebrow}</div>
        <div class="gr-hero-title">${title}</div>
        <div class="gr-hero-sub">${sub}</div>
    </div>`;
}

function mdSH(label) {
    return `<div class="gr-sec-hd">${label}</div>`;
}

function mdInfo(type, title, body) {
    return `<div class="gr-info gr-info-${type}">
        <div class="gr-info-title">${title}</div>${body}
    </div>`;
}

function mdTable(headers, rows, cls) {
    const ths = headers.map(h => `<th>${h}</th>`).join('');
    const trs = rows.map(r =>
        `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`
    ).join('');
    return `<div class="gr-tbl-wrap"><table class="gr-tbl ${cls||''}">
        <thead><tr>${ths}</tr></thead><tbody>${trs}</tbody>
    </table></div>`;
}

function mdAcc(items) {
    const cards = items.map(it => {
        const exHtml = (it.examples || []).map((ex, i) =>
            `<div class="gr-ex ex-modal"><span class="gr-ex-n">${String(i+1).padStart(2,'0')}</span>${ex}</div>`
        ).join('');
        const descHtml = it.desc ? `<p class="gr-acc-desc">${it.desc}</p>` : '';
        return `<div class="gr-acc" onclick="this.classList.toggle('open')">
            <div class="gr-acc-head">
                <div class="gr-acc-ico" style="background:${it.bg}">${it.ico}</div>
                <div class="gr-acc-title">${it.title}</div>
                <div class="gr-acc-chev">⌄</div>
            </div>
            <div class="gr-acc-body">${descHtml}<div class="gr-ex-list">${exHtml}</div></div>
        </div>`;
    }).join('');
    return `<div class="gr-acc-wrap">${cards}</div>`;
}

function mdBox(color, title, lines) {
    const content = lines.map(l => `<div style="margin-bottom:5px">${l}</div>`).join('');
    const styles = {
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        amber:  'background:#fffbeb;border:2px solid #d97706;color:#78350f',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
    };
    return `<div style="${styles[color]||styles.yellow};border-radius:12px;padding:14px 18px;margin:4px 36px 4px;font-size:.82rem;line-height:1.75;">
        ${title ? `<div style="font-weight:900;margin-bottom:6px">${title}</div>` : ''}
        ${content}
    </div>`;
}

/* ════════════════════════════════════════════════════
   OVERVIEW
════════════════════════════════════════════════════ */
function mdOverview() {
    const catalogue = [
        {id:'ability',       color:'amber',  emoji:'💪', name:'Ability',          tr:'Yetenek',         modals:'can / could / be able to',     desc:'Yapabildiğimiz eylem ve yeteneklerden bahsetmek.'},
        {id:'request',       color:'blue',   emoji:'🙏', name:'Request',          tr:'Rica',            modals:'can / could / will / would',    desc:'Birinden bir şey yapmalarını rica etmek.'},
        {id:'obligation',    color:'red',    emoji:'⚠️', name:'Obligation',       tr:'Zorunluluk',      modals:'must / have to / need to',      desc:'Bir şeyin yapılması gerektiğini ifade etmek.'},
        {id:'lack-obl',      color:'green',  emoji:'✅', name:'Lack of Obligation',tr:'Zorunluluk Yok', modals:"don't have to / needn't",       desc:'Bir şeyin yapılmasının zorunlu olmadığını belirtmek.'},
        {id:'prohibition',   color:'red',    emoji:'🚫', name:'Prohibition',      tr:'Yasaklama',       modals:"mustn't / can't",               desc:'Belirli bir yasak ya da kuralın varlığını vurgular.'},
        {id:'advice',        color:'green',  emoji:'💡', name:'Advice',           tr:'Tavsiye',         modals:'should / ought to / had better',desc:'Tavsiye veya öneri bildirmek.'},
        {id:'expectation',   color:'purple', emoji:'🎯', name:'Expectation',      tr:'Beklenti',        modals:'be supposed to / be about to',  desc:'Beklenti, plan veya olacak şeyler hakkında.'},
        {id:'preference',    color:'blue',   emoji:'⚖️', name:'Preference',       tr:'Tercih',          modals:'prefer / would rather',         desc:'Bir şeyi başka bir şeye tercih etmek.'},
        {id:'habitual',      color:'amber',  emoji:'🔄', name:'Habitual Past',    tr:'Geçmişteki Alışkanlıklar', modals:'used to / would',      desc:'Geçmişte alışkanlık haline gelmiş eylemler.'},
        {id:'deduction',     color:'purple', emoji:'🔎', name:'Deduction',        tr:'Çıkarım-Olasılık',modals:"must / can't / may / might",    desc:'Mantıklı gerekçelerle çıkarım yapmak.'},
        {id:'offer',         color:'green',  emoji:'🤝', name:'Offer & Invitation',tr:'Teklif',         modals:"Let's / Shall we / Why don't we", desc:'Teklif ve davetlerde kullanılan yapılar.'},
    ];

    const colorMap = {
        amber:  {tag:'background:#fef3c7;color:#92400e', card:'#fffbeb', border:'#fcd34d'},
        blue:   {tag:'background:#dbeafe;color:#1e3a8a', card:'#eff6ff', border:'#93c5fd'},
        red:    {tag:'background:#fff1f2;color:#9f1239', card:'#fff1f2', border:'#fca5a5'},
        green:  {tag:'background:#dcfce7;color:#166534', card:'#f0fdf4', border:'#86efac'},
        purple: {tag:'background:#ede9fe;color:#4c1d95', card:'#f5f3ff', border:'#c4b5fd'},
    };

    const cards = catalogue.map(c => {
        const cm = colorMap[c.color] || colorMap.amber;
        return `<div style="border:1.5px solid ${cm.border};border-radius:14px;padding:16px;background:${cm.card};cursor:pointer;transition:all .18s;" 
                     onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 24px rgba(0,0,0,.09)'" 
                     onmouseout="this.style.transform='';this.style.boxShadow=''"
                     onclick="_mdRenderSection('${c.id}')">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                <span style="font-size:1.2rem">${c.emoji}</span>
                <span style="${cm.tag};font-size:.52rem;font-weight:900;letter-spacing:1.5px;text-transform:uppercase;padding:3px 10px;border-radius:20px;">${c.tr}</span>
            </div>
            <div style="font-size:.96rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">${c.name}</div>
            <div style="font-family:'Courier New',monospace;font-size:.72rem;color:#6b7280;margin-bottom:8px">${c.modals}</div>
            <div style="font-size:.73rem;color:#374151;line-height:1.55">${c.desc}</div>
        </div>`;
    }).join('');

    return mdH('⚡ Modal Verbs', 'Modals', 'Yetenek, zorunluluk, olasılık, tavsiye... 11 kullanım alanı, ÖSYM ipuçları ve interaktif alıştırmalar.')
    + `<div style="padding:24px 36px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">${cards}</div>`
    + `<div style="padding:0 36px 36px;text-align:center;">
        <button onclick="_mdRenderSection('exercises')" style="padding:14px 32px;background:linear-gradient(135deg,#d97706,#f59e0b);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">
            ✨ Alıştırmalara Geç
        </button>
      </div>`;
}

/* ════════════════════════════════════════════════════
   ABILITY — Yetenek (s.23–24)
════════════════════════════════════════════════════ */
function mdAbility() {
    return mdH('💪 Yetenek', 'Ability', 'Yapabildiğimiz eylemlerden ve yeteneklerden bahsederken kullanırız.')
    + mdSH('can / be able to — Present')
    + mdAcc([{ico:'✅', bg:'rgba(217,119,6,.1)', title:'CAN / IS ABLE TO (Şimdiki Yetenek)', exClass:'ex-modal',
        examples:[
            'She <strong>can</strong> / <strong>is able to</strong> run a marathon in under four hours.',
            "She <strong>can't</strong> attend the party tonight because she's not feeling well.",
        ]}])
    + mdInfo('yellow','📌 BİLMELİSİN! — "be able to" diğer yapılarla',
        '"be able to" diğer tense ve modal verbs ile kullanılabilir:<br><br>'
        +'• I <strong>won\'t be able to</strong> come to the party tonight because I have a prior commitment.<br>'
        +'• In this job, you <strong>have to be able to</strong> work under pressure.')
    + mdSH('could / was-were able to — Past')
    + mdAcc([{ico:'⏮', bg:'rgba(230,57,70,.1)', title:'COULD / WAS-WERE ABLE TO (Geçmişteki Yetenek)',
        desc:'Geçmişte yapabildiğimiz eylem ve yeteneklerden bahsederken kullanırız.<br><strong>"was-were able to"</strong> → "geçmişte tek seferlik başarı" → <strong>"manage to"</strong> ile aynı anlam.',
        examples:[
            "He <strong>couldn't</strong> find his keys yesterday.",
            'Despite the difficult conditions, they <strong>were able to</strong> complete the project on time.',
        ]}])
    + mdBox('amber','📌 BİLMELİSİN! — was/were able to vs could',[
        '"was-were able to" → tek seferlik başarı anlamını "could" ile veremeyiz.',
        'Ancak <strong>see, hear, smell…</strong> duyu fiilleri ile "could" kullanabiliriz:',
        '• When we visited the forest, we <strong>could hear</strong> the birds singing beautifully.',
        '• When we entered the bakery, we <strong>could smell</strong> the freshly baked bread.',
    ])
    + mdBox('yellow','⭐ COULD HAVE V₃ — "yapabilirdin ama yapmadın"',[
        'She <strong>could have caught</strong> the train if she had left the house earlier. (yakalayamadı)',
    ]);
}

/* ════════════════════════════════════════════════════
   REQUEST — Rica (s.24)
════════════════════════════════════════════════════ */
function mdRequest() {
    return mdH('🙏 Rica', 'Request', 'Bir ricada bulunmak için "can, could, will, may, would" ifadeleri kullanılabilir.')
    + mdSH('Temel Yapılar')
    + mdAcc([{ico:'🗣️', bg:'rgba(79,70,229,.1)', title:'Can / Could / Will / Would + Rica',
        examples:[
            '<strong>Will</strong> you pass me the menu, please?',
            '<strong>Would</strong> you be able to pick me up from the airport tomorrow?',
        ]}])
    + mdSH('Özel Rica Yapıları')
    + mdTable(['Yapı','Formül','Örnek'],[
        ['WOULD YOU MIND + Ving?','Would you mind + V-ing','Would you mind <strong>turning down</strong> the music a little? It\'s too loud.'],
        ['WOULD YOU MIND if + S + V₂?','Would you mind if + subject + V₂','Would you mind if we <strong>rescheduled</strong> the meeting to tomorrow?'],
    ]);
}

/* ════════════════════════════════════════════════════
   OBLIGATION & NECESSITY (s.25)
════════════════════════════════════════════════════ */
function mdObligation() {
    return mdH('⚠️ Zorunluluk', 'Obligation & Necessity', 'Bir şeyin yapılması gerektiğini ifade eden modal yapılar.')
    + mdSH('Kullanım Alanları')
    + mdTable(['Modal','Kaynak','Açıklama','Örnek'],[
        ['<strong>must</strong>','İçsel (kendinden kaynaklı)','Kişinin kendi hissettiği zorunluluk. Güçlü tavsiye anlamı da taşır.','I <strong>must</strong> finish my report before the deadline.<br><em style="font-size:.76rem;color:#999">You must see this movie; it\'s amazing! (tavsiye)</em>'],
        ['<strong>had to</strong>','Geçmiş hali','must\'ın geçmiş zaman halidir.','They <strong>had to</strong> wait for hours at the airport.'],
        ['<strong>have/has to</strong>','Dışsal (dış etkenden)','Dış etkenlerden kaynaklı zorunluluk.','They <strong>have to</strong> submit their applications by Friday.'],
        ['<strong>need to</strong>','Gereklilik','Bir şeye ihtiyaç olduğunu belirtir.','He <strong>needs to</strong> improve his communication skills for the job.'],
    ]);
}

/* ════════════════════════════════════════════════════
   LACK OF OBLIGATION (s.25)
════════════════════════════════════════════════════ */
function mdLackObl() {
    return mdH('✅ Zorunluluk Yok', 'Lack of Obligation & Necessity', 'Bir şeyin yapılmasının zorunlu OLMADIĞINI ifade eden yapılar.')
    + mdSH('Present — Şimdiki Zamanda')
    + mdAcc([{ico:'🟢', bg:'rgba(5,150,105,.1)', title:"Don't have to / Don't need to / Needn't (present)",
        desc:'Yapmanın zorunlu olmadığını belirtir.',
        examples:["You <strong>don't have to</strong> attend the meeting today; it has been postponed."]}])
    + mdSH('Past — Geçmişte')
    + mdAcc([{ico:'⏮', bg:'rgba(217,119,6,.1)', title:"Didn't need to / Didn't have to (past)",
        desc:'Geçmişte bir eylemin aslında yapılmak zorunda olmadığını ifade eder, ancak sonuç bağlamdan anlaşılır.',
        examples:["We <strong>didn't have to</strong> take a taxi; the bus came on time. (we didn't take a taxi)"]}])
    + mdBox('yellow','⭐ NEEDN\'T HAVE V₃ — "tüh, yaptın ama gerek yoktu"',[
        'I <strong>needn\'t have taken</strong> an umbrella with me today; it didn\'t rain at all.',
        '<em style="font-size:.78rem;color:#999">Şemsiyeyi aldım ama almama gerek yoktu.</em>',
    ]);
}

/* ════════════════════════════════════════════════════
   PROHIBITION — Yasaklama (s.26)
════════════════════════════════════════════════════ */
function mdProhibition() {
    return mdH('🚫 Yasaklama', 'Prohibition', 'Belirli bir yasağın veya kuralın varlığını vurgulamak için kullanılır.')
    + mdSH('Kullanılan İfadeler')
    + mdTable(['İfade','Güç','Açıklama'],[
        ["<strong>mustn't</strong>",'💪💪 En güçlü','Kesin ve zorunlu yasak belirtir.'],
        ["<strong>can't</strong>",'💪💪 Güçlü','Kesin yasak belirtir.'],
        ['<strong>be not allowed to</strong>','💪 Genel','Daha genel ve resmi bir yasak ifadesidir.'],
    ])
    + mdAcc([{ico:'🚫', bg:'rgba(230,57,70,.1)', title:'Prohibition Örnekleri',
        examples:[
            "We <strong>mustn't</strong> be late for the meeting; the boss is strict about punctuality.",
            'Visitors <strong>are not allowed to</strong> take photographs in the museum.',
            "He <strong>can't</strong> park his car here; it's a no-parking zone.",
        ]}]);
}

/* ════════════════════════════════════════════════════
   ADVICE — Tavsiye (s.26)
════════════════════════════════════════════════════ */
function mdAdvice() {
    return mdH('💡 Tavsiye', 'Advice', 'Tavsiye veya öneri bildirirken kullanılan modal yapılar.')
    + mdSH('Tavsiye İfadeleri (Güçten Zayıfa)')
    + mdTable(['İfade','Güç','Türkçe Karşılık'],[
        ['<strong>must</strong>','💪💪💪 En güçlü','Yapmalısın (kesinlikle öneriyorum)'],
        ['<strong>had better</strong>','💪💪 Güçlü','Yapsan iyi olur (sonucu olabilir: or else…)'],
        ['<strong>should / ought to</strong>','💪 Orta','Yapmalısın (genel tavsiye)'],
    ])
    + mdAcc([
        {ico:'💡', bg:'rgba(79,70,229,.1)', title:'Should / Ought to',
         examples:[
            "They <strong>shouldn't</strong> rely solely on social media for information; it can be misleading.",
            'You <strong>ought to</strong> call your parents regularly.',
         ]},
        {ico:'⚡', bg:'rgba(217,119,6,.1)', title:'Had Better (yapsan iyi olur)',
         desc:'"should" ve "ought to" ifadelerinden daha güçlüdür. Devamında "or, or else" gibi ifadeler yer alabilir.',
         examples:[
            'She <strong>had better</strong> submit her application on time, <em>or else</em> she won\'t be considered for the scholarship.',
         ]},
    ])
    + mdBox('yellow','⭐ ÖSYM SEVER: SHOULD HAVE V₃ — "yapmalıydın ama yapmadın"',[
        'They <strong>should have listened</strong> to the weather forecast before planning the picnic. (dinlemedi)',
    ]);
}

/* ════════════════════════════════════════════════════
   EXPECTATION — Beklenti (s.27)
════════════════════════════════════════════════════ */
function mdExpectation() {
    return mdH('🎯 Beklenti', 'Expectation', 'Bir şeyin yapılması gerektiğini, planlandığını veya beklendiğini ifade eden yapılar.')
    + mdSH('Kullanılan İfadeler')
    + mdAcc([
        {ico:'📋', bg:'rgba(79,70,229,.1)', title:'be supposed to',
         desc:'"Be supposed to" bir şeyin yapılması gerektiğini, planlandığını veya beklenildiğini ifade eder. "was/were supposed to" geçmiş halidir. <strong>⚠️ Soru çözerken: "was/were supposed to" beklentinin KARŞILANMADIĞINI belirtir.</strong>',
         examples:[
            'Students <strong>are supposed to</strong> submit their assignments by the end of the week.',
            'We <strong>were supposed to</strong> have a family gathering last month, but it got canceled due to some issues.',
         ]},
        {ico:'⏱️', bg:'rgba(5,150,105,.1)', title:'be about to (present) — çok yakında olacak',
         desc:'"Be about to" bir eylemin çok yakında olacağını ve neredeyse gerçekleşmeye hazır olduğunu ifade eder. "was/were to" geçmiş halidir.',
         examples:[
            'The train <strong>is about to</strong> arrive at the platform.',
            'The concert <strong>was to</strong> start at 8 PM, but it got delayed due to technical issues.',
         ]},
        {ico:'🎯', bg:'rgba(217,119,6,.1)', title:'be expected to — olması bekleniyor',
         examples:['The employees <strong>are expected to</strong> arrive at work on time.']},
    ]);
}

/* ════════════════════════════════════════════════════
   PREFERENCE — Tercih (s.27)
════════════════════════════════════════════════════ */
function mdPreference() {
    return mdH('⚖️ Tercih', 'Preference', 'Tercihlerimizi ifade ederken kullanırız.')
    + mdSH('"prefer" Yapıları')
    + mdTable(['Formül','Örnek'],[
        ['prefer + noun + <strong>to</strong> + noun','She <strong>prefers</strong> cats <strong>to</strong> dogs.'],
        ['prefer + Ving + <strong>to</strong> + Ving','I <strong>prefer</strong> meditating in the morning <strong>to</strong> meditating at night.'],
        ['prefer + to + verb + <strong>rather than</strong> + V₁','I prefer <strong>to</strong> walk to work <strong>rather than</strong> take the bus.'],
    ])
    + mdSH('"would rather / would sooner" Yapısı')
    + mdAcc([{ico:'⚖️', bg:'rgba(79,70,229,.1)', title:'would rather V₁ / would sooner V₁',
        desc:'Bir şeyi yapmak yerine başka bir şeyi yapmayı tercih ettiğimizi ifade eder.',
        examples:['She <strong>would rather</strong> read a book <strong>than</strong> watch a movie.']}])
    + mdInfo('yellow','📌 would rather + Subject + V₂',
        'Başkasının bir şey yapmasını tercih ettiğimizde <strong>"would rather + subject + V₂"</strong> yapısını kullanırız:<br><br>'
        +'• I <strong>would rather</strong> she <strong>stayed</strong> home tonight.');
}

/* ════════════════════════════════════════════════════
   HABITUAL PAST (s.28)
════════════════════════════════════════════════════ */
function mdHabitual() {
    return mdH('🔄 Geçmişteki Alışkanlıklar', 'Habitual Past', 'Geçmişte alışkanlık haline gelmiş eylemler için kullanırız.')
    + mdSH('used to V₁ / would V₁')
    + mdAcc([{ico:'⏮', bg:'rgba(217,119,6,.1)', title:'used to V₁ / would V₁',
        desc:'Geçmişteki alışkanlıklarımızdan bahsederken kullanırız. <strong>Ancak "would" stative verbs (durum fiili: be, have, live vb.) ile kullanılamaz, eylem (action) bildiren fiillerle kullanılır.</strong>',
        examples:[
            'They <strong>used to play</strong> basketball together after school.',
            'They <strong>would</strong> often <strong>go</strong> camping in the mountains during the summer.',
        ]}])
    + mdBox('amber','🔄 Alışkın olmak vs Alışmak',[
        '<strong>be used to + noun/Ving</strong> → Alışkın olmak (şu an alışkın)',
        '• She <strong>is used to</strong> living in a busy city.',
        '',
        '<strong>get used to + noun/Ving</strong> → Alışmak (alışma süreci)',
        '• They are <strong>getting used to</strong> the challenges of their new job.',
    ]);
}

/* ════════════════════════════════════════════════════
   DEDUCTION / POSSIBILITY (s.28–29)
════════════════════════════════════════════════════ */
function mdDeduction() {
    return mdH('🔎 Çıkarım & Olasılık', 'Deduction / Possibility', 'Mantıklı gerekçeler dahilinde çıkarım yaparken ve olasılık belirtirken kullandığımız ifadeler.')
    + mdSH('Kesinlik Skalası')
    + mdTable(['İfade','Anlam','Yön','Örnek'],[
        ['<strong>must</strong>','%90+ güçlü çıkarım','+ Pozitif','The car is warm, so someone <strong>must have driven</strong> it recently.'],
        ['<strong>can\'t / couldn\'t</strong>','Kesinlikle değil','– Negatif',"He <strong>can't have finished</strong> his meal already; he just started eating."],
        ['<strong>may / might / could</strong>','Olabilir (%30–60)','± Her ikisi','They <strong>may/might/could</strong> still make it to the movie if they hurry.'],
    ])
    + mdBox('yellow','⭐ ÖSYM SEVER: MUST HAVE V₃ — "mış olmalı"',[
        'Geçmişteki bir olayın olasılığından veya varlığından emin olduğumuzu ifade ederiz.',
        '• The car is warm, so someone <strong>must have driven</strong> it recently.',
        '• He <strong>must have forgotten</strong> his keys at home.',
    ])
    + mdInfo('blue','📌 BİLMELİSİN! — Olasılık Olumsuzları',
        'Present haldeki olumsuz ifadeler <strong>"may not" / "might not"</strong> şeklindedir. "can\'t" ve "couldn\'t" bu anlamda kullanılamaz (çünkü bunlar kesin olumsuz ifade belirtir):<br><br>'
        +'• She <strong>may not / might not</strong> know about the event. (Olasılık — belki bilmiyor)<br>'
        +'• She <strong>can\'t</strong> know about the event. (Kesin olumsuz — kesinlikle bilmiyor)')
    + mdBox('amber','📌 BİLMELİSİN! — Geçmişe Yönelik Olasılık Yapıları',[
        'Geçmiş zamana yönelik tahminlerde kullanılan yapılar:',
        '',
        '┌ May / Might / Could + <strong>have V₃</strong>',
        '└ May / Might / Could + <strong>have been Ving</strong>',
        '',
        '• She <strong>may/might/could not have received</strong> my email yet.',
        '• She <strong>may/might/could have been swimming</strong> yesterday; it was sunny.',
    ])
    + mdBox('yellow','⭐ ÖSYM SEVER: COULDN\'T HAVE V₃ — "istesen de yapamazdın"',[
        '"Couldn\'t have V₃" eylemin gerçekleşme ihtimalinin çok düşük olduğunu belirtir. <strong>"Could have V₃"</strong> yapısıyla KARIŞTIRILMAMALIDIR.',
        '',
        '• They <strong>couldn\'t have finished</strong> the project so quickly. It\'s a complex task. (proje bitmemiş olabilir)',
        '• They <strong>could have passed</strong> the exam if they had studied more. (sınavı geçebilirdi ama geçemedi)',
    ]);
}

/* ════════════════════════════════════════════════════
   OFFER & INVITATION (s.30)
════════════════════════════════════════════════════ */
function mdOffer() {
    return mdH('🤝 Teklif & Davet', 'Offer and Invitation', 'Teklif ve davetlerde kullandığımız yapılar.')
    + mdSH('Kullanılan İfadeler')
    + mdTable(['İfade','Örnek'],[
        ["<strong>Let's</strong> + V₁",'Let\'s go to the movies tonight.'],
        ["<strong>Shall we</strong> + V₁ ?",'Shall we meet for coffee tomorrow?'],
        ["<strong>Why don't we</strong> + V₁ ?",'Why don\'t we have a picnic in the park this week?'],
        ["<strong>We could / may / might</strong> + V₁",'We could go for a walk after dinner.'],
        ["<strong>How about / What about</strong> + Ving ?",'How about staying at home tonight?'],
    ]);
}

/* ════════════════════════════════════════════════════
   TIPS — Soru İpuçları (s.30–31)
════════════════════════════════════════════════════ */
function mdTips() {
    const tips = [
        { num:'01', title:'"MODAL + HAVE V₃" ve "MODAL + HAVE BEEN Ving" — Past İfadeler',
          body:'Bu yapılar geçmiş zamana aittir.',
          rules:[
            {ico:'🔸', text:'MAY / MIGHT HAVE V₃ → mış olabilir'},
            {ico:'🔸', text:'MUST HAVE V₃ → mış olmalı'},
            {ico:'🔸', text:'SHOULD HAVE V₃ → mış olmalıydı ama olmadı'},
            {ico:'🔸', text:'COULD HAVE V₃ → yapabilirdin ama yapmadın'},
          ]},
        { num:'02', title:'"MODAL + V₁" ve "MODAL + Ving" — Present İfadeler',
          body:'"Modal + V₁" ve "Modal + Ving" yapıları şimdiki zamana aittir.',
          rules:[
            {ico:'✅', text:'She <strong>can</strong> swim very fast. (Modal + V₁ = present ability)'},
            {ico:'✅', text:'She <strong>might be sleeping</strong> right now. (Modal + Ving = present)'},
          ]},
        { num:'03', title:'Modals Sorularında Tense Kontrolü',
          body:'Modals sorularını çözerken <strong>"Tense"</strong> konusunun sağlam olması gerekir; cümlenin "genelleme, geçmiş, gelecek" olup olmadığına bakılır.',
          rules:[
            {ico:'💡', text:'Zaman ifadesi yoksa → Simple Present (genelleme)'},
            {ico:'💡', text:'"yesterday, last…, ago" varsa → Simple Past'},
            {ico:'💡', text:'"have V₃" yapısı varsa → Present Perfect bağlamı'},
          ]},
        { num:'04', title:'Olasılık Bildiren Modals → Paraphrase (Yakın Anlam)',
          body:'"can-could-may-might" gibi ifadeler olasılık bildirirken <strong>"probably, perhaps, maybe, possibly, be likely to"</strong> şeklinde de kullanılabilir ve özellikle <strong>paraphrase (yakın anlam)</strong> soru tiplerinde karşımıza çıkar.',
          rules:[
            {ico:'🔄', text:'She <strong>might</strong> come → She will <strong>probably</strong> come'},
            {ico:'🔄', text:'It <strong>may</strong> rain → It is <strong>likely to</strong> rain'},
          ]},
        { num:'05', title:'"WAS/WERE SUPPOSED TO" — Beklenti Karşılanmadı',
          body:'"was/were supposed to" beklentinin karşılanmadığını belirtir.',
          rules:[
            {ico:'💡', text:'We <strong>were supposed to</strong> meet at 7 PM, but she was late. (buluşmak planlanmıştı ama olmadı)'},
          ]},
    ];

    const cards = tips.map(t => {
        const rules = t.rules.map(r =>
            `<div style="display:flex;gap:10px;padding:9px 13px;background:#f7f7fb;border-radius:10px;margin-top:7px;font-size:.82rem;color:#374151;line-height:1.6;">
                <span style="flex-shrink:0;font-size:.95rem;margin-top:1px">${r.ico}</span>${r.text}
            </div>`
        ).join('');
        return `<div style="background:#fff;border:1.5px solid #ebebf0;border-radius:14px;overflow:hidden;margin-bottom:10px;" onclick="this.querySelector('.md-tip-body').classList.toggle('hidden-body')">
            <div style="display:flex;align-items:center;gap:12px;padding:13px 18px;background:#f7f7fb;cursor:pointer;">
                <span style="font-size:.6rem;font-weight:900;color:#e63946;background:#fdf1f2;border-radius:7px;padding:3px 9px;flex-shrink:0;font-family:'Courier New',monospace;">İPUCU ${t.num}</span>
                <span style="flex:1;font-size:.87rem;font-weight:800;color:#1a1a2e">${t.title}</span>
                <span style="font-size:.9rem;color:#767687">⌄</span>
            </div>
            <div class="md-tip-body" style="padding:16px 20px;">
                ${t.body ? `<p style="font-size:.83rem;color:#374151;line-height:1.75;margin-bottom:8px">${t.body}</p>` : ''}
                ${rules}
            </div>
        </div>`;
    }).join('');

    return mdH('🎯 Soru Çözme', 'Soru Çözerken İpuçları', 'ÖSYM ve YDT sınavlarında Modals sorularını çözerken dikkat edilecek püf noktaları.')
    + `<div style="padding:24px 36px 36px">${cards}</div>`;
}

/* ════════════════════════════════════════════════════
   EXERCISES — Set tabanlı MCQ sistemi
   Her set 10 soru. Yeni set eklemek için MD_SETS'e obje ekle.
════════════════════════════════════════════════════ */
const MD_SETS = [
    {
        label: 'Set 1',
        questions: [
            {q:'She ___ (can / past) run very fast when she was young.',
             opts:['could run','can run','was able running','must have run'],
             cor:'a', hint:'Geçmişte genel yetenek → could + V₁'},
            {q:'Despite the storm, the rescue team ___ save everyone.',
             opts:['could','was able to','must have','should'],
             cor:'b', hint:'Tek seferlik geçmiş başarı → was/were able to (manage to)'},
            {q:'You ___ come to the meeting; it has been postponed.',
             opts:['mustn\'t','don\'t have to','can\'t','won\'t'],
             cor:'b', hint:'Zorunluluk yok → don\'t have to'},
            {q:'She ___ listened to her doctor\'s advice. (dinlemedi ama dinlemeliydi)',
             opts:['must have','could have','should have','would have'],
             cor:'c', hint:'should have V₃ → yapmalıydın ama yapmadın'},
            {q:'The lights are on — someone ___ be home.',
             opts:['should','could','must','might'],
             cor:'c', hint:'Güçlü pozitif çıkarım → must + V₁'},
            {q:'He ___ forgotten his keys. (unutmuş olmalı)',
             opts:['must have','should have','could have','would have'],
             cor:'a', hint:'Geçmişte güçlü çıkarım → must have V₃'},
            {q:'We ___ be late for the meeting; the boss is strict about punctuality.',
             opts:['mustn\'t','don\'t have to','needn\'t','shouldn\'t'],
             cor:'a', hint:'Kesin yasak → mustn\'t (must not)'},
            {q:'They ___ finish the project on time, but they failed. (yapabilirdi ama yapmadı)',
             opts:['must have','could have','should have','might have'],
             cor:'b', hint:'could have V₃ → yapabilirdi ama yapmadı'},
            {q:'Would you mind ___ the window? It\'s a bit cold.',
             opts:['to close','close','closed','closing'],
             cor:'d', hint:'Would you mind + V-ing'},
            {q:'I ___ have taken an umbrella; it didn\'t rain at all. (aldım ama gereksizdi)',
             opts:['needn\'t','mustn\'t','couldn\'t','shouldn\'t'],
             cor:'a', hint:'needn\'t have V₃ → yaptın ama gerekmiyordu'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 1-10 ── */
    {
        label: 'Set 2',
        questions: [
            {q:'You ....... your own canoe in order to join the canoe club. They cost a lot of money. You ....... mine whenever you want to go canoeing.',
             opts:['mustn\'t buy / had borrowed','won\'t have bought / should borrow','needn\'t buy / can borrow','might not buy / would borrow'],
             cor:'c', hint:'Gerek yok → needn\'t buy; izin/imkân → can borrow'},
            {q:'He is so poor now it\'s hard to believe that when he was young, he ....... down the street in his Rolls Royce or sometimes his Jaguar car.',
             opts:['has been driving','would drive','should have driven','has driven'],
             cor:'b', hint:'Geçmişteki alışkanlık/tekrar → would + V₁'},
            {q:'Just as my daughter was about to leave the house on her wedding day, my son spilt some tea on her dress. Fortunately, we ....... the stain with some special soap before the wedding took place.',
             opts:['were able to remove','must have removed','might be removing','could remove'],
             cor:'a', hint:'Tek seferlik geçmiş başarı → were able to (managed to)'},
            {q:'A: Is Julian not visiting Aunt May with us today? B: Well, he\'s been called out to an emergency, but he ....... us there if he finishes early.',
             opts:['has joined','could have joined','was joining','might join'],
             cor:'d', hint:'Belirsiz gelecek olasılık → might + V₁'},
            {q:'A: What were you doing at the bank yesterday? B: I ....... my bank manager for a loan to repair our house, and luckily, I managed to get it.',
             opts:['must have asked','used to ask','had to ask','should have asked'],
             cor:'c', hint:'Geçmişte zorunluluktan yapılan eylem → had to + V₁'},
            {q:'A: I can\'t believe Jane isn\'t here to collect her award. B: She ....... the invitation. We definitely should have checked that she had got it.',
             opts:['would rather not receive','had better not receive','isn\'t supposed to receive','must not have received'],
             cor:'e', hint:'Geçmişe dair güçlü olumsuz çıkarım → must not have V₃'},
            {q:'A: Did you speak to Sam about the plans for the cake sale? B: Yes, and she ....... bake some biscuits and cakes if she has time.',
             opts:['might be able to','was able to','used to','had better'],
             cor:'a', hint:'Koşullu gelecek olasılık → might be able to'},
            {q:'Our plane ....... in Cairo hours ago, but we haven\'t even taken off from Heathrow yet.',
             opts:['was supposed to land','must have landed','ought to be landing','will have landed'],
             cor:'a', hint:'Beklenen ama gerçekleşmeyen → was supposed to + V₁'},
            {q:'This steak is a little undercooked for my taste. ....... putting it back under the grill for another five minutes?',
             opts:['Why don\'t you','Would you mind','Would you like','Do you prefer'],
             cor:'b', hint:'Would you mind + V-ing → kibarca rica'},
            {q:'A: I wonder why Mary didn\'t want to come shopping with us. B: I don\'t know. She ....... short of money these days because her new kitchen cost her a lot of money.',
             opts:['will be','has been','can be','would be','could be'],
             cor:'e', hint:'Belirsiz tahmin / olasılık → could be (mümkün olabilir)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 11-20 ── */
    {
        label: 'Set 3',
        questions: [
            {q:'I ....... to the office to send e-mail any longer. The company has bought me a lap top computer.',
             opts:['didn\'t use to return','may not return','needn\'t have returned','don\'t have to return'],
             cor:'d', hint:'Artık zorunluluk yok → don\'t have to + V₁'},
            {q:'You ....... so envious of your brother. He is so successful because, unlike you, he works extremely hard.',
             opts:['haven\'t been','won\'t be','weren\'t','shouldn\'t be'],
             cor:'d', hint:'Tavsiye/kınama → shouldn\'t be (olmamalısın)'},
            {q:'Oh dear, we seem to have run out of salt. I ....... to the corner shop before dinner.',
             opts:['am able to go','needed to go','could have gone','will have to go'],
             cor:'e', hint:'Gelecekteki zorunluluk → will have to + V₁'},
            {q:'I can\'t understand why Dad is now so careful with his money. He ....... such a generous person.',
             opts:['would be','has been','used to be','will be'],
             cor:'c', hint:'Geçmişteki alışkanlık/durum (artık değil) → used to + V₁'},
            {q:'Trade is so poor these days! We ....... just two cars since I started working here a month ago.',
             opts:['have been able to sell','used to sell','had to sell','will have sold'],
             cor:'a', hint:'Şimdiye kadar başarılan eylem → have been able to + V₁'},
            {q:'A: ....... we drive to Sultan Ahmet in our new car? B: Well, I ....... take the ferry to avoid the traffic.',
             opts:['May / must','Can / would like','Must / prefer','Shall / would sooner'],
             cor:'d', hint:'Shall I/we = öneri/teklif; would sooner = would rather (tercih)'},
            {q:'....... you do me a favour please? ....... you ask Mrs Green if the interview room is available?',
             opts:['Might / May','May / Could','Would / Do','Shall / Might','Could / Would'],
             cor:'e', hint:'Could/Would → kibarca rica (Could you...? / Would you...?)'},
            {q:'I was falling asleep while I was typing my speech last night. The only way I ....... awake was by drinking lots of strong coffee.',
             opts:['ought to stay','would rather stay','have stayed','may stay','could stay'],
             cor:'e', hint:'Geçmişte tek yol / mümkün olan → could stay'},
            {q:'....... you hold this shelf here while I go and get my hammer?',
             opts:['May','Must','Should','Will'],
             cor:'d', hint:'Will you...? → kibarca yardım isteği (informal)'},
            {q:'The tyres of my car ....... thin already. I only replaced them in January. I\'ll have to buy better quality ones next time.',
             opts:['shouldn\'t have worn','needn\'t have worn','didn\'t wear','aren\'t supposed to wear'],
             cor:'d', hint:'Beklenti dışı → aren\'t supposed to wear (olmaması gerekirdi)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 21-30 ── */
    {
        label: 'Set 4',
        questions: [
            {q:'According to their letter, we ....... them with a copy of our company\'s accounts before we can order any cars on contract hire.',
             opts:['have supplied','have to supply','may have supplied','used to supply'],
             cor:'b', hint:'Şart/zorunluluk → have to + V₁'},
            {q:'I suppose I ....... to type his report for him, but, at the time, I didn\'t know how important it was.',
             opts:['have had to offer','may have offered','could have offered','would rather offer'],
             cor:'c', hint:'Geçmişte mümkün ama yapılmamış → could have V₃'},
            {q:'A: Why is Mum still in hospital? She ....... home today. B: They wanted to do some more tests.',
             opts:['must have come','was supposed to come','had better come','used to come'],
             cor:'b', hint:'Beklenip gerçekleşmeyen → was supposed to + V₁'},
            {q:'I\'d like to have some people for dinner tonight, but it is too late to ask anyone because they ....... their plans already.',
             opts:['had better make','used to make','are making','may have made'],
             cor:'d', hint:'Geçmişe dair olasılık → may have V₃'},
            {q:'George ....... better in the tennis tournament than I thought he ....... because he got through to the finals.',
             opts:['must have played / could','will have played / ought to','should be playing / did','ought to play / can'],
             cor:'a', hint:'Güçlü geçmiş çıkarım → must have V₃; could (geçmiş yetenek)'},
            {q:'Ever since he took on this part-time job, he ....... enough time on his studies.',
             opts:['can\'t spend','isn\'t able to spend','hasn\'t been able to spend','wasn\'t able to spend'],
             cor:'c', hint:'ever since + Present Perfect → hasn\'t been able to'},
            {q:'Now that they have raised the prices at the gym, I ....... going there, or I\'ll have difficulty paying it.',
             opts:['must have stopped','used to stop','had better stop','might have stopped'],
             cor:'c', hint:'Güçlü tavsiye / öneri → had better + V₁'},
            {q:'My brother\'s eyesight is perfect, but I ....... glasses since I was seven years old.',
             opts:['ought to wear','must have worn','have to wear','had better wear','have had to wear'],
             cor:'e', hint:'Süregelen zorunluluk → have had to + V₁ (since)'},
            {q:'Would you mind if I ....... these trade magazines home to read? I never get time to read them in the office.',
             opts:['to take','took','am taking','taking'],
             cor:'b', hint:'Would you mind if + Past Simple (took) → kibarca izin isteği'},
            {q:'I am really surprised that Robby hasn\'t signed up yet for the skiing holiday. He ....... the first to book every year.',
             opts:['will be','may have been','would be','could be','used to be'],
             cor:'e', hint:'Geçmişteki tekrar eden alışkanlık → used to + V₁'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 31-40 ── */
    {
        label: 'Set 5',
        questions: [
            {q:'Your mother ....... a restaurant. She is such a wonderful cook. If she opened a restaurant, I\'m sure it would be full every night.',
             opts:['must have opened','used to open','should open','would open'],
             cor:'c', hint:'Tavsiye / öneri → should + V₁'},
            {q:'We ....... offices soon. I saw the boss this morning viewing the new office block next to the station.',
             opts:['would rather be moving','had better move','would have moved','may be moving'],
             cor:'d', hint:'Belirsiz gelecek tahmin → may be V-ing'},
            {q:'A: Peter in the accounts department retired yesterday. B: He ....... permanently yesterday. I saw him at his desk only this morning.',
             opts:['can\'t have left','ought not to leave','hasn\'t left','needn\'t have left'],
             cor:'a', hint:'Geçmişe dair kesin olumsuz çıkarım → can\'t have V₃'},
            {q:'A: Did you have a busy day? If you did, you ....... rushed off your feet without me there. B: No, I wasn\'t. It was quite a quiet day.',
             opts:['must have been','have been','used to be','would rather be'],
             cor:'a', hint:'Geçmişe dair güçlü çıkarım → must have been'},
            {q:'I was just about to buy a new pair when my handbag was found with my glasses still inside, so I ....... a new pair after all.',
             opts:['needn\'t have bought','mustn\'t buy','wasn\'t supposed to buy','shouldn\'t have bought'],
             cor:'e', hint:'Yapmadın ve gerek de yoktu → didn\'t need to buy (needn\'t have = yaptın ama gerekmiyordu)'},
            {q:'A: Why is she still perspiring? She ....... too hot — I\'ve taken her jumper off. B: In that case, she ....... a fever. You\'d better take her temperature.',
             opts:['can\'t be / must have','isn\'t / would rather have','wouldn\'t be / is having','needn\'t be / ought to have'],
             cor:'a', hint:'Olumsuz çıkarım → can\'t be; pozitif çıkarım → must have'},
            {q:'Please Mum, ....... I watch the film tonight? I have finished all my homework.',
             opts:['would','may','do','should'],
             cor:'b', hint:'May I...? → izin isteme (resmi/kibarca)'},
            {q:'I really miss Istanbul. On summer evenings, we ....... along the coast by the Sea of Marmara when the Sun was setting behind Kınalıada.',
             opts:['ought to walk','have walked','would walk','had walked'],
             cor:'c', hint:'Geçmişteki tekrar eden alışkanlık → would + V₁'},
            {q:'A: Julester looks so slim. B: Has she been dieting? A: Not that I\'m aware of. B: Well, she ....... very hard then.',
             opts:['must have been exercising','was exercising','had better exercise','was able to exercise'],
             cor:'a', hint:'Geçmişe dair güçlü çıkarım (kanıta dayalı) → must have been V-ing'},
            {q:'You ....... a tie on Friday. They don\'t let men into the restaurant unless they are wearing a tie.',
             opts:['would wear','must wear','can wear','may wear'],
             cor:'b', hint:'Zorunluluk (kural) → must + V₁'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 41-50 ── */
    {
        label: 'Set 6',
        questions: [
            {q:'Jennifer ....... the promotion that she is expecting as she hasn\'t reached her sales target yet.',
             opts:['shouldn\'t have got','hadn\'t got','didn\'t use to get','wasn\'t getting','may not get'],
             cor:'e', hint:'Gelecekte olası olumsuzluk → may not + V₁'},
            {q:'Mum, according to what the doctor instructed you to do, you ....... any salt on your food, you know!',
             opts:['needn\'t have put','didn\'t use to put','haven\'t put','don\'t have to put','aren\'t supposed to put'],
             cor:'e', hint:'Dışarıdan gelen kurala aykırılık → aren\'t supposed to + V₁'},
            {q:'Alfred ....... his ankle badly as we ....... in the mountains last Saturday.',
             opts:['used to sprain / hiked','has sprained / could be hiking','must have sprained / have hiked','sprained / were hiking'],
             cor:'d', hint:'Geçmişte ani eylem + arka plan → Past Simple + Past Continuous'},
            {q:'....... I look after Katie for a couple of hours so that you and Kevin can go to the cinema?',
             opts:['Would','Let','Do','Did','Shall'],
             cor:'e', hint:'Shall I/we...? → teklif etme (offer)'},
            {q:'During the railway workers\' strike, many commuters ....... a taxi to and from work by coming together three or four people.',
             opts:['have been hiring','had to hire','ought to hire','will be hiring'],
             cor:'b', hint:'Geçmişte zorunluluktan yapılan → had to + V₁'},
            {q:'We ....... by the river, but unfortunately, the riverside car park was full.',
             opts:['should be parking','had parked','had better park','were going to park'],
             cor:'d', hint:'Gerçekleşmeyen geçmiş plan → were going to + V₁'},
            {q:'You ....... some more appointments to get some more business. You\'re never going to achieve your sales target at this rate.',
             opts:['used to make','were making','should make','have made'],
             cor:'c', hint:'Tavsiye/öneri → should + V₁'},
            {q:'You haven\'t got time to do the gardening. I think you ....... a gardener, don\'t you think so?',
             opts:['ought to employ','have employed','are employing','must have employed'],
             cor:'a', hint:'Tavsiye → ought to + V₁'},
            {q:'I\'m glad that you ....... your father to let you come on this trip with us. It wouldn\'t be so enjoyable without you!',
             opts:['must have persuaded','could have persuaded','might be persuading','were able to persuade'],
             cor:'d', hint:'Geçmişte başarılan tek seferlik eylem → were able to + V₁'},
            {q:'Bana daha fazla ayrıntı vermeyi reddettiğiniz için sizi mahkemede savunamayacağımı üzülerek bildiriyorum.',
             opts:['Your refusal to give me further information was the reason why I had to inform you.','I\'m sorry that I can\'t defend you in court because you haven\'t given me all the particulars.','Your refusal to provide further particulars led to my refusal to defend you.','Since you refuse to give me further particulars, I regret to inform you that I won\'t be able to defend you in court.'],
             cor:'d', hint:'reddettiğiniz için → Since you refuse; savunamayacağımı → won\'t be able to defend'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 51-60 (çeviri) ── */
    {
        label: 'Set 7',
        questions: [
            {q:'Mutfak penceresinin önündeki çam ağacını kesmek zorunda kaldılar çünkü binanın temeline zarar veriyordu.',
             opts:['If they hadn\'t cut down the old pine tree, it might have damaged the foundations.','They were forced to cut down the pine tree for fear that it would damage the foundations.','They had to cut down the pine tree in front of the building because it was blocking the kitchen window.','They only cut down the old pine tree when it started to damage the foundations.','They had to cut down the pine tree in front of the kitchen window as it was damaging the foundations of the building.'],
             cor:'e', hint:'kesmek zorunda kaldılar → had to cut down; zarar veriyordu → was damaging'},
            {q:'Bir ev hanımının dünyası sadece mutfak ve çocuk odasıyla sınırlı olmamalıdır.',
             opts:['She shouldn\'t restrict her world to that of a housewife, merely working in the kitchen and the nursery.','A housewife\'s world should not be restricted to just the kitchen and the nursery.','A housewife\'s life should also include experiences outside the kitchen and the nursery.','As a housewife, her world has been restricted to the kitchen and the nursery.'],
             cor:'b', hint:'sınırlı olmamalıdır → should not be restricted; sadece mutfak ve çocuk odası → just the kitchen and the nursery'},
            {q:'Her şeyi tek başına yapmaya çalışmak yerine, bizden ya da profesyonel birinden yardım isteyebilirdin.',
             opts:['You didn\'t need to ask for a professional\'s help as, with our help, you were able to manage everything.','It would have been better if you had asked for our or a professional\'s help.','You could have asked for our or a professional\'s help instead of trying to do everything on your own.','Instead of doing everything all alone, you should have asked for our help.'],
             cor:'c', hint:'yardım isteyebilirdin → could have asked; tek başına yapmaya çalışmak yerine → instead of trying to do everything on your own'},
            {q:'Birkaç emlakçıya uğrayıp kiralarla ilgili genel bir fikir edinince, o bölgede oturmaya gücümüzün yetmeyeceğini anladık.',
             opts:['When we\'d called at a few estate agents\' and got a general opinion of the rents, we realised that we couldn\'t afford to live in that area.','After we\'d asked several estate agents for their opinion, it became obvious that we couldn\'t afford to live around there.','Though we were aware that the area was unaffordable for us, we still visited a few estate agents.','Most of the estate agents we visited held the opinion that the rents were too high for us.'],
             cor:'a', hint:'uğrayıp fikir edinince → called at...and got a general opinion; gücümüzün yetmeyeceğini → couldn\'t afford'},
            {q:'Since my sister was very shy as a child, whenever she was invited to a party, she would make up an excuse and not want to go.',
             opts:['Kardeşim çok çekingen bir çocuk olduğu için bir partiye davet edildiğinde hemen bir mazeret uydurur ve gitmezdi.','Kardeşim çocukken çok çekingen olduğu için ne zaman bir partiye davet edilse, bir mazeret uydurur gitmek istemezdi.','Çocuğundan beri çok çekingen olan kardeşim ne zaman bir partiye davet edilse hemen bir mazeret uydurur ve gitmek istemez.','Çocukken çok çekingen olan kardeşim istemediği partilere katılmamak için mutlaka bir mazeret bulurdu.'],
             cor:'b', hint:'since + would → çocukken + alışkanlık; ne zaman davet edilse = whenever'},
            {q:'Parents should not be too permissive with their children, or they may lose their control over them completely when the children grow up.',
             opts:['Çocukları büyüdüğünde onlar üzerindeki kontrollerini tamamen yitirmiş olan ebeveynler küçükken onlara karşı çok tavizkar davranmış olmalılar.','Ebeveynlerin çocuklarına karşı fazla tavizkar olmaması gerekir yoksa çocuklar büyüdüklerinde onları kontrol etmek zor olur.','Çocuklarına karşı fazla tavizkar olan ebeveynler çocukları büyüdüğünde onların üzerindeki kontrollerini tamamen yitirirler.','Ebeveynler çocuklarına karşı fazla tavizkar olmamalılar yoksa çocuklar büyüdüğünde onlar üzerindeki kontrollerini tamamen yitirebilirler.'],
             cor:'d', hint:'should not + or they may → olmamalı yoksa yitirebilirler; may = yitirebilirler (olasılık)'},
            {q:'Even the owners of the houses not damaged during the earthquake could not return to their houses for days due to fear.',
             opts:['Evleri hasar görmediği halde bazı insanlar depremden sonra günlerce içeri girmekten korktu.','İnsanlar, depremden günler sonra, hiç hasar görmemiş evlere bile korkarak girebildiler.','Depremden günler sonra, yıkılmayan evlerin sahipleri bile korkudan evlerine giremiyorlardı.','Depremde hasar görmemiş evlerin sahipleri bile, korkudan günlerce evlerine giremediler.'],
             cor:'d', hint:'even the owners → sahipleri bile; could not return for days due to fear → korkudan günlerce giremediler'},
            {q:'In an effort to sabotage others\' computers, some users, called hackers, create software that can damage a computer\'s programs or data.',
             opts:['Başkalarının bilgisayarlarını sabote etmek amacıyla, hacker adı verilen bazı kullanıcılar, bilgisayarın programlarına ya da verilerine zarar verebilen programlar üretiyorlar.','Başka bilgisayarları sabote etmek için, bilgisayarın programlarına zarar veren programlar üreten kişilere hacker denir.','Hacker adı verilen bazı kullanıcılar, bilgisayarların hem programlarına hem de verilerine zarar verebilen programlar üreterek başkalarının bilgisayarlarını sabote etmektedir.','Hacker diye adlandırılan bazı sabotajcılar, bilgisayar programları üreterek başkalarının bilgisayarlarına zarar vermeye çalışmaktadır.'],
             cor:'a', hint:'In an effort to sabotage → amacıyla; can damage → zarar verebilen'},
            {q:'Although they seem to offer an escape from problems for a few hours, in fact, drugs create more problems than solutions.',
             opts:['Sorunlardan sadece birkaç saatliğine kaçış sağlamaya yarayan uyuşturucular aslında sorunları daha da büyütürler.','Uyuşturucular sorunları gerçek anlamda çözmez, sadece kişiyi birkaç saatliğine sorunlardan uzaklaştırır.','Birkaç saatliğine sorunlardan kaçış sağlıyor gibi görünseler de aslında uyuşturucular çözümden daha çok sorun yaratırlar.','Sorunlarından sadece birkaç saatliğine uzaklaşmak için uyuşturuculara başvuran biri, gerçekte kendine daha büyük bir sorun yaratmıştır.'],
             cor:'c', hint:'Although they seem to offer = görünseler de; create more problems than solutions = çözümden daha çok sorun yaratırlar'},
            {q:'Everyone should save water as it is not only economical but also resourceful.',
             opts:['All of us must have used less water as we have saved a lot of money on our water bill.','Every person must try to use less water not in order to save money but to save valuable resources.','Everybody ought to save water because by doing so, they will save both money and this resource.','Using less water should be everybody\'s concern as it saves valuable resources.'],
             cor:'c', hint:'Everyone should → Everybody ought to; not only economical but also resourceful → save both money and this resource'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 61-75 (eşanlamlı cümle) ── */
    {
        label: 'Set 8',
        questions: [
            {q:'I will let you take the dog for a walk, but you are not to take off its lead at any time.',
             opts:['I will allow you to walk the dog; however, you must not take his lead off at all.','Our dog should not be let off his lead at any time, so you can\'t take it for a walk.','We used to take off the dog\'s lead during walks, but now I find it dangerous.','You were supposed to take the dog\'s lead off while you were walking it.'],
             cor:'a', hint:'are not to = must not; you are not to take off its lead → you must not take his lead off'},
            {q:'You might have difficulty finding the files for some of these customers on the list, so ask me if you need any help.',
             opts:['Perhaps you would have found it easier if you had asked for my assistance.','I could have helped you find the files, but I didn\'t know you were having trouble.','You were supposed to find the files on all of these customers on your own.','Ask me if you require assistance as it is possible that you won\'t find all these customers\' files easily.'],
             cor:'d', hint:'might have difficulty = it is possible that you won\'t find easily; ask me if you need help'},
            {q:'If you would prefer us not to supply an alarm with the vehicle, we can provide a cheaper price.',
             opts:['I\'m afraid we cannot supply an alarm with the vehicle at such a cheap price.','We would much rather supply an alarm with the vehicle, but this increases the price.','Would you like us to supply an alarm with the vehicle, which we will include in our price?','We can give you a better price if you would rather we didn\'t supply the vehicle with an alarm.'],
             cor:'d', hint:'prefer us not to → would rather we didn\'t; cheaper price → better price'},
            {q:'If we can get a baby-sitter on Saturday, let\'s go for a meal at that Italian restaurant by the river.',
             opts:['We should have got a baby-sitter on Saturday, so we could have gone for an Italian meal by the river.','Why don\'t we eat at that Italian restaurant by the river on Saturday if we can find someone to look after the baby?','Shall we ask our baby-sitter to stay up for Saturday night so that we can go to the Italian restaurant?','We needn\'t have hired someone to look after the baby on Saturday.'],
             cor:'b', hint:'let\'s go = why don\'t we; if we can get a baby-sitter = if we can find someone to look after the baby'},
            {q:'I\'ve just learned from the doctor that Peter has to stay in hospital until they remove his stitches.',
             opts:['According to what the doctor has just told me, Peter can only leave the hospital after they have taken his stitches out.','The doctor has just informed me that Peter wants to leave the hospital as soon as they have taken his stitches out.','According to the doctor, they might allow Peter to go home from the hospital when they have taken his stitches out.','I know that Peter has to stay in hospital a little longer because the doctors still haven\'t taken his stitches out.'],
             cor:'a', hint:'has to stay until they remove → can only leave after they have taken out'},
            {q:'Rather than buying curtains, why don\'t we make them ourselves?',
             opts:['I would rather buy some curtains than make my own.','Would you rather buy curtains or make them yourself?','Let\'s make our own curtains instead of buying some ready-made ones.','I wouldn\'t mind making our own curtains, if you don\'t want to buy any.'],
             cor:'c', hint:'rather than buying = instead of buying; why don\'t we make = let\'s make'},
            {q:'We used to walk around the shopping-centre for ages doing nothing but window-shopping when we were teenagers.',
             opts:['When we were teenagers, we went to the shopping-centre very often but rarely bought anything.','It used to take us hours to decide what to buy at the shopping-centre when we were teenagers.','For ages, window-shopping at big centres has always been quite exciting for teenagers.','As teenagers, we would spend hours at the shopping-centre just looking in the shop windows.'],
             cor:'d', hint:'used to walk = would spend; doing nothing but window-shopping = just looking in the shop windows'},
            {q:'It is impossible for us to give you a further discount on this price.',
             opts:['We can only offer you another small discount on this price, and that\'s all.','There is no way we can reduce this price further.','We shouldn\'t have reduced the price so much.','Seeing as you can\'t afford it, we\'ll have to drop our price.'],
             cor:'b', hint:'it is impossible for us = there is no way; give you a further discount = reduce this price further'},
            {q:'You ought to have asked for the departure times of the trains yesterday.',
             opts:['You shouldn\'t have left home yesterday without knowing the departure times for trains.','It was a mistake on your part not to have found out departure times for trains yesterday.','You were supposed to find out the departure times for trains yesterday, not today.','You couldn\'t have learned the departure times for trains yesterday even if you\'d tried to.'],
             cor:'b', hint:'ought to have asked = it was a mistake not to have found out'},
            {q:'He had better hand me his report today, or I\'ll inform the manager.',
             opts:['The manager ought to deal with employees who fail to give me their reports.','He was supposed to hand me his report today, but he didn\'t, so I\'ve told the manager.','I had no alternative but to tell the manager because he failed to give me his report again.','I\'ll let the manager know if he fails to give me his report today.'],
             cor:'d', hint:'had better ... or I\'ll inform = I\'ll let the manager know if he fails'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 66-75 (çeviri & eşanlamlı devam) ── */
    {
        label: 'Set 9',
        questions: [
            {q:'Would you mind if I picked you up half an hour later?',
             opts:['I won\'t be able to get there to pick you up for half an hour.','Would you pick me up thirty minutes later than usual, if you don\'t mind?','If that\'s all right with you, can I pick you up thirty minutes later?','Can I collect you in half an hour if that won\'t make you late for work?'],
             cor:'c', hint:'Would you mind if I... = If that\'s all right with you, can I...?'},
            {q:'He must have been on his way to class; otherwise, he would have stopped to chat.',
             opts:['I\'m pretty sure he was on his way to his lesson and couldn\'t stop to talk.','I saw him on his way to his lesson, but he still had time to stop and talk.','I saw him going to his lesson, but, instead of stopping to chat, he ignored me.','If he had been on his way to class, he wouldn\'t have stopped for a chat.'],
             cor:'a', hint:'must have been = I\'m pretty sure he was; otherwise, he would have stopped = and couldn\'t stop'},
            {q:'It\'s possible that he hurt your feelings unintentionally.',
             opts:['You may not have heard him properly.','He might not have meant to hurt your feelings.','He should have told you about that without hurting your feelings.','He couldn\'t have explained this without hurting your feelings.'],
             cor:'b', hint:'it\'s possible that he... unintentionally = He might not have meant to...'},
            {q:'However worthless they may seem to most of us, antique hand-crafted buttons are avidly collected by enthusiasts.',
             opts:['In the opinion of many, collecting antique hand-crafted buttons is a complete waste of time.','Most of us may not be aware of the value of hand-crafted buttons; however, enthusiasts spend a fortune on them.','It\'s surprising how many people are enthusiastically taking up the hobby of collecting antique buttons.','Collectors enthusiastically make antique hand-crafted button collections despite their apparent worthlessness to most of us.'],
             cor:'d', hint:'however worthless = despite their apparent worthlessness; avidly collected by enthusiasts = collectors enthusiastically make collections'},
            {q:'Kızkardeşinin düğünü için aldığı elbise son moda olabilir ama ona hiç yakışmamış.',
             opts:['The fashionable dress she has bought to wear to her sister\'s wedding doesn\'t suit her at all.','I don\'t think the dress she bought for her sister\'s wedding suits her at all, but at least it is the latest fashion.','The dress she bought for her sister\'s wedding may be the latest fashion, but it didn\'t suit her at all.','Her sister\'s wedding dress was the latest fashion, but I didn\'t think it really suited her.'],
             cor:'c', hint:'son moda olabilir ama → may be the latest fashion, but; hiç yakışmamış → it didn\'t suit her at all'},
            {q:'Babamı, daha büyük bir eve taşınmamız konusunda ikna etmek için çok fazla uğraşmam gerekmedi; çünkü o da bir süredir aynı şeyi düşünüyormuş.',
             opts:['Persuading my father about moving to a larger home was easy as he had also been thinking it might be a good idea.','I realised that I needn\'t have tried so hard to persuade my father to move into a bigger house as he had had the same idea some time ago.','I didn\'t need to try hard to persuade my father about moving to a bigger house as he\'d been thinking about the same thing for some time.','My father had been considering moving to a bigger house for some time anyway, so he didn\'t need much persuasion from me.'],
             cor:'c', hint:'çok fazla uğraşmam gerekmedi → didn\'t need to try hard; bir süredir aynı şeyi düşünüyormuş → had been thinking about the same thing'},
            {q:'Eskiden insanlar modern çağın pek çok nimetlerinden yoksundular; ama bence günümüz insanından çok daha mutluydular.',
             opts:['I believe that people in the past, even though they didn\'t have the benefits of modern times, were in general happier than today\'s people.','In the past, people lived without many modern comforts, but, in my opinion, they were even happier than most people today are.','The modern age has brought people many benefits, yet my opinion is that we are not happier than people in the past were.','In the past, people used to lack many benefits of the modern age, but, in my opinion, they were a lot happier than today\'s people.'],
             cor:'e', hint:'eskiden yoksundular + bence çok daha mutluydular → used to lack + a lot happier than today\'s people'},
            {q:'Kitabı okumuş olamazsın; çünkü kitabın ne hakkında olduğu konusunda bile hiçbir fikrin yok.',
             opts:['You could have read the book just in order to understand what it is about.','If you had read the book, you would have some idea what it is about.','You don\'t even know what the book is about, so it is clear that you haven\'t read it.','You can\'t have read the book as you don\'t even have an idea what it is about.'],
             cor:'d', hint:'okumuş olamazsın → can\'t have read; fikrin yok → you don\'t even have an idea'},
            {q:'Kompozisyon yazarken konudan uzaklaşmamaya özellikle dikkat etmelisiniz.',
             opts:['When you write a composition, you must remember to keep to the main point.','It is very important not to wander from the point when you write a composition.','You must pay special attention not to wander from the point when you write a composition.','It is best to focus on one main point in written compositions.'],
             cor:'c', hint:'özellikle dikkat etmelisiniz → must pay special attention; konudan uzaklaşmamaya → not to wander from the point'},
            {q:'I was relieved to learn that I didn\'t have to decide immediately, and that they could wait until the end of the week.',
             opts:['Hafta sonuna kadar bekleyebileceklerini söyledikleri için hemen karar vermek zorunda değildim.','Hafta sonuna kadar bekleyebilecekleri için hemen karar vermek zorunda olmamak beni çok rahatlattı.','Karar vermek için hafta sonuna kadar vaktim vardı çünkü bir süre bekleyebileceklerini duymuştum.','Hemen karar vermek zorunda olmadığımı, hafta sonuna kadar bekleyebileceklerini öğrenince rahatladım.'],
             cor:'d', hint:'I was relieved to learn that → öğrenince rahatladım; didn\'t have to decide immediately → hemen karar vermek zorunda olmadığımı'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 1-10 ── */
    {
        label: 'Set 10',
        questions: [
            {q:'You ....... the meeting this week if you are too busy. There is going to be another one next week and you ....... to that one.',
             opts:['might not attend / would go','needn\'t attend / can go','can\'t attend / have gone','won\'t have attended / go'],
             cor:'b', hint:'Zorunluluk yok → needn\'t attend; imkân/seçim → can go'},
            {q:'You look as if you are having trouble with your homework. ....... you like me to help you with it?',
             opts:['Could','Did','May','Would'],
             cor:'d', hint:'Would you like me to...? → yardım teklifi'},
            {q:'I thought that I had my keys with me, but I can\'t find them in my coat. I ....... them in my other coat.',
             opts:['am supposed to leave','am able to leave','would rather have left','must have left'],
             cor:'d', hint:'Güçlü geçmiş çıkarım → must have V₃'},
            {q:'I\'ve heard that Mr Benner is the toughest teacher for this course. You ....... to get another teacher, or you can\'t get a good mark.',
             opts:['had better try','must have tried','have tried','would try'],
             cor:'a', hint:'Güçlü tavsiye/uyarı → had better + V₁'},
            {q:'You ....... to bed early the night before an exam. A good night\'s sleep will do you more good than studying all night.',
             opts:['will have gone','may go','ought to go','would go'],
             cor:'c', hint:'Tavsiye → ought to + V₁'},
            {q:'Would you mind ....... your music so loudly? I\'m trying to study.',
             opts:['not play','not playing','didn\'t play','not to play'],
             cor:'b', hint:'Would you mind + not + V-ing → olumsuz kibarca rica'},
            {q:'The former president never ....... to the press, but this one is much more accessible.',
             opts:['could have talked','should be talking','must have talked','has to talk','used to talk'],
             cor:'e', hint:'Geçmişteki olumsuz alışkanlık → never used to + V₁'},
            {q:'Hurray! We ....... to school today because it is snowing so hard.',
             opts:['haven\'t been going','shouldn\'t have gone','must not have gone','don\'t have to go'],
             cor:'d', hint:'Zorunluluk yok → don\'t have to + V₁'},
            {q:'Wilber ....... smoking and eating meat after his heart attack, but he didn\'t and now he has had a second one.',
             opts:['should have stopped','must have stopped','was able to stop','will have stopped'],
             cor:'a', hint:'should have V₃ → yapmalıydı ama yapmadı'},
            {q:'According to the weather report, it ....... tomorrow, and if it does, we ....... the hike I\'ve been looking forward to.',
             opts:['ought to rain / cancelled','must rain / were able to cancel','may rain / will have to cancel','would be raining / had to cancel'],
             cor:'c', hint:'Olasılık → may + V₁; zorunlu sonuç → will have to + V₁'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 11-20 ── */
    {
        label: 'Set 11',
        questions: [
            {q:'I know you have a lot of work to do, but it is your own fault; you ....... everything until the last minute.',
             opts:['can\'t have left','might not leave','must not have left','shouldn\'t have left'],
             cor:'d', hint:'should have V₃ olumsuz → shouldn\'t have V₃; yapmamalıydın ama yaptın'},
            {q:'I\'d really rather ....... in Hawaii at the moment than stuck behind this desk all day.',
             opts:['I am surfing','to be surfing','to surf','have surfed','be surfing'],
             cor:'e', hint:'would rather + be + V-ing (şu an için hayali durum)'},
            {q:'You ....... your plane ticket so far in advance because flights to Birmingham are never full.',
             opts:['can\'t buy','needn\'t have bought','didn\'t use to buy','haven\'t bought'],
             cor:'b', hint:'needn\'t have V₃ → satın aldın ama gerekmiyordu'},
            {q:'In Iran and Saudi Arabia, all women ....... their heads outside of the house, but in most Muslim countries it is optional.',
             opts:['have to cover','must have covered','could be covering','might cover'],
             cor:'a', hint:'Dış kaynaklı zorunluluk (kural/kanun) → have to + V₁'},
            {q:'I ....... a stockbroker if I had wanted to, but I thought life as a bass guitarist in a heavy metal band would be far more interesting.',
             opts:['was able to become','may have become','had become','could have become'],
             cor:'d', hint:'Geçmişte mümkündü ama yapılmadı → could have V₃'},
            {q:'You ....... more carefully. Now the insurance company won\'t pay you anything because the accident was your fault.',
             opts:['must have been driving','should be driving','had been driving','ought to have been driving'],
             cor:'d', hint:'Yapmalıydın ama yapmadın (süregelen) → ought to have been V-ing'},
            {q:'I\'d rather you ....... out tonight because, according to the news, there could be trouble downtown.',
             opts:['haven\'t gone','not to go','didn\'t go','won\'t go'],
             cor:'c', hint:'would rather + subject + Past Simple → I\'d rather you didn\'t go'},
            {q:'A friend of mine told me that I ....... India in the summer, because that is the monsoon season.',
             opts:['didn\'t use to visit','needn\'t visit','haven\'t visited','might not visit','shouldn\'t visit'],
             cor:'e', hint:'Tavsiye → shouldn\'t + V₁ (git, zamanı uygun değil)'},
            {q:'Hawaii is such an expensive place to live and the wages are so low that you ....... very hard just to get by.',
             opts:['are able to work','have to work','have worked','must have worked'],
             cor:'b', hint:'Zorunluluk (geçim koşulu) → have to + V₁'},
            {q:'We had better hurry if we want to get back to the hotel before the curfew. No one ....... out after dark, except for the patrol forces.',
             opts:['could have been','is supposed to be','has been','has to be'],
             cor:'b', hint:'Kural/düzenleme → is not supposed to be (dış kaynaklı kısıtlama)'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 21-30 ── */
    {
        label: 'Set 12',
        questions: [
            {q:'Mike couldn\'t attend university because he ....... his family when his father died.',
             opts:['had to support','must have supported','could be supporting','has been supporting'],
             cor:'a', hint:'Zorunluluktan yapılan geçmiş → had to + V₁'},
            {q:'Petroleum deposits can occur almost anywhere — they ....... under deserts, under fertile land, or even under the sea.',
             opts:['ought to be','may be','must be','were'],
             cor:'b', hint:'Belirsiz olasılık → may + V₁'},
            {q:'Using the latest technology, including nuclear batteries, space scientists ....... to the furthest reaches of our solar system now.',
             opts:['were probing','may have probed','used to probe','are able to probe'],
             cor:'d', hint:'Şimdiki mümkün eylem (teknoloji sayesinde) → are able to + V₁'},
            {q:'When you are in the race, you ....... to run too fast in the first few laps because you will need plenty of energy for the final sprint.',
             opts:['haven\'t tried','shouldn\'t have tried','mustn\'t try','might not try'],
             cor:'c', hint:'Kesin uyarı/yasak → mustn\'t + V₁'},
            {q:'There are some sounds that are out of the range of the human ear but which dogs ....... .',
             opts:['ought to hear','have heard','can hear','have to hear'],
             cor:'c', hint:'Doğal yetenek (genel gerçek) → can + V₁'},
            {q:'My sister ....... a German teacher because her German was fluent, but she decided to become an accountant instead.',
             opts:['has become','had to become','will become','could have become'],
             cor:'d', hint:'Geçmişte mümkündü ama yapılmadı → could have V₃'},
            {q:'You ....... me at work. The boss was really angry because he had warned me before about personal calls.',
             opts:['must not have phoned','shouldn\'t have phoned','didn\'t phone','didn\'t use to phone'],
             cor:'b', hint:'shouldn\'t have V₃ → yapmamalıydın ama yaptın'},
            {q:'Sally ....... Italian like a native, but since she moved to Indiana, she has forgotten most of it.',
             opts:['used to speak','had spoken','was supposed to speak','has been speaking'],
             cor:'a', hint:'Geçmişteki alışkanlık/durum (artık değil) → used to + V₁'},
            {q:'While there seem to be plenty of unexploited petroleum reserves, some experts worry that there ....... enough to carry us through the next century.',
             opts:['may not be','haven\'t been','didn\'t use to be','don\'t have to be'],
             cor:'a', hint:'Gelecekteki belirsiz olumsuz olasılık → may not be'},
            {q:'Today no one can imagine what a battle at sea was like in the days of sail. It ....... both an impressive and a frightening sight.',
             opts:['might be','could be','ought to be','has been','must have been'],
             cor:'e', hint:'Geçmişe dair güçlü çıkarım → must have been'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 31-40 ── */
    {
        label: 'Set 13',
        questions: [
            {q:'When we went to Japan, we ....... anything for ourselves because our Japanese hosts took care of everything.',
             opts:['must not have done','needn\'t have done','didn\'t need to do','couldn\'t have done'],
             cor:'c', hint:'Yapmadın ve gerek de yoktu → didn\'t need to do (needn\'t have = yaptın ama gerekmiyordu)'},
            {q:'A: I hear a noise coming from the kitchen. B: My greedy brother ....... for something to eat.',
             opts:['must be looking','should have looked','used to look','ought to be looking'],
             cor:'a', hint:'Kanıta dayalı şimdiki çıkarım → must be V-ing'},
            {q:'A: Did you know that classes were cancelled yesterday? B: No, but I ....... anyway because I was in bed all day with flu.',
             opts:['didn\'t use to attend','won\'t be attending','must not have attended','couldn\'t have attended'],
             cor:'e', hint:'Geçmişte imkânsız → couldn\'t have V₃ (hastaydım)'},
            {q:'I know I ....... for a job, but there are so few jobs for a person of my abilities that it is discouraging.',
             opts:['had been looking','ought to look','must have looked','was able to look'],
             cor:'b', hint:'Tavsiye (ama yapmıyorum) → ought to + V₁'},
            {q:'I ....... the same computer program when I worked at a bank, so it ....... easy for me to adjust to this new job.',
             opts:['should be using / could be','used to use / should be','need to use / would be','must have used / must be'],
             cor:'b', hint:'Geçmişteki alışkanlık → used to use; koşullu tahmin → should be (kolaylıkla)'},
            {q:'He ....... as carefully as he claimed he was. Why did he bump into the lamp post then?',
             opts:['doesn\'t have to drive','isn\'t supposed to drive','won\'t have been driving','shouldn\'t have driven','can\'t have been driving'],
             cor:'e', hint:'Geçmişe dair kesin olumsuz çıkarım → can\'t have been V-ing'},
            {q:'Would you mind if I ....... early this afternoon? I have a dentist appointment at 4:30.',
             opts:['to leave','had left','leaving','left'],
             cor:'d', hint:'Would you mind if + Past Simple → kibarca izin isteği'},
            {q:'I\'m so glad that I ....... to the meeting place on time yesterday despite the heavy traffic, or the boss would have been really annoyed.',
             opts:['was able to get','have got','used to get','should have got'],
             cor:'a', hint:'Tek seferlik geçmiş başarı → was able to + V₁'},
            {q:'Sean ....... married three months ago and since then he ....... out drinking with his old friends.',
             opts:['had got / ought not to go','used to get / couldn\'t have gone','got / hasn\'t been able to go','has got / shouldn\'t be going'],
             cor:'c', hint:'three months ago → Past Simple (got); since then → Present Perfect (hasn\'t been able to go)'},
            {q:'These days, he ....... to stop smoking and playing cards as well because his wife is so strict with him.',
             opts:['used to try','is trying','tried','had to try'],
             cor:'d', hint:'Baskı sonucu zorunluluk → has to / had to + V₁'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 41-50 ── */
    {
        label: 'Set 14',
        questions: [
            {q:'It is hardly surprising that sometimes he gets depressed and wonders if he really ....... married.',
             opts:['could have got','must have got','used to get','had better get','ought to have got'],
             cor:'e', hint:'ought to have V₃ → yapmalıydı mıydı (pişmanlık/sorgulama)'},
            {q:'Though Sally ....... how to swim, when she met a young man who was a professional diver, she learned quickly.',
             opts:['hasn\'t known','might not know','can\'t know','wouldn\'t know','didn\'t know'],
             cor:'e', hint:'Geçmişteki bilgi eksikliği → didn\'t know (Simple Past)'},
            {q:'Our father never earned much money, but he ....... something nice for us whenever he ....... .',
             opts:['should buy / did','had to buy / does','would buy / could','must have bought / can'],
             cor:'c', hint:'Geçmişteki tekrar eden alışkanlık → would buy; whenever he could (yapabildiğinde)'},
            {q:'Where have you been? You ....... here at 2 o\'clock, and it\'s almost 3.',
             opts:['must have been','were supposed to be','were able to be','are going to be'],
             cor:'b', hint:'Beklenip gerçekleşmeyen → were supposed to be'},
            {q:'I told my flatmate to buy some bread, but he ....... because there isn\'t any here.',
             opts:['must have forgotten','ought to be forgetting','could forget','should have forgotten'],
             cor:'a', hint:'Kanıta dayalı güçlü geçmiş çıkarım → must have V₃'},
            {q:'Sue has only been in Egypt for a year and she already speaks Arabic fluently. She ....... it that quickly. I\'m sure she had started studying it before she left England.',
             opts:['shouldn\'t have learned','won\'t have learned','can\'t have learned','didn\'t use to learn'],
             cor:'c', hint:'Geçmişe dair kesin olumsuz çıkarım → can\'t have V₃ (bu kadar çabuk öğrenemezdi)'},
            {q:'Do you think Jeff ....... to join us on our hike? Does he like this sort of activity?',
             opts:['would rather','was able','has been able','had better','would like'],
             cor:'e', hint:'İstek/arzu sormak → would like to + V₁'},
            {q:'Sam is such a good swimmer that he ....... the Olympic record for the 100 metre race, but unfortunately, he didn\'t compete because of a pulled shoulder muscle.',
             opts:['is going to break','must have broken','could have broken','is supposed to break'],
             cor:'c', hint:'Geçmişte mümkündü ama olmadı → could have V₃'},
            {q:'I wonder what the problem was in the restaurant last night. Three members of staff ....... tables, but there was only one. I must speak to the restaurant manager.',
             opts:['could be clearing','ought to be clearing','should have been clearing','must have been clearing'],
             cor:'d', hint:'Kanıta dayalı geçmiş süregelen çıkarım → must have been V-ing'},
            {q:'Hey, watch where you are going! You ....... me!',
             opts:['could have killed','should have killed','have killed','will have killed'],
             cor:'a', hint:'could have V₃ → öldürebilirdin (ama öldürmedin); tehlike ikazı'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 51-65 (eşanlamlı cümle) ── */
    {
        label: 'Set 15',
        questions: [
            {q:'Would you mind if I borrowed your car to take my sick friend to the hospital?',
             opts:['Do you think I should drive my friend to the hospital? He seems very ill.','Would you give us a lift in your car to the hospital as my friend is very ill?','Did you bring your car, because I need to take my sick friend to the hospital?','Will you give me your permission to take my sick friend to the hospital in your car?'],
             cor:'d', hint:'Would you mind if I borrowed = Will you give me your permission to take...'},
            {q:'In spite of the many news reports, I am not sure he understands the gravity of what has happened.',
             opts:['The news reports have emphasized how serious the situation is, but he does not care at all.','Had it not been for the news reports, he would not have realised how serious the situation actually is.','Although what has occurred has been in the news a lot, I doubt that he is aware of its seriousness.','I feel sure that he would understand the seriousness of the situation if the news reports were more complete.'],
             cor:'c', hint:'in spite of the news reports, not sure = although...been in the news, I doubt that he is aware'},
            {q:'Private parcel delivery services provide a faster and more secure alternative to postal services, but they are relatively expensive.',
             opts:['International postal services are facing stiff competition from private parcel delivery services.','Although postal services around the world are cheaper, parcels have a better chance of arriving more quickly and securely through private parcel delivery services.','While it is more expensive to use local postal services, privatised parcel delivery services are faster and more secure.','Private parcel delivery services, with their faster, more economical and more efficient delivery, are driving postal services out of business.'],
             cor:'b', hint:'faster and more secure but expensive → Although cheaper postal services exist, private ones are faster and more secure'},
            {q:'He must have changed his phone number because I can\'t get hold of him.',
             opts:['He could have changed his phone number after I last got in touch with him.','He had to change his phone number because I couldn\'t get through to his old one.','It is possible that he\'ll change his phone number, but I won\'t know for sure until I talk to him.','He should have changed his phone number because no one could get in touch with him.','I am unable to get in contact with him, so it is highly likely that he has a new phone number.'],
             cor:'e', hint:'must have changed (güçlü çıkarım) = highly likely that he has a new number; can\'t get hold of = unable to get in contact'},
            {q:'As a student, I used to think that all my teachers wanted me to fail.',
             opts:['In spite of being a good student, I did badly because of the attitude of my teachers.','I was such a bad student that I got used to thinking that all my teachers wanted me to fail.','Though it sometimes seemed that all my teachers wanted me to fail, I knew that it was not true.','When I was a student, I held the belief that none of my teachers wanted to see me succeed.'],
             cor:'d', hint:'used to think that all wanted me to fail = held the belief that none wanted to see me succeed'},
            {q:'In order to be able to hand your essay in tomorrow, you had better stop making notes now and start typing.',
             opts:['Why don\'t you type your essay directly, without taking notes, if you are to hand it in tomorrow?','If you had wanted to finish your essay in time to hand in, you should have finished your note-taking yesterday.','I guess you stopped taking notes and started typing your essay in order to be able to get it ready for tomorrow.','It is time to stop note-taking and start typing; otherwise, you won\'t be able to give your essay in tomorrow.'],
             cor:'d', hint:'had better stop...and start → it is time to stop...and start; or you won\'t be able to hand in'},
            {q:'It was not necessary for me to study as hard as I actually did for the exam because it was easier than I expected.',
             opts:['I must not have studied as hard as I thought I did because the exam did not seem easy.','Having hardly studied for the exam, I was hoping that it would be easier than usual.','I didn\'t use to study very hard for my exams because I usually found them so easy.','Because I knew the exam was going to be easy, I studied very little for it.','The exam was not as difficult as I had anticipated, so I needn\'t have studied so hard for it.'],
             cor:'e', hint:'not necessary to study as hard = needn\'t have studied so hard; easier than expected = not as difficult as anticipated'},
            {q:'This can\'t be the house I grew up in because I don\'t recognise anything.',
             opts:['I should have come here to find my home before it changed so much.','It is not possible that this is the house where I spent my childhood as nothing is familiar to me.','As this is the house where I was raised, I am surprised that I recognise so little.','I am unable to tell if this is my childhood home or not because so much is unfamiliar.'],
             cor:'b', hint:'can\'t be = it is not possible that this is; I don\'t recognise anything = nothing is familiar'},
            {q:'It was only after he had lived in Egypt for five years that he was able to read the newspapers without much difficulty.',
             opts:['Although he had lived in Egypt for five years, he was still unable to decipher the articles.','While he could read the newspapers after five years in Egypt, he was still having great difficulty understanding them.','In spite of only having lived in Egypt for five years, he was able to read the main headings.','He had lived in Egypt for five years before he could understand the newspapers without finding it very difficult.'],
             cor:'d', hint:'only after five years was able to read = had lived for five years before he could read without difficulty'},
            {q:'Going into a house with your shoes on may be acceptable in the West, but it isn\'t in most of the East.',
             opts:['Though Westerners usually enter a house with their shoes on, they are careful not to do so if they are in the East.','You should remember when visiting the East that customs like not wearing footwear inside a home are very important.','The Western custom of going into a house wearing shoes is unacceptable in the majority of Eastern societies.','You should not wear shoes inside a house in some countries no matter how normal it might seem in your own country.'],
             cor:'c', hint:'may be acceptable in the West but not in most of East = Western custom is unacceptable in majority of Eastern societies'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 56-70 ── */
    {
        label: 'Set 16',
        questions: [
            {q:'Let\'s take a taxi instead of walking home even though it is expensive.',
             opts:['I wouldn\'t mind spending the extra money and going home by taxi although it is a nice walk.','Rather than spending the money on a taxi, why don\'t we walk home instead?','If we had enough money, we wouldn\'t have to walk home; instead, we could take a taxi.','In spite of the expense, I would rather we took a taxi home than walked.'],
             cor:'d', hint:'let\'s take a taxi instead of walking = I would rather we took a taxi than walked; even though expensive = in spite of the expense'},
            {q:'It is possible that this will be your last opportunity if you do not do well on the report.',
             opts:['I think it is better if you don\'t get another chance to do a report after the last one.','You will only get another chance if you have done your best on this report.','As soon as you are better, you will get another chance to do a good report.','You had better do a good job on the report, or you may never get another chance.'],
             cor:'e', hint:'it is possible that this will be your last = you may never get another chance; if you do not do well = or'},
            {q:'You can\'t have written this paper yourself because the English is perfect.',
             opts:['You did not write the paper in perfect English because you are not able to.','The English in this paper is so good that I know you must have worked hard on it.','It is not possible for this paper to be your own work because you are unable to write such flawless English.','You must not have worked very hard on this paper, or the English would have been perfect.'],
             cor:'c', hint:'can\'t have written yourself = it is not possible for this to be your own work; English is perfect = unable to write such flawless English'},
            {q:'It must have been a terrific feeling when you heard about your lottery win.',
             opts:['I\'m sure you felt great upon learning that you were the winner of the lottery.','I can imagine how you felt when you learned that you had almost won the lottery.','I guess your first feeling was fear when you heard about winning the lottery.','You should have felt better about all the money you won from the lottery.'],
             cor:'a', hint:'must have been a terrific feeling = I\'m sure you felt great; when you heard = upon learning'},
            {q:'You had better wait for the rain to stop before you leave, or you might catch a cold.',
             opts:['It is so cold and rainy that it would be a good idea for us not to leave just now.','It\'s likely that you\'ll catch cold in this rain, so you shouldn\'t leave until it stops.','You will certainly get cold and wet if you go out into this rain.','Do you really think it is a good idea to risk catching a chill in this rain?'],
             cor:'b', hint:'had better wait until rain stops = you shouldn\'t leave until it stops; or you might catch a cold = it\'s likely you\'ll catch cold'},
            {q:'Because it is both unknown and inevitable, death has always been a source of wonder and fear.',
             opts:['İnsanlar, kaçınılmaz olduğunu bildikleri ölüme karşı her zaman merakla karışık korku duymuşlardır.','Her zaman bir korku kaynağı olan ölüm, hem bilinmeyen hem de kaçınılmaz olduğu için hep merak edilmiştir.','Hem bilinmeyen hem de kaçınılmaz olduğu için ölüm her zaman bir merak ve korku kaynağı olmuştur.','Ölümün her zaman bir merak ve korku kaynağı olmasının nedeni hem bilinmemesi hem de kaçınılmaz olmasıdır.'],
             cor:'c', hint:'Because it is both unknown and inevitable → Hem bilinmeyen hem de kaçınılmaz olduğu için; source of wonder and fear → merak ve korku kaynağı'},
            {q:'By the end of the first nine months, most babies will be able to sit without support and balance well enough to play as they sit.',
             opts:['Dokuzuncu ayın sonunda bebekler, destek olmaksızın denge sağlayabilir ve oturarak oyun oynayabilirler.','İlk dokuz ayın sonunda bebek desteksiz oturabiliyorsa, oturarak oyun oynamasını sağlayacak dengeyi de kurabilir.','Dokuzuncu ayın sonunda, oturarak oyun oynayabilecek kadar denge sağlayabilen çoğu bebek desteksiz oturabilir.','İlk dokuz ayın sonunda çoğu bebek, desteksiz oturabilir ve otururken oyun oynayacak kadar denge sağlayabilir.'],
             cor:'e', hint:'By the end of the first nine months → İlk dokuz ayın sonunda; most babies will be able to → çoğu bebek yapabilir'},
            {q:'Pregnant women should avoid cigarettes and alcoholic beverages since these substances may harm the baby.',
             opts:['Hamile kadınlar sigara ve alkollü içeceklerden kaçınmalıdırlar çünkü bu maddeler bebeğe zarar verebilir.','Mademki sigara ve alkollü içecekler bebeğe zarar verebiliyor, hamile kadınlar bu maddelerden uzak durmalıdır.','Hamile kadınların sigara ve alkollü içeceklerden kaçınmasının nedeni bu maddelerin bebeğe zarar verme olasılığıdır.','Sigara ve alkollü içecekler bebeğe zarar verebileceğinden hamile kadınlar için bu maddeler sakıncalıdır.'],
             cor:'a', hint:'should avoid → kaçınmalıdırlar; since these substances may harm → çünkü zarar verebilir'},
            {q:'Accidents and suicides are the leading causes of deaths among youths and frequently are the result of alcohol and drug use.',
             opts:['Çoğunlukla alkol ve uyuşturucu kullanımının sonucu meydana gelen kaza ve intiharlar, gençler arasında en yaygın ölüm nedenleridir.','Kaza ve intihar, gençler arasında önde gelen ölüm nedenleridir ve çoğunlukla da alkol ve uyuşturucu kullanımının sonucudur.','Kaza ve intihar, gençler arasında alkol ve uyuşturucu bağımlılığı sonucu meydana gelen ve çoğunlukla ölümle sonuçlanan olaylardır.','Çoğunlukla gençler arasında başlıca ölüm nedeni olan kaza ve intihar olayları, alkol ve uyuşturucu kullanımının yaygınlaşmasının sonuçlarıdır.'],
             cor:'b', hint:'leading causes of deaths → önde gelen ölüm nedenleri; frequently result of alcohol and drug use → çoğunlukla alkol/uyuşturucunun sonucu'},
            {q:'Eskiden insanlar modern çağın pek çok nimetlerinden yoksundular; ama bence günümüz insanından çok daha mutluydular. (Modals bağlamı: used to / would)',
             opts:['I believe that people in the past, even though they didn\'t have the benefits of modern times, were in general happier than today\'s people.','In the past, people lived without many modern comforts, but, in my opinion, they were even happier than most people today are.','The modern age has brought people many benefits, yet my opinion is that we are not happier than people in the past were.','In the past, people used to lack many benefits of the modern age, but, in my opinion, they were a lot happier than today\'s people.'],
             cor:'d', hint:'eskiden yoksundular → used to lack; bence çok daha mutluydular → in my opinion, they were a lot happier'},
        ]
    },
    /* ── YENİ SET EKLEMEK İÇİN BURAYA KOPYALA ──────────────────
    {
        label: 'Set 17',
        questions: [
            {q:'Soru metni ___.',
             opts:['A seçeneği','B seçeneği','C seçeneği','D seçeneği'],
             cor:'a', hint:'Açıklama'},
        ]
    },
    ─────────────────────────────────────────────────────────── */
];

/* ── Set state ── */
let _mdSetIdx     = 0;
let _mdSetScore   = 0;
let _mdSetChecked = {};
let _mdSetAnswers = {};

const MD_BLANKS = [
    {q:'She ___ (can / past) run very fast when she was young.',                    ans:['could'],               hint:'Geçmişte genel yetenek → could'},
    {q:'Despite the storm, the rescue team ___ (was/were able to) save everyone.',  ans:['was able to','were able to'],hint:'Tek seferlik başarı → was/were able to'},
    {q:'You ___ (not/have to) come to the meeting; it has been postponed.',         ans:["don't have to","do not have to"], hint:'Zorunluluk yok → don\'t have to'},
    {q:'I ___ (needn\'t/past) have bought so much food; half of it went to waste.',  ans:["needn't have"], hint:'needn\'t have V₃ — yaptın ama gerek yoktu'},
    {q:'She ___ (should/past) listened to her doctor\'s advice. (dinlemedi)',         ans:['should have listened'],hint:'should have V₃ — yapmalıydın ama yapmadın'},
    {q:'The lights are on — someone ___ (must/present deduction) be home.',         ans:['must be'],             hint:'Güçlü çıkarım → must + V₁'},
    {q:'He ___ (must/past deduction) forgotten his keys. (unutmuş olmalı)',          ans:['must have forgotten'],hint:'Geçmiş çıkarım → must have V₃'},
];

const MD_MCQS = [
    {q:'We ___ be late for the meeting; the boss is strict about punctuality.',
     opts:["mustn't","don't have to","needn't","shouldn't"],
     cor:'a', hint:'Yasak (prohibition) → mustn\'t'},
    {q:'They ___ finish the project on time, but they failed. (yapabilirdi ama yapmadı)',
     opts:['must have','could have','should have','might have'],
     cor:'b', hint:'could have V₃ → yapabilirdi ama yapmadı'},
    {q:'Would you mind ___ the window? It\'s a bit cold.',
     opts:['to close','close','closed','closing'],
     cor:'d', hint:'Would you mind + Ving'},
    {q:'He ___ forgotten his umbrella — it\'s raining and he\'s soaking wet.',
     opts:['must have','could have','should have','might have'],
     cor:'a', hint:'Güçlü geçmiş çıkarım → must have V₃'},
    {q:'Students ___ submit their assignments by Friday. It\'s mandatory.',
     opts:['are supposed to','are about to','were supposed to','ought to'],
     cor:'a', hint:'Dış etkenden zorunluluk/beklenti → be supposed to (present)'},
    {q:'She prefers reading books ___ watching TV.',
     opts:['than','over','to','rather than'],
     cor:'c', hint:'prefer + noun/Ving + TO + noun/Ving'},
    {q:'They ___ have visited the museum yesterday — it was closed on Mondays.',
     opts:["couldn't","mustn't","shouldn't","mightn't"],
     cor:'a', hint:'Kesin imkânsızlık geçmiş → couldn\'t have V₃'},
    {q:"I ___ have taken an umbrella; it didn't rain at all. (tüh, aldım ama gereksizdi)",
     opts:["needn't","mustn't","couldn't","shouldn't"],
     cor:'a', hint:"needn't have V₃ — yaptın ama gerek yoktu"},
];

function mdExercises() {
    return _mdBuildExercisePage();
}

/* ════════════════════════════════════════════════════
   SET-BASED EXERCISE ENGINE
════════════════════════════════════════════════════ */
function _mdBuildExercisePage() {
    const set   = MD_SETS[_mdSetIdx];
    const total = set.questions.length;

    /* ── Set sekme butonları ── */
    const tabs = MD_SETS.map((s, i) =>
        `<button class="gr-set-tab${i === _mdSetIdx ? ' active' : ''}" onclick="mdSwitchSet(${i})">${s.label}</button>`
    ).join('');

    /* ── Soru kartları ── */
    const cards = set.questions.map((q, i) => {
        const letters = ['A','B','C','D','E'];
        const lv      = ['a','b','c','d','e'];
        const opts = q.opts.map((o, j) =>
            `<div class="gr-opt" id="md-sopt-${i}-${j}" onclick="mdSetOpt(${i},${j},'${lv[j]}')">
                <span class="gr-opt-letter">${letters[j]}</span>${o}
            </div>`
        ).join('');
        return `<div class="gr-q-card" id="md-sq-${i}">
            <div class="gr-q-num">SORU ${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}</div>
            <div class="gr-q-text">${q.q}</div>
            <div class="gr-mcq">${opts}</div>
            <button class="gr-chk-btn" style="margin-top:10px" onclick="mdCheckSetQ(${i})">Kontrol Et</button>
            <div class="gr-fb" id="md-sfb-${i}"></div>
        </div>`;
    }).join('');

    /* ── Navigasyon butonları ── */
    const prevBtn = _mdSetIdx > 0
        ? `<button class="gr-nav-btn" onclick="mdSwitchSet(${_mdSetIdx-1})">← Önceki Set</button>` : '';
    const nextBtn = _mdSetIdx < MD_SETS.length - 1
        ? `<button class="gr-nav-btn" onclick="mdSwitchSet(${_mdSetIdx+1})">Sonraki Set →</button>` : '';

    return mdH('✨ Pratik Yap', `Alıştırmalar — ${set.label}`,
               `${total} soruluk çoktan seçmeli test. Her soruyu anında kontrol edin.`)
    + `<div class="gr-set-tabs">${tabs}</div>
    <div class="gr-quiz-wrap">
        <div class="gr-score-bar">
            <span class="gr-score-label">Canlı Puan</span>
            <span class="gr-score-val" id="md-live-score">0 / ${total}</span>
        </div>
        ${cards}
        <button class="gr-submit-btn" style="background:linear-gradient(135deg,#d97706,#f59e0b)"
                onclick="mdSubmitSet()">🎯 Seti Değerlendir & Sonucu Gör</button>
        <div class="gr-result" id="md-result">
            <div class="gr-res-score" id="md-res-score" style="color:#d97706">0/${total}</div>
            <div class="gr-res-lbl">Toplam Puan</div>
            <div class="gr-res-msg" id="md-res-msg"></div>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px">
                <button class="gr-retry-btn" style="border-color:#d97706;color:#d97706"
                        onclick="mdRetrySameSet()">🔄 Aynı Seti Tekrarla</button>
                ${nextBtn ? `<button class="gr-retry-btn" style="border-color:#10b981;color:#10b981"
                        onclick="mdNextSet()">Sonraki Set →</button>` : ''}
            </div>
        </div>
        <div style="display:flex;gap:10px;justify-content:space-between;margin-top:16px">
            ${prevBtn}${nextBtn}
        </div>
    </div>`;
}

/* ════════════════════════════════════════════════════
   SET EXERCISE LOGIC
════════════════════════════════════════════════════ */
function _mdUpdSetScore() {
    const el = document.getElementById('md-live-score');
    if (el) el.textContent = `${_mdSetScore} / ${MD_SETS[_mdSetIdx].questions.length}`;
}

function mdSwitchSet(idx) {
    _mdSetIdx     = idx;
    _mdSetScore   = 0;
    _mdSetChecked = {};
    _mdSetAnswers = {};
    _mdRenderSection('exercises');
}

function mdSetOpt(qi, oi, letter) {
    const set = MD_SETS[_mdSetIdx];
    set.questions[qi].opts.forEach((_, j) => {
        const el = document.getElementById(`md-sopt-${qi}-${j}`);
        if (el) el.classList.remove('sel');
    });
    const el = document.getElementById(`md-sopt-${qi}-${oi}`);
    if (el) el.classList.add('sel');
    _mdSetAnswers[qi] = letter;
}

function mdCheckSetQ(i) {
    const q      = MD_SETS[_mdSetIdx].questions[i];
    const sel    = _mdSetAnswers[i];
    const fb     = document.getElementById(`md-sfb-${i}`);
    const card   = document.getElementById(`md-sq-${i}`);
    if (!fb) return;
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    const letters = ['a','b','c','d','e'];
    q.opts.forEach((_, j) => {
        const el = document.getElementById(`md-sopt-${i}-${j}`);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor)                       el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor)   el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = `✅ Doğru! ${q.hint}`;
        fb.className = 'gr-fb show ok';
        if (!_mdSetChecked[i]) { _mdSetScore++; _mdSetChecked[i] = true; _mdUpdSetScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = `❌ Yanlış. Doğru: ${q.cor.toUpperCase()}. ${q.hint}`;
        fb.className = 'gr-fb show bad';
        if (!_mdSetChecked[i]) _mdSetChecked[i] = 'wrong';
    }
}

function mdSubmitSet() {
    const set     = MD_SETS[_mdSetIdx];
    const total   = set.questions.length;
    const panel   = document.getElementById('md-result');
    const scoreEl = document.getElementById('md-res-score');
    const msgEl   = document.getElementById('md-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = `${_mdSetScore}/${total}`;
    const pct = Math.round((_mdSetScore / total) * 100);
    msgEl.textContent = pct >= 90 ? '🎉 Mükemmel! Modals konusunda gerçekten ustasın!'
                      : pct >= 70 ? '👏 Çok iyi! Birkaç yapıya daha odaklanman yeterli.'
                      : pct >= 50 ? '📚 İyi başlangıç. Notlara geri dön ve tekrar dene!'
                      : '💪 Daha fazla pratik yapalım. Özellikle modal çıkarım ve tavsiye yapılarına odaklan!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function mdRetrySameSet() { mdSwitchSet(_mdSetIdx); }
function mdNextSet()      { if (_mdSetIdx < MD_SETS.length - 1) mdSwitchSet(_mdSetIdx + 1); }

/* ════════════════════════════════════════════════════
   EXPOSE GLOBALS
════════════════════════════════════════════════════ */
window.openModalsSection = openModalsSection;
window._mdRenderSection  = _mdRenderSection;
window.mdSwitchSet       = mdSwitchSet;
window.mdSetOpt          = mdSetOpt;
window.mdCheckSetQ       = mdCheckSetQ;
window.mdSubmitSet       = mdSubmitSet;
window.mdRetrySameSet    = mdRetrySameSet;
window.mdNextSet         = mdNextSet;
/* legacy stubs (eski referanslar kırılmasın) */
window.mdCheckBlank      = () => {};
window.mdSelectOpt       = mdSetOpt;
window.mdCheckMCQ        = mdCheckSetQ;
window.mdSubmitAll       = mdSubmitSet;
