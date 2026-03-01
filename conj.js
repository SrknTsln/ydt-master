// ════════════════════════════════════════════════════════════════
// conj.js  —  Adverbial Clauses, Conjunctions & Transitions
// YDT Master Pro
// Kaynak: 10da10 YDT Adverbial Clauses notları (s. 60–74)
// ════════════════════════════════════════════════════════════════

var _cjCurrentSection = 'overview';
var _cjAnswers = {};
var _cjChecked = {};
var _cjScore = 0;
var CJ_TOTAL = 18;

var CJ_SECTIONS = [
    { id: 'overview',       label: 'Genel Bakış',              grp: 'Genel' },
    { id: 'coordinating',   label: 'Coordinating (FANTBOYS)',   grp: 'Coordination' },
    { id: 'correlative',    label: 'Correlative Conjunctions',  grp: 'Coordination' },
    { id: 'cause',          label: 'Cause — Sebep Bağlaçları',  grp: 'Subordinating' },
    { id: 'result',         label: 'Result — Sonuç Bağlaçları', grp: 'Subordinating' },
    { id: 'purpose',        label: 'Purpose — Amaç Bağlaçları', grp: 'Subordinating' },
    { id: 'contrast',       label: 'Contrast — Zıtlık',         grp: 'Subordinating' },
    { id: 'time',           label: 'Time — Zaman Bağlaçları',   grp: 'Subordinating' },
    { id: 'addition',       label: 'Addition — Ekleme',         grp: 'Transitions' },
    { id: 'reduction',      label: 'Reduction — Kısaltma',      grp: 'Özel' },
    { id: 'gerund',         label: 'Gerund & Infinitives',      grp: 'Özel' },
    { id: 'exercises',      label: 'Alıştırmalar',              grp: 'Özel' }
];

var CJ_DOT = {
    'Genel':          '#6366f1',
    'Coordination':   '#0369a1',
    'Subordinating':  '#16a34a',
    'Transitions':    '#d97706',
    'Özel':           '#e63946'
};

/* ════════ ENTRY POINT ════════ */
function openConjSection(sectionId) {
    _cjCurrentSection = sectionId || 'overview';
    document.querySelectorAll('.container').forEach(function(c){ c.classList.add('hidden'); });
    document.querySelectorAll('.arsiv-full-page').forEach(function(c){ c.classList.add('hidden'); });
    var page = document.getElementById('conj-page');
    if (page) page.classList.remove('hidden');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(function(el){ el.classList.remove('active'); });
    var sb = document.getElementById('sb-grammar-conj');
    if (sb) sb.classList.add('active');
    var di = document.getElementById('di-grammar-conj');
    if (di) di.classList.add('active');
    _cjRenderPage();
}

function _cjRenderPage() {
    var page = document.getElementById('conj-page');
    if (!page) return;
    page.innerHTML =
        '<div class="gr-topbar">'
        + '<button class="gr-back-btn" onclick="navTo(\'index-page\')">←</button>'
        + '<div><div class="gr-topbar-label">Grammar Modülü</div>'
        + '<div class="gr-topbar-title">Adverbial Clauses &amp; Conjunctions</div></div>'
        + '</div>'
        + '<div class="gr-body">'
        + '<nav class="gr-sidenav" id="cj-sidenav"></nav>'
        + '<div class="gr-content" id="cj-content"></div>'
        + '</div>';
    _cjBuildSidenav();
    _cjRenderSection(_cjCurrentSection);
}

function _cjBuildSidenav() {
    var nav = document.getElementById('cj-sidenav');
    if (!nav) return;
    var groups = {};
    CJ_SECTIONS.forEach(function(s) {
        if (!groups[s.grp]) groups[s.grp] = [];
        groups[s.grp].push(s);
    });
    var html = '';
    ['Genel','Coordination','Subordinating','Transitions','Özel'].forEach(function(grp) {
        var list = groups[grp];
        if (!list) return;
        html += '<div class="gr-sn-sec">' + grp + '</div>';
        list.forEach(function(s) {
            var active = s.id === _cjCurrentSection ? ' active' : '';
            html += '<button class="gr-sn-btn' + active + '" onclick="_cjRenderSection(\'' + s.id + '\')">'
                + '<span class="gr-sn-dot" style="background:' + CJ_DOT[grp] + '"></span>' + s.label + '</button>';
        });
    });
    nav.innerHTML = html;
}

function _cjRenderSection(id) {
    _cjCurrentSection = id;
    _cjBuildSidenav();
    var content = document.getElementById('cj-content');
    if (!content) return;
    content.scrollTop = 0;
    var map = {
        'overview':     cjOverview,
        'coordinating': cjCoordinating,
        'correlative':  cjCorrelative,
        'cause':        cjCause,
        'result':       cjResult,
        'purpose':      cjPurpose,
        'contrast':     cjContrast,
        'time':         cjTime,
        'addition':     cjAddition,
        'reduction':    cjReduction,
        'gerund':       cjGerund,
        'exercises':    cjExercises
    };
    var fn = map[id];
    content.innerHTML = fn ? fn() : '<div style="padding:40px">Yakında...</div>';
    if (id === 'exercises') {
        _cjScore = 0; _cjAnswers = {}; _cjChecked = {};
        _cjUpdScore();
        document.querySelectorAll('.cj-inp').forEach(function(inp, i) {
            inp.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); cjCheckBlank(i); }
            });
        });
    }
}

/* ════════ HELPERS ════════ */
function cjH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#064e3b 0%,#16a34a 60%,#4ade80 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function cjSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function cjTable(headers, rows) {
    var ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    var trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function cjAcc(items) {
    var cards = items.map(function(it) {
        var exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #16a34a"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        var noteHtml = (it.notes||[]).map(function(n){
            return '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:.8rem;color:#14532d;line-height:1.7">'
                + n + '</div>';
        }).join('');
        var descHtml = it.desc ? '<p class="gr-acc-desc">' + it.desc + '</p>' : '';
        return '<div class="gr-acc" onclick="this.classList.toggle(\'open\')">'
            + '<div class="gr-acc-head">'
            + '<div class="gr-acc-ico" style="background:' + it.bg + '">' + it.ico + '</div>'
            + '<div class="gr-acc-title">' + it.title + '</div>'
            + '<div class="gr-acc-chev">⌄</div>'
            + '</div>'
            + '<div class="gr-acc-body">' + descHtml + noteHtml + '<div class="gr-ex-list">' + exHtml + '</div></div>'
            + '</div>';
    }).join('');
    return '<div class="gr-acc-wrap">' + cards + '</div>';
}

