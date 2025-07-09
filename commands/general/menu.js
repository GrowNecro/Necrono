const { replyWithTyping } = require('../../utils/replyUtils');

module.exports = {
    name: 'menu',
    aliases: ['help', 'bantuan'],
    description: 'Menampilkan menu bantuan.',
    async execute(sock, msg) {
        
        const menuText = `*🤖 MENU BOT NECRONO 🤖*\n\n` +
            `Berikut adalah daftar perintah yang tersedia:\n\n` +
            `*MANAJEMEN JADWAL*\n` +
            `\`set tugas\` - Simpan item/jadwal baru.\n` +
            `\`list\` - Lihat daftar ringkas semua item.\n` +
            `\`lihat [no]\` - Lihat detail item.\n` +
            `\`edit [no]\` - Ubah detail item.\n` +
            `\`hapus [no]\` - Hapus item.\n` +
            `\`set lampiran [no]\` - Tambah lampiran ke item.\n` +
            `\`ambil [no]\` - Ambil semua lampiran item.\n` +
            `\`mingguan\` - Lihat jadwal 7 hari ke depan.\n\n` +
            `*EKSPOR DATA*\n` +
            `\`export pdf\` - Ekspor daftar ke format PDF.\n\n` +
            `*BANTUAN*\n` +
            `\`tutorial\` - Panduan lengkap penggunaan bot.\n` +
            `\`ping\` - Cek status dan koneksi bot.`;
        
        await replyWithTyping(sock, msg, menuText);
    }
};