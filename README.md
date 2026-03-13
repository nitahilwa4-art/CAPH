# CAPH

CAPH adalah aplikasi manajemen keuangan berbasis web yang dibangun dengan Laravel, Inertia.js, React, dan TypeScript. Aplikasi ini dirancang untuk membantu pengguna mencatat transaksi, memantau cashflow, mengelola budget, hutang/piutang, aset, transaksi rutin, serta mendapatkan insight berbasis AI dari data keuangan mereka.

## Fitur Utama

### 1. Dashboard Keuangan
- Ringkasan saldo, pemasukan, pengeluaran, dan net flow
- Grafik tren pemasukan vs pengeluaran
- Distribusi pengeluaran per kategori
- Budget watch / progress anggaran
- Transaksi terbaru
- Fokus pengeluaran berdasarkan tag
- Upcoming bills dan recurring transactions
- Layout dashboard yang bisa diatur ulang

### 2. Manajemen Transaksi
- Tambah, ubah, hapus transaksi
- Mendukung tipe:
  - `INCOME`
  - `EXPENSE`
  - `TRANSFER`
- Filter berdasarkan tipe, tanggal, tag, dan pencarian
- Relasi ke wallet dan tag

### 3. Smart Entry (AI Input)
- Input transaksi dengan bahasa natural
- AI akan mem-parsing deskripsi menjadi transaksi terstruktur
- Cocok untuk input cepat seperti:
  - `beli nasi goreng 25rb, kopi 10rb, bensin 50rb`
  - `terima gaji 5 juta`

### 4. AI Financial Insights
- Analisis kondisi keuangan berdasarkan transaksi
- Health score keuangan
- Cashflow summary
- Dana darurat ideal
- Spending alerts
- Action plan / rekomendasi
- Proyeksi goal berdasarkan profil finansial

### 5. Wallet Management
- Kelola banyak dompet / akun
- Saldo ter-update mengikuti transaksi
- Mendukung perpindahan dana antar wallet

### 6. Budget Management
- Tetapkan limit pengeluaran per kategori
- Pantau progres budget mingguan, bulanan, atau tahunan
- Trigger notifikasi saat mendekati / melewati limit

### 7. Debt / Receivable / Bills
- Catat hutang, piutang, dan tagihan
- Pantau jatuh tempo
- Tandai status lunas / belum lunas

### 8. Asset Management
- Kelola data aset pengguna
- Memisahkan aset dari transaksi harian

### 9. Recurring Transactions
- Buat transaksi rutin harian, mingguan, bulanan, atau tahunan
- Cocok untuk langganan, cicilan, dan tagihan berkala
- Mendukung mode manual maupun otomatis

### 10. Export Laporan
- Preview data export
- Download laporan dalam format:
  - Excel (`.xlsx`)
  - PDF (`.pdf`)

### 11. Admin Panel
- Dashboard admin
- Manajemen user
- Monitoring log sistem
- Master data kategori

---

## Teknologi yang Digunakan

### Backend
- PHP 8.2+
- Laravel 12
- Laravel Sanctum
- Inertia.js (Laravel adapter)
- DomPDF
- Laravel Excel
- Sentry Laravel

### Frontend
- React 18
- TypeScript
- Inertia.js React
- Tailwind CSS
- Vite
- Recharts
- Lucide React
- React Hot Toast
- React Grid Layout

### AI / Integrasi
- Google Gemini
- Groq

---

## Arsitektur Singkat

Aplikasi menggunakan pola Laravel monolith modern:
- **Laravel** menangani routing, autentikasi, validasi, ORM, dan business logic backend
- **Inertia.js** menjadi jembatan antara Laravel dan React
- **React + TypeScript** menangani UI interaktif di sisi frontend
- **Service layer** dipakai untuk logika tertentu seperti transaksi dan AI

Beberapa service penting:
- `TransactionService` → logika perubahan saldo & transaksi
- `GeminiService` → AI financial insights
- `GroqService` → parsing natural language untuk smart entry

---

## Struktur Fitur Utama

