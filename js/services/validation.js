/**
 * NSGP Validation Engine
 * Reusable field-level validation with correction suggestions
 */
const ValidationEngine = (() => {
    // Common email domain corrections
    const EMAIL_CORRECTIONS = {
        'gmial.com': 'gmail.com', 'gmali.com': 'gmail.com', 'gmaill.com': 'gmail.com',
        'gamil.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com',
        'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.om': 'gmail.com',
        'gmal.com': 'gmail.com', 'gnail.com': 'gmail.com', 'gmaol.com': 'gmail.com',
        'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yhaoo.com': 'yahoo.com',
        'yahoo.co': 'yahoo.com', 'yahoo.con': 'yahoo.com',
        'hotmal.com': 'hotmail.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com',
        'outlok.com': 'outlook.com', 'outllok.com': 'outlook.com',
        'rediffmal.com': 'rediffmail.com', 'redifmail.com': 'rediffmail.com',
    };

    // Indian states for PIN validation
    const STATE_PIN_RANGES = {
        'Delhi': [110001, 110099], 'Haryana': [121001, 136156], 'Punjab': [140001, 160104],
        'Himachal Pradesh': [171001, 177601], 'Jammu & Kashmir': [180001, 194404],
        'Rajasthan': [301001, 345034], 'Uttar Pradesh': [200001, 285223],
        'Bihar': [800001, 855117], 'West Bengal': [700001, 743711],
        'Jharkhand': [813201, 835325], 'Odisha': [751001, 770076],
        'Chhattisgarh': [490001, 497778], 'Madhya Pradesh': [450001, 488448],
        'Gujarat': [360001, 396590], 'Maharashtra': [400001, 445402],
        'Andhra Pradesh': [500001, 535594], 'Telangana': [500001, 509412],
        'Karnataka': [560001, 591346], 'Goa': [403001, 403806],
        'Kerala': [670001, 695615], 'Tamil Nadu': [600001, 643253],
        'Assam': [781001, 788931], 'Meghalaya': [793001, 794115],
        'Manipur': [795001, 795159], 'Mizoram': [796001, 796901],
        'Tripura': [799001, 799290], 'Nagaland': [797001, 798627],
        'Arunachal Pradesh': [790001, 792131], 'Sikkim': [737101, 737139],
        'Uttarakhand': [244001, 263680], 'Chandigarh': [160001, 160101],
        'Puducherry': [605001, 609607], 'Andaman & Nicobar': [744101, 744304],
        'Ladakh': [194101, 194404], 'Lakshadweep': [682551, 682559],
    };

    /**
     * Validate a single field
     * @returns {Array} Array of validation result objects
     */
    function validateField(field, value, formData) {
        const results = [];
        const val = (value || '').toString().trim();

        // Required check
        if (field.required && !val) {
            results.push({
                severity: 'error',
                field: field.id,
                message: I18n.t('validation.required'),
                explanation: '',
                suggestedFix: null,
                fixableAutomatically: false
            });
            return results;
        }

        if (!val) return results;

        // Type-specific validation
        switch (field.validationType || field.type) {
            case 'email':
                results.push(...validateEmail(field.id, val));
                break;
            case 'phone':
            case 'tel':
                results.push(...validatePhone(field.id, val));
                break;
            case 'pin':
                results.push(...validatePIN(field.id, val, formData));
                break;
            case 'date':
                results.push(...validateDate(field.id, val));
                break;
            case 'aadhaar':
                results.push(...validateAadhaar(field.id, val));
                break;
            case 'age':
            case 'number':
                if (field.validationType === 'age') {
                    results.push(...validateAge(field.id, val));
                }
                break;
        }

        // Check for extra spaces
        if (val !== val.replace(/\s+/g, ' ')) {
            results.push({
                severity: 'info',
                field: field.id,
                message: 'Extra spaces detected.',
                suggestedFix: val.replace(/\s+/g, ' '),
                fixableAutomatically: true
            });
        }

        return results;
    }

    function validateEmail(fieldId, val) {
        const results = [];
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(val)) {
            const result = {
                severity: 'error',
                field: fieldId,
                message: I18n.t('validation.email.invalid'),
                suggestedFix: null,
                fixableAutomatically: false
            };

            // Try to suggest correction
            const parts = val.split('@');
            if (parts.length === 2) {
                const domain = parts[1].toLowerCase();
                if (EMAIL_CORRECTIONS[domain]) {
                    const suggestion = parts[0] + '@' + EMAIL_CORRECTIONS[domain];
                    result.suggestedFix = suggestion;
                    result.fixableAutomatically = true;
                    result.message = I18n.t('validation.email.suggestion', { suggestion });
                } else if (!domain.includes('.')) {
                    // Missing dot
                    const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com'];
                    for (const d of commonDomains) {
                        if (d.replace('.', '').startsWith(domain.replace('.', '').substring(0, 4))) {
                            result.suggestedFix = parts[0] + '@' + d;
                            result.fixableAutomatically = true;
                            result.message = I18n.t('validation.email.suggestion', { suggestion: result.suggestedFix });
                            break;
                        }
                    }
                }
            }
            results.push(result);
        } else {
            // Check domain for common misspellings even if format is valid
            const parts = val.split('@');
            if (parts.length === 2) {
                const domain = parts[1].toLowerCase();
                if (EMAIL_CORRECTIONS[domain]) {
                    results.push({
                        severity: 'warning',
                        field: fieldId,
                        message: I18n.t('validation.email.suggestion', { suggestion: parts[0] + '@' + EMAIL_CORRECTIONS[domain] }),
                        suggestedFix: parts[0] + '@' + EMAIL_CORRECTIONS[domain],
                        fixableAutomatically: true
                    });
                }
            }
        }
        return results;
    }

    function validatePhone(fieldId, val) {
        const results = [];
        const cleaned = val.replace(/[\s\-\(\)]/g, '');
        const phoneWithCountry = cleaned.replace(/^\+91/, '');
        
        if (!/^\d{10}$/.test(phoneWithCountry)) {
            results.push({
                severity: 'error',
                field: fieldId,
                message: I18n.t('validation.phone.invalid'),
                suggestedFix: phoneWithCountry.length > 10 ? phoneWithCountry.substring(0, 10) : null,
                fixableAutomatically: phoneWithCountry.length > 10
            });
        } else if (!/^[6-9]/.test(phoneWithCountry)) {
            results.push({
                severity: 'warning',
                field: fieldId,
                message: 'Indian mobile numbers typically start with 6, 7, 8, or 9.',
                suggestedFix: null,
                fixableAutomatically: false
            });
        }
        return results;
    }

    function validatePIN(fieldId, val, formData) {
        const results = [];
        const cleaned = val.replace(/\s/g, '');

        if (!/^\d{6}$/.test(cleaned)) {
            results.push({
                severity: 'error',
                field: fieldId,
                message: I18n.t('validation.pin.invalid'),
                suggestedFix: null,
                fixableAutomatically: false
            });
        } else {
            // Check PIN-state consistency if state is provided
            if (formData && formData.state) {
                const pinNum = parseInt(cleaned);
                const stateRange = STATE_PIN_RANGES[formData.state];
                if (stateRange && (pinNum < stateRange[0] || pinNum > stateRange[1])) {
                    results.push({
                        severity: 'warning',
                        field: fieldId,
                        message: I18n.t('validation.pin.state'),
                        suggestedFix: null,
                        fixableAutomatically: false
                    });
                }
            }
        }
        return results;
    }

    function validateDate(fieldId, val) {
        const results = [];
        const date = new Date(val);
        if (isNaN(date.getTime())) {
            results.push({
                severity: 'error',
                field: fieldId,
                message: I18n.t('validation.date.invalid'),
                suggestedFix: null,
                fixableAutomatically: false
            });
        } else if (date > new Date()) {
            results.push({
                severity: 'error',
                field: fieldId,
                message: 'Date cannot be in the future.',
                suggestedFix: null,
                fixableAutomatically: false
            });
        }
        return results;
    }

    function validateAadhaar(fieldId, val) {
        const results = [];
        const cleaned = val.replace(/[\s\-]/g, '');
        if (!/^\d{12}$/.test(cleaned)) {
            results.push({
                severity: 'error',
                field: fieldId,
                message: I18n.t('validation.aadhaar.invalid'),
                suggestedFix: null,
                fixableAutomatically: false
            });
        }
        return results;
    }

    function validateAge(fieldId, val) {
        const results = [];
        const age = parseInt(val);
        if (isNaN(age) || age < 0 || age > 150) {
            results.push({
                severity: 'error',
                field: fieldId,
                message: 'Please enter a valid age.',
                suggestedFix: null,
                fixableAutomatically: false
            });
        }
        return results;
    }

    /**
     * Calculate age from date of birth
     */
    function calculateAge(dob) {
        const birthDate = new Date(dob);
        if (isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    return {
        validateField,
        validateEmail,
        validatePhone,
        validatePIN,
        validateDate,
        validateAadhaar,
        validateAge,
        calculateAge,
        STATE_PIN_RANGES
    };
})();
