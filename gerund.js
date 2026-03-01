// ════════════════════════════════════════════════════════════════
// gerund.js  —  Gerunds & Infinitives Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Gerunds & Infinitives notları (s. 74–81)
// ════════════════════════════════════════════════════════════════

var _grdCurrentSection = 'overview';
var _grdAnswers = {};
var _grdChecked = {};
var _grdScore = 0;
var GRD_TOTAL = 16;

var GRD_SECTIONS = [
    { id: 'overview',    label: 'Genel Bakış',                grp: 'Genel' },
    { id: 'gerund-uses', label: 'Gerund — Kullanım (a–i)',    grp: 'Gerund' },
    { id: 'gerund-osym', label: 'ÖSYM Gerund İfadeleri',      grp: 'Gerund' },
    { id: 'gerund-verbs',label: 'Gerund Alan Fiiller',         grp: 'Gerund' },
    { id: 'gerund-forms',label: 'Active & Passive Formlar',    grp: 'Gerund' },
    { id: 'inf-uses',    label: 'Infinitive — Kullanım (a–f)', grp: 'Infinitive' },
    { id: 'inf-osym',    label: 'ÖSYM Infinitive İfadeleri',   grp: 'Infinitive' },
    { id: 'inf-forms',   label: 'Active & Passive Formlar',    grp: 'Infinitive' },
    { id: 'inf-lists',   label: 'İsim & Fiil Listeleri',       grp: 'Infinitive' },
    { id: 'dual',        label: 'Gerund or Infinitive?',       grp: 'Karşılaştırma' },
    { id: 'exercises',   label: 'Alıştırmalar',                grp: 'Özel' }
];

var GRD_DOT = {
    'Genel':         '#6366f1',
    'Gerund':        '#d97706',
    'Infinitive':    '#0369a1',
    'Karşılaştırma': '#7e22ce',
    'Özel':          '#e63946'
};

/* ════════ ENTRY POINT ════════ */
function openGerundSection(sectionId) {
    _grdCurrentSection = sectionId || 'overview';
    document.querySelectorAll('.container').forEach(function(c){ c.classList.add('hidden'); });
    document.querySelectorAll('.arsiv-full-page').forEach(function(c){ c.classList.add('hidden'); });
    var page = document.getElementById('gerund-page');
    if (page) page.classList.remove('hidden');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(function(el){ el.classList.remove('active'); });
    var sb = document.getElementById('sb-grammar-gerund');
    if (sb) sb.classList.add('active');
    var di = document.getElementById('di-grammar-gerund');
    if (di) di.classList.add('active');
    _grdRenderPage();
}

function _grdRenderPage() {
    var page = document.getElementById('gerund-page');
    if (!page) return;
    page.innerHTML =
        '<div class="gr-topbar">'
        + '<button class="gr-back-btn" onclick="navTo(\'index-page\')">←</button>'
        + '<div><div class="gr-topbar-label">Grammar Modülü</div>'
        + '<div class="gr-topbar-title">Gerunds &amp; Infinitives</div></div>'
        + '</div>'
        + '<div class="gr-body">'
        + '<nav class="gr-sidenav" id="grd-sidenav"></nav>'
        + '<div class="gr-content" id="grd-content"></div>'
        + '</div>';
    _grdBuildSidenav();
    _grdRenderSection(_grdCurrentSection);
}

function _grdBuildSidenav() {
    var nav = document.getElementById('grd-sidenav');
    if (!nav) return;
    var groups = {};
    GRD_SECTIONS.forEach(function(s) {
        if (!groups[s.grp]) groups[s.grp] = [];
        groups[s.grp].push(s);
    });
    var html = '';
    ['Genel','Gerund','Infinitive','Karşılaştırma','Özel'].forEach(function(grp) {
        var list = groups[grp];
        if (!list) return;
        html += '<div class="gr-sn-sec">' + grp + '</div>';
        list.forEach(function(s) {
            var active = s.id === _grdCurrentSection ? ' active' : '';
            html += '<button class="gr-sn-btn' + active + '" onclick="_grdRenderSection(\'' + s.id + '\')">'
                + '<span class="gr-sn-dot" style="background:' + GRD_DOT[grp] + '"></span>' + s.label + '</button>';
        });
    });
    nav.innerHTML = html;
}

function _grdRenderSection(id) {
    _grdCurrentSection = id;
    _grdBuildSidenav();
    var content = document.getElementById('grd-content');
    if (!content) return;
    content.scrollTop = 0;
    var map = {
        'overview':    grdOverview,
        'gerund-uses': grGerundUses,
        'gerund-osym': grGerundOsym,
        'gerund-verbs':grGerundVerbs,
        'gerund-forms':grGerundForms,
        'inf-uses':    grInfUses,
        'inf-osym':    grInfOsym,
        'inf-forms':   grInfForms,
        'inf-lists':   grInfLists,
        'dual':        grDual,
        'exercises':   grdExercises
    };
    var fn = map[id];
    content.innerHTML = fn ? fn() : '<div style="padding:40px">Yakında...</div>';
    if (id === 'exercises') {
        _grdScore = 0; _grdAnswers = {}; _grdChecked = {};
        _grdUpdScore();
        document.querySelectorAll('.grd-inp').forEach(function(inp, i) {
            inp.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); grdCheckBlank(i); }
            });
        });
    }
}

/* ════════ HELPERS ════════ */
function grdH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#78350f 0%,#d97706 60%,#fbbf24 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function grdSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function grdTable(headers, rows) {
    var ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    var trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function grdAcc(items) {
    var cards = items.map(function(it) {
        var exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #d97706"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        var noteHtml = (it.notes||[]).map(function(n){
            return '<div style="background:#fef9c3;border:1.5px solid #fcd34d;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:.8rem;color:#713f12;line-height:1.7">'
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

function grdBox(color, title, lines) {
    var styles = {
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        orange: 'background:#fff7ed;border:2px solid #ea580c;color:#7c2d12',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239'
    };
    var content = lines.map(function(l){
        return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>';
    }).join('');
    return '<div style="' + (styles[color]||styles.yellow) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 8px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

function grdPill(label, bg) {
    return '<span style="display:inline-block;background:' + (bg||'#d97706') + ';color:#fff;border-radius:20px;padding:2px 11px;font-size:.74rem;font-weight:700;margin:2px 3px 2px 0;">' + label + '</span>';
}

/* ════════ OVERVIEW ════════ */
function grdOverview() {
    var cards = [
        { id:'gerund-uses',  emoji:'📖', name:'Gerund Kullanımı',      sub:'Özne, nesne, tamamlayıcı, preposition, busy, algı fiilleri…',      tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74' },
        { id:'gerund-osym',  emoji:'⭐', name:'ÖSYM Gerund Kalıpları', sub:'have fun, look forward to, can\'t help, be used to…',               tc:'#713f12', bc:'#fef9c3', bd:'#fcd34d' },
        { id:'gerund-verbs', emoji:'📋', name:'Gerund Alan Fiiller',   sub:'Admit, enjoy, finish, suggest, postpone, risk…',                    tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74' },
        { id:'gerund-forms', emoji:'🔄', name:'Gerund Formları',       sub:'Active: V+ing / having V₃  —  Passive: being V₃ / having been V₃', tc:'#064e3b', bc:'#d1fae5', bd:'#6ee7b7' },
        { id:'inf-uses',     emoji:'📘', name:'Infinitive Kullanımı',  sub:'Özne, nesne, sıfat+to, noun+to, it yapıları…',                     tc:'#1e3a8a', bc:'#dbeafe', bd:'#93c5fd' },
        { id:'inf-osym',     emoji:'⭐', name:'ÖSYM Infinitive Kalıp', sub:'Question words, it takes, the first, nothing to say…',              tc:'#1e3a8a', bc:'#eff6ff', bd:'#bfdbfe' },
        { id:'inf-forms',    emoji:'🔄', name:'Infinitive Formları',   sub:'Active: to V₁ / to have V₃  —  Passive: to be V₃ / to have been V₃',tc:'#064e3b', bc:'#d1fae5', bd:'#6ee7b7' },
        { id:'inf-lists',    emoji:'📚', name:'İsim & Fiil Listeleri', sub:'Ability, chance, plan… / afford, decide, hope…',                    tc:'#4c1d95', bc:'#f5f3ff', bd:'#c4b5fd' },
        { id:'dual',         emoji:'⚖️', name:'Gerund or Infinitive?', sub:'remember, regret, forget, stop, try, go on, mean, need…',          tc:'#4a044e', bc:'#fdf4ff', bd:'#e879f9' },
    ];

    var cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.bd + ';border-radius:14px;padding:16px;background:' + c.bc + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' onclick="_grdRenderSection(\'' + c.id + '\')">'
            + '<div style="font-size:1.4rem;margin-bottom:8px">' + c.emoji + '</div>'
            + '<div style="font-size:.95rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">' + c.name + '</div>'
            + '<div style="font-size:.73rem;color:' + c.tc + ';line-height:1.5">' + c.sub + '</div>'
            + '</div>';
    }).join('');

    return grdH('📝 İsim Görevli Yapılar', 'Gerunds & Infinitives', 'Cümlede isim görevi gören iki temel yapı: Gerund (V+ing) ve Infinitive (to + V₁)')
        + grdSH('Hızlı Referans')
        + grdTable(
            ['Yapı', 'Form', 'Örnek'],
            [
                ['<strong>Gerund</strong>', 'Verb + ing', '<em>Reading</em> books enriches human ideas.'],
                ['<strong>Infinitive</strong>', 'to + V₁', '<em>To start</em> a new job may not be suitable for every person.'],
            ]
        )
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;padding:0 36px 20px;">'
        + cardHtml + '</div>'
        + '<div style="padding:0 36px 36px;text-align:center;">'
        + '<button onclick="_grdRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#d97706,#fbbf24);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button>'
        + '</div>';
}

/* ════════ GERUND USES ════════ */
function grGerundUses() {
    return grdH('📖 Gerunds', 'Gerund Kullanımları (a–i)', 'Fiile "-ing" eki getirilerek isim görevinde kullanılan yapı.')
        + grdAcc([
            { ico:'A', bg:'rgba(217,119,6,.12)', title:'Özne Konumunda',
              desc:'Gerund, cümlede özne konumunda kullanılabilir ve fiile "-ing" takısı getirilir.',
              examples:[
                  '<strong>Reading</strong> books enriches human ideas.',
                  '<strong>Traveling</strong> is the greatest wealth we can add to ourselves.',
                  '<strong>Exercising</strong> keeps your mind and body fit.',
              ] },
            { ico:'B', bg:'rgba(217,119,6,.12)', title:'Nesne Konumunda',
              desc:'Belli başlı fiiller ardından gerund (-ing) alır.',
              examples:[
                  'I mentioned <strong>having</strong> a lot of plans for my career to my family.',
                  'Most people cannot resist <strong>buying</strong> new clothes to keep up with fashion.',
              ] },
            { ico:'C', bg:'rgba(217,119,6,.12)', title:'Özne Tamamlayıcı Konumunda',
              desc:'"be" fiili ile kullanılarak özneyi tanımlar.',
              examples:[
                  'I think the worst part of going to school is <strong>getting</strong> up early.',
                  'The best part of being a teacher is <strong>touching</strong> thousands of hearts.',
              ] },
            { ico:'D', bg:'rgba(217,119,6,.12)', title:'Genele Gönderme — hate, dislike, like, love, enjoy…',
              desc:'Genele gönderme yaparken "hate, dislike, like, detest, love, enjoy…" gibi fiillerle birlikte kullanılır.',
              examples:[
                  'Unlike many students, my brother enjoys <strong>studying</strong>.',
                  'Most people hate <strong>going</strong> to the dentist.',
              ] },
            { ico:'E', bg:'rgba(217,119,6,.12)', title:'Geçmişe Gönderme — remember, forget, admit, regret, deny, conceal',
              desc:'Geçmişe gönderme yapan bu fiiller ardından gerund alır.',
              examples:[
                  'I remember <strong>seeing</strong> that movie last winter.',
                  'He denied <strong>stealing</strong> the money from the safe box.',
              ] },
            { ico:'F', bg:'rgba(217,119,6,.12)', title:'Prepositions (Edatlar) Ardından',
              desc:'"without" ve "by" edatları en sık karşılaşılan edatlardır.',
              notes:[
                  '<strong>without + V+ing</strong> = "-madan, -meden, -mazsa"',
                  '<strong>by + V+ing</strong> = "yaparak, ederek"',
              ],
              examples:[
                  'I am incapable of living my life <strong>without traveling</strong>.',
                  'She earns money <strong>by giving</strong> private lessons to high school students.',
              ] },
            { ico:'G', bg:'rgba(217,119,6,.12)', title:'"Busy" — Ardından Gerund Alan Özel Sıfat',
              desc:'"Busy" ardından gerund alan bir sıfattır. Genelde sıfatların ardından "infinitive to" gelir fakat "busy" istisnadır.',
              examples:[
                  'Experts are busy <strong>doing</strong> new experiments.',
                  'I am busy <strong>writing</strong> this book.',
              ] },
            { ico:'H', bg:'rgba(217,119,6,.12)', title:'Algı Fiilleri — see, watch, hear, notice, observe',
              desc:'Algı fiilleri hem gerund hem infinitive alabilir.',
              notes:[
                  'Olayın <strong>tümüne</strong> gönderme yaparken → <strong>V₁</strong>',
                  'Olayın <strong>belli bir kısmına</strong> gönderme yaparken → <strong>Gerund</strong>',
              ],
              examples:[
                  'I saw him <strong>doing</strong> homework in his room. (olayın belli bir kısmına şahit)',
                  'I saw him <strong>do</strong> homework in his room. (olaya baştan sona kadar şahit)',
              ] },
            { ico:'I', bg:'rgba(217,119,6,.12)', title:'catch / find / smell Fiilleri ile Gerund',
              examples:[
                  'The burglar was caught <strong>running</strong>.',
                  'Children found a kitty <strong>eating</strong> food.',
                  'I smelled something <strong>burning</strong> in the kitchen.',
              ] },
        ]);
}

/* ════════ GERUND OSYM ════════ */
function grGerundOsym() {
    var list = [
        'have fun / rest / time',
        'have trouble (in) / have difficulty (in)',
        'spend time / energy / money',
        'waste effort / salary',
        'be used to / get used to',
        'be accustomed to / get accustomed to',
        'look forward to',
        'feel like',
        'be opposed to',
        'object to',
        "can't help",
        "can't stand / can't bear",
        "it's worth",
        "it's no use / it's no good",
        'there is no point in',
        'in the habit of',
    ];
    var pillHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 36px 24px;">'
        + list.map(function(v){
            return '<span style="background:#fef9c3;color:#713f12;border:1.5px solid #fcd34d;border-radius:10px;padding:5px 14px;font-size:.8rem;font-weight:700;">' + v + ' <span style="color:#d97706;font-weight:900">+ V+ing</span></span>';
        }).join('')
        + '</div>';

    return grdH('⭐ ÖSYM Gerund', 'ÖSYM\'nin Sevdiği Gerund İfadeleri', 'Bu kalıpların tamamı ardından V+ing alır.')
        + grdBox('yellow','📌 Kural',['Bu ifadelerin tümü ardından <strong>V + ing</strong> alır.','Özellikle "to" ile biten ifadelere dikkat: <strong>be used to / look forward to / object to</strong> → bunlardan sonra V₁ değil, <strong>V+ing</strong> gelir!'])
        + pillHtml
        + grdAcc([
            { ico:'⭐', bg:'rgba(202,138,4,.12)', title:'Örnek Cümleler',
              examples:[
                  'I am looking forward to <strong>seeing</strong> you again.',
                  'She can\'t help <strong>laughing</strong> when she watches that show.',
                  'It\'s no use <strong>crying</strong> over spilt milk.',
                  'He is used to <strong>working</strong> late at night.',
                  'There is no point in <strong>arguing</strong> about this anymore.',
              ] }
        ]);
}

/* ════════ GERUND VERBS ════════ */
function grGerundVerbs() {
    var verbs = [
        'Admit','Anticipate','Appreciate','Complete','Consider','Delay','Deny','Detest','Discuss','Disslike',
        'Enjoy','Fancy','Finish','Hate','Imagine','Involve','Justify','Mention','Mind','Practise',
        'Postpone','Remember','Recommend','Recall','Resent','Report','Risk','Suggest','Stop','Tolerate'
    ];
    var pillHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 36px 24px;">'
        + verbs.map(function(v){
            return '<span style="background:#ffedd5;color:#7c2d12;border:1.5px solid #fdba74;border-radius:10px;padding:5px 14px;font-size:.8rem;font-weight:700;">' + v + '</span>';
        }).join('')
        + '</div>';

    return grdH('📋 Gerund Alan Fiiller', 'Arkasından Gerund Alan Bazı Fiiller', 'Bu fiillerden sonra daima V+ing gelir.')
        + pillHtml
        + grdAcc([
            { ico:'📋', bg:'rgba(217,119,6,.12)', title:'Örnek Cümleler',
              examples:[
                  'The doctor <strong>suggests</strong> resting for a week.',
                  'I <strong>enjoy</strong> reading books before going to sleep.',
                  'She <strong>finished</strong> writing her thesis last month.',
                  'He <strong>denied</strong> stealing the money from the safe box.',
                  'We should <strong>consider</strong> postponing the meeting.',
                  'I <strong>risk</strong> losing my job if I am late again.',
              ] }
        ]);
}

/* ════════ GERUND FORMS ════════ */
function grGerundForms() {
    return grdH('🔄 Gerund Formları', 'Active & Passive and Perfect Forms of Gerunds', 'Gerundun dört farklı formu vardır.')
        + grdTable(
            ['Form', 'Yapı', 'Örnek'],
            [
                ['<strong>Active Gerund</strong>', '<strong>V + ing</strong>', 'The doctor suggests <strong>resting</strong> for my health.'],
                ['<strong>Passive Gerund</strong>', '<strong>Being V₃</strong>', 'Resting is <strong>being suggested</strong> for my health by the doctor.'],
                ['<strong>Perfect Active Gerund</strong><br><small>(zaman farkı)</small>', '<strong>having V₃</strong>', 'She is not sad about <strong>having separated</strong> from her job.'],
                ['<strong>Perfect Passive Gerund</strong><br><small>(zaman farkı)</small>', '<strong>having been V₃</strong>', 'She is not sad about <strong>having been separated</strong> from her job.'],
            ]
        )
        + grdBox('yellow','⭐ Hatırlatma',[
            '• <strong>Active Gerund:</strong> öznenin eylemi bizzat yaptığını gösterir.',
            '• <strong>Passive Gerund:</strong> eylemin özneye yapıldığını gösterir.',
            '• <strong>Perfect formlar</strong> zaman farkı olduğunda kullanılır — gerund ana fiilden önce gerçekleşmiştir.',
        ]);
}

/* ════════ INFINITIVE USES ════════ */
function grInfUses() {
    return grdH('📘 Infinitives', 'Infinitive Kullanımları (a–f)', 'Fiilin başına "to" getirilerek isim görevinde kullanılan yapı.')
        + grdAcc([
            { ico:'A', bg:'rgba(3,105,161,.12)', title:'Özne Konumunda',
              desc:'Bir cümlenin öznesi olarak kullanılabilir → "-mek" anlamı verir. Cümlenin öznesini oluşturmadığı durumlarda "in order to / so as to" = "-mek için" anlamında amaç belirtmek için kullanılabilir.',
              examples:[
                  '<strong>To start</strong> a new job may not be suitable for every person.',
                  'Students brainstormed all together <strong>to better understand</strong> the lesson.',
                  'He saved money <strong>to / in order to / so as to</strong> buy the books he saw in the bookstore.',
              ] },
            { ico:'B', bg:'rgba(3,105,161,.12)', title:'Nesne Konumunda',
              desc:'Belli başlı fiiller ardından infinitive (to) alır.',
              examples:[
                  'Many people hope <strong>to come</strong> to good places in life, but few work for it.',
                  'Why do you hesitate <strong>to start</strong> a new life?',
              ] },
            { ico:'C', bg:'rgba(3,105,161,.12)', title:'Özne Tamamlayıcı Konumunda',
              desc:'"be" fiili ile kullanılarak özneyi tamamlar.',
              examples:[
                  'Nobody can intimidate people whose sole purpose in life is <strong>to stand</strong> on their own two feet.',
                  'When I go to Poland, my first plan will be <strong>to organize</strong> my dorm room.',
              ] },
            { ico:'D', bg:'rgba(3,105,161,.12)', title:'Sıfatlar Ardından — adjective + to V₁',
              desc:'Sıfatlar ardından infinitive (to) alır. Ardından gerund alan "busy" fiili bir istisnadır.',
              examples:[
                  'The teacher has students eager <strong>to learn</strong> new things in the classroom.',
                  'The burglar was reluctant <strong>to admit</strong> his guilt.',
              ] },
            { ico:'E', bg:'rgba(3,105,161,.12)', title:'İsimler Ardından — noun + to V₁',
              desc:'İsimler ardından fiil alacaksa genellikle "to" yapısı ile kullanılır.',
              examples:[
                  'I have plans <strong>to visit</strong> France.',
                  'We always have another chance <strong>to stand</strong> again when we fall.',
              ] },
            { ico:'F', bg:'rgba(3,105,161,.12)', title:'"It" ile Kurulan Yapılar',
              desc:'"It" ile birlikte kurulan cümlelerden sonra "to" kullanılır. Asıl özne "to"dan sonra gelir.',
              notes:[
                  '<strong>it + be + adjective/noun (for someone) + infinitive</strong>',
                  '<strong>it + be + adjective + of noun/pronoun + infinitive</strong>',
              ],
              examples:[
                  'It is important <strong>to study</strong> regularly to be disciplined.',
                  'It\'s necessary <strong>for me to finish</strong> the project.',
              ] },
        ]);
}

/* ════════ INFINITIVE OSYM ════════ */
function grInfOsym() {
    return grdH('⭐ ÖSYM Infinitive', 'ÖSYM\'nin Sevdiği Infinitive İfadeleri', 'Bu yapıların tamamı ardından to + V₁ alır.')
        + grdBox('sky','📌 Yapılar',[
            grdPill('Question Words','#0369a1') + ' + to V₁  &nbsp;&nbsp; (what to do, how to solve, where to go…)',
            '',
            grdPill('It takes + time/effort/money','#0369a1') + ' + to V₁',
            '',
            grdPill('The first / second / best / only','#0369a1') + ' + to V₁',
            '',
            grdPill('Indefinite Pronouns','#0369a1') + ' (something, nothing, anything…) + to V₁',
        ])
        + grdAcc([
            { ico:'⭐', bg:'rgba(3,105,161,.12)', title:'ÖSYM Infinitive Örnekleri',
              examples:[
                  'He could not decide <strong>what to do</strong> with the prize he won from the competition.',
                  'It <strong>takes time to succeed</strong> in life, and it is necessary to strive for it.',
                  'Amelia Earhart was <strong>the first</strong> female pilot <strong>to cross</strong> the Atlantic Ocean.',
                  'I have <strong>nothing to say</strong> about the disrespect you have shown your teacher.',
              ] }
        ])
        + grdBox('orange','📐 too … to V₁  /  enough to V₁',[
            '• <strong>"too … to V₁"</strong> → bir durumun yapamayacak kadar aşırı olduğunu ifade eder.',
            '• <strong>"Enough to V₁"</strong> → bir durumun yeterliliğini ifade eder.',
            '',
            '→ When I came home from work, I was <strong>too</strong> tired <strong>to have</strong> dinner.',
            '→ He is intelligent <strong>enough to get</strong> admission to school.',
            '→ He has <strong>enough</strong> intelligence <strong>to get</strong> admission to school.',
        ]);
}

/* ════════ INFINITIVE FORMS ════════ */
function grInfForms() {
    return grdH('🔄 Infinitive Formları', 'Active & Passive and Perfect Forms of Infinitives', 'Infinitivenin dört farklı formu vardır.')
        + grdTable(
            ['Form', 'Yapı', 'Örnek'],
            [
                ['<strong>Active Infinitive</strong>', '<strong>To V₁</strong>', 'Councilors refused <strong>to accept</strong> the new proposal.'],
                ['<strong>Passive Infinitive</strong>', '<strong>To be V₃</strong>', 'The proposal was refused <strong>to be accepted</strong> by councilors.'],
                ['<strong>Perfect Active Infinitive</strong><br><small>(zaman farkı)</small>', '<strong>to have V₃</strong>', 'Ghosts are believed <strong>to have cursed</strong> people.'],
                ['<strong>Perfect Passive Infinitive</strong><br><small>(zaman farkı)</small>', '<strong>to have been V₃</strong>', 'Most people claim <strong>to have been cursed</strong> by ghosts.'],
            ]
        )
        + grdBox('sky','⭐ Hatırlatma',[
            '• <strong>Perfect formlar</strong> zaman farkı olduğunda kullanılır.',
            '• "to have V₃" → infinitivenin ana fiilden önce gerçekleştiğini gösterir.',
        ]);
}

/* ════════ INFINITIVE LISTS ════════ */
function grInfLists() {
    var nouns  = ['Ability','Attempt','Chance','Decision','Desire','Determination','Dream','Effort','Goal','Need','Offer','Plan','Permission','Proposal','Refusal','Request','Suggestion','Tendency','Wish','Way'];
    var verbs  = ['Afford','Agree','Arrange','Ask','Attempt','Care','Decide','Demand','Deserve','Expect','Fail','Happen','Hesitate','Hope','Offer','Prepare','Pretend','Proceed','Promise','Propose','Prove','Seem','Struggle','Volunteer'];

    var nHtml = nouns.map(function(v){ return '<span style="background:#dbeafe;color:#1e3a8a;border:1px solid #93c5fd;border-radius:8px;padding:4px 12px;font-size:.8rem;font-weight:600;">' + v + '</span>'; }).join(' ');
    var vHtml = verbs.map(function(v){ return '<span style="background:#ede9fe;color:#4c1d95;border:1px solid #c4b5fd;border-radius:8px;padding:4px 12px;font-size:.8rem;font-weight:600;">' + v + '</span>'; }).join(' ');

    return grdH('📚 İsim & Fiil Listeleri', 'Infinitive Alan İsimler & Fiiller', 'Bu isim ve fiillerin ardından to + V₁ gelir.')
        + grdSH('Infinitive Alan Bazı İsimler')
        + '<div style="display:flex;flex-wrap:wrap;gap:7px;padding:0 36px 20px;">' + nHtml + '</div>'
        + grdSH('Infinitive Alan Bazı Fiiller')
        + '<div style="display:flex;flex-wrap:wrap;gap:7px;padding:0 36px 24px;">' + vHtml + '</div>'
        + grdAcc([
            { ico:'📚', bg:'rgba(124,58,237,.1)', title:'İsim & Fiil Örnekleri',
              examples:[
                  'I have the <strong>ability to speak</strong> three languages.',
                  'She made a <strong>decision to quit</strong> her job.',
                  'He <strong>agreed to help</strong> us with the project.',
                  'We <strong>managed to finish</strong> the project on time.',
                  'They <strong>refused to accept</strong> the new terms.',
              ] }
        ]);
}

/* ════════ DUAL ════════ */
function grDual() {
    var rows = [
        ['<strong>remember</strong>',
         'Geçmiş bir olayı hatırlamak',
         'I still remember <strong>riding</strong> a bike as a kid.',
         'Yapılması gerekeni hatırlamak',
         'When you get home, you should remember <strong>to call</strong> your sister.'],
        ['<strong>regret</strong>',
         'Pişman olmak',
         'He will regret <strong>doing</strong> a job he doesn\'t want.',
         '…dan üzgün olmak',
         'We regret <strong>to announce</strong> to you that your appointment has been refused.'],
        ['<strong>forget</strong>',
         'Gerçekleşmiş bir olayı unutmak',
         'I forgot <strong>watching</strong> The Pianist last year.',
         'Yapılması gerekeni unutmak',
         'My brother forgot <strong>to lock</strong> the door.'],
        ['<strong>stop</strong>',
         'Bir şeyi yapmayı bırakmak',
         'My father stopped <strong>smoking</strong> five years ago.',
         'Bir şeyi yapmak için durmak',
         'I stopped <strong>to change</strong> my way while I was driving.'],
        ['<strong>try</strong>',
         'Denemek',
         'Try <strong>listening</strong> to podcasts to improve your skills.',
         'Yapmaya çalışmak',
         'He tried <strong>to solve</strong> the problem, but he couldn\'t.'],
        ['<strong>go on</strong>',
         'Devam etmek',
         'Go on <strong>studying</strong> if you want to be successful.',
         'Başka bir eylemi yapmaya başlamak',
         'After school, I went on <strong>to work</strong> in a job.'],
        ['<strong>mean</strong>',
         'Anlamına gelmek',
         'Her silence frequently means <strong>avoiding</strong> the topic altogether.',
         'Niyetinde olmak',
         'I meant <strong>to tell</strong> you, but you didn\'t listen.'],
        ['<strong>need</strong>',
         'Edilgen anlam (= need to be V₃)',
         'The dishes need <strong>washing</strong>. (= need to be washed)',
         'Etken anlam',
         'I need <strong>to prepare</strong> food for dinner.'],
    ];

    var tableHtml = '<div class="gr-tbl-wrap"><table class="gr-tbl">'
        + '<thead><tr>'
        + '<th>Fiil</th>'
        + '<th style="background:#fde68a;color:#713f12">+ V<sub>ing</sub><br><small>Türkçe Anlam</small></th>'
        + '<th style="background:#fde68a;color:#713f12">Örnek</th>'
        + '<th style="background:#bfdbfe;color:#1e3a8a">+ to V₁<br><small>Türkçe Anlam</small></th>'
        + '<th style="background:#bfdbfe;color:#1e3a8a">Örnek</th>'
        + '</tr></thead><tbody>'
        + rows.map(function(r){
            return '<tr>'
                + '<td style="font-weight:900;font-size:.85rem;white-space:nowrap">' + r[0] + '</td>'
                + '<td style="font-size:.75rem;color:#713f12;background:#fffbeb">' + r[1] + '</td>'
                + '<td style="font-size:.75rem;background:#fffbeb">' + r[2] + '</td>'
                + '<td style="font-size:.75rem;color:#1e3a8a;background:#eff6ff">' + r[3] + '</td>'
                + '<td style="font-size:.75rem;background:#eff6ff">' + r[4] + '</td>'
                + '</tr>';
        }).join('')
        + '</tbody></table></div>';

    return grdH('⚖️ Gerund or Infinitive?', 'Anlam Farkı Yaratan Fiiller', 'Bazı fiiller hem gerund hem infinitive alır — iki kullanımda farklı anlamlara sahiptirler.')
        + grdBox('yellow','⚠️ Dikkat',[
            'Bu fiiller hem <strong>V+ing</strong> hem de <strong>to V₁</strong> alabilir.',
            'Ancak iki kullanım <strong>farklı anlamlara</strong> sahiptir. YDT\'de sık soru kaynağıdır!',
        ])
        + tableHtml;
}

/* ════════ EXERCISES ════════ */
var GRD_BLANKS = [
    { q:'___ books enriches human ideas. (gerund — özne)',
      ans:['reading','Reading'], hint:'Gerund özne: V+ing' },
    { q:'I look forward to ___ you again. (ÖSYM gerund kalıbı)',
      ans:['seeing','meeting'], hint:'"look forward to" + V+ing' },
    { q:'She can\'t help ___ when she sees funny videos. (ÖSYM kalıbı)',
      ans:['laughing','smiling'], hint:'"can\'t help" + V+ing' },
    { q:'The doctor suggests ___ for a week. (gerund alan fiil)',
      ans:['resting'], hint:'"suggest" ardından V+ing alır' },
    { q:'I still remember ___ a bike as a kid. (dual — geçmiş olay)',
      ans:['riding'], hint:'"remember + V+ing" = geçmiş bir olayı hatırlamak' },
    { q:'My brother forgot ___ the door. (dual — gelecek görev)',
      ans:['to lock'], hint:'"forget + to V₁" = yapılması gerekeni unutmak' },
    { q:'My father stopped ___ five years ago. (dual — bırakmak)',
      ans:['smoking'], hint:'"stop + V+ing" = yapmayı bırakmak' },
    { q:'She is not sad about ___ from her job. (perfect passive gerund)',
      ans:['having been separated'], hint:'"having been V₃" = perfect passive gerund' },
    { q:'___ a new job may not be suitable for every person. (infinitive — özne)',
      ans:['To start'], hint:'Infinitive özne: To + V₁' },
    { q:'He is intelligent ___ admission to school.',
      ans:['enough to get'], hint:'"enough to V₁" = yeterince … yapmak için' },
];

var GRD_MCQS = [
    { q:'I enjoy ___ to music while studying.',
      opts:['listen','to listen','listening','listened'],
      cor:'c', hint:'"enjoy" ardından V+ing alır' },
    { q:'She is used to ___ late at night.',
      opts:['work','to work','working','worked'],
      cor:'c', hint:'"be used to" + V+ing (to = edattır, infinitive değil)' },
    { q:'He decided ___ the job offer.',
      opts:['accepting','accept','to accept','accepted'],
      cor:'c', hint:'"decide" ardından to + V₁ alır' },
    { q:'It is important ___ regularly to be disciplined.',
      opts:['study','studying','to study','to studying'],
      cor:'c', hint:'"it + be + adjective + to V₁"' },
    { q:'I remember ___ him at the conference last year.',
      opts:['to meet','met','meeting','to meeting'],
      cor:'c', hint:'"remember + V+ing" = geçmiş bir olayı hatırlamak' },
    { q:'The dishes need ___. (edilgen anlam)',
      opts:['to wash','washing','washed','wash'],
      cor:'b', hint:'"need + V+ing" = edilgen anlam (= need to be washed)' },
    { q:'Ghosts are believed ___ people for centuries.',
      opts:['to curse','to have cursed','cursing','having cursed'],
      cor:'b', hint:'"to have V₃" = perfect active infinitive (zaman farkı)' },
    { q:'He was too tired ___ dinner after work.',
      opts:['having','to have','having had','for having'],
      cor:'b', hint:'"too + adj + to V₁"' },
];

function grdExercises() {
    var blankCards = GRD_BLANKS.map(function(q, i) {
        return '<div class="gr-q-card" id="grq-b' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM A</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<input class="grd-q-inp grd-inp" id="grd-inp-' + i + '" placeholder="doğru yapıyı yaz…" autocomplete="off"><br>'
            + '<button class="gr-chk-btn" style="border-color:#d97706;color:#d97706" onclick="grdCheckBlank(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="grd-fb-b' + i + '"></div>'
            + '</div>';
    }).join('');

    var mcqCards = GRD_MCQS.map(function(q, i) {
        var opts = q.opts.map(function(o, j) {
            var letter = ['A','B','C','D'][j];
            var lv = ['a','b','c','d'][j];
            return '<div class="gr-opt" id="grd-opt-' + i + '-' + j + '" onclick="grdSelectOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');
        return '<div class="gr-q-card" id="grq-m' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM B</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#d97706;color:#d97706" onclick="grdCheckMCQ(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="grd-fb-m' + i + '"></div>'
            + '</div>';
    }).join('');

    return grdH('✨ Pratik Yap', 'Alıştırmalar', GRD_TOTAL + ' soruluk interaktif test. Gerunds & Infinitives.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="grd-live-score">0 / ' + GRD_TOTAL + '</span></div>'
        + '<div class="gr-q-sec-hd">Bölüm A — Boşluk Doldurma</div>'
        + blankCards
        + '<div class="gr-q-sec-hd" style="margin-top:20px">Bölüm B — Çoktan Seçmeli</div>'
        + mcqCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#d97706,#fbbf24)" onclick="grdSubmitAll()">🎯 Tümünü Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="grd-result">'
        + '<div class="gr-res-score" id="grd-res-score" style="color:#d97706">0/' + GRD_TOTAL + '</div>'
        + '<div class="gr-res-lbl">Toplam Puan</div>'
        + '<div class="gr-res-msg" id="grd-res-msg"></div>'
        + '<button class="gr-retry-btn" style="border-color:#d97706;color:#d97706" onclick="_grdRenderSection(\'exercises\')">🔄 Tekrar Dene</button>'
        + '</div></div>';
}

/* ════════ EXERCISE LOGIC ════════ */
function _grdUpdScore() {
    var el = document.getElementById('grd-live-score');
    if (el) el.textContent = _grdScore + ' / ' + GRD_TOTAL;

    if (typeof saveGrammarScore === 'function') saveGrammarScore('grd', _grdScore);
}

function grdCheckBlank(i) {
    var inp  = document.getElementById('grd-inp-' + i);
    var fb   = document.getElementById('grd-fb-b' + i);
    var card = document.getElementById('grq-b' + i);
    if (!inp || !fb) return;
    var val = inp.value.trim().toLowerCase().replace(/\s+/g,' ');
    if (!val) { fb.textContent = 'Bir cevap girin!'; fb.className = 'gr-fb show bad'; return; }
    var correct = GRD_BLANKS[i].ans.map(function(a){ return a.toLowerCase().trim(); });
    if (correct.indexOf(val) !== -1) {
        inp.classList.add('ok'); card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + GRD_BLANKS[i].ans[0];
        fb.className = 'gr-fb show ok';
        if (!_grdChecked['b'+i]) { _grdScore++; _grdChecked['b'+i] = true; _grdUpdScore(); }
    } else {
        inp.classList.add('bad'); card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + GRD_BLANKS[i].ans[0] + ' — ' + GRD_BLANKS[i].hint;
        fb.className = 'gr-fb show bad';
        if (!_grdChecked['b'+i]) _grdChecked['b'+i] = 'wrong';
    }
}

function grdSelectOpt(qi, oi, letter) {
    GRD_MCQS[qi].opts.forEach(function(_, j) {
        var el = document.getElementById('grd-opt-' + qi + '-' + j);
        if (el) el.classList.remove('sel');
    });
    var el = document.getElementById('grd-opt-' + qi + '-' + oi);
    if (el) el.classList.add('sel');
    _grdAnswers['m'+qi] = letter;
}

function grdCheckMCQ(i) {
    var q    = GRD_MCQS[i];
    var sel  = _grdAnswers['m'+i];
    var fb   = document.getElementById('grd-fb-m' + i);
    var card = document.getElementById('grq-m' + i);
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    var letters = ['a','b','c','d'];
    q.opts.forEach(function(_, j) {
        var el = document.getElementById('grd-opt-' + i + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_grdChecked['m'+i]) { _grdScore++; _grdChecked['m'+i] = true; _grdUpdScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_grdChecked['m'+i]) _grdChecked['m'+i] = 'wrong';
    }
}

function grdSubmitAll() {
    var panel   = document.getElementById('grd-result');
    var scoreEl = document.getElementById('grd-res-score');
    var msgEl   = document.getElementById('grd-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _grdScore + '/' + GRD_TOTAL;
    var pct = Math.round((_grdScore / GRD_TOTAL) * 100);
    msgEl.textContent = pct >= 87 ? '🎉 Mükemmel! Gerunds & Infinitives konusuna tam hâkimsin!'
                      : pct >= 65 ? '👏 Çok iyi! ÖSYM kalıpları ve dual kullanımları biraz daha tekrar et.'
                      : pct >= 44 ? '📚 İyi başlangıç. "Gerund or Infinitive?" tablosuna ve ÖSYM kalıplarına tekrar bak!'
                      : '💪 Daha fazla pratik yapalım. Genel bakış kartlarından başla!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════ GLOBALS ════════ */
window.openGerundSection = openGerundSection;
window._grdRenderSection  = _grdRenderSection;
window.grdCheckBlank = grdCheckBlank;
window.grdSelectOpt = grdSelectOpt;
window.grdCheckMCQ = grdCheckMCQ;
window.grdSubmitAll = grdSubmitAll;
