const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { testConnection } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { syncDatabase } = require('./models');
const { initializeSocket } = require('./utils/socket');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'https://medicare-pro-kappa.vercel.app',
  'https://medicarepro-production.up.railway.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  res.json({
    message: 'MediCare Pro API Running',
    status: 'OK',
    database: 'PostgreSQL',
    features: [
      'Real-time Notifications',
      'Dark Mode',
      'PDF Print',
      'Rating System',
      'Avatar Upload'
    ]
  });
});

initializeSocket(io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    // Connect Redis during server startup (best-effort; does not break boot).
    await connectRedis();
    await syncDatabase();

    // Register API routes after Redis/PostgreSQL startup.
    // This ensures Redis-dependent middleware can be initialized safely.
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/public', require('./routes/public'));
    app.use('/api/doctors', require('./routes/doctors'));
    app.use('/api/patients', require('./routes/patients'));
    app.use('/api/appointments', require('./routes/appointments'));
    app.use('/api/prescriptions', require('./routes/prescriptions'));
    app.use('/api/payments', require('./routes/payments'));
    app.use('/api/admin', require('./routes/admin'));
    app.use('/api/notifications', require('./routes/notifications'));
    app.use('/api/medical-records', require('./routes/medicalRecords'));
    app.use('/api/chat', require('./routes/chat'));
    app.use('/api/users', require('./routes/users'));

    httpServer.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Stop the existing server process or run with a different PORT.`);
        process.exit(1);
      }

      logger.error('Server listen error', err.message);
      process.exit(1);
    });

    httpServer.listen(PORT, () => {
      logger.info('MediCare Pro API is online');
      logger.info(`Server listening on port ${PORT}`);
      logger.info('Realtime notifications ready');
      logger.info(`CORS origins allowed: ${allowedOrigins.join(', ')}`);
    });
  } catch (err) {
    logger.error('Server startup failed', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = { app, io };
