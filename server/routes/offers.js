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
 * GET /api/offers - Alle Angebote/Aktivitäten
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [offers] = await connection.query(
      `SELECT o.id, o.title, o.category, o.description, o.time, o.location, 
              c.name as contact_name, c.phone as contact_phone
       FROM offers o
       LEFT JOIN contacts c ON o.contact_person_id = c.id
       ORDER BY o.title`
    );

    // User Favoriten laden
    const [favorites] = await connection.query(
      'SELECT offer_id FROM favorites WHERE user_id = ?',
      [req.session.user.id]
    );

    const favoriteIds = favorites.map(f => f.offer_id);
    const offersWithFavorites = offers.map(offer => ({
      ...offer,
      isFavorite: favoriteIds.includes(offer.id)
    }));

    connection.release();
    res.json(offersWithFavorites);
  } catch (error) {
    console.error('Fehler beim Abrufen Angebote:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Angebote' });
  }
});

/**
 * GET /api/offers/category/:category - Nach Kategorie filtern
 */
router.get('/category/:category', requireAuth, async (req, res) => {
  const { category } = req.params;

  try {
    const connection = await pool.getConnection();

    const [offers] = await connection.query(
      `SELECT o.id, o.title, o.category, o.description, o.time, o.location
       FROM offers o
       WHERE o.category = ?
       ORDER BY o.title`,
      [category]
    );

    connection.release();
    res.json(offers);
  } catch (error) {
    console.error('Fehler beim Abrufen Angebote:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Angebote' });
  }
});

/**
 * POST /api/offers/:offerId/favorite - Zu Favoriten hinzufügen/entfernen
 */
router.post('/:offerId/favorite', requireAuth, async (req, res) => {
  const { offerId } = req.params;
  const { isFavorite } = req.body;

  try {
    const connection = await pool.getConnection();

    if (isFavorite) {
      await connection.query(
        'INSERT IGNORE INTO favorites (user_id, offer_id) VALUES (?, ?)',
        [req.session.user.id, offerId]
      );
    } else {
      await connection.query(
        'DELETE FROM favorites WHERE user_id = ? AND offer_id = ?',
        [req.session.user.id, offerId]
      );
    }

    connection.release();
    res.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Speichern Favorit:', error);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

export default router;
