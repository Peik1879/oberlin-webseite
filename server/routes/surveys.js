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
 * GET /api/surveys - Alle Umfragen
 */
router.get('/', requireAuth, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [surveys] = await connection.query(
      `SELECT s.id, s.title, s.question, s.easy_language_question, s.active,
              COUNT(DISTINCT so.id) as option_count
       FROM surveys s
       LEFT JOIN survey_options so ON s.id = so.survey_id
       WHERE s.active = TRUE
       GROUP BY s.id
       ORDER BY s.created_at DESC`
    );

    // Für jede Umfrage: Options abrufen + prüfen ob User bereits geantwortet hat
    for (let survey of surveys) {
      const [options] = await connection.query(
        'SELECT id, option_text, option_number FROM survey_options WHERE survey_id = ? ORDER BY option_number',
        [survey.id]
      );

      const [answerRecord] = await connection.query(
        'SELECT id, option_id FROM survey_answers WHERE survey_id = ? AND user_id = ?',
        [survey.id, req.session.user.id]
      );

      survey.options = options;
      survey.userAnswer = answerRecord.length > 0 ? answerRecord[0].option_id : null;
      survey.hasAnswered = answerRecord.length > 0;
    }

    connection.release();
    res.json(surveys);
  } catch (error) {
    console.error('Fehler beim Abrufen Umfragen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Umfragen' });
  }
});

/**
 * POST /api/surveys/:surveyId/answer - Bei Umfrage antworten
 */
router.post('/:surveyId/answer', requireAuth, async (req, res) => {
  const { surveyId } = req.params;
  const { optionId } = req.body;

  if (!optionId) {
    return res.status(400).json({ error: 'Option erforderlich' });
  }

  try {
    const connection = await pool.getConnection();

    // Check: Hat User schon geantwortet?
    const [existing] = await connection.query(
      'SELECT id FROM survey_answers WHERE survey_id = ? AND user_id = ?',
      [surveyId, req.session.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Du hast bereits bei dieser Umfrage abgestimmt' });
    }

    // Answer eintragen
    await connection.query(
      'INSERT INTO survey_answers (survey_id, user_id, option_id) VALUES (?, ?, ?)',
      [surveyId, req.session.user.id, optionId]
    );

    connection.release();
    res.json({ success: true, message: 'Danke für deine Antwort!' });
  } catch (error) {
    console.error('Fehler beim Speichern der Antwort:', error);
    res.status(500).json({ error: 'Fehler beim Speichern' });
  }
});

/**
 * GET /api/surveys/:surveyId/results - Ergebnisse der Umfrage
 */
router.get('/:surveyId/results', async (req, res) => {
  const { surveyId } = req.params;

  try {
    const connection = await pool.getConnection();

    const [options] = await connection.query(
      `SELECT so.id, so.option_text, so.option_number,
              COUNT(sa.id) as answer_count
       FROM survey_options so
       LEFT JOIN survey_answers sa ON so.id = sa.option_id
       WHERE so.survey_id = ?
       GROUP BY so.id
       ORDER BY so.option_number`,
      [surveyId]
    );

    connection.release();
    res.json(options);
  } catch (error) {
    console.error('Fehler beim Abrufen Ergebnisse:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Ergebnisse' });
  }
});

/**
 * POST /api/surveys - Neue Umfrage erstellen (nur Admin)
 */
router.post('/', requireAuth, async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Keine Berechtigung' });
  }

  const { title, question, easyLanguageQuestion, options } = req.body;

  if (!title || !question || !options || options.length < 2) {
    return res.status(400).json({ error: 'Titel, Frage und mindestens 2 Optionen erforderlich' });
  }

  try {
    const connection = await pool.getConnection();

    // Umfrage erstellen
    const [result] = await connection.query(
      'INSERT INTO surveys (title, question, easy_language_question, created_by) VALUES (?, ?, ?, ?)',
      [title, question, easyLanguageQuestion || question, req.session.user.id]
    );

    const surveyId = result.insertId;

    // Options eintragen
    for (let i = 0; i < options.length; i++) {
      await connection.query(
        'INSERT INTO survey_options (survey_id, option_text, option_number) VALUES (?, ?, ?)',
        [surveyId, options[i], i + 1]
      );
    }

    connection.release();
    res.json({ success: true, message: 'Umfrage erstellt', surveyId });
  } catch (error) {
    console.error('Fehler beim Erstellen Umfrage:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen' });
  }
});

export default router;
