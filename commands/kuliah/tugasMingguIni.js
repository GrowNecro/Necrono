const { getSortedTasks } = require('../../utils/taskUtils');
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
            return sock.sendMessage(groupJid, { text: '🙌 Tidak ada jadwal dengan tenggat dalam 7 hari ke depan.' }, { quoted: msg });
        }
        
        let replyText = `*🗓️ JADWAL 7 HARI KE DEPAN 🗓️*\n\n`;
        tugasMingguIni.forEach((t) => {
            const deadlineDate = new Date(t.deadline);
            // Logika status aktif/selesai bisa ditambahkan kembali jika perlu
            replyText += `🔴 (Aktif)\n` +
                         `*Judul:* ${t.judul}\n` + // Menggunakan t.judul
                         `*Deskripsi:* ${t.deskripsi}\n` +
                         `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM yyyy, HH:mm', { locale: id })}\n\n`; // Menampilkan jam
        });
        
        await sock.sendMessage(groupJid, { text: replyText.trim() }, { quoted: msg });
    }
};