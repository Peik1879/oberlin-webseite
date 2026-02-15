import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';

const router = express.Router();

// Middleware: Check if user is authenticated
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  next();
};

// Login mit PIN
router.post('/login-pin', [
  body('username').trim().notEmpty(),
  body('pin').trim().isLength({min: 4, max: 4}),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, pin } = req.body;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, username, firstname, lastname, pin, role FROM users WHERE username = ? AND active = TRUE',
      [username]
    );
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Benutzername nicht gefunden' });
    }

    const user = rows[0];

    // PIN vergleichen (einfacher Hash oder Plain-Text für PIN)
    const pinMatch = pin === user.pin || await bcrypt.compare(pin, user.pin);
    
    if (!pinMatch) {
      return res.status(401).json({ error: 'PIN nicht korrekt' });
    }

    // Session erstellen
    req.session.user = {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role
    };

    res.json({
      success: true,
      message: `Willkommen ${user.firstname}!`,
      user: req.session.user
    });
  } catch (error) {
    console.error('Login-Fehler:', error);
    res.status(500).json({ error: 'Fehler beim Login' });
  }
});

// Login mit Email + Passwort
router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT id, username, firstname, lastname, password_hash, role FROM users WHERE email = ? AND active = TRUE',
      [email]
    );
    connection.release();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email nicht gefunden' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Passwort nicht korrekt' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role
    };

    res.json({
      success: true,
      message: `Willkommen ${user.firstname}!`,
      user: req.session.user
    });
  } catch (error) {
    console.error('Login-Fehler:', error);
    res.status(500).json({ error: 'Fehler beim Login' });
  }
});

// Logout
router.post('/logout', requireAuth, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout-Fehler' });
    }
    res.json({ success: true, message: 'Erfolgreich abgemeldet' });
  });
});

// Aktueller Benutzer
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.session.user });
});

export default router;
