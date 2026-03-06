// ════════════════════════════════════════════════════════════════
// conj.js  —  Adverbial Clauses, Conjunctions & Transitions
// YDT Master Pro
// Kaynak: 10da10 YDT Adverbial Clauses notları (s. 60–74)
// ════════════════════════════════════════════════════════════════

let _cjCurrentSection = 'overview';
let _cjAnswers = {};
let _cjChecked = {};
let _cjScore = 0;
const CJ_TOTAL = 18;

const CJ_SECTIONS = [
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

const CJ_DOT = {
    'Genel':          '#6366f1',
    'Coordination':   '#0369a1',
    'Subordinating':  '#16a34a',
    'Transitions':    '#d97706',
    'Özel':           '#e63946'
};

/* ════════ ENTRY POINT — GrammarModule engine ════════ */

/* ════════ HELPERS ════════ */
/* ════════ ENTRY POINT ════════ */
function cjH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#064e3b 0%,#16a34a 60%,#4ade80 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function cjSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function cjTable(headers, rows) {
    const ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    const trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function cjAcc(items) {
    const cards = items.map(function(it) {
        const exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #16a34a"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        const noteHtml = (it.notes||[]).map(function(n){
            return '<div style="background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:.8rem;color:#14532d;line-height:1.7">'
                + n + '</div>';
        }).join('');
        const descHtml = it.desc ? '<p class="gr-acc-desc">' + it.desc + '</p>' : '';
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
    const styles = {
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239',
        orange: 'background:#fff7ed;border:2px solid #ea580c;color:#7c2d12'
    };
    const content = lines.map(function(l){
        return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>';
    }).join('');
    return '<div style="' + (styles[color]||styles.sky) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 8px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

function cjPill(label, color) {
    const bg = color || '#16a34a';
    return '<span style="display:inline-block;background:' + bg + ';color:#fff;border-radius:20px;padding:2px 12px;font-size:.75rem;font-weight:700;margin:2px 4px 2px 0;">' + label + '</span>';
}

/* ════════ OVERVIEW ════════ */
function cjOverview() {
    const cards = [
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

    const cardHtml = cards.map(function(c) {
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
/* ════════ SET SİSTEMİ — Conjunctions & Transitions ════════════
   Set 1: Temel alıştırmalar (mevcut sorular)
   Set 2: Test Yourself 1 (ÖYS/YDS kaynaklı — 1.B-10.D cevapları)
   Set 3: Test Yourself 2 (1.B-10.D cevapları)
   Set 4: Test Yourself 3 (1.E-10.E cevapları)
   Yeni set: CJ_SETS dizisine ekle
═══════════════════════════════════════════════════════════════ */
const CJ_SETS = [
    {
        label: 'Set 1',
        questions: [
            {q:'The city was flooded ___ the heavy rain.',
             opts:['because','due to','so that','although'],
             cor:'b', hint:'"due to" + isim phrase = prepositional phrase'},
            {q:'___ I earn enough money, I plan to go abroad.',
             opts:['So that','In order that','As long as','Lest'],
             cor:'c', hint:'"as long as" = "...sürece / madem ki" — sebep bildiren baglac'},
            {q:'She is ___ talented ___ everyone admires her.',
             opts:['so/that','such/that','too/to','enough/to'],
             cor:'a', hint:'"so + adj + that" = o kadar yetenekli ki — sonuc bildiren yapi'},
            {q:'___ the difficulties, she completed the project successfully.',
             opts:['Although','Despite','However','Because of'],
             cor:'b', hint:'"despite" + isim/noun phrase — cümle gelmez, isim gelir'},
            {q:'No sooner ___ I left the house than it started to rain.',
             opts:['did','have','had','was'],
             cor:'c', hint:'"No sooner had + özne + V3 + than" — devrik yapi zorunlu'},
            {q:'I study every day. ___, I expect to pass the exam.',
             opts:['However','Therefore','Although','Despite'],
             cor:'b', hint:'"Therefore" = bu nedenle — sonuc geçis kelimesi (transition)'},
            {q:'She left early ___ missing the train.',
             opts:['for fear that','for fear of','lest','so that'],
             cor:'b', hint:'"for fear of" + V+ing — "for fear that" + cümle gelir'},
            {q:'___ he had many obstacles, he never gave up his dream.',
             opts:['Although','Due to','Because','So that'],
             cor:'a', hint:'"although / though / even though" + cümle = zitlik'},
            {q:'The students worked so hard ___ they all passed the exam.',
             opts:['as','which','though','that'],
             cor:'d', hint:'"so ... that" = o kadar ... ki — sonuc bildiren yapi'},
            {q:'Both Ali ___ Ayse will come to the party.',
             opts:['or','nor','and','but'],
             cor:'c', hint:'"Both ... and" = hem ... hem de — iki özneyi baglar, fiil çogul olur'},
        ]
    },
    {
        label: 'Set 2 — Test 1',
        questions: [
            {q:'It wasn\'t because she was bored staying at home with her son that she returned to work; ........., she loves looking after him, but she needed the extra income. (T1-S1)',
             opts:['on the other hand','on the contrary','therefore','nonetheless'],
             cor:'b', hint:'"on the contrary" = tam aksine — önceki ifadeyi reddeder, tersini söyler'},
            {q:'My nephew wants to become a doctor; ......... he takes a special interest in biology at school. (T1-S2)',
             opts:['although','nevertheless','therefore','however'],
             cor:'c', hint:'"therefore" = bu yüzden — önceki sebebin sonucunu verir'},
            {q:'The play was ......... well rehearsed ......... suitable for families. In fact, it was a complete waste of time. (T1-S3)',
             opts:['neither/nor','either/or','both/and','not only/but also'],
             cor:'a', hint:'"neither ... nor" = ne ... ne de — ikisi de olumsuz'},
            {q:'.......... he loves his work, he wasn\'t willing to forsake his holiday. (T1-S4)',
             opts:['As soon as','Much as','Due to','However'],
             cor:'b', hint:'"Much as" = "ne kadar ... olsa da" — zitlik bildiren konsesyon'},
            {q:'......... staying at the best hotel in Brussels, she was not entirely satisfied with the service. (T1-S5)',
             opts:['Although','Despite','Whereas','However'],
             cor:'b', hint:'"Despite" + isim/gerund — cümle degil, sözcük öbegi gelir'},
            {q:'........ had her broken arm mended ........ she broke her other wrist falling off her horse. (T1-S6)',
             opts:['The moment/while','Neither/nor','Hardly/when','If only/still'],
             cor:'c', hint:'"Hardly ... when" = "daha ... ki" — No sooner/than ile ayni anlam'},
            {q:'You had better take some tablets with you ........ Pakistani food upsets you. (T1-S7)',
             opts:['so that','as though','even if','in case'],
             cor:'d', hint:'"in case" = ihtimaline karsi — olasi bir duruma hazirlik'},
            {q:'......... restaurant you eat at in this town, you will be able to pay with your credit card. (T1-S8)',
             opts:['Whichever','No matter','However','As soon as'],
             cor:'a', hint:'"Whichever" = hangisi olursa olsun — No matter which ile ayni'},
            {q:'.......... his invention changed the world, he never gained much financial success. (T1-S9)',
             opts:['Despite','In contrast','No sooner','Although'],
             cor:'e', hint:'"Although" + cümle = "her ne kadar ... olsa da" — zitlik'},
            {q:'......... how many hours I spend revising, I don\'t seem to be able to catch up with the rest of the class. (T1-S10)',
             opts:['Whereas','Although','Whenever','No matter'],
             cor:'d', hint:'"No matter how" = "ne kadar ... olsa da" — However ile ayni'},
        ]
    },
    {
        label: 'Set 3 — Test 1',
        questions: [
            {q:'......... you tell me all the facilities your holiday village has, can I learn whether you have vacancies? (T1-S11)',
             opts:['In case','Consequently','Afterwards','Before'],
             cor:'d', hint:'"Before" = ...den önce — zaman baglaci, once + cümle'},
            {q:'That part of South Africa is safe ........ you stay on the main highway. (T1-S12)',
             opts:['as long as','whereas','whichever','no matter'],
             cor:'a', hint:'"as long as" = "oldugu sürece" — sart bildiren baglac'},
            {q:'In northern Italy it\'s quite rainy in summer, ........ it is typically hot and dry in the southern areas. (T1-S13)',
             opts:['despite','nevertheless','whereas','therefore'],
             cor:'c', hint:'"whereas" = "oysa ki" — dogrudan karsilik, while ile ayni'},
            {q:'......... Craig\'s donation of £70,000 to her, Julia will now be able to have the surgery she needs. (T1-S14)',
             opts:['Despite','Much as','Thanks to','However'],
             cor:'c', hint:'"Thanks to" + isim = "sayesinde" — olumlu sebep bildiren preposition'},
            {q:'Her new shoes could be ........ leather ........ plastic, but if they are plastic, they are a very good imitation. (T1-S15)',
             opts:['such/as','neither/nor','whether/or','not only/but'],
             cor:'c', hint:'"whether ... or" = "...mi ... mi" — iki secenek arasinda belirsizlik'},
            {q:'After her divorce, the actress was ........ depressed ........ she committed suicide. (T1-S16)',
             opts:['either/or','such/as','neither/nor','so/that'],
             cor:'d', hint:'"so + adj + that" = o kadar depresif ki — sonuc bildiren yapi'},
            {q:'......... does the course prepare teachers to teach English abroad, ....... it also instructs them on how to teach immigrants. (T1-S17)',
             opts:['Not only/but','So/that','No sooner/when','Both/and'],
             cor:'a', hint:'"Not only does ... but" — devrik cümle: Not only + yardimci + özne'},
            {q:'......... an engineering failure between Shrewsbury and Wellington, the train will be delayed. (T1-S18)',
             opts:['In spite of','In order that','Whenever','Owing to'],
             cor:'d', hint:'"Owing to" + isim = "nedeniyle" — Due to / Because of ile ayni anlam'},
            {q:'........ avoid a repetition of the fuel crisis in the UK, the government has been given special powers. (T1-S19)',
             opts:['No matter','In order to','In case','Even though'],
             cor:'b', hint:'"In order to" + fiil = "amac ile" — so as to ile ayni'},
            {q:'Mandarin Chinese must be ........ difficult ........ Arabic for Europeans to learn. (T1-S20)',
             opts:['so/that','not only/but also','as/as','much/than'],
             cor:'c', hint:'"as ... as" = en az o kadar — esitlik karsilastirmasi'},
        ]
    },
    {
        label: 'Set 4 — Test 2',
        questions: [
            {q:'He still remembers his childhood very well ............ he is nearly fifty. (T2-S1)',
             opts:['just as','besides','after','even though'],
             cor:'d', hint:'"even though" = hala ... olsa bile — zitlik vurgular'},
            {q:'Although we hadn\'t met for 20 years, ......... (T2-S2)',
             opts:['I recognized him at once','it was a long time again','he has grown much older','she is much prettier than I am'],
             cor:'a', hint:'"although" ile zitlik — 20 yil görüsülmemis ama tanimak mantikli sonuç'},
            {q:'However long it may take ........... (T2-S3)',
             opts:['we are determined to get to the top','we have never been there before','it was one of the most pleasant journeys','they successfully carried out the experiment'],
             cor:'a', hint:'"However long it takes" = ne kadar uzun sürerse sürsün — kararlilik ifadesi'},
            {q:'........... her temperature is so high, she will have to stay in bed for a few days. (T2-S4)',
             opts:['Unless','Until','As','Whether'],
             cor:'c', hint:'"As" = "madem ki / çünkü" — sebep bildiren baglac (since ile ayni)'},
            {q:'The first applicant was both fast ............ efficient, ............. we hired her immediately. (T2-S5)',
             opts:['also/so','but/and','so/but','or/and','and/so'],
             cor:'e', hint:'"both fast and efficient" + "and so" = ve bu yüzden — correlative + sonuç'},
            {q:'In the end I went by bus ...... (T2-S6)',
             opts:['since I was feeling very tired','if I hadn\'t got up so late','that it stops so near the library','unless there has been a suitable train'],
             cor:'a', hint:'"since I was feeling very tired" = yorgun oldugum için — sebep olarak mantikli'},
            {q:'Some people argue that certain oriental relaxation techniques, ............. yoga and meditation, are extremely effective. (T2-S7)',
             opts:['so','just as','such as','both'],
             cor:'c', hint:'"such as" = "örnegin, gibi" — örnekleme prepositionu'},
            {q:'You must always have a good breakfast every morning ....... late you are. (T2-S8)',
             opts:['no matter','however','although','whatever'],
             cor:'a', hint:'"no matter how late" = ne kadar geç olursa olsun — however ile ayni'},
            {q:'......... the factory has been working at its lowest capacity. (T2-S9)',
             opts:['Owing to the high efficiency of the new manager','Due to the shortage of some essential raw materials','Because of the considerable decrease in production','In spite of the cancellation of many important orders'],
             cor:'b', hint:'"Due to the shortage of raw materials" = kapasite düsüsünün mantikli sebebi'},
            {q:'........ all the problems she encountered, she managed to finish her homework on time. (T2-S10)',
             opts:['By the time','In spite of','Even though','However'],
             cor:'b', hint:'"In spite of" + isim = tüm sorunlara ragmen — Despite ile ayni'},
        ]
    },
    {
        label: 'Set 5 — Test 2',
        questions: [
            {q:'To many foreigners, cricket appears to be a slow and boring game, ....... (T2-S11)',
             opts:['but in fact it requires a lot of skill and a quick eye','therefore it will make headline news','so there were a great number of amateur clubs','whereas it is team work rather than individual performance that matters'],
             cor:'a', hint:'"but in fact" = zitlik — görünüste siki ama aslinda beceri ister'},
            {q:'The official minimum wage is so low that several members of a family must work .......... earn enough. (T2-S12)',
             opts:['otherwise','moreover','on the contrary','so that','in order to'],
             cor:'e', hint:'"in order to" + fiil = amaç — so that + özne + fiil ile ayni anlam'},
            {q:'......... this particular operation had been successful ........ there had been no complications. (T2-S13)',
             opts:['neither/nor','either/or','so/as','not only/but also'],
             cor:'d', hint:'"not only ... but also" = sadece ... degil, ayni zamanda'},
            {q:'...... they vary in their arrangement and in their manner of presenting the material. (T2-S14)',
             opts:['Whether the lives of all such authors are included in biographical reference books','If the book you want is listed in the catalogue','Since the table of contents appears at the front of the book','Although all good dictionaries contain essentially the same kind of information'],
             cor:'d', hint:'"Although all good dictionaries ... they vary" — zitlik: hepsi iyi ama düzenleme farki var'},
            {q:'Since the price of land is rising rapidly .......... (T2-S15)',
             opts:['you have been lucky to find something at that price','he would have drawn all his money from the bank','the method of advertising would have been changed','there was no need to express your views so strongly'],
             cor:'a', hint:'"since" = çünkü/madem ki — fiyat artiyor, bu fiyata bulmak sans'},
            {q:'I may never be able to come back to Turkey, ........ I want to see as much as possible while I am here. (T2-S16)',
             opts:['since','unless','because','so'],
             cor:'d', hint:'"so" = bu yüzden — önceki sebebin sonucunu birlestirir'},
            {q:'It doesn\'t look like rain but take an umbrella just ......... it does. (T2-S17)',
             opts:['so as','in case','as if','so that'],
             cor:'b', hint:'"in case it does" = yagmur yagma ihtimaline karsi — önlem amaçli'},
            {q:'......... willingly he seems to have accepted the new job, I don\'t really think he likes the working conditions. (T2-S18)',
             opts:['However','Although','So','Even'],
             cor:'a', hint:'"However willingly" = ne kadar istekli görünse de — No matter how ile ayni'},
            {q:'Our neighbour has promised to look after the cat ......... (T2-S19)',
             opts:['until we left for Antalya last week','while we are away on holiday this June','whose kittens still weren\'t able to look after themselves','even if she preferred dogs to cats'],
             cor:'b', hint:'"while we are away on holiday" = tatildeyken — zaman uyumu: future/present'},
            {q:'Apple tea is .. refreshing .. healthy, so I recommend it as an alternative to black tea. (T2-S20)',
             opts:['so/that','both/and','either/or','neither/nor'],
             cor:'b', hint:'"both ... and" = hem ... hem de — iki olumlu özellik birlikte'},
        ]
    },
    {
        label: 'Set 6 — Test 3',
        questions: [
            {q:'She had ......... got on the bus ......... it hit a lorry. (T3-S1)',
             opts:['no sooner/than','both/and','not only/but also','the sooner/the more','either/or'],
             cor:'a', hint:'"no sooner ... than" = biner binmez — Hardly/when ile ayni anlam'},
            {q:'.......... a broken sewage pipe near the Rodrigo De Freitas Lagoon in Brazil, 132 tons of fish died. (T3-S2)',
             opts:['In order to','Though','As a result of','Because','Despite'],
             cor:'c', hint:'"As a result of" + isim = sonucu olarak — because of ile ayni'},
            {q:'.......... her son is at university, she has more time to do the things she enjoys. (T3-S3)',
             opts:['As a result','Nevertheless','Because of','In contrast to','Now that'],
             cor:'e', hint:'"Now that" = "simdi ki, madem ki" — degisen bir durumun sonucu'},
            {q:'........ being colleagues, they are also good friends. (T3-S4)',
             opts:['In order to','Besides','However','Not only','Moreover'],
             cor:'b', hint:'"Besides" + isim/V-ing = "...in yani sira" — In addition to ile ayni'},
            {q:'.......... she was taking the chicken out of the oven, her husband rang to inform her he would be eating out. (T3-S5)',
             opts:['Until','Seeing that','As long as','Just as','Hardly'],
             cor:'d', hint:'"Just as" = "tam ... siraya" — ayni anda gerçeklesen iki eylem'},
            {q:'Due to her allergy, food which contains flour, ......... bread, cakes and pastry, is excluded from Edith\'s diet. (T3-S6)',
             opts:['in case','as far as','even when','such as'],
             cor:'d', hint:'"such as" = örnegin — somut örnekler verirken kullanilir'},
            {q:'This rose-flavour Turkish delight is ......... delicious ........ we should buy some to take home. (T3-S7)',
             opts:['as/as','both/and','not only/but','more/than','so/that'],
             cor:'e', hint:'"so ... that" = o kadar lezzetli ki — sonuç cümlesi gelir'},
            {q:'There is no single science of society. ......... there are several branches of learning that deal with it. (T3-S8)',
             opts:['Instead','Or else','Thus','Besides'],
             cor:'d', hint:'"Besides" = "üstelik, bunun yani sira" — ekleme geçis kelimesi'},
            {q:'I\'ve left a message with Carol about all the details ....... the delivery comes while I\'m out. (T3-S9)',
             opts:['unless','in case','when','until'],
             cor:'b', hint:'"in case the delivery comes" = kargo gelirse diye — önlem amaçli'},
            {q:'The run-down blocks of flats have ......... become depressing places to live in, ........ dangerous neighbourhoods to walk around. (T3-S10)',
             opts:['the more/than','whether/or','not only/but also','so much/that','scarcely/when'],
             cor:'c', hint:'"not only ... but also" = sadece yasanmaz hale gelmekle kalmamis, tehlikeli de'},
        ]
    },
    /* -- YENI SET EKLEMEK ICIN BURAYA KOPYALA --
    {
        label: 'Set 7',
        questions: [
            {q:'Soru metni ___.',
             opts:['A','B','C','D'],
             cor:'a', hint:'Aciklama'},
        ]
    },
    ------------------------------------------------- */
];

let _cjSetIdx     = 0;
let _cjSetScore   = 0;
let _cjSetChecked = {};
let _cjSetAnswers = {};

function cjExercises() {
    _cjSetIdx = 0; _cjSetScore = 0; _cjSetChecked = {}; _cjSetAnswers = {};
    return _cjBuildExercisePage();
}

function _cjBuildExercisePage() {
    const set   = CJ_SETS[_cjSetIdx];
    const total = set.questions.length;

    const tabs = CJ_SETS.map(function(s, i) {
        const active = i === _cjSetIdx
            ? 'style="background:#16a34a;color:#fff;border-color:#16a34a;"' : '';
        return '<button class="gr-set-tab" ' + active + ' onclick="cjSwitchSet(' + i + ')">' + s.label + '</button>';
    }).join('');

    const qCards = set.questions.map(function(q, i) {
        const opts = q.opts.map(function(o, j) {
            const letter = ['A','B','C','D','E'][j];
            const lv     = ['a','b','c','d','e'][j];
            const state  = _cjSetAnswers[_cjSetIdx + '_' + i];
            let cls    = 'gr-opt';
            if (_cjSetChecked[_cjSetIdx + '_' + i]) {
                if (lv === q.cor)                         cls += ' ok';
                else if (lv === state && state !== q.cor) cls += ' bad';
            } else if (state === lv) cls += ' sel';
            return '<div class="' + cls + '" id="cjso-' + i + '-' + j + '" onclick="cjSetOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');

        const checked = _cjSetChecked[_cjSetIdx + '_' + i];
        const fbCls   = checked ? (checked === 'ok' ? 'gr-fb show ok' : 'gr-fb show bad') : 'gr-fb';
        const fbTxt   = checked === 'ok'  ? 'Dogru! ' + q.hint
                    : checked === 'bad' ? 'Yanlis. Dogru: ' + q.cor.toUpperCase() + ' -- ' + q.hint : '';
        const cardCls = checked === 'ok' ? 'gr-q-card gr-c' : checked === 'bad' ? 'gr-q-card gr-w' : 'gr-q-card';
        const btnDis  = checked ? 'disabled style="opacity:.4;pointer-events:none;"' : '';

        return '<div class="' + cardCls + '" id="cjsc-' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' -- ' + set.label.toUpperCase() + '</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#16a34a;color:#16a34a" onclick="cjCheckSetQ(' + i + ')" ' + btnDis + '>Kontrol Et</button>'
            + '<div class="' + fbCls + '" id="cjsfb-' + i + '">' + fbTxt + '</div>'
            + '</div>';
    }).join('');

    const nextBtn = _cjSetIdx < CJ_SETS.length - 1
        ? '<button class="gr-retry-btn" style="background:#16a34a;color:#fff;border-color:#16a34a" onclick="cjNextSet()">Sonraki Set &rarr;</button>'
        : '<span style="font-size:.8rem;color:var(--ink3);align-self:center">Tum setler tamamlandi!</span>';

    return cjH('Conjunctions & Transitions', 'Alistirmalar', CJ_SETS.length + ' set x 10 soru -- Her seti tamamla, sonraki sete geç.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-set-tabs">' + tabs + '</div>'
        + '<div class="gr-score-bar">'
        + '<span class="gr-score-label">' + set.label + ' Puani</span>'
        + '<span class="gr-score-val" id="cj-live-score">' + _cjSetScore + ' / ' + total + '</span>'
        + '</div>'
        + qCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#16a34a,#4ade80)" onclick="cjSubmitSet()">Seti Degerlendir & Sonucu Gor</button>'
        + '<div class="gr-result" id="cj-result">'
        + '<div class="gr-res-score" id="cj-res-score" style="color:#16a34a">0/' + total + '</div>'
        + '<div class="gr-res-lbl">' + set.label + ' Tamamlandi</div>'
        + '<div class="gr-res-msg" id="cj-res-msg"></div>'
        + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px">'
        + '<button class="gr-retry-btn" style="border-color:#16a34a;color:#16a34a" onclick="cjRetrySameSet()">Ayni Seti Tekrar</button>'
        + nextBtn
        + '</div></div></div>';
}

function cjSwitchSet(idx) {
    _cjSetIdx = idx; _cjSetScore = 0; _cjSetChecked = {}; _cjSetAnswers = {};
    const cnt = document.getElementById('cj-content');
    if (cnt) { cnt.innerHTML = _cjBuildExercisePage(); cnt.scrollTop = 0; }
}

function cjSetOpt(qi, oi, letter) {
    if (_cjSetChecked[_cjSetIdx + '_' + qi]) return;
    CJ_SETS[_cjSetIdx].questions[qi].opts.forEach(function(_, j) {
        const el = document.getElementById('cjso-' + qi + '-' + j);
        if (el) el.className = 'gr-opt' + (j === oi ? ' sel' : '');
    });
    _cjSetAnswers[_cjSetIdx + '_' + qi] = letter;
}

function cjCheckSetQ(qi) {
    const q    = CJ_SETS[_cjSetIdx].questions[qi];
    const sel  = _cjSetAnswers[_cjSetIdx + '_' + qi];
    const fb   = document.getElementById('cjsfb-' + qi);
    const card = document.getElementById('cjsc-' + qi);
    if (!sel) { fb.textContent = 'Bir secenek secin!'; fb.className = 'gr-fb show bad'; return; }
    const letters = ['a','b','c','d','e'];
    q.opts.forEach(function(_, j) {
        const el = document.getElementById('cjso-' + qi + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor)                     el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    const btn = card.querySelector('.gr-chk-btn');
    if (btn) { btn.disabled = true; btn.style.opacity = '.4'; btn.style.pointerEvents = 'none'; }
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = 'Dogru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        _cjSetChecked[_cjSetIdx + '_' + qi] = 'ok';
        _cjSetScore++;
    } else {
        card.classList.add('gr-w');
        fb.textContent = 'Yanlis. Dogru: ' + q.cor.toUpperCase() + ' -- ' + q.hint;
        fb.className = 'gr-fb show bad';
        _cjSetChecked[_cjSetIdx + '_' + qi] = 'bad';
    }
    const el = document.getElementById('cj-live-score');
    if (el) el.textContent = _cjSetScore + ' / ' + CJ_SETS[_cjSetIdx].questions.length;
}

function cjSubmitSet() {
    const total = CJ_SETS[_cjSetIdx].questions.length;
    const panel = document.getElementById('cj-result');
    if (!panel) return;
    panel.classList.add('show');
    document.getElementById('cj-res-score').textContent = _cjSetScore + '/' + total;
    const pct = Math.round((_cjSetScore / total) * 100);
    document.getElementById('cj-res-msg').textContent =
        pct >= 90 ? 'Mukemmel! Bu seti harika geçirdin!'
      : pct >= 70 ? 'Cok iyi! Kücük eksikler var.'
      : pct >= 50 ? 'Orta duzey. Eksik konulara geri dön.'
      :             'Daha fazla pratik gerekiyor!';
    if (typeof saveGrammarScore === 'function') saveGrammarScore('cj', _cjSetScore);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cjRetrySameSet() { cjSwitchSet(_cjSetIdx); }
function cjNextSet()      { if (_cjSetIdx < CJ_SETS.length - 1) cjSwitchSet(_cjSetIdx + 1); }


/* ════════ GLOBALS ════════ */
// openConjSection ve _cjRenderSection: _initConjModule içinde atandı
window.cjSwitchSet    = cjSwitchSet;
window.cjSetOpt       = cjSetOpt;
window.cjCheckSetQ    = cjCheckSetQ;
window.cjSubmitSet    = cjSubmitSet;
window.cjRetrySameSet = cjRetrySameSet;
window.cjNextSet      = cjNextSet;

(function _initConjModule() {
    const _mod = new GrammarModule({
        id:       'cj',
        pageId:   'conj-page',
        sbId:     'sb-grammar-conj',
        diId:     'di-grammar-conj',
        title:    'Adverbial Clauses &amp; Conjunctions',
        sections: CJ_SECTIONS,
        dotColors: CJ_DOT,
        grpOrder: ['Genel', 'Coordination', 'Subordinating', 'Transitions', 'Özel'],
        sectionMap: {
            'overview':     function(){ return cjOverview(); },
            'coordinating': function(){ return cjCoordinating(); },
            'correlative':  function(){ return cjCorrelative(); },
            'cause':        function(){ return cjCause(); },
            'result':       function(){ return cjResult(); },
            'purpose':      function(){ return cjPurpose(); },
            'contrast':     function(){ return cjContrast(); },
            'time':         function(){ return cjTime(); },
            'addition':     function(){ return cjAddition(); },
            'reduction':    function(){ return cjReduction(); },
            'gerund':       function(){ return cjGerund(); },
            'exercises':    function(){ return cjExercises(); }
        },
        onSectionRender: function(id) {
            if (id === 'exercises') {
                _cjScore = 0; _cjAnswers = {}; _cjChecked = {};
                _cjUpdScore();
            }
        }
    });

    window.openConjSection  = function(sectionId) { _mod.open(sectionId || 'overview'); };
    window._cjRenderSection = function(id)        { _mod.goTo(id); };
    window['_cjGoTo']       = function(id)        { _mod.goTo(id); };
})();
