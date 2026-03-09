// ════════════════════════════════════════════════════════════════
// grammar.js  —  English Tenses Grammar Modülü
// YDT Master Pro — showPage/navTo sistemiyle tam entegre
// ════════════════════════════════════════════════════════════════

/* ── State ── */
let _grCurrentSection = 'overview';
let _grAnswers = {};
let _grChecked = {};
let _grScore = 0;
const GR_TOTAL = 17;

/* ── Section metadata ── */
const GR_SECTIONS = [
    { id: 'overview',         label: 'Genel Bakış',          cat: '' },
    { id: 'simple-present',   label: 'Simple Present',        cat: 'present' },
    { id: 'pres-cont',        label: 'Present Continuous',    cat: 'present' },
    { id: 'pres-perf',        label: 'Present Perfect',       cat: 'present' },
    { id: 'pres-perf-cont',   label: 'Pres. Perfect Cont.',   cat: 'present' },
    { id: 'simple-past',      label: 'Simple Past',           cat: 'past' },
    { id: 'past-cont',        label: 'Past Continuous',       cat: 'past' },
    { id: 'past-perf',        label: 'Past Perfect',          cat: 'past' },
    { id: 'past-perf-cont',   label: 'Past Perf. Cont.',      cat: 'past' },
    { id: 'simple-future',    label: 'Simple Future',         cat: 'future' },
    { id: 'future-cont',      label: 'Future Continuous',     cat: 'future' },
    { id: 'future-perf',      label: 'Future Perfect',        cat: 'future' },
    { id: 'future-perf-cont', label: 'Future Perf. Cont.',    cat: 'future' },
    { id: 'modals',           label: 'Modals',                cat: 'modal' },
    { id: 'tips',             label: 'Soru İpuçları',         cat: '' },
    { id: 'exercises',        label: '✨ Alıştırmalar',       cat: '' },
];

const GR_DOTS = { present: '#4f46e5', past: '#e63946', future: '#059669', modal: '#d97706', '': '#aaa' };
const GR_SECS_LABELS = { present: 'Present (Şimdi)', past: 'Past (Geçmiş)', future: 'Future (Gelecek)', modal: 'Özel', '': 'Genel' };
const GR_SEC_ORDER = ['', 'present', 'past', 'future', 'modal'];

/* ════════════════════════════════════════════════════
   ENTRY POINT — GrammarModule engine
   Not: GR_SECTIONS 'cat' field kullanır → engine grp'e normalize eder.
   Sidenav grup başlıkları GR_SECS_LABELS'dan gelir; bu nedenle
   sections dizisini grp=label olarak dönüştürüyoruz.
════════════════════════════════════════════════════ */

/* ════════════════════════════════════════════════════
   HTML BUILDER HELPERS
════════════════════════════════════════════════════ */
function grHero(eyebrow, colorClass, title, sub) {
    return `<div class="gr-hero ${colorClass}">
        <div class="gr-hero-eyebrow">${eyebrow}</div>
        <div class="gr-hero-title">${title}</div>
        <div class="gr-hero-sub">${sub}</div>
    </div>`;
}

function grFormulas(items) {
    // items: [{type:'pos'|'neg'|'q', text:'...'}]
    const rows = items.map(it => {
        const [bc, tc, sym] = it.type === 'pos' ? ['gr-f-pos','gr-f-pos-text','+']
                            : it.type === 'neg' ? ['gr-f-neg','gr-f-neg-text','−']
                            :                     ['gr-f-q',  'gr-f-q-text',  '?'];
        return `<div class="gr-formula"><span class="gr-f-badge ${bc}">${sym}</span><span class="${tc}">${it.text}</span></div>`;
    }).join('');
    return `<div class="gr-formulas">${rows}</div>`;
}

function grSH(label) {
    return `<div class="gr-sec-hd">${label}</div>`;
}

function grAcc(items) {
    // items: [{ico, bg, title, desc, examples, exClass}]
    const cards = items.map(it => {
        const exHtml = (it.examples || []).map((ex, i) =>
            `<div class="gr-ex ${it.exClass}"><span class="gr-ex-n">${String(i+1).padStart(2,'0')}</span>${ex}</div>`
        ).join('');
        const descHtml = it.desc ? `<p class="gr-acc-desc">${it.desc}</p>` : '';
        return `<div class="gr-acc" onclick="this.classList.toggle('open')">
            <div class="gr-acc-head">
                <div class="gr-acc-ico" style="background:${it.bg}">${it.ico}</div>
                <div class="gr-acc-title">${it.title}</div>
                <div class="gr-acc-chev">⌄</div>
            </div>
            <div class="gr-acc-body">${descHtml}<div class="gr-ex-list">${exHtml}</div></div>
        </div>`;
    }).join('');
    return `<div class="gr-acc-wrap">${cards}</div>`;
}

function grInfo(type, title, body) {
    return `<div class="gr-info gr-info-${type}">
        <div class="gr-info-title">${title}</div>${body}
    </div>`;
}

function grTable(headers, rows, extraClass) {
    const ths = headers.map(h => `<th>${h}</th>`).join('');
    const trs = rows.map(r =>
        `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`
    ).join('');
    return `<div class="gr-tbl-wrap"><table class="gr-tbl ${extraClass||''}">
        <thead><tr>${ths}</tr></thead><tbody>${trs}</tbody>
    </table></div>`;
}

/* ════════════════════════════════════════════════════
   SECTION: OVERVIEW
════════════════════════════════════════════════════ */
function grOverview() {
    const catalogue = [
        {id:'simple-present', cat:'present', name:'Simple Present',     formula:'V₁ / -s,-es,-ies',     desc:'Alışkanlıklar, genel gerçekler, haber dili.'},
        {id:'pres-cont',      cat:'present', name:'Pres. Continuous',   formula:'am/is/are + V-ing',     desc:'Şu an, bu dönemde, planlanmış gelecek.'},
        {id:'pres-perf',      cat:'present', name:'Present Perfect',    formula:'have/has + V₃',         desc:'Geçmiş-şimdi bağlantısı, etkisi devam eden.'},
        {id:'pres-perf-cont', cat:'present', name:'Pres. Perf. Cont.',  formula:'have/has been + V-ing', desc:'Geçmişte başlayan, hâlâ devam eden.'},
        {id:'simple-past',    cat:'past',    name:'Simple Past',        formula:'V₂',                   desc:'Geçmişte biten, belirli zamanda eylem.'},
        {id:'past-cont',      cat:'past',    name:'Past Continuous',    formula:'was/were + V-ing',      desc:'Geçmişte süregelen, aynı anda olan.'},
        {id:'past-perf',      cat:'past',    name:'Past Perfect',       formula:'had + V₃',              desc:'Geçmişin geçmişi, iki eylem sıralaması.'},
        {id:'past-perf-cont', cat:'past',    name:'Past Perf. Cont.',   formula:'had been + V-ing',      desc:'Geçmişte belli süre devam eden.'},
        {id:'simple-future',  cat:'future',  name:'Simple Future',      formula:'will / be going to',    desc:'Gelecek olaylar, karar, niyet, tahmin.'},
        {id:'future-cont',    cat:'future',  name:'Future Continuous',  formula:'will be + V-ing',       desc:'Gelecekte belirli anda devam edecek.'},
        {id:'future-perf',    cat:'future',  name:'Future Perfect',     formula:'will have + V₃',        desc:'Gelecekte belli zamana kadar tamamlanmış.'},
        {id:'future-perf-cont',cat:'future', name:'Future Perf. Cont.', formula:'will have been + V-ing',desc:'Gelecekte sürekli devam etmiş olacak.'},
        {id:'modals',         cat:'modal',   name:'Modals',             formula:'can / could / be able…', desc:'Yetenek, zorunluluk, olasılık, izin.'},
    ];

    const cards = catalogue.map(c => {
        const tagCls = {present:'gr-tag-present',past:'gr-tag-past',future:'gr-tag-future',modal:'gr-tag-modal'}[c.cat] || '';
        const catLabel = c.cat.charAt(0).toUpperCase() + c.cat.slice(1);
        return `<div class="gr-cat-card cat-${c.cat}" onclick="_grRenderSection('${c.id}')">
            <span class="gr-cat-tag ${tagCls}">${catLabel}</span>
            <div class="gr-cat-name">${c.name}</div>
            <div class="gr-cat-formula">${c.formula}</div>
            <div class="gr-cat-desc">${c.desc}</div>
        </div>`;
    }).join('');

    return grHero('📐 English Tenses', 'gr-hero-overview', 'Grammar Modülü',
        '12 zaman yapısı, modal fiiller, ÖSYM ipuçları ve interaktif alıştırmalar. Bir konuya tıklayarak başlayın.')
        + `<div class="gr-catalogue">${cards}</div>`
        + `<div style="padding:0 36px 36px;text-align:center;">
            <button onclick="_grRenderSection('exercises')" style="padding:14px 32px;background:linear-gradient(135deg,var(--red),#f97316);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">
                ✨ Alıştırmalara Geç
            </button>
          </div>`;
}

/* ════════════════════════════════════════════════════
   SECTION: SIMPLE PRESENT
════════════════════════════════════════════════════ */
function grSimplePresent() {
    return grHero('🕐 Geniş Zaman', 'gr-hero-present', 'Simple Present Tense',
        'Genel geçer ifadeleri, alışkanlıkları ve evrensel gerçekleri anlatırken kullandığımız temel zaman yapısıdır.')
    + grFormulas([
        {type:'pos', text:'Subject + <strong>V₁</strong> &nbsp;/&nbsp; he/she/it → V₁<strong>+s / +es / +ies</strong>'},
        {type:'neg', text:'Subject + <strong>do/does not</strong> + V₁'},
        {type:'q',   text:'<strong>Do / Does</strong> + Subject + V₁ ?'},
    ])
    + grSH('Kullanım Alanları')
    + grAcc([
        {ico:'🔄', bg:'rgba(79,70,229,.1)', title:'Alışkanlıklar & Tekrar Eden Eylemler',
         desc:'Düzenli aralıklarla tekrar eden eylemler.', exClass:'ex-present',
         examples:['I see the doctor every six months for a contact lens prescription.',
                   'Every week, I meet with my students via Zoom and create a lesson plan for them.',
                   'She always drinks coffee in the morning.']},
        {ico:'🔬', bg:'rgba(5,150,105,.1)', title:'Bilimsel Gerçekler & Doğa Kanunları', exClass:'ex-present',
         examples:['Oxygen is essential for human respiration.',
                   'The sun rises in the east and sets in the west.',
                   'Water boils at 100 degrees Celsius.']},
        {ico:'📰', bg:'rgba(217,119,6,.1)', title:'Haber Başlıkları & Basın Dili', exClass:'ex-present',
         examples:['Fire Destroys an Apartment Building in Istanbul.',
                   'Queen Elizabeth II dies at 96.']},
        {ico:'📅', bg:'rgba(230,57,70,.1)', title:'Programlı & Planlı Tarifeler', exClass:'ex-present',
         examples:['I fly to Poland for the Erasmus+ exchange project on September 30, at 8:10 a.m.',
                   'The train departs at 9:15 every morning.']},
        {ico:'📖', bg:'rgba(79,70,229,.1)', title:'Kitap, Film & Hikaye Anlatımları', exClass:'ex-present',
         examples:['"The Metamorphosis" by Kafka revolves around Gregor Samsa, a traveling salesman who wakes up to find himself transformed into a giant insect.']},
        {ico:'📝', bg:'rgba(5,150,105,.1)', title:'Talimat, Tarif & Emir Kipi', exClass:'ex-present',
         examples:['Be quiet during the exam.', 'Stir the sauce and let it simmer for 10 minutes.']},
    ])
    + grInfo('blue','⚡ Özel İfadeler — "date back to"',
        '"date back to", "go back to", "trace back to", "originate from", "have its roots in" → Bu ifadeler her zaman <strong>Simple Present</strong> ile kullanılır.')
    + grSH('Zaman İfadeleri')
    + grTable(['İfade','Örnek'],[
        ['always / her zaman','She always arrives on time.'],
        ['usually / genellikle','I usually wake up at 7.'],
        ['often / sık sık','He often reads before bed.'],
        ['sometimes / bazen','They sometimes go hiking.'],
        ['seldom / rarely / never','She seldom eats fast food.'],
        ['every day / week / month','I exercise every day.'],
        ['once / twice a week','She swims twice a week.'],
        ['from time to time','I visit my grandparents from time to time.'],
    ]);
}

/* ════════════════════════════════════════════════════
   SECTION: PRESENT CONTINUOUS
════════════════════════════════════════════════════ */
function grPresCont() {
    return grHero('🔵 Şimdiki Zaman', 'gr-hero-present', 'Present Continuous Tense',
        'Konuşma anında veya bu dönemde gerçekleşen eylemleri anlatırken kullanılır.')
    + grFormulas([
        {type:'pos', text:'Subject + <strong>am / is / are</strong> + V-ing'},
        {type:'neg', text:'Subject + <strong>am / is / are not</strong> + V-ing'},
        {type:'q',   text:'<strong>Am / Is / Are</strong> + Subject + V-ing ?'},
    ])
    + grSH('Kullanım Alanları')
    + grAcc([
        {ico:'⚡', bg:'rgba(79,70,229,.1)', title:'Tam Şu An Gerçekleşen', exClass:'ex-present',
         examples:['She is calling her friend to invite her to the party tonight.',
                   'Look! The children are playing in the garden.']},
        {ico:'📆', bg:'rgba(5,150,105,.1)', title:'Bu Dönemde Devam Eden (şu an olmasa da)', exClass:'ex-present',
         examples:['He is learning to play the guitar these days.',
                   'I am working on a project with a team of experts from different countries.']},
        {ico:'📋', bg:'rgba(217,119,6,.1)', title:'Planlanmış Gelecek Eylemler', exClass:'ex-present',
         examples:['We are meeting with the client tomorrow to discuss the new project.',
                   'They are flying to Paris next week.']},
        {ico:'📈', bg:'rgba(230,57,70,.1)', title:'Kademeli Gelişim (gradually, day by day…)', exClass:'ex-present',
         examples:['She is gradually overcoming her fear of public speaking.',
                   'The children are playing at the park more and more these days.']},
    ])
    + grInfo('red','🚫 Stative Verbs — Dikkat!',
        'Eylem değil <strong>durum bildiren fiiller</strong> Present Continuous ile kullanılamaz:<br><br>'
        +'<strong>Duygu:</strong> feel, hear, see, smell, taste, love, hate, wish, fear…<br>'
        +'<strong>Zihinsel:</strong> believe, doubt, know, imagine, need, prefer, notice…<br>'
        +'<strong>Diğer:</strong> be, weigh, have, appear, consist, exist, promise…')
    + grInfo('green','📌 "live" & "work" Kuralı',
        'Süreklilik → <strong>Simple Present</strong> &nbsp;|&nbsp; Geçici durum → <strong>Present Continuous</strong><br><br>'
        +'• I <em>live</em> in New York City. (kalıcı — Simple Present)<br>'
        +'• They <em>are living</em> in Paris for a few months. (geçici — Pres. Cont.)<br>'
        +'• He <em>is working</em> on a project in London this week. (geçici)')
    + grSH('Zaman İfadeleri')
    + grTable(['İfade','Anlam'],[
        ['now / right now','şu an'],
        ['at the moment','şu anda'],
        ['currently / nowadays','şu sıralar'],
        ['these days / for the time being','bu günlerde'],
        ['still / continually','hâlâ / sürekli'],
        ['tomorrow / tonight (plan)','yarın / bu gece'],
    ]);
}

