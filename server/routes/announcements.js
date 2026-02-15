import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Middleware: Auth required
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  next();
};

/**
 * GET /api/announcements - Alle Meldungen/News
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [announcements] = await connection.query(
      `SELECT id, title, content, easy_language_content, is_important, posted_at 
       FROM announcements 
       ORDER BY is_important DESC, posted_at DESC`
    );

    connection.release();
    res.json(announcements);
  } catch (error) {
    console.error('Fehler beim Abrufen Meldungen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Meldungen' });
  }
});

/**
 * POST /api/announcements - Meldung erstellen (nur Admin)
 */
router.post('/', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const { title, content, easy_language_content, is_important } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Titel und Inhalt erforderlich' });
  }

  try {
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO announcements (title, content, easy_language_content, is_important, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, content, easy_language_content || content, is_important || false, req.session.user.id]
    );

    connection.release();
    res.json({ success: true, message: 'Meldung erstellt' });
  } catch (error) {
    console.error('Fehler beim Erstellen Meldung:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen' });
  }
});

export default router;
