// ── Paragraf okuma — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats, paragraflar)

// 📄 PARAGRAF OKUMA — AI ÖZELLİKLERİ
// ══════════════════════════════════════════════
let currentParagrafIndex = -1;
let paragrafSentences    = [];  // Grammar X-Ray için cümle listesi

// ── Paragraf Soruları Deposu ──────────────────────
// Anahtar: sanitize(baslik)_metin_uzunlugu
// window.paragrafSorular ile index.html'deki Firebase sync ile paylaşılır
window.paragrafSorular = JSON.parse(localStorage.getItem('ydt_paragraf_sorular')) || {};

// ── Mini Sözlük Render ──────────────────────────────
function renderParagrafDict(filter) {
    const list    = document.getElementById('ps-dict-list');
    const countEl = document.getElementById('ps-dict-count');
    if (!list) return;
    const kels = window._currentParagrafKelimeler || {};
    const entries = Object.entries(kels);
    countEl && (countEl.textContent = entries.length + ' kelime');

    const q = (filter || '').toLowerCase();
    const filtered = q
        ? entries.filter(([eng, tr]) => eng.toLowerCase().includes(q) || tr.toLowerCase().includes(q))
        : entries;

    if (!filtered.length) {
        list.innerHTML = '<div style="font-size:.75rem;color:var(--ink3);padding:8px 0;text-align:center;">Kelime bulunamadı</div>';
        return;
    }
    list.innerHTML = filtered.map(([eng, tr]) => `
        <div class="p-dict-entry" onclick="speakWord('${eng.replace(/'/g, "\\'")}')">
            <span class="p-dict-eng">${eng}</span>
            <span class="p-dict-tr">${tr}</span>
            <button class="p-dict-speak" onclick="event.stopPropagation();speakWord('${eng.replace(/'/g, "\\'")}')">🔊</button>
        </div>`).join('');
}

function filterParagrafDict(val) {
    renderParagrafDict(val);
}

function paragrafKey(p) {
    const base = (p.baslik || '').replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ\s]/g, '').trim().slice(0, 40);
    return `p_${base}_${(p.metin || '').length}`;
}

// Kaydedilmiş soruları yükle ve göster
function loadSavedQuestions(index) {
    const p   = paragraflar[index];
    const key = paragrafKey(p);
    const saved = window.paragrafSorular[key];

    const section  = document.getElementById('p-ydt-saved-section');
    const qDiv     = document.getElementById('p-ydt-saved-questions');
    const genBtn   = document.getElementById('p-ydt-gen-btn');

    if (!saved || !saved.questions || !saved.questions.length) {
        section.style.display = 'none';
        if (genBtn) genBtn.innerHTML = '🎯 Bu paragraftan YDT sorusu üret';
        return;
    }

    section.style.display = 'block';
    if (genBtn) genBtn.innerHTML = '🔄 Yeni Sorular Üret (AI)';

    // Slide index'i sıfırla
    window._ydtSlideIdx['s'] = 0;
    qDiv.innerHTML = renderYDTQuestions(saved.questions, 's');

    // Accordion başlangıçta kapalı — kullanıcı açar
}

// Kayıtlı soruları sil
function deleteSavedQuestions() {
    const p   = paragraflar[currentParagrafIndex];
    if (!p || !confirm('Bu paragrafın kaydedilmiş soruları silinsin mi?')) return;
    const key = paragrafKey(p);
    delete window.paragrafSorular[key];
    window._saveData && window._saveData();
    loadSavedQuestions(currentParagrafIndex);
    document.getElementById('p-ydt-panel').style.display = 'none';
    document.getElementById('p-ydt-questions').innerHTML = '';
}

