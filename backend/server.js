const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'] }
});
app.set('io', io);

// CORS — allow any localhost port (handles Vite port bumps)
app.use(cors({
  origin: /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/job-roles',   require('./routes/jobRoles'));
app.use('/api/candidates',  require('./routes/candidates'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/tasks',       require('./routes/tasks'));
app.use('/api/schedules',   require('./routes/schedules'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/profiles',    require('./routes/profiles'));
app.use('/api/skill-paths', require('./routes/skillPaths'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Hirrd MERN API', version: '2.0.0' });
});

// ── WebSocket ────────────────────────────────────────────────
io.on('connection', (socket) => {
  socket.on('join', (userId) => socket.join(userId));
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`\n[OK] Hirrd API  →  http://localhost:${PORT}`);
  console.log(`[OK] API Docs   →  http://localhost:${PORT}/api/health\n`);
});
