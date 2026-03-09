// ════════════════════════════════════════════════════════════════
// passive.js  —  Active / Passive & Causative Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Active-Passive-Causative notları (s. 31–36)
// ════════════════════════════════════════════════════════════════

let _paCurrentSection = 'overview';
let _paAnswers = {};
let _paChecked = {};
let _paScore = 0;
const PA_TOTAL = 15;

const PA_SECTIONS = [
    { id: 'overview',     label: 'Genel Bakış',               grp: 'Genel' },
    { id: 'concept',      label: '1. Temel Kavram',            grp: 'Passive' },
    { id: 'tense-table',  label: '2. Tense Tablosu',           grp: 'Passive' },
    { id: 'intransitive', label: '3. Geçişsiz Fiiller',        grp: 'Passive' },
    { id: 'by-agent',     label: '4. "by" Edatı',             grp: 'Passive' },
    { id: 'stative',      label: '5. Stative Passive',         grp: 'Passive' },
    { id: 'gerund-inf',   label: '6. Gerund & Infinitive',     grp: 'Passive' },
    { id: 'it-believed',  label: '7. It is Believed...',       grp: 'Passive' },
    { id: 'causative',    label: '8. Causative Yapı',          grp: 'Causative' },
    { id: 'tips',         label: 'Soru İpuçları',              grp: 'Özel' },
    { id: 'exercises',    label: 'Alıştırmalar',               grp: 'Özel' }
];

const PA_DOT = {
    'Genel': '#6366f1',
    'Passive': '#7c3aed',
    'Causative': '#b45309',
    'Özel': '#e63946'
};

/* ════════ ENTRY POINT — GrammarModule engine ════════ */

/* ════════ HELPERS ════════ */
/* ════════ ENTRY POINT ════════ */
function paH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#2e1065 0%,#4c1d95 55%,#7c3aed 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function paSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function paTable(headers, rows, cls) {
    const ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    const trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl ' + (cls||'') + '"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function paAcc(items) {
    const cards = items.map(function(it) {
        const exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #7c3aed"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        const descHtml = it.desc ? '<p class="gr-acc-desc">' + it.desc + '</p>' : '';
        return '<div class="gr-acc" data-toggle-class=\"open\">'
            + '<div class="gr-acc-head">'
            + '<div class="gr-acc-ico" style="background:' + it.bg + '">' + it.ico + '</div>'
            + '<div class="gr-acc-title">' + it.title + '</div>'
            + '<div class="gr-acc-chev">⌄</div>'
            + '</div>'
            + '<div class="gr-acc-body">' + descHtml + '<div class="gr-ex-list">' + exHtml + '</div></div>'
            + '</div>';
    }).join('');
    return '<div class="gr-acc-wrap">' + cards + '</div>';
}

