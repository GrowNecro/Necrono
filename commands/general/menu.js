module.exports = {
    name: 'menu',
    aliases: ['help', 'bantuan'],
    description: 'Menampilkan menu bantuan.',
    async execute(sock, msg) {
        const menuText = `*🤖 MENU BOT TUGAS KELAS 🤖*\n\n` +
            `*MANAJEMEN TUGAS*\n` +
            `\`set tugas\` - Simpan tugas baru.\n` +
            `\`list\` - Lihat daftar ringkas tugas.\n` +
            `\`lihat [no]\` - Lihat detail tugas.\n` +
            `\`edit [no]\` - Ubah detail tugas.\n` +
            `\`hapus [no]\` - Hapus tugas.\n` +
            `\`setlampiran [no]\` - Tambah lampiran.\n` +
            `\`ambil [no]\` - Ambil semua lampiran tugas.\n` +
            `\`mingguan\` - Lihat tugas 7 hari ke depan.\n\n` +
            `*EKSPOR DATA*\n` +
            `\`export pdf\` - Ekspor ke PDF.\n` +
            `\`export csv\` - Ekspor ke CSV.`;
        
        await sock.sendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
    }
};