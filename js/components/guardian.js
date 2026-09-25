/**
 * NSGP Pre-Submission Guardian
 * Final validation and readiness scoring engine
 */
const Guardian = (() => {
    /**
     * Run full pre-submission validation
     */
    function runGuardian(formDef, formData, ocrData) {
        const issues = [];
        const allFields = getAllFormFields(formDef);

        // 1. Check required fields
        for (const field of allFields) {
            if (field.required && field.type !== 'file') {
                const value = (formData[field.id] || '').toString().trim();
                if (!value) {
                    issues.push({
                        severity: 'error',
                        field: field.id,
                        sectionId: findSectionForField(formDef, field.id),
                        title: `Required: ${field.label}`,
                        message: `${field.label} is required but not filled.`,
                        icon: '🔴'
                    });
                }
            }
        }

        // 2. Check field formats
        for (const field of allFields) {
            const value = (formData[field.id] || '').toString().trim();
            if (value) {
                const results = ValidationEngine.validateField(field, value, formData);
                for (const r of results) {
                    if (r.severity === 'error') {
                        issues.push({
                            severity: 'error',
                            field: field.id,
                            sectionId: findSectionForField(formDef, field.id),
                            title: `Format Error: ${field.label}`,
                            message: r.message,
                            suggestedFix: r.suggestedFix,
                            fixableAutomatically: r.fixableAutomatically,
                            icon: '🔴'
                        });
                    } else if (r.severity === 'warning') {
                        issues.push({
                            severity: 'warning',
                            field: field.id,
                            sectionId: findSectionForField(formDef, field.id),
                            title: `Warning: ${field.label}`,
                            message: r.message,
                            suggestedFix: r.suggestedFix,
                            fixableAutomatically: r.fixableAutomatically,
                            icon: '🟠'
                        });
                    }
                }
            }
        }

        // 3. Cross-field validation
        const crossResults = CrossFieldValidation.validate(formData, ocrData);
        for (const r of crossResults) {
            issues.push({
                severity: r.severity === 'error' ? 'error' : 'warning',
                field: r.field,
                sectionId: findSectionForField(formDef, r.field),
                title: `Consistency: ${r.field}`,
                message: r.message,
                suggestedFix: r.suggestedFix,
                fixableAutomatically: r.fixableAutomatically,
                fixField: r.fixField,
                icon: r.severity === 'error' ? '🔴' : '🟡',
                isDocMismatch: r.isDocMismatch
            });
        }

        // 4. Check required documents (file fields)
        for (const field of allFields) {
            if (field.type === 'file' && field.required) {
                const hasFile = formData[field.id] && formData[field.id] !== '';
                if (!hasFile) {
                    issues.push({
                        severity: 'warning',
                        field: field.id,
                        sectionId: findSectionForField(formDef, field.id),
                        title: `Missing Document: ${field.label}`,
                        message: `${field.label} has not been uploaded.`,
                        icon: '🟠'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Calculate readiness score
     */
    function calculateReadiness(formDef, formData, ocrData) {
        const weights = formDef.readinessWeights || { required: 25, format: 20, crossField: 20, documents: 20, supporting: 15 };
        const allFields = getAllFormFields(formDef);
        const scores = {};

        // Required fields score
        let requiredTotal = 0, requiredFilled = 0;
        for (const field of allFields) {
            if (field.required && field.type !== 'file') {
                requiredTotal++;
                const val = (formData[field.id] || '').toString().trim();
                if (val) requiredFilled++;
            }
        }
        scores.required = requiredTotal > 0 ? (requiredFilled / requiredTotal) : 1;

        // Format validation score
        let formatTotal = 0, formatPassed = 0;
        for (const field of allFields) {
            const val = (formData[field.id] || '').toString().trim();
            if (val && field.type !== 'file') {
                formatTotal++;
                const results = ValidationEngine.validateField(field, val, formData);
                const hasError = results.some(r => r.severity === 'error');
                if (!hasError) formatPassed++;
            }
        }
        scores.format = formatTotal > 0 ? (formatPassed / formatTotal) : 1;

        // Cross-field consistency score
        const crossIssues = CrossFieldValidation.validate(formData, ocrData);
        const crossErrors = crossIssues.filter(i => i.severity === 'error' || i.severity === 'warning').length;
        scores.crossField = crossErrors === 0 ? 1 : Math.max(0, 1 - (crossErrors * 0.25));

        // Documents score
        let docTotal = 0, docUploaded = 0;
        for (const field of allFields) {
            if (field.type === 'file') {
                docTotal++;
                if (formData[field.id] && formData[field.id] !== '') docUploaded++;
            }
        }
        scores.documents = docTotal > 0 ? (docUploaded / docTotal) : 1;

        // Supporting (optional fields) score
        let optTotal = 0, optFilled = 0;
        for (const field of allFields) {
            if (!field.required && field.type !== 'file') {
                optTotal++;
                const val = (formData[field.id] || '').toString().trim();
                if (val) optFilled++;
            }
        }
        scores.supporting = optTotal > 0 ? (optFilled / optTotal) : 1;

        // Weighted average
        const total = (scores.required * weights.required +
            scores.format * weights.format +
            scores.crossField * weights.crossField +
            scores.documents * weights.documents +
            scores.supporting * weights.supporting) /
            (weights.required + weights.format + weights.crossField + weights.documents + weights.supporting);

        return {
            percentage: Math.round(total * 100),
            scores,
            checks: [
                { label: I18n.t('guardian.checks.required'), passed: scores.required === 1 },
                { label: I18n.t('guardian.checks.format'), passed: scores.format === 1 },
                { label: I18n.t('guardian.checks.consistency'), passed: scores.crossField >= 0.75 },
                { label: I18n.t('guardian.checks.documents'), passed: scores.documents >= 0.5 },
                { label: I18n.t('guardian.checks.noIssues'), passed: total >= 0.95 },
            ]
        };
    }

    function findSectionForField(formDef, fieldId) {
        for (const section of formDef.sections) {
            for (const field of section.fields) {
                if (field.id === fieldId) return section.id;
            }
        }
        return null;
    }

    return { runGuardian, calculateReadiness, findSectionForField };
})();
