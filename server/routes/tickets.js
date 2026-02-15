import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../config/database.js';

const router = express.Router();

// Middleware: Auth required
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Nicht authentifiziert' });
  }
  next();
};

// Multer configuration
const uploadDir = 'public/uploads/tickets';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    // Sicherer Dateiname: user_id_timestamp_randomString
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `ticket_${req.session.user.id}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Nur PDF und Bilder (JPG, PNG) erlaubt'));
    }
  }
});

/**
 * GET /api/tickets/me - Meine Fahrkarten
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [tickets] = await connection.query(
      'SELECT id, file_name, month, year, uploaded_at FROM tickets WHERE user_id = ? ORDER BY uploaded_at DESC',
      [req.session.user.id]
    );

    connection.release();
    res.json(tickets);
  } catch (error) {
    console.error('Fehler beim Abrufen Fahrkarten:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Fahrkarten' });
  }
});

/**
 * POST /api/tickets - Fahrkarte hochladen
 */
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Keine Datei hochgeladen' });
  }

  const { month, year } = req.body;

  try {
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO tickets (user_id, file_path, file_name, month, year) VALUES (?, ?, ?, ?, ?)',
      [
        req.session.user.id,
        req.file.path,
        req.file.filename,
        month || null,
        year || null
      ]
    );

    connection.release();
    res.json({ success: true, message: 'Fahrkarte hochgeladen' });
  } catch (error) {
    console.error('Fehler beim Hochladen Fahrkarte:', error);
    // Datei löschen bei Fehler
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Fehler beim Hochladen' });
  }
});

/**
 * DELETE /api/tickets/:ticketId - Fahrkarte löschen
 */
router.delete('/:ticketId', requireAuth, async (req, res) => {
  const { ticketId } = req.params;

  try {
    const connection = await pool.getConnection();

    // Check Ownership
    const [tickets] = await connection.query(
      'SELECT file_path, file_name FROM tickets WHERE id = ? AND user_id = ?',
      [ticketId, req.session.user.id]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ error: 'Fahrkarte nicht gefunden' });
    }

    // Delete from DB
    await connection.query('DELETE FROM tickets WHERE id = ?', [ticketId]);

    // Delete file
    const filePath = tickets[0].file_path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    connection.release();
    res.json({ success: true, message: 'Fahrkarte gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen Fahrkarte:', error);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

/**
 * GET /api/tickets/all - Alle Fahrkarten (nur Admin)
 */
router.get('/all', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  try {
    const connection = await pool.getConnection();

    const [tickets] = await connection.query(
      `SELECT t.id, t.file_name, t.month, t.year, t.uploaded_at, 
              u.firstname, u.lastname, u.username
       FROM tickets t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.uploaded_at DESC`
    );

    connection.release();
    res.json(tickets);
  } catch (error) {
    console.error('Fehler beim Abrufen Fahrkarten:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Fahrkarten' });
  }
});

export default router;