function cjBox(color, title, lines) {
    var styles = {
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239',
        orange: 'background:#fff7ed;border:2px solid #ea580c;color:#7c2d12'
    };
    var content = lines.map(function(l){
        return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>';
    }).join('');
    return '<div style="' + (styles[color]||styles.sky) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 8px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

function cjPill(label, color) {
    var bg = color || '#16a34a';
    return '<span style="display:inline-block;background:' + bg + ';color:#fff;border-radius:20px;padding:2px 12px;font-size:.75rem;font-weight:700;margin:2px 4px 2px 0;">' + label + '</span>';
}

/* ════════ OVERVIEW ════════ */
function cjOverview() {
    var cards = [
        {id:'coordinating', emoji:'🔗', name:'Coordinating',   sub:'FANTBOYS: for, and, nor, then, but, or, yet, so', tc:'#1e3a8a', bc:'#dbeafe', bd:'#93c5fd'},
        {id:'correlative',  emoji:'⚖️', name:'Correlative',    sub:'both…and, not only…but also, neither…nor, either…or', tc:'#4c1d95', bc:'#f5f3ff', bd:'#c4b5fd'},
        {id:'cause',        emoji:'🔵', name:'Cause (Sebep)',   sub:'because, since, as, owing to, due to, thanks to…', tc:'#065f46', bc:'#d1fae5', bd:'#6ee7b7'},
        {id:'result',       emoji:'🟡', name:'Result (Sonuç)', sub:'so…that, such…that, therefore, thus, hence…', tc:'#713f12', bc:'#fef9c3', bd:'#fcd34d'},
        {id:'purpose',      emoji:'🎯', name:'Purpose (Amaç)', sub:'so that, in order that, for fear that, lest, to…', tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74'},
        {id:'contrast',     emoji:'🔀', name:'Contrast (Zıtlık)', sub:'although, despite, however, nevertheless, whereas…', tc:'#4a044e', bc:'#fdf4ff', bd:'#e879f9'},
        {id:'time',         emoji:'⏱️', name:'Time (Zaman)',   sub:'before, after, until, as soon as, no sooner…than…', tc:'#1e3a8a', bc:'#eff6ff', bd:'#bfdbfe'},
        {id:'addition',     emoji:'➕', name:'Addition (Ekleme)', sub:'furthermore, moreover, besides, in addition, as well as…', tc:'#064e3b', bc:'#d1fae5', bd:'#34d399'},
        {id:'reduction',    emoji:'✂️', name:'Reduction (Kısaltma)', sub:'V+ing / having V₃ / being V₃ / having been V₃', tc:'#450a0a', bc:'#fff1f2', bd:'#fca5a5'},
        {id:'gerund',       emoji:'📝', name:'Gerund & Infinitive', sub:'Cümlede isim görevi gören yapılar', tc:'#1e3a8a', bc:'#eff6ff', bd:'#93c5fd'},
    ];

    var cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.bd + ';border-radius:14px;padding:16px;background:' + c.bc + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' onclick="_cjRenderSection(\'' + c.id + '\')">'
            + '<div style="font-size:1.4rem;margin-bottom:8px">' + c.emoji + '</div>'
            + '<div style="font-size:.95rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">' + c.name + '</div>'
            + '<div style="font-size:.73rem;color:' + c.tc + ';line-height:1.5">' + c.sub + '</div>'
            + '</div>';
    }).join('');

    return cjH('🌿 Bağlaçlar & Geçiş İfadeleri', 'Adverbial Clauses & Conjunctions', 'Cümleleri ve yan cümleleri birbirine bağlayan tüm yapılar: koordinasyon, subordinasyon ve geçiş kelimeleri.')
        + cjSH('Hızlı Referans — Tüm Kategoriler')
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;padding:0 36px 20px;">'
        + cardHtml + '</div>'
        + cjBox('green','📌 Temel Ayrım',[
            '<strong>Coordinating Conjunctions</strong> → bağımsız cümleleri bağlar, ortaya gelir.',
            '<strong>Subordinating Conjunctions</strong> → ana ve yan cümleyi bağlar, yan cümle başına gelir.',
            '<strong>Transition Words</strong> → iki cümle arasında anlam köprüsü kurar, noktalama ile ayrılır.',
        ])
        + '<div style="padding:0 36px 36px;text-align:center;margin-top:16px;">'
        + '<button onclick="_cjRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#16a34a,#4ade80);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button>'
        + '</div>';
}

/* ════════ COORDINATING ════════ */
function cjCoordinating() {
    return cjH('🔗 Coordinating Conjunctions', 'FANTBOYS', 'Benzer sözcükleri veya bağımsız cümleleri bağlayan orta bağlaçlar: for, and, nor, then, but, or, yet, so')
        + cjBox('sky','📌 FANTBOYS Açılımı',[
            '<strong>F</strong>or — sebep/çünkü (+ tam cümle SVO, cümle başında kullanılmaz)',
            '<strong>A</strong>nd — ve (olumlu/olumsuz cümleler)',
            '<strong>N</strong>or — ne de (cümleyi olumsuz yapar, ardından devrik yapı)',
            '<strong>T</strong>hen — sonra, o zaman',
            '<strong>B</strong>ut — ama, ancak, fakat',
            '<strong>O</strong>r — veya, yoksa, aksi takdirde',
            '<strong>Y</strong>et — ama, fakat, yine de',
            '<strong>S</strong>o — bu yüzden, bundan dolayı (+ sonuç)',
        ])
        + cjAcc([
            { ico:'📌', bg:'rgba(3,105,161,.1)', title:'FOR — Sebep (çünkü / için)',
              desc:'Bağlaç olarak ardından TAM CÜMLE (SVO) alır. Kendinden önce virgülle ayrılır. Cümle başında kullanılmaz.',
              examples:['They completed their research, <strong>for</strong> they gained the necessary data.'] },
            { ico:'🔗', bg:'rgba(22,163,74,.1)', title:'AND — Ve',
              desc:'"Ve" anlamına gelerek iki cümleyi bağlar. Cümleler olumlu ya da olumsuz olabilir.',
              examples:['We put our original theory to the test, <strong>and</strong> it worked.'] },
            { ico:'🚫', bg:'rgba(220,38,38,.1)', title:'NOR — Ne de',
              desc:'Cümleye "ne de…" anlamı katarak olumsuz yapar. Ve ardından gelen cümle devrik (inversion) yapıda olur.',
              examples:['No one in the class understood the subject, <strong>nor</strong> did I.'] },
            { ico:'⏩', bg:'rgba(217,119,6,.1)', title:'THEN — Sonra / O zaman',
              examples:['First, you have to do your homework, <strong>then</strong> you can go out.'] },
            { ico:'↔️', bg:'rgba(124,58,237,.1)', title:'BUT — Ama / Ancak',
              examples:['Everyone prefers to believe in superstitions, <strong>but</strong> no one explores the reality of them.'] },
            { ico:'❓', bg:'rgba(5,150,105,.1)', title:'OR — Veya / Yoksa',
              examples:[
                  'What would you like to eat? Pizza <strong>or</strong> hamburger?',
                  'You should work hard for your exam, <strong>or</strong> you will not pass your class.'
              ] },
            { ico:'🔄', bg:'rgba(202,138,4,.1)', title:'YET — Ama / Yine de',
              examples:['You are not well with your husband, <strong>yet</strong> you still won\'t break him.'] },
            { ico:'➡️', bg:'rgba(22,163,74,.1)', title:'SO — Bu yüzden / Sonuç',
              examples:['You didn\'t make enough efforts to win the race, <strong>so</strong> you didn\'t deserve it.'] }
        ]);
}