/* ════════════════════════════════════════════════════
   SECTION: PRESENT PERFECT
════════════════════════════════════════════════════ */
function grPresPerf() {
    return grHero('✅ Yakın Geçmiş', 'gr-hero-present', 'Present Perfect Tense',
        "Türkçe'de tam karşılığı YOKTUR. Geçmiş ile şimdi arasında bağlantı kurar. Etkisi hâlâ devam eden eylemleri ifade eder.")
    + grFormulas([
        {type:'pos', text:'Subject + <strong>have / has</strong> + V₃ (Past Participle)'},
        {type:'neg', text:'Subject + <strong>have / has not</strong> + V₃'},
        {type:'q',   text:'<strong>Have / Has</strong> + Subject + V₃ ?'},
    ])
    + grSH('Kullanım Alanları')
    + grAcc([
        {ico:'❓', bg:'rgba(79,70,229,.1)', title:'Kesin Zaman Belirtilmeden', exClass:'ex-present',
         examples:['Researchers have studied the effects of climate change on biodiversity.',
                   'I have read that book. (Ne zaman okuduğu belli değil)']},
        {ico:'💫', bg:'rgba(5,150,105,.1)', title:'Sonucu / Etkisi Devam Eden Eylem', exClass:'ex-present',
         examples:['She has just finished her presentation.',
                   'I have lost my keys. (Hâlâ kayıp — etki sürüyor)']},
        {ico:'🔁', bg:'rgba(217,119,6,.1)', title:'Kaç Kere Yapıldığı', exClass:'ex-present',
         examples:['He has visited Paris three times.',
                   'We have traveled to Europe many times.']},
    ])
    + grSH('Anahtar Zaman İfadeleri')
    + grTable(['İfade','Anlam','Örnek'],[
        ['since / since then','-den beri','The Eurovision has been organized since 1956.'],
        ['for','...zamandır','I have studied English for five years.'],
        ['just','henüz, daha yeni','She has just finished her presentation.'],
        ['yet','henüz (olumsuz/soru)','The experiment has not been completed yet.'],
        ['still','hâlâ','The team has still not found an answer.'],
        ['already','zaten, çoktan','The theory has already sparked significant interest.'],
        ['recently / lately','son zamanlarda','Innovations have recently been made in this field.'],
        ['so far / up to now','şimdiye kadar','So far, this method has proven effective.'],
        ['ever / never','şu ana kadar hiç','Have you ever been to Japan?'],
    ])
    + grInfo('yellow','⭐ ÖSYM SEVER: have/has V₃ + since + V₂',
        'Bu yapı "-den beri" anlamını verir. <strong>Since\'in SAĞ tarafı V₂ (Simple Past), SOL tarafı Present Perfect</strong> olmalıdır.<br><br>'
        +'• We <strong>have known</strong> each other since childhood.<br>'
        +'• I <strong>moved</strong> to this city five years ago, and since then, I <strong>have made</strong> many new friends.')
    + grInfo('green','📌 "been" vs "gone" Farkı',
        '• She <strong>has been</strong> to the beach. → gitmiş, <em>dönmüş</em><br>'
        +'• They <strong>have gone</strong> to the park. → gitmiş, <em>dönmemiş</em>')
    + grInfo('blue','🏆 Superlative + Present Perfect',
        '• It\'s the most interesting book I <strong>have ever read</strong>.<br>'
        +'• This is the <strong>first time</strong> I have ever seen a shooting star.')
    + grInfo('yellow','⭐ ÖSYM SEVER: For/In/During/Over/Within + the past/last + süreç',
        '• <strong>During the past year</strong>, I have traveled to many countries.<br>'
        +'• The company has grown significantly <strong>over the past decade</strong>.');
}

/* ════════════════════════════════════════════════════
   SECTION: PRESENT PERFECT CONTINUOUS
════════════════════════════════════════════════════ */
function grPresPerfCont() {
    return grHero('🔄 Devam Eden Yakın Geçmiş', 'gr-hero-present', 'Present Perfect Continuous',
        'Geçmişte başlamış ve hâlâ devam etmekte olan eylemleri vurgular.')
    + grFormulas([{type:'pos', text:'Subject + <strong>have / has been</strong> + V-ing'}])
    + grSH('Örnekler')
    + grAcc([{ico:'⏳', bg:'rgba(79,70,229,.1)', title:'Geçmişte Başlayan, Hâlâ Devam Eden', exClass:'ex-present',
        examples:['The children have been playing outside all day.',
                  'They have been renovating their house for weeks.',
                  'He has been waiting for the bus for twenty minutes.',
                  'I have been studying English for two hours.']}])
    + grSH('Present Perfect vs Present Perfect Continuous')
    + grTable(['Present Perfect','Present Perfect Continuous'],[
        ['Eylemin <strong>tamamlandığını</strong> vurgular.','Eylemin <strong>devam ettiğini</strong> vurgular.'],
        ['I have just watched Star Wars. <em>(bitti)</em>','I have been watching Star Wars. <em>(devam ediyor)</em>'],
        ['Tekrar sayısı: I have watched it <strong>three times</strong>.','Süreyi vurgular: I have been watching <strong>for hours</strong>.'],
        ['<code>have/has + V₃</code>','<code>have/has + been + V-ing</code>'],
    ], 'gr-cmp-tbl');
}

/* ════════════════════════════════════════════════════
   SECTION: SIMPLE PAST
════════════════════════════════════════════════════ */
function grSimplePast() {
    return grHero('⏮ Geçmiş Zaman', 'gr-hero-past', 'Simple Past Tense',
        '"When" sorusu sorulduğunda net cevap alınan, geçmişte belirli zamanda bitmiş eylemleri ifade eder.')
    + grFormulas([
        {type:'pos', text:'Subject + <strong>V₂</strong> (Past Form)'},
        {type:'neg', text:'Subject + <strong>did not</strong> + V₁'},
        {type:'q',   text:'<strong>Did</strong> + Subject + V₁ ?'},
    ])
    + grSH('Kullanım Alanları')
    + grAcc([
        {ico:'📅', bg:'rgba(230,57,70,.1)', title:'Geçmişte Belirli Tarihte Olaylar', exClass:'ex-past',
         examples:['Orhan Pamuk won the Nobel Prize in 2006.',
                   'Catalhoyuk was included in UNESCO World Heritage List in 2012.']},
        {ico:'🔗', bg:'rgba(217,119,6,.1)', title:'Art Arda Gerçekleşen Olaylar', exClass:'ex-past',
         examples:['The train arrived, passengers got off, and the platform cleared quickly.',
                   'He entered the room, sat down, and opened his laptop.']},
        {ico:'🔄', bg:'rgba(79,70,229,.1)', title:'Geçmişteki Alışkanlıklar', exClass:'ex-past',
         examples:['Throughout his career, the author habitually wrote a new poem every morning.',
                   'When I was young, I played football every weekend.']},
    ])
    + grInfo('red','📌 "used to + V₁" — Geçmişteki Alışkanlıklar',
        '• I <strong>used to play</strong> with my friends all day. (Artık oynamıyorum)<br>'
        +'• <strong>"would"</strong> yapısı da kullanılabilir FAKAT durum fiilleriyle (be, live, like) kullanılamaz:<br>'
        +'&nbsp;&nbsp;Every morning, I <strong>would go</strong> for a walk in the park. ✅<br>'
        +'&nbsp;&nbsp;I would live in Istanbul. ❌')
    + grInfo('yellow','⭐ ÖSYM Sever: Deyimsel Yapılar (V₂ ile)',
        '• <strong>it is high time</strong> + V₂ → "yapmanın zamanı geldi"<br>'
        +'• <strong>it is about time</strong> + V₂ → "geldi de geçti bile"<br>'
        +'• <strong>I wish / If only</strong> + subject + V₂ → Keşke (şimdiye ait pişmanlık)<br>'
        +'• <strong>as if / as though</strong> + subject + V₂ → ...mış gibi<br>'
        +'• <strong>would rather</strong> + subject + V₂ → tercih<br>'
        +'• <strong>would you mind + if</strong> + subject + V₂ → benim yapmam sıkıntı olur mu?')
    + grSH('Zaman İfadeleri')
    + grTable(['İfade','Örnek'],[
        ['yesterday','She called me yesterday.'],
        ['last week / last year','He graduated last year.'],
        ['two days ago / a year ago','I met him two days ago.'],
        ['in 1995 / in the 19th century','They arrived in 1995.'],
        ['once / formerly / previously','He was once the CEO of that company.'],
        ['in ancient times / in antiquity','Philosophers debated these ideas in ancient times.'],
    ]);
}

/* ════════════════════════════════════════════════════
   SECTION: PAST CONTINUOUS
════════════════════════════════════════════════════ */
function grPastCont() {
    return grHero('⏮ Geçmişte Süreklilik', 'gr-hero-past', 'Past Continuous Tense',
        'Geçmiş zamanda devam eden olayları anlatırken kullanılır. "-yordu" anlamını bu zaman ile verebiliriz.')
    + grFormulas([{type:'pos', text:'Subject + <strong>was / were</strong> + V-ing'}])
    + grSH('Kullanım Alanları')
    + grAcc([
        {ico:'⏳', bg:'rgba(230,57,70,.1)', title:'Geçmişte Belli Süre Devam Eden', exClass:'ex-past',
         examples:['She was working as a teacher at that school until last year.',
                   'The company was implementing a new marketing strategy at that time.']},
        {ico:'⚡', bg:'rgba(217,119,6,.1)', title:'Aynı Anda Gerçekleşen (while / as)', exClass:'ex-past',
         examples:['As the sun was setting, the children were playing in the garden.',
                   'They were cooking dinner while their friends were setting the table.']},
        {ico:'📈', bg:'rgba(5,150,105,.1)', title:'Kademeli Gelişim (gradually, day by day…)', exClass:'ex-past',
         examples:['Last summer, Sarah was gradually improving her swimming skills.',
                   'Day by day, the workers were building the skyscraper taller and taller.']},
    ])
    + grInfo('red','🔮 Future in the Past: was/were going to',
        'Geçmişte bahsedilen olayın gelecekte olacağı varsayılır. Türkçe\'de "diyecekti / olacaktı".<br><br>'
        +'<strong>Formül: was/were going to + V₁</strong><br><br>'
        +'• We <strong>were going to</strong> have a picnic, <em>but</em> it started raining heavily.<br>'
        +'• Jenny <strong>was going to</strong> call her friend, <em>but</em> she forgot to charge her phone.');
}

/* ════════════════════════════════════════════════════
   SECTION: PAST PERFECT
════════════════════════════════════════════════════ */
function grPastPerf() {
    return grHero('⏮⏮ Geçmişin Geçmişi', 'gr-hero-past', 'Past Perfect Tense',
        "Geçmişteki iki eylemden birinin diğerinden önce gerçekleştiğini ifade eder. Türkçe'de \"geçmişin geçmişi\".")
    + grFormulas([{type:'pos', text:'Subject + <strong>had</strong> + V₃ (Past Participle)'}])
    + grInfo('blue','🗺 Temel Mantık',
        'Birinci eylem <strong>Past Perfect (had V₃)</strong>, ikinci eylem <strong>Simple Past (V₂)</strong>:<br><br>'
        +'• I <strong>had read</strong> the book before the movie <strong>was released</strong>.<br>'
        +'• The team <strong>had practiced</strong> hard before the championship match.')
    + grSH('ÖSYM Sever: Bağlaçlarla Kullanım')
    + grTable(['Yapı / Bağlaç','Örnek'],[
        ['By 1999, had V₃','By 1999, they had built a successful business.'],
        ['By the time + V₂, had V₃','By the time the rescue team arrived, the hikers had already found shelter.'],
        ['Before + V₂, had V₃','Before they reached the summit, they had climbed through challenging terrain.'],
        ['After + had V₃, V₂','After he had received the promotion, he took on more responsibilities.'],
        ['When + V₂, had V₃','When the rain stopped, the kids had already built a small shelter.'],
        ['Once / As soon as + had V₃, V₂','Once she had finished her work, she joined her colleagues.'],
    ])
    + grSH('Farazi Durumlar — Past Perfect')
    + grTable(['Yapı','Örnek'],[
        ['If + had V₃, would have V₃ (Type 3)','If he had studied harder, he would have passed the exam.'],
        ['I Wish / If only + subject + had V₃','I wish I had studied abroad during my college years.'],
        ['As if / As though + subject + had V₃','She talks as though she had won the lottery.'],
    ]);
}

/* ════════════════════════════════════════════════════
   SECTION: PAST PERFECT CONTINUOUS
════════════════════════════════════════════════════ */
function grPastPerfCont() {
    return grHero('⏮ Geçmişte Süregelen', 'gr-hero-past', 'Past Perfect Continuous',
        'Geçmişte belirli bir süre boyunca devam eden bir eylemi ifade eder.')
    + grFormulas([{type:'pos', text:'Subject + <strong>had been</strong> + V-ing'}])
    + grSH('Örnekler')
    + grAcc([{ico:'⏳', bg:'rgba(230,57,70,.1)', title:'Geçmişte Belirli Zamana Kadar Süregelen', exClass:'ex-past',
        examples:['She had been working at that company for five years before she decided to quit.',
                  'They had been waiting for the bus for an hour when it finally arrived.',
                  'By the time they arrived, the team had been practicing for hours.',
                  'They had been practicing the piano every day for months before the concert.']}]);
}

/* ════════════════════════════════════════════════════
   SECTION: SIMPLE FUTURE
════════════════════════════════════════════════════ */
function grSimpleFuture() {
    return grHero('⏭ Gelecek Zaman', 'gr-hero-future', 'Simple Future Tenses',
        'İki temel yapı: will (spontane karar, tahmin) ve be going to (niyet, kanıta dayalı tahmin).')
    + grSH('A) WILL')
    + grFormulas([{type:'pos', text:'Subject + <strong>will</strong> + V₁'}])
    + grTable(['Kullanım','Örnek'],[
        ['Gelecekte olay / durum','She will travel to Europe next month.'],
        ['Tahmin, beklenti, umut','They will probably arrive after 8 PM.'],
        ['Konuşma anında spontane karar','It\'s raining. I will borrow an umbrella from a friend.'],
        ['Söz, rica, teklif, tehdit','Will you please pass me the salt?'],
    ])
    + grSH('B) BE GOING TO')
    + grFormulas([{type:'pos', text:'Subject + <strong>am / is / are going to</strong> + V₁'}])
    + grTable(['Kullanım','Örnek'],[
        ['Kesin niyet edilmiş karar','They are going to get married in the spring.'],
        ['Kanıta dayalı tahmin','The traffic is terrible. We are going to be late for the movie.'],
        ['Önceden planlanmış eylem','She is going to attend a cooking class next month.'],
    ])
    + grInfo('red','🚫 MUTLAKA BİL! Zaman Bağlaçları Kuralı',
        '<strong>When, before, after, as soon as, until, once</strong> gibi bağlaçların yanına <strong>"will, be going to, would, shall"</strong> GELMEZ!<br><br>'
        +'• As soon as I <strong>am</strong> done, I <strong>will</strong> send you the file. ✅<br>'
        +'• I <strong>will</strong> stay here until I <strong>have</strong> finished my work. ✅<br>'
        +'• As soon as I <s style="color:#e63946">will finish</s> my assignment… ❌');
}

/* ════════════════════════════════════════════════════
   SECTION: FUTURE CONTINUOUS
════════════════════════════════════════════════════ */
function grFutureCont() {
    return grHero('⏭ Gelecekte Devam Eden', 'gr-hero-future', 'Future Continuous Tense',
        'Gelecekte belli bir zamanda başlayacak ve o zaman diliminde devam edecek olan eylemleri anlatır.')
    + grFormulas([{type:'pos', text:'Subject + <strong>will be</strong> + V-ing'}])
    + grSH('Örnekler')
    + grAcc([{ico:'🔮', bg:'rgba(5,150,105,.1)', title:'Gelecekte Belirli Anda Devam Edecek', exClass:'ex-future',
        examples:['We will be waiting for you at the airport when your flight lands.',
                  'The researchers will be conducting a long-term study starting next year.',
                  'The concert will begin at 7 PM tonight.',
                  'I will meet you at the airport this time tomorrow morning.']}]);
}

/* ════════════════════════════════════════════════════
   SECTION: FUTURE PERFECT
════════════════════════════════════════════════════ */
function grFuturePerf() {
    return grHero('⏭ Gelecekte Tamamlanmış', 'gr-hero-future', 'Future Perfect Tense',
        "Gelecekte belirli bir zamana kadar tamamlanmış olacak eylemi ifade eder. Türkçe'de \"olmuş olacak\".")
    + grFormulas([{type:'pos', text:'Subject + <strong>will have</strong> + V₃'}])
    + grInfo('yellow','⭐ ÖSYM SEVER: By / By the time + present + will have V₃','')
    + grSH('Örnekler')
    + grAcc([{ico:'🔮', bg:'rgba(5,150,105,.1)', title:'Future Perfect Örnekler', exClass:'ex-future',
        examples:['By the year 2030, governments will have implemented various measures to combat climate change.',
                  'By the end of this year, he will have earned his master\'s degree.',
                  'By the time the project is finished, the team will have faced numerous challenges.']}]);
}

