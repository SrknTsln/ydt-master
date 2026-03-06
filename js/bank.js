// ── Soru Bankası / Arşiv — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state)

const BANK_PAGE_SIZE  = 50; // accordion sub-liste başına maks soru
const BANK_GROUP_SIZE = 10; // içerik alanında aynı anda gösterilen soru
const PARA_GROUP_SIZE = 10; // paragraf grubu başına pasaj sayısı

function renderArsiv() {
    /* ═══════════════════════════════════════════════════════
       SORU BANKASI — v4.0
       Sol sidebar nav + sağ içerik alanı
       bk- CSS sınıflarını tam kullanır
       ═══════════════════════════════════════════════════════ */

    const arsiv   = (window.aiArsiv || []).filter(e =>
        e && typeof e === 'object' &&
        e.question && e.correct && e.options &&
        (e.word || e.wordTr)  // en az word veya wordTr alanı olmalı
    );
    const filter  = document.getElementById('arsiv-list-filter')?.value || '';
    const sidebar = document.getElementById('bk-sidebar');
    const cont    = document.getElementById('arsiv-content');
    if (!sidebar || !cont) return;

    // ── Veri özeti ──────────────────────────────────────────
    const filteredArsiv   = filter ? arsiv.filter(e => e.listName === filter) : arsiv;
    const totalKelime     = filteredArsiv.length;
    const kelimePages     = Math.max(1, Math.ceil(totalKelime / BANK_PAGE_SIZE));

    const pSorular        = window.paragrafSorular || {};
    const pKeys           = Object.keys(pSorular);
    const totalParagraf   = pKeys.reduce((s, k) => s + (pSorular[k].questions||[]).length, 0);
    const paraGroupCount  = Math.max(1, Math.ceil(pKeys.length / PARA_GROUP_SIZE));

    const gramerArsiv     = window.aiGramerArsiv || [];
    const totalGramer     = gramerArsiv.length;
    const gramerPages     = Math.max(1, Math.ceil(totalGramer / BANK_PAGE_SIZE));

    const clozeArsiv      = window.aiClozeArsiv      || [];
    const yakinArsiv      = window.aiYakinArsiv       || [];
    const paraComArsiv    = window.aiParaComArsiv     || [];
    const diyalogArsiv    = window.aiDiyalogArsiv     || [];
    const durumArsiv      = window.aiDurumArsiv       || [];
    const paraBozArsiv    = window.aiParaBozArsiv     || [];

    const grandTotal = totalKelime + totalParagraf + totalGramer +
                       clozeArsiv.length + yakinArsiv.length + paraComArsiv.length +
                       diyalogArsiv.length + durumArsiv.length + paraBozArsiv.length;

    // Badge güncelle
    const badge = document.getElementById('bk-total-badge');
    if (badge) badge.textContent = grandTotal || '—';

    // ── Aktif seçim ─────────────────────────────────────────
    const active = window._arsivActiveSubList || 'overview';

    // ── Kategoriler tanımı ──────────────────────────────────
    const cats = [
        {
            key: 'kelime', theme: 'bkt-kelime', icon: '📝', label: 'Kelime', count: totalKelime,
            desc: 'Çoktan seçmeli', color: '#4f46e5',
            subs: Array.from({length: kelimePages}, (_, i) => ({
                key: `kelime_${i+1}`,
                label: `Kelime Soruları ${i+1}`,
                range: `${i*BANK_PAGE_SIZE+1}–${Math.min((i+1)*BANK_PAGE_SIZE, totalKelime)}`,
                count: Math.min(BANK_PAGE_SIZE, totalKelime - i*BANK_PAGE_SIZE)
            }))
        },
        {
            key: 'paragraf', theme: 'bkt-paragraf', icon: '📖', label: 'Paragraf', count: totalParagraf,
            desc: `${pKeys.length} pasaj`, color: '#059669',
            subs: pKeys.length === 0
                ? [{key:'paragraf_import', label:'Paket Yükle', range:'', count:0, isImport:true}]
                : Array.from({length: paraGroupCount}, (_, gi) => {
                    const sk = gi * PARA_GROUP_SIZE;
                    const ek = Math.min((gi+1)*PARA_GROUP_SIZE, pKeys.length);
                    const gc = pKeys.slice(sk, ek).reduce((s,k)=>s+(pSorular[k].questions||[]).length,0);
                    return { key:`paragraf_g${gi+1}`, label:`Pasajlar ${gi+1}`, range:`${sk+1}–${ek}. pasaj`, count:gc };
                })
        },
        {
            key: 'gramer', theme: 'bkt-gramer', icon: '⚙️', label: 'Gramer', count: totalGramer,
            desc: 'Grammar soruları', color: '#d97706',
            subs: Array.from({length: gramerPages}, (_, i) => ({
                key: `gramer_${i+1}`,
                label: `Gramer Soruları ${i+1}`,
                range: `${i*BANK_PAGE_SIZE+1}–${Math.min((i+1)*BANK_PAGE_SIZE, totalGramer)}`,
                count: Math.min(BANK_PAGE_SIZE, totalGramer - i*BANK_PAGE_SIZE)
            }))
        }
    ];

    const ydt_cats = [
        { key:'cloze',    theme:'bkt-cloze',    icon:'🔵', label:'Cloze Test',         count:clozeArsiv.length,   desc:'Boşluk doldurma',    color:'#7c3aed', coming: clozeArsiv.length===0 },
        { key:'yakin',    theme:'bkt-yakin',     icon:'🔤', label:'Yakın Anlamlı',       count:yakinArsiv.length,   desc:'Cümle eşleşme',      color:'#be185d', coming: yakinArsiv.length===0 },
        { key:'paraCom',  theme:'bkt-ptamam',    icon:'🧩', label:'Para. Tamamlama',     count:paraComArsiv.length, desc:'Paragraf tamamlama', color:'#0d9488', coming: paraComArsiv.length===0 },
        { key:'diyalog',  theme:'bkt-diyalog',   icon:'💬', label:'Diyalog Tamamlama',   count:diyalogArsiv.length, desc:'Diyalog boşlukları', color:'#c2410c', coming: diyalogArsiv.length===0 },
        { key:'durum',    theme:'bkt-durum',     icon:'🎭', label:'Durum Soruları',       count:durumArsiv.length,   desc:'Bağlamsal sorular',  color:'#b45309', coming: durumArsiv.length===0 },
        { key:'paraBoz',  theme:'bkt-butunluk',  icon:'🚫', label:'Para. Bütünlüğü',     count:paraBozArsiv.length, desc:'Yabancı cümle bul',  color:'#4d7c0f', coming: paraBozArsiv.length===0 }
    ];

    // ════════════════════════════
    // SOL SIDEBAR OLUŞTUR
    // ════════════════════════════
    let sbHtml = '';

    // Overview butonu
    sbHtml += `
    <button class="bk-nav-cat-btn ${active==='overview'?'bk-cat-open':''}"
            onclick="selectArsivSubList('overview')" style="border-radius:10px;margin-bottom:2px;">
        <div class="bk-nav-cat-icon" style="background:#f3f4f6;color:#6b7280;">📊</div>
        <div class="bk-nav-cat-info">
            <span class="bk-nav-cat-name">Genel Bakış</span>
            <span class="bk-nav-cat-count">${grandTotal} toplam soru</span>
        </div>
    </button>`;

    // Ana kategoriler
    sbHtml += `<div class="bk-nav-section-label">Ana Kategoriler</div>`;
    cats.forEach(cat => {
        const isOpen = active.startsWith(cat.key);
        sbHtml += `
        <div class="bk-nav-cat ${cat.theme}">
            <button class="bk-nav-cat-btn ${isOpen?'bk-cat-open':''}"
                    onclick="bkToggleCat('${cat.key}')">
                <div class="bk-nav-cat-icon">${cat.icon}</div>
                <div class="bk-nav-cat-info">
                    <span class="bk-nav-cat-name">${cat.label}</span>
                    <span class="bk-nav-cat-count">${cat.count} soru</span>
                </div>
                <span class="bk-nav-cat-badge">${cat.count}</span>
                <span class="bk-nav-cat-chev">▾</span>
            </button>
            <div class="bk-nav-sub ${isOpen?'bk-sub-open':''}">
                ${cat.subs.map(sub => sub.isImport
                    ? `<button class="bk-nav-add-btn" onclick="showImportParagrafModal()">＋ Paket Yükle</button>`
                    : `<button class="bk-nav-sub-btn ${active===sub.key?'bk-sub-active':''}"
                                onclick="selectArsivSubList('${sub.key}')">
                            <span class="bk-nsb-label">${sub.label}</span>
                            <span class="bk-nsb-badge">${sub.count}</span>
                        </button>`
                ).join('')}
            </div>
        </div>`;
    });

    // YDT Soru Tipleri
    sbHtml += `<div class="bk-nav-section-label">YDT Soru Tipleri</div>`;
    ydt_cats.forEach(cat => {
        const isActive = active === cat.key;
        sbHtml += `
        <div class="bk-nav-cat ${cat.theme}">
            <button class="bk-nav-cat-btn ${isActive?'bk-cat-open':''}"
                    onclick="selectArsivSubList('${cat.key}')">
                <div class="bk-nav-cat-icon">${cat.icon}</div>
                <div class="bk-nav-cat-info">
                    <span class="bk-nav-cat-name">${cat.label}</span>
                    <span class="bk-nav-cat-count">${cat.coming ? 'Yakında' : cat.count+' soru'}</span>
                </div>
                ${!cat.coming ? `<span class="bk-nav-cat-badge">${cat.count}</span>` : ''}
            </button>
        </div>`;
    });

    sidebar.innerHTML = sbHtml;

    // Mobil pill bar
    const mobBar = document.getElementById('bk-mob-sub-bar');
    if (mobBar) {
        const allNavCats = [
            {key:'overview', icon:'📊', label:'Genel', theme:''},
            ...cats.map(c=>({...c})),
            ...ydt_cats.map(c=>({...c}))
        ];
        mobBar.innerHTML = allNavCats.map(c =>
            `<button class="bk-mob-sub-pill ${active===c.key||active.startsWith(c.key)?'bk-mob-active':''} ${c.theme||''}"
                     onclick="selectArsivSubList('${c.key}')">
                ${c.icon} ${c.label||c.key}
            </button>`
        ).join('');
        mobBar.style.display = '';
    }

    // ════════════════════════════
    // İÇERİK ALANI
    // ════════════════════════════

    // ─── GENEL BAKIŞ ────────────────────────────────────
    if (active === 'overview') {
        let ovHtml = `
        <div class="bk-content-hdr">
            <div class="bk-content-hdr-l">
                <div class="bk-stripe" style="background:#6366f1;"></div>
                <span class="bk-content-type-pill" style="background:#e0e7ff;color:#4f46e5;">Tüm Kategoriler</span>
                <span class="bk-content-title">Soru Bankası Genel Bakış</span>
            </div>
            <span class="bk-content-meta">${grandTotal} toplam soru</span>
        </div>
        <div class="bk-overview">`;

        const ovItems = [
            ...cats.map(c=>({icon:c.icon,label:c.label,count:c.count,theme:c.theme,desc:c.desc,key:c.key})),
            ...ydt_cats.map(c=>({icon:c.icon,label:c.label,count:c.count,theme:c.theme,desc:c.desc,key:c.key,coming:c.coming}))
        ];
        ovItems.forEach(item => {
            ovHtml += `
            <div class="bk-ov-card ${item.theme}" onclick="selectArsivSubList('${item.key}')">
                <div class="bk-ov-icon">${item.icon}</div>
                <div class="bk-ov-count">${item.count}</div>
                <div class="bk-ov-label">${item.label}</div>
                <div class="bk-ov-sub">${item.coming ? '🔒 Yakında eklenecek' : item.desc}</div>
                <div class="bk-ov-arrow">→</div>
            </div>`;
        });
        ovHtml += `</div>`;
        cont.innerHTML = ovHtml;
        return;
    }

    // ─── YDT "YAKINDA" KATEGORİLER ──────────────────────
    const ydtMatch = ydt_cats.find(c => c.key === active);
    if (ydtMatch && ydtMatch.coming) {
        cont.innerHTML = `
        <div class="bk-empty">
            <div class="bk-empty-ico">${ydtMatch.icon}</div>
            <div class="bk-empty-title">${ydtMatch.label}</div>
            <div class="bk-empty-sub">${ydtMatch.desc} soruları hazırlanıyor. Yakında bu kategoride sorular eklenecek!</div>
        </div>`;
        return;
    }

    // ─── GRAMER SUB-LİSTESİ ─────────────────────────────
    const gramerMatch = active.match(/^gramer_(\d+)$/);
    if (gramerMatch) {
        const gPI   = parseInt(gramerMatch[1]) - 1;
        const gSlice = gramerArsiv.slice(gPI * BANK_PAGE_SIZE, (gPI+1) * BANK_PAGE_SIZE);
        const gGroups = Math.max(1, Math.ceil(gSlice.length / BANK_GROUP_SIZE));
        const gGroupPg = Math.min(window._arsivGroupPage || 1, gGroups);
        window._arsivGroupPage = gGroupPg;
        const gActive = gSlice.slice((gGroupPg-1)*BANK_GROUP_SIZE, gGroupPg*BANK_GROUP_SIZE);
        if (!window._bankQMap) window._bankQMap = {};

        let gHtml = `
        <div class="bk-content-hdr">
            <div class="bk-content-hdr-l">
                <div class="bk-stripe"></div>
                <span class="bk-content-type-pill">⚙️ Gramer</span>
                <span class="bk-content-title">Gramer Soruları ${gramerMatch[1]}</span>
            </div>
            <span class="bk-content-meta">${gSlice.length} soru · ${(gGroupPg-1)*BANK_GROUP_SIZE+1}–${Math.min(gGroupPg*BANK_GROUP_SIZE,gSlice.length)} gösteriliyor</span>
        </div>`;

        gActive.forEach((item, idx) => {
            const globalIdx = (gGroupPg-1)*BANK_GROUP_SIZE + idx;
            const qNum = gPI*BANK_PAGE_SIZE + globalIdx + 1;
            const qId  = `gq_${qNum}`;
            window._bankQMap[qId] = { correct: item.correct, explanation: item.explanation||'', options: item.options||{} };
            const userAns  = window._bankAnswers?.[qId];
            const revealed = window._bankRevealed?.[qId];

            gHtml += `
            <div class="bk-q-card ${revealed ? (userAns===item.correct?'bk-correct':'bk-wrong') : ''}">
                <div class="bk-q-meta-row">
                    <span class="bk-q-num">${qNum}.</span>
                    <span class="bk-q-type-chip">⚙️ Gramer</span>
                    <span class="bk-q-date">#${qNum}</span>
                    ${revealed ? `<button class="bk-q-reset" onclick="resetBankQuestion('${qId}')" style="display:inline-flex;">↺ Tekrar</button>` : ''}
                </div>
                <div class="bk-q-text">${item.question||''}</div>
                <div class="bk-opts">
                    ${Object.entries(item.options||{}).map(([k,v]) => {
                        const isC = k === item.correct;
                        const isCh = k === userAns;
                        let cls = '';
                        if (revealed) { cls = isC ? 'bk-opt-c' : (isCh ? 'bk-opt-w' : ''); }
                        else if (isCh) cls = 'bk-opt-c';
                        return `<button class="bk-opt ${cls}" onclick="bankSelectGramer('${qId}','${k}')" ${revealed?'disabled':''}>
                            <span class="bk-opt-key">${k}</span>
                            <span class="bk-opt-text">${v}</span>
                            ${revealed&&isC?'<span style="margin-left:auto">✅</span>':''}
                            ${revealed&&isCh&&!isC?'<span style="margin-left:auto">❌</span>':''}
                        </button>`;
                    }).join('')}
                </div>
                ${item.explanation && revealed ? `
                <div class="bk-exp ${userAns===item.correct?'bk-exp-c':'bk-exp-w'}" style="display:block;">
                    <span class="bk-exp-lbl ${userAns===item.correct?'bk-exp-c':'bk-exp-w'}">💡 Açıklama</span>
                    ${item.explanation}
                </div>` : ''}
                ${!revealed ? `<div style="padding:0 16px 14px;"><button onclick="bankRevealGramer('${qId}')"
                    style="padding:6px 16px;border-radius:9px;border:none;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;font-size:.75rem;font-weight:700;cursor:pointer;font-family:inherit;">
                    Cevabı Gör</button></div>` : ''}
            </div>`;
        });

        if (gGroups > 1) {
            gHtml += `<div class="bk-pager">
                <button class="bk-pg-btn" onclick="setArsivGroupPage(${gGroupPg-1})" ${gGroupPg<=1?'disabled':''}>‹</button>`;
            for (let p=1; p<=gGroups; p++) {
                gHtml += `<button class="bk-pg-btn ${p===gGroupPg?'bk-pg-act':''}" onclick="setArsivGroupPage(${p})">${(p-1)*BANK_GROUP_SIZE+1}–${Math.min(p*BANK_GROUP_SIZE,gSlice.length)}</button>`;
            }
            gHtml += `<button class="bk-pg-btn" onclick="setArsivGroupPage(${gGroupPg+1})" ${gGroupPg>=gGroups?'disabled':''}>›</button></div>`;
        }
        cont.innerHTML = gHtml;
        return;
    }

    // ─── PARAGRAF SUB-LİSTESİ ───────────────────────────
    const paraGMatch = active.match(/^paragraf_g(\d+)$/);
    if (paraGMatch) {
        const groupNum  = parseInt(paraGMatch[1]);
        const startIdx  = (groupNum-1) * PARA_GROUP_SIZE;
        const groupKeys = pKeys.slice(startIdx, startIdx + PARA_GROUP_SIZE);
        if (!window._bankQMap) window._bankQMap = {};
        if (!window._paraGroupPage) window._paraGroupPage = {};
        const pgKey   = `g${groupNum}`;
        const curPage = window._paraGroupPage[pgKey] || 1;
        const activePK = groupKeys[curPage-1];
        const pData    = activePK ? pSorular[activePK] : null;

        let pHtml = `
        <div class="bk-content-hdr">
            <div class="bk-content-hdr-l">
                <div class="bk-stripe" style="background:#10b981;"></div>
                <span class="bk-content-type-pill" style="background:#d1fae5;color:#059669;">📖 Paragraf</span>
                <span class="bk-content-title">Pasajlar ${groupNum}</span>
            </div>
            <span class="bk-content-meta">${startIdx+curPage}. pasaj · ${(pData?.questions||[]).length} soru</span>
        </div>`;

        if (pData?.questions?.length) {
            window._currentPasajBaslik = pData.baslik || '';
            pHtml += `
            <div class="bk-pasaj-wrap">
                <div class="bk-pasaj-hdr">
                    <span class="bk-pasaj-title">${stripNumPrefix(pData.baslik)||'Paragraf'}</span>
                    <button class="bk-pasaj-goto" onclick="goToPasajOku()">📖 Okuma Modu →</button>
                </div>
                <div class="bk-pasaj-body">${(pData.metin||'').replace(/\n/g,'<br>')}</div>
            </div>`;

            pData.questions.forEach((q, qi) => {
                const qId = `pq_${activePK}_${qi}`;
                window._bankQMap[qId] = { correct: q.answer, explanation: q.explanation||'', options:{} };
                (q.options||[]).forEach(opt => { window._bankQMap[qId].options[opt[0]] = opt.slice(3); });

                pHtml += `
                <div class="bk-q-card" id="qcard_${qId}">
                    <div class="bk-q-meta-row">
                        <span class="bk-q-num" style="background:#d1fae5;color:#059669;">${qi+1}.</span>
                        <span class="bk-q-type-chip">${q.type||'Reading'}</span>
                    </div>
                    <div class="bk-q-text">${q.question}</div>
                    <div class="bk-opts" id="opts_${qId}">
                        ${(q.options||[]).map(opt=>{
                            const letter=opt[0];
                            return `<button class="bk-opt sb-opt-btn" id="opt_${qId}_${letter}"
                                onclick="solveBankQuestion('${qId}','${letter}')">
                                <span class="bk-opt-key">${letter}</span>
                                <span class="bk-opt-text">${opt.slice(3)}</span>
                            </button>`;
                        }).join('')}
                    </div>
                    <div class="bk-exp" id="exp_${qId}"></div>
                </div>`;
            });
        }

        // Pasaj sayfalandırma
        if (groupKeys.length > 1) {
            pHtml += `<div class="bk-pager">
                <button class="bk-pg-btn" onclick="setParagrafGroupPage('${pgKey}',${curPage-1})" ${curPage<=1?'disabled':''}>‹</button>`;
            groupKeys.forEach((_, gi) => {
                const pg = gi+1;
                pHtml += `<button class="bk-pg-btn ${pg===curPage?'bk-pg-act':''}" onclick="setParagrafGroupPage('${pgKey}',${pg})">${startIdx+pg}</button>`;
            });
            pHtml += `<button class="bk-pg-btn" onclick="setParagrafGroupPage('${pgKey}',${curPage+1})" ${curPage>=groupKeys.length?'disabled':''}>›</button></div>`;
        }

        cont.innerHTML = pHtml;
        return;
    }

    // ─── KELİME SUB-LİSTESİ ─────────────────────────────
    const kelMatch = active.match(/^kelime_(\d+)$/);
    if (kelMatch) {
        const pageIdx    = parseInt(kelMatch[1]) - 1;
        const pageOffset = pageIdx * BANK_PAGE_SIZE;
        let   subItems   = filteredArsiv.slice(pageOffset, pageOffset + BANK_PAGE_SIZE);
        const totalGroups = Math.max(1, Math.ceil(subItems.length / BANK_GROUP_SIZE));
        const groupPage   = Math.min(window._arsivGroupPage || 1, totalGroups);
        window._arsivGroupPage = groupPage;
        const activeItems = subItems.slice((groupPage-1)*BANK_GROUP_SIZE, groupPage*BANK_GROUP_SIZE);

        if (!window._bankQMap) window._bankQMap = {};

        if (!activeItems.length) {
            cont.innerHTML = `<div class="bk-empty">
                <div class="bk-empty-ico">📝</div>
                <div class="bk-empty-title">Bu sayfada soru yok</div>
                <div class="bk-empty-sub">Farklı bir kategori seçin ya da AI Vocabulary Test çözerek sorular ekleyin.</div>
            </div>`;
            return;
        }

        let html = `
        <div class="bk-content-hdr">
            <div class="bk-content-hdr-l">
                <div class="bk-stripe"></div>
                <span class="bk-content-type-pill">📝 Kelime</span>
                <span class="bk-content-title">Kelime Soruları ${kelMatch[1]}</span>
            </div>
            <span class="bk-content-meta">${subItems.length} soru · ${(groupPage-1)*BANK_GROUP_SIZE+1}–${Math.min(groupPage*BANK_GROUP_SIZE,subItems.length)} gösteriliyor</span>
        </div>`;

        activeItems.forEach((q, idx) => {
            const globalNum = pageOffset + (groupPage-1)*BANK_GROUP_SIZE + idx + 1;
            const qId       = `aq_${globalNum}`;
            window._bankQMap[qId] = { correct: q.correct, explanation: q.explanation||'', options: q.options||{} };
            const tarih = q.date ? new Date(q.date).toLocaleDateString('tr-TR',{day:'2-digit',month:'2-digit'}) : '';
            const userAns  = window._bankAnswers?.[qId];
            const revealed = window._bankRevealed?.[qId];

            const optsHtml = Object.entries(q.options||{}).map(([k,v]) => {
                const isC  = k === q.correct;
                const isCh = k === userAns;
                let cls = '';
                if (revealed) { cls = isC ? 'bk-opt-c' : (isCh ? 'bk-opt-w' : ''); }
                else if (isCh) cls = 'bk-opt-c';
                return `<button class="bk-opt sb-opt-btn ${cls}" id="opt_${qId}_${k}"
                    onclick="solveBankQuestion('${qId}','${k}')" ${revealed?'disabled':''}>
                    <span class="bk-opt-key">${k}</span>
                    <span class="bk-opt-text">${v}</span>
                    ${revealed&&isC?'<span style="margin-left:auto">✅</span>':''}
                    ${revealed&&isCh&&!isC?'<span style="margin-left:auto">❌</span>':''}
                </button>`;
            }).join('');

            html += `
            <div class="bk-q-card ${revealed?(userAns===q.correct?'bk-correct':'bk-wrong'):''}">
                <div class="bk-q-meta-row">
                    <span class="bk-q-num">${globalNum}.</span>
                    ${q.listName ? `<span class="bk-q-word-chip">📚 ${q.listName}</span>` : ''}
                    ${q.word ? `<span class="bk-q-word-chip">🔑 ${q.word}</span>` : (q.wordTr ? `<span class="bk-q-word-chip">🔑 ${q.wordTr}</span>` : '')}
                    <span class="bk-q-date">${tarih}</span>
                    ${revealed ? `<button class="bk-q-reset" id="reset_${qId}" onclick="resetBankQuestion('${qId}')" style="display:inline-flex;">↺ Tekrar</button>` : ''}
                </div>
                <div class="bk-q-text">${q.question}</div>
                <div class="bk-opts">${optsHtml}</div>
                ${q.explanation && revealed ? `
                <div class="bk-exp ${userAns===q.correct?'bk-exp-c':'bk-exp-w'}" style="display:block;">
                    <span class="bk-exp-lbl ${userAns===q.correct?'bk-exp-c':'bk-exp-w'}">💡 Açıklama</span>
                    ${q.explanation}
                </div>` : ''}
            </div>`;
        });

        if (totalGroups > 1) {
            html += `<div class="bk-pager">
                <button class="bk-pg-btn" onclick="setArsivGroupPage(${groupPage-1})" ${groupPage<=1?'disabled':''}>‹</button>`;
            for (let p=1; p<=totalGroups; p++) {
                const gs = (p-1)*BANK_GROUP_SIZE+1, ge = Math.min(p*BANK_GROUP_SIZE, subItems.length);
                html += `<button class="bk-pg-btn ${p===groupPage?'bk-pg-act':''}" onclick="setArsivGroupPage(${p})">${gs}–${ge}</button>`;
            }
            html += `<button class="bk-pg-btn" onclick="setArsivGroupPage(${groupPage+1})" ${groupPage>=totalGroups?'disabled':''}>›</button></div>`;
        }

        cont.innerHTML = html;
        return;
    }

    // Eşleşme yoksa overview'e dön
    cont.innerHTML = `<div class="bk-empty">
        <div class="bk-empty-ico">🗃️</div>
        <div class="bk-empty-title">Kategori seçilmedi</div>
        <div class="bk-empty-sub">Sol menüden bir kategori seçin.</div>
    </div>`;
}

