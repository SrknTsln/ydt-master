// ════════════════════════════════════════════════════════════════
// conditionals.js  —  Conditionals & Wish Clauses Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Conditionals-Wish Clauses notları (s. 46–53)
// ════════════════════════════════════════════════════════════════

let _cnCurrentSection = 'overview';
let _cnAnswers = {};
let _cnChecked = {};
let _cnScore = 0;
const CN_TOTAL = 15;

const CN_SECTIONS = [
    { id: 'overview',    label: 'Genel Bakış',              grp: 'Genel' },
    { id: 'type0',       label: 'Type 0 — Genel Gerçekler', grp: 'Conditionals' },
    { id: 'type1',       label: 'Type 1 — Gelecek Olasılık',grp: 'Conditionals' },
    { id: 'type2',       label: 'Type 2 — Hayal / Şimdi',  grp: 'Conditionals' },
    { id: 'type3',       label: 'Type 3 — Geçmiş Varsayım',grp: 'Conditionals' },
    { id: 'mixed1',      label: 'Mixed Type 1 (3+2)',       grp: 'Conditionals' },
    { id: 'mixed2',      label: 'Mixed Type 2 (2+3)',       grp: 'Conditionals' },
    { id: 'inversion',   label: 'Inversion (Devrik)',        grp: 'Conditionals' },
    { id: 'other-words', label: 'Diğer Bağlaçlar',          grp: 'Conditionals' },
    { id: 'wish',        label: 'Wish Clauses',              grp: 'Wish' },
    { id: 'tips',        label: 'Soru İpuçları',             grp: 'Özel' },
    { id: 'exercises',   label: 'Alıştırmalar',              grp: 'Özel' }
];

const CN_DOT = {
    'Genel': '#6366f1',
    'Conditionals': '#0369a1',
    'Wish': '#7e22ce',
    'Özel': '#e63946'
};

/* ════════ ENTRY POINT — GrammarModule engine ════════ */

