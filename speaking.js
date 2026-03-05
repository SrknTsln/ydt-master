// ════════════════════════════════════════════════════════════════
// speaking.js  —  Günlük İngilizce Konuşma Modülü  [v3 — Temiz Tasarım]
// YDT Master Pro — navTo/arsiv-full-page sistemiyle tam entegre
// ════════════════════════════════════════════════════════════════

/* ── State ── */
let _spSection   = 'overview';
let _spCardIdx   = 0;
let _spCardFront = true;
let _spCardDeck  = [];
let _spAiHistory = [];
let _spAiLoading = false;
let _spAiTopic   = null;
let _spSynth     = window.speechSynthesis || null;
let _spActiveCat = 'Tümü';

/* ── Section metadata ── */
const SP_SECS = [
    { id:'overview',      label:'Genel Bakış',          cat:'' },
    { id:'greetings',     label:'Selamlaşma & Tanışma',  cat:'daily' },
    { id:'opinions',      label:'Fikir Bildirme',         cat:'daily' },
    { id:'smalltalk',     label:'Small Talk',             cat:'daily' },
    { id:'shopping',      label:'Alışveriş & Sipariş',    cat:'daily' },
    { id:'directions',    label:'Yol & Konum',            cat:'daily' },
    { id:'transitions',   label:'Bağlayıcı İfadeler',     cat:'daily' },
    { id:'phrasal',       label:'Phrasal Verbs',           cat:'daily' },
    { id:'hesitation',    label:'Hesitation & Repair',     cat:'daily' },
    { id:'register',      label:'Formal vs Informal',      cat:'daily' },
    { id:'interview',     label:'İş & Sunum Dili',         cat:'daily' },
    { id:'pronunciation', label:'🔊 Telaffuz Rehberi',    cat:'' },
    { id:'flashcards',    label:'🃏 Flashcard',            cat:'' },
    { id:'ai-chat',       label:'🤖 AI Konuşma Pratiği',  cat:'' },
];

const SP_DOTS   = { daily:'#059669', '':'#aaa' };
const SP_LABELS = { daily:'Günlük Konuşma', '':'Genel' };
const SP_ORDER  = ['', 'daily'];

/* ════════════════════════════════════════════════════
   SHARED STYLES
════════════════════════════════════════════════════ */
const SP_GLOBAL_CSS = `
<style>
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

.sp-wrap * { box-sizing: border-box; }

/* ══ HERO — tek katmanlı gradient, sade & net ══ */
.sp-hero {
    position: relative;
    overflow: hidden;
    padding: 32px 32px 36px;
}
.sp-hero::after {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 240px; height: 240px;
    border-radius: 50%;
    background: rgba(255,255,255,.07);
    pointer-events: none;
}
.sp-hero-blob {
    position: absolute;
    bottom: -30px; right: -20px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,.06);
    pointer-events: none;
}
.sp-hero-blob2 {
    position: absolute;
    top: 20px; right: 110px;
    width: 70px; height: 70px;
    border-radius: 50%;
    background: rgba(255,255,255,.07);
    pointer-events: none;
}
.sp-hero-inner { position: relative; z-index: 1; }
.sp-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(255,255,255,.2);
    border: 1px solid rgba(255,255,255,.3);
    border-radius: 20px;
    padding: 5px 14px;
    font-size: .68rem;
    font-weight: 800;
    margin-bottom: 12px;
    letter-spacing: .07em;
    text-transform: uppercase;
    color: #fff;
}
.sp-hero-title {
    font-family: 'Nunito', sans-serif;
    font-size: 1.7rem;
    font-weight: 900;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 8px;
    letter-spacing: -.02em;
}
.sp-hero-sub {
    font-size: .875rem;
    color: rgba(255,255,255,.85);
    line-height: 1.65;
    max-width: 480px;
    font-weight: 500;
}

/* ══ SECTION HEADER ══ */
.sp-sh {
    font-size: .68rem;
    font-weight: 800;
    color: var(--ink3);
    text-transform: uppercase;
    letter-spacing: 1.4px;
    padding: 22px 24px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.sp-sh::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
}

/* ══ PATTERN TABLE ══ */
.sp-tbl {
    margin: 0 24px 20px;
    border-radius: 14px;
    overflow: hidden;
    border: 1.5px solid var(--border);
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,.04);
}
.sp-row {
    display: grid;
    grid-template-columns: 1.1fr 1.4fr auto;
    align-items: center;
    border-bottom: 1px solid var(--border);
    transition: background .12s;
}
.sp-row:last-child { border-bottom: none; }
.sp-row:hover { background: #f8fafc; }
.sp-row-tr {
    padding: 11px 16px;
    font-size: .84rem;
    color: var(--ink2);
}
.sp-row-en {
    padding: 11px 16px;
    font-size: .84rem;
    font-weight: 700;
    color: #059669;
    border-left: 1px solid var(--border);
}
.sp-row-spk {
    padding: 8px 14px;
    border-left: 1px solid var(--border);
}
.sp-spk-btn {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 8px;
    cursor: pointer;
    font-size: .88rem;
    padding: 5px 8px;
    transition: all .12s;
    line-height: 1;
    display: flex; align-items: center; justify-content: center;
}
.sp-spk-btn:hover { background: #dcfce7; transform: scale(1.12); }

/* ══ INFO / TIP BOX ══ */
.sp-box {
    margin: 0 24px 24px;
    border-radius: 14px;
    padding: 18px 20px;
    border: 1.5px solid;
}
.sp-box-title {
    font-size: .8rem;
    font-weight: 800;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 6px;
}
.sp-box-line {
    font-size: .84rem;
    line-height: 1.75;
    padding: 1px 0;
}

/* ══ DIALOG EXAMPLE BOX ══ */
.sp-example {
    margin: 0 24px 20px;
    border-radius: 14px;
    overflow: hidden;
    border: 1.5px solid var(--border);
    background: #fff;
    box-shadow: 0 2px 6px rgba(0,0,0,.04);
}
.sp-example-head {
    padding: 8px 16px;
    font-size: .68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
    border-bottom: 1px solid var(--border);
}
.sp-example-body {
    padding: 14px 16px;
    font-size: .84rem;
    line-height: 1.8;
    color: var(--ink2);
}
.sp-ex-a { color: #1d4ed8; font-weight: 700; }
.sp-ex-b { color: #059669; font-weight: 700; }

/* ══ OVERVIEW ══ */
.sp-ov-wrap { padding: 24px 24px 8px; }
.sp-ov-section-label {
    font-size: .65rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.4px;
    color: var(--ink3);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.sp-ov-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
}
.sp-ov-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 20px;
}
.sp-ov-card {
    cursor: pointer;
    border-radius: 16px;
    border: 1.5px solid transparent;
    padding: 18px 14px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    transition: transform .18s, box-shadow .18s;
    text-align: left;
    position: relative;
    overflow: hidden;
}
.sp-ov-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(0,0,0,.12);
}
.sp-ov-card:active { transform: scale(.96); }
.sp-ov-icon {
    width: 44px; height: 44px;
    border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.4rem;
    flex-shrink: 0;
    margin-bottom: 2px;
}
.sp-ov-title {
    font-size: .86rem;
    font-weight: 800;
    line-height: 1.25;
    color: var(--ink);
}
.sp-ov-desc {
    font-size: .72rem;
    color: var(--ink3);
    line-height: 1.4;
}
.sp-ov-count {
    font-size: .65rem;
    font-weight: 800;
    padding: 3px 8px;
    border-radius: 10px;
    margin-top: 2px;
}

/* ══ STATS ROW ══ */
.sp-stats-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin: 0 24px 24px;
}
.sp-stat-card {
    border-radius: 14px;
    padding: 18px 14px;
    text-align: center;
    border: 1.5px solid var(--border);
    background: #fff;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.sp-stat-num {
    font-size: 1.6rem;
    font-weight: 900;
    line-height: 1;
    margin-bottom: 5px;
    font-family: 'Nunito', sans-serif;
}
.sp-stat-lbl {
    font-size: .7rem;
    color: var(--ink3);
    font-weight: 600;
}

/* ══ FLASHCARD ══ */
.sp-fc-card {
    cursor: pointer;
    min-height: 190px;
    border-radius: 20px;
    padding: 32px 28px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    max-width: 520px;
    margin: 0 auto;
    transition: transform .15s, box-shadow .15s;
    position: relative;
    overflow: hidden;
}
.sp-fc-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 36px rgba(5,150,105,.18);
}
.sp-fc-card-bg { position: absolute; inset: 0; z-index: 0; }
.sp-fc-card-content { position: relative; z-index: 1; width: 100%; }

/* ══ CHAT ══ */
.sp-msg-u {
    align-self: flex-end;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: #fff;
    padding: 11px 16px;
    border-radius: 18px 18px 4px 18px;
    font-size: .86rem;
    max-width: 82%;
    box-shadow: 0 2px 10px rgba(29,78,216,.25);
    line-height: 1.55;
}
.sp-msg-a {
    align-self: flex-start;
    background: #fff;
    border: 1.5px solid var(--border);
    color: var(--ink);
    padding: 11px 16px;
    border-radius: 18px 18px 18px 4px;
    font-size: .86rem;
    max-width: 86%;
    line-height: 1.65;
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
}
.sp-msg-e {
    align-self: center;
    background: #fef2f2;
    color: #991b1b;
    padding: 7px 13px;
    border-radius: 10px;
    font-size: .78rem;
}

/* ══ TOPIC CARD (AI) ══ */
.sp-topic-card {
    cursor: pointer;
    border-radius: 14px;
    border: 1.5px solid var(--border);
    background: #fff;
    overflow: hidden;
    transition: all .18s;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
}
.sp-topic-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 18px rgba(59,130,246,.15);
    transform: translateY(-2px);
}
.sp-topic-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.3rem;
    flex-shrink: 0;
}
.sp-topic-label {
    font-size: .84rem;
    font-weight: 700;
    color: var(--ink);
    line-height: 1.3;
}
.sp-topic-desc {
    font-size: .72rem;
    color: var(--ink3);
    margin-top: 2px;
}

/* ══ IPA ══ */
.sp-ipa-card {
    margin: 0 24px 10px;
    background: #fff;
    border: 1.5px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
}
.sp-ipa-head {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 14px 18px;
    background: var(--bg);
    transition: background .12s;
}
.sp-ipa-head:hover { background: #f1f5f9; }
.sp-ipa-badge {
    font-family: monospace;
    font-size: 1.1rem;
    font-weight: 900;
    padding: 4px 10px;
    border-radius: 8px;
    flex-shrink: 0;
}
.sp-ipa-body {
    padding: 14px 18px;
    border-top: 1px solid var(--border);
    display: none;
}
.sp-ipa-body.open { display: block; }
.sp-word-chip {
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: 10px;
    padding: 7px 12px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: .88rem;
    margin: 4px;
    transition: all .12s;
}
.sp-word-chip:hover { border-color: #059669; background: #f0fdf4; }

@keyframes sp-spin { to { transform: rotate(360deg); } }
@keyframes sp-pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
@keyframes sp-slide-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

@media (max-width: 699px) {
    .sp-hero { padding: 24px 20px 28px; }
    .sp-hero-title { font-size: 1.35rem; }
    .sp-ov-grid { grid-template-columns: repeat(2, 1fr); }
    .sp-stats-row { margin: 0 16px 16px; gap: 8px; }
    .sp-tbl { margin: 0 16px 18px; }
    .sp-box { margin: 0 16px 20px; }
    .sp-sh { padding: 18px 16px 8px; }
    .sp-ov-wrap { padding: 18px 16px 8px; }
    .sp-example { margin: 0 16px 18px; }
    .sp-ipa-card { margin: 0 16px 10px; }
}
</style>
`;

/* ════════════════════════════════════════════════════
   SECTION CONFIG
════════════════════════════════════════════════════ */
const SP_META = {
    overview:      { grad:'linear-gradient(140deg,#0f766e 0%,#0ea5e9 50%,#6d28d9 100%)' },
    greetings:     { grad:'linear-gradient(140deg,#059669 0%,#0d9488 100%)' },
    opinions:      { grad:'linear-gradient(140deg,#4f46e5 0%,#7c3aed 100%)' },
    smalltalk:     { grad:'linear-gradient(140deg,#d97706 0%,#ea580c 100%)' },
    shopping:      { grad:'linear-gradient(140deg,#e11d48 0%,#db2777 100%)' },
    directions:    { grad:'linear-gradient(140deg,#0891b2 0%,#0284c7 100%)' },
    transitions:   { grad:'linear-gradient(140deg,#7c3aed 0%,#6d28d9 100%)' },
    phrasal:       { grad:'linear-gradient(140deg,#b45309 0%,#d97706 100%)' },
    hesitation:    { grad:'linear-gradient(140deg,#0f766e 0%,#059669 100%)' },
    register:      { grad:'linear-gradient(140deg,#1d4ed8 0%,#0891b2 100%)' },
    interview:     { grad:'linear-gradient(140deg,#7c3aed 0%,#4f46e5 100%)' },
    pronunciation: { grad:'linear-gradient(140deg,#db2777 0%,#9d174d 100%)' },
    flashcards:    { grad:'linear-gradient(140deg,#059669 0%,#0891b2 100%)' },
    'ai-chat':     { grad:'linear-gradient(140deg,#1d4ed8 0%,#4f46e5 100%)' },
};

