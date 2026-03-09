// ════════════════════════════════════════════════════════════════
// pronouns.js  —  Pronouns Grammar Modülü
// YDT Master Pro
// Kaynak: 10'da10 YDT Pronouns notları (s. 99–104)
// ════════════════════════════════════════════════════════════════

let _prCurrentSection = 'overview';
let _prAnswers = {};
let _prChecked = {};
let _prScore = 0;
const PR_TOTAL = 15;

const PR_SECTIONS = [
    { id: 'overview',       label: 'Genel Bakış',              grp: 'Genel' },
    { id: 'personal',       label: '1. Personal Pronouns',     grp: 'Pronoun Türleri' },
    { id: 'possessive-adj', label: '2. Possessive Adjectives', grp: 'Pronoun Türleri' },
    { id: 'possessive-pro', label: '3. Possessive Pronouns',   grp: 'Pronoun Türleri' },
    { id: 'reflexive',      label: '4. Reflexive Pronouns',    grp: 'Pronoun Türleri' },
    { id: 'another',        label: '5. Another',               grp: '"Other" Ailesi' },
    { id: 'the-other',      label: '6. The Other',             grp: '"Other" Ailesi' },
    { id: 'others',         label: '7. Others / The Others',   grp: '"Other" Ailesi' },
    { id: 'other-plural',   label: '8. Other (çoğul)',         grp: '"Other" Ailesi' },
    { id: 'each-other',     label: '9. Each Other / One Another', grp: '"Other" Ailesi' },
    { id: 'every-other',    label: '10. Every Other',          grp: '"Other" Ailesi' },
    { id: 'one-after',      label: '11. One After Another',    grp: '"Other" Ailesi' },
    { id: 'tips',           label: 'Soru İpuçları',            grp: 'Özel' },
    { id: 'exercises',      label: 'Alıştırmalar',             grp: 'Özel' },
];

const PR_DOT = {
    'Genel': '#6366f1',
    'Pronoun Türleri': '#0284c7',
    '"Other" Ailesi': '#059669',
    'Özel': '#e63946'
};


/* ── Helpers ── */
function prH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#042f2e 0%,#065f46 60%,#059669 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function prSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function prInfo(type, title, body) {
    return '<div class="gr-info gr-info-' + type + '"><div class="gr-info-title">' + title + '</div>' + body + '</div>';
}

