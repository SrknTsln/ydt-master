// ════════════════════════════════════════════════════════════════
// conditionals.js  —  Conditionals & Wish Clauses Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Conditionals-Wish Clauses notları (s. 46–53)
// ════════════════════════════════════════════════════════════════

var _cnCurrentSection = 'overview';
var _cnAnswers = {};
var _cnChecked = {};
var _cnScore = 0;
var CN_TOTAL = 15;

var CN_SECTIONS = [
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

var CN_DOT = {
    'Genel': '#6366f1',
    'Conditionals': '#0369a1',
    'Wish': '#7e22ce',
    'Özel': '#e63946'
};

/* ════════ ENTRY POINT ════════ */
function openConditionalsSection(sectionId) {
    _cnCurrentSection = sectionId || 'overview';
    document.querySelectorAll('.container').forEach(function(c){ c.classList.add('hidden'); });
    document.querySelectorAll('.arsiv-full-page').forEach(function(c){ c.classList.add('hidden'); });
    var page = document.getElementById('conditionals-page');
    if (page) page.classList.remove('hidden');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(function(el){ el.classList.remove('active'); });
    var sb = document.getElementById('sb-grammar-conditionals');
    if (sb) sb.classList.add('active');
    var di = document.getElementById('di-grammar-conditionals');
    if (di) di.classList.add('active');
    _cnRenderPage();
}

function _cnRenderPage() {
    var page = document.getElementById('conditionals-page');
    if (!page) return;
    page.innerHTML = '<div class="gr-topbar"><button class="gr-back-btn" onclick="navTo(\'index-page\')">←</button>'
        + '<div><div class="gr-topbar-label">Grammar Modülü</div>'
        + '<div class="gr-topbar-title">Conditionals &amp; Wish Clauses</div></div></div>'
        + '<div class="gr-body"><nav class="gr-sidenav" id="cn-sidenav"></nav>'
        + '<div class="gr-content" id="cn-content"></div></div>';
    _cnBuildSidenav();
    _cnRenderSection(_cnCurrentSection);
}

function _cnBuildSidenav() {
    var nav = document.getElementById('cn-sidenav');
    if (!nav) return;
    var groups = {};
    CN_SECTIONS.forEach(function(s) {
        if (!groups[s.grp]) groups[s.grp] = [];
        groups[s.grp].push(s);
    });
    var html = '';
    ['Genel','Conditionals','Wish','Özel'].forEach(function(grp) {
        var list = groups[grp];
        if (!list) return;
        html += '<div class="gr-sn-sec">' + grp + '</div>';
        list.forEach(function(s) {
            var active = s.id === _cnCurrentSection ? ' active' : '';
            html += '<button class="gr-sn-btn' + active + '" onclick="_cnRenderSection(\'' + s.id + '\')">'
                + '<span class="gr-sn-dot" style="background:' + CN_DOT[grp] + '"></span>' + s.label + '</button>';
        });
    });
    nav.innerHTML = html;
}

function _cnRenderSection(id) {
    _cnCurrentSection = id;
    _cnBuildSidenav();
    var content = document.getElementById('cn-content');
    if (!content) return;
    content.scrollTop = 0;
    var map = {
        'overview':    cnOverview,
        'type0':       cnType0,
        'type1':       cnType1,
        'type2':       cnType2,
        'type3':       cnType3,
        'mixed1':      cnMixed1,
        'mixed2':      cnMixed2,
        'inversion':   cnInversion,
        'other-words': cnOtherWords,
        'wish':        cnWish,
        'tips':        cnTips,
        'exercises':   cnExercises
    };
    var fn = map[id];
    content.innerHTML = fn ? fn() : '<div style="padding:40px">Yakında...</div>';
    if (id === 'exercises') {
        _cnScore = 0; _cnAnswers = {}; _cnChecked = {};
        _cnUpdScore();
        document.querySelectorAll('.cn-inp').forEach(function(inp, i) {
            inp.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); cnCheckBlank(i); }
            });
        });
    }
}