/* ════════════════════════════════════════════════════
   ENTRY / SHELL
════════════════════════════════════════════════════ */
function openSpeakingSection(id) {
    _spSection = id || 'overview';
    document.querySelectorAll('.container, .arsiv-full-page').forEach(el => el.classList.add('hidden'));
    const pg = document.getElementById('speaking-page');
    if (pg) pg.classList.remove('hidden');
    document.querySelectorAll('.sb-btn, .mob-drawer-btn').forEach(el => el.classList.remove('active'));
    ['sb-speaking','di-speaking'].forEach(i => { const el=document.getElementById(i); if(el) el.classList.add('active'); });
    _spRenderPage();
}

function _spRenderPage() {
    const pg = document.getElementById('speaking-page');
    if (!pg) return;
    pg.innerHTML = SP_GLOBAL_CSS + `
        <div class="gr-topbar">
            <button class="gr-back-btn" onclick="navTo('index-page')">←</button>
            <div>
                <div class="gr-topbar-label">Speaking Modülü</div>
                <div class="gr-topbar-title">Günlük İngilizce Konuşma</div>
            </div>
        </div>
        <div class="gr-body sp-wrap">
            <nav class="gr-sidenav" id="sp-nav"></nav>
            <div class="gr-content" id="sp-cnt"></div>
        </div>`;
    _spBuildNav();
    _spGo(_spSection);
}

function _spBuildNav() {
    const nav = document.getElementById('sp-nav');
    if (!nav) return;
    const grp = {};
    SP_SECS.forEach(s => { const k = s.cat||'__g'; (grp[k]=grp[k]||[]).push(s); });
    let h = '';
    SP_ORDER.forEach(cat => {
        const list = grp[cat||'__g'];
        if (!list) return;
        h += `<div class="gr-sn-sec">${SP_LABELS[cat]}</div>`;
        list.forEach(s => {
            const dot = SP_DOTS[s.cat]||'#aaa';
            const act = s.id===_spSection?' active':'';
            h += `<button class="gr-sn-btn${act}" onclick="_spGo('${s.id}')">
                <span class="gr-sn-dot" style="background:${dot}"></span>${s.label}
            </button>`;
        });
    });
    nav.innerHTML = h;
}

function _spGo(id) {
    _spSection = id;
    document.querySelectorAll('#sp-nav .gr-sn-btn').forEach(b => {
        b.classList.toggle('active', (b.getAttribute('onclick')||'').includes(`'${id}'`));
    });
    const cnt = document.getElementById('sp-cnt');
    if (!cnt) return;
    cnt.scrollTop = 0;
    const map = {
        overview:_spOverview, greetings:_spGreetings, opinions:_spOpinions,
        smalltalk:_spSmallTalk, shopping:_spShopping, directions:_spDirections,
        transitions:_spTransitions, pronunciation:_spPronunciation,
        phrasal:_spPhrasal, hesitation:_spHesitation,
        register:_spRegister, interview:_spInterview,
        flashcards:_spFlashcardsPage, 'ai-chat':_spAiChatPage,
    };
    cnt.innerHTML = (map[id]||(() => '<div style="padding:40px">Yakında…</div>'))();
    if (id==='flashcards') _spShowCard();
}

/* ════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════ */
function _spHero(badge, title, sub, sectionId) {
    const m = SP_META[sectionId || _spSection] || SP_META.overview;
    return `<div class="sp-hero" style="background:${m.grad};">
        <div class="sp-hero-blob"></div>
        <div class="sp-hero-blob2"></div>
        <div class="sp-hero-inner">
            <div class="sp-hero-badge">${badge}</div>
            <div class="sp-hero-title">${title}</div>
            <div class="sp-hero-sub">${sub}</div>
        </div>
    </div>`;
}

function _spSH(label, icon='') {
    return `<div class="sp-sh">${icon ? icon + ' ' : ''}${label}</div>`;
}