// Ortak soru render fonksiyonu — Kapanır/Açılır + Kart-Kart Slider
function renderYDTQuestions(questions, prefix) {
    const total = questions.length;
    const cardsHtml = questions.map((q, qi) => `
        <div class="ydt-slide" id="ydt-slide-${prefix}-${qi}" style="display:${qi===0?'block':'none'};">
            <div class="p-ydt-card-type">${q.icon || '📝'} ${_esc(q.type)}</div>
            <div class="p-ydt-question">${_esc(q.question)}</div>
            <div class="p-ydt-options" id="ydt-opts-${prefix}-${qi}">
                ${(q.options || []).map(opt => {
                    const letter = _esc(opt[0]);
                    const answer = _esc(q.answer);
                    return `<button class="p-ydt-opt" onclick="checkYDTAnswer(this,'${prefix}',${qi},'${letter}','${answer}')">${_esc(opt)}</button>`;
                }).join('')}
            </div>
            <div class="p-ydt-explanation" id="ydt-exp-${prefix}-${qi}" style="display:none;">
                <strong>💡 Açıklama:</strong> ${_esc(q.explanation)}
            </div>
        </div>`).join('');

    return `
    <div class="ydt-accordion" id="ydt-acc-${prefix}">
        <button class="ydt-acc-toggle" onclick="toggleYDTAccordion('${prefix}')">
            <span class="ydt-acc-left">
                <span class="ydt-acc-icon">🎯</span>
                <span class="ydt-acc-title">YDT Soruları</span>
                <span class="ydt-acc-badge">${total} soru</span>
            </span>
            <span class="ydt-acc-arrow" id="ydt-acc-arrow-${prefix}">▼</span>
        </button>
        <div class="ydt-acc-body" id="ydt-acc-body-${prefix}" style="display:none;">
            <!-- İlerleme çubuğu -->
            <div class="ydt-slider-header">
                <span class="ydt-slider-counter" id="ydt-counter-${prefix}">1 / ${total}</span>
                <div class="ydt-slider-dots" id="ydt-dots-${prefix}">
                    ${questions.map((_,i) => `<span class="ydt-dot${i===0?' ydt-dot-active':''}" onclick="goToYDTSlide('${prefix}',${i},${total})"></span>`).join('')}
                </div>
            </div>
            <!-- Kart alanı -->
            <div class="ydt-slides-wrap">
                ${cardsHtml}
            </div>
            <!-- Nav butonları -->
            <div class="ydt-slider-nav">
                <button class="ydt-nav-btn" id="ydt-prev-${prefix}" onclick="prevYDTSlide('${prefix}',${total})" disabled>← Önceki</button>
                <button class="ydt-nav-btn ydt-nav-next" id="ydt-next-${prefix}" onclick="nextYDTSlide('${prefix}',${total})">Sonraki →</button>
            </div>
        </div>
    </div>`;
}

// Accordion aç/kapat
function toggleYDTAccordion(prefix) {
    const body  = document.getElementById(`ydt-acc-body-${prefix}`);
    const arrow = document.getElementById(`ydt-acc-arrow-${prefix}`);
    const open  = body.style.display !== 'none';
    body.style.display  = open ? 'none' : 'block';
    arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(180deg)';
}

// Slide state tracker
window._ydtSlideIdx = {};

function goToYDTSlide(prefix, idx, total) {
    const prev = window._ydtSlideIdx[prefix] || 0;
    const slideEl  = (i) => document.getElementById(`ydt-slide-${prefix}-${i}`);
    const dotEls   = document.querySelectorAll(`#ydt-dots-${prefix} .ydt-dot`);

    if (slideEl(prev)) slideEl(prev).style.display = 'none';
    if (slideEl(idx))  slideEl(idx).style.display  = 'block';
    dotEls.forEach((d,i) => d.classList.toggle('ydt-dot-active', i === idx));

    window._ydtSlideIdx[prefix] = idx;
    const counter = document.getElementById(`ydt-counter-${prefix}`);
    if (counter) counter.textContent = `${idx+1} / ${total}`;

    const prev_btn = document.getElementById(`ydt-prev-${prefix}`);
    const next_btn = document.getElementById(`ydt-next-${prefix}`);
    if (prev_btn) prev_btn.disabled = idx === 0;
    if (next_btn) { 
        next_btn.disabled = idx === total - 1;
        next_btn.textContent = idx === total - 1 ? '✅ Bitti' : 'Sonraki →';
    }
}

