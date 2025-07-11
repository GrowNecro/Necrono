const cron = require('node-cron');
const { loadTugas, saveTugas } = require('../utils/taskUtils');
const { differenceInDays, differenceInHours, format } = require('date-fns');
const { id } = require('date-fns/locale');

const startReminderService = (sock) => {
    // Berjalan bergantung setelan waktu
    // Ubah ke '*/15 * * * *' untuk produksi, atau '*/1 * * * *' untuk pengujian
    cron.schedule('*/15 * * * *', async () => {
        console.log('⏰ Menjalankan pengecekan pengingat tugas...');
        const allTugas = loadTugas();
        const now = new Date();
        let needsSave = false;

        for (const groupId in allTugas) {
            if (!Array.isArray(allTugas[groupId])) continue;
            
            for (const tugas of allTugas[groupId]) {
                const deadlineDate = new Date(tugas.deadline);
                if (deadlineDate < now) continue;

                const diffDays = differenceInDays(deadlineDate, now);
                const diffHours = differenceInHours(deadlineDate, now);
                let reminderText = '';

                if (diffDays < 3 && diffDays >= 1 && !tugas.pengingat['3d']) {
                    reminderText = `🔔 *PENGINGAT TUGAS H-3* 🔔`;
                    tugas.pengingat['3d'] = true;
                } else if (diffHours < 24 && diffHours >= 3 && !tugas.pengingat['1d']) {
                    reminderText = `🔥 *PENGINGAT TUGAS H-1* 🔥`;
                    tugas.pengingat['1d'] = true;
                    tugas.pengingat['3d'] = true;
                } else if (diffHours < 3 && diffHours >= 0 && !tugas.pengingat['3h']) {
                    reminderText = `🚨 *PENGINGAT TUGAS 3 JAM LAGI* 🚨`;
                    tugas.pengingat['3h'] = true;
                    tugas.pengingat['1d'] = true;
                    tugas.pengingat['3d'] = true;
                }

                if (reminderText) {
                    // 🔄 DIPERBARUI: Menampilkan jam pada pesan pengingat
                    const fullMessage = `${reminderText}\n\n` +
                                      `*Judul:* ${tugas.judul}\n` +
                                      `*Tugas:* ${tugas.deskripsi}\n` +
                                      `*Tenggat:* ${format(deadlineDate, 'EEEE, d MMMM yyyy, HH:mm', { locale: id })}\n\n` +
                                      `Segera selesaikan ya! 💪`;
                    
                    try {
                        await sock.sendMessage(groupId, { text: fullMessage });
                        needsSave = true;
                    } catch (error) {
                        console.error(`Gagal mengirim pengingat ke ${groupId}:`, error);
                    }
                }
            }
        }
        if (needsSave) {
            saveTugas(allTugas);
        }
    });
};

module.exports = { startReminderService };