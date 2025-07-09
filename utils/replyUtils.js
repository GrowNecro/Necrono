const randomDelay = () => new Promise(res => setTimeout(res, Math.floor(Math.random() * 800) + 400));

/**
 * Mengirim balasan dengan status "mengetik" dan jeda acak.
 * @param {import('@whiskeysockets/baileys').WASocket} sock - Instance socket Baileys.
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg - Objek pesan yang masuk untuk dibalas.
 * @param {string} textResponse - Teks yang akan dikirim sebagai balasan.
 */
const replyWithTyping = async (sock, msg, textResponse) => {
    const chatId = msg.key.remoteJid;
    await sock.sendPresenceUpdate('composing', chatId);
    await randomDelay();
    await sock.sendMessage(chatId, { text: textResponse }, { quoted: msg });
};

module.exports = { replyWithTyping };