function paBox(color, title, lines) {
    const styles = {
        yellow:  'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        purple:  'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        amber:   'background:#fffbeb;border:2px solid #d97706;color:#78350f',
        red:     'background:#fff1f2;border:2px solid #e63946;color:#9f1239',
        green:   'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        blue:    'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a'
    };
    const content = lines.map(function(l){ return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>'; }).join('');
    return '<div style="' + (styles[color]||styles.purple) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 8px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

/* ════════ SECTIONS ════════ */

function paOverview() {
    const cards = [
        {id:'concept',      emoji:'💡', name:'Temel Kavram',         sub:'Active → Passive dönüşümü nasıl yapılır?', c:'#ede9fe', b:'#c4b5fd', t:'#4c1d95'},
        {id:'tense-table',  emoji:'📊', name:'Tense Tablosu',        sub:'8 tense için active → passive örnekleri',   c:'#ede9fe', b:'#c4b5fd', t:'#4c1d95'},
        {id:'intransitive', emoji:'🚫', name:'Geçişsiz Fiiller',     sub:'Passive yapılamayan fiiller listesi',        c:'#fff1f2', b:'#fca5a5', t:'#9f1239'},
        {id:'by-agent',     emoji:'👤', name:'"by" Edatı',          sub:'Edilgenin faili kimse "by" ile gösterilir',  c:'#ede9fe', b:'#c4b5fd', t:'#4c1d95'},
        {id:'stative',      emoji:'🔷', name:'Stative Passive',      sub:'"be/get + V₃" — eylem değil durum',         c:'#ede9fe', b:'#c4b5fd', t:'#4c1d95'},
        {id:'gerund-inf',   emoji:'📝', name:'Gerund & Infinitive',  sub:'Passive form of gerunds & infinitives',     c:'#ede9fe', b:'#c4b5fd', t:'#4c1d95'},
        {id:'it-believed',  emoji:'📢', name:'It is Believed...',    sub:'That clause → Passive dönüşümü',            c:'#fef9c3', b:'#fcd34d', t:'#713f12'},
        {id:'causative',    emoji:'⚙️', name:'Causative Yapı',       sub:'have / make / let / get + kişi/nesne',      c:'#fef3c7', b:'#fbbf24', t:'#92400e'},
        {id:'tips',         emoji:'🎯', name:'Soru İpuçları',        sub:'8 kritik ÖSYM ipucu',                       c:'#fff1f2', b:'#fca5a5', t:'#9f1239'},
    ];
    const cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.b + ';border-radius:14px;padding:16px;background:' + c.c + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' data-action="_paRenderSection(\'' + c.id + '\')">'
            + '<div style="font-size:1.4rem;margin-bottom:8px">' + c.emoji + '</div>'
            + '<div style="font-size:.95rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">' + c.name + '</div>'
            + '<div style="font-size:.73rem;color:' + c.t + ';line-height:1.5">' + c.sub + '</div>'
            + '</div>';
    }).join('');
    return paH('🔄 Edilgen Yapı', 'Active / Passive & Causative', 'Türkçedeki etken, edilgen ve ettirgen yapıların İngilizce karşılığı. Tüm konular, tablo ve alıştırmalarla.')
        + '<div style="padding:24px 36px;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px">' + cardHtml + '</div>'
        + '<div style="padding:0 36px 36px;text-align:center;"><button data-action="_paRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#4c1d95,#7c3aed);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button></div>';
}

function paConcept() {
    return paH('💡 Temel Kavram', 'Active → Passive', 'Etken cümlede işi yapan kişi bellidir. Edilgen cümlede olayın kendisi vurgulanır.')
    + paSH('Dönüşüm Kuralı')
    + paBox('purple','📐 Kural: be + V₃',[
        'Active bir cümleyi Passive yapmak için <strong>"be V₃"</strong> formu kullanılır.',
        'Aktif cümlenin <strong>nesnesi</strong> → Pasif cümlenin <strong>öznesi</strong> konumuna getirilir.',
        '',
        '<strong>Active :</strong> They <u>deliver</u> packages to customers.',
        '→ Özne: They | Fiil: deliver | Nesne: packages',
        '',
        '<strong>Passive:</strong> Packages <u>are delivered</u> to customers by them.',
        '→ Özne: Packages | Fiil: are delivered',
    ])
    + paSH('Formül')
    + paTable(['Yapı','Açıklama'],[
        ['<strong>Özne + be (çekimli) + V₃</strong>','Temel passive formülü'],
        ['<strong>by + eski özne</strong>','Eylemi yapan belli ve önemliyse eklenir; değilse atılır'],
    ]);
}

function paTenseTable() {
    return paH('📊 Tense Tablosu', 'Active vs Passive — Tüm Zamanlar', 'Her tense için aktif ve pasif cümle karşılaştırması.')
    + paTable(
        ['Zaman','Active','Passive'],
        [
            ['<strong>Simple Present</strong>','She <u>writes</u> articles for the newspaper.','Articles <u>are written</u> by her for newspaper.'],
            ['<strong>Present Cont.</strong>','They <u>are planting</u> trees in the park.','Trees <u>are being planted</u> in the park.'],
            ['<strong>Present Perfect</strong>','He <u>has completed</u> the project.','The Project <u>had been completed</u> by him.'],
            ['<strong>Simple Past</strong>','She <u>visited</u> Paris last year.','Paris <u>was visited</u> by her last year.'],
            ['<strong>Past Cont.</strong>','They <u>were watching</u> a movie when I arrived.','A movie <u>was being watched</u> by them when I arrived.'],
            ['<strong>Past Perfect</strong>','She <u>had already finished</u> her homework.','Her homework <u>had already been finished</u> by her.'],
            ['<strong>Future (will/going to)</strong>','He <u>will write</u> an email tomorrow.','An email <u>will be written</u> by him tomorrow.'],
            ['<strong>Future Perfect</strong>','She <u>will have finished</u> her work by 5 PM.','He work <u>will have been finished</u> by him tomorrow.'],
        ]
    )
    + paBox('purple','📌 Passive Formülü Özeti',[
        'Simple Present → <strong>am/is/are + V₃</strong>',
        'Present Cont.  → <strong>am/is/are being + V₃</strong>',
        'Present Perf.  → <strong>have/has been + V₃</strong>',
        'Simple Past    → <strong>was/were + V₃</strong>',
        'Past Cont.     → <strong>was/were being + V₃</strong>',
        'Past Perfect   → <strong>had been + V₃</strong>',
        'Future (will)  → <strong>will be + V₃</strong>',
        'Future Perfect → <strong>will have been + V₃</strong>',
    ]);
}

function paIntransitive() {
    return paH('🚫 Geçişsiz Fiiller', 'Intransitive Verbs', 'Bir fiilin passive formu yapılırken o fiilin "geçişli" ve "neyi, kimi, kime" sorularına yanıt vermesi gerekir.')
    + paBox('red','⚠️ DİKKAT — Bu fiiller passive yapılamaz!',[
        'Geçişsiz fiiller nesne almaz, dolayısıyla passive hale getirilemez:',
        '',
        '<span style="font-family:\'Courier New\',monospace;font-size:.78rem">appear, agree, awake, collapse, collide, consist of,<br>cost, disappear, die, emerge, fall, go, happen, have,<br>laugh, live, lie, leap, look, last (endure), occur, resemble,<br>rise, sleep, sit, stand, swim, vanish, wait</span>',
    ])
    + paAcc([{ico:'✅', bg:'rgba(124,58,237,.15)', title:'Geçişli Fiil → Passive Yapılabilir',
        examples:[
            'Scientists <strong>have demonstrated</strong> the effectiveness of the new drug. (Active)',
            'The effectiveness of the new drug <strong>has been demonstrated</strong> by scientists. (Passive)',
        ]}]);
}

function paByAgent() {
    return paH('👤 "by" Edatı', 'The Agent — "by" ile Fail Gösterme', 'Passive cümlede eylemi yapan kişi/cansız özne vurgulanmak isteniyorsa "by" edatını kullanırız.')
    + paAcc([{ico:'👤', bg:'rgba(124,58,237,.15)', title:'"by + fail" örnekleri',
        examples:[
            '"Çalıkuşu" <strong>was written by</strong> Reşat Nuri Güntekin.',
            'The United States <strong>was devastated by</strong> a hurricane.',
        ]}])
    + paBox('purple','📌 Ne zaman "by" kullanılır?',[
        '✅ Eylemi kimin/neyin yaptığı önemliyse → <strong>by + fail</strong> ekle',
        '✅ Cansız özneler (doğal olaylar, araçlar) → <strong>by</strong> ile gösterilebilir',
        '❌ Kim yaptığı bilinmiyorsa veya önemsizse → "by" atılır',
        '',
        '⚠️ "by" edatı her zaman "tarafından" anlamı vermez; "ile, vasıtasıyla, aracılığıyla, -e kadar" gibi anlamlara da sahip olduğu için dikkatli olmak gerekir.',
    ]);
}

function paStative() {
    return paH('🔷 Stative Passive', 'Stative Passive', '"be + V₃" yapısındaki past participle cümlede sıfat görevi görebilir. Bir eylem değil bir durum ifade eder.')
    + paBox('purple','📐 Yapı',[
        '"<strong>be + V₃</strong>" → past participle sıfat olarak kullanılır',
        '"<strong>get + V₃</strong>" yapısı ile de edilgen cümle oluşturulabilir',
    ])
    + paAcc([{ico:'🔷', bg:'rgba(124,58,237,.15)', title:'Stative Passive Örnekleri',
        desc:'"broken", "painted" gibi V₃ formları burada sıfat görevi görür — bir eylemi değil bir durumu anlatır.',
        examples:[
            'The table <strong>is broken</strong>. (<em>broken — sıfat, durum</em>)',
            'The room <strong>is painted</strong> in a calming shade. (<em>painted — sıfat</em>)',
            'I <strong>was tired of</strong> studying all night, so I decided to take a break.',
            'I <strong>got tired of</strong> studying all night, so I decided to take a break.',
        ]}]);
}

function paGerundInf() {
    return paH('📝 Gerund & Infinitive', 'Passive Form of Gerund & Infinitives', 'Gerund ve infinitive yapılarının passive halleri.')
    + paTable(
        ['Yapı','Active','Passive','Not'],
        [
            ['<strong>Infinitive</strong>','to + V₁ (eş zamanlı)<br><em>She promised <u>to finish</u> the project.</em>','to be + V₃ (eş zamanlı)<br><em>The project is promised <u>to be finished</u> by her.</em>','Eş zamanlı'],
            ['<strong>Perfect Infinitive</strong>','to have + V₃ (farklı zaman)<br><em>He claims <u>to have finished</u> the assignment yesterday.</em>','to have been + V₃ (farklı zaman)<br><em>The assignment is claimed <u>to have been finished</u> by him yesterday.</em>','Farklı zaman'],
            ['<strong>Gerund</strong>','V + ing (eş zamanlı)<br><em>She enjoys <u>reading</u> books.</em>','being + V₃ (eş zamanlı)<br><em>Reading books <u>is being enjoyed</u> by her.</em>','Eş zamanlı'],
            ['<strong>Perfect Gerund</strong>','having + V₃ (farklı zaman)<br><em>After <u>having completed</u> the course, she felt accomplished.</em>','having been + V₃ (farklı zaman)<br><em><u>Having been completed</u>, the course left her feeling accomplished.</em>','Farklı zaman'],
        ]
    )
    + paBox('purple','📌 Zaman Farkı Notu',[
        '"have" ile kurulan cümlelerde eylemler arasında <strong>zaman farkı</strong> olduğu vurgulanır.',
        'Gerund: <strong>have V₃ / having been V₃</strong>',
        'Infinitive: <strong>to have V₃ / to have been V₃</strong>',
    ]);
}

function paItBelieved() {
    return paH('📢 It is Believed...', 'It is Believed / She is Believed to...', 'Bir cümle "main clause + that clause" şeklinde oluşturulduğunda iki ayrı şekilde passive yapıya dönüştürebiliriz.')
    + paSH('Sık Kullanılan Fiiller')
    + paBox('yellow','📌 Bu fiillerle "It is believed that..." yapısı kurulur',[
        '<strong>understand, estimate, assume, say, think, expect, consider,</strong>',
        '<strong>claim, suppose, allege, report, know, declare...</strong>',
    ])
    + paSH('İki Passive Seçeneği')
    + paAcc([{ico:'📢', bg:'rgba(217,119,6,.15)', title:'Original → 2 Passive Seçeneği',
        examples:[
            '<strong>Original:</strong> They say that the project is going well.',
            '<strong>Passive Option 1:</strong> It is said by them that the project is going well.',
            '<strong>Passive Option 2:</strong> The project is said to be going well by them.',
        ]}])
    + paBox('purple','📐 Formüller',[
        '<strong>Option 1:</strong> It + be + V₃ + that + özne + fiil',
        '<strong>Option 2:</strong> That clause\'un öznesi + be + V₃ + infinitive (to V₁)',
        '',
        'Örnek: The project <strong>is said to be going well</strong> by the director.',
    ]);
}

function paCausative() {
    return paH('⚙️ Ettirgen Yapı', 'Causative', 'Bir kişinin başka bir kişiye bir eylemi gerçekleştirmesi veya yapmasını sağladığı yapılar.')
    + paSH('Causative Yapı Tablosu')
    + paTable(['Yapı','Nesne','Fiil Formu','Türkçe Anlam'],[
        ['<strong>have / get</strong>','something','<strong>done</strong> (V₃)','Bir şeyi yaptırmak (eylem vurgulanır)'],
        ['<strong>have / make / let</strong>','someone','<strong>do something</strong> (V₁)','Birine bir şey yaptırmak'],
        ['<strong>get</strong>','someone','<strong>to do something</strong> (to V₁)','Rıza/ikna ile yaptırmak'],
    ])
    + paAcc([
        {ico:'🔧', bg:'rgba(180,83,9,.15)', title:'have / get + something + done — Eylem Vurgulanır',
         desc:'Yalnızca eylemin yapıldığı vurgulanır; kimin yaptığı önemsizdir.',
         examples:[
            "I'm going to <strong>have</strong> my car <strong>washed</strong> tomorrow.",
            'She <strong>got</strong> her computer <strong>repaired</strong> by a professional.',
        ]},
        {ico:'👥', bg:'rgba(180,83,9,.12)', title:'have / make / let + someone + do something',
         desc:'Birine bir şeyi yaptırmak. "make" zorla, "let" izin vererek, "have" rica/parayla yaptırmak.',
         examples:[
            'She <strong>had</strong> her son <strong>do</strong> his homework before going out. (parayla / rica ederek)',
            'He <strong>makes</strong> his employees <strong>take</strong> a break in the afternoon. (zorla)',
            'They <strong>let</strong> their kids <strong>stay up</strong> late on weekends. (izin vererek)',
        ]},
        {ico:'🤝', bg:'rgba(124,58,237,.12)', title:'get + someone + to do something',
         desc:'Bir işi rıza veya ikna ile yaptırmak.',
         examples:[
            'He <strong>got</strong> her friend <strong>to help</strong> her move to a new city.',
        ]},
    ])
    + paBox('amber','📌 Causative ile Sıklıkla Gelen Diğer İfadeler',[
        '• <strong>Help someone (to) V₁</strong> — yardım etmek',
        '• <strong>Allow someone to V₁</strong> — izin vermek',
        '• <strong>Want someone to V₁</strong> — istemek',
        '• <strong>Force someone to V₁</strong> — zorlamak',
    ]);
}

function paTips() {
    const tips = [
        {num:'01', title:'Tenses ve Modals konusunun sağlam olması gerekir.',
         rules:[{ico:'💡', text:'Passive sorularını çözerken önce cümlenin hangi zamanda olduğunu belirle.'}]},
        {num:'02', title:'"by" edatı her zaman "tarafından" anlamı vermez.',
         rules:[
            {ico:'⚠️', text:'"by" → "ile, vasıtasıyla, aracılığıyla, -e kadar" gibi anlamlara da sahiptir.'},
            {ico:'💡', text:'Cümledeki "by" gerçekten fail mi gösteriyor, yoksa başka anlam mı taşıyor? Kontrol et.'},
         ]},
        {num:'03', title:'Yalnızca geçişli fiiller pasif hale getirilebilir.',
         rules:[
            {ico:'🚫', text:'appear, go, happen, live, sleep, die, fall, rise, sit, stand, swim... → passive YAPILMAZ'},
            {ico:'💡', text:'Fiilin nesne alıp almadığını kontrol et; nesne yoksa passive yapılamaz.'},
         ]},
        {num:'04', title:'Boşluktan sonra nesne const mı yok mu? → Active mi Passive mi?',
         rules:[
            {ico:'✅', text:'Boşluktan sonra <strong>nesne varsa</strong> → aktif seçeneklere gidilir.'},
            {ico:'✅', text:'Boşluktan sonra <strong>nesne yoksa ve edat (to, by…) gelmişse</strong> → pasif seçeneklere gidilir.'},
         ]},
        {num:'05', title:'Edatlardan sonra genellikle V + ing gelir.',
         rules:[{ico:'💡', text:'preposition + V-ing: <em>She was tired of <strong>studying</strong>. / interested in <strong>learning</strong>.</em>'}]},
        {num:'06', title:'"It is believed that + SVO" yapısı cümle tamamlama sorularında çıkar.',
         rules:[{ico:'🎯', text:'"It is believed / said / claimed / thought that + cümle" → ÖSYM\'de cümle tamamlamada sık karşılaşılır.'}]},
        {num:'07', title:'Gerçek özne ile başlayan cümlede → "infinitive to V₁" alır.',
         rules:[
            {ico:'📌', text:'be + believed/said/claimed/thought + <strong>to V₁</strong>'},
            {ico:'✅', text:'The project <strong>is said to be going</strong> well by the director.'},
         ]},
        {num:'08', title:'Causative: sıklıkla karşılaşılan diğer yapılar',
         rules:[
            {ico:'🔧', text:'<strong>Help someone (to) V₁</strong> | <strong>Allow someone to V₁</strong>'},
            {ico:'🔧', text:'<strong>Want someone to V₁</strong> | <strong>Force someone to V₁</strong>'},
            {ico:'💡', text:'make → V₁ (tosuz) | let → V₁ (tosuz) | get → to V₁ (tolu)'},
         ]},
    ];
    const cards = tips.map(function(t) {
        const rules = t.rules.map(function(r) {
            return '<div style="display:flex;gap:10px;padding:9px 13px;background:#f7f7fb;border-radius:10px;margin-top:7px;font-size:.82rem;color:#374151;line-height:1.6;">'
                + '<span style="flex-shrink:0;margin-top:1px">' + r.ico + '</span>' + r.text + '</div>';
        }).join('');
        return '<div style="background:#fff;border:1.5px solid #ebebf0;border-radius:14px;overflow:hidden;margin-bottom:10px;" data-toggle-child=\".pa-tb\" data-toggle-child-class=\"pa-hidden\">'
            + '<div style="display:flex;align-items:center;gap:12px;padding:13px 18px;background:#f7f7fb;cursor:pointer;">'
            + '<span style="font-size:.6rem;font-weight:900;color:#7c3aed;background:#f5f3ff;border-radius:7px;padding:3px 9px;flex-shrink:0;font-family:\'Courier New\',monospace;">İPUCU ' + t.num + '</span>'
            + '<span style="flex:1;font-size:.87rem;font-weight:800;color:#1a1a2e">' + t.title + '</span>'
            + '<span style="font-size:.9rem;color:#767687">⌄</span>'
            + '</div>'
            + '<div class="pa-tb" style="padding:16px 20px;">' + rules + '</div>'
            + '</div>';
    }).join('');
    return paH('🎯 Soru Çözme', 'Soru Çözerken İpuçları', '8 kritik ipucu — ÖSYM ve YDT sınavlarında Active/Passive & Causative sorularını çözerken dikkat et.')
        + '<div style="padding:24px 36px 36px">' + cards + '</div>';
}

/* ════════════════════════════════════════════════════
   EXERCISES — Set tabanlı MCQ sistemi
   Her set 10 soru. Yeni set eklemek için PA_SETS'e obje ekle.
════════════════════════════════════════════════════ */
const PA_SETS = [
    /* ── Set 1: Temel Passive alıştırmaları ── */
    {
        label: 'Set 1',
        questions: [
            {q:'The novel "Çalıkuşu" ___ by Reşat Nuri Güntekin.',
             opts:['wrote','has written','was written','is writing'],
             cor:'c', hint:'Simple Past Passive: was/were + V₃'},
            {q:'The windows ___ when the storm hit.',
             opts:['broke','were broken','are broken','break'],
             cor:'b', hint:'Simple Past Passive: were + V₃'},
            {q:'Trees ___ in the park right now.',
             opts:['are planting','have been planted','are being planted','were planting'],
             cor:'c', hint:'Present Continuous Passive: are being + V₃'},
            {q:'___ the meeting has been postponed.',
             opts:['It is believed that','They believed that','It believes that','That it is believed'],
             cor:'a', hint:'"It is believed that + cümle" yapısı'},
            {q:'He ___ his car washed every week.',
             opts:['does','makes','has','lets'],
             cor:'c', hint:'have + something + done: have my car washed'},
            {q:'She let her kids ___ up late on weekends.',
             opts:['to stay','staying','stayed','stay'],
             cor:'d', hint:'let + someone + V₁ (to\'suz)'},
            {q:'The project is said ___ well by the team.',
             opts:['going','to be going','being','be going'],
             cor:'b', hint:'be said/believed + to + infinitive: to be going'},
            {q:'Which verb CANNOT be used in passive form?',
             opts:['write','happen','build','photograph'],
             cor:'b', hint:'"happen" geçişsiz fiildir, passive yapılamaz'},
            {q:'A new bridge ___ in the city center at the moment.',
             opts:['builds','is built','is being built','has built'],
             cor:'c', hint:'Present Continuous Passive: is being + V₃'},
            {q:'The letter ___ by the secretary yesterday.',
             opts:['wrote','was writing','was written','is written'],
             cor:'c', hint:'Simple Past Passive: was/were + V₃'},
        ]
    },
    /* ── TEST YOURSELF 1 — Q1-12 ── */
    {
        label: 'Set 2',
        questions: [
            {q:'The statistics ....... that education levels in the UK ....... in the areas of mathematics and English in recent months.',
             opts:['are shown / are improved','show / have been improving','will be shown / will be improved','had been showing / have improved'],
             cor:'b', hint:'show (aktif, genel gerçek) + have been improving (süregelen gelişme)'},
            {q:'Due to the pressure which ....... on schools to improve their results in mathematics and English, arts and crafts ....... .',
             opts:['is placing / were neglected','will place / were neglecting','was placed / have been neglected','had been placed / are neglecting'],
             cor:'c', hint:'was placed (geçmiş passive) + have been neglected (süreç devam ediyor)'},
            {q:'Understandably, his colleagues ....... when John left his job just after he .......',
             opts:['are shocked / was promoting','have been shocked / is promoted','were shocked / had been promoted','had been shocked / has promoted'],
             cor:'c', hint:'were shocked (Past Simple) + had been promoted (daha önce tamamlanan)'},
            {q:'The sentence ....... out by the judge when the court reassembles after lunch.',
             opts:['was read','had been read','should read','will be read'],
             cor:'d', hint:'Gelecekte gerçekleşecek passive → will be + V₃'},
            {q:'For today\'s writing test, you ....... to write a composition of at least four paragraphs.',
             opts:['have required','require','required','will have required','are required'],
             cor:'e', hint:'be required to = zorunlu tutulmak (stative passive)'},
            {q:'In my opinion, all the debts of the Third World countries ....... by the USA and the EU.',
             opts:['should be cancelled','are cancelling','could be cancelling','ought to have cancelled'],
             cor:'a', hint:'Modal passive: should be + V₃ (görüş bildirme)'},
            {q:'International relations is a 20th-century subject, though foreign policy ....... out between countries for many centuries.',
             opts:['is being carried','was carrying','has been carried','had been carrying'],
             cor:'c', hint:'has been carried out (Present Perfect Passive — uzun süredir devam eden)'},
            {q:'To achieve the unique coral red of the Ottoman tiles in the 16th century, craftsmen ....... a mixture of iron-oxide and quartz.',
             opts:['used to fire','were fired','have fired','will be fired'],
             cor:'a', hint:'Aktif + geçmişteki alışkanlık → used to + V₁ (craftsmen özne, aktif)'},
            {q:'"PRIVATE AND CONFIDENTIAL" ....... in capital letters on the envelope, but still the letter was open when it ....... on my desk.',
             opts:['was written / was put','had written / was putting','is being written / has put','was writing / has been put'],
             cor:'a', hint:'was written (Past Simple Passive) + was put (Past Simple Passive)'},
            {q:'The pretty flower Viola ....... in 1863 by a Scottish plant breeder, who ....... wild pansies with a garden variety.',
             opts:['is created / had been crossing','was created / crossed','has been created / was crossing','created / was crossed'],
             cor:'b', hint:'was created (Past Passive) + crossed (Past Simple aktif — yetiştirici eylem yaptı)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Q11-20 ── */
    {
        label: 'Set 3',
        questions: [
            {q:'The area around the village of Grange in the Lake District ....... the "Jaws of Borrowdale" because of the jagged rocks which ....... the valley.',
             opts:['is being called / are bordered','has been called / were bordered','is called / border','has called / will border'],
             cor:'c', hint:'is called (genel gerçek passive) + border (aktif, genel gerçek)'},
            {q:'The lead mine, which ....... since Roman times, ....... work for the local inhabitants.',
             opts:['is using / provided','will be used / has provided','has been used / provides','is used / will provide'],
             cor:'c', hint:'has been used (Present Perfect Passive — since) + provides (aktif, genel gerçek)'},
            {q:'Experts say that your chances of a long and healthy life ....... if you ....... plenty of fresh fruit and vegetables.',
             opts:['enhance / are eaten','will be enhanced / were eating','enhanced / are eating','are enhanced / eat'],
             cor:'d', hint:'are enhanced (Present Passive, koşul sonucu) + eat (aktif, koşul)'},
            {q:'When he ....... his room for the first time in his life, his mother ....... him a look of surprise.',
             opts:['will tidy / will be giving','had been tidying / was given','has been tidied / gives','was tidying / has given','tidied / gave'],
             cor:'e', hint:'tidied (Past Simple aktif) + gave (Past Simple aktif — ardışık eylem)'},
            {q:'Since the 1960s, new roads ....... in Lhasa, Tibet\'s capital, and now a highway system ....... the city with the major cities in neighboring provinces.',
             opts:['have been built / connects','were built / is connected','had built / is connecting','are being built / has connected'],
             cor:'a', hint:'have been built (Present Perfect Passive — since) + connects (aktif, şimdiki durum)'},
            {q:'It\'s true that life ....... as anything may happen at any time, but some precautions, such as insurance policies, ....... against disaster.',
             opts:['mustn\'t be predicted / have taken','shouldn\'t predict / have been taking','doesn\'t predict / are taking','can\'t be predicted / can be taken'],
             cor:'d', hint:'can\'t be predicted (modal passive olumsuz) + can be taken (modal passive olumlu)'},
            {q:'Harry & Senga\'s octagonal-shaped home ....... by James Salmon in 1890. It ....... that he only designed ten octagonal properties.',
             opts:['was building / thinks','has been built / was thought','would have built / was thinking','had been built / has been thinking','was built / is thought'],
             cor:'e', hint:'was built (Past Simple Passive) + is thought (Present Passive — "It is thought that")'},
            {q:'When yellow paint ....... with blue, it ....... green.',
             opts:['mixes / is produced','mixed / was produced','has been mixing / has produced','will mix / will be produced','is mixed / produces'],
             cor:'e', hint:'is mixed (Present Passive, koşul) + produces (aktif, sonuç — genel gerçek)'},
            {q:'1999 ....... a year when many tragedies ......., including the terrible mud slides in Venezuela and the horrific earthquakes in Turkey.',
             opts:['is / were happening','was / happened','is being / will happen','has been / had been happening'],
             cor:'b', hint:'was (Past Simple — tarihi gerçek) + happened (Past Simple — olaylar)'},
            {q:'The last two times I ....... the health club, I ....... for my membership card, but we had better take them with us today.',
             opts:['have visited / haven\'t asked','was visited / don\'t ask','visited / wasn\'t asked','was visiting / didn\'t ask'],
             cor:'c', hint:'visited (Past Simple) + wasn\'t asked (Past Simple Passive — sorulmadım)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Q21-35 ── */
    {
        label: 'Set 4',
        questions: [
            {q:'As might be expected from China\'s huge area and variety of regional climates, most of the types of plants that ....... in the Northern Hemisphere ....... there.',
             opts:['will grow / have found','are grown / are finding','have grown / were being found','grow / can be found'],
             cor:'d', hint:'grow (aktif, genel gerçek) + can be found (modal passive, genel gerçek)'},
            {q:'Mount Everest ....... as the highest point on the Earth until 1852, when the governmental Survey of India ....... the fact.',
             opts:['hasn\'t been recognised / established','didn\'t recognise / has established','hasn\'t recognised / would establish','wouldn\'t recognise / was established','wasn\'t recognised / established'],
             cor:'e', hint:'wasn\'t recognised (Past Simple Passive — o zamana kadar) + established (Past Simple aktif)'},
            {q:'Alternatives to the "right to trial by jury" system ....... but all the ideas which ....... so far are unacceptable.',
             opts:['are being considered / have been discussed','have been considering / were discussed','had been considered / are discussing','have considered / have been discussing'],
             cor:'a', hint:'are being considered (Present Continuous Passive — şu an devam) + have been discussed (Present Perfect Passive)'},
            {q:'People can now buy and sell shares over the Internet and it ....... that over 50 new millionaires ....... this year by "ecommerce".',
             opts:['is estimating / are creating','had been estimated / create','is estimated / will be created','estimated / had been creating'],
             cor:'c', hint:'is estimated (Present Passive impersonal) + will be created (Future Passive)'},
            {q:'Numerous expeditions, which ....... by various countries, ....... since the first successful climb of Mount Everest.',
             opts:['are sponsored / are being undertaken','were sponsored / have been undertaken','have sponsored / will be undertaking','have been sponsored / undertook'],
             cor:'b', hint:'were sponsored (Past Simple Passive) + have been undertaken (Present Perfect Passive)'},
            {q:'Recently, a new vaccine against measles ....... .',
             opts:['will have developed','had been developing','had developed','was developing','has been developed'],
             cor:'e', hint:'has been developed (Present Perfect Passive — recently ile)'},
            {q:'The lounge carpet ....... after Ralph ....... some bleach on it.',
             opts:['is ruined / was spilling','has ruined / had spilt','has been ruined / was spilt','was ruined / spilt'],
             cor:'d', hint:'was ruined (Past Simple Passive) + spilt (Past Simple aktif — ardışık sebep-sonuç)'},
            {q:'All the expenses of shipping your furniture ....... by the company, so you needn\'t worry about that.',
             opts:['will bear','will be borne','are bearing','were bearing'],
             cor:'b', hint:'will be borne (Future Passive) — "bear the cost" → "cost will be borne"'},
            {q:'From the 4th to the 18th of next month, contemporary glass and ceramics ....... at the Fenny Lodge Gallery.',
             opts:['will be displayed','are displaying','had been displayed','will have been displaying'],
             cor:'a', hint:'will be displayed (Future Passive — planlanmış etkinlik)'},
            {q:'Before the United Nations sanctions ......., sixty to eighty percent of our dates ....... from Iraq.',
             opts:['were imposed / were obtained','are imposing / are obtaining','were imposing / have obtained','imposed / will be obtained'],
             cor:'a', hint:'were imposed (Past Simple Passive — sanction uygulandı) + were obtained (Past Simple Passive)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Q31-35 & TEST YOURSELF 2 — Q1-5 ── */
    {
        label: 'Set 5',
        questions: [
            {q:'A "Welsh dresser" ....... as a piece of kitchen furniture which ....... shelves and cupboards in one unit.',
             opts:['should be described / is combined','has described / can combine','can be described / combines','used to describe / combined'],
             cor:'c', hint:'can be described (modal passive, tanım) + combines (aktif, genel gerçek)'},
            {q:'Since Bernard ....... from the bank, he ....... unable to find another job.',
             opts:['was dismissed / has been','used to be dismissed / is','has been dismissed / had to be','had been dismissing / was'],
             cor:'a', hint:'was dismissed (Past Simple Passive) + has been (Present Perfect — since ile süregelen durum)'},
            {q:'By the time we ....... , seats all the covered ....... .',
             opts:['arrive / might have occupied','will arrive / have been occupying','are arriving / will occupy','were arriving / have been occupied','arrived / had been occupied'],
             cor:'e', hint:'arrived (Past Simple) + had been occupied (Past Perfect Passive — daha önce dolmuştu)'},
            {q:'I\'m glad you didn\'t give me this essay yesterday after all. We had a long power cut, so I ....... it for you.',
             opts:['won\'t be able to type','couldn\'t have typed','had better not type','may not be typed'],
             cor:'b', hint:'couldn\'t have typed (geçmişte imkânsız — modal perfect)'},
            {q:'Experts are not sure whether skiing ....... into the USA for the first time by Scandinavian settlers or by Indians from Canada.',
             opts:['is introduced','will be introduced','was being introduced','was introduced'],
             cor:'d', hint:'was introduced (Past Simple Passive — tarihsel olay)'},
            {q:'Guns ....... away securely so that children ....... them.',
             opts:['had better lock / won\'t have reached','ought to be locked / weren\'t reaching','may be locking / shouldn\'t reach','should be locked / can\'t reach'],
             cor:'d', hint:'should be locked (modal passive — tavsiye) + can\'t reach (modal olumsuz — amaç)'},
            {q:'China ....... to have extensive petroleum reserves, both on land and offshore.',
             opts:['believes','has believed','will believe','believed','is believed'],
             cor:'e', hint:'is believed to (Present Passive impersonal — "It is believed that China has...")'},
            {q:'St John\'s Wort, a natural herbal supplement which ....... Hypericin, ....... for centuries to treat minor ailments.',
             opts:['is contained / used','contains / has been used','is containing / is being used','was containing / is used'],
             cor:'b', hint:'contains (aktif — madde içerir) + has been used (Present Perfect Passive — for centuries)'},
            {q:'Many interesting relics of the Kennedy family ....... in Culzean Castle, Scotland.',
             opts:['will have contained','contain','contained','are contained'],
             cor:'d', hint:'are contained (Present Passive stative — bulunuyor/mevcut)'},
            {q:'Peace in Northern Ireland ....... after the two sides ....... for months.',
             opts:['was achieved / negotiated','is achieved / were negotiating','will have achieved / are negotiated','had been achieving / have negotiated'],
             cor:'a', hint:'was achieved (Past Simple Passive) + negotiated (Past Simple aktif)'},
        ]
    },
    /* ── TEST YOURSELF 2 — Q6-17 ── */
    {
        label: 'Set 6',
        questions: [
            {q:'Animal lovers in England ....... that fox hunting with horses and dogs ....... illegal.',
             opts:['are demanded / can make','have demanded / is making','demand / should be made','have been demanded / was made'],
             cor:'c', hint:'demand (aktif, genel) + should be made (modal passive — talep içeriği)'},
            {q:'The UN official ....... by Kosovan villagers to the spot where they believed the mass grave ....... .',
             opts:['is taken / is locating','is taking / locates','will be taken / located','had taken / had been located','was taken / was located'],
             cor:'e', hint:'was taken (Past Simple Passive) + was located (Past Simple Passive — inanç/yer)'},
            {q:'I really dislike it when I ....... the incorrect change by the ferry cashiers in Istanbul.',
             opts:['have given','gave','give','am given'],
             cor:'d', hint:'am given (Present Simple Passive — yanlış para üstü verilmek)'},
            {q:'Dogs, which ....... man since ancient times, were mainly used on farms or for hunting in earlier times, but today they ....... to a wide range of uses.',
             opts:['are accompanied / have been put','have accompanied / are put','had been accompanying / are putting','were accompanying / put','accompany / are being put'],
             cor:'b', hint:'have accompanied (Present Perfect aktif — since ancient times) + are put (Present Passive — bugün)'},
            {q:'In traditional cultures, it is widely believed that when a man ....... a mask, his religious or magical powers ....... by changing identity.',
             opts:['has worn / release','is worn / have released','wears / are released','had worn / will have released'],
             cor:'c', hint:'wears (Present Simple aktif, koşul) + are released (Present Passive, sonuç)'},
            {q:'Obviously, the headmaster ....... that students ....... better to the new teaching methods.',
             opts:['is believed / are responding','believes / will respond','has believed / have been responded','was believed / had been responding'],
             cor:'b', hint:'believes (aktif) + will respond (aktif gelecek — headmaster\'ın beklentisi)'},
            {q:'We ....... that my father\'s new car ....... by Friday.',
             opts:['are expected / will be delivering','expect / will have been delivered','have been expecting / is delivering','had expected / was delivering','are expecting / will have delivered'],
             cor:'b', hint:'expect (aktif) + will have been delivered (Future Perfect Passive — Friday\'e kadar teslim)'},
            {q:'The book "The Lost Continent" ....... Bill Bryson is based ....... the author\'s own experiences in America.',
             opts:['from / at','of / with','with / from','by / on'],
             cor:'d', hint:'written by (yazar edatı) + based on (dayalı olmak)'},
            {q:'The best results seem to be associated ....... seismicity studies using earthquake observatories.',
             opts:['with','on','about','to'],
             cor:'a', hint:'associated with = ile ilişkili (be associated with)'},
            {q:'Silvia repairs rush chairs and she is often so absorbed ....... her work that she barely notices the world around her.',
             opts:['in','on','with','from'],
             cor:'a', hint:'absorbed in = bir şeye dalmış (be absorbed in)'},
        ]
    },
    /* ── TEST YOURSELF 2 — Q17-35 ── */
    {
        label: 'Set 7',
        questions: [
            {q:'The Serbian warlord Zelijko Raxnatovic, who ....... as "Arkan", ....... in Belgrade in January, 2000.',
             opts:['had known / would be assassinated','has been known / assassinates','was known / was assassinated','knew / had been assassinated'],
             cor:'c', hint:'was known (Past Passive stative) + was assassinated (Past Simple Passive — olay)'},
            {q:'When Tiger Woods ....... his sixth golfing title in a row, he equalled the record of Ben Hogen, which ....... 52 years ago.',
             opts:['was won / had set','is won / had been set','won / was set','wins / has been set'],
             cor:'c', hint:'won (Past Simple aktif) + was set (Past Simple Passive — 52 yıl önce kırılan)'},
            {q:'Although earthquakes ....... death and destruction through secondary effects, the greatest losses ....... from the collapse of man-made structures.',
             opts:['are causing / were resulted','have been caused / resulted','had been causing / will result','ought to be caused / have resulted','can cause / result'],
             cor:'e', hint:'can cause (aktif modal) + result (aktif — aktif fiil, genel gerçek)'},
            {q:'This year a woman ....... President of Finland for the first time in the country\'s history.',
             opts:['was elected','is elected','has elected','was electing'],
             cor:'a', hint:'was elected (Past Simple Passive — bu yıl gerçekleşen olay)'},
            {q:'The civil war in Sudan ....... for seventeen years now, and so far, two million people ....... .',
             opts:['continued / will have been killed','has been continuing / have been killed','is continuing / had been killed','was continuing / were killed'],
             cor:'b', hint:'has been continuing (Present Perfect Continuous) + have been killed (Present Perfect Passive — so far)'},
            {q:'Most of the 700 protesters the police ....... at Mexico\'s largest university ....... within days.',
             opts:['had arrested / will have freed','are arrested / will be freed','will be arresting / have freed','arrested / were freed'],
             cor:'d', hint:'arrested (Past Simple aktif) + were freed (Past Simple Passive — serbest bırakıldı)'},
            {q:'20 million seahorses, which ....... in Chinese medicine, ....... from the oceans each year.',
             opts:['will be using / are being taken','were used / will have taken','will be used / must have taken','can be used / have taken','are used / are taken'],
             cor:'e', hint:'are used (Present Passive — genel gerçek) + are taken (Present Passive — yıllık tekrar)'},
            {q:'When Thailand ....... as Siam, mighty elephants ....... its kings into battle.',
             opts:['had known / were carried','is known / have been carrying','knew / could be carried','was known / used to carry'],
             cor:'d', hint:'was known (Past Passive stative — eski ad) + used to carry (aktif alışkanlık)'},
            {q:'In recent years, the elephant\'s usefulness for labour and a means of transportation ....... by technology.',
             opts:['will be eliminated','has been eliminated','is eliminating','had been eliminating'],
             cor:'b', hint:'has been eliminated (Present Perfect Passive — in recent years)'},
            {q:'Today, in many countries, as many as one third of all cancer deaths ....... to cigarette smoking.',
             opts:['are attributed','can attribute','had attributed','were attributed'],
             cor:'a', hint:'are attributed to (Present Passive stative — genel istatistik gerçeği)'},
        ]
    },
    /* ── TEST YOURSELF 2 — Q27-35 ── */
    {
        label: 'Set 8',
        questions: [
            {q:'My cousin had emotional problems as a teenager because he ....... up properly.',
             opts:['hasn\'t brought','isn\'t bringing','hadn\'t been brought','didn\'t bring'],
             cor:'c', hint:'hadn\'t been brought up (Past Perfect Passive — geçmişte yetiştirilmemiş)'},
            {q:'Our horse ....... when the fence ....... down in a storm.',
             opts:['was escaping / blew','is escaping / will be blown','has been escaped / has blown','must be escaped / had blown','escaped / was blown'],
             cor:'e', hint:'escaped (Past Simple aktif) + was blown (Past Simple Passive — fırtınayla devrildi)'},
            {q:'Human settlement at Sandford ....... back to Norman times, when a group of monks ....... a monastery there.',
             opts:['had traced / were built','has traced / are built','could have been traced / build','can be traced / built'],
             cor:'d', hint:'can be traced (modal passive — izlenebilir) + built (Past Simple aktif)'},
            {q:'The old lady ....... by two rottweiler dogs when a Shropshire huntsman ....... her life.',
             opts:['had savaged / was saved','was being savaged / saved','was savaging / was saving','could be savaged / had saved'],
             cor:'b', hint:'was being savaged (Past Continuous Passive — devam eden saldırı) + saved (Past Simple aktif)'},
            {q:'Are you sure my tablecloth ....... permanently by this red wine?',
             opts:['won\'t stain','isn\'t being stained','won\'t be stained','shouldn\'t have stained'],
             cor:'c', hint:'won\'t be stained (Future Passive — kalıcı leke olmayacak)'},
            {q:'The ascent of Ben Nevis, the highest point in the British Isles, ....... only in fair weather.',
             opts:['should be attempted','could have attempted','may attempt','ought to attempt'],
             cor:'a', hint:'should be attempted (modal passive — tavsiye/güvenlik kuralı)'},
            {q:'The team of climbers ....... to return to the campsite because heavy cloud ....... their vision.',
             opts:['were decided / was restricted','decided / restricted','can decide / will be restricted','should decide / was restricting'],
             cor:'b', hint:'decided (Past Simple aktif) + restricted (Past Simple aktif — bulut görüşü engelledi)'},
            {q:'Although the queen of UK has in fact little authority of her own, she ....... informed of events, and sometimes, she ....... by the government in power.',
             opts:['keeps / has consulted','can be kept / should consult','is kept / is consulted','will keep / was consulted'],
             cor:'c', hint:'is kept (Present Passive stative) + is consulted (Present Passive — danışılır)'},
            {q:'I\'m sure he ....... in your lecture. He ....... monarch butterflies for ten years now.',
             opts:['had been interested / studies','will have interested / is studying','interested / will have been studying','will be interested / has been studying'],
             cor:'d', hint:'will be interested (Future aktif) + has been studying (Present Perfect Continuous — for 10 years)'},
            {q:'Because of the expense of their traditional wedding, they had to limit the guests ....... their close relatives and friends.',
             opts:['towards','at','in','to'],
             cor:'d', hint:'limit...to = ...ile sınırlamak (limit to)'},
        ]
    },
    /* ── TEST YOURSELF 3 — Q1-12 ── */
    {
        label: 'Set 9',
        questions: [
            {q:'Your order ....... tomorrow, so you ....... it on Friday.',
             opts:['is being sent / have received','will be sent / should receive','has been sent / must be received','will have sent / can receive'],
             cor:'b', hint:'will be sent (Future Passive — yarın) + should receive (modal aktif — Cuma\'ya kadar)'},
            {q:'Apparently, the incident ....... the reputation of the club as it ....... quite a few members recently.',
             opts:['was damaged / was losing','has damaged / has lost','will be damaged / is losing','can damage / has been lost'],
             cor:'b', hint:'has damaged (Present Perfect aktif — sonuç görünür) + has lost (Present Perfect aktif)'},
            {q:'If the topsoil that ....... much of the Earth\'s surface ....... in some way, it can be carried away by wind or water in erosion.',
             opts:['is covering / hasn\'t protected','has covered / won\'t have protected','covers / isn\'t protected','is covered / won\'t be protected'],
             cor:'c', hint:'covers (aktif, genel gerçek) + isn\'t protected (Passive, koşul — korunmuyorsa)'},
            {q:'Although their carpets ....... primarily for mosques, sometimes, they ....... designs for restaurants and hotels as well.',
             opts:['are designed / produce','have been designed / were produced','will be designed / were producing','have designed / had been producing','design / are producing'],
             cor:'a', hint:'are designed (Present Passive stative) + produce (aktif — bazen de tasarlarlar)'},
            {q:'The board ....... that a takeover by a foreign company ....... at all costs.',
             opts:['was decided / should avoid','has been decided / was avoided','decided / may have avoided','has decided / must be avoided'],
             cor:'d', hint:'has decided (Present Perfect aktif) + must be avoided (modal passive — her ne pahasına)'},
            {q:'I am attending a presentation by Ford today, but I ....... whether I ....... a really formal suit or something more comfortable.',
             opts:['won\'t decide / have worn','mustn\'t decide / could have worn','won\'t be decided / wear','haven\'t been decided / will wear','can\'t decide / should wear'],
             cor:'e', hint:'can\'t decide (modal aktif — karar veremiyorum) + should wear (modal aktif — ne giymeliyim)'},
            {q:'While the injured child ....... to the ambulance on a stretcher, a woman ....... running, saying that she was his mother.',
             opts:['had been carried / will come','was carrying / was coming','was being carried / came','has been carrying / could come'],
             cor:'c', hint:'was being carried (Past Continuous Passive — taşınırken) + came (Past Simple aktif — geldi)'},
            {q:'After he ....... his restaurant, he ....... hard every day to make it successful, so his business became a popular eating place.',
             opts:['has opened / will work','was opened / will be working','was opening / had worked','had opened / worked'],
             cor:'d', hint:'had opened (Past Perfect aktif) + worked (Past Simple aktif — ardından çalıştı)'},
            {q:'When the new road around the town ....... , the noise levels in our street .......',
             opts:['was completed / dropped','has completed / have dropped','had been completed / drop','completed / had been dropping'],
             cor:'a', hint:'was completed (Past Simple Passive) + dropped (Past Simple aktif — düştü)'},
            {q:'After better lighting ....... in the office, Jennifer\'s headaches .......',
             opts:['is installing / should disappear','was installed / disappeared','had been installed / have disappeared','will have installed / is disappearing'],
             cor:'b', hint:'was installed (Past Simple Passive) + disappeared (Past Simple aktif)'},
        ]
    },
    /* ── TEST YOURSELF 3 — Q11-23 ── */
    {
        label: 'Set 10',
        questions: [
            {q:'The tourists ....... about the way in which they ....... by the tour operators during the trip.',
             opts:['can complain / were treating','were complained / are being treated','are complaining / have treated','have been complained / are treated','complained / had been treated'],
             cor:'e', hint:'complained (Past Simple aktif — şikâyet ettiler) + had been treated (Past Perfect Passive — gezi boyunca nasıl davranıldığı)'},
            {q:'I wonder whether the electrical store ....... us tomorrow for the delivery of the freezer or not.',
             opts:['is charged','will charge','has charged','is being charged'],
             cor:'b', hint:'will charge (Future aktif — mağaza bizi mi arar?)'},
            {q:'The Prince Henry car ....... by Vauxhall in 1911. Today only eleven ......., all of which are priceless.',
             opts:['introduced / are existing','was introduced / exist','have been introduced / existed','had introduced / have existed'],
             cor:'b', hint:'was introduced (Past Simple Passive) + exist (Present aktif stative — var)'},
            {q:'I ....... about the famous poet Celin\'s tragic personal life while I ....... information for my essay.',
             opts:['am learning / researched','have learnt / had researched','learnt / was researching','will learn / have been researched'],
             cor:'c', hint:'learnt (Past Simple aktif) + was researching (Past Continuous aktif — araştırırken)'},
            {q:'According to archaeological records, chickens ....... for the first time in the cities of the Indus Valley in about 3000 BC.',
             opts:['had domesticated','have been domesticated','were domesticating','used to domesticate','were domesticated'],
             cor:'e', hint:'were domesticated (Past Simple Passive — tarihsel olay, 3000 BC)'},
            {q:'The origin of April Fool\'s Day is uncertain, but it ....... to arrival of spring in late March, when nature ....... to "fool" humanity with changes in weather.',
             opts:['has been related / has said','may be related / is said','ought to relate / has been said','relates / is saying'],
             cor:'b', hint:'may be related (modal passive — belirsiz bağlantı) + is said (Present Passive impersonal)'},
            {q:'Generally, Mr Eames ....... by his colleagues, but he ....... to be aware of this fact.',
             opts:['isn\'t liked / doesn\'t seem','doesn\'t like / hasn\'t seemed','didn\'t like / didn\'t seem','hasn\'t liked / won\'t have seemed'],
             cor:'a', hint:'isn\'t liked (Present Passive — sevilmiyor) + doesn\'t seem (aktif)'},
            {q:'I know you ....... my cosmetics again as right now, I ....... my perfume in the room.',
             opts:['are used / am smelling','used / could have smelt','have been using / can smell','were used / must be smelling'],
             cor:'c', hint:'have been using (Present Perfect Continuous aktif — kullanıyorsun) + can smell (modal aktif — algılama)'},
            {q:'This is the fifth time I ....... a phone call for a hairdresser\'s. I wonder if our number ....... by mistake in a hairdresser\'s advertisement.',
             opts:['am receiving / is printing','was received / was printed','had received / were printing','have received / has been printed'],
             cor:'d', hint:'have received (Present Perfect aktif — 5. kez) + has been printed (Present Perfect Passive — yanlışlıkla)'},
            {q:'Every year, more than 200,000 acres of forest ....... in the USA by fires in a single summer.',
             opts:['are destroyed','have been destroying','will have destroyed','were destroying'],
             cor:'a', hint:'are destroyed (Present Simple Passive — her yıl tekrar eden genel gerçek)'},
        ]
    },
    /* ── TEST YOURSELF 3 — Q21-35 ── */
    {
        label: 'Set 11',
        questions: [
            {q:'Carrie Chapman Catt ....... success in 1920 when women ....... equal rights to vote in the US.',
             opts:['achieved / were given','had achieved / were giving','would have achieved / had given','could achieve / have been given'],
             cor:'a', hint:'achieved (Past Simple aktif) + were given (Past Simple Passive — hak tanındı)'},
            {q:'The disease of cattle, Texas Fever, ....... in the Western Hemisphere during the Spanish colonisation of Mexico, but by 1980, it ....... completely from the US.',
             opts:['had introduced / was eradicated','introduced / was eradicating','must be introduced / could be eradicated','has been introduced / had eradicated','was introduced / had been eradicated'],
             cor:'e', hint:'was introduced (Past Simple Passive) + had been eradicated (Past Perfect Passive — 1980\'e kadar)'},
            {q:'Salt ....... in Salzkammergut, Austria, since prehistoric times, but the town ....... most of its income today from tourism.',
             opts:['was being mined / is gaining','was mined / has been gained','has been mined / gains','is being mined / gained'],
             cor:'c', hint:'has been mined (Present Perfect Passive — since) + gains (aktif, şimdiki gerçek)'},
            {q:'I really hate ....... by salespeople when I\'m shopping.',
             opts:['to have pestered','being pestered','to pester','pestering'],
             cor:'b', hint:'hate + being + V₃ (Passive gerund — sataşılmaktan nefret etmek)'},
            {q:'Don\'t forget us all as soon as you .......',
             opts:['were promoting','will promote','were promoted','have been promoted'],
             cor:'d', hint:'have been promoted (Present Perfect Passive — terfi aldıktan sonra)'},
            {q:'The plants in the hall ....... after by the caretaker, who ....... them every day.',
             opts:['are looking / is watering','were being looked / has watered','have been looked / is watered','are looked / waters'],
             cor:'d', hint:'are looked after (Present Passive — phrasal verb passive) + waters (aktif, routinely)'},
            {q:'A: What have you done to your wrist? B: I ....... off a cliff face while I ....... on Saturday.',
             opts:['fell / was climbing','was falling / climbed','had fallen / have climbed','have fallen / was climbed'],
             cor:'a', hint:'fell (Past Simple aktif — tek seferlik düşme) + was climbing (Past Continuous aktif — arka plan)'},
            {q:'When she ....... her husband, Silvia ....... herself to weave rush seats, and now she repairs them for her livelihood.',
             opts:['was divorced / has taught','has divorced / was teaching','is divorced / will be taught','divorced / taught'],
             cor:'d', hint:'divorced (Past Simple aktif/passive) + taught (Past Simple aktif — kendi kendine öğretti)'},
            {q:'I ....... able to calculate quotations for customers since the company procedure ....... to me.',
             opts:['will be / has explained','have been / was explained','was / had explained','should be / were explaining'],
             cor:'b', hint:'have been (Present Perfect aktif) + was explained (Past Simple Passive — anlatıldı)'},
            {q:'At the end of the training session, you ....... a test. Students who pass ....... to scuba dive in the open seas.',
             opts:['are given / have allowed','have given / have been allowed','will be given / will be allowed','had been giving / are allowed'],
             cor:'c', hint:'will be given (Future Passive) + will be allowed (Future Passive — izin verilecek)'},
        ]
    },
    /* ── TEST YOURSELF 3 — Q31-45 ── */
    {
        label: 'Set 12',
        questions: [
            {q:'Oh gosh! You ....... meeting Leonardo Di Caprio in real life. I wish I had been you.',
             opts:['could have excited','must have been excited','might have been exciting','should have excited'],
             cor:'b', hint:'must have been excited (geçmiş güçlü çıkarım — heyecanlanmış olmalısın)'},
            {q:'The garden of our house ....... from the farm next door by a stream.',
             opts:['is separated','separates','will separate','has separated'],
             cor:'a', hint:'is separated (Present Passive stative — dere ayırıyor/ayrılmış durumda)'},
            {q:'So long as you ....... them a reasonable price, I\'m sure they ....... the tiles from you.',
             opts:['have been given / bought','give / will buy','had been giving / are buying','will give / are bought'],
             cor:'b', hint:'give (aktif, koşul — makul fiyat verirsen) + will buy (aktif, gelecek sonuç)'},
            {q:'Hopefully, I ....... comfortable in my job by the time I ....... my training.',
             opts:['have felt / was finishing','was feeling / was finished','am going to feel / am finished','will have felt / finished','will be feeling / finish'],
             cor:'e', hint:'will be feeling (Future Continuous aktif) + finish (Present Simple → future after "by the time")'},
            {q:'Why is it always regarded as so funny when someone ....... in the face with a cream-pie?',
             opts:['was slapping','is slapped','will have slapped','has slapped'],
             cor:'b', hint:'is slapped (Present Simple Passive — genel gerçek, her seferinde)'},
            {q:'I ....... him only when he ....... himself to be a decent manager.',
             opts:['have trusted / was proved','had trusted / has proved','will trust / proves','trust / proved'],
             cor:'c', hint:'will trust (Future aktif, koşul sonucu) + proves (Present Simple aktif — kendini kanıtlarsa)'},
            {q:'Are you sure you ....... your sun hat? It looks as if it ....... quite hot.',
             opts:['haven\'t needed / has been getting','aren\'t needed / has got','won\'t need / is going to get','hadn\'t needed / was getting'],
             cor:'c', hint:'won\'t need (Future aktif olumsuz) + is going to get (be going to — belirtilere dayalı tahmin)'},
            {q:'Festivals and holidays ....... since ancient times.',
             opts:['have been celebrated','are being celebrated','might have celebrated','were celebrated'],
             cor:'a', hint:'have been celebrated (Present Perfect Passive — since ancient times)'},
            {q:'We ....... into our new flat until the electricity ....... .',
             opts:['wouldn\'t move / was connecting','shouldn\'t move / has connected','don\'t move / will be connected','haven\'t moved / was connected','can\'t move / is connected'],
             cor:'e', hint:'can\'t move (modal aktif — taşınamayız) + is connected (Present Passive — bağlanana kadar)'},
            {q:'The police suspected that the drugs ....... in the basement, but they ....... any.',
             opts:['are storing / aren\'t finding','were stored / didn\'t find','could have stored / won\'t find','had been stored / don\'t find'],
             cor:'b', hint:'were stored (Past Simple Passive — depolanmıştı) + didn\'t find (Past Simple aktif — bulmadılar)'},
        ]
    },
    /* ── TEST YOURSELF 3 — Q41-45 & TEST YOURSELF 4 — Q1-10 ── */
    {
        label: 'Set 13',
        questions: [
            {q:'Carrots ....... to be good for your eyesight.',
             opts:['are believed','have believed','believe','will believe'],
             cor:'a', hint:'are believed (Present Passive impersonal — "It is believed that carrots are good...")'},
            {q:'Aunt Sue ....... on by now. Let\'s telephone the hospital and inquire how she is.',
             opts:['should have operated','must have been operated','might be operating','ought to be operating'],
             cor:'b', hint:'must have been operated (geçmiş güçlü çıkarım — ameliyat edilmiş olmalı)'},
            {q:'We ....... something to eat and drink when we have cleared up because we ....... for five hours without a break.',
             opts:['were needed / had been working','needed / have been working','are needed / are going to work','will need / will have been working'],
             cor:'d', hint:'will need (Future aktif) + will have been working (Future Perfect Continuous — 5 saatlik süre)'},
            {q:'Their salesman ....... that all their cars ....... with air conditioning.',
             opts:['was claimed / will be supplied','is claimed / had been supplied','claims / are supplied','will claim / have supplied'],
             cor:'c', hint:'claims (aktif) + are supplied (Present Passive stative — donatılmış geliyor)'},
            {q:'The original Mill House ....... down in the 19th century, and afterwards, it ....... with striking red bricks.',
             opts:['was burnt / was rebuilding','burnt / was rebuilt','would burn / rebuilt','has burnt / has been rebuilt'],
             cor:'b', hint:'burnt (Past Simple aktif) + was rebuilt (Past Simple Passive — yeniden inşa edildi)'},
            {q:'By the end of the year, everybody who ....... unemployed for over two years ....... on a training scheme.',
             opts:['is / will be sending','was / had been sending','has been / will have been sent','had been / has been sent'],
             cor:'c', hint:'has been (Present Perfect — 2 yıldır işsiz) + will have been sent (Future Perfect Passive)'},
            {q:'The point on the surface of the Earth directly above the focus, the point where the first movement ....... place, ....... the epicenter of an earthquake.',
             opts:['takes / is called','has taken / has called','will be taken / has been called','was taken / was called'],
             cor:'a', hint:'takes (aktif, genel gerçek — deprem mekanizması) + is called (Present Passive — adlandırılır)'},
            {q:'The Richter Magnitude Scale, which ....... upon the amount of energy released, ....... earthquakes on a 1 to 10 scale.',
             opts:['bases / has graded','has based / was graded','was based / is graded','will be based / graded','is based / grades'],
             cor:'e', hint:'is based (Present Passive stative — dayanan) + grades (aktif, genel gerçek — derecelendirir)'},
            {q:'Forms of bread ....... as food since prehistoric times. Probably, the first bread ....... from acorns or beechnuts.',
             opts:['were used / has been made','will have been used / was making','have been used / was made','are used / used to make'],
             cor:'c', hint:'have been used (Present Perfect Passive — since prehistoric) + was made (Past Simple Passive — ilk ekmek)'},
            {q:'Constantin Brancusi, who ....... by the French sculptor Rodin, ....... works in bronze, stone and wood.',
             opts:['influences / was created','was influenced / created','influenced / has created','has been influenced / is created'],
             cor:'b', hint:'was influenced (Past Simple Passive — etkilenmiş) + created (Past Simple aktif — ürettî)'},
        ]
    },
    /* ── TEST YOURSELF 4 — Q6-20 ── */
    {
        label: 'Set 14',
        questions: [
            {q:'Thatched roofs ....... in London in 1212, but they ....... to be used elsewhere even today.',
             opts:['are forbidden / are continued','have been forbidden / will continue','forbade / have been continuing','were forbidden / continue'],
             cor:'d', hint:'were forbidden (Past Simple Passive — 1212\'de yasaklandı) + continue (aktif, şimdi de devam)'},
            {q:'The city of Plovdiv, on the Maritsa River in Bulgaria, ....... considerably in an earthquake in 1928.',
             opts:['was damaged','is damaged','had damaged','was damaging'],
             cor:'a', hint:'was damaged (Past Simple Passive — 1928 depremi)'},
            {q:'All video cassettes ....... before they ....... to the hire shop.',
             opts:['have to rewind / return','should be rewound / are returned','must have rewound / are returning','will be rewound / were returned'],
             cor:'b', hint:'should be rewound (modal passive — geri sarılmalı) + are returned (Present Passive — iade edildiğinde)'},
            {q:'Miguel de Cervantes ....... the idea for Don Quixote while in prison. The second part of the story ....... one year before he died.',
             opts:['was conceived / was completing','had conceived / has completed','used to conceive / completes','has conceived / must be completed','conceived / was completed'],
             cor:'e', hint:'conceived (Past Simple aktif) + was completed (Past Simple Passive — ölmeden bir yıl önce)'},
            {q:'Mecca ....... by tens of thousands of pilgrims annually.',
             opts:['has visited','visits','is visited','visited'],
             cor:'c', hint:'is visited (Present Simple Passive — genel gerçek, yıllık ziyaret)'},
            {q:'Molasses ....... as a by-product of sugar production. Several light and flavourful varieties ....... as table syrups.',
             opts:['obtains / have been used','is being obtained / will be using','was obtained / had used','is obtained / are used'],
             cor:'d', hint:'is obtained (Present Passive stative) + are used (Present Passive stative — kullanılır)'},
            {q:'Mark ....... to let us know that they ....... for the party.',
             opts:['has phoned / will be delayed','has been phoning / have delayed','had been phoned / were delaying','will be phoned / delayed','is phoning / had been delayed'],
             cor:'a', hint:'has phoned (Present Perfect aktif) + will be delayed (Future Passive — gecikecekler)'},
            {q:'If the direct sunlight ....... you, I can draw the blinds.',
             opts:['has been disturbed','was disturbed','was disturbing','is disturbed','is disturbing'],
             cor:'e', hint:'is disturbing (Present Continuous aktif — şu an rahatsız ediyorsa)'},
            {q:'Microorganisms ....... into bacteria, protozoans, algae, fungi and viruses, and the study of each ....... a separate specialty within microbiology.',
             opts:['have classified / is formed','will be classified / has been formed','are classifying / has formed','were classified / was formed','are classified / forms'],
             cor:'e', hint:'are classified (Present Passive stative — sınıflandırılır) + forms (aktif, genel gerçek)'},
            {q:'The city of Bremen, Germany, ....... into two sections: Altstadt and Neustadt. The two sections ....... by three bridges.',
             opts:['is divided / are connected','has been divided / are connecting','was being divided / have connected','was dividing / had been connected'],
             cor:'a', hint:'is divided (Present Passive stative) + are connected (Present Passive stative)'},
        ]
    },
    /* ── TEST YOURSELF 4 — Q16-31 ── */
    {
        label: 'Set 15',
        questions: [
            {q:'Mr Cartwright ....... at the moment for the promotion. I hope he gets the job as he ....... it.',
             opts:['is interviewing / has deserved','has been interviewed / is deserving','is being interviewed / deserves','will be interviewed / deserved'],
             cor:'c', hint:'is being interviewed (Present Continuous Passive — şu an mülakatta) + deserves (aktif stative)'},
            {q:'If eating disorders ....... , they can be fatal.',
             opts:['aren\'t treating','aren\'t treated','weren\'t treated','don\'t treat'],
             cor:'b', hint:'aren\'t treated (Present Passive — tedavi edilmezse, genel koşul)'},
            {q:'The manager would like these letters ....... out today.',
             opts:['to have sent','having sent','to be sent','to send'],
             cor:'c', hint:'would like + sth + to be done: to be sent (Passive infinitive)'},
            {q:'The guest rooms ....... before your cousins from Canada visit us.',
             opts:['will have to be redecorated','used to be redecorated','will have redecorated','must have redecorated'],
             cor:'a', hint:'will have to be redecorated (modal perfect passive — yeniden dekore edilmesi gerekecek)'},
            {q:'The actress Coral Atkins was so appalled by the way children ....... in state homes that she ....... her own children\'s home.',
             opts:['are treating / was opening','have been treated / is opened','had treated / opens','were treated / opened'],
             cor:'d', hint:'were treated (Past Simple Passive — çocuklara nasıl davranıldığı) + opened (Past Simple aktif)'},
            {q:'I hope we ....... with lunch after the presentation as I haven\'t brought any sandwiches.',
             opts:['were served','have been served','serve','are serving','will be served'],
             cor:'e', hint:'will be served (Future Passive — servis yapılacak)'},
            {q:'Professional microbiologists ....... in a wide variety of positions, but the majority ....... in universities, government agencies or industry.',
             opts:['are employed / work','used to employ / worked','employ / have been worked','were employed / will have worked'],
             cor:'a', hint:'are employed (Present Passive stative — istihdam edilir) + work (aktif, genel gerçek)'},
            {q:'John ....... for his directness, but I think his remarks to David ....... as plain rude!',
             opts:['has known / should be described','is known / can be described','knew / will be describing','has been known / were describing'],
             cor:'b', hint:'is known (Present Passive stative — tanınıyor) + can be described (modal passive — tanımlanabilir)'},
            {q:'I ....... that the car is any good until I ....... it myself.',
             opts:['haven\'t been convinced / drove','wasn\'t convincing / was driving','won\'t be convinced / have driven','wasn\'t convinced / had been driven'],
             cor:'c', hint:'won\'t be convinced (Future Passive olumsuz) + have driven (Present Perfect aktif — bizzat kullandıktan sonra)'},
            {q:'The town of Balboa is situated on the site of a swamp, which ....... with the rocks dug out while the Panama Canal .......',
             opts:['has been filled / was constructing','has been filling / will be constructed','was filling / had been constructed','was filled / was being constructed'],
             cor:'d', hint:'was filled (Past Simple Passive) + was being constructed (Past Continuous Passive — kanal inşaatı sürerken)'},
        ]
    },
    /* ── TEST YOURSELF 4 — Q27-45 ── */
    {
        label: 'Set 16',
        questions: [
            {q:'The tea tree ....... only in Australia, but recently people around the world ....... the oil for many medicinal purposes.',
             opts:['grows / have been using','was grown / were using','has been grown / use','is growing / will have used'],
             cor:'a', hint:'grows (aktif stative — sadece Avustralya\'da yetişir) + have been using (Present Perfect aktif — recently)'},
            {q:'Tom Thumb, the famous dwarf of the 19th century, was born Charles Sherwood Stratton, but later he ....... by his stage name.',
             opts:['knew','will know','has been known','has known','was known'],
             cor:'e', hint:'was known (Past Simple Passive stative — sahne adıyla tanınırdı)'},
            {q:'Tom Thumb ....... parents of normal height, but he only ....... to a height of 3 feet 4 inches.',
             opts:['has / had been grown','had / grew','is having / will be grown','had had / will grow'],
             cor:'b', hint:'had (Past Simple aktif stative — sahipti) + grew (Past Simple aktif — büyüdü)'},
            {q:'After the workers ....... from their jobs at the factory, not many of them ....... jobs quickly.',
             opts:['were dismissed / had been found','have been dismissed / were finding','dismiss / are finding','will have dismissed / can find','had been dismissed / found'],
             cor:'e', hint:'had been dismissed (Past Perfect Passive) + found (Past Simple aktif — buldular)'},
            {q:'Residents who live near the nuclear power plant worry that their children ....... to radioactivity.',
             opts:['expose','exposed','will have exposed','had exposed','are being exposed'],
             cor:'e', hint:'are being exposed (Present Continuous Passive — şu an maruz kalmakta)'},
            {q:'The organisers claim that visitors ....... at the exhibits at the EXPO2000 exhibition in Hanover, Germany.',
             opts:['will be amazed','are going to amaze','will have amazed','have been amazing'],
             cor:'a', hint:'will be amazed (Future Passive — ziyaretçiler hayrete düşürülecek)'},
            {q:'When you ....... an advertisement, you ....... into account the type of people you want to be attracted to it.',
             opts:['are being designed / must take','designed / had better take','are designing / have to take','will design / have been taken'],
             cor:'c', hint:'are designing (Present Continuous aktif — tasarlarken) + have to take (zorunluluk aktif)'},
            {q:'The National Lottery ....... twice a week in the UK: Wednesday and Saturday.',
             opts:['is drawn','is drawing','was drawing','draws'],
             cor:'a', hint:'is drawn (Present Simple Passive stative — çekiliş yapılır)'},
            {q:'At the beginning of the 20th century most solid waste ....... of by dumping it onto vacant land near where it .......',
             opts:['had disposed / has generated','has been disposed / generates','will have disposed / is generating','disposed / has been generated','was disposed / was generated'],
             cor:'e', hint:'was disposed of (Past Simple Passive — bertaraf ediliyordu) + was generated (Past Simple Passive — üretildiği yer)'},
            {q:'After I ....... ants in the kitchen, I ....... the crack in the wall with ant powder.',
             opts:['had discovered / filled','was discovered / was filled','was discovering / should fill','have discovered / was filling'],
             cor:'a', hint:'had discovered (Past Perfect aktif — keşfettikten sonra) + filled (Past Simple aktif)'},
        ]
    },
    /* ── TEST YOURSELF 4 — Q39-50 & TRANSLATIONS ── */
    {
        label: 'Set 17',
        questions: [
            {q:'Many home appliances, like vacuum cleaners or microwave ovens, ....... for their labour-saving capabilities, while others ....... for their convenience.',
             opts:['have chosen / will purchase','are chosen / are purchased','will be chosen / purchase','are choosing / have purchased'],
             cor:'b', hint:'are chosen (Present Passive stative) + are purchased (Present Passive stative)'},
            {q:'Airliners ....... parachutes because it is impractical to instruct passengers in their use in an emergency.',
             opts:['aren\'t carried','weren\'t carrying','won\'t be carried','don\'t carry'],
             cor:'d', hint:'don\'t carry (Present Simple aktif olumsuz — aktif seçim: taşımazlar)'},
            {q:'Of the many methods that are available today, only radio navigation ....... for all-weather flying.',
             opts:['has been using','will have used','can be used','had been used'],
             cor:'c', hint:'can be used (modal passive — kullanılabilir)'},
            {q:'Although very often the autopsy ....... only with forensic medicine in the determination of death from foul play, it ....... a number of other purposes as well.',
             opts:['is associated / serves','has been associated / is served','associated / was serving','was associated / has been served'],
             cor:'a', hint:'is associated (Present Passive stative) + serves (aktif, genel gerçek — birçok amaca hizmet eder)'},
            {q:'It\'s surprising that, of the few Viking helmets that ....... in excavations so far, none ....... horns.',
             opts:['were found / may have','were finding / had','have been found / have','had found / were having'],
             cor:'c', hint:'have been found (Present Perfect Passive — so far) + have (aktif stative — boynuzu var)'},
            {q:'The enormously heavy bill which ....... the shoveler bird its name ....... for feeding on the surface of ponds and lakes.',
             opts:['was given / had been adapting','has been given / will be adapted','was giving / has adapted','gives / is adapted'],
             cor:'d', hint:'gives (aktif — adını veriyor) + is adapted (Present Passive stative — uyarlanmıştır)'},
            {q:'Fransız yazar Albert Camus\'un romanları ve oyunları duygusuz, anlamsız bir evreni yansıtır.',
             opts:['In his novels and plays, the French author Albert Camus wrote mainly about an indifferent, nonsensical universe.','The novels and plays of the French author Albert Camus reflect an indifferent, meaningless universe.','Albert Camus\'s novels and plays are often set in an imaginary, nonsensical universe.','The French author Albert Camus wrote many plays and books about an indifferent, meaningless universe.'],
             cor:'b', hint:'yansıtır → reflect; duygusuz, anlamsız → indifferent, meaningless'},
            {q:'Duyduğuma göre, Brown\'ların evi, hepsi evde bir filme dalmışken soyulmuş.',
             opts:['According to what I\'ve heard, the Browns\' house was burgled while they were all at home absorbed in a film.','I heard that the Brown\'s house was actually burgled while they were all at home watching a film.','The Browns were so involved in a film that, apparently, they didn\'t even hear some burglars break into their house.','I was surprised to hear that the Browns\' house was broken into when they were all at home intently watching a film.'],
             cor:'a', hint:'Duyduğuma göre → According to what I\'ve heard; bir filme dalmışken → absorbed in a film'},
            {q:'Bölgedeki personeli korumak ve hassas enstrümanların güvenliğini sağlamak için nükleer reaktörlerin işletilmesinde büyük dikkat gerekmektedir.',
             opts:['The safety of personnel and the protection of sensitive instruments are of great importance during the operation of nuclear reactors.','During the operation of nuclear reactors, extreme care should be taken by the personnel in the area to protect the sensitive instruments.','In the operation of nuclear reactors, great care is required to protect the personnel in the area and to secure the safety of the sensitive instruments.','When operating nuclear reactors, the personnel have to take great care with safety procedures as the instruments are highly sensitive.'],
             cor:'c', hint:'büyük dikkat gerekmektedir → great care is required; personeli korumak ve güvenliği sağlamak → to protect the personnel and to secure the safety'},
            {q:'Eskiden Ortak Pazar ya da Avrupa Topluluğu diye bilinen, Avrupa\'nın ekonomik ve politik entegrasyonu için kurulmuş organizasyon, 1993\'te Avrupa Birliği adını almıştır.',
             opts:['Founded in 1993, the European Union, formerly the Common Market or the European Community, aims to promote economic and political integration throughout Europe.','The European Union, renamed in 1993, which had been formerly known both as the Common Market and the European Community, serves to promote economic and political integration of Europe.','In 1993, the European Community, formerly known as the Common Market, took the name European Union.','Formerly known as the Common Market or European Community, the organisation founded for the economic and political integration of Europe took the name European Union in 1993.'],
             cor:'d', hint:'Eskiden...diye bilinen → Formerly known as; 1993\'te Avrupa Birliği adını almıştır → took the name European Union in 1993'},
        ]
    },
    /* ── TEST YOURSELF 4 — Çeviri & Eşanlamlı Cümle Q51-70 ── */
    {
        label: 'Set 18',
        questions: [
            {q:'Sığırlar önce Asya\'da evcilleştirilmiş olmalı; çünkü en eski sığır kemikleri, oradaki yerleşim bölgelerinde bulunmuştur.',
             opts:['According to evidence in the form of bones, Asians were most likely the first people to domesticate cattle.','The practice of domesticating cattle most likely originated in Asia, where the oldest cattle bones have been found.','Cattle bones which have been found in Asia are believed to be from the oldest examples of domesticated animals.','Cattle must have been domesticated in Asia first, for the oldest cattle bones have been found in settlements there.'],
             cor:'d', hint:'evcilleştirilmiş olmalı → must have been domesticated; çünkü → for; oradaki yerleşim bölgelerinde bulunmuştur → have been found in settlements there'},
            {q:'Dünya Bankası\'nın amacı, üye ülkelerdeki ekonomik gelişmeyi destekleyecek projeleri finanse etmektir.',
             opts:['The World Bank promotes economic development throughout the world by financing projects.','The purpose of the World Bank is to finance projects that promote economic development in member nations.','The member nations use the World Bank to finance projects which promote economic development.','The World Bank aims to promote economic development in member nations by financing worldwide projects.'],
             cor:'b', hint:'amacı... etmektir → The purpose...is to; üye ülkelerdeki ekonomik gelişmeyi destekleyecek projeleri finanse etmek → finance projects that promote economic development in member nations'},
            {q:'Gilbert Stuart, özellikle George Washington\'ın parlak renkli portreleriyle tanınır.',
             opts:['George Washington was a favourite subject of Gilbert Stuart\'s luminously coloured portraits.','Gilbert Stuart is especially known for his luminously coloured portraits of George Washington.','Well-known artists, particularly Gilbert Stuart, painted some luminous portraits of George Washington.','The famous artist Gilbert Stuart\'s portraits of George Washington are all luminously coloured.'],
             cor:'b', hint:'özellikle tanınır → is especially known for; parlak renkli portreleriyle → his luminously coloured portraits'},
            {q:'Zor durumlardaki davranış biçiminin, insanın gerçek karakterini açığa çıkardığı söylenir.',
             opts:['It is believed that a person\'s behaviour under pressure is a test of his or her strength of character.','People say that how a person behaves in difficult times can show his or her true strength of character.','Often people don\'t act their true selves when they are faced with great difficulties.','It\'s said that the way one behaves in difficulties reveals one\'s real character.'],
             cor:'d', hint:'söylenir → It\'s said that; zor durumlardaki davranış biçimi → the way one behaves in difficulties; gerçek karakterini açığa çıkarır → reveals one\'s real character'},
            {q:'Sence yeni program gelecek ay bu zamanlar uygulamaya konmuş olur mu?',
             opts:['Do you think the new schedule will have been introduced by this time next month?','You think the new schedule will be introduced about this time next month, don\'t you?','In your opinion, the new schedule should be introduced by this time next month, shouldn\'t it?','Do you believe that they will have introduced the new schedule by the end of next month?'],
             cor:'a', hint:'uygulamaya konmuş olur mu → will have been introduced (Future Perfect Passive); bu zamanlara kadar → by this time next month'},
            {q:'Özel diyetler ve daha bilimsel bakım sayesinde hayvanat bahçelerinde eskiden olduğundan çok daha fazla yavru doğmaktadır.',
             opts:['A combination of special diets and scientific care has led to an increase in the number of baby animals born in zoos.','The increase in births of animals in zoos recently is due mainly to special diets and more scientific care.','Thanks to special diets and more scientific care, many more baby animals are being born in zoos than in the past.','In the past, very few baby animals were born in zoos, but recently, this has improved due to scientific care.'],
             cor:'c', hint:'sayesinde → Thanks to; eskiden olduğundan çok daha fazla → many more...than in the past; doğmaktadır → are being born'},
            {q:'In world markets, the bigger South American bananas are preferred over the African varieties.',
             opts:['Dünya piyasalarında daha çok, Afrika türlerine göre daha irice olan Güney Amerika muzu rağbet görmektedir.','Dünya piyasalarında, Afrika\'daki türlerine tercih edilen Güney Amerika muzu daha iridir.','Dünya piyasaları, Afrika\'daki türlerine göre daha irice olan Güney Amerika muzunu tercih etmektedir.','Dünya piyasalarında en çok rağbet gören muz, Afrika türlerinden daha iri olan Güney Amerika muzudur.'],
             cor:'e', hint:'are preferred over → tercih edilmektedir; the bigger → daha iri olan'},
            {q:'Many forms of anemia are acquired, which shows that they are not due to genetic disorders but develop after birth.',
             opts:['Bulgular göstermiştir ki aneminin, doğuştan gelen genetik bozukluklardan kaynaklanmayıp sonradan gelişen pek çok türü vardır.','Pek çok anemi türü sonradan ortaya çıktığına göre, bu hastalığın bazı türleri genetik bozukluktan kaynaklanmıyor, daha çok doğduktan sonra gelişiyor.','Aneminin pek çok türü genetik bir bozukluktan kaynaklanmayıp sonradan edinildiği için bu hastalığın doğduktan sonra geliştiği söylenebilir.','Aneminin pek çok türü sonradan edinilmektedir ki bu da onların genetik bozukluktan dolayı olmadığını, doğduktan sonra geliştiğini göstermektedir.'],
             cor:'d', hint:'are acquired → sonradan edinilmektedir; which shows that → ki bu da...göstermektedir; not due to genetic disorders but develop after birth → genetik değil, doğduktan sonra gelişir'},
            {q:'At yesterday\'s committee meeting, very interesting suggestions were made while the programme for the coming season was being discussed.',
             opts:['Komitenin dünkü toplantısında, önümüzdeki sezonun programıyla ilgili çok ilginç öneriler tartışıldı.','Dünkü komite toplantısında, gelecek sezonun programı tartışılırken çok ilginç öneriler yapıldı.','Komite, dünkü toplantısında, gelecek sezonun programını görüşürken çok ilginç öneriler getirdi.','Dünkü komite toplantısının gündemi, ilginç önerilerin tartışıldığı gelecek sezonun programıydı.'],
             cor:'b', hint:'were made → yapıldı; while was being discussed → tartışılırken'},
            {q:'The police think that this assault case is connected with the murder committed last week in the dockyards.',
             opts:['Polis, bu saldırı olayının geçen hafta tersanede işlenen cinayetle bağlantılı olduğunu düşünüyor.','Polise göre, bu saldırı olayıyla geçen hafta tersanede işlenen cinayet arasında bağlantı olabilir.','Polis, geçen haftaki tersane cinayetiyle bu saldırı arasında bağlantı olduğundan kuşkulanıyor.','Polis, bu saldırı olayının geçen hafta tersanede işlenen cinayetle ilişkisi olabileceği kanısında.'],
             cor:'a', hint:'think that...is connected with → bağlantılı olduğunu düşünüyor; committed last week in the dockyards → geçen hafta tersanede işlenen'},
        ]
    },
    /* ── TEST YOURSELF 4 — Eşanlamlı Cümle Q71-85 ── */
    {
        label: 'Set 19',
        questions: [
            {q:'This morning I drove past a pheasant, which had been run over.',
             opts:['I passed a pheasant, which someone had run over, in my car this morning.','This morning I overtook the driver who had run down a pheasant in his car.','Unfortunately, I ran over a pheasant in my car this morning.','I couldn\'t avoid running over a pheasant, which appeared in front of me so suddenly, this morning.'],
             cor:'a', hint:'drove past = passed; had been run over = which someone had run over'},
            {q:'Due to a school boy\'s protests, a hazard warning sign has been erected at the point where ducks often cross the road.',
             opts:['A school boy protested about the hazard warning sign, which had been put up at a place near a habitat of ducks.','They put up a hazard warning sign at the place which is frequently used by ducks to cross the road after the protests by a pupil.','A school boy suggests that the ducks could be protected if they put a hazard warning sign on the road.','A pupil from a nearby school put up a hazard warning sign at the side of the road in order to protect the ducks.'],
             cor:'b', hint:'due to protests = after the protests; has been erected = they put up; where ducks often cross = frequently used by ducks to cross'},
            {q:'Not being selected for promotion disappointed him.',
             opts:['He will be disappointed if he is not chosen for promotion.','To his disappointment, they gave the manager\'s job to someone else.','He was disappointed when he was not chosen for promotion.','He wasn\'t promoted because his performance was so disappointing.'],
             cor:'c', hint:'not being selected = when he was not chosen; disappointed him = he was disappointed'},
            {q:'Despite being criticised by journalists, the Millennium Dome has attracted thousands of visitors.',
             opts:['Thousands of people have visited the Millennium Dome even though journalists criticised it.','The Millennium Dome had received thousands of visitors before journalists criticised it.','Many of the visitors to the Millennium Dome have criticised it to journalists.','The criticism of journalists dissuaded thousands of people from visiting the Millennium Dome.'],
             cor:'a', hint:'despite being criticised = even though journalists criticised it; has attracted thousands = thousands of people have visited'},
            {q:'In England, as in Turkey, many surnames are derived from the skills and professions of ancestors.',
             opts:['Most sons in England, as in Turkey, are named after their father\'s profession.','Surnames in most countries, including England and Turkey, are based on the names of former skills and professions.','Different from in Turkey, many of our ancestors in England were named after their skill or profession.','Surnames in England can often be traced back to the skills and professions of ancestors, as is the case in Turkey.'],
             cor:'d', hint:'are derived from = can be traced back to; as in Turkey = as is the case in Turkey'},
            {q:'This course of ours has been developed for users with no experience of Microsoft Excel.',
             opts:['We believe that the people who developed this course have never used Microsoft Excel.','We require you to have at least some experience of Microsoft Excel to take this course.','During this course, we will help you develop your skills on Microsoft Excel.','Your skills on Microsoft Excel will be enhanced during this course of ours.','We have designed this course for people who have never used Microsoft Excel.'],
             cor:'e', hint:'has been developed for users with no experience = designed for people who have never used'},
            {q:'An effective antibacterial substance in crocodiles\' blood has just been discovered.',
             opts:['They have very recently identified an effective antibody in crocodiles\' blood.','Crocodiles have remarkable antibacterial substances in their blood.','The latest discovery in the field of medicine is that crocodiles have an effective antibody in their blood.','They have just started looking at crocodiles\' blood in order to find an antibody.'],
             cor:'a', hint:'has just been discovered = they have very recently identified; antibacterial substance = antibody'},
            {q:'Generally, scientists prefer to keep the details of their research secret until something has been proved.',
             opts:['Scientists often worry about public reaction to their research if they haven\'t proved something with concrete evidence.','In general, up until they have proved something, scientists would rather not disclose details of their research.','Usually, people would like to learn the details of scientists\' research even before they have proved their theories.','Scientists don\'t have to release information about their work until they have proved something.'],
             cor:'b', hint:'prefer to keep secret = would rather not disclose; until something has been proved = up until they have proved something'},
            {q:'Before Mozambique can be restored to normal, considerable investment is required.',
             opts:['It\'s normal that Mozambique requires significant investment in order to achieve a higher standard of living.','The fate of Mozambique can only be altered with sizeable investment.','Normally, stability in Mozambique cannot be achieved without some investment from overseas.','They consider investing large sums to help relieve the suffering in Mozambique.','Mozambique will need significant investment before the country can return to normal.'],
             cor:'e', hint:'before can be restored to normal = before the country can return to normal; considerable investment is required = will need significant investment'},
            {q:'In Greek mythology, Medusa transformed whoever looked into her eyes to stone.',
             opts:['According to Greek myth, anyone who glanced into the eyes of Medusa was turned to stone.','The ancient Greeks believed that Medusa was capable of turning people to stone by looking at them.','Medusa in Greek myth was a monster who turned lots of people into stone by glancing at them.','It\'s believed that Medusa in Greek mythology was turned into stone when people looked into her eyes.'],
             cor:'a', hint:'transformed whoever looked to stone = anyone who glanced...was turned to stone (passive)'},
        ]
    },
    /* ── YENİ SET EKLEMEK İÇİN BURAYA KOPYALA ──────────────────
    {
        label: 'Set 20',
        questions: [
            {q:'Soru metni ___.',
             opts:['A','B','C','D'],
             cor:'a', hint:'Açıklama'},
        ]
    },
    ─────────────────────────────────────────────────────────── */
];

/* ── Set state ── */
let _paSetIdx     = 0;
let _paSetScore   = 0;
let _paSetChecked = {};
let _paSetAnswers = {};

const PA_BLANKS = [
    {q:'The letter ___ (write / simple past passive) by the secretary yesterday.',
     ans:['was written'], hint:'Simple Past Passive: was/were + V₃'},
    {q:'The project ___ (complete / present perfect passive) by the team.',
     ans:['has been completed'], hint:'Present Perfect Passive: have/has been + V₃'},
    {q:'A new bridge ___ (build / present continuous passive) in the city center.',
     ans:['is being built'], hint:'Present Continuous Passive: am/is/are being + V₃'},
    {q:'She had her car ___ (repair) by a mechanic. (causative)',
     ans:['repaired'], hint:'have/get + something + done: have + nesne + V₃'},
    {q:'The teacher made the students ___ (rewrite) their essays. (causative)',
     ans:['rewrite'], hint:'make + someone + V₁ (tosuz)'},
    {q:'It ___ (say) that the economy is improving. (passive option 1)',
     ans:['is said'], hint:'It is said that... → is/are + V₃'},
    {q:'She got her friend ___ (help) her with the project. (causative)',
     ans:['to help'], hint:'get + someone + to V₁'},
];

const PA_MCQS = [
    {q:'The novel "Çalıkuşu" ___ by Reşat Nuri Güntekin.',
     opts:['wrote','has written','was written','is writing'],
     cor:'c', hint:'Passive Simple Past: was/were + V₃'},
    {q:'The windows ___ when the storm hit.',
     opts:['broke','were broken','are broken','break'],
     cor:'b', hint:'Simple Past Passive: were + V₃'},
    {q:'Trees ___ in the park right now.',
     opts:['are planting','have been planted','are being planted','were planting'],
     cor:'c', hint:'Present Continuous Passive: are being + V₃'},
    {q:'___ the meeting has been postponed. (It is believed that...)',
     opts:['It is believed that','They believed that','It believes that','That it is believed'],
     cor:'a', hint:'"It is believed that + cümle" yapısı'},
    {q:'He ___ his car washed every week.',
     opts:['does','makes','has','lets'],
     cor:'c', hint:'have + something + done: have my car washed'},
    {q:'She let her kids ___ up late on weekends.',
     opts:['to stay','staying','stayed','stay'],
     cor:'d', hint:'let + someone + V₁ (to\'suz)'},
    {q:'The project is said ___ well by the team.',
     opts:['going','to be going','being','be going'],
     cor:'b', hint:'be said/believed + to + infinitive: to be going'},
    {q:'Which verb CANNOT be used in passive form?',
     opts:['write','happen','build','photograph'],
     cor:'b', hint:'"happen" geçişsiz fiildir, passive yapılamaz'},
];

function paExercises() {
    return _paBuildExercisePage();
}

/* ════════════════════════════════════════════════════
   SET-BASED EXERCISE ENGINE
════════════════════════════════════════════════════ */
function _paBuildExercisePage() {
    const set   = PA_SETS[_paSetIdx];
    const total = set.questions.length;
    const letters = ['A','B','C','D','E'];
    const lv      = ['a','b','c','d','e'];

    /* ── Set sekme butonları ── */
    const tabs = PA_SETS.map(function(s, i) {
        return '<button class="gr-set-tab' + (i === _paSetIdx ? ' active' : '') + '" data-action="paSwitchSet(' + i + ')">' + s.label + '</button>';
    }).join('');

    /* ── Soru kartları ── */
    const cards = set.questions.map(function(q, i) {
        const opts = q.opts.map(function(o, j) {
            return '<div class="gr-opt" id="pa-sopt-' + i + '-' + j + '" data-action="paSetOpt(' + i + ',' + j + ',\'' + lv[j] + '\')">'
                + '<span class="gr-opt-letter">' + letters[j] + '</span>' + o + '</div>';
        }).join('');
        return '<div class="gr-q-card" id="pa-sq-' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0') + '</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#7c3aed;color:#7c3aed" data-action="paCheckSetQ(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="pa-sfb-' + i + '"></div>'
            + '</div>';
    }).join('');

    /* ── Navigasyon ── */
    const prevBtn = _paSetIdx > 0
        ? '<button class="gr-nav-btn" data-action="paSwitchSet(' + (_paSetIdx-1) + ')">← Önceki Set</button>' : '';
    const nextBtn = _paSetIdx < PA_SETS.length - 1
        ? '<button class="gr-nav-btn" data-action="paSwitchSet(' + (_paSetIdx+1) + ')">Sonraki Set →</button>' : '';

    return paH('✨ Pratik Yap', 'Alıştırmalar — ' + set.label,
               total + ' soruluk test. Passive yapıları ve tense kombinasyonlarını pekiştir.')
        + '<div class="gr-set-tabs">' + tabs + '</div>'
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="pa-live-score">0 / ' + total + '</span></div>'
        + cards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#4c1d95,#7c3aed)" data-action="paSubmitSet()">🎯 Seti Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="pa-result">'
        + '<div class="gr-res-score" id="pa-res-score" style="color:#7c3aed">0/' + total + '</div>'
        + '<div class="gr-res-lbl">Toplam Puan</div>'
        + '<div class="gr-res-msg" id="pa-res-msg"></div>'
        + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:12px">'
        + '<button class="gr-retry-btn" style="border-color:#7c3aed;color:#7c3aed" data-action="paRetrySameSet()">🔄 Aynı Seti Tekrarla</button>'
        + (nextBtn ? '<button class="gr-retry-btn" style="border-color:#10b981;color:#10b981" data-action="paNextSet()">Sonraki Set →</button>' : '')
        + '</div></div>'
        + '<div style="display:flex;gap:10px;justify-content:space-between;margin-top:16px">' + prevBtn + nextBtn + '</div>'
        + '</div>';
}

/* ════════════════════════════════════════════════════
   SET EXERCISE LOGIC
════════════════════════════════════════════════════ */
function _paUpdSetScore() {
    const el = document.getElementById('pa-live-score');
    if (el) el.textContent = _paSetScore + ' / ' + PA_SETS[_paSetIdx].questions.length;
}

function paSwitchSet(idx) {
    _paSetIdx     = idx;
    _paSetScore   = 0;
    _paSetChecked = {};
    _paSetAnswers = {};
    _paRenderSection('exercises');
}

function paSetOpt(qi, oi, letter) {
    const q = PA_SETS[_paSetIdx].questions[qi];
    q.opts.forEach(function(_, j) {
        const el = document.getElementById('pa-sopt-' + qi + '-' + j);
        if (el) el.classList.remove('sel');
    });
    const el = document.getElementById('pa-sopt-' + qi + '-' + oi);
    if (el) el.classList.add('sel');
    _paSetAnswers[qi] = letter;
}

function paCheckSetQ(i) {
    const q    = PA_SETS[_paSetIdx].questions[i];
    const sel  = _paSetAnswers[i];
    const fb   = document.getElementById('pa-sfb-' + i);
    const card = document.getElementById('pa-sq-' + i);
    if (!fb) return;
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    const letters = ['a','b','c','d','e'];
    q.opts.forEach(function(_, j) {
        const el = document.getElementById('pa-sopt-' + i + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_paSetChecked[i]) { _paSetScore++; _paSetChecked[i] = true; _paUpdSetScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_paSetChecked[i]) _paSetChecked[i] = 'wrong';
    }
}

function paSubmitSet() {
    const set     = PA_SETS[_paSetIdx];
    const total   = set.questions.length;
    const panel   = document.getElementById('pa-result');
    const scoreEl = document.getElementById('pa-res-score');
    const msgEl   = document.getElementById('pa-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _paSetScore + '/' + total;
    const pct = Math.round((_paSetScore / total) * 100);
    msgEl.textContent = pct >= 90 ? '🎉 Mükemmel! Passive yapılarına tam hâkimsin!'
                      : pct >= 70 ? '👏 Çok iyi! Tense kombinasyonlarını biraz daha gözden geçir.'
                      : pct >= 50 ? '📚 İyi başlangıç. Passive tense tablosuna tekrar bak!'
                      : '💪 Daha fazla pratik yapalım. Temel kavram ve tense tablosundan başla!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function paRetrySameSet() { paSwitchSet(_paSetIdx); }
function paNextSet()      { if (_paSetIdx < PA_SETS.length - 1) paSwitchSet(_paSetIdx + 1); }

/* ════════ GLOBALS ════════ */
// openPassiveSection ve _paRenderSection: _initPassiveModule içinde atandı
window.paSwitchSet    = paSwitchSet;
window.paSetOpt       = paSetOpt;
window.paCheckSetQ    = paCheckSetQ;
window.paSubmitSet    = paSubmitSet;
window.paRetrySameSet = paRetrySameSet;
window.paNextSet      = paNextSet;
/* legacy stubs */
window.paCheckBlank   = function(){};
window.paSelectOpt    = paSetOpt;
window.paCheckMCQ     = paCheckSetQ;
window.paSubmitAll    = paSubmitSet;

(function _initPassiveModule() {
    const _mod = new GrammarModule({
        id:       'pa',
        pageId:   'passive-page',
        sbId:     'sb-grammar-passive',
        diId:     'di-grammar-passive',
        title:    'Active / Passive &amp; Causative',
        sections: PA_SECTIONS,
        dotColors: PA_DOT,
        grpOrder: ['Genel', 'Passive', 'Causative', 'Özel'],
        sectionMap: {
            'overview':     function(){ return paOverview(); },
            'concept':      function(){ return paConcept(); },
            'tense-table':  function(){ return paTenseTable(); },
            'intransitive': function(){ return paIntransitive(); },
            'by-agent':     function(){ return paByAgent(); },
            'stative':      function(){ return paStative(); },
            'gerund-inf':   function(){ return paGerundInf(); },
            'it-believed':  function(){ return paItBelieved(); },
            'causative':    function(){ return paCausative(); },
            'tips':         function(){ return paTips(); },
            'exercises':    function(){ return paExercises(); }
        },
        onSectionRender: function(id) {
            if (id === 'exercises') {
                _paScore = 0; _paAnswers = {}; _paChecked = {};
                _paUpdScore();
            }
        }
    });

    window.openPassiveSection = function(sectionId) { _mod.open(sectionId || 'overview'); };
    window._paRenderSection   = function(id)        { _mod.goTo(id); };
    window['_paGoTo']         = function(id)        { _mod.goTo(id); };
})();
