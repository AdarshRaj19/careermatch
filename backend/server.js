require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');

const app = express();

// 🔥 MUST COME BEFORE ROUTES (fixes your OPTIONS loop)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 CORS for local development
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Allow deployed frontends by env var when running in production
    if (process.env.ALLOWED_ORIGINS) {
      const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
      if (envOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    // If no ALLOWED_ORIGINS is set, allow requests from any origin in production.
    // This helps deployed frontend/backends work when env vars are not configured.
    if (!process.env.ALLOWED_ORIGINS) {
      console.warn('WARNING: ALLOWED_ORIGINS is not set. Allowing all origins in production.');
      return callback(null, true);
    }

    return callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options('*', cors());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', api: '/api/public/internships' });
});

// Initialize Passport
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);

// Protected routes
app.use('/api/student', authMiddleware(['student']), studentRoutes);
app.use('/api/admin', authMiddleware(['admin']), adminRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3001;

// Automatically run migrations on startup to ensure tables exist in deployed environments.
db.migrate.latest()
  .then(() => {
    console.log('Database migrations applied successfully.');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to run database migrations:', err);
    process.exit(1);
  });
