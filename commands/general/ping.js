module.exports = {
    name: 'ping',
    description: 'Cek koneksi bot.',
    async execute(sock, msg) {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Pong!' }, { quoted: msg });
    }
};