/* ════════ CORRELATIVE ════════ */
function cjCorrelative() {
    return cjH('⚖️ Correlative Conjunctions', 'İkili Bağlaçlar', 'Birbirine paralel, ikili cümleleri bağlarken kullanılır.')
        + cjTable(
            ['Bağlaç', 'Türkçe Anlamı', 'Fiil Uyumu'],
            [
                ['<strong>both … and</strong>', 'hem … hem de', 'Çoğul fiil'],
                ['<strong>not only … but also</strong>', 'sadece o değil, bu da', 'Yüklemeye yakın özne belirler'],
                ['<strong>neither … nor</strong>', 'ne o … ne bu', 'Olumlu fiil, yüklemeye yakın özne'],
                ['<strong>either … or</strong>', 'ya o … ya da bu', 'Olumlu anlam, yüklemeye yakın özne'],
            ]
        )
        + cjAcc([
            { ico:'A', bg:'rgba(22,163,74,.12)', title:'both … and (hem … hem de)',
              desc:'Özne konumunda kullanıldığında fiil çoğul olur. Cümledeki anlam olumludur.',
              examples:['<strong>Both</strong> I <strong>and</strong> my roommate are going to Poland.'] },
            { ico:'B', bg:'rgba(3,105,161,.12)', title:'not only … but also (sadece o değil, bu da)',
              desc:'Cümleye olumsuz anlam katmaz ve olumlu fiillerle kullanılır. Yüklemeye yakın olan özne fiilin tekil ya da çoğul olduğunu belirler.',
              notes:['⭐ "not only / simply / merely / just / solely" şeklinde de kullanılabilir.',
                     '⭐ Cümle başına geldiğinde devrik yapı kurulur: <em>Not only do I enjoy reading books, but I also love watching movies.</em>'],
              examples:[
                  '"Filenin Sultanları" won <strong>not only</strong> the final match <strong>but also</strong> the match in Europe.',
                  '<strong>Not only</strong> do I enjoy reading books, but I also love watching movies.',
              ] },
            { ico:'C', bg:'rgba(124,58,237,.12)', title:'neither … nor (ne o … ne bu)',
              desc:'Cümleye olumsuz anlam katar fakat olumlu fiillerle kullanılır. Yüklemeye yakın olan özne fiilin tekil ya da çoğul olduğunu belirler.',
              examples:['<strong>Neither</strong> mothers <strong>nor</strong> fathers think about the psychology of their children in families dominated by violence.'] },
            { ico:'D', bg:'rgba(217,119,6,.12)', title:'either … or (ya o … ya da bu)',
              desc:'Cümleye genellikle olumlu anlam katar. Olumsuz cümlede kullanıldığında "neither…nor" anlamı katar.',
              examples:['In the War of Independence, the Turkish people would <strong>either</strong> die for the sake of their homeland <strong>or</strong> fight until the last drop.'] }
        ]);
}

/* ════════ CAUSE ════════ */
function cjCause() {
    return cjH('🔵 Adverbial Clauses of Cause', 'Sebep Bağlaçları', 'Ana cümlenin neden / niçin gerçekleştiğini ifade ederken kullanılır. "çünkü, -dığı için" şeklinde çevrilir.')
        + cjSH('A — Subordinating Conjunctions (+ Tam Cümle)')
        + cjBox('green','📌 Bağlaçlar',[
            cjPill('as') + cjPill('since') + cjPill('because') + cjPill('seeing as') + cjPill('seeing that')
            + cjPill('in as much as') + cjPill('on the grounds that') + cjPill('as (so) long as'),
            '',
            '• Ardından <strong>tam cümle (SVO)</strong> alırlar.',
            '• "çünkü, -dığı için" şeklinde çevrilir.',
            '• <strong>now (that)</strong> ifadesi "madem ki" anlamına da gelir (present ifadelerle).',
            '• <strong>as (so) long as</strong> = "madem ki, olduğuna göre, … sürece"',
        ])
        + cjAcc([
            { ico:'🔵', bg:'rgba(3,105,161,.1)', title:'as / since / because / seeing as / seeing that örnekleri',
              examples:[
                  '<strong>As</strong> our employer was feeling ill, he couldn\'t attend the meeting.',
                  'You couldn\'t pass the driving course exam <strong>since / because</strong> you couldn\'t park the car.',
                  'I still have hope for the future, <strong>seeing that / seeing as</strong> life is full of surprises.',
                  'She won the English Language Teaching Department <strong>on the grounds that</strong> she studied hard on the university exam.',
                  'I go abroad with Erasmus+ <strong>in as much as</strong> I have received enough points from the foreign language exam.',
              ] },
            { ico:'💡', bg:'rgba(22,163,74,.1)', title:'now (that) / as (so) long as — Özel Kullanım',
              notes:['<strong>"in that"</strong> ve <strong>"for"</strong> ifadeleri de "çünkü" anlamına gelir fakat cümle başında kullanılamazlar.',
                     '"in that" ayrıca "-mesi bakımından" anlamına da gelmektedir.'],
              examples:[
                  'My husband was late for dinner, <strong>for</strong> he got stuck in traffic.',
                  'I failed the math exam, but it wasn\'t surprising <strong>in that</strong> I didn\'t study at all.',
                  '<strong>As (so) long as</strong> you do not have any money, you cannot visit different cities.',
              ] }
        ])
        + cjSH('B — Prepositional Phrases (+ İsim / Ving)')
        + cjBox('sky','📌 Bağlaçlar',[
            cjPill('because of') + cjPill('due to') + cjPill('owing to') + cjPill('thanks to')
            + cjPill('as a result of') + cjPill('as a consequence of') + cjPill('in view of')
            + cjPill('on the grounds of') + cjPill('on account of'),
            '',
            '• Ardından <strong>noun, noun phrase, pronoun veya V+ing</strong> alırlar.',
            '• "çünkü, -dığı için, -nın yanı sıra, sayesinde, -den dolayı" şeklinde çevrilir.',
            '',
            '⭐ <strong>"due to the fact that" / "because of the fact that" / "on account of the fact that"</strong> ifadeleri ardından cümle alır.',
        ])
        + cjAcc([
            { ico:'📌', bg:'rgba(5,150,105,.1)', title:'Prepositional Phrase Örnekleri',
              examples:[
                  'Şebnem Ferah interrupted the music <strong>because of</strong> the COVID-19.',
                  'Many places flooded <strong>due to</strong> excessive precipitation.',
                  'Kim Kardashian has gained more popularity <strong>owing to / thanks to</strong> her reality TV show "Keeping Up with the Kardashians".',
                  'Many people lost their jobs <strong>as a result of / as a consequence of</strong> the economic downturn.',
                  '<strong>In view of</strong> recent developments in health, we can better help more people.',
                  'He was allowed a leave of absence <strong>on the grounds of</strong> an emergency situation.',
                  'Many places flooded <strong>due to the fact that</strong> there was excessive precipitation.',
              ] }
        ]);
}

