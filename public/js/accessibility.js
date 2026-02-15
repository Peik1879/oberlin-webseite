/**
 * Accessibility Features: Text-to-Speech (Vorlesen)
 */
class TextToSpeech {
  constructor() {
    this.isActive = localStorage.getItem('textToSpeech') === 'true';
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
  }

  /**
   * Text vorlesen
   */
  speak(text, priority = 'normal') {
    if (!this.isActive) return;

    // Aktuelle Aussprache abbrechen
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9; // Langsamer sprechen
    utterance.pitch = 1;
    utterance.volume = 1;

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Für Screen Reader & Ankündigung
   */
  announceToScreen(message) {
    // ARIA Live Region Update
    const liveRegion = document.getElementById('aria-live-region') || this.createLiveRegion();
    liveRegion.textContent = message;

    // Auch vorlesen
    this.speak(message, 'high');
  }

  createLiveRegion() {
    const region = document.createElement('div');
    region.id = 'aria-live-region';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    document.body.appendChild(region);
    return region;
  }

  stop() {
    this.synth.cancel();
  }

  /**
   * Ganzen Bereich vorlesen
   */
  readElement(element) {
    if (!element) return;
    const text = element.textContent;
    this.speak(text);
  }
}

export default TextToSpeech;
