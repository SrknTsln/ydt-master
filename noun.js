// ════════════════════════════════════════════════════════════════
// noun.js  —  Noun Clauses & Reported Speech Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Noun Clauses & Reported Speech notları (s. 81–92)
// ════════════════════════════════════════════════════════════════

var _ncCurrentSection = 'overview';
var _ncAnswers = {};
var _ncChecked = {};
var _ncScore = 0;
var NC_TOTAL = 15;

var NC_SECTIONS = [
    { id: 'overview',     label: 'Genel Bakış',               grp: 'Genel' },
    { id: 'that',         label: '1. That / The Fact That',   grp: 'Noun Clauses' },
    { id: 'if-whether',   label: '2. If / Whether',           grp: 'Noun Clauses' },
    { id: 'wh-questions', label: '3. WH-Questions',           grp: 'Noun Clauses' },
    { id: 'ever-words',   label: '4. Ever Words',             grp: 'Noun Clauses' },
    { id: 'subjunctive',  label: '5. Subjunctive Forms',      grp: 'Noun Clauses' },
    { id: 'tense-concord','label': '6. Tense Uyumu',          grp: 'Noun Clauses' },
    { id: 'reported',     label: 'Reported Speech',           grp: 'Reported Speech' },
    { id: 'tense-change', label: 'Tense Değişimi',            grp: 'Reported Speech' },
    { id: 'time-change',  label: 'Zaman & Pronoun Değişimi',  grp: 'Reported Speech' },
    { id: 'exercises',    label: 'Alıştırmalar',              grp: 'Özel' }
];

var NC_DOT = {
    'Genel': '#6366f1',
    'Noun Clauses': '#b45309',
    'Reported Speech': '#0369a1',
    'Özel': '#e63946'
};

/* ════════ ENTRY POINT ════════ */
function openNounSection(sectionId) {
    _ncCurrentSection = sectionId || 'overview';
    document.querySelectorAll('.container').forEach(function(c){ c.classList.add('hidden'); });
    document.querySelectorAll('.arsiv-full-page').forEach(function(c){ c.classList.add('hidden'); });
    var page = document.getElementById('noun-page');
    if (page) page.classList.remove('hidden');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(function(el){ el.classList.remove('active'); });
    ['sb-grammar-noun','di-grammar-noun'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) el.classList.add('active');
    });
    _ncRenderPage();
}

function _ncRenderPage() {
    var page = document.getElementById('noun-page');
    if (!page) return;
    page.innerHTML = '<div class="gr-topbar"><button class="gr-back-btn" onclick="navTo(\'index-page\')">←</button>'
        + '<div><div class="gr-topbar-label">Grammar Modülü</div>'
        + '<div class="gr-topbar-title">Noun Clauses &amp; Reported Speech</div></div></div>'
        + '<div class="gr-body"><nav class="gr-sidenav" id="nc-sidenav"></nav>'
        + '<div class="gr-content" id="nc-content"></div></div>';
    _ncBuildSidenav();
    _ncRenderSection(_ncCurrentSection);
}

function _ncBuildSidenav() {
    var nav = document.getElementById('nc-sidenav');
    if (!nav) return;
    var groups = {};
    NC_SECTIONS.forEach(function(s) {
        if (!groups[s.grp]) groups[s.grp] = [];
        groups[s.grp].push(s);
    });
    var html = '';
    ['Genel','Noun Clauses','Reported Speech','Özel'].forEach(function(grp) {
        var list = groups[grp];
        if (!list) return;
        html += '<div class="gr-sn-sec">' + grp + '</div>';
        list.forEach(function(s) {
            var active = s.id === _ncCurrentSection ? ' active' : '';
            html += '<button class="gr-sn-btn' + active + '" onclick="_ncRenderSection(\'' + s.id + '\')">'
                + '<span class="gr-sn-dot" style="background:' + NC_DOT[grp] + '"></span>' + s.label + '</button>';
        });
    });
    nav.innerHTML = html;
}

function _ncRenderSection(id) {
    _ncCurrentSection = id;
    _ncBuildSidenav();
    var content = document.getElementById('nc-content');
    if (!content) return;
    content.scrollTop = 0;
    var map = {
        'overview':     ncOverview,
        'that':         ncThat,
        'if-whether':   ncIfWhether,
        'wh-questions': ncWHQuestions,
        'ever-words':   ncEverWords,
        'subjunctive':  ncSubjunctive,
        'tense-concord':ncTenseConcord,
        'reported':     ncReported,
        'tense-change': ncTenseChange,
        'time-change':  ncTimeChange,
        'exercises':    ncExercises
    };
    var fn = map[id];
    content.innerHTML = fn ? fn() : '<div style="padding:40px">Yakında...</div>';
    if (id === 'exercises') {
        _ncScore = 0; _ncAnswers = {}; _ncChecked = {};
        _ncUpdScore();
        document.querySelectorAll('.nc-inp').forEach(function(inp, i) {
            inp.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); ncCheckBlank(i); }
            });
        });
    }
}