function _spTbl(rows, accentColor='#059669') {
    const trs = rows.map((r, i) => {
        const uid = 'tbl' + i + '_' + Math.random().toString(36).slice(2,6);
        const safe = r[1].replace(/\\/g,'\\\\').replace(/'/g,"\\'");
        return `<div class="sp-row">
            <div class="sp-row-tr">${r[0]}</div>
            <div class="sp-row-en" style="color:${accentColor}">${r[1]}</div>
            <div class="sp-row-spk">
                <button onclick="spSpeak('${safe}','${uid}')" id="spk${uid}" class="sp-spk-btn" title="Dinle">🔊</button>
            </div>
        </div>`;
    }).join('');
    return `<div class="sp-tbl">${trs}</div>`;
}

function _spBox(ico, title, lines, bg='#f0fdf4', border='#bbf7d0', tc='#065f46') {
    return `<div class="sp-box" style="background:${bg};border-color:${border};">
        <div class="sp-box-title" style="color:${tc}">${ico} ${title}</div>
        ${lines.map(l => `<div class="sp-box-line" style="color:${tc}">${l}</div>`).join('')}
    </div>`;
}

function _spExample(labelA, labelB, pairs, bgHead='#f0fdf4', headColor='#065f46') {
    const rows = pairs.filter(p => p[0]).map(p => `
        <div style="padding:6px 0;border-bottom:1px dashed #e2e8f0;last-child{border:none}">
            ${labelB ? `<div><span class="sp-ex-a">${labelA}:</span> ${p[0]}</div><div><span class="sp-ex-b">${labelB}:</span> ${p[1]}</div>` : `<div style="font-style:italic;color:#475569">${p[0]}</div>`}
        </div>`).join('');
    return `<div class="sp-example">
        <div class="sp-example-head" style="background:${bgHead};color:${headColor}">💬 Örnek Diyalog</div>
        <div class="sp-example-body">${rows}</div>
    </div>`;
}

function spSpeak(text, uid) {
    if (!_spSynth) return;
    _spSynth.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US'; utt.rate = 0.88;
    const btn = document.getElementById('spk' + uid);
    if (btn) { btn.textContent = '⏸'; utt.onend = () => { if(btn) btn.textContent = '🔊'; }; }
    _spSynth.speak(utt);
}

/* ════════════════════════════════════════════════════
   OVERVIEW
════════════════════════════════════════════════════ */
function _spOverview() {
    const daily = [
        { ico:'👋', t:'Selamlaşma',     desc:'Tanışma & karşılama',        id:'greetings',   c:'#059669', bg:'#dcfce7', count:'14 kalıp' },
        { ico:'💬', t:'Fikir Bildirme',  desc:'Görüş, katılma & tartışma',  id:'opinions',    c:'#4f46e5', bg:'#e0e7ff', count:'16 kalıp' },
        { ico:'☕', t:'Small Talk',      desc:'Günlük sohbet & hobiler',     id:'smalltalk',   c:'#d97706', bg:'#fef3c7', count:'13 kalıp' },
        { ico:'🛍️', t:'Alışveriş',      desc:'Mağaza, kafe & restoran',     id:'shopping',    c:'#e11d48', bg:'#ffe4e6', count:'15 kalıp' },
        { ico:'🗺️', t:'Yol & Konum',    desc:'Yol tarifi & toplu taşıma',   id:'directions',  c:'#0891b2', bg:'#cffafe', count:'13 kalıp' },
        { ico:'🔗', t:'Bağlayıcılar',   desc:'B2+ seviye köprü ifadeleri',  id:'transitions', c:'#7c3aed', bg:'#ede9fe', count:'12 kalıp' },
        { ico:'🔀', t:'Phrasal Verbs',   desc:'Diyalog içinde doğal kullanım', id:'phrasal',   c:'#b45309', bg:'#fef3c7', count:'40 fiil' },
        { ico:'💭', t:'Hesitation',      desc:'Zaman kazanma & düzeltme',    id:'hesitation',  c:'#059669', bg:'#dcfce7', count:'18 strateji' },
        { ico:'🎭', t:'Formal / Inf.',   desc:'Resmi & günlük dil farkı',    id:'register',    c:'#1d4ed8', bg:'#dbeafe', count:'24 çift' },
        { ico:'💼', t:'İş & Sunum',      desc:'Mülakat, toplantı & prezentasyon', id:'interview', c:'#7c3aed', bg:'#ede9fe', count:'30 kalıp' },
    ];
    const tools = [
        { ico:'🔊', t:'Telaffuz',         desc:'IPA & seslendirme pratiği',           id:'pronunciation', c:'#db2777', bg:'#fce7f3', count:'11 ses grubu' },
        { ico:'🃏', t:'Flashcard',          desc:'Türkçe → İngilizce kart çalışması',  id:'flashcards',    c:'#059669', bg:'#d1fae5', count:'32 kart' },
        { ico:'🤖', t:'AI Sohbet',           desc:'Yapay zeka ile canlı pratik',         id:'ai-chat',       c:'#1d4ed8', bg:'#dbeafe', count:'8 senaryo' },
    ];

    const makeCard = (item) => `
        <div class="sp-ov-card" onclick="_spGo('${item.id}')"
             style="background:${item.bg};border-color:${item.c}30;">
            <div class="sp-ov-icon" style="background:rgba(255,255,255,.6);">${item.ico}</div>
            <div class="sp-ov-title" style="color:${item.c}88;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:0;">${item.count}</div>
            <div class="sp-ov-title">${item.t}</div>
            <div class="sp-ov-desc">${item.desc}</div>
        </div>`;

    return _spHero('🗣️ Speaking Modülü', 'Günlük İngilizce Konuşma', 'Selamlaşmadan iş görüşmesine, phrasal verb\'den formal dile — gerçek hayatta kullanacağın 160+ kalıp.', 'overview')
    + `<div class="sp-ov-wrap">
        <div class="sp-ov-section-label">Konuşma Konuları</div>
        <div class="sp-ov-grid">${daily.map(makeCard).join('')}</div>
        <div class="sp-ov-section-label">Araçlar & Pratik</div>
        <div class="sp-ov-grid">${tools.map(makeCard).join('')}</div>
    </div>`
    + `<div class="sp-stats-row">
        <div class="sp-stat-card">
            <div class="sp-stat-num" style="color:#059669">100+</div>
            <div class="sp-stat-lbl">Konuşma Kalıbı</div>
        </div>
        <div class="sp-stat-card">
            <div class="sp-stat-num" style="color:#1d4ed8">32</div>
            <div class="sp-stat-lbl">Flashcard</div>
        </div>
        <div class="sp-stat-card">
            <div class="sp-stat-num" style="color:#7c3aed">AI</div>
            <div class="sp-stat-lbl">Canlı Pratik</div>
        </div>
    </div>`
    + _spBox('💡','Nasıl Çalışır?', [
        '🔊 Her kalıbın yanındaki butona bas — gerçek İngilizce telaffuzu duy ve hemen tekrar et.',
        '🃏 Flashcard\'ları günde 10 dakika çalış — 2 haftada fark görürsün.',
        '🤖 AI Sohbet\'te hata düzeltmesi için mesajının sonuna <strong>(feedback)</strong> yaz.',
        '📈 B1→B2 geçişi için <strong>Bağlayıcı İfadeler</strong> ve <strong>Fikir Bildirme</strong> bölümlerine odaklan.',
    ]);
}

/* ════════════════════════════════════════════════════
   GREETINGS
════════════════════════════════════════════════════ */
function _spGreetings() {
    return _spHero('👋 Günlük Konuşma', 'Selamlaşma & Tanışma', '14 temel kalıp — resmi toplantıdan arkadaş buluşmasına kadar her durumda kullanılır.', 'greetings')
    + _spSH('Resmi Selamlaşma', '🏢')
    + _spTbl([
        ['Günaydın / İyi günler / İyi akşamlar', 'Good morning / Good afternoon / Good evening.'],
        ['Nasılsınız? (çok resmi — ilk tanışma)', 'How do you do?'],
        ['Nasılsınız? (resmi)', 'How are you? / How are you doing?'],
        ['Tanışmak büyük zevk.', "It's a pleasure to meet you. / Pleased to meet you."],
        ['Adınızı öğrenebilir miyim?', 'May I ask your name? / Could I have your name?'],
        ['Tekrar görüşmek dileğiyle.', 'I look forward to seeing you again. / I hope to see you soon.'],
    ], '#059669')
    + _spSH('Samimi / Günlük Selamlaşma', '😊')
    + _spTbl([
        ['Naber? / Nasılsın?', "Hey! What's up? / How's it going?"],
        ['Her şey yolunda mı?', "How are things? / How are you getting on?"],
        ['Fena değil, sen?', "Not bad, you? / Can't complain!"],
        ['Çok iyi, sağ ol!', "Really good, thanks! / Doing great!"],
        ['Uzun zamandır görüşemedik!', "Long time no see! It's been ages!"],
        ['Sonra görüşürüz!', 'See you later! / Catch you later! / Take care!'],
        ['Güle güle! / İyi geceler!', 'Goodbye! / Good night! / Cheers! (İng.)'],
        ['Yakında görüşürüz.', 'See you soon! / Talk to you later!'],
    ], '#059669')
    + _spSH('Tanıştırma', '🤝')
    + _spTbl([
        ['Adım… / Ben …\'yım.', "My name is… / I'm… / Call me…"],
        ['Bu benim arkadaşım / meslektaşım.', 'This is my friend… / This is my colleague…'],
        ['Ne iş yapıyorsunuz?', "What do you do for a living? / What's your job?"],
        ['Nerelisiniz?', 'Where are you from? / Where do you come from?'],
        ['Ne zamandır burada mısınız?', 'How long have you been here?'],
        ['Burada mı yaşıyorsunuz?', 'Do you live here / in [city]?'],
    ], '#059669')
    + _spExample('A', 'B', [
        ["Good morning! How are you?", "I'm doing well, thank you! And yourself?"],
        ["Long time no see! How have you been?", "I know, it's been ages! I've been great, really busy though."],
        ["Pleased to meet you. I'm Sarah.", "Lovely to meet you too! I'm Tom. Are you new to the team?"],
    ], '#f0fdf4', '#065f46')
    + _spBox('🎯', 'Kültür & Seviye Notları', [
        '• <strong>"How are you?"</strong> sorusuna uzun cevap verilmez — <em>"Fine, thanks!"</em> yeterli.',
        '• <strong>"How do you do?"</strong> bugün çok nadir; iş dünyasında ilk tanışmada duyabilirsin.',
        '• <strong>"Cheers!"</strong> → İngiliz İngilizcesinde veda, teşekkür veya kadeh kaldırma.',
        '• İsim sorarken <strong>"What\'s your name?"</strong> yerine <strong>"May I ask your name?"</strong> daha kibar.',
        '• <strong>"How are you getting on?"</strong> → Birisinin durumunu öğrenmek için daha sıcak bir soru.',
    ]);
}

/* ════════════════════════════════════════════════════
   OPINIONS
════════════════════════════════════════════════════ */
function _spOpinions() {
    return _spHero('💬 Günlük Konuşma', 'Fikir Bildirme & Tartışma', '16 kalıp — görüşünü net ifade et, kibarca katıl ya da karşı çık.', 'opinions')
    + _spSH('Fikir Belirtme', '🧠')
    + _spTbl([
        ['Bence…', 'In my opinion,… / I think… / I believe…'],
        ['Kanımca…', "As far as I'm concerned,… / To my mind,…"],
        ['Sanırım…', "I reckon… / I suppose… / I'd imagine…"],
        ['Şunu söyleyebilirim ki…', "I'd say that… / I'd argue that…"],
        ['Kesinlikle inanıyorum.', "I strongly believe that… / I'm convinced that…"],
        ['Kişisel görüşüm…', 'Personally, I feel that… / Speaking for myself,…'],
    ], '#4f46e5')
    + _spSH('Katılma', '✅')
    + _spTbl([
        ['Haklısın. / Kesinlikle.', "You're (absolutely) right. / Exactly! / Precisely!"],
        ['Seninle aynı fikirdeyim.', "I completely agree. / I couldn't agree more."],
        ['Bir noktaya kadar katılıyorum.', "I partly agree. / You have a point there, but…"],
        ['Bence de öyle.', "I think so too. / That's what I think as well."],
    ], '#4f46e5')
    + _spSH('Kibarca Karşı Çıkma', '⚖️')
    + _spTbl([
        ['Pek katılmıyorum açıkçası.', "I'm not sure I agree. / I'm not entirely convinced."],
        ['Saygıyla farklı düşünüyorum.', "I'm afraid I disagree. / I beg to differ."],
        ['Farklı bir perspektiften bakıyorum.', "I see it differently. / I'd look at it another way."],
        ['Güzel bir nokta, ama…', "That's a fair point, but… / I take your point, however…"],
        ['Her iki tarafın da geçerli noktaları var.', 'There are valid arguments on both sides.'],
        ['Bu konuda kararsızım.', "I'm on the fence about this. / I'm not sure where I stand."],
    ], '#4f46e5')
    + _spSH('Konuşmayı Yönetme', '🔄')
    + _spTbl([
        ['Ne demek istiyorsun tam olarak?', 'What exactly do you mean by that?'],
        ['Yani şunu mu söylüyorsun?', "So what you're saying is…? / If I understand correctly…"],
        ['İlginç bir bakış açısı.', "That's an interesting perspective. / Good point."],
        ['Devam et, seni dinliyorum.', "Go on, I'm all ears. / Please continue."],
    ], '#4f46e5')
    + _spExample('A', 'B', [
        ["I strongly believe social media does more harm than good.", "That's a fair point, but I'd argue it depends on how you use it."],
        ["Don't you think remote work is less productive?", "I'm not entirely convinced. Personally, I feel it actually boosts focus for many people."],
        ["In my opinion, learning English is essential nowadays.", "I couldn't agree more. It opens so many doors professionally."],
    ], '#eef2ff', '#3730a3')
    + _spBox('💡', 'B2+ İpuçları', [
        '• <strong>"I\'d argue that…"</strong> → analitik, akademik konuşma için güçlü giriş.',
        '• <strong>"I\'m on the fence"</strong> → net karar veremeyen, dengeli tutum.',
        '• Önce onayla, sonra karşı çık: <strong>"That\'s a fair point, but…"</strong>',
        '• Zaman kazanmak: <strong>"That\'s a good question…"</strong> veya <strong>"Let me think…"</strong>',
        '• <strong>"I couldn\'t agree more"</strong> → güçlü onay ifadesi, B2 seviyesi.',
    ], '#eef2ff', '#c7d2fe', '#3730a3');
}

/* ════════════════════════════════════════════════════
   SMALL TALK
════════════════════════════════════════════════════ */
function _spSmallTalk() {
    return _spHero('☕ Günlük Konuşma', 'Small Talk', '13 kalıp — hava durumundan hobilere, planlardan iş hayatına sohbet sanatı.', 'smalltalk')
    + _spSH('Hava Durumu — Klasik Small Talk', '🌤️')
    + _spTbl([
        ["Hava güzel bugün, değil mi?", "It's lovely weather today, isn't it?"],
        ["Hava bunaltıcı / buz gibi.", "It's boiling hot / absolutely freezing today."],
        ["Yağmur yağacak sanırım.", "I think it's going to rain. Looks like showers later."],
        ["Hafta sonu hava nasıl olacak?", "What's the weather supposed to be like this weekend?"],
    ], '#d97706')
    + _spSH('Hafta Sonu & Planlar', '📅')
    + _spTbl([
        ['Hafta sonun için planın var mı?', 'Do you have any plans for the weekend?'],
        ['Harika bir hafta sonu geçirdim!', "I had a fantastic weekend! Really recharged."],
        ['Sadece dinlendim açıkçası.', "I just relaxed, to be honest. Had a lazy one."],
        ['Hiçbir şey yapmadım — tam ihtiyacım olan buydu!', "I didn't do much — exactly what I needed!"],
        ['Bu hafta sonu ne yapacaksın?', 'What are you up to this weekend?'],
    ], '#d97706')
    + _spSH('Hobiler & İlgi Alanları', '🎯')
    + _spTbl([
        ['Boş zamanında ne yapıyorsun?', 'What do you do in your spare time / free time?'],
        ["Son zamanlarda … ile ilgileniyorum.", "I've been getting into… lately. I'm really into…"],
        ['Bu diziyi / filmi tavsiye eder misin?', 'Would you recommend it? Is it worth watching?'],
        ["Ben de onu denemek istiyordum!", "I've been meaning to try that! That's on my list."],
    ], '#d97706')
    + _spExample('A', 'B', [
        ["Do you have any plans for the weekend?", "Not really! I might go hiking if the weather holds up. What about you?"],
        ["Have you seen that new series on Netflix?", "Not yet, but I've heard great things! Is it worth watching?"],
        ["It's absolutely freezing today, isn't it?", "I know! I can't believe how cold it's got. Roll on summer!"],
    ], '#fffbeb', '#92400e')
    + _spBox('💡', 'Small Talk Formülü (3 Adım)', [
        '1. <strong>Açılış sorusu</strong> → "How was your weekend?"',
        '2. <strong>Ortak nokta bul</strong> → "Oh, I love hiking too!"',
        '3. <strong>Açık uçlu soru sor</strong> → "Where do you usually go?"',
        '• <strong>"Isn\'t it?" / "don\'t you think?"</strong> tag questions sohbeti doğallaştırır.',
        '• Konu değiştirmek için: <strong>"By the way…"</strong> veya <strong>"Anyway, speaking of…"</strong>',
        '• <strong>"Roll on [season]!"</strong> → mevsimi beklemek için sevimli İngilizce ifade.',
    ], '#fffbeb', '#fde68a', '#92400e');
}

/* ════════════════════════════════════════════════════
   SHOPPING
════════════════════════════════════════════════════ */
function _spShopping() {
    return _spHero('🛍️ Günlük Konuşma', 'Alışveriş & Sipariş', '15 kalıp — mağazadan kafeye, şikayetten iadeye kadar her durumda işe yarar.', 'shopping')
    + _spSH('Mağazada', '🏬')
    + _spTbl([
        ["… arıyorum.", "I'm looking for… / Could you help me find…?"],
        ["Bu kaç numara / hangi beden?", "What size is this? / Do you have this in my size?"],
        ["Bunu deneyebilir miyim?", "Could I try this on? / Where are the fitting rooms?"],
        ["Başka renk / model var mı?", "Do you have this in another colour / style?"],
        ["Bu ne kadar?", "How much is this? / What's the price on this?"],
        ["İndirim var mı?", "Is there any discount? / Could you do a better price?"],
    ], '#e11d48')
    + _spSH('Kafe & Restoran', '🍽️')
    + _spTbl([
        ["Sipariş verebilir miyiz?", "Could we order, please? / Are you ready to take our order?"],
        ["… alacağım / istiyorum.", "I'll have… / I'd like… / Could I get…?"],
        ["Ne tavsiye edersiniz?", "What do you recommend? / What's popular here?"],
        ["Hesabı getirir misiniz?", "Could we have the bill / check, please?"],
        ["Servis dahil mi?", "Is service included? / Is the tip included?"],
    ], '#e11d48')
    + _spSH('Şikâyet & İade', '↩️')
    + _spTbl([
        ["Bu bozuk / yanlış ürün.", "This is broken / not what I ordered."],
        ["Değiştirebilir miyim?", "Could I exchange this for a different one?"],
        ["İade etmek istiyorum.", "I'd like a refund, please. I have my receipt."],
        ["Siparişimde bir sorun var.", "There seems to be a problem with my order."],
    ], '#e11d48')
    + _spExample('Müşteri', 'Satıcı', [
        ["Excuse me, do you have this jacket in a medium?", "Let me check the stockroom for you. One moment!"],
        ["I'd like to return this please — it doesn't fit.", "Of course! Do you have the receipt? Would you like an exchange or a refund?"],
        ["What do you recommend for a starter?", "Our soup of the day is amazing, and the bruschetta is very popular!"],
    ], '#fff1f2', '#9f1239')
    + _spBox('💡', 'Alışveriş İpuçları', [
        '• <strong>"How much is this?"</strong> en doğal fiyat sorusu — <em>"What is the price?"</em> biraz katı kaçar.',
        '• İndirim isteyin: <strong>"Could you do a better price?"</strong> — pazarlarda işe yarar.',
        '• Restoranı beğenince: <strong>"This is absolutely delicious!"</strong>',
        '• Şikayette kibar kal: <strong>"I\'m sorry to bother you, but…"</strong> ile başla.',
        '• "Bill" → İngiliz İngilizcesi, "Check" → Amerikan İngilizcesi.',
    ], '#fff1f2', '#fecdd3', '#9f1239');
}

/* ════════════════════════════════════════════════════
   DIRECTIONS
════════════════════════════════════════════════════ */
function _spDirections() {
    return _spHero('🗺️ Günlük Konuşma', 'Yol Tarifi & Konum', '13 kalıp — yol sormak, tarif etmek ve toplu taşımayı kullanmak.', 'directions')
    + _spSH('Yol Sorma', '❓')
    + _spTbl([
        ["… nerede?", "Excuse me, where is…? / Could you tell me where… is?"],
        ["… nasıl gidebilirim?", "How do I get to…? / What's the best way to get to…?"],
        ["Buraya yakın mı?", "Is it far from here? / Is it within walking distance?"],
        ["Yürüyerek gidebilir miyim?", "Can I walk there? / Is it walkable from here?"],
        ["Haritada gösterebilir misiniz?", "Could you show me on the map? / Could you point it out?"],
    ], '#0891b2')
    + _spSH('Yol Tarifi Verme', '📍')
    + _spTbl([
        ["Düz gidin.", "Go straight ahead. / Head straight down this road."],
        ["Sola / Sağa dönün.", "Turn left / Turn right. / Take a left / Take a right."],
        ["İkinci sokakta sola dönün.", "Take the second turning on the left."],
        ["… ın karşısında / yanında / arkasında.", "It's opposite / next to / behind…"],
        ["Işıklara / kavşağa kadar gidin.", "Go as far as the traffic lights / the crossroads."],
        ["Gözden kaçırmazsınız.", "You can't miss it. / It's right there on the corner."],
    ], '#0891b2')
    + _spSH('Toplu Taşıma', '🚌')
    + _spTbl([
        ["En yakın otobüs durağı / metro istasyonu nerede?", "Where's the nearest bus stop / underground station?"],
        ["… için tek / gidiş-dönüş bilet.", "A single / return ticket to…, please."],
        ["Bu doğru hat / tren mi?", "Is this the right line / train for…?"],
        ["Kaç durak kaldı?", "How many stops is it? / Which stop should I get off at?"],
    ], '#0891b2')
    + _spExample('Turist', 'Yerli', [
        ["Excuse me, how do I get to the city centre?", "Go straight ahead, take the second left — you can't miss it!"],
        ["Is there a tube station nearby?", "Yes! Head down this road about 5 minutes. Take the Northern line southbound."],
        ["Is it far to walk from here?", "Not at all! It's about a 10-minute walk. Very straightforward."],
    ], '#ecfeff', '#164e63')
    + _spBox('🧭', 'Pratik İpuçları', [
        '• Her zaman <strong>"Excuse me,"</strong> ile başla — kibarlık İngilizce\'de kritik.',
        '• Anlamadıysan: <strong>"Could you repeat that more slowly, please?"</strong>',
        '• Google Maps için: <strong>"Could you spell that for me?"</strong>',
        '• Teşekkür: <strong>"Thank you so much, that\'s really helpful!"</strong>',
        '• "Tube" → Londra metrosu, "Subway" → ABD metrosu.',
    ], '#ecfeff', '#a5f3fc', '#164e63');
}

/* ════════════════════════════════════════════════════
   TRANSITIONS
════════════════════════════════════════════════════ */
function _spTransitions() {
    return _spHero('🔗 Günlük Konuşma', 'Bağlayıcı İfadeler', '12 kalıp — konuşmana B2+ akıcılığı ve profesyonel görünüm kazandıran köprüler.', 'transitions')
    + _spSH('Ekleme & Güçlendirme', '➕')
    + _spTbl([
        ["Ayrıca / Bunun yanı sıra", "Also, … / In addition, … / On top of that, …"],
        ["Dahası / Üstelik", "What's more, … / Furthermore, … / Moreover, …"],
        ["Sadece o değil, aynı zamanda…", "Not only that, but… / Not only…, but also…"],
        ["Gerçekte / Hatta öyle ki…", "In fact, … / As a matter of fact, … / Indeed, …"],
    ], '#7c3aed')
    + _spSH('Karşıtlık & Kısıtlama', '⟺')
    + _spTbl([
        ["Ama / Fakat / Bununla birlikte", "However, … / Nevertheless, … / That said, …"],
        ["Öte yandan / Diğer taraftan", "On the other hand, … / On the flip side, …"],
        ["Buna rağmen / Yine de", "Even so, … / Despite this, … / In spite of that, …"],
        ["Aksine / Tam tersine", "On the contrary, … / Rather, …"],
    ], '#7c3aed')
    + _spSH('Örnek Verme & Açıklama', '💡')
    + _spTbl([
        ["Örneğin / Mesela", "For example, … / For instance, … / To illustrate, …"],
        ["Yani / Başka bir deyişle", "In other words, … / That is to say, … / Meaning that…"],
    ], '#7c3aed')
    + _spSH('Sonuç & Özet', '🏁')
    + _spTbl([
        ["Sonuç olarak / Özetle", "In conclusion, … / To sum up, … / All in all, …"],
        ["Bu yüzden / Dolayısıyla", "So, … / Therefore, … / As a result, …"],
        ["Kısacası / Sonuç itibarıyla", "In short, … / Basically, … / The bottom line is…"],
        ["Son olarak / Bir de şunu ekleyeyim…", "Finally, … / Last but not least, …"],
    ], '#7c3aed')
    + _spExample('Konuşmacı', '', [
        ["I love travelling. However, it can be quite expensive. On the other hand, the experiences are priceless. What's more, it broadens your perspective. In conclusion, I think it's always worth saving up for.", ""],
    ], '#f5f3ff', '#4c1d95')
    + _spBox('🌉', 'Neden Bu Kadar Önemli?', [
        '• Bağlayıcılar olmadan: <em>"I like coffee. It\'s good. I drink it every day."</em> — robotik.',
        '• Bağlayıcılarla: <em>"I love coffee. In fact, I have three cups a day. That said, I\'ve been cutting back."</em> — akıcı.',
        '• <strong>However / That said</strong>: Daha dengeli ve analitik görünürsün.',
        '• <strong>What\'s more / Furthermore</strong>: B2 seviyesini yansıtır, etkileyici.',
        '• <strong>All in all / The bottom line is</strong>: Sunum & toplantılarda seni profesyonel kılar.',
    ], '#f5f3ff', '#ddd6fe', '#4c1d95');
}

/* ════════════════════════════════════════════════════
   PRONUNCIATION
════════════════════════════════════════════════════ */
var SP_PRON_DATA = [
    { cat:'Zor Sesler', items:[
        { ipa:'/θ/', name:'TH — ince (thin)', desc:'Dilin ucunu üst dişlerin arasına koy, hava çıkar: <em>th</em>ink, <em>th</em>ank', words:['think','three','through','health','nothing','breath'] },
        { ipa:'/ð/', name:'TH — kalın (the)', desc:'Aynı pozisyon ama titreşimli: <em>th</em>e, <em>th</em>is, brea<em>th</em>e', words:['this','the','that','other','breathe','weather'] },
        { ipa:'/æ/', name:'Short A (cat)', desc:'"e" ve "a" arası — ağzını geniş aç: c<em>a</em>t, <em>a</em>pple', words:['cat','man','apple','hand','back','flat'] },
        { ipa:'/ɪ/', name:'Short I (sit)', desc:'Kısa "ı" — s<em>i</em>t, k<em>i</em>t, l<em>i</em>p', words:['sit','bit','win','this','gift','ship'] },
        { ipa:'/ʊ/', name:'Short U (book)', desc:'Kısa "u" — b<em>oo</em>k, p<em>u</em>t, f<em>oo</em>t', words:['book','look','good','cook','push','full'] },
        { ipa:'/ʌ/', name:'Short U2 (cup)', desc:'"a" gibi kısa & derin — c<em>u</em>p, b<em>u</em>s', words:['cup','bus','fun','run','love','blood'] },
    ]},
    { cat:'Karıştırılan Sessizler', items:[
        { ipa:'/w/', name:'W (water)', desc:'Dudakları yuvarlat — "v" DEĞİL', words:['water','word','window','always','away','would'] },
        { ipa:'/v/', name:'V (voice)', desc:'Alt dudağa üst dişleri değdir, titreşim olmalı', words:['very','voice','live','above','video','over'] },
        { ipa:'/r/', name:'R (run)', desc:'Dili geriye kıvır, hiçbir yere dokunmadan', words:['run','right','around','sorry','try','three'] },
        { ipa:'/ŋ/', name:'NG (sing)', desc:'Burundan çıkan arka k sesi — si<em>ng</em>, ri<em>ng</em>', words:['sing','ring','long','wrong','thing','bring'] },
    ]},
    { cat:'Kelime Vurgusu (Stress)', items:[
        { ipa:"ˈ...", name:'İlk Hece Vurgulu', desc:'<strong>TA</strong>-ble, <strong>SIS</strong>-ter, <strong>HAP</strong>-py', words:['table','city','happy','garden','open','market'] },
        { ipa:'...ˈ.', name:'Son Hece Vurgulu', desc:'re-<strong>CEIVE</strong>, de-<strong>CIDE</strong>, ar-<strong>RIVE</strong>', words:['decide','arrive','complete','machine','advice','forget'] },
        { ipa:'...ˈ...', name:'Orta Hece Vurgulu', desc:'re-<strong>MEM</strong>-ber, to-<strong>GE</strong>-ther, im-<strong>POR</strong>-tant', words:['remember','important','together','already','consider'] },
    ]},
];

function _spPronunciation() {
    let h = _spHero('🔊 Telaffuz Rehberi', 'Telaffuz Rehberi', '11 ses grubu — IPA sembolleriyle öğren, butonla gerçek telaffuzu duy, shadowing ile pratik yap.', 'pronunciation');
    h += _spBox('ℹ️', 'IPA Nedir?', [
        '<strong>IPA (International Phonetic Alphabet)</strong> — tüm dillerdeki sesleri gösteren evrensel sembol sistemi.',
        '📖 Sözlüklerde kelimenin yanındaki /semboller/ tam telaffuzu gösterir.',
        '🎯 Türkçe konuşanlar için en zor sesler: <strong>/θ ð/ · /æ/ · /ɪ ʊ ʌ/ · /w/ vs /v/ · /r/</strong>',
    ]);
    h += '<div id="sp-pron-root" style="padding-bottom:24px;">';
    SP_PRON_DATA.forEach((cat, ci) => {
        h += _spSH(cat.cat);
        cat.items.forEach((item, ii) => {
            const uid = `sp-pron-${ci}-${ii}`;
            const wordBtns = item.words.map((w, wi) => {
                const safe = w.replace(/'/g,"\\'");
                return `<div class="sp-word-chip">
                    <span>${w}</span>
                    <button onclick="spSpeak('${safe}','p${ci}${ii}${wi}')" id="spkp${ci}${ii}${wi}" class="sp-spk-btn">🔊</button>
                </div>`;
            }).join('');
            h += `<div class="sp-ipa-card">
                <div class="sp-ipa-head" onclick="var el=document.getElementById('${uid}');el.classList.toggle('open');this.querySelector('.sp-chev').style.transform=el.classList.contains('open')?'rotate(180deg)':'rotate(0)';">
                    <span class="sp-ipa-badge" style="color:#db2777;background:#fdf2f8;">${item.ipa}</span>
                    <div style="flex:1;">
                        <div style="font-weight:800;color:var(--ink);font-size:.92rem;">${item.name}</div>
                        <div style="font-size:.76rem;color:var(--ink3);margin-top:2px;">${item.desc}</div>
                    </div>
                    <span class="sp-chev" style="color:var(--ink3);font-size:.75rem;transition:transform .2s;">▼</span>
                </div>
                <div id="${uid}" class="sp-ipa-body">
                    <div style="font-size:.72rem;font-weight:700;color:var(--ink3);text-transform:uppercase;margin-bottom:10px;letter-spacing:.08em;">Tıkla → Dinle → Hemen tekrar et (Shadowing)</div>
                    <div style="display:flex;flex-wrap:wrap;">${wordBtns}</div>
                </div>
            </div>`;
        });
    });
    h += '</div>';
    h += _spBox('💡', 'Shadowing Tekniği', [
        '1. 🔊 Butona bas ve kelimeyi dinle.',
        '2. 🗣️ Hemen ardından yüksek sesle tekrar et — 0.5 saniyeden fazla bekleme.',
        '3. 🔁 Aynı kelimeyi 3 kez tekrar et — kaslar hafızaya alır.',
        '• <strong>TH için:</strong> "s" sesini çıkar, ardından dili öne al — titreşim hissedeceksin.',
        '• <strong>W için:</strong> "ou" der gibi dudakları yuvarla, sonra açarak "a" de.',
        '• <strong>R için:</strong> Dili geriye kıvır ve hiçbir yere dokundurma — Türkçe R farklı!',
    ], '#eff6ff', '#bfdbfe', '#1e3a8a');
    return h;
}

/* ════════════════════════════════════════════════════
   FLASHCARDS
════════════════════════════════════════════════════ */
var SP_CARDS_ALL = [
    { tr:'Merhaba (samimi)',              en:"Hey! What's up?",                     cat:'Selamlaşma' },
    { tr:'Tanışmak büyük zevk.',          en:"It's a pleasure to meet you.",         cat:'Selamlaşma' },
    { tr:'Nasıl gidiyor?',                en:"How's it going? / How are things?",    cat:'Selamlaşma' },
    { tr:'Uzun zamandır görüşemedik!',    en:"Long time no see! It's been ages!",    cat:'Selamlaşma' },
    { tr:'Sonra görüşürüz!',              en:'See you later! / Take care!',           cat:'Selamlaşma' },
    { tr:'Ne iş yapıyorsunuz?',           en:'What do you do for a living?',          cat:'Selamlaşma' },
    { tr:'Bence / Bana göre…',            en:'In my opinion, … / I believe…',         cat:'Fikir' },
    { tr:'Kesinlikle katılıyorum.',       en:"I completely agree. / I couldn't agree more.", cat:'Fikir' },
    { tr:'Saygıyla katılmıyorum.',        en:"I'm afraid I disagree. / I beg to differ.", cat:'Fikir' },
    { tr:'Bir noktaya kadar haklısın.',   en:"You have a point, but…",                cat:'Fikir' },
    { tr:'İlginç bir bakış açısı.',       en:"That's an interesting perspective.",    cat:'Fikir' },
    { tr:'Bu konuda kararsızım.',         en:"I'm on the fence about this.",          cat:'Fikir' },
    { tr:'Bunu deneyebilir miyim?',       en:'Could I try this on?',                  cat:'Alışveriş' },
    { tr:'Bu ne kadar?',                  en:'How much is this?',                     cat:'Alışveriş' },
    { tr:'İndirim yapılabilir mi?',       en:'Is there any discount? Could you do a better price?', cat:'Alışveriş' },
    { tr:'Hesabı getirir misiniz?',       en:'Could we have the bill, please?',       cat:'Alışveriş' },
    { tr:'İade etmek istiyorum.',         en:"I'd like a refund, please.",            cat:'Alışveriş' },
    { tr:'Ne tavsiye edersiniz?',         en:"What do you recommend? What's popular?", cat:'Alışveriş' },
    { tr:'… nerede lütfen?',              en:'Excuse me, where is…?',                 cat:'Yol' },
    { tr:'Düz gidin.',                    en:'Go straight ahead. Head down this road.', cat:'Yol' },
    { tr:'Sola / sağa dönün.',            en:'Turn left / Take a right.',             cat:'Yol' },
    { tr:'Gözden kaçırmazsınız.',         en:"You can't miss it. It's right there.",  cat:'Yol' },
    { tr:'Bu doğru hat mı?',              en:'Is this the right line / train for…?',  cat:'Yol' },
    { tr:'Dahası / Üstelik…',             en:"What's more, … / Furthermore, …",      cat:'Bağlayıcı' },
    { tr:'Öte yandan…',                   en:'On the other hand, … / On the flip side, …', cat:'Bağlayıcı' },
    { tr:'Sonuç olarak / Özetle…',        en:'In conclusion, … / All in all, …',     cat:'Bağlayıcı' },
    { tr:'Örneğin…',                      en:'For example, … / To illustrate, …',    cat:'Bağlayıcı' },
    { tr:'Buna rağmen / Yine de…',        en:'Even so, … / Despite this, …',          cat:'Bağlayıcı' },
    { tr:'Hafta sonu planın var mı?',     en:'Do you have any plans for the weekend?', cat:'Small Talk' },
    { tr:'Son zamanlarda ne yapıyorsun?', en:"What have you been up to lately?",      cat:'Small Talk' },
    { tr:'Bunu tavsiye eder misin?',      en:'Would you recommend it? Is it worth it?', cat:'Small Talk' },
    { tr:'Hava güzel bugün, değil mi?',   en:"It's lovely weather today, isn't it?",  cat:'Small Talk' },
];

const FC_CAT_COLORS = {
    'Selamlaşma': { bg:'linear-gradient(135deg,#ecfdf5,#d1fae5)', border:'#059669', tc:'#065f46', badge:'#d1fae5', badgeText:'#059669' },
    'Fikir':      { bg:'linear-gradient(135deg,#eef2ff,#e0e7ff)', border:'#4f46e5', tc:'#312e81', badge:'#e0e7ff', badgeText:'#4f46e5' },
    'Alışveriş':  { bg:'linear-gradient(135deg,#fff1f2,#ffe4e6)', border:'#e63946', tc:'#9f1239', badge:'#ffe4e6', badgeText:'#e63946' },
    'Yol':        { bg:'linear-gradient(135deg,#ecfeff,#cffafe)', border:'#0891b2', tc:'#164e63', badge:'#cffafe', badgeText:'#0891b2' },
    'Bağlayıcı':  { bg:'linear-gradient(135deg,#f5f3ff,#ede9fe)', border:'#7c3aed', tc:'#4c1d95', badge:'#ede9fe', badgeText:'#7c3aed' },
    'Small Talk':  { bg:'linear-gradient(135deg,#fffbeb,#fef3c7)', border:'#d97706', tc:'#78350f', badge:'#fef3c7', badgeText:'#d97706' },
};
const FC_CAT_DEFAULT = { bg:'linear-gradient(135deg,#f8fafc,#f1f5f9)', border:'#64748b', tc:'#0f172a', badge:'#e2e8f0', badgeText:'#475569' };

function _spFlashcardsPage() {
    const cats = ['Tümü'];
    SP_CARDS_ALL.forEach(c => { if(!cats.includes(c.cat)) cats.push(c.cat); });
    _spActiveCat = 'Tümü';
    _spCardDeck = _spShuffle(SP_CARDS_ALL.slice());
    _spCardIdx = 0; _spCardFront = true;
    const catBtns = cats.map(c => {
        const isActive = c === _spActiveCat;
        const col = FC_CAT_COLORS[c] || FC_CAT_DEFAULT;
        return `<button onclick="spFcFilter('${c}')" id="spfccat-${c}"
            style="padding:6px 14px;border-radius:20px;border:1.5px solid ${isActive ? col.border : 'var(--border)'};
            background:${isActive ? col.badge : '#fff'};color:${isActive ? col.badgeText : 'var(--ink2)'};
            font-size:.75rem;font-weight:700;cursor:pointer;transition:all .15s;font-family:inherit;">${c}</button>`;
    }).join('');
    return _spHero('🃏 Flashcard', 'Flashcard Kartları', 'Türkçe → İngilizce. Kartı çevir, sesi dinle, ilerle. 32 kart · 6 kategori.', 'flashcards')
    + `<div style="padding:18px 24px 28px;">
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;" id="sp-fc-cats">${catBtns}</div>
        <div style="text-align:center;font-size:.8rem;color:var(--ink3);margin-bottom:14px;font-weight:600;" id="sp-fc-counter">Kart 1 / ${_spCardDeck.length}</div>
        <div id="sp-fc-card" onclick="spFcFlip()" class="sp-fc-card" style="border:2.5px solid #059669;box-shadow:0 6px 24px rgba(5,150,105,.15);">
            <div class="sp-fc-card-bg" id="sp-fc-bg" style="background:linear-gradient(135deg,#f0fdf4,#d1fae5);"></div>
            <div class="sp-fc-card-content">
                <div style="font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px;" id="sp-fc-lbl">🇹🇷 Türkçe</div>
                <div style="font-size:1.25rem;font-weight:900;line-height:1.4;" id="sp-fc-main"></div>
                <div style="font-size:.78rem;margin-top:10px;opacity:.6;" id="sp-fc-sub">Tıkla → İngilizce'yi gör</div>
            </div>
        </div>
        <div id="sp-fc-audio" style="text-align:center;margin-top:14px;display:none;">
            <button onclick="spFcSpeak()" style="background:#d1fae5;border:1.5px solid #6ee7b7;color:#065f46;padding:10px 24px;border-radius:12px;font-size:.84rem;font-weight:700;cursor:pointer;font-family:inherit;">🔊 Sesi Dinle</button>
        </div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
            <button onclick="spFcPrev()" style="padding:11px 24px;border-radius:12px;border:1.5px solid var(--border);background:#fff;font-size:.84rem;font-weight:700;cursor:pointer;color:var(--ink2);font-family:inherit;">← Önceki</button>
            <button onclick="spFcShuffle()" style="padding:11px 24px;border-radius:12px;border:1.5px solid #c7d2fe;background:#e0e7ff;font-size:.84rem;font-weight:700;cursor:pointer;color:#4f46e5;font-family:inherit;">🔀 Karıştır</button>
            <button onclick="spFcNext()" style="padding:11px 24px;border-radius:12px;border:1.5px solid #6ee7b7;background:#d1fae5;font-size:.84rem;font-weight:700;cursor:pointer;color:#065f46;font-family:inherit;">Sonraki →</button>
        </div>
        <div style="margin-top:10px;text-align:center;font-size:.72rem;color:var(--ink3);">⌨️ Klavye: ← Önceki · → Sonraki · Boşluk: Çevir</div>
    </div>`;
}

function spFcFilter(cat) {
    _spActiveCat = cat;
    const deck = cat==='Tümü' ? SP_CARDS_ALL.slice() : SP_CARDS_ALL.filter(c => c.cat===cat);
    _spCardDeck = _spShuffle(deck);
    _spCardIdx = 0; _spCardFront = true;
    document.querySelectorAll('[id^="spfccat-"]').forEach(b => {
        const bc = b.id.replace('spfccat-','');
        const isA = bc === cat;
        const col = FC_CAT_COLORS[bc] || FC_CAT_DEFAULT;
        b.style.borderColor = isA ? col.border : 'var(--border)';
        b.style.background  = isA ? col.badge : '#fff';
        b.style.color       = isA ? col.badgeText : 'var(--ink2)';
    });
    _spShowCard();
}

function _spShowCard() {
    const card = _spCardDeck[_spCardIdx];
    if (!card) return;
    const lbl = document.getElementById('sp-fc-lbl');
    const main = document.getElementById('sp-fc-main');
    const sub  = document.getElementById('sp-fc-sub');
    const ctr  = document.getElementById('sp-fc-counter');
    const aud  = document.getElementById('sp-fc-audio');
    const fcEl = document.getElementById('sp-fc-card');
    const bgEl = document.getElementById('sp-fc-bg');
    if (!lbl || !main) return;
    const col = FC_CAT_COLORS[card.cat] || FC_CAT_DEFAULT;
    if (_spCardFront) {
        lbl.innerHTML = `🇹🇷 Türkçe · <span style="color:${col.badgeText};background:${col.badge};padding:2px 8px;border-radius:10px;font-size:.65rem;">${card.cat}</span>`;
        lbl.style.color = col.tc;
        main.textContent = card.tr;
        main.style.color = col.tc;
        sub.textContent = "Tıkla → İngilizce'yi gör";
        if (aud) aud.style.display = 'none';
    } else {
        lbl.innerHTML = `🇬🇧 İngilizce · <span style="color:${col.badgeText};background:${col.badge};padding:2px 8px;border-radius:10px;font-size:.65rem;">${card.cat}</span>`;
        lbl.style.color = col.tc;
        main.innerHTML = `<span style="color:${col.border}">${card.en}</span>`;
        sub.textContent = '';
        if (aud) aud.style.display = 'block';
    }
    if (fcEl) fcEl.style.borderColor = col.border;
    if (bgEl) bgEl.style.background = col.bg;
    if (ctr) ctr.textContent = `Kart ${_spCardIdx + 1} / ${_spCardDeck.length}`;
}

function spFcFlip() {
    _spCardFront = !_spCardFront;
    const c = document.getElementById('sp-fc-card');
    if (c) { c.style.transform='scale(.94) rotateY(6deg)'; setTimeout(()=>{c.style.transform='';_spShowCard();},120); }
}
function spFcNext()    { _spCardIdx=(_spCardIdx+1)%_spCardDeck.length; _spCardFront=true; _spShowCard(); }
function spFcPrev()    { _spCardIdx=(_spCardIdx-1+_spCardDeck.length)%_spCardDeck.length; _spCardFront=true; _spShowCard(); }
function spFcShuffle() { _spCardDeck=_spShuffle(_spCardDeck); _spCardIdx=0; _spCardFront=true; _spShowCard(); }
function spFcSpeak()   { const card=_spCardDeck[_spCardIdx]; if(card) spSpeak(card.en,'fc'); }

document.addEventListener('keydown', e => {
    if (_spSection !== 'flashcards') return;
    if (e.key==='ArrowRight') { e.preventDefault(); spFcNext(); }
    if (e.key==='ArrowLeft')  { e.preventDefault(); spFcPrev(); }
    if (e.key===' ')          { e.preventDefault(); spFcFlip(); }
});

function _spShuffle(arr) {
    const a = arr.slice();
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
}

/* ════════════════════════════════════════════════════
   AI CHAT  — Anthropic API
════════════════════════════════════════════════════ */
const SP_AI_TOPICS = [
    { label:'☕ Kahve Sohbeti',        desc:'İki arkadaş kafede sohbet',          prompt:'casual coffee shop conversation between two friends',        color:'#d97706', bg:'#fef3c7' },
    { label:'🛍️ Alışveriş',            desc:'Mağazada yardım alma',               prompt:'shopping at a clothing store — asking for help and sizes',    color:'#e63946', bg:'#ffe4e6' },
    { label:'🗺️ Yol Tarifi',           desc:'Şehirde yön sorma & tarif',          prompt:'asking for and giving directions in the city',                color:'#0891b2', bg:'#cffafe' },
    { label:'🎬 Film Tavsiyesi',        desc:'Film & dizi tartışması',             prompt:'recommending and discussing a film or TV show',               color:'#7c3aed', bg:'#ede9fe' },
    { label:'🍕 Restoran Siparişi',     desc:'Restoranda sipariş verme',           prompt:'ordering food at a restaurant and asking for recommendations', color:'#ea580c', bg:'#ffedd5' },
    { label:'💼 İş Tanışması',          desc:'Profesyonel ortamda tanışma',        prompt:'introducing yourself at a work event or conference',           color:'#059669', bg:'#d1fae5' },
    { label:'🌍 Seyahat Planları',      desc:'Tatil planı & tercihler',            prompt:'planning a trip and discussing travel preferences',             color:'#0284c7', bg:'#dbeafe' },
    { label:'📱 Teknoloji & Hobiler',   desc:'Teknoloji & günlük ilgi alanları',   prompt:'chatting about technology, apps and daily hobbies',            color:'#1d4ed8', bg:'#dbeafe' },
];

function _spAiChatPage() {
    _spAiHistory = []; _spAiTopic = null;
    const topicGrid = SP_AI_TOPICS.map((t, i) => `
        <div class="sp-topic-card" onclick="spStartChat(${i})">
            <div class="sp-topic-icon" style="background:${t.bg};">${t.label.split(' ')[0]}</div>
            <div>
                <div class="sp-topic-label">${t.label.substring(t.label.indexOf(' ')+1)}</div>
                <div class="sp-topic-desc">${t.desc}</div>
            </div>
        </div>`).join('');

    return _spHero('🤖 AI Konuşma Pratiği', 'AI Konuşma Pratiği', 'Konu seç, yapay zeka ile gerçekçi İngilizce sohbet yap. Hata düzeltmesi için mesajının sonuna (feedback) yaz.', 'ai-chat')
    + `<div style="padding:18px 24px 28px;" id="sp-chat-wrap">
        <div id="sp-topic-pick">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                <div style="font-size:.8rem;font-weight:700;color:var(--ink2);">📌 Senaryo seç ve sohbete başla:</div>
                <div id="sp-ai-status" style="display:inline-flex;align-items:center;gap:6px;background:var(--bg);border:1.5px solid var(--border);border-radius:20px;padding:4px 12px;font-size:.68rem;font-weight:700;color:var(--ink3);">
                    <span style="width:7px;height:7px;border-radius:50%;background:#94a3b8;display:inline-block;" id="sp-ai-dot"></span>
                    <span id="sp-ai-lbl">AI kontrol ediliyor…</span>
                </div>
            </div>
            <script>
            (function(){
                const dot = document.getElementById('sp-ai-dot');
                const lbl = document.getElementById('sp-ai-lbl');
                if (!dot || !lbl) return;
                try {
                    const hasPuter = typeof puter !== 'undefined' && puter?.ai?.chat;
                    const providers = window.AI_PROVIDERS || [];
                    const keyed = providers.filter(p => p.id !== 'puter' && localStorage.getItem(p.lsKey));
                    if (hasPuter) {
                        dot.style.background = '#22c55e';
                        lbl.textContent = '🆓 Puter.js (GPT-4o) hazır';
                    } else if (keyed.length) {
                        dot.style.background = '#3b82f6';
                        lbl.textContent = keyed[0].icon + ' ' + keyed[0].name + ' hazır';
                    } else {
                        dot.style.background = '#f59e0b';
                        lbl.textContent = '⚠ AI key gerekli';
                    }
                } catch(e) { lbl.textContent = 'AI durumu bilinmiyor'; }
            })();
            </script>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;">${topicGrid}</div>
            ${_spBox('💡', 'Nasıl Kullanılır?', [
                '1. Yukarıdan bir senaryo seç — AI konuşmayı başlatır.',
                '2. İngilizce cevap yaz ve Enter\'a bas.',
                '3. Hata düzeltmesi için mesajının sonuna <strong>(feedback)</strong> ekle.',
                '4. <strong>"Yeni Konu"</strong> butonuyla farklı bir senaryo dene.',
            ])}
        </div>
        <div id="sp-chat-area" style="display:none;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
                <div style="font-size:.84rem;font-weight:700;color:#1d4ed8;display:flex;align-items:center;gap:8px;">
                    <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#22c55e;animation:sp-pulse 1.5s ease-in-out infinite;"></span>
                    <span id="sp-chat-lbl"></span>
                </div>
                <button onclick="spChatReset()" style="font-size:.72rem;padding:6px 14px;border-radius:10px;border:1.5px solid var(--border);background:#fff;cursor:pointer;color:var(--ink3);font-family:inherit;">🔄 Yeni Konu</button>
            </div>
            <div id="sp-chat-msgs" style="background:var(--bg);border:1.5px solid var(--border);border-radius:16px;padding:16px;min-height:280px;max-height:400px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;"></div>
            <div style="display:flex;gap:8px;margin-top:12px;">
                <input id="sp-chat-inp" type="text" placeholder="İngilizce yaz → Enter ile gönder"
                    style="flex:1;padding:12px 16px;border:1.5px solid var(--border);border-radius:12px;font-size:.87rem;font-family:inherit;outline:none;background:#fff;transition:border-color .15s;"
                    onkeydown="if(event.key==='Enter')spChatSend()"
                    onfocus="this.style.borderColor='#3b82f6'"
                    onblur="this.style.borderColor='var(--border)'">
                <button onclick="spChatSend()" style="padding:12px 22px;border-radius:12px;border:none;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-size:.87rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 3px 12px rgba(29,78,216,.3);">Gönder</button>
            </div>
            <div style="font-size:.7rem;color:var(--ink3);margin-top:8px;text-align:center;">Hata düzeltmesi için mesajının sonuna <strong>(feedback)</strong> ekle</div>
        </div>
        <div id="sp-chat-load" style="display:none;text-align:center;padding:18px;color:#1d4ed8;font-size:.84rem;font-weight:700;">
            <span style="display:inline-block;animation:sp-spin 1s linear infinite;font-size:1.3rem;">⟳</span> Yanıt hazırlanıyor…
        </div>
    </div>`;
}

function spStartChat(topicIdx) {
    const topic = SP_AI_TOPICS[topicIdx];
    _spAiTopic = topic;
    _spAiHistory = [];
    document.getElementById('sp-topic-pick').style.display = 'none';
    document.getElementById('sp-chat-area').style.display  = 'block';
    document.getElementById('sp-chat-lbl').textContent = topic.label.substring(topic.label.indexOf(' ')+1) + ' — pratik yapılıyor';
    document.getElementById('sp-chat-msgs').innerHTML = '';
    const sys = 'You are a friendly, patient English conversation partner helping a Turkish learner improve their everyday spoken English.\n'
        + `The conversation scenario is: "${topic.prompt}".\n`
        + 'Start with a natural, warm opening line (1-2 sentences) that fits the scenario perfectly.\n'
        + 'Keep each reply short: 2-3 sentences max. Use natural, everyday English (B1-B2 level).\n'
        + 'If the learner writes "(feedback)" at the end: FIRST label "🔍 Düzeltme:" and gently correct any errors, then continue the conversation.\n'
        + 'Never break character unless feedback is requested.';
    _spAiLoading = true; _spShowLoad(true);
    _spApiFetch(sys, [{ role:'user', content:'Start the conversation.' }]);
}

function spChatSend() {
    if (_spAiLoading) return;
    const inp  = document.getElementById('sp-chat-inp');
    const text = inp ? inp.value.trim() : '';
    if (!text) return;
    inp.value = '';
    _spAddMsg('u', text);
    _spAiHistory.push({ role:'user', content:text });
    _spAiLoading = true; _spShowLoad(true);
    const sys = `You are a friendly English conversation partner. Scenario: "${_spAiTopic.prompt}".\n`
        + 'Keep replies natural and short (2-3 sentences). B1-B2 level English.\n'
        + 'If the message ends with "(feedback)", start with "🔍 Düzeltme:" correcting grammar/vocab gently, then continue the conversation normally.';
    _spApiFetch(sys, _spAiHistory);
}

/* ── Speaking için ham metin döndüren cascade çağrısı ────────
   aiCall() JSON parse ediyor — konuşma için düz metin lazım.
   Bu fonksiyon her provider'ı direkt çağırır, JSON parse ETMEZ.
   ─────────────────────────────────────────────────────────── */
async function _spCallRaw(systemPrompt, msgHistory) {
    const timeout = ms => new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms));

    // ── 1. Puter.js (ücretsiz, key gerektirmez) ──────────────
    if (typeof puter !== 'undefined' && puter?.ai?.chat) {
        try {
            // system role bazı modellerde çalışmıyor — ilk user mesajına ekliyoruz
            const firstUserContent = systemPrompt + '\n\n'
                + (msgHistory[0]?.content || 'Start the conversation.');
            const puterMsgs = [
                { role: 'user', content: firstUserContent },
                ...msgHistory.slice(1)
            ];
            const resp = await Promise.race([
                puter.ai.chat(puterMsgs, { model: 'gpt-4o-mini' }),
                timeout(12000)
            ]);
            // Puter yanıt formatları: resp.message.content (string veya array) veya direkt string
            const content = resp?.message?.content ?? resp?.content ?? resp;
            const raw = Array.isArray(content) ? (content[0]?.text || '')
                      : (typeof content === 'string' ? content : '');
            if (raw.trim()) { console.log('[Speaking] ✅ Puter.js'); return raw.trim(); }
            throw new Error('Puter boş yanıt döndü');
        } catch(e) { console.warn('[Speaking] Puter hatası:', e.message); }
    }

    // ── Keyed provider'lar ────────────────────────────────────
    const providers = (window.AI_PROVIDERS || []).filter(p => p.id !== 'puter');

    for (const prov of providers) {
        const key = localStorage.getItem(prov.lsKey);
        if (!key) continue;

        try {
            let raw = '';

            // Gemini
            if (prov.id === 'gemini') {
                const contents = msgHistory.map(m => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }));
                // system prompt'u ilk user mesajına ekle
                if (contents.length && contents[0].role === 'user') {
                    contents[0].parts[0].text = systemPrompt + '\n\n' + contents[0].parts[0].text;
                }
                let resp, data;
                for (const model of ['gemini-2.0-flash', 'gemini-1.5-flash']) {
                    resp = await Promise.race([
                        fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
                            { method:'POST', headers:{'Content-Type':'application/json'},
                              body: JSON.stringify({ contents }) }),
                        timeout(12000)
                    ]);
                    data = await resp.json();
                    if (data.error?.code === 404) continue;
                    break;
                }
                if (data?.error) throw new Error(data.error.message);
                raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            }

            // OpenAI-uyumlu provider'lar (Groq, OpenRouter, Mistral, vb.)
            else {
                const endpoints = {
                    groq:        { url:'https://api.groq.com/openai/v1/chat/completions',        model:'llama-3.3-70b-versatile' },
                    openrouter:  { url:'https://openrouter.ai/api/v1/chat/completions',           model:'meta-llama/llama-3.3-8b-instruct:free' },
                    mistral:     { url:'https://api.mistral.ai/v1/chat/completions',              model:'mistral-small-latest' },
                    openai:      { url:'https://api.openai.com/v1/chat/completions',              model:'gpt-4o-mini' },
                    cohere:      { url:'https://api.cohere.ai/v2/chat',                           model:'command-r' },
                };
                const ep = endpoints[prov.id];
                if (!ep) continue;

                const headers = { 'Content-Type':'application/json', 'Authorization':`Bearer ${key}` };
                if (prov.id === 'openrouter') {
                    headers['HTTP-Referer'] = 'https://ydt-master.web.app';
                    headers['X-Title'] = 'YDT Master';
                }
                const r = await Promise.race([
                    fetch(ep.url, { method:'POST', headers,
                        body: JSON.stringify({ model: ep.model, temperature: 0.7,
                            messages: [{ role:'system', content: systemPrompt }, ...msgHistory] }) }),
                    timeout(12000)
                ]);
                const d = await r.json();
                if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
                raw = d.choices?.[0]?.message?.content || '';
            }

            if (raw.trim()) { console.log(`[Speaking] ✅ ${prov.name}`); return raw.trim(); }

        } catch(e) { console.warn(`[Speaking] ${prov.name} hatası:`, e.message); }
    }

    throw new Error('Tüm AI servisleri başarısız.');
}

