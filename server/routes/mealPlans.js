import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

/**
 * GET /api/meal-plans - Speiseplan abrufen
 * Query: ?week=current oder ?date=2024-02-15
 */
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [mealPlans] = await connection.query(
      'SELECT id, day_of_week, main_course, side_dish, dessert, date FROM meal_plans ORDER BY day_of_week'
    );
    connection.release();

    res.json(mealPlans);
  } catch (error) {
    console.error('Fehler beim Abrufen Speiseplan:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen des Speiseplans' });
  }
});

/**
 * POST /api/meal-plans - Speiseplan erstellen/aktualisieren (nur Admin)
 */
router.post('/', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const { day_of_week, main_course, side_dish, dessert, date } = req.body;

  try {
    const connection = await pool.getConnection();
    
    // Check if exists
    const [existing] = await connection.query(
      'SELECT id FROM meal_plans WHERE day_of_week = ? OR date = ?',
      [day_of_week, date]
    );

    if (existing.length > 0) {
      // Update
      await connection.query(
        'UPDATE meal_plans SET main_course = ?, side_dish = ?, dessert = ?, updated_by = ? WHERE id = ?',
        [main_course, side_dish, dessert, req.session.user.id, existing[0].id]
      );
    } else {
      // Insert
      await connection.query(
        'INSERT INTO meal_plans (day_of_week, main_course, side_dish, dessert, date, updated_by) VALUES (?, ?, ?, ?, ?, ?)',
        [day_of_week, main_course, side_dish, dessert, date, req.session.user.id]
      );
    }

    connection.release();
    res.json({ success: true, message: 'Speiseplan gespeichert' });
  } catch (error) {
    console.error('Fehler beim Speichern Speiseplan:', error);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

export default router;
