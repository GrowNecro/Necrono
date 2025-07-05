const { getSortedTasks } = require('../../utils/taskUtils');
const { format, isPast } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'list',
    aliases: ['listtugas', 'daftar'],
    description: 'Menampilkan daftar ringkas semua tugas.',
    async execute(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const tugasGrup = getSortedTasks(groupJid);

        if (tugasGrup.length === 0) {
            return sock.sendMessage(groupJid, { text: '🎉 Tidak ada tugas yang tersimpan.' }, { quoted: msg });
        }

        let replyText = '*🗒️ LIST TUGAS (TERBARU DI ATAS) 🗒️*\n\n';
        tugasGrup.forEach((t, index) => {
            const deadlineDate = new Date(t.deadline);
            const isDone = isPast(deadlineDate);
            const status = isDone ? ' (Selesai)' : '';
            replyText += `${index + 1}. ${t.matkul} - *DL: ${format(deadlineDate, 'dd MMM yyyy', { locale: id })}*${status}\n`;
        });
        replyText += '\nKetik `lihat [nomor]` untuk detail.';
        
        await sock.sendMessage(groupJid, { text: replyText }, { quoted: msg });
    }
};