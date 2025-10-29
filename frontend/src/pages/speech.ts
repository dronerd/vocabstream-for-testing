// src/utils/speech.ts
let englishVoice: SpeechSynthesisVoice | null = null;

// Load voices (needed for iOS Safari and others)
function initVoices() {
  const voices = window.speechSynthesis.getVoices();
  englishVoice = voices.find(v => v.lang.startsWith("en")) || null;
}

if (typeof window !== "undefined") {
  window.speechSynthesis.onvoiceschanged = initVoices;
  initVoices();
}

/**
 * Speaks the given text in English using the Web Speech API.
 * This ensures correct pronunciation even on iPhone.
 */
export function speakEnglish(text: string) {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (englishVoice) utterance.voice = englishVoice;

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Speech synthesis failed:", e);
  }
}
