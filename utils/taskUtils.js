const fs = require('fs-extra');
const path = require('path');
const { parse, setHours, setMinutes, setSeconds } = require('date-fns');

const DATA_FILE = path.join(__dirname, '..', 'data_tugas.json');

const loadTugas = () => {
    if (!fs.existsSync(DATA_FILE)) return {};
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data.toString());
    } catch (error) {
        console.error("Gagal memuat data_tugas.json:", error);
        return {};
    }
};

const saveTugas = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// 🔄 DIPERBARUI: Fungsi parse tanggal sekarang bisa mengenali jam
const parseIndonesianDate = (dateString) => {
    const months = {
        'januari': 'January', 'februari': 'February', 'maret': 'March', 'april': 'April',
        'mei': 'May', 'juni': 'June', 'juli': 'July', 'agustus': 'August',
        'september': 'September', 'oktober': 'October', 'november': 'November', 'desember': 'December'
    };
    
    // Regex untuk tanggal
    const dateRegex = /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(\d{4})/i;
    const dateMatch = dateString.match(dateRegex);
    if (!dateMatch) return null;

    const day = dateMatch[1], month = months[dateMatch[2].toLowerCase()], year = dateMatch[3];
    let date = parse(`${day} ${month} ${year}`, 'd MMMM yyyy', new Date());

    // Regex untuk jam (opsional)
    const timeRegex = /(?:jam\s*)?(\d{1,2})[:.](\d{2})/i;
    const timeMatch = dateString.match(timeRegex);

    if (timeMatch) {
        // Jika ada jam, atur jam dan menit sesuai input
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        date = setHours(date, hours);
        date = setMinutes(date, minutes);
    } else {
        // Jika tidak ada jam, atur default ke 23:59
        date = setHours(date, 23);
        date = setMinutes(date, 59);
    }
    
    return setSeconds(date, 0); // Atur detik ke 0
};

const getSortedTasks = (groupId) => {
    const allTugas = loadTugas();
    let tugasGrup = allTugas[groupId] || [];
    tugasGrup.sort((a, b) => b.id - a.id);
    return tugasGrup;
};

module.exports = {
    loadTugas,
    saveTugas,
    parseIndonesianDate,
    getSortedTasks,
    MEDIA_DIR: path.join(__dirname, '..', 'media'),
    EXPORT_DIR: path.join(__dirname, '..', 'export')
};