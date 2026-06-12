const express = require('express');
const cors = require('cors');
const { fetchTLEs, getTLECache } = require('./services/tleSync');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

fetchTLEs();

app.get('/api/satellites/tle', (req, res) => {
    res.json(getTLECache());
});

app.get('/api/satellites/positions', async (req, res) => {
    const tles = getTLECache();
    const now = new Date().toISOString();
    const sample = tles.slice(0, 500);

    try {
        const results = await Promise.all(
            sample.map(sat =>
                axios.post('http://localhost:8001/api/propagate', {
                    tle_line1: sat.tle_line1,
                    tle_line2: sat.tle_line2,
                    epoch_utc: now
                })
                .then(r => ({ name: sat.name, ...r.data.geodetic }))
                .catch((err) => { console.log('Failed:', sat.name, err.message); return null; })
            )
        );
        res.json(results.filter(Boolean));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));