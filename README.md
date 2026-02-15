# Oberlinhaus Werkstatt Portal

🏗️ Barrierefreies Web-Portal für Werkstatt-Mitarbeiter des Oberlinhaus

## Schnellstart

### Voraussetzungen
- Node.js 16+
- MySQL (lokal oder online)

### Installation

1. **Repository klonen & Dependencies installieren**
```bash
npm install
```

2. **.env Datei erstellen** (basierend auf `.env.example`)
```bash
cp .env.example .env
# Dann .env mit deinen MySQL-Daten anpassen
```

3. **Datenbank initialisieren**
```bash
npm run db:init
```

4. **Server starten**
```bash
npm run dev  # mit Nodemon (für Entwicklung)
# oder
npm start    # Produktion
```

5. **Im Browser öffnen**
```
http://localhost:3000
```

**Demo-Login:**
- Benutzername: `admin`
- PIN: `0000`

---

## Features

✅ **12 Funktionsbereiche**
- 🍽️ Speiseplan
- ⏰ Öffnungszeiten
- 📞 Ansprechpartner
- 📝 Anwesenheit
- 🗳️ Umfragen
- 🎯 Angebote
- 🎓 Weiterbildungen
- 🚌 Fahrkarten
- 📄 Lebenslauf/Dokumente
- 🗺️ Fahrpläne
- 💼 Jobbörse
- 📢 Meldungen

✅ **Barrierefreiheit (WCAG 2.1)**
- 🔊 Text-to-Speech (Vorlesen auf Deutsch)
- 🔤 Schriftgröße anpassbar (3 Stufen)
- 🔤 Leichte Sprache (vereinfachte Texte)
- ⌨️ Vollständige Tastatur-Navigation
- 👟 Touch-freundliche Buttons (44x44px)
- 🎨 Hoher Kontrast (WCAG AA+)
- ♿ Semantisches HTML + ARIA-Labels

✅ **Login-System**
- PIN-Code Authentifizierung (4 Ziffern)
- Email + Passwort Alternative
- 3 Benutzerrollen: Mitarbeiter, Betreuer, Admin

✅ **Datenbank**
- MySQL-basiert
- Sichere Passwort-Hashing (bcryptjs)
- Datei-Upload mit Größenlimit (5 MB)

✅ **Corporate Design**
- Oberlinhaus Farben: ROT (#b61b3e), GOLD (#a98b6c), SAND (#efdec5)
- Responsive Design: Mobil (1 Spalte), Tablet (2), Desktop (3-4 Spalten)
- Kacheln mit goldenem Akzent-Balken

---

## Projekt-Struktur

```
oberlin-webseite/
├── server/
│   ├── app.js                 # Express-Server Entry Point
│   ├── config/
│   │   ├── database.js        # MySQL Pool-Konfiguration
│   │   └── initDB.js          # Datenbank-Initialisierung
│   └── routes/
│       ├── auth.js            # Login/Logout
│       ├── mealPlans.js       # Speiseplan
│       ├── attendance.js       # Anwesenheit
│       ├── surveys.js         # Umfragen
│       ├── offers.js          # Angebote
│       ├── trainings.js       # Kurse
│       ├── tickets.js         # Fahrkarten
│       ├── documents.js       # Dokumente
│       ├── jobs.js            # Jobbörse
│       ├── announcements.js   # Meldungen
│       ├── openingHours.js    # Öffnungszeiten
│       └── contacts.js        # Ansprechpartner
├── public/
│   ├── index.html             # Login-Seite
│   ├── dashboard.html         # Dashboard/Übersicht
│   ├── meal-plans.html        # Speiseplan
│   ├── attendance.html        # Anwesenheit
│   ├── surveys.html           # Umfragen
│   ├── offers.html            # Angebote
│   ├── trainings.html         # Kurse
│   ├── tickets.html           # Fahrkarten
│   ├── documents.html         # Dokumente
│   ├── jobs.html              # Jobbörse
│   ├── announcements.html     # Meldungen
│   ├── css/
│   │   └── style.css          # Globale Styles (Corporate Design)
│   └── js/
│       ├── app.js             # Haupt-JavaScript
│       ├── accessibility.js   # Text-to-Speech
│       └── easy-language.js   # Leichte Sprache
├── .env                       # Umgebungsvariablen
├── .env.example               # Vorlage für .env
├── .gitignore                 # Git-Ignore Datei
├── package.json               # Dependencies
└── README.md                  # Diese Datei
```

---

## API-Endpoints

### Authentifizierung
- `POST /api/auth/login-pin` - Mit PIN anmelden
- `POST /api/auth/login` - Mit Email/Passwort anmelden
- `POST /api/auth/logout` - Abmelden
- `GET /api/auth/me` - Aktuelle Benutzer-Info

### Speiseplan
- `GET /api/meal-plans` - Alle Speisepläne
- `POST /api/meal-plans` - Speiseplan erstellen (nur Admin)

### Anwesenheit
- `GET /api/attendance/me` - Meine Einträge
- `POST /api/attendance` - Eintrag hinzufügen
- `GET /api/attendance/all` - Alle (Betreuer/Admin)

### Umfragen
- `GET /api/surveys` - Alle Umfragen
- `POST /api/surveys/:surveyId/answer` - Abstimmen
- `GET /api/surveys/:surveyId/results` - Ergebnisse

### Weitere Endpoints
- `/api/offers` - Freizeitangebote
- `/api/trainings` - Weiterbildungen
- `/api/tickets` - Fahrkarten
- `/api/documents` - Dokumente
- `/api/jobs` - Job-Angebote
- `/api/announcements` - Meldungen
- `/api/opening-hours` - Öffnungszeiten
- `/api/contacts` - Ansprechpartner

---

## Für GitHub & Railway Deployment

### GitHub
1. Repo erstellen: `oberlin-webseite`
2. Dateien hochladen:
```bash
git add .
git commit -m "Initial commit: Oberlinhaus Portal MVP"
git push origin main
```

### Railway Deployment

1. **Railway.app Konto erstellen** (kostenlos)
2. **Repo verbinden**
3. **Umgebungsvariablen setzen:**
   - `DB_HOST` - Railway MySQL Host
   - `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `NODE_ENV=production`
   - `SESSION_SECRET` - Zufällig generiert
4. **Deploy!**

Die MySQL-Datenbank wird automatisch initialisiert bei der ersten Verbindung.

---

## Sicherheitshinweise

⚠️ **Vor Produktion:**

1. `.env` Datei **NICHT** ins Github commiten (nutze `.gitignore`)
2. `SESSION_SECRET` neu generieren:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
3. HTTPS aktivieren (Railway tut das automatisch)
4. SQL Injection Protection: Alle Queries nutzen Prepared Statements ✅
5. CORS nur für vertrauenswürdige Domains
6. File-Uploads: Nur PDF und Bilder, max 5 MB
7. Passwörter mit bcryptjs gehashed ✅

---

## Barrierefreiheit Checkliste

- ✅ WCAG 2.1 Level AA konforme HTML-Struktur
- ✅ ARIA-Labels auf allen Buttons
- ✅ Keyboard Navigation (Tab, Enter, Escape)
- ✅ Focus-Indikatoren (3px roter Outline)
- ✅ Text-to-Speech auf Deutsch
- ✅ Schriftgröße: 3 Stufen (100%, 125%, 150%)
- ✅ Farb-Kontrast: 4.5:1 (AA Standard)
- ✅ Touch-freundlich: Buttons mind. 44x44px
- ✅ Responsive: 1, 2, 3-4 Spalten Layouts
- ✅ Keine Blinking/Flashing Animationen
- ✅ Alt-Text für Bilder
- ✅ Skip-to-Main Link

---

## Tech-Stack

- **Backend:** Node.js + Express.js
- **Datenbank:** MySQL
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Security:** bcryptjs, helmet, express-validator
- **File Upload:** multer
- **Authentifizierung:** express-session

---

## Aufbauen auf MVP

Später hinzufügen können:
- 📊 Admin-Statistiken & Reports
- 📧 Email-Benachrichtigungen
- 📱 Mobile App
- 🔔 Push-Notifications
- 📷 Foto-Upload für Profile
- ⭐ Rating/Feedback-System
- 📅 Kalender-Integration
- 🤖 Automatische Benachrichtigungen

---

## Support & Fragen

Bei Fragen: Dokumentation in `/server/routes/` und `/public/` ansehen.

---

## Lizenz

MIT - Kostenlos nutzbar!

---

**Viel Erfolg mit dem Oberlinhaus Werkstatt Portal! 🎉**
