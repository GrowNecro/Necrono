const { getSortedTasks } = require('../../utils/taskUtils');
const { replyWithTyping } = require('../../utils/replyUtils');

module.exports = {
    name: 'edit',
    aliases: ['edittugas', 'editjadwal'],
    description: 'Mengubah detail jadwal atau tugas.',
    async execute(sock, msg, args, EDIT_SESSIONS) {
        const groupJid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (args.length !== 1 || isNaN(args[0])) {
            return replyWithTyping(sock, msg, "Format salah. Gunakan `edit [nomor]`.");
        }
        
        const taskNumber = parseInt(args[0], 10);
        const tugasGrup = getSortedTasks(groupJid);

        if (taskNumber <= 0 || taskNumber > tugasGrup.length) {
            return replyWithTyping(sock, msg, `❌ Item dengan nomor ${taskNumber} tidak ditemukan.`);
        }

        const tugasToEdit = tugasGrup[taskNumber - 1];
        
        EDIT_SESSIONS[sender] = {
            taskId: tugasToEdit.id,
            type: 'tugas',
            stage: 'pilih_bagian'
        };

        const editMenuText = `*📝 Edit Item: ${tugasToEdit.judul}*\n\n` +
            `Bagian mana yang ingin Anda ubah?\n` +
            `1. Judul\n` +
            `2. Deskripsi\n` +
            `3. Tenggat\n\n` +
            `Kirim angka pilihan Anda (1-3). Kirim 'batal' untuk keluar.`;
        
        await replyWithTyping(sock, msg, editMenuText);
    }
};