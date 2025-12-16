require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');

const authRoutes = require('./routes/auth');
const publicRoutes = require('./routes/public');
const studentRoutes = require('./routes/student');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');

const app = express();

// 🔥 MUST COME BEFORE ROUTES (fixes your OPTIONS loop)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔥 Correct CORS
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
