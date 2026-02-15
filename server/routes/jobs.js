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
 * GET /api/jobs - Alle Job-Angebote
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [jobs] = await connection.query(
      'SELECT id, title, description, area, hours_per_week, posted_at FROM jobs WHERE active = TRUE ORDER BY posted_at DESC'
    );

    connection.release();
    res.json(jobs);
  } catch (error) {
    console.error('Fehler beim Abrufen Jobs:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Jobs' });
  }
});

/**
 * GET /api/jobs/:jobId - Details eines Job-Angebots
 */
router.get('/:jobId', requireAuth, async (req, res) => {
  const { jobId } = req.params;

  try {
    const connection = await pool.getConnection();

    const [jobs] = await connection.query(
      'SELECT id, title, description, area, hours_per_week, posted_at FROM jobs WHERE id = ? AND active = TRUE',
      [jobId]
    );

    connection.release();

    if (jobs.length === 0) {
      return res.status(404).json({ error: 'Job nicht gefunden' });
    }

    res.json(jobs[0]);
  } catch (error) {
    console.error('Fehler beim Abrufen Job:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Jobs' });
  }
});

/**
 * POST /api/jobs - Job erstellen (nur Admin)
 */
router.post('/', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const { title, description, area, hours_per_week } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: 'Titel und Beschreibung erforderlich' });
  }

  try {
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO jobs (title, description, area, hours_per_week, created_by) VALUES (?, ?, ?, ?, ?)',
      [title, description, area || null, hours_per_week || null, req.session.user.id]
    );

    connection.release();
    res.json({ success: true, message: 'Job-Angebot erstellt' });
  } catch (error) {
    console.error('Fehler beim Erstellen Job:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen' });
  }
});

export default router;
