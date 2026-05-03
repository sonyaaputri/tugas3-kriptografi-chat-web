import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import authRoutes    from './routes/auth.routes.js';
import userRoutes    from './routes/user.routes.js';
import messageRoutes from './routes/message.routes.js';

const app = express();

// Security headers
app.use(helmet());

// CORS — izinkan client frontend
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Parse JSON body
app.use(express.json());

// Routes
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/messages', messageRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;