```text
app/
  Http/Controllers/
    DashboardController.php
    TransactionController.php
    SmartEntryController.php
    InsightsController.php
    WalletController.php
    BudgetController.php
    DebtController.php
    AssetController.php
    CategoryController.php
    ExportController.php
    RecurringTransactionController.php
    Admin/

  Models/
    User.php
    Wallet.php
    Transaction.php
    Budget.php
    Debt.php
    Asset.php
    Category.php
    RecurringTransaction.php
    FinancialInsight.php
    Tag.php

  Services/
    TransactionService.php
    GeminiService.php
    GroqService.php

resources/js/
  Pages/
    Dashboard.tsx
    Transactions/
    Wallets/
    Budgets/
    Debts/
    Assets/
    SmartEntry/
    Insights/
    Export/
    Recurring/
    Admin/
```

---

## Cara Menjalankan Project

### 1. Clone repository
```bash
git clone <repo-url>
cd CAPH
```

### 2. Install dependency backend
```bash
composer install
```

### 3. Install dependency frontend
```bash
npm install
```

### 4. Copy file environment
```bash
cp .env.example .env
```

> Untuk Windows, bisa copy manual `.env.example` menjadi `.env` jika diperlukan.

### 5. Generate app key
```bash
php artisan key:generate
```

### 6. Setup database
Sesuaikan konfigurasi database di file `.env`, lalu jalankan:

```bash
php artisan migrate
```

Jika butuh data awal, jalankan seeder sesuai kebutuhan project.

### 7. Jalankan aplikasi
Untuk development, jalankan backend dan frontend.

#### Opsi A — terpisah
```bash
php artisan serve
npm run dev
```

#### Opsi B — pakai script composer
```bash
composer run dev
```

Script ini menjalankan beberapa proses sekaligus, termasuk:
- Laravel server
- queue listener
- log watcher
- Vite dev server

---

## Build Production

```bash
npm run build
```

Command ini akan:
- compile TypeScript
- build frontend client
- build SSR bundle

---

## Konfigurasi Environment Penting

Beberapa environment variable yang kemungkinan perlu diisi:

```env
APP_NAME=CAPH
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=caph
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.5-flash

GROQ_API_KEY=
GROQ_MODEL=

VITE_APP_NAME="CAPH"
VITE_SENTRY_DSN_PUBLIC=
```

> Nama variabel Groq bisa mengikuti isi `config/services.php` pada project ini.

---

## Modul Utama Aplikasi

### Dashboard
Pusat ringkasan keuangan pengguna, menampilkan statistik utama, chart, budget progress, transaksi terbaru, dan indikator pengeluaran.

### Transactions
Modul CRUD transaksi dengan dukungan wallet, transfer, kategori, dan tag.

### Smart Entry
Input transaksi menggunakan bahasa natural yang diproses AI menjadi data terstruktur.

### Insights
Analisis AI untuk mengevaluasi kesehatan finansial pengguna berdasarkan histori transaksi dan profil finansial.

### Export
Generate laporan transaksi dalam bentuk preview, Excel, dan PDF.

### Admin
Area khusus admin untuk memantau sistem dan mengelola data dasar.

---

## Catatan Pengembangan

Saat ini project sudah memiliki fondasi yang kuat dan fitur yang cukup lengkap, namun masih ideal untuk terus dirapikan di area berikut:
- konsistensi route dan integrasi fitur
- pembersihan file debug / patch sementara
- pemecahan komponen frontend besar menjadi komponen yang lebih kecil
- penambahan automated test untuk transaksi, wallet balance, dan recurring flow
- dokumentasi deployment dan environment yang lebih lengkap

---

## Testing

Jalankan test Laravel dengan:

```bash
php artisan test
```

Atau:

```bash
composer test
```

---

## Tujuan Produk

CAPH bukan sekadar aplikasi catat pemasukan dan pengeluaran. Tujuannya adalah menjadi asisten keuangan yang membantu pengguna:
- mencatat transaksi dengan cepat
- memahami pola cashflow
- menjaga budget tetap sehat
- mengelola komitmen rutin
- mengambil keputusan finansial dengan bantuan AI

---

## Status Dokumentasi

README ini sudah disesuaikan dengan struktur dan fitur aplikasi saat ini, namun masih bisa diperbarui lagi setelah:
- route recurring dirapikan penuh
- alur admin distabilkan
- dokumentasi deployment/production ditambahkan

---

## Lisensi

Project ini mengikuti lisensi yang ditentukan oleh pemilik repository. Jika belum ditentukan, tambahkan file `LICENSE` sesuai kebutuhan.
