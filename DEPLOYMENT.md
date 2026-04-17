# Panduan Deployment dengan Custom Domain aisha-alinsan.com

## Opsi 1: Deployment ke Vercel (Rekomendasi)

### Langkah 1: Persiapan
1. Pastikan project sudah di-commit ke GitHub
2. Buat akun di https://vercel.com

### Langkah 2: Deploy ke Vercel
1. Login ke Vercel dengan akun GitHub
2. Klik "Add New" > "Project"
3. Pilih repository `quran-friend-sdit`
4. Vercel akan otomatis mendeteksi konfigurasi Vite
5. Klik "Deploy"

### Langkah 3: Konfigurasi Environment Variables
Di dashboard Vercel > Settings > Environment Variables:
```
VITE_SUPABASE_PROJECT_ID=your-project-id
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
VITE_SUPABASE_URL=your-supabase-url
```

### Langkah 4: Setup Custom Domain
1. Buka dashboard Vercel > Settings > Domains
2. Masukkan domain: `aisha-alinsan.com`
3. Klik "Add"

### Langkah 5: Setup DNS Records
Login ke penyedia domain (Namecheap, GoDaddy, dll) dan tambahkan:

**Jika menggunakan A Record:**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IPv4)
TTL: 3600
```

**Jika menggunakan CNAME:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

## Opsi 2: Deployment ke Netlify

### Langkah 1: Build Local
```bash
npm run build
```
Folder `dist` akan dibuat.

### Langkah 2: Deploy ke Netlify
1. Login ke https://netlify.com
2. Drag & drop folder `dist` ke Netlify dashboard
3. Site akan langsung online dengan URL acak

### Langkah 3: Setup Custom Domain
1. Di dashboard Netlify > Domain settings
2. Klik "Add custom domain"
3. Masukkan: `aisha-alinsan.com`

### Langkah 4: Setup DNS Records
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
TTL: 3600
```

## Opsi 3: Deployment ke Supabase Hosting

### Langkah 1: Build Local
```bash
npm run build
```

### Langkah 2: Deploy ke Supabase
```bash
npx supabase db push
npx supabase functions deploy --project-ref your-project-id
```

### Langkah 3: Setup Custom Domain
Di dashboard Supabase > Settings > Custom Domain

## Catatan Penting:

1. **HTTPS**: Vercel dan Netlify menyediakan HTTPS gratis otomatis
2. **Environment Variables**: Pastikan semua variabel environment di-copy dari `.env` local
3. **Database Migration**: Jangan lupa jalankan migration di production:
   ```bash
   supabase db push
   ```
4. **Testing**: Setelah deploy, test semua fitur untuk memastikan berjalan lancar

## Troubleshooting:

### Build Error
Jika build gagal, cek:
- Versi Node.js (gunakan LTS)
- Dependencies terinstall: `npm install`
- Environment variables sudah di-set

### Custom Domain Tidak Berfungsi
- Pastikan DNS records sudah di-set dengan benar
- Tunggu 24-48 jam untuk propagasi DNS
- Cek status di dashboard deployment platform

### Database Error
- Pastikan migration sudah dijalankan di production
- Cek RLS policies di Supabase
- Verifikasi environment variables database
