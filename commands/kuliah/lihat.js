const { getSortedTasks } = require('../../utils/taskUtils');
const { replyWithTyping } = require('../../utils/replyUtils');
const { format, isPast } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'lihat',
    aliases: ['lihattugas', 'detail'],
    description: 'Melihat detail jadwal atau tugas.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;
        const tugasGrup = getSortedTasks(groupJid);

        if (tugasGrup.length === 0) {
            return replyWithTyping(sock, msg, '🎉 Tidak ada item yang tersimpan.');
        }

        // Mode: lihat [nomor]
        if (args.length === 1 && !isNaN(args[0])) {
            const taskNumber = parseInt(args[0], 10);
            if (taskNumber > 0 && taskNumber <= tugasGrup.length) {
                const t = tugasGrup[taskNumber - 1];
                const deadlineDate = new Date(t.deadline);
                const status = isPast(deadlineDate) ? '🟢 (Selesai/Lewat)' : '🔴 (Aktif)';
                
                let lampiranText = 'Tidak ada';
                if (t.lampiran && t.lampiran.length > 0) {
                    lampiranText = t.lampiran.map((file, index) => `\n ${index + 1}. ${file}`).join('');
                }
                
                let detailText = `*🔍 DETAIL ITEM #${taskNumber} 🔍*\n\n` +
                                 `${status}\n` +
                                 `*Judul:* ${t.judul}\n` +
                                 `*Deskripsi:* ${t.deskripsi}\n` +
                                 `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM<x_bin_534>, HH:mm', { locale: id })}\n` +
                                 `*Lampiran:* ${lampiranText}`;

                if (t.lampiran && t.lampiran.length > 0) {
                    detailText += `\n\n_Untuk mengambil, ketik "ambil ${taskNumber}"_`;
                }
                return replyWithTyping(sock, msg, detailText);
            } else {
                return replyWithTyping(sock, msg, `❌ Item dengan nomor ${taskNumber} tidak ditemukan.`);
            }
        }

        let replyText = `*📋 DAFTAR SEMUA ITEM 📋*\n\n`;
        tugasGrup.forEach(t => {
            const deadlineDate = new Date(t.deadline);
            const status = isPast(deadlineDate) ? '🟢 (Selesai/Lewat)' : '🔴 (Aktif)';
            const lampiranText = (t.lampiran && t.lampiran.length > 0) ? t.lampiran.join(', ') : 'Tidak ada';
            replyText += `${status}\n` +
                         `*Judul:* ${t.judul}\n` +
                         `*Deskripsi:* ${t.deskripsi}\n` +
                         `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM<x_bin_534>, HH:mm', { locale: id })}\n` +
                         `*Lampiran:* ${lampiranText}\n\n`;
        });
        await replyWithTyping(sock, msg, replyText.trim());
    }
};