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

function ncExercises() {
    var blankCards = NC_BLANKS.map(function(q, i) {
        return '<div class="gr-q-card" id="ncq-b'+i+'">'
            +'<div class="gr-q-num">SORU '+String(i+1).padStart(2,'0')+' / BÖLÜM A</div>'
            +'<div class="gr-q-text">'+q.q+'</div>'
            +'<input class="gr-q-inp nc-inp" id="nc-inp-'+i+'" placeholder="doğru yapıyı yaz…" autocomplete="off"><br>'
            +'<button class="gr-chk-btn" style="border-color:#b45309;color:#b45309" onclick="ncCheckBlank('+i+')">Kontrol Et</button>'
            +'<div class="gr-fb" id="nc-fb-b'+i+'"></div>'
            +'</div>';
    }).join('');

    var mcqCards = NC_MCQS.map(function(q, i) {
        var opts = q.opts.map(function(o, j) {
            var letter = ['A','B','C','D'][j];
            var lv = ['a','b','c','d'][j];
            return '<div class="gr-opt" id="nc-opt-'+i+'-'+j+'" onclick="ncSelectOpt('+i+','+j+',\''+lv+'\')"><span class="gr-opt-letter">'+letter+'</span>'+o+'</div>';
        }).join('');
        return '<div class="gr-q-card" id="ncq-m'+i+'">'
            +'<div class="gr-q-num">SORU '+String(i+1).padStart(2,'0')+' / BÖLÜM B</div>'
            +'<div class="gr-q-text">'+q.q+'</div>'
            +'<div class="gr-mcq">'+opts+'</div>'
            +'<button class="gr-chk-btn" style="margin-top:10px;border-color:#b45309;color:#b45309" onclick="ncCheckMCQ('+i+')">Kontrol Et</button>'
            +'<div class="gr-fb" id="nc-fb-m'+i+'"></div>'
            +'</div>';
    }).join('');

    return ncH('✨ Pratik Yap','Alıştırmalar',NC_TOTAL+' soruluk interaktif test. Noun Clauses ve Reported Speech pekiştirme.')
        +'<div class="gr-quiz-wrap">'
        +'<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="nc-live-score">0 / '+NC_TOTAL+'</span></div>'
        +'<div class="gr-q-sec-hd">Bölüm A — Boşluk Doldurma</div>'
        +blankCards
        +'<div class="gr-q-sec-hd" style="margin-top:20px">Bölüm B — Çoktan Seçmeli</div>'
        +mcqCards
        +'<button class="gr-submit-btn" style="background:linear-gradient(135deg,#b45309,#f59e0b)" onclick="ncSubmitAll()">🎯 Tümünü Değerlendir & Sonucu Gör</button>'
        +'<div class="gr-result" id="nc-result">'
        +'<div class="gr-res-score" id="nc-res-score" style="color:#b45309">0/'+NC_TOTAL+'</div>'
        +'<div class="gr-res-lbl">Toplam Puan</div>'
        +'<div class="gr-res-msg" id="nc-res-msg"></div>'
        +'<button class="gr-retry-btn" style="border-color:#b45309;color:#b45309" onclick="_ncRenderSection(\'exercises\')">🔄 Tekrar Dene</button>'
        +'</div></div>';
}

/* ════════ EXERCISE LOGIC ════════ */
function _ncUpdScore() {
    var el = document.getElementById('nc-live-score');
    if (el) el.textContent = _ncScore + ' / ' + NC_TOTAL;

    if (typeof saveGrammarScore === 'function') saveGrammarScore('nc', _ncScore);
}

function ncCheckBlank(i) {
    var inp  = document.getElementById('nc-inp-'+i);
    var fb   = document.getElementById('nc-fb-b'+i);
    var card = document.getElementById('ncq-b'+i);
    if (!inp || !fb) return;
    var val = inp.value.trim().toLowerCase().replace(/\s+/g,' ');
    if (!val) { fb.textContent='Bir cevap girin!'; fb.className='gr-fb show bad'; return; }
    var correct = NC_BLANKS[i].ans.map(function(a){ return a.toLowerCase(); });
    if (correct.indexOf(val) !== -1) {
        inp.classList.add('ok'); card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + NC_BLANKS[i].ans[0];
        fb.className = 'gr-fb show ok';
        if (!_ncChecked['b'+i]) { _ncScore++; _ncChecked['b'+i]=true; _ncUpdScore(); }
    } else {
        inp.classList.add('bad'); card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + NC_BLANKS[i].ans[0] + ' — ' + NC_BLANKS[i].hint;
        fb.className = 'gr-fb show bad';
        if (!_ncChecked['b'+i]) _ncChecked['b'+i]='wrong';
    }
}

function ncSelectOpt(qi, oi, letter) {
    NC_MCQS[qi].opts.forEach(function(_, j) {
        var el = document.getElementById('nc-opt-'+qi+'-'+j);
        if (el) el.classList.remove('sel');
    });
    var el = document.getElementById('nc-opt-'+qi+'-'+oi);
    if (el) el.classList.add('sel');
    _ncAnswers['m'+qi] = letter;
}

function ncCheckMCQ(i) {
    var q    = NC_MCQS[i];
    var sel  = _ncAnswers['m'+i];
    var fb   = document.getElementById('nc-fb-m'+i);
    var card = document.getElementById('ncq-m'+i);
    if (!sel) { fb.textContent='Bir seçenek seçin!'; fb.className='gr-fb show bad'; return; }
    var letters = ['a','b','c','d'];
    q.opts.forEach(function(_, j) {
        var el = document.getElementById('nc-opt-'+i+'-'+j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_ncChecked['m'+i]) { _ncScore++; _ncChecked['m'+i]=true; _ncUpdScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_ncChecked['m'+i]) _ncChecked['m'+i]='wrong';
    }
}

function ncSubmitAll() {
    var panel   = document.getElementById('nc-result');
    var scoreEl = document.getElementById('nc-res-score');
    var msgEl   = document.getElementById('nc-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _ncScore+'/'+NC_TOTAL;
    var pct = Math.round((_ncScore/NC_TOTAL)*100);
    msgEl.textContent = pct>=87 ? '🎉 Mükemmel! Noun Clauses ve Reported Speech konularına tam hâkimsin!'
                      : pct>=65 ? '👏 Çok iyi! Subjunctive yapılar ve tense backshift\'i biraz daha tekrar et.'
                      : pct>=45 ? '📚 İyi başlangıç. That/Whether farkına ve tense değişim tablosuna tekrar bak!'
                      : '💪 Daha fazla pratik yapalım. Genel bakış kartlarından başla!';
    panel.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ════════ GLOBALS ════════ */
window.openNounSection = openNounSection;
window._ncRenderSection = _ncRenderSection;
window.ncCheckBlank    = ncCheckBlank;
window.ncSelectOpt     = ncSelectOpt;
window.ncCheckMCQ      = ncCheckMCQ;
window.ncSubmitAll     = ncSubmitAll;
