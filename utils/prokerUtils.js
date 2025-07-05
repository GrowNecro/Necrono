const fs = require('fs-extra');
const path = require('path');
const { parse, setHours, setMinutes, setSeconds } = require('date-fns');

const DATA_FILE = path.join(__dirname, '..', 'data_proker.json');

const loadProker = () => {
    if (!fs.existsSync(DATA_FILE)) return {};
    try {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data.toString());
    } catch (error) {
        console.error("Gagal memuat data_proker.json:", error);
        return {};
    }
};

const saveProker = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

const parseIndonesianDate = (dateString) => {
    const months = {
        'januari': 'January', 'februari': 'February', 'maret': 'March', 'april': 'April',
        'mei': 'May', 'juni': 'June', 'juli': 'July', 'agustus': 'August',
        'september': 'September', 'oktober': 'October', 'november': 'November', 'desember': 'December'
    };
    const dateRegex = /(\d{1,2})\s+(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s+(\d{4})/i;
    const dateMatch = dateString.match(dateRegex);
    if (!dateMatch) return null;

    const day = dateMatch[1], month = months[dateMatch[2].toLowerCase()], year = dateMatch[3];
    let date = parse(`${day} ${month} ${year}`, 'd MMMM yyyy', new Date());

    const timeRegex = /(?:jam\s*)?(\d{1,2})[:.](\d{2})/i;
    const timeMatch = dateString.match(timeRegex);

    if (timeMatch) {
        date = setHours(date, parseInt(timeMatch[1], 10));
        date = setMinutes(date, parseInt(timeMatch[2], 10));
    } else {
        date = setHours(date, 8);
        date = setMinutes(date, 0);
    }
    return setSeconds(date, 0);
};

const getSortedProker = (groupId) => {
    const allProker = loadProker();
    let prokerGrup = allProker[groupId] || [];
    prokerGrup.sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal));
    return prokerGrup;
};

module.exports = {
    loadProker,
    saveProker,
    parseIndonesianDate,
    getSortedProker,
    MEDIA_DIR: path.join(__dirname, '..', 'media'),
};