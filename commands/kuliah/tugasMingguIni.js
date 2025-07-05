const { getSortedTasks } = require('../../utils/taskUtils');
const { isWithinInterval, addDays, format } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'mingguan',
    aliases: ['tuggasmingguini'],
    description: 'Menampilkan tugas untuk 7 hari ke depan.',
    async execute(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const now = new Date();
        const start = now;
        const end = addDays(now, 7);
        const tugasGrup = getSortedTasks(groupJid);

        const tugasMingguIni = tugasGrup.filter(t => isWithinInterval(new Date(t.deadline), { start, end }));

        if (tugasMingguIni.length === 0) {
            return sock.sendMessage(groupJid, { text: '🙌 Tidak ada tugas dengan tenggat dalam 7 hari ke depan.' }, { quoted: msg });
        }
        
        let replyText = `*🗓️ TUGAS 7 HARI KE DEPAN 🗓️*\n\n`;
        tugasMingguIni.forEach((t) => {
            const deadlineDate = new Date(t.deadline);
            replyText += `🔴 (Aktif)\n` +
                         `*Matkul:* ${t.matkul}\n` +
                         `*Tugas:* ${t.deskripsi}\n` +
                         `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM yyyy', { locale: id })}\n\n`;
        });
        
        await sock.sendMessage(groupJid, { text: replyText.trim() }, { quoted: msg });
    }
};