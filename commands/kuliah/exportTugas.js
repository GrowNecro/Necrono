const { getSortedTasks, EXPORT_DIR } = require('../../utils/taskUtils');
const PDFDocument = require('pdfkit');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs-extra');
const path = require('path');
const { format, isPast } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'export',
    description: 'Ekspor tugas ke format PDF atau CSV.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;
        
        // 🔄 DIPERBARUI: Mengambil argumen dari indeks yang benar (args[0])
        const formatExport = args[0]?.toLowerCase();
        
        if (formatExport !== 'pdf' && formatExport !== 'csv') {
            return sock.sendMessage(groupJid, { text: 'Gunakan `export pdf` atau `export csv`.' }, { quoted: msg });
        }

        const tugasGrup = getSortedTasks(groupJid);
        if (tugasGrup.length === 0) {
            return sock.sendMessage(groupJid, { text: 'Tidak ada tugas untuk diekspor.' }, { quoted: msg });
        }

        const fileName = `export-tugas-${Date.now()}`;
        const filePath = path.join(EXPORT_DIR, `${fileName}.${formatExport}`);

        if (formatExport === 'pdf') {
            await new Promise(resolve => {
                const doc = new PDFDocument({ margin: 30, size: 'A4' });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);
                doc.fontSize(16).text('Daftar Tugas Kelas', { align: 'center' }).moveDown();
                tugasGrup.forEach(t => {
                    const deadlineDate = new Date(t.deadline);
                    const status = isPast(deadlineDate) ? 'Selesai/Lewat' : 'Aktif';
                    doc.fontSize(12).font('Helvetica-Bold').text(`Matkul: ${t.matkul}`);
                    doc.font('Helvetica').text(`Tugas: ${t.deskripsi}`, { continued: false });
                    doc.text(`Tenggat: ${format(deadlineDate, 'EEEE, d MMMM yyyy', { locale: id })}`);
                    doc.text(`Status: ${status}`);
                    doc.text(`Lampiran: ${(t.lampiran && t.lampiran.length > 0 && t.lampiran.join(', ')) || 'Tidak ada'}`).moveDown();
                });
                doc.end();
                stream.on('finish', resolve);
            });
        }

        if (formatExport === 'csv') {
            const csvWriter = createObjectCsvWriter({
                path: filePath,
                header: [
                    { id: 'matkul', title: 'Matkul' },
                    { id: 'deskripsi', title: 'Deskripsi Tugas' },
                    { id: 'deadline', title: 'Tenggat' },
                    { id: 'lampiran', title: 'Lampiran' }
                ]
            });
            const records = tugasGrup.map(t => ({
                ...t,
                lampiran: (t.lampiran && t.lampiran.length > 0 && t.lampiran.join(', ')) || ''
            }));
            await csvWriter.writeRecords(records);
        }

        await sock.sendMessage(groupJid, {
            document: { url: filePath },
            mimetype: formatExport === 'pdf' ? 'application/pdf' : 'text/csv',
            fileName: `Daftar Tugas.${formatExport}`
        }, { quoted: msg });
    }
};