function nextYDTSlide(prefix, total) {
    const cur = window._ydtSlideIdx[prefix] || 0;
    if (cur < total - 1) goToYDTSlide(prefix, cur + 1, total);
}

function prevYDTSlide(prefix, total) {
    const cur = window._ydtSlideIdx[prefix] || 0;
    if (cur > 0) goToYDTSlide(prefix, cur - 1, total);
}

// ══════════════════════════════════════════════════════

// ── Admin Paragraf + Listesi ──

function renderAdminParagrafListe() {
    const kutu = document.getElementById('admin-paragraf-liste');
    if (!kutu) return;
    if (!paragraflar.length) {
        kutu.innerHTML = '<p style="font-size:0.8rem;color:var(--ink3);margin-bottom:8px;">Henüz paragraf eklenmedi.</p>';
        return;
    }
    kutu.innerHTML = paragraflar.map((p, i) => {
        const key       = paragrafKey(p);
        const hasSorular = window.paragrafSorular && window.paragrafSorular[key] && (window.paragrafSorular[key].questions || []).length > 0;
        const soruCount  = hasSorular ? window.paragrafSorular[key].questions.length : 0;
        return `
        <div class="admin-paragraf-item" id="ap-item-${i}">
            <div class="ap-title">
                <span>📄 ${_esc(p.baslik)}</span>
                <span class="ap-word-count">${Object.keys(p.kelimeler || {}).length} kelime</span>
            </div>
            <div class="ap-actions">
                <button class="ap-btn ap-btn-edit" onclick="editParagrafInAdmin(${i})">✏️ Düzenle</button>
                ${hasSorular ? `<button class="ap-btn ap-btn-sorular" onclick="deleteSorularFromAdmin(${i})" title="${soruCount} kaydedilmiş soruyu sil">🗑 ${soruCount} Soru</button>` : ''}
                <button class="ap-btn ap-btn-del"  onclick="deleteParagrafFromAdmin(${i})">🗑 Sil</button>
            </div>
        </div>`;
    }).join('');
}

function deleteSorularFromAdmin(index) {
    const p = paragraflar[index];
    if (!p || !confirm(`"${p.baslik}" paragrafının kaydedilmiş soruları silinsin mi?`)) return;
    const key = paragrafKey(p);
    delete window.paragrafSorular[key];
    window._saveData && window._saveData();
    renderAdminParagrafListe();
}

function addParagrafFromAdmin() {
    const title    = document.getElementById('new-p-title').value.trim();
    const text     = document.getElementById('new-p-text').value.trim();
    const wordsRaw = document.getElementById('new-p-words').value.trim();
    const editIdx  = parseInt(document.getElementById('edit-paragraf-index').value);

    if (!title || !text || !wordsRaw) {
        _showAppToast("Lütfen başlık, metin ve kelimeler alanlarının hepsini doldurun.");
        return;
    }

    const wordsObj = {};
    wordsRaw.split(',').forEach(pair => {
        const parts = pair.split(':');
        if (parts.length === 2) wordsObj[parts[0].trim().toLowerCase()] = parts[1].trim();
    });

    if (editIdx >= 0) {
        // Düzenleme modu
        paragraflar[editIdx] = { baslik: title, metin: text, kelimeler: wordsObj };
    } else {
        // Yeni ekleme
        paragraflar.push({ baslik: title, metin: text, kelimeler: wordsObj });
    }

    // localStorage + Firebase (shared/content admin sync _saveData içinde halleder)
    localStorage.setItem('ydt_paragraflar', JSON.stringify(paragraflar));
    window.paragraflar = paragraflar;
    window._saveData && window._saveData();
    cancelParagrafEdit();
    renderAdminParagrafListe();
    _showAppToast(editIdx >= 0 ? "Paragraf güncellendi ✓" : "Paragraf eklendi ✓");
}

