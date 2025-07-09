const { getSortedTasks } = require('../../utils/taskUtils');
const { replyWithTyping } = require('../../utils/replyUtils');
const { format, isPast } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'list',
    aliases: ['listtugas', 'daftar'],
    description: 'Menampilkan daftar ringkas semua jadwal/tugas.',
    async execute(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const tugasGrup = getSortedTasks(groupJid);

        if (tugasGrup.length === 0) {
            return replyWithTyping(sock, msg, '🎉 Tidak ada item yang tersimpan.');
        }

        let replyText = '*🗒️ DAFTAR ITEM (TERBARU DI ATAS) 🗒️*\n\n';
        tugasGrup.forEach((t, index) => {
            const deadlineDate = new Date(t.deadline);
            const isDone = isPast(deadlineDate);
            const status = isDone ? ' (Selesai)' : '';
            
            replyText += `${index + 1}. ${t.judul} - *DL: ${format(deadlineDate, 'dd MMM yyyy', { locale: id })}*${status}\n`;
        });
        replyText += '\nKetik `lihat [nomor]` untuk detail.';
        
        await replyWithTyping(sock, msg, replyText);
    }
};