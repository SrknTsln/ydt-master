// ════════════════════════════════════════════════════
// kelimeler.js  –  Varsayılan veri & stats başlatma
// ════════════════════════════════════════════════════

let allData = JSON.parse(localStorage.getItem('ydt_all_data')) || {
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

let stats = JSON.parse(localStorage.getItem('ydt_stats')) || {
    totalAnswers: 0,
    correctAnswers: 0,
    totalMinutes: 0
};
if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0;
