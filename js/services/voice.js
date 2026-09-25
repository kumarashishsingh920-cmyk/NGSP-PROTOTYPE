/**
 * NSGP Voice Input Service
 * Speech recognition / voice input with multilingual support
 */
const VoiceService = (() => {
    let recognition = null;
    let isListening = false;
    let currentFieldId = null;
    let currentCallback = null;

    function isSupported() {
        return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    }

    function startListening(fieldId, callback, onStateChange) {
        if (!isSupported()) {
            NotificationService.show(I18n.t('error.voiceNotSupported'), 'warning');
            return false;
        }

        // Stop previous
        stopListening();

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = I18n.getSpeechCode();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        currentFieldId = fieldId;
        currentCallback = callback;

        recognition.onstart = () => {
            isListening = true;
            if (onStateChange) onStateChange('listening');
        };

        recognition.onresult = (event) => {
            let transcript = '';
            let isFinal = false;
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    isFinal = true;
                }
            }
            if (callback) {
                callback(transcript, isFinal);
            }
        };

        recognition.onerror = (event) => {
            isListening = false;
            if (onStateChange) onStateChange('error', event.error);
            
            if (event.error === 'not-allowed') {
                NotificationService.show('Microphone permission denied. Please allow microphone access.', 'error');
            } else if (event.error === 'no-speech') {
                NotificationService.show('No speech detected. Please try again.', 'info');
            } else if (event.error === 'language-not-supported') {
                NotificationService.show(I18n.t('error.voiceNotSupported'), 'warning');
            }
        };

        recognition.onend = () => {
            isListening = false;
            if (onStateChange) onStateChange('stopped');
        };

        try {
            recognition.start();
            return true;
        } catch (e) {
            console.warn('Speech recognition start failed:', e);
            return false;
        }
    }

    function stopListening() {
        if (recognition) {
            try {
                recognition.stop();
            } catch (e) { /* ignore */ }
            recognition = null;
        }
        isListening = false;
        currentFieldId = null;
        currentCallback = null;
    }

    function getIsListening() {
        return isListening;
    }

    return { isSupported, startListening, stopListening, getIsListening };
})();
