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
const uploadDir = 'public/uploads/documents';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `doc_${req.session.user.id}_${uniqueSuffix}${path.extname(file.originalname)}`);
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
 * GET /api/documents/me - Meine Dokumente
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [docs] = await connection.query(
      'SELECT id, doc_type, file_name, uploaded_at FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC',
      [req.session.user.id]
    );

    connection.release();
    res.json(docs);
  } catch (error) {
    console.error('Fehler beim Abrufen Dokumente:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Dokumente' });
  }
});

/**
 * POST /api/documents - Dokument hochladen
 */
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Keine Datei hochgeladen' });
  }

  const { doc_type } = req.body;

  if (!['resume', 'certificate', 'reference', 'other'].includes(doc_type)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Ungültiger Dokumenttyp' });
  }

  try {
    const connection = await pool.getConnection();

    await connection.query(
      'INSERT INTO documents (user_id, doc_type, file_path, file_name) VALUES (?, ?, ?, ?)',
      [req.session.user.id, doc_type, req.file.path, req.file.filename]
    );

    connection.release();
    res.json({ success: true, message: 'Dokument hochgeladen' });
  } catch (error) {
    console.error('Fehler beim Hochladen Dokument:', error);
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Fehler beim Hochladen' });
  }
});

/**
 * DELETE /api/documents/:docId - Dokument löschen
 */
router.delete('/:docId', requireAuth, async (req, res) => {
  const { docId } = req.params;

  try {
    const connection = await pool.getConnection();

    const [docs] = await connection.query(
      'SELECT file_path FROM documents WHERE id = ? AND user_id = ?',
      [docId, req.session.user.id]
    );

    if (docs.length === 0) {
      return res.status(404).json({ error: 'Dokument nicht gefunden' });
    }

    await connection.query('DELETE FROM documents WHERE id = ?', [docId]);

    const filePath = docs[0].file_path;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    connection.release();
    res.json({ success: true, message: 'Dokument gelöscht' });
  } catch (error) {
    console.error('Fehler beim Löschen Dokument:', error);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

export default router;
