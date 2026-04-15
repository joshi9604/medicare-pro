const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { testConnection } = require('./config/database');
const { syncDatabase } = require('./models');
const { initializeSocket } = require('./utils/socket');

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/doctors',      require('./routes/doctors'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/prescriptions',require('./routes/prescriptions'));
app.use('/api/payments',     require('./routes/payments'));
app.use('/api/admin',        require('./routes/admin'));
app.use('/api/notifications',require('./routes/notifications'));
app.use('/api/medical-records',require('./routes/medicalRecords'));
app.use('/api/chat',         require('./routes/chat'));
app.use('/api/users', require('./routes/users'));

// Health check
app.get('/', (req, res) => res.json({ message: '🏥 MediCare Pro API Running', status: 'OK', database: 'PostgreSQL', features: ['Real-time Notifications', 'Dark Mode', 'PDF Print', 'Rating System', 'Avatar Upload'] }));

// Initialize Socket.io
initializeSocket(io);

// Start Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    await syncDatabase();
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io ready for real-time notifications`);
    });
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
