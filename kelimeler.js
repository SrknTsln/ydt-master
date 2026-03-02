// ════════════════════════════════════════════════════
// kelimeler.js  –  Varsayılan veri & stats başlatma
//                  v2 — user-scoped localStorage
// ════════════════════════════════════════════════════

// Kullanıcıya özel localStorage key üreticisi
// uid yoksa 'guest' prefix'i kullanır
function getUserKey(key) {
    const uid = window._currentUser?.uid || 'guest';
    return `ydt_${uid}_${key}`;
}

let allData = {};
let stats   = {};

function loadUserScopedData() {
    allData = JSON.parse(localStorage.getItem(getUserKey('all_data'))) || {
        "Örnek Liste": [
            {
                eng: "Persistent",
                tr: "Israrcı",
                mnemonic: "Pestilini çıkarana kadar...",
                story: "Sürekli denedi.",
                errorCount: 0,
                correctStreak: 0
            }
        ]
    };

    stats = JSON.parse(localStorage.getItem(getUserKey('stats'))) || {
        totalAnswers: 0,
        correctAnswers: 0,
        totalMinutes: 0
    };
    if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0;
}

// İlk yükleme (auth henüz hazır değil → guest olarak başlar)
loadUserScopedData();

// Tüm modüller bu fonksiyonu çağırarak kaydeder
function _saveData() {
    localStorage.setItem(getUserKey('all_data'), JSON.stringify(allData));
    localStorage.setItem(getUserKey('stats'),    JSON.stringify(stats));
}
