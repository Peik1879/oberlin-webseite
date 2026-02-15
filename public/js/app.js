import EasyLanguageTranslations from './easy-language.js';
import TextToSpeech from './accessibility.js';

class OberlinApp {
  constructor() {
    this.user = null;
    this.easyLanguage = new EasyLanguageTranslations();
    this.tts = new TextToSpeech();
    this.init();
  }

  async init() {
    // Check ob eingeloggt
    await this.checkAuth();
    
    // Event Listener setup
    this.setupAccessibilityButtons();
    this.setupNavigationEvents();
    this.loadFontSizePreference();
    this.loadEasyLanguagePreference();
  }

  async checkAuth() {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        this.user = data.user;
        this.updateHeader();
        this.loadMainContent();
      } else {
        this.redirectToLogin();
      }
    } catch (error) {
      console.error('Auth error:', error);
      this.redirectToLogin();
    }
  }

  redirectToLogin() {
    window.location.href = '/';
  }

  updateHeader() {
    const userEl = document.querySelector('.header-user');
    if (userEl && this.user) {
      userEl.innerHTML = `
        <span>${this.user.firstname} ${this.user.lastname}</span>
        <button class="btn btn-secondary" id="logout-btn">Abmelden</button>
      `;
      document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    }
  }

  async logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }

  setupAccessibilityButtons() {
    // Schriftgröße
    const fontBtn = document.getElementById('font-size-btn');
    if (fontBtn) {
      fontBtn.addEventListener('click', () => this.toggleFontSize());
      fontBtn.setAttribute('aria-label', 'Schriftgröße ändern');
    }

    // Vorlesen
    const ttsBtn = document.getElementById('text-to-speech-btn');
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => this.toggleTextToSpeech());
      ttsBtn.setAttribute('aria-label', 'Vorlesen an/aus');
    }

    // Leichte Sprache
    const easyLangBtn = document.getElementById('easy-language-btn');
    if (easyLangBtn) {
      easyLangBtn.addEventListener('click', () => this.toggleEasyLanguage());
      easyLangBtn.setAttribute('aria-label', 'Leichte Sprache an/aus');
    }
  }

  toggleFontSize() {
    const html = document.documentElement;
    const currentSize = html.className;

    let newSize = '';
    if (currentSize === '') {
      newSize = 'font-large';
    } else if (currentSize === 'font-large') {
      newSize = 'font-xlarge';
    } else {
      newSize = '';
    }

    html.className = newSize;
    localStorage.setItem('fontSize', newSize);
    this.tts.announceToScreen('Schriftgröße geändert');
  }

  toggleTextToSpeech() {
    const isActive = this.tts.isActive;
    this.tts.isActive = !isActive;
    localStorage.setItem('textToSpeech', !isActive);

    const btn = document.getElementById('text-to-speech-btn');
    if (btn) {
      btn.setAttribute('aria-pressed', !isActive);
      this.tts.announceToScreen(
        !isActive ? 'Vorlesen aktiviert' : 'Vorlesen deaktiviert'
      );
    }
  }

  toggleEasyLanguage() {
    const isActive = document.documentElement.getAttribute('data-easy-language') === 'true';
    const newState = !isActive;

    document.documentElement.setAttribute('data-easy-language', newState);
    localStorage.setItem('easyLanguage', newState);

    this.easyLanguage.updateAllText();

    const btn = document.getElementById('easy-language-btn');
    if (btn) {
      btn.setAttribute('aria-pressed', newState);
      this.tts.announceToScreen(
        newState ? 'Leichte Sprache aktiviert' : 'Leichte Sprache deaktiviert'
      );
    }
  }

  loadFontSizePreference() {
    const savedSize = localStorage.getItem('fontSize');
    if (savedSize) {
      document.documentElement.className = savedSize;
    }
  }

  loadEasyLanguagePreference() {
    const savedPref = localStorage.getItem('easyLanguage');
    if (savedPref === 'true') {
      document.documentElement.setAttribute('data-easy-language', 'true');
      this.easyLanguage.updateAllText();
    }
  }

  setupNavigationEvents() {
    // Navigation bei Tastatur
    document.addEventListener('keydown', (e) => {
      // Alt + H = Home
      if (e.altKey && e.key === 'h') {
        window.location.href = '/dashboard';
      }
      // Escape = Modals schließen
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal:not(.hidden)');
        if (modal) {
          modal.classList.add('hidden');
        }
      }
    });
  }

  loadMainContent() {
    // Wird von jeweiligen Seiten überschrieben
  }

  // API Helper
  async apiCall(method, endpoint, data = null) {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(endpoint, options);
      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Ein Fehler ist aufgetreten');
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

// Initialisierung
window.app = new OberlinApp();
