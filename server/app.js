import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import mealPlansRoutes from './routes/mealPlans.js';
import openingHoursRoutes from './routes/openingHours.js';
import contactsRoutes from './routes/contacts.js';
import attendanceRoutes from './routes/attendance.js';
import surveysRoutes from './routes/surveys.js';
import offersRoutes from './routes/offers.js';
import trainingsRoutes from './routes/trainings.js';
import ticketsRoutes from './routes/tickets.js';
import documentsRoutes from './routes/documents.js';
import jobsRoutes from './routes/jobs.js';
import announcementsRoutes from './routes/announcements.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Sicherheit mit angepasstem CSP für inline scripts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? ['https://yourdomain.com'] : '*',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'development-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 Stunden
  }
}));

// Middleware: Benutzer in res.locals verfügbar machen
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.isAuthenticated = !!req.session.user;
  next();
});

// Landing Page
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/dashboard');
  } else {
    res.sendFile(path.join(__dirname, '../views/index.html'));
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meal-plans', mealPlansRoutes);
app.use('/api/opening-hours', openingHoursRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/surveys', surveysRoutes);
app.use('/api/offers', offersRoutes);
app.use('/api/trainings', trainingsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/announcements', announcementsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Ein Fehler ist aufgetreten' : err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server läuft auf Port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
