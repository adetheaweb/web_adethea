# Panduan Deployment: GitHub & Cloudflare Pages

Ikuti langkah-langkah di bawah ini untuk mengunggah kode aplikasi Anda ke GitHub dan mendeploynya ke Cloudflare Pages.

## Bagian 1: Mengunggah ke GitHub

### 1. Persiapan Git
Jika Anda belum menginisialisasi Git di folder lokal Anda:
```bash
git init
git add .
git commit -m "Initial commit: Aplikasi Adetheaweb dengan Gallery dan Unduhan"
```

### 2. Membuat Repository di GitHub
1. Buka [github.com](https://github.com) dan buat repository baru.
2. Salin URL repository Anda (misalnya: `https://github.com/username/nama-repo.git`).

### 3. Push Kode ke GitHub
```bash
git remote add origin https://github.com/username/nama-repo.git
git branch -M main
git push -u origin main
```

---

## Bagian 2: Deploy ke Cloudflare Pages

### 1. Hubungkan GitHub ke Cloudflare
1. Login ke [dash.cloudflare.com](https://dash.cloudflare.com).
2. Buka menu **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Pilih repository GitHub yang baru saja Anda buat.

### 2. Konfigurasi Build (PENTING)
Gunakan pengaturan berikut saat setup di Cloudflare:
- **Framework preset**: `Vite` (Sistem akan otomatis mendeteksi jika tidak ada pilihan ini).
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (biarkan default).

### 3. Variabel Lingkungan (Environment Variables)
Jika Anda menggunakan API Key atau konfigurasi sensitif (seperti Firebase Config jika tidak ingin disertakan di file publik):
1. Di panel Cloudflare, buka **Settings** > **Variables and Secrets**.
2. Tambahkan variabel jika diperlukan (misalnya `VITE_FIREBASE_API_KEY`).
   *Catatan: Aplikasi saat ini menggunakan `firebase-applet-config.json`. Pastikan file ini ada di repository Anda agar aplikasi berjalan.*

### 4. Klik "Save and Deploy"
Cloudflare akan mulai proses build. Setelah selesai, Anda akan mendapatkan URL unik (misalnya: `https://nama-repo.pages.dev`).

---

## Bagian 3: Konfigurasi Firebase (Langkah Tambahan)

Karena aplikasi Anda menggunakan Firebase Firestore dan Authentication, Anda harus mengizinkan domain Cloudflare Anda di Firebase Console:

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih project Anda.
3. Buka **Authentication** > **Settings** > **Authorized Domains**.
4. Klik **Add Domain** dan masukkan domain Cloudflare Anda (contoh: `nama-repo.pages.dev`).
5. Ini diperlukan agar fitur Login Admin tetap berfungsi.

---

**Tips Keamanan:**
Jangan pernah mengunggah file `.env` yang berisi rahasia (secrets) ke GitHub publik. Gunakan `.env.example` sebagai referensi dan masukkan nilai aslinya di panel Dashboard Cloudflare (Environment Variables).