/* ════════ RESULT ════════ */
function cjResult() {
    return cjH('🟡 Adverbial Clauses of Result', 'Sonuç Bağlaçları', 'Cümlede neden-sonuç ilişkisi verilmek istendiğinde kullanılır. "o kadar…ki" şeklinde çevrilir.')
        + cjSH('1 — so … that / such … that')
        + cjBox('yellow','📐 Yapı',[
            '• <strong>"so"</strong> ve <strong>"such"</strong> kısmı ile sebebi, <strong>"that"</strong> kısmından sonra ise sonucu anlarız.',
            '• Ardından mutlaka <strong>tam cümle (SVO)</strong> alırlar.',
            '',
            '<strong>so</strong> + adjective / adverb + that + TAM CÜMLE',
            '<strong>so many / few</strong> + plural noun + that + TAM CÜMLE',
            '<strong>so much / little</strong> + uncountable noun + that + TAM CÜMLE',
            '',
            '<strong>such (a/an)</strong> + adjective + noun + that + TAM CÜMLE',
            '<strong>such a few</strong> + plural noun + that + TAM CÜMLE',
            '<strong>such a little / a lot of</strong> + uncountable/plural noun + that',
        ])
        + cjAcc([
            { ico:'🟡', bg:'rgba(202,138,4,.1)', title:'so … that / such … that Örnekleri',
              examples:[
                  'The teachers worked <strong>so</strong> hard for their students <strong>that</strong> now they are all studying at a good university.',
                  'She is <strong>such</strong> a clever girl <strong>that</strong> everyone admires her.',
              ] }
        ])
        + cjSH('2.1 — Transition Words Expressing Result')
        + cjBox('sky','📌 Geçiş Kelimeleri',[
            cjPill('therefore') + cjPill('thus') + cjPill('hence') + cjPill('thereby') + cjPill('so')
            + cjPill('consequently') + cjPill('as a result') + cjPill('that\'s why')
            + cjPill('for this reason') + cjPill('accordingly'),
            '',
            '• "bu sebeple, bu yüzden, bundan dolayı" anlamlarına gelir.',
            '• <strong>"Therefore"</strong> ifadesi cümle içinde yer değiştirip cümle ortasında ya da sonunda kullanılabilir.',
            '• <strong>"Thus / thereby"</strong> ifadeleri ardından tam cümle almasının yanı sıra "V+ing" de alabilir.',
            '• <strong>"Accordingly"</strong> bağlacı cümle ortasında kullanılmak zorundadır — noktalı virgül ve virgül arasına konulur.',
        ])
        + cjAcc([
            { ico:'➡️', bg:'rgba(22,163,74,.1)', title:'Geçiş Kelimesi Örnekleri',
              examples:[
                  'He has been living in America for 15 years. <strong>Therefore / Thus / Hence / Thereby / So</strong>, he can speak English very fluently.',
                  'He has been living in America for 15 years. He <strong>therefore</strong>, can speak English very fluently.',
                  'I studied hard, <strong>thus / thereby</strong> enhancing my wisdom.',
                  'Socrates liked to encourage people to think by asking questions. <strong>Consequently / As a result / That\'s why / For this reason / Accordingly</strong>, he was asking people questions on the streets of Athens.',
              ] }
        ]);
}

/* ════════ PURPOSE ════════ */
function cjPurpose() {
    return cjH('🎯 Adverbial Clauses of Purpose', 'Amaç Bağlaçları', 'Ana cümlede belirtilen eylemin amacını ifade eder. "-sın diye, -sa diye, -mek için" anlamlarına gelir.')
        + cjAcc([
            { ico:'A', bg:'rgba(22,163,74,.12)', title:'so that / in order that (+ Tam Cümle)',
              desc:'Ardından mutlaka tam cümle (SVO) alır. Aralarındaki zaman uyumuna dikkat etmek gerekir. Amaç bildiren "so that" cümle başında da kullanılabilir.',
              examples:[
                  '<strong>So that</strong> I can have a more fit body, I regularly exercise.',
                  'I am trying to improve my English <strong>so that / in order that</strong> I can have an academic career.',
              ] },
            { ico:'B', bg:'rgba(217,119,6,.12)', title:'for fear that / for the purpose that / lest (+ Tam Cümle)',
              desc:'"…korkusu ile" "-mek için, -sın diye" "olmasın diye" anlamlarına gelir. "lest" bağlacı olumlu yapıda kullanılıp olumsuz anlam ifade eder.',
              examples:[
                  'I got all the vaccines <strong>for fear that</strong> I might have COVID-19.',
                  'She got up early <strong>for the purpose that</strong> she could attend the meeting.',
                  'I didn\'t put too much liquid in my luggage <strong>lest</strong> it be confiscated on the plane.',
              ] },
            { ico:'C', bg:'rgba(3,105,161,.12)', title:'so as to / in order to / to + V₁ ("mek için")',
              desc:'Bu bağlaçlar "mek için" anlamına gelir ve ardından daima fiilin yalın halini alır.',
              examples:['I need to obtain a Schengen visa <strong>so as to / in order to / to</strong> go to Europe.'] },
            { ico:'D', bg:'rgba(124,58,237,.12)', title:'with the aim of / with a view to + V+ing',
              desc:'"so that" ve "in order that" yapıları ile benzer anlamdadır fakat ardından V+ing alırlar.',
              examples:['She goes to the library every day <strong>with the aim of / with a view to</strong> being able to study better.'] },
            { ico:'E', bg:'rgba(220,38,38,.12)', title:'for fear of + V+ing',
              examples:['I set out early <strong>for fear of</strong> missing my flight to Poland.'] }
        ]);
}

