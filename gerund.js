// ════════════════════════════════════════════════════════════════
// gerund.js  —  Gerunds & Infinitives Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Gerunds & Infinitives notları (s. 74–81)
// ════════════════════════════════════════════════════════════════

let _grdCurrentSection = 'overview';
let _grdAnswers = {};
let _grdChecked = {};
let _grdScore = 0;
const GRD_TOTAL = 16;

const GRD_SECTIONS = [
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

const GRD_DOT = {
    'Genel':         '#6366f1',
    'Gerund':        '#d97706',
    'Infinitive':    '#0369a1',
    'Karşılaştırma': '#7e22ce',
    'Özel':          '#e63946'
};

/* ════════ ENTRY POINT — GrammarModule engine ════════ */

/* ════════ HELPERS ════════ */
/* ════════ ENTRY POINT ════════ */
function grdH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#78350f 0%,#d97706 60%,#fbbf24 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function grdSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function grdTable(headers, rows) {
    const ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    const trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function grdAcc(items) {
    const cards = items.map(function(it) {
        const exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #d97706"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        const noteHtml = (it.notes||[]).map(function(n){
            return '<div style="background:#fef9c3;border:1.5px solid #fcd34d;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:.8rem;color:#713f12;line-height:1.7">'
                + n + '</div>';
        }).join('');
        const descHtml = it.desc ? '<p class="gr-acc-desc">' + it.desc + '</p>' : '';
        return '<div class="gr-acc" data-toggle-class="open">'
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
    const styles = {
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        orange: 'background:#fff7ed;border:2px solid #ea580c;color:#7c2d12',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239'
    };
    const content = lines.map(function(l){
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
    const cards = [
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

    const cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.bd + ';border-radius:14px;padding:16px;background:' + c.bc + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' data-action="_grdRenderSection(\'' + c.id + '\')">'
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
        + '<button data-action="_grdRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#d97706,#fbbf24);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button>'
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
    const list = [
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
    const pillHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 36px 24px;">'
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
    const verbs = [
        'Admit','Anticipate','Appreciate','Complete','Consider','Delay','Deny','Detest','Discuss','Disslike',
        'Enjoy','Fancy','Finish','Hate','Imagine','Involve','Justify','Mention','Mind','Practise',
        'Postpone','Remember','Recommend','Recall','Resent','Report','Risk','Suggest','Stop','Tolerate'
    ];
    const pillHtml = '<div style="display:flex;flex-wrap:wrap;gap:8px;padding:0 36px 24px;">'
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
    const nouns  = ['Ability','Attempt','Chance','Decision','Desire','Determination','Dream','Effort','Goal','Need','Offer','Plan','Permission','Proposal','Refusal','Request','Suggestion','Tendency','Wish','Way'];
    const verbs  = ['Afford','Agree','Arrange','Ask','Attempt','Care','Decide','Demand','Deserve','Expect','Fail','Happen','Hesitate','Hope','Offer','Prepare','Pretend','Proceed','Promise','Propose','Prove','Seem','Struggle','Volunteer'];

    const nHtml = nouns.map(function(v){ return '<span style="background:#dbeafe;color:#1e3a8a;border:1px solid #93c5fd;border-radius:8px;padding:4px 12px;font-size:.8rem;font-weight:600;">' + v + '</span>'; }).join(' ');
    const vHtml = verbs.map(function(v){ return '<span style="background:#ede9fe;color:#4c1d95;border:1px solid #c4b5fd;border-radius:8px;padding:4px 12px;font-size:.8rem;font-weight:600;">' + v + '</span>'; }).join(' ');

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
    const rows = [
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

    const tableHtml = '<div class="gr-tbl-wrap"><table class="gr-tbl">'
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
const GRD_BLANKS = [
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

const GRD_MCQS = [
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

/* ════════ EXERCISES — SET SİSTEMİ ════════ */
const GRD_SETS = [
    {
        label: 'Set 1 — ÖYS & Test 1',
        questions: [
            {q:'It was his own fault, but I couldn\'t help ___ sorry for him. (ÖYS 1989)',
             opts:['feel','to feel','having felt','feeling','to have felt'],
             cor:'d', hint:'"can\'t help + V+ing" = yapamamak, elinden gelmemek'},
            {q:'The medical authorities warned everyone ___ the water without first ___ it. (ÖYS 1990)',
             opts:['had drunk / being boiled','to drink / having boiled','drank / having had to boil','drinking / having to boil','not to drink / boiling'],
             cor:'e', hint:'"warn + not to V₁" / "without + V+ing"'},
            {q:'Most people talk too much and don\'t realize how important ___ is. (ÖYS 1991)',
             opts:['have to listen','to be listened','have listened','listening','to be listening'],
             cor:'d', hint:'"how important V+ing is" — gerund özne olarak'},
            {q:'If you\'ve finished ___ the dictionary, I\'d like ___ it. (ÖYS 1992)',
             opts:['use / to have borrowed','to use / borrowing','to have used / having borrowed','having used / borrow','using / to borrow'],
             cor:'e', hint:'"finish + V+ing" / "would like + to V₁"'},
            {q:'Would you mind ___? (ÖYS 1993)',
             opts:['that I am reading aloud','what causes you a lot of trouble','explaining it once again please','to bring the books back by tomorrow','how much you spent on accommodation'],
             cor:'c', hint:'"mind + V+ing" — sadece gerund alır'},
            {q:'She didn\'t mind ___ her hair wet in the rain. (ÖYS 1995)',
             opts:['get','to get','in getting','to have got','getting'],
             cor:'e', hint:'"mind + V+ing"'},
            {q:'The child was naturally very upset when he saw his new ball ___ out to sea. (ÖYS 1996)',
             opts:['having carried','to have carried','being carried','to be carried','carrying'],
             cor:'c', hint:'"see + obj + being V₃" — nesne eylemi edilgen ve süregelen'},
            {q:'The terrorist group is known ___ an extensive supply of weapons.',
             opts:['to have','having','having had','to be having','have had'],
             cor:'a', hint:'"is known to have" — stative verb ile simple infinitive'},
            {q:'Please play something else instead of Chris Rea. His music is too slow ___ at a party.',
             opts:['playing','to play','played','having played','being played'],
             cor:'b', hint:'"too + adj + to V₁" yapısı'},
            {q:'___ the cottages, we raised enough money to renovate the manor house.',
             opts:['For selling','By selling','To have sold','On being sold','Not being sold'],
             cor:'b', hint:'"By + V+ing" = nasıl yapıldığını gösteren vasıta edatı'},
        ]
    },
    {
        label: 'Set 2 — Test 1',
        questions: [
            {q:'As Sheila is moving house on Monday, she\'s asked me ___ her ___ up all her belongings.',
             opts:['helping / packing','help / having packed','to help / pack','to be helped / to pack','help / to be packing'],
             cor:'c', hint:'"ask + to V₁" / "help + obj + V₁ (bare)"'},
            {q:'My son scribbled on the wall. I\'ve tried ___ it, but that didn\'t work, so I intend ___ the kitchen.',
             opts:['to clean / repaint','having cleaned / repainted','to have cleaned / repainting','cleaning / to repaint','clean / being repainted'],
             cor:'d', hint:'"try + V+ing" (deneme) / "intend + to V₁"'},
            {q:'The rebels try ___ the village people ___ them by cutting off inhabitants\' hands.',
             opts:['making / obeyed','to have made / to obey','having made / obeying','make / to be obeying','to make / obey'],
             cor:'e', hint:'"try + to V₁" (amaç) / "make + obj + V₁ (bare)"'},
            {q:'When you telephone Lisa ___ her of the meeting, make it clear we don\'t blame her ___ the order.',
             opts:['to have informed / to lose','informing / to have lost','having informed / about losing','to be informed / on losing','to inform / for losing'],
             cor:'e', hint:'"telephone + to V₁" / "blame sb for + V+ing"'},
            {q:'I will be sorry ___ this company, but I was offered an opportunity ___ in a field I really enjoy.',
             opts:['leaving / to have worked','to leave / to work','having left / about working','with leaving / for working','to have left / work'],
             cor:'b', hint:'"sorry + to V₁" (gelecek üzüntüsü) / "opportunity + to V₁"'},
            {q:'I was surprised at the low level of service as I had believed them ___ a respected company.',
             opts:['be','being','to be','having been','have been'],
             cor:'c', hint:'"believe + obj + to be" — object complement'},
            {q:'There is no point in going ___ when you haven\'t got enough money ___ anything.',
             opts:['to shop / on buying','to be shopping / for buying','shop / having bought','shopping / to buy','having shopped / to be buying'],
             cor:'d', hint:'"go + V+ing" (aktivite) / "enough money + to V₁"'},
            {q:'It will cost too much money ___ a full colour leaflet. The agency has advised us to have one ___ in black and white.',
             opts:['producing / being produced','produced / to produce','to produce / produced','to be producing / producing','having produced / produce'],
             cor:'c', hint:'"cost + to V₁" / "have + obj + V₃" (passive causative)'},
            {q:'Your willingness ___ new things resulted in your ___ this management training.',
             opts:['learning / to be offered','to have learnt / for offering','learn / to have offered','to learn / being offered','learnt / having been offered'],
             cor:'d', hint:'"willingness + to V₁" / "result in + V+ing (passive)"'},
            {q:'I don\'t think it is a good time ___ Linda. She\'ll be busy ___ thirty exam papers this evening.',
             opts:['visiting / to mark','to have visited / mark','for visiting / to be marked','to visit / marking','to be visiting / having marked'],
             cor:'d', hint:'"good time + to V₁" / "be busy + V+ing"'},
        ]
    },
    {
        label: 'Set 3 — Test 1',
        questions: [
            {q:'She was furious when she found her younger sister ___ on her clothes.',
             opts:['try','being tried','to trying','on trying','trying'],
             cor:'e', hint:'"find + obj + V+ing" — nesne yaparken bulmak'},
            {q:'It is a lovely drawing, but I think it needs ___ to look its best.',
             opts:['to frame','to be framed','to have framed','being framed','framed'],
             cor:'b', hint:'"need + to be V₃" veya "need + V+ing" — burada to be framed daha doğru'},
            {q:'The new football stadium is said ___ seating for 100,000 spectators.',
             opts:['to have','having','had','to have had','have'],
             cor:'a', hint:'"is said to have" — stative (sahip olmak), simple infinitive'},
            {q:'I managed ___ the tall bottle of cola into the refrigerator ___ the middle shelf.',
             opts:['fitting / to move','to fit / by moving','being fitted / to be moving','by fitting / to have moved','for fitting / moving'],
             cor:'b', hint:'"manage + to V₁" / "by + V+ing"'},
            {q:'The rebels are estimated ___ tens of thousands of civilians during the civil war.',
             opts:['killed','to kill','to have killed','killing','being killed'],
             cor:'c', hint:'"estimated to have V₃" — geçmişe ait eylem, perfect infinitive'},
            {q:'Sonia got accustomed to her job quickly because, apart from ___ richer patients, it is similar to ___ for the health authority.',
             opts:['to have / work','have / be worked','to have had / worked','having / working','had / having worked'],
             cor:'d', hint:'"apart from + V+ing" / "similar to + V+ing"'},
            {q:'I saw her ___ the building, but I don\'t know if she intends ___ later today.',
             opts:['to leave / returning','leave / to have returned','leaving / to return','left / to be returned','to be leaving / return'],
             cor:'c', hint:'"see + obj + V+ing" (anlık) / "intend + to V₁"'},
            {q:'I was worried about my sister\'s ___ divorced, and for days, I couldn\'t help ___ how she\'d cope.',
             opts:['get / to wonder','getting / wondering','to get / wonder','to have got / having wondered','having got / wondered'],
             cor:'b', hint:'"worried about + V+ing" / "can\'t help + V+ing"'},
            {q:'I was unable to help my friends ___ for Help the Aged because my boss had asked me ___ that Saturday.',
             opts:['to campaign / work','campaigning / worked','campaign / to work','being campaigned / working','campaigned / to have worked'],
             cor:'c', hint:'"help + obj + V₁ (bare)" / "ask + obj + to V₁"'},
            {q:'I started my journey without ___ at the map, but I soon regretted ___ so.',
             opts:['looking / doing','to look / to do','look / to have done','having looked / do','looked / having done'],
             cor:'a', hint:'"without + V+ing" / "regret + V+ing" (geçmiş pişmanlık)'},
        ]
    },
    {
        label: 'Set 4 — Test 1',
        questions: [
            {q:'Johnny, will you stop ___ your father so many questions? He\'s busy ___ out his tax return.',
             opts:['to have asked / to fill','asked / to have filled','to be asked / fill','to ask / to be filling','asking / filling'],
             cor:'e', hint:'"stop + V+ing" (bırakmak) / "be busy + V+ing"'},
            {q:'Veronica is so vain that every time she passes a mirror, she stops ___ at her reflection.',
             opts:['looking','looked','having looked','to look','to have looked'],
             cor:'d', hint:'"stop + to V₁" (başka şey için durmak)'},
            {q:'The workers would be even willing ___ lower wages if it meant the factory ___ open.',
             opts:['accepting / stayed','to accept / staying','accept / to have stayed','accepted / having stayed','to have accepted / stay'],
             cor:'b', hint:'"willing + to V₁" / "mean + V+ing" (gerektirmek)'},
            {q:'My clearest memory is of ___ with the street dogs and I also remember ___ to the beach.',
             opts:['to play / to have gone','play / having gone','playing / going','played / gone','having played / to go'],
             cor:'c', hint:'"memory of + V+ing" / "remember + V+ing" (geçmişi hatırlamak)'},
            {q:'___ when I don\'t feel well is the worst thing about acting in stage plays.',
             opts:['Perform','By performing','Performing','For performing','Performed'],
             cor:'c', hint:'Gerund özne: "Performing... is the worst thing"'},
            {q:'Innocent people deserve ___ from the gunmen and thieves in the area.',
             opts:['to be protected','to have protected','having protected','for protecting','to protect'],
             cor:'a', hint:'"deserve + to be V₃" — edilgen infinitive'},
            {q:'Asbestos is thought ___ around the time of Aristotle, and was used ___ fireproof clothing.',
             opts:['to have discovered / to making','being discovered / making','having been discovered / make','to discover / to have made','to have been discovered / to make'],
             cor:'e', hint:'"thought to have been V₃" (passive perfect) / "used + to V₁" (amaç)'},
            {q:'It was such an unruly class that the teacher struggled just ___ order, but she endeavoured ___ students willing to learn.',
             opts:['keeping / teach','keep / teaching','to have kept / taught','to be kept / having taught','to keep / to teach'],
             cor:'e', hint:'"struggle + to V₁" / "endeavour + to V₁"'},
            {q:'Some countries spend so much of their annual budgets ___ interests on loans that there is little left with which ___ social problems.',
             opts:['paying / to tackle','pay / to have tackled','to pay / tackling','paid / having tackled','to be paying / tackle'],
             cor:'a', hint:'"spend + V+ing" / "with which + to V₁"'},
            {q:'He regretted ___ the contract without ___ the small print on the back of the form.',
             opts:['to sign / to read','signing / reading','having signed / read','sign / to have read','signed / having read'],
             cor:'b', hint:'"regret + V+ing" (geçmiş) / "without + V+ing"'},
        ]
    },
    {
        label: 'Set 5 — Test 1 & 2',
        questions: [
            {q:'I think Julia dislikes ___ the documents although she claims ___ it willingly.',
             opts:['file / having done','filed / to be doing','filing / to do','to file / doing','to be filed / done'],
             cor:'c', hint:'"dislike + V+ing" / "claim + to V₁"'},
            {q:'The Egyptian Pharaoh Akhnaten is thought ___ the inspiration behind Moses.',
             opts:['to have been','had been','having been','about being','have been'],
             cor:'a', hint:'"is thought to have been" — perfect passive infinitive'},
            {q:'There is no point in ___ the washing out because it keeps ___ with rain.',
             opts:['to hang / to shower','hanging / showering','hang / shower','hung / having showered','having hung / showered'],
             cor:'b', hint:'"no point in + V+ing" / "keep + V+ing"'},
            {q:'I dislike spending my time ___, so I prefer ___ clothes made from synthetic fabrics.',
             opts:['to iron / to buy','ironed / bought','ironing / buying','iron / being bought','having ironed / buy'],
             cor:'c', hint:'"dislike + V+ing" / "prefer + V+ing"'},
            {q:'Don\'t you think the assistant deserves ___ a day off after working so hard at the exhibition?',
             opts:['to give','giving','to be given','gave','having given'],
             cor:'c', hint:'"deserve + to be V₃" — edilgen, nesne pozisyonunda'},
            {q:'In my opinion, it\'s ridiculous ___ a computer as a present for a three-year-old child.',
             opts:['bought','buy','having bought','being bought','to buy'],
             cor:'e', hint:'"it is + adj + to V₁" yapısı'},
            {q:'I don\'t think I would enjoy ___ a cricket match as I don\'t understand the rules.',
             opts:['to watch','being watched','having watched','watching','watch'],
             cor:'d', hint:'"enjoy + V+ing"'},
            {q:'Because they both work at the family\'s flower shop, they have agreed ___ about flowers at weekends.',
             opts:['not to talk','not talking','haven\'t talked','not talk','don\'t talk'],
             cor:'a', hint:'"agree + not to V₁" (olumsuz infinitive)'},
            {q:'___ the old hospital would cost £1 million, so the council are considering ___ the building to developers.',
             opts:['Demolishing / selling','To demolish / to sell','Demolished / to have sold','Having demolished / sell','Being demolished / having sold'],
             cor:'a', hint:'Gerund özne / "consider + V+ing"'},
            {q:'Being able to think quickly is essential ___ speakers simultaneously.',
             opts:['to be translated','having translated','for translating','being translated','translated'],
             cor:'c', hint:'"essential for + V+ing" (preposition sonrası gerund)'},
        ]
    },
    {
        label: 'Set 6 — Test 2',
        questions: [
            {q:'In order to save money and energy, we are going to have double glazed windows ___.',
             opts:['having installed','install','to install','installed','installing'],
             cor:'d', hint:'"have + obj + V₃" = causative passive (yaptırmak)'},
            {q:'In his performance against Brazil, he proved himself ___ a skilled player.',
             opts:['was','be','having been','being','to be'],
             cor:'e', hint:'"prove + obj + to be" — infinitive complement'},
            {q:'After the game, the players sat around ___ themselves on their performance.',
             opts:['being congratulated','congratulate','congratulating','to have congratulated','congratulated'],
             cor:'c', hint:'"sit around + V+ing" — eşzamanlı eylem'},
            {q:'The photographs were too dark ___ on the company\'s web site, so he\'ll have to get some ___ professionally.',
             opts:['using / to be taken','to be used / taken','to use / taking','use / to take','being used / take'],
             cor:'b', hint:'"too dark + to be used" (edilgen) / "get + obj + V₃" (causative)'},
            {q:'The director of the play still hasn\'t decided whom ___ in the role of the hero.',
             opts:['casting','to cast','cast','having cast','being cast'],
             cor:'b', hint:'"decide + wh- + to V₁" (indirect question)'},
            {q:'Why don\'t you go and ask a chemist ___ something ___ dry skin?',
             opts:['recommending / soothed','having recommended / soothe','recommend / having soothed','to recommend / to soothe','recommended / soothing'],
             cor:'d', hint:'"ask + obj + to V₁" / "to soothe" (amaç infinitive)'},
            {q:'The problem with Simon is that he thinks he can succeed ___ a degree without ___ any lectures.',
             opts:['gaining / having attended','to gain / to have attended','on gaining / attended','for gaining / to attend','in gaining / attending'],
             cor:'e', hint:'"succeed in + V+ing" / "without + V+ing"'},
            {q:'We have decided ___ a new Ford Focus, but we are not certain about which colour ___.',
             opts:['buying / choosing','bought / chosen','having bought / choose','to have bought / be chosen','to buy / to choose'],
             cor:'e', hint:'"decide + to V₁" / "which colour + to V₁" (indirect question)'},
            {q:'Wearing high-heeled shoes can result in women ___ too much pain from their feet ___ in active work.',
             opts:['to suffer / continuing','suffer / having continued','suffering / to continue','suffered / not to continue','having suffered / not continuing'],
             cor:'c', hint:'"result in + V+ing" / "too much pain + to continue"'},
            {q:'His daughter persuaded him ___ his heart operation in a private hospital as she could see his condition ___ worse daily.',
             opts:['to have / getting','from having / to get','having had / get','to be having / to have got','have / having been getting'],
             cor:'a', hint:'"persuade + to V₁" / "see + obj + V+ing" (süregelen)'},
        ]
    },
    {
        label: 'Set 7 — Test 2',
        questions: [
            {q:'I knew the answer, but I didn\'t press the buzzer quickly enough ___ the prize.',
             opts:['winning','to win','win','won','being won'],
             cor:'b', hint:'"enough + to V₁" = yeterince hızlı'},
            {q:'Robert didn\'t work carefully, and the boss had even threatened ___ him if he didn\'t improve.',
             opts:['sacking','being sacked','to be sacked','to sack','to have sacked'],
             cor:'d', hint:'"threaten + to V₁"'},
            {q:'I\'d love ___ on my own, but I simply can\'t afford ___ my own flat.',
             opts:['to live / to have','living / having','live / to be having','having lived / have','to have lived / having had'],
             cor:'a', hint:'"would love + to V₁" / "afford + to V₁" (to have = sahip olmak)'},
            {q:'The receptionist never minds ___ with sending out the new catalogues.',
             opts:['to help','to have helped','to be helping','have helped','helping'],
             cor:'e', hint:'"mind + V+ing"'},
            {q:'The manager likes ___ on all pricing decisions.',
             opts:['to have consulted','having consulted','to be consulting','to be consulted','having been consulting'],
             cor:'d', hint:'"like + to be V₃" — yönetici danışılmayı istiyor (edilgen)'},
            {q:'I am hoping ___ for the school basketball team next week.',
             opts:['picking','to be picked','to pick','picked','pick'],
             cor:'b', hint:'"hope + to be V₃" — seçilmeyi ummak (edilgen)'},
            {q:'Your hair needs ___ before you go back to school.',
             opts:['to cut','being cut','cutting','having cut','to be cutting'],
             cor:'c', hint:'"need + V+ing" = edilgen anlam (= needs to be cut)'},
            {q:'The social worker gave the students a talk ___ them against ___ drugs.',
             opts:['to warn / taking','having warned / to take','warning / taken','to have warned / take','warn / having taken'],
             cor:'a', hint:'"a talk + to V₁" (amaç) / "against + V+ing"'},
            {q:'He\'s not in the habit ___ lies, but he had to make up an excuse ___ the afternoon off for his job interview.',
             opts:['of telling / to take','to tell / to have taken','for telling / being taken','being told / taking','having told / to be taken'],
             cor:'a', hint:'"in the habit of + V+ing" / "excuse + to V₁"'},
            {q:'In the Middle Ages, surrounding a castle with a ditch proved ___ a successful technique ___ its security.',
             opts:['being / to be ensured','to have been / ensure','having been / of ensuring','have been / to ensure','to be / for ensuring'],
             cor:'e', hint:'"prove + to be" / "technique for + V+ing"'},
        ]
    },
    {
        label: 'Set 8 — Test 2',
        questions: [
            {q:'The most effective way ___ the destructiveness of earthquakes is ___ buildings capable of withstanding strong shaking.',
             opts:['reducing / being constructed','reduced / having constructed','to be reduced / constructing','to reduce / to construct','reduce / to be constructed'],
             cor:'d', hint:'"way + to V₁" / "is + to V₁" (infinitive predicate)'},
            {q:'The children were ___ giving up hope when someone phoned to say their dog had been found.',
             opts:['in the habit of','in return for','on the point of','for the sake of','in exchange for'],
             cor:'c', hint:'"on the point of + V+ing" = tam yapmak üzereyken'},
            {q:'___ a doorman at a hotel consists ___ greeting guests and taking them to their rooms.',
             opts:['To be / in','To have been / for','Being / of','Having been / about','Be / from'],
             cor:'c', hint:'"Being + noun" (gerund özne) / "consist of + V+ing"'},
            {q:'She should have apologised to him ___ spilling coffee down his suit.',
             opts:['about','with','of','for','by'],
             cor:'d', hint:'"apologise for + V+ing"'},
            {q:'Sheep have been so changed by breeding that their wild ancestors are hard ___.',
             opts:['identifying','being identified','to identify','identify','having identified'],
             cor:'c', hint:'"hard + to V₁" = yapmak zor'},
            {q:'Shopping for fruit and vegetables makes me ___ hungry.',
             opts:['to feel','feel','felt','feeling','to be feeling'],
             cor:'b', hint:'"make + obj + V₁ (bare)" — causative'},
            {q:'We haven\'t yet decided when ___ a meeting, so we\'ll let you ___ as soon as we\'ve fixed a date.',
             opts:['to hold / know','holding / to know','held / to be known','to have held / knowing','having held / known'],
             cor:'a', hint:'"when + to V₁" / "let + obj + V₁ (bare)"'},
            {q:'Tobacco was once thought ___ medicinal value.',
             opts:['being / to be having','is / had had','has been / having had','to have been / having','to be / to have'],
             cor:'e', hint:'"thought to be" (simple infinitive) / "to have" = sahip olmak'},
            {q:'His ability ___ well makes him a great teacher.',
             opts:['being communicated','communicated','having communicated','to communicate','communicating'],
             cor:'d', hint:'"ability + to V₁"'},
            {q:'We should appreciate ___ in the 20th century, when we have so many appliances ___ the hardships of our lives.',
             opts:['to be living / easing','having lived / being eased','living / to ease','to live / having eased','live / to be easing'],
             cor:'c', hint:'"appreciate + V+ing" / "appliances + to V₁" (amaç)'},
        ]
    },
    {
        label: 'Set 9 — Test 2 & 3',
        questions: [
            {q:'You don\'t appear ___ the formula. Do you want me ___ it once more?',
             opts:['having understood / explaining','understand / to have explained','to have understood / to explain','understood / to be explaining','understanding / having explained'],
             cor:'c', hint:'"appear + to have V₃" (geçmişte) / "want + obj + to V₁"'},
            {q:'My mother won\'t allow anyone ___ the living room until she finishes ___.',
             opts:['enter / to vacuum','to enter / vacuuming','entering / having vacuumed','entered / to be vacuuming','having entered / vacuum'],
             cor:'b', hint:'"allow + obj + to V₁" / "finish + V+ing"'},
            {q:'I saw him ___ his bike along the river this morning and he didn\'t mention anything about ___ his job.',
             opts:['riding / changing','having ridden / change','to be riding / to change','ride / to have changed','to ride / having changed'],
             cor:'a', hint:'"see + obj + V+ing" (anlık) / "mention + about + V+ing"'},
            {q:'I imagine Sally was about ___ when I asked her ___ a letter for me.',
             opts:['leaving / to have typed','to be leaving / typing','to leave / to type','to have left / type','having left / typed'],
             cor:'c', hint:'"be about + to V₁" / "ask + obj + to V₁"'},
            {q:'Don\'t you think we should consider ___ the chimney ___ before the winter?',
             opts:['to be getting / to sweep','to have got / sweep','having got / sweeping','to get / being swept','getting / swept'],
             cor:'e', hint:'"consider + V+ing" / "get + obj + V₃" (causative passive)'},
            {q:'In an emergency, even a child can save a life if he or she knows what ___.',
             opts:['to do','doing','being done','have done','having done'],
             cor:'a', hint:'"know what + to V₁" (indirect question)'},
            {q:'Knowledge of nutrition helps you ___ proper eating habits ___ a healthy life.',
             opts:['to develop / having maintained','developing / maintaining','developed / maintained','develop / to maintain','having developed / maintain'],
             cor:'d', hint:'"help + obj + V₁ (bare)" / "to maintain" (amaç infinitive)'},
            {q:'I tried ___ careful ___ his feelings.',
             opts:['being / not hurting','to be / not to hurt','to have been / don\'t hurt','having been / didn\'t hurt','be / not to have hurt'],
             cor:'b', hint:'"try + to V₁" (amaç) / "not to V₁" (olumsuz infinitive)'},
            {q:'___ at the details of Rodin\'s works, we can see his ability ___ feeling through facial expression.',
             opts:['To look / being conveyed','By looking / to convey','Having looked / convey','To be looking / conveying','Being looked / to be conveying'],
             cor:'b', hint:'"By + V+ing" / "ability + to V₁"'},
            {q:'Ludlow is considered ___ the most beautiful mediaeval street in England. Do you fancy ___ there tonight?',
             opts:['having / to go','had / go','to have / going','have / to go','having / go'],
             cor:'c', hint:'"considered to have" / "fancy + V+ing"'},
        ]
    },
    {
        label: 'Set 10 — Test 3',
        questions: [
            {q:'The singer has decided ___ a two-year break, but he has already made enough money ___ a lifetime.',
             opts:['to take / to last','taking / lasting','take / to be lasting','taken / to have lasted','having taken / lasted'],
             cor:'a', hint:'"decide + to V₁" / "enough money + to V₁"'},
            {q:'Remember ___ off the washing machine before you leave home.',
             opts:['switching','to have switched','having switched','switch','to switch'],
             cor:'e', hint:'"remember + to V₁" = gelecekteki görevi hatırlamak'},
            {q:'Both sides seem ___ on to their determination ___ a peaceful solution.',
             opts:['to be held / finding','to be holding / to find','holding / to be finding','having held / found','held / having found'],
             cor:'b', hint:'"seem + to be V+ing" (süregelen) / "determination + to V₁"'},
            {q:'It is sometimes difficult for parents ___ whether ___ their children for misbehaving.',
             opts:['to decide / to punish','deciding / to be punishing','being decided / punish','decided / having punished','having decided / punishing'],
             cor:'a', hint:'"difficult + to V₁" / "whether + to V₁"'},
            {q:'A: Did you have difficulty ___ our office? B: No, it was quite easy ___ here.',
             opts:['to find / to have got','having found / getting','finding / to get','to be finding / get','find / having got'],
             cor:'c', hint:'"have difficulty + V+ing" / "easy + to V₁"'},
            {q:'I never seem ___ enough time ___ everything I want.',
             opts:['having / doing','to be having / done','have / to be doing','to have / to do','to have had / do'],
             cor:'d', hint:'"seem + to have" / "time + to V₁"'},
            {q:'A talented actress like Tracy shouldn\'t be wasting her talent ___ in a soap opera.',
             opts:['acting','to act','act','acted','to be acted'],
             cor:'a', hint:'"waste + time/talent + V+ing"'},
            {q:'Money motivates most people ___ hard, even though it may cause them ___ a lot of stress.',
             opts:['working / undergoing','to be working / undergo','to work / to undergo','work / to have undergone','worked / having undergone'],
             cor:'c', hint:'"motivate + obj + to V₁" / "cause + obj + to V₁"'},
            {q:'She caught her son and his friend ___ computer games when they were supposed ___ an assignment.',
             opts:['to play / to be prepared','playing / to be preparing','play / having prepared','to be playing / preparing','played / to prepare'],
             cor:'b', hint:'"catch + obj + V+ing" / "be supposed + to V₁"'},
            {q:'I was against my daughter ___ to a late night party, but she knows how ___ people.',
             opts:['to go / to be persuading','gone / persuading','go / to have persuaded','going / to persuade','to be going / persuade'],
             cor:'d', hint:'"against + V+ing" (preposition) / "know how + to V₁"'},
        ]
    },
    {
        label: 'Set 11 — Test 3 & Paraphrase',
        questions: [
            {q:'The actor is believed ___ the TV drama because of an illness.',
             opts:['to have left','leaving','to be left','leave','left'],
             cor:'a', hint:'"is believed to have V₃" — geçmişe ait eylem, perfect infinitive'},
            {q:'As trainees, we spent several days ___ to presentations about how ___ the product.',
             opts:['to listen / selling','listen / to be selling','listened / to have sold','listening / to sell','having listened / sell'],
             cor:'d', hint:'"spend time + V+ing" / "how + to V₁"'},
            {q:'Her lifelong wish ___ the country of her parents came true when she visited the Ukraine.',
             opts:['having visited','visit','visited','to visit','visiting'],
             cor:'d', hint:'"wish + to V₁" — istek ifadesi'},
            {q:'Before offering you the position, we need ___ if you are prepared ___ evenings and weekends.',
             opts:['knowing / working','know / to have worked','to know / to work','having known / worked','to have known / work'],
             cor:'c', hint:'"need + to V₁" / "prepared + to V₁"'},
            {q:'We had arranged ___ after work on Friday ___ our holiday plans.',
             opts:['to meet / to discuss','meeting / discussing','to meet / discussing','meeting / to discuss','meet / having discussed'],
             cor:'a', hint:'"arrange + to V₁" / "to discuss" (amaç infinitive)'},
            {q:'He\'s devoted his life to photographing the misery which war has brought to people\'s lives.',
             opts:['He was miserable for most of his life because his job was photographing people in war zones.','At times during his career, he was sent to war zones to concentrate on photographing people\'s suffering.','Throughout his life, he\'s been a dedicated photographer taking pictures of people who have suffered a lot through war.','He devoted his life to helping the people who had suffered in war, of whom he also took many photographs.','The subjects of his photographs have usually been victims of human catastrophes such as wars.'],
             cor:'c', hint:'"devoted his life to photographing" = dedicated photographer taking pictures'},
            {q:'The French police consider the man to be the suspect for the murder of the English student.',
             opts:['He was arrested by the French police for murdering an English student.','The man is suspected by the French police of murdering the English student.','An English student was killed, and the French police suspect that the murderer was a man.','The French police have charged the man with committing a murder with an English student.','The French police are questioning a man about the murder of an English student.'],
             cor:'b', hint:'"consider sb to be the suspect" = "suspect sb of V+ing"'},
            {q:'Italy is believed to have a low rate of heart attacks because Italians use mainly pure olive oil for cooking.',
             opts:['The fact that Italians predominantly use pure olive oil in food preparation is assumed to be why Italy has a low incidence of heart attacks.','It has been discovered that the low incidence of heart attacks in Italy is a result of Italians\' high consumption of cooking oil.','It\'s been found that Italians use more cooking oil than most people, which accounts for the small number of heart attacks.','Italians rarely die of heart attacks on account of their healthy diet and the cooking oil they use.','Pure olive oil has been proved to be healthier than other oils.'],
             cor:'a', hint:'"is believed to have" = "is assumed to be why"'},
            {q:'In addition to entertaining the public, many zoos are involved in preserving endangered species.',
             opts:['Conserving animals is a more important service zoos provide than entertaining people.','Many zoos which used to concentrate on entertaining their customers are now participating in conservation projects.','Instead of entertaining visitors, zoos should concentrate more on serving the needs of endangered animals.','Apart from providing entertainment for people, many zoos make efforts to conserve threatened species.','In using animals for entertainment purposes, many zoos are contributing to the risk of extinction for many species.'],
             cor:'d', hint:'"In addition to V+ing" = "Apart from V+ing"'},
            {q:'A quarter of all bird species in the world are acknowledged to have become extinct during the past two hundred years.',
             opts:['It is estimated that one fourth of all bird species will become extinct within the next two centuries.','It is known that two centuries ago there were twenty-five percent more birds than there are today.','We are likely to cause the extinction of one fourth of all bird species during the next two hundred years.','It is understood that one fourth of all bird species have ceased to exist over the last two centuries.','It is clear that we risk causing the extinction of twenty-five percent of all bird species by the twenty-third century.'],
             cor:'d', hint:'"acknowledged to have become extinct" = "it is understood that...have ceased to exist"'},
        ]
    },
    {
        label: 'Set 12 — Paraphrase & Çeviri',
        questions: [
            {q:'At the present rate of deforestation, the last tropical evergreen tree will fall in 2045.',
             opts:['We will cut down the last tropical evergreen tree in 2045 if we continue to cut them down as quickly as we are now.','Unless we stop cutting down tropical evergreen trees, there will be very few left by 2045.','We are cutting down the rainforest so quickly that, in 2045, there will only be one tropical evergreen tree left.','It is estimated that, unless something is done, there will be no tropical forests left by 2045.','If we continue chopping down trees at the current rate, there will only be tropical evergreen trees left by 2045.'],
             cor:'a', hint:'"at the present rate" = "if we continue to cut them down as quickly as we are now"'},
            {q:'There is no evidence to prove that genetically modified crops pose a special threat to human health or to our planet.',
             opts:['There isn\'t enough evidence to support the assumption that genetically modified crops harm both the Earth and the health of its population.','Evidence exists to suggest that genetically modified crops pose a particular threat to our planet and to the health of its people.','There is a complete lack of evidence to show that genetically modified crops are harmful either to the Earth or to the health of its inhabitants.','Scientists have not yet proved genetically modified crops to be completely safe for human health or the environment.','Genetically modified crops are proven to pose no health risk or threat to the environment.'],
             cor:'c', hint:'"no evidence to prove" = "complete lack of evidence to show"'},
            {q:'The asymmetric shape of the human heart enables the blood to be pumped more efficiently around the body.',
             opts:['It is known that the asymmetric shape of the human heart prevents the blood being sent around the body too quickly.','How efficiently the blood is sent around the body of an animal depends on the particular shape of its heart.','The human heart\'s irregular shape facilitates more efficient sending of the blood around the body.','A human heart is incapable of sending the blood around the body quickly because of its uneven shape.','Some people have irregular-shaped hearts, which can have difficulty in sending the blood around the body effectively.'],
             cor:'c', hint:'"enables the blood to be pumped more efficiently" = "facilitates more efficient sending"'},
            {q:'You should choose a car suitable for driving long distances and carrying the whole family.',
             opts:['Have you considered buying a car capable of being driven long distances and with enough space for your family?','It\'s advisable for you to select a car capable of being driven long distances and roomy enough to seat your entire family.','When choosing a car, you should consider such things as whether it will be driven long distances or how many people it can hold.','I\'m glad that you\'re considering buying a car which is suitable for driving long distances and which can fit your entire family in.','If you plan to drive your entire family a long distance, make sure you choose a suitable car for the trip.'],
             cor:'b', hint:'"should choose" = "it\'s advisable for you to select"; "suitable for V+ing" = "capable of being V+ed"'},
            {q:'King Charles II survived a narrow escape from Cromwell\'s men by hiding in an oak tree.',
             opts:['King Charles II concealed himself in an oak tree, and thus narrowly avoided being caught by Cromwell\'s men.','Cromwell\'s men found King Charles II sitting in a large oak tree.','King Charles II would have been found if he hadn\'t hidden himself in a large oak tree.','The tree is known as the Royal Oak because King Charles II reportedly hid from Cromwell\'s men in it.','The escape that King Charles II made from Cromwell\'s men by hiding in an oak tree was one of many narrow escapes he survived.'],
             cor:'a', hint:'"survived a narrow escape by hiding" = "concealed himself...narrowly avoided being caught"'},
            {q:'My son\'s favourite subject at school is history, but he is considering studying medicine or engineering at university.',
             opts:['Oğlum okulda en çok tarih dersini seviyorsa da üniversitede tıp ya da mühendislik okumak istiyor.','Oğlumun okulda en başarılı olduğu ders tarih ama o, üniversitede tıp ya da mühendislik okumayı tercih ediyor.','Tarih, okulda oğlumun en çok beğendiği ders olmasına rağmen üniversitede seçmeyi düşündüğü alan tıp veya mühendislik.','Oğlumun okulda en çok sevdiği ders tarih ama o, üniversitede tıp ya da mühendislik okumayı düşünüyor.','Oğlumun okulda en çok ilgisini çeken ders tarihti ama o, üniversite için tercihlerini tıp ve mühendislik alanlarında yaptı.'],
             cor:'d', hint:'"favourite subject" = "en çok sevdiği ders"; "is considering studying" = "okumayı düşünüyor"'},
            {q:'In an effort to preserve the wilderness, many of the national parks in various parts of the world officially admit only scientists.',
             opts:['Vahşi doğanın korunması için kurulmuş olan milli parklara, dünyanın bir çok yerinde resmi olarak sadece bilim adamları kabul edilmektedir.','Vahşi doğayı korumak için dünyanın çeşitli bölgelerinde, sadece bilim adamlarının girmesine izin verilen milli parklar oluşturulmuştur.','Dünyanın çeşitli bölgelerindeki milli parklara sadece, vahşi doğayı korumak için çalışan bilim adamları girebiliyor.','Dünyanın çeşitli yerlerinde, vahşi doğayı korumak amacıyla, yalnızca bilim adamlarının girebildiği milli parklar oluşturulmuştur.','Vahşi doğayı korumak amacıyla, dünyanın çeşitli yerlerindeki pek çok milli park, resmi olarak sadece bilim adamlarını kabul eder.'],
             cor:'e', hint:'"officially admit only scientists" = "resmi olarak sadece bilim adamlarını kabul eder"'},
            {q:'By not bringing forth any suggestions throughout the meeting, he tried to make it obvious that he was unwilling to take part in the project.',
             opts:['Toplantı boyunca hiçbir öneri sunmayınca projede yer almak istemediği anlaşıldı.','Toplantı boyunca hiç öneri getirmeyerek, projede yer alma konusunda isteksiz olduğunu belli etmeye çalıştı.','Projede yer alma konusunda isteksiz olduğunu belli etmek için toplantı süresince hiç öneri getirmedi.','Bu projede yer alma konusunda isteksiz olduğunu toplantı boyunca tüm önerilere karşı çıkarak belli etti.','Bu projede yer almak istemediği belliydi çünkü toplantı boyunca tüm önerilere karşı çıktı.'],
             cor:'b', hint:'"by not V+ing" = "V+eyerek"; "tried to make it obvious" = "belli etmeye çalıştı"'},
            {q:'Fortunately, the driver was able to throw himself out before the car went over the barriers and rolled down the slope.',
             opts:['Neyse ki sürücü, araba bariyerleri aşıp yamaçtan aşağı doğru yuvarlanmadan önce kendini dışarı atabildi.','Araba bariyerlere çarpıp yamaçtan aşağıya yuvarlandı ama neyse ki sürücü daha önceden kendini dışarı atmıştı.','Araba bariyerlere çarpınca kendini dışarı atabildiği ve yamaçtan aşağıya yuvarlanmadığı için sürücü çok şanslıydı.','İyi ki sürücü, araba bariyerlere çarpınca kendini dışarı attı çünkü daha sonra araba yamaçtan aşağıya yuvarlandı.','Büyük bir şans eseri, arabanın yamaçtan aşağıya yuvarlanmadan önce bariyerlere çarpmasıyla sürücü dışarı fırladı.'],
             cor:'a', hint:'"before the car went over the barriers and rolled down" = "bariyerleri aşıp yuvarlanmadan önce"'},
            {q:'The "Sherlock Holmes" stories by Arthur Conan Doyle were first serialized in the Strand magazine before appearing in book form.',
             opts:['Kitap biçiminde yayınlanmadan önce dizi halinde ilk kez Strand dergisinde çıkan "Sherlock Holmes" hikayelerini Arthur Conan Doyle yazmıştır.','Arthur Conan Doyle\'nin "Sherlock Holmes" hikayeleri, ilk kez Strand dergisinde dizi halinde yayınlandıktan sonra kitaba dönüştürülmüştür.','"Sherlock Holmes" un yazarı Arthur Conan Doyle, hikayelerini önce dizi biçiminde Strand dergisinde yayınlamış, sonra kitap halinde çıkarmıştır.','Sherlock Holmes hikayelerini önce Strand dergisinde dizi biçiminde yayınlatan Arthur Conan Doyle, daha sonra onları bir kitapta toplamıştır.','Arthur Conan Doyle\'nin "Sherlock Holmes" hikayeleri, kitap biçiminde çıkmadan önce ilk kez Strand dergisinde dizi halinde yayınlanmıştır.'],
             cor:'e', hint:'"were first serialized...before appearing in book form" = "kitap biçiminde çıkmadan önce ilk kez Strand\'da dizi halinde yayınlandı"'},
        ]
    },
    {
        label: 'Set 13 — Çeviri',
        questions: [
            {q:'Whether we can move into a larger house or not depends on my father\'s finding a better-paid job.',
             opts:['Babam yüksek maaşlı bir iş bulabilirse hemen daha büyük bir eve taşınacağız.','Büyük bir eve taşınıp taşınmayacağımız babamın yeni işinde alacağı maaş kesinleşince belli olacak.','Daha büyük bir eve taşınıp taşınamayacağımız babamın daha iyi maaşlı bir iş bulmasına bağlı.','Babam maaşı daha iyi olan bir iş bulduğuna göre artık daha büyük bir eve taşınabiliriz.','Babamın bu işte alacağı yüksek maaşa dayanarak daha büyük bir ev bulup taşınmayı düşünüyoruz.'],
             cor:'c', hint:'"depends on my father\'s finding" = "babamın bulmasına bağlı" (possessive gerund)'},
            {q:'Sight is a rapidly occurring process resulting from a continuous interaction between the eye, the nervous system and the brain.',
             opts:['Sinir sistemi ve beyin arasındaki hızlı ve sürekli etkileşimin sonucunda göz, görme işlemini gerçekleştirir.','Görme, gözün, sinir sistemi ve beyin arasındaki sürekli etkileşimin sonucunda çok hızlı gerçekleştirdiği bir işlemdir.','Görme işleminin çok hızlı gerçekleşmesinin nedeni, göz, sinir sistemi ve beyin arasında sürekli bir etkileşim olmasıdır.','Görme göz, sinir sistemi ve beyin arasında sürekli bir etkileşim sonucu çok hızlı gerçekleşen bir işlemdir.','Görme işlemi, göz, sinir sistemi ve beyin arasındaki etkileşimin sürekliliği sayesinde gerçekleşmektedir.'],
             cor:'d', hint:'"rapidly occurring process resulting from" = "çok hızlı gerçekleşen bir işlem...sonucu"'},
            {q:'In my opinion, having your holiday on your own is a lot more enjoyable than joining a package-tour.',
             opts:['Bence, kendi başınıza tatil yapmak bir tura katılmaktan çok daha eğlencelidir.','Bana göre, bir tura katılmaktansa kendi başınıza tatil yapmanız size daha çok zevk verecektir.','Benim düşüncemi sorarsanız, bir tura katılmak yerine kendi zevkinize göre tatil yapınız.','Bana göre, tatile turla değil de kendi başınıza gitmeniz çok daha eğlenceli olabilir.','Bence, bir tura katılacağınıza kendi başınıza tatil yaparak daha çok eğlenirsiniz.'],
             cor:'a', hint:'"having your holiday on your own" = "kendi başınıza tatil yapmak"; "a lot more enjoyable than V+ing" = "V+maktan çok daha eğlenceli"'},
            {q:'They spent so much money on the decoration of the house that, in the end, they had no money left to go on holiday.',
             opts:['Evin dekorasyonuna bu kadar çok para harcamasalardı, tatile gitmek için biraz paraları olurdu.','O kadar çok parayı evin dekorasyonuna harcamak yerine birazını tatil için ayırabilirlerdi.','Evin dekorasyonuna o kadar çok para harcadılar ki sonunda tatile gitmek için hiç paraları kalmadı.','Sonunda tatile gitmekten vazgeçip paranın tümünü evin dekorasyonuna harcamayı tercih ettiler.','Evin dekorasyonuna o kadar çok para harcayınca sonunda tatile gitmek için hiç para kalmayacağı belliydi.'],
             cor:'c', hint:'"spent so much money...that...no money left to go on holiday" = "o kadar çok harcadılar ki...hiç paraları kalmadı"'},
            {q:'As he lived on his own for many years, he is now having difficulty getting used to having someone else in his house.',
             opts:['Evde bir başkasının varlığına katlanamadığı için yıllardır tek başına yaşıyor.','Senelerce evinde tek başına yaşadığından şimdi bir başkasının varlığına alışması çok zor.','Bir başkasının varlığına alışmakta zorlandığı için senelerce evinde tek başına yaşamıştı.','Uzun yıllar yalnız yaşamaya alıştığı için şimdi evinde bir başkasının varlığı zoruna gidiyor.','Uzun yıllar yalnız yaşadığı için şimdi evinde bir başkasının varlığına alışmakta zorlanıyor.'],
             cor:'e', hint:'"having difficulty getting used to" = "alışmakta zorlanıyor"; "as he lived on his own" = "yalnız yaşadığı için"'},
            {q:'Meslek seçimi, işin fiziksel gerekliliklerinin kişinin fiziksel özelliklerine uygunluğu konusunda, gerçekçi bir tavırla yapılmalıdır.',
             opts:['If you are choosing an active vocation, bear in mind, realistically, the physical fitness required in relation to your own.','Choosing a vocation should be done with a realistic attitude toward its physical demands in relation to one\'s own physical attributes.','It\'s unrealistic to choose a physically demanding vocation if you aren\'t physically strong yourself.','In order to help you decide on a suitable vocation, it\'s useful to compare its physical demands with your level of fitness.','Only those who realistically consider themselves physically fit enough to cope with the demands of this vocation should choose to follow it.'],
             cor:'b', hint:'"Meslek seçimi...gerçekçi bir tavırla yapılmalıdır" = "Choosing a vocation should be done with a realistic attitude"'},
            {q:'İskoçların milli kahramanı William Wallace, ülkesini İngiltere\'nin boyunduruğundan kurtaramadı ama mücadeleyi sürdürmeleri konusunda başkalarına esin kaynağı oldu.',
             opts:['William Wallace, who tried but failed to free his country from English oppression, inspired many others and became a national hero in Scotland.','William Wallace, a Scottish hero who was defeated by the English, inspired many of his contemporaries to continue to resist English rule.','The Scots\' national hero William Wallace failed to free his country from the yoke of England, but he inspired others to carry on the struggle.','After the Scots\' national hero William Wallace was defeated, those whom he had inspired carried on the struggle to free their country from the yoke of England.','The struggle of the Scottish people to free themselves from the yoke of England was inspired by their national hero William Wallace.'],
             cor:'c', hint:'"kurtaramadı ama...esin kaynağı oldu" = "failed to free...but he inspired others to carry on the struggle"'},
            {q:'Afrika, mineraller ve diğer ham maddeler bakımından zengin olmasına karşın, çoğu insan için tarım hayatın ekonomik temeli olmaya devam etmektedir.',
             opts:['Despite attempts to utilise Africa\'s wealth of minerals and raw materials, most Africans still earn a living farming the land.','Agriculture forms the basis of life for most African people although some African countries have large mineral deposits.','Africa is rich in minerals and has no shortage of raw materials, yet its economy has failed to move away from an agricultural one.','Most Africans make a living through agriculture of some kind because Africa lacks any abundance of minerals.','Even though Africa is rich in minerals and other raw materials, agriculture continues to be the economic base of life for most people.'],
             cor:'e', hint:'"olmasına karşın" = "Even though"; "ekonomik temel olmaya devam etmektedir" = "continues to be the economic base"'},
            {q:'Karda mahsur kalan yolcuların tümünü birkaç saat içinde kurtarmayı başardılar.',
             opts:['The rescue operation to free all the passengers from where they were stranded in the snow lasted a few hours.','It took them several hours before they had rescued all the passengers stranded in the snow.','In just a few hours, all the passengers were safe, having been dug out of the snow by a rescue team.','They managed to rescue all the passengers stranded in the snow in a few hours.','It took a few hours for the rescue team to reach the spot where all the passengers were trapped in the snow.'],
             cor:'d', hint:'"kurtarmayı başardılar" = "managed to rescue"; "birkaç saat içinde" = "in a few hours"'},
            {q:'Yöneticinin yüksek standart konusundaki ısrarı, çalışanların mükemmel bir iş çıkarmasıyla sonuçlandı.',
             opts:['The manager\'s insistence on high standards resulted in employees producing excellent work.','The excellent work by the employees met the high standards which the manager insisted on.','The manager insisted on high standards so that the work his employees produced would be above average.','If the manager had insisted on higher standards, the employees\'s work would have produced better results.','The manager insisted that his employees should produce work which met his high standard of excellence.'],
             cor:'a', hint:'"ısrarı...ile sonuçlandı" = "insistence on...resulted in V+ing"'},
        ]
    },
    {
        label: 'Set 14 — Test 3 Preposition & Vocabulary',
        questions: [
            {q:'Saatimi onarmak için istedikleri fiyat, kabul edilemeyecek kadar yüksekti.',
             opts:['I asked for the price in case the charge for mending my watch was too high.','The charge they asked for mending my watch was too high to accept.','They overcharged me for mending my watch, which, of course, I didn\'t accept.','I couldn\'t agree to them mending my watch as they wanted to charge too much.','It cost a lot to have my watch repaired, but I had no alternative but to accept the charges.'],
             cor:'b', hint:'"istedikleri fiyat" = "the charge they asked for"; "kabul edilemeyecek kadar yüksekti" = "too high to accept"'},
            {q:'Malikanenin fiyatı ilk anda oldukça makul görünüyor ama restorasyon giderlerini düşündüğümüzde hiç de öyle değil.',
             opts:['The price of the mansion was quite reasonable, but at first sight, we found the cost of restoration surprisingly high.','The cost of the mansion sounds quite reasonable at first, but it isn\'t so at all when we consider the restoration expenses.','The mansion sounds quite reasonably priced, but it may not be so when the restoration expenses are considered.','It\'s not the cost of the mansion but the considerable restoration expenses that make the mansion unreasonably priced.','The mansion itself doesn\'t cost that much, but the final cost including the considerable restoration expenses is high.'],
             cor:'b', hint:'"ilk anda makul görünüyor ama...değil" = "sounds reasonable at first, but it isn\'t so at all"'},
            {q:'Bahçe işiyle ilgilenmek babamın, yoğun bir iş gününden sonra en iyi rahatlama yöntemidir.',
             opts:['My father deals with some of the jobs in the garden and finds it relaxing after a hard day\'s work.','My father prefers doing the gardening, which he does in the evening after work, to his stressful job.','According to my father, tackling jobs in the garden is a great way to relax after a stressful day at the office.','Dealing with the gardening is my father\'s best way of relaxing after a hard day\'s work.','The best way of relaxing after a hard day\'s work is to tackle a job in the garden, which my father does very often.'],
             cor:'d', hint:'"Bahçe işiyle ilgilenmek" = "Dealing with the gardening"; "en iyi rahatlama yöntemi" = "best way of relaxing"'},
            {q:'The florist was nervous about the wedding order on account ___ the customer being very hard to please.',
             opts:['on / of','with / on','about / for','in / with','for / to'],
             cor:'a', hint:'"on account of" = nedeniyle (fixed expression)'},
            {q:'If you insist ___ having all this paperwork completed, how do you expect your staff ___ any time with customers?',
             opts:['of / spending','on / to spend','about / spent','for / spend','to / for spending'],
             cor:'b', hint:'"insist on + V+ing" / "expect + obj + to V₁"'},
            {q:'The manager wants us to concentrate ___ gaining new business and says that the head office will take care ___ looking after existing customers.',
             opts:['in / for','to / in','on / of','about / with','of / from'],
             cor:'c', hint:'"concentrate on + V+ing" / "take care of + V+ing"'},
            {q:'We\'ve urged him ___ for the promotion, but he won\'t as he is afraid of ___.',
             opts:['to apply / being rejected','for applying / rejecting','applying / to be rejected','to have applied / rejected','from applying / to reject'],
             cor:'a', hint:'"urge + to V₁" / "afraid of + V+ing (passive)"'},
            {q:'The minister for defence thanked the soldiers ___ carrying out their mission successfully.',
             opts:['with','of','in','on','for'],
             cor:'e', hint:'"thank sb for + V+ing"'},
            {q:'If she hadn\'t devoted herself ___ teaching her autistic son, she probably would have been a scientist.',
             opts:['to','on','in','about','for'],
             cor:'a', hint:'"devote oneself to + V+ing" (to = preposition, gerund follows)'},
            {q:'In the article, the environmentalists warned consumers ___ purchasing genetically modified produce.',
             opts:['with','against','on','to','of'],
             cor:'b', hint:'"warn against + V+ing"'},
        ]
    },
    {
        label: 'Set 15 — Vocabulary & Test 3',
        questions: [
            {q:'When I was a child, I would often ___ of living in a motor home and travelling around the world.',
             opts:['feel','dream','imagine','plan','anticipate'],
             cor:'b', hint:'"dream of + V+ing" = hayal kurmak'},
            {q:'I ___ to having to clear up somebody else\'s mess.',
             opts:['mind','dislike','object','can\'t stand','complain'],
             cor:'c', hint:'"object to + V+ing"'},
            {q:'After the murder of the prize-winning cameraman, the foreign office has ___ people against going to the region.',
             opts:['insisted','worried','deterred','warned','stopped'],
             cor:'d', hint:'"warn people against + V+ing"'},
            {q:'They ___ him in Spain for murdering a van driver in England.',
             opts:['forbade','dealt','accused','suspected','arrested'],
             cor:'e', hint:'"arrest sb for + V+ing"'},
            {q:'The airline ___ to me for losing my luggage, but I wasn\'t in the right frame of mind to forgive them.',
             opts:['thanked','complained','excused','denied','apologised'],
             cor:'e', hint:'"apologise to sb for + V+ing"'},
            {q:'I was ___ from buying a house in that area by the high crime rate.',
             opts:['deterred','afraid','advised','compelled','obliged'],
             cor:'a', hint:'"deter from + V+ing" = caydırmak'},
            {q:'Because of the protests from the local residents, the farmers ___ not to participate in growing genetically modified crops.',
             opts:['appreciated','failed','decided','considered','urged'],
             cor:'c', hint:'"decide + not to V₁"'},
            {q:'She should have apologised to him ___ spilling coffee down his suit.',
             opts:['about','with','of','for','by'],
             cor:'d', hint:'"apologise for + V+ing"'},
            {q:'The first woman ___ as a foreign correspondent in the United States was Margaret Fuller.',
             opts:['be served','being served','has served','to serve','to be serving'],
             cor:'d', hint:'"the first + to V₁" — superlative + infinitive'},
            {q:'If I were you, I would forget ___ getting promoted there and look for a more rewarding job somewhere else.',
             opts:['for','about','of','in','with'],
             cor:'b', hint:'"forget about + V+ing" = umursamamak, vazgeçmek'},
        ]
    },
];

let _grdSetIdx     = 0;
let _grdSetScore   = 0;
let _grdSetChecked = {};
let _grdSetAnswers = {};

function grdExercises() {
    _grdSetIdx = 0; _grdSetScore = 0; _grdSetChecked = {}; _grdSetAnswers = {};
    return _grdBuildExercisePage();
}

function _grdBuildExercisePage() {
    const set   = GRD_SETS[_grdSetIdx];
    const total = set.questions.length;

    const tabs = GRD_SETS.map(function(s, i) {
        const active = i === _grdSetIdx
            ? 'style="background:#d97706;color:#fff;border-color:#d97706;"' : '';
        return '<button class="gr-set-tab" ' + active + ' data-action="grdSwitchSet(' + i + ')">' + s.label + '</button>';
    }).join('');

    const qCards = set.questions.map(function(q, i) {
        const opts = q.opts.map(function(o, j) {
            const letter = ['A','B','C','D','E'][j];
            const lv     = ['a','b','c','d','e'][j];
            const state  = _grdSetAnswers[_grdSetIdx + '_' + i];
            let cls = 'gr-opt';
            if (_grdSetChecked[_grdSetIdx + '_' + i]) {
                if (lv === q.cor)                         cls += ' ok';
                else if (lv === state && state !== q.cor) cls += ' bad';
            } else if (state === lv) cls += ' sel';
            return '<div class="' + cls + '" id="grdso-' + i + '-' + j + '" data-action="grdSetOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');

        const checked = _grdSetChecked[_grdSetIdx + '_' + i];
        const fbCls   = checked ? (checked === 'ok' ? 'gr-fb show ok' : 'gr-fb show bad') : 'gr-fb';
        const fbTxt   = checked === 'ok'  ? ('✅ Doğru! ' + q.hint)
                    : checked === 'bad' ? ('❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + ' — ' + q.hint) : '';
        const cardCls = checked === 'ok' ? 'gr-q-card gr-c' : checked === 'bad' ? 'gr-q-card gr-w' : 'gr-q-card';
        const btnDis  = checked ? 'disabled style="opacity:.4;pointer-events:none;"' : '';

        return '<div class="' + cardCls + '" id="grdsc-' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' — ' + set.label.toUpperCase() + '</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#d97706;color:#d97706" data-action="grdCheckSetQ(' + i + ')" ' + btnDis + '>Kontrol Et</button>'
            + '<div class="' + fbCls + '" id="grdsfb-' + i + '">' + fbTxt + '</div>'
            + '</div>';
    }).join('');

    return grdH('✨ Pratik Yap', 'Alıştırmalar', GRD_SETS.length + ' set × 10 soru — gerçek ÖYS & YDT soruları')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-set-tabs">' + tabs + '</div>'
        + '<div class="gr-score-bar">'
        + '<span class="gr-score-label">' + set.label + ' Puanı</span>'
        + '<span class="gr-score-val" id="grd-live-score">' + _grdSetScore + ' / ' + total + '</span>'
        + '</div>'
        + qCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#d97706,#fbbf24)" data-action="grdSubmitSet()">🎯 Seti Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="grd-result">'
        + '<div class="gr-res-score" id="grd-res-score" style="color:#d97706">0/' + total + '</div>'
        + '<div class="gr-res-lbl">' + set.label + ' Tamamlandı</div>'
        + '<div class="gr-res-msg" id="grd-res-msg"></div>'
        + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px">'
        + '<button class="gr-retry-btn" style="border-color:#d97706;color:#d97706" data-action="grdRetrySameSet()">🔄 Aynı Seti Tekrar</button>'
        + (_grdSetIdx < GRD_SETS.length - 1
            ? '<button class="gr-retry-btn" style="background:#d97706;color:#fff;border-color:#d97706" data-action="grdNextSet()">Sonraki Set →</button>'
            : '<span style="font-size:.8rem;color:var(--ink3);align-self:center">🏁 Tüm setler tamamlandı!</span>')
        + '</div>'
        + '</div></div>';
}

function grdSwitchSet(idx) {
    _grdSetIdx = idx; _grdSetScore = 0; _grdSetChecked = {}; _grdSetAnswers = {};
    const cnt = document.getElementById('grd-content');
    if (cnt) { cnt.innerHTML = _grdBuildExercisePage(); cnt.scrollTop = 0; }
}

function grdSetOpt(qi, oi, letter) {
    if (_grdSetChecked[_grdSetIdx + '_' + qi]) return;
    GRD_SETS[_grdSetIdx].questions[qi].opts.forEach(function(_, j) {
        const el = document.getElementById('grdso-' + qi + '-' + j);
        if (el) el.className = 'gr-opt' + (j === oi ? ' sel' : '');
    });
    _grdSetAnswers[_grdSetIdx + '_' + qi] = letter;
}

function grdCheckSetQ(qi) {
    const q    = GRD_SETS[_grdSetIdx].questions[qi];
    const sel  = _grdSetAnswers[_grdSetIdx + '_' + qi];
    const fb   = document.getElementById('grdsfb-' + qi);
    const card = document.getElementById('grdsc-' + qi);
    if (!fb) return;
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    const letters = ['a','b','c','d','e'];
    q.opts.forEach(function(_, j) {
        const el = document.getElementById('grdso-' + qi + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor)                     el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    const btn = card ? card.querySelector('.gr-chk-btn') : null;
    if (btn) { btn.disabled = true; btn.style.opacity = '.4'; btn.style.pointerEvents = 'none'; }
    if (sel === q.cor) {
        if (card) card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        _grdSetChecked[_grdSetIdx + '_' + qi] = 'ok';
        _grdSetScore++;
    } else {
        if (card) card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + ' — ' + q.hint;
        fb.className = 'gr-fb show bad';
        _grdSetChecked[_grdSetIdx + '_' + qi] = 'bad';
    }
    const el = document.getElementById('grd-live-score');
    if (el) el.textContent = _grdSetScore + ' / ' + GRD_SETS[_grdSetIdx].questions.length;
}

function grdSubmitSet() {
    const total = GRD_SETS[_grdSetIdx].questions.length;
    const panel = document.getElementById('grd-result');
    if (!panel) return;
    panel.classList.add('show');
    document.getElementById('grd-res-score').textContent = _grdSetScore + '/' + total;
    const pct = Math.round((_grdSetScore / total) * 100);
    document.getElementById('grd-res-msg').textContent =
        pct >= 90 ? '🎉 Mükemmel! Bu seti harika geçirdin!'
      : pct >= 70 ? '👏 Çok iyi! Küçük eksikler var.'
      : pct >= 50 ? '📚 Orta düzey. Eksik konulara geri dön.'
      :             '💪 Daha fazla pratik gerekiyor!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function grdRetrySameSet() { grdSwitchSet(_grdSetIdx); }
function grdNextSet()      { if (_grdSetIdx < GRD_SETS.length - 1) grdSwitchSet(_grdSetIdx + 1); }

/* ════════ GLOBALS ════════ */
// openGerundSection ve _grdRenderSection: _initGerundModule içinde atandı
window.grdSwitchSet    = grdSwitchSet;
window.grdSetOpt       = grdSetOpt;
window.grdCheckSetQ    = grdCheckSetQ;
window.grdSubmitSet    = grdSubmitSet;
window.grdRetrySameSet = grdRetrySameSet;
window.grdNextSet      = grdNextSet;


(function _initGerundModule() {
    const _mod = new GrammarModule({
        id:       'grd',
        pageId:   'gerund-page',
        sbId:     'sb-grammar-gerund',
        diId:     'di-grammar-gerund',
        title:    'Gerunds &amp; Infinitives',
        sections: GRD_SECTIONS,
        dotColors: GRD_DOT,
        grpOrder: ['Genel', 'Gerund', 'Infinitive', 'Karşılaştırma', 'Özel'],
        sectionMap: {
            'overview':    function(){ return grdOverview(); },
            'gerund-uses': function(){ return grGerundUses(); },
            'gerund-osym': function(){ return grGerundOsym(); },
            'gerund-verbs':function(){ return grGerundVerbs(); },
            'gerund-forms':function(){ return grGerundForms(); },
            'inf-uses':    function(){ return grInfUses(); },
            'inf-osym':    function(){ return grInfOsym(); },
            'inf-forms':   function(){ return grInfForms(); },
            'inf-lists':   function(){ return grInfLists(); },
            'dual':        function(){ return grDual(); },
            'exercises':   function(){ return grdExercises(); }
        },
        onSectionRender: function(id) {
            if (id === 'exercises') {
                _grdScore = 0; _grdAnswers = {}; _grdChecked = {};
                _grdUpdScore();
            }
        }
    });

    window.openGerundSection = function(sectionId) { _mod.open(sectionId || 'overview'); };
    window._grdRenderSection = function(id)        { _mod.goTo(id); };
    window['_grdGoTo']       = function(id)        { _mod.goTo(id); };
})();
