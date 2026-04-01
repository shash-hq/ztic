import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import eventRoutes from './routes/eventRoutes.js';
import showRoutes from './routes/showRoutes.js';
import seatRoutes from './routes/seatRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { initSeatSocket } from './socket/seatSocket.js';

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

// ── Socket.IO ─────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
  },
});
// Add this single line right after: const io = new Server(httpServer, {...});
app.set('io', io);
initSeatSocket(io);

// ── Middleware ────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api/v1', apiLimiter);

// ── Routes ────────────────────────────────────
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/shows', showRoutes);
app.use('/api/v1/seats', seatRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// ── Health Check ──────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// ── Error Handler (must be last) ──────────────
app.use(errorHandler);

// ── Boot ──────────────────────────────────────
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`\n🔥 ZTic server running on http://localhost:${PORT}`);
    console.log(`📡 Socket.IO listening on ws://localhost:${PORT}\n`);
  });
});


