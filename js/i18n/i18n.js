/**
 * NSGP Internationalization Engine
 * Manages language selection, translation, and persistence
 */
const I18n = (() => {
    let currentLang = 'en';

    function init() {
        const saved = localStorage.getItem('nsgp-lang');
        if (saved && NSGP_LOCALES[saved]) {
            currentLang = saved;
        }
        document.getElementById('language-selector').value = currentLang;
        applyTranslations();
    }

    function setLanguage(lang) {
        if (!NSGP_LOCALES[lang]) lang = 'en';
        currentLang = lang;
        localStorage.setItem('nsgp-lang', lang);
        document.getElementById('language-selector').value = lang;
        // Set document direction for RTL languages
        const meta = LANGUAGE_META[lang];
        if (meta && meta.dir === 'rtl') {
            document.documentElement.setAttribute('dir', 'rtl');
        } else {
            document.documentElement.setAttribute('dir', 'ltr');
        }
        applyTranslations();
    }

    function t(key, params) {
        let text = (NSGP_LOCALES[currentLang] && NSGP_LOCALES[currentLang][key])
            || (NSGP_LOCALES['en'] && NSGP_LOCALES['en'][key])
            || key;
        if (params) {
            Object.keys(params).forEach(k => {
                text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
            });
        }
        return text;
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translated = t(key);
            if (translated !== key) {
                el.textContent = translated;
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translated = t(key);
            if (translated !== key) {
                el.placeholder = translated;
            }
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            const translated = t(key);
            if (translated !== key) {
                el.setAttribute('aria-label', translated);
            }
        });
    }

    function getLang() {
        return currentLang;
    }

    function getSpeechCode() {
        const meta = LANGUAGE_META[currentLang];
        return meta ? meta.speechCode : 'en-IN';
    }

    return { init, setLanguage, t, getLang, getSpeechCode, applyTranslations };
})();