/* ════════ HELPERS ════════ */
function ncH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#431407 0%,#b45309 60%,#f59e0b 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function ncSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function ncTable(headers, rows) {
    var ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    var trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function ncAcc(items) {
    var cards = items.map(function(it) {
        var exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #b45309"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        var descHtml = it.desc ? '<p class="gr-acc-desc">' + it.desc + '</p>' : '';
        return '<div class="gr-acc" onclick="this.classList.toggle(\'open\')">'
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

function ncBox(color, title, lines) {
    var styles = {
        amber:  'background:#fffbeb;border:2px solid #d97706;color:#78350f',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95'
    };
    var content = lines.map(function(l){ return l===''?'<br>':'<div style="margin-bottom:5px">'+l+'</div>'; }).join('');
    return '<div style="'+(styles[color]||styles.amber)+';border-radius:12px;padding:14px 18px;margin:4px 36px 8px;font-size:.82rem;line-height:1.8;">'
        +(title?'<div style="font-weight:900;margin-bottom:7px">'+title+'</div>':'')+content+'</div>';
}

/* ════════ OVERVIEW ════════ */
function ncOverview() {
    var cards = [
        {id:'that',         e:'💡', n:'That / The Fact That', s:'Kararlı durum — tam cümle (SVO)', c:'#fffbeb', b:'#fcd34d', t:'#92400e'},
        {id:'if-whether',   e:'❓', n:'If / Whether',         s:'-ip/-madığını — kararsız durum',   c:'#fffbeb', b:'#fcd34d', t:'#92400e'},
        {id:'wh-questions', e:'🔍', n:'WH-Questions',         s:'what, when, where, who, how…',     c:'#fffbeb', b:'#fcd34d', t:'#92400e'},
        {id:'ever-words',   e:'♾️', n:'Ever Words',           s:'whatever, whoever, however…',      c:'#fffbeb', b:'#fcd34d', t:'#92400e'},
        {id:'subjunctive',  e:'⚡', n:'Subjunctive Forms',    s:'Gizli should — V₁ / be V₃',       c:'#fff1f2', b:'#fca5a5', t:'#9f1239'},
        {id:'tense-concord',e:'⏱️', n:'Tense Uyumu',         s:'Ana cümle present/past → NC uyumu', c:'#fffbeb', b:'#fcd34d', t:'#92400e'},
        {id:'reported',     e:'🗣️', n:'Reported Speech',     s:'Direct vs Indirect aktarım',        c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'tense-change', e:'🔄', n:'Tense Değişimi',       s:'8 zaman için backshift tablosu',    c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'time-change',  e:'📅', n:'Zaman & Pronoun',      s:'now→then, I→he/she değişimleri',    c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
    ];
    var cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid '+c.b+';border-radius:14px;padding:16px;background:'+c.c+';cursor:pointer;transition:all .18s;"'
            +' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            +' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            +' onclick="_ncRenderSection(\''+c.id+'\')">'
            +'<div style="font-size:1.3rem;margin-bottom:8px">'+c.e+'</div>'
            +'<div style="font-size:.95rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">'+c.n+'</div>'
            +'<div style="font-size:.73rem;color:'+c.t+';line-height:1.5">'+c.s+'</div>'
            +'</div>';
    }).join('');
    return ncH('💬 İsim Cümlecikleri','Noun Clauses & Reported Speech','Bir cümlenin içinde isim görevi üstlenen alt cümleler ve dolaylı anlatım. 4 başlık + Reported Speech.')
        +'<div style="padding:20px 36px;display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:11px">'+cardHtml+'</div>'
        +'<div style="padding:0 36px 36px;text-align:center;"><button onclick="_ncRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#b45309,#f59e0b);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button></div>';
}

/* ════════ THAT / THE FACT THAT ════════ */
function ncThat() {
    return ncH('💡 Kararlı Durum','That / The Fact That','Kararlı durumları ifade ederken kullanılır. Anlam bakımından herhangi bir farkları yoktur. Tam cümle (SVO) ile kurulur.')
        +ncBox('amber','📐 Yapı',[
            'Özne konumunda: <strong>That + SVO + VO</strong> — <strong>The fact that SVO + VO</strong>',
            'Nesne konumunda: <strong>SV + (that) SVO</strong> — <strong>SV + (the fact that) SVO</strong>',
        ])
        +ncAcc([
            {ico:'①', bg:'rgba(180,83,9,.12)', title:'(a) Özne Konumunda "that clause"',
             desc:'"that" ve "the fact that" yapıları cümlenin öznesi olarak kullanılabilir.',
             examples:[
                '<strong>That</strong> it\'s raining outside is bad news for their picnic.',
                '<strong>That</strong> the continuous opening of new universities is decreasing the quality of education is a concern for teachers.',
                '<strong>The fact that</strong> the Earth orbits the Sun is a well-known scientific truth.',
             ]},
            {ico:'②', bg:'rgba(180,83,9,.10)', title:'(b) Nesne Konumunda "that clause"',
             desc:'Nesne konumunda kullanıldığında "that" ve "the fact that" ifadeleri cümleden atılabilir; anlam değişmez.',
             examples:[
                'Everyone hopes <strong>that</strong> the pandemic will end as soon as possible.',
                'It is a known fact <strong>that</strong> the force of gravity exists.',
                'We cannot ignore <strong>the fact that</strong> climate change is a big global issue.',
                'I am grateful <strong>(that)</strong> you helped me when I needed it. (that atılmış)',
             ]},
            {ico:'③', bg:'rgba(180,83,9,.08)', title:'(c) "The fact that" — Preposition Sonrası',
             desc:'Eğer cümlede preposition kullanılmışsa "that" değil "the fact that" kullanılır — çünkü preposition\'dan sonra "that" gelmez.',
             examples:[
                'My sister is proud <strong>of the fact that</strong> she graduated with honors.',
                '<strong>The fact that</strong> Sezen Aksu has stopped performing on stage has deeply saddened all her fans.',
             ]},
            {ico:'④', bg:'rgba(180,83,9,.06)', title:'(d) Bazı İsimlerle Kullanım',
             desc:'Özellikle "belief, fact, idea, notion" gibi isimlerden sonra kullanımı yaygındır.',
             examples:[
                'Our teacher\'s <strong>idea that</strong> we should start a new presentation is interesting.',
                'The <strong>notion that</strong> the Big Bang theory is groundbreaking development in understanding the formation of the Earth is significant in science.',
             ]},
            {ico:'⑤', bg:'rgba(180,83,9,.04)', title:'(e) Bazı Fiillerle & (f) Sıfatlarla Kullanım',
             desc:'Özellikle davranış ve tutum belirten -ing ya da -ed ile türetilmiş sıfatlarla birlikte kullanımı yaygındır.',
             examples:[
                'People <strong>believe that</strong> the law and the justice system are the foundation of the law.',
                'Many scientists <strong>predict that</strong> there will be developments in the field of technology by 2030.',
                'I wasn\'t <strong>surprised that</strong> she took the exam and scored high enough to go abroad.',
                'Scientists are <strong>sure that</strong> species of living organisms have changed over time.',
             ]},
        ])
        +ncBox('yellow','📌 That Clause ile Sık Kullanılan Fiiller',[
            'acknowledge, admit, advise, announce, argue, assume, believe, claim, confirm, consider, declare,',
            'demand, demonstrate, discover, doubt, explain, expect, emphasize, guess, hope, inform, know,',
            'learn, point out, predict, prove, reveal, realize, report, show, state, suggest, think',
        ]);
}

/* ════════ IF / WHETHER ════════ */
function ncIfWhether() {
    return ncH('❓ Kararsız Durum','If / Whether','"-ip, -madığını" anlamına gelerek kararsız durumları ifade ederken kullanılır.')
        +ncBox('amber','📐 Yapı',[
            '"<strong>whether or not</strong>" ya da "<strong>whether…or not</strong>" şeklinde kullanılabilir',
            '"or not" kısmı cümle sonuna da getirilebilir veya cümleden atılabilir',
            'Özne konumunda da kullanılabilir — "if" yapısı özne konumunda kullanılamaz',
        ])
        +ncAcc([
            {ico:'①', bg:'rgba(180,83,9,.12)', title:'(a) Whether or not — Nesne Konumunda',
             examples:[
                'Most people want to know <strong>whether or not</strong> they have a good future.',
                'Most people want to know <strong>whether</strong> they have a good future <strong>or not</strong>.',
                'Most people want to know <strong>whether</strong> they have a good future.',
                'I don\'t know <strong>if</strong> she will come or not.',
                'I don\'t know <strong>if</strong> she will come.',
             ]},
            {ico:'②', bg:'rgba(180,83,9,.10)', title:'(a) Whether — Özne Konumunda',
             desc:'"Whether" özne konumunda kullanılabilir. "if" yapısı özne konumunda kullanılamaz!',
             examples:[
                '<strong>Whether or not</strong> people have a good future is a matter of curiosity for them.',
                '<strong>Whether</strong> people have a good future <strong>or not</strong> is a matter of curiosity for them.',
                '<strong>Whether</strong> people have a good future is a matter of curiosity for them.',
             ]},
            {ico:'③', bg:'rgba(180,83,9,.08)', title:'(b) Preposition Sonrası → Sadece "Whether"',
             desc:'Eğer cümlede ilgeç (preposition) kullanılmışsa "if" değil, "whether" kullanılır.',
             examples:[
                'Most people are interested <strong>in whether</strong> they have a good future (or not).',
             ]},
        ]);
}

/* ════════ WH-QUESTIONS ════════ */
function ncWHQuestions() {
    return ncH('🔍 WH-Questions','Question Words — Soru Sözcükleri','Soru sözcükleri, soru sorarken kurduğumuz yapıdan çıkarılarak düz cümle haline getirilir. Hem özne hem nesne konumunda kullanılabilirler.')
        +ncBox('amber','📐 Kural',[
            'WH-Questions ile noun clause oluştururken soru yapısı → <strong>düz cümleye</strong> çevrilir.',
            'Soru sözcükleri kendi anlamlarını korur.',
        ])
        +ncTable(
            ['Soru Sözcüğü','Türkçe Anlam','Örnek'],
            [
                ['<strong>What</strong>','ne, neyi, neye (insan için de: kim, kimi)','I cannot decide <strong>what</strong> I should give as a gift to my best friend. / <strong>What</strong> I want is only success.'],
                ['<strong>When</strong>','ne zaman','I exactly remember <strong>when</strong> we met. / <strong>When</strong> we will meet isn\'t known.'],
                ['<strong>Where</strong>','nerede','My wife didn\'t tell me <strong>where</strong> he waited for me. / <strong>Where</strong> he waited for me isn\'t known.'],
                ['<strong>Why</strong>','neden','My mother doesn\'t know <strong>why</strong> I\'m sad. / <strong>Why</strong> I\'m sad isn\'t known.'],
                ['<strong>Who</strong>','kim, kimi, kime (hem özne hem nesne)','We don\'t know <strong>who</strong> you are married to. / <strong>Who</strong> you are married to isn\'t known.'],
                ['<strong>Whom</strong>','kimi, kime (yalnızca nesne)','My father has no idea <strong>whom</strong> you love. / <strong>Whom</strong> you love isn\'t known.'],
                ['<strong>Whose</strong>','kimin (insan ve hayvan)','Our teacher told us <strong>whose</strong> performance was better.'],
                ['<strong>Which</strong>','hangisi (hem insan hem cansız)','No one can decide <strong>which</strong> lifestyle is right for you.'],
                ['<strong>How</strong>','nasıl','I didn\'t understand <strong>how</strong> our teacher solved the problem.'],
                ['<strong>How often</strong>','ne sıklıkla (sıklık sorar)','My doctor told me <strong>how often</strong> I visit him.'],
                ['<strong>How much</strong>','kaç para / ne kadar (sayılamayan)','We don\'t have an idea <strong>how much</strong> money she saved.'],
                ['<strong>How many</strong>','kaç tane, ne kadar (sayılabilen)','I don\'t know <strong>how many</strong> cars are there.'],
                ['<strong>How long</strong>','ne kadar süredir (süre sorar)','I couldn\'t remember <strong>how long</strong> the film lasted.'],
                ['<strong>How far</strong>','ne kadar uzaklıkta (mesafe sorar)','I don\'t know <strong>how far</strong> Samsun is from Tekirdağ.'],
            ]
        );
}

/* ════════ EVER WORDS ════════ */
function ncEverWords() {
    return ncH('♾️ Ever Words','Ever Words — Sınırsız Seçenek Bağlaçları','"-ever" ekiyle türetilen bağlaçlar hem noun clause hem adverbial clause olarak kullanılabilir.')
        +ncTable(
            ['Ever Kelimesi','Türkçe Anlam','Örnek'],
            [
                ['<strong>Whatever</strong>','Hangisi olursa olsun (sınırsız seçenek)','If you really trust yourself, you can do <strong>whatever</strong> you want. / <strong>Whatever</strong> you say won\'t change the Aries zodiac.'],
                ['<strong>Whenever</strong>','Ne zaman olursa olsun','You can call me <strong>whenever</strong> you need.'],
                ['<strong>Wherever</strong>','Neresi olursa olsun','I can work <strong>wherever</strong> I want.'],
                ['<strong>Whichever</strong>','Hangisi olursa olsun (sınırlı seçenek)','There are five books. You can choose <strong>whichever</strong> you like.'],
                ['<strong>Whoever</strong>','Kim olursa olsun — <em>sadece özne konumunda</em>','<strong>Whoever</strong> arrives first should ventilate the room.'],
                ['<strong>Whomever</strong>','Kim olursa olsun — nesne konumunda (whoever da kullanılır)','The employer will hire <strong>whoever</strong> has the most experience.'],
                ['<strong>However</strong>','Nasıl olursa olsun','Students don\'t dress <strong>however</strong> they want. / <strong>However</strong> students dress, it\'s important to follow the school\'s rules.'],
            ]
        );
}

/* ════════ SUBJUNCTIVE ════════ */
function ncSubjunctive() {
    return ncH('⚡ Subjunctive','Subjunctive Forms in Noun Clauses','Gerçeklik yerine bir arzuyu, dileği, emri, tavsiyeyi, zorunluluğu veya olasılığı ifade ederken kullanılan özel yapı. Gizli bir "should" ifadesi vardır.')
        +ncBox('amber','📐 Yapı',[
            '• Tüm öznelerle <strong>etken</strong> durumda → fiilin yalın hali <strong>(V₁)</strong>',
            '• <strong>Edilgen</strong> durumda → fiilin <strong>"be V₃"</strong> şeklindeki yapısı',
        ])
        +ncAcc([
            {ico:'⚡', bg:'rgba(180,83,9,.12)', title:'Subjunctive Örnekleri',
             examples:[
                'Scientists <strong>suggest</strong> that you (should) regularly <strong>exercise</strong> to stay healthy. (active)',
                'It is <strong>vital</strong> that teachers <strong>know</strong> how to approach students. (active)',
                'It is <strong>required</strong> that all documents <strong>be finished</strong> on time. (passive)',
                'He <strong>demanded</strong> that the report <strong>be submitted</strong> right away. (passive)',
             ]},
        ])
        +ncBox('yellow','📌 Subjunctive ile Sık Kullanılan Kelimeler',[
            '<strong>Fiiller:</strong> Suggest, Recommend, Demand, Insist, Order, Request, Urge, Advise, Propose, Prefer, Wish (dilemek), Desire, Request (rica), Advise',
            '',
            '<strong>İsimler:</strong> Suggestion, Recommendation, Preference, Necessity',
            '',
            '<strong>Sıfatlar:</strong> Requirement, Obligation, Important, Necessary, Essential, Crucial, Vital, Imperative',
        ]);
}

/* ════════ TENSE CONCORD ════════ */
function ncTenseConcord() {
    return ncH('⏱️ Tense Uyumu','Noun Clause\'da Tense Uyumu','Noun clause yapılırken istisna kullanımlar olsa da genellikle tense uyumu aranır.')
        +ncBox('amber','📐 Kural',[
            '• Ana cümle <strong>present</strong> → isim cümleciği de <strong>present</strong>',
            '• Ana cümle <strong>past</strong> → isim cümleciği de <strong>past</strong>',
        ])
        +ncAcc([
            {ico:'①', bg:'rgba(180,83,9,.12)', title:'(a) Present Kullanım',
             examples:[
                'Our teacher <strong>says</strong> that we <strong>should not give up</strong> our education for anyone.',
                'I <strong>am</strong> not sure what <strong>will happen</strong> in the future.',
             ]},
            {ico:'②', bg:'rgba(180,83,9,.10)', title:'(b) Past Kullanım',
             examples:[
                'She <strong>said</strong> that she <strong>had already woken up</strong> early when I called her.',
                'Our professor <strong>mentioned</strong> that he <strong>had traveled</strong> to many countries around the world.',
             ]},
        ]);
}

/* ════════ REPORTED SPEECH ════════ */
function ncReported() {
    return ncH('🗣️ Dolaylı Anlatım','Reported Speech — Dolaylı Anlatım','Birinin sözlerini bir başkasına aktarırken doğrudan ya da dolaylı anlatım şeklinde aktarırız.')
        +ncSH('1. Direct Speech — Doğrudan Aktarım')
        +ncBox('amber','📐 Kural',[
            'Kişinin sözünü aynen aktarır ve parantez içinde belirtir.',
        ])
        +ncAcc([{ico:'🗣️', bg:'rgba(3,105,161,.12)', title:'Direct Speech Örnekleri',
            desc:'"say" ve "tell" fiilleri ile aktarım yaparken "tell" fiilinden sonra nesne getirilmesi gerekir.',
            examples:[
                'My little sister <strong>said</strong>, "I want to play a game."',
                'Mustafa Kemal Atatürk <strong>said</strong>, "Teachers, the next generation will be your masterpiece."',
                'She <strong>says</strong> that she always arrives at her job on time.',
                'She <strong>told me</strong> that she hadn\'t done her project.',
            ]}])
        +ncSH('2. Indirect Speech — Dolaylı Aktarım')
        +ncBox('sky','📐 Kural',[
            'Kişinin sözünü dolaylı yoldan ve bir derece past yaparak aktarır.',
            '<strong>Past Perfect</strong> ve <strong>Past Perfect Continuous</strong> tense ile kurulmuş cümlelerin bir derece pastı yoktur — değişmez, aynı kalır.',
        ]);
}

/* ════════ TENSE CHANGE ════════ */
function ncTenseChange() {
    return ncH('🔄 Tense Değişimi','Indirect Speech — Tense Backshift','Direct speech\'ten indirect speech\'e geçerken zamanlar bir derece past\'a kayar.')
        +ncTable(
            ['Direct Speech (Original)','Indirect Speech (Reported)'],
            [
                ['<strong>Simple Present</strong><br><em>She said, "I always prefer dark colors."</em>','<strong>Past Simple</strong><br><em>My mom said that she always preferred dark colors.</em>'],
                ['<strong>Present Continuous</strong><br><em>He said, "I am walking to the library."</em>','<strong>Past Continuous</strong><br><em>He said that he was walking to the library.</em>'],
                ['<strong>Simple Past</strong><br><em>She said, "I came from Tekirdağ to Balıkesir."</em>','<strong>Past Perfect</strong><br><em>She said that she had come from Tekirdağ to Balıkesir.</em>'],
                ['<strong>Present Perfect</strong><br><em>He said, "I have broken my leg."</em>','<strong>Past Perfect</strong><br><em>She said that she had broken her leg.</em>'],
                ['<strong>Present Perfect Continuous</strong><br><em>She said, "I have been working."</em>','<strong>Past Perfect Continuous</strong><br><em>She said that she had been working.</em>'],
                ['<strong>Past Continuous</strong><br><em>He said, "I was waiting for my mom."</em>','<strong>Past Perfect Continuous</strong><br><em>He said that he had been waiting for his mom.</em>'],
                ['<strong>Simple Future (will)</strong><br><em>She said, "I will make a cake."</em>','<strong>Would + V₁</strong><br><em>She said that she would make a cake.</em>'],
                ['<strong>Future Continuous</strong><br><em>He said, "I will be sleeping."</em>','<strong>Would + be Ving</strong><br><em>He said that he would be sleeping.</em>'],
                ['<strong>Be + going to</strong><br><em>She said, "I am going to do exercises."</em>','<strong>Was / were going to</strong><br><em>She said that she was going to do exercises.</em>'],
                ['<strong>Past Perfect</strong><br>→ Değişmez, aynı kalır','<strong>Past Perfect</strong><br>(bir derece past\'a kaymaz)'],
                ['<strong>Past Perfect Continuous</strong><br>→ Değişmez, aynı kalır','<strong>Past Perfect Continuous</strong><br>(bir derece past\'a kaymaz)'],
            ]
        );
}

/* ════════ TIME & PRONOUN CHANGE ════════ */
function ncTimeChange() {
    return ncH('📅 Zaman & Zamir','Zaman & Pronouns Değişimi','Direct speech\'ten indirect speech\'e geçerken zaman ifadeleri ve zamirler de değişir.')
        +ncSH('Zaman İfadelerinin Değişimi')
        +ncTable(['Direct Speech','Indirect Speech'],[
            ['<strong>Now</strong>','Then'],
            ['<strong>Today</strong>','That day'],
            ['<strong>Tonight</strong>','That night'],
            ['<strong>Tomorrow</strong>','The next day'],
            ['<strong>Yesterday</strong>','The previous day / The day before'],
            ['<strong>This week / month…</strong>','That week / month'],
        ])
        +ncSH('Zamirlerin Değişimi')
        +ncTable(['Direct Speech','Indirect Speech'],[
            ['<strong>I</strong>','He, she…'],
            ['<strong>My</strong>','His, her…'],
            ['<strong>Mine</strong>','His, hers…'],
            ['<strong>Me</strong>','Him, her…'],
            ['<strong>Myself</strong>','Himself, herself…'],
            ['<strong>This / these / here</strong>','That / Those / There'],
        ]);
}

/* ════════ EXERCISES — SET SİSTEMİ ════════ */
var NC_SETS = [
    {
        label: 'Set 1',
        questions: [
            {q:'I think Jeremy\'s aunt lives ___ they went for their honeymoon.',
             opts:['what','who','when','that','where'],
             cor:'e', hint:'"nerede" → where (yer bildiren noun clause)'},
            {q:'The high value of the pound at the moment explains ___ manufacturers and exporters are suffering.',
             opts:['when','where','why','who','how long'],
             cor:'c', hint:'"neden" → why (sebep bildiren noun clause)'},
            {q:'I\'m sure I\'m not the first to notice ___ your daughter is a very talented artist.',
             opts:['who','that','what','when','where'],
             cor:'b', hint:'"notice that" → that ile noun clause (fark etmek)'},
            {q:'___ we rent this shop again next year depends on the amount of profit we make.',
             opts:['When','Who','Whom','Whether','Which'],
             cor:'d', hint:'"Whether" = "...olup olmadığı" → özne konumunda noun clause'},
            {q:'We are not sure yet ___ we want to spend on flowers at our wedding.',
             opts:['how','how long','how often','how much','how far'],
             cor:'d', hint:'"ne kadar" (miktar) → how much'},
            {q:'It wasn\'t until he refused to help that I realised ___ selfish Mike is.',
             opts:['how','what','why','which','when'],
             cor:'a', hint:'"ne kadar" (derece) → how + sıfat'},
            {q:'Will you ask the salesman to explain ___ they ordered their next year\'s supply from our competitors?',
             opts:['who','whom','where','what','why'],
             cor:'e', hint:'"neden" → why'},
            {q:'I would like to know ___ the trains will be running normally during the public holiday.',
             opts:['whom','who','whether','what','which'],
             cor:'c', hint:'"olup olmadığını" → whether (evet/hayır sorusu)'},
            {q:'The main question on the exam asked us to explain ___ glaciers were formed.',
             opts:['how','how much','how far','how long','however'],
             cor:'a', hint:'"nasıl" → how'},
            {q:'I\'m sorry, I don\'t know ___ department Mrs Green works in.',
             opts:['where','when','who','which','how'],
             cor:'d', hint:'"hangi" → which (belirli seçim)'},
        ]
    },
    {
        label: 'Set 2',
        questions: [
            {q:'My sister-in-law buys a Victorian cheese dish ___ she sees one for sale in an antique shop.',
             opts:['whatever','whenever','whichever','however','whoever'],
             cor:'b', hint:'"her ne zaman" → whenever'},
            {q:'I can\'t see ___ the purpose of the new shopping centre is.',
             opts:['who','what','why','which','where'],
             cor:'b', hint:'"ne olduğunu" → what (noun clause)'},
            {q:'Do you have any idea about ___ I should send my letter of resignation to?',
             opts:['what','why','how','whom','when'],
             cor:'d', hint:'Preposition "to" sonrası → whom (object konumunda)'},
            {q:'I\'m not sure ___ the branch manager is the right person to send it to.',
             opts:['when','whom','where','which','whether'],
             cor:'e', hint:'"olup olmadığından" → whether'},
            {q:'I can\'t remember ___ people were killed in the explosion, but it was quite a few.',
             opts:['how much','how far','how long','how often','how many'],
             cor:'e', hint:'"kaç tane" (sayılabilir) → how many'},
            {q:'We can\'t decide ___ to do at the weekend.',
             opts:['where','how','what','which','when'],
             cor:'c', hint:'"ne yapacağımıza" → what + to-infinitive'},
            {q:'I\'m not sure ___ this sweater will fit my daughter.',
             opts:['whether','how','when','who','whom'],
             cor:'a', hint:'"olup olmayacağından" → whether'},
            {q:'Thousands of cattle have starved to death ___ the drought in Ethiopia started.',
             opts:['how','since','when','which','why'],
             cor:'b', hint:'"since" = "-den beri" (zaman bağlacı)'},
            {q:'I don\'t know ___ month you should plant tulip bulbs.',
             opts:['which','when','why','whose','how'],
             cor:'a', hint:'"hangi" + isim → which (noun olarak modifier)'},
            {q:'___ Ethiopia is at war with Eritrea has meant many Western nations are reluctant to send food aid.',
             opts:['How','When','What','The fact that','Whether or not'],
             cor:'d', hint:'"The fact that" = noun clause\'u özne olarak vurgular'},
        ]
    },
    {
        label: 'Set 3',
        questions: [
            {q:'For the last few weeks, medical teams ___ day and night in an effort to find out exactly what ___ this terrible illness.',
             opts:['are working / will cause','have worked / will have caused','have been working / is causing','will have worked / will be caused','were working / had been caused'],
             cor:'c', hint:'Present perfect continuous (devam eden) / present continuous (aktif nedeni)'},
            {q:'The police were investigating who ___ the gate to the factory open the night before the robbery.',
             opts:['is leaving','has left','had left','was left','will be left'],
             cor:'c', hint:'Reported context (past) + geçmişten önce → past perfect: had left'},
            {q:'How you look after yourself following your operation ___ whether you recover completely or not.',
             opts:['was determining','had determined','is determined','has been determined','will determine'],
             cor:'e', hint:'Gelecekteki sonuç → will determine'},
            {q:'Today with mail merge software, a secretary ___ in hours what it ___ days to do 50 years ago.',
             opts:['should have accomplished / may take','could accomplish / takes','accomplished / will have taken','can accomplish / used to take','accomplishes / has been taking'],
             cor:'d', hint:'"can accomplish" (şimdiki yetenek) / "used to take" (geçmişteki alışkanlık)'},
            {q:'I\'m not sure whether I ___ able to speak German confidently when I ___ there next month.',
             opts:['am / will go','have been / went','will be / go','was / had gone','should be / am going'],
             cor:'c', hint:'Whether + future: will be / when + present (future bağlamı)'},
            {q:'It has been confirmed recently ___ using mobile phones can cause brain damage.',
             opts:['if','that','what','when','where'],
             cor:'b', hint:'"confirmed that" → that ile noun clause'},
            {q:'I couldn\'t believe ___ hot chilli powder Margaret had used in her curry.',
             opts:['how much','how long','how far','how often','how few'],
             cor:'a', hint:'"ne kadar çok" → how much'},
            {q:'I\'ve lost count of ___ times the children have watched their Toy Story video.',
             opts:['whether','whatever','how many','whenever','how much'],
             cor:'c', hint:'"kaç kez" (sayılabilir) → how many'},
            {q:'I would like to know ___ bag this is because it\'s occupying my seat.',
             opts:['how','whom','where','which','whose'],
             cor:'e', hint:'"kimin" → whose (iyelik)'},
            {q:'I might be able to tell you ___ channel the film is on if I can remember ___ I put the newspaper.',
             opts:['which / where','where / when','what / how','whom / which','whose / that'],
             cor:'a', hint:'"hangi kanal" → which / "nereye" → where'},
        ]
    },
    {
        label: 'Set 4',
        questions: [
            {q:'Mrs Holliday ___ that the builders had made a terrible job of her extension.',
             opts:['commanded','appeared','requested','predicted','grumbled'],
             cor:'e', hint:'"grumble that" = yakınmak/şikâyet etmek'},
            {q:'The police ___ that the attack on the man was racially motivated.',
             opts:['suspected','arranged','estimated','guaranteed','ordered'],
             cor:'a', hint:'"suspect that" = şüphelenmek'},
            {q:'My husband and I eat at the Draper\'s restaurant ___ we go shopping in Shrewsbury.',
             opts:['whenever','however','wherever','whichever','whoever'],
             cor:'a', hint:'"whenever" = "her gittiğimizde"'},
            {q:'The professor ___ that the nutritionist said chocolate was healthy only because she is employed by a chocolate company.',
             opts:['wondered','argued','wished','pretended','commanded'],
             cor:'b', hint:'"argue that" = öne sürmek/tartışmak'},
            {q:'Luckily, some of the former dancers ___ how the dance was performed fifty years ago.',
             opts:['allege','hope','remember','reply','predict'],
             cor:'c', hint:'"remember how" → nasıl yapıldığını hatırlamak'},
            {q:'The accused man ___ that he acted in self-defence.',
             opts:['suspected','expected','occurred','resolved','claimed'],
             cor:'e', hint:'"claim that" = iddia etmek'},
            {q:'Yes, that is ___ I want you to behave in public.',
             opts:['what','since','which','how','why'],
             cor:'d', hint:'"nasıl" → how (davranış biçimi)'},
            {q:'Enjoyment of the film rather depends on ___ you like Julia Roberts or not.',
             opts:['what','whether','if','how','when'],
             cor:'b', hint:'"whether...or not" → preposition sonrası whether (not if)'},
            {q:'Donating wages to a charity will also give you a sense of pleasure, ___ charity you support.',
             opts:['whoever','whenever','whichever','however','wherever'],
             cor:'c', hint:'"whichever" = "hangisi olursa olsun" (seçim)'},
            {q:'I guessed from the shape of the package ___ my birthday present was a cassette.',
             opts:['which','what','when','that','how'],
             cor:'d', hint:'"guessed that" → that ile noun clause (çıkarım)'},
        ]
    },
    {
        label: 'Set 5',
        questions: [
            {q:'Helen will be working as a representative in Turkey, but she doesn\'t know exactly ___ she will be posted.',
             opts:['what','why','who','where','how'],
             cor:'d', hint:'"nereye" → where'},
            {q:'It\'s important to find out ___ she is actually allergic to.',
             opts:['how','when','where','why','what'],
             cor:'e', hint:'"neye" → what (object noun clause)'},
            {q:'The fans were sent home because the police ___ that the violence could escalate.',
             opts:['proposed','ordered','feared','hoped','replied'],
             cor:'c', hint:'"fear that" = korkmak/endişelenmek'},
            {q:'In the United Kingdom, the law ___ that cars must be tested for safety every year.',
             opts:['threatens','stipulates','teaches','notices','guesses'],
             cor:'b', hint:'"stipulate that" = hükmetmek/şart koşmak'},
            {q:'The results of the survey ___ that George Bush junior would win the election.',
             opts:['warned','indicated','considered','requested','assumed'],
             cor:'b', hint:'"indicate that" = göstermek/işaret etmek'},
            {q:'You really have to go to Australia for the conference ___.',
             opts:['whether or not you are scared of flying','if your manager goes instead of you','which town is it being held in','how long it will take to get there','who will be presenting the new proposals'],
             cor:'a', hint:'"whether or not" = noun clause → özne ile bağlanır'},
            {q:'___ will become clear later.',
             opts:['Whenever he goes to visit his family in Ireland','When will the new owners take over the car factory','Since the businessmen decided to buy this loss-making factory','How the new ownership will affect the employees','Who will the boss appoint as the new manager'],
             cor:'d', hint:'"How the new ownership will affect..." → özne konumunda dolaylı soru'},
            {q:'___ was his only desire.',
             opts:['Whether there would ever be peace in his country','If he could manage to afford a Mercedes Benz','Without the compassion shown to them by the community','That his family could live without fear of persecution','Although they had managed to arrive in Miami safely'],
             cor:'d', hint:'"That his family could live..." → that-clause özne olarak'},
            {q:'___ so it will probably take me longer than usual to get to work.',
             opts:['I couldn\'t remember where I had put the shampoo','My sister has bought a much faster car','The reporter has just remarked that two lanes of the highway are closed','The fact that she slows down at every junction','Jennifer implied that I should buy a faster car'],
             cor:'c', hint:'"remarked that" → that ile noun clause bağlantısı'},
            {q:'The environmentalist argues ___.',
             opts:['how is the environment going to be affected if a nuclear accident should occur','that genetically modified salmon are a threat to the wild species','whether they will allow this species to be grown in the UK','which could possibly breed with wild salmon','who believes genetically modified fruit poses a danger'],
             cor:'b', hint:'"argue that" → that-clause (dolaylı anlatım)'},
        ]
    },
    {
        label: 'Set 6',
        questions: [
            {q:'The Foreign Minister refused to comment on ___.',
             opts:['whether we would withdraw food aid if the human rights abuses continued','why hasn\'t the government done something about these human rights abuses','how can they allow these abuses to happen without doing anything','ever since a breakdown in law and order developed in the area','the situation is now completely out of control in the area'],
             cor:'a', hint:'"comment on whether" → preposition + whether (noun clause)'},
            {q:'The airline didn\'t explain ___.',
             opts:['that the plane will stop to get fuel','why the plane had been delayed','that wasn\'t very nice of them','what time did we leave Heathrow Airport','how long does it take us to get to Istanbul'],
             cor:'b', hint:'"explain why" → dolaylı soru: düz cümle sırası (why + özne + fiil)'},
            {q:'The police underestimated ___.',
             opts:['when so many police officers leave the police force','particularly which politician had the terrorists targeted','how many demonstrators would turn up','the fact was that the situation was out of control','whenever there is a football match in the town'],
             cor:'c', hint:'"underestimate how many" → dolaylı soru (how many + özne + fiil)'},
            {q:'Do you know ___?',
             opts:['how much sugar does he take','where is Patricia going on holiday','since Sonia was back from holiday','is Freddie coming to dinner tonight','how Julia likes her coffee'],
             cor:'e', hint:'Dolaylı soru → düz cümle sırası: how Julia likes (not "does she like")'},
            {q:'Yesterday at school, we learnt ___.',
             opts:['how glass is made','what is the procedure in making porcelain','that was extremely interesting','whether we enjoy it or not','which concerned the teacher most of all'],
             cor:'a', hint:'"learnt how" → dolaylı soru: how + özne + fiil (passive)'},
            {q:'When I went to collect my jacket from the dry-cleaner\'s, the assistant said that he ___ it but ___ able to remove the stain.',
             opts:['was cleaning / won\'t have been','had cleaned / hadn\'t been','would have cleaned / hasn\'t been','is cleaning / wasn\'t','had been cleaning / isn\'t'],
             cor:'b', hint:'Reported past: had cleaned / hadn\'t been able to (past perfect backshift)'},
            {q:'The boy confessed that he had stolen the bread, but pleaded that his sister and he ___ at the time.',
             opts:['will have starved','are starving','had been starving','have starved','will starve'],
             cor:'c', hint:'Past perfect continuous: had been starving (geçmişte süregelen durum)'},
            {q:'Are you sure she was in when you ___ her but ___ the phone?',
             opts:['will be phoning / won\'t answer','had phoned / isn\'t answering','are phoning / hasn\'t answered','phoned / didn\'t answer','have phoned / doesn\'t answer'],
             cor:'d', hint:'Past simple eş zamanlı eylemler: phoned / didn\'t answer'},
            {q:'We asked at the lost property counter whether a pink and blue bag ___ but the assistant told us that no one ___ in anything fitting our description.',
             opts:['was found / has been handed','is being found / would have handed','will have found / is going to hand','had been found / had handed','might have found / will be handing'],
             cor:'d', hint:'Reported past: had been found / had handed (past perfect backshift)'},
            {q:'Mr Haughin phoned his wife to say that she ___ to cook anything for dinner as they ___ to his colleague\'s.',
             opts:['doesn\'t need / have been invited','didn\'t need / had been invited','won\'t need / are invited','hasn\'t needed / were being invited','wouldn\'t need / will be invited'],
             cor:'b', hint:'Reported past: didn\'t need / had been invited (backshift)'},
        ]
    },
    {
        label: 'Set 7',
        questions: [
            {q:'I was glad to hear that the factory ___ down after all as a new owner ___.',
             opts:['won\'t have closed / had been finding','shouldn\'t have closed / has found','doesn\'t close / has been found','wasn\'t closing / is found','wouldn\'t be closing / had been found'],
             cor:'e', hint:'Reported past continuous: wouldn\'t be closing / past perfect passive: had been found'},
            {q:'We feared that the roads ___ too busy on a national holiday, so we ___ not to go anywhere.',
             opts:['will have been / decide','are / could have decided','would be / decided','were / will decide','had been / have decided'],
             cor:'c', hint:'Reported past: would be (future in past) / decided (simple past sonuç)'},
            {q:'The sales manager ___ the director that some customers ___ models on special offer in the sale already.',
             opts:['is informing / buy','is informed / bought','informed / had bought','had informed / will be buying','was informed / are buying'],
             cor:'c', hint:'"informed that" + past perfect: had bought (backshift)'},
            {q:'Because our last telephone bill was high, my husband is always reminding me that I ___ until after six before I ___ my friends.',
             opts:['have waited / called','must wait / call','waited / could call','might wait / was calling','wait / should call'],
             cor:'b', hint:'"must wait / call" → present obligation (genel kural, backshift yok)'},
            {q:'I asked Nigel whether they were going somewhere for Bayram, but he said his wife ___ in the accident and emergency department that week.',
             opts:['has worked','is working','would be working','has been working','will have worked'],
             cor:'c', hint:'Reported future in past: would be working (future continuous backshift)'},
            {q:'During our training, I realised that I ___ a lot if I ___ carefully because the lecturer really seemed to know his subject.',
             opts:['must learn / was listening','have learnt / will be listening','could learn / listened','had been learning / would listen','learnt / were listening'],
             cor:'c', hint:'Type 2 bağlamı (geçmişteki hayal): could learn / if I listened'},
            {q:'My mother handed me money and instructed me ___ Mrs Jackson buy anything for me while I was staying with her.',
             opts:['don\'t let','not to let','didn\'t let','not letting','wouldn\'t let'],
             cor:'b', hint:'"instruct + to-infinitive" → not to let (olumsuz to-inf)'},
            {q:'The painter has assured us that he ___ the decorating by the weekend as he promised.',
             opts:['will have completed','had been completing','has completed','completed','would have completed'],
             cor:'a', hint:'"will have completed" → future perfect (belirli zamana kadar tamamlanacak)'},
            {q:'Mr Partridge, the customer is asking whether he ___ the suit back if it ___ his son.',
             opts:['would bring / won\'t fit','was bringing / hadn\'t fitted','is bringing / didn\'t fit','could have brought / hasn\'t fitted','can bring / doesn\'t fit'],
             cor:'e', hint:'"can bring" + "doesn\'t fit" → Type 1 (gerçek olasılık)'},
            {q:'The manager complained that the cleaners ___ at the time and wondered who ___ them permission to leave early.',
             opts:['wouldn\'t be working / will give','wouldn\'t work / will be given','aren\'t working / are giving','hadn\'t been working / had given','weren\'t working / have given'],
             cor:'d', hint:'Reported past perfect cont.: hadn\'t been working / had given'},
        ]
    },
    {
        label: 'Set 8',
        questions: [
            {q:'It is widely believed ___ too much television isn\'t healthy for children.',
             opts:['which','where','when','who','that'],
             cor:'e', hint:'"It is believed that" → extraposed that-clause'},
            {q:'I could have been more enthusiastic at the training scheme, you know, and so ___ you.',
             opts:['should','do','can','had','could'],
             cor:'a', hint:'"and so should you" → auxiliary agree yapısı (modal backshift)'},
            {q:'We weren\'t given any homework for tonight, ___?',
             opts:['did it','wasn\'t it','were we','did we','hadn\'t it'],
             cor:'c', hint:'Question tag: passive "weren\'t given" → were we?'},
            {q:'A: I haven\'t felt very motivated at work since the new manager started. B: ___ .',
             opts:['Neither was he','So am I','I expect he is','Neither have I','But I haven\'t'],
             cor:'d', hint:'"Neither have I" → present perfect olumsuz agreement'},
            {q:'I think "Erin Brockovich" is showing at the cinema in Moda, ___?',
             opts:['isn\'t it','don\'t I','do I','wasn\'t it','is it'],
             cor:'a', hint:'Present continuous → tag: isn\'t it'},
            {q:'The shop manager told the sales assistant ___ idle and ___ something useful to do.',
             opts:['don\'t stay / have found','wasn\'t standing / has found','didn\'t stand / finds','not to stand / to find','not standing / to be finding'],
             cor:'d', hint:'"tell + not to + V₁" → reported command (not to stand / to find)'},
            {q:'A: Are we in Houston now? B: ___ . I\'m tired of sitting on this bus.',
             opts:['So is it','Neither are we','I hope so','So we have','Nor does it'],
             cor:'c', hint:'"I hope so" → dolaylı onaylama (belirsizlik var)'},
            {q:'A: I hope the Sims won\'t bring their children to the wedding. B: ___ because Julia\'s mother usually baby-sits.',
             opts:['I don\'t expect so','Neither will I','I\'m afraid so','I hope so','So will they'],
             cor:'a', hint:'"I don\'t expect so" → negative agreement (beklenti yok)'},
            {q:'It is such a pity Vicki and Dave can\'t meet us for lunch. I was looking forward to it, and ___ were you, weren\'t you?',
             opts:['so','nor','either','yet','too'],
             cor:'a', hint:'"and so were you" → olumlu agreement (devrik)'},
            {q:'In the evening my husband likes to watch films, ___ . I prefer documentaries, so we\'ve bought a second television.',
             opts:['and so am','but I don\'t','and nor am I','but I do','and I don\'t either'],
             cor:'b', hint:'"but I don\'t" → zıt görüş (contrast)'},
        ]
    },
    {
        label: 'Set 9',
        questions: [
            {q:'You haven\'t heard from Bill since he left for India, ___?',
             opts:['did he','has he','have you','haven\'t you','didn\'t you'],
             cor:'c', hint:'Present perfect olumsuz → tag: have you?'},
            {q:'Most of the members didn\'t appear to agree with the committee\'s decision, ___?',
             opts:['were there','didn\'t it','have they','wasn\'t it','did they'],
             cor:'e', hint:'"didn\'t appear" → tag: did they?'},
            {q:'The label explains how long we should cook it for, ___?',
             opts:['shouldn\'t we','do we','does it','doesn\'t it','should we'],
             cor:'d', hint:'Simple present → tag: doesn\'t it?'},
            {q:'We live right next to the park, so I can take my daughter there ___ the weather is fine.',
             opts:['however','whichever','wherever','whenever','whomever'],
             cor:'d', hint:'"whenever" = "hava güzel olduğunda her seferinde"'},
            {q:'Look at the rubbish under that tree! ___ dumped that has absolutely no sense of social responsibility.',
             opts:['However','Whoever','Wherever','Whenever','Whatever'],
             cor:'b', hint:'"Whoever dumped that" → özne konumunda whoever'},
            {q:'Good Luck. Promise me that you\'ll write to me ___ happens.',
             opts:['whenever','however','wherever','whoever','whatever'],
             cor:'e', hint:'"whatever happens" = "ne olursa olsun"'},
            {q:'I like them both, Mary. You will look beautiful in ___ wedding dress you choose.',
             opts:['whoever','whichever','however','whatever','whenever'],
             cor:'b', hint:'"whichever dress" = "hangi elbiseyi seçersen seç"'},
            {q:'We didn\'t realise ___ some of the employees had been ill on Fridays and Mondays until we checked the company records.',
             opts:['however','how long','how often','where','whether'],
             cor:'c', hint:'"how often" = "ne sıklıkla" (frekans)'},
            {q:'It looks too cluttered ___ we arrange the furniture.',
             opts:['whenever','wherever','whatever','however','whichever'],
             cor:'d', hint:'"however we arrange" = "nasıl düzenlersek düzenleyelim"'},
            {q:'Once you have learnt ___ to centre your work and the basic stitches, embroidery is not difficult.',
             opts:['how','whose','that','whether','whom'],
             cor:'a', hint:'"how to" + V₁ = "nasıl yapılacağını" (infinitive noun clause)'},
        ]
    },
    {
        label: 'Set 10',
        questions: [
            {q:'Of course it is nice to go to Holland in the summer, but ___ you are going is the best time to see the daffodils.',
             opts:['when','where','who','how','which'],
             cor:'a', hint:'"when you are going" → özne konumunda noun clause'},
            {q:'Nobody has any clear ideas ___ should captain the West Indies cricket team now.',
             opts:['how','who','what','when','which'],
             cor:'b', hint:'"who should captain" → dolaylı soru (özne)'},
            {q:'___ happened in Yemen will put tourists from Europe off visiting the area.',
             opts:['When','Which','What','Why','Where'],
             cor:'c', hint:'"What happened" → özne konumunda noun clause'},
            {q:'I was a little annoyed, but they explained ___ they had had to cancel the appointment.',
             opts:['why','whose','how','when','whom'],
             cor:'a', hint:'"explain why" → neden iptal etmek zorunda kaldıklarını'},
            {q:'Do you know ___ agent Kate and Richard went to Turkey with?',
             opts:['which','who','where','when','why'],
             cor:'b', hint:'"who they went with" → dolaylı soru (kişi)'},
            {q:'___ people had been killed in the operation was kept secret.',
             opts:['How many','What','Whenever','Whomever','Who'],
             cor:'a', hint:'"How many people" → özne konumunda dolaylı soru'},
            {q:'The immigration officer wants to know ___ you entered the country.',
             opts:['which','what','who','whom','when'],
             cor:'e', hint:'"when you entered" → zaman bildiren dolaylı soru'},
            {q:'The price of a bracelet is determined according to ___ pure gold it contains.',
             opts:['how many','how much','however','what','how'],
             cor:'b', hint:'"how much gold" → miktar (preposition sonrası noun clause)'},
            {q:'___ he was tortured in his own country will be taken into account when his case for asylum is heard.',
             opts:['Whom','What','The fact that','Where','Which'],
             cor:'c', hint:'"The fact that" → özne konumunda noun clause (gerçeği vurgular)'},
            {q:'I don\'t know for sure ___ bicycle this is, but it must be either Jane\'s or Jack\'s.',
             opts:['what','where','how','whose','whom'],
             cor:'d', hint:'"whose bicycle" → iyelik dolaylı sorusu'},
        ]
    },
    {
        label: 'Set 11',
        questions: [
            {q:'It is widely believed in Turkey ___.',
             opts:['although nothing has been proved about their superstitions','whether a blue bead really protects me from the evil eye','because bad luck can wreck a person\'s life','as other cultures have a variety of good luck symbols','that an envious look cast upon you can bring bad luck'],
             cor:'e', hint:'"It is believed that" → that-clause (dolaylı anlatım)'},
            {q:'Our boss always wants us ___.',
             opts:['because our quotations had been taking a long time to prepare','whether we could type some reports for him','to clear our desks at the end of the day','that we shouldn\'t receive any customer complaints','if we could work some overtime next week'],
             cor:'c', hint:'"want + us + to-infinitive" → to clear (nesne + mastar)'},
            {q:'Did the company acknowledge ___?',
             opts:['that we should be compensated for the delay','if this is their normal level of service','if only we could arrive before the meeting','whether we can get a refund or not','how much longer we are going to wait'],
             cor:'a', hint:'"acknowledge that" → that-clause (dolaylı anlatım fiili)'},
            {q:'All of us wondered ___.',
             opts:['whether I have been told about the scandal involving the family or not','why the whole family had suddenly moved to Canada without saying anything','that is because of the problems he is having at his current school','to know if the family had overcome all the difficulties there','the fact that his son actually managed to become a doctor'],
             cor:'b', hint:'"wonder why" → dolaylı soru: why + özne + past perfect'},
            {q:'The council don\'t seem to appreciate ___.',
             opts:['how did they sell the land to the supermarket chain','why aren\'t the opinions of the town\'s people being considered','will there be free parking at the new supermarket','how much the people of the town value their traditional market','whatever the outcome of the meeting of the farmers\' had been'],
             cor:'d', hint:'"appreciate how much" → dolaylı soru: düz cümle sırası'},
            {q:'I don\'t like to waste my money eating at restaurants, and neither does my husband.',
             opts:['I prefer eating out at restaurants whenever I can, but my husband thinks it is a waste of money.','Both my husband and I eat out at restaurants often, although we would prefer not to.','Both my husband and I prefer not to spend our money needlessly on food in restaurants.','My husband prefers to eat in restaurants, while I prefer to save my money.','We would eat at restaurants more often if my husband liked that sort of thing.'],
             cor:'c', hint:'"neither does my husband" → ikisi de sevmiyor; "both prefer not to"'},
            {q:'My father says that you should treat people how you wish to be treated yourself.',
             opts:['It\'s my father\'s belief that you ought to behave towards other people the way you want them to behave towards you.','My father told me that you deserved to be treated how you had treated others previously.','My father always instructs me to consider how people want to be treated and behave accordingly.','I have always behaved towards people as I wish to be treated myself, because this is what my father taught me.','If you had listened to my father, you would always treat others with the consideration you expect from them.'],
             cor:'a', hint:'"treat people how you wish to be treated" → karşılıklılık ilkesi'},
            {q:'Contrary to all expectations, the man was found guilty of murder for killing a burglar.',
             opts:['Everyone thought the man would be found innocent of murder after killing a thief, but he was found guilty.','Everyone knew the man was guilty of murder because he killed a man who had broken into his house.','He was convicted of murder, which was unfair, as the man he killed was robbing his house at the time.','It was obvious that he would be found guilty of murder because he shot a burglar and killed him.','People expected that he would only be found guilty of burglary, but he was also convicted of murder.'],
             cor:'a', hint:'"Contrary to all expectations" → beklenmedik sonuç: suçlu bulundu'},
            {q:'It surprised a lot of people that they went ahead with the match in such atrocious weather.',
             opts:['Even though the weather was awful, nobody thought they would cancel the match.','Many people couldn\'t understand why they hadn\'t cancelled the match due to the dreadful weather.','Had the match been cancelled because of the terrible weather, a lot of people would have been disappointed.','Only a few people were interested in the match and the weather was dreadful, so they cancelled it.','Everyone was disappointed that the match was cancelled because of bad weather.'],
             cor:'b', hint:'"surprised that they went ahead" → birçok kişi neden iptal etmediklerini anlamadı'},
            {q:'They\'ll never be able to find out exactly why the ship sank.',
             opts:['They are determined to discover the exact cause of the sinking of the ship.','If only they knew the precise cause of the sinking, they would be content.','The accuracy of the report of the ship\'s sinking is open to question.','What caused the ship to sink can never be determined with any accuracy.','The findings of the report only explained what might have caused the ship to sink.'],
             cor:'d', hint:'"never be able to find out why" → "can never be determined"'},
        ]
    },
    {
        label: 'Set 12',
        questions: [
            {q:'As I\'m interested in learning German myself, I would be interested to find out which college she is studying at.',
             opts:['I asked her where she studied German because I want to learn the language as well.','I wonder which college she is learning German at because I\'m considering studying the language too.','I wish I had known where she was studying because I would have gone to the same college.','I wondered why she hadn\'t asked me where I was studying if she was interested in German too.','I\'d like to know which college she works at so that I can go and find her when I go to Germany.'],
             cor:'b', hint:'"interested in finding out which college" → wonder which college (merak)'},
            {q:'She is so miserable these days that she dismisses whatever I suggest as boring.',
             opts:['She is really unhappy, and I admit that everything I recommend these days is particularly boring.','I am trying to cheer her up at the moment by suggesting interesting things to do, but she is still bored.','Because she is very unhappy at the moment, she rejects anything I suggest on the grounds that it is tedious.','She wouldn\'t be so unhappy if she did some of the interesting things I have suggested.','She rejects me as boring, but, at least, I\'m not as miserable as she is.'],
             cor:'c', hint:'"dismisses whatever I suggest as boring" → "rejects anything I suggest...tedious"'},
            {q:'"I am horrified to hear what some parents consider suitable television viewing for children," said the teacher.',
             opts:['The Parent-Teacher Association members were surprised at the opinion of the teacher about what constituted suitable television for children.','I was deeply shocked at the type of programmes deemed suitable for children by the presentation at the Parent-Teacher Association meeting.','The teacher expressed his shock to the Parent-Teacher Association members at what are deemed by some parents to be appropriate television programmes for children.','The teacher addressed the members of the Parent-Teacher Association on what should be considered suitable television programmes for children.','The Parent-Teacher Association members shocked the teacher with their ideas of which programmes on television are suitable for children.'],
             cor:'c', hint:'"horrified to hear what some parents consider" → "expressed his shock at what parents deem"'},
            {q:'The principal wrote a formal letter of recommendation for the teacher.',
             opts:['The teacher that applied for the post had been formally recommended by the principal.','The principal recommended the teacher without putting it in writing.','The teacher wrote to the principal asking for a recommendation.','The letter the teacher gave the principal recommended him for the post.','An official letter recommending the teacher was issued by the principal.'],
             cor:'e', hint:'"wrote a formal letter of recommendation" → "An official letter was issued by the principal"'},
            {q:'The west coast of Scotland is a beautiful place to go on holiday, but you can\'t depend on the weather, can you?',
             opts:['The west coast of Scotland is beautiful, but the weather is always awful, isn\'t it?','The west coast of Scotland is a picturesque holiday location, but the weather is unpredictable, isn\'t it?','If you go on holiday to the Scottish coast, you should remember the weather there is changeable, shouldn\'t you?','The holiday resorts on the picturesque west coast of Scotland don\'t get much sunshine, do they?','The holiday resorts on the west coast of Scotland would be perfect if the weather was dependable, wouldn\'t they?'],
             cor:'b', hint:'"can\'t depend on the weather" = "weather is unpredictable"'},
            {q:'We checked the distance to London on a map to see how far it was.',
             opts:['Londra\'ya ne kadar uzakta olduğumuzu anlayabilmek için bir harita üzerinde mesafeyi hesapladık.','Londra\'ya olan mesafeyi bir harita üzerinde kontrol ettikten sonra ne kadar uzakta olduğumuzu anladık.','Londra\'ya ne kadar uzak olduğumuzu ancak harita üzerinde mesafeye bakınca anladık.','Ne kadar uzakta olduğumuzu ancak bir harita üzerinde Londra\'ya olan mesafeyi görünce farkettik.','Ne kadar uzaklıkta olduğunu anlamak için Londra\'ya olan mesafeyi bir harita üzerinde kontrol ettik.'],
             cor:'e', hint:'"to see how far it was" → amaç; "kontrol ettik" → check'},
            {q:'The fact that an outsider was appointed to the position upon the director\'s resignation greatly disappointed some members of the staff.',
             opts:['Personelin büyük hayal kırıklığına uğraması, müdürün istifasından sonra bu göreve dışarıdan birinin atanması yüzündendi.','Bütün personel üyeleri çok büyük hayal kırıklığı yaşadı çünkü müdür istifa edince yerine dışarıdan biri atandı.','Müdürün istifasından sonra dışarıdan birinin bu göreve atanması, personelin bazı üyelerini büyük hayal kırıklığına uğrattı.','Müdür istifa edince, dışarıdan birinin bu göreve getirilmesi, personel üzerinde biraz hayal kırıklığı yaratmıştı.','Müdürün istifasından sonra bu göreve dışarıdan biri atanmış olsaydı, personelin bazı üyeleri büyük hayal kırıklığına uğrardı.'],
             cor:'c', hint:'"some members of staff" → personelin bazı üyeleri; "greatly disappointed" → büyük hayal kırıklığı'},
            {q:'By looking at their present economic situations, it\'s possible to understand how badly both countries have been affected by the war.',
             opts:['Her iki ülkenin de savaştan ne denli kötü etkilendiklerini anlamak için şu anki ekonomik durumlarına bakmanız yeterlidir.','Şu anki ekonomik durumlarına bakarak, her iki ülkenin de savaştan ne kadar kötü etkilendiğini anlamak mümkün.','Ekonomilerinin şu anki durumuna bakılırsa, her iki ülkenin de savaştan çok kötü etkilendikleri anlaşılıyor.','Bugünkü ekonomik durumlarına bakılınca, savaşın her iki ülkeyi de ne kadar kötü etkilediğini anlamak zor değil.','Her iki ülkenin bugünkü ekonomik durumlarına bakıldığında, savaşın kötü etkisinin ne kadar çok olduğu anlaşılabilir.'],
             cor:'b', hint:'"By looking at...it\'s possible to understand" → "bakarak...anlamak mümkün"'},
            {q:'It doesn\'t matter whether the clothes you wear are fashionable or not, as long as they suit you.',
             opts:['Giydiğiniz giysilerin modaya uygun olmasından çok size yakışması önemlidir.','Giydiğiniz giysilerin modaya uygunluğuna değil, size yakışıp yakışmadığına önem veriniz.','Size yakıştıkları sürece, giydiğiniz giysilerin modaya uygun olup olmaması önemli değil.','Size yakıştığına inanıyorsanız, giysilerinizin modaya uygun olup olmadığını önemsemeyiniz.','Asıl önemsemeniz gereken, giysilerinizin modaya uygun olup olmaması değil, size yakışmasıdır.'],
             cor:'c', hint:'"It doesn\'t matter whether...or not, as long as" → "olup olmaması önemli değil, ...dığı sürece"'},
            {q:'After I\'d put the baby to sleep, I asked the children in the back garden to play without making too much noise.',
             opts:['Bebeği uyutabilseydim, daha sonra arka bahçedeki çocuklardan çok fazla gürültü yapmadan oynamalarını rica ederdim.','Bebek uyuduğu için, çocuklardan çok fazla gürültü yapmadan arka bahçede oynamalarını istedim.','Bebeği uyuttuktan sonra, arka bahçedeki çocuklardan çok fazla gürültü yapmadan oynamalarını rica ettim.','Bebeği uyutup sonra çocuklara, arka bahçede çok fazla gürültü yapmadan oynamalarını söyledim.','Bebeğin uyumasından sonra, çocuklara arka bahçede oynarken çok fazla gürültü yapmamalarını söyledim.'],
             cor:'c', hint:'"After I\'d put the baby to sleep" → "uyuttuktan sonra"; "asked to play without making noise" → "rica ettim"'},
        ]
    },
    {
        label: 'Set 13',
        questions: [
            {q:'Since the park is not illuminated adequately, I don\'t find it safe to go walking there after dark.',
             opts:['Park iyice aydınlatılmadığı sürece orada yürüyüş yapmanın pek güvenli olmayacağını düşünüyorum.','Hava karardıktan sonra parkta yürüyüş yapmak bence güvenli değil çünkü oranın aydınlatılmasını yeterli bulmuyorum.','Parkta yürüyüş yapmayı artık güvenli bulmuyorum çünkü hava karardı ve orası yeterince aydınlatılmış değil.','Park yeterince aydınlatılmış olmadığı için hava karaldıktan sonra orada yürüyüş yapmayı pek güvenli bulmuyorum.','Hava karaldıktan sonra parkta yürüyüş yapmanın güvenli olması için orada çok iyi bir aydınlatma olması gerekir.'],
             cor:'d', hint:'"Since...not illuminated adequately" → "yeterince aydınlatılmış olmadığı için"; "after dark" → "hava karaldıktan sonra"'},
            {q:'Due to the ability of their chromosomes to undergo changes similar to those of humans, yeasts are important to scientists.',
             opts:['Bilim adamlarının mayaları bu kadar çok önemsemesinin nedeni, kromozomlarının insanlarınki gibi değişiklikler gösterebilmesidir.','Kromozomları insanlarınki gibi değişim gösterdiği için bilim adamları mayaları büyük bir dikkatle incelemektedir.','Mayaların kromozomlarının insanlarınkine benzer değişiklikler göstermesini bilim adamları çok önemsemiştir.','Kromozomlarının insanlarınkine benzer değişimler gösterebilmesi nedeniyle mayalar bilim adamları için çok önemlidir.','Bilim adamlarına göre, mayaların kromozomlarının insanlarınkine benzer değişimler gösterebilmesi, onları çok önemli kılmaktadır.'],
             cor:'d', hint:'"Due to the ability...to undergo changes similar to humans" → "benzer değişimler gösterebilmesi nedeniyle"'},
            {q:'The members of the weasel family can survive in highly diverse ecological habitats ranging from tropical forests to the Arctic tundra.',
             opts:['Sansar familyasının üyeleri, tropikal ormanlardan kutup tundrasına kadar yayılan son derece çeşitli ekolojik ortamlarda yaşayabilmektedir.','Tropikal ormanlardan kutup tundrasına kadar yayılan sansar familyasının üyeleri, son derece çeşitli ekolojik ortamlarda bulunur.','Sansar familyasının üyeleri, son derece farklı ekolojik alanlara yayılmış olup tropikal ormanlarda ve kutup tundrasında bile yaşayabilir.','Son derece çeşitli ekolojik ortamlarda yaşayabilen sansar familyası türleri, tropikal ormanlardan kutup tundrasına kadar uzanan alana yayılmıştır.','Sansar familyası üyeleri, son derece değişik ekolojik ortamlarda yaşayabildiği için tropikal ormanlardan kutup tundrasına kadar yayılmıştır.'],
             cor:'a', hint:'"can survive in highly diverse ecological habitats ranging from...to" → doğru çeviri'},
            {q:'Like our Earth, other planets of the solar system are each enclosed in a thin layer of gas called an atmosphere.',
             opts:['Dünyamız dahil, güneş sisteminin diğer bütün gezegenlerinin çevresinde atmosfer adı verilen ince bir gaz tabakası vardır.','Dünyamız gibi, güneş sisteminin diğer gezegenlerinin çevresinde de, atmosfer denilen ince bir gaz tabakası bulunmaktadır.','Dünyamız gibi, güneş sisteminin diğer gezegenlerinin de her biri, atmosfer adı verilen ince bir gaz tabakasıyla çevrilidir.','Dünyamızı ve güneş sistemindeki diğer gezegenlerin her birini çevreleyen, atmosfer denilen ince bir gaz tabakasıdır.','Atmosfer adı verilen ince bir gaz tabakası, sadece dünyamızı değil, güneş sistemindeki diğer gezegenleri de çevrelemektedir.'],
             cor:'c', hint:'"Like our Earth" → "Dünyamız gibi"; "each enclosed in" → "her biri...ile çevrilidir"'},
            {q:'Though the climate is dry in Arizona, the river valleys and desert areas where irrigation is used are suitable for farming.',
             opts:['İklimi kurak olsa da, Arizona\'daki nehir vadilerinde ve sulanan çöl alanlarda tarım yapılmaktadır.','Arizona\'da iklimin kurak olmasına karşın, nehir vadileri ve sulama yapılan çöl alanlar tarıma elverişlidir.','Arizona\'nın iklimi kuraktır, ancak nehir vadileri ve sulanabilen çöl alanlar tarım amaçlı kullanılabilmektedir.','Nehir vadileri ve sulama yapılan çöl alanlar, Arizona\'da iklim kurak olduğunda da tarıma elverişlidir.','Arizona\'nın iklimi kurak olmasına rağmen sulama yapılan nehir vadileri ve çöl alanlar tarım amacıyla kullanılmaktadır.'],
             cor:'b', hint:'"Though...dry" → "kurak olmasına karşın"; "suitable for farming" → "tarıma elverişlidir"'},
            {q:'Personel müdürüne şirketin yeni politikasının ne olduğunu sordum ama doyurucu bir yanıt alamadım.',
             opts:['We have been told that there is a new personnel policy, but nobody seems to be able to give us a satisfactory explanation.','Although I specifically asked the personnel manager about the company\'s new policy, he didn\'t give me a satisfactory answer.','The personnel manager\'s answer to my question regarding the new company policy was totally unsatisfactory.','I was not given a very satisfying answer regarding the company\'s new personnel policy when I asked our manager.','I asked the personnel manager what the company\'s new policy was, but I couldn\'t get a satisfying answer.'],
             cor:'e', hint:'"ne olduğunu sordum" → "asked what the policy was"; "alamadım" → "couldn\'t get"'},
            {q:'Arka sıralarda oturan izleyiciler, konuşmacıyı tam olarak duyamamaktan yakındılar.',
             opts:['The complaint of the viewers sitting at the back was that they couldn\'t hear the speaker at all.','Everyone except those in the back rows could hear the speaker perfectly well.','They received some complaints from people sitting at the back about not being able to hear the speaker very well.','Some people were sitting in the back row and had to complain because they couldn\'t hear the speaker well.','The viewers sitting in the back rows complained that they couldn\'t hear the speaker properly.'],
             cor:'e', hint:'"yakındılar" → "complained that"; "tam olarak duyamamak" → "couldn\'t hear properly"'},
            {q:'Konferansa kaç kişinin katılacağını şimdiden tahmin etmek neredeyse imkansız.',
             opts:['It\'s impossible to calculate what the total number of guests at the conference is.','At this early stage, it is extremely difficult to estimate the number of people who will attend the conference.','We haven\'t received the estimates yet of how many people are expected to attend the conference.','It\'s almost impossible to estimate as yet how many people will attend the conference.','Giving an accurate estimate of the number of people to be interested in the conference is impossible.'],
             cor:'d', hint:'"kaç kişinin" → "how many people"; "neredeyse imkansız" → "almost impossible"'},
            {q:'Mahkumun kaçmasına kimlerin yardım ettiğini bulmak için polis geniş çaplı bir soruşturma başlattı.',
             opts:['The wide-scale investigation, which was launched by the police, helped to find those who helped the prisoner escape.','A wide-scale investigation has been launched in order to discover exactly who was responsible for the convict\'s escaping.','The police have started a wide-scale investigation in order to find out who helped the convict escape.','The police carry out wide-scale investigations after a convict escapes to find out whether he has been assisted.','The police carried out a wide-scale investigation in the hope of finding out who helped the convict escape.'],
             cor:'c', hint:'"bulmak için" → "in order to find out"; "kimlerin yardım ettiğini" → "who helped"'},
            {q:'Oğlunun üniversite giriş sınavında başarılı olup olamayacağı konusunda çok endişeli görünüyorsun.',
             opts:['You appear to be very concerned about whether your son will be successful in the university entrance exam.','You shouldn\'t concern yourself so much about whether your son will be successful in the university entrance exam.','You seem to be very certain that your son will be successful in the university entrance exam.','You look very anxious, but I\'m sure your son will succeed in passing the university entrance exam.','There is no point in concerning yourself about whether or not your son will pass his university entrance exam.'],
             cor:'a', hint:'"olup olamayacağı" → "whether...will be"; "görünüyorsun" → "appear to be"'},
        ]
    },
    {
        label: 'Set 14',
        questions: [
            {q:'Peru ve Bolivya\'nın And dağları bölgesinde danslar, yerel gelenekleri İspanyol sömürge dönemininkilerle birleştirmiştir.',
             opts:['The dances performed by inhabitants of the mountainous region joining Peru to Bolivia combine traditional movements with those of the Spanish colonial era.','In the Andes mountain regions of Peru and Bolivia, dances blend indigenous traditions with those from the Spanish colonial era.','Dances from indigenous traditions of the people living in the Peruvian and Bolivian Andes region had been influenced by the Spanish colonial era.','The dancers from the Andes mountain regions of Peru and Bolivia blend the indigenous traditions with those introduced by the Spanish during their colonial rule.','The dances in the Andes mountain regions of Peru and Bolivia are a curious blend of native culture and imported Spanish colonial movements.'],
             cor:'b', hint:'"yerel gelenekleri...birleştirmiştir" → "blend indigenous traditions with those from the Spanish colonial era"'},
            {q:'Bilgisayar analizi, kan testi sonuçlarının doğruluğunu büyük ölçüde arttırmıştır.',
             opts:['Because computers are now used to analyse blood tests, the results are more accurate.','The accuracy of blood test results has improved since computers were introduced to analyse the specimens.','The results of blood tests are much more accurate today because computers are used to analyse them.','The rate of improvement in analysing blood tests has greatly accelerated since the introduction of computer programs.','Computer analysis has greatly improved the accuracy of the results of a blood test.'],
             cor:'e', hint:'"Bilgisayar analizi" → "Computer analysis" (özne); "arttırmıştır" → "has greatly improved"'},
            {q:'Çöllerdeki bitkiler, daimi kuraklıkla başa çıkabilmek için küçüktür ve bazıları yapraklarında su depolayabilmektedir.',
             opts:['As a result of constant drought, small desert plants have developed the ability to store water in their leaves and even in their stems.','The little plant life there is in deserts has adapted to constant drought by storing water in their leaves or even in their stems.','Because of the constant drought in deserts, plants are normally small and some have the ability to store water in their leaves and stems.','To cope with constant drought, plants in deserts are small and some can store water in their leaves and even in their stems.','The small plants which grow in deserts have special features, such as the ability to hold water in their leaves or stems.'],
             cor:'d', hint:'"başa çıkabilmek için" → "To cope with"; "küçüktür ve bazıları...depolayabilir" → "are small and some can store"'},
            {q:'Bugün vizon ve samur kürklerinin hemen hepsi çiftliklerde yetiştirilen hayvanlardan elde edilmektedir.',
             opts:['Minks and sables are the most popular animals to be farmed for their fur today.','Almost all mink and sable furs today are obtained from farm-raised animals.','Very few mink and sable furs are obtained from wild animals today.','A large proportion of mink and sable furs today are obtained from farm-reared animals.','With very few exceptions, mink and sable fur items are produced from the fur of farm-raised animals.'],
             cor:'b', hint:'"hemen hepsi" → "almost all"; "çiftliklerde yetiştirilen" → "farm-raised"'},
            {q:'Amaçları ne kadar farklı olursa olsun, bütün uzay araçları uzayda temel fizik kanunlarına uygun hareket eder ve hepsi birbirine benzer temel parçalardan oluşur.',
             opts:['However varied they may be in purpose, all spacecraft move through space in accordance with fundamental physical laws, and all are made up of similar basic components.','There are many different designs for spacecraft, but they all function in accordance with the same physical laws and have some common components.','Spacecraft are designed for a variety of purposes, but they all comply to certain physical restraints in space and are constructed of similar materials.','There are certain common components of spacecraft because the movement of them through space is governed by some basic physical laws whatever the purpose or direction of travel.','Although all spacecraft are governed by some fundamental laws of physics, they can be constructed from a number of materials.'],
             cor:'a', hint:'"ne kadar farklı olursa olsun" → "However varied...may be"; "benzer temel parçalardan oluşur" → "made up of similar basic components"'},
            {q:'Naturally, you\'re very upset about what\'s happened, but now we must focus on what we can do from now on.',
             opts:['Seni bu kadar çok üzen şeyin ne olduğuna değil, bundan sonra ne yapabileceğimiz konusuna yoğunlaşmaya çalışıyorum.','Olanlar konusunda çok üzülmen doğal, ama şimdi asıl düşünmemiz gereken bundan sonra ne yapacağımızdır.','Bütün bu olan bitenlerden sonra çok üzülmeni doğal karşılıyorum, ancak artık yapılabilecekler üzerine yoğunlaşalım.','Doğal olarak, olanlar konusunda çok üzgünsün, ama artık bundan sonra ne yapabileceğimiz üzerine yoğunlaşmalıyız.','Olanlar karşısında bu kadar çok üzülmeni doğal bulsam da, artık bundan sonra ne yapabileceğini düşünmen gerektiğine inanıyorum.'],
             cor:'d', hint:'"Naturally...very upset" → "Doğal olarak...çok üzgünsün"; "we must focus on" → "yoğunlaşmalıyız"'},
            {q:'As a helicopter has no wing to stay in the air, its rotating blades provide lift and movement through the air.',
             opts:['Helikopterin havalanması, havada durması ve hareketi dönen pervanesince sağlanmaktadır çünkü tüm bunları yapmaya yarayan kanatları yoktur.','Helikopterin kanatları olmadığından, havalanmasını, havada durmasını ve hareketini sağlayan dönen pervanesidir.','Helikopterin havada kalmasını sağlayacak kanatları yoktur; bu yüzden havalanması ve havadaki hareketi döner pervanesi tarafından sağlanır.','Helikopterin havalanmasını ve hareketini sağlayan pervanesi, onun kanatları olmadığı için havada durmasını da sağlamaktadır.','Helikopterin havada durması için kanatları olmadığından, havalanmasını ve havada hareketini dönen pervanesi sağlar.'],
             cor:'c', hint:'"has no wing to stay in the air" → "havada kalmasını sağlayacak kanatları yoktur"; "provide lift and movement" → "havalanması ve hareketi sağlanır"'},
            {q:'It\'s known that, though the author attained fame and wealth in the later years of his career, he suffered great poverty in the earlier years.',
             opts:['Yazar, kariyerinin ileriki yıllarında şöhreti ve parayı yakaladıysa da, ilk yıllarında büyük yoksulluk çektiği bilinmektedir.','İlk yıllarını büyük yoksulluk içinde geçirdiği bilinen yazar, kariyerinin ileriki yıllarında şöhrete ve paraya kavuşmuştur.','Şöhreti ve parayı ancak kariyerinin ileriki yıllarında yakalayabilen yazarın ilk yıllarında büyük sıkıntı çektiği bilinmekteydi.','Yazar, kariyerinin son yıllarında şöhrete ve paraya kavuşmuştur, ancak ilk yıllarında yaşadığı büyük yoksulluğu herkes bilir.','Bilindiği gibi yazar, kariyerinin ilk yıllarında büyük yoksulluk çektiyse de ileriki yıllarında şöhreti ve parayı yakalamıştır.'],
             cor:'a', hint:'"It\'s known that, though...attained fame...he suffered poverty" → "bilinmektedir; yakaladıysa da, çektiği"'},
            {q:'When I last met her, she appeared still very angry and said that she would never forgive him.',
             opts:['Onu en son görüşümde, hala çok öfkeliydi ve onu kesinlikle bağışlamadığından söz ediyordu.','Onunla son karşılaştığımda, hala çok öfkeli görünüyordu ve onu asla affetmeyeceğini söylüyordu.','En son görüştüğümüzde, çok öfkeliydi ve onu hala affetmemiş görünüyordu.','Onu son gördüğümde, hala çok öfkeli olduğundan ve onu asla bağışlamayacağından söz ediyordu.','En son karşılaştığımızda ona karşı hala çok öfkeliydi ve onu hiçbir zaman affetmeyecek gibi görünüyordu.'],
             cor:'b', hint:'"appeared still very angry" → "hala çok öfkeli görünüyordu"; "would never forgive" → "asla affetmeyeceğini söylüyordu"'},
            {q:'Because the part of the brain involved in memory is also involved in emotions, it is not surprising that emotions can affect a person\'s memory.',
             opts:['Beynin hafızayla ilgili bölümünün duygularla da ilişkisi olabileceği için, kişinin hafızasının duygular tarafından etkilenmesi şaşırtıcı değildir.','Duyguların kişinin hafızasını etkilemesine şaşmamak gerekir; çünkü beynin hafızayla ilgili bölümü duygularla da bağlantılı olabilir.','Beynin hafıza ile ilgili bölümü duygularla da ilgili olduğu için, duyguların kişinin hafızasını etkileyebilmesi şaşırtıcı değildir.','Kişinin hafızasının duyguları etkileyebilmesi şaşırtıcı değildir; çünkü beyindeki hafıza ile ilgili bölüm duygularla da ilişki içindedir.','Beynin hafıza ile ilgili bölümünün duygularla ilgisi bilindiği için, duyguların kişinin hafızasını etkilemesine şaşırmamak gerekir.'],
             cor:'c', hint:'"Because...memory is also involved in emotions" → "duygularla da ilgili olduğu için"; "not surprising" → "şaşırtıcı değildir"'},
        ]
    },
    {
        label: 'Set 15',
        questions: [
            {q:'Hükümet vakit geçirmeden bir şeyler yapmalı; çünkü bölgedeki insanlar için barınma sorunu katlanılmaz bir hal aldı.',
             opts:['Residents who are finding the problem of accommodation intolerable are demanding that the government should act without delay.','Problems of accommodation have become intolerable for the people in the area, but the government is delaying doing anything about it.','It is vital that the government should act without delay to solve the problems of accommodation as the situation is becoming intolerable.','The government must do something without delay as the problem of accommodation has become intolerable for the people in the area.','The government made a speedy response to the problem of accommodation in the area, which had developed to intolerable levels.'],
             cor:'d', hint:'"vakit geçirmeden yapmalı" → "must do...without delay"; "katlanılmaz" → "intolerable"'},
            {q:'Aynı anda bu kadar çok orman yangınının çıkması, yangınların nedenleri konusunda kuşku uyandırdı.',
             opts:['Police were suspicious about the causes of the forest fires, particularly because they had ignited simultaneously.','Suspicion arose regarding the cause of the fires when several forest fires broke out around the same time.','The fact that so many forest fires broke out simultaneously aroused suspicion as to the causes of the fires.','They were treating the circumstances surrounding the outbreak of forest fires as suspicious because several fires started at the same time.','Because several fires ignited in the forest at the same time, the police believe that the circumstances are suspicious.'],
             cor:'c', hint:'"Bu kadar çok...çıkması" → "The fact that so many...broke out"; "kuşku uyandırdı" → "aroused suspicion"'},
            {q:'İki yıldır aynı şirkette çalışıp birbirimizle hiç karşılaşmamamız çok tuhaf.',
             opts:['It\'s very strange that we\'ve been working in the same company for two years and have never met each other.','It is funny that we could have been working in the same company for two years, but had not actually met each other.','We have been working for the same company for two years, but, strangely, have only just met each other.','It\'s quite odd that we managed to work for the same company for two years without ever meeting each other.','It\'s rather strange that we worked in the same factory for two years before meeting each other.'],
             cor:'a', hint:'"çok tuhaf" → "very strange"; "iki yıldır...hiç karşılaşmamamız" → "have been working...never met"'},
            {q:'Senin sınavlardaki hatan, soruları yanıtlamaya başlamadan önce açıklamaları dikkatle okumamandır.',
             opts:['You make so many mistakes in exams because you don\'t read the questions properly before you start answering them.','Where you go wrong in exams is that you don\'t read instructions carefully before you start answering the questions.','You would do better in exams if you read the instructions carefully before you started to answer the questions.','Your mistake in the exam is to start answering the questions before you read all the instructions carefully.','Your biggest mistake about exams is that you start answering the questions before you read the instructions thoroughly.'],
             cor:'b', hint:'"Senin hatan" → "Where you go wrong"; "okumamandır" → "you don\'t read"'},
            {q:'Doğum günü hediyesi olarak ona almayı düşündüğüm bluzun aynısını almış olması ne büyük tesadüf değil mi?',
             opts:['Wouldn\'t it have been a disaster if I had bought her that blouse for her birthday as she already has an identical one?','Coincidentally, she bought exactly the same blouse I was thinking of buying her as a birthday present.','What a mistake it would have been to buy her the blouse as a birthday present as she has just bought an identical one.','She was wearing the same blouse as I had bought her as a birthday present, which was a very unfortunate coincidence.','What a big coincidence it is that she bought exactly the same blouse I was thinking of buying her as a birthday present, isn\'t it?'],
             cor:'e', hint:'"ne büyük tesadüf değil mi?" → "What a big coincidence...isn\'t it?"'},
            {q:'As there were four of us, it was more economical to buy a group ticket.',
             opts:['We knew that four people could travel on a group ticket, which would be more cost effective.','We purchased a group ticket because, being four of us, it worked out cheaper that way.','I saved some money by buying a ticket which is valid for four visits.','All four of us should buy a season ticket in order to save money.','A group ticket is designed for four people to use, so it is very economical.'],
             cor:'b', hint:'"As there were four of us" → "being four of us"; "more economical" → "worked out cheaper"'},
            {q:'I had no idea what to buy my sister for her birthday, so I asked my mother for her suggestion.',
             opts:['My mother had no suggestions about what I should buy for my sister\'s birthday, so I don\'t know what I\'m going to get.','Having no idea what to buy my sister for her birthday, I asked my mother to buy something for me.','I asked my mother what she thought would make a nice present for my sister\'s birthday, as I couldn\'t think of anything.','I didn\'t know what I should get as a birthday present for my sister, but, luckily, my mother gave me some useful ideas.','I never know what to get my sister for her birthday, but my mother usually gives me a suggestion.'],
             cor:'c', hint:'"I had no idea" → "couldn\'t think of anything"; "asked for her suggestion" → "asked my mother what she thought"'},
            {q:'They maintain that this issue will be discussed at the forthcoming council meeting.',
             opts:['Their claim was that this matter had already been discussed at the previous council meeting.','They claimed that they were going to discuss this matter at the council meeting, but they didn\'t.','It is necessary that this topic should form the focus of the discussion at the next council meeting.','They asserted that there was a need for this topic to be discussed at the impending council meeting.','They claim that there will be a discussion about this topic at the next meeting of the council.'],
             cor:'e', hint:'"maintain that" = "claim that" (öne sürmek); "forthcoming" = "next" (yaklaşan)'},
            {q:'We were a little disappointed to find that the mayor himself had not attended the award ceremony.',
             opts:['The fact that the mayor was not present in person at the award ceremony disappointed us a little.','The mayor had promised to attend the award presentations, but he was unable to in the end.','What disappointed us most about the ceremony was that the awards were not presented by the mayor himself.','As we expected, the mayor didn\'t attend the award ceremony, which did not disappoint us at all.','By not going to the ceremony, the mayor disappointed both the audience and the award winners.'],
             cor:'a', hint:'"a little disappointed to find that...had not attended" → "The fact that...was not present...disappointed us a little"'},
            {q:'It took a long time for us to find the answer to what had seemed a simple question.',
             opts:['Sometimes the simplest questions take the longest time for us to answer.','It took them quite a long time to think of an answer to the simple question we asked them.','We spent some time looking for an answer until we realised how simple the question actually was.','It appears to be a very simple question, but people have been trying to answer it for a long time.','We spent a lot of time looking for an answer even though we had considered the question to be an easy one.'],
             cor:'e', hint:'"took a long time...what had seemed a simple question" → "spent a lot of time...even though we had considered the question...easy"'},
        ]
    },
];

var _ncSetIdx     = 0;
var _ncSetScore   = 0;
var _ncSetChecked = {};
var _ncSetAnswers = {};

function ncExercises() {
    _ncSetIdx = 0; _ncSetScore = 0; _ncSetChecked = {}; _ncSetAnswers = {};
    return _ncBuildExercisePage();
}

function _ncBuildExercisePage() {
    var set   = NC_SETS[_ncSetIdx];
    var total = set.questions.length;

    var tabs = NC_SETS.map(function(s, i) {
        var active = i === _ncSetIdx
            ? 'style="background:#b45309;color:#fff;border-color:#b45309;"' : '';
        return '<button class="gr-set-tab" ' + active + ' onclick="ncSwitchSet(' + i + ')">' + s.label + '</button>';
    }).join('');

    var qCards = set.questions.map(function(q, i) {
        var opts = q.opts.map(function(o, j) {
            var letter = ['A','B','C','D','E'][j];
            var lv     = ['a','b','c','d','e'][j];
            var state  = _ncSetAnswers[_ncSetIdx + '_' + i];
            var cls = 'gr-opt';
            if (_ncSetChecked[_ncSetIdx + '_' + i]) {
                if (lv === q.cor)                         cls += ' ok';
                else if (lv === state && state !== q.cor) cls += ' bad';
            } else if (state === lv) cls += ' sel';
            return '<div class="' + cls + '" id="ncso-' + i + '-' + j + '" onclick="ncSetOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o
                + '</div>';
        }).join('');

        var checked = _ncSetChecked[_ncSetIdx + '_' + i];
        var fbCls   = checked ? (checked === 'ok' ? 'gr-fb show ok' : 'gr-fb show bad') : 'gr-fb';
        var fbTxt   = checked === 'ok'  ? ('✅ Doğru! ' + q.hint)
                    : checked === 'bad' ? ('❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + ' — ' + q.hint) : '';
        var cardCls = checked === 'ok' ? 'gr-q-card gr-c' : checked === 'bad' ? 'gr-q-card gr-w' : 'gr-q-card';
        var btnDis  = checked ? 'disabled style="opacity:.4;pointer-events:none;"' : '';

        return '<div class="' + cardCls + '" id="ncsc-' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' — ' + set.label.toUpperCase() + '</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#b45309;color:#b45309" onclick="ncCheckSetQ(' + i + ')" ' + btnDis + '>Kontrol Et</button>'
            + '<div class="' + fbCls + '" id="ncsfb-' + i + '">' + fbTxt + '</div>'
            + '</div>';
    }).join('');

    return ncH('✨ Pratik Yap', 'Alıştırmalar', NC_SETS.length + ' set × 10 soru — gerçek YDT soruları')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-set-tabs">' + tabs + '</div>'
        + '<div class="gr-score-bar">'
        + '<span class="gr-score-label">' + set.label + ' Puanı</span>'
        + '<span class="gr-score-val" id="nc-live-score">' + _ncSetScore + ' / ' + total + '</span>'
        + '</div>'
        + qCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#b45309,#f59e0b)" onclick="ncSubmitSet()">🎯 Seti Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="nc-result">'
        + '<div class="gr-res-score" id="nc-res-score" style="color:#b45309">0/' + total + '</div>'
        + '<div class="gr-res-lbl">' + set.label + ' Tamamlandı</div>'
        + '<div class="gr-res-msg" id="nc-res-msg"></div>'
        + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px">'
        + '<button class="gr-retry-btn" style="border-color:#b45309;color:#b45309" onclick="ncRetrySameSet()">🔄 Aynı Seti Tekrar</button>'
        + (_ncSetIdx < NC_SETS.length - 1
            ? '<button class="gr-retry-btn" style="background:#b45309;color:#fff;border-color:#b45309" onclick="ncNextSet()">Sonraki Set →</button>'
            : '<span style="font-size:.8rem;color:var(--ink3);align-self:center">🏁 Tüm setler tamamlandı!</span>')
        + '</div>'
        + '</div></div>';
}

function ncSwitchSet(idx) {
    _ncSetIdx = idx; _ncSetScore = 0; _ncSetChecked = {}; _ncSetAnswers = {};
    var cnt = document.getElementById('nc-content');
    if (cnt) { cnt.innerHTML = _ncBuildExercisePage(); cnt.scrollTop = 0; }
}

function ncSetOpt(qi, oi, letter) {
    if (_ncSetChecked[_ncSetIdx + '_' + qi]) return;
    NC_SETS[_ncSetIdx].questions[qi].opts.forEach(function(_, j) {
        var el = document.getElementById('ncso-' + qi + '-' + j);
        if (el) el.className = 'gr-opt' + (j === oi ? ' sel' : '');
    });
    _ncSetAnswers[_ncSetIdx + '_' + qi] = letter;
}

function ncCheckSetQ(qi) {
    var q    = NC_SETS[_ncSetIdx].questions[qi];
    var sel  = _ncSetAnswers[_ncSetIdx + '_' + qi];
    var fb   = document.getElementById('ncsfb-' + qi);
    var card = document.getElementById('ncsc-' + qi);
    if (!fb) return;
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    var letters = ['a','b','c','d','e'];
    q.opts.forEach(function(_, j) {
        var el = document.getElementById('ncso-' + qi + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor)                     el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    var btn = card ? card.querySelector('.gr-chk-btn') : null;
    if (btn) { btn.disabled = true; btn.style.opacity = '.4'; btn.style.pointerEvents = 'none'; }
    if (sel === q.cor) {
        if (card) card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        _ncSetChecked[_ncSetIdx + '_' + qi] = 'ok';
        _ncSetScore++;
    } else {
        if (card) card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + ' — ' + q.hint;
        fb.className = 'gr-fb show bad';
        _ncSetChecked[_ncSetIdx + '_' + qi] = 'bad';
    }
    var el = document.getElementById('nc-live-score');
    if (el) el.textContent = _ncSetScore + ' / ' + NC_SETS[_ncSetIdx].questions.length;
}

function ncSubmitSet() {
    var total = NC_SETS[_ncSetIdx].questions.length;
    var panel = document.getElementById('nc-result');
    if (!panel) return;
    panel.classList.add('show');
    document.getElementById('nc-res-score').textContent = _ncSetScore + '/' + total;
    var pct = Math.round((_ncSetScore / total) * 100);
    document.getElementById('nc-res-msg').textContent =
        pct >= 90 ? '🎉 Mükemmel! Bu seti harika geçirdin!'
      : pct >= 70 ? '👏 Çok iyi! Küçük eksikler var.'
      : pct >= 50 ? '📚 Orta düzey. Eksik konulara geri dön.'
      :             '💪 Daha fazla pratik gerekiyor!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ncRetrySameSet() { ncSwitchSet(_ncSetIdx); }
function ncNextSet()      { if (_ncSetIdx < NC_SETS.length - 1) ncSwitchSet(_ncSetIdx + 1); }

/* ════════ GLOBALS ════════ */
window.openNounSection  = openNounSection;
window._ncRenderSection = _ncRenderSection;
window.ncSwitchSet      = ncSwitchSet;
window.ncSetOpt         = ncSetOpt;
window.ncCheckSetQ      = ncCheckSetQ;
window.ncSubmitSet      = ncSubmitSet;
window.ncRetrySameSet   = ncRetrySameSet;
window.ncNextSet        = ncNextSet;

/* ════════ EXERCISES ════════ */
var NC_BLANKS = [
    {q:'___ the Earth orbits the Sun is a well-known scientific truth.',
     ans:['that','the fact that'], hint:'"That" veya "The fact that" özne konumunda'},
    {q:'Everyone hopes ___ the pandemic will end as soon as possible.',
     ans:['that',''], hint:'Nesne konumunda "that" atılabilir'},
    {q:'I don\'t know ___ she will come or not.',
     ans:['if','whether'], hint:'"-ip/-madığını" → if / whether'},
    {q:'___ people have a good future is a matter of curiosity. (Subject)',
     ans:['whether','whether or not'], hint:'Özne konumunda "if" kullanılamaz → whether'},
    {q:'I cannot decide ___ I should give as a gift to my best friend.',
     ans:['what'], hint:'WH-question noun clause → what (ne)'},
    {q:'Scientists suggest that you (should) regularly ___ to stay healthy. (subjunctive)',
     ans:['exercise'], hint:'Subjunctive: V₁ yalın hali'},
    {q:'She said that she ___ already woken up early when I called her.',
     ans:['had'], hint:'Reported speech: Simple Past → Past Perfect (had + V₃)'},
];

var NC_MCQS = [
    {q:'My sister is proud ___ the fact that she graduated with honors.',
     opts:['that','of','in','about'],
     cor:'b', hint:'Preposition + "the fact that" (preposition\'dan sonra "that" gelmez)'},
    {q:'Most people are interested ___ whether they have a good future.',
     opts:['for','about','in','of'],
     cor:'c', hint:'interested in + whether (preposition sonrası "if" değil "whether")'},
    {q:'"___ you say won\'t change anything." (Ever Words)',
     opts:['Whatever','Whoever','Whenever','However'],
     cor:'a', hint:'"Hangisi olursa olsun" → whatever'},
    {q:'He demanded that the report ___ submitted right away. (Subjunctive)',
     opts:['is','was','be','were'],
     cor:'c', hint:'Subjunctive passive: be + V₃'},
    {q:'She said, "I am walking to the library." → She said that she ___ to the library.',
     opts:['is walking','was walking','had walked','walked'],
     cor:'b', hint:'Present Continuous → Past Continuous (backshift)'},
    {q:'She said, "I will make a cake." → She said that she ___ a cake.',
     opts:['will make','would make','had made','made'],
     cor:'b', hint:'will → would (backshift)'},
    {q:'___ arrives first should ventilate the room.',
     opts:['Whatever','Whoever','Whomever','However'],
     cor:'b', hint:'"Kim olursa olsun" + sadece özne konumunda → whoever'},
    {q:'I didn\'t understand ___ our teacher solved the problem.',
     opts:['what','why','how','which'],
     cor:'c', hint:'"nasıl" → how (WH-question noun clause)'},
];

// Eski boşluk doldurma/MCQ fonksiyonları Set sistemiyle değiştirildi.
