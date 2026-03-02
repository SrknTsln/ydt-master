// ════════════════════════════════════════════════════
// kelimeler.js  –  Veri & stats başlatma  v3
//                  user-scoped + guest merge
// ════════════════════════════════════════════════════

// Kullanıcıya özel localStorage key üreticisi
function getUserKey(key) {
    const uid = window._currentUser?.uid || 'guest';
    return `ydt_${uid}_${key}`;
}

let allData = {};
let stats   = {};

// Varsayılan eğitim verisi — her kullanıcıya görünür
const DEFAULT_VOCAB = {
    "Örnek Liste": [
        { eng: "Persistent",  tr: "Israrcı",    mnemonic: "Pestilini çıkarana kadar...", story: "Sürekli denedi.",      errorCount: 0, correctStreak: 0 },
        { eng: "Ambiguous",   tr: "Belirsiz",   mnemonic: "Ambi = iki yönlü",           story: "İki anlama gelir.",    errorCount: 0, correctStreak: 0 },
        { eng: "Eloquent",    tr: "Belagatli",  mnemonic: "Elinden konuşma akar",        story: "Güzel konuşur.",       errorCount: 0, correctStreak: 0 },
        { eng: "Diligent",    tr: "Çalışkan",   mnemonic: "Dili yok, sadece çalışır",   story: "Hiç durmaz.",          errorCount: 0, correctStreak: 0 },
        { eng: "Meticulous",  tr: "Titiz",      mnemonic: "Metreyle ölçer",              story: "Her detaya bakar.",    errorCount: 0, correctStreak: 0 }
    ]
};

function loadUserScopedData() {
    const uid = window._currentUser?.uid || 'guest';

    // 1. Kullanıcıya özel veriyi oku
    const rawAD = localStorage.getItem(`ydt_${uid}_all_data`);
    const rawST = localStorage.getItem(`ydt_${uid}_stats`);

    let userData = null;
    if (rawAD) { try { userData = JSON.parse(rawAD); } catch(e) {} }

    if (userData && Object.keys(userData).length > 0) {
        // Kullanıcı verisi var — DEFAULT_VOCAB ile birleştir
        // Kullanıcının kendi listeleri önce, varsayılan liste eklenmemiş ise ekle
        allData = { ...DEFAULT_VOCAB, ...userData };
    } else {
        // Veri yok (yeni kullanıcı / guest) — varsayılanı kullan
        // Eski 'ydt_all_data' guest key'ini de kontrol et (migration)
        const legacyRaw = localStorage.getItem('ydt_all_data');
        let legacyData  = null;
        if (legacyRaw) { try { legacyData = JSON.parse(legacyRaw); } catch(e) {} }
        allData = legacyData && Object.keys(legacyData).length > 0
            ? { ...DEFAULT_VOCAB, ...legacyData }
            : { ...DEFAULT_VOCAB };
    }

    // 2. Stats
    let parsedStats = null;
    if (rawST) { try { parsedStats = JSON.parse(rawST); } catch(e) {} }
    if (!parsedStats) {
        // Legacy migration
        const legacyST = localStorage.getItem('ydt_stats');
        if (legacyST) { try { parsedStats = JSON.parse(legacyST); } catch(e) {} }
    }
    stats = parsedStats || { totalAnswers: 0, correctAnswers: 0, totalMinutes: 0 };
    if (isNaN(stats.totalMinutes)) stats.totalMinutes = 0;
}

// İlk yükleme — auth henüz hazır değil → guest olarak başlar
loadUserScopedData();

// Tüm modüller bu fonksiyonu çağırarak kaydeder
function _saveData() {
    const uid = window._currentUser?.uid || 'guest';
    localStorage.setItem(`ydt_${uid}_all_data`, JSON.stringify(allData));
    localStorage.setItem(`ydt_${uid}_stats`,    JSON.stringify(stats));
}
