const { getSortedTasks } = require('../../utils/taskUtils');

module.exports = {
    name: 'edit',
    aliases: ['edittugas', 'editjadwal'],
    description: 'Mengubah detail jadwal atau tugas.',
    async execute(sock, msg, args, EDIT_SESSIONS) {
        const groupJid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (args.length !== 1 || isNaN(args[0])) {
            return sock.sendMessage(groupJid, { text: "Format salah. Gunakan `edit [nomor]`." }, { quoted: msg });
        }
        
        const taskNumber = parseInt(args[0], 10);
        const tugasGrup = getSortedTasks(groupJid);

        if (taskNumber <= 0 || taskNumber > tugasGrup.length) {
            return sock.sendMessage(groupJid, { text: `❌ Item dengan nomor ${taskNumber} tidak ditemukan.` }, { quoted: msg });
        }

        const tugasToEdit = tugasGrup[taskNumber - 1];
        
        EDIT_SESSIONS[sender] = {
            taskId: tugasToEdit.id,
            type: 'tugas',
            stage: 'pilih_bagian'
        };

        // 🔄 DIPERBARUI: Menggunakan tugas.judul dan istilah yang lebih umum
        const editMenuText = `*📝 Edit Item: ${tugasToEdit.judul}*\n\n` +
            `Bagian mana yang ingin Anda ubah?\n` +
            `1. Judul\n` +
            `2. Deskripsi\n` +
            `3. Tenggat\n\n` +
            `Kirim angka pilihan Anda (1-3). Kirim 'batal' untuk keluar.`;
        
        await sock.sendMessage(groupJid, { text: editMenuText }, { quoted: msg });
    }
};