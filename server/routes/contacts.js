import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/contacts - Kontakte/Ansprechpartner abrufen
 */
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [contacts] = await connection.query(
      'SELECT id, name, phone, category, available_from, available_to FROM contacts ORDER BY name'
    );
    connection.release();

    res.json(contacts);
  } catch (error) {
    console.error('Fehler beim Abrufen Kontakte:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Kontakte' });
  }
});

/**
 * GET /api/contacts/category/:category - Nach Kategorie filtern
 */
router.get('/category/:category', async (req, res) => {
  const { category } = req.params;

  try {
    const connection = await pool.getConnection();
    const [contacts] = await connection.query(
      'SELECT id, name, phone, category, available_from, available_to FROM contacts WHERE category = ? ORDER BY name',
      [category]
    );
    connection.release();

    res.json(contacts);
  } catch (error) {
    console.error('Fehler beim Abrufen Kontakte:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Kontakte' });
  }
});

/**
 * POST /api/contacts - Kontakt erstellen (nur Admin)
 */
router.post('/', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const { name, phone, category, available_from, available_to } = req.body;

  try {
    const connection = await pool.getConnection();
    
    await connection.query(
      'INSERT INTO contacts (name, phone, category, available_from, available_to) VALUES (?, ?, ?, ?, ?)',
      [name, phone, category, available_from, available_to]
    );

    connection.release();
    res.json({ success: true, message: 'Kontakt erstellt' });
  } catch (error) {
    console.error('Fehler beim Erstellen Kontakt:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen' });
  }
});

export default router;