/* ════════ HELPERS ════════ */
/* ════════ ENTRY POINT ════════ */
function cnH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#0c1445 0%,#0369a1 60%,#0ea5e9 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function cnSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function cnTable(headers, rows) {
    const ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    const trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function cnAcc(items) {
    const cards = items.map(function(it) {
        const exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #0369a1"><span class="gr-ex-n">'
                + String(i+1).padStart(2,'0') + '</span>' + ex + '</div>';
        }).join('');
        const descHtml = it.desc ? '<p class="gr-acc-desc">' + it.desc + '</p>' : '';
        return '<div class="gr-acc" data-toggle-class="open">'
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

function cnBox(color, title, lines) {
    const styles = {
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239'
    };
    const content = lines.map(function(l){ return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>'; }).join('');
    return '<div style="' + (styles[color]||styles.sky) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 8px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

/* ════════ OVERVIEW ════════ */
function cnOverview() {
    const cards = [
        {id:'type0',       emoji:'🟢', name:'Type 0',      sub:'Genel gerçekler, bilimsel olgular',          tc:'#065f46', bc:'#dcfce7', bd:'#6ee7b7'},
        {id:'type1',       emoji:'🔵', name:'Type 1',      sub:'Gerçek / olası gelecek koşullar',            tc:'#1e3a8a', bc:'#dbeafe', bd:'#93c5fd'},
        {id:'type2',       emoji:'🟡', name:'Type 2',      sub:'Hayal / şimdiki zamanda gerçek dışı',        tc:'#713f12', bc:'#fef9c3', bd:'#fcd34d'},
        {id:'type3',       emoji:'🔴', name:'Type 3',      sub:'Geçmişte gerçekleşmemiş varsayımlar',        tc:'#9f1239', bc:'#fff1f2', bd:'#fca5a5'},
        {id:'mixed1',      emoji:'🟠', name:'Mixed Type 1',sub:'Geçmişte olsaydı → şimdi olurdu (3+2)',      tc:'#7c2d12', bc:'#ffedd5', bd:'#fdba74'},
        {id:'mixed2',      emoji:'🟤', name:'Mixed Type 2',sub:'Şimdi şu olsaydı → geçmişte şu olurdu (2+3)',tc:'#292524', bc:'#f5f5f4', bd:'#a8a29e'},
        {id:'inversion',   emoji:'🔃', name:'Inversion',   sub:'If yerine devrik yapı: Should / Were / Had', tc:'#1e3a8a', bc:'#eff6ff', bd:'#bfdbfe'},
        {id:'other-words', emoji:'🔗', name:'Diğer Bağlaçlar', sub:'unless, even if, in case, suppose, but for…', tc:'#1e3a8a', bc:'#eff6ff', bd:'#93c5fd'},
        {id:'wish',        emoji:'✨', name:'Wish Clauses', sub:'Dilek / pişmanlık: present, past, future',  tc:'#4c1d95', bc:'#f5f3ff', bd:'#c4b5fd'},
    ];
    const cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.bd + ';border-radius:14px;padding:16px;background:' + c.bc + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' data-action="_cnRenderSection(\'' + c.id + '\')">'
            + '<div style="font-size:1.4rem;margin-bottom:8px">' + c.emoji + '</div>'
            + '<div style="font-size:.95rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">' + c.name + '</div>'
            + '<div style="font-size:.73rem;color:' + c.tc + ';line-height:1.5">' + c.sub + '</div>'
            + '</div>';
    }).join('');

    return cnH('🔀 Koşul & Dilek', 'Conditionals & Wish Clauses', 'Türkçedeki "-sa/-se, eğer, keşke" anlamlarını veren yapılar. 5 tip conditional + Wish Clauses.')
    + cnSH('Hızlı Referans — Tüm Tipler')
    + cnTable(
        ['Tip','If Clause','Main Clause','Kullanım'],
        [
            ['<strong>Type 0</strong>','simple present','simple present','Genel gerçekler'],
            ['<strong>Type 1</strong>','simple present / pres. cont. / pres. perf.','will / modals + V₁','Gerçek gelecek olasılık'],
            ['<strong>Type 2</strong>','simple past / past cont. / past modals','would/could/might + V₁','Hayal / şimdi gerçek dışı'],
            ['<strong>Type 3</strong>','past perfect / past perf. cont. / could have V₃','would/could/might have V₃','Geçmiş varsayım'],
            ['<strong>Mixed 1</strong><br>(3+2)','past perfect / had been Ving / could have V₃ / had been able to V₁','would/could/might V₁ / Ving','"Geçmişte olsaydı, şimdi…"'],
            ['<strong>Mixed 2</strong><br>(2+3)','simple past / past cont. / could V₁ / had to V₁','would/could/might have V₃','"Şimdi şu olsaydı, geçmişte…"'],
        ]
    )
    + '<div style="padding:0 36px 36px;text-align:center;margin-top:16px;"><button data-action="_cnRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#0369a1,#0ea5e9);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button></div>';
}

/* ════════ TYPE 0 ════════ */
function cnType0() {
    return cnH('🟢 Type 0', 'If Type 0 — Genel Gerçekler', 'If + Simple Present + Simple Present. Genel geçer durumlar ve bilimsel gerçekler için kullanılır.')
    + cnBox('green','📐 Formül',[
        'If + <strong>Simple Present</strong>  →  <strong>Simple Present</strong>',
    ])
    + cnAcc([{ico:'🟢', bg:'rgba(5,150,105,.12)', title:'Type 0 Örnekleri',
        desc:'Genel geçer durum ve olaylardan, bilimsel gerçeklerden bahsederken kullanılır.',
        examples:[
            'If you <strong>don\'t</strong> water plants, they <strong>die</strong>.',
            'If you <strong>drop</strong> an object, it <strong>falls</strong> to the ground.',
        ]}]);
}

/* ════════ TYPE 1 ════════ */
function cnType1() {
    return cnH('🔵 Type 1', 'If Type 1 — Gerçek Olasılık', 'Günümüzde veya gelecekte bir şarta bağlı olarak gerçekleşmesi muhtemel durumlar.')
    + cnBox('sky','📐 Formül',[
        'If + <strong>Simple Present / Pres. Cont. / Pres. Perfect / Pres. Modals</strong>',
        '→  <strong>will / present modals + V₁</strong>',
    ])
    + cnAcc([{ico:'🔵', bg:'rgba(3,105,161,.12)', title:'Type 1 Örnekleri',
        examples:[
            'If you <strong>study</strong> hard, you <strong>will pass</strong> the exam.',
            'If we <strong>have finished</strong> the project, we <strong>are presenting</strong> it to the clients.',
            'If the teacher <strong>can</strong> fix the issue, she <strong>will continue</strong> the lesson.',
        ]}])
    + cnBox('yellow','⭐ ÖSYM SEVER! — Inversion of Type 1',[
        '"If" yerine <strong>"should"</strong> kullanılarak cümle devrik hale getirilir.',
        '',
        '• If she finish her homework, she can join us for dinner.',
        '→ <strong>Should</strong> she finish her homework, she can join us for dinner.',
    ]);
}

/* ════════ TYPE 2 ════════ */
function cnType2() {
    return cnH('🟡 Type 2', 'If Type 2 — Hayal / Şimdiki Gerçek Dışı', 'Mevcut durumda hayali ve gelecekte olması mümkün olmayan durumlardan bahsederken kullanılır.')
    + cnBox('sky','📐 Formül',[
        'If + <strong>Simple Past / Past Continuous / Past Modals (could, had to)</strong>',
        '→  <strong>would / could / might + V₁</strong>',
    ])
    + cnAcc([{ico:'🟡', bg:'rgba(202,138,4,.12)', title:'Type 2 Örnekleri',
        desc:'Past simple ile kurulsa da mevcut (present) durumda yaşanan olaylar üzerine konuşulur.',
        examples:[
            'If I <strong>had</strong> more money, I <strong>would visit</strong> more countries. (I haven\'t got money)',
            'If I <strong>were</strong> you, I <strong>would apologize</strong>.',
            'If they <strong>didn\'t use</strong> so much internet, they <strong>could have</strong> a more fun time.',
        ]}])
    + cnBox('yellow','⭐ ÖSYM SEVER! — Inversion of Type 2',[
        'Cümlede "be" fiili varsa "if" yerine <strong>"were"</strong> kullanılarak cümle devrik hale getirilir.',
        '"be" fiili yoksa <strong>"were to V₁"</strong> şeklinde kullanılır.',
        '',
        '• If I <strong>were</strong> you, I would save money for the Erasmus+ project.',
        '→ <strong>Were</strong> I you, I would save money for the Erasmus+ project.',
        '',
        '• If I <strong>spoke</strong> better German, I would study in Germany.',
        '→ <strong>Were</strong> I <strong>to speak</strong> better German, I would study in Germany.',
    ]);
}

/* ════════ TYPE 3 ════════ */
function cnType3() {
    return cnH('🔴 Type 3', 'If Type 3 — Geçmiş Varsayım', 'Geçmişte gerçekleşmeyen bir olaydan bahsederken kullanılır. "...olsaydı, olurdu" anlamı katar.')
    + cnBox('sky','📐 Formül',[
        'If + <strong>Past Perfect / Past Perfect Cont. / Could Have V₃ / Had been able to V₁</strong>',
        '→  <strong>would / could / might have V₃</strong>',
    ])
    + cnAcc([{ico:'🔴', bg:'rgba(220,38,38,.12)', title:'Type 3 Örnekleri',
        desc:'Geçmişte gerçekleşmeyen bir olaydan bahsedilir. Günümüzle hiçbir ilgisi yoktur; "Geçmişteki varsayımlar" diyebiliriz.',
        examples:[
            'If we <strong>had known</strong> the application date for the Erasmus+ project, we <strong>would have consulted</strong> our teacher.',
            'I <strong>could have made</strong> a cake for you if you <strong>had called</strong> me before you came.',
        ]}])
    + cnBox('yellow','⭐ ÖSYM SEVER! — Inversion of Type 3',[
        '"If" yerine <strong>"had"</strong> kullanılarak cümle devrik hale getirilir.',
        '',
        '• If she <strong>had taken</strong> the job offer, she might have lived in a different city now.',
        '→ <strong>Had</strong> she <strong>taken</strong> the job offer, she might have lived in a different city now.',
    ]);
}

/* ════════ MIXED TYPE 1 ════════ */
function cnMixed1() {
    return cnH('🟠 Mixed Type 1', 'Mixed Type 1 (Type 3 + Type 2)', '"Geçmişte şu olsaydı, bugün/şu an bu olurdu" — If clause geçmişe, main clause şimdiye bakar.')
    + cnBox('sky','📐 Formül',[
        'If + <strong>Had V₃ / Had been Ving / Could have V₃ / Had been able to V₁</strong>',
        '→  <strong>would / could / might V₁ / Ving</strong>',
        '',
        'Zaman ifadesi: <strong>"at the moment, now, today"</strong> gibi ifadeler kullanılabilir.',
    ])
    + cnAcc([{ico:'🟠', bg:'rgba(194,65,12,.12)', title:'Mixed Type 1 Örnekleri',
        examples:[
            'If you <strong>had studied</strong> more, you <strong>could understand</strong> this better.',
            'If you <strong>hadn\'t jumped</strong> from a high point, your leg <strong>wouldn\'t be broken</strong> now.',
        ]}]);
}

/* ════════ MIXED TYPE 2 ════════ */
function cnMixed2() {
    return cnH('🟤 Mixed Type 2', 'Mixed Type 2 (Type 2 + Type 3)', '"Bugün şu olsaydı, geçmişte bu olurdu" — If clause şimdiye, main clause geçmişe bakar.')
    + cnBox('sky','📐 Formül',[
        'If + <strong>Simple Past / Past Continuous / Could V₁ / Had to V₁</strong>',
        '→  <strong>would / could / might have V₃</strong>',
    ])
    + cnAcc([{ico:'🟤', bg:'rgba(120,53,15,.12)', title:'Mixed Type 2 Örnekleri',
        examples:[
            'If I <strong>were</strong> a minister of education, I <strong>could have created</strong> more seminars for students.',
            'If you <strong>visited</strong> Italy last summer, you <strong>might have seen</strong> the Pisa Tower.',
        ]}]);
}

/* ════════ INVERSION ════════ */
function cnInversion() {
    return cnH('🔃 Devrik Yapı', 'Inversion — Cümle Devrik Hale Getirme', '"If" yerine kullanılan devrik yapılar. ÖSYM\'nin sevdiği yapılar.')
    + cnTable(['Tip','Normal','Devrik (Inversion)'],[
        ['<strong>Type 1</strong>','If she <strong>finish</strong> her homework, she can join us.','<strong>Should</strong> she finish her homework, she can join us.'],
        ['<strong>Type 2 (be)</strong>','If I <strong>were</strong> you, I would save money.','<strong>Were</strong> I you, I would save money.'],
        ['<strong>Type 2 (diğer)</strong>','If I <strong>spoke</strong> better German, I would study there.','<strong>Were</strong> I <strong>to speak</strong> better German, I would study there.'],
        ['<strong>Type 3</strong>','If she <strong>had taken</strong> the job offer, she might have lived there.','<strong>Had</strong> she <strong>taken</strong> the job offer, she might have lived there.'],
    ])
    + cnBox('yellow','⭐ ÖSYM SEVER! — Özet',[
        'Type 1 devrik: <strong>Should + özne + V₁</strong>',
        'Type 2 devrik (be ile): <strong>Were + özne</strong>',
        'Type 2 devrik (be olmadan): <strong>Were + özne + to + V₁</strong>',
        'Type 3 devrik: <strong>Had + özne + V₃</strong>',
    ]);
}

/* ════════ OTHER CONDITIONAL WORDS ════════ */
function cnOtherWords() {
    return cnH('🔗 Diğer Bağlaçlar', 'Other Conditional Words & Phrases', 'If\'in yerine kullanılabilen diğer koşul bağlaçları ve özel yapılar.')
    + cnAcc([
        {ico:'1️⃣', bg:'rgba(3,105,161,.12)', title:'Provided / Providing (that) / As long as / Only if / On condition that',
         desc:'"...şartıyla, koşuluyla, -dığı sürece" anlamında kullanılır. Fakat <strong>"only if"</strong> yapısı başa geldiğinde ana cümle devrik (inversion) yapıda kurulur.',
         examples:[
            'I will lend you the money <strong>only if</strong> you agree to repay it by the end of the month.',
            'I will lend you the money <strong>on condition that</strong> / <strong>provided (that)</strong> / <strong>as long as</strong> you agree to repay it.',
            '<strong>Only if</strong> you agree to repay it by the end of the month <strong>will I</strong> lend you the money. (devrik)',
         ]},
        {ico:'2️⃣', bg:'rgba(3,105,161,.10)', title:'Unless / Even if / In case',
         desc:[
            '"<strong>Unless</strong>" → olumsuz anlam taşır → "-mazsa, -mezse" anlamına gelir.',
            '"<strong>Even if</strong>" → "…sa bile" anlamına gelerek sonucun değişmeyeceğini ifade eder.',
            '"<strong>In case</strong>" → "…olursa, -sa diye" anlamında; ardından tam cümle (SVO) ve zaman uyumu ister.',
         ].join('<br>'),
         examples:[
            'You <strong>won\'t</strong> pass the exam <strong>unless</strong> you work harder.',
            '<strong>Even if</strong> you work harder, you won\'t pass the exam.',
            'I\'ll bring an umbrella <strong>in case</strong> it starts raining.',
         ]},
        {ico:'3️⃣', bg:'rgba(124,58,237,.10)', title:'Suppose / Supposing (that) / Imagine / Imagining (that) / What if',
         desc:'"Varsayalım ki… / Diyelim ki… / Ya… olursa?" anlamlarına gelir. Ana cümlesi soru şeklinde olur.',
         examples:[
            '<strong>Suppose</strong> / Imagine you win the lottery. What will you do with the money? (Type 1)',
            '<strong>Suppose</strong> / Imagine you won the lottery. What would you do with the money? (Type 2)',
            '<strong>Suppose</strong> / Imagine you had won the lottery. What would you have done? (Type 3)',
            '<strong>What if</strong> I arrive late? Will the date be postponed?',
         ]},
        {ico:'4️⃣', bg:'rgba(3,105,161,.12)', title:'But for / If it weren\'t for / If it hadn\'t been for',
         desc:[
            '"<strong>But for</strong>" + noun/Ving → "olmasa, olmasaydı".',
            '"<strong>If it weren\'t for</strong>" + noun → Type 2 → şimdiki için "olmasa".',
            '"<strong>If it hadn\'t been for</strong>" + noun → Type 3 → geçmişteki için "olmasaydı".',
            '"But for" her iki anlamı da kapsar; sonuç cümlesi Type\'a göre çekimlenir.',
         ].join('<br>'),
         examples:[
            '<strong>If it weren\'t for</strong> the traffic, we could arrive at school earlier.',
            '<strong>If it hadn\'t been for</strong> the traffic, we could have arrived at school earlier.',
            '<strong>But for</strong> the traffic, we could arrive at school earlier.',
            '<strong>But for</strong> the traffic, we could have arrived at school earlier.',
         ]},
        {ico:'5️⃣', bg:'rgba(230,57,70,.10)', title:'Or / Or else / Otherwise',
         desc:'"Ya da / yoksa / aksi takdirde" anlamlarına gelir.',
         examples:[
            'Finish your presentation, <strong>or else</strong> you won\'t be able to pass the class.',
            'You need to submit the project by next week; <strong>otherwise</strong>, there will be consequences.',
         ]},
    ]);
}

/* ════════ WISH CLAUSES ════════ */
function cnWish() {
    return cnH('✨ Dilek Kipleri', 'Wish Clauses', '"Wish" ve "If only" yapıları dilek veya pişmanlıklarımızı ifade ederken kullanılır. Kesinlikle "present" ifadeler kullanılmaz.')
    + cnBox('purple','📌 Temel Kural',[
        '"Wish" ve "If only" yapıları kullanılırken kesinlikle <strong>"present"</strong> ifadeler kullanılmaz.',
        'Çünkü gerçek dışı bir olaydan bahsedilir.',
    ])
    + cnSH('1. Wishes in the Present Time')
    + cnAcc([{ico:'🟡', bg:'rgba(124,58,237,.12)', title:'Şimdiki Zamanda Dilek / Pişmanlık',
        desc:'Günümüzdeki dilek veya pişmanlıklarımızı ifade ederken kullanılır. Cümle <strong>"simple past – past continuous"</strong> yapıları ile kurulur.',
        examples:[
            'I wish I <strong>were</strong> as successful as you are. (Keşke senin kadar başarılı olsaydım)',
            'Sue wishes she <strong>didn\'t have</strong> so much homework.',
        ]}])
    + cnSH('2. Wishes in the Past Time')
    + cnAcc([{ico:'🔴', bg:'rgba(124,58,237,.10)', title:'Geçmiş Zamanda Dilek / Pişmanlık',
        desc:'Geçmişteki dilek veya pişmanlıklarımızı ifade ederken kullanılır. Cümle <strong>"past perfect – past perfect continuous"</strong> yapıları ile kurulur.',
        examples:[
            'I wish I <strong>had studied</strong> harder for the exam.',
            'She wishes she <strong>had been working out</strong> regularly before the contest.',
        ]}])
    + cnSH('3. Wishes in the Future Time')
    + cnAcc([{ico:'🔵', bg:'rgba(124,58,237,.08)', title:'Gelecek Zamanda Dilek / Hoşnutsuzluk',
        desc:'Gelecekte olması beklenen bir eylem ya da durumla ilgili hoşnutsuzluk veya yakınma ifade ederken kullanılır. İçinde bulunduğumuz durumu bir başkasının değiştirmesini istiyorsak <strong>"would"</strong> kullanırız. Fakat iki cümlenin de öznesi aynı ise <strong>"simple past"</strong> ya da <strong>"could"</strong> kullanırız.',
        examples:[
            'I wish you <strong>would help</strong> me. (Özneler farklı)',
            'I wish I <strong>could study</strong> more for the exam. (Özneler aynı)',
        ]}])
    + cnBox('red','⚠️ ÖSYM İpucu — Wish Yapısında Dikkat!',[
        '• Wish yapısı asla <strong>"present"</strong> ifadelerle kullanılmaz.',
        '• Wish yapısında özneler aynıysa <strong>"would"</strong> kullanılmaz.',
    ]);
}

/* ════════ TIPS ════════ */
function cnTips() {
    const tips = [
        {num:'01', title:'If yapısının cümle başında mı, ortasında mı olduğuna bak.',
         rules:[{ico:'💡', text:'"whether or not" anlamına gelen "if" ile koşul bildiren "if" karıştırılmamalıdır. Cümle ortasındaki "if" → whether or not anlamı taşıyabilir.'}]},
        {num:'02', title:'If yanına asla "will, would, be going to, used to" almaz.',
         rules:[{ico:'🚫', text:'If clause içinde will, would, be going to, used to yapıları KULLANILMAZ. Şıklarda varsa elenir.'}]},
        {num:'03', title:'Zaman uyumuna bakılır.',
         rules:[{ico:'💡', text:'If clause ile main clause\'un hangi zamanlarda olduğuna dikkat et: Type belirlemek için önce if clause\'a bak.'}]},
        {num:'04', title:'If yapısında ikinci taraf Type 0 hariç "modals" alabilir.',
         rules:[
            {ico:'✅', text:'Type 1: will / can / may / might / should + V₁'},
            {ico:'✅', text:'Type 2: would / could / might + V₁'},
            {ico:'✅', text:'Type 3: would / could / might + have V₃'},
         ]},
        {num:'05', title:'Wish yapısı asla "present" ifadelerle kullanılmaz.',
         rules:[
            {ico:'🚫', text:'I wish I <s>am</s> rich. ❌'},
            {ico:'✅', text:'I wish I <strong>were</strong> rich. ✅ (simple past kullanılır)'},
         ]},
        {num:'06', title:'Wish yapısında özneler aynıysa "would" kullanılmaz.',
         rules:[
            {ico:'🚫', text:'I wish I <s>would study</s> more. ❌ (özne aynı: I - I)'},
            {ico:'✅', text:'I wish I <strong>could study</strong> more. ✅'},
            {ico:'✅', text:'I wish you <strong>would help</strong> me. ✅ (özneler farklı: I - you)'},
         ]},
    ];
    const cards = tips.map(function(t) {
        const rules = t.rules.map(function(r) {
            return '<div style="display:flex;gap:10px;padding:9px 13px;background:#f7f7fb;border-radius:10px;margin-top:7px;font-size:.82rem;color:#374151;line-height:1.6;">'
                + '<span style="flex-shrink:0;margin-top:1px">' + r.ico + '</span>' + r.text + '</div>';
        }).join('');
        return '<div style="background:#fff;border:1.5px solid #ebebf0;border-radius:14px;overflow:hidden;margin-bottom:10px;" data-toggle-child=".cn-tb" data-toggle-child-class="cn-hidden">'
            + '<div style="display:flex;align-items:center;gap:12px;padding:13px 18px;background:#f7f7fb;cursor:pointer;">'
            + '<span style="font-size:.6rem;font-weight:900;color:#0369a1;background:#eff6ff;border-radius:7px;padding:3px 9px;flex-shrink:0;font-family:\'Courier New\',monospace;">İPUCU ' + t.num + '</span>'
            + '<span style="flex:1;font-size:.87rem;font-weight:800;color:#1a1a2e">' + t.title + '</span>'
            + '<span style="font-size:.9rem;color:#767687">⌄</span>'
            + '</div>'
            + '<div class="cn-tb" style="padding:16px 20px;">' + rules + '</div>'
            + '</div>';
    }).join('');
    return cnH('🎯 Soru Çözme', 'Soru Çözerken İpuçları', '6 kritik ipucu — ÖSYM ve YDT sınavlarında Conditionals & Wish sorularını çözerken dikkat et.')
        + '<div style="padding:24px 36px 36px">' + cards + '</div>';
}

/* ════════ EXERCISES — SET SİSTEMİ ════════ */
const CN_SETS = [
    {
        label: 'Set 1',
        questions: [
            {q:'If I were you, I ___ a new car instead of struggling with this old one.',
             opts:['have bought','was buying','had bought','would buy','bought'],
             cor:'d', hint:'Type 2: If + simple past → would + V₁'},
            {q:'It\'s not long now before I start my new job. I wish we ___ a suitable house for sale there, but it seems that we may have to hire one temporarily.',
             opts:['have found','could find','can find','will find','find'],
             cor:'b', hint:'Wish present: could + V₁ (şimdiki gerçek dışı dilek)'},
            {q:'I wish I ___ you at the airport myself, but I had a meeting with the production team.',
             opts:['can meet','could have met','have met','would meet','meet'],
             cor:'b', hint:'Wish past: could have + V₃ (geçmiş pişmanlık)'},
            {q:'Take a couple of extra traditional Turkish gifts with you to Germany in case you ___ any other members of the Scholz family during your stay.',
             opts:['meet','had met','were meeting','met','will meet'],
             cor:'a', hint:'"in case" + simple present (gelecek olasılık)'},
            {q:'If you give me your tape recorder in plenty of time, then, of course, I ___ the lecture for you on the day of your Aunt\'s funeral.',
             opts:['recorded','had recorded','would have recorded','have recorded','will record'],
             cor:'e', hint:'Type 1: If + simple present → will + V₁'},
            {q:'If I ___ you would be on your own all weekend, I ___ you over to our house.',
             opts:['know / have invited','have known / was going to invite','had known / would have invited','knew / will have invited','will know / must have invited'],
             cor:'c', hint:'Type 3: If + past perfect → would have + V₃'},
            {q:'I wish you ___ me from the station — I ___ the dinner ready for you upon your arrival home.',
             opts:['phone / can prepare','have phoned / will have prepared','phoned / will be preparing','would phone / have prepared','had phoned / could have prepared'],
             cor:'e', hint:'Wish past: had + V₃; sonuç: could have + V₃'},
            {q:'I wish a flight to Istanbul ___ less than two hundred pounds, then we would fly there a lot more often.',
             opts:['costs','could have cost','has cost','cost','will cost'],
             cor:'d', hint:'Wish present: simple past (gerçek dışı şimdiki dilek)'},
            {q:'I wish I ___ to my friends in Germany every day without getting a huge telephone bill.',
             opts:['have been talking','would talk','will talk','could talk','can talk'],
             cor:'d', hint:'Wish present: could + V₁ (özneler aynı → would kullanılmaz)'},
            {q:'I\'m sure my daughter ___ university life if she ___ but she is so shy.',
             opts:['had enjoyed / was socialising','enjoys / will have socialised','would enjoy / socialized','enjoyed / had been socializing','could have enjoyed / has socialised'],
             cor:'c', hint:'Type 2: would + V₁ / If + simple past (şimdiki hayal)'},
        ]
    },
    {
        label: 'Set 2',
        questions: [
            {q:'If our caravan ___ with a shower, it ___ more practical for longer holidays.',
             opts:['is to equip / can be','were equipped / would be','had been equipped / will be','equipped / could be','would be equipped / has been'],
             cor:'b', hint:'Type 2: were + V₃ (passive) → would + V₁'},
            {q:'Had the Millennium Dome not been built, 750 million pounds ___ on health and education.',
             opts:['can be spent','must have been spent','could have been spent','will have spent','had been spending'],
             cor:'c', hint:'Type 3 inversion (Had...): could have been + V₃'},
            {q:'How I wish I ___ the bus!',
             opts:['hadn\'t missed','aren\'t missing','wouldn\'t have missed','don\'t miss','haven\'t missed'],
             cor:'a', hint:'Wish past: hadn\'t + V₃ (geçmiş pişmanlık)'},
            {q:'You ___ determined if you ___ to give up smoking permanently.',
             opts:['have been / wanted','have to be / want','could be / will have wanted','had been / would have wanted','were to be / would want'],
             cor:'b', hint:'Type 1: have to be / want (gerçek olasılık)'},
            {q:'My uncle keeps his share certificates in a fireproof box in case a fire ___ out at his office.',
             opts:['had broken','breaks','was breaking','will have broken','broke'],
             cor:'b', hint:'"in case" + simple present (önlem amaçlı)'},
            {q:'If a lorry driver ___ an illegal immigrant into the country, he personally ___ a £2000 fine.',
             opts:['brings / faces','would bring / had faced','had brought / is facing','can bring / could have faced','has brought / has faced'],
             cor:'a', hint:'Type 1: simple present / simple present (genel kural/kanun)'},
            {q:'If ways of identifying criminals using DNA samples ___, the person who killed these two young teenagers would still be a free man.',
             opts:['aren\'t developing','wouldn\'t develop','hadn\'t been developed','couldn\'t develop','won\'t have been developed'],
             cor:'c', hint:'Type 3: hadn\'t been developed (passive past perfect)'},
            {q:'If you ___ along the coastal path every morning, you ___ fit without spending a penny.',
             opts:['had run / will get','run / would have got','were running / got','ran / would get','had been running / had got'],
             cor:'d', hint:'Type 2: If + simple past → would + V₁'},
            {q:'You had better complain to the manager if you think you ___ an unfair proportion of the work.',
             opts:['would be given','will have been giving','had given','would have given','have been given'],
             cor:'e', hint:'Type 1: have been given (present perfect passive — devam eden durum)'},
            {q:'Tiger Woods ___ into many clubs in the southern US because of his colour had he been playing 50 years ago.',
             opts:['weren\'t going to allow','might not have allowed','hadn\'t been allowed','wouldn\'t have been allowed','weren\'t allowed'],
             cor:'d', hint:'Type 3 inversion (had he been...): wouldn\'t have been allowed (passive)'},
        ]
    },
    {
        label: 'Set 3',
        questions: [
            {q:'I wish I ___ for dinner as it looks delicious, but unfortunately, I have to collect my mother now.',
             opts:['will stay','would stay','can stay','had stayed','could stay'],
             cor:'e', hint:'Wish present: could + V₁ (özneler aynı → would kullanılmaz)'},
            {q:'I really wish my older sister ___ so good at everything.',
             opts:['weren\'t','won\'t be','can\'t be','hasn\'t been','isn\'t'],
             cor:'a', hint:'Wish present: simple past → weren\'t (be fiili)'},
            {q:'I wish you ___ so much potato off with the skin.',
             opts:['haven\'t cut','wouldn\'t cut','won\'t cut','aren\'t cutting','don\'t cut'],
             cor:'b', hint:'Wish future: would + V₁ (başka birinin davranışına yönelik hoşnutsuzluk)'},
            {q:'If our health service were indeed excellent, Mrs Beard ___ two years for a hip replacement operation.',
             opts:['won\'t have waited','hasn\'t been waiting','wouldn\'t have been waiting','isn\'t going to wait','weren\'t waiting'],
             cor:'c', hint:'Type 2: wouldn\'t have been waiting (past cont. → devam eden hayal)'},
            {q:'I wish Turkish courses ___ at a college near my home.',
             opts:['had offered','would be offering','could have offered','have been offered','were offered'],
             cor:'e', hint:'Wish present: were + V₃ (passive simple past)'},
            {q:'If we were to buy a boat, we ___ down the river at the weekends.',
             opts:['are going to sail','had been sailing','have sailed','could sail','may have sailed'],
             cor:'d', hint:'Type 2 inversion (were to): could + V₁'},
            {q:'If Atatürk ___ alive today, do you think he ___ flattered by the number of plaques displayed in his honour?',
             opts:['were / would be','has been / was','had been / has been','will be / were','would be / had been'],
             cor:'a', hint:'Type 2: were (be fiili) / would + V₁'},
            {q:'The ordinary people who live in the area ___ if a solution isn\'t found.',
             opts:['must have suffered','have been suffering','will suffer','would suffer','had suffered'],
             cor:'c', hint:'Type 1: will + V₁ (gerçek gelecek sonuç)'},
            {q:'I wish I ___ to the shop for mint. If I had my lentil soup ___ nice.',
             opts:['would run / tastes','ran / tasted','had run / would have tasted','were running / would taste','have run / could be tasting'],
             cor:'c', hint:'Wish past: had + V₃; Type 3 sonuç: would have + V₃'},
            {q:'If only you ___ this Japanese lacquered table with a harmful liquid, we ___ it for more than 1000 pounds.',
             opts:['wouldn\'t clean / are selling','hadn\'t cleaned / could sell','aren\'t cleaning / must have sold','wouldn\'t be cleaning / had sold','don\'t clean / were selling'],
             cor:'b', hint:'Wish/If only past: hadn\'t + V₃; Mixed: could + V₁ (artık satamayız)'},
        ]
    },
    {
        label: 'Set 4',
        questions: [
            {q:'I wish you ___ a camera already as my cousin works in a camera shop and can get staff discount.',
             opts:['aren\'t buying','wouldn\'t buy','hadn\'t bought','haven\'t bought','won\'t buy'],
             cor:'c', hint:'Wish past: hadn\'t + V₃ (geçmiş pişmanlık)'},
            {q:'Nobody would have been killed in the fight if one of the teenagers ___ a knife at the time.',
             opts:['wouldn\'t be carrying','hasn\'t been carrying','isn\'t carrying','must not have carried','hadn\'t been carrying'],
             cor:'e', hint:'Type 3: hadn\'t been carrying (past perfect continuous)'},
            {q:'I\'m sitting here in my car wishing the breakdown truck ___.',
             opts:['arrives','will arrive','has arrived','would arrive','is arriving'],
             cor:'d', hint:'Wish future: would + V₁ (başkasının eylemi için dilek)'},
            {q:'I think Jake wishes he ___ to keep the family home, but such a big house costs a lot to maintain.',
             opts:['would afford','will be affording','would have afforded','could afford','has afforded'],
             cor:'d', hint:'Wish present: could + V₁ (özneler aynı → would kullanılmaz)'},
            {q:'I ___ to go to the Antique Auctions in town one Friday if I can get the day off.',
             opts:['have liked','would like','had liked','liked','were to like'],
             cor:'b', hint:'would like = gerçek gelecek istek (Type 1 bağlamı)'},
            {q:'I\'ll allow you to go to the park ___ you come home before it gets dark.',
             opts:['even if','in case','as long as','so that','unless'],
             cor:'c', hint:'"as long as" = "-dığı sürece" (koşul bağlacı)'},
            {q:'___ they improve the quality of their products will we order any more handbags from them.',
             opts:['Even if','Only if','Unless','Whether','In case'],
             cor:'b', hint:'"Only if" cümle başında → devrik yapı zorunlu'},
            {q:'You shouldn\'t wash your car with washing up liquid; ___ you\'ll damage the paint work.',
             opts:['otherwise','in case','only if','unless','as long as'],
             cor:'a', hint:'"otherwise" = "aksi takdirde" (sonuç bağlacı)'},
            {q:'Your advertisement might look more attractive ___ it were printed in colour.',
             opts:['if','even if','until','whether','in case'],
             cor:'a', hint:'Type 2 bağlamı: if + were (basit koşul)'},
            {q:'I wouldn\'t be able to afford an Armani suit ___ I ate bread and water for a month.',
             opts:['as long as','because','only if','in order that','even if'],
             cor:'e', hint:'"even if" = "-sa bile" (koşuldan bağımsız sonuç)'},
        ]
    },
    {
        label: 'Set 5',
        questions: [
            {q:'___ you are as bored at work as you say, why don\'t you look for a more interesting job?',
             opts:['As though','If','Even if','In case','Whether'],
             cor:'b', hint:'"If" = gerçek koşul sorusu (basit Type 1)'},
            {q:'A lot of people bought shares in the company ___ the newspaper predicted it would be successful.',
             opts:['if','in case','because','only if','unless'],
             cor:'c', hint:'"because" = sebep bağlacı'},
            {q:'I\'m afraid we won\'t be able to come to Devon ___ the repairs to our car can be completed in time.',
             opts:['unless','if','in case','because','so that'],
             cor:'a', hint:'"unless" = "olmadığı sürece" (olumsuz koşul)'},
            {q:'She described her holiday job at the factory ___ it were torture.',
             opts:['even if','only if','because','as though','unless'],
             cor:'d', hint:'"as though/as if" + were → gerçek dışı karşılaştırma (Type 2)'},
            {q:'He has been busy most weekends ___ he started voluntary work for the hospital radio station.',
             opts:['if','until','since','as if','unless'],
             cor:'c', hint:'"since" = "-den beri" (zaman bağlacı)'},
            {q:'I wish my mother ___ while she does the housework or, at least, I wish she ___ in tune.',
             opts:['doesn\'t sing / can sing','wouldn\'t sing / would sing','couldn\'t have sung / sang','hadn\'t sung / will be singing','isn\'t singing / is singing'],
             cor:'b', hint:'Wish future: wouldn\'t + V₁ (başka birinin davranışı); Wish present: would + V₁'},
            {q:'If you like, we ___ volleyball with the children while the men ___ up the barbecue.',
             opts:['could play / are setting','could have played / have set','will play / were setting','can play / had been setting','would play / could have set'],
             cor:'a', hint:'Type 1: could play (teklif) / are setting (eş zamanlı eylem)'},
            {q:'If his father ___ home in time for his birthday party, Jake ___ so upset now.',
             opts:['would arrive / hadn\'t been','has arrived / hasn\'t been','had arrived / wouldn\'t be','would have arrived / isn\'t','should be arriving / won\'t be'],
             cor:'c', hint:'Mixed Type 1 (3+2): If + past perfect / would + V₁ (geçmiş → şimdiki etki)'},
            {q:'If living standards of the poor ___, the incidences of rheumatic fever ___.',
             opts:['had raised / are dropping','would have been raised / dropped','will raise / were going to drop','were raised / would drop','are raised / have been dropped'],
             cor:'d', hint:'Type 2: were raised (passive) / would + V₁'},
            {q:'Just imagine! If Aunt Sue ___ us for the TV game show, we ___ in this new car now.',
             opts:['wouldn\'t enter / aren\'t travelling','won\'t enter / haven\'t been travelling','couldn\'t have entered / won\'t travel','hadn\'t entered / wouldn\'t be travelling','haven\'t entered / couldn\'t have driven'],
             cor:'d', hint:'Mixed Type 1 (3+2): hadn\'t entered / wouldn\'t be travelling (geçmiş neden → şimdiki sonuç)'},
        ]
    },
    {
        label: 'Set 6',
        questions: [
            {q:'Let\'s take our travel chess set in case we ___ bored on the train.',
             opts:['had got','are getting','get','have got','will have got'],
             cor:'c', hint:'"in case" + simple present (önlem amaçlı)'},
            {q:'I can\'t believe I just said that. I wish I ___ my words back into my mouth. I\'ve really upset her now.',
             opts:['will suck','would suck','could suck','can suck','have sucked'],
             cor:'c', hint:'Wish present: could + V₁ (özneler aynı → would kullanılmaz)'},
            {q:'OK, I ___ the findings of our research if you ___ the handout for the audience.',
             opts:['have presented / would write','had presented / would be writing','presented / are writing','would present / have written','will present / write'],
             cor:'e', hint:'Type 1: will + V₁ / simple present (gerçek koşul)'},
            {q:'Eggs are generally good for your health, ___ of course, you exaggerate and eat an excessive amount.',
             opts:['unless','whether','as though','otherwise','in case'],
             cor:'a', hint:'"unless" = "olmadığı sürece" (istisna koşulu)'},
            {q:'Drink plenty of water during your walk; ___ you\'ll become dehydrated.',
             opts:['therefore','otherwise','in case','as though','even if'],
             cor:'b', hint:'"otherwise" = "aksi takdirde"'},
            {q:'You had better buy a semi-dry suit rather than a wet suit ___ you plan to dive in the cold seas surrounding Britain.',
             opts:['in case','otherwise','if','as if','as though'],
             cor:'c', hint:'"if" = basit koşul bağlacı'},
            {q:'I\'m sure Jessie ___ a great saleswoman provided she ___ appropriate training.',
             opts:['had made / received','was to make / had received','has made / would receive','is making / will receive','will make / receives'],
             cor:'e', hint:'"provided" + simple present → will + V₁ (Type 1 eşdeğeri)'},
            {q:'We really should have checked whether the covered bazaar is open on Sundays. We ___ somewhere else, but now we\'ve wasted our afternoon.',
             opts:['visited','had visited','will visit','have been visiting','could have visited'],
             cor:'e', hint:'Wish/pişmanlık bağlamı: could have + V₃'},
            {q:'If this carpet cleaner can\'t remove the wine stain, what ___ you ___ to your mother?',
             opts:['will / say','were / to say','could / have said','have / been saying','would / be saying'],
             cor:'a', hint:'Type 1: will + V₁ (gerçek olasılık — cevap aranıyor)'},
            {q:'I really wish I ___ but I don\'t have enough patience.',
             opts:['could have knitted','could knit','would knit','have knitted','will be knitting'],
             cor:'b', hint:'Wish present: could + V₁ (özneler aynı → would kullanılmaz)'},
        ]
    },
    {
        label: 'Set 7',
        questions: [
            {q:'___ the Australian gold mining company ___ more care with the storage of cyanide, the catastrophe could have been prevented.',
             opts:['Had / taken','Has / taken','Would / take','Should / take','Can / take'],
             cor:'a', hint:'Type 3 inversion: Had + özne + V₃ (geçmiş gerçekleşmemiş koşul)'},
            {q:'If you ___ a new car, you ___ not only the purchase price but also fuel consumption and maintenance costs.',
             opts:['have bought / considered','will buy / might have considered','bought / were considering','can buy / would consider','are buying / should consider'],
             cor:'e', hint:'Type 1 (bağlam): are buying / should consider (pratik tavsiye)'},
            {q:'Some businessmen at the meeting were complaining ___ they feel the government isn\'t doing enough to support business.',
             opts:['in case','whether','only if','because','even if'],
             cor:'d', hint:'"because" = sebep bağlacı'},
            {q:'Young Annek talks to her imaginary pet rabbits as if they ___ real.',
             opts:['would be','will be','had been','were','are'],
             cor:'d', hint:'"as if/as though" + were (Type 2 bağlamı — gerçek dışı karşılaştırma)'},
            {q:'The boys looked as though they ___ bored playing soldiers, so I suggested going for a cycle ride.',
             opts:['had become','become','will become','have become','became'],
             cor:'a', hint:'"as though" + past perfect (geçmişteki durumu gösteren gerçek dışı)'},
            {q:'Rheumatic fever can be a crippling disease; ___, the name is misleading. There is normally no fever.',
             opts:['otherwise','because','unless','however','as though'],
             cor:'d', hint:'"however" = "ancak/bununla birlikte" (zıtlık bağlacı)'},
            {q:'___ my husband were here, he would be able to unscrew the wheel nuts on the car.',
             opts:['In case','Even if','If only','As if','Unless'],
             cor:'c', hint:'"If only" = Type 2 dilek/pişmanlık ("keşke" anlamı)'},
            {q:'We will need to save for months to be able to afford a skiing holiday ___ we decide to go to France or Canada.',
             opts:['as if','however','whether','otherwise','because'],
             cor:'c', hint:'"whether" = "ister...ister" (iki seçenek arasında belirsizlik)'},
            {q:'You\'ll have to be careful about what you eat between now and your wedding, ___ you won\'t fit into your wedding dress.',
             opts:['as if','even if','only if','in case','or else'],
             cor:'e', hint:'"or else" = "yoksa/aksi takdirde" (uyarı bağlacı)'},
            {q:'___ you have lost your job because of a factory closure can you understand how devastating it is.',
             opts:['Even if','As if','In case','Only if','As though'],
             cor:'d', hint:'"Only if" cümle başında → devrik yapı zorunlu'},
        ]
    },
    {
        label: 'Set 8',
        questions: [
            {q:'You had better learn how to use the Internet; ___ you\'ll miss opportunities in the future.',
             opts:['however','otherwise','whether','unless','so long as'],
             cor:'b', hint:'"otherwise" = "aksi takdirde"'},
            {q:'The head of Tibetan Buddhism could have lived a normal peasant existence, ___ at the age of three, he was chosen by Buddhist monks to become their leader.',
             opts:['even if','but','whether','otherwise','since'],
             cor:'b', hint:'"but" = zıtlık bağlacı (gerçek durum anlatılıyor)'},
            {q:'Without washing machines, vacuum cleaners, etc., it ___ impossible for us to have as much leisure time as we now do.',
             opts:['would be','should be','will be','has been','ought to be'],
             cor:'a', hint:'"Without" = Type 2 koşul eşdeğeri → would + V₁'},
            {q:'A: Lottery tickets are a waste of money. B: Perhaps, but ___ you buy a ticket, you can\'t even hope to win.',
             opts:['because','whether','in case','if','unless'],
             cor:'e', hint:'"unless" = "almadığın sürece" (olumsuz koşul)'},
            {q:'She must have enjoyed the lemon dessert. She ___ for a second helping if she ___ the first.',
             opts:['won\'t ask / hasn\'t been enjoying','hadn\'t asked / wouldn\'t have enjoyed','wouldn\'t have asked / hadn\'t enjoyed','wasn\'t asking / wouldn\'t be enjoying','didn\'t ask / won\'t have enjoyed'],
             cor:'c', hint:'Type 3: wouldn\'t have asked / hadn\'t enjoyed (geçmiş gerçekleşmemişi)'},
            {q:'The mountaineers knew that if they ___ shelter before dark, they ___ to death.',
             opts:['haven\'t reached / are freezing','weren\'t able to reach / have frozen','aren\'t reaching / were freezing','wouldn\'t have reached / had to freeze','couldn\'t reach / might freeze'],
             cor:'e', hint:'Type 2 (geçmişte düşünülen hayal): couldn\'t reach / might + V₁'},
            {q:'Had we learnt about the Cairns to Kuranda Railway earlier, we ___ a trip on it, but we are flying home tomorrow.',
             opts:['may be taking','could have taken','will have taken','should be taking','used to take'],
             cor:'b', hint:'Type 3 inversion (Had we...): could have + V₃'},
            {q:'When the children returned, James\'s mother prepared snacks for them. They grabbed the food ___ they hadn\'t eaten for a week.',
             opts:['even if','only if','in case','as though','even though'],
             cor:'d', hint:'"as though" + past perfect → gerçek dışı karşılaştırma'},
            {q:'If you ___ too much pain while you ___, you can take one of these painkillers.',
             opts:['could experience / had been recovering','would experience / have recovered','must experience / will recover','should experience / are recovering','experienced / would have recovered'],
             cor:'d', hint:'Type 1: should (ihtimal) + V₁ / are recovering (eş zamanlı)'},
            {q:'I ___ less worried about Michael if he ___ more interest in his school work.',
             opts:['will be / had taken','would have been / is taking','had been / was taking','have been / has taken','would be / took'],
             cor:'e', hint:'Type 2: would + V₁ / If + simple past'},
        ]
    },
    {
        label: 'Set 9',
        questions: [
            {q:'I wish we ___ to this football match, then we ___ in the middle of all these hooligans now.',
             opts:['weren\'t coming / hadn\'t been','wouldn\'t have come / aren\'t','didn\'t come / haven\'t been','hadn\'t come / wouldn\'t be','don\'t come / won\'t be'],
             cor:'d', hint:'Mixed Type 1 (3+2): hadn\'t come / wouldn\'t be (geçmiş karar → şimdiki durum)'},
            {q:'If you are serious about becoming a professional ballerina, you ___ every day.',
             opts:['could have practised','must be practised','will have to practise','ought to have practised','had been practising'],
             cor:'c', hint:'Type 1: will have to + V₁ (zorunluluk)'},
            {q:'If the price of lamb ___ any further, we ___ enough to cover our costs.',
             opts:['falls / won\'t earn','had fallen / won\'t have earned','were falling / hadn\'t been earning','will be falling / don\'t earn','are falling / couldn\'t have earned'],
             cor:'a', hint:'Type 1: simple present / won\'t + V₁'},
            {q:'If we ___ up our web site, our business ___ so quickly.',
             opts:['won\'t set / hadn\'t been growing','hadn\'t set / wouldn\'t have grown','aren\'t setting / weren\'t growing','didn\'t set / won\'t have grown','don\'t set / hasn\'t grown'],
             cor:'b', hint:'Type 3: hadn\'t set / wouldn\'t have grown (past perfect → past result)'},
            {q:'Suppose that a war ___ out between your country and your husband\'s, which side ___ you support?',
             opts:['has broken / did','is breaking / may','had broken / do','broke / would','had been breaking / must'],
             cor:'d', hint:'Type 2 (Suppose): simple past / would + V₁'},
            {q:'If you ___ a VW Golf this week, you ___ a £1000 discount.',
             opts:['buy / will receive','had bought / will have received','would buy / receive','bought / had received','were buying / will be receiving'],
             cor:'a', hint:'Type 1: simple present / will + V₁'},
            {q:'If I ___ better attention, I ___ you a better description of the man, but it didn\'t seem important at the time.',
             opts:['was paying / had been giving','could have paid / gave','had been paying / could have given','had paid / will have been giving','should pay / am giving'],
             cor:'c', hint:'Type 3: had been paying (past perf. cont.) / could have given'},
            {q:'Were you to become a really famous person, ___ you still ___ my friend?',
             opts:['must / have been','would / be','should / be','might / have been','have / been'],
             cor:'b', hint:'Type 2 inversion (Were you to): would + V₁'},
            {q:'Deep sea diving should always be carried out in pairs. In this way, another oxygen source is available ___ one system fails.',
             opts:['as if','in case','otherwise','only if','whether'],
             cor:'b', hint:'"in case" = "...olursa diye" (önlem amaçlı)'},
            {q:'___ you meant it as a joke or not, it wasn\'t kind to mention the incident to Peter.',
             opts:['Whether','Even if','As though','Because','Providing'],
             cor:'a', hint:'"Whether...or not" = "ister...ister" (iki ihtimal)'},
        ]
    },
    {
        label: 'Set 10',
        questions: [
            {q:'___ the price of dairy products rises, the farm won\'t make a profit this year.',
             opts:['Providing','In case','As if','However','Unless'],
             cor:'e', hint:'"Unless" = "olmadığı sürece" (olumsuz koşul)'},
            {q:'___ I were being held hostage by terrorists, would you pay the ransom?',
             opts:['Providing','Because','Supposing','As if','In case'],
             cor:'c', hint:'"Supposing" = "suppose that" → Type 2 koşul'},
            {q:'I wish a shorter charity walk ___ because twenty miles is too far for my mother and me.',
             opts:['would organise','would have organised','are being organised','had been organised','will be organising'],
             cor:'d', hint:'Wish past: had been organised (passive past perfect — geçmiş pişmanlık)'},
            {q:'We will get their order ___ another company quotes them a lower price, which I doubt will happen.',
             opts:['in case','as if','unless','suppose that','because'],
             cor:'c', hint:'"unless" = "olmadığı sürece" (olumsuz koşul)'},
            {q:'If the charity ___ a few famous singers for the concert, they ___ a lot of people.',
             opts:['must be inviting / attracted','should invite / have attracted','invited / are attracting','can invite / had attracted','invites / might attract'],
             cor:'e', hint:'Type 1: simple present / might + V₁'},
            {q:'The whole incident probably ___ if the fans ___ so much alcohol.',
             opts:['wouldn\'t happen / aren\'t drinking','won\'t happen / weren\'t drinking','wouldn\'t have happened / hadn\'t drunk','doesn\'t happen / won\'t have drunk','didn\'t happen / haven\'t been drinking'],
             cor:'c', hint:'Type 3: wouldn\'t have happened / hadn\'t drunk'},
            {q:'Jeremy passed the entrance exam. He is pleased, but part of him wishes he ___ the same school as his friends.',
             opts:['attends','will attend','is attending','were attending','would attend'],
             cor:'d', hint:'Wish present: were attending (past continuous → şimdiki gerçek dışı)'},
            {q:'Shall I put a hot water bottle in your bed as it ___ quite cold tonight?',
             opts:['may have got','might get','could have got','would be getting','had got'],
             cor:'b', hint:'Gelecek ihtimal: might + V₁'},
            {q:'Yesterday I was sitting on the beach. I felt ___ I were in paradise.',
             opts:['even if','even though','provided','in case','as if'],
             cor:'e', hint:'"as if" + were → gerçek dışı karşılaştırma (Type 2)'},
            {q:'He must have changed his mind about animal welfare; otherwise, he ___ for a ban of fox hunting now.',
             opts:['hasn\'t campaigned','weren\'t campaigning','isn\'t campaigning','hadn\'t campaigned','wouldn\'t be campaigning'],
             cor:'e', hint:'"otherwise" bağlamı: wouldn\'t be campaigning (mixed — şimdiki sonuç)'},
        ]
    },
    {
        label: 'Set 11',
        questions: [
            {q:'You can\'t be sure of the standard of service you will receive ___.',
             opts:['only if a trained mechanic was in charge','whether it cost you more than your local garage','unless you take your Mercedes to an authorised dealership','in case the car breaks down on the motorway','or instead I will repair the car for you myself'],
             cor:'c', hint:'"unless" = "olmadığı sürece" → cümleyi tamamlayan doğru bağlaç'},
            {q:'I will agree to you handling the sale of my house ___.',
             opts:['as long as I can be present at every viewing','unless he had decided not to sell it','whether or not it could have been sold for the asking price','if I had wanted to move to another country','even if you weren\'t interested in buying them'],
             cor:'a', hint:'"as long as" + simple present → Type 1 koşul'},
            {q:'Thousands of people could starve to death in Ethiopia ___.',
             opts:['when the rains failed for the third year in a row','if food aid doesn\'t reach them soon','even if they hadn\'t asked for food aid','unless the crops fail again','as long as the economy improves'],
             cor:'b', hint:'Type 1: if + simple present / could + V₁'},
            {q:'___ were she alive today.',
             opts:['Princess Diana would be proud of the children receiving awards in her honour','Natalie is suffering from a rare disease which has weakened her heart','Van der Stappen created the Sphinx Mysterieux in 1897','Even if they had operated on her as soon as she arrived','Emmeline Pankhurst campaigned bravely for women\'s right to vote'],
             cor:'a', hint:'Type 2 inversion (were she alive): sonuç → would + V₁'},
            {q:'There has been a flood warning in operation ___.',
             opts:['when the river burst its banks again','since the heavy snow began to melt','if we receive any more heavy snow falls','as the snow was finally beginning to settle','after the government\'s environmental officer had inspected the area'],
             cor:'b', hint:'"since" = "-den beri" (present perfect / past simple ile)'},
            {q:'We had better start taking the threat of global warming seriously ___.',
             opts:['if we all used environmentally-friendly methods of refrigeration','as long as scientists agree on a solution','only if we cooperate with other countries','because the ozone layer over Europe has been reduced by two-thirds','as if they were concerned about the findings'],
             cor:'d', hint:'"because" = sebep bağlacı (önceki cümleyi destekliyor)'},
            {q:'___ if the car factory hadn\'t closed down.',
             opts:['I wonder if my father would still be working there','I guess he doesn\'t want to work on the production line any more','My brother had decided to apply for an office job','Only if BMW had decided to buy our company','I used to enjoy working together with my friends'],
             cor:'a', hint:'Type 3 inversion (hadn\'t closed): would still be working (mixed sonuç)'},
            {q:'___ I will have to wallpaper the whole dining room again.',
             opts:['Unless I can find a shop that still sells this pattern','As if it had only been decorated yesterday','In case some parts of the wallpaper got damaged','While my husband was tiling the bathroom','Supposing I didn\'t like the colour you chose'],
             cor:'a', hint:'"Unless I can find..." → "Bulamazsam...zorunda kalacağım"'},
            {q:'___ I\'m sure you will enjoy yourselves there.',
             opts:['Until we went on holiday later the same year','Unless you had taken your family with you','If you decide to go to Marmaris on holiday','Just in case the sunshine is really strong','Only if I can get the time off from work'],
             cor:'c', hint:'Type 1: If + simple present → will + V₁'},
            {q:'If we provide transportation, ___?',
             opts:['would you have been given a company car','did you find travelling by train more comfortable','have you needed a lift to the training centre','can you attend a training course in Scotland','could you have found your way there yourself'],
             cor:'d', hint:'Type 1: If + simple present → can + V₁ (teklif/olasılık)'},
        ]
    },
    {
        label: 'Set 12',
        questions: [
            {q:'Dış görünüşü o kadar değişmişti ki yanıma gelip kendini tanıtmasaydı, onu asla tanıyamazdım.',
             opts:['Physically he was completely different, which is why I didn\'t recognise him until he introduced himself.','He had changed so much physically that I would never have recognised him if he hadn\'t come up and introduced himself.','He had altered so much that I didn\'t recognise him at all until he walked up and introduced himself.','As he had changed so much, I only recognised him when he walked up and introduced himself.','Although I didn\'t recognise him by sight, I knew who he was because he introduced himself.'],
             cor:'b', hint:'Type 3: would never have recognised / hadn\'t come (geçmiş gerçekleşmemiş koşul)'},
            {q:'Bu kadar müsrifçe para harcamayı bırakmazsan, korkarım yakında sokaklarda dileniyor olacaksın.',
             opts:['If you don\'t want to beg in the streets, you should stop being so extravagant.','If you had stopped spending money so extravagantly, you wouldn\'t be begging in the streets now.','You had better stop spending money so extravagantly; otherwise, you\'ll soon start begging in the streets.','I\'m afraid it was your financial extravagance which was responsible for your downfall.','Unless you stop spending money so extravagantly, I\'m afraid you\'ll soon be begging in the streets.'],
             cor:'e', hint:'"Unless" + Type 1 → will (olumsuz koşul → olası gelecek sonuç)'},
            {q:'Eğer her şeyi önceden hazırlarsan, son anda bir şeyler yapmak için koşuşturmak zorunda kalmazsın.',
             opts:['You can prepare everything beforehand so that you won\'t have to rush around at the last minute.','Had you prepared everything beforehand, you wouldn\'t be rushing around at the last minute.','If you prepare everything in advance, you won\'t have to rush around to do something at the last minute.','I\'d prepare everything in advance were I you, to avoid rushing around at the last minute.','Whether you prepare well in advance or not, you usually find yourself rushing around.'],
             cor:'c', hint:'Type 1: If + simple present / won\'t have to + V₁'},
            {q:'Keşke en az milletvekillerinin yarısının otuz beş yaşın altında olmasını gerektiren bir kanun olsaydı.',
             opts:['They want to bring in a law requiring all MPs to be under thirty-five.','I wish half the MPs were under the age of thirty-five.','Don\'t you wish about half of the MPs were under the age of thirty-five?','I wish there were a law that required at least half the MPs of a nation to be under the age of thirty-five.','I thought there was a legal requirement for at least half the MPs to be under thirty-five.'],
             cor:'d', hint:'Wish present: I wish there were a law... (Type 2 bağlamı)'},
            {q:'Dün gece saati ayarlamayı unutmuş olmalısın yoksa bu sabah her zamanki gibi vaktinde çalardı.',
             opts:['You must have forgotten to set the alarm clock last night, or it would have gone off on time as usual this morning.','The alarm clock usually goes off early, but you probably forgot to set it last night.','The alarm clock would have gone off as usual if you had remembered to set it last night.','We didn\'t hear the alarm clock, so I don\'t think you set it properly.','I can only assume that you didn\'t set the alarm clock; otherwise, it would have woken us up as usual.'],
             cor:'a', hint:'"must have forgotten" (çıkarım) + "or it would have" (Type 3 sonuç)'},
            {q:'Eğer her şey planlandığı gibi giderse, ay sonunda yeni evimize taşınabileceğimizi umuyoruz.',
             opts:['Everything is going as planned, so we will be able to move at the end of the month.','According to the planners, we should be able to move at the end of the month.','Presuming we don\'t encounter any problems, we plan to move at the end of the month.','We should be able to move at the end of the month providing nothing goes wrong.','If everything goes as planned, we expect to be able to move into our new house at the end of the month.'],
             cor:'e', hint:'Type 1: If + simple present / expect to (gerçek olasılık)'},
            {q:'Araba yolculuğunun bu kadar uzun süreceğini bilseydim, uçakla seyahat ederdim.',
             opts:['I didn\'t know the car journey would take so long; otherwise, I would have flown.','I would have travelled by plane had I known that the car journey would take so long.','I would have taken a plane, but I didn\'t realise how far it was to drive.','I wouldn\'t have travelled by plane even if I had known how long the journey would take.','The only reason I drove there was that I don\'t like long journeys by plane.'],
             cor:'b', hint:'Type 3 inversion: had I known / would have travelled'},
            {q:'Yeni uygulamaların, hâlihazırda çalışma izni olan yabancıları etkileyeceğini sanmıyorum.',
             opts:['I think the new regulations will affect all foreign workers except those with a work permit.','I believe that only foreigners who already hold work permits won\'t be affected.','I don\'t think the new regulations will affect the foreigners who already hold work permits.','As they obtained their work permits in advance, I don\'t think they will be affected.','Those foreigners who already hold work permits will also be affected by these new regulations.'],
             cor:'c', hint:'Olumsuz düşünce: "don\'t think" + will affect → değil'},
            {q:'İngilizce, uzun süredir ticaret dilidir ve giderek uluslararası ilişkilerde de ortak dil olmaktadır.',
             opts:['English has long been the language of commerce, and it is gradually becoming the common language in international relations as well.','English has become not only the language of commerce, but also a common language in international relations.','In addition to being the language of commerce, English is becoming common in international relations.','Over the years, English has gradually become a language commonly used in commerce and international negotiations.','Long used in business meetings, English is also gradually becoming common in international political meetings.'],
             cor:'a', hint:'Present perfect (has been) + present continuous (is becoming) — devam eden süreç'},
            {q:'Eğer bu konuyu tablolarla örneklendirerek anlatmazsan, öğrenciler kesinlikle hiçbir şey anlamazlar.',
             opts:['The students will understand more if you use illustrations and tables.','Unless you explain this subject by illustrating it with tables, the students will certainly not understand anything.','When you explain this subject, illustrating it with tables will lead to better understanding.','This subject would certainly be better explained if you used illustrations and tables.','If you want the students to understand anything, you had better illustrate your explanations with tables.'],
             cor:'b', hint:'"Unless" + Type 1 → will not (olumsuz koşul + kesin sonuç)'},
        ]
    },
    {
        label: 'Set 13',
        questions: [
            {q:'In order for me to finish this project by tomorrow, I need to work without being interrupted at all.',
             opts:['Hiç bölünmeden çalışmam gerekse de bu projeyi yarına kadar bitireceğim.','Bu projenin yarına kadar bitmesi ancak hiç kesintisiz çalışırsam mümkün olabilir.','Bu projenin bitmesi için yarın hiç bölünmeden çalışmak zorundayım.','Bu projeyi yarına kadar bitirebilmem için hiç bölünmeden çalışmam gerekir.','Bu projeyi yarın bitirebilmek için ara vermeksizin çalışmam gerekebilir.'],
             cor:'d', hint:'"In order for...to" → "...için" (amaç); "need to" → "gerekir" (zorunluluk)'},
            {q:'If there are people at your workplace with whom you don\'t get on, you can\'t work in a peaceful atmosphere, and thus, you can\'t be very productive.',
             opts:['Verimli çalışabilmek için iş yerinizde huzurlu bir ortam yaratmalı ve iş arkadaşlarınızla iyi geçinmelisiniz.','İş yerinizde birbiriyle anlaşamayan insanların olması sizin de huzurunuzu bozabilir ve veriminizi düşürebilir.','Eğer iş yerinde anlaşamayan insanlar varsa, huzurlu bir ortamda çalışılamaz, bu nedenle de çok verimli olunamaz.','Eğer iş yerinde anlaşamadığınız insanlar varsa, huzurlu bir ortamda çalışamaz, dolayısıyla çok verimli olamazsınız.','Anlaşamadığınız insanlarla aynı iş yerinde çalışmak zorunda olmak huzurunuzu kaçırır ve veriminizi düşürür.'],
             cor:'d', hint:'"If...you don\'t get on" → ikinci şahıs hitabı; "thus" → "dolayısıyla"'},
            {q:'With the many electrical appliances that we have, life is much easier today compared with the past.',
             opts:['Sahip olduğumuz bu kadar çok elektrikli alet bugün yaşamımızı geçmişe göre daha da kolaylaştırabilmektedir.','Bu kadar çok elektrikli alete sahip olduğumuz için geçmişe göre bugün çok daha kolay yaşamaktayız.','Geçmişle karşılaştırdığımızda bugün yaşamın bu kadar kolay olması sahip olduğumuz elektrikli aletler sayesindedir.','Bugün yaşam geçmişle karşılaştırıldığında çok daha kolaysa bu, sahip olduğumuz elektrikli aletlerle mümkün olmuştur.','Sahip olduğumuz bu kadar çok elektrikli aletle, bugün yaşam geçmişle karşılaştırıldığında çok daha kolay.'],
             cor:'e', hint:'"With...appliances" → "...aletle"; "compared with the past" → "geçmişle karşılaştırıldığında"'},
            {q:'It\'d have been very hard for us to commute to work if we had had to sell our car.',
             opts:['Zorda kaldığımız için arabamız satılsaydı, işe gidip gelirken çok zorlanacaktık.','Arabamızı satmak zorunda kalsaydık, işe gidip gelmemiz çok zor olacaktı.','Arabamızı satmak zorunda kalırsak, işe gidip gelmekte çok zorlanacağız.','İşe gidip gelmemiz çok zor olacaktı ama arabamızı satmak zorundaydık.','Arabamızı satmak zorunda kalışımız, işe gidip gelmemizi çok zorlaştırmıştı.'],
             cor:'b', hint:'Type 3: It would have been hard / if we had had to sell → "zorunda kalsaydık / zor olacaktı"'},
            {q:'Although it is very warm today, let\'s take our cardigans with us in case there is a breeze on the coast.',
             opts:['Bugün hava çok ılık ama sahilde esinti olabileceğini düşünerek yine de hırkalarımızı yanımıza almalıyız.','Bugün hava çok ılık olmasına rağmen, sahil serin olacağı için hırkalarımızı yanımıza aldık.','Hava bugün çok ılık olsa da, sahilde esinti olabilir diye hırkalarımızı yanımıza alalım.','Hava bugün çok ılık ama hırkalarımızı alalım çünkü sahilde hafif de olsa rüzgar vardır.','Esintiye rağmen bugün hava çok ılık olduğu için hırkalarımızı alıp sahile gidelim.'],
             cor:'c', hint:'"Although" → "olsa da"; "let\'s take" → "alalım"; "in case" → "olabilir diye"'},
            {q:'Her showing off as though she\'d done all the work on her own really annoyed the other members of the team.',
             opts:['Sanki bütün işi tek başına yapmış gibi böbürlenmesi ekibin diğer üyelerini çok kızdırdı.','Bütün işi sanki tek başına yapıyormuşçasına böbürlenmesine ekibin diğer üyeleri çok kızmıştı.','Sanki bütün işleri tek başına yapıyormuş gibi böbürleniyor, bu da ekibin diğer üyelerini çok kızdırıyordu.','Ekibin diğer üyeleri, onun sanki bütün işleri tek başına yapabilirmiş gibi böbürlenmesine çok kızıyordu.','Ekibin diğer üyelerini en çok kızdıran, onun sanki bütün işi tek başına yapmış gibi böbürlenmesiydi.'],
             cor:'a', hint:'"Her showing off" (gerunds özne) + "annoyed" → kızdırdı; "as though she\'d done" → geçmiş gerçek dışı'},
            {q:'If the house has just been decorated as you say, then we can just clean it and move in.',
             opts:['Eğer söylediğin gibi evin boyası tamamlanmışsa, o zaman temizlikten sonra hemen taşınabiliriz.','Söylediğin gibi ev yeni boyanmışsa, o zaman hemen temizlik yapıp taşınalım.','Senin de söylediğin gibi ev yeni boyandığı için yalnızca temizlik yapıp taşınacağız.','Senin sözünü ettiğin evi temizleyip hemen taşınabiliriz çünkü o ev yeni boyandı.','Eğer ev söylediğin gibi yeni boyandıysa, o zaman sadece temizleyip taşınabiliriz.'],
             cor:'e', hint:'"If...has just been decorated" → "yeni boyandıysa"; "can just clean...and move in" → "sadece temizleyip taşınabiliriz"'},
            {q:'The silkworm thrives and produces the fine silk threads for its cocoon only when it eats the tender leaves of the white mulberry tree.',
             opts:['Sadece beyaz dut ağacının körpe yapraklarını yiyen ipek böceği hızla serpilip büyür ve kozası için ince ipek lifi üretir.','İpek böceğinin serpilip büyümesi ve kozası için ince ipek lifi üretebilmesi ancak beyaz dut ağacının körpe yapraklarını yemesiyle mümkündür.','İpek böceği sadece beyaz dut ağacının körpe yapraklarını yiyerek büyürse kozası için gereken ipek lifini üretebilir.','İpek böceğinin büyüyüp serpilebilmesi ve kozası için ince lif üretebilmesi için beyaz dut ağacının körpe yapraklarını yemesi gerekir.','İpek böceği ancak beyaz dut ağacının körpe yapraklarını yiyince serpilip büyür ve kozası için ince ipek lifi üretir.'],
             cor:'e', hint:'"only when" → "ancak...yince"; "thrives and produces" → "serpilip büyür ve...üretir"'},
            {q:'The police might have had to use force if the crowd hadn\'t dispersed peaceably.',
             opts:['Sükunet içinde dağılmayan kalabalık polisi güç kullanmak zorunda bıraktı.','Kalabalık sakin bir biçimde dağılmazsa polis güç kullanmak zorunda kalır.','Kalabalık sükunet içinde dağılmayınca polis güç kullanmak zorunda kaldı.','Kalabalık sükunet içinde dağılmasaydı, polis güç kullanmak zorunda kalabilirdi.','Kalabalık sakin bir biçimde dağılsaydı, polis güç kullanmak zorunda kalmazdı.'],
             cor:'d', hint:'Type 3: might have had to / hadn\'t dispersed → "olabilirdi / dağılmasaydı"'},
            {q:'Whether you take an active part in the group or not, in the end, you too will be affected by the decisions taken.',
             opts:['İçinde bulunduğunuz grubun aktivitelerinde yer almasanız bile alınacak kararlardan siz de etkilenirsiniz.','Grubun içinde aktif olarak yer alınsa da alınmasa da, sonuç olarak alınan kararlar sizi de etkileyecektir.','Aktif olarak grubun içinde yer alsanız da almasanız da, sonunda alınan kararlardan siz de etkileneceksiniz.','Bir grubun içinde aktif biçimde yer alınıp alınmaması da, sonuçta alınacak kararları etkileyecektir.','Alınan kararlarda etkili olmak istiyorsanız grubun içinde aktif olarak yer almanız gerekecek.'],
             cor:'c', hint:'"Whether...or not" = "ister...ister"; "you too will be affected" → "siz de etkileneceksiniz"'},
        ]
    },
    {
        label: 'Set 14',
        questions: [
            {q:'How I wish I hadn\'t taken my holiday allowance already because, then, I could accompany you to Vienna.',
             opts:['I\'d really like to go with you to Vienna, but I have used up all my holiday entitlement.','If I accompanied you to Vienna, I wouldn\'t have any holiday entitlement left.','If you had some holiday entitlement left, you could accompany me to Vienna.','I couldn\'t accompany you to Vienna even if I wanted to, as I\'m not allowed to take any holiday.','Only if my company allows it can I go to Vienna with you.'],
             cor:'a', hint:'Wish past pişmanlık → "kullandım, keşke kullanmasaydım" → şimdiki sonuç: gidemiyorum'},
            {q:'I don\'t approve of nuclear power because a hundred percent safety can never be guaranteed.',
             opts:['I think there is almost no chance of a disaster with nuclear power these days.','The safety of nuclear power can never be guaranteed because human error could always cause an accident.','In my opinion, nuclear power is extremely unsafe as it pollutes the atmosphere.','Only if there could ever be a complete guarantee of safety would I approve of nuclear power.','Nuclear power should only be generated when strict safety guidelines are followed.'],
             cor:'d', hint:'"Only if...would I approve" → inversion; orijinal cümlenin olumsuzunu tersine çeviriyor'},
            {q:'She might not have been given the opportunity to record an album if she hadn\'t already been well known as an actress.',
             opts:['Since giving up her acting career, she has recorded an album.','Had she not turned down the opportunity to become an actress, she couldn\'t have become famous by recording an album.','One of the reasons she became famous as an actress is that she was already a successful singer.','Until she recorded the album, she had been quite a well known actress.','Had she not been a famous actress, she would probably not have been given the chance to record an album.'],
             cor:'e', hint:'Type 3 inversion: Had she not been (hadn\'t been) → wouldn\'t have been given'},
            {q:'Colleagues at work will often bully you if you are too passive.',
             opts:['It is best to be aggressive if you want to bully someone at work.','Not being assertive enough often means that you will get bullied by people at work.','You can\'t stop people bullying you no matter how polite you are.','Were you not so passive, your business partner probably wouldn\'t bully you so much.','It is believed that victims of bullying are very often kind people.'],
             cor:'b', hint:'"if you are too passive" → "yeterince kararlı olmamak" → bully edilirsin'},
            {q:'At this precise moment, I am wishing I had never enrolled on this Celtic Myth course.',
             opts:['Had it not been compulsory, I wouldn\'t have taken a Celtic Myth course.','Ever since I enrolled on this Celtic Myth course, I have been regretting it.','Right now, I am regretting my decision to take this Celtic Myth course.','How I wish I hadn\'t had to take Celtic Myth as part of my course.','If only Celtic Myth didn\'t form part of this literature course.'],
             cor:'c', hint:'"At this precise moment, I am wishing" = "Şu an pişmanım" → regretting my decision'},
            {q:'I am having my hair done at an expensive hairdresser\'s because I unsuccessfully attempted to dye my hair red myself.',
             opts:['As I wanted my hair dyed red, I thought I had better go to an exclusive hairdresser\'s.','I didn\'t expect it to be so expensive to have my hair dyed red.','I wouldn\'t have come to the hairdresser\'s just to have my hair cut, but I want it dyed red.','If I hadn\'t failed to dye my hair red properly myself, I wouldn\'t be paying an expensive hairdresser to correct it now.','This hairdresser hasn\'t done a very good job of dying my hair red considering she charged so much.'],
             cor:'d', hint:'Mixed Type 2 (3+2): hadn\'t failed → wouldn\'t be paying now (geçmiş neden → şimdiki sonuç)'},
            {q:'As I live so close to the border, I would consider studying Welsh, but I\'ve heard that it is a very difficult language.',
             opts:['If I hadn\'t heard that Welsh is extremely hard, I would think about studying it because I live near Wales.','If I didn\'t find learning languages so hard, I would probably learn Welsh, especially as I live close to Wales.','Of all the languages I have learnt, Welsh was by far the hardest even though I could practise near the border.','Living so close to Wales, I have the opportunity to learn Welsh, but I think it is going to be difficult.','As I live close to Wales, I should learn Welsh, but I probably won\'t because I find the language extremely difficult.'],
             cor:'d', hint:'"would consider" (şartlı istek) + "but I\'ve heard" (gerçek engel) → fırsatım const ama zor olduğunu duydum'},
            {q:'Because seven students had their hands in the mixture, I don\'t recommend that you eat that marmalade.',
             opts:['If I were you, I wouldn\'t eat that marmalade as the mixture was handled by seven school children.','I was discouraged from eating the marmalade because seven students had handled the mixture.','I would probably be more inclined to eat the marmalade if seven school children hadn\'t had their hands in it.','The marmalade would probably taste nicer if seven students hadn\'t all put their hands in it.','Were I you, I wouldn\'t allow all seven students to put their hands in the marmalade.'],
             cor:'a', hint:'"If I were you" = Type 2 tavsiye → "I wouldn\'t eat" (öneri)'},
            {q:'When working on a computer, you should always take frequent breaks, or else you risk straining your eyes.',
             opts:['You wouldn\'t have strained your eyes if you hadn\'t worked on the computer for too long.','If you work for a long period without a break, you will certainly damage your eyes.','Many people suffer from eye strain because they don\'t take enough breaks.','If you are suffering from eye strain, try taking frequent breaks, which may help.','Taking frequent breaks while working on a computer is good advice to avoid straining your eyes.'],
             cor:'e', hint:'Cümlenin özünü (tavsiye + sebep) en iyi özetleyen seçenek'},
            {q:'Had they realised the fort was no longer held by the enemy, they wouldn\'t have attacked it.',
             opts:['They attacked the fort owing to the fact that it was in the hands of the enemy.','They knew the enemy no longer controlled the fort; nevertheless, they attacked it.','If the fort had been still under the control of the enemy, they would have attacked it.','They attacked the fort because they didn\'t know that it was not under the enemy\'s control any more.','They didn\'t realise that the enemy no longer intended to attack their fort.'],
             cor:'d', hint:'Type 3 inversion (Had they realised): hadn\'t realised → attacked it (ters çevrilmiş sonuç)'},
        ]
    },
    {
        label: 'Set 15',
        questions: [
            {q:'Spoilt children often don\'t appreciate the value of possessions as adults.',
             opts:['Pampered children will usually be from rich homes, so they don\'t need to realise the value of possessions.','People who don\'t realise the value of possessions often spoil their children.','Not appreciating the worth of possessions can often be a result of a person\'s being spoilt as a child.','Unless you are generous with your children, they won\'t realise the value of anything.','Pampered children often damage their possessions because they don\'t realise the value of them.'],
             cor:'c', hint:'Cümleyi pasif bağlama taşıyan en doğru parafraz: şımartılmak → değer bilmemek'},
            {q:'I\'m not sure that the Shrewsbury Amateur Dramatic Society\'s version of \'Twelfth Night\' appeals to me, even if my sister can baby-sit.',
             opts:['My sister might be able to baby-sit, but I\'m not convinced I would enjoy the production.','Had my sister been able to baby-sit, I might have gone to see the production.','If only my sister could have baby-sat, I\'m sure I would have enjoyed the production.','If my sister agrees to baby-sit, we can go to the production, which I think you might enjoy.','I probably wouldn\'t have enjoyed it, but my sister couldn\'t baby-sit anyway.'],
             cor:'a', hint:'"even if" + present → şu an bile emin değilim; sister baby-sit edebilse bile'},
            {q:'Initially, the school was refused a licence because the fire escapes were inadequate.',
             opts:['Had the fire escapes met the required standard, the school wouldn\'t have been refused a licence initially.','The school should have prepared the fire escapes before applying for a licence.','The school should bring the fire escapes up to standard; otherwise, their application will be refused.','The school can\'t persuade the authorities to issue a licence as the fire escapes aren\'t up to standard.','Even if the fire escapes had met the required standard, the school would have been refused a licence.'],
             cor:'a', hint:'Type 3: Had met → wouldn\'t have been refused (ters çevrilmiş gerçek durum)'},
            {q:'The accident we were involved in on the way back from Şile spoilt an otherwise perfect day.',
             opts:['Our day out to Şile was a disaster mainly due to the collision on the way home.','Being involved in an accident on our journey to Şile didn\'t stop our day out being almost perfect.','Our day out to Şile would have been perfect if we hadn\'t been involved in a collision on our return journey.','Having an accident on the way to Şile was the only thing which prevented us enjoying our time there.','We couldn\'t enjoy our day in Şile because we were involved in a terrible accident.'],
             cor:'c', hint:'Type 3: would have been perfect / hadn\'t been involved (gerçekleşen kaza → mahvoldu)'},
            {q:'How she wishes that she had been polite to her boss this morning.',
             opts:['As usual, she wasn\'t very polite to the boss this morning.','Generally, she is polite to her boss, but this morning she was a bit rude.','The remarks her boss made to her this morning were unfair.','She was rude to her boss this morning, and now she regrets it.','She could have been a bit kinder to her boss this morning.'],
             cor:'d', hint:'Wish past (had been polite) → şimdi pişman; "she was rude...and now she regrets it"'},
            {q:'I\'ll give you the gardening contract on condition that you take all the leaves and branches away when you have finished.',
             opts:['You won\'t get any gardening contracts unless you agree to remove leaves and branches after each job.','You wouldn\'t get the contract even if you agreed to remove the leaves and branches.','According to the contract, you should have taken the leaves away when you had finished.','I have given you the contract because you agreed to take the leaves away when you finish.','If you agree to remove all the leaves and branches when you have completed the job, I\'ll give you the contract.'],
             cor:'e', hint:'"on condition that" = "if" (Type 1 koşul); aynı anlam farklı yapıyla'},
            {q:'People would come into the cafe and see what delicious food you sell if you gave out vouchers for a free cup of tea.',
             opts:['Even if you handed out vouchers, people wouldn\'t order food at your cafe.','More people visited your cafe only when you handed out vouchers for a free cup of tea.','Were you to hand out vouchers for a free cup of tea, people would visit your cafe and see all the delicious food.','Suppose we gave out vouchers, do you think people would visit the cafe and see our delicious food?','If only we had given out vouchers, people might have visited our cafe opening.'],
             cor:'c', hint:'Type 2 inversion (Were you to): would visit / would see (hayal koşulu)'},
            {q:'They were determined to go skiing the next day even if conditions were treacherous.',
             opts:['They really shouldn\'t have gone skiing because the conditions had become very dangerous.','Although the conditions were extremely dangerous, they ignored advice and went skiing anyway.','Had they known the conditions were going to be dangerous, they wouldn\'t have planned to go skiing.','Whether the conditions were to be very dangerous or not, they had made up their minds to go skiing the next day.','Only if the conditions were not treacherous would they go skiing the next day.'],
             cor:'d', hint:'"even if...treacherous" = "ister tehlikeli olsun ister olmasın" → Whether...or not'},
            {q:'I wouldn\'t have entered the golf championship if I hadn\'t believed I could win it.',
             opts:['I will enter the golf championship because I believe I have a chance of winning.','As I am quite good at golf, I decided to enter the championship.','Even if I didn\'t believe I could win, I would have entered.','I was confident that I could win, so I entered the golf championship.','Although I didn\'t believe I could win, I entered the golf championship.'],
             cor:'d', hint:'Type 3 (ters çevrilmiş): believed → entered; "confident...so entered"'},
            {q:'Fortunately, we\'d taken out travel insurance as the travel agent had suggested because my handbag was stolen in Tenerife.',
             opts:['Since a thief stole my handbag in Tenerife, it was lucky we had taken out travel insurance.','We wish we had taken out travel insurance because my handbag was stolen in Tenerife.','If we had taken out travel insurance, we would have been able to claim for my handbag stolen in Tenerife.','We should have taken out the insurance as our travel agent recommended because my handbag was stolen.','I can\'t imagine what would have happened when my handbag was stolen if we hadn\'t taken out travel insurance.'],
             cor:'a', hint:'"Fortunately, we\'d taken out" → "Çantam çalındı ama neyse ki sigorta yapmıştık" → A seçeneği'},
        ]
    },
    {
        label: 'Set 16',
        questions: [
            {q:'My father took a photograph of the damage caused to his car in case there was a dispute about the accident later.',
             opts:['It was lucky that my father had taken a photograph as there was a dispute about the accident.','For fear that there might be a dispute about the accident at a later date, my father took a photo of the damage.','My father should have taken a photograph of the damage, which would have prevented the dispute.','When a dispute arose, my father produced the photo he\'d taken at the time.','Like my father, one should always take a photograph of accident damage to avoid later disputes.'],
             cor:'b', hint:'"in case there was a dispute" = "For fear that there might be a dispute" (önlem amaçlı)'},
            {q:'We had better stop doing business with him if he doesn\'t start behaving professionally.',
             opts:['He is so unprofessional that I don\'t understand why we still deal with him.','Unless his unprofessional conduct stops, I\'d advise we cease trading with him.','We won\'t deal with him because his conduct is so unprofessional.','Luckily, we ceased trading with him as his conduct is now very unprofessional.','If he hadn\'t stopped being so unprofessional, we would have stopped dealing with him.'],
             cor:'b', hint:'"had better...if he doesn\'t" = "Unless...I\'d advise" (olumsuz koşul → tavsiye)'},
            {q:'If you had brought it to me this morning, I could have repaired it in time for the weekend, but it\'s too late now.',
             opts:['This morning, I thought I could mend it before the weekend, but it looks doubtful now.','Unfortunately, I don\'t have time to mend this for you before the weekend.','I would have been able to mend it in time for the weekend had I been given it this morning.','You should have brought it to me this morning if you wanted it ready for the weekend, but I will try my best.','If you really need it mended before the weekend, you can bring it to me this morning.'],
             cor:'c', hint:'Type 3 inversion: had I been given it this morning / would have been able to mend'},
            {q:'The muddy path made it impossible to walk all the way around the lake.',
             opts:['We couldn\'t walk around the whole lake shore because of the muddy path.','It was impossible to get down to the lake shore because the path was muddy.','If the path had got any muddier, we wouldn\'t have been able to walk around the lake.','The muddy path made it extremely difficult for us to walk around the lake.','When we heard how muddy the path was, we decided not to walk around it.'],
             cor:'a', hint:'"made it impossible to walk" → "yapamamak" = couldn\'t + because of the muddy path'},
            {q:'The chemist should have informed you about the side effects of this medicine.',
             opts:['I don\'t think the chemist should have told you about the side effects as it is the doctor\'s duty.','Chemists should always inform patients of any negative side effects of medicine.','It was the chemist\'s duty to inform you about this medicine\'s side effects.','Even the chemist hadn\'t mentioned these awful side effects.','It isn\'t the doctor\'s but the chemist\'s responsibility to inform patients of side effects.'],
             cor:'c', hint:'"should have informed" → "göreviydi" (geçmişte yapılmamış yükümlülük = it was the duty)'},
            {q:'Aşağıdakilerden hangisi "I wish I had more time" cümlesinin anlamıyla en uyumludur?',
             opts:['I have enough time for everything.','I had more time in the past but not now.','I don\'t have enough time now and I regret it.','I will have more time in the future.','I had too much time and wasted it.'],
             cor:'c', hint:'Wish present: gerçek dışı şimdiki dilek → şu an yeterli zamanım yok ve keşke olsaydı'},
            {q:'Aşağıdaki cümlelerin hangisinde "unless" yanlış kullanılmıştır?',
             opts:['Unless you study, you won\'t pass.','I\'ll come unless it rains.','Unless you had told me, I wouldn\'t have known.','Unless she apologizes, I won\'t forgive her.','He won\'t succeed unless he tries harder.'],
             cor:'c', hint:'"Unless" gerçek koşullarda (Type 1) kullanılır; Type 3\'te "if...hadn\'t" gerekir'},
            {q:'Aşağıdaki cümlelerden hangisi Mixed Conditional (Type 3→2) yapısına örnektir?',
             opts:['If I study, I will pass.','If I studied, I would pass.','If I had studied, I would have passed.','If I had studied, I would be a doctor now.','If I were rich, I could travel the world.'],
             cor:'d', hint:'Mixed (3+2): If + past perfect (geçmiş) → would + V₁ (şimdiki sonuç)'},
            {q:'"Had she known the truth, she wouldn\'t have lied." Bu cümle hangi yapıya örnektir?',
             opts:['Type 1 normal','Type 2 normal','Type 3 normal','Type 3 inversion','Type 2 inversion'],
             cor:'d', hint:'Had + özne + V₃ → "if" kullanılmadan Type 3 elde etmek = inversion'},
            {q:'Aşağıdakilerden hangisi "in case" ile "unless" farkını en doğru açıklar?',
             opts:['"In case" olumsuz koşul, "unless" önlem amaçlı kullanılır.','"Unless" gelecekte, "in case" geçmişte kullanılır.','"In case" önlem/tedbir amaçlı, "unless" olumsuz koşul bildirir.','"In case" Type 2, "unless" Type 3 için geçerlidir.','İkisi birbirinin yerine serbestçe kullanılabilir.'],
             cor:'c', hint:'"In case" = "-diye/önlem olarak"; "unless" = "-madığı sürece/olumsuz koşul"'},
        ]
    },
];

let _cnSetIdx     = 0;
let _cnSetScore   = 0;
let _cnSetChecked = {};
let _cnSetAnswers = {};

function cnExercises() {
    _cnSetIdx = 0; _cnSetScore = 0; _cnSetChecked = {}; _cnSetAnswers = {};
    return _cnBuildExercisePage();
}

function _cnBuildExercisePage() {
    const set   = CN_SETS[_cnSetIdx];
    const total = set.questions.length;

    const tabs = CN_SETS.map(function(s, i) {
        const active = i === _cnSetIdx
            ? 'style="background:#0369a1;color:#fff;border-color:#0369a1;"' : '';
        return '<button class="gr-set-tab" ' + active + ' data-action="cnSwitchSet(' + i + ')">' + s.label + '</button>';
    }).join('');

    const qCards = set.questions.map(function(q, i) {
        const opts = q.opts.map(function(o, j) {
            const letter = ['A','B','C','D','E'][j];
            const lv     = ['a','b','c','d','e'][j];
            const state  = _cnSetAnswers[_cnSetIdx + '_' + i];
            let cls = 'gr-opt';
            if (_cnSetChecked[_cnSetIdx + '_' + i]) {
                if (lv === q.cor)                         cls += ' ok';
                else if (lv === state && state !== q.cor) cls += ' bad';
            } else if (state === lv) cls += ' sel';
            return '<div class="' + cls + '" id="cnso-' + i + '-' + j + '" data-action="cnSetOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o
                + '</div>';
        }).join('');

        const checked = _cnSetChecked[_cnSetIdx + '_' + i];
        const fbCls   = checked ? (checked === 'ok' ? 'gr-fb show ok' : 'gr-fb show bad') : 'gr-fb';
        const fbTxt   = checked === 'ok'  ? ('✅ Doğru! ' + q.hint)
                    : checked === 'bad' ? ('❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + ' — ' + q.hint) : '';
        const cardCls = checked === 'ok' ? 'gr-q-card gr-c' : checked === 'bad' ? 'gr-q-card gr-w' : 'gr-q-card';
        const btnDis  = checked ? 'disabled style="opacity:.4;pointer-events:none;"' : '';

        return '<div class="' + cardCls + '" id="cnsc-' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' — ' + set.label.toUpperCase() + '</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#0369a1;color:#0369a1" data-action="cnCheckSetQ(' + i + ')" ' + btnDis + '>Kontrol Et</button>'
            + '<div class="' + fbCls + '" id="cnsfb-' + i + '">' + fbTxt + '</div>'
            + '</div>';
    }).join('');

    const html = cnH('✨ Pratik Yap', 'Alıştırmalar', CN_SETS.length + ' set × 10 soru — gerçek YDT soruları')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-set-tabs">' + tabs + '</div>'
        + '<div class="gr-score-bar">'
        + '<span class="gr-score-label">' + set.label + ' Puanı</span>'
        + '<span class="gr-score-val" id="cn-live-score">' + _cnSetScore + ' / ' + total + '</span>'
        + '</div>'
        + qCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#0369a1,#0ea5e9)" data-action="cnSubmitSet()">🎯 Seti Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="cn-result">'
        + '<div class="gr-res-score" id="cn-res-score" style="color:#0369a1">0/' + total + '</div>'
        + '<div class="gr-res-lbl">' + set.label + ' Tamamlandı</div>'
        + '<div class="gr-res-msg" id="cn-res-msg"></div>'
        + '<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:14px">'
        + '<button class="gr-retry-btn" style="border-color:#0369a1;color:#0369a1" data-action="cnRetrySameSet()">🔄 Aynı Seti Tekrar</button>'
        + (_cnSetIdx < CN_SETS.length - 1
            ? '<button class="gr-retry-btn" style="background:#0369a1;color:#fff;border-color:#0369a1" data-action="cnNextSet()">Sonraki Set →</button>'
            : '<span style="font-size:.8rem;color:var(--ink3);align-self:center">🏁 Tüm setler tamamlandı!</span>')
        + '</div>'
        + '</div></div>';

    return html;
}

function cnSwitchSet(idx) {
    _cnSetIdx = idx; _cnSetScore = 0; _cnSetChecked = {}; _cnSetAnswers = {};
    const cnt = document.getElementById('cn-content');
    if (cnt) { cnt.innerHTML = _cnBuildExercisePage(); cnt.scrollTop = 0; }
}

function cnSetOpt(qi, oi, letter) {
    if (_cnSetChecked[_cnSetIdx + '_' + qi]) return;
    CN_SETS[_cnSetIdx].questions[qi].opts.forEach(function(_, j) {
        const el = document.getElementById('cnso-' + qi + '-' + j);
        if (el) el.className = 'gr-opt' + (j === oi ? ' sel' : '');
    });
    _cnSetAnswers[_cnSetIdx + '_' + qi] = letter;
}

function cnCheckSetQ(qi) {
    const q    = CN_SETS[_cnSetIdx].questions[qi];
    const sel  = _cnSetAnswers[_cnSetIdx + '_' + qi];
    const fb   = document.getElementById('cnsfb-' + qi);
    const card = document.getElementById('cnsc-' + qi);
    if (!fb) return;
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    const letters = ['a','b','c','d','e'];
    q.opts.forEach(function(_, j) {
        const el = document.getElementById('cnso-' + qi + '-' + j);
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
        _cnSetChecked[_cnSetIdx + '_' + qi] = 'ok';
        _cnSetScore++;
    } else {
        if (card) card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + ' — ' + q.hint;
        fb.className = 'gr-fb show bad';
        _cnSetChecked[_cnSetIdx + '_' + qi] = 'bad';
    }
    const el = document.getElementById('cn-live-score');
    if (el) el.textContent = _cnSetScore + ' / ' + CN_SETS[_cnSetIdx].questions.length;
}

function cnSubmitSet() {
    const total = CN_SETS[_cnSetIdx].questions.length;
    const panel = document.getElementById('cn-result');
    if (!panel) return;
    panel.classList.add('show');
    document.getElementById('cn-res-score').textContent = _cnSetScore + '/' + total;
    const pct = Math.round((_cnSetScore / total) * 100);
    document.getElementById('cn-res-msg').textContent =
        pct >= 90 ? '🎉 Mükemmel! Bu seti harika geçirdin!'
      : pct >= 70 ? '👏 Çok iyi! Küçük eksikler var.'
      : pct >= 50 ? '📚 Orta düzey. Eksik konulara geri dön.'
      :             '💪 Daha fazla pratik gerekiyor!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function cnRetrySameSet() { cnSwitchSet(_cnSetIdx); }
function cnNextSet()      { if (_cnSetIdx < CN_SETS.length - 1) cnSwitchSet(_cnSetIdx + 1); }

/* ════════ GLOBALS ════════ */
// openConditionalsSection ve _cnRenderSection: _initConditionalsModule içinde atandı
window.cnSwitchSet    = cnSwitchSet;
window.cnSetOpt       = cnSetOpt;
window.cnCheckSetQ    = cnCheckSetQ;
window.cnSubmitSet    = cnSubmitSet;
window.cnRetrySameSet = cnRetrySameSet;
window.cnNextSet      = cnNextSet;

(function _initConditionalsModule() {
    const _mod = new GrammarModule({
        id:       'cn',
        pageId:   'conditionals-page',
        sbId:     'sb-grammar-conditionals',
        diId:     'di-grammar-conditionals',
        title:    'Conditionals &amp; Wish Clauses',
        sections: CN_SECTIONS,
        dotColors: CN_DOT,
        grpOrder: ['Genel', 'Conditionals', 'Wish', 'Özel'],
        sectionMap: {
            'overview':    function(){ return cnOverview(); },
            'type0':       function(){ return cnType0(); },
            'type1':       function(){ return cnType1(); },
            'type2':       function(){ return cnType2(); },
            'type3':       function(){ return cnType3(); },
            'mixed1':      function(){ return cnMixed1(); },
            'mixed2':      function(){ return cnMixed2(); },
            'inversion':   function(){ return cnInversion(); },
            'other-words': function(){ return cnOtherWords(); },
            'wish':        function(){ return cnWish(); },
            'tips':        function(){ return cnTips(); },
            'exercises':   function(){ return cnExercises(); }
        },
        onSectionRender: function(id) {
            if (id === 'exercises') {
                _cnScore = 0; _cnAnswers = {}; _cnChecked = {};
                _cnUpdScore();
            }
        }
    });

    window.openConditionalsSection = function(sectionId) { _mod.open(sectionId || 'overview'); };
    window._cnRenderSection        = function(id)        { _mod.goTo(id); };
    window['_cnGoTo']              = function(id)        { _mod.goTo(id); };
})();
