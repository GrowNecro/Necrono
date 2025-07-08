module.exports = {
    name: 'menu',
    aliases: ['help', 'bantuan'],
    description: 'Menampilkan menu bantuan.',
    async execute(sock, msg) {
        const menuText = `*🤖 MENU BOT TUGAS KELAS 🤖*\n\n` +
            `*MANAJEMEN TUGAS*\n` +
            `\`set tugas\` - Simpan tugas baru.\n` +
            `\`list\` - Lihat daftar ringkas tugas.\n` +
            `\`lihat [nomer]\` - Lihat detail tugas.\n` +
            `\`edit [nomer]\` - Ubah detail tugas.\n` +
            `\`hapus [nomer]\` - Hapus tugas.\n` +
            `\`setlampiran [nomer]\` - Tambah lampiran.\n` +
            `\`ambil [nomer]\` - Ambil semua lampiran tugas.\n` +
            `\`mingguan\` - Lihat tugas 7 hari ke depan.\n\n` +
            `*EKSPOR DATA*\n` +
            `\`export pdf\` - Ekspor ke PDF.\n` +
            `*BANTUAN*\n` +
            `\`tutorial\` - Lihat panduan penggunaan bot.\n` +
            `\`ping\` - Cek status bot.`;
        
        await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
    }
};