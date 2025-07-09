const { replyWithTyping } = require('../../utils/replyUtils');

module.exports = {
    name: 'tutorial',
    description: 'Menampilkan panduan lengkap cara penggunaan bot.',
    async execute(sock, msg) {

        const tutorialText = `*📚 TUTORIAL PENGGUNAAN BOT NECRONO 📚*\n\n` +
            `Selamat datang! Berikut adalah cara menggunakan fitur-fitur utama bot ini.\n\n` +
            `*LANGKAH 1: MENAMBAH JADWAL/TUGAS BARU*\n` +
            `1. Tulis detail jadwal dalam satu pesan. Pastikan baris pertama adalah *Judul* dan ada baris berisi *Tenggat*.\n\n` +
            `   *Contoh Pesan:*\n` +
            `   \`\`\`Laporan Praktikum Fisika\n` +
            `   Jangan lupa kumpulkan di meja Pak Budi.\n` +
            `   Tenggat: 15 Juli 2025 jam 15:00\`\`\`\n\n` +
            `2. Balas (reply) pesan yang baru Anda buat itu dengan perintah:\n` +
            `   \`\`\`set tugas\`\`\`\n\n` +
            `3. Bot akan mengonfirmasi jika jadwal berhasil disimpan.\n` +
            `-----------------------------------\n` +
            `*LANGKAH 2: MELIHAT & MENGELOLA JADWAL*\n` +
            `Gunakan perintah-perintah berikut ini:\n\n` +
            `➡️ \`list\`\n` +
            `Untuk melihat daftar ringkas semua jadwal yang ada.\n\n` +
            `➡️ \`lihat [nomor]\` (contoh: \`lihat 2\`)\n` +
            `Untuk melihat detail lengkap dari jadwal nomor 2.\n\n` +
            `➡️ \`edit [nomor]\` (contoh: \`edit 2\`)\n` +
            `Untuk mengubah judul, deskripsi, atau tenggat dari jadwal nomor 2.\n\n` +
            `➡️ \`hapus [nomor]\` (contoh: \`hapus 2\`)\n` +
            `Untuk menghapus jadwal nomor 2.\n` +
            `-----------------------------------\n` +
            `*LANGKAH 3: MENGELOLA LAMPIRAN*\n` +
            `1. Kirim file (gambar/PDF/dokumen) ke grup.\n` +
            `2. Balas file tersebut dengan perintah:\n` +
            `   \`\`\`set lampiran [nomor]\`\`\`\n` +
            `   (Contoh: \`set lampiran 2\` untuk menambahkan file ke jadwal nomor 2).\n\n` +
            `3. Untuk mengambil kembali semua lampiran dari sebuah jadwal, gunakan:\n` +
            `   \`\`\`ambil [nomor]\`\`\`\n` +
            `   (Contoh: \`ambil 2\`)\n\n` +
            `*Selamat Mencoba!* Ketik \`menu\` untuk melihat daftar lengkap perintah.`;

        await replyWithTyping(sock, msg, tutorialText);
    }
};