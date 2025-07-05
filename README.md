# Bot WhatsApp Tugas Kelas

Sebuah bot WhatsApp yang dirancang untuk membantu mengelola tugas dalam grup kelas secara efisien. Bot ini mendukung pencatatan, pengingat, dan manajemen lampiran tugas secara otomatis.

## 🚀 Fitur Utama

-   **✅ Manajemen Tugas:** Tambah (`set`), lihat detail (`lihat`), lihat daftar ringkas (`list`), ubah (`edit`), dan hapus (`hapus`) tugas dengan mudah.
-   **📎 Multi-Lampiran:** Setiap tugas dapat memiliki lebih dari satu lampiran (gambar, PDF, dokumen).
-   **⏰ Pengingat Otomatis:** Mengirim pengingat otomatis ke grup pada H-3, H-1, dan 3 jam sebelum tenggat waktu.
-   **📅 Tampilan Berbasis Waktu:** Menampilkan tugas yang akan datang dalam rentang 7 hari ke depan (`mingguan`).
-   **📤 Ekspor Data:** Mengekspor seluruh daftar tugas ke dalam format PDF atau CSV.
-   **⚙️ Interaktif:** Sesi edit tugas yang interaktif dan menu bantuan yang jelas (`menu`).

---

## 📁 Struktur Proyek

Proyek ini disusun secara modular agar mudah dipahami dan dikelola.

```

📁 bot-tugas-kelas/
├── 📁 commands/          \<-- Folder untuk semua perintah
│   ├── 📄 ambilLampiran.js
│   ├── 📄 editTugas.js
│   ├── 📄 exportTugas.js
│   ├── 📄 hapusTugas.js
│   ├── 📄 ... (dan file perintah lainnya)
│
├── 📁 utils/             \<-- Folder untuk fungsi bantuan
│   └── 📄 taskUtils.js
│
├── 📁 services/           \<-- Folder untuk layanan latar belakang
│   └── 📄 reminderService.js
│
├── 📄 index.js            \<-- File utama untuk koneksi
├── 📄 handler.js          \<-- File untuk menangani pesan masuk
├── 📄 data\_tugas.json     \<-- Database tugas (format JSON)
├── 📁 media/              \<-- Folder penyimpanan lampiran
├── 📁 export/             \<-- Folder penyimpanan hasil ekspor
└── 📄 package.json

````

---

## 🛠️ Instalasi

Untuk menjalankan bot ini di komputer atau server Anda, ikuti langkah-langkah berikut.

### Prasyarat

-   [Node.js](https://nodejs.org/) (versi 18.x atau lebih tinggi)
-   npm (biasanya sudah terpasang bersama Node.js)

### Langkah-langkah

1.  **Clone repository ini (jika sudah ada di GitHub):**
    ```bash
    git clone [https://github.com/username/repo-name.git](https://github.com/username/repo-name.git)
    cd repo-name
    ```
    *Jika belum, cukup buat folder proyek dan salin semua file ke dalamnya.*

2.  **Install semua dependensi:**
    ```bash
    npm install
    npm install @whiskeysockets/baileys pino-pretty fs-extra node-cron date-fns pdfkit csv-writer qrcode-terminal mime-types
    ```

3.  **Jalankan bot untuk pertama kali:**
    ```bash
    node index.js
    ```

4.  **Pindai Kode QR:**
    Sebuah kode QR akan muncul di terminal. Buka WhatsApp di ponsel Anda, pergi ke **Setelan > Perangkat tertaut > Tautkan perangkat**, lalu pindai kode QR tersebut.

5.  **Bot Siap:**
    Setelah berhasil, Anda akan melihat pesan `🤖 Bot berhasil terhubung!` di terminal. Bot sekarang aktif dan siap digunakan di grup WhatsApp.

---

## 📖 Daftar Perintah

Berikut adalah daftar lengkap perintah yang dapat digunakan.

| Perintah | Format Penggunaan | Deskripsi |
| :--- | :--- | :--- |
| **Set Tugas** | Balas pesan tugas dengan `set tugas` | Menyimpan tugas baru. Bisa otomatis mendeteksi lampiran. |
| **List Tugas** | `list` atau `tugas` | Menampilkan daftar ringkas semua tugas (terbaru di atas). |
| **Lihat Detail** | `lihat [nomor]` | Menampilkan detail lengkap dari tugas dengan nomor tertentu. |
| **Edit Tugas** | `edit [nomor]` | Memulai sesi interaktif untuk mengubah matkul, deskripsi, atau tenggat. |
| **Hapus Tugas** | `hapus [nomor]` | Menghapus tugas dan semua lampirannya dari sistem. |
| **Set Lampiran**| Balas file dengan `setlampiran [nomor]` | Menambahkan lampiran baru ke tugas yang sudah ada. |
| **Ambil Lampiran**| `ambil [nomor]` | Meminta bot untuk mengirimkan semua file lampiran dari tugas tertentu. |
| **Tugas Minggu Ini**| `mingguan` | Menampilkan semua tugas yang tenggatnya 7 hari ke depan. |
| **Ekspor PDF** | `export pdf` | Mengekspor semua tugas ke dalam satu file PDF. |
| **Ekspor CSV** | `export csv` | Mengekspor semua tugas ke dalam satu file CSV. |
| **Menu** | `menu` atau `bantuan` | Menampilkan pesan bantuan ini. |
| **Ping** | `ping` | Mengecek apakah bot aktif dan merespons. |

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE` untuk informasi lebih lanjut.
````