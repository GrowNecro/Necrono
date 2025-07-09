const { getSortedTasks } = require('../../utils/taskUtils');
const { replyWithTyping } = require('../../utils/replyUtils');
const { isWithinInterval, addDays, format, isPast } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'mingguan',
    aliases: ['tugasmingguini'],
    description: 'Menampilkan jadwal/tugas untuk 7 hari ke depan.',
    async execute(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const now = new Date();
        const start = now;
        const end = addDays(now, 7);
        const tugasGrup = getSortedTasks(groupJid);

        const tugasMingguIni = tugasGrup.filter(t => isWithinInterval(new Date(t.deadline), { start, end }));

        if (tugasMingguIni.length === 0) {
            return replyWithTyping(sock, msg, '🙌 Tidak ada jadwal dengan tenggat dalam 7 hari ke depan.');
        }
        
        let replyText = `*🗓️ JADWAL 7 HARI KE DEPAN 🗓️*\n\n`;
        tugasMingguIni.forEach((t) => {
            const deadlineDate = new Date(t.deadline);
            replyText += `🔴 (Aktif)\n` +
                         `*Judul:* ${t.judul}\n` +
                         `*Deskripsi:* ${t.deskripsi}\n` +
                         `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM yyyy, HH:mm', { locale: id })}\n\n`;
        });
        
        await replyWithTyping(sock, msg, replyText.trim());
    }
};