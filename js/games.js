// ── Alıştırmalar Sayfası + Memory Oyunu — motor.js'den ayrıştırıldı
// Bağımlılıklar: motor.js (global state: allData, stats)

// ALIŞTIRMALAR SAYFASI
// ══════════════════════════════════════════════
function showExercisePage() {
    const sel = document.getElementById('exercise-list-selector');
    if (sel) {
        sel.innerHTML = '';
        Object.keys(allData).forEach(n => sel.add(new Option(n, n)));
        // Mobil'de ana liste seçicisiyle senkronize et
        const mainSel = document.getElementById('list-selector');
        if (mainSel && mainSel.value) sel.value = mainSel.value;
    }
    const due   = countSM2Due();
    const badge = document.getElementById('sm2-due-badge');
    if (badge) badge.innerText = due > 0 ? due + ' bekliyor' : '';
    showPage('exercise-page');
}

// ══════════════════════════════════════════════
// MEMORY OYUNU
// ══════════════════════════════════════════════
let memCards = [], memFlipped = [], memMatchCount = 0, memMoves = 0, memTimer = null, memSeconds = 0, memLocked = false;

function startMemoryGame(listName) {
    listName = listName || document.getElementById('game-list-selector').value;
    if (!listName || !allData[listName] || allData[listName].length < 4) {
        return alert("Memory için listede en az 4 kelime olmalı!");
    }
    currentActiveList = listName;
    startModule();

    const pool      = [...allData[listName]].sort(() => Math.random() - 0.5);
    const pairCount = Math.min(8, Math.max(4, Math.floor(pool.length / 1) > 8 ? 8 : pool.length));
    const chosen    = pool.slice(0, pairCount);

    memCards = [];
    chosen.forEach((w, i) => {
        memCards.push({ id: i * 2,     pairId: i, type: 'eng', text: w.eng });
        memCards.push({ id: i * 2 + 1, pairId: i, type: 'tr',  text: w.tr  });
    });
    memCards.sort(() => Math.random() - 0.5);

    memFlipped = []; memMatchCount = 0; memMoves = 0; memLocked = false; memSeconds = 0;
    clearInterval(memTimer);
    memTimer = setInterval(() => {
        memSeconds++;
        const m = String(Math.floor(memSeconds / 60)).padStart(1, '0');
        const s = String(memSeconds % 60).padStart(2, '0');
        document.getElementById('mem-time').innerText = `${m}:${s}`;
    }, 1000);

    document.getElementById('mem-moves').innerText   = '0';
    document.getElementById('mem-matches').innerText = '0';
    document.getElementById('mem-total').innerText   = pairCount;
    document.getElementById('memory-result').classList.add('hidden');

    const cols = 4;
    const grid = document.getElementById('memory-grid');
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.innerHTML = '';

    memCards.forEach(card => {
        const el          = document.createElement('div');
        el.className      = 'mem-card';
        el.dataset.id     = card.id;
        el.dataset.pairId = card.pairId;
        el.dataset.type   = card.type;
        el.innerHTML      = `
            <div class="mem-card-inner">
                <div class="mem-card-front">🃏</div>
                <div class="mem-card-back type-${card.type}">${card.text}</div>
            </div>`;
        el.addEventListener('click', () => onMemCardClick(el, card));
        grid.appendChild(el);
    });

    showPage('memory-page');
}

function onMemCardClick(el, card) {
    if (memLocked) return;
    if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

    el.classList.add('flipped');
    memFlipped.push({ el, card });

    if (memFlipped.length === 2) {
        memLocked = true;
        memMoves++;
        document.getElementById('mem-moves').innerText = memMoves;

        const [a, b] = memFlipped;
        if (a.card.pairId === b.card.pairId && a.card.type !== b.card.type) {
            setTimeout(() => {
                a.el.classList.add('matched');
                b.el.classList.add('matched');
                memFlipped = [];
                memLocked  = false;
                memMatchCount++;
                document.getElementById('mem-matches').innerText = memMatchCount;
                const total = parseInt(document.getElementById('mem-total').innerText);
                if (memMatchCount === total) memGameFinished(total);
            }, 400);
        } else {
            setTimeout(() => {
                a.el.classList.add('wrong-flash');
                b.el.classList.add('wrong-flash');
                setTimeout(() => {
                    a.el.classList.remove('flipped', 'wrong-flash');
                    b.el.classList.remove('flipped', 'wrong-flash');
                    memFlipped = [];
                    memLocked  = false;
                }, 450);
            }, 600);
        }
    }
}

function memGameFinished(total) {
    clearInterval(memTimer);
    const m        = String(Math.floor(memSeconds / 60)).padStart(1, '0');
    const s        = String(memSeconds % 60).padStart(2, '0');
    const accuracy = Math.round((total / memMoves) * 100);
    document.getElementById('mem-result-text').innerHTML =
        `⏱️ Süre: <strong>${m}:${s}</strong> &nbsp;|&nbsp; 🔁 Hamle: <strong>${memMoves}</strong> &nbsp;|&nbsp; 🎯 Verimlilik: <strong>${accuracy}%</strong><br><small style="opacity:0.8">Mükemmel skor: ${total} hamlede bitir!</small>`;
    document.getElementById('memory-result').classList.remove('hidden');
}

function exitMemoryGame() {
    clearInterval(memTimer);
    if (moduleStartTime) {
        let sessionMins = (Date.now() - moduleStartTime) / 60000;
        stats.totalMinutes = (Number(stats.totalMinutes) || 0) + sessionMins;
        window._saveData && window._saveData();
        moduleStartTime = null;
    }
    showGamesPage();
}

function showGamesPage() {
    const sel = document.getElementById('game-list-selector');
    sel.innerHTML = '';
    Object.keys(allData).forEach(n => sel.add(new Option(n, n)));
    showPage('games-page');
}

// ══════════════════════════════════════════════
// → js/exercises.js (ayrı dosyaya taşındı)
