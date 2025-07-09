const { replyWithTyping } = require('../../utils/replyUtils');

module.exports = {
    name: 'ping',
    description: 'Cek koneksi bot.',
    async execute(sock, msg) {
        await replyWithTyping(sock, msg, 'Pong!');
    }
};