function prTable(headers, rows, cls) {
    const ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    const trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl ' + (cls||'') + '"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function prAcc(items) {
    const cards = items.map(function(it) {
        const exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #059669"><span class="gr-ex-n">' + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        const descHtml = it.desc ? '<p class="gr-acc-desc">' + it.desc + '</p>' : '';
        return '<div class="gr-acc" data-toggle-class="open">'
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

function prBox(color, title, lines) {
    const styles = {
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239',
        teal:   'background:#f0fdfa;border:2px solid #0d9488;color:#134e4a'
    };
    const content = lines.map(function(l){ return l === '' ? '<br>' : '<div style="margin-bottom:4px">' + l + '</div>'; }).join('');
    return '<div style="' + (styles[color]||styles.teal) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 4px;font-size:.82rem;line-height:1.75;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

/* ══ SECTIONS ══ */

function prOverview() {
    const sections = [
        {id:'personal',       emoji:'👤', name:'Personal Pronouns',       tr:'Şahıs Zamirleri',          color:'#dbeafe', border:'#93c5fd', tc:'#1e3a8a', desc:'Özne ve nesne yerine kullanılır (I, you, he, she…)'},
        {id:'possessive-adj', emoji:'📌', name:'Possessive Adjectives',    tr:'İyelik Sıfatı',            color:'#fef9c3', border:'#fcd34d', tc:'#713f12', desc:'Ardından isim gelir, ait olduğu nesneyi gösterir (my, your, his…)'},
        {id:'possessive-pro', emoji:'🏷️', name:'Possessive Pronouns',      tr:'İyelik Zamiri',            color:'#fef3c7', border:'#fbbf24', tc:'#92400e', desc:'İsim yerine kullanılır, ardından isim gelmez (mine, yours, his…)'},
        {id:'reflexive',      emoji:'🪞', name:'Reflexive Pronouns',       tr:'Dönüşlü Zamir',            color:'#f5f3ff', border:'#c4b5fd', tc:'#4c1d95', desc:'Özne ve nesne aynı kişidir (myself, yourself…)'},
        {id:'another',        emoji:'➕', name:'Another',                  tr:'Bir diğeri / Daha',        color:'#ecfdf5', border:'#6ee7b7', tc:'#065f46', desc:'Tekil isimlerle: bir başkası, bir diğeri, daha'},
        {id:'the-other',      emoji:'🔁', name:'The Other',                tr:'Diğeri / Geri kalanı',     color:'#ecfdf5', border:'#6ee7b7', tc:'#065f46', desc:'Belirli bir gruptan kalan son/diğer kişi ya da nesne'},
        {id:'others',         emoji:'👥', name:'Others / The Others',      tr:'Diğerleri',                color:'#ecfdf5', border:'#6ee7b7', tc:'#065f46', desc:'Sadece zamir; ardından isim gelmez'},
        {id:'other-plural',   emoji:'🔢', name:'Other + plural noun',      tr:'Diğer (çoğul)',            color:'#ecfdf5', border:'#6ee7b7', tc:'#065f46', desc:'Ardından çoğul isim ister: other countries'},
        {id:'each-other',     emoji:'🤝', name:'Each Other / One Another', tr:'Birbirini / Birbirine',    color:'#fff1f2', border:'#fca5a5', tc:'#9f1239', desc:'İşteşlik: birbirine, birbirini, birbirleriyle'},
        {id:'every-other',    emoji:'📅', name:'Every Other',              tr:'Her iki … da bir',         color:'#fff1f2', border:'#fca5a5', tc:'#9f1239', desc:'Düzenli aralıklar: every other day/week'},
        {id:'one-after',      emoji:'➡️', name:'One After Another',        tr:'Sırayla, teker teker',     color:'#fff1f2', border:'#fca5a5', tc:'#9f1239', desc:'Arka arkaya, sırasıyla'},
    ];
    const cards = sections.map(function(c) {
        return '<div style="border:1.5px solid ' + c.border + ';border-radius:14px;padding:16px;background:' + c.color + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.09)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' data-action="PronounsModule.goTo(\'' + c.id + '\')">'
            + '<div style="font-size:1.3rem;margin-bottom:8px">' + c.emoji + '</div>'
            + '<div style="font-size:.96rem;font-weight:900;color:#1a1a2e;margin-bottom:3px">' + c.name + '</div>'
            + '<div style="font-size:.6rem;font-weight:900;letter-spacing:1.2px;text-transform:uppercase;color:' + c.tc + ';margin-bottom:7px">' + c.tr + '</div>'
            + '<div style="font-size:.73rem;color:#374151;line-height:1.55">' + c.desc + '</div>'
            + '</div>';
    }).join('');
    return prH('👤 Zamirler', 'Pronouns', 'Zamirlerin tüm türleri: şahıs, iyelik, dönüşlü ve "other" ailesi. Bir konuya tıkla ve başla.')
        + '<div style="padding:24px 36px;display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px">' + cards + '</div>'
        + '<div style="padding:0 36px 36px;text-align:center;"><button data-action="PronounsModule.goTo(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#059669,#0d9488);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button></div>';
}

function prPersonal() {
    return prH('👤 Şahıs Zamirleri', 'Personal Pronouns', 'Cümlede özne ve nesne yerine kullanılan zamirler.')
    + prSH('Tam Zamir Tablosu')
    + prTable(['Subject','Object','Poss. Adj.','Poss. Pronoun','Reflexive'],[
        ['I','me','my','mine','myself'],
        ['you','you','your','yours','yourself'],
        ['he','him','his','his','himself'],
        ['she','her','her','hers','herself'],
        ['it','it','its','—','itself'],
        ['we','us','our','ours','ourselves'],
        ['you','you','your','yours','yourselves'],
        ['they','them','their','theirs','themselves'],
    ])
    + prSH('a) Subject Pronouns — Özne Zamiri')
    + prAcc([{ico:'🎯', bg:'rgba(5,150,105,.1)', title:'Özne Zamiri Örnekleri',
        examples:[
            'Mustafa Kemal Atatürk is known as the first president of Turkiye. <strong>He</strong> is the founder of the Republic of Turkiye.',
            'Sertab Erener won Eurovision Song Contest in 2003. <strong>She</strong> was the first singer to win Eurovision in Turkiye\'s history.',
        ]}])
    + prBox('teal','📌 BİLMELİSİN! — Özel kullanımlar',[
        '• Cinsiyeti bilinmeyen bebek → <strong>"it"</strong>: Your baby\'s weight is too high. <strong>It</strong> looks dangerous.',
        '• Bayraklar, ülkeler, gemiler → <strong>"she"</strong>: The Turkish flag... <strong>She</strong> is red and white.',
        '• Cinsiyeti bilinen hayvan → <strong>"he"</strong> ya da <strong>"she"</strong>: Mars has gray hair. <strong>He</strong> is 3 years old.',
    ])
    + prSH('b) Object Pronouns — Nesne Zamiri')
    + prAcc([{ico:'🎯', bg:'rgba(2,132,199,.1)', title:'Nesne Zamiri Örnekleri',
        desc:'Fiillerin ve edatların ardından daima <strong>nesne zamiri</strong> gelir.',
        examples:[
            'All animals in the universe benefit <strong>us</strong>.',
            'When you have discipline, nothing can stop <strong>you</strong>.',
            'Their king gives <strong>them</strong> a harsh penalty if they oppose the law.',
        ]}]);
}

function prPossessiveAdj() {
    return prH('📌 İyelik Sıfatı', 'Possessive Adjectives', 'Neyin kime ait olduğunu belirtir. Ardından mutlaka isim gelir.')
    + prTable(['Özne','Poss. Adj.','Örnek'],[
        ['I','my','This is <strong>my</strong> book.'],
        ['You','your','Is this <strong>your</strong> pen?'],
        ['He','his','<strong>His</strong> car is red.'],
        ['She','her','<strong>Her</strong> smile is warm.'],
        ['It','its','The dog wagged <strong>its</strong> tail.'],
        ['We','our','<strong>Our</strong> team won.'],
        ['They','their','<strong>Their</strong> goal is to share Turkish folk music.'],
    ])
    + prAcc([{ico:'📝', bg:'rgba(217,119,6,.1)', title:'Possessive Adjective Örnekleri',
        examples:[
            'Altın Gün is a popular music group. <strong>Their</strong> goal is to introduce Turkish folk music to the world by blending it with <strong>their</strong> style.',
            'The Queen of England, II. Elizabeth, died on September 8, 2022. <strong>Her</strong> son, Charles, ascended the throne after her.',
        ]}])
    + prBox('yellow','💡 İPUCU',[
        'Possessive adjectives ardından mutlaka <strong>isim</strong> ister.',
        '"kimin?" sorusunu <strong>whose</strong> ile sorarız: <em>Whose book is this? — <strong>My</strong> book.</em>',
    ]);
}

function prPossessivePro() {
    return prH('🏷️ İyelik Zamiri', 'Possessive Pronouns', 'İsim yerine kullanılır — ardından isim GELMEZ.')
    + prTable(['Poss. Adj.','Poss. Pronoun','Karşılaştırma'],[
        ['my','mine','This is <strong>my</strong> bag. → This bag is <strong>mine</strong>.'],
        ['your','yours','Is this <strong>your</strong> phone? → Is this phone <strong>yours</strong>?'],
        ['his','his','That is <strong>his</strong> car. → That car is <strong>his</strong>.'],
        ['her','hers','That is <strong>her</strong> coat. → That coat is <strong>hers</strong>.'],
        ['its','—','"its" iyelik zamiri olarak kullanılmaz.'],
        ['our','ours','This is <strong>our</strong> home. → This home is <strong>ours</strong>.'],
        ['their','theirs','That is <strong>their</strong> idea. → That idea is <strong>theirs</strong>.'],
    ])
    + prBox('teal','📌 Temel Fark',[
        '• <strong>Possessive Adjective + isim:</strong> This is <u>my</u> book.',
        '• <strong>Possessive Pronoun — isim YOK:</strong> This book is <u>mine</u>.',
    ]);
}

function prReflexive() {
    return prH('🪞 Dönüşlü Zamir', 'Reflexive Pronouns', 'Eylemin hem öznesi hem nesnesi aynı kişidir.')
    + prTable(['Özne','Reflexive'],[
        ['I','myself'],['You','yourself'],['He','himself'],['She','herself'],
        ['It','itself'],['We','ourselves'],['You','yourselves'],['They','themselves'],
    ])
    + prAcc([
        {ico:'🪞', bg:'rgba(124,58,237,.1)', title:'Klasik Kullanım — Eylem Öznesi = Nesnesi',
         examples:[
            'She cut <strong>herself</strong> while chopping vegetables.',
            'He blames <strong>himself</strong> for the mistake.',
            'The machine turns <strong>itself</strong> off after use.',
         ]},
        {ico:'💪', bg:'rgba(5,150,105,.1)', title:'"By oneself" — Kendi başına, yardımsız',
         examples:[
            'She completed the entire project <strong>by herself</strong>.',
            'He learned to play the guitar <strong>by himself</strong>.',
         ]},
        {ico:'✨', bg:'rgba(2,132,199,.1)', title:'Vurgulama (Emphasis) — Bizzat kendisi',
         desc:'Eylemi başkası değil bizzat kendisinin yaptığını vurgulamak için kullanılır.',
         examples:[
            'The president <strong>himself</strong> attended the ceremony.',
            'I will do it <strong>myself</strong>.',
         ]},
    ]);
}

function prAnother() {
    return prH('➕ Another', 'Another', '"Bir diğeri, bir başkası" — hem sıfat hem zamir olarak TEKİL isimlerle kullanılır.')
    + prTable(['Görev','Yapı','Türkçe'],[
        ['Sıfat','another + tekil isim','başka bir, diğer bir'],
        ['Zamir','another (isim yok)','bir başkası, bir diğeri'],
    ])
    + prAcc([
        {ico:'➕', bg:'rgba(5,150,105,.1)', title:'Sıfat Olarak Kullanım',
         examples:[
            'We always have <strong>another</strong> chance to change our mistakes.',
            'When the teacher thought it was the last exam paper she had examined, <strong>another</strong> was on the table.',
         ]},
        {ico:'⏱️', bg:'rgba(217,119,6,.1)', title:'"Daha" Anlamında (zaman / mesafe / miktar)',
         desc:'"another" zaman, mesafe, para miktarı ifade ederken <strong>"daha"</strong> anlamı verir. Ardından gelen sözcük <strong>çoğul</strong> olur.',
         examples:[
            'We needed <strong>another five minutes</strong> to complete the exam.',
            'I had better save <strong>another one thousand</strong> Turkish liras for the Erasmus+ Project.',
         ]},
    ]);
}

function prTheOther() {
    return prH('🔁 The Other', 'The Other', 'Belirli bir gruptan kalan son ya da geri kalanları ifade eder — tekil ve çoğul her ikisiyle kullanılır.')
    + prTable(['Yapı','Anlam','Not'],[
        ['the other + tekil isim','ikiden oluşan gruptan kalan son kişi/şey','diğeri, öteki'],
        ['the other + çoğul isim','belirli bir gruptan kalan hepsini ifade eder','geri kalanları'],
    ])
    + prAcc([
        {ico:'1️⃣', bg:'rgba(5,150,105,.1)', title:'The other + singular — ikiden birinin karşıtı',
         examples:[
            'There are two women pioneers in Turk history. One is Fatma Aliye Topuz; <strong>the other</strong> is Sabiha Gökçen.',
         ]},
        {ico:'👥', bg:'rgba(2,132,199,.1)', title:'The other + plural noun — gruptan geri kalanlar',
         examples:[
            'Three of them are Modern Folk Trio, Kenan Doğulu and Şebnem Paker, and <strong>the other</strong> competitors are Sertab Erener and Manga.',
         ]},
    ])
    + prBox('yellow','📌 BİLMELİSİN! — "the other day"',[
        '"the other day" → geçmiş zamanda "geçen gün, dün öbür gün" anlamında kullanılır.',
        '• I saw my old friend at the grocery store <strong>the other day</strong>. (the day before yesterday)',
    ]);
}

function prOthers() {
    return prH('👥 Others / The Others', 'Others & The Others', '"Diğerleri" anlamında — sadece zamir; ardından isim gelmez.')
    + prTable(['İfade','Anlam','Özellik'],[
        ['<strong>others</strong>','diğerleri (belirsiz)','Zamir; ardından isim gelmez'],
        ['<strong>the others</strong>','diğerleri (belirli grup)','Zamir; belirli gruptan geri kalanlar'],
    ])
    + prAcc([
        {ico:'🎯', bg:'rgba(5,150,105,.1)', title:'The Others — Belirli Gruptan Geri Kalanlar',
         desc:'Ardından isim gelmez. Ardından isim eklemek istersen → <strong>the other + isim</strong> kullan.',
         examples:[
            "I've finished all my projects, but <strong>the others</strong> are still working on their assignments.",
            'While <strong>the others</strong> continue to forage for food, the lion is taking a nap beneath the tree.',
         ]},
        {ico:'🌐', bg:'rgba(217,119,6,.1)', title:'Others — Genel / Belirsiz "Diğerleri"',
         examples:[
            'Some students enjoy studying English, while <strong>others</strong> find it boring.',
         ]},
    ]);
}

function prOtherPlural() {
    return prH('🔢 Other (çoğul)', 'Other + Plural Noun', 'İki ya da daha fazla özne/nesneden bahsederken "diğer" anlamında. Ardından çoğul isim ister.')
    + prAcc([{ico:'🔢', bg:'rgba(5,150,105,.1)', title:'Other + Çoğul İsim',
        examples:[
            'Turkiye has one of the most beautiful seas when compared to <strong>other</strong> countries.',
            'Some people believe in the existence of aliens, but <strong>other</strong> people do not.',
        ]}])
    + prBox('red','⚠️ another vs other — KARIŞTIRMA!',[
        '<strong>another</strong> → yalnızca TEKİL: another book ✅ / another books ❌',
        '<strong>other</strong>  → ÇOĞUL ile: other books ✅ / other book ❌',
        '',
        'Boşluktan sonraki isim tekil mi çoğul mu? Ona göre seç!',
    ]);
}

function prEachOther() {
    return prH('🤝 İşteşlik', 'Each Other / One Another', '"Birbirine, birbirini, birbirleriyle" — karşılıklı eylemleri ifade eder.')
    + prAcc([{ico:'🤝', bg:'rgba(230,57,70,.1)', title:'Each Other / One Another',
        desc:'İki ya da daha fazla kişinin birbirlerine yönelik karşılıklı eylem gerçekleştirdiğini ifade eder.',
        examples:[
            'My mother and aunt, who hadn\'t seen <strong>each other</strong> for a long time, reunited and satisfied their longing.',
            'The orphanage kids became close to <strong>one another</strong> and began to look out for <strong>one another</strong> like a huge family.',
        ]}]);
}

function prEveryOther() {
    return prH('📅 Düzenli Aralıklar', 'Every Other', '"İki günde/haftada/yılda bir" — düzenli aralıklarla tekrar eden eylemler.')
    + prAcc([{ico:'📅', bg:'rgba(217,119,6,.1)', title:'Every Other + Zaman İfadesi',
        examples:[
            'I go to the dentist to get my teeth cleaned <strong>every other</strong> two years.',
            'Some artists perform on stage every day, while others perform <strong>every other</strong> two weeks.',
        ]}]);
}

function prOneAfter() {
    return prH('➡️ Sırayla', 'One After Another / One After The Other', '"Sırayla, teker teker, arka arkaya" anlamlarında kullanılır.')
    + prAcc([{ico:'➡️', bg:'rgba(5,150,105,.1)', title:'One After Another / One After The Other',
        examples:[
            'The students were taken to the camp activity organized by the school <strong>one after another</strong>.',
            'The judge took the defendants inside <strong>one after the other</strong> and questioned them.',
        ]}]);
}

function prTips() {
    const tips = [
        {num:'01', title:'Possessive Adj. mi, Possessive Pronoun mu?',
         rules:[
            {ico:'📌', text:'Ardından <strong>isim varsa</strong> → Possessive Adjective: <em>This is <u>my</u> book.</em>'},
            {ico:'🏷️', text:'Ardından <strong>isim yoksa</strong> → Possessive Pronoun: <em>This book is <u>mine</u>.</em>'},
         ]},
        {num:'02', title:'"another" vs "other" — Tekil / Çoğul Kontrolü',
         rules:[
            {ico:'➕', text:'<strong>another</strong> → tekil: another book ✅ / another books ❌'},
            {ico:'🔢', text:'<strong>other</strong> → çoğul: other books ✅ / other book ❌'},
            {ico:'💡', text:'Boşluktan sonraki isim tekil mi çoğul mu? Kontrol et!'},
         ]},
        {num:'03', title:'"others / the others" ardından isim gelmez',
         rules:[
            {ico:'✅', text:'I finished, but <strong>the others</strong> are still working. ✅'},
            {ico:'❌', text:'<s>the others students</s> ❌ — zamir; ardından isim gelmez'},
            {ico:'✅', text:'İsim eklemek istersen → <strong>the other students</strong> ✅'},
         ]},
        {num:'04', title:'Fiil / Edat Sonrası → Nesne Zamiri',
         rules:[
            {ico:'💡', text:'Fiil ve edat sonrası daima <strong>object pronoun:</strong> me, you, him, her, it, us, them'},
            {ico:'✅', text:'She gave the book to <strong>me</strong>. ✅'},
            {ico:'❌', text:'She gave the book to <s>I</s>. ❌'},
         ]},
        {num:'05', title:'"each other" vs "one another"',
         rules:[
            {ico:'🤝', text:'<strong>each other</strong> → genellikle iki kişi arasında'},
            {ico:'👥', text:'<strong>one another</strong> → genellikle ikiden fazla kişi arasında'},
            {ico:'💡', text:'Sınavda ikisi de birbirinin yerine kabul edilir.'},
         ]},
    ];
    const cards = tips.map(function(t) {
        const rules = t.rules.map(function(r) {
            return '<div style="display:flex;gap:10px;padding:9px 13px;background:#f7f7fb;border-radius:10px;margin-top:7px;font-size:.82rem;color:#374151;line-height:1.6;">'
                + '<span style="flex-shrink:0;margin-top:1px">' + r.ico + '</span>' + r.text + '</div>';
        }).join('');
        return '<div style="background:#fff;border:1.5px solid #ebebf0;border-radius:14px;overflow:hidden;margin-bottom:10px;" data-toggle-child=".pr-tb" data-toggle-child-class="pr-hidden">'
            + '<div style="display:flex;align-items:center;gap:12px;padding:13px 18px;background:#f7f7fb;cursor:pointer;">'
            + '<span style="font-size:.6rem;font-weight:900;color:#059669;background:#ecfdf5;border-radius:7px;padding:3px 9px;flex-shrink:0;font-family:\'Courier New\',monospace;">İPUCU ' + t.num + '</span>'
            + '<span style="flex:1;font-size:.87rem;font-weight:800;color:#1a1a2e">' + t.title + '</span>'
            + '<span style="font-size:.9rem;color:#767687">⌄</span>'
            + '</div>'
            + '<div class="pr-tb" style="padding:16px 20px;">' + rules + '</div>'
            + '</div>';
    }).join('');
    return prH('🎯 Soru Çözme', 'Soru Çözerken İpuçları', 'ÖSYM ve YDT sınavlarında Pronouns sorularını çözerken dikkat edilecek püf noktaları.')
        + '<div style="padding:24px 36px 36px">' + cards + '</div>';
}

/* ── Exercises ── */
const PR_BLANKS = [
    {q:'The cat hurt ___. It fell from the tree. <em style="font-size:.76rem;color:#999">[reflexive]</em>', ans:['itself'], hint:'Özne = nesne → itself'},
    {q:'This is not your umbrella. That one is ___. <em style="font-size:.76rem;color:#999">[poss. pronoun]</em>', ans:['yours'], hint:'Ardından isim yok → possessive pronoun: yours'},
    {q:'I go to the gym ___ two days. (her iki günde bir)', ans:['every other'], hint:'Düzenli aralık → every other'},
    {q:'There were two candidates. One was accepted; ___ was rejected.', ans:['the other'], hint:'İkiden birinin karşıtı → the other'},
    {q:'Some students prefer morning study, while ___ prefer the evening.', ans:['others'], hint:'Belirsiz "diğerleri", ardından isim yok → others'},
    {q:"I finished my homework, but ___ students haven't finished yet.", ans:['other'], hint:'Ardından çoğul isim var → other (not another)'},
    {q:"The two friends hadn't seen ___ for years. (birbirlerini)", ans:['each other','one another'], hint:'Karşılıklı eylem → each other / one another'},
];

const PR_MCQS = [
    {q:'This is not ___ fault. It was an accident.', opts:['my','mine','me','myself'], cor:'a', hint:'Ardından isim var → possessive adjective: my'},
    {q:'Sertab Erener is a famous Turkish singer. ___ won Eurovision in 2003.', opts:['He','It','She','They'], cor:'c', hint:'Kadın özne → she'},
    {q:'The country is proud of ___ achievements.', opts:['its','it','itself','their'], cor:'a', hint:'Ülkenin kendi başarıları → its (poss. adj.)'},
    {q:'We needed ___ three hours to finish the project.', opts:['other','others','another','the other'], cor:'c', hint:'"Daha" anlamı + sayı → another'},
    {q:'I completed the project all by ___.', opts:['me','my','myself','mine'], cor:'c', hint:'by + reflexive: by myself'},
    {q:'Some people like classical music, while ___ prefer pop.', opts:['another','other','the other','others'], cor:'d', hint:'Belirsiz "diğerleri", ardından isim yok → others'},
    {q:'There are two finalists. One is from Istanbul; ___ is from Ankara.', opts:['another','other','the other','others'], cor:'c', hint:'İkiden birinin karşıtı → the other'},
    {q:'The siblings looked at ___ in surprise.', opts:['themselves','each other','itself','one other'], cor:'b', hint:'Karşılıklı bakış → each other'},
];

function prExercises() {
    const blankCards = PR_BLANKS.map(function(q, i) {
        return '<div class="gr-q-card" id="prq-b' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM A</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<input class="gr-q-inp pr-inp" id="pr-inp-' + i + '" placeholder="doğru zamiri yaz…" autocomplete="off"><br>'
            + '<button class="gr-chk-btn" style="border-color:#059669;color:#059669" data-action="prCheckBlank(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="pr-fb-b' + i + '"></div>'
            + '</div>';
    }).join('');

    const mcqCards = PR_MCQS.map(function(q, i) {
        const opts = q.opts.map(function(o, j) {
            const letter = ['A','B','C','D'][j];
            const lv = ['a','b','c','d'][j];
            return '<div class="gr-opt" id="pr-opt-' + i + '-' + j + '" data-action="prSelectOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');
        return '<div class="gr-q-card" id="prq-m' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM B</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#059669;color:#059669" data-action="prCheckMCQ(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="pr-fb-m' + i + '"></div>'
            + '</div>';
    }).join('');

    return prH('✨ Pratik Yap', 'Alıştırmalar', PR_TOTAL + ' soruluk interaktif test. Her soruyu anında kontrol edin.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="pr-live-score">0 / ' + PR_TOTAL + '</span></div>'
        + '<div class="gr-q-sec-hd">Bölüm A — Boşluk Doldurma</div>'
        + blankCards
        + '<div class="gr-q-sec-hd" style="margin-top:20px">Bölüm B — Çoktan Seçmeli</div>'
        + mcqCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#059669,#0d9488)" data-action="prSubmitAll()">🎯 Tümünü Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="pr-result">'
        + '<div class="gr-res-score" id="pr-res-score" style="color:#059669">0/' + PR_TOTAL + '</div>'
        + '<div class="gr-res-lbl">Toplam Puan</div>'
        + '<div class="gr-res-msg" id="pr-res-msg"></div>'
        + '<button class="gr-retry-btn" style="border-color:#059669;color:#059669" data-action="PronounsModule.goTo(\'exercises\')">🔄 Tekrar Dene</button>'
        + '</div></div>';
}

/* ── Exercise Logic ── */
function _prUpdScore() {
    const el = document.getElementById('pr-live-score');
    if (el) el.textContent = _prScore + ' / ' + PR_TOTAL;

    if (typeof saveGrammarScore === 'function') saveGrammarScore('pr', _prScore);
}

function prCheckBlank(i) {
    const inp  = document.getElementById('pr-inp-' + i);
    const fb   = document.getElementById('pr-fb-b' + i);
    const card = document.getElementById('prq-b' + i);
    if (!inp || !fb) return;
    const val = inp.value.trim().toLowerCase().replace(/\s+/g,' ');
    if (!val) { fb.textContent = 'Bir cevap girin!'; fb.className = 'gr-fb show bad'; return; }
    const correct = PR_BLANKS[i].ans.map(function(a){ return a.toLowerCase(); });
    if (correct.indexOf(val) !== -1) {
        inp.classList.add('ok'); card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + PR_BLANKS[i].ans[0];
        fb.className = 'gr-fb show ok';
        if (!_prChecked['b'+i]) { _prScore++; _prChecked['b'+i] = true; _prUpdScore(); }
    } else {
        inp.classList.add('bad'); card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + PR_BLANKS[i].ans[0] + ' — ' + PR_BLANKS[i].hint;
        fb.className = 'gr-fb show bad';
        if (!_prChecked['b'+i]) _prChecked['b'+i] = 'wrong';
    }
}

function prSelectOpt(qi, oi, letter) {
    PR_MCQS[qi].opts.forEach(function(_, j) {
        const el = document.getElementById('pr-opt-' + qi + '-' + j);
        if (el) el.classList.remove('sel');
    });
    const el = document.getElementById('pr-opt-' + qi + '-' + oi);
    if (el) el.classList.add('sel');
    _prAnswers['m'+qi] = letter;
}

function prCheckMCQ(i) {
    const q    = PR_MCQS[i];
    const sel  = _prAnswers['m'+i];
    const fb   = document.getElementById('pr-fb-m' + i);
    const card = document.getElementById('prq-m' + i);
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    const letters = ['a','b','c','d'];
    q.opts.forEach(function(_, j) {
        const el = document.getElementById('pr-opt-' + i + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_prChecked['m'+i]) { _prScore++; _prChecked['m'+i] = true; _prUpdScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_prChecked['m'+i]) _prChecked['m'+i] = 'wrong';
    }
}

function prSubmitAll() {
    const panel   = document.getElementById('pr-result');
    const scoreEl = document.getElementById('pr-res-score');
    const msgEl   = document.getElementById('pr-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _prScore + '/' + PR_TOTAL;
    const pct = Math.round((_prScore / PR_TOTAL) * 100);
    msgEl.textContent = pct >= 87 ? '🎉 Mükemmel! Pronouns konusuna tamamen hâkimsin!'
                      : pct >= 65 ? '👏 Çok iyi! "Other" ailesini biraz daha tekrar edelim.'
                      : pct >= 45 ? '📚 İyi başlangıç. Possessive ve "other" farkını tekrar et!'
                      : '💪 Daha fazla pratik yapalım. Tablolara ve BİLMELİSİN kutularına dön!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


/* ── GrammarModule engine (pilot) ── */
const PronounsModule = new GrammarModule({
    id:         'pronouns',
    pageId:     'pronouns-page',
    sbId:       'sb-grammar-pronouns',
    diId:       'di-grammar-pronouns',
    title:      'Pronouns — Zamirler',
    sections:   PR_SECTIONS,
    dotColors:  PR_DOT,
    grpOrder:   ['Genel', 'Pronoun Türleri', '"Other" Ailesi', 'Özel'],
    sectionMap: {
        'overview':       prOverview,
        'personal':       prPersonal,
        'possessive-adj': prPossessiveAdj,
        'possessive-pro': prPossessivePro,
        'reflexive':      prReflexive,
        'another':        prAnother,
        'the-other':      prTheOther,
        'others':         prOthers,
        'other-plural':   prOtherPlural,
        'each-other':     prEachOther,
        'every-other':    prEveryOther,
        'one-after':      prOneAfter,
        'tips':           prTips,
        'exercises':      prExercises,
    },
    onSectionRender: function(id) {
        if (id === 'exercises') {
            _prScore = 0; _prAnswers = {}; _prChecked = {};
            _prUpdScore();
        }
    },
});
function openPronounsSection(id) { PronounsModule.open(id); }

/* ── Globals ── */
window.openPronounsSection = openPronounsSection;
window.prCheckBlank        = prCheckBlank;
window.prSelectOpt         = prSelectOpt;
window.prCheckMCQ          = prCheckMCQ;
window.prSubmitAll         = prSubmitAll;

// goTo → open alias (data-action="PronounsModule.goTo(...)" uyumluluğu)
PronounsModule.goTo = PronounsModule.open.bind(PronounsModule);

// ── Window Export — delegation window.PronounsModule lookup için ──
window.PronounsModule = PronounsModule;

// grammar-engine.js: data-action="window['_pronounsGoTo']('sectionId')" pattern'i için zorunlu
// GrammarModule, her modülü window['_${id}GoTo'] şeklinde çağırır
window['_pronounsGoTo'] = function(id) { PronounsModule.open(id); };
