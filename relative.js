// ════════════════════════════════════════════════════════════════
// relative.js  —  Relative Clauses Grammar Modülü
// YDT Master Pro
// Kaynak: 10da10 YDT Relative Clauses notları (s. 54–59)
// ════════════════════════════════════════════════════════════════

var _rcCurrentSection = 'overview';
var _rcAnswers = {};
var _rcChecked = {};
var _rcScore = 0;
var RC_TOTAL = 15;

var RC_SECTIONS = [
    { id: 'overview',    label: 'Genel Bakış',                  grp: 'Genel' },
    { id: 'defining',    label: '1. Defining RC',               grp: 'Temel Türler' },
    { id: 'non-def',     label: '2. Non-Defining RC',           grp: 'Temel Türler' },
    { id: 'subject',     label: '3. Özne Konumunda',            grp: 'Relative Pronouns' },
    { id: 'object',      label: '4. Nesne Konumunda',           grp: 'Relative Pronouns' },
    { id: 'preposition', label: '5. Edat + Relative Pronoun',   grp: 'Relative Pronouns' },
    { id: 'whose',       label: '6. Whose / Of Which',          grp: 'Relative Pronouns' },
    { id: 'when',        label: '7. When',                      grp: 'Relative Pronouns' },
    { id: 'where',       label: '8. Where / Prep + Which',      grp: 'Relative Pronouns' },
    { id: 'why',         label: '9. Why / For Which',           grp: 'Relative Pronouns' },
    { id: 'reduction',   label: '10. Reduction (Kısaltma)',     grp: 'Reduction' },
    { id: 'tips',        label: 'Soru İpuçları',                grp: 'Özel' },
    { id: 'exercises',   label: 'Alıştırmalar',                 grp: 'Özel' }
];

var RC_DOT = {
    'Genel': '#6366f1',
    'Temel Türler': '#0891b2',
    'Relative Pronouns': '#047857',
    'Reduction': '#b45309',
    'Özel': '#e63946'
};

/* ════════ ENTRY POINT ════════ */
function openRelativeSection(sectionId) {
    _rcCurrentSection = sectionId || 'overview';
    document.querySelectorAll('.container').forEach(function(c){ c.classList.add('hidden'); });
    document.querySelectorAll('.arsiv-full-page').forEach(function(c){ c.classList.add('hidden'); });
    var page = document.getElementById('relative-page');
    if (page) page.classList.remove('hidden');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(function(el){ el.classList.remove('active'); });
    var sb = document.getElementById('sb-grammar-relative');
    if (sb) sb.classList.add('active');
    var di = document.getElementById('di-grammar-relative');
    if (di) di.classList.add('active');
    _rcRenderPage();
}

function _rcRenderPage() {
    var page = document.getElementById('relative-page');
    if (!page) return;
    page.innerHTML = '<div class="gr-topbar"><button class="gr-back-btn" onclick="navTo(\'index-page\')">←</button>'
        + '<div><div class="gr-topbar-label">Grammar Modülü</div>'
        + '<div class="gr-topbar-title">Relative Clauses — Sıfat Cümlecikleri</div></div></div>'
        + '<div class="gr-body"><nav class="gr-sidenav" id="rc-sidenav"></nav>'
        + '<div class="gr-content" id="rc-content"></div></div>';
    _rcBuildSidenav();
    _rcRenderSection(_rcCurrentSection);
}

function _rcBuildSidenav() {
    var nav = document.getElementById('rc-sidenav');
    if (!nav) return;
    var groups = {};
    RC_SECTIONS.forEach(function(s) {
        if (!groups[s.grp]) groups[s.grp] = [];
        groups[s.grp].push(s);
    });
    var html = '';
    ['Genel','Temel Türler','Relative Pronouns','Reduction','Özel'].forEach(function(grp) {
        var list = groups[grp];
        if (!list) return;
        html += '<div class="gr-sn-sec">' + grp + '</div>';
        list.forEach(function(s) {
            var active = s.id === _rcCurrentSection ? ' active' : '';
            html += '<button class="gr-sn-btn' + active + '" onclick="_rcRenderSection(\'' + s.id + '\')">'
                + '<span class="gr-sn-dot" style="background:' + RC_DOT[grp] + '"></span>' + s.label + '</button>';
        });
    });
    nav.innerHTML = html;
}

function _rcRenderSection(id) {
    _rcCurrentSection = id;
    _rcBuildSidenav();
    var content = document.getElementById('rc-content');
    if (!content) return;
    content.scrollTop = 0;
    var map = {
        'overview':    rcOverview,
        'defining':    rcDefining,
        'non-def':     rcNonDef,
        'subject':     rcSubject,
        'object':      rcObject,
        'preposition': rcPreposition,
        'whose':       rcWhose,
        'when':        rcWhen,
        'where':       rcWhere,
        'why':         rcWhy,
        'reduction':   rcReduction,
        'tips':        rcTips,
        'exercises':   rcExercises
    };
    var fn = map[id];
    content.innerHTML = fn ? fn() : '<div style="padding:40px">Yakında...</div>';
    if (id === 'exercises') {
        _rcScore = 0; _rcAnswers = {}; _rcChecked = {};
        _rcUpdScore();
        document.querySelectorAll('.rc-inp').forEach(function(inp, i) {
            inp.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') { e.preventDefault(); rcCheckBlank(i); }
            });
        });
    }
}