async function _spApiFetch(system, messages) {
    try {
        const reply = await _spCallRaw(system, messages);
        _spAiHistory.push({ role:'assistant', content:reply });
        _spAddMsg('a', reply);
        _spShowLoad(false); _spAiLoading = false;
    } catch(err) {
        console.warn('[Speaking AI] Hata:', err.message);
        const msg = err.message.includes('timeout')
            ? '⏱ AI yanıt vermedi. Tekrar deneyin.'
            : err.message.includes('Tüm AI')
            ? '⚠️ AI servisi başlatılamadı. Sayfayı yenileyip tekrar deneyin.'
            : '❌ Hata: ' + err.message.slice(0, 80);
        console.error('[Speaking] Son hata:', err.message);
        _spAddMsg('e', msg);
        _spShowLoad(false); _spAiLoading = false;
    }
}

function spChatReset() {
    _spAiHistory = []; _spAiTopic = null;
    document.getElementById('sp-chat-area').style.display  = 'none';
    document.getElementById('sp-topic-pick').style.display = 'block';
}

function _spAddMsg(type, text) {
    const c = document.getElementById('sp-chat-msgs');
    if (!c) return;
    const d = document.createElement('div');
    d.className = type==='u' ? 'sp-msg-u' : type==='a' ? 'sp-msg-a' : 'sp-msg-e';
    d.innerHTML = text.replace(/\n/g,'<br>');
    d.style.animation = 'sp-slide-in .2s ease';
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
}

