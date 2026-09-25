/**
 * NSGP Cross-Field Validation Engine
 * Validates relationships between multiple form fields
 */
const CrossFieldValidation = (() => {
    /**
     * Run all cross-field rules against form data
     * @param {Object} formData - All form field values keyed by field ID
     * @param {Object} ocrData - OCR-extracted data if available
     * @returns {Array} Array of validation results
     */
    function validate(formData, ocrData) {
        const results = [];

        // Rule: DOB ↔ Age consistency
        if (formData.dob && formData.age) {
            const calculatedAge = ValidationEngine.calculateAge(formData.dob);
            const enteredAge = parseInt(formData.age);
            if (calculatedAge !== null && !isNaN(enteredAge) && Math.abs(calculatedAge - enteredAge) > 1) {
                results.push({
                    severity: 'warning',
                    field: 'age',
                    relatedField: 'dob',
                    message: I18n.t('validation.age.mismatch', {
                        calculated: calculatedAge,
                        entered: enteredAge
                    }),
                    suggestedFix: calculatedAge.toString(),
                    fixableAutomatically: true,
                    fixField: 'age'
                });
            }
        }

        // Rule: PIN ↔ State consistency
        if (formData.pin && formData.state) {
            const pinNum = parseInt(formData.pin);
            const stateRange = ValidationEngine.STATE_PIN_RANGES[formData.state];
            if (stateRange && !isNaN(pinNum) && (pinNum < stateRange[0] || pinNum > stateRange[1])) {
                results.push({
                    severity: 'warning',
                    field: 'pin',
                    relatedField: 'state',
                    message: I18n.t('validation.pin.state'),
                    suggestedFix: null,
                    fixableAutomatically: false
                });
            }
        }

        // Rule: Name ↔ Document name consistency
        if (ocrData && ocrData.name && formData.fullName) {
            const formName = formData.fullName.trim().toLowerCase();
            const docName = ocrData.name.trim().toLowerCase();
            if (formName && docName && formName !== docName) {
                // Check if one contains the other (partial match)
                const isPartialMatch = formName.includes(docName) || docName.includes(formName);
                results.push({
                    severity: isPartialMatch ? 'info' : 'warning',
                    field: 'fullName',
                    relatedField: 'document',
                    message: I18n.t('validation.name.mismatch', {
                        formName: formData.fullName,
                        docName: ocrData.name
                    }),
                    suggestedFix: ocrData.name,
                    fixableAutomatically: true,
                    fixField: 'fullName',
                    isDocMismatch: true
                });
            }
        }

        // Rule: DOB ↔ Document DOB
        if (ocrData && ocrData.dob && formData.dob) {
            const formDob = formData.dob;
            const docDob = ocrData.dob;
            if (formDob !== docDob) {
                results.push({
                    severity: 'warning',
                    field: 'dob',
                    relatedField: 'document',
                    message: `Date of Birth may not match the document. Form: "${formDob}", Document: "${docDob}".`,
                    suggestedFix: docDob,
                    fixableAutomatically: true,
                    fixField: 'dob',
                    isDocMismatch: true
                });
            }
        }

        // Rule: Address ↔ Document address
        if (ocrData && ocrData.address && formData.address) {
            const formAddr = formData.address.trim().toLowerCase().replace(/\s+/g, ' ');
            const docAddr = ocrData.address.trim().toLowerCase().replace(/\s+/g, ' ');
            if (formAddr && docAddr && formAddr !== docAddr) {
                const similarity = calculateSimilarity(formAddr, docAddr);
                if (similarity < 0.5) {
                    results.push({
                        severity: 'info',
                        field: 'address',
                        relatedField: 'document',
                        message: `Address may differ from the document. Please verify.`,
                        suggestedFix: ocrData.address,
                        fixableAutomatically: true,
                        fixField: 'address',
                        isDocMismatch: true
                    });
                }
            }
        }

        // Rule: Father's name ↔ document
        if (ocrData && ocrData.fatherName && formData.fatherName) {
            const formVal = formData.fatherName.trim().toLowerCase();
            const docVal = ocrData.fatherName.trim().toLowerCase();
            if (formVal && docVal && formVal !== docVal) {
                results.push({
                    severity: 'warning',
                    field: 'fatherName',
                    relatedField: 'document',
                    message: `Father's/Mother's name may not match the document.`,
                    suggestedFix: ocrData.fatherName,
                    fixableAutomatically: true,
                    fixField: 'fatherName',
                    isDocMismatch: true
                });
            }
        }

        return results;
    }

    /**
     * Simple string similarity (Jaccard on bigrams)
     */
    function calculateSimilarity(a, b) {
        if (!a || !b) return 0;
        const bigramsA = new Set();
        const bigramsB = new Set();
        for (let i = 0; i < a.length - 1; i++) bigramsA.add(a.substring(i, i + 2));
        for (let i = 0; i < b.length - 1; i++) bigramsB.add(b.substring(i, i + 2));
        let intersection = 0;
        bigramsA.forEach(bg => { if (bigramsB.has(bg)) intersection++; });
        return intersection / (bigramsA.size + bigramsB.size - intersection);
    }

    return { validate, calculateSimilarity };
})();