/* ════════ HELPERS ════════ */
function cnH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#0c1445 0%,#0369a1 60%,#0ea5e9 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function cnSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function cnTable(headers, rows) {
    var ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    var trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function cnAcc(items) {
    var cards = items.map(function(it) {
        var exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #0369a1"><span class="gr-ex-n">'
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

function cnBox(color, title, lines) {
    var styles = {
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        sky:    'background:#f0f9ff;border:2px solid #0284c7;color:#0c4a6e',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        purple: 'background:#f5f3ff;border:2px solid #7c3aed;color:#4c1d95',
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239'
    };
    var content = lines.map(function(l){ return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>'; }).join('');
    return '<div style="' + (styles[color]||styles.sky) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 8px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

/* ════════ OVERVIEW ════════ */
function cnOverview() {
    var cards = [
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
    var cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.bd + ';border-radius:14px;padding:16px;background:' + c.bc + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' onclick="_cnRenderSection(\'' + c.id + '\')">'
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
    + '<div style="padding:0 36px 36px;text-align:center;margin-top:16px;"><button onclick="_cnRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#0369a1,#0ea5e9);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button></div>';
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
    var tips = [
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
    var cards = tips.map(function(t) {
        var rules = t.rules.map(function(r) {
            return '<div style="display:flex;gap:10px;padding:9px 13px;background:#f7f7fb;border-radius:10px;margin-top:7px;font-size:.82rem;color:#374151;line-height:1.6;">'
                + '<span style="flex-shrink:0;margin-top:1px">' + r.ico + '</span>' + r.text + '</div>';
        }).join('');
        return '<div style="background:#fff;border:1.5px solid #ebebf0;border-radius:14px;overflow:hidden;margin-bottom:10px;" onclick="this.querySelector(\'.cn-tb\').classList.toggle(\'cn-hidden\')">'
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

/* ════════ EXERCISES ════════ */
var CN_BLANKS = [
    {q:'If you ___ (not/water) plants, they die. (Type 0)',
     ans:['don\'t water','do not water'], hint:'Type 0: If + Simple Present'},
    {q:'If she ___ (study) harder, she will pass the exam. (Type 1)',
     ans:['studies'], hint:'Type 1: If + Simple Present'},
    {q:'If I ___ (be) you, I would apologize. (Type 2)',
     ans:['were'], hint:'Type 2: If + Simple Past (be → were)'},
    {q:'If we ___ (know) the date, we would have consulted our teacher. (Type 3)',
     ans:['had known'], hint:'Type 3: If + Past Perfect'},
    {q:'I wish I ___ (be) as successful as you are. (wish present)',
     ans:['were'], hint:'Wish + simple past (be → were)'},
    {q:'She wishes she ___ (study) harder for the exam. (wish past)',
     ans:['had studied'], hint:'Wish past: had + V₃'},
    {q:'___ she finish her homework, she can join us. (inversion Type 1)',
     ans:['should','Should'], hint:'Type 1 inversion: Should + özne + V₁'},
];

var CN_MCQS = [
    {q:'If it ___ tomorrow, we will cancel the picnic.',
     opts:['rains','will rain','rained','had rained'],
     cor:'a', hint:'Type 1: If + Simple Present'},
    {q:'If I ___ more money, I would travel the world.',
     opts:['have','had','have had','would have'],
     cor:'b', hint:'Type 2: If + Simple Past'},
    {q:'If she ___ the job offer, she might have lived in Paris.',
     opts:['takes','took','has taken','had taken'],
     cor:'d', hint:'Type 3: If + Past Perfect'},
    {q:'___ I you, I would apologize immediately. (inversion)',
     opts:['Should','Had','Were','If'],
     cor:'c', hint:'Type 2 inversion with "be": Were + özne'},
    {q:'You won\'t pass the exam ___ you study harder.',
     opts:['if','unless','even if','in case'],
     cor:'b', hint:'"unless" = "-mazsa/-mezse" → olumsuz koşul'},
    {q:'I wish I ___ help you, but I\'m busy right now.',
     opts:['can','will','could','would'],
     cor:'c', hint:'Wish + same subject: could (would kullanılmaz)'},
    {q:'___ the traffic, we could have arrived on time.',
     opts:['But for','Even if','Unless','In case'],
     cor:'a', hint:'"But for" = "olmasa/olmasaydı"'},
    {q:'If you ___ Italy last summer, you might have seen the Pisa Tower. (Mixed)',
     opts:['visit','visited','had visited','would visit'],
     cor:'b', hint:'Mixed Type 2: If + Simple Past → might have V₃'},
];

function cnExercises() {
    var blankCards = CN_BLANKS.map(function(q, i) {
        return '<div class="gr-q-card" id="cnq-b' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM A</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<input class="gr-q-inp cn-inp" id="cn-inp-' + i + '" placeholder="doğru yapıyı yaz…" autocomplete="off"><br>'
            + '<button class="gr-chk-btn" style="border-color:#0369a1;color:#0369a1" onclick="cnCheckBlank(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="cn-fb-b' + i + '"></div>'
            + '</div>';
    }).join('');

    var mcqCards = CN_MCQS.map(function(q, i) {
        var opts = q.opts.map(function(o, j) {
            var letter = ['A','B','C','D'][j];
            var lv = ['a','b','c','d'][j];
            return '<div class="gr-opt" id="cn-opt-' + i + '-' + j + '" onclick="cnSelectOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');
        return '<div class="gr-q-card" id="cnq-m' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM B</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#0369a1;color:#0369a1" onclick="cnCheckMCQ(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="cn-fb-m' + i + '"></div>'
            + '</div>';
    }).join('');

    return cnH('✨ Pratik Yap', 'Alıştırmalar', CN_TOTAL + ' soruluk interaktif test. Tüm conditional tipleri ve wish clauses.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="cn-live-score">0 / ' + CN_TOTAL + '</span></div>'
        + '<div class="gr-q-sec-hd">Bölüm A — Boşluk Doldurma</div>'
        + blankCards
        + '<div class="gr-q-sec-hd" style="margin-top:20px">Bölüm B — Çoktan Seçmeli</div>'
        + mcqCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#0369a1,#0ea5e9)" onclick="cnSubmitAll()">🎯 Tümünü Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="cn-result">'
        + '<div class="gr-res-score" id="cn-res-score" style="color:#0369a1">0/' + CN_TOTAL + '</div>'
        + '<div class="gr-res-lbl">Toplam Puan</div>'
        + '<div class="gr-res-msg" id="cn-res-msg"></div>'
        + '<button class="gr-retry-btn" style="border-color:#0369a1;color:#0369a1" onclick="_cnRenderSection(\'exercises\')">🔄 Tekrar Dene</button>'
        + '</div></div>';
}

/* ════════ EXERCISE LOGIC ════════ */
function _cnUpdScore() {
    var el = document.getElementById('cn-live-score');
    if (el) el.textContent = _cnScore + ' / ' + CN_TOTAL;

    if (typeof saveGrammarScore === 'function') saveGrammarScore('cn', _cnScore);
}

function cnCheckBlank(i) {
    var inp  = document.getElementById('cn-inp-' + i);
    var fb   = document.getElementById('cn-fb-b' + i);
    var card = document.getElementById('cnq-b' + i);
    if (!inp || !fb) return;
    var val = inp.value.trim().toLowerCase().replace(/\s+/g,' ');
    if (!val) { fb.textContent = 'Bir cevap girin!'; fb.className = 'gr-fb show bad'; return; }
    var correct = CN_BLANKS[i].ans.map(function(a){ return a.toLowerCase(); });
    if (correct.indexOf(val) !== -1) {
        inp.classList.add('ok'); card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + CN_BLANKS[i].ans[0];
        fb.className = 'gr-fb show ok';
        if (!_cnChecked['b'+i]) { _cnScore++; _cnChecked['b'+i] = true; _cnUpdScore(); }
    } else {
        inp.classList.add('bad'); card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + CN_BLANKS[i].ans[0] + ' — ' + CN_BLANKS[i].hint;
        fb.className = 'gr-fb show bad';
        if (!_cnChecked['b'+i]) _cnChecked['b'+i] = 'wrong';
    }
}

function cnSelectOpt(qi, oi, letter) {
    CN_MCQS[qi].opts.forEach(function(_, j) {
        var el = document.getElementById('cn-opt-' + qi + '-' + j);
        if (el) el.classList.remove('sel');
    });
    var el = document.getElementById('cn-opt-' + qi + '-' + oi);
    if (el) el.classList.add('sel');
    _cnAnswers['m'+qi] = letter;
}

function cnCheckMCQ(i) {
    var q    = CN_MCQS[i];
    var sel  = _cnAnswers['m'+i];
    var fb   = document.getElementById('cn-fb-m' + i);
    var card = document.getElementById('cnq-m' + i);
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    var letters = ['a','b','c','d'];
    q.opts.forEach(function(_, j) {
        var el = document.getElementById('cn-opt-' + i + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_cnChecked['m'+i]) { _cnScore++; _cnChecked['m'+i] = true; _cnUpdScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_cnChecked['m'+i]) _cnChecked['m'+i] = 'wrong';
    }
}

function cnSubmitAll() {
    var panel   = document.getElementById('cn-result');
    var scoreEl = document.getElementById('cn-res-score');
    var msgEl   = document.getElementById('cn-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _cnScore + '/' + CN_TOTAL;
    var pct = Math.round((_cnScore / CN_TOTAL) * 100);
    msgEl.textContent = pct >= 87 ? '🎉 Mükemmel! Conditionals & Wish konularına tam hâkimsin!'
                      : pct >= 65 ? '👏 Çok iyi! Mixed types ve inversion yapılarını biraz daha tekrar et.'
                      : pct >= 45 ? '📚 İyi başlangıç. Type tablosuna ve Wish kurallarına tekrar bak!'
                      : '💪 Daha fazla pratik yapalım. Genel bakış tablosundan başla!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════ GLOBALS ════════ */
window.openConditionalsSection = openConditionalsSection;
window._cnRenderSection        = _cnRenderSection;
window.cnCheckBlank            = cnCheckBlank;
window.cnSelectOpt             = cnSelectOpt;
window.cnCheckMCQ              = cnCheckMCQ;
window.cnSubmitAll             = cnSubmitAll;
