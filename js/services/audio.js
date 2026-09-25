/**
 * NSGP Audio Service
 * Text-to-Speech with multilingual support
 */
const AudioService = (() => {
    let currentUtterance = null;
    let isSpeaking = false;

    /**
     * Speak text in the currently selected language
     */
    function speak(text, onEnd) {
        if (!('speechSynthesis' in window)) {
            NotificationService.show(I18n.t('error.speechNotSupported'), 'warning');
            return false;
        }

        // Stop any current speech
        stop();

        const utterance = new SpeechSynthesisUtterance(text);
        const langCode = I18n.getSpeechCode();
        utterance.lang = langCode;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to find a matching voice
        const voices = speechSynthesis.getVoices();
        const matchingVoice = voices.find(v => v.lang === langCode)
            || voices.find(v => v.lang.startsWith(langCode.split('-')[0]))
            || voices.find(v => v.lang.startsWith('en'));

        if (matchingVoice) {
            utterance.voice = matchingVoice;
        }

        utterance.onstart = () => {
            isSpeaking = true;
        };

        utterance.onend = () => {
            isSpeaking = false;
            currentUtterance = null;
            if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
            isSpeaking = false;
            currentUtterance = null;
            if (e.error !== 'interrupted') {
                console.warn('Speech synthesis error:', e.error);
            }
            if (onEnd) onEnd();
        };

        currentUtterance = utterance;
        speechSynthesis.speak(utterance);
        return true;
    }

    function stop() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        isSpeaking = false;
        currentUtterance = null;
    }

    function getIsSpeaking() {
        return isSpeaking;
    }

    /**
     * Get the audio instruction text for a field
     */
    function getFieldInstruction(fieldId) {
        // Map field IDs to audio instruction keys
        const audioKeyMap = {
            'fullName': 'audio.fullName',
            'fatherName': 'audio.fatherName',
            'dob': 'audio.dob',
            'age': 'audio.age',
            'gender': 'audio.gender',
            'mobile': 'audio.mobile',
            'email': 'audio.email',
            'address': 'audio.address',
            'state': 'audio.state',
            'district': 'audio.district',
            'pin': 'audio.pin',
            'aadhaar': 'audio.aadhaar',
            'annualIncome': 'audio.income',
            'incomeSource': 'audio.incomeSource',
            'duration': 'audio.duration',
            'occupation': 'audio.occupation',
        };

        const key = audioKeyMap[fieldId];
        if (key) {
            return I18n.t(key);
        }

        // Fallback: generate generic instruction from label
        return null;
    }

    // Preload voices when available
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = () => {
            speechSynthesis.getVoices();
        };
        // Initial load
        speechSynthesis.getVoices();
    }

    return { speak, stop, getIsSpeaking, getFieldInstruction };
})();