/* ════════ CONTRAST ════════ */
function cjContrast() {
    return cjH('🔀 Adverbial Clauses of Contrast', 'Zıtlık Bağlaçları', 'Durumlar arasındaki beklenmedik sonuçları belirtirken kullanılır. "-e rağmen, -sa bile" anlamlarına gelir.')
        + cjSH('1 — Subordinating Conjunctions Expressing Contrast')
        + cjAcc([
            { ico:'A', bg:'rgba(124,58,237,.1)', title:'although / though / even though / much as / even if (+ Tam Cümle)',
              desc:'"-e rağmen, -sa bile" anlamlarına gelir ve ardından cümle alırlar. Ana cümleden önce veya sonra kullanılabilir. "though" ifadesi cümle sonunda kullanılırsa "but" anlamına gelir.',
              examples:[
                  '<strong>Although / Though / Even though / Much as / Even if</strong> she had many difficulties in her life, she did not give up.',
                  'Turkey participated in the Eurovision Song Contest until 2012, but it only once won first place. (<strong>Although</strong> Turkey participated…)',
                  'Turkey participated in the Eurovision Song Contest until 2012. It only once won first place, <strong>though</strong>.',
              ] },
            { ico:'B', bg:'rgba(217,119,6,.1)', title:'while / whereas (+ Tam Cümle)',
              desc:'"…iken, -dığı halde, -e rağmen" anlamlarına gelerek bir yan cümle ve bir ana cümle şeklinde kullanılarak iki durum arasında direkt taban tabana zıtlık verir.',
              examples:[
                  '<strong>While / Whereas</strong> Europe had restrictions on art in the Middle Ages, the obstacles to it were removed with the Renaissance.',
                  'There are also very poor people <strong>while / whereas</strong> there are people with high levels of prosperity in the world.',
              ] },
            { ico:'C', bg:'rgba(5,150,105,.1)', title:'No matter + soru kelimesi / however + adjective/adverb',
              desc:'"Her ne kadar … sa da" anlamına gelerek zıtlık belirten ifadelerdir. "no matter who/what/when/where/which" şeklinde kullanılabilir.',
              examples:[
                  '<strong>No matter who</strong> wants you to fail, you should ignore them.',
                  '<strong>No matter where</strong> I go, I always draw attention to myself.',
                  '<strong>However</strong> hard I studied for my presentation, I didn\'t pass it.',
              ] }
        ])
        + cjSH('2 — Name & Prepositional Phrases Expressing Contrast')
        + cjAcc([
            { ico:'A', bg:'rgba(124,58,237,.1)', title:'despite / in spite of / notwithstanding (+ isim / V+ing)',
              desc:'"although" ile aynı anlama gelirler ve ardından noun veya V+ing alırlar. "the fact that" kalıbını aldığında ardından cümle (SVO) alır.',
              notes:['⭐ despite / in spite of <strong>the fact that</strong> + cümle (SVO)'],
              examples:[
                  '<strong>Despite / In spite of / Notwithstanding</strong> Merilyn Monroe\'s hard childhood, she became a popular actress around the world.',
                  '<strong>Despite</strong> being known as wild, some animals, such as lions and tigers, can be trained under favorable conditions.',
                  '<strong>Despite the fact that / In spite of the fact that</strong> Poland experienced an economic crisis after the collapse of the Soviet Union in the past, it experienced economic growth thanks to EU membership.',
              ] },
            { ico:'B', bg:'rgba(3,105,161,.1)', title:'in contrast with-to / contrary to / unlike / regardless of / different from (+ isim)',
              desc:'"…nın aksine, …bakılmaksızın, …den farklı olarak" anlamlarına gelerek ardından "noun" alırlar.',
              examples:[
                  '<strong>In contrast to / Contrary to</strong> what is known, there is no scientific evidence that black cats bring bad luck.',
                  '<strong>Unlike / Different from</strong> my brother, I love eating pizza.',
                  '<strong>Regardless of</strong> how much money he has, he wants to grow his business.',
              ] }
        ])
        + cjSH('3 — Transition Words Expressing Contrast')
        + cjBox('sky','📌 Geçiş Kelimeleri',[
            cjPill('however') + cjPill('nonetheless') + cjPill('nevertheless') + cjPill('even so'),
            '',
            '• "fakat, ancak, yine de, buna rağmen" anlamlarına gelir.',
            '• İki farklı noktalama işareti ile kullanılır ve devamında cümle alır.',
        ])
        + cjAcc([
            { ico:'↔️', bg:'rgba(124,58,237,.1)', title:'however / nonetheless / nevertheless / even so örnekleri',
              examples:[
                  'Our teacher was going to talk about educational sciences last week. <strong>However / Nonetheless / Nevertheless</strong>, he could not do it because of his illness.',
                  'Our teacher was going to talk about educational sciences last week; <strong>however</strong>, he could not do it because of his illness.',
                  'The teacher felt bad going to school and giving lessons. <strong>Even so</strong>, he took medicine and taught the lesson.',
              ] }
        ]);
}

