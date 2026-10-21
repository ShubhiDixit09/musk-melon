'use client';

/**
 * Speech Recognition and Speech Synthesis helper for MuskMelon
 */

export function speakText(text: string, enabled: boolean = true) {
  if (!enabled || typeof window === 'undefined' || !window.speechSynthesis) return;

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    // Clean watermark or markdown tags for cleaner speech
    const cleanText = text
      .replace(/AI Identity Watermark:.*$/i, '')
      .replace(/\[.*?\]/g, '')
      .replace(/[*_#`]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // Slightly lower pitch for Elon's voice tone

    // Try to pick a natural male English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      (v.name.includes('David') || v.name.includes('Guy') || v.name.includes('George') || v.name.includes('Male') || v.name.includes('English')) && v.lang.startsWith('en')
    ) || voices.find(v => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function createSpeechRecognizer(
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
) {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Speech recognition error');
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}