/* ════════════════════════════════════════════════════
   SECTION: FUTURE PERFECT CONTINUOUS
════════════════════════════════════════════════════ */
function grFuturePerfCont() {
    return grHero('⏭ Gelecekte Devam Eden Tamamlanmış', 'gr-hero-future', 'Future Perfect Continuous',
        "Gelecekte belli bir zamana kadar sürekli devam edecek eylemleri ifade eder. Türkçe'de \"oluyor olacak\".")
    + grFormulas([{type:'pos', text:'Subject + <strong>will have been</strong> + V-ing'}])
    + grSH('Örnekler')
    + grAcc([{ico:'🔮', bg:'rgba(5,150,105,.1)', title:'Future Perfect Continuous Örnekler', exClass:'ex-future',
        examples:['By the time she finishes her studies, she will have been studying for 10 years.',
                  'By the end of the week, I will have been working on this project for ten days.',
                  'Before the concert starts, the band will have been rehearsing the songs for weeks.']}])
    + grInfo('green','📌 "Eşiğinde" İfadeleri',
        '<strong>be about to + V₁</strong>, <strong>on the verge / edge / point / brink of + V-ing</strong> → "...nın eşiğinde" anlamına gelir.<br><br>'
        +'• She is <strong>about to</strong> make an important decision.<br>'
        +'• The company is <strong>on the verge of</strong> bankruptcy.');
}

/* ════════════════════════════════════════════════════
   SECTION: MODALS
════════════════════════════════════════════════════ */
function grModals() {
    return grHero('⚡ Yardımcı Fiiller', 'gr-hero-modal', 'Modals',
        'Yetenek, zorunluluk, olasılık ve izin gibi anlamları ifade eden yardımcı fiiller.')
    + grSH('Ability — Yetenek')
    + grTable(['Modal','Kullanım','Örnek'],[
        ['can / is able to (present)','Şimdiki yetenek','She can run a marathon in under four hours.'],
        ['could / was-were able to (past)','Geçmişteki yetenek','He couldn\'t find his keys yesterday.'],
        ['won\'t be able to','Gelecek olumsuz yetenek','I won\'t be able to come to the party tonight.'],
        ['have to be able to','Zorunluluk + yetenek','You have to be able to work under pressure.'],
    ])
    + grInfo('red','📌 "was/were able to" vs "could"',
        '<strong>"was/were able to"</strong> = geçmişte tek seferlik başarı ("manage to" ile aynı anlam)<br>'
        +'<strong>"could"</strong> = genel yetenek<br><br>'
        +'• Despite the difficult conditions, they <strong>were able to</strong> complete the project on time. ✅<br>'
        +'• When I was young, I <strong>could</strong> run very fast. ✅');
}

/* ════════════════════════════════════════════════════
   SECTION: TIPS
════════════════════════════════════════════════════ */
function grTips() {
    const tips = [
        { num:'01', title:'⏰ Zaman Uyumu',
          body:`Cümlede bir bağlaç varsa, zaman uyumuna bak. Present yapılar present, past yapılar past ile kurulur.`,
          rules:[
            {ico:'✅', text:'When / Before / After + Simple Present → Simple Present / Simple Future'},
            {ico:'✅', text:'When / Before / After + Simple Past → Simple Past'},
            {ico:'💡', text:'<em>Once she finishes the presentation, she will answer questions.</em> (present–present)'},
            {ico:'💡', text:'<em>We had dinner before we went to the cinema.</em> (past–past)'},
          ]},
        { num:'02', title:'🚫 Zaman Bağlaçlarına "will" Gelmez',
          body:'When, before, after, as soon as, until, once → yanına <strong>will / be going to / would / shall GELMİYOR</strong>.',
          rules:[
            {ico:'❌', text:'As soon as I <s>will finish</s> my assignment, I will leave.'},
            {ico:'✅', text:'As soon as I <strong>finish</strong> my assignment, I <strong>will</strong> leave.'},
          ]},
        { num:'03', title:'⚠️ had V₃ İstisnası',
          body:'Zaman bağlacının her iki tarafı "had V₃" olamaz. Temel cümlede present perfect yapılar kullanılamaz.',
          rules:[
            {ico:'✅', text:'Before she arrived (V₂), they had prepared (had V₃) the room.'},
            {ico:'❌', text:'Before she <s>had arrived</s>, they had prepared the room.'},
            {ico:'❌', text:'When she arrives (present), they <s>have prepared</s> the room.'},
          ]},
        { num:'04', title:'📊 Zaman İfadesine Göre Hangi Zaman?',
          body:'',
          rules:[
            {ico:'🕐', text:'<strong>always, usually, often, every day…</strong> → Simple Present'},
            {ico:'🔵', text:'<strong>now, at the moment, currently, these days…</strong> → Present Continuous'},
            {ico:'✅', text:'<strong>since, for, just, yet, already, recently, so far…</strong> → Present Perfect'},
            {ico:'⏮', text:'<strong>yesterday, last year, ago, in 1995…</strong> → Simple Past'},
            {ico:'🔮', text:'<strong>by 2030, by the time (future)…</strong> → Future Perfect'},
          ]},
        { num:'05', title:'🌍 Genelleme & Bilimsel Gerçeklik',
          body:'Cümlede zaman ifadesi yoksa büyük ihtimalle <strong>Simple Present</strong> ile kurulmuş genel bir ifadedir.',
          rules:[
            {ico:'💡', text:'<em>The whole world knows Michael Jackson.</em> (Simple Present)'},
            {ico:'💡', text:'<em>The sun rises in the east.</em> (Simple Present)'},
          ]},
    ];

    const cards = tips.map(t => {
        const rules = t.rules.map(r =>
            `<div class="gr-rule-item"><span class="gr-rule-ico">${r.ico}</span>${r.text}</div>`
        ).join('');
        return `<div class="gr-tip-card open" onclick="this.classList.toggle('open')">
            <div class="gr-tip-head">
                <span class="gr-tip-num">İPUCU ${t.num}</span>
                <span class="gr-tip-title">${t.title}</span>
                <span class="gr-tip-chev">⌄</span>
            </div>
            <div class="gr-tip-body">
                ${t.body ? `<p class="gr-tip-text" style="margin-bottom:10px">${t.body}</p>` : ''}
                ${rules}
            </div>
        </div>`;
    }).join('');

    return grHero('🎯 Soru Çözme', 'gr-hero-default', 'Soru Çözerken İpuçları',
        'ÖSYM ve YDT sınavlarında en sık karşılaşılan yapılar ve püf noktaları.')
    + `<div class="gr-tips-wrap">${cards}</div>`;
}

