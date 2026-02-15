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
 * GET /api/attendance/me - Meine Anwesenheit (aktuelle)
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [records] = await connection.query(
      `SELECT id, date, status, notes FROM attendance 
       WHERE user_id = ? 
       ORDER BY date DESC 
       LIMIT 5`,
      [req.session.user.id]
    );
    connection.release();

    res.json(records);
  } catch (error) {
    console.error('Fehler beim Abrufen Anwesenheit:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Anwesenheit' });
  }
});

/**
 * POST /api/attendance - Anwesenheit eintragen
 */
router.post('/', requireAuth, async (req, res) => {
  const { date, status, notes } = req.body;

  if (!date || !status) {
    return res.status(400).json({ error: 'Datum und Status sind erforderlich' });
  }

  try {
    const connection = await pool.getConnection();

    // Check if record exists
    const [existing] = await connection.query(
      'SELECT id FROM attendance WHERE user_id = ? AND date = ?',
      [req.session.user.id, date]
    );

    if (existing.length > 0) {
      // Update
      await connection.query(
        'UPDATE attendance SET status = ?, notes = ? WHERE user_id = ? AND date = ?',
        [status, notes || null, req.session.user.id, date]
      );
    } else {
      // Insert
      await connection.query(
        'INSERT INTO attendance (user_id, date, status, notes) VALUES (?, ?, ?, ?)',
        [req.session.user.id, date, status, notes || null]
      );
    }

    connection.release();
    res.json({ success: true, message: 'Anwesenheit eingetragen' });
  } catch (error) {
    console.error('Fehler beim Eintragen Anwesenheit:', error);
    res.status(500).json({ error: 'Fehler beim Eintragen' });
  }
});

/**
 * GET /api/attendance/all - Alle Anwesenheiten (Betreuer/Admin)
 */
router.get('/all', requireAuth, async (req, res) => {
  if (!['supervisor', 'admin'].includes(req.session.user.role)) {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  try {
    const connection = await pool.getConnection();
    const [records] = await connection.query(
      `SELECT a.id, a.date, a.status, a.notes, u.firstname, u.lastname, u.username
       FROM attendance a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.date DESC`
    );
    connection.release();

    res.json(records);
  } catch (error) {
    console.error('Fehler beim Abrufen Anwesenheit:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Anwesenheit' });
  }
});

export default router;
