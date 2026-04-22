# Instruksi Icon PWA

Aplikasi ini membutuhkan icon dalam berbagai ukuran untuk PWA.

## Ukuran Icon yang Diperlukan

1. **icon-192x192.png** - Icon untuk home screen Android dan iOS
2. **icon-512x512.png** - Icon untuk splash screen dan maskable icon

## Cara Membuat Icon

### Opsi 1: Generator Online (Direkomendasikan)
1. Kunjungi https://pwa-asset-generator.nicepkg.cn/ atau https://www.pwabuilder.com/imageGenerator
2. Upload logo SDIT Al-Insan (format PNG dengan background transparan)
3. Pilih warna background: `#dc2626` (merah)
4. Download dan ekstrak file
5. Copy `icon-192x192.png` dan `icon-512x512.png` ke folder `public/`

### Opsi 2: Manual dengan Figma/Photoshop
1. Buat canvas 512x512 px
2. Warna background: `#dc2626` (merah)
3. Letakkan logo SDIT di tengah
4. Export sebagai `icon-512x512.png`
5. Resize ke 192x192 untuk `icon-192x192.png`

### Opsi 3: Placeholder Sementara
Jika belum ada logo, gunakan placeholder berwarna merah:
- Buat file PNG 192x192 dan 512x512 berwarna merah solid (#dc2626)
- Tambahkan text "QF" atau icon buku putih di tengah

## Maskable Icon
Untuk Android adaptive icons, pastikan icon memiliki safe zone di tengah (logo tidak mepet pinggir) sehingga tidak terpotong saat dipotong menjadi berbagai bentuk.

## Splash Screen
Safari iOS akan membuat splash screen otomatis berdasarkan icon 512x512.

## Verifikasi
Setelah menambahkan icon:
1. Build aplikasi: `npm run build`
2. Buka di Chrome DevTools → Application → Manifest
3. Periksa apakah icon muncul tanpa error
4. Test dengan Lighthouse PWA audit
