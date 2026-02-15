/**
 * Leichte Sprache Übersetzungen
 * "normal" → "leicht"
 */
class EasyLanguageTranslations {
  constructor() {
    this.translations = {
      'Abmelden': 'Abmelden',
      'Speiseplan': 'Was gibt es zu essen?',
      'Öffnungszeiten': 'Wann ist offen?',
      'Ansprechpartner': 'Wen kann ich anrufen?',
      'Anwesenheit': 'Ich bin da oder nicht da',
      'Umfragen': 'Abstimmung',
      'Angebote': 'Was kann ich machen?',
      'Weiterbildungen': 'Kurse',
      'Fahrkarten': 'Meine Tickets',
      'Lebenslauf': 'Meine Dokumente',
      'Fahrpläne': 'Wie komme ich hin?',
      'Jobbörse': 'Freie Stellen',
      'Meldungen': 'Nachrichten',
      'Einloggen': 'Anmelden',
      'Benutzer': 'Name',
      'Passwort': 'Passwort',
      'PIN': 'PIN-Code (4 Ziffern)',
      'Senden': 'OK',
      'Speichern': 'Speichern',
      'Löschen': 'Weg',
      'Bearbeiten': 'Ändern',
      'Zurück': 'Zurück',
      'Weiter': 'Weiter',
      'Fehler': 'Fehler',
      'Erfolg': 'Geschafft!',
      'Laden': 'Wird geladen...',
    };
  }

  /**
   * Text übersetzen wenn Leichte Sprache aktiv
   */
  translate(text) {
    const isEasyLanguageActive = document.documentElement.getAttribute('data-easy-language') === 'true';
    
    if (!isEasyLanguageActive) {
      return text;
    }

    return this.translations[text] || text;
  }

  /**
   * Alle Texte auf der Seite übersetzen
   */
  updateAllText() {
    const elements = document.querySelectorAll('[data-easy-text]');
    elements.forEach(el => {
      const normalText = el.getAttribute('data-normal-text');
      const easyText = el.getAttribute('data-easy-text');

      const isActive = document.documentElement.getAttribute('data-easy-language') === 'true';
      el.textContent = isActive ? easyText : normalText;
    });

    // Auch normale Inhalte übersetzen basierend auf Daten-Attribut
    this.updateButtonLabels();
    this.updateHeadings();
  }

  updateButtonLabels() {
    document.querySelectorAll('button, a.btn').forEach(btn => {
      const isEasyLanguageActive = document.documentElement.getAttribute('data-easy-language') === 'true';
      
      if (isEasyLanguageActive && btn.hasAttribute('data-easy-label')) {
        btn.setAttribute('aria-label', btn.getAttribute('data-easy-label'));
      } else if (btn.hasAttribute('data-normal-label')) {
        btn.setAttribute('aria-label', btn.getAttribute('data-normal-label'));
      }
    });
  }

  updateHeadings() {
    // Headings bleiben meist gleich, aber können auch übersetzt werden
    document.querySelectorAll('h1, h2, h3').forEach(heading => {
      const isActive = document.documentElement.getAttribute('data-easy-language') === 'true';
      
      if (isActive && heading.getAttribute('data-easy-heading')) {
        heading.textContent = heading.getAttribute('data-easy-heading');
      } else if (heading.getAttribute('data-normal-heading')) {
        heading.textContent = heading.getAttribute('data-normal-heading');
      }
    });
  }
}

export default EasyLanguageTranslations;