/* ════════ HELPERS ════════ */
function rcH(eyebrow, title, sub) {
    return '<div class="gr-hero" style="background:linear-gradient(135deg,#022c22 0%,#047857 60%,#10b981 100%)">'
        + '<div class="gr-hero-eyebrow">' + eyebrow + '</div>'
        + '<div class="gr-hero-title">' + title + '</div>'
        + '<div class="gr-hero-sub">' + sub + '</div>'
        + '</div>';
}
function rcSH(label) { return '<div class="gr-sec-hd">' + label + '</div>'; }

function rcTable(headers, rows) {
    var ths = headers.map(function(h){ return '<th>' + h + '</th>'; }).join('');
    var trs = rows.map(function(r){
        return '<tr>' + r.map(function(c){ return '<td>' + c + '</td>'; }).join('') + '</tr>';
    }).join('');
    return '<div class="gr-tbl-wrap"><table class="gr-tbl"><thead><tr>' + ths + '</tr></thead><tbody>' + trs + '</tbody></table></div>';
}

function rcAcc(items) {
    var cards = items.map(function(it) {
        var exHtml = (it.examples||[]).map(function(ex, i) {
            return '<div class="gr-ex" style="border-left:3px solid #047857"><span class="gr-ex-n">'
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

function rcBox(color, title, lines) {
    var styles = {
        green:  'background:#f0fdf4;border:2px solid #16a34a;color:#14532d',
        teal:   'background:#f0fdfa;border:2px solid #0d9488;color:#134e4a',
        yellow: 'background:#fefce8;border:2px solid #ca8a04;color:#713f12',
        red:    'background:#fff1f2;border:2px solid #e63946;color:#9f1239',
        blue:   'background:#eff6ff;border:2px solid #2563eb;color:#1e3a8a',
        amber:  'background:#fffbeb;border:2px solid #d97706;color:#78350f'
    };
    var content = lines.map(function(l){ return l === '' ? '<br>' : '<div style="margin-bottom:5px">' + l + '</div>'; }).join('');
    return '<div style="' + (styles[color]||styles.teal) + ';border-radius:12px;padding:14px 18px;margin:4px 36px 8px;font-size:.82rem;line-height:1.8;">'
        + (title ? '<div style="font-weight:900;margin-bottom:7px">' + title + '</div>' : '')
        + content + '</div>';
}

/* ════════ OVERVIEW ════════ */
function rcOverview() {
    var cards = [
        {id:'defining',    e:'✅', n:'Defining RC',           s:'Tanımlayıcı — virgülsüz, "that" kullanılır',    c:'#f0fdf4', b:'#6ee7b7', t:'#065f46'},
        {id:'non-def',     e:'📌', n:'Non-Defining RC',       s:'Ekstra bilgi — virgüllü, "that" kullanılmaz',   c:'#f0fdf4', b:'#6ee7b7', t:'#065f46'},
        {id:'subject',     e:'👤', n:'Özne Konumunda',        s:'who / which / that + fiil',                     c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'object',      e:'🎯', n:'Nesne Konumunda',       s:'who(m) / which / that + özne → atılabilir',     c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'preposition', e:'📎', n:'Edat + Rel. Pronoun',   s:'whom / which + preposition yerleşimi',           c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'whose',       e:'🏷️', n:'Whose / Of Which',     s:'İyelik — ardından daima isim gelir',            c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'when',        e:'⏰', n:'When',                  s:'Zaman ismi + when + tam cümle (SVO)',            c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'where',       e:'📍', n:'Where / Prep + Which', s:'Yer ismi + where + tam cümle',                  c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'why',         e:'❓', n:'Why / For Which',       s:'"reason" sonrası sebep bağlacı',                c:'#eff6ff', b:'#93c5fd', t:'#1e3a8a'},
        {id:'reduction',   e:'✂️', n:'Reduction (Kısaltma)', s:'Active: Ving | Passive: V₃ / being V₃',         c:'#fffbeb', b:'#fcd34d', t:'#713f12'},
    ];
    var cardHtml = cards.map(function(c) {
        return '<div style="border:1.5px solid ' + c.b + ';border-radius:14px;padding:16px;background:' + c.c + ';cursor:pointer;transition:all .18s;"'
            + ' onmouseover="this.style.transform=\'translateY(-3px)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.1)\'"'
            + ' onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"'
            + ' onclick="_rcRenderSection(\'' + c.id + '\')">'
            + '<div style="font-size:1.3rem;margin-bottom:8px">' + c.e + '</div>'
            + '<div style="font-size:.95rem;font-weight:900;color:#1a1a2e;margin-bottom:4px">' + c.n + '</div>'
            + '<div style="font-size:.73rem;color:' + c.t + ';line-height:1.5">' + c.s + '</div>'
            + '</div>';
    }).join('');

    return rcH('🔗 Sıfat Cümlecikleri', 'Relative Clauses', 'Bir ismi, nesneyi ya da tüm cümleyi nitelemek için kullanılan yapılar. Türkçedeki "sıfat cümlecikleri".')
        + rcSH('Hızlı Referans Tablosu')
        + rcTable(
            ['','Özne','Nesne','Sahiplik'],
            [
                ['<strong>İnsan</strong>','who / that','who(m) / that / boşluk','whose'],
                ['<strong>Cansız / Hayvan</strong>','which / that','which / that / boşluk','whose / the noun + of which'],
                ['<strong>Boşluktan sonra</strong>','fiil gelir','cümle / cümlecik gelir','isim gelir'],
            ]
        )
        + '<div style="padding:20px 36px;display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:11px">' + cardHtml + '</div>'
        + '<div style="padding:0 36px 36px;text-align:center;"><button onclick="_rcRenderSection(\'exercises\')" style="padding:14px 32px;background:linear-gradient(135deg,#047857,#10b981);border:none;border-radius:13px;color:#fff;font-size:.9rem;font-weight:900;cursor:pointer;font-family:inherit;">✨ Alıştırmalara Geç</button></div>';
}

/* ════════ DEFINING ════════ */
function rcDefining() {
    return rcH('✅ Defining', 'Defining Relative Clauses', 'Nitelediği isim hakkında tanımlayıcı bilgi verir. Ana cümleden virgülle ayrılmaz.')
        + rcBox('green','📐 Özellikler',[
            '• <strong>who, whose, whom, which, that, where, when, why</strong> kullanılır',
            '• Ana cümleden <strong>virgülle ayrılmaz</strong>',
            '• <strong>"that"</strong> kullanılabilir',
        ])
        + rcAcc([{ico:'✅', bg:'rgba(4,120,87,.12)', title:'Defining RC Örnekleri',
            examples:[
                'The woman <strong>who</strong> is talking to the teacher is the mistress.',
                'The phone <strong>which</strong> I bought last week is very quick.',
            ]}]);
}

/* ════════ NON-DEFINING ════════ */
function rcNonDef() {
    return rcH('📌 Non-Defining', 'Non-Defining Relative Clauses', 'Nitelediği isim hakkında ekstra bilgi verir; cümlenin anlaşılması için gerekli değildir.')
        + rcBox('teal','📐 Özellikler',[
            '• <strong>who, whose, whom, which, where, when</strong> kullanılır',
            '• <strong>"that" kullanılmaz</strong> — virgülden sonra that gelmez',
            '• Ana cümleden <strong>virgülle ayrılır</strong>',
        ])
        + rcAcc([{ico:'📌', bg:'rgba(4,120,87,.10)', title:'Non-Defining RC Örnekleri',
            examples:[
                'Orhan Pamuk, <strong>who</strong> won the Nobel Prize, was born on July 7, 1952.',
                'Cappadocia, <strong>where</strong> I visited last year has a characteristic rock shape that was formed about 60 million years ago.',
            ]}])
        + rcBox('red','🚫 Kritik Kural',[
            'Virgülden sonra <strong>"that" GELMEZ</strong>.',
            '• Orhan Pamuk, <s>that</s> won the Nobel Prize... ❌',
            '• Orhan Pamuk, <strong>who</strong> won the Nobel Prize... ✅',
        ]);
}

/* ════════ SUBJECT ════════ */
function rcSubject() {
    return rcH('👤 Özne', 'Relative Pronoun as Subject', 'Özne durumunda kullanılan relative pronoun ardından fiil alır — "who, which, that" kullanılır ve cümleden atılmaz.')
        + rcTable(['Nitelenen İsim','Defining','Non-Defining'],[
            ['<strong>İnsan</strong>','who / that','who (that kullanılmaz)'],
            ['<strong>Cansız / Hayvan</strong>','which / that','which (that kullanılmaz)'],
        ])
        + rcAcc([
            {ico:'👤', bg:'rgba(4,120,87,.12)', title:'İnsan — who / that',
             desc:'İnsanları nitelerken "who/that" ifadeleri kullanılır. Non-defining ifadelerde "that" kullanılmaz.',
             examples:[
                'There are several renowned writers <strong>who/that</strong> lived in the 16th century.',
             ]},
            {ico:'📦', bg:'rgba(4,120,87,.10)', title:'Cansız / Hayvan — which / that',
             desc:'"which" insan dışındaki nesneler ve hayvanlar için kullanılır. "that" joker eleman olarak "who-which" yerine yalnızca defining relative clause ifadelerle kullanılabilir.',
             examples:[
                'The book <strong>which/that</strong> has a riveting story is at the top of the list.',
             ]},
        ]);
}

/* ════════ OBJECT ════════ */
function rcObject() {
    return rcH('🎯 Nesne', 'Relative Pronoun as Object', 'Nesne durumunda kullanılan relative pronoun ardından fiil değil başka bir özne (S+V) alır — atılabilir.')
        + rcBox('teal','📐 Özellikler',[
            '• "who, whom, which, that" kullanılır',
            '• Nesne konumundaki relative pronoun <strong>cümleden atılabilir</strong>',
            '• Özne konumundaki ifadeler <strong>atılamaz</strong>',
        ])
        + rcAcc([{ico:'🎯', bg:'rgba(4,120,87,.12)', title:'Nesne Konumunda Örnekleri',
            desc:'Defining relative clause cümlelerinde nesne durumunda kullanılan "who, whom, which, that" ifadeleri cümleden atılabilir.',
            examples:[
                'The book <strong>which/that</strong> I have been reading for a week has a riveting story.',
                'The film <strong>(which/that)</strong> I watched last night was very horrible. (atılabilir)',
                'The musician <strong>who(m)/that</strong> the viewers applauded is performing again next week.',
                'The writer <strong>(who(m)/that)</strong> we met at the conference is known for her fictional novels.',
            ]}]);
}

/* ════════ PREPOSITION ════════ */
function rcPreposition() {
    return rcH('📎 Edat + Relative Pronoun', 'Object of Preposition', 'Nesne durumundaki relative pronoun cümlede preposition (ilgeç) ile birlikte kullanılıyorsa; ilgecin yeri değişebilir.')
        + rcBox('teal','📐 İlgeç Kullanımı',[
            '• "who, whom, which, that" kullanılır',
            '• İlgeç ya aynı yerinde kalır ya da relative pronoun\'un önüne gelir',
            '• Preposition + whom / which → <strong>formal</strong> kullanım',
        ])
        + rcAcc([{ico:'📎', bg:'rgba(4,120,87,.12)', title:'Preposition ile Örnekler',
            examples:[
                'The employer <strong>who(m)/that</strong> my father worked <strong>with</strong> for five years died last year.',
                'The employer <strong>with whom</strong> my father worked for five years died last year.',
            ]}]);
}

/* ════════ WHOSE ════════ */
function rcWhose() {
    return rcH('🏷️ İyelik', 'Whose / The Noun + Of Which', 'Bir şeyin başka bir şeye ait olduğunu belirtirken kullanılır. Ardından daima isim alır — "whose" cümleden çıkarılamaz.')
        + rcBox('teal','📐 Kural',[
            '• <strong>whose</strong>: İnsan ve hayvanlar için iyelik',
            '• <strong>the noun + of which</strong>: İnsan dışı varlıklar için',
            '• Ardından <strong>daima isim</strong> alır',
            '• "whose" cümleden <strong>çıkarılamaz</strong>',
        ])
        + rcAcc([{ico:'🏷️', bg:'rgba(4,120,87,.12)', title:'Whose / Of Which Örnekleri',
            examples:[
                'Gustave Flaubert, <strong>whose</strong> works are popular, was born in France.',
                'The frame, <strong>the color of which</strong> was painted by the artist, was stolen.',
            ]}]);
}

/* ════════ WHEN ════════ */
function rcWhen() {
    return rcH('⏰ Zaman', 'When', 'Nitelenen isim "day, time, year" gibi zaman belirtiyorsa "when" kullanılır — ardından tam cümle (SVO) gelir.')
        + rcBox('teal','📐 Kural',[
            '• Zaman bildiren isimler + <strong>when</strong> + tam cümle (SVO)',
            '• Zamanını belirteceğimiz isim herhangi bir edatla sahipse → <strong>"which"</strong> kullanılır, ilgeç "which" ifadesinin başına getirilir',
        ])
        + rcAcc([{ico:'⏰', bg:'rgba(4,120,87,.12)', title:'When Örnekleri',
            examples:[
                '2021 was the year <strong>when</strong> I graduated from high school.',
                '2021 was the year <strong>in which</strong> I graduated from high school.',
            ]}]);
}

/* ════════ WHERE ════════ */
function rcWhere() {
    return rcH('📍 Yer', 'Where / Preposition + Which / That', 'Tanımlanan ismin yerini belirtirken kullanılır. "where" ardından tam cümle (SVO), "prep + which" ardından yarım cümle (SV/VO) alır.')
        + rcBox('teal','📐 Kural',[
            '• <strong>where</strong> + tam cümle (SVO) → "nerede, nereye?" sorularına yanıt verir',
            '• <strong>preposition + which/that</strong> + yarım cümle (SV/VO)',
            '• İlgecin yeri değişkenlik gösterebilir ya da yalnızca ilgeçle de kullanılabilir',
            '• Dolaylı tümleç anlamı dışında cümlede özne/nesne olarak kullanıldığında "which" ya da "that" kullanılır',
        ])
        + rcAcc([{ico:'📍', bg:'rgba(4,120,87,.12)', title:'Where / Which / That Örnekleri',
            examples:[
                'I live in a city <strong>where</strong> the cost of living is high.',
                'The city <strong>in which</strong> I lived has a high cost of living.',
                'The city <strong>which/that</strong> I lived <strong>in</strong> has a high cost of living.',
                'The city I lived <strong>in</strong> has a high cost of living. (relative pronoun atılmış)',
                'My husband took me to a restaurant <strong>which/that</strong> serves delicious Greek food.',
            ]}]);
}

/* ════════ WHY ════════ */
function rcWhy() {
    return rcH('❓ Sebep', 'Why / For Which / That', 'Sebep ifade eden cümlelerle kullanılır ve "reason" kelimesi ardından gelir.')
        + rcBox('teal','📐 Kural',[
            '• <strong>why / for which / that</strong> → "reason" sözcüğü ardından gelir',
            '• Bazı cümlelerde "reason" sözcüğünden sonra "why" ya da "for which" kullanılmaz',
            '• Çünkü "...nın sebebi/gerekçesi" anlamına gelir; sebep ve sonuç bellidir',
        ])
        + rcAcc([
            {ico:'❓', bg:'rgba(4,120,87,.12)', title:'Why / For Which Örnekleri',
             examples:[
                'No one knows the reason <strong>why/for which/that</strong> he left.',
                'The reason I failed the exam is that I didn\'t study enough. (why/that atılmış)',
             ]},
            {ico:'💡', bg:'rgba(4,120,87,.10)', title:'BİLMELİSİN! — "which" tüm cümleyi niteleyebilir',
             desc:'"which" ifadesi tüm cümleyi de niteleyebilir ve bu kullanımda "…ki bu" anlamına gelir.',
             examples:[
                'The weather was terrible, <strong>which</strong> made our plan impossible.',
             ]},
        ]);
}

/* ════════ REDUCTION ════════ */
function rcReduction() {
    return rcH('✂️ Kısaltma', 'Reduction of Relative Clauses', 'Sıfat cümleciklerini kısaltarak kullanabilirsiniz ve burada cümledeki anlam bozulmaz.')
        + rcSH('Active Reduction')
        + rcBox('green','📐 Active Reduction Kuralı',[
            'Etken yapılı cümlelerde, zamanın ne olduğu fark etmeksizin relative pronoun cümleden atılır ve fiil <strong>"V + ing"</strong> takısı alır.',
        ])
        + rcAcc([{ico:'⚡', bg:'rgba(4,120,87,.12)', title:'Active Reduction Örnekleri',
            examples:[
                'The girl <strong>who is standing</strong> has red glasses. → The girl <strong>standing</strong> has red glasses.',
                'The watch <strong>which/that sits</strong> on the shelf is not mine. → The watch <strong>sitting</strong> on the shelf is not mine.',
            ]}])
        + rcSH('Passive Reduction')
        + rcBox('teal','📐 Passive Reduction Kuralı',[
            'Edilgen yapılı cümlelerde:',
            '• Simple past, simple present, present perfect, past perfect → <strong>V₃</strong>',
            '• Progressive yapılarda → <strong>being V₃</strong>',
        ])
        + rcAcc([{ico:'🔷', bg:'rgba(4,120,87,.10)', title:'Passive Reduction Örnekleri',
            examples:[
                'The man <strong>who was seen</strong> in the street is a police officer. → The woman <strong>seen</strong> in the street is a police officer.',
                'The school <strong>which is being built</strong> will be the most well-equipped school. → The school <strong>being built</strong> will be the most well-equipped school.',
            ]}])
        + rcSH('Be + Preposition / Be + Adjective Phrase')
        + rcAcc([
            {ico:'📎', bg:'rgba(180,83,9,.12)', title:'Be + Preposition → Kısaltma',
             desc:'"to be" fiilinden sonra gelen edatlar atılarak kısaltma yapılabilir.',
             examples:[
                'The girl <strong>who was in</strong> the room was crying. → The girl <strong>in</strong> the room was crying.',
             ]},
            {ico:'🏷️', bg:'rgba(180,83,9,.10)', title:'Be + Adjective Phrase → Kısaltma',
             desc:'"to be" fiilinden sonra sıfat geldiğinde kısaltma yapılabilir.',
             examples:[
                'We shouldn\'t allow our children to make friends <strong>who are not appropriate</strong> for them.',
                '→ We shouldn\'t allow our children to make friends <strong>not appropriate</strong> for them.',
             ]},
        ]);
}

/* ════════ TIPS ════════ */
function rcTips() {
    var tips = [
        {num:'01', title:'Boşluktan sonra fiil varsa → özne konumunda → who / which / that gelir.',
         rules:[
            {ico:'💡', text:'Boşluktan sonra fiil geliyorsa bu cümle özne durumundadır → <strong>who / which / that</strong>'},
            {ico:'✅', text:'The woman ___ is talking to the teacher → <strong>who / that</strong>'},
         ]},
        {num:'02', title:'Boşluktan sonra cümle/cümlecik varsa → nesne konumunda → who, whom, which, that.',
         rules:[
            {ico:'💡', text:'Boşluktan sonra fiil değil de cümle/cümlecik varsa nesne durumundadır → <strong>who, whom, which, that</strong>'},
            {ico:'✅', text:'The book ___ I have been reading → <strong>which / that</strong> (ya da boşluk)'},
         ]},
        {num:'03', title:'Virgülden sonra "that" gelmez.',
         rules:[
            {ico:'🚫', text:'Non-defining RC\'de virgülden sonra <strong>"that" KULLANILMAZ</strong>'},
            {ico:'✅', text:'Orhan Pamuk, <strong>who</strong> won the Nobel Prize... ✅'},
            {ico:'❌', text:'Orhan Pamuk, <s>that</s> won the Nobel Prize... ❌'},
         ]},
        {num:'04', title:'Boşluktan önce "noun, noun" varsa → of which / of whom gelir.',
         rules:[
            {ico:'💡', text:'"of whom" insanlar için, "of which" cansız varlıklar ve hayvanlar için kullanılır'},
            {ico:'✅', text:'the color <strong>of which</strong> / a member <strong>of whom</strong>'},
         ]},
        {num:'05', title:'Boşluktan önce preposition (of, in, on…) varsa → whom / which / whose gelir; "that" kullanılmaz.',
         rules:[
            {ico:'🚫', text:'Edat + <s>that</s> ❌'},
            {ico:'✅', text:'with <strong>whom</strong> / in <strong>which</strong> / of <strong>whose</strong> ✅'},
         ]},
        {num:'06', title:'Boşluktan önce quantifier (miktar) ifadesi varsa → of which / of whom / of whose gelir.',
         rules:[
            {ico:'💡', text:'"of which" → cansız varlıklar/hayvanlar | "of whom" → insanlar | "of whose" → insanlar ve cansız varlıklar'},
         ]},
        {num:'07', title:'Yer + tam cümle (SVO) = boşluğa "where" gelir.',
         rules:[{ico:'✅', text:'I live in a city ___ the cost of living is high → <strong>where</strong>'}]},
        {num:'08', title:'Yer + fiil = boşluğa "which, that" gelir.',
         rules:[{ico:'✅', text:'The city ___ I lived in has a high cost of living → <strong>which / that</strong> (ya da boşluk)'}]},
        {num:'09', title:'Zaman + fiil = "which, that" gelir.',
         rules:[{ico:'✅', text:'It was a time ___ seemed peaceful → <strong>which / that</strong>'}]},
        {num:'10', title:'Zaman + tam cümle (SVO) = boşluğa "when" gelir.',
         rules:[{ico:'✅', text:'2021 was the year ___ I graduated → <strong>when</strong>'}]},
        {num:'11', title:'"When" zaman ifadesi yerine "in which / during which / at which" kullanılabilir.',
         rules:[{ico:'💡', text:'"in which" aylar ve yıllar | "during which" süreç | "at which" saatler için tercih edilir'}]},
    ];
    var cards = tips.map(function(t) {
        var rules = t.rules.map(function(r) {
            return '<div style="display:flex;gap:10px;padding:9px 13px;background:#f7f7fb;border-radius:10px;margin-top:7px;font-size:.82rem;color:#374151;line-height:1.6;">'
                + '<span style="flex-shrink:0;margin-top:1px">' + r.ico + '</span>' + r.text + '</div>';
        }).join('');
        return '<div style="background:#fff;border:1.5px solid #ebebf0;border-radius:14px;overflow:hidden;margin-bottom:10px;" onclick="this.querySelector(\'.rc-tb\').classList.toggle(\'rc-hidden\')">'
            + '<div style="display:flex;align-items:center;gap:12px;padding:13px 18px;background:#f7f7fb;cursor:pointer;">'
            + '<span style="font-size:.6rem;font-weight:900;color:#047857;background:#f0fdf4;border-radius:7px;padding:3px 9px;flex-shrink:0;font-family:\'Courier New\',monospace;">İPUCU ' + t.num + '</span>'
            + '<span style="flex:1;font-size:.87rem;font-weight:800;color:#1a1a2e">' + t.title + '</span>'
            + '<span style="font-size:.9rem;color:#767687">⌄</span>'
            + '</div>'
            + '<div class="rc-tb" style="padding:16px 20px;">' + rules + '</div>'
            + '</div>';
    }).join('');
    return rcH('🎯 Soru Çözme', 'Soru Çözerken İpuçları', '11 kritik ipucu — ÖSYM ve YDT sınavlarında Relative Clauses sorularını çözerken dikkat et.')
        + '<div style="padding:24px 36px 36px">' + cards + '</div>';
}

/* ════════ EXERCISES ════════ */
var RC_BLANKS = [
    {q:'The woman ___ is talking to the teacher is the mistress.',
     ans:['who','that'], hint:'Özne + fiil gelmiş → who / that'},
    {q:'Orhan Pamuk, ___ won the Nobel Prize, was born in 1952.',
     ans:['who'], hint:'Non-defining RC + virgülden sonra "that" gelmez → who'},
    {q:'2021 was the year ___ I graduated from high school.',
     ans:['when','in which'], hint:'Zaman ismi + tam cümle → when / in which'},
    {q:'I live in a city ___ the cost of living is high.',
     ans:['where'], hint:'Yer ismi + tam cümle (SVO) → where'},
    {q:'Gustave Flaubert, ___ works are popular, was born in France.',
     ans:['whose'], hint:'İyelik → whose (ardından isim "works" gelmiş)'},
    {q:'The book ___ I have been reading for a week has a riveting story.',
     ans:['which','that',''], hint:'Nesne konumu → which / that (ya da boşluk)'},
    {q:'No one knows the reason ___ he left.',
     ans:['why','for which','that'], hint:'"reason" ardından → why / for which / that'},
];

var RC_MCQS = [
    {q:'The phone ___ I bought last week is very quick.',
     opts:['who','whom','which','whose'],
     cor:'c', hint:'Cansız nesne + nesne konumu → which'},
    {q:'Cappadocia, ___ I visited last year, has a characteristic rock shape.',
     opts:['that','which','where','who'],
     cor:'c', hint:'Non-defining + yer ismi + tam cümle → where (that kullanılmaz)'},
    {q:'The employer ___ my father worked with died last year.',
     opts:['who','which','whose','whom'],
     cor:'d', hint:'İnsan + nesne konumu → whom'},
    {q:'The frame, the color ___ was painted by the artist, was stolen.',
     opts:['of which','of whom','whose','which'],
     cor:'a', hint:'"the color" + cansız varlık → of which'},
    {q:'The girl ___ standing has red glasses. (reduction)',
     opts:['who is','which is','who','is'],
     cor:'a', hint:'Active reduction: who is standing → standing (who is atılır)'},
    {q:'___ you agree to repay it, I will lend you the money. (Relative Clause değil, yanlış seçenek bul)',
     opts:['The man who','The book which','The reason why','Provided that'],
     cor:'d', hint:'"Provided that" relative clause değil, conditional bağlaç'},
    {q:'There are several renowned writers ___ lived in the 16th century.',
     opts:['whose','whom','which','who'],
     cor:'d', hint:'İnsan + özne konumu + fiil gelmiş → who'},
    {q:'The school ___ is being built will be the most well-equipped. (full form)',
     opts:['which','where','whose','whom'],
     cor:'a', hint:'Cansız + özne + passive → which'},
];

function rcExercises() {
    var blankCards = RC_BLANKS.map(function(q, i) {
        return '<div class="gr-q-card" id="rcq-b' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM A</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<input class="gr-q-inp rc-inp" id="rc-inp-' + i + '" placeholder="relative pronoun yaz…" autocomplete="off"><br>'
            + '<button class="gr-chk-btn" style="border-color:#047857;color:#047857" onclick="rcCheckBlank(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="rc-fb-b' + i + '"></div>'
            + '</div>';
    }).join('');

    var mcqCards = RC_MCQS.map(function(q, i) {
        var opts = q.opts.map(function(o, j) {
            var letter = ['A','B','C','D'][j];
            var lv = ['a','b','c','d'][j];
            return '<div class="gr-opt" id="rc-opt-' + i + '-' + j + '" onclick="rcSelectOpt(' + i + ',' + j + ',\'' + lv + '\')">'
                + '<span class="gr-opt-letter">' + letter + '</span>' + o + '</div>';
        }).join('');
        return '<div class="gr-q-card" id="rcq-m' + i + '">'
            + '<div class="gr-q-num">SORU ' + String(i+1).padStart(2,'0') + ' / BÖLÜM B</div>'
            + '<div class="gr-q-text">' + q.q + '</div>'
            + '<div class="gr-mcq">' + opts + '</div>'
            + '<button class="gr-chk-btn" style="margin-top:10px;border-color:#047857;color:#047857" onclick="rcCheckMCQ(' + i + ')">Kontrol Et</button>'
            + '<div class="gr-fb" id="rc-fb-m' + i + '"></div>'
            + '</div>';
    }).join('');

    return rcH('✨ Pratik Yap', 'Alıştırmalar', RC_TOTAL + ' soruluk interaktif test. Relative pronouns ve reduction yapılarını pekiştir.')
        + '<div class="gr-quiz-wrap">'
        + '<div class="gr-score-bar"><span class="gr-score-label">Canlı Puan</span><span class="gr-score-val" id="rc-live-score">0 / ' + RC_TOTAL + '</span></div>'
        + '<div class="gr-q-sec-hd">Bölüm A — Boşluk Doldurma</div>'
        + blankCards
        + '<div class="gr-q-sec-hd" style="margin-top:20px">Bölüm B — Çoktan Seçmeli</div>'
        + mcqCards
        + '<button class="gr-submit-btn" style="background:linear-gradient(135deg,#047857,#10b981)" onclick="rcSubmitAll()">🎯 Tümünü Değerlendir & Sonucu Gör</button>'
        + '<div class="gr-result" id="rc-result">'
        + '<div class="gr-res-score" id="rc-res-score" style="color:#047857">0/' + RC_TOTAL + '</div>'
        + '<div class="gr-res-lbl">Toplam Puan</div>'
        + '<div class="gr-res-msg" id="rc-res-msg"></div>'
        + '<button class="gr-retry-btn" style="border-color:#047857;color:#047857" onclick="_rcRenderSection(\'exercises\')">🔄 Tekrar Dene</button>'
        + '</div></div>';
}

/* ════════ EXERCISE LOGIC ════════ */
function _rcUpdScore() {
    var el = document.getElementById('rc-live-score');
    if (el) el.textContent = _rcScore + ' / ' + RC_TOTAL;

    if (typeof saveGrammarScore === 'function') saveGrammarScore('rc', _rcScore);
}

function rcCheckBlank(i) {
    var inp  = document.getElementById('rc-inp-' + i);
    var fb   = document.getElementById('rc-fb-b' + i);
    var card = document.getElementById('rcq-b' + i);
    if (!inp || !fb) return;
    var val = inp.value.trim().toLowerCase().replace(/\s+/g,' ');
    var correct = RC_BLANKS[i].ans.map(function(a){ return a.toLowerCase(); });
    if (correct.indexOf(val) !== -1 || val === '') {
        if (val === '' && correct.indexOf('') === -1) {
            fb.textContent = 'Bir cevap girin!'; fb.className = 'gr-fb show bad'; return;
        }
        inp.classList.add('ok'); card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + (RC_BLANKS[i].ans[0] || '(boşluk)');
        fb.className = 'gr-fb show ok';
        if (!_rcChecked['b'+i]) { _rcScore++; _rcChecked['b'+i] = true; _rcUpdScore(); }
    } else {
        inp.classList.add('bad'); card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + RC_BLANKS[i].ans[0] + ' — ' + RC_BLANKS[i].hint;
        fb.className = 'gr-fb show bad';
        if (!_rcChecked['b'+i]) _rcChecked['b'+i] = 'wrong';
    }
}

function rcSelectOpt(qi, oi, letter) {
    RC_MCQS[qi].opts.forEach(function(_, j) {
        var el = document.getElementById('rc-opt-' + qi + '-' + j);
        if (el) el.classList.remove('sel');
    });
    var el = document.getElementById('rc-opt-' + qi + '-' + oi);
    if (el) el.classList.add('sel');
    _rcAnswers['m'+qi] = letter;
}

function rcCheckMCQ(i) {
    var q    = RC_MCQS[i];
    var sel  = _rcAnswers['m'+i];
    var fb   = document.getElementById('rc-fb-m' + i);
    var card = document.getElementById('rcq-m' + i);
    if (!sel) { fb.textContent = 'Bir seçenek seçin!'; fb.className = 'gr-fb show bad'; return; }
    var letters = ['a','b','c','d'];
    q.opts.forEach(function(_, j) {
        var el = document.getElementById('rc-opt-' + i + '-' + j);
        if (!el) return;
        el.classList.remove('sel');
        if (letters[j] === q.cor) el.classList.add('ok');
        else if (letters[j] === sel && sel !== q.cor) el.classList.add('bad');
    });
    if (sel === q.cor) {
        card.classList.add('gr-c');
        fb.textContent = '✅ Doğru! ' + q.hint;
        fb.className = 'gr-fb show ok';
        if (!_rcChecked['m'+i]) { _rcScore++; _rcChecked['m'+i] = true; _rcUpdScore(); }
    } else {
        card.classList.add('gr-w');
        fb.textContent = '❌ Yanlış. Doğru: ' + q.cor.toUpperCase() + '. ' + q.hint;
        fb.className = 'gr-fb show bad';
        if (!_rcChecked['m'+i]) _rcChecked['m'+i] = 'wrong';
    }
}

function rcSubmitAll() {
    var panel   = document.getElementById('rc-result');
    var scoreEl = document.getElementById('rc-res-score');
    var msgEl   = document.getElementById('rc-res-msg');
    if (!panel) return;
    panel.classList.add('show');
    scoreEl.textContent = _rcScore + '/' + RC_TOTAL;
    var pct = Math.round((_rcScore / RC_TOTAL) * 100);
    msgEl.textContent = pct >= 87 ? '🎉 Mükemmel! Relative Clauses konusuna tam hâkimsin!'
                      : pct >= 65 ? '👏 Çok iyi! Reduction ve preposition kullanımını biraz daha tekrar et.'
                      : pct >= 45 ? '📚 İyi başlangıç. Defining/Non-defining farkını ve whose/where/when kurallarını tekrar et!'
                      : '💪 Daha fazla pratik yapalım. İpuçları bölümünden başla!';
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ════════ GLOBALS ════════ */
window.openRelativeSection = openRelativeSection;
window._rcRenderSection    = _rcRenderSection;
window.rcCheckBlank        = rcCheckBlank;
window.rcSelectOpt         = rcSelectOpt;
window.rcCheckMCQ          = rcCheckMCQ;
window.rcSubmitAll         = rcSubmitAll;