function _spShowLoad(v) {
    const el = document.getElementById('sp-chat-load');
    if (el) el.style.display = v ? 'block' : 'none';
}

/* ════════════════════════════════════════════════════
   PHRASAL VERBS IN CONTEXT
════════════════════════════════════════════════════ */
function _spPhrasal() {
    const groups = [
        {
            label: 'İlişkiler & Sosyal Hayat', icon: '🤝', color: '#b45309', bg: '#fef3c7',
            verbs: [
                ['get along with',  'ile iyi geçinmek',       'I get along with my colleagues really well.',         'We don\'t get along — we argue all the time.'],
                ['fall out with',   'ile kavga edip küsmek',   'She fell out with her best friend over money.',       'They fell out last year and haven\'t spoken since.'],
                ['make up',         'barışmak',                'They made up after a long argument.',                 'Come on, just make up — life is too short.'],
                ['look up to',      'birine hayran olmak',     'I\'ve always looked up to my father.',                'She looks up to her mentor at work.'],
                ['put up with',     'katlanmak, tahammül etmek','I can\'t put up with his excuses any longer.',      'How do you put up with all that noise?'],
                ['grow apart',      'zamanla uzaklaşmak',      'We grew apart after university.',                    'Old friends often grow apart as they get older.'],
                ['reach out to',    'iletişime geçmek',        'Don\'t hesitate to reach out to me anytime.',        'She reached out to her estranged sister after years.'],
                ['bond with',       'bağ kurmak',              'It takes time to bond with new colleagues.',          'He bonded with the team during the retreat.'],
            ]
        },
        {
            label: 'İş & Kariyer', icon: '💼', color: '#1d4ed8', bg: '#dbeafe',
            verbs: [
                ['take on',         'sorumluluk üstlenmek',    'I\'ve taken on a lot of extra work this month.',     'Are you ready to take on a leadership role?'],
                ['hand in',         'teslim etmek',            'Please hand in your report by Friday.',               'She handed in her resignation last week.'],
                ['turn down',       'reddetmek',               'He turned down the job offer.',                      'I had to turn down the meeting — I was ill.'],
                ['set up',          'kurmak, organize etmek',  'She set up her own business at 28.',                 'Can you set up a meeting for Thursday?'],
                ['carry out',       'yürütmek, uygulamak',     'We need to carry out further research.',             'The plan was carried out successfully.'],
                ['follow up on',    'takip etmek',             'I\'ll follow up on that email tomorrow.',            'Did you follow up on the client\'s complaint?'],
                ['step down',       'görevden ayrılmak',       'The CEO stepped down after the scandal.',            'She stepped down to spend more time with family.'],
                ['burn out',        'tükenmek',                'If you don\'t rest, you\'ll burn out.',              'He burned out after working 80-hour weeks.'],
            ]
        },
        {
            label: 'Günlük Yaşam', icon: '☀️', color: '#059669', bg: '#dcfce7',
            verbs: [
                ['run out of',      'bitmek, tükenmek',        'We\'ve run out of milk — can you buy some?',         'My phone ran out of battery on the way here.'],
                ['cut down on',     'azaltmak',                'I\'m trying to cut down on sugar.',                  'The doctor told him to cut down on stress.'],
                ['give up',         'bırakmak, vazgeçmek',     'She gave up smoking three years ago.',               'Don\'t give up — you\'re almost there!'],
                ['come across',     'tesadüfen bulmak/tanışmak','I came across this article and thought of you.',    'She came across as very confident in the interview.'],
                ['look into',       'araştırmak',              'I\'ll look into the problem and get back to you.',   'The police are looking into the incident.'],
                ['sort out',        'çözmek, düzenlemek',      'Let me sort out this mess.',                         'Have you sorted out the travel arrangements?'],
                ['go through',      'yaşamak, geçirmek',       'He\'s going through a difficult time.',              'Let\'s go through the plan one more time.'],
                ['keep up with',    'ayak uydurmak',           'It\'s hard to keep up with all the new technology.','She struggles to keep up with the rest of the class.'],
            ]
        },
        {
            label: 'Konuşma & İletişim', icon: '💬', color: '#7c3aed', bg: '#ede9fe',
            verbs: [
                ['bring up',        'konuyu açmak',            'She brought up a really interesting point.',         'Don\'t bring up politics at dinner.'],
                ['point out',       'dikkat çekmek',           'He pointed out a mistake in my report.',             'I\'d like to point out that the deadline has passed.'],
                ['talk over',       'enine boyuna tartışmak',  'Let\'s talk it over before making a decision.',     'They talked the problem over for hours.'],
                ['back up',         'desteklemek, onaylamak',  'Can you back up that claim with evidence?',          'My colleague backed me up in the meeting.'],
                ['put across',      'açıklamak, anlatmak',     'She put her ideas across very clearly.',             'It\'s hard to put across complex ideas simply.'],
                ['come up with',    'bulmak, üretmek',         'He came up with a brilliant solution.',              'Can you come up with a better excuse than that?'],
            ]
        },
    ];

    const buildGroup = (g) => {
        const rows = g.verbs.map((v, i) => {
            const uid1 = `pv_${g.icon}_${i}_a`;
            const uid2 = `pv_${g.icon}_${i}_b`;
            const safe1 = v[2].replace(/'/g,"\\'");
            const safe2 = v[3].replace(/'/g,"\\'");
            return `
            <div class="sp-pv-item">
                <div class="sp-pv-header" style="background:${g.bg}">
                    <span class="sp-pv-verb" style="color:${g.color}">${v[0]}</span>
                    <span class="sp-pv-tr">${v[1]}</span>
                </div>
                <div class="sp-pv-examples">
                    <div class="sp-pv-ex">
                        <span class="sp-pv-tag">✅</span>
                        <span>${v[2]}</span>
                        <button onclick="spSpeak('${safe1}','${uid1}')" id="spk${uid1}" class="sp-spk-btn" title="Dinle">🔊</button>
                    </div>
                    <div class="sp-pv-ex">
                        <span class="sp-pv-tag">✅</span>
                        <span>${v[3]}</span>
                        <button onclick="spSpeak('${safe2}','${uid2}')" id="spk${uid2}" class="sp-spk-btn" title="Dinle">🔊</button>
                    </div>
                </div>
            </div>`;
        }).join('');
        return `
        <div class="sp-pv-group">
            <div class="sp-pv-group-header" style="background:${g.bg};border-left:4px solid ${g.color}">
                <span style="font-size:1.2rem">${g.icon}</span>
                <span style="font-weight:800;color:${g.color}">${g.label}</span>
                <span style="font-size:.75rem;color:#64748b;margin-left:auto">${g.verbs.length} fiil</span>
            </div>
            ${rows}
        </div>`;
    };

    return _spHero('🔀 Konuşma', 'Phrasal Verbs in Context', '40 temel phrasal verb — soyut liste değil, gerçek diyalog cümleleriyle birlikte öğren.', 'phrasal')
    + `<div class="sp-ov-wrap">
        ${_spBox('💡', 'Neden diyalog içinde öğrenmeli?',
            ['Phrasal verb\'lerin anlamı bağlama göre değişebilir.',
             '"Come across" hem "tesadüfen bulmak" hem de "izlenim vermek" anlamına gelebilir.',
             'Her fiili iki farklı cümlede gör → beyin bağlamla kodlar → kalıcı öğrenme.'],
            '#fffbeb','#fde68a','#92400e')}
        ${groups.map(buildGroup).join('')}
        ${_spBox('📌 Sık Yapılan Hatalar', 'Dikkat Et!',
            ['"I gave up to smoke" ❌ → "I gave up smoking" ✅ (give up + -ing)',
             '"She looks up her teacher" ❌ → "She looks up to her teacher" ✅',
             '"Put up with" ayrılmaz — "put it up with" diye bölme.'],
            '#fef2f2','#fecaca','#991b1b')}
    </div>`;
}

/* ════════════════════════════════════════════════════
   HESITATION & REPAIR STRATEGIES
════════════════════════════════════════════════════ */
function _spHesitation() {
    const strategies = [
        {
            title: '⏳ Zaman Kazanma (Buying Time)',
            color: '#059669', bg: '#dcfce7', border: '#86efac',
            desc: 'Konuşurken düşünmek için zaman kazanmak — her native speaker yapar.',
            phrases: [
                ['Hmm, that\'s a good question…',     'Hmm, bu iyi bir soru…'],
                ['Let me think about that for a second.', 'Bir saniye düşüneyim.'],
                ['Well, it depends…',                  'Şey, duruma göre değişir…'],
                ['That\'s an interesting point…',      'Bu ilginç bir nokta…'],
                ['Give me a moment to gather my thoughts.', 'Düşüncelerimi toplayana kadar bekle.'],
                ['How shall I put this…',              'Bunu nasıl ifade etsem…'],
                ['Off the top of my head, I\'d say…', 'Aklıma ilk gelen şey şu ki…'],
                ['Now that you mention it…',           'Şimdi söylediğine göre…'],
            ]
        },
        {
            title: '🔄 Kendini Düzeltme (Self-Repair)',
            color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd',
            desc: 'Yanlış söylediğini fark ettiğinde zarif şekilde geri dönmek.',
            phrases: [
                ['Sorry, what I meant to say was…',   'Özür dilerim, demek istediğim şuydu…'],
                ['Actually, let me rephrase that.',    'Aslında, bunu farklı ifade edeyim.'],
                ['Or rather…',                         'Daha doğrusu…'],
                ['What I\'m trying to say is…',        'Anlatmaya çalıştığım şey şu…'],
                ['Let me put it another way.',         'Başka türlü söyleyeyim.'],
                ['To be more precise…',                'Daha kesin ifade etmek gerekirse…'],
                ['I may have misspoken — I meant…',    'Yanlış söylemiş olabilirim — kastım şuydu…'],
                ['Come to think of it…',               'Bir düşününce…'],
            ]
        },
        {
            title: '🔍 Açıklama İsteme (Asking for Clarification)',
            color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd',
            desc: 'Anlamadığında kibar ve akıcı biçimde sormak.',
            phrases: [
                ['Sorry, could you say that again?',       'Özür dilerim, tekrar söyler misiniz?'],
                ['I\'m not sure I follow — could you elaborate?', 'Tam anlayamadım — biraz açar mısınız?'],
                ['What exactly do you mean by…?',          '…ile tam olarak ne demek istiyorsunuz?'],
                ['If I understand you correctly…',         'Sizi doğru anlıyorsam…'],
                ['Sorry, I didn\'t quite catch that.',     'Özür dilerim, tam olarak duymadım.'],
                ['Could you give me an example?',          'Bir örnek verir misiniz?'],
                ['Are you saying that…?',                  'Demek istediğiniz şu mu ki…?'],
            ]
        },
        {
            title: '🔗 Konuşmayı Sürdürme (Keeping the Floor)',
            color: '#b45309', bg: '#fef3c7', border: '#fcd34d',
            desc: 'Sırayı kaybetmeden konuşmaya devam etmek.',
            phrases: [
                ['And another thing…',                 'Bir de şu var ki…'],
                ['Not only that, but…',                'Sadece bu değil, ayrıca…'],
                ['Which brings me to my next point…',  'Bu da beni bir sonraki noktama getiriyor…'],
                ['To get back to what I was saying…',  'Söylediğime dönecek olursam…'],
                ['Anyway, the point is…',              'Her neyse, asıl mesele şu…'],
                ['As I was saying…',                   'Dediğim gibi…'],
            ]
        },
    ];

    const buildSec = (s) => {
        const rows = s.phrases.map((p, i) => {
            const uid = `hs_${s.title.slice(0,4)}_${i}`;
            const safe = p[0].replace(/'/g,"\\'");
            return `<div class="sp-row">
                <div class="sp-row-tr">${p[1]}</div>
                <div class="sp-row-en" style="color:${s.color}">${p[0]}</div>
                <div class="sp-row-spk"><button onclick="spSpeak('${safe}','${uid}')" id="spk${uid}" class="sp-spk-btn" title="Dinle">🔊</button></div>
            </div>`;
        }).join('');
        return `
        <div style="margin-bottom:22px">
            <div style="background:${s.bg};border:1.5px solid ${s.border};border-radius:14px;padding:14px 16px;margin-bottom:10px">
                <div style="font-weight:800;color:${s.color};font-size:1rem;margin-bottom:4px">${s.title}</div>
                <div style="font-size:.82rem;color:#475569">${s.desc}</div>
            </div>
            <div class="sp-tbl">${rows}</div>
        </div>`;
    };

    return _spHero('💭 Konuşma', 'Hesitation & Repair Strategies', '18 strateji — konuşurken doğal duraksama, kendini düzeltme ve sırayı kaybetmeme sanatı.', 'hesitation')
    + `<div class="sp-ov-wrap">
        ${_spBox('🎯', 'Bu Neden Bu Kadar Önemli?',
            ['Native speaker\'lar da duraksıyor — fakat bunu akıllıca yapıyorlar.',
             '"Um… uh…" demek yerine anlamlı kalıplar kullanmak seni C1 seviyesinde gösterir.',
             'Self-repair yapabilmek, dilin içselleştiğinin en güçlü kanıtıdır.'],
            '#f0fdf4','#bbf7d0','#065f46')}
        ${strategies.map(buildSec).join('')}
        ${_spExample('Yanlış', 'Doğru', [
            ['Um… I… I don\'t know how to say…', 'Let me think about that for a second. What I\'m trying to say is…'],
            ['She is… how do you say… she\'s… um… kind?', 'She is — how shall I put this — remarkably kind-hearted.'],
            ['I don\'t understand.', 'Sorry, I didn\'t quite catch that. Could you elaborate?'],
        ], '#fef2f2', '#991b1b')}
    </div>`;
}

/* ════════════════════════════════════════════════════
   FORMAL vs INFORMAL REGISTER
════════════════════════════════════════════════════ */
function _spRegister() {
    const pairs = [
        {
            ctx: 'Selamlaşma', icon: '👋',
            rows: [
                ['Hey! How\'s it going?',            'Good morning. How do you do?',           'Merhaba / Günaydın'],
                ['What\'s up?',                      'How are you getting on?',                'Ne var ne yok?'],
                ['Long time no see!',                'It\'s been a while, hasn\'t it.',        'Uzun zamandır görüşemedik'],
                ['See ya!',                          'It was a pleasure meeting you.',         'Görüşürüz / Tanıştığımıza memnun oldum'],
            ]
        },
        {
            ctx: 'Rica & Talep', icon: '🙏',
            rows: [
                ['Can you send me that?',            'Would it be possible to forward that to me?', 'Bunu bana gönderir misin?'],
                ['I need this ASAP.',                'I\'d appreciate it if this could be prioritised.', 'Bunu acele istiyorum'],
                ['Give me a hand, will you?',        'Could you assist me with this, please?',  'Yardım eder misin?'],
                ['Hang on a sec.',                   'Could you bear with me for a moment?',   'Bir dakika bekler misin?'],
            ]
        },
        {
            ctx: 'Özür & Mazeret', icon: '😔',
            rows: [
                ['Sorry, my bad.',                   'I sincerely apologise for the inconvenience.', 'Özür dilerim'],
                ['I totally forgot!',                'I\'m afraid it slipped my mind entirely.', 'Unuttum'],
                ['Can\'t make it tonight.',           'I regret to inform you that I won\'t be able to attend.', 'Gelemeyeceğim'],
                ['My bad — I messed up.',            'I take full responsibility for the oversight.', 'Hata bende / Ben mahvettim'],
            ]
        },
        {
            ctx: 'Fikir Bildirme', icon: '💬',
            rows: [
                ['I reckon…',                        'In my view / It is my considered opinion that…', 'Bence…'],
                ['That\'s rubbish!',                 'I\'m afraid I can\'t agree with that.',   'Saçmalık / Katılmıyorum'],
                ['Yeah, totally.',                   'I couldn\'t agree more.',                 'Kesinlikle katılıyorum'],
                ['Not sure about that.',             'I have some reservations about that.',    'Bundan emin değilim'],
            ]
        },
        {
            ctx: 'E-posta / Yazışma', icon: '📧',
            rows: [
                ['Hey, just checking in.',           'I am writing to follow up on our previous conversation.', 'Kontrol amaçlı yazıyorum'],
                ['FYI — ',                           'For your information / Please be advised that', 'Bilgin olsun'],
                ['Let me know!',                     'Please do not hesitate to contact me.',   'Haber ver / İletişime geçin'],
                ['Talk soon.',                       'I look forward to hearing from you.',     'Yakında konuşuruz / Yanıtınızı bekliyorum'],
            ]
        },
        {
            ctx: 'Problem Çözme', icon: '🔧',
            rows: [
                ['It\'s broken.',                    'The system appears to be malfunctioning.', 'Bozuk'],
                ['We messed up the deadline.',       'We have unfortunately failed to meet the deadline.', 'Son tarihi kaçırdık'],
                ['Fix it.',                          'Please rectify this at your earliest convenience.', 'Düzelt'],
                ['Not my problem.',                  'This falls outside my area of responsibility.', 'Bu benim sorunum değil'],
            ]
        },
    ];

    const buildPair = (p) => {
        const rows = p.rows.map((r, i) => {
            const uid1 = `reg_${p.icon}_${i}_f`;
            const uid2 = `reg_${p.icon}_${i}_i`;
            const safe1 = r[0].replace(/'/g,"\\'");
            const safe2 = r[1].replace(/'/g,"\\'");
            return `<div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #e2e8f0;padding:10px 0;gap:8px">
                <div style="display:flex;align-items:flex-start;gap:6px">
                    <span style="background:#fef3c7;color:#92400e;font-size:.62rem;font-weight:800;padding:2px 7px;border-radius:99px;white-space:nowrap;margin-top:2px">INFORMAL</span>
                    <div>
                        <div style="font-size:.88rem;color:#1e293b;font-weight:600">${r[0]}</div>
                        <button onclick="spSpeak('${safe1}','${uid1}')" id="spk${uid1}" class="sp-spk-btn" title="Dinle" style="margin-top:3px">🔊</button>
                    </div>
                </div>
                <div style="display:flex;align-items:flex-start;gap:6px">
                    <span style="background:#dbeafe;color:#1d4ed8;font-size:.62rem;font-weight:800;padding:2px 7px;border-radius:99px;white-space:nowrap;margin-top:2px">FORMAL</span>
                    <div>
                        <div style="font-size:.88rem;color:#1e293b;font-weight:600">${r[1]}</div>
                        <button onclick="spSpeak('${safe2}','${uid2}')" id="spk${uid2}" class="sp-spk-btn" title="Dinle" style="margin-top:3px">🔊</button>
                    </div>
                </div>
            </div>`;
        }).join('');
        return `
        <div style="margin-bottom:20px;background:white;border:1.5px solid #e2e8f0;border-radius:16px;overflow:hidden">
            <div style="background:#f8fafc;padding:12px 16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:10px">
                <span style="font-size:1.3rem">${p.icon}</span>
                <span style="font-weight:800;color:#1e293b">${p.ctx}</span>
                <span style="font-size:.75rem;color:#64748b;margin-left:auto">${p.rows.length} çift</span>
            </div>
            <div style="padding:0 16px 8px">${rows}</div>
            <div style="padding:8px 16px 14px;font-size:.75rem;color:#94a3b8;font-style:italic">Türkçe karşılık: ${p.rows.map(r=>r[2]).join(' · ')}</div>
        </div>`;
    };

    return _spHero('🎭 Konuşma', 'Formal vs Informal Register', '24 çift — aynı anlamı farklı bağlamlarda söylemenin sanatı.', 'register')
    + `<div class="sp-ov-wrap">
        ${_spBox('⚠️', 'Register Neden Bu Kadar Kritik?',
            ['"I need this ASAP" → iş arkadaşına tamam, müdürüne çok kaba.',
             'İngilizce\'de "çok formal" olmak da garip — denge şart.',
             'Bu listeyi ezberlemek yerine bağlamı hissetmeye çalış.'],
            '#fffbeb','#fde68a','#92400e')}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;text-align:center">
            <div style="background:#fef3c7;border:2px solid #fcd34d;border-radius:12px;padding:12px">
                <div style="font-size:1.3rem">😎</div>
                <div style="font-weight:800;color:#92400e;font-size:.88rem">INFORMAL</div>
                <div style="font-size:.75rem;color:#78350f">Arkadaşlar, sosyal medya, mesajlaşma, yakın iş arkadaşları</div>
            </div>
            <div style="background:#dbeafe;border:2px solid #93c5fd;border-radius:12px;padding:12px">
                <div style="font-size:1.3rem">👔</div>
                <div style="font-weight:800;color:#1d4ed8;font-size:.88rem">FORMAL</div>
                <div style="font-size:.75rem;color:#1e40af">İş görüşmesi, e-posta, sunum, resmi yazışma, yabancılar</div>
            </div>
        </div>
        ${pairs.map(buildPair).join('')}
    </div>`;
}

/* ════════════════════════════════════════════════════
   JOB INTERVIEW / PRESENTATION LANGUAGE
════════════════════════════════════════════════════ */
function _spInterview() {
    const sections = [
        {
            title: '🙋 Kendini Tanıtma (Tell Me About Yourself)',
            color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd',
            tip: 'Standart "I am a student from Turkey" yerine hikâye anlat: Background → Experience → Future.',
            phrases: [
                ['I have a background in…',                     '…alanında bir geçmişim var'],
                ['I\'ve spent the last X years working on / in…', 'Son X yılı …üzerinde çalışarak geçirdim'],
                ['What sets me apart is…',                       'Beni farklı kılan şey…'],
                ['I\'m particularly passionate about…',          '…konusunda özellikle tutkulum'],
                ['My experience has taught me that…',            'Deneyimlerim bana şunu öğretti:…'],
                ['I thrive in environments where…',              '…ortamlarda verimli çalışırım'],
                ['Going forward, I\'m keen to…',                 'İleride …yapmak istiyorum'],
            ]
        },
        {
            title: '💪 Güçlü Yönler & Başarılar',
            color: '#059669', bg: '#dcfce7', border: '#86efac',
            tip: 'STAR yöntemini kullan: Situation → Task → Action → Result',
            phrases: [
                ['I\'d like to give you a concrete example of…', '…için somut bir örnek vermek istiyorum'],
                ['In that situation, I decided to…',             'O durumda …yapmaya karar verdim'],
                ['As a result, we managed to…',                  'Sonuç olarak …başardık'],
                ['This taught me the importance of…',            'Bu bana …önemini öğretti'],
                ['I take pride in my ability to…',               '…yapabilme kabiliyetimle gurur duyuyorum'],
                ['One of my key strengths is…',                  'Temel güçlü yönlerimden biri…'],
                ['I was able to increase / reduce / improve…',   '…artırmayı / azaltmayı / iyileştirmeyi başardım'],
            ]
        },
        {
            title: '❓ Zor Sorularla Başa Çıkma',
            color: '#e11d48', bg: '#ffe4e6', border: '#fca5a5',
            tip: '"Zayıf yönün ne?" sorusunu fırsata çevir: zayıflık + ne yapıyorsun = güç.',
            phrases: [
                ['That\'s a challenging question — let me think…', 'Bu zorlu bir soru — düşüneyim…'],
                ['To be honest, I used to struggle with… but…',  'Dürüst olmak gerekirse, eskiden …güçlük çekerdim ama…'],
                ['I see that as an area for growth — I\'m actively working on…', 'Bunu gelişme alanı olarak görüyorum — aktif olarak …üzerinde çalışıyorum'],
                ['Looking back, I would have…',                   'Geriye bakacak olursam, …yapardım'],
                ['That experience gave me a valuable lesson in…', 'O deneyim bana …konusunda değerli bir ders verdi'],
            ]
        },
        {
            title: '📊 Sunum & Toplantı Dili',
            color: '#1d4ed8', bg: '#dbeafe', border: '#93c5fd',
            tip: 'İyi bir sunum yapısı: açılış → geçişler → özet → sorular',
            phrases: [
                ['Good morning everyone. Today I\'d like to walk you through…', 'Günaydın herkese. Bugün size …konusunu anlatmak istiyorum'],
                ['I\'ve divided my presentation into three parts.',              'Sunumumu üç bölüme ayırdım'],
                ['Please feel free to ask questions throughout.',                'Her an soru sormaktan çekinmeyin'],
                ['Moving on to our next point…',                                'Bir sonraki noktamıza geçelim…'],
                ['This slide illustrates / shows / demonstrates…',              'Bu slayt …göstermektedir'],
                ['As you can see from the data…',                               'Verilerden de görüldüğü gibi…'],
                ['To summarise what we\'ve covered today…',                     'Bugün ele aldıklarımızı özetlemek gerekirse…'],
                ['I\'d be happy to take any questions now.',                    'Şimdi sorularınızı almaktan memnuniyet duyarım'],
            ]
        },
        {
            title: '🤝 Toplantıda Fikir Alışverişi',
            color: '#b45309', bg: '#fef3c7', border: '#fcd34d',
            tip: 'Söz almak, katılmak, nazikçe karşı çıkmak — hepsinin bir formülü var.',
            phrases: [
                ['If I could just come in here…',                'Burada söz alabilir miyim…'],
                ['Building on what you said…',                   'Söylediğinizin üzerine eklemek gerekirse…'],
                ['I see your point, however…',                   'Görüşünüzü anlıyorum, ancak…'],
                ['Would it be worth considering…?',              '…düşünmeye değer olmaz mı?'],
                ['I\'d like to propose an alternative…',         'Alternatif bir öneri sunmak istiyorum…'],
                ['Could we table that for now and…?',            'Bunu şimdilik erteleyip …yapabilir miyiz?'],
                ['That\'s a fair point — I\'d add that…',       'Bu yerinde bir nokta — şunu da ekleyeyim:…'],
            ]
        },
    ];

    const buildSec = (s) => {
        const rows = s.phrases.map((p, i) => {
            const uid = `iv_${s.color.slice(1,5)}_${i}`;
            const safe = p[0].replace(/'/g,"\\'");
            return `<div class="sp-row">
                <div class="sp-row-tr">${p[1]}</div>
                <div class="sp-row-en" style="color:${s.color}">${p[0]}</div>
                <div class="sp-row-spk"><button onclick="spSpeak('${safe}','${uid}')" id="spk${uid}" class="sp-spk-btn" title="Dinle">🔊</button></div>
            </div>`;
        }).join('');
        return `
        <div style="margin-bottom:22px">
            <div style="background:${s.bg};border:1.5px solid ${s.border};border-radius:14px;padding:14px 16px;margin-bottom:10px">
                <div style="font-weight:800;color:${s.color};font-size:1rem;margin-bottom:6px">${s.title}</div>
                <div style="font-size:.8rem;color:#475569;padding:8px 10px;background:rgba(255,255,255,.6);border-radius:8px;border-left:3px solid ${s.color}">
                    💡 ${s.tip}
                </div>
            </div>
            <div class="sp-tbl">${rows}</div>
        </div>`;
    };

    return _spHero('💼 Konuşma', 'İş Görüşmesi & Sunum Dili', '30 kalıp — mülakattan toplantıya, sunumdan zor sorulara kadar profesyonel İngilizce.', 'interview')
    + `<div class="sp-ov-wrap">
        ${_spBox('🎯', 'Neden Bu Kalıplar Şart?',
            ['"I am good at communication" → çok zayıf ve genel.',
             '"I thrive in environments where clear communication drives results." → güçlü, özgüven saçıyor.',
             'Bu liste İngilizce\'yi konuşmaktan iş İngilizce\'sini konuşmaya geçiş köprüsü.'],
            '#f0fdf4','#bbf7d0','#065f46')}
        ${sections.map(buildSec).join('')}
        ${_spBox('📌 Altın Kural',
            'Do\'s & Don\'ts',
            ['✅ Somut örnek ver (STAR metodu)',
             '✅ Rakamla destekle ("improved efficiency by 30%")',
             '✅ Kısa ve net cevapla — 2 dakikayı geçme',
             '❌ "I am a hard worker" gibi klişelerden kaçın',
             '❌ "I don\'t have any weaknesses" deme — kimseye inanılmaz',
             '❌ Türkçe\'den birebir çevirme ("I am very sociable person")'],
            '#eff6ff','#bfdbfe','#1e40af')}
    </div>`;
}

/* ════════════════════════════════════════════════════
   CSS EKLEMELERİ — Phrasal Verbs için ek stiller
════════════════════════════════════════════════════ */
(function _injectSpeakingExtStyles() {
    if (document.getElementById('sp-ext-styles')) return;
    const s = document.createElement('style');
    s.id = 'sp-ext-styles';
    s.textContent = `
        .sp-pv-group { margin-bottom: 20px; }
        .sp-pv-group-header {
            display: flex; align-items: center; gap: 10px;
            padding: 12px 16px; border-radius: 14px 14px 0 0;
            font-size: .9rem;
        }
        .sp-pv-item {
            background: white; border: 1px solid #e2e8f0;
            border-top: none;
        }
        .sp-pv-item:last-child { border-radius: 0 0 14px 14px; }
        .sp-pv-header {
            display: flex; align-items: center; gap: 14px;
            padding: 10px 16px; border-bottom: 1px solid #f1f5f9;
        }
        .sp-pv-verb {
            font-weight: 900; font-size: 1rem; min-width: 140px;
        }
        .sp-pv-tr {
            font-size: .8rem; color: #64748b; font-style: italic;
        }
        .sp-pv-examples { padding: 8px 16px 12px; display: flex; flex-direction: column; gap: 6px; }
        .sp-pv-ex {
            display: flex; align-items: flex-start; gap: 8px;
            font-size: .85rem; color: #334155; line-height: 1.5;
        }
        .sp-pv-tag { font-size: .8rem; margin-top: 1px; flex-shrink: 0; }
    `;
    document.head.appendChild(s);
})();
