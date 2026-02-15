import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/opening-hours - Öffnungszeiten abrufen
 */
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [hours] = await connection.query(
      'SELECT id, day_of_week, open_time, close_time, is_closed FROM opening_hours ORDER BY day_of_week'
    );
    const [closedDays] = await connection.query(
      'SELECT date, reason FROM closed_days ORDER BY date'
    );
    connection.release();

    res.json({
      hours,
      closed_days: closedDays
    });
  } catch (error) {
    console.error('Fehler beim Abrufen Öffnungszeiten:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Öffnungszeiten' });
  }
});

/**
 * POST /api/opening-hours - Öffnungszeiten aktualisieren (nur Admin)
 */
router.post('/', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const { day_of_week, open_time, close_time, is_closed } = req.body;

  try {
    const connection = await pool.getConnection();
    
    await connection.query(
      'UPDATE opening_hours SET open_time = ?, close_time = ?, is_closed = ? WHERE day_of_week = ?',
      [open_time, close_time, is_closed || false, day_of_week]
    );

    connection.release();
    res.json({ success: true, message: 'Öffnungszeiten aktualisiert' });
  } catch (error) {
    console.error('Fehler beim Aktualisieren Öffnungszeiten:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren' });
  }
});

export default router;