/* ════════════════════════════════════════════════════
   SECTION: EXERCISES
════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════
   SET SİSTEMİ — Her set 10 MCQ sorusu içerir.
   Yeni soru eklemek için GR_SETS'e yeni obje ekle.
   Format: {label, questions:[{q, opts:[A,B,C,D], cor:'a'|'b'|'c'|'d', hint}]}
════════════════════════════════════════════════════ */
const GR_SETS = [
    {
        label: 'Set 1',
        questions: [
            {q:'The castle ___ back to the 14th century.',
             opts:['dates','is dating','has dated','dated'],
             cor:'a', hint:'"date back to" → her zaman Simple Present'},
            {q:'By the time the concert starts, the band ___ for six hours.',
             opts:['will rehearse','will have been rehearsing','has been rehearsing','rehearsed'],
             cor:'b', hint:'Future Perfect Continuous — gelecekte süre belirtilmiş'},
            {q:'I wish I ___ more carefully before making that decision.',
             opts:['think','thought','had thought','have thought'],
             cor:'c', hint:'I wish + Past Perfect (had V₃) → geçmişe pişmanlık'},
            {q:'She talks as though she ___ the most successful person in the world.',
             opts:['is','was','has been','will be'],
             cor:'b', hint:'as though / as if + Past Simple → gerçek dışı karşılaştırma'},
            {q:'When he ___ home, his family had already finished dinner.',
             opts:['arrives','will arrive','arrived','is arriving'],
             cor:'c', hint:'Zaman bağlacı + Past Simple | Past Perfect sıralaması'},
            {q:'He ___ at this university since 2015.',
             opts:['works','worked','has been working','is working'],
             cor:'c', hint:'since + yıl → Present Perfect Continuous'},
            {q:'It is high time you ___ studying for your exams.',
             opts:['start','started','have started','will start'],
             cor:'b', hint:'It is high time + Past Simple (started)'},
            {q:'During the past five years, the company ___ significantly.',
             opts:['grew','has grown','grows','was growing'],
             cor:'b', hint:'during the past five years → Present Perfect'},
            {q:'She ___ to the market before she cooked dinner.',
             opts:['went','has gone','had gone','was going'],
             cor:'c', hint:'Before + Past Simple → had V₃ (Past Perfect sıralaması)'},
            {q:'The scientists ___ the data for two hours when the power went out.',
             opts:['analysed','were analysing','have analysed','had analysed'],
             cor:'b', hint:'Geçmişte süregelen eylem + kesme → Past Continuous'},
        ]
    },
    {
        label: 'Set 2',
        questions: [
            {q:'I ....... Malcolm in his car, but he ....... the traffic and didn\'t see me.',
             opts:['was seeing / watches','see / has watched','have seen / is watching','saw / was watching'],
             cor:'d', hint:'Kısa eylem (saw) + süregelen arka plan (was watching) → Past Simple + Past Continuous'},
            {q:'Tim ....... a master\'s degree as soon as he ....... to Canada.',
             opts:['has begun / is returning','began / returned','is beginning / returned','begins / has returned'],
             cor:'d', hint:'as soon as + Present Simple → gelecek plan; Present Simple + Present Perfect'},
            {q:'Rachel ....... up smoking four years ago and she ....... a cigarette since.',
             opts:['was giving / doesn\'t smoke','has given / wasn\'t smoking','gave / hasn\'t smoked','has given / didn\'t smoke'],
             cor:'c', hint:'four years ago → Past Simple (gave); since → Present Perfect (hasn\'t smoked)'},
            {q:'Last year, Sonny ....... four miles each morning, but he ....... around the block each morning instead since his heart attack.',
             opts:['ran / has been walking','has run / has walked','runs / was walking','has been running / walks'],
             cor:'a', hint:'Last year → Past Simple (ran); since → Present Perfect Continuous (has been walking)'},
            {q:'I ....... a brace on my teeth as a child, but I didn\'t like it.',
             opts:['was wearing','am wearing','have worn','wore'],
             cor:'d', hint:'as a child → geçmişte tamamlanmış eylem → Simple Past (wore)'},
            {q:'I ....... an extra part-time job last week as we ....... the money.',
             opts:['am starting / are needing','was starting / have needed','start / needed','started / need'],
             cor:'d', hint:'last week → Past Simple (started); need → stative verb → Simple Present'},
            {q:'In 1951, the people of the Gold Coast ....... for their own government and shortly afterwards, they ....... their country as Ghana.',
             opts:['vote / are renaming','voted / renamed','have voted / were renaming','were voting / have renamed'],
             cor:'b', hint:'In 1951 + shortly afterwards → ardışık geçmiş eylemler → Past Simple + Past Simple'},
            {q:'As my son ....... down by the river, I ....... his room thoroughly.',
             opts:['fishes / have cleaned','is fishing / cleaned','has fished / clean','was fishing / cleaned'],
             cor:'d', hint:'As + Past Continuous arka plan (was fishing) + tamamlanan Past Simple (cleaned)'},
            {q:'We ....... in Cornwall for two weeks last summer. Since then, we ....... a holiday by the sea.',
             opts:['stayed / haven\'t had','are staying / don\'t have','were staying / didn\'t have','stay / aren\'t having'],
             cor:'a', hint:'last summer → Past Simple (stayed); since then → Present Perfect (haven\'t had)'},
            {q:'One of the straps on the baby\'s pram ....... quite thin, so we ....... to replace it.',
             opts:['wore / decide','wears / have decided','was wearing / decided','is wearing / were deciding'],
             cor:'c', hint:'Süreç (was wearing) + kesin geçmiş karar (decided) → Past Continuous + Past Simple'},
        ]
    },
    {
        label: 'Set 3',
        questions: [
            {q:'This time last year, his business ....... a reasonable profit, but now, because of bad management, he ....... to keep it going.',
             opts:['has made / has struggled','made / was struggling','make / has been struggling','was making / is struggling'],
             cor:'d', hint:'This time last year → Past Continuous (was making); now → Present Continuous (is struggling)'},
            {q:'The last time we ....... dinner with them, they ....... for a new house.',
             opts:['have had / looked','were having / have been looking','have been having / look','had / were looking'],
             cor:'d', hint:'The last time → Past Simple (had); eş zamanlı süregelen → Past Continuous (were looking)'},
            {q:'While the children ....... decorations, their father ....... up the Christmas tree.',
             opts:['are making / is setting','made / has been setting','have been making / has set','were making / was setting'],
             cor:'d', hint:'While + Past Continuous + Past Continuous → eş zamanlı süregelen arka plan eylemler'},
            {q:'A: What\'s on TV tonight? B: Manchester United ....... South Melbourne.',
             opts:['play','were playing','are playing','have played'],
             cor:'c', hint:'Programlanmış gelecek etkinlik → Present Continuous (are playing)'},
            {q:'Isn\'t it strange that you ....... for Mark\'s surprise party all week, but you ....... him a birthday present yet?',
             opts:['are preparing / didn\'t buy','have been preparing / haven\'t bought','prepared / don\'t buy','have prepared / aren\'t buying'],
             cor:'b', hint:'all week → Present Perfect Continuous; yet → Present Perfect (haven\'t bought)'},
            {q:'While my parents ....... in the shopping centre, a thief ....... into their car for the radio.',
             opts:['shopped / has broken','were shopping / broke','have shopped / breaks','are shopping / was breaking'],
             cor:'b', hint:'While + Past Continuous (were shopping) + ani eylem Past Simple (broke)'},
            {q:'When we ....... her, she ....... in the wardrobe.',
             opts:['were finding / hides','find / has hidden','are finding / is hiding','found / was hiding'],
             cor:'d', hint:'when + Past Simple (found) + eş zamanlı süregelen Past Continuous (was hiding)'},
            {q:'I never ....... my temper on purpose, but sometimes I just .......',
             opts:['lose / explode','lost / am exploding','have been losing / exploded','was losing / have exploded'],
             cor:'a', hint:'Genel gerçek / alışkanlık → Simple Present + Simple Present (lose / explode)'},
            {q:'Even though it ....... heavily at the time, they ....... home.',
             opts:['has snowed / were driving','snows / have been driving','was snowing / drove','has been snowing / drive'],
             cor:'c', hint:'at the time → Past Continuous arka plan (was snowing) + tamamlanan Past Simple (drove)'},
            {q:'It\'s been one week since the floods ......., but still aid workers ....... people.',
             opts:['are striking / rescued','strike / were rescuing','were striking / have been rescuing','struck / are rescuing'],
             cor:'d', hint:'since the floods struck → Past Simple; hâlâ devam ediyor → Present Continuous (are rescuing)'},
        ]
    },
    {
        label: 'Set 4',
        questions: [
            {q:'I ....... my book in the launderette while my washing .......',
             opts:['have read / dries','read / was drying','was reading / has dried','have read / is drying'],
             cor:'b', hint:'Eş zamanlı geçmiş: read (Past Simple) + was drying (Past Continuous arka plan)'},
            {q:'Up to now, the predicted Millennium computer bug ....... very few problems, although many scientists last year ....... a catastrophe.',
             opts:['has been causing / have predicted','is causing / predict','causes / were predicting','has caused / predicted'],
             cor:'d', hint:'Up to now → Present Perfect (has caused); last year → Past Simple (predicted)'},
            {q:'I only ....... the company on Monday for a copy of their magazine and I ....... it already.',
             opts:['was asking / am receiving','have been asking / was receiving','ask / receive','asked / have received'],
             cor:'d', hint:'on Monday → Past Simple (asked); already → Present Perfect (have received)'},
            {q:'More and more of my colleagues ....... these days. These changes won\'t affect me, because I ....... my job here only recently.',
             opts:['have left / was starting','leave / am starting','were leaving / started','are leaving / have started'],
             cor:'d', hint:'these days → Present Continuous (are leaving); only recently → Present Perfect (have started)'},
            {q:'She ....... onto the train because the station guard ....... his whistle.',
             opts:['has hurried / blows','hurries / has been blowing','hurried / was blowing','was hurrying / has blown'],
             cor:'c', hint:'Ardışık geçmiş: hurried (Past Simple) + was blowing (Past Continuous arka plan)'},
            {q:'Peggy\'s family ....... pedigree dogs for three generations and they regularly ....... their dogs in shows.',
             opts:['have been breeding / enter','are breeding / are entering','were breeding / are entering','breed / have entered'],
             cor:'a', hint:'for three generations → Present Perfect Continuous; regularly → Simple Present (enter)'},
            {q:'Mrs. White ....... her daughter\'s wedding dress herself since November and ....... it, except for the trimmings.',
             opts:['made / finished','was making / was finishing','has been making / has finished','is making / finished'],
             cor:'c', hint:'since November → Present Perfect Continuous; tamamlanan kısım → Present Perfect (has finished)'},
            {q:'Because we have a young baby, we ....... the opportunity to go to the cinema, but now and again, we ....... a video to play at home.',
             opts:['didn\'t have / are buying','aren\'t having / were buying','don\'t have / buy','weren\'t having / bought'],
             cor:'c', hint:'Genel durum → Simple Present (don\'t have / buy)'},
            {q:'This perfume ....... like cheap soap and definitely isn\'t worth this price.',
             opts:['is smelling','smells','has been smelling','was smelling'],
             cor:'b', hint:'smell = stative verb (duyu fiili) → Simple Present (smells), -ing almaz'},
            {q:'While I ....... some money from a cash machine, a man ....... it all out of my hand.',
             opts:['was withdrawing / snatched','withdrew / snatches','am withdrawing / has snatched','have withdrawn / was snatching'],
             cor:'a', hint:'While + Past Continuous (was withdrawing) + ani Past Simple (snatched)'},
        ]
    },
    {
        label: 'Set 5',
        questions: [
            {q:'They ....... to buy a boat for years, and finally they ....... enough money.',
             opts:['have been hoping / have saved','hope / saved','were hoping / are saving','hoped / have been saving'],
             cor:'a', hint:'for years → Present Perfect Continuous (have been hoping); sonuç → Present Perfect (have saved)'},
            {q:'As he ....... the party, a strange man ....... him.',
             opts:['left / has been approaching','is leaving / has approached','leaves / was approaching','was leaving / approached'],
             cor:'d', hint:'as + Past Continuous (was leaving) + ani Past Simple (approached)'},
            {q:'We ....... with the sales staff tomorrow because our sales ....... recently.',
             opts:['were meeting / declined','are meeting / have declined','meet / decline','met / were declining'],
             cor:'b', hint:'tomorrow → Present Continuous gelecek (are meeting); recently → Present Perfect (have declined)'},
            {q:'Sally\'s husband ....... for a new job because his present one ....... no opportunities for advancement.',
             opts:['was looking / has offered','looks / was offering','looked / is offering','is looking / offers'],
             cor:'d', hint:'Şu anki devam eden eylem → Present Continuous (is looking); genel gerçek → Simple Present (offers)'},
            {q:'I ....... you several times last week, but no one ....... in.',
             opts:['was phoning / has been','phoned / was','have phoned / has been','phone / is being'],
             cor:'b', hint:'last week → Past Simple (phoned / was); tamamlanmış geçmiş eylemler'},
            {q:'My father ....... English at all although he ....... it for three years when he was in high school.',
             opts:['isn\'t speaking / has studied','hasn\'t been speaking / studies','doesn\'t speak / studied','didn\'t speak / has been studying'],
             cor:'c', hint:'Genel gerçek → Simple Present (doesn\'t speak); when he was → geçmiş dönem → Past Simple (studied)'},
            {q:'I ....... on this report for more than three weeks now, but I ....... only half of it yet.',
             opts:['worked / have been completing','am working / complete','work / am completing','have been working / have completed'],
             cor:'d', hint:'for more than three weeks now → Present Perfect Continuous; yet → Present Perfect (have completed)'},
            {q:'The archeological evidence ....... clearly that people in ancient Crete ....... flush toilets 4000 years ago.',
             opts:['has shown / use','is showing / have used','showed / have been using','shows / were using'],
             cor:'d', hint:'Genel gerçek → Simple Present (shows); 4000 years ago + süregelen → Past Continuous (were using)'},
            {q:'Mary says she ....... George because he ....... her life miserable.',
             opts:['has been leaving / makes','has left / is making','leaves / was making','is leaving / has made'],
             cor:'d', hint:'Planlanmış yakın gelecek → Present Continuous (is leaving); sonuç etkisi → Present Perfect (has made)'},
            {q:'My brother ....... a new BMW and ever since he ....... about it.',
             opts:['was buying / bragged','is buying / is bragging','has bought / brags','bought / has been bragging'],
             cor:'d', hint:'bought (Past Simple) + ever since → Present Perfect Continuous (has been bragging)'},
        ]
    },
    {
        label: 'Set 6',
        questions: [
            {q:'He ....... great poverty until he ....... up writing and got a proper job.',
             opts:['has suffered / gives','suffered / gave','is suffering / has given','has suffered / was giving'],
             cor:'b', hint:'until + geçmiş ardışık eylemler → Past Simple + Past Simple (suffered / gave)'},
            {q:'I ....... a lot of weight since I ....... drinking beer every night.',
             opts:['have lost / stopped','lost / am stopping','lose / have been stopping','was losing / have stopped'],
             cor:'a', hint:'since I stopped → Present Perfect (have lost); stopped → Past Simple (başlangıç noktası)'},
            {q:'My son ....... very well at university this term because he ....... out late at night any more.',
             opts:['does / hasn\'t stayed','did / isn\'t staying','has done / wasn\'t staying','is doing / doesn\'t stay'],
             cor:'d', hint:'this term + devam eden → Present Continuous (is doing); any more → Simple Present (doesn\'t stay)'},
            {q:'Last year he almost ....... because he ....... his social life a little too much.',
             opts:['fails / has enjoyed','was failing / has been enjoying','failed / was enjoying','has been failing / enjoyed'],
             cor:'c', hint:'Last year → Past Simple (failed); eş zamanlı arka plan → Past Continuous (was enjoying)'},
            {q:'Our company\'s sales ....... since the new management ....... over.',
             opts:['have been improving / took','improve / has taken','improved / has been taking','are improving / was taking'],
             cor:'a', hint:'since → Present Perfect Continuous (have been improving); took over → Past Simple (başlangıç)'},
            {q:'The guards ....... when the enemy .......',
             opts:['are sleeping / has been attacking','have slept / was attacking','slept / has attacked','were sleeping / attacked'],
             cor:'d', hint:'Past Continuous arka plan (were sleeping) + ani Past Simple (attacked)'},
            {q:'The negotiators ....... to bring the two sides together for months, but so far they .......',
             opts:['try / are failing','are trying / failed','tried / fail','have been trying / have failed'],
             cor:'d', hint:'for months → Present Perfect Continuous (have been trying); so far → Present Perfect (have failed)'},
            {q:'The electricity ....... off last night just as the film on TV ....... interesting.',
             opts:['has gone / got','was going / has got','is going / has been getting','went / was getting'],
             cor:'d', hint:'last night → Past Simple (went); just as + süreç → Past Continuous (was getting)'},
            {q:'More than a million people ....... the new superstore since it ....... last month.',
             opts:['are visiting / has been opening','have visited / opened','were visiting / opens','have been visiting / is opening'],
             cor:'b', hint:'since it opened → Present Perfect (have visited); last month → Past Simple (opened)'},
            {q:'Water ....... from liquid to gas when it ....... a temperature of 100°C.',
             opts:['has changed / reached','changed / was reaching','changes / reaches','has been changing / is reaching'],
             cor:'c', hint:'Bilimsel gerçek / genel kural → Simple Present + Simple Present (changes / reaches)'},
        ]
    },
    {
        label: 'Set 7',
        questions: [
            {q:'The phrase "post modernism" ....... about fifty years ago, but most people still ....... what it means.',
             opts:['was appearing / haven\'t known','has appeared / don\'t know','appeared / don\'t know','appears / didn\'t know'],
             cor:'c', hint:'fifty years ago → Past Simple (appeared); genel gerçek → Simple Present (don\'t know)'},
            {q:'People who ....... items like bottles and cans ....... the world\'s resources.',
             opts:['aren\'t recycling / wasted','didn\'t recycle / waste','haven\'t been recycling / were wasting','don\'t recycle / are wasting'],
             cor:'d', hint:'Genel alışkanlık / gerçek → Simple Present (don\'t recycle / are wasting)'},
            {q:'The President ....... too hard lately, and as a result, he ....... terrible.',
             opts:['has been working / looks','has worked / looked','worked / is looking','works / has looked'],
             cor:'a', hint:'lately → Present Perfect Continuous (has been working); sonuç → Simple Present (looks)'},
            {q:'I ....... to play the lottery about two years ago, but I ....... anything yet.',
             opts:['was starting / didn\'t win','started / haven\'t won','start / haven\'t been winning','have started / don\'t win'],
             cor:'b', hint:'two years ago → Past Simple (started); yet → Present Perfect (haven\'t won)'},
            {q:'I ....... in Istanbul for so long that I ....... the time before the Bosphorus Bridges.',
             opts:['am living / remembered','lived / am remembering','was living / have remembered','have lived / remember'],
             cor:'d', hint:'for so long → Present Perfect (have lived); o dönemi hatırlama → Simple Present (remember)'},
            {q:'Two years ago, she ....... English at all, but she ....... hard since then.',
             opts:['hasn\'t spoken / is studying','wasn\'t speaking / studies','isn\'t speaking / studied','didn\'t speak / has been studying'],
             cor:'d', hint:'two years ago → Past Simple (didn\'t speak); since then → Present Perfect Continuous (has been studying)'},
            {q:'My brother ....... three years in jail when he was younger, but now he ....... to give up his life of crime.',
             opts:['spent / has decided','spends / is deciding','has spent / has been deciding','was spending / decides'],
             cor:'a', hint:'when he was younger → Past Simple (spent); now + kesin karar → Present Perfect (has decided)'},
            {q:'I ....... my boss privately tomorrow and I ....... quite nervous about it.',
             opts:['have seen / am feeling','see / was feeling','am seeing / feel','saw / felt'],
             cor:'c', hint:'Planlanmış yakın gelecek → Present Continuous (am seeing); şu anki his → Simple Present (feel)'},
            {q:'The first time I ....... horse riding, I was very nervous and ....... the reins very tightly.',
             opts:['was going / am holding','have gone / hold','am going / have held','went / held'],
             cor:'d', hint:'The first time I went → Past Simple; eş zamanlı tamamlanan → Past Simple (held)'},
            {q:'Life ....... immensely since Thomas Edison ....... the first light bulb in 1879.',
             opts:['is changing / was inventing','has changed / invented','has been changing / has invented','changed / has been inventing'],
             cor:'b', hint:'since + geçmiş → Present Perfect (has changed); 1879 → Past Simple (invented)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 1-10 ── */
    {
        label: 'Set 8',
        questions: [
            {q:'Normally, people ....... quickly from the flu, but so far this year many people ....... as a result of it.',
             opts:['are recovering / had died','had recovered / are going to die','have been recovering / die','recover / have died'],
             cor:'d', hint:'Genel gerçek → Simple Present (recover); so far this year → Present Perfect (have died)'},
            {q:'You ....... for three months by the time you leave for your holiday, so you ....... quite a lot of weight.',
             opts:['have been dieting / will be losing','will have been dieting / will have lost','had dieted / lost','were dieting / had lost'],
             cor:'b', hint:'by the time (gelecek) → Future Perfect Continuous + Future Perfect (will have been dieting / will have lost)'},
            {q:'Carreta turtles ....... their eggs on the beach at night and ....... the reflection from the sea to find their way back to the water.',
             opts:['lay / use','were laying / have used','are going to lay / used','laid / are using'],
             cor:'a', hint:'Genel gerçek / doğa kanunu → Simple Present + Simple Present (lay / use)'},
            {q:'By the mid 1970s, "Marks and Spencer" ....... one of the top department stores and they ....... more underwear than any other British company at the time.',
             opts:['had become / were selling','is going to become / had sold','has become / are selling','became / will be selling'],
             cor:'a', hint:'By the mid 1970s → Past Perfect (had become); at the time (geçmiş süreç) → Past Continuous (were selling)'},
            {q:'I ....... the potatoes while you ....... the leeks for the soup.',
             opts:['peeled / will be chopping','will have peeled / have chopped','was peeling / had chopped','will peel / chop'],
             cor:'d', hint:'Eş zamanlı gelecek eylemler → will peel / chop (Simple Future + Simple)'},
            {q:'For the past 24 hours, a tropical storm ....... the houses of villages in Mozambique, but it is hard to know as yet how much damage it ....... by the time it has stopped.',
             opts:['was going to batter / causes','battered / will have been causing','has been battering / will have caused','had been battering / has caused'],
             cor:'c', hint:'for the past 24 hours → Present Perfect Continuous; by the time (gelecek) → Future Perfect (will have caused)'},
            {q:'By 1840, the US Army ....... most Eastern Indian tribes west of the Mississippi.',
             opts:['will have pushed','have pushed','had pushed','pushed'],
             cor:'c', hint:'By 1840 (geçmiş nokta) → Past Perfect (had pushed)'},
            {q:'For most of the time throughout the picnic, the boys ....... football while the girls ....... flowers.',
             opts:['will play / have been picking','are playing / will be picking','have played / are picking','were playing / were picking'],
             cor:'d', hint:'throughout the picnic (geçmişte süregelen) → Past Continuous + Past Continuous (were playing / were picking)'},
            {q:'Over recent years, glue sniffing, which ....... negative effects on both the body and the mind, ....... a major problem among teenagers.',
             opts:['has had / is becoming','has / has become','is going to have / had become','will have / will have become'],
             cor:'b', hint:'Genel gerçek → Simple Present (has); over recent years → Present Perfect (has become)'},
            {q:'Chinese merchants ....... trade in Tibet since 1950, when China ....... the country.',
             opts:['dominate / was invading','were dominating / has invaded','will have dominated / had invaded','have dominated / invaded'],
             cor:'d', hint:'since 1950 → Present Perfect (have dominated); 1950 olayı → Past Simple (invaded)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 11-20 ── */
    {
        label: 'Set 9',
        questions: [
            {q:'In 1619, the first African slaves ....... in Virginia, USA, and by 1790, their numbers ....... nearly 700,000.',
             opts:['were arriving / have been reaching','arrived / had reached','have arrived / were reaching','were going to arrive / reach'],
             cor:'b', hint:'In 1619 → Past Simple (arrived); by 1790 (geçmiş nokta) → Past Perfect (had reached)'},
            {q:'We ....... a lovely view of the Bosphorus and the bridges over it while the plane ....... over Istanbul.',
             opts:['are getting / flies','had got / is flying','got / was flying','get / has flown'],
             cor:'c', hint:'Geçmişte eş zamanlı: got (Past Simple) + was flying (Past Continuous arka plan)'},
            {q:'When they ....... in Sydney Harbour, they ....... non-stop for three months.',
             opts:['anchor / will have been sailing','were anchoring / sailed','have anchored / were sailing','are anchoring / have been sailing'],
             cor:'a', hint:'when (gelecek) + Present Simple → Future Perfect Continuous (will have been sailing)'},
            {q:'According to the new schedule, we ....... every Monday and Wednesday next term, but I\'m sure we ....... back to our normal routine of once a week before long.',
             opts:['had trained / revert','train / have reverted','are training / reverted','are going to train / will revert'],
             cor:'d', hint:'Planlanmış gelecek → be going to; tahmin → will revert'},
            {q:'The prospector ran into town in excitement because, at last, he ....... some gold at the site which he ....... for months.',
             opts:['was finding / was panning','will find / is going to pan','will have found / has panned','had found / had been panning'],
             cor:'d', hint:'Geçmişte tamamlanan → Past Perfect (had found); öncesinde süregelen → Past Perfect Continuous (had been panning)'},
            {q:'I expect you ....... bored with working at the Post Office by this time next year and ....... for a more interesting job.',
             opts:['have become / will have looked','were becoming / are going to look','become / will look','will have become / will be looking'],
             cor:'d', hint:'by this time next year → Future Perfect (will have become) + Future Continuous (will be looking)'},
            {q:'Listen! The coach ....... the strengths of our opponents because our team ....... against them before.',
             opts:['has explained / weren\'t playing','explains / won\'t play','is explaining / haven\'t played','was explaining / don\'t play'],
             cor:'c', hint:'Listen! (şu an) → Present Continuous (is explaining); before (şimdiye kadar hiç) → Present Perfect (haven\'t played)'},
            {q:'When I ....... the alterations to the company accounts, I was left in no doubt that the accountant ....... money from the firm.',
             opts:['saw / had been stealing','am seeing / has stolen','was seeing / was stealing','have seen / will have stolen'],
             cor:'a', hint:'Geçmişte tamamlanan eylem → Past Simple (saw); öncesinde süregelen → Past Perfect Continuous (had been stealing)'},
            {q:'According to the doctor, this time next week, I ....... around as normal and the cut on my foot ....... completely.',
             opts:['am walking / healed','will be walking / will have healed','walked / was healing','have been walking / heals'],
             cor:'b', hint:'this time next week → Future Continuous (will be walking) + Future Perfect (will have healed)'},
            {q:'Shadow puppets ....... in China and ....... as far as Turkey and Greece today.',
             opts:['will originate / have been spreading','are originating / will be spreading','originate / had spread','originated / have spread'],
             cor:'d', hint:'Tarihsel geçmiş → Past Simple (originated); etkisi bugüne dek → Present Perfect (have spread)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 21-30 ── */
    {
        label: 'Set 10',
        questions: [
            {q:'Over recent years, many skilled craftsmen and women ....... their jobs in the pottery trade in the UK, but gradually English porcelain ....... its reputation.',
             opts:['will have lost / will regain','had been losing / has regained','lost / regains','are losing / regained','have lost / is regaining'],
             cor:'e', hint:'over recent years → Present Perfect (have lost); gradually + devam eden süreç → Present Continuous (is regaining)'},
            {q:'After she ....... to turn up for our appointment for the third time, I ....... to meet her again.',
             opts:['is failing / am refusing','has failed / had refused','was failing / will refuse','had been failing / have refused','had failed / refused'],
             cor:'e', hint:'After + Past Perfect (had failed) → Past Simple sonuç (refused)'},
            {q:'Since I took part in my first debating match, I ....... a member of the debating club, which I ....... most weekends.',
             opts:['will have been / have attended','have been / attend','will be / was attending','am / had been attending'],
             cor:'b', hint:'since → Present Perfect (have been); alışkanlık → Simple Present (attend)'},
            {q:'By the first half of the 19th century, the potato ....... the staple food in Ireland. In 1854, a disease ....... which resulted in widespread starvation.',
             opts:['was becoming / has struck','will become / was going to strike','had become / struck','was going to become / strikes'],
             cor:'c', hint:'By the first half of 19th century → Past Perfect (had become); In 1854 → Past Simple (struck)'},
            {q:'The origins of domestic poultry ....... uncertain, but experts believe that some breeds are descended from the Indian jungle-fowl, which still ....... in India today.',
             opts:['are going to be / will exist','had been / will have existed','were / had been existing','are / exists'],
             cor:'d', hint:'Genel gerçek → Simple Present (are); still + today → Simple Present (exists)'},
            {q:'In 1868, the US government ....... 7,000 Navajo Indians to return to their homeland and, since then, they ....... the largest and richest Indian tribe.',
             opts:['allowed / have become','has allowed / are becoming','was going to allow / will become','had allowed / were becoming'],
             cor:'a', hint:'In 1868 → Past Simple (allowed); since then → Present Perfect (have become)'},
            {q:'In 1960, only 2,000 American Indians ....... at university, while in 1970, only a decade later, this number ....... to 12,000.',
             opts:['are studying / is increasing','were studying / had increased','will be studying / will have increased','studied / will increase'],
             cor:'b', hint:'In 1960 (geçmiş süreç) → Past Continuous (were studying); by 1970 (geçmişte tamamlanan) → Past Perfect (had increased)'},
            {q:'Today we ....... a lot of tangerines at one pound per kilo, unlike yesterday, when we ....... very few customers.',
             opts:['were selling / have had','are selling / had','had been selling / had had','sold / will have had'],
             cor:'b', hint:'today (şu an süreç) → Present Continuous (are selling); yesterday → Past Simple (had)'},
            {q:'A: She ....... a chill. B: She has a thermal vest on under her pullover, but you have a point. I ....... her coat.',
             opts:['was catching / am fetching','is catching / fetch','will be catching / have fetched','will catch / will fetch','catches / am going to fetch'],
             cor:'e', hint:'Tahmin (will catch) + planlı an kararı (am going to fetch)'},
            {q:'The number of orders per week ....... all year and the sales manager is confident that we ....... our target.',
             opts:['has increased / had been reaching','will increase / have been reaching','increases / reached','increased / reach','has been increasing / will reach'],
             cor:'e', hint:'all year → Present Perfect Continuous (has been increasing); gelecek tahmin → will reach'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 31-40 ── */
    {
        label: 'Set 11',
        questions: [
            {q:'As the police ....... the road, we ....... a time-consuming detour around the mountain.',
             opts:['are closing / were making','will close / had made','had closed / made','will have closed / had been making'],
             cor:'c', hint:'as + Past Perfect (had closed) → Past Simple sonuç (made)'},
            {q:'I ....... some shopping during my lunch break, but I couldn\'t as I ....... awful because of my cold.',
             opts:['was going to do / fell','have done / have felt','will do / am feeling','did / was feeling'],
             cor:'a', hint:'Geçmişte gerçekleşmeyen niyet → was going to do; eş zamanlı Past Simple (fell)'},
            {q:'By the time the work on their house is finished, they ....... the painters, decorators and carpenters a total of £8,000. They ....... a beautiful new kitchen, though.',
             opts:['are paying / have had','paid / are having','had paid / were having','will have paid / will have'],
             cor:'d', hint:'by the time (gelecek) → Future Perfect (will have paid); sonuç → will have'},
            {q:'I feel certain that Greg ....... in his new business because he ....... so hard all the time.',
             opts:['is succeeding / will work','will succeed / works','was succeeding / is going to work','had succeeded / will be working'],
             cor:'b', hint:'Gelecek tahmin → will succeed; genel alışkanlık → Simple Present (works)'},
            {q:'Before Petar Preradovic ....... poems in his native Croatian, he ....... all his poems in German.',
             opts:['has published / is writing','is publishing / was writing','published / had written','had published / will have written'],
             cor:'c', hint:'Before + Past Simple (published) → Past Perfect öncesi eylem (had written)'},
            {q:'I ....... some notes earlier and ....... to them during my presentation. In the event, however, I didn\'t use them once.',
             opts:['will have written / will refer','am going to write / refer','had written / was going to refer','wrote / have referred'],
             cor:'c', hint:'Geçmişte planlanan → had written + was going to refer (gerçekleşmeyen plan)'},
            {q:'Because of Istanbul\'s geographical location, it ....... a place of trade since civilisation .......',
             opts:['is / was beginning','was / has begun','will be / had begun','had been / is beginning','has been / began'],
             cor:'e', hint:'since → Present Perfect (has been); civilisation began → Past Simple (başlangıç noktası)'},
            {q:'When Boris Yeltsin ....... on 31st December 1999, he ....... President of Russia for eight years.',
             opts:['had resigned / was','has resigned / is','will have resigned / will be','resigned / had been'],
             cor:'d', hint:'31st December 1999 → Past Simple (resigned); for eight years (öncesinde süregelen) → Past Perfect (had been)'},
            {q:'The circumference of a circle ....... 3.14159265 times its diameter no matter how small or large it is.',
             opts:['measures','measured','will be measuring','had measured'],
             cor:'a', hint:'Matematiksel gerçek / bilimsel kanun → Simple Present (measures)'},
            {q:'At present, British farmers ....... to the government because since the EC lifted the ban on British beef, the French ....... to buy any.',
             opts:['were protesting / refused','are protesting / have refused','had protested / were refusing','will protest / refuse'],
             cor:'b', hint:'at present → Present Continuous (are protesting); since → Present Perfect (have refused)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 41-50 (cümle tamamlama) ── */
    {
        label: 'Set 12',
        questions: [
            {q:'She hasn\'t washed anything delicate in the washing machine .......',
             opts:['until she bought some special soap powder','since she shrank her favourite Shetland wool cardigan','even when her mother offered to wash it for her','until the garment becomes really faded'],
             cor:'b', hint:'hasn\'t + since → Present Perfect + since + Past Simple (shrank)'},
            {q:'....... we will probably have eaten, but I\'ll keep your dinner warm in the oven.',
             opts:['Until we move the office to the city centre','While you were travelling to Edinburgh','As soon as he had got the job as a chef','By the time you get home from Carlisle'],
             cor:'d', hint:'will have eaten → Future Perfect; By the time + Present Simple → Future Perfect sonucu'},
            {q:'......... suddenly, he had a great idea how to make the farm profitable.',
             opts:['Until he has obtained the loan from the bank','When he hires two new farm workers','While he was milking the cows','Whenever he considered selling the bottom field'],
             cor:'c', hint:'he had a great idea (Past Simple) → While + Past Continuous arka plan (was milking)'},
            {q:'....... by the time you have unpacked.',
             opts:['We were all in the living room watching television','We have just run out of hot water','You haven\'t had time to take a shower','The water will be hot enough for a bath'],
             cor:'d', hint:'by the time you have unpacked → Future Perfect bağlamı; The water will be hot → Future Simple'},
            {q:'Before the riders mount their horses, .......',
             opts:['they usually went for a gallop around the paddock','the horses were mostly thoroughbreds','they were riding without wearing riding hats','the instructor checks the bridle and saddle of the horses'],
             cor:'d', hint:'Before + Present Simple (mount) → Present Simple sonuç (checks); zaman uyumu'},
            {q:'He qualified as a pilot just three months ago, but since then .......',
             opts:['he has flown across the Atlantic several times','he was fulfilling a lifetime ambition','he usually works as a co-pilot','he is terribly afraid of flying'],
             cor:'a', hint:'since then → Present Perfect (has flown); three months ago → başlangıç noktası'},
            {q:'It was only after she had visited her doctor that .......',
             opts:['she has been worrying about the rash on her scalp','her rash began to disappear','she will have been suffering for two months','she is feeling much better'],
             cor:'b', hint:'after she had visited (Past Perfect) → Past Simple sonuç (began to disappear)'},
            {q:'....... as soon as they find out the exact weight of the shipment.',
             opts:['We suspected that they had overcharged us again','They had been asking us for some business for weeks','Perhaps they have delivered our goods','They will let us know the precise cost of transportation'],
             cor:'d', hint:'as soon as + Present Simple → will + V₁ (Future); They will let us know'},
            {q:'Until the manager dropped the football star from the team, .......',
             opts:['he has scored more goals than his team mates this season','he won\'t play for them in the future','he expects to get an offer from a European club','he doesn\'t expect to get picked next season','he really believed that he was indispensable'],
             cor:'e', hint:'Until + Past Simple (dropped) → Past Simple bağlamı; he really believed (Past Simple)'},
            {q:'....... when thieves stole the radio cassette player.',
             opts:['He has decided to pay in instalments','The police aren\'t doing enough to catch the thieves','You have been waiting so long for the dealer to deliver your new stereo','He had only just taken delivery of his new car'],
             cor:'d', hint:'when + Past Simple (stole) → Past Perfect öncesi durum (had only just taken delivery)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 51-60 (bağlaç seçme) ── */
    {
        label: 'Set 13',
        questions: [
            {q:'The main character was so funny that we laughed continually ....... the whole play.',
             opts:['during','until','while','as soon as','before'],
             cor:'a', hint:'during + isim → "boyunca"; while + cümle ile kullanılır'},
            {q:'She attended a supplementary Mathematics course ....... she was studying for her "Advanced Calculus" examination.',
             opts:['before','during','while','by the time','after'],
             cor:'c', hint:'while + subject + verb → eş zamanlı iki eylem'},
            {q:'I discussed the new advertisement with him over the telephone, but I haven\'t spoken to him ....... then.',
             opts:['before','by','during','until','since'],
             cor:'e', hint:'haven\'t spoken → Present Perfect; since then → "o zamandan beri"'},
            {q:'....... I read about his death in the newspaper, I sent a sympathy card to his widow.',
             opts:['Before','By the time','During','While','As soon as'],
             cor:'e', hint:'As soon as → "hemen ... -ince"; iki ardışık eylem'},
            {q:'So much snow had covered the mountaineer that ....... they dug him out, he had almost frozen to death.',
             opts:['while','by the time','until','as soon as','after'],
             cor:'b', hint:'by the time + Past Simple → Past Perfect sonuç (had almost frozen)'},
            {q:'Joanna received treatment for many years ......... her cancer finally disappeared.',
             opts:['by the time','since','as','before','while'],
             cor:'d', hint:'before → "... olmadan önce"; treatment aldı, sonra iyileşti'},
            {q:'She is very scared of dogs, so ....... she sees one, she gives it as much room as possible.',
             opts:['whenever','by the time','while','since'],
             cor:'a', hint:'whenever → "her ne zaman"; tekrar eden alışkanlık'},
            {q:'We won\'t be able to ski ....... this fog clears. It\'s far too dangerous at the moment.',
             opts:['while','just as','until','by the time'],
             cor:'c', hint:'won\'t ... until → "... olmadan / -ene kadar olmayacak"'},
            {q:'....... I was about to leave the office, the telephone rang and I\'m glad I answered it.',
             opts:['Before','Just as','By the time','While'],
             cor:'b', hint:'Just as → "tam o sırada"; eş zamanlı anlık kesişme'},
            {q:'Many people had drunk the contaminated water ....... the council informed the residents of the chemical spill.',
             opts:['by the time','since','while','after'],
             cor:'a', hint:'by the time + Past Simple → Past Perfect sonuç (had drunk)'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 61-70 (eşanlamlı cümle) ── */
    {
        label: 'Set 14',
        questions: [
            {q:'The internet has become accessible to most people because computer prices have fallen and internet cafes have sprung up in the last few years.',
             opts:['Lack of money is no longer a barrier to access to the Internet because those who can\'t afford a computer can go to computer cafes.','A few years ago, only the rich had been able to afford a computer, but now everyone can own one.','Most people access the Internet on their own computer or at internet cafes, which are springing up everywhere.','As the cost of a computer has dropped and internet cafes have opened up over recent years, the Internet is now only inaccessible to very few people.'],
             cor:'d', hint:'Fiyat düşüşü + internet kafe açılması → internet neredeyse herkese açık oldu'},
            {q:'Vicki wasn\'t feeling well yesterday, so for once, I beat her at badminton.',
             opts:['I always lose to Vicki at badminton, but yesterday was an exception because of her ill health.','I usually beat Vicki at badminton, but yesterday I lost due to my ill health.','I have only once won at badminton and that was against Vicki, who wasn\'t feeling well at the time.','Despite not feeling very well, Vicki beat me yesterday at badminton as she normally does.'],
             cor:'a', hint:'for once = istisnai bir kez; her zaman kaybeden ben, Vicki hasta olunca kazandım'},
            {q:'John has been responsible for sales in the Midlands since his promotion by the firm two months ago.',
             opts:['The company promoted John two months ago and since then he has had the responsibility for sales in the Midlands.','Before the company promoted John, he had the responsibility for sales in the Midlands for two months.','John had the responsibility for Midland sales two months before his company promoted him.','John has had the responsibility for Midland sales for two months and his company has just promoted him.'],
             cor:'a', hint:'since his promotion two months ago → terfi sonrası sorumluluk başladı'},
            {q:'I last hiked this sort of distance at university and, not surprisingly, I was much fitter then.',
             opts:['You will be surprised to learn that I was much fitter at university.','I\'m surprisingly fit considering that I haven\'t done a walk of this length since university.','Naturally, I\'m tired as I\'m not accustomed to walking so far, but I was much fitter when I was at university.','I haven\'t walked such a distance since I was at university, when I was much fitter, of course.'],
             cor:'d', hint:'I last hiked = üniversiteden beri yapmadım; o zaman daha zindedim'},
            {q:'FIFA football, which I played with my nephew last week, was the first computer game I had played in my life.',
             opts:['I had never played a computer game until I played FIFA football with my nephew last week.','I have never played any computer games, but my nephew played FIFA football last week.','I beat my nephew on the computer game FIFA football last week for the first time ever.','I had never used a computer until I played FIFA football last week with my nephew.'],
             cor:'a', hint:'first computer game I had played → hayatımda hiç oynamamıştım; ta ki geçen hafta'},
            {q:'As the crust tasted like cardboard, that was the last time I ever tried to make an apple pie.',
             opts:['I bought an apple pie instead of trying to make one because last time my pie crust resembled cardboard.','They didn\'t like my apple pie because it tasted like cardboard, so I won\'t bake another one.','Every time I try to make an apple pie, it tastes a bit like cardboard, so I\'m going to give up trying.','I never attempted to bake an apple pie again because the crust of my last attempt resembled cardboard in taste.'],
             cor:'d', hint:'that was the last time → bir daha hiç denemedi; neden: crust karton gibi'},
            {q:'She stopped worrying about her son when he telephoned her from the university.',
             opts:['She worries a lot about her son, who is at university, so he phones her frequently.','He phoned his mother from the university because he didn\'t want her to worry about him.','After her son phoned her from the university, she was no longer worried about him.','He phones his mother from the university because he knows she worries about him.'],
             cor:'c', hint:'stopped worrying when he telephoned → telefon sonrası artık endişe yok'},
            {q:'I didn\'t feel sick once during the ferry trip from Italy to Turkey.',
             opts:['Usually, I get sick whenever I travel on the ferry from Italy to Turkey.','Although the sea between Italy and Turkey was rough, I wasn\'t sick once.','This time my ferry trip to Turkey from Italy wasn\'t spoilt by my being unwell.','I felt well throughout the sea crossing to Turkey from Italy.'],
             cor:'d', hint:'didn\'t feel sick once = hiç hastalanmadım = throughout... felt well'},
            {q:'My father has mastered four foreign languages so far in his life.',
             opts:['At the moment, my father is learning four different languages.','Up to now, my father has learnt four languages thoroughly in addition to his own.','This is the fourth language my father has learnt already, and soon, he will start studying another one.','My father can\'t decide which of the four languages to study.'],
             cor:'b', hint:'has mastered = derinlemesine öğrenmiş; so far = up to now'},
            {q:'Lena Zavoroni had suffered for nearly twenty years before she died of an eating disorder.',
             opts:['Lena Zavoroni passed away because of eating too little for over twenty years.','When Lena Zavoroni died twenty years ago, she was suffering from an eating disorder.','After almost twenty years of suffering from an eating disorder, Lena Zavoroni passed away.','Almost twenty years of eating unhealthy food caused the death of Lena Zavoroni.'],
             cor:'c', hint:'had suffered for nearly twenty years before she died → neredeyse 20 yıl sonra öldü'},
        ]
    },
    /* ── TEST YOURSELF 1 — Sorular 71-80 (çeviri) ── */
    {
        label: 'Set 15',
        questions: [
            {q:'Programa göre kurtarma ekibi, afet bölgesine gitmek üzere yarın şafakta yola çıkıyor.',
             opts:['The schedule says that the rescue team is leaving the disaster area tomorrow at dawn.','The rescue team is keeping to the schedule and arriving at the disaster area tomorrow at dawn.','According to the schedule, the rescue team is leaving for the disaster area tomorrow at dawn.','If they follow the schedule, the rescue team will have arrived at the disaster area tomorrow by dawn.'],
             cor:'c', hint:'According to the schedule → "programa göre"; leaving for → "gitmek üzere yola çıkıyor"'},
            {q:'İlk Avrupalı kaşifler Amerika\'ya ayak bastığında, Amerikan yerlileri binlerce yıldır orada yaşıyorlardı.',
             opts:['When the first European explorers landed in America, they were greeted by Native Americans who had lived there for millennia.','America has been inhabited for thousands of years; originally by Natives and later by Europeans.','At the time of the European exploration, the area was inhabited by Native Americans who had been living there for millennia.','When the first European explorers set foot in America, the Native Americans had been living there for thousands of years.'],
             cor:'d', hint:'ayak bastığında → set foot; binlerce yıldır yaşıyorlardı → had been living (Past Perfect Continuous)'},
            {q:'Gece yarısına kadar katılımcıların sadece dördü konuşma yapabilmişti.',
             opts:['Although it was past midnight, only four participants had given their speeches.','Unfortunately, only four speeches had been completed by midnight.','It was past midnight and we had heard only four of the speeches.','Only four of the participants had managed to give their speeches by midnight.'],
             cor:'d', hint:'gece yarısına kadar → by midnight; sadece dördü konuşabilmişti → had managed to give'},
            {q:'Vücut hareketleri ve yüz ifadeleriyle bale, insan duygularının tümünü çok estetik bir biçimde anlatır.',
             opts:['Through bodily movements and facial expressions, ballet expresses the full range of human emotions very aesthetically.','The beauty of ballet is that it expresses human emotions aesthetically using both bodily movements and facial expressions.','Ballet is a combination of bodily movements and facial expressions, which can aesthetically display every possible human emotion.','The beauty of ballet\'s bodily movements is enhanced by facial expressions, which express the full range of human emotions.'],
             cor:'a', hint:'Through bodily movements and facial expressions → vücut hareketleri ve yüz ifadeleriyle; expresses = anlatır'},
            {q:'Argo çoğunlukla toplumun alt tabakalarında ortaya çıkar ve daha sonra yavaş yavaş kendini toplumun geneline kabul ettirir.',
             opts:['Many words used by the general public were originally slang expressions, but they slowly became widely accepted.','Slang words are often first used on the margins of society and later become accepted by the general public.','Slang, usually first used by specific cultural groups, becomes accepted extremely slowly by the rest of society.','Society\'s subgroups often use slang words, but sometimes these words slowly become accepted by the general public.','Slang often originates in society\'s subgroups and then works its way slowly into acceptance by the general public.'],
             cor:'e', hint:'originates in subgroups → alt tabakada ortaya çıkar; works its way into acceptance → kabul ettirir'},
            {q:'The artifacts from the tomb of the Egyptian pharaoh Tutankhamen, including the magnificent golden mask, are on display at the Egyptian Museum in Cairo.',
             opts:['Kahire\'de Mısır Müzesi\'nde gösterime sunulan sanat eserleri muhteşemdi.','Mısır Firavunu Tutankamen\'in mezarından çıkarılan sanat eserleri, muhteşem altın maske dahil, Kahire\'de Mısır Müzesi\'nde gösterimdedir.','Muhteşem altın maske dahil sanat eserleri Kahire\'de Mısır Müzesi\'nde gösterime sunulacaktır.','Kahire\'de Mısır Müzesi\'nde gösterimde olan sanat eserleri Tutankamen\'in mezarından çıkarılmıştır.'],
             cor:'b', hint:'are on display → gösterimdedir (şu an); including the golden mask → altın maske dahil'},
            {q:'The destruction of Brazil\'s rain forests, in the name of economic progress, diminishes the amount of oxygen over the whole Earth.',
             opts:['Ekonomik gelişme sağlanırken oksijen azalması yağmur ormanlarının yok olmasına neden olmuştur.','Tüm dünyanın üzerindeki oksijen miktarının azalmasının nedeni yağmur ormanlarının yok edilmesidir.','Yağmur ormanlarının yok edilmesi, ekonomik gelişme adına da olsa oksijen miktarını azaltmıştır.','Ekonomik gelişme adına Brezilya\'nın yağmur ormanlarının yok edilmesi, tüm dünyanın üzerindeki oksijen miktarını azaltıyor.'],
             cor:'d', hint:'diminishes = azaltıyor (Simple Present); in the name of economic progress = ekonomik gelişme adına'},
            {q:'While the rest of Europe was still in the Stone Age, the Minoan-Mycenaean peoples of the Aegean region had achieved a highly organised Bronze Age culture.',
             opts:['Avrupa\'nın geri kalanı hala Taş Devri\'nde iken, Ege bölgesinin Minos-Miken halkları son derece örgütlü Bronz Çağı kültürünü yaratmışlardı.','Ege bölgesinin Minos-Miken halkları Bronz Çağı kültürünü yaratırken Avrupa\'nın geri kalanı hala Taş Devri\'ndeydi.','Avrupa\'nın geri kalanı henüz Taş Devri\'ni yaşıyordu, ama Minos-Miken halkları Bronz Çağı kültürünü yaratma çabasındaydı.','Minos-Miken halkları Bronz Çağı kültürünü yaratmaya, Avrupa\'nın geri kalanı Taş Devri\'ndeyken başlamışlardı.'],
             cor:'a', hint:'While + Past Continuous → Past Perfect (had achieved); Taş Devri\'nde iken Bronz kültürü yaratmışlardı'},
            {q:'Because of his knee injury, our best player won\'t be able to play in next week\'s critical match.',
             opts:['Gelecek haftaki kritik maçta en iyi oyuncumuz oynayamayacak çünkü dizini çok kötü incitti.','En iyi oyuncumuzun gelecek haftaki kritik maçta oynayamayacak olmasının nedeni dizindeki incinmedir.','Dizindeki incinme yüzünden en iyi oyuncumuz gelecek haftaki kritik maçta oynayamayacak.','Dizindeki incinme, en iyi oyuncumuzun gelecek haftaki kritik maçta oynamasını imkansız kılıyor.'],
             cor:'c', hint:'Because of his knee injury → dizindeki incinme yüzünden; won\'t be able to play → oynayamayacak'},
            {q:'The mountaineers had been walking in the rain since eight o\'clock in the morning and all had fallen exhausted.',
             opts:['Dağcıların hepsi bitkin düşmüş olmasına rağmen sabah sekizden beri yağmur altında yürüyorlardı.','Dağcılar sabah sekizden beri yağmur altında yürüyorlardı ve hepsi de bitkin düşmüştü.','Dağcılar sabahın sekizinde yağmur altında yürüyorlardı ve hepsi de çok bitkin görünüyordu.','Sekiz saattir yağmur altında yürüyen dağcılar, sabah saatlerinde bitkin düşüp mola verdiler.'],
             cor:'b', hint:'had been walking since eight → sabah sekizden beri yürüyorlardı; had fallen exhausted → bitkin düşmüştü'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 1-10 ── */
    {
        label: 'Set 16',
        questions: [
            {q:'Winter, the most unpredictable of all seasons in Istanbul, sometimes ....... as early as October and ....... until April.',
             opts:['began / has lasted','will begin / is lasting','began / will have lasted','begins / was lasting','begins / lasts'],
             cor:'e', hint:'Genel gerçek / alışkanlık → Simple Present + Simple Present (begins / lasts)'},
            {q:'People ....... down all the world\'s rain forests before the authorities ....... any action.',
             opts:['have cut / took','will have cut / take','will be cutting / will take','are cutting / have taken'],
             cor:'b', hint:'before the authorities take (gelecek) → Future Perfect (will have cut); zaman bağlacına will gelmez'},
            {q:'In 1865 the northern states of the United States ....... the southern states, which ....... to break away and form a separate nation.',
             opts:['were defeating / have attempted','defeated / had attempted','defeat / were attempting','have defeated / attempted'],
             cor:'b', hint:'In 1865 → Past Simple (defeated); öncesinden gelen niyet → Past Perfect (had attempted)'},
            {q:'Although a number of nuclear power plants ....... safely for years, public concern ....... it from becoming a major electricity producer.',
             opts:['have been operating / has prevented','are operating / prevented','had operated / will prevent','operated / had been preventing'],
             cor:'a', hint:'for years → Present Perfect Continuous (have been operating); sonuç etkisi → Present Perfect (has prevented)'},
            {q:'No one ....... in climbing Everest before Edmund Hillary and Tenzing Norgay ....... it in 1953.',
             opts:['was succeeding / have been doing','succeeded / were doing','has succeeded / have done','had succeeded / did'],
             cor:'d', hint:'before + Past Simple (did) → Past Perfect öncesi durum (had succeeded — hiç başaramamıştı)'},
            {q:'As late as the 1960s, only a few specialists ....... how to use computers, but now computer programming ....... one of the most popular professions.',
             opts:['were going to know / becomes','had known / became','knew / has become','will have known / will become'],
             cor:'c', hint:'As late as the 1960s → Past Simple (knew); now + etkisi devam → Present Perfect (has become)'},
            {q:'Searchers ....... to be confident that they ....... the missing climbers before nightfall.',
             opts:['are appearing / find','appear / will have found','were appearing / are finding','will appear / had found'],
             cor:'b', hint:'appear (şu an gözlem) → Simple Present; before nightfall (gelecek) → Future Perfect (will have found)'},
            {q:'Some people think that robots, which ....... an important role in automobile manufacture already, ....... most of our physical work for us soon.',
             opts:['had played / are doing','played / have done','are playing / will be doing','were playing / will have done'],
             cor:'c', hint:'already + şu an → Present Continuous (are playing); soon → Future Continuous (will be doing)'},
            {q:'Even after colonialism ....... early in the second half of the 20th century, many former colonies ....... to use the language of their former rulers.',
             opts:['ended / continued','has ended / were continuing','had ended / have been continuing','was ending / had continued'],
             cor:'a', hint:'after + Past Simple (ended) → Past Simple sonuç (continued); ardışık geçmiş eylemler'},
            {q:'I hope the pond ....... over by Christmas, so we can go skating when our cousins ....... to visit.',
             opts:['will be freezing / have come','is freezing / are coming','had frozen / were coming','has frozen / came','will have frozen / come'],
             cor:'e', hint:'by Christmas → Future Perfect (will have frozen); when + zaman bağlacı → Simple Present (come)'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 11-20 ── */
    {
        label: 'Set 17',
        questions: [
            {q:'We ....... a new car, but we couldn\'t because we ....... how expensive they were.',
             opts:['were buying / won\'t realise','have bought / don\'t realise','had bought / haven\'t realised','were going to buy / hadn\'t realised'],
             cor:'d', hint:'Gerçekleşmeyen geçmiş niyet → were going to buy; öncesinde bilgi eksikliği → Past Perfect (hadn\'t realised)'},
            {q:'When Cyprus ....... an independent republic in 1960, it ....... a British colony since 1892.',
             opts:['became / had been','was becoming / has been','has become / was','had become / was being'],
             cor:'a', hint:'In 1960 → Past Simple (became); since 1892 (öncesinden beri) → Past Perfect (had been)'},
            {q:'I\'m sure you ....... badly in your exams because you ....... hard enough lately.',
             opts:['are doing / hadn\'t studied','have done / won\'t study','will do / haven\'t been studying','do / won\'t have been studying'],
             cor:'c', hint:'Gelecek tahmin → will do; lately → Present Perfect Continuous (haven\'t been studying)'},
            {q:'When the judge ....... to all of the arguments, he ....... to postpone the hearing until another time.',
             opts:['was listening / decides','listens / has decided','has listened / was deciding','had listened / decided'],
             cor:'d', hint:'Tüm argümanları dinledikten sonra → Past Perfect (had listened) → Past Simple karar (decided)'},
            {q:'We ....... at the traffic lights when the bus ....... into us from behind.',
             opts:['were waiting / crashed','had waited / has crashed','waited / was crashing','have waited / had been crashing'],
             cor:'a', hint:'Geçmişte süregelen arka plan (were waiting) + ani eylem (crashed)'},
            {q:'Even Thomas Edison, the inventor of the gramophone, ....... what people ....... it for.',
             opts:['didn\'t know / were going to use','hadn\'t known / are using','wouldn\'t know / use','hadn\'t known / used'],
             cor:'a', hint:'Past Simple (didn\'t know) + gelecekteki kullanım tahmini → were going to use'},
            {q:'The United States ....... the world\'s only super-power since the Soviet Union ....... in the late 1980s.',
             opts:['is / has collapsed','was / was collapsing','has been / collapsed','will have been / would collapse'],
             cor:'c', hint:'since → Present Perfect (has been); late 1980s → Past Simple (collapsed — başlangıç noktası)'},
            {q:'Archaeologists ....... under the Dome of the Rock in Jerusalem, but political protests ....... the excavations.',
             opts:['have excavated / will block','were excavating / had been blocking','excavate / are blocking','were going to excavate / blocked'],
             cor:'d', hint:'Gerçekleşmeyen plan → were going to excavate; engel → Past Simple (blocked)'},
            {q:'The defendant ....... that he ....... the pub before the crime was committed.',
             opts:['was swearing / leaves','swore / had left','swears / will have left','was going to swear / is leaving'],
             cor:'b', hint:'Past Simple (swore) + before + Past Simple → Past Perfect (had left) sıralaması'},
            {q:'It is final exam time, and the students ....... so hard that they ....... forward to the vacation.',
             opts:['have been working / are looking','will work / looked','are working / had been looking','work / have looked'],
             cor:'a', hint:'Devam eden süreç → Present Perfect Continuous (have been working); şu an → Present Continuous (are looking)'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 21-30 ── */
    {
        label: 'Set 18',
        questions: [
            {q:'Prices ....... steadily all year, so I hope that we ....... a pay rise soon.',
             opts:['rose / have got','are rising / got','have been rising / will get','had risen / get'],
             cor:'c', hint:'all year → Present Perfect Continuous (have been rising); sonuç beklentisi → will get'},
            {q:'The first heavier-than-air flight ....... place in 1903, and aeronautics ....... ever since.',
             opts:['was taking / developed','took / has been developing','has taken / will develop','had taken / develops'],
             cor:'b', hint:'In 1903 → Past Simple (took); ever since → Present Perfect Continuous (has been developing)'},
            {q:'Since he ....... the Microsoft Corporation, Bill Gates ....... one of the richest men in the world.',
             opts:['was founding / is becoming','has founded / became','had founded / will become','founded / has become'],
             cor:'d', hint:'since + Past Simple (founded — başlangıç) → Present Perfect sonuç (has become)'},
            {q:'When the reinforcements ......., it was too late; the enemy ....... their comrades already.',
             opts:['were arriving / annihilated','have arrived / was annihilating','arrive / has annihilated','arrived / had annihilated'],
             cor:'d', hint:'When + Past Simple (arrived) → Past Perfect (had annihilated — önceden tamamlanmış)'},
            {q:'Because of the recent floods, a large number of people ....... their homes and it seems that they ....... the winter in tents.',
             opts:['are losing / have had to spend','lost / were spending','lose / have to spend','were losing / had spent','have lost / will have to spend'],
             cor:'e', hint:'recent floods sonucu → Present Perfect (have lost); gelecek zorunluluk → will have to spend'},
            {q:'It was not until the early 20th century that Henry Ford ....... the automobile through mass production, though Cugnot ....... the world\'s first self-propelled vehicle as early as 1769.',
             opts:['was popularising / has invented','popularised / had invented','has popularised / was inventing','had popularised / was inventing'],
             cor:'b', hint:'early 20th century → Past Simple (popularised); 1769 (daha önceki buluş) → Past Perfect (had invented)'},
            {q:'The steel mill in Youngstown ....... steel since 1804 when it ....... down in the 1980s.',
             opts:['had been making / closed','has been making / was closing','made / had closed','was going to make / closes'],
             cor:'a', hint:'since 1804 → Past Perfect Continuous (had been making); in the 1980s → Past Simple (closed)'},
            {q:'On the assumption that the Chinese economy ....... to grow as at present, China ....... the United States as the world\'s greatest economic superpower by the mid 21st century.',
             opts:['continued / has overtaken','continues / was going to overtake','will continue / will have overtaken','is continuing / overtakes'],
             cor:'c', hint:'if assumption (present) → will continue; by the mid 21st century → Future Perfect (will have overtaken)'},
            {q:'Ever since slavery ....... in 1863, African Americans ....... for their civil rights.',
             opts:['has been ending / were fighting','had ended / are fighting','ended / have been fighting','was ending / fought'],
             cor:'c', hint:'ended (Past Simple — başlangıç) + ever since → Present Perfect Continuous (have been fighting)'},
            {q:'Though Susan ....... some of the best marks in her class last year, it appears that she ....... most of her courses this year.',
             opts:['has got / is failing','had been getting / falls','was getting / had failed','got / will fail'],
             cor:'d', hint:'last year → Past Simple (got); gelecek endişe → will fail'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 31-40 ── */
    {
        label: 'Set 19',
        questions: [
            {q:'George ....... to get Sally to marry him for years when, finally, she ....... him by saying, "Yes".',
             opts:['had been trying / surprised','tried / was surprising','has tried / surprises','was trying / will be surprising'],
             cor:'a', hint:'for years (geçmişte süreç) → Past Perfect Continuous (had been trying); ani sonuç → Past Simple (surprised)'},
            {q:'My friend ....... for an ice hockey team that ....... only one match this season.',
             opts:['was playing / is winning','has played / had won','has been playing / wins','played / will be winning','plays / has won'],
             cor:'e', hint:'şu an devam → Simple Present (plays); this season + sonuç → Present Perfect (has won)'},
            {q:'Ferdinand Magellan ....... out to sail around the world in 1519. Before then, no one ....... to do that.',
             opts:['was setting / has attempted','has set / was attempting','will have set / attempted','set / had attempted'],
             cor:'d', hint:'in 1519 → Past Simple (set); before then → Past Perfect (had attempted — hiç kimse denememişti)'},
            {q:'Though Magellan himself ....... along the way, one of his five ships ....... the voyage in 1522.',
             opts:['had died / has completed','died / completed','was dying / completes','dies / is completing'],
             cor:'b', hint:'Geçmişte ardışık iki olay → Past Simple + Past Simple (died / completed)'},
            {q:'In the year 2022, it ....... 500 years since that memorable voyage .......',
             opts:['is / has ended','has been / was ending','will have been / ended','had been / ends'],
             cor:'c', hint:'In 2022 (gelecek) → Future Perfect (will have been); voyage ended in 1522 → Past Simple (ended)'},
            {q:'George claims that he ....... a novel for five years, but I don\'t think that he ....... it ever.',
             opts:['wrote / is finishing','has written / had finished','writes / was finishing','has been writing / will finish'],
             cor:'d', hint:'for five years (devam) → Present Perfect Continuous (has been writing); gelecek şüphe → will finish'},
            {q:'Trains ....... since early in the 19th century and they still ....... one of the best ways of transportation.',
             opts:['existed / will provide','are existing / will be providing','were existing / have provided','have existed / provide'],
             cor:'d', hint:'since early 19th century → Present Perfect (have existed); still + genel gerçek → Simple Present (provide)'},
            {q:'My father ....... forward to retiring for years, but once he was a retired person, he ....... bored quickly.',
             opts:['looks / has become','was looking / becomes','has been looking / is becoming','had looked / became'],
             cor:'d', hint:'for years (geçmişte süreç) → Past Perfect (had looked); once + Past Simple → Past Simple sonuç (became)'},
            {q:'Fred ....... with us any more because they ....... him to head of the London branch.',
             opts:['won\'t be working / have appointed','hasn\'t worked / appointed','didn\'t work / are appointing','won\'t have worked / appoint'],
             cor:'a', hint:'Gelecek durum → won\'t be working; tamamlanan eylem → Present Perfect (have appointed)'},
            {q:'For the last two weeks, Sandra ....... about her exams so much that her hair ....... out because of stress.',
             opts:['worries / has fallen','has been worrying / is falling','was worrying / had fallen','is worrying / had been falling'],
             cor:'b', hint:'for the last two weeks → Present Perfect Continuous (has been worrying); devam eden sonuç → Present Continuous (is falling)'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 41-50 (cümle tamamlama) ── */
    {
        label: 'Set 20',
        questions: [
            {q:'....... our client will have decided to use one of our competitors, so let\'s hurry up and make a decision.',
             opts:['Until the manager gave us the latest sales figures','During yesterday\'s meeting about our strategy for the coming year','While we were trying to figure out where to hold the New Year\'s office party','As soon as we had mapped out our strategy','At this rate, by the time we have come up with a plan'],
             cor:'e', hint:'will have decided → Future Perfect; By the time we come up with → gelecek bağlamı'},
            {q:'The union leaders achieved a breakthrough in the tricky negotiations with management .......',
             opts:['until it appeared that the entire plan would fail','when they decide to drop their unreasonable wage demands','since the last pay rise the employers agreed to give to the workers','whenever they devise a plan that their members will accept','just when it seemed that there was no hope'],
             cor:'e', hint:'achieved (Past Simple) → just when it seemed (eş zamanlı an)'},
            {q:'My neighbour is having great difficulty with her financial affairs.',
             opts:['since her husband died last year','until her son promised to sort them out','so I\'ve arranged to help her this evening','when her business was struggling last month'],
             cor:'c', hint:'is having (şu an devam) → so I\'ve arranged (Present Perfect sonuç)'},
            {q:'Write your names on top of your paper .......',
             opts:['when you had practised tenses and conjunctions for weeks','before you start answering the questions','by the time you are able to write good, clear sentences','while the teacher was checking the attendancy sheet'],
             cor:'b', hint:'before you start answering → emirle uyumlu; soru yanıtlamadan önce isim yaz'},
            {q:'Mike graduated from university just two years ago, but since then, .......',
             opts:['he has earned enough on the stock market to be able to retire','he is living in a luxurious flat in one of the most expensive parts of town','he worked for one of the most successful stockbrokers in the city','he will probably have quite a successful career'],
             cor:'a', hint:'since then → Present Perfect (has earned); two years ago → başlangıç noktası'},
            {q:'She only remembered that she was on a diet .......',
             opts:['so she is starting to worry about her appearance','when she eats too much and feels bad about it afterwards','after she had eaten two helpings of dessert','she won\'t eat as much for dinner as she did for lunch'],
             cor:'c', hint:'remembered (Past Simple) → after she had eaten (Past Perfect önceki eylem)'},
            {q:'....... when their first child was born.',
             opts:['They don\'t think they will have moved into their new house','They have been taking too long to decide where to move','They have worked and saved for this moment','They had just moved into their new house'],
             cor:'d', hint:'when + Past Simple (was born) → Past Perfect (had just moved — tam o sırada tamamlanmış)'},
            {q:'Alice has not trusted men .......',
             opts:['because she will probably never get married','ever since her husband ran off with the money she inherited from her father','by the time she is old enough to consider marriage','when she rejected Fred\'s proposal several times'],
             cor:'b', hint:'has not trusted → Present Perfect; ever since → "ta ki ... -den beri" (ran off — Past Simple başlangıç)'},
            {q:'It\'s easy to see he\'s been crying for a long time, .......',
             opts:['as he has just learned that he has failed his driving test','until his mother tried to soothe him by cuddling him tightly','as soon as he entered the living room with his broken toy car','because his eyes are very red and he can\'t stop sniffing'],
             cor:'d', hint:'has been crying (Present Perfect Continuous) → because his eyes are very red (gözle görülen kanıt)'},
            {q:'By the time the farmers managed to purchase the new insecticide, .......',
             opts:['it proved more effective than anything they had used before','they will probably have lost over half of their potential harvest to insects','insects had severely damaged most of their crops','it has been in short supply because of the great demand for it'],
             cor:'c', hint:'By the time + Past Simple → Past Perfect sonuç (had severely damaged)'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 51-60 (bağlaç seçme) ── */
    {
        label: 'Set 21',
        questions: [
            {q:'No one has seen Fred ....... he decided rather foolishly to go sailing in the hurricane.',
             opts:['when','before','since','by the time'],
             cor:'c', hint:'has seen → Present Perfect; since + Past Simple → "o zamandan beri"'},
            {q:'The athlete raised his hand in a victory salute ....... he crossed the finish line.',
             opts:['until','during','by the time','since','as'],
             cor:'e', hint:'as → "tam -erken / -irken"; eş zamanlı anlık eylem'},
            {q:'You got a "0" on your homework because you weren\'t listening ....... the teacher was explaining what to do.',
             opts:['while','as soon as','until','after'],
             cor:'a', hint:'while + Past Continuous → eş zamanlı süregelen eylem'},
            {q:'The traffic was so bad this morning that ....... I got to work, it was already coffee break.',
             opts:['until','during','while','by the time'],
             cor:'d', hint:'by the time → "... vardığımda (çoktan)"; Past Simple + Past Simple'},
            {q:'He was found guilty on all charges, and it will be at least 20 years ....... he is a free man again.',
             opts:['since','while','as soon as','before'],
             cor:'d', hint:'it will be 20 years before → "20 yıl geçmeden özgür olmayacak"'},
            {q:'Slavery has only been illegal in Saudi Arabia ....... 1963.',
             opts:['in','before','or','during','since'],
             cor:'e', hint:'has been illegal → Present Perfect; since 1963 → başlangıç noktası'},
            {q:'I\'m not going to speak to Veronica again ....... she apologises for the dreadful things she said about my husband.',
             opts:['just as','when','until','by the time'],
             cor:'c', hint:'won\'t ... until → "özür dileyene kadar konuşmayacağım"'},
            {q:'The telephone rang much to our annoyance ....... we were about to eat our dinner.',
             opts:['just as','since','after','as soon as'],
             cor:'a', hint:'just as → "tam o sırada"; were about to eat (neredeyse yemeye başlıyorduk)'},
            {q:'....... the United Nations decided to act, it was too late to stop a huge civilian refugee problem in Kosova.',
             opts:['Since','Until','During','While','By the time'],
             cor:'e', hint:'By the time + Past Simple → Past Simple sonuç; karar alındığında çok geçti'},
            {q:'The defendant persistently maintained his innocence ....... the trial that continued for months.',
             opts:['while','during','as soon as','by the time'],
             cor:'b', hint:'during + isim (the trial) → "dava boyunca"; while + cümle gerektirir'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 61-70 (eşanlamlı cümle) ── */
    {
        label: 'Set 22',
        questions: [
            {q:'Julia has been painting a portrait of her mother for the last three weeks.',
             opts:['About three weeks ago, Julia painted a portrait of her mother.','Julia started painting her mother\'s portrait three weeks ago and hasn\'t finished yet.','The portrait Julia painted of her mother took three weeks to finish.','At the moment, Julia is painting her mother\'s portrait, which will probably take her three weeks to finish.'],
             cor:'b', hint:'has been painting for three weeks → başladı, bitirmedi; Present Perfect Continuous devam ediyor'},
            {q:'Though she is an intelligent and talented woman, her four marriages have all failed.',
             opts:['It is surprising that anyone with her talent and intelligence should have difficulty sustaining a marriage.','She believes that intelligence and talent do not necessarily lead to happiness in married life.','Perhaps she is too intellectual for men, because she does not seem able to remain married.','None of her four attempts at marriage has been successful in spite of her intellect and abilities.'],
             cor:'d', hint:'though + intelligent & talented → her four marriages failed = None of her attempts has been successful despite...'},
            {q:'The president was working continuously throughout his illness.',
             opts:['The president was so ill that he couldn\'t conduct affairs efficiently.','The president was able to handle most of his normal workload during his recent illness.','While he was ill, the president never stopped working.','His continuous illnesses mean that he is no longer fit enough to be president.'],
             cor:'c', hint:'was working continuously = never stopped working; throughout his illness → while he was ill'},
            {q:'The baby woke up again before I was half-way through cleaning and tidying the house.',
             opts:['I could do twice as much housework before I had the baby.','I usually do only half of my housework while the baby is asleep.','By the time the baby woke up, I had hardly finished the housework.','My housework wasn\'t half done when the baby woke up again.'],
             cor:'d', hint:'before I was half-way through = yarısını bile bitirememişken → My housework wasn\'t half done'},
            {q:'We last saw John just when he\'d decided on a radical change in his life.',
             opts:['When we met John again, we noticed that he had changed his life radically.','When we met John last month, he had just reached a major decision.','John was considering the possibility of doing something different when we last saw him.','We haven\'t seen John since the very moment that he expressed his decision to change his life completely.'],
             cor:'d', hint:'last saw = son görüşme; just when he\'d decided = kararın tam o anı → haven\'t seen since'},
            {q:'We had never lived abroad until we went to Africa for three years in the early 1990s.',
             opts:['When we went to Africa in the early 1990s for a period of three years, it was our first stay overseas.','We have plenty of experience of living abroad, because we stayed in Africa for three years in the early 1990s.','We were going to live in Africa for three years in the early 1990s, but we decided not to.','Three years after our first visit to Africa in the early 1990s, we wanted to go there again.'],
             cor:'a', hint:'had never lived abroad until... = ilk kez yurt dışında yaşamak; 1990s = first stay overseas'},
            {q:'As soon as I mentioned the price of the vase, the lady\'s face took on a disappointed expression.',
             opts:['The lady looked quite happy until she knew how much I had charged her for the vase.','The disappointment showed on the lady\'s face the moment I told her the cost of the vase.','It was obvious from the expression on the lady\'s face that she didn\'t want the vase because it was expensive.','I think the lady was disappointed because the vase was too expensive for her to buy.'],
             cor:'b', hint:'as soon as I mentioned = the moment I told her; face took on a disappointed expression = disappointment showed'},
            {q:'Once she had made her decision to quit her job, no one even tried to convince her to change her mind.',
             opts:['She decided to quit her job once, but her friends convinced her to change her mind.','There was no reason for anyone to try to convince her to change her mind after she made a decision.','There was not a single person who made the effort to persuade her not to quit her job after she had decided.','When she mentioned quitting her job, there was no one who said that it was a good decision.'],
             cor:'c', hint:'no one even tried to convince → not a single person made the effort to persuade; once she had decided'},
            {q:'He had studied English for years, but it was only when he arrived in London that he discovered how little he really knew.',
             opts:['By the time he arrived in London, he had forgotten most of the English that he had studied over the years.','He was glad that he had studied English before he went to London because every little bit he knew was useful.','He had been studying English for years, but he knew that it was still not enough for him to go to London.','Before he arrived in London, he had thought that he had learned more English than he actually had.'],
             cor:'d', hint:'discovered how little he really knew → he had thought he had learned more than he actually had'},
            {q:'She was surprised that, although her father had never smoked or eaten fatty foods, he had a heart attack.',
             opts:['To her amazement, her father didn\'t have a heart attack even though he was a heavy smoker.','She could not believe it when her father gave up smoking and eating fatty foods after his heart attack.','Because of her father\'s healthy diet, she feels certain that he\'ll never have a heart attack.','She didn\'t expect her father to have a heart attack because he had kept away from cigarettes and fatty foods all his life.'],
             cor:'d', hint:'surprised that... although never smoked → didn\'t expect because had kept away from cigarettes'},
        ]
    },
    /* ── TEST YOURSELF 2 — Sorular 71-80 (çeviri) ── */
    {
        label: 'Set 23',
        questions: [
            {q:'Bilim adamları, bir tümörü, normal hücrelere zarar vermeden sadece kanserli hücreleri öldürecek bir dereceye kadar ısıtma konusunda cesaret verici sonuçlar almışlardır.',
             opts:['Scientists have had encouraging results in heating a tumour to a temperature high enough to kill cancerous cells without harming normal cells.','Experiments by scientists in which they heat a tumour to kill cancerous cells have been quite successful.','Cancer sufferers are encouraged by scientists\' success of heating a tumour to kill cancerous cells without harming normal cells.','It\'s really encouraging that scientists have had some success with killing cancerous tumours by heating them.'],
             cor:'a', hint:'cesaret verici sonuçlar almışlardır → have had encouraging results; normal hücrelere zarar vermeden → without harming normal cells'},
            {q:'Çocukluğundan beri burada yaşadığı için babam kasabada oturanların hemen hepsini ismiyle tanır.',
             opts:['My father knows the names of most of the residents of the town where he lived when he was a child.','My father has lived here since his childhood, so most of the inhabitants of the town know him by name.','As my father has lived here since he was a child, he knows almost all the inhabitants of the town by name.','Because my father spent his childhood in this town, he knows the names of almost all the residents.'],
             cor:'c', hint:'çocukluğundan beri yaşadığı için → As he has lived since childhood; ismiyle tanır → knows by name'},
            {q:'1998\'de, Hindistan hükümeti nükleer silah denemesi yapmaya karar verince en büyük tepki, Hindistan\'ın ezeli rakibi Pakistan\'dan geldi.',
             opts:['Pakistan sharply criticised India for conducting nuclear weapons testing in 1998.','The sharpest criticism came from Pakistan, India\'s historic rival, when, in 1998, the Indian government decided to conduct nuclear weapons testing.','In 1998, the Indian government decided to conduct nuclear weapons testing, for which it was heavily criticised by its historic rival Pakistan.','Following their nuclear weapons testing in 1998, the Indian government was criticised by one of its greatest rivals, Pakistan.'],
             cor:'b', hint:'en büyük tepki → the sharpest criticism; ezeli rakip → historic rival; karar verince → when decided'},
            {q:'Okul müdürü, açılış konuşmasını yaparken bütün öğrenciler ve veliler sessizlik içinde onu dinledi.',
             opts:['While the headmaster made his opening speech, the students, as well as their parents, tried to keep quiet.','The students and parents remained silent as the headmaster made his opening speech.','The headmaster made his opening speech to the students and parents, who listened intently.','The school opened with a speech from the headmaster, which was listened to in silence by all the students and their parents.','As the headmaster made his opening speech, the students and the parents all listened to him in silence.'],
             cor:'e', hint:'yaparken → as (eş zamanlı); sessizlik içinde onu dinledi → listened to him in silence'},
            {q:'Bu dönem o kadar çok çalışıyorsun ki sınıf birincisi olman kesin gibi görünüyor.',
             opts:['I\'m sure you will finish top in the class because of your intense studying this term.','You\'re studying very hard this term, so I\'m sure that you\'ll become top of the class.','I wouldn\'t be surprised if you became top in the class as you\'ve been studying really hard this term.','You seem to be studying extremely hard this term in order to become top of the class.','You\'ve been studying so hard this term that it seems certain that you\'ll become top in the class.'],
             cor:'e', hint:'o kadar çok... ki → so... that; kesin gibi görünüyor → it seems certain; bu dönem → this term'},
            {q:'A harsh climate and rugged terrain have made the Norwegians look to the sea for their livelihood.',
             opts:['İklimin sert, arazinin engebeli olduğu Norveç\'te insanlar geçimlerini sağlamak için denize muhtaçtırlar.','Norveçliler, sert iklim ve engebeli arazi nedeniyle geçimlerini büyük ölçüde denizden sağlamak zorundadırlar.','Norveçlileri, geçimlerini sağlamak için denize yönelten sert iklim ve engebeli arazidir.','Sert iklim ve engebeli arazi Norveçlileri geçimlerini sağlamak için denize yöneltmiştir.'],
             cor:'d', hint:'have made the Norwegians look to the sea → denize yöneltmiştir; harsh climate → sert iklim'},
            {q:'Ancient Egyptians associated the river Nile with the worship of gods and the prosperity of the land.',
             opts:['Eski Mısırlılar Nil nehrini, tanrılara tapınma ve toprağın verimliliğiyle bütünleştirmişlerdir.','Eski Mısırlılar, tanrılarına tapınmak için toprağı verimli kılan Nil nehrine giderlerdi.','Eski Mısırlılar, toprağı verimli kıldığı için tanrı gibi gördükleri Nil nehrine taparlardı.','Eski Mısırlılar, toprağın verimliliğini Nil nehrine değil, tapındıkları tanrılara bağlıyorlardı.'],
             cor:'a', hint:'associated with → bütünleştirmişlerdir; worship of gods + prosperity of land'},
            {q:'We were going to have a picnic at the weekend, but this unexpected rain has spoilt all our plans.',
             opts:['Hafta sonu yapmayı planladığımız piknik bu beklenmedik yağmur yüzünden bozuldu.','Hafta sonu pikniğe gidecektik ama bu beklenmedik yağmur bütün planlarımızı bozdu.','Yağmurun yağacağını hiç beklemediğimiz için hafta sonu pikniğe gitmeyi planlıyorduk.','Bu beklenmedik yağmur planlarımızı bozmasaydı hafta sonu pikniğe gidecektik.'],
             cor:'b', hint:'were going to → gidecektik (gerçekleşmeyen plan); has spoilt all our plans → bütün planlarımızı bozdu'},
            {q:'Months after the graduation, he had still not found a job and begun to feel discouraged.',
             opts:['Cesareti kırılmaya başlamıştı; çünkü mezun olduktan aylar sonra hala bir iş bulamamıştı.','Mezuniyetten aylar sonra, tam bütün direncini kaybetmek üzereyken, bir iş buldu.','Mezuniyetin ardından aylar geçtiği halde hala bir iş bulamayınca cesareti kırıldı.','Mezuniyetten aylar sonra hala bir iş bulamamıştı ve cesareti kırılmaya başlamıştı.'],
             cor:'d', hint:'had still not found → hâlâ bulamamıştı; begun to feel discouraged → cesareti kırılmaya başlamıştı'},
            {q:'I have come across many unusual people during my travels abroad.',
             opts:['Sıra dışı insanlarla pek çok yurtdışı seyahatlerine katıldım.','Ne zaman yurtdışına seyahat etsem, sıradışı pek çok insanla karşılaşırdım.','Yurtdışı seyahatlerim sırasında pek çok sıradışı insanla karşılaştım.','Sıradışı insanlarla karşılaşmak için sık sık yurtdışına seyahat ederdim.'],
             cor:'c', hint:'have come across → karşılaştım; during my travels abroad → yurtdışı seyahatlerim sırasında'},
        ]
    },
];

/* ── Set state ── */
let _grSetIdx     = 0;
let _grSetScore   = 0;
let _grSetChecked = {};
let _grSetAnswers = {};
/* ════════════════════════════════════════════════════
   EXERCISES — Set tabanlı MCQ sistemi
════════════════════════════════════════════════════ */
function grExercises() {
    _grSetIdx     = 0;
    _grSetScore   = 0;
    _grSetChecked = {};
    _grSetAnswers = {};
    return _grBuildExercisePage();
}

function _grBuildExercisePage() {
    const set      = GR_SETS[_grSetIdx];
    const total    = set.questions.length;
    const setCount = GR_SETS.length;

    const tabs = GR_SETS.map((s, i) => {
        const active = i === _grSetIdx ? 'style="background:var(--red);color:#fff;border-color:var(--red);"' : '';
        return `<button class="gr-set-tab" ${active} onclick="grSwitchSet(${i})">${s.label}</button>`;
    }).join('');

    const qCards = set.questions.map((q, i) => {
        const opts = q.opts.map((o, j) => {
            const letter = ['A','B','C','D'][j];
            const lv     = ['a','b','c','d'][j];
            const state  = _grSetAnswers[`${_grSetIdx}_${i}`];
            let cls = 'gr-opt';
            if (_grSetChecked[`${_grSetIdx}_${i}`]) {
                if (lv === q.cor)                          cls += ' ok';
                else if (lv === state && state !== q.cor)  cls += ' bad';
            } else if (state === lv) cls += ' sel';
            return `<div class="${cls}" id="grso-${i}-${j}" onclick="grSetOpt(${i},${j},'${lv}')">
                <span class="gr-opt-letter">${letter}</span>${o}
            </div>`;
        }).join('');

        const checked = _grSetChecked[`${_grSetIdx}_${i}`];
        const fbCls   = checked ? (checked === 'ok' ? 'gr-fb show ok' : 'gr-fb show bad') : 'gr-fb';
        const fbTxt   = checked === 'ok'  ? `✅ Doğru! ${q.hint}`
                      : checked === 'bad' ? `❌ Yanlış. Doğru: ${q.cor.toUpperCase()} — ${q.hint}` : '';
        const cardCls = checked === 'ok' ? 'gr-q-card gr-c' : checked === 'bad' ? 'gr-q-card gr-w' : 'gr-q-card';
        const btnDis  = checked ? 'disabled style="opacity:.4;pointer-events:none;"' : '';

        return `<div class="${cardCls}" id="grsc-${i}">
            <div class="gr-q-num">SORU ${String(i+1).padStart(2,'0')} — ${set.label.toUpperCase()}</div>
            <div class="gr-q-text">${q.q}</div>
            <div class="gr-mcq">${opts}</div>
            <button class="gr-chk-btn" style="margin-top:10px" onclick="grCheckSetQ(${i})" ${btnDis}>Kontrol Et</button>
            <div class="${fbCls}" id="grsfb-${i}">${fbTxt}</div>
        </div>`;
    }).join('');

    return grHero('✨ Pratik Yap', 'gr-hero-default', 'Alıştırmalar',
        `${setCount} set × 10 soru — Seti tamamla, sonucu gör, sıradaki sete geç.`)
    + `<div class="gr-quiz-wrap">
        <div class="gr-set-tabs">${tabs}</div>
        <div class="gr-score-bar">
            <span class="gr-score-label">${set.label} Puanı</span>
            <span class="gr-score-val" id="gr-live-score">${_grSetScore} / ${total}</span>
        </div>
        ${qCards}
        <button class="gr-submit-btn" onclick="grSubmitSet()">🎯 Seti Değerlendir & Sonucu Gör</button>
        <div class="gr-result" id="gr-result">
            <div class="gr-res-score" id="gr-res-score">0/${total}</div>
            <div class="gr-res-lbl">${set.label} Tamamlandı</div>
            <div class="gr-res-msg" id="gr-res-msg"></div>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px">
                <button class="gr-retry-btn" onclick="grRetrySameSet()">🔄 Aynı Seti Tekrar</button>
                ${_grSetIdx < GR_SETS.length - 1
                    ? `<button class="gr-retry-btn" style="background:var(--red);color:#fff;border-color:var(--red)" onclick="grNextSet()">Sonraki Set →</button>`
                    : `<span style="font-size:.8rem;color:var(--ink3);align-self:center">🏁 Tüm setler tamamlandı!</span>`}
            </div>
        </div>
    </div>`;
}

function grSwitchSet(idx) {
    _grSetIdx     = idx;
    _grSetScore   = 0;
    _grSetChecked = {};
    _grSetAnswers = {};
    const cnt = document.getElementById('gr-content');
    if (cnt) { cnt.innerHTML = _grBuildExercisePage(); cnt.scrollTop = 0; }
}

function grSetOpt(qi, oi, letter) {
    if (_grSetChecked[`${_grSetIdx}_${qi}`]) return;
    const set = GR_SETS[_grSetIdx];
    set.questions[qi].opts.forEach((_, j) => {
        const el = document.getElementById(`grso-${qi}-${j}`);
        if (el) el.className = 'gr-opt' + (j === oi ? ' sel' : '');
    });
    _grSetAnswers[`${_grSetIdx}_${qi}`] = letter;
}

function grCheckSetQ(qi) {
    const q    = GR_SETS[_grSetIdx].questions[qi];
    const sel  = _grSetAnswers[`${_grSetIdx}_${qi}`];
    const fb   = document.getElementById(`grsfb-${qi}`);
    const card = document.getElementById(`grsc-${qi}`);
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    const letters = ['a','b','c','d'];
    q.opts.forEach((_, j) => {
        const el = document.getElementById(`grso-${qi}-${j}`);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor)                     el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    const btn = card.querySelector('.gr-chk-btn');
    if (btn) { btn.disabled = true; btn.style.opacity = '.4'; btn.style.pointerEvents = 'none'; }
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = `✅ Doğru! ${q.hint}`;
        fb.className = 'gr-fb show ok';
        _grSetChecked[`${_grSetIdx}_${qi}`] = 'ok';
        _grSetScore++;
    } else {
        card.classList.add('gr-w');
        fb.textContent = `❌ Yanlış. Doğru: ${q.cor.toUpperCase()} — ${q.hint}`;
        fb.className = 'gr-fb show bad';
        _grSetChecked[`${_grSetIdx}_${qi}`] = 'bad';
    }
    const el = document.getElementById('gr-live-score');
    if (el) el.textContent = `${_grSetScore} / ${GR_SETS[_grSetIdx].questions.length}`;
}

function grSubmitSet() {
    const set   = GR_SETS[_grSetIdx];
    const total = set.questions.length;
    const panel = document.getElementById('gr-result');
    if (!panel) return;
    panel.classList.add('show');
    document.getElementById('gr-res-score').textContent = `${_grSetScore}/${total}`;
    const pct = Math.round((_grSetScore / total) * 100);
    document.getElementById('gr-res-msg').textContent =
        pct >= 90 ? '🎉 Mükemmel! Bu seti harika geçirdin!'
      : pct >= 70 ? '👏 Çok iyi! Küçük eksikler var, bir daha dene.'
      : pct >= 50 ? '📚 Orta düzey. Eksik konulara geri dön.'
      :             '💪 Daha fazla pratik gerekiyor. Notlara bak ve tekrar dene!';
    if (typeof saveGrammarScore === 'function') saveGrammarScore('gr', _grSetScore);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function grRetrySameSet() { grSwitchSet(_grSetIdx); }
function grNextSet()      { if (_grSetIdx < GR_SETS.length - 1) grSwitchSet(_grSetIdx + 1); }


/* ════════════════════════════════════════════════════
   EXPOSE GLOBALS
════════════════════════════════════════════════════ */
// openGrammarSection ve _grRenderSection: _initGrammarModule içinde atandı
window.grSetOpt       = grSetOpt;
window.grCheckSetQ    = grCheckSetQ;
window.grSubmitSet    = grSubmitSet;
window.grSwitchSet    = grSwitchSet;
window.grRetrySameSet = grRetrySameSet;
window.grNextSet      = grNextSet;

(function _initGrammarModule() {
    // cat → display label eşlemesiyle sections'ı dönüştür
    const mappedSections = GR_SECTIONS.map(s => ({
        ...s,
        grp: GR_SECS_LABELS[s.cat] ?? s.cat ?? 'Genel'
    }));

    // dotColors: grp label → renk
    const dotColors = {};
    Object.entries(GR_DOTS).forEach(([cat, color]) => {
        const label = GR_SECS_LABELS[cat] ?? cat;
        dotColors[label] = color;
    });

    // grpOrder: GR_SEC_ORDER → display label sırasıyla
    const grpOrder = GR_SEC_ORDER.map(cat => GR_SECS_LABELS[cat] ?? cat);

    const _mod = new GrammarModule({
        id:       'gr',
        pageId:   'grammar-page',
        sbId:     'sb-grammar-tenses',
        diId:     'di-grammar-tenses',
        title:    'English Tenses',
        sections: mappedSections,
        dotColors,
        grpOrder,
        sectionMap: {
            'overview':         () => grOverview(),
            'simple-present':   () => grSimplePresent(),
            'pres-cont':        () => grPresCont(),
            'pres-perf':        () => grPresPerf(),
            'pres-perf-cont':   () => grPresPerfCont(),
            'simple-past':      () => grSimplePast(),
            'past-cont':        () => grPastCont(),
            'past-perf':        () => grPastPerf(),
            'past-perf-cont':   () => grPastPerfCont(),
            'simple-future':    () => grSimpleFuture(),
            'future-cont':      () => grFutureCont(),
            'future-perf':      () => grFuturePerf(),
            'future-perf-cont': () => grFuturePerfCont(),
            'modals':           () => grModals(),
            'tips':             () => grTips(),
            'exercises':        () => grExercises()
        },
        onSectionRender(id) {
            // sb-sub-item active state — grammar.js'e özgü ek davranış
            document.querySelectorAll('.sb-sub-item').forEach(b => {
                b.classList.toggle('active',
                    b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${id}'`));
            });
            if (id === 'exercises') {
                _grScore = 0; _grAnswers = {}; _grChecked = {};
                _grUpdScore();
            }
        }
    });

    window.openGrammarSection = (sectionId) => _mod.open(sectionId || 'overview');
    window._grRenderSection   = (id)        => _mod.goTo(id);
    window['_grGoTo']         = (id)        => _mod.goTo(id);
})();
