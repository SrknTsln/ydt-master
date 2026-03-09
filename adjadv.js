// ════════════════════════════════════════════════════════════════
// adjadv.js  —  Adjectives & Adverbs Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Adjectives & Adverbs notları (s. 37–45)
// ════════════════════════════════════════════════════════════════

let _aaCurrentSection = 'overview';
let _aaAnswers = {};
let _aaChecked = {};
let _aaScore = 0;
const AA_TOTAL = 16;

const AA_SECTIONS = [
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

const AA_DOT = {
    'Genel':      '#6366f1',
    'Adjectives': '#7c3aed',
    'Adverbs':    '#0369a1',
    'Comparison': '#b45309',
    'Özel':       '#e63946'
};

/* ════════ ENTRY POINT — GrammarModule engine ════════ */

/* ════════ HELPERS ════════ */
/* ════════ ENTRY POINT ════════ */
function aaH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#4c1d95 0%,#7c3aed 60%,#a78bfa 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function aaSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function aaTable(headers, rows) {
    const ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    const trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function aaAcc(items) {
    return '<div class="gr-acc-wrap">' + items.map(function(it) {
        const exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #7c3aed"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        const noteHtml = (it.notes||[]).map(function(n){
            return '<div style="background:#f5f3ff;border:1.5px solid #c4b5fd;border-radius:8px;padding:10px 14px;margin:6px 0;font-size:.8rem;color:#4c1d95;line-height:1.7">' + n + '</div>';
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
    }).join('') + '</div>';
}

function aaBox(color, title, lines) {
    const styles = {
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        orange: 'background:#fff7ed;border:2px solid #ea580c;color:#7c2d12',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239'
    };
    const content = lines.map(function(l){
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
    const cards = [
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

    const cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.bd + ';border-radius:14px;padding:16px;background:' + c.bc + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' data-action="_aaRenderSection(\'' + c.id + '\')">'
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
        + '<button data-action="_aaRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#a78bfa);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button>'
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
    const pairs = [
        ['Thrill',      'Thrilling',      'Thrilled',      'The <strong>thrilling</strong> motocross left us <strong>thrilled</strong>.'],
        ['Tire',        'Tiring',         'Tired',         'After a <strong>tiring</strong> day at school, I feel so <strong>tired</strong>.'],
        ['Relax',       'Relaxing',       'Relaxed',       'Spending the weekend in the forest was so <strong>relaxing</strong>. I returned home feeling <strong>relaxed</strong>.'],
        ['Fascinate',   'Fascinating',    'Fascinated',    'The documentary about ancient people was <strong>fascinating</strong>. We were <strong>fascinated</strong> by the stories.'],
        ['Interest',    'Interesting',    'Interested',    'The lecture on moon exploration was very <strong>interesting</strong>. Several students were <strong>interested</strong> in the topic.'],
        ['Fulfill',     'Fulfilling',     'Fulfilled',     'Helping the poor through volunteering is a <strong>fulfilling</strong> experience. It leaves you feeling <strong>fulfilled</strong>.'],
        ['Excite',      'Exciting',       'Excited',       'Winning the song contest was an <strong>exciting</strong> moment. Everyone was <strong>excited</strong> about the outcome.'],
        ['Entertain',   'Entertaining',   'Entertained',   'The theater show was really <strong>entertaining</strong>. The viewer was thoroughly <strong>entertained</strong>.'],
    ];

    const tableHtml = '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>'
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
    const types = [
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
const AA_SETS = [
    {
        label: 'Set 1',
        questions: [
            {q:'After a ___ day at school, I feel so tired.',
             opts:['tired','tiring','tirely','tiresomely'],
             cor:'b', hint:'-ing = duygunun kaynagi (yorucu gun) > tiring'},
            {q:'She sings ___ well?',
             opts:['good','well','goodly','best'],
             cor:'b', hint:'good = sifat, well = zarftir'},
            {q:'The weather turned ___ suddenly.',
             opts:['coldly','cold','more cold','so cold'],
             cor:'b', hint:'turn linking verb > ardindan sifat (cold) gelir'},
            {q:'Students could ___ answer any questions.',
             opts:['hard','hardly','enough','too'],
             cor:'b', hint:'hardly = neredeyse hic (olumsuz anlam)'},
            {q:'The tea is ___ hot to drink right now.',
             opts:['very','enough','too','so'],
             cor:'c', hint:'too + adj + to-inf > geregindan fazla, olumsuz sonuc'},
            {q:'The book Don Quixote is ___ a masterpiece that its writer deserves all the praise.',
             opts:['so','as','such','too'],
             cor:'c', hint:'such + a/an + sifat + isim + that kalibı'},
            {q:'The experiment was carried out so carefully ___ the results were highly exact.',
             opts:['as','which','though','that'],
             cor:'d', hint:'so ... that = o kadar ... ki'},
            {q:'___ more you practice, ___ more you learn.',
             opts:['The / the','A / a','So / that','Such / that'],
             cor:'a', hint:'The more ... the more = paralel artis kalibı'},
            {q:'The pillow feels ___.',
             opts:['softly','soft','more softly','softer'],
             cor:'b', hint:'feel linking verb > ardindan sifat (soft) gelir'},
            {q:'Italy\'s culinary culture is ___ to Spain\'s.',
             opts:['similar','different','opposite','equal'],
             cor:'a', hint:'similar to = benzer; karsilastirma edati to ile kullanilir'},
        ]
    },
    {
        label: 'Set 2',
        questions: [
            {q:'Professor Turner\'s excellent book will give you a lot of .......... information on the subject. (OYS 1988)',
             opts:['dangerous','useless','unnecessary','valuable'],
             cor:'d', hint:'valuable information = degerli bilgi; bagiam olumlu bir kitabi tanimliyor'},
            {q:'Peter thought it wasn\'t warm .......... to go swimming. (OYS 1988)',
             opts:['for','enough','too','still'],
             cor:'b', hint:'warm enough to = adj + enough + to-inf kalibı'},
            {q:'The teacher\'s question was .......... difficult, so only one student was able to answer it. (OYS 1988)',
             opts:['extremely (pos.I)','extremely (pos.II)','extremely (pos.III)','extremely (pos.IV)'],
             cor:'b', hint:'extremely difficult > yogunlastirici zarf sifati nitelendirmeli (II. konuma gelir)'},
            {q:'A washing machine costs ..... the same as a television set. (OYS 1989)',
             opts:['approximately','perfectly','suddenly','extremely'],
             cor:'a', hint:'approximately the same as = yaklasik ayni fiyatta'},
            {q:'I have such a lot of work to do that it is ........ to try to finish it today. (OYS 1990)',
             opts:['useless','sensitive','eager','exaggerated'],
             cor:'a', hint:'it is useless to = yapmak bosuna; cok is var, bitirmek imkansiz'},
            {q:'They looked as if they were climbing fast ........ to reach the top before dark. (OYS 1990)',
             opts:['owing','already','quite','enough'],
             cor:'d', hint:'fast enough to = yeterince hizli; enough + to-inf kalibı'},
            {q:'The weather was so cold.......... (OYS 1990)',
             opts:['since I came to live in this town','when the wind blows hard','because it has been snowing','that I decided not to walk to school'],
             cor:'d', hint:'so cold that = o kadar soguk ki > that ile sonuc cumlesi'},
            {q:'The tourists were ............... by the poverty they observed in some African countries. (OYS 1991)',
             opts:['upset','damaged','contented','involved'],
             cor:'a', hint:'upset by = etkilenmek, uzulmek; -ed participle = duyguyu yasayan'},
            {q:'Clara exercises ........ every morning to get into shape for the swimming season. (OYS 1991)',
             opts:['clumsily','reluctantly','vigorously','mournfully'],
             cor:'c', hint:'vigorously = guclu ve enerjik bicimde; forma girmek icin mantikli zarf'},
            {q:'Why don\'t you stay in bed and rest .......... until you feel ......? (OYS 1991)',
             opts:['better / well','good / better','bad / worse','worse / best'],
             cor:'a', hint:'feel better = linking verb + adjective; rest well = fiil + adverb'},
        ]
    },
    {
        label: 'Set 3',
        questions: [
            {q:'Measles is not .... a children\'s disease. (OYS 1992)',
             opts:['seriously','occasionally','nearly','exclusively'],
             cor:'d', hint:'not exclusively = yalnizca cocuklara ozgu degil'},
            {q:'There is nothing ........ being interrupted all the time. (OYS 1992)',
             opts:['annoying enough','as annoyed as','so annoying that','more annoying than'],
             cor:'d', hint:'nothing more annoying than = daha can sikici bir sey yok > superlative dolayli'},
            {q:'The better I get to know him ...... (OYS 1992)',
             opts:['more the outcome had seemed unpredictable','I really cannot stand him','I realized to what extent they had been involved','the less I like him'],
             cor:'d', hint:'The better ... the less = karsiit paralel artis kalibı'},
            {q:'My .... sport is tennis. What is yours? (OYS 1993)',
             opts:['wonderful','favourite','fine','miserable'],
             cor:'b', hint:'favourite sport = en sevilen spor; bagiam kisisel tercih soruyor'},
            {q:'The use of food additives has grown ....... in recent years; in fact, it increased tenfold. (OYS 1993)',
             opts:['deliberately','closely','rapidly','precisely'],
             cor:'c', hint:'grown rapidly = hizla artmak; tenfold in three decades ifadesiyle uyumlu'},
            {q:'The diagram shows it is ......... in summer than in winter in the northern hemisphere. (OYS 1993)',
             opts:['so hot','hottest','hot','hotter'],
             cor:'d', hint:'hotter ... than = comparative form; iki mevsim karsilastiriliyor'},
            {q:'In some parts of the world they are ......... short of food .......... people are dying of hunger. (OYS 1993)',
             opts:['too/that','more/than','as/as','so/that'],
             cor:'d', hint:'so short of food that = o kadar kit ki > sonuc kalibı'},
            {q:'Jane has lost the gold brooch her mother gave her ............... a wedding present. (OYS 1994)',
             opts:['as','such as','despite','like'],
             cor:'a', hint:'gave her as a wedding present = dugun hediyesi olarak verdi; as = islev/rol'},
            {q:'He performed ............... the audience applauded him for ten minutes. (OYS 1994)',
             opts:['more skilful than','as skilful as','so skilfully that','skilful enough'],
             cor:'c', hint:'so skilfully that = o kadar ustalikla ki > so + adv + that kalibı'},
            {q:'I cannot tell you the exact amount, but I can give you a ........ estimate. (OYS 1994)',
             opts:['smooth','rough','cruel','tidy'],
             cor:'b', hint:'rough estimate = kabataslak tahmin; kesin olmayan rakam bagiam'},
        ]
    },
    {
        label: 'Set 4',
        questions: [
            {q:'Hong Kong is one of the most .......... populated areas in the world. (OYS 1994)',
             opts:['consequently','wastefully','completely','densely'],
             cor:'d', hint:'densely populated = yogun nufuslu; standart cografya ifadesi'},
            {q:'Soil is ......... being eroded by the action of running water and wind. (OYS 1994)',
             opts:['constantly','suitably','bitterly','exactly'],
             cor:'a', hint:'constantly being eroded = surekli asiniyor; devam eden surec'},
            {q:'The earthquake caused ......... damage but not as much as expected. (OYS 1995)',
             opts:['competent','sensible','rapid','considerable'],
             cor:'d', hint:'considerable damage = onemli hasar; ama beklenenden az > orta duzey'},
            {q:'Unless you take your medicine ......... that cough of yours will never go. (OYS 1995)',
             opts:['decisively','regularly','reluctantly','specially'],
             cor:'b', hint:'take medicine regularly = duzenli ilac almak; tibbi tavsiye bagiam'},
            {q:'A lot of the pictures were really very good, but Mary\'s was certainly ........ of all. (OYS 1995)',
             opts:['well','better','as good','the best'],
             cor:'d', hint:'the best of all = superlative; tum resimler arasinda en iyi'},
            {q:'I don\'t think Frank is old ...... to stay at home alone. (OYS 1995)',
             opts:['so','too','enough','even'],
             cor:'c', hint:'old enough to = adj + enough + to-inf; yas yeterliligi'},
            {q:'You\'ve kept us waiting for two hours. Next time make sure you are ...... (OYS 1996)',
             opts:['suitable','influential','punctual','variable'],
             cor:'c', hint:'punctual = dakik; bekleme bagiam zamaninda gelmeyi isaaret ediyor'},
            {q:'This report seems interesting in parts, but the last section is ........ unrealistic. (OYS 1996)',
             opts:['completely','sensibly','consequently','nervously'],
             cor:'a', hint:'completely unrealistic = tamamen gercek disi; yogunlastirici zarf'},
            {q:'Do you think we can trust him to find a ......... place for us to stay in London? (OYS 1997)',
             opts:['thorough','considerate','sufficient','suitable'],
             cor:'d', hint:'suitable place to stay = kalinacak uygun yer; guven + yer arama bagiam'},
            {q:'The view from this window is one of ....... I have ever seen. (OYS 1997)',
             opts:['the finest','finest','the finer','finer'],
             cor:'a', hint:'one of the finest = superlative + I have ever seen ile zorunlu'},
        ]
    },
    {
        label: 'Set 5',
        questions: [
            {q:'Parents who understand child behaviour are more ......... about their ability to handle difficult situations. (OYS 1998)',
             opts:['familiar','watchful','confident','virtuous'],
             cor:'c', hint:'confident about their ability = yeteneklerine guvenen; bagiam olumlu'},
            {q:'Foods that were ........ seasonal may now be found throughout the year. (OYS 1998)',
             opts:['properly','satisfactorily','previously','rapidly'],
             cor:'c', hint:'previously seasonal = onceden mevsimlik; artik yil boyu bulunuyor'},
            {q:'Although he is an engineer, he is as ...... as any carpenter at making kitchen furniture. (YDS 1999)',
             opts:['forceful','genuine','skilful','extravagant'],
             cor:'c', hint:'as skilful as any carpenter = herhangi bir marangoz kadar becerikli'},
            {q:'The chief of police agreed to release news of the accident, but he did so ........ (YDS 1999)',
             opts:['regularly','extremely','terribly','reluctantly'],
             cor:'d', hint:'did so reluctantly = isteksizce yapti; polis iletisimde geri duruyordu'},
            {q:'His lecture was attended by........people ....... the hall was completely full. (YDS 1999)',
             opts:['so much/as','so many/that','as many/as','more/than'],
             cor:'b', hint:'so many people that = sayilabilir isim + so many + that'},
            {q:'As she grew older, it became ....... difficult for her to do the shopping. (YDS 2000)',
             opts:['eventually','increasingly','doubtfully','adequately'],
             cor:'b', hint:'increasingly difficult = giderek daha zor; yaslanma sureci'},
            {q:'I enjoyed this book so much; I want to read another by ....... author. (YDS 2000)',
             opts:['such','similar','same','the same'],
             cor:'d', hint:'another book by the same author = ayni yazarin baska kitabi'},
            {q:'You can look at this plan ..... closely ...... you like but you will not be able to understand it. (YDS 2000)',
             opts:['as/as','so/that','such/that','more/than'],
             cor:'a', hint:'as closely as you like = istedigin kadar yakından > as...as kalibı'},
            {q:'When the class laughed, the poor boy felt ..... uncomfortable ..... he did not know what to do. (YDS 2001)',
             opts:['such/that','that/as','as/as','so/that'],
             cor:'d', hint:'felt so uncomfortable that = so + adj + that; durum sonucu'},
            {q:'I cannot afford to pay ...... that for a pair of shoes. (YDS 2001)',
             opts:['too much','as much as','so much','as many as'],
             cor:'b', hint:'cannot afford to pay as much as that = o kadar para odeyemem'},
        ]
    },
    {
        label: 'Set 6',
        questions: [
            {q:'I feel much ........; at least ........ enough to be able to get out of bed. (Test 1 - S.1)',
             opts:['the worst/worse','better/well','best/better','good/so well'],
             cor:'b', hint:'feel much better (comparative) + well enough to (adverb + enough + to-inf)'},
            {q:'There is nothing ......... a slight breeze on a hot, sunny day. (Test 1 - S.2)',
             opts:['refreshing enough','as refreshed as','more refreshing than','so refreshing that'],
             cor:'c', hint:'nothing more refreshing than = superlative dolayli ifade'},
            {q:'The survey confirmed that house prices are ......... higher in the South than in the North. (Test 1 - S.3)',
             opts:['so','more','most','much'],
             cor:'d', hint:'much higher than = comparative yogunlastirici much'},
            {q:'There is ......... a shortage of qualified teachers ......... the government is paying students to train. (Test 1 - S.4)',
             opts:['such/that','so/as','more/than','too/than'],
             cor:'a', hint:'such a shortage that = such + a/an + isim + that'},
            {q:'My father treasures the gold watch that he was given ......... a retirement present. (Test 1 - S.5)',
             opts:['like','as','such as','so'],
             cor:'b', hint:'given as a retirement present = emeklilik hediyesi olarak; as = islev/rol'},
            {q:'Some of the delegates were ........... with the Chairman\'s speech ................. they walked out. (Test 1 - S.6)',
             opts:['too disappointed/that','more disappointing/than','so disappointed/that','so disappointing/than'],
             cor:'c', hint:'so disappointed that they walked out = -ed participle + so...that'},
            {q:'Without the heavy make-up, she looks ......... in real life ......... she does on television. (Test 1 - S.7)',
             opts:['young/so','as young/that','younger/than','the youngest/as'],
             cor:'c', hint:'looks younger than she does on TV = comparative + than kalibı'},
            {q:'He was not ....... studious student in the class, but he worked ........ to pass his final examinations. (Test 1 - S.8)',
             opts:['the most/hard enough','such/harder than','more/so hard that','as much as/hardly'],
             cor:'a', hint:'the most studious (superlative) + hard enough to pass (enough + to-inf)'},
            {q:'After we had been shopping, I was ........ to join them. (Test 1 - S.9)',
             opts:['so tiring that','the most tired','so tired as','too tired'],
             cor:'d', hint:'too tired to join = too + adj + to-inf; olumsuz sonuc'},
            {q:'The spot where Vicki\'s new house is located is ......... one that all her friends want to visit her. (Test 1 - S.10)',
             opts:['the most picturesque','more picturesque than','as picturesque as','so picturesque that'],
             cor:'d', hint:'so picturesque that everyone wants to visit = so + adj + that sonuc'},
        ]
    },
    {
        label: 'Set 7',
        questions: [
            {q:'The amazing thing about oltu stone is that ........ you keep it, ....... it gets. (Test 1 - S.11)',
             opts:['so long/so shiny','the long/the shiny','the longest/the shiniest','the longer/the shinier'],
             cor:'d', hint:'the longer you keep it, the shinier it gets = paralel artis kalibı'},
            {q:'For me, ......... aspect of the conference was the decision to concentrate on environmental issues. (Test 1 - S.12)',
             opts:['as encouraging','so encouraged as','more encouraged','the most encouraging'],
             cor:'d', hint:'the most encouraging aspect = superlative; for me kisiel en iyi'},
            {q:'My father plays golf for fun, although sometimes he plays .... some professionals. (Test 1 - S.13)',
             opts:['so skilful that','as skilfully as','more skilfully','the most skilful'],
             cor:'b', hint:'plays as skilfully as professionals = esitlik; adverb kalibı'},
            {q:'She could not believe that her son had behaved ........ to be disciplined by the teacher. (Test 1 - S.14)',
             opts:['as bad as','worse than','the worst','badly enough'],
             cor:'d', hint:'behaved badly enough to be disciplined = adv + enough + to-inf'},
            {q:'The courts dealt with the farmer ........tolerantly ........ most people considered appropriate. (Test 1 - S.15)',
             opts:['more/as','so/as','the most/than','less/than'],
             cor:'d', hint:'less tolerantly than most people considered appropriate = less + than'},
            {q:'Because it all happened ......... he could not give an accurate description of his attacker. (Test 1 - S.16)',
             opts:['so suddenly','as sudden','too sudden','as suddenly'],
             cor:'a', hint:'happened so suddenly = so + adverb; fiili nitelendiriyor'},
            {q:'The people have ......... distrust of the government that few residents expect the elections to be fair. (Test 1 - S.17)',
             opts:['so','such','as','like'],
             cor:'b', hint:'such distrust that = such + sayilamaz isim + that kalibı'},
            {q:'He is feeling ......... can be expected after ......... a major operation. (Test 1 - S.18)',
             opts:['well enough/like','so well that/so','as well as/such','better than/that'],
             cor:'c', hint:'as well as can be expected + after such a major operation'},
            {q:'I felt ........ ill yesterday to get out of bed, but I am feeling ....... better today. (Test 1 - S.19)',
             opts:['as/much','so/that','more/so','too/a lot'],
             cor:'d', hint:'too ill to get out of bed + a lot better today = too + adj; a lot + comparative'},
            {q:'This material is ......... to be stitched together on a sewing machine. (Test 1 - S.20)',
             opts:['too delicate','as delicately as','so delicate that','delicately enough'],
             cor:'a', hint:'too delicate to be stitched = too + adj + to-inf; makine icin cok hassas'},
        ]
    },
    {
        label: 'Set 8',
        questions: [
            {q:'She had acted ............ she was dismissed immediately. (Test 2 - S.1)',
             opts:['more unprofessionally than','as unprofessionally as','so unprofessionally that','unprofessionally enough'],
             cor:'c', hint:'so unprofessionally that = o kadar profesyonelce davranmadi ki > so + adv + that'},
            {q:'......... we climbed, ......... the air became, which made it difficult for us to proceed. (Test 2 - S.2)',
             opts:['The higher/the colder','The highest/the coldest','Too high/too cold','As high/so cold'],
             cor:'a', hint:'The higher ... the colder = paralel artis kalibı; tirmandikca hava soglidu'},
            {q:'Records of Johannes Gutenberg are ......... vague for us to be able to know what he looked like. (Test 2 - S.4)',
             opts:['such','more','so','as'],
             cor:'c', hint:'so vague that/for = o kadar belirsiz ki; too/so + adj + for + noun'},
            {q:'I wish my cousin would type his letters as his handwriting is .......... legible. (Test 2 - S.5)',
             opts:['merely','bitterly','slightly','barely'],
             cor:'d', hint:'barely legible = zar zor okunabilir; neredeyse olumsuz anlam'},
            {q:'I made a bit of a mess of wrapping the present, but it was ....... shape to wrap. (Test 2 - S.6)',
             opts:['too awkward a','as awkward as','so awkward that','such an awkward'],
             cor:'a', hint:'too awkward a shape to wrap = too + adj + a + noun + to-inf kalibı'},
            {q:'The Renault Megane uses a little ...... petrol than the Skoda Esprit, but it performs ........ better. (Test 2 - S.7)',
             opts:['so much/less','too much/more','the most/a lot','more/much'],
             cor:'d', hint:'a little more petrol + much better = comparative + much yogunlastirici'},
            {q:'Farmer Parkinson\'s dog is ........... to scare any intruder. (Test 2 - S.9)',
             opts:['ferocious enough','such ferocious','as ferocious','so ferocious that'],
             cor:'a', hint:'ferocious enough to scare = adj + enough + to-inf; yeterlilik ifadesi'},
            {q:'....... dangerously a person lives, ........... likely he or she is to die young. (Test 2 - S.11)',
             opts:['So/much more','The more/the more','As much/too','Far too/so much'],
             cor:'b', hint:'The more dangerously ... the more likely = paralel artis kalibı'},
            {q:'Her economic situation has got ......... worse since she gave up her job. (Test 2 - S.13)',
             opts:['more','so','as','even'],
             cor:'d', hint:'gotten even worse = even + comparative = daha da kotulesme vurgusu'},
            {q:'Of all the problems she has faced, this one is by far ......... (Test 2 - S.14)',
             opts:['badly','worse','too badly','the worst'],
             cor:'d', hint:'by far the worst = superlative + by far yogunlastiricisi; of all ile zorunlu'},
        ]
    },
    /* -- YENI SET EKLEMEK ICIN BURAYA KOPYALA --
    {
        label: 'Set 9',
        questions: [
            {q:'Soru metni ___.',
             opts:['A', 'B', 'C', 'D'],
             cor:'a', hint:'Aciklama'},
        ]
    },
    ------------------------------------------------- */
];

let _aaSetIdx     = 0;
let _aaSetScore   = 0;
let _aaSetChecked = {};
let _aaSetAnswers = {};

function aaExercises() {
    _aaSetIdx = 0; _aaSetScore = 0; _aaSetChecked = {}; _aaSetAnswers = {};
    return _aaBuildExercisePage();
}

function _aaBuildExercisePage() {
    const set   = AA_SETS[_aaSetIdx];
    const total = set.questions.length;

    const tabs = AA_SETS.map(function(s, i) {
        const active = i === _aaSetIdx
            ? 'style="background:#7c3aed;color:#fff;border-color:#7c3aed;"' : '';
        return '<button class="gr-set-tab" ' + active + ' data-action="aaSwitchSet(' + i + ')">' + s.label + '</button>';
    }).join('');

    const qCards = set.questions.map(function(q, i) {
        const opts = q.opts.map(function(o, j) {
            const letter = ['A','B','C','D','E'][j];
            const lv     = ['a','b','c','d','e'][j];
            const state  = _aaSetAnswers[_aaSetIdx + '_' + i];
            let cls    = 'gr-opt';
            if (_aaSetChecked[_aaSetIdx + '_' + i]) {
                if (lv === q.cor)                         cls += ' ok';
                else if (lv === state && state !== q.cor) cls += ' bad';
            } else if (state === lv) cls += ' sel';
            return '<div class="' + cls + '" id="aaso-' + i + '-' + j + '" data-action="aaSetOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');

        const checked = _aaSetChecked[_aaSetIdx + '_' + i];
        const fbCls   = checked ? (checked === 'ok' ? 'gr-fb show ok' : 'gr-fb show bad') : 'gr-fb';
        const fbTxt   = checked === 'ok'  ? 'Dogru! ' + q.hint
                    : checked === 'bad' ? 'Yanlis. Dogru: ' + q.cor.toUpperCase() + ' -- ' + q.hint : '';
        const cardCls = checked === 'ok' ? 'gr-q-card gr-c' : checked === 'bad' ? 'gr-q-card gr-w' : 'gr-q-card';
        const btnDis  = checked ? 'disabled style="opacity:.4;pointer-events:none;"' : '';

        return '<div class="' + cardCls + '" id="aasc-' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' -- ' + set.label.toUpperCase() + '</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#7c3aed;color:#7c3aed" data-action="aaCheckSetQ(' + i + ')" ' + btnDis + '>Kontrol Et</button>'
            + '<div class="' + fbCls + '" id="aasfb-' + i + '">' + fbTxt + '</div>'
            + '</div>';
    }).join('');

    const nextBtn = _aaSetIdx < AA_SETS.length - 1
        ? '<button class="gr-retry-btn" style="background:#7c3aed;color:#fff;border-color:#7c3aed" data-action="aaNextSet()">Sonraki Set </button>'
        : '<span style="font-size:.8rem;color:var(--ink3);align-self:center">Tum setler tamamlandi!</span>';

    return aaH('Adjectives & Adverbs', 'Alistirmalar', AA_SETS.length + ' set x 10 soru -- Seti tamamla, sonucu gor, siradaki sete gec.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-set-tabs">' + tabs + '</div>'
        + '<div class="gr-score-bar">'
        + '<span class="gr-score-label">' + set.label + ' Puani</span>'
        + '<span class="gr-score-val" id="aa-live-score">' + _aaSetScore + ' / ' + total + '</span>'
        + '</div>'
        + qCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#7c3aed,#a78bfa)" data-action="aaSubmitSet()">Seti Degerlendir & Sonucu Gor</button>'
        + '<div class="gr-result" id="aa-result">'
        + '<div class="gr-res-score" id="aa-res-score">0/' + total + '</div>'
        + '<div class="gr-res-lbl">' + set.label + ' Tamamlandi</div>'
        + '<div class="gr-res-msg" id="aa-res-msg"></div>'
        + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px">'
        + '<button class="gr-retry-btn" data-action="aaRetrySameSet()">Ayni Seti Tekrar</button>'
        + nextBtn
        + '</div></div></div>';
}

function aaSwitchSet(idx) {
    _aaSetIdx = idx; _aaSetScore = 0; _aaSetChecked = {}; _aaSetAnswers = {};
    const cnt = document.getElementById('aa-content');
    if (cnt) { cnt.innerHTML = _aaBuildExercisePage(); cnt.scrollTop = 0; }
}

function aaSetOpt(qi, oi, letter) {
    if (_aaSetChecked[_aaSetIdx + '_' + qi]) return;
    AA_SETS[_aaSetIdx].questions[qi].opts.forEach(function(_, j) {
        const el = document.getElementById('aaso-' + qi + '-' + j);
        if (el) el.className = 'gr-opt' + (j === oi ? ' sel' : '');
    });
    _aaSetAnswers[_aaSetIdx + '_' + qi] = letter;
}

function aaCheckSetQ(qi) {
    const q    = AA_SETS[_aaSetIdx].questions[qi];
    const sel  = _aaSetAnswers[_aaSetIdx + '_' + qi];
    const fb   = document.getElementById('aasfb-' + qi);
    const card = document.getElementById('aasc-' + qi);
    if (!sel) { fb.textContent = 'Bir secenek secin!'; fb.className = 'gr-fb show bad'; return; }
    const letters = ['a','b','c','d','e'];
    q.opts.forEach(function(_, j) {
        const el = document.getElementById('aaso-' + qi + '-' + j);
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
        _aaSetChecked[_aaSetIdx + '_' + qi] = 'ok';
        _aaSetScore++;
    } else {
        card.classList.add('gr-w');
        fb.textContent = 'Yanlis. Dogru: ' + q.cor.toUpperCase() + ' -- ' + q.hint;
        fb.className = 'gr-fb show bad';
        _aaSetChecked[_aaSetIdx + '_' + qi] = 'bad';
    }
    const el = document.getElementById('aa-live-score');
    if (el) el.textContent = _aaSetScore + ' / ' + AA_SETS[_aaSetIdx].questions.length;
}

function aaSubmitSet() {
    const total = AA_SETS[_aaSetIdx].questions.length;
    const panel = document.getElementById('aa-result');
    if (!panel) return;
    panel.classList.add('show');
    document.getElementById('aa-res-score').textContent = _aaSetScore + '/' + total;
    const pct = Math.round((_aaSetScore / total) * 100);
    document.getElementById('aa-res-msg').textContent =
        pct >= 90 ? 'Mukemmel! Bu seti harika gecirdin!'
      : pct >= 70 ? 'Cok iyi! Kucuk eksikler var.'
      : pct >= 50 ? 'Orta duzey. Eksik konulara geri don.'
      :             'Daha fazla pratik gerekiyor!';
    if (typeof saveGrammarScore === 'function') saveGrammarScore('aa', _aaSetScore);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function aaRetrySameSet() { aaSwitchSet(_aaSetIdx); }
function aaNextSet()      { if (_aaSetIdx < AA_SETS.length - 1) aaSwitchSet(_aaSetIdx + 1); }


// openAdjAdvSection ve _aaRenderSection: _initAdjAdvModule içinde atandı
window.aaSwitchSet    = aaSwitchSet;
window.aaSetOpt       = aaSetOpt;
window.aaCheckSetQ    = aaCheckSetQ;
window.aaSubmitSet    = aaSubmitSet;
window.aaRetrySameSet = aaRetrySameSet;
window.aaNextSet      = aaNextSet;

(function _initAdjAdvModule() {
    const _mod = new GrammarModule({
        id:       'aa',
        pageId:   'adjadv-page',
        sbId:     'sb-grammar-adjadv',
        diId:     'di-grammar-adjadv',
        title:    'Adjectives &amp; Adverbs',
        sections: AA_SECTIONS,
        dotColors: AA_DOT,
        grpOrder: ['Genel', 'Adjectives', 'Adverbs', 'Comparison', 'Özel'],
        sectionMap: {
            'overview':    function(){ return aaOverview(); },
            'adjectives':  function(){ return aaAdjectives(); },
            'participle':  function(){ return aaParticiple(); },
            'adverbs':     function(){ return aaAdverbs(); },
            'irregular':   function(){ return aaIrregular(); },
            'dikkat':      function(){ return aaDikkat(); },
            'degree':      function(){ return aaDegree(); },
            'fairly':      function(){ return aaFairly(); },
            'so-such':     function(){ return aaSoSuch(); },
            'comparison':  function(){ return aaComparison(); },
            'as-as':       function(){ return aaAsAs(); },
            'similar':     function(){ return aaSimilar(); },
            'the-more':    function(){ return aaTheMore(); },
            'superlatives':function(){ return aaSuperlatives(); },
            'exercises':   function(){ return aaExercises(); }
        },
        onSectionRender: function(id) {
            if (id === 'exercises') {
                _aaScore = 0; _aaAnswers = {}; _aaChecked = {};
                _aaUpdScore();
            }
        }
    });

    window.openAdjAdvSection = function(sectionId) { _mod.open(sectionId || 'overview'); };
    window._aaRenderSection  = function(id)        { _mod.goTo(id); };
    window['_aaGoTo']        = function(id)        { _mod.goTo(id); };
})();
