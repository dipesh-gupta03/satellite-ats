const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const satelliteRoutes = require('./routes/satellites');
const conjunctionRoutes = require('./routes/conjunctions');
const stationRoutes = require('./routes/stations');
const debrisRoutes = require('./routes/debris');
const { startTleSync } = require('./services/tleSync');
const { startAlertEngine } = require('./services/alertEngine');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

app.use('/api/satellites', satelliteRoutes);
app.use('/api/conjunctions', conjunctionRoutes);
app.use('/api/stations', stationRoutes);
app.use('/api/debris', debrisRoutes);
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

startTleSync();
startAlertEngine(io);

const PORT = process.env.BACKEND_PORT || 4000;
server.listen(PORT, () => console.log(`Backend running on :${PORT}`));
