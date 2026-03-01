// ════════════════════════════════════════════════════════════════
// adjadv.js  —  Adjectives & Adverbs Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Adjectives & Adverbs notları (s. 37–45)
// ════════════════════════════════════════════════════════════════

var _aaCurrentSection = 'overview';
var _aaAnswers = {};
var _aaChecked = {};
var _aaScore = 0;
var AA_TOTAL = 16;

var AA_SECTIONS = [
    { id: 'overview',     label: 'Genel Bakış',               grp: 'Genel' },
    { id: 'adjectives',   label: 'Adjectives (Sıfatlar)',      grp: 'Adjectives' },
    { id: 'participle',   label: 'Participle Adjectives',      grp: 'Adjectives' },
    { id: 'adverbs',      label: 'Adverbs (Zarflar)',          grp: 'Adverbs' },
    { id: 'irregular',    label: 'Irregular Adverbs',          grp: 'Adverbs' },
    { id: 'dikkat',       label: 'Dikkat! (hardly/lately…)',   grp: 'Adverbs' },
    { id: 'degree',       label: 'enough / very / too',        grp: 'Adverbs' },
    { id: 'fairly',       label: 'fairly / quite / rather / pretty', grp: 'Adverbs' },
    { id: 'so-such',      label: 'so…that / such…that',        grp: 'Comparison' },
    { id: 'comparison',   label: 'Comparison (-er / more)',     grp: 'Comparison' },
    { id: 'as-as',        label: 'as…as / the same as',        grp: 'Comparison' },
    { id: 'similar',      label: 'similar to / different from', grp: 'Comparison' },
    { id: 'the-more',     label: 'the more … the more',        grp: 'Comparison' },
    { id: 'superlatives', label: 'Superlatives',               grp: 'Comparison' },
    { id: 'exercises',    label: 'Alıştırmalar',               grp: 'Özel' }
];

var AA_DOT = {
    'Genel':      '#6366f1',
    'Adjectives': '#7c3aed',
    'Adverbs':    '#0369a1',
    'Comparison': '#b45309',
    'Özel':       '#e63946'
};

/* ════════ ENTRY POINT ════════ */
function openAdjAdvSection(sectionId) {
    _aaCurrentSection = sectionId || 'overview';
    document.querySelectorAll('.container').forEach(function(c){ c.classList.add('hidden'); });
    document.querySelectorAll('.arsiv-full-page').forEach(function(c){ c.classList.add('hidden'); });
    var page = document.getElementById('adjadv-page');
    if (page) page.classList.remove('hidden');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(function(el){ el.classList.remove('active'); });
    var sb = document.getElementById('sb-grammar-adjadv');
    if (sb) sb.classList.add('active');
    var di = document.getElementById('di-grammar-adjadv');
    if (di) di.classList.add('active');
    _aaRenderPage();
}

function _aaRenderPage() {
    var page = document.getElementById('adjadv-page');
    if (!page) return;
    page.innerHTML =
        '<div class="gr-topbar">'
        + '<button class="gr-back-btn" onclick="navTo(\'index-page\')">←</button>'
        + '<div><div class="gr-topbar-label">Grammar Modülü</div>'
        + '<div class="gr-topbar-title">Adjectives &amp; Adverbs</div></div>'
        + '</div>'
        + '<div class="gr-body">'
        + '<nav class="gr-sidenav" id="aa-sidenav"></nav>'
        + '<div class="gr-content" id="aa-content"></div>'
        + '</div>';
    _aaBuildSidenav();
    _aaRenderSection(_aaCurrentSection);
}

function _aaBuildSidenav() {
    var nav = document.getElementById('aa-sidenav');
    if (!nav) return;
    var groups = {};
    AA_SECTIONS.forEach(function(s) {
        if (!groups[s.grp]) groups[s.grp] = [];
        groups[s.grp].push(s);
    });
    var html = '';
    ['Genel','Adjectives','Adverbs','Comparison','Özel'].forEach(function(grp) {
        var list = groups[grp];
        if (!list) return;
        html += '<div class="gr-sn-sec">' + grp + '</div>';
        list.forEach(function(s) {
            var active = s.id === _aaCurrentSection ? ' active' : '';
            html += '<button class="gr-sn-btn' + active + '" onclick="_aaRenderSection(\'' + s.id + '\')">'
                + '<span class="gr-sn-dot" style="background:' + AA_DOT[grp] + '"></span>' + s.label + '</button>';
        });
    });
    nav.innerHTML = html;
}

function _aaRenderSection(id) {
    _aaCurrentSection = id;
    _aaBuildSidenav();
    var content = document.getElementById('aa-content');
    if (!content) return;
    content.scrollTop = 0;
    var map = {
        'overview':    aaOverview,
        'adjectives':  aaAdjectives,
        'participle':  aaParticiple,
        'adverbs':     aaAdverbs,
        'irregular':   aaIrregular,
        'dikkat':      aaDikkat,
        'degree':      aaDegree,
        'fairly':      aaFairly,
        'so-such':     aaSoSuch,
        'comparison':  aaComparison,
        'as-as':       aaAsAs,
        'similar':     aaSimilar,
        'the-more':    aaTheMore,
        'superlatives':aaSuperlatives,
        'exercises':   aaExercises
    };
    var fn = map[id];
    content.innerHTML = fn ? fn() : '<div style="padding:40px">Yakında...</div>';
    if (id === 'exercises') {
        _aaScore = 0; _aaAnswers = {}; _aaChecked = {};
        _aaUpdScore();
    }
}

/* ════════ HELPERS ════════ */
function aaH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#4c1d95 0%,#7c3aed 60%,#a78bfa 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function aaSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function aaTable(headers, rows) {
    var ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    var trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function aaAcc(items) {
    return '<div class="gr-acc-wrap">' + items.map(function(it) {
        var exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #7c3aed"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        var noteHtml = (it.notes||[]).map(function(n){
            return '<div style="background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:.8rem;color:#4c1d95;line-height:1.7">' + n + '</div>';
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

function aaBox(color, title, lines) {
    var styles = {
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        orange: 'background:#fff7ed;border:2px solid #ea580c;color:#7c2d12',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239'
    };
    var content = lines.map(function(l){
        return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>';
    }).join('');
    return '<div style="' + (styles[color]||styles.yellow) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 12px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

function aaPill(label, bg) {
    return '<span style="display:inline-block;background:' + (bg||'#7c3aed') + ';color:#fff;border-radius:20px;padding:2px 11px;font-size:.74rem;font-weight:700;margin:2px 3px 2px 0;">' + label + '</span>';
}

/* ════════ OVERVIEW ════════ */
function aaOverview() {
    var cards = [
        { id:'adjectives',  emoji:'🔵', name:'Adjectives',              sub:'İsim niteleme, linking verbs (be/seem/look…), turn/grow',       tc:'#4c1d95', bc:'#f5f3ff', bd:'#c4b5fd' },
        { id:'participle',  emoji:'🟣', name:'Participle Adjectives',   sub:'-ing (present) vs -ed (past): thrilling / thrilled…',          tc:'#4c1d95', bc:'#faf5ff', bd:'#d8b4fe' },
        { id:'adverbs',     emoji:'🔷', name:'Adverbs',                  sub:'Manner, time, place, frequency, degree, focus, sentence…',     tc:'#1e3a8a', bc:'#dbeafe', bd:'#93c5fd' },
        { id:'irregular',   emoji:'⚠️', name:'Irregular Adverbs',       sub:'good/well, fast/fast, late/late, hard/hard…',                  tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74' },
        { id:'dikkat',      emoji:'🔴', name:'Dikkat! Tuzaklar',         sub:'hardly ≠ hard, lately ≠ late, -ly ≠ her zaman zarf değil',    tc:'#9f1239', bc:'#fff1f2', bd:'#fecdd3' },
        { id:'degree',      emoji:'🟡', name:'enough / very / too',      sub:'"yeterli" vs "çok" vs "gereğinden fazla"',                    tc:'#713f12', bc:'#fef9c3', bd:'#fcd34d' },
        { id:'fairly',      emoji:'🟠', name:'fairly/quite/rather/pretty','sub':'Hepsi "oldukça" — aralarındaki nüanslar',                  tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74' },
        { id:'so-such',     emoji:'💥', name:'so…that / such…that',      sub:'"o kadar…ki" — SVO kalıpları ve inversion',                   tc:'#713f12', bc:'#fefce8', bd:'#fde68a' },
        { id:'comparison',  emoji:'📊', name:'Comparison (-er/more)',     sub:'Tek heceli → -er, çok heceli → more than',                   tc:'#713f12', bc:'#fef9c3', bd:'#fcd34d' },
        { id:'as-as',       emoji:'⚖️', name:'as…as / the same as',      sub:'Eşitlik karşılaştırması: "…kadar"',                          tc:'#064e3b', bc:'#d1fae5', bd:'#6ee7b7' },
        { id:'similar',     emoji:'🔄', name:'similar to / different from','sub':'Benzerlik ve farklılık ifadeleri',                        tc:'#1e3a8a', bc:'#dbeafe', bd:'#93c5fd' },
        { id:'the-more',    emoji:'📈', name:'the more … the more',      sub:'"ne kadar … o kadar" kalıbı',                                 tc:'#4c1d95', bc:'#f5f3ff', bd:'#c4b5fd' },
        { id:'superlatives',emoji:'🏆', name:'Superlatives',             sub:'"the …est / the most" — en üstünlük',                        tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74' },
    ];

    var cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.bd + ';border-radius:14px;padding:16px;background:' + c.bc + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' onclick="_aaRenderSection(\'' + c.id + '\')">'
            + '<div style="font-size:1.4rem;margin-bottom:8px">' + c.emoji + '</div>'
            + '<div style="font-size:.9rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">' + c.name + '</div>'
            + '<div style="font-size:.72rem;color:' + c.tc + ';line-height:1.5">' + c.sub + '</div>'
            + '</div>';
    }).join('');

    return aaH('🔵🔷 Sıfatlar & Zarflar', 'Adjectives & Adverbs', 'Sıfatlar isimleri, zarflar fiilleri/sıfatları/zarfları niteler. Karşılaştırma kalıpları YDT\'nin en sık test ettiği konulardandır.')
        + aaSH('Hızlı Referans')
        + aaTable(
            ['Yapı', 'Görevi', 'Örnek'],
            [
                ['<strong>Adjective</strong>', 'İsim niteler', 'An <em>intelligent</em> girl / The house is <em>new</em>.'],
                ['<strong>Adverb</strong>', 'Fiil / sıfat / zarf niteler', 'She speaks <em>fluently</em>. / It\'s <em>very</em> cold.'],
                ['<strong>Participle Adj.</strong>', '-ing (aktif) / -ed (pasif)', '<em>Thrilling</em> race → <em>thrilled</em> audience'],
                ['<strong>Comparative</strong>', '-er / more … than', '<em>Bigger</em> / <em>more interesting</em> than'],
                ['<strong>Superlative</strong>', 'the …-est / the most', 'The <em>longest</em> / the <em>most</em> popular'],
            ]
        )
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:14px;padding:0 36px 20px;">'
        + cardHtml + '</div>'
        + '<div style="padding:0 36px 36px;text-align:center;">'
        + '<button onclick="_aaRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button>'
        + '</div>';
}

/* ════════ ADJECTIVES ════════ */
function aaAdjectives() {
    return aaH('🔵 Sıfatlar', 'Adjectives', 'Bir ismin önüne gelerek o ismi niteler. "nasıl, ne çeşit, kaç tane?" soruları sorulur.')
        + aaBox('purple','📌 Temel Kural',[
            '• Sıfatlar ismin <strong>önüne</strong> gelir.',
            '• Sıfatların tekil–çoğul halleri <strong>yoktur</strong>.',
            '• "nasıl, ne çeşit, kaç tane?" sorularına cevap verir.',
        ])
        + aaAcc([
            { ico:'📖', bg:'rgba(124,58,237,.12)', title:'İsim Niteleme Örnekleri',
              examples:[
                  'An <strong>intelligent</strong> girl',
                  '<strong>Healthy</strong> food',
                  'A <strong>crowded</strong> city',
                  '<strong>Cloudy</strong> sky',
              ] },
            { ico:'🔗', bg:'rgba(124,58,237,.12)', title:'Linking Verbs ile Sıfat Kullanımı',
              desc:'Fiilleri nitelemek için zarflar (adverbs) kullanılsa da "be, become, get, seem, look, appear, feel, taste, smell, sound" ifadeleri ile sıfat kullanılır.',
              notes:[
                  aaPill('be') + aaPill('become') + aaPill('get') + aaPill('seem') + aaPill('look') + aaPill('appear') + aaPill('feel') + aaPill('taste') + aaPill('smell') + aaPill('sound') + ' → ardından <strong>SIFAT</strong> gelir',
                  '',
                  '<strong>Look like</strong> = gibi görünmek &nbsp;|&nbsp; <strong>Feel like</strong> = gibi hissetmek &nbsp;|&nbsp; <strong>Taste like</strong> = tadı …e benzemek &nbsp;|&nbsp; <strong>Smell like</strong> = gibi kokmak',
              ],
              examples:[
                  'The house is <strong>new</strong>.',
                  'She seems <strong>happy</strong>.',
                  'The sky looks <strong>rainy</strong>.',
                  'The pillow feels <strong>soft</strong>.',
                  'The fruit tastes <strong>sour</strong>.',
                  'The flower smells <strong>wonderful</strong>.',
                  'His voice sounds <strong>familiar</strong>.',
              ] },
            { ico:'🔄', bg:'rgba(124,58,237,.12)', title:'turn / turn out / grow — Değişim Fiilleri',
              desc:'"Turn / turn out / grow" fiilleri sıfatlarla kullanıldığında nesnenin durumunda bir değişkenlik olduğunu belirtir.',
              examples:[
                  'The weather turned <strong>cold</strong> suddenly.',
                  'The meeting turned out to be a great <strong>success</strong>.',
                  'As the months went by, their friendship grew <strong>stronger</strong>.',
              ] },
        ]);
}

/* ════════ PARTICIPLE ADJECTIVES ════════ */
function aaParticiple() {
    var pairs = [
        ['Thrill',      'Thrilling',      'Thrilled',      'The <strong>thrilling</strong> motocross left us <strong>thrilled</strong>.'],
        ['Tire',        'Tiring',         'Tired',         'After a <strong>tiring</strong> day at school, I feel so <strong>tired</strong>.'],
        ['Relax',       'Relaxing',       'Relaxed',       'Spending the weekend in the forest was so <strong>relaxing</strong>. I returned home feeling <strong>relaxed</strong>.'],
        ['Fascinate',   'Fascinating',    'Fascinated',    'The documentary about ancient people was <strong>fascinating</strong>. We were <strong>fascinated</strong> by the stories.'],
        ['Interest',    'Interesting',    'Interested',    'The lecture on moon exploration was very <strong>interesting</strong>. Several students were <strong>interested</strong> in the topic.'],
        ['Fulfill',     'Fulfilling',     'Fulfilled',     'Helping the poor through volunteering is a <strong>fulfilling</strong> experience. It leaves you feeling <strong>fulfilled</strong>.'],
        ['Excite',      'Exciting',       'Excited',       'Winning the song contest was an <strong>exciting</strong> moment. Everyone was <strong>excited</strong> about the outcome.'],
        ['Entertain',   'Entertaining',   'Entertained',   'The theater show was really <strong>entertaining</strong>. The viewer was thoroughly <strong>entertained</strong>.'],
    ];

    var tableHtml = '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>'
        + '<th>Fiil (Verb)</th>'
        + '<th style="background:#dbeafe;color:#1e3a8a">Present Participle<br><small>V+ing → "…dırıcı, …tırıcı"<br>(durum kaynağı)</small></th>'
        + '<th style="background:#fde68a;color:#713f12">Past Participle<br><small>V₃ → "…mış, …miş"<br>(duyguyu yaşayan)</small></th>'
        + '<th>Örnek Cümle</th>'
        + '</tr></thead><tbody>'
        + pairs.map(function(r){
            return '<tr>'
                + '<td style="font-weight:800;color:#7c3aed">' + r[0] + '</td>'
                + '<td style="background:#eff6ff;font-weight:700;color:#1d4ed8">' + r[1] + '</td>'
                + '<td style="background:#fffbeb;font-weight:700;color:#b45309">' + r[2] + '</td>'
                + '<td style="font-size:.78rem">' + r[3] + '</td>'
                + '</tr>';
        }).join('')
        + '</tbody></table></div>';

    return aaH('🟣 Participle Sıfatlar', 'Participle Adjectives', 'Fiil köklerine "-ed" veya "-ing" eklenerek oluşturulan sıfatlar.')
        + aaBox('purple','📌 Temel Kural',[
            '• <strong>-ing (Present Participle)</strong> → Duygu veya durumun <em>kaynağını</em> niteler. "…dırıcı, …tırıcı" anlamı.',
            '• <strong>-ed (Past Participle)</strong> → Duyguyu <em>yaşayan kişiyi</em> niteler. "…mış, …miş" anlamı.',
            '',
            '→ <strong>Thrilling</strong> race (heyecan verici yarış) — <strong>Thrilled</strong> fans (heyecana kapılmış taraftarlar)',
        ])
        + tableHtml;
}

/* ════════ ADVERBS ════════ */
function aaAdverbs() {
    var types = [
        ['Adverbs of manner',    'beautifully, diligently, vividly, softly, rapidly…',      'Eylemin <strong>"nasıl"</strong> gerçekleştiğini belirtir.', 'Most speakers speak <strong>fluently</strong>.'],
        ['Adverbs of time',      'tomorrow, early, lately, now…',                           'Eylemin <strong>"ne zaman"</strong> gerçekleştiğini belirtir.', 'Students have to get up <strong>early</strong> tomorrow.'],
        ['Adverbs of frequency', 'always, never, occasionally, frequently…',                'Eylemin <strong>"ne sıklıkla"</strong> gerçekleştiğini belirtir.', 'Healthy people <strong>always</strong> eat fruit and drink lots of water.'],
        ['Adverbs of degree',    'extremely, too, totally, rather, enormously, very, hardly, barely…', 'Eylem, sıfat ya da herhangi bir zarfın <strong>"yoğunluk derecesini"</strong> ifade eder.', 'It is <strong>highly</strong> impossible to get a good result without working harder.'],
        ['Adverbs of place',     'forward, here, nearby…',                                  'Eylemin <strong>"nerede"</strong> gerçekleştiğini belirtir.', 'I looked <strong>everywhere</strong> to find my keys, but I couldn\'t find them.'],
        ['Focus adverbs',        'specifically, only, merely, simply…',                     'Belirli bir öğeyi vurgular.',                               'It\'s <strong>merely</strong> a suggestion. You do not have to do it.'],
        ['Sentence adverbs',     'frankly, thankfully, actually…',                          'Bütün bir cümleyi nitelerken kullanılır.',                  '<strong>Fortunately</strong>, the weather is fine for the beach.'],
        ['Connecting adverbs',   'however, also, furthermore, moreover…',                   'Cümleler arasında bağ kurar.',                             'She studied hard; <strong>however</strong>, she couldn\'t pass the exam.'],
    ];

    return aaH('🔷 Zarflar', 'Adverbs', 'Zarflar; fiilleri, sıfatları, tüm cümleyi ve hatta zarfları niteleyebilir. Genellikle sıfatların sonuna -ly takısı eklenerek zarf elde edilir.')
        + aaBox('sky','📌 Kural',[
            '• Genellikle sıfat + <strong>-ly</strong> → zarf: beautiful → <strong>beautifully</strong>',
            '• Fakat istisnalar mevcuttur (bkz. Irregular Adverbs).',
            '• <strong>Sonu -ly ile biten her sözcük zarf değildir!</strong> "friendly, lovely, silly, ugly, elderly" → birer sıfattır.',
        ])
        + '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>'
        + '<th>Tür</th><th>Örnekler</th><th>Türkçe Açıklama</th><th>Örnek Cümle</th>'
        + '</tr></thead><tbody>'
        + types.map(function(r){
            return '<tr>'
                + '<td style="font-weight:800;font-size:.8rem;color:#0369a1;white-space:nowrap">' + r[0] + '</td>'
                + '<td style="font-size:.75rem;color:#0c4a6e">' + r[1] + '</td>'
                + '<td style="font-size:.75rem">' + r[2] + '</td>'
                + '<td style="font-size:.75rem;font-style:italic">' + r[3] + '</td>'
                + '</tr>';
        }).join('')
        + '</tbody></table></div>';
}

/* ════════ IRREGULAR ADVERBS ════════ */
function aaIrregular() {
    return aaH('⚠️ Irregular Adverbs', 'Düzensiz Zarflar', 'Bazı kelimeler hem sıfat hem zarf olarak aynı formda kullanılır.')
        + aaTable(
            ['Kelime', 'Sıfat (Adjective)', 'Zarf (Adverb)', 'Örnek — Sıfat', 'Örnek — Zarf'],
            [
                ['<strong>good / well</strong>', 'good', 'well', 'She is a <strong>good</strong> singer.', 'She sings <strong>well</strong>.'],
                ['<strong>fast</strong>', 'fast', 'fast', 'She is a <strong>fast</strong> marathon runner.', 'My mom drives <strong>fast</strong>.'],
                ['<strong>late</strong>', 'late', 'late', 'The bus was <strong>late</strong>.', 'I arrived <strong>late</strong> for the birthday party.'],
                ['<strong>early</strong>', 'early', 'early', '<strong>Early</strong> babies need their parents.', 'Babies always wake up <strong>early</strong>.'],
                ['<strong>hard</strong>', 'hard', 'hard', 'The teacher gave students a <strong>hard</strong> task.', 'To win, you should work <strong>hard</strong>.'],
            ]
        );
}

/* ════════ DİKKAT ════════ */
function aaDikkat() {
    return aaH('🔴 Dikkat!', 'Sık Yapılan Hatalar', 'YDT\'de tuzak olarak çıkan zarf kullanımları.')
        + aaBox('red','⚠️ Dikkat — Karıştırılmaması Gereken Çiftler',[
            '1️⃣ <strong>"hard"</strong> kelimesi <strong>"hardly"</strong> şeklinde kullanıldığında <strong>"neredeyse hiç"</strong> anlamına gelir.',
            '   → "hardly – barely – scarcely" zarflarını bilmekte fayda var.',
            '',
            '2️⃣ <strong>"late"</strong> kelimesi <strong>"lately"</strong> şeklinde kullanıldığında <strong>"son zamanlarda"</strong> anlamına gelir.',
            '',
            '3️⃣ Sonu <strong>-ly</strong> ile biten <strong>her sözcük zarf değildir!</strong>',
            '   → "friendly, lovely, silly, ugly, elderly" gibi sözcükler birer <strong>sıfattır</strong>.',
        ])
        + aaAcc([
            { ico:'❗', bg:'rgba(220,38,38,.1)', title:'hard vs hardly',
              notes:[
                  '<strong>hard</strong> (zarf) = sıkı, yoğun şekilde',
                  '<strong>hardly</strong> (zarf) = neredeyse hiç (olumsuz anlam içerir)',
              ],
              examples:[
                  'Students could <strong>hardly</strong> answer any questions because the questions were <strong>hard</strong>.',
              ] },
            { ico:'❗', bg:'rgba(220,38,38,.1)', title:'late vs lately',
              notes:[
                  '<strong>late</strong> (zarf) = geç',
                  '<strong>lately</strong> (zarf) = son zamanlarda',
              ],
              examples:[
                  'Due to environmental concerns, there has <strong>lately</strong> been an increase in interest in the subject of renewable sources.',
              ] },
            { ico:'❗', bg:'rgba(220,38,38,.1)', title:'-ly ile biten sıfatlar',
              desc:'Sonu -ly ile biten her sözcük zarf değildir!',
              examples:[
                  'As they age, <strong>elderly</strong> people develop some diseases. (elderly = sıfat)',
                  'She has a <strong>lovely</strong> smile. (lovely = sıfat)',
              ] },
        ]);
}

/* ════════ DEGREE ════════ */
function aaDegree() {
    return aaH('🟡 Yoğunluk Zarfları', 'enough / very / too', 'Bu üç zarf anlam bakımından birbirinden farklıdır.')
        + aaTable(
            ['Zarf', 'Türkçe', 'Kullanım Yeri', 'Anlam Nüansı'],
            [
                ['<strong>enough</strong>', 'yeterli, yeterince', 'İsimlerde <em>önce</em>, sıfat ve zarflardan <em>sonra</em>', 'Olumlu anlam — yeterliliği ifade eder'],
                ['<strong>too</strong>', 'gereğinden fazla', 'Sıfat/zarftan önce', 'Olumsuz anlam katar — aşırılığı ifade eder'],
                ['<strong>very</strong>', 'çok', 'Sıfat/zarftan önce', 'Güçlendirici — olumsuz anlam yaratmaz'],
            ]
        )
        + aaAcc([
            { ico:'A', bg:'rgba(202,138,4,.12)', title:'Örnekler',
              examples:[
                  'There aren\'t <strong>enough</strong> water sources. (ismin önünde)',
                  'He is intelligent <strong>enough</strong> to get admission. (sıfatın arkasında)',
                  'The tea is <strong>too</strong> hot to drink right now. (gereğinden fazla — içilemez)',
                  'Tarkan is a <strong>very</strong> talented musician. (çok — olumsuz anlam yok)',
              ] }
        ]);
}

/* ════════ FAIRLY ════════ */
function aaFairly() {
    return aaH('🟠 Oldukça Zarfları', 'fairly / quite / rather / pretty', 'Bu dört zarf "oldukça" anlamında kullanılır fakat aralarında küçük farklar mevcuttur.')
        + aaTable(
            ['Zarf', 'Güç', 'Özellik', 'Örnek'],
            [
                ['<strong>fairly</strong>', '↓ En zayıf', 'Hafif olumlu ton', 'I am <strong>fairly</strong> good at playing the violin.'],
                ['<strong>quite</strong>',  '↕ Orta', 'Fiilleri de niteleyebilir; "completely" anlamı da taşır', 'She couldn\'t <strong>quite</strong> solve it. / The series were <strong>quite</strong> long.'],
                ['<strong>rather</strong>', '↑ Yüksek', 'Olumsuz durumlar için daha sık; fiilleri de niteleyebilir', 'Nowadays, I am <strong>rather</strong> busy.'],
                ['<strong>pretty</strong>', '↑ Yüksek', 'Daha çok konuşma dilinde', 'The Covid-19 case made a <strong>pretty</strong> big impact around the world.'],
            ]
        );
}

/* ════════ SO…SUCH ════════ */
function aaSoSuch() {
    return aaH('💥 Sonuç Kalıpları', 'so…that / such…that', '"o kadar…ki" anlamı. Sebep-sonuç ilişkisi kurar.')
        + aaBox('yellow','📐 Yapılar',[
            '<strong>so</strong> + adjective/adverb + <strong>that</strong> + SVO (tam cümle)',
            '<strong>such</strong> + a/an + adjective + noun + <strong>that</strong> + SVO (tam cümle)',
            '',
            '⚠️ <strong>so many / much / little / few + that</strong> → "such" ile kullanılmaz!',
            '⚠️ <strong>such a lot / a few / a little + noun</strong> → kullanımı da mevcuttur.',
        ])
        + aaAcc([
            { ico:'A', bg:'rgba(202,138,4,.12)', title:'so … that Örnekleri',
              examples:[
                  'The experiment was carried out <strong>so carefully</strong> that the results were highly exact.',
                  'The teacher was <strong>so attractive</strong> that the students were engaged throughout the lesson.',
                  'There are <strong>so many</strong> animals in the ocean that we do not know them all yet.',
              ] },
            { ico:'B', bg:'rgba(202,138,4,.12)', title:'such … that Örnekleri',
              examples:[
                  'The book Don Quixote is <strong>such a masterpiece</strong> that its writer, Miguel de Cervantes, deserves all the praise.',
                  'It was <strong>such a nice movie</strong> that I felt more confident after I watched it.',
                  'I have <strong>such a little</strong> money saved up that I am planning to use for a short holiday.',
              ] },
            { ico:'🔀', bg:'rgba(124,58,237,.12)', title:'İnversion (Devrik) Yapı',
              desc:'"so" veya "such" cümle başına alınırsa cümle devrik yapıda kurulur.',
              examples:[
                  '<strong>So attractive was the teacher</strong> that throughout the lesson, the students were engaged.',
                  '<strong>Such a masterpiece is the book</strong> Don Quixote that all the praise is deserved by its writer Miguel de Cervantes.',
              ] },
        ]);
}

/* ════════ COMPARISON ════════ */
function aaComparison() {
    return aaH('📊 Karşılaştırma', 'Comparison — "-er" / "more"', 'İki nesne, kişi veya durumu karşılaştırmak için kullanılır.')
        + aaBox('yellow','📐 Kural',[
            '• <strong>Tek heceli</strong> ya da bazı iki heceli sıfatlar → <strong>-er</strong> takısı + than',
            '• <strong>Daha fazla heceli</strong> ve sonu <strong>"-ing, -ed, -s"</strong> ile biten sıfatlar → <strong>more</strong> + than',
            '• Karşılaştırma yaparken sonu <strong>-ly</strong> ile biten zarflar → <strong>more</strong> şeklinde kullanılır.',
        ])
        + aaTable(
            ['-er Kullananlar', 'Comparative', 'more Kullananlar', 'Comparative'],
            [
                ['big', '<strong>bigger</strong>', 'interesting', '<strong>more interesting</strong>'],
                ['tall', '<strong>taller</strong>', 'exhausted', '<strong>more exhausted</strong>'],
                ['short', '<strong>shorter</strong>', 'quickly', '<strong>more quickly</strong>'],
                ['fast', '<strong>faster</strong>', 'carefully', '<strong>more carefully</strong>'],
            ]
        );
}

/* ════════ AS…AS ════════ */
function aaAsAs() {
    return aaH('⚖️ Eşitlik Karşılaştırması', 'as…as / so…as / the same as', '"…kadar" anlamı — iki şeyin eşitliğini veya benzerliğini ifade eder.')
        + aaAcc([
            { ico:'1', bg:'rgba(5,150,105,.12)', title:'as … as / so … as',
              notes:[
                  '<strong>"as…as"</strong> → olumlu ve olumsuz cümlelerde kullanılır.',
                  '<strong>"so…as"</strong> → sadece <strong>olumsuz</strong> cümlelerde kullanılır.',
              ],
              examples:[
                  'Turkey should have an education system <strong>as well-structured as</strong> Europe\'s.',
                  'She is not <strong>so skilled as</strong> her mentor.',
              ] },
            { ico:'2', bg:'rgba(5,150,105,.12)', title:'the same as',
              desc:'"the same as" yapısı da aynı anlama sahip olup "the same + noun + as" ve "the same" kullanımı da mevcuttur.',
              examples:[
                  'Turkey should have an education system <strong>the same as</strong> Europe\'s.',
                  'My husband and I have <strong>the same</strong> music taste.',
                  'The same t-shirt <strong>as</strong> mine.',
              ] },
        ]);
}

/* ════════ SIMILAR ════════ */
function aaSimilar() {
    return aaH('🔄 Benzerlik & Farklılık', 'similar to / different from / as / like', 'Karşılaştırma yaparken kullanılan edatlar.')
        + aaTable(
            ['İfade', 'Türkçe', 'Kullanım'],
            [
                ['<strong>similar to</strong>', 'benzer', '+ isim / noun phrase'],
                ['<strong>different from</strong>', 'farklı', '+ isim / noun phrase'],
                ['<strong>as</strong>', '"gibi" / "olarak"', 'Ardından <strong>özne + fiil</strong> alır; "olarak" anlamı da taşır'],
                ['<strong>like</strong>', '"gibi"', 'Ardından <strong>isim / noun phrase</strong> alır'],
            ]
        )
        + aaAcc([
            { ico:'🔄', bg:'rgba(3,105,161,.12)', title:'Örnekler',
              examples:[
                  'Italy\'s culinary culture is <strong>similar to</strong> Spain\'s because both countries have Mediterranean-style food.',
                  'South Korea is <strong>different from</strong> North Korea.',
                  'I handled all the problems <strong>as</strong> you told me.',
                  'As your teacher, I want you to be successful. (<strong>as</strong> = "olarak")',
                  '<strong>Like</strong> me, my little brother always defends himself against injustice.',
              ] }
        ]);
}

/* ════════ THE MORE ════════ */
function aaTheMore() {
    return aaH('📈 Paralel Artış', 'the more … the more', 'Cümleye "ne kadar … o kadar" anlamı katar.')
        + aaBox('purple','📐 Yapı',[
            '<strong>The + comparative, the + comparative</strong>',
            '',
            '→ Birinci cümledeki artış ikinci cümledeki artışı doğrudan etkiler.',
        ])
        + aaAcc([
            { ico:'📈', bg:'rgba(124,58,237,.12)', title:'Örnekler',
              examples:[
                  '<strong>The more</strong> you practice, <strong>the more</strong> you learn.',
                  '<strong>The richer</strong> you are, <strong>the better</strong> your opportunities.',
                  '<strong>The harder</strong> you work, <strong>the more successful</strong> you become.',
              ] }
        ]);
}

/* ════════ SUPERLATIVES ════════ */
function aaSuperlatives() {
    return aaH('🏆 Üstünlük', 'Superlatives', 'Üç veya daha fazla nesne, kişi veya durumu karşılaştırırken "en üstünlük" anlamı katmak için kullanılır.')
        + aaBox('yellow','📐 Yapı',[
            '• Tek heceli sıfatlar → <strong>the + …est</strong>',
            '• Çok heceli sıfatlar → <strong>the most + …</strong>',
            '• "the most"\'un zıt anlamı → <strong>the least</strong>',
            '',
            '• <strong>Of all</strong> (hepsinin ardından), <strong>by far</strong>, <strong>among</strong>, <strong>quite</strong>, <strong>much</strong>, <strong>in (place)</strong> kalıpları ile de kullanılabilir.',
            '• <strong>"my, your, those"</strong> ile kullanılabilir → <strong>"the"</strong> kalkar.',
        ])
        + aaAcc([
            { ico:'🏆', bg:'rgba(180,83,9,.12)', title:'Örnekler',
              examples:[
                  'Beyonce is one of <strong>the most popular</strong> women singers in the world.',
                  'According to the Guinness Book of World Records, Sultan Kösem is <strong>the longest</strong> man.',
                  'She had <strong>the least</strong> experience among us.',
                  '<strong>Of all</strong> the students, she is the most clever.',
                  'William Shakespeare is <strong>by far</strong> the best writer in the art world.',
                  '<strong>My biggest</strong> dream was to be an English teacher. ("the" kalkar)',
              ] }
        ]);
}

/* ════════ EXERCISES ════════ */
var AA_BLANKS = [
    { q:'After a ___ day at school, I feel so tired. (participle adjective)',
      ans:['tiring'], hint:'"tiring" = yorucu (duygunun kaynağı → present participle)' },
    { q:'She sings ___. (good/well — irregular adverb)',
      ans:['well'], hint:'"good" sıfat, "well" zarftır' },
    { q:'The weather turned ___ suddenly. (linking verb + adjective)',
      ans:['cold'], hint:'"turn" + sıfat → değişim ifade eder' },
    { q:'Students could ___ answer any questions. (hardly/barely)',
      ans:['hardly','barely','scarcely'], hint:'"hardly" = neredeyse hiç (olumsuz anlam)' },
    { q:'The tea is ___ hot to drink right now. (too/very/enough)',
      ans:['too'], hint:'"too" → gereğinden fazla, olumsuz sonuç' },
    { q:'Turkey should have an education system ___ well-structured ___ Europe\'s. (as…as)',
      ans:['as','as…as'], hint:'"as … as" = …kadar (eşitlik)' },
    { q:'The book Don Quixote is ___ a masterpiece that its writer deserves all the praise.',
      ans:['such'], hint:'"such + a/an + sıfat + isim + that"' },
    { q:'The experiment was carried out so carefully ___ the results were highly exact.',
      ans:['that'], hint:'"so … that" = o kadar … ki' },
    { q:'Italy\'s culinary culture is ___ to Spain\'s. (benzerlik)',
      ans:['similar'], hint:'"similar to" = benzer' },
    { q:'___ more you practice, ___ more you learn. (paralel artış)',
      ans:['The','the'], hint:'"The more … the more" kalıbı' },
];

var AA_MCQS = [
    { q:'The pillow feels ___. (linking verb)',
      opts:['softly','soft','more softly','softer'],
      cor:'b', hint:'"feel" linking verb → ardından sıfat gelir' },
    { q:'She is a ___ marathon runner. My mom drives ___.',
      opts:['fast / fast','fast / fastly','fastly / fast','fast / faster'],
      cor:'a', hint:'"fast" hem sıfat hem zarf olarak aynı kalır' },
    { q:'The documentary about ancient people was ___ . We were ___ by the stories.',
      opts:['fascinated / fascinating','fascinating / fascinated','fascinated / fascinated','fascinating / fascinating'],
      cor:'b', hint:'-ing = duygunun kaynağı (belgesel) / -ed = duyguyu yaşayan (biz)' },
    { q:'Nowadays, I am ___ busy. (oldukça — olumsuz vurgu)',
      opts:['fairly','quite','rather','very'],
      cor:'c', hint:'"rather" daha güçlü ve hafif olumsuz vurgu içerir' },
    { q:'South Korea is ___ North Korea.',
      opts:['similar to','different from','the same as','as well as'],
      cor:'b', hint:'"different from" = …dan farklı' },
    { q:'"the most"\'un zıt anlamı nedir?',
      opts:['the least','the less','the fewer','the worst'],
      cor:'a', hint:'"the most"\'un zıddı "the least"tir' },
    { q:'___ attractive was the teacher that the students were engaged. (inversion)',
      opts:['Very','Such','So','Too'],
      cor:'c', hint:'"So + adj + was + özne" = inversion yapısı' },
    { q:'She is not ___ skilled as her mentor. (olumsuz eşitlik)',
      opts:['as','so','more','too'],
      cor:'b', hint:'"so…as" → yalnızca olumsuz cümlelerde kullanılır' },
];

function aaExercises() {
    var blankCards = AA_BLANKS.map(function(q, i) {
        return '<div class="gr-q-card" id="aaq-b' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM A</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<input class="gr-q-inp aa-inp" id="aa-inp-' + i + '" placeholder="doğru yapıyı yaz…" autocomplete="off"><br>'
            + '<button class="gr-chk-btn" style="border-color:#7c3aed;color:#7c3aed" onclick="aaCheckBlank(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="aa-fb-b' + i + '"></div>'
            + '</div>';
    }).join('');

    var mcqCards = AA_MCQS.map(function(q, i) {
        var opts = q.opts.map(function(o, j) {
            var letter = ['A','B','C','D'][j];
            var lv = ['a','b','c','d'][j];
            return '<div class="gr-opt" id="aa-opt-' + i + '-' + j + '" onclick="aaSelectOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');
        return '<div class="gr-q-card" id="aaq-m' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM B</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#7c3aed;color:#7c3aed" onclick="aaCheckMCQ(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="aa-fb-m' + i + '"></div>'
            + '</div>';
    }).join('');

    return aaH('✨ Pratik Yap', 'Alıştırmalar', AA_TOTAL + ' soruluk interaktif test. Adjectives & Adverbs.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="aa-live-score">0 / ' + AA_TOTAL + '</span></div>'
        + '<div class="gr-q-sec-hd">Bölüm A — Boşluk Doldurma</div>'
        + blankCards
        + '<div class="gr-q-sec-hd" style="margin-top:20px">Bölüm B — Çoktan Seçmeli</div>'
        + mcqCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#7c3aed,#a78bfa)" onclick="aaSubmitAll()">🎯 Tümünü Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="aa-result">'
        + '<div class="gr-res-score" id="aa-res-score" style="color:#7c3aed">0/' + AA_TOTAL + '</div>'
        + '<div class="gr-res-lbl">Toplam Puan</div>'
        + '<div class="gr-res-msg" id="aa-res-msg"></div>'
        + '<button class="gr-retry-btn" style="border-color:#7c3aed;color:#7c3aed" onclick="_aaRenderSection(\'exercises\')">🔄 Tekrar Dene</button>'
        + '</div></div>';
}

/* ════════ EXERCISE LOGIC ════════ */
function _aaUpdScore() {
    var el = document.getElementById('aa-live-score');
    if (el) el.textContent = _aaScore + ' / ' + AA_TOTAL;

    if (typeof saveGrammarScore === 'function') saveGrammarScore('aa', _aaScore);
}

function aaCheckBlank(i) {
    var inp  = document.getElementById('aa-inp-' + i);
    var fb   = document.getElementById('aa-fb-b' + i);
    var card = document.getElementById('aaq-b' + i);
    if (!inp || !fb) return;
    var val = inp.value.trim().toLowerCase().replace(/\s+/g,' ');
    if (!val) { fb.textContent = 'Bir cevap girin!'; fb.className = 'gr-fb show bad'; return; }
    var correct = AA_BLANKS[i].ans.map(function(a){ return a.toLowerCase().trim(); });
    if (correct.indexOf(val) !== -1) {
        inp.classList.add('ok'); card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + AA_BLANKS[i].ans[0];
        fb.className = 'gr-fb show ok';
        if (!_aaChecked['b'+i]) { _aaScore++; _aaChecked['b'+i] = true; _aaUpdScore(); }
    } else {
        inp.classList.add('bad'); card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + AA_BLANKS[i].ans[0] + ' — ' + AA_BLANKS[i].hint;
        fb.className = 'gr-fb show bad';
        if (!_aaChecked['b'+i]) _aaChecked['b'+i] = 'wrong';
    }
}

function aaSelectOpt(qi, oi, letter) {
    AA_MCQS[qi].opts.forEach(function(_, j) {
        var el = document.getElementById('aa-opt-' + qi + '-' + j);
        if (el) el.classList.remove('sel');
    });
    var el = document.getElementById('aa-opt-' + qi + '-' + oi);
    if (el) el.classList.add('sel');
    _aaAnswers['m'+qi] = letter;
}

function aaCheckMCQ(i) {
    var q    = AA_MCQS[i];
    var sel  = _aaAnswers['m'+i];
    var fb   = document.getElementById('aa-fb-m' + i);
    var card = document.getElementById('aaq-m' + i);
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    var letters = ['a','b','c','d'];
    q.opts.forEach(function(_, j) {
        var el = document.getElementById('aa-opt-' + i + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_aaChecked['m'+i]) { _aaScore++; _aaChecked['m'+i] = true; _aaUpdScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_aaChecked['m'+i]) _aaChecked['m'+i] = 'wrong';
    }
}

function aaSubmitAll() {
    var panel   = document.getElementById('aa-result');
    var scoreEl = document.getElementById('aa-res-score');
    var msgEl   = document.getElementById('aa-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _aaScore + '/' + AA_TOTAL;
    var pct = Math.round((_aaScore / AA_TOTAL) * 100);
    msgEl.textContent = pct >= 87 ? '🎉 Mükemmel! Adjectives & Adverbs konusuna tam hâkimsin!'
                      : pct >= 65 ? '👏 Çok iyi! Participle adjectives ve comparison kalıplarını biraz daha gözden geçir.'
                      : pct >= 44 ? '📚 İyi başlangıç. so/such/as…as kalıpları ile irregular adverb bölümlerine tekrar bak!'
                      : '💪 Daha fazla pratik yapalım. Genel bakış kartlarından başla!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════ GLOBALS ════════ */
window.openAdjAdvSection = openAdjAdvSection;
window._aaRenderSection  = _aaRenderSection;
window.aaCheckBlank      = aaCheckBlank;
window.aaSelectOpt       = aaSelectOpt;
window.aaCheckMCQ        = aaCheckMCQ;
window.aaSubmitAll       = aaSubmitAll;
