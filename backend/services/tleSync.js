const axios = require('axios');

const CELESTRAK_URL = 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=tle';

let tleCache = [];

async function fetchTLEs() {
    try {
        console.log('Fetching TLEs from CelesTrak...');
        const response = await axios.get(CELESTRAK_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/plain, */*',
            },
            timeout: 30000
        });
        const lines = response.data.trim().split('\n').map(l => l.trim());

        const satellites = [];
        for (let i = 0; i + 2 < lines.length; i += 3) {
            satellites.push({
                name: lines[i],
                tle_line1: lines[i + 1],
                tle_line2: lines[i + 2],
            });
        }

        tleCache = satellites;
        console.log('Loaded ' + satellites.length + ' satellites');
        return satellites;

    } catch (err) {
        console.error('TLE fetch failed:', err.message);
        return tleCache;
    }
}

function getTLECache() {
    return tleCache;
}

module.exports = { fetchTLEs, getTLECache };