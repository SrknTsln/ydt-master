# YDT Master — Google Auth Kurulum Rehberi

## Teslim Edilen Dosyalar
| Dosya | Açıklama |
|-------|----------|
| `auth.js` | Firebase Auth + Firestore sync + timer |
| `auth.css` | Login overlay + profil hero stilleri |
| `profil_patch.html` | Yeni profil-page HTML (index.html'e kopyalanacak) |

---

## ADIM 1 — Dosyaları proje klasörüne kopyala

```
auth.js     → YDT Master klasörüne ekle
auth.css    → YDT Master klasörüne ekle
```

---

## ADIM 2 — index.html: `<head>` içine CSS ekle

`stil.css` satırının hemen ALTINA:

```html
<link rel="stylesheet" href="auth.css">
```

---

## ADIM 3 — index.html: auth.js'i en sona ekle

`</body>` kapanış etiketinden hemen ÖNCE (diğer script'lerden SONRA):

```html
<script type="module" src="auth.js"></script>
```

---

## ADIM 4 — index.html: profil-page'i değiştir

`index.html`'de şu satırı bul:

```html
<div id="profil-page" class="container hidden" style="text-align:left;">
```

Bu div'in tamamını (kapanış `</div>`'a kadar) **profil_patch.html** içindeki kodla değiştir.

---

## ADIM 5 — Firebase Console: Authentication'ı aktif et

1. https://console.firebase.google.com → `ydt-master` projesi
2. **Authentication** → **Sign-in method**
3. **Google** sağlayıcısını **Enable** yap
4. **Authorized domains**'e `localhost` ve sitenin domain'ini ekle

---

## ADIM 6 — Firebase Console: Firestore Database oluştur

1. **Firestore Database** → **Create database**
2. **Production mode** seç
3. **Rules** sekmesine git ve şu kuralı ekle:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Nasıl Çalışır?

```
Sayfa açılır
    └─ onAuthStateChanged tetiklenir
        ├─ Oturum VAR  → UI güncelle, Firestore'dan stats çek, timer başlat
        └─ Oturum YOK  → login-overlay göster (blur efekti)

Google ile Giriş Yap butonuna tıklanır
    └─ signInWithPopup → onAuthStateChanged → yukarıdaki akış

Her 1 dakika  → totalMinutes + 1 (localStorage + global stats)
Her 5 dakika  → Firestore'a yaz (merge)
Sayfa kapanır → Firestore'a son kayıt (beforeunload)
```

---

## Misafir Modu

Giriş yapmak istemeyenler "Misafir olarak devam et" butonuyla overlay'i kapatabilir.
Misafir modda veriler yalnızca localStorage'da kalır, Firestore'a yazılmaz.

---

## Sorun Giderme

**"auth/popup-blocked"** → Tarayıcının popup engelleyicisini kapat  
**"auth/unauthorized-domain"** → Firebase Console'da domain ekle  
**Firestore permission-denied** → Rules'ı yukarıdaki gibi güncelle
