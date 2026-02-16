import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'oberlinhaus_db'
  });

  try {
    console.log('🔧 Initialisiere Tabellen...');

    // Tabellen erstellen
    const schema = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        pin VARCHAR(10),
        firstname VARCHAR(100),
        lastname VARCHAR(100),
        role ENUM('employee', 'supervisor', 'admin') DEFAULT 'employee',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        active BOOLEAN DEFAULT TRUE
      );

      -- Meal plans
      CREATE TABLE IF NOT EXISTS meal_plans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        day_of_week INT NOT NULL COMMENT '1=Monday, 7=Sunday',
        main_course VARCHAR(255) NOT NULL,
        side_dish VARCHAR(255),
        dessert VARCHAR(255),
        date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INT,
        FOREIGN KEY (updated_by) REFERENCES users(id)
      );

      -- Opening hours
      CREATE TABLE IF NOT EXISTS opening_hours (
        id INT PRIMARY KEY AUTO_INCREMENT,
        day_of_week INT NOT NULL,
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(day_of_week)
      );

      -- Closed days
      CREATE TABLE IF NOT EXISTS closed_days (
        id INT PRIMARY KEY AUTO_INCREMENT,
        date DATE UNIQUE NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Contact persons
      CREATE TABLE IF NOT EXISTS contacts (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        category VARCHAR(100),
        available_from TIME,
        available_to TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );

      -- Attendance
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        status ENUM('present', 'sick', 'vacation', 'other') DEFAULT 'present',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id, date)
      );

      -- Surveys
      CREATE TABLE IF NOT EXISTS surveys (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        question TEXT NOT NULL,
        easy_language_question TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- Survey options
      CREATE TABLE IF NOT EXISTS survey_options (
        id INT PRIMARY KEY AUTO_INCREMENT,
        survey_id INT NOT NULL,
        option_text VARCHAR(255) NOT NULL,
        option_number INT,
        FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
      );

      -- Survey answers
      CREATE TABLE IF NOT EXISTS survey_answers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        survey_id INT NOT NULL,
        user_id INT NOT NULL,
        option_id INT NOT NULL,
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (survey_id) REFERENCES surveys(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (option_id) REFERENCES survey_options(id),
        UNIQUE(survey_id, user_id)
      );

      -- Offers/Activities
      CREATE TABLE IF NOT EXISTS offers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        time TIME,
        location VARCHAR(255),
        contact_person_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (contact_person_id) REFERENCES contacts(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- User favorites
      CREATE TABLE IF NOT EXISTS favorites (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        offer_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (offer_id) REFERENCES offers(id),
        UNIQUE(user_id, offer_id)
      );

      -- Trainings/Courses
      CREATE TABLE IF NOT EXISTS trainings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        duration_days INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- Training interests
      CREATE TABLE IF NOT EXISTS training_interests (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        training_id INT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (training_id) REFERENCES trainings(id),
        UNIQUE(user_id, training_id)
      );

      -- Tickets
      CREATE TABLE IF NOT EXISTS tickets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        file_path VARCHAR(255),
        file_name VARCHAR(255),
        month INT,
        year INT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Documents (CV, certificates, etc.)
      CREATE TABLE IF NOT EXISTS documents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        doc_type ENUM('resume', 'certificate', 'reference', 'other'),
        file_path VARCHAR(255),
        file_name VARCHAR(255),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Jobs
      CREATE TABLE IF NOT EXISTS jobs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        area VARCHAR(100),
        hours_per_week INT,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- News/Announcements
      CREATE TABLE IF NOT EXISTS announcements (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        easy_language_content TEXT,
        is_important BOOLEAN DEFAULT FALSE,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INT,
        FOREIGN KEY (created_by) REFERENCES users(id)
      );

      -- Accessibility settings
      CREATE TABLE IF NOT EXISTS accessibility_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        font_size ENUM('normal', 'large', 'xlarge') DEFAULT 'normal',
        easy_language BOOLEAN DEFAULT FALSE,
        text_to_speech BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(user_id)
      );

      -- Create indexes for performance
      CREATE INDEX idx_user_username ON users(username);
      CREATE INDEX idx_attendance_user ON attendance(user_id);
      CREATE INDEX idx_attendance_date ON attendance(date);
      CREATE INDEX idx_survey_answers_user ON survey_answers(user_id);
      CREATE INDEX idx_documents_user ON documents(user_id);
      CREATE INDEX idx_tickets_user ON tickets(user_id);
    `;

    const statements = schema.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    console.log('✅ Tabellen erstellt');

    // Demo-Admin erstellen (password: admin123)
    const hashedPassword = '$2a$10$YIjlrPNoS0E0VK0nw5q7/.nQzlW6KwM8q7Z8Q.p0pL9K5U3V2W6bm'; // bcrypt hash
    await connection.query(
      `INSERT IGNORE INTO users (username, email, password_hash, pin, firstname, lastname, role) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin', 'admin@oberlinhaus.de', hashedPassword, '0000', 'Admin', 'Benutzer', 'admin']
    );
    console.log('✅ Demo-Admin erstellt (username: admin, pin: 0000)');

    // Beispiel-Weiterbildungen einfügen
    const trainingsData = [
      ['Computer-Grundkurs für Anfänger', 'Lernen Sie die Basics: E-Mails schreiben, im Internet surfen und Texte schreiben. Keine Vorkenntnisse nötig!', '2026-03-15', 5],
      ['Erste-Hilfe-Kurs', 'Wichtiger Kurs für Notfallsituationen. Sie lernen, wie man anderen Menschen in Not helfen kann.', '2026-03-20', 2],
      ['Bewerbungstraining', 'Wie schreibe ich eine gute Bewerbung? Wie bereite ich mich auf ein Vorstellungsgespräch vor? Wir üben gemeinsam!', '2026-04-10', 3],
      ['Kochen und Ernährung', 'Gesund kochen leicht gemacht! Wir bereiten leckere und gesunde Gerichte zusammen zu.', '2026-04-25', 4],
      ['Kommunikation im Beruf', 'Besser kommunizieren mit Kollegen und Vorgesetzten. Mehr Selbstbewusstsein im Job!', '2026-05-05', 2]
    ];

    for (const training of trainingsData) {
      await connection.query(
        `INSERT INTO trainings (title, description, start_date, duration_days, created_by) 
         VALUES (?, ?, ?, ?, 1)`,
        training
      );
    }
    console.log('✅ Beispiel-Weiterbildungen eingefügt');

    // Kontaktpersonen für Angebote
    const contactsData = [
      ['Frau Schmidt', '030-12345-100', 'Sport', '09:00:00', '16:00:00'],
      ['Herr Müller', '030-12345-101', 'Kultur', '10:00:00', '17:00:00'],
      ['Frau Weber', '030-12345-102', 'Freizeit', '08:00:00', '15:00:00']
    ];

    for (const contact of contactsData) {
      await connection.query(
        `INSERT INTO contacts (name, phone, category, available_from, available_to) 
         VALUES (?, ?, ?, ?, ?)`,
        contact
      );
    }
    console.log('✅ Kontaktpersonen eingefügt');

    // Beispiel-Freizeitangebote einfügen
    const offersData = [
      ['Fußball-Gruppe', 'Sport', 'Jeden Montag spielen wir zusammen Fußball. Für Anfänger und Fortgeschrittene!', '15:00:00', 'Sporthalle', 1],
      ['Kunst-Workshop', 'Kultur', 'Malen, Zeichnen und Basteln. Hier können Sie kreativ sein!', '14:00:00', 'Raum 201', 2],
      ['Chor "Singfreude"', 'Kultur', 'Wir singen gemeinsam bekannte Lieder. Neue Mitglieder sind herzlich willkommen!', '16:30:00', 'Musikraum', 2],
      ['Tischtennis-Treff', 'Sport', 'Jeden Mittwoch Tischtennis spielen. Macht viel Spaß!', '15:30:00', 'Freizeitraum', 1],
      ['Koch-Gruppe', 'Freizeit', 'Zusammen kochen und essen. Wir probieren Rezepte aus aller Welt!', '13:00:00', 'Küche', 3],
      ['Gesellschaftsspiele', 'Freizeit', 'Spielen Sie gerne? Bei uns gibt es viele verschiedene Spiele!', '15:00:00', 'Gemeinschaftsraum', 3],
      ['Yoga für Alle', 'Sport', 'Entspannung und sanfte Bewegungen. Gut für Körper und Geist!', '10:00:00', 'Gymnastikraum', 1],
      ['Theater-Gruppe', 'Kultur', 'Wir proben kleine Theaterstücke und führen sie auf. Machen Sie mit!', '16:00:00', 'Theatersaal', 2]
    ];

    for (const offer of offersData) {
      await connection.query(
        `INSERT INTO offers (title, category, description, time, location, contact_person_id, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        offer
      );
    }
    console.log('✅ Beispiel-Freizeitangebote eingefügt');

    // Beispiel-Jobangebote einfügen
    const jobsData = [
      ['Helfer in der Küche', 'Unterstützung beim Kochen und Vorbereiten von Speisen. Sauber machen nach dem Essen.', 'Küche', 20],
      ['Garten-Helfer', 'Pflanzen gießen, Unkraut jäten und Rasen mähen. Arbeit an der frischen Luft!', 'Garten & Außenbereich', 15],
      ['Wäscherei-Mitarbeiter', 'Wäsche waschen, trocknen und zusammenlegen. Sorgfältige Arbeit ist wichtig.', 'Wäscherei', 25],
      ['Hausmeister-Assistent', 'Kleine Reparaturen und Wartungsarbeiten. Hilfe bei Umzügen und Transport.', 'Hauswirtschaft', 30],
      ['Büro-Helfer', 'Post sortieren, Kopieren und einfache Computer-Arbeiten. Freundlich am Telefon sein.', 'Verwaltung', 20],
      ['Montage-Helfer', 'Kleine Teile zusammenbauen und verpacken. Genaues Arbeiten ist wichtig.', 'Werkstatt', 35],
      ['Reinigungskraft', 'Räume sauber halten: Staubsaugen, Wischen und Aufräumen.', 'Gebäudereinigung', 20]
    ];

    for (const job of jobsData) {
      await connection.query(
        `INSERT INTO jobs (title, description, area, hours_per_week, created_by, active) 
         VALUES (?, ?, ?, ?, 1, TRUE)`,
        job
      );
    }
    console.log('✅ Beispiel-Jobangebote eingefügt');

    console.log('🎉 Datenbank erfolgreich initialisiert!');
  } catch (error) {
    console.error('❌ Fehler beim Initialisieren:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

initDatabase();
