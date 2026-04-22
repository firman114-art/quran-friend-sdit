# Setup PWA - Quran Friend SDIT

Aplikasi ini sekarang sudah dikonfigurasi sebagai Progressive Web App (PWA)!

## ✅ Fitur PWA yang Sudah Aktif

### 1. **Installable**
- Siswa dapat menginstall aplikasi ke home screen HP
- Support Android (Chrome) dan iOS (Safari)
- Tombol "Download Aplikasi" muncul otomatis

### 2. **Offline Support**
- Halaman di-cache untuk akses offline
- Service Worker aktif untuk caching
- Data Supabase tetap online (perlu koneksi internet)

### 3. **Theme Color**
- Warna tema: Merah (`#dc2626`) sesuai brand SDIT
- Status bar mobile berwarna merah

## 📱 Cara Install di HP

### Android (Chrome)
1. Buka aplikasi di Chrome
2. Tap menu (3 titik) → "Tambahkan ke layar utama"
3. Atau tunggu popup "Install Sekarang" muncul

### iOS (Safari)
1. Buka aplikasi di Safari
2. Tap tombol Share (📤) di bawah
3. Scroll dan pilih "Add to Home Screen"
4. Tap "Add"

## 🎨 Icon App

### Langkah 1: Generate Icon
1. Buka: https://www.pwabuilder.com/imageGenerator
2. Upload logo SDIT (PNG transparan)
3. Pilih warna background: `#dc2626`
4. Download package

### Langkah 2: Copy Icon
```bash
cp downloaded-icon-192x192.png public/icon-192x192.png
cp downloaded-icon-512x512.png public/icon-512x512.png
```

### Langkah 3: Rebuild
```bash
npm run build
```

## 🧪 Testing PWA

### Chrome DevTools
1. Buka aplikasi di Chrome
2. Tekan F12 → Application tab
3. Cek:
   - **Manifest**: Harus terbaca tanpa error
   - **Service Workers**: Harus terdaftar dan aktif
   - **Storage**: Cache storage terisi

### Lighthouse Audit
1. Chrome DevTools → Lighthouse tab
2. Centang "Progressive Web App"
3. Generate report
4. Target: Score 90+ (semua checks hijau)

### Real Device Test
1. Deploy ke hosting (Netlify/Vercel)
2. Akses dari HP
3. Test install dan offline mode

## 📝 Struktur File PWA

```
public/
├── manifest.json          # Konfigurasi PWA
├── service-worker.js    # Caching & offline
├── icon-192x192.png     # Icon Android/iOS
├── icon-512x512.png     # Icon splash screen
└── icon-placeholder.svg # Template icon

src/
└── components/
    └── InstallPrompt.tsx # Komponen install button

index.html               # Meta tags PWA
```

## 🔄 Update Service Worker

Saat ada update aplikasi:

```javascript
// Di service-worker.js, ubah CACHE_NAME
const CACHE_NAME = 'quran-friend-v2'; // Increment version
```

User akan otomatis mendapatkan versi terbaru saat membuka app.

## 🚨 Troubleshooting

### Icon tidak muncul
- Pastikan `icon-192x192.png` dan `icon-512x512.png` ada di folder `public/`
- Rebuild aplikasi: `npm run build`

### Install button tidak muncul
- Aplikasi harus di-serve via HTTPS (bukan localhost)
- Test dengan: `npx serve dist` atau deploy ke Netlify

### Service Worker error
- Cek Console → Application → Service Workers
- Pastikan tidak ada error merah

## 📚 Referensi

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Builder](https://www.pwabuilder.com/)