/* ════════ TIME ════════ */
function cjTime() {
    return cjH('⏱️ Adverbial Clauses of Time', 'Zaman Bağlaçları', 'Zaman bağlaçları her zaman zaman uyumu ister. Past ifadelerle past, present ifadelerle present kullanılır.')
        + cjTable(
            ['Türkçe Anlamı','Bağlaçlar'],
            [
                ['-den önce, -e kadar', 'before / until – till / by the time'],
                ['-den sonra, -yapar yapmaz, -dığında', 'after / as soon as – once – the moment when / as / no sooner…than / hardly – barely – scarcely…when'],
            ]
        )
        + cjAcc([
            { ico:'A', bg:'rgba(3,105,161,.1)', title:'Before / After / Since (-den önce / -den sonra / -den beri)',
              examples:[
                  'A significant increase in the world population is expected <strong>before</strong> 2030 arrives.',
                  '<strong>After</strong> M.K. Atatürk founded the republic, he made many innovations in education.',
                  'I have been living in Tekirdağ <strong>since</strong> 2017.',
              ] },
            { ico:'B', bg:'rgba(22,163,74,.1)', title:'Until – Till / By the time (-e kadar)',
              examples:[
                  'I need to change clothes <strong>until / till</strong> the winter season comes.',
                  'Jackson had prepared a romantic dinner <strong>by the time</strong> his wife came.',
              ] },
            { ico:'C', bg:'rgba(217,119,6,.1)', title:'As soon as / Once / The moment / Immediately after (-yapar yapmaz / hemen o anda)',
              examples:[
                  '<strong>As soon as / Once / The moment / Immediately after</strong> I return from abroad, I will start working at a language school.',
                  'I went shopping to complete my needs <strong>as soon as / once / the moment / immediately after</strong> I won the university.',
              ] },
            { ico:'D', bg:'rgba(124,58,237,.1)', title:'No sooner … than / Hardly – Barely – Scarcely … when (-ar -maz / -mıştı ki)',
              desc:'Bu bağlaçlar cümle başına geldiğinde cümle devrik yapıda kurulur.',
              examples:[
                  '<strong>No sooner</strong> had I got to the airport <strong>than</strong> my mother greeted me.',
                  'The teacher had <strong>hardly / barely / scarcely</strong> entered the classroom <strong>when</strong> the children got up.',
                  '<strong>Hardly / Barely / Scarcely</strong> had I opened my umbrella <strong>when</strong> the heavy rain began to pour.',
              ] },
            { ico:'⏰', bg:'rgba(5,150,105,.1)', title:'Other Words Expressing Time',
              desc:'',
              notes:[
                  '<strong>By / During / Up to / Prior</strong> → + noun / noun phrase',
                  '<strong>Soon / Meanwhile / In the meantime / Henceforth / From now on / Initially / First / Finally / Then / Afterwards</strong> → bağımsız zaman zarfları',
              ],
              examples:[] }
        ]);
}

/* ════════ ADDITION ════════ */
function cjAddition() {
    return cjH('➕ Other Linking Phrases', 'Ekleme İfadeleri (Addition)', '"-nın yanı sıra, dahası, -e ek olarak" anlamlarına gelen bağlaçlar.')
        + cjSH('1 — Prepositional Words Expressing Addition (+ isim / noun phrase)')
        + cjBox('green','📌 Bağlaçlar',[
            cjPill('as well as') + cjPill('in addition to') + cjPill('besides') + cjPill('along with'),
            '',
            '• Ardından <strong>noun / noun phrase</strong> alırlar.',
            '• "-nın yanı sıra, -e ek olarak" şeklinde çevrilir.',
        ])
        + cjAcc([
            { ico:'➕', bg:'rgba(22,163,74,.1)', title:'Prepositional Phrase Örnekleri',
              examples:[
                  'She likes watching movies <strong>as well as</strong> reading books.',
                  '<strong>In addition to</strong> my job, I also volunteers at the local charity.',
                  '<strong>Besides</strong> being an English teacher, my mother is really good at math.',
                  'Our teacher brought his laptop <strong>along with</strong> his notebook to the lesson.',
              ] }
        ])
        + cjSH('2 — Transition Words Expressing Addition (+ cümle)')
        + cjBox('sky','📌 Geçiş Kelimeleri',[
            cjPill('furthermore') + cjPill('besides') + cjPill('moreover') + cjPill('in addition'),
            '',
            '• Ardından <strong>cümle</strong> alırlar.',
            '• "-nın yanı sıra, dahası, -e ek olarak" şeklinde çevrilir.',
        ])
        + cjAcc([
            { ico:'📌', bg:'rgba(3,105,161,.1)', title:'Transition Word Örnekleri',
              examples:[
                  'Reading books improves our vocabulary. <strong>Furthermore</strong>, it also improves our ability to think and ask questions.',
                  'Learning a foreign language is not just learning another language. <strong>Besides</strong>, it helps to recognize different cultures.',
                  'Education does not only provide career opportunities. <strong>Moreover</strong>, it helps us discover ourselves.',
                  'Regular exercise gives your physique a fit look. <strong>In addition</strong>, it also keeps you psychologically fit.',
              ] }
        ])
        + cjSH('3 — Other Linking Words')
        + cjBox('yellow','📌 Diğer Bağlaçlar',[
            '<strong>Exemplification (Örneklendirme):</strong> ' + cjPill('for example','#d97706') + cjPill('for instance','#d97706') + cjPill('such as','#d97706'),
            '<strong>Explanation (Açıklama):</strong> ' + cjPill('namely','#7c3aed') + cjPill('alternatively','#7c3aed') + cjPill('in other words','#7c3aed'),
            '<strong>Emphasis (Vurgu):</strong> ' + cjPill('as a matter of','#0369a1') + cjPill('indeed','#0369a1') + cjPill('actually','#0369a1') + cjPill('in fact','#0369a1'),
            '<strong>Exception (İstisna):</strong> ' + cjPill('apart from','#16a34a') + cjPill('except for','#16a34a') + cjPill('beside from','#16a34a'),
            '<em>not: "apart from" ve "beside from" → "-nın yanı sıra" anlamlarına da gelebilir.</em>',
            '<strong>Generality (Genelleme):</strong> ' + cjPill('mostly','#e63946') + cjPill('in general','#e63946'),
        ]);
}

/* ════════ REDUCTION ════════ */
function cjReduction() {
    return cjH('✂️ Reduction in Adverbial Clauses', 'Bağlaçlarda Kısaltma (Reduction)', 'Bağlaçlarda kısaltma yapmak için en önemli şart: öznelerin AYNI olmasıdır!')
        + cjBox('red','⚠️ Dikkat',[
            '• Kısaltma yapabilmek için iki cümlenin <strong>özneleri aynı</strong> olmalıdır.',
            '• Zaman ifadeleri cümleden atılarak kullanılabilir.',
            '• <strong>"before"</strong> bağlacı kısaltma yaparken cümleden <strong>atılamaz</strong>.',
        ])
        + cjTable(
            ['Durum', 'Aktif', 'Pasif'],
            [
                ['Zaman farkı yoksa', '<strong>V + ing</strong>', '<strong>V₃ / being V₃</strong>'],
                ['Zaman farkı varsa', '<strong>having V₃</strong>', '<strong>having been V₃</strong>'],
            ]
        )
        + cjAcc([
            { ico:'✅', bg:'rgba(22,163,74,.1)', title:'Aktif Kısaltma Örnekleri',
              examples:[
                  'After I had washed my hair, I brushed it. (orijinal)',
                  '<strong>After washing</strong> my hair, I brushed it. (aktif eş zamanlı)',
                  '<strong>Having washed</strong> my hair, I brushed it. (aktif farklı zamanlı)',
              ] },
            { ico:'🔄', bg:'rgba(3,105,161,.1)', title:'Pasif Kısaltma Örnekleri',
              examples:[
                  'The thief was caught, he attempted to run. (orijinal)',
                  '<strong>After being caught</strong>, he attempted to run. (pasif eş zamanlı)',
                  '<strong>Having been caught</strong>, he attempted to run. (aktif farklı zamanlı)',
              ] }
        ]);
}

/* ════════ GERUND & INFINITIVES ════════ */
function cjGerund() {
    return cjH('📝 Gerund & Infinitives', 'Gerund & Infinitive', 'Cümlede isim görevi gören yapılar: Gerund (V+ing) ve Infinitive (to + V₁)')
        + cjSH('1 — Gerunds (Verb + ing)')
        + cjAcc([
            { ico:'A', bg:'rgba(22,163,74,.12)', title:'Gerund — Özne Konumunda',
              desc:'Gerund, cümlede özne konumunda kullanılabilir ve fiile "-ing" takısı getirilir.',
              examples:[
                  '<strong>Reading</strong> books enriches human ideas.',
                  '<strong>Traveling</strong> is the greatest wealth we can add to ourselves.',
                  '<strong>Exercising</strong> keeps your mind and body fit.',
              ] },
            { ico:'B', bg:'rgba(3,105,161,.12)', title:'Gerund — Nesne / Tümleç Konumunda',
              desc:'Bazı fiillerden sonra gerund (V+ing) gelir: avoid, suggest, recommend, finish, enjoy, mind, deny, admit, consider, risk…',
              examples:[
                  'I enjoy <strong>reading</strong> books.',
                  'She recommended <strong>going</strong> to the doctor.',
                  'He denied <strong>stealing</strong> the money.',
              ] }
        ])
        + cjSH('2 — Infinitives (to + V₁)')
        + cjAcc([
            { ico:'C', bg:'rgba(217,119,6,.12)', title:'Infinitive — Özne & Nesne Konumunda',
              desc:'Infinitive de cümlede özne ya da nesne konumunda kullanılabilir. Bazı fiillerden sonra infinitive gelir: want, need, plan, hope, decide, manage, promise, refuse…',
              examples:[
                  '<strong>To learn</strong> a foreign language takes time and patience.',
                  'She wants <strong>to study</strong> abroad.',
                  'He managed <strong>to finish</strong> the project on time.',
              ] },
            { ico:'D', bg:'rgba(124,58,237,.12)', title:'Gerund vs Infinitive — Her İkisini Alan Fiiller',
              desc:'Bazı fiiller hem gerund hem infinitive alabilir fakat anlam farkı oluşur: remember, forget, stop, try, regret…',
              notes:[
                  '<strong>remember + Ving</strong> = geçmişte yaptığını hatırlamak | <strong>remember + to V</strong> = yapmayı hatırlamak',
                  '<strong>forget + Ving</strong> = yaptığını unutmak | <strong>forget + to V</strong> = yapmayı unutmak',
                  '<strong>stop + Ving</strong> = yapmayı bırakmak | <strong>stop + to V</strong> = yapmak için durmak',
              ],
              examples:[
                  'I remember <strong>meeting</strong> him at the conference. (geçmişte tanıştım)',
                  'Remember <strong>to meet</strong> him at the conference. (tanışmayı unutma)',
              ] }
        ]);
}

/* ════════ EXERCISES ════════ */
var CJ_BLANKS = [
    { q:'She couldn\'t attend the meeting ___ her illness. (prepositional phrase — sebep)',
      ans:['because of','due to','owing to','on account of'], hint:'"due to / because of / owing to / on account of" + isim' },
    { q:'He has been living in Spain for 20 years; ___, he speaks fluent Spanish. (sonuç geçiş kelimesi)',
      ans:['therefore','thus','hence','consequently','as a result'], hint:'"therefore / thus / hence / consequently / as a result"' },
    { q:'I set out early ___ missing the train. (amaç — fear of + Ving)',
      ans:['for fear of'], hint:'"for fear of" + V+ing = …korkusuyla' },
    { q:'___ the economic crisis, many companies had to lay off workers. (zıtlık — prepozisyon)',
      ans:['despite','in spite of','notwithstanding'], hint:'"despite / in spite of" + isim' },
    { q:'___ sooner had I arrived home than it started raining. (zaman bağlacı)',
      ans:['No','no'], hint:'"No sooner … than" = -ar -maz' },
    { q:'___ watching the movie, she realized she had read the book. (reduction — aktif)',
      ans:['While watching','After watching','While watching,','After watching,'], hint:'V+ing ile reduction yapısı' },
    { q:'She goes to the library ___ being able to study. (amaç)',
      ans:['with the aim of','with a view to'], hint:'"with the aim of / with a view to" + V+ing' },
    { q:'___ he had many obstacles, he never gave up his dream. (zıtlık)',
      ans:['Although','Though','Even though','Much as'], hint:'"although / though / even though" + cümle' },
    { q:'I study English every day ___ improve my career. (amaç — infinitive)',
      ans:['to','so as to','in order to'], hint:'"to / so as to / in order to" + V₁' },
    { q:'The students worked so hard ___ they all passed the exam.',
      ans:['that'], hint:'"so … that" = o kadar … ki' },
];

var CJ_MCQS = [
    { q:'The city was flooded ___ the heavy rain.',
      opts:['because','due to','so that','although'],
      cor:'b', hint:'"due to" + isim phrase (prepositional phrase)' },
    { q:'___ I earn enough money, I plan to go abroad.',
      opts:['So that','In order that','As long as','Lest'],
      cor:'c', hint:'"as long as" = "madem ki, …sürece" (sebep)' },
    { q:'She is ___ talented ___ everyone admires her.',
      opts:['so … that','such … that','too … to','enough … to'],
      cor:'a', hint:'"so + adj + that" = o kadar yetenekli ki' },
    { q:'___ the difficulties, she completed the project successfully.',
      opts:['Although','Despite','However','Because of'],
      cor:'b', hint:'"despite" + isim/noun phrase' },
    { q:'No sooner ___ I left the house than it started to rain.',
      opts:['did','have','had','was'],
      cor:'c', hint:'"No sooner had + özne + V₃ + than"' },
    { q:'I study every day. ___, I expect to pass the exam.',
      opts:['However','Therefore','Although','Despite'],
      cor:'b', hint:'"Therefore" = bu nedenle (sonuç geçiş kelimesi)' },
    { q:'___ not only the exam but also the presentation.',
      opts:['She passed','She was passed','Not only she passed','Pass she'],
      cor:'a', hint:'"not only … but also" ile özne başta — devrik yoksa normal yapı' },
    { q:'He left early ___ missing the train.',
      opts:['for fear that','for fear of','lest','so that'],
      cor:'b', hint:'"for fear of" + V+ing' },
];

function cjExercises() {
    var blankCards = CJ_BLANKS.map(function(q, i) {
        return '<div class="gr-q-card" id="cjq-b' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM A</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<input class="gr-q-inp cj-inp" id="cj-inp-' + i + '" placeholder="doğru yapıyı yaz…" autocomplete="off"><br>'
            + '<button class="gr-chk-btn" style="border-color:#16a34a;color:#16a34a" onclick="cjCheckBlank(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="cj-fb-b' + i + '"></div>'
            + '</div>';
    }).join('');

    var mcqCards = CJ_MCQS.map(function(q, i) {
        var opts = q.opts.map(function(o, j) {
            var letter = ['A','B','C','D'][j];
            var lv = ['a','b','c','d'][j];
            return '<div class="gr-opt" id="cj-opt-' + i + '-' + j + '" onclick="cjSelectOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');
        return '<div class="gr-q-card" id="cjq-m' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM B</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#16a34a;color:#16a34a" onclick="cjCheckMCQ(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="cj-fb-m' + i + '"></div>'
            + '</div>';
    }).join('');

    return cjH('✨ Pratik Yap', 'Alıştırmalar', CJ_TOTAL + ' soruluk interaktif test. Conjunctions & Transitions konuları.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="cj-live-score">0 / ' + CJ_TOTAL + '</span></div>'
        + '<div class="gr-q-sec-hd">Bölüm A — Boşluk Doldurma</div>'
        + blankCards
        + '<div class="gr-q-sec-hd" style="margin-top:20px">Bölüm B — Çoktan Seçmeli</div>'
        + mcqCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#16a34a,#4ade80)" onclick="cjSubmitAll()">🎯 Tümünü Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="cj-result">'
        + '<div class="gr-res-score" id="cj-res-score" style="color:#16a34a">0/' + CJ_TOTAL + '</div>'
        + '<div class="gr-res-lbl">Toplam Puan</div>'
        + '<div class="gr-res-msg" id="cj-res-msg"></div>'
        + '<button class="gr-retry-btn" style="border-color:#16a34a;color:#16a34a" onclick="_cjRenderSection(\'exercises\')">🔄 Tekrar Dene</button>'
        + '</div></div>';
}

/* ════════ EXERCISE LOGIC ════════ */
function _cjUpdScore() {
    var el = document.getElementById('cj-live-score');
    if (el) el.textContent = _cjScore + ' / ' + CJ_TOTAL;

    if (typeof saveGrammarScore === 'function') saveGrammarScore('cj', _cjScore);
}

function cjCheckBlank(i) {
    var inp  = document.getElementById('cj-inp-' + i);
    var fb   = document.getElementById('cj-fb-b' + i);
    var card = document.getElementById('cjq-b' + i);
    if (!inp || !fb) return;
    var val = inp.value.trim().toLowerCase().replace(/\s+/g,' ');
    if (!val) { fb.textContent = 'Bir cevap girin!'; fb.className = 'gr-fb show bad'; return; }
    var correct = CJ_BLANKS[i].ans.map(function(a){ return a.toLowerCase().trim(); });
    if (correct.indexOf(val) !== -1) {
        inp.classList.add('ok'); card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + CJ_BLANKS[i].ans[0];
        fb.className = 'gr-fb show ok';
        if (!_cjChecked['b'+i]) { _cjScore++; _cjChecked['b'+i] = true; _cjUpdScore(); }
    } else {
        inp.classList.add('bad'); card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Kabul edilen: ' + CJ_BLANKS[i].ans[0] + ' — ' + CJ_BLANKS[i].hint;
        fb.className = 'gr-fb show bad';
        if (!_cjChecked['b'+i]) _cjChecked['b'+i] = 'wrong';
    }
}

function cjSelectOpt(qi, oi, letter) {
    CJ_MCQS[qi].opts.forEach(function(_, j) {
        var el = document.getElementById('cj-opt-' + qi + '-' + j);
        if (el) el.classList.remove('sel');
    });
    var el = document.getElementById('cj-opt-' + qi + '-' + oi);
    if (el) el.classList.add('sel');
    _cjAnswers['m'+qi] = letter;
}

function cjCheckMCQ(i) {
    var q    = CJ_MCQS[i];
    var sel  = _cjAnswers['m'+i];
    var fb   = document.getElementById('cj-fb-m' + i);
    var card = document.getElementById('cjq-m' + i);
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    var letters = ['a','b','c','d'];
    q.opts.forEach(function(_, j) {
        var el = document.getElementById('cj-opt-' + i + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_cjChecked['m'+i]) { _cjScore++; _cjChecked['m'+i] = true; _cjUpdScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_cjChecked['m'+i]) _cjChecked['m'+i] = 'wrong';
    }
}

function cjSubmitAll() {
    var panel   = document.getElementById('cj-result');
    var scoreEl = document.getElementById('cj-res-score');
    var msgEl   = document.getElementById('cj-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _cjScore + '/' + CJ_TOTAL;
    var pct = Math.round((_cjScore / CJ_TOTAL) * 100);
    msgEl.textContent = pct >= 88 ? '🎉 Mükemmel! Adverbial Clauses & Conjunctions konusuna tam hâkimsin!'
                      : pct >= 66 ? '👏 Çok iyi! Zıtlık ve amaç bağlaçlarını biraz daha tekrar et.'
                      : pct >= 44 ? '📚 İyi başlangıç. Cause, Result ve Contrast bölümlerine tekrar bak!'
                      : '💪 Daha fazla pratik yapalım. Genel bakış kartlarından başla!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════ GLOBALS ════════ */
window.openConjSection    = openConjSection;
window._cjRenderSection   = _cjRenderSection;
window.cjCheckBlank       = cjCheckBlank;
window.cjSelectOpt        = cjSelectOpt;
window.cjCheckMCQ         = cjCheckMCQ;
window.cjSubmitAll        = cjSubmitAll;