// ─── Soru Bankası Kategori Toggle ────────────────────
function bkToggleCat(catKey) {
    // Aynı kategoriye tıklanınca ilk sub-listeyi aç
    const catPrefixes = { kelime:'kelime_1', paragraf:'paragraf_g1', gramer:'gramer_1' };
    const current = window._arsivActiveSubList || '';
    if (current.startsWith(catKey)) {
        // Zaten açık → overview'e dön
        window._arsivActiveSubList = 'overview';
    } else {
        window._arsivActiveSubList = catPrefixes[catKey] || catKey;
        window._arsivGroupPage = 1;
    }
    renderArsiv();
}

function toggleKelimeCard()       { bkToggleCat('kelime');   }
function toggleGramerCard()       { bkToggleCat('gramer');   }
function toggleParagrafBankCard() { bkToggleCat('paragraf'); }


function saveGramerSorusu(soruObj) {
    if (!window.aiGramerArsiv) window.aiGramerArsiv = [];
    window.aiGramerArsiv.push(soruObj);
    if (typeof window._saveData === 'function') window._saveData();
    renderArsiv();
}

function importGramerPaketi(sorular) {
    if (!window.aiGramerArsiv) window.aiGramerArsiv = [];
    sorular.forEach(s => window.aiGramerArsiv.push(s));
    if (typeof window._saveData === 'function') window._saveData();
    renderArsiv();
    return sorular.length;
}
function bankSelectGramer(qId, key) {
    if (!window._bankRevealed) window._bankRevealed = {};
    if (!window._bankAnswers)  window._bankAnswers  = {};
    if (window._bankRevealed[qId]) return;
    window._bankAnswers[qId] = key;
    renderArsiv();
}