function editParagrafInAdmin(index) {
    const p = paragraflar[index];
    document.getElementById('edit-paragraf-index').value = index;
    document.getElementById('new-p-title').value = p.baslik;
    document.getElementById('new-p-text').value  = p.metin;
    document.getElementById('new-p-words').value = Object.entries(p.kelimeler || {})
        .map(([k, v]) => `${k}:${v}`).join(', ');
    document.getElementById('paragraf-form-title').textContent = '✏️ Paragrafı Düzenle';
    document.getElementById('paragraf-save-btn').textContent   = '💾 Güncelle';
    document.getElementById('paragraf-form-cancel-btn').style.display = 'inline';
    // Forma scroll et
    document.getElementById('new-p-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function deleteParagrafFromAdmin(index) {
    if (!confirm(`"${paragraflar[index].baslik}" silinsin mi?`)) return;
    paragraflar.splice(index, 1);
    localStorage.setItem('ydt_paragraflar', JSON.stringify(paragraflar));
    window.paragraflar = paragraflar;
    window._saveData && window._saveData();
    renderAdminParagrafListe();
}

function cancelParagrafEdit() {
    document.getElementById('edit-paragraf-index').value      = '-1';
    document.getElementById('new-p-title').value              = '';
    document.getElementById('new-p-text').value               = '';
    document.getElementById('new-p-words').value              = '';
    document.getElementById('paragraf-form-title').textContent = '➕ Yeni Paragraf Ekle';
    document.getElementById('paragraf-save-btn').textContent  = '💾 Paragrafı Kaydet';
    document.getElementById('paragraf-form-cancel-btn').style.display = 'none';
}

// Menüye tıklandığında listeyi okuma sayfasına çeker ve açar
// Yardımcı: "1. Judo" → "Judo" gibi baştaki rakam+nokta+boşluk kaldır
function stripNumPrefix(title) {
    return (title || '').replace(/^\d+\.\s*/, '');
}

// Sayfa başına gösterilecek pasaj
const RH2_PAGE_SIZE = 6;
let _savedPage = 0;

function _buildPasajKartHTML(p, realIndex) {
    const icons = ['📘','📗','📙','📕','📓','📔','📒','📃','📑','🗒️'];
    const pSorular   = window.paragrafSorular || {};
    const key        = typeof paragrafKey === 'function' ? paragrafKey(p) : '';
    const qCount     = key && pSorular[key] ? (pSorular[key].questions || []).length : 0;
    const wCount     = p.kelimeler ? Object.keys(p.kelimeler).length : 0;
    const totalWords = p.metin ? p.metin.trim().split(/\s+/).length : 0;
    const readMin    = Math.ceil(totalWords / 180) || 1;
    const sentences  = p.metin ? p.metin.match(/[^.!?]+[.!?]+/g) || [] : [];
    const preview    = sentences.slice(0, 2).join(' ').trim() || (p.metin ? p.metin.trim().slice(0, 140) + '…' : '');
    const icon       = icons[realIndex % icons.length];
    return `<div class="rh2-card" onclick="showParagrafOku(${realIndex})">
        <div class="rh2-card-accent"></div>
        <div class="rh2-card-body">
            <div class="rh2-card-header">
                <div class="rh2-card-icon">${icon}</div>
                <div class="rh2-card-titlemeta">
                    <div class="rh2-card-title">${stripNumPrefix(p.baslik)}</div>
                    <div class="rh2-card-timing">⏱ ${readMin} dk · ${totalWords} kelime · ${sentences.length} cümle</div>
                </div>
            </div>
            ${preview ? `<div class="rh2-card-preview">${preview}</div>` : ''}
            <div class="rh2-card-footer">
                ${wCount  > 0 ? `<span class="rh2-pill rh2-pill-word">📖 ${wCount} kelime</span>` : ''}
                ${qCount  > 0 ? `<span class="rh2-pill rh2-pill-quiz">🎯 ${qCount} soru</span>` : '<span class="rh2-pill rh2-pill-none">Soru yok</span>'}
            </div>
        </div>
        <svg class="rh2-card-arrow" width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>`;
}

function _populateParagrafListesi(page) {
    const kutu = document.getElementById('paragraf-listesi-kutu');
    if (!kutu) return;
    if (page !== undefined) _savedPage = page;

    const total      = paragraflar.length;
    const totalPages = Math.ceil(total / RH2_PAGE_SIZE) || 1;
    if (_savedPage >= totalPages) _savedPage = totalPages - 1;
    if (_savedPage < 0) _savedPage = 0;

    kutu.innerHTML = '';

    if (total === 0) {
        kutu.innerHTML = `<div class="rh2-empty" style="grid-column:1/-1;">
            <div class="rh2-empty-icon">📂</div>
            <div class="rh2-empty-title">Henüz pasaj yüklenmedi</div>
            <div class="rh2-empty-sub">Yönetim panelinden YDT pasaj paketi yükleyin.</div>
        </div>`;
    } else {
        const startIdx = _savedPage * RH2_PAGE_SIZE;
        const endIdx   = Math.min(startIdx + RH2_PAGE_SIZE, total);
        let html = '';

        // Kartlar
        for (let i = startIdx; i < endIdx; i++) {
            html += _buildPasajKartHTML(paragraflar[i], i);
        }

        // Sayfalama kontrolü
        if (totalPages > 1) {
            let pagerHTML = `<div class="rh2-pager" style="grid-column:1/-1;">`;
            pagerHTML += `<button class="rh2-pager-btn" onclick="_populateParagrafListesi(${_savedPage-1})" ${_savedPage===0?'disabled':''}>‹</button>`;
            for (let p = 0; p < totalPages; p++) {
                const isActive = p === _savedPage;
                if (totalPages <= 7 || Math.abs(p - _savedPage) <= 2 || p === 0 || p === totalPages-1) {
                    pagerHTML += `<button class="rh2-pager-btn ${isActive ? 'rh2-pager-active':''}" onclick="_populateParagrafListesi(${p})">${p+1}</button>`;
                } else if (Math.abs(p - _savedPage) === 3) {
                    pagerHTML += `<span class="rh2-pager-ellipsis">…</span>`;
                }
            }
            pagerHTML += `<button class="rh2-pager-btn" onclick="_populateParagrafListesi(${_savedPage+1})" ${_savedPage>=totalPages-1?'disabled':''}>›</button>`;
            pagerHTML += `<span class="rh2-pager-info">${startIdx+1}–${endIdx} / ${total} pasaj</span>`;
            pagerHTML += `</div>`;
            html += pagerHTML;
        }
        kutu.innerHTML = html;
    }

    // Count badge
    const cnt = document.getElementById('reading-hub-saved-count');
    if (cnt) cnt.textContent = total > 0 ? `${total} pasaj` : '';
    _updateRh2HeroStats();
}
window._populateParagrafListesi = _populateParagrafListesi;


function showParagrafListesi() {
    // Önce otomatik yüklemeyi dene
    if (typeof autoLoadParagrafPaketleri === 'function') autoLoadParagrafPaketleri();
    _populateParagrafListesi();
    if (typeof showPage === 'function') showPage('paragraf-liste-page');
    // Yüklü pasaj varsa saved tabını aç, yoksa AI tabını
    const hasSaved = paragraflar && paragraflar.length > 0;
    openReadingHub(hasSaved ? 'saved' : 'ai');
}

function openReadingHub(type) {
    const aiList      = document.getElementById('ai-daily-paragraf-list');
    const savedList   = document.getElementById('paragraf-listesi-kutu');
    const generatePnl = document.getElementById('ai-generate-panel');
    const refreshBtn  = document.getElementById('ai-daily-refresh-btn');
    const tabAI       = document.getElementById('rh-tab-ai');
    const tabSaved    = document.getElementById('rh-tab-saved');
    const tabGen      = document.getElementById('rh-tab-generate');

    // Tab aktif durumu
    [tabAI, tabSaved, tabGen].forEach(el => { if (el) { el.classList.remove('rh-tab-active', 'rh2-tab-active'); } });
    if (type === 'ai'       && tabAI)   { tabAI.classList.add('rh-tab-active', 'rh2-tab-active'); }
    if (type === 'saved'    && tabSaved){ tabSaved.classList.add('rh-tab-active', 'rh2-tab-active'); }
    if (type === 'generate' && tabGen)  { tabGen.classList.add('rh-tab-active', 'rh2-tab-active'); }

    // Panel görünürlüğü
    if (aiList)      aiList.style.display      = (type === 'ai')       ? 'grid' : 'none';
    if (savedList)   savedList.style.display   = (type === 'saved')    ? 'grid' : 'none';
    if (generatePnl) generatePnl.style.display = (type === 'generate') ? 'block' : 'none';
    if (refreshBtn)  refreshBtn.style.display  = (type === 'ai')       ? 'flex' : 'none';

    if (type === 'ai')       { generateAIDailyParagraflar(false); }
    else if (type === 'saved')    { _populateParagrafListesi(); }
    else if (type === 'generate') { _aigInitTopics(); }
}

function closeReadingHub() {
    // Yeni tasarımda panel her zaman açık, tab switcher var
    // Eski çağrılar için fallback: AI tabına dön
    openReadingHub('ai');
}

window.openReadingHub = openReadingHub;

// ── Hero istatistiklerini güncelle (rh2-hero-stats) ──
function _updateRh2HeroStats() {
    const pSorular = window.paragrafSorular || {};
    const saved = paragraflar || [];
    const aiPassages = window._aiDailyPassages || [];
    const allPassages = [...saved, ...aiPassages.map(p => ({ metin: p.text, kelimeler: p.vocabulary }))];

    const totalPassages = saved.length;
    let totalWords = 0, totalVoc = 0, totalReadMin = 0, totalQ = 0;

    saved.forEach(p => {
        const wc = p.metin ? p.metin.trim().split(/\s+/).length : 0;
        totalWords   += p.kelimeler ? Object.keys(p.kelimeler).length : 0;
        totalReadMin += Math.ceil(wc / 180);
        const key     = typeof paragrafKey === 'function' ? paragrafKey(p) : '';
        totalQ       += key && pSorular[key] ? (pSorular[key].questions || []).length : 0;
    });

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('rh2-stat-passages',  totalPassages || '—');
    setEl('rh2-stat-words',     totalWords    || '—');
    setEl('rh2-stat-questions', totalQ        || '—');
    setEl('rh2-stat-readmin',   totalReadMin  || '—');
}

// ── Paragraf okuma progress (scroll) ──
function _initPokuScrollProgress() {
    // poku-body tüm sayfayı scroll ediyor
    const scrollEl = document.querySelector('.poku-body') ||
                     document.getElementById('paragraf-oku-page');
    const fill = document.getElementById('poku-progress-fill');
    const pct  = document.getElementById('poku-progress-pct');
    if (!scrollEl || !fill) return;

    // Önceki listener'ı temizle
    if (scrollEl._pokuScrollHandler) {
        scrollEl.removeEventListener('scroll', scrollEl._pokuScrollHandler);
    }

    scrollEl._pokuScrollHandler = () => {
        const scrolled = scrollEl.scrollTop;
        const total    = scrollEl.scrollHeight - scrollEl.clientHeight;
        const ratio    = total > 0 ? Math.min(Math.round((scrolled / total) * 100), 100) : 0;
        fill.style.width = ratio + '%';
        if (pct) pct.textContent = ratio + '%';
    };
    scrollEl.addEventListener('scroll', scrollEl._pokuScrollHandler, { passive: true });
    // Başlangıç değeri sıfırla
    fill.style.width = '0%';
    if (pct) pct.textContent = '0%';
}
window._initPokuScrollProgress = _initPokuScrollProgress;
window.closeReadingHub = closeReadingHub;

// ══════════════════════════════════════════════
