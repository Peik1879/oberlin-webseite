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
 * GET /api/trainings - Alle Weiterbildungen/Kurse
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [trainings] = await connection.query(
      'SELECT id, title, description, start_date, duration_days FROM trainings ORDER BY start_date'
    );

    // Check ob User Interesse angemeldet hat
    const [interests] = await connection.query(
      'SELECT training_id FROM training_interests WHERE user_id = ?',
      [req.session.user.id]
    );

    const interestIds = interests.map(i => i.training_id);
    const trainingsWithStatus = trainings.map(t => ({
      ...t,
      userInterested: interestIds.includes(t.id)
    }));

    connection.release();
    res.json(trainingsWithStatus);
  } catch (error) {
    console.error('Fehler beim Abrufen Trainings:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Trainings' });
  }
});

/**
 * POST /api/trainings/:trainingId/interest - Interesse anmelden
 */
router.post('/:trainingId/interest', requireAuth, async (req, res) => {
  const { trainingId } = req.params;

  try {
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT IGNORE INTO training_interests (user_id, training_id) VALUES (?, ?)',
      [req.session.user.id, trainingId]
    );

    connection.release();
    res.json({ success: true, message: 'Interesse angemeldet' });
  } catch (error) {
    console.error('Fehler beim Anmelden Interesse:', error);
    res.status(500).json({ error: 'Fehler beim Anmelden' });
  }
});

export default router;
