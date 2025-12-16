
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const router = express.Router();
const saltRounds = 10;

// Passport Google OAuth20 Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await db('users').where({ google_id: profile.id }).first();
        if (user) {
            return done(null, user);
        }
        
        // If no user with google_id, check if one exists with that email
        user = await db('users').where({ email: profile.emails[0].value }).first();
        
        if (user) {
            // Link Google ID to existing account
            await db('users').where({ id: user.id }).update({ google_id: profile.id });
            return done(null, user);
        }

        // If no user exists at all, create a new one
        await db.transaction(async (trx) => {
            const [newUser] = await trx('users').insert({
                name: profile.displayName,
                email: profile.emails[0].value,
                google_id: profile.id,
                role: 'student' // All new signups are students
            }).returning('*');
            
            await trx('student_profiles').insert({
                user_id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                skills: '[]'
            });

            user = newUser;
        });

        return done(null, user);

    } catch (error) {
        return done(error, null);
    }
  }
));

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, saltRounds);

    let newUser = null;

    // Transaction (NO response inside)
    await db.transaction(async (trx) => {
      const [id] = await trx('users').insert({
        name,
        email,
        password_hash: passwordHash,
        role: 'student'
      });

      newUser = await trx('users').where({ id }).first();

      await trx('student_profiles').insert({
        user_id: id,
        name,
        email,
        skills: '[]'
      });
    });

    // Send response AFTER transaction finishes
    const token = jwt.sign(
      { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({ token });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
});



// POST /api/auth/login
// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await db('users').where({ email }).first();
    if (!user || !user.password_hash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


// GET /api/auth/google - Initiates Google Login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GET /api/auth/google/callback - Callback URL after Google auth
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const user = req.user;
    const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );
    // Redirect to a frontend page with the token
    res.redirect(`http://localhost:5173/#/auth/callback?token=${token}`);
  }
);


module.exports = router;
