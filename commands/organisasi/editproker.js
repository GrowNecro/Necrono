const { getSortedProker } = require('../../utils/prokerUtils');

module.exports = {
    name: 'edit proker',
    aliases: ['editproker'],
    description: 'Mengubah detail proker.',
    async execute(sock, msg, args, EDIT_SESSIONS) {
        const groupJid = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        if (args.length !== 1 || isNaN(args[0])) {
            return sock.sendMessage(groupJid, { text: "Format salah. Gunakan `edit proker [nomor]`." }, { quoted: msg });
        }
        
        const prokerNumber = parseInt(args[0], 10);
        const prokerGrup = getSortedProker(groupJid);

        if (prokerNumber <= 0 || prokerNumber > prokerGrup.length) {
            return sock.sendMessage(groupJid, { text: `❌ Proker dengan nomor ${prokerNumber} tidak ditemukan.` }, { quoted: msg });
        }

        const prokerToEdit = prokerGrup[prokerNumber - 1];
        
        // 🔄 DIPERBARUI: Menambahkan `type: 'proker'`
        EDIT_SESSIONS[sender] = {
            taskId: prokerToEdit.id,
            type: 'proker', // <-- INI BAGIAN PENTINGNYA
            stage: 'pilih_bagian'
        };

        const editMenuText = `*📝 Edit Proker: ${prokerToEdit.nama}*\n\n` +
            `Bagian mana yang ingin Anda ubah?\n` +
            `1. Nama Proker\n` +
            `2. Detail/PJ\n` +
            `3. Tanggal\n\n` +
            `Kirim angka pilihan Anda (1-3). Kirim 'batal' untuk keluar.`;
        
        await sock.sendMessage(groupJid, { text: editMenuText }, { quoted: msg });
    }
};