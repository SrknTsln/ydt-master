// ════════════════════════════════════════════════════════════════
// tagquant.js  —  Tag Questions & Quantifiers Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Tag Questions & Quantifiers (s. 93–98)
// ════════════════════════════════════════════════════════════════

var _tqCurrentSection = 'overview';
var _tqAnswers = {};
var _tqChecked = {};
var _tqScore = 0;
var TQ_TOTAL = 16;

var TQ_SECTIONS = [
    { id: 'overview',   label: 'Genel Bakış',              grp: 'Genel' },
    { id: 'tag',        label: 'Tag Questions (a–e)',       grp: 'Tag Questions' },
    { id: 'some-any',   label: '1 — Some / Any / No',       grp: 'Quantifiers' },
    { id: 'much-many',  label: '2 — Much / Many / A lot of',grp: 'Quantifiers' },
    { id: 'few-little', label: '3 — A few / Few / A little',grp: 'Quantifiers' },
    { id: 'all-most',   label: '4 — All / Whole / Most / None / Half', grp: 'Quantifiers' },
    { id: 'both',       label: '5 — Both / Either / Neither',grp: 'Quantifiers' },
    { id: 'each-every', label: '6 — Each / Every / Enough', grp: 'Quantifiers' },
    { id: 'number',     label: '7 — A number of / Several', grp: 'Quantifiers' },
    { id: 'large',      label: '8 — A large amount of…',   grp: 'Quantifiers' },
    { id: 'exercises',  label: 'Alıştırmalar',              grp: 'Özel' }
];

var TQ_DOT = {
    'Genel':         '#6366f1',
    'Tag Questions': '#0369a1',
    'Quantifiers':   '#b45309',
    'Özel':          '#e63946'
};

/* ════════ ENTRY POINT ════════ */
function openTagQuantSection(sectionId) {
    _tqCurrentSection = sectionId || 'overview';
    document.querySelectorAll('.container').forEach(function(c){ c.classList.add('hidden'); });
    document.querySelectorAll('.arsiv-full-page').forEach(function(c){ c.classList.add('hidden'); });
    var page = document.getElementById('tagquant-page');
    if (page) page.classList.remove('hidden');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(function(el){ el.classList.remove('active'); });
    var sb = document.getElementById('sb-grammar-tagquant');
    if (sb) sb.classList.add('active');
    var di = document.getElementById('di-grammar-tagquant');
    if (di) di.classList.add('active');
    _tqRenderPage();
}

function _tqRenderPage() {
    var page = document.getElementById('tagquant-page');
    if (!page) return;
    page.innerHTML =
        '<div class="gr-topbar">'
        + '<button class="gr-back-btn" onclick="navTo(\'index-page\')">←</button>'
        + '<div><div class="gr-topbar-label">Grammar Modülü</div>'
        + '<div class="gr-topbar-title">Tag Questions &amp; Quantifiers</div></div>'
        + '</div>'
        + '<div class="gr-body">'
        + '<nav class="gr-sidenav" id="tq-sidenav"></nav>'
        + '<div class="gr-content" id="tq-content"></div>'
        + '</div>';
    _tqBuildSidenav();
    _tqRenderSection(_tqCurrentSection);
}

function _tqBuildSidenav() {
    var nav = document.getElementById('tq-sidenav');
    if (!nav) return;
    var groups = {};
    TQ_SECTIONS.forEach(function(s) {
        if (!groups[s.grp]) groups[s.grp] = [];
        groups[s.grp].push(s);
    });
    var html = '';
    ['Genel','Tag Questions','Quantifiers','Özel'].forEach(function(grp) {
        var list = groups[grp];
        if (!list) return;
        html += '<div class="gr-sn-sec">' + grp + '</div>';
        list.forEach(function(s) {
            var active = s.id === _tqCurrentSection ? ' active' : '';
            html += '<button class="gr-sn-btn' + active + '" onclick="_tqRenderSection(\'' + s.id + '\')">'
                + '<span class="gr-sn-dot" style="background:' + TQ_DOT[grp] + '"></span>' + s.label + '</button>';
        });
    });
    nav.innerHTML = html;
}

function _tqRenderSection(id) {
    _tqCurrentSection = id;
    _tqBuildSidenav();
    var content = document.getElementById('tq-content');
    if (!content) return;
    content.scrollTop = 0;
    var map = {
        'overview':   tqOverview,
        'tag':        tqTag,
        'some-any':   tqSomeAny,
        'much-many':  tqMuchMany,
        'few-little': tqFewLittle,
        'all-most':   tqAllMost,
        'both':       tqBoth,
        'each-every': tqEachEvery,
        'number':     tqNumber,
        'large':      tqLarge,
        'exercises':  tqExercises
    };
    var fn = map[id];
    content.innerHTML = fn ? fn() : '<div style="padding:40px">Yakında...</div>';
    if (id === 'exercises') {
        _tqScore = 0; _tqAnswers = {}; _tqChecked = {};
        _tqUpdScore();
    }
}

/* ════════ HELPERS ════════ */
function tqH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#0c4a6e 0%,#0369a1 60%,#38bdf8 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function tqSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function tqTable(headers, rows) {
    var ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    var trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function tqAcc(items) {
    return '<div class="gr-acc-wrap">' + items.map(function(it) {
        var exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #0369a1"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        var noteHtml = (it.notes||[]).map(function(n){
            return '<div style="background:#f0f9ff;border:1.5px solid #7dd3fc;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:.8rem;color:#0c4a6e;line-height:1.7">' + n + '</div>';
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
    }).join('') + '</div>';
}

function tqBox(color, title, lines) {
    var styles = {
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        orange: 'background:#fff7ed;border:2px solid #ea580c;color:#7c2d12',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95'
    };
    var content = lines.map(function(l){
        return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>';
    }).join('');
    return '<div style="' + (styles[color]||styles.sky) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 12px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

function tqPill(label, bg) {
    return '<span style="display:inline-block;background:' + (bg||'#0369a1') + ';color:#fff;border-radius:20px;padding:2px 11px;font-size:.74rem;font-weight:700;margin:2px 3px 2px 0;">' + label + '</span>';
}

/* ════════ OVERVIEW ════════ */
function tqOverview() {
    var cards = [
        { id:'tag',        emoji:'❓', name:'Tag Questions',          sub:'"değil mi?" — olumlu/olumsuz denge, özel durumlar',           tc:'#1e3a8a', bc:'#dbeafe', bd:'#93c5fd' },
        { id:'some-any',   emoji:'🔵', name:'Some / Any / No',        sub:'bazı/birkaç vs her/herhangi vs hiç',                          tc:'#0c4a6e', bc:'#e0f2fe', bd:'#7dd3fc' },
        { id:'much-many',  emoji:'🟡', name:'Much / Many / A lot of', sub:'sayılamayan vs sayılabilen vs her ikisi',                     tc:'#713f12', bc:'#fef9c3', bd:'#fcd34d' },
        { id:'few-little', emoji:'🟠', name:'A few / Few / A little', sub:'az ama yeterli vs az (yetersiz) — çoğul vs tekil',           tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74' },
        { id:'all-most',   emoji:'🟢', name:'All / Whole / Most / None / Half', sub:'hepsi, bütün, çoğu, hiçbiri, yarısı',             tc:'#14532d', bc:'#d1fae5', bd:'#6ee7b7' },
        { id:'both',       emoji:'⚖️', name:'Both / Either / Neither', sub:'her ikisi / ikisinden biri / ikisinden hiçbiri',            tc:'#4c1d95', bc:'#f5f3ff', bd:'#c4b5fd' },
        { id:'each-every', emoji:'🔂', name:'Each / Every / Enough',  sub:'her biri / hepsi/tümü / yeterli',                           tc:'#064e3b', bc:'#d1fae5', bd:'#6ee7b7' },
        { id:'number',     emoji:'🔢', name:'A number of / Several',  sub:'"birkaç" — çoğul isimler, fiil daima çoğul',                 tc:'#1e3a8a', bc:'#dbeafe', bd:'#93c5fd' },
        { id:'large',      emoji:'📦', name:'A large amount of…',     sub:'büyük miktarda — sayılamayan vs her ikisi',                  tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74' },
    ];

    var cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.bd + ';border-radius:14px;padding:16px;background:' + c.bc + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' onclick="_tqRenderSection(\'' + c.id + '\')">'
            + '<div style="font-size:1.4rem;margin-bottom:8px">' + c.emoji + '</div>'
            + '<div style="font-size:.9rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">' + c.name + '</div>'
            + '<div style="font-size:.72rem;color:' + c.tc + ';line-height:1.5">' + c.sub + '</div>'
            + '</div>';
    }).join('');

    return tqH('❓📦 Soru Ekleri & Niceleyiciler', 'Tag Questions & Quantifiers', '"değil mi?" yapıları ve miktar/sayı belirten ifadeler — YDT\'nin sık test ettiği konular.')
        + tqSH('Quantifiers Özet Tablosu')
        + tqTable(
            ['İfade', 'Türkçe', 'Sayılabilen', 'Sayılamayan'],
            [
                ['some', 'bazı / biraz / yaklaşık', '✅ (bazı)', '✅ (biraz)'],
                ['any', 'her / herhangi / hiç', '✅', '✅'],
                ['no', 'hiç', '✅', '✅'],
                ['much', 'çok', '❌', '✅'],
                ['many', 'çok', '✅ (çoğul)', '❌'],
                ['a lot of / lots of', 'çok', '✅', '✅'],
                ['a few', 'birkaç (az ama yeterli)', '✅ (çoğul)', '❌'],
                ['few', 'az (yetersiz)', '✅ (çoğul)', '❌'],
                ['a little', 'biraz (yeterli)', '❌', '✅'],
                ['little', 'az (yetersiz)', '❌', '✅'],
                ['both', 'her ikisi de', '✅ (çoğul)', '❌'],
                ['either', 'ikisinden biri', '✅ (tekil)', '❌'],
                ['neither', 'ikisinden hiçbiri', '✅ (tekil)', '❌'],
                ['each', 'her biri', '✅ (tekil)', '❌'],
                ['every', 'hepsi / tümü', '✅ (tekil)', '❌'],
                ['enough', 'yeterli', '✅', '✅'],
                ['all', 'hepsi / bütün', '✅ (çoğul)', '✅ (tekil)'],
                ['most', 'çoğu', '✅ (çoğul)', '✅'],
                ['none', 'hiçbiri', '✅', '✅'],
                ['half', 'yarısı', '✅', '✅'],
                ['a large amount of / a great deal of', 'büyük miktarda', '❌', '✅'],
                ['a large quantity of', 'büyük miktarda', '✅', '✅'],
            ]
        )
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;padding:0 36px 20px;">'
        + cardHtml + '</div>'
        + '<div style="padding:0 36px 36px;text-align:center;">'
        + '<button onclick="_tqRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#0369a1,#38bdf8);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button>'
        + '</div>';
}

/* ════════ TAG QUESTIONS ════════ */
function tqTag() {
    return tqH('❓ Ek Soru', 'Tag Questions', 'Türkçe\'de "değil mi?" olarak kullanılan yapı.')
        + tqBox('sky','📌 Temel Kural',[
            '• Temel cümle <strong>olumlu</strong> ise tag question <strong>olumsuz</strong>,',
            '• Temel cümle <strong>olumsuz</strong> ise tag question <strong>olumlu</strong> yapıda getirilir.',
        ])
        + tqAcc([
            { ico:'A', bg:'rgba(3,105,161,.12)', title:'Temel Kural — Olumlu / Olumsuz Denge',
              examples:[
                  'You\'re going to Poland on September 30, <strong>don\'t you?</strong>',
                  'She won\'t come back, <strong>will she?</strong>',
              ] },
            { ico:'B', bg:'rgba(3,105,161,.12)', title:'everyone, anyone, someone → "they"',
              desc:'"Everyone, anyone, someone" gibi belgisiz zamirler için "they" kullanılarak tag question yapılır.',
              examples:[
                  'Everyone at the meeting accepted the new project, <strong>didn\'t they?</strong>',
                  'Someone in your life should deserve you, <strong>don\'t they?</strong>',
              ] },
            { ico:'C', bg:'rgba(3,105,161,.12)', title:'never, no, none, nothing → Olumlu Tag',
              desc:'"Never, no, none, nothing" gibi olumsuz yapılarla kullanıldığında tag question her zaman <strong>olumlu</strong> olur.',
              examples:[
                  'He never misses the lesson, <strong>does he?</strong>',
                  'No one at the hall liked the show, <strong>did they?</strong>',
              ] },
            { ico:'D', bg:'rgba(3,105,161,.12)', title:'Emir Cümlelerinde "will"',
              desc:'Emir cümlelerinde tag question için <strong>"will you"</strong> kullanılır.',
              examples:[
                  'Don\'t cry, <strong>will you?</strong>',
                  'Don\'t be late, <strong>will you?</strong>',
              ] },
            { ico:'E', bg:'rgba(3,105,161,.12)', title:'"Let\'s" ile "shall we"',
              desc:'"Let\'s" ile kurulan cümlelerde tag question için <strong>"shall we"</strong> kullanılır.',
              examples:[
                  'Let\'s study for the exam, <strong>shall we?</strong>',
                  'Let\'s talk about our future, <strong>shall we?</strong>',
              ] },
        ]);
}

/* ════════ SOME / ANY / NO ════════ */
function tqSomeAny() {
    return tqH('1️⃣ Some / Any / No', 'Some / Any / No', 'Temel belirsizlik niceleyicileri.')
        + tqAcc([
            { ico:'SOME', bg:'rgba(22,163,74,.12)', title:'SOME — bazı / biraz / yaklaşık',
              notes:[
                  '• Hem <strong>sayılabilen/çoğul</strong> hem de <strong>sayılamayan</strong> isimlerle kullanılır.',
                  '• Sayılabilen isimlerle: <strong>"bazı, birkaç"</strong>  →  I have <em>some books</em>.',
                  '• Sayılamayan isimlerle: <strong>"biraz"</strong>  →  I need <em>some water</em>.',
                  '• Sayılarla birlikte: <strong>"yaklaşık, neredeyse"</strong> (ÖSYM sevdiği kullanım)',
              ],
              examples:[
                  'I have <strong>some</strong> books to read.',
                  'I need <strong>some</strong> water. I\'m thirsty.',
                  'There are <strong>some 80</strong> people attending the meeting. (yaklaşık 80)',
              ] },
            { ico:'ANY', bg:'rgba(3,105,161,.12)', title:'ANY — her / herhangi / hiç',
              notes:[
                  '• <strong>"Her, herhangi, hiç"</strong> anlamlarına gelir.',
                  '• Genellikle <strong>soru cümlelerinde</strong> kullanılır.',
                  '• Tekil, çoğul ve sayılamayan isimlerle birlikte kullanılabilir.',
              ],
              examples:[
                  'Is there <strong>any</strong> tea?',
                  'Do you have <strong>any</strong> novels to read for me?',
              ] },
            { ico:'NO', bg:'rgba(220,38,38,.12)', title:'NO — hiç',
              notes:[
                  '• Sayılabilen tekil, çoğul ve sayılamayan isimlerle birlikte kullanılabilir.',
                  '• <strong>"Hiç"</strong> anlamına gelir — cümleye olumsuz anlam katar.',
              ],
              examples:[
                  'There are <strong>no</strong> questions. Everything is okay.',
                  'She has <strong>no</strong> milk to make food for her baby.',
              ] },
        ]);
}

/* ════════ MUCH / MANY / A LOT OF ════════ */
function tqMuchMany() {
    return tqH('2️⃣ Much / Many / A lot of', 'Much / Many / A lot of / Lots of / Plenty of', '"Çok" anlamına gelen niceleyiciler.')
        + tqTable(
            ['İfade', 'Türkçe', 'Kullanım', 'Örnek'],
            [
                ['<strong>much</strong>', 'çok', 'Sayılamayan isimler', 'He didn\'t have <strong>much</strong> time.'],
                ['<strong>many</strong>', 'çok', 'Sayılabilen çoğul isimler', 'There are <strong>many</strong> PDF documents on the internet.'],
                ['<strong>a lot of / lots of</strong>', 'çok', 'Hem sayılabilen hem sayılamayan', 'There are <strong>a lot of</strong> cats and dogs on the streets.'],
                ['<strong>plenty of</strong>', 'bol miktarda', 'Hem sayılabilen hem sayılamayan', 'If you have <strong>plenty of</strong> experience, you can get the job.'],
                ['<strong>a good/great many + çoğul</strong>', 'çokluk', 'Sayılabilen çoğul isimler', 'I read <strong>a great many</strong> books about the subject.'],
            ]
        );
}

/* ════════ A FEW / FEW / A LITTLE / LITTLE ════════ */
function tqFewLittle() {
    return tqH('3️⃣ A few / Few / A little / Little', 'A few / Few / A little / Little', '"Az" anlamındaki niceleyiciler — olumlu/olumsuz anlam farkı kritiktir.')
        + tqBox('yellow','⚠️ Kritik Fark',[
            '• <strong>a few / a little</strong> = az ama <em>yeterli</em> → <strong>olumlu</strong> anlam',
            '• <strong>few / little</strong> = az ve <em>yetersiz</em> → <strong>olumsuz</strong> anlam',
        ])
        + tqTable(
            ['İfade', 'Anlam', 'İsim Türü', 'Örnek'],
            [
                ['<strong>a few</strong>', 'birkaç (az ama yeterli) ✅', 'Sayılabilen çoğul', 'I have <strong>a few</strong> tips for the YDT exam.'],
                ['<strong>few</strong>', 'az (yetersiz) ❌', 'Sayılabilen çoğul', '<strong>Few</strong> people have attended the parent-teacher meeting.'],
                ['<strong>a little</strong>', 'biraz (yeterli) ✅', 'Sayılamayan', 'I have <strong>a little</strong> flour. I can make some pancakes with it.'],
                ['<strong>little</strong>', 'az (yetersiz) ❌', 'Sayılamayan', 'There is <strong>little</strong> time until the project\'s deadline.'],
            ]
        )
        + tqAcc([
            { ico:'🔍', bg:'rgba(202,138,4,.12)', title:'"a few of" vs "few of" farkı',
              notes:[
                  '<strong>"A few of"</strong> → miktarın yetersiz <em>olmadığını</em>, sadece birkaçının dahil olduğunu vurgular.',
                  '<strong>"Few of"</strong> → miktarın yetersiz ve az olduğunu vurgular.',
              ],
              examples:[
                  '<strong>A few of</strong> my friends came to my birthday party. (birkaç kişi geldi — yeterli)',
                  '<strong>Few of</strong> the students understood the topic. (az kişi anladı — yetersiz)',
                  'She added <strong>a little of</strong> the sugar to the tea. (birazını ekledi)',
              ] },
        ]);
}

/* ════════ ALL / WHOLE / MOST / NONE / HALF ════════ */
function tqAllMost() {
    return tqH('4️⃣ All / Whole / Most / None / Half', 'All / Whole / Most / None / Half', '"Hepsi, bütün, çoğu, hiçbiri, yarısı" anlamındaki niceleyiciler.')
        + tqAcc([
            { ico:'ALL', bg:'rgba(22,163,74,.12)', title:'ALL — hepsi / bütün / tüm',
              notes:[
                  '• <strong>Sayılabilen çoğul</strong> veya <strong>sayılamayan tekil</strong> isimlerle kullanılır.',
                  '• "all day / night / year" şeklinde süreç belirtirken de kullanılabilir.',
                  '• Önüne <strong>"the" almaz.</strong>',
                  '• Ardından <strong>kişi zamiri</strong> alırsa <strong>"of"</strong> edatı zorunludur; nesne gelirse kullanılmayabilir.',
              ],
              examples:[
                  '<strong>All</strong> people have emotions.',
                  'Teachers should approach <strong>all of their</strong> students equally.',
                  'I have worked <strong>all night</strong>. So, I feel exhausted.',
                  '<strong>All of my</strong> life, I have always trusted myself.',
              ] },
            { ico:'WHOLE', bg:'rgba(22,163,74,.12)', title:'WHOLE / THE WHOLE — tüm / bütün',
              notes:[
                  '• Daha çok <strong>sayılabilen tekil</strong> isimlerle kullanılır.',
                  '• "tüm, bütün" anlamlarına gelir.',
              ],
              examples:[
                  'My brother ate <strong>the whole</strong> pizza. I couldn\'t eat.',
                  '<strong>The whole</strong> class was listening to the teacher.',
              ] },
            { ico:'MOST', bg:'rgba(22,163,74,.12)', title:'MOST — çoğu',
              notes:[
                  '• Sayılabilen çoğul veya sayılamayan isimlerle "çoğu" anlamında kullanılır.',
                  '• <strong>"most of"</strong> şeklinde kullanımı da vardır.',
              ],
              examples:[
                  '<strong>Most</strong> people believe that it brings bad luck when the mirror breaks.',
                  '<strong>Most of</strong> the water evaporated because I left it in the sunlight.',
              ] },
            { ico:'NONE', bg:'rgba(220,38,38,.12)', title:'NONE — hiçbiri',
              notes:[
                  '• Hem sayılabilen hem sayılamayan isimlerle "hiçbiri" anlamında kullanılır.',
                  '• Kendinden sonra isim aldığında <strong>"of"</strong> edatı ile birlikte kullanılır.',
              ],
              examples:[
                  '<strong>None of the books</strong> were interesting to me.',
                  'Dictionaries didn\'t help the teacher because <strong>none of them</strong> contained extensive information.',
              ] },
            { ico:'HALF', bg:'rgba(3,105,161,.12)', title:'HALF — yarısı',
              notes:[
                  '• Hem sayılabilen hem sayılamayan isimlerle "yarısı" anlamında kullanılır.',
                  '• Ardından isim aldığında <strong>"of"</strong> edatı kullanılabilir.',
              ],
              examples:[
                  '<strong>Half of the class</strong> went on an Istanbul trip yesterday.',
                  'I could drink <strong>half</strong> the water.',
              ] },
        ]);
}

/* ════════ BOTH / EITHER / NEITHER ════════ */
function tqBoth() {
    return tqH('5️⃣ Both / Either / Neither', 'Both / Either / Neither', 'İki şey veya kişi arasındaki ilişkiyi belirtir.')
        + tqTable(
            ['İfade', 'Türkçe', 'İsim Türü', 'Fiil', 'Örnek'],
            [
                ['<strong>both</strong>', 'her ikisi de', 'Sayılabilen çoğul', 'Çoğul', 'Both cats and dogs are pets.'],
                ['<strong>either</strong>', 'ikisinden biri', 'Sayılabilen tekil', 'Tekil', 'Either book is suitable for the students.'],
                ['<strong>neither</strong>', 'ikisinden hiçbiri', 'Sayılabilen tekil', 'Tekil', 'Neither suggestion was accepted.'],
            ]
        )
        + tqAcc([
            { ico:'⚖️', bg:'rgba(124,58,237,.12)', title:'"of" ile kullanım',
              notes:[
                  '<strong>both of</strong> + the/my/your… + çoğul isim',
                  '<strong>either of</strong> + the/them… + tekil isim',
                  '<strong>neither of</strong> + the/us/them… + tekil isim',
              ],
              examples:[
                  '<strong>Both of</strong> my parents are teachers.',
                  'There are two kinds of coffee beans. I love <strong>either of</strong> them.',
                  '<strong>Neither of</strong> us could see the way in the dark.',
              ] },
        ]);
}

/* ════════ EACH / EVERY / ENOUGH ════════ */
function tqEachEvery() {
    return tqH('6️⃣ Each / Every / Enough', 'Each / Every / Enough', '"Her biri, hepsi, yeterli" anlamındaki niceleyiciler.')
        + tqAcc([
            { ico:'EACH', bg:'rgba(5,150,105,.12)', title:'EACH — her biri',
              notes:[
                  '• <strong>Sayılabilen tekil</strong> isimlerle birlikte kullanılarak "her biri" anlamına gelir.',
                  '• Sıfat olarak da kullanılabilir.',
                  '• <strong>"each of"</strong> şeklinde kullanımı da mevcuttur.',
              ],
              examples:[
                  '<strong>Each</strong> student is unique and has different goals.',
                  'People can have many hobbies. <strong>Each of</strong> them can differ from another.',
              ] },
            { ico:'EVERY', bg:'rgba(5,150,105,.12)', title:'EVERY — hepsi / tümü',
              notes:[
                  '• <strong>Sayılabilen tekil</strong> isimlerle birlikte kullanılarak "hepsi, tümü" anlamına gelir.',
                  '• "all" ile aynı görevi yapar fakat sadece <strong>sıfat</strong> görevi görür (zamir olarak kullanılmaz).',
                  '• <strong>"every of"</strong> şeklinde kullanımı <strong>YOKTUR!</strong>',
              ],
              examples:[
                  '<strong>Every</strong> baby needs parents to grow.',
              ] },
            { ico:'ENOUGH', bg:'rgba(5,150,105,.12)', title:'ENOUGH — yeterli',
              notes:[
                  '• <strong>Sayılabilen ve sayılamayan</strong> isimlerle birlikte kullanılarak "yeterli" anlamına gelir.',
              ],
              examples:[
                  'There is <strong>enough</strong> dessert for everyone.',
                  'She has not had <strong>enough</strong> time to complete her homework.',
              ] },
        ])
        + tqBox('sky','⚠️ each vs every',[
            '• <strong>each</strong> → grubu oluşturan bireylere odaklanır (her biri tek tek)',
            '• <strong>every</strong> → grubu bir bütün olarak ele alır (hepsi)',
            '• <strong>every of</strong> = YANLIŞ! → "every" yanına "of" almaz.',
        ]);
}

/* ════════ A NUMBER OF / SEVERAL ════════ */
function tqNumber() {
    return tqH('7️⃣ A number of / Several', 'A number of / A couple of / A majority of / Several', '"Birkaç, birçok" anlamındaki niceleyiciler.')
        + tqAcc([
            { ico:'7A', bg:'rgba(3,105,161,.12)', title:'A NUMBER OF — birkaç / birçok',
              notes:[
                  '• "birkaç" anlamında <strong>sayılabilen çoğul isimlerle</strong> birlikte kullanılır.',
                  '• Fiil daima <strong>çoğul</strong> olacak şekilde kullanılır.',
                  '• <strong>"the number of"</strong> ifadesinden farklıdır → "the number of" = "…nın sayısı" anlamına gelir ve <strong>tekil fiil</strong> alır.',
              ],
              examples:[
                  '<strong>A number of</strong> people thought just like me.',
                  'I read <strong>a great number of</strong> pages of the book.',
              ] },
            { ico:'7B', bg:'rgba(3,105,161,.12)', title:'SEVERAL — birkaç / birçok',
              notes:[
                  '• "birkaç" anlamında <strong>çoğul isimlerle</strong> birlikte kullanılır.',
                  '• Fiil daima <strong>çoğuldur</strong>.',
              ],
              examples:[
                  'He showed <strong>several</strong> determinations to prove himself.',
                  'I know <strong>several</strong> people who follow their dreams.',
              ] },
        ])
        + tqBox('yellow','📌 a number of vs the number of',[
            '• <strong>a number of</strong> + çoğul isim + <strong>çoğul fiil</strong>  →  "birkaç"',
            '• <strong>the number of</strong> + çoğul isim + <strong>tekil fiil</strong>  →  "…nın sayısı"',
            '',
            '→ <em>A number of students <strong>are</strong> absent today.</em> (birkaç öğrenci)',
            '→ <em>The number of students <strong>is</strong> increasing.</em> (öğrenci sayısı)',
        ]);
}

/* ════════ A LARGE AMOUNT OF ════════ */
function tqLarge() {
    return tqH('8️⃣ A large amount of…', 'A large amount of / A great deal of / A large quantity of', '"Büyük miktarda" anlamındaki niceleyiciler.')
        + tqTable(
            ['İfade', 'Türkçe', 'Sayılabilen', 'Sayılamayan', 'Örnek'],
            [
                ['<strong>a large amount of</strong>', 'büyük miktarda', '❌', '✅', 'We need <strong>a large amount of</strong> rice to cook food.'],
                ['<strong>a great deal of</strong>', 'büyük miktarda', '❌', '✅', 'A great deal of water flooded because it rained a lot.'],
                ['<strong>a large quantity of</strong>', 'büyük miktarda', '✅', '✅', 'We used <strong>a large quantity of</strong> milk to make cake.'],
            ]
        );
}

/* ════════ EXERCISES ════════ */
var TQ_BLANKS = [
    { q:'She won\'t come back, ___ she? (tag question)',
      ans:['will'], hint:'Olumsuz cümle → olumlu tag: "will she?"' },
    { q:'Let\'s study for the exam, ___ we? (tag question)',
      ans:['shall'], hint:'"Let\'s" ile kurulan cümlelerde "shall we" kullanılır.' },
    { q:'He never misses the lesson, ___ he? (olumsuz yapı — tag)',
      ans:['does'], hint:'"never" olumsuz anlam → tag question olumlu olur: "does he?"' },
    { q:'There are ___ 80 people at the meeting. (yaklaşık anlamında)',
      ans:['some'], hint:'"some + sayı" = yaklaşık, neredeyse (ÖSYM kullanımı)' },
    { q:'I have ___ tips for the YDT exam. (az ama yeterli)',
      ans:['a few'], hint:'"a few" = birkaç, az ama yeterli (olumlu)' },
    { q:'___ people have attended the meeting. (az — yetersiz)',
      ans:['Few'], hint:'"few" (artikelsiz) = az ve yetersiz (olumsuz anlam)' },
    { q:'He didn\'t have ___ time to wait. (sayılamayan — çok)',
      ans:['much'], hint:'"much" = sayılamayan isimlerle kullanılır' },
    { q:'___ of my parents are teachers. (her ikisi de)',
      ans:['Both'], hint:'"both of" = her ikisi de' },
    { q:'___ student is unique and has different goals. (her biri)',
      ans:['Each','Every'], hint:'"each/every" + tekil isim' },
    { q:'A ___ of students are absent today. (birkaç — çoğul fiil)',
      ans:['number'], hint:'"a number of" + çoğul isim + çoğul fiil' },
];

var TQ_MCQS = [
    { q:'Everyone at the meeting accepted the project, ___ ___?',
      opts:["didn't they","didn't he","don't they","wasn't it"],
      cor:'a', hint:'"everyone" için "they" kullanılır; olumlu cümle → olumsuz tag' },
    { q:'Don\'t be late, ___ ___?',
      opts:['shall we','won\'t you','will you','do you'],
      cor:'c', hint:'Emir cümlelerinde tag question: "will you?"' },
    { q:'___ of the books were interesting to me.',
      opts:['None','No','Neither','Any'],
      cor:'a', hint:'"none of + the + isim" = hiçbiri' },
    { q:'There is ___ time until the project\'s deadline. (yetersiz)',
      opts:['a little','little','few','a few'],
      cor:'b', hint:'"little" (artikelsiz, sayılamayan) = az ve yetersiz' },
    { q:'___ cats and dogs are pets.',
      opts:['Both','Either','Neither','Every'],
      cor:'a', hint:'"both" + çoğul isim; "her ikisi de"' },
    { q:'If you have ___ experience, you can get the job.',
      opts:['plenty of','many','a few','several'],
      cor:'a', hint:'"plenty of" hem sayılabilen hem sayılamayan isimlerle kullanılır.' },
    { q:'The ___ of students is increasing every year. (sayı)',
      opts:['number','a number','amount','several'],
      cor:'a', hint:'"the number of" = "…nın sayısı" → tekil fiil alır' },
    { q:'___ book is suitable for the students. (ikisinden biri)',
      opts:['Both','Either','Neither','Each'],
      cor:'b', hint:'"either" + tekil isim = ikisinden biri' },
];

function tqExercises() {
    var blankCards = TQ_BLANKS.map(function(q, i) {
        return '<div class="gr-q-card" id="tqq-b' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM A</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<input class="gr-q-inp tq-inp" id="tq-inp-' + i + '" placeholder="doğru yapıyı yaz…" autocomplete="off"><br>'
            + '<button class="gr-chk-btn" style="border-color:#0369a1;color:#0369a1" onclick="tqCheckBlank(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="tq-fb-b' + i + '"></div>'
            + '</div>';
    }).join('');

    var mcqCards = TQ_MCQS.map(function(q, i) {
        var opts = q.opts.map(function(o, j) {
            var letter = ['A','B','C','D'][j];
            var lv = ['a','b','c','d'][j];
            return '<div class="gr-opt" id="tq-opt-' + i + '-' + j + '" onclick="tqSelectOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');
        return '<div class="gr-q-card" id="tqq-m' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM B</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#0369a1;color:#0369a1" onclick="tqCheckMCQ(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="tq-fb-m' + i + '"></div>'
            + '</div>';
    }).join('');

    return tqH('✨ Pratik Yap', 'Alıştırmalar', TQ_TOTAL + ' soruluk interaktif test. Tag Questions & Quantifiers.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="tq-live-score">0 / ' + TQ_TOTAL + '</span></div>'
        + '<div class="gr-q-sec-hd">Bölüm A — Boşluk Doldurma</div>'
        + blankCards
        + '<div class="gr-q-sec-hd" style="margin-top:20px">Bölüm B — Çoktan Seçmeli</div>'
        + mcqCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#0369a1,#38bdf8)" onclick="tqSubmitAll()">🎯 Tümünü Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="tq-result">'
        + '<div class="gr-res-score" id="tq-res-score" style="color:#0369a1">0/' + TQ_TOTAL + '</div>'
        + '<div class="gr-res-lbl">Toplam Puan</div>'
        + '<div class="gr-res-msg" id="tq-res-msg"></div>'
        + '<button class="gr-retry-btn" style="border-color:#0369a1;color:#0369a1" onclick="_tqRenderSection(\'exercises\')">🔄 Tekrar Dene</button>'
        + '</div></div>';
}

/* ════════ EXERCISE LOGIC ════════ */
function _tqUpdScore() {
    var el = document.getElementById('tq-live-score');
    if (el) el.textContent = _tqScore + ' / ' + TQ_TOTAL;

    if (typeof saveGrammarScore === 'function') saveGrammarScore('tq', _tqScore);
}

function tqCheckBlank(i) {
    var inp  = document.getElementById('tq-inp-' + i);
    var fb   = document.getElementById('tq-fb-b' + i);
    var card = document.getElementById('tqq-b' + i);
    if (!inp || !fb) return;
    var val = inp.value.trim().toLowerCase().replace(/\s+/g,' ');
    if (!val) { fb.textContent = 'Bir cevap girin!'; fb.className = 'gr-fb show bad'; return; }
    var correct = TQ_BLANKS[i].ans.map(function(a){ return a.toLowerCase().trim(); });
    if (correct.indexOf(val) !== -1) {
        inp.classList.add('ok'); card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + TQ_BLANKS[i].ans[0];
        fb.className = 'gr-fb show ok';
        if (!_tqChecked['b'+i]) { _tqScore++; _tqChecked['b'+i] = true; _tqUpdScore(); }
    } else {
        inp.classList.add('bad'); card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + TQ_BLANKS[i].ans[0] + ' — ' + TQ_BLANKS[i].hint;
        fb.className = 'gr-fb show bad';
        if (!_tqChecked['b'+i]) _tqChecked['b'+i] = 'wrong';
    }
}

function tqSelectOpt(qi, oi, letter) {
    TQ_MCQS[qi].opts.forEach(function(_, j) {
        var el = document.getElementById('tq-opt-' + qi + '-' + j);
        if (el) el.classList.remove('sel');
    });
    var el = document.getElementById('tq-opt-' + qi + '-' + oi);
    if (el) el.classList.add('sel');
    _tqAnswers['m'+qi] = letter;
}

function tqCheckMCQ(i) {
    var q    = TQ_MCQS[i];
    var sel  = _tqAnswers['m'+i];
    var fb   = document.getElementById('tq-fb-m' + i);
    var card = document.getElementById('tqq-m' + i);
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    var letters = ['a','b','c','d'];
    q.opts.forEach(function(_, j) {
        var el = document.getElementById('tq-opt-' + i + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_tqChecked['m'+i]) { _tqScore++; _tqChecked['m'+i] = true; _tqUpdScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_tqChecked['m'+i]) _tqChecked['m'+i] = 'wrong';
    }
}

function tqSubmitAll() {
    var panel   = document.getElementById('tq-result');
    var scoreEl = document.getElementById('tq-res-score');
    var msgEl   = document.getElementById('tq-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _tqScore + '/' + TQ_TOTAL;
    var pct = Math.round((_tqScore / TQ_TOTAL) * 100);
    msgEl.textContent = pct >= 87 ? '🎉 Mükemmel! Tag Questions & Quantifiers konusuna tam hâkimsin!'
                      : pct >= 65 ? '👏 Çok iyi! a few/few farkı ve tag question özel durumlarını gözden geçir.'
                      : pct >= 44 ? '📚 İyi başlangıç. Quantifiers tablosuna ve "a number of vs the number of" farkına tekrar bak!'
                      : '💪 Daha fazla pratik yapalım. Genel bakış tablosundan başla!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════ GLOBALS ════════ */
window.openTagQuantSection = openTagQuantSection;
window._tqRenderSection    = _tqRenderSection;
window.tqCheckBlank        = tqCheckBlank;
window.tqSelectOpt         = tqSelectOpt;
window.tqCheckMCQ          = tqCheckMCQ;
window.tqSubmitAll         = tqSubmitAll;
