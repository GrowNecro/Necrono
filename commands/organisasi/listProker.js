const { getSortedProker } = require('../../utils/prokerUtils'); // Path dan fungsi yang benar
const { format, isPast } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'list proker',
    aliases: ['proker'],
    description: 'Menampilkan daftar ringkas semua proker.',
    async execute(sock, msg) {
        const groupJid = msg.key.remoteJid;
        const prokerGrup = getSortedProker(groupJid); // Menggunakan fungsi proker

        if (prokerGrup.length === 0) {
            return sock.sendMessage(groupJid, { text: '🎉 Tidak ada proker yang tersimpan.' }, { quoted: msg });
        }

        let replyText = '*🗓️ LIST PROKER (TERDEKAT DI DEPAN) 🗓️*\n\n';
        prokerGrup.forEach((proker, index) => { // Menggunakan variabel proker
            const tanggalPelaksanaan = new Date(proker.tanggal);
            const isDone = isPast(tanggalPelaksanaan);
            const status = isDone ? ' (Selesai)' : '';
            replyText += `${index + 1}. ${proker.nama} - *Tgl: ${format(tanggalPelaksanaan, 'dd MMM yyyy', { locale: id })}*${status}\n`;
        });
        replyText += '\nKetik `lihat proker [nomor]` untuk detail.';
        
        await sock.sendMessage(groupJid, { text: replyText }, { quoted: msg });
    }
};