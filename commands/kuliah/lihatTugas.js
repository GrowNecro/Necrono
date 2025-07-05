const { getSortedTasks } = require('../../utils/taskUtils');
const { format, isPast } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'lihat',
    aliases: ['lihattugas', 'detail'],
    description: 'Melihat detail tugas.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;
        const tugasGrup = getSortedTasks(groupJid);

        if (tugasGrup.length === 0) {
            return sock.sendMessage(groupJid, { text: '🎉 Tidak ada tugas yang tersimpan.' }, { quoted: msg });
        }

        // Mode: lihat [nomor]
        if (args.length === 2 && !isNaN(args[1])) {
            const taskNumber = parseInt(args[1], 10);
            if (taskNumber > 0 && taskNumber <= tugasGrup.length) {
                const t = tugasGrup[taskNumber - 1];
                const deadlineDate = new Date(t.deadline);
                const status = isPast(deadlineDate) ? '🟢 (Selesai/Lewat)' : '🔴 (Aktif)';
                
                let lampiranText = 'Tidak ada';
                if (t.lampiran && t.lampiran.length > 0) {
                    lampiranText = t.lampiran.map((file, index) => `\n ${index + 1}. ${file}`).join('');
                }
                
                let detailText = `*🔍 DETAIL TUGAS #${taskNumber} 🔍*\n\n` +
                                 `${status}\n` +
                                 `*Matkul:* ${t.matkul}\n` +
                                 `*Tugas:* ${t.deskripsi}\n` +
                                 `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM yyyy', { locale: id })}\n` +
                                 `*Lampiran:* ${lampiranText}`;

                if (t.lampiran && t.lampiran.length > 0) {
                    detailText += `\n\n_Untuk mengambil, ketik "ambil ${taskNumber}"_`;
                }
                return sock.sendMessage(groupJid, { text: detailText }, { quoted: msg });
            } else {
                return sock.sendMessage(groupJid, { text: `❌ Tugas dengan nomor ${taskNumber} tidak ditemukan.` }, { quoted: msg });
            }
        }

        // Mode: lihat (semua)
        let replyText = `*📋 DAFTAR SEMUA TUGAS 📋*\n\n`;
        tugasGrup.forEach(t => {
            const deadlineDate = new Date(t.deadline);
            const status = isPast(deadlineDate) ? '🟢 (Selesai/Lewat)' : '🔴 (Aktif)';
            const lampiranText = (t.lampiran && t.lampiran.length > 0) ? t.lampiran.join(', ') : 'Tidak ada';
            replyText += `${status}\n` +
                         `*Matkul:* ${t.matkul}\n` +
                         `*Tugas:* ${t.deskripsi}\n` +
                         `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM yyyy', { locale: id })}\n` +
                         `*Lampiran:* ${lampiranText}\n\n`;
        });
        await sock.sendMessage(groupJid, { text: replyText.trim() }, { quoted: msg });
    }
};