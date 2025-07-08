const { getSortedTasks } = require('../../utils/taskUtils');
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
            return sock.sendMessage(groupJid, { text: '🎉 Tidak ada item yang tersimpan.' }, { quoted: msg });
        }

        // 🔄 DIPERBARUI: Mode: lihat [nomor]
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
                                 `*Judul:* ${t.judul}\n` + // Menggunakan t.judul
                                 `*Deskripsi:* ${t.deskripsi}\n` +
                                 `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM yyyy, HH:mm', { locale: id })}\n` + // Menampilkan jam
                                 `*Lampiran:* ${lampiranText}`;

                if (t.lampiran && t.lampiran.length > 0) {
                    detailText += `\n\n_Untuk mengambil, ketik "ambil ${taskNumber}"_`;
                }
                return sock.sendMessage(groupJid, { text: detailText }, { quoted: msg });
            } else {
                return sock.sendMessage(groupJid, { text: `❌ Item dengan nomor ${taskNumber} tidak ditemukan.` }, { quoted: msg });
            }
        }

        // 🔄 DIPERBARUI: Mode: lihat (semua)
        let replyText = `*📋 DAFTAR SEMUA ITEM 📋*\n\n`;
        tugasGrup.forEach(t => {
            const deadlineDate = new Date(t.deadline);
            const status = isPast(deadlineDate) ? '🟢 (Selesai/Lewat)' : '🔴 (Aktif)';
            const lampiranText = (t.lampiran && t.lampiran.length > 0) ? t.lampiran.join(', ') : 'Tidak ada';
            replyText += `${status}\n` +
                         `*Judul:* ${t.judul}\n` + // Menggunakan t.judul
                         `*Deskripsi:* ${t.deskripsi}\n` +
                         `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM yyyy, HH:mm', { locale: id })}\n` + // Menampilkan jam
                         `*Lampiran:* ${lampiranText}\n\n`;
        });
        await sock.sendMessage(groupJid, { text: replyText.trim() }, { quoted: msg });
    }
};