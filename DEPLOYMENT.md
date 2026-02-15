# Oberlinhaus Portal - Railway Deployment Guide

## Railway.app Deployment (kostenlos!)

Railway ist eine einfache Plattform zum Deployment von Node.js-Apps mit MySQL-Datenbank.

### Schritt 1: Account erstellen
Gehe zu [railway.app](https://railway.app) und melde dich mit GitHub an.

### Schritt 2: Neues Projekt erstellen
1. "New Project" klicken
2. "GitHub Repo" wählen
3. Das `oberlin-webseite` Repo auswählen
4. Railway deployt automatisch!

### Schritt 3: MySQL Datenbank hinzufügen
1. Im Railway Dashboard: "+ Create Service"
2. "MySQL" wählen
3. Database wird automatisch erstellt

### Schritt 4: Umgebungsvariablen setzen
Railway sollte diese automatisch aus deinem `.env` erkennen, aber überprüfe:
- `DB_HOST` - z.B. `mysql.railway.internal`
- `DB_USER` - z.B. `root`
- `DB_PASSWORD` - wird generiert
- `DB_NAME` - z.B. `oberlinhaus_db`
- `SESSION_SECRET` - Generiere: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `NODE_ENV=production`
- `PORT=3000`

### Schritt 5: Domain einrichten
Railway gibt dir automatisch eine Domain wie:
`oberlin-xyz.railway.app`

Oder verbinde deine eigene Domain!

### Datenbank initialisieren
Nach dem ersten Deploy:
1. Railway Dashboard öffnen
2. MySQL Datenbankverbindung kopieren
3. In Terminal: `mysql -h ... -u root -p < server/config/initDB.sql` (wenn du SQL-Datei hast)
4. Oder direkt in Railway: Deploy mit `npm run db:init`

---

## Alternative: Super Einfach mit Render.com

1. Gehe zu [render.com](https://render.com)
2. "New +" → "Web Service"
3. GitHub Repo verbinden
4. Runtime: Node
5. Build: `npm install`
6. Start: `npm start`
7. Umgebungsvariablen setzen
8. Deployment!

Render hat auch kostenloses MySQL (mit Limitierungen).

---

## Lokale MySQL-Verbindung testen

```bash
mysql -h localhost -u root -p
USE oberlinhaus_db;
SHOW TABLES;
```

---

## Troubleshoot

**"Cannot connect to database"**
- Überprüfe `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `.env`
- Stelle sicher, dass MySQL läuft: `mysql --version`

**"Port already in use"**
- Change `PORT` in `.env`

**"npm ERR! missing script: db:init"**
- Überprüfe `package.json` - `db:init` Script sollte dort sein

---

Happy Deploying! 🚀