function bankRevealGramer(qId) {
    if (!window._bankRevealed) window._bankRevealed = {};
    window._bankRevealed[qId] = true;
    renderArsiv();
}

function selectArsivSubList(key) {
    window._arsivActiveSubList = key;
    window._arsivGroupPage     = 1;
    const gMatch = key.match(/^paragraf_g(\d+)$/);
    if (gMatch) {
        if (!window._paraGroupPage) window._paraGroupPage = {};
        window._paraGroupPage[`g${gMatch[1]}`] = 1;
    }
    renderArsiv();
    const cont = document.getElementById('bk-sidebar');
    if (cont) cont.scrollTop = 0;
}

// Alt navigasyondan sayfa değiştir
function setArsivGroupPage(pg) {
    if (pg < 1) return;
    window._arsivGroupPage = pg;
    renderArsiv();
    const cont = document.getElementById('arsiv-content');
    if (cont) setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

// Paragraf grubu içinde pasaj sayfası değiştir
function setParagrafGroupPage(pgKey, pg) {
    if (pg < 1) return;
    if (!window._paraGroupPage) window._paraGroupPage = {};
    window._paraGroupPage[pgKey] = pg;
    renderArsiv();
    const cont = document.getElementById('arsiv-content');
    if (cont) setTimeout(() => cont.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}
window.setParagrafGroupPage = setParagrafGroupPage;

// Soru bankasında bir şık seç — veriyi global map'ten al
function solveBankQuestion(qId, selected) {
    const q       = window._bankQMap && window._bankQMap[qId];
    if (!q) return;
    const optsDiv = document.getElementById(`opts_${qId}`);
    if (!optsDiv || optsDiv.dataset.answered) return;
    optsDiv.dataset.answered = '1';

    const correct = q.correct;
    optsDiv.querySelectorAll('.sb-opt-btn').forEach(btn => {
        btn.disabled = true;
        const letter = btn.id.replace(`opt_${qId}_`, '');
        if (letter === correct) {
            btn.style.background  = '#f0fdf4';
            btn.style.borderColor = '#86efac';
            btn.style.color       = '#15803d';
            btn.style.fontWeight  = '700';
        } else if (letter === selected && selected !== correct) {
            btn.style.background  = '#fef2f2';
            btn.style.borderColor = '#fca5a5';
            btn.style.color       = '#dc2626';
            btn.style.fontWeight  = '700';
        }
    });

    // Açıklama — innerHTML ile HTML tagları düzgün render edilir
    const expDiv = document.getElementById(`exp_${qId}`);
    if (expDiv && q.explanation) {
        const borderColor = selected === correct ? '#22c55e' : '#ef4444';
        expDiv.style.borderLeftColor = borderColor;
        expDiv.innerHTML  = `<strong style="color:#6366f1;font-size:.78rem;">💡 Açıklama</strong><br><br>${q.explanation}`;
        expDiv.style.display = 'block';
    }

    const resetBtn = document.getElementById(`reset_${qId}`);
    if (resetBtn) resetBtn.style.display = 'inline-block';
}

// Soruyu sıfırla — tekrar çözülebilir
function resetBankQuestion(qId) {
    const q = window._bankQMap && window._bankQMap[qId];
    if (!q) return;
    const optsDiv = document.getElementById(`opts_${qId}`);
    if (!optsDiv) return;
    delete optsDiv.dataset.answered;

    optsDiv.querySelectorAll('.sb-opt-btn').forEach(btn => {
        btn.disabled          = false;
        btn.style.background  = 'var(--white)';
        btn.style.borderColor = 'var(--border)';
        btn.style.color       = 'var(--ink)';
        btn.style.fontWeight  = '500';
    });

    const expDiv = document.getElementById(`exp_${qId}`);
    if (expDiv) expDiv.style.display = 'none';

    const resetBtn = document.getElementById(`reset_${qId}`);
    if (resetBtn) resetBtn.style.display = 'none';
}

function clearArsiv() {
    const filter = document.getElementById('arsiv-list-filter')?.value || '';
    const msg = filter
        ? `"${filter}" listesine ait tüm arşiv silinsin mi?`
        : 'Tüm AI Vocabulary Test arşivi silinsin mi?';
    if (!confirm(msg)) return;
    if (filter) {
        window.aiArsiv = (window.aiArsiv || []).filter(e => e.listName !== filter);
    } else {
        window.aiArsiv = [];
    }
    window._saveData && window._saveData();
    updateArsivBadge();
    renderArsiv();
}

function toggleArsivCard(btn) {
    // Butonun bir sonraki kardeş elementi — arsiv-card-body
    const card    = btn.closest('.arsiv-word-card');
    const body    = card ? card.querySelector('.arsiv-card-body') : btn.nextElementSibling;
    const chevron = btn.querySelector('.arsiv-chevron');
    if (!body) return;
    const isOpen  = body.style.display !== 'none';
    body.style.display      = isOpen ? 'none' : 'block';
    if (chevron) chevron.style.transform = isOpen ? '' : 'rotate(180deg)';
}

// ══════════════════════════════════════════════
// MOBİL MENÜ (DRAWER) KONTROLLERİ
// ══════════════════════════════════════════════
function mobToggleDrawer() {
    const drawer = document.getElementById('mob-drawer');
    if (drawer.classList.contains('open')) mobCloseDrawer();
    else {
        drawer.classList.add('open');
        document.getElementById('mob-overlay').classList.add('open');
        document.getElementById('mob-burger').classList.add('open');
        // ♿ Focus trap: Tab drawer içinde döngü yapar
        trapFocus(drawer);
    }
}

function mobCloseDrawer() {
    const drawer  = document.getElementById('mob-drawer');
    const overlay = document.getElementById('mob-overlay');
    const burger  = document.getElementById('mob-burger');
    if (drawer)  drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    if (burger)  burger.classList.remove('open');
    // ♿ Focus trap kaldır, burger'a focus döner
    releaseFocus();
}

function mobGoTo(pageId) {
    mobCloseDrawer();
    if (typeof showPage === 'function') showPage(pageId);
    if (pageId === 'admin-page') adminCheckAccess();
}

function mobRun(fn) {
    mobCloseDrawer();
    if (typeof fn === 'function') fn();
}

// ══════════════════════════════════════════════
// BAŞLANGIÇ
// ══════════════════════════════════════════════

// ── Mevcut aiArsiv'deki bozuk (null/eksik) kayıtları temizle ──
(function _cleanAiArsiv() {
    if (!Array.isArray(window.aiArsiv)) return;
    const before = window.aiArsiv.length;
    window.aiArsiv = window.aiArsiv.filter(e =>
        e && typeof e === 'object' &&
        e.question && e.correct && e.options &&
        (e.word || e.wordTr)
    );
    if (window.aiArsiv.length !== before) {
        console.log(`[bank] ${before - window.aiArsiv.length} bozuk kelime arşiv kaydı temizlendi`);
        try { localStorage.setItem('ydt_ai_arsiv', JSON.stringify(window.aiArsiv)); } catch(e) {}
    }
})();
// ══════════════════════════════════════════════
