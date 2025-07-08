const { getSortedTasks, EXPORT_DIR } = require('../../utils/taskUtils');
const PDFDocument = require('pdfkit');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs-extra');
const path = require('path');
const { format, isPast } = require('date-fns');
const { id } = require('date-fns/locale');

module.exports = {
    name: 'export',
    description: 'Ekspor jadwal ke format PDF atau CSV.',
    async execute(sock, msg, args) {
        const groupJid = msg.key.remoteJid;
        
        const formatExport = args[0]?.toLowerCase();
        
        if (formatExport !== 'pdf' && formatExport !== 'csv') {
            return sock.sendMessage(groupJid, { text: 'Gunakan `export pdf` atau `export csv`.' }, { quoted: msg });
        }

        const tugasGrup = getSortedTasks(groupJid);
        if (tugasGrup.length === 0) {
            return sock.sendMessage(groupJid, { text: 'Tidak ada data untuk diekspor.' }, { quoted: msg });
        }

        const fileName = `export-jadwal-${Date.now()}`;
        const filePath = path.join(EXPORT_DIR, `${fileName}.${formatExport}`);

        if (formatExport === 'pdf') {
            await new Promise(resolve => {
                const doc = new PDFDocument({ margin: 30, size: 'A4' });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);
                doc.fontSize(16).text('Daftar Jadwal & Tugas', { align: 'center' }).moveDown();
                tugasGrup.forEach(t => {
                    const deadlineDate = new Date(t.deadline);
                    const status = isPast(deadlineDate) ? 'Selesai/Lewat' : 'Aktif';
                    
                    // 🔄 DIPERBARUI: Menggunakan t.judul
                    doc.fontSize(12).font('Helvetica-Bold').text(`Judul: ${t.judul}`);
                    doc.font('Helvetica').text(`Deskripsi: ${t.deskripsi}`, { continued: false });
                    doc.text(`Tenggat: ${format(deadlineDate, 'EEEE, d MMMM yyyy, HH:mm', { locale: id })}`);
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
                    // 🔄 DIPERBARUI: Menggunakan 'judul'
                    { id: 'judul', title: 'Judul' },
                    { id: 'deskripsi', title: 'Deskripsi' },
                    { id: 'deadline', title: 'Tenggat' },
                    { id: 'lampiran', title: 'Lampiran' }
                ]
            });
            const records = tugasGrup.map(t => ({
                ...t,
                deadline: format(new Date(t.deadline), 'yyyy-MM-dd HH:mm'),
                lampiran: (t.lampiran && t.lampiran.length > 0 && t.lampiran.join(', ')) || ''
            }));
            await csvWriter.writeRecords(records);
        }

        await sock.sendMessage(groupJid, {
            document: { url: filePath },
            mimetype: formatExport === 'pdf' ? 'application/pdf' : 'text/csv',
            fileName: `Daftar-Jadwal.${formatExport}`
        }, { quoted: msg });
    }
};