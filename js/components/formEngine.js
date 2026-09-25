/**
 * NSGP Smart Form Engine
 * Renders dynamic forms with audio, voice, validation, and scanner integration
 */
const FormEngine = (() => {
    let currentFormDef = null;
    let currentStep = 0;
    let formData = {};
    let ocrData = null;
    let fieldValidationResults = {};
    let documentFiles = {};

    /**
     * Initialize and render a form
     */
    function loadForm(serviceId, resumeData) {
        const formDef = FORM_DEFINITIONS[serviceId];
        if (!formDef) {
            NotificationService.show('Service not found.', 'error');
            return;
        }

        currentFormDef = formDef;
        currentStep = 0;
        formData = {};
        ocrData = null;
        fieldValidationResults = {};
        documentFiles = {};

        // Check for draft
        if (resumeData) {
            formData = resumeData.formData || {};
            currentStep = resumeData.currentStep || 0;
        } else {
            const draft = StorageService.getDraft(serviceId);
            if (draft) {
                formData = draft.formData || {};
                currentStep = draft.currentStep || 0;
                NotificationService.show(I18n.t('notify.draftResumed'), 'info');
            }
        }

        // Set form title
        document.getElementById('form-title').textContent = formDef.title;
        document.getElementById('form-subtitle').textContent = I18n.t('form.subtitle');

        // Render progress steps
        renderProgressSteps();
        // Render current section
        renderCurrentSection();
        // Update readiness
        updateReadiness();
        // Start auto-save
        StorageService.startAutoSave(
            serviceId,
            () => formData,
            () => currentStep,
            () => formDef.sections.length,
            15000
        );
        StorageService.updateSaveStatus(false);
    }

    /**
     * Load demo with intentional errors
     */
    function loadErrorDemo() {
        const demo = DEMO_DATA.errorDemo;
        currentFormDef = FORM_DEFINITIONS[demo.serviceId];
        currentStep = 0;
        formData = { ...demo.formData };
        ocrData = demo.ocrData;
        fieldValidationResults = {};
        documentFiles = {};

        document.getElementById('form-title').textContent = currentFormDef.title + ' — Error Detection Demo';
        document.getElementById('form-subtitle').textContent = 'This form contains intentional errors for demonstration.';

        renderProgressSteps();
        renderCurrentSection();
        updateReadiness();

        // Trigger validation immediately for all fields
        setTimeout(() => {
            validateAllCurrentFields();
            runCrossFieldValidation();
        }, 500);

        StorageService.startAutoSave(
            'demo-errors',
            () => formData,
            () => currentStep,
            () => currentFormDef.sections.length,
            30000
        );
    }

    /**
     * Render step progress indicators
     */
    function renderProgressSteps() {
        const container = document.getElementById('progress-steps');
        container.innerHTML = '';
        currentFormDef.sections.forEach((section, idx) => {
            const step = document.createElement('div');
            step.className = 'progress-step';
            if (idx < currentStep) step.classList.add('completed');
            if (idx === currentStep) step.classList.add('active');

            step.innerHTML = `
                <div class="progress-step-number">${idx < currentStep ? '✓' : idx + 1}</div>
                <div class="progress-step-label">${section.title}</div>
            `;
            step.addEventListener('click', () => {
                if (idx <= currentStep + 1) goToStep(idx);
            });
            container.appendChild(step);
        });

        const totalSteps = currentFormDef.sections.length;
        document.getElementById('progress-step-text').textContent =
            I18n.t('form.stepOf', { current: currentStep + 1, total: totalSteps });
    }

    /**
     * Render form fields for current section
     */
    function renderCurrentSection() {
        const container = document.getElementById('form-sections');
        container.innerHTML = '';
        const section = currentFormDef.sections[currentStep];

        if (!section) return;

        // Check if this is the review step
        if (section.isReviewStep) {
            renderReviewStep(container);
            return;
        }

        const sectionEl = document.createElement('div');
        sectionEl.className = 'form-section active';
        sectionEl.innerHTML = `<h4 class="form-section-title">${section.title}</h4>`;

        for (const field of section.fields) {
            sectionEl.appendChild(createFieldElement(field));
        }

        container.appendChild(sectionEl);

        // Restore field values
        for (const field of section.fields) {
            const input = document.getElementById(`field-${field.id}`);
            if (input && formData[field.id]) {
                input.value = formData[field.id];
                // Show validation for pre-filled fields
                if (formData[field.id]) {
                    validateFieldUI(field, formData[field.id]);
                }
            }
        }

        // Update navigation buttons
        updateNavigation();
    }

    /**
     * Create a single form field element with audio and voice controls
     */
    function createFieldElement(field) {
        const group = document.createElement('div');
        group.className = 'form-field-group';
        group.id = `group-${field.id}`;

        // Label row
        const labelRow = document.createElement('div');
        labelRow.className = 'field-label';
        labelRow.innerHTML = `
            <label for="field-${field.id}">${field.label}</label>
            ${field.required ? '<span class="required-indicator" aria-label="Required">*</span>' : ''}
            ${field.helpText ? `<button type="button" class="field-help-icon" aria-label="Help for ${field.label}" data-field="${field.id}" title="${field.helpText}">ℹ️</button>` : ''}
        `;
        group.appendChild(labelRow);

        // Help tooltip
        if (field.helpText) {
            const tooltip = document.createElement('div');
            tooltip.className = 'help-tooltip';
            tooltip.id = `help-${field.id}`;
            tooltip.innerHTML = `
                <h5>${field.label}</h5>
                <p>${field.helpText}</p>
                ${field.placeholder ? `<div class="help-example">Example: ${field.placeholder}</div>` : ''}
            `;
            group.appendChild(tooltip);
        }

        if (field.type === 'file') {
            // File input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = `field-${field.id}`;
            fileInput.accept = field.accept || 'image/*,.pdf';
            fileInput.setAttribute('aria-label', field.label);
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    formData[field.id] = file.name;
                    documentFiles[field.id] = file;
                    updateReadiness();
                    autoSaveNow();
                }
            });
            group.appendChild(fileInput);
        } else if (field.type === 'select') {
            // Select with audio controls
            const wrapper = document.createElement('div');
            wrapper.className = 'field-input-wrapper';

            const select = document.createElement('select');
            select.id = `field-${field.id}`;
            select.setAttribute('aria-label', field.label);
            if (field.required) select.setAttribute('aria-required', 'true');
            
            (field.options || []).forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt || `-- Select ${field.label} --`;
                select.appendChild(option);
            });

            select.addEventListener('change', () => {
                formData[field.id] = select.value;
                validateFieldUI(field, select.value);
                runCrossFieldValidation();
                updateReadiness();
                autoSaveNow();
            });

            wrapper.appendChild(select);

            // Audio controls for select too
            if (field.audioKey) {
                wrapper.appendChild(createAudioControls(field));
            }

            group.appendChild(wrapper);
        } else if (field.type === 'textarea') {
            const wrapper = document.createElement('div');
            wrapper.className = 'field-input-wrapper';

            const textarea = document.createElement('textarea');
            textarea.id = `field-${field.id}`;
            textarea.placeholder = field.placeholder || '';
            textarea.setAttribute('aria-label', field.label);
            if (field.required) textarea.setAttribute('aria-required', 'true');
            textarea.rows = 3;

            textarea.addEventListener('input', () => {
                formData[field.id] = textarea.value;
                validateFieldUI(field, textarea.value);
                runCrossFieldValidation();
                updateReadiness();
            });
            textarea.addEventListener('blur', () => autoSaveNow());

            wrapper.appendChild(textarea);
            wrapper.appendChild(createAudioControls(field));
            group.appendChild(wrapper);
        } else {
            // Text, number, date, email, tel inputs
            const wrapper = document.createElement('div');
            wrapper.className = 'field-input-wrapper';

            const input = document.createElement('input');
            input.type = field.type === 'phone' || field.type === 'tel' ? 'tel' :
                         field.type === 'email' ? 'email' :
                         field.type === 'number' || field.type === 'age' ? 'number' :
                         field.type === 'date' ? 'date' : 'text';
            input.id = `field-${field.id}`;
            input.placeholder = field.placeholder || '';
            input.setAttribute('aria-label', field.label);
            if (field.required) input.setAttribute('aria-required', 'true');

            // Mask Aadhaar display
            if (field.validationType === 'aadhaar') {
                input.setAttribute('maxlength', '14');
                input.placeholder = 'XXXX XXXX XXXX';
            }

            input.addEventListener('input', () => {
                formData[field.id] = input.value;
                // Debounced validation
                clearTimeout(input._validationTimer);
                input._validationTimer = setTimeout(() => {
                    validateFieldUI(field, input.value);
                    runCrossFieldValidation();
                    updateReadiness();
                }, 300);
            });

            input.addEventListener('blur', () => {
                validateFieldUI(field, input.value);
                runCrossFieldValidation();
                updateReadiness();
                autoSaveNow();
            });

            wrapper.appendChild(input);
            wrapper.appendChild(createAudioControls(field));
            group.appendChild(wrapper);
        }

        // Validation message container
        const validationContainer = document.createElement('div');
        validationContainer.className = 'field-validation';
        validationContainer.id = `validation-${field.id}`;
        group.appendChild(validationContainer);

        // Help text
        if (field.helpText && field.type !== 'file') {
            const helpEl = document.createElement('div');
            helpEl.className = 'field-help-text';
            helpEl.textContent = field.helpText;
            group.appendChild(helpEl);
        }

        return group;
    }

    /**
     * Create audio (speaker + microphone) controls
     */
    function createAudioControls(field) {
        const controls = document.createElement('div');
        controls.className = 'field-audio-controls';

        // Speaker button
        const speakBtn = document.createElement('button');
        speakBtn.type = 'button';
        speakBtn.className = 'btn-speak';
        speakBtn.setAttribute('aria-label', `Listen to instructions for ${field.label}`);
        speakBtn.title = `Listen to instructions for ${field.label}`;
        speakBtn.textContent = '🔊';
        speakBtn.addEventListener('click', () => {
            if (AudioService.getIsSpeaking()) {
                AudioService.stop();
                speakBtn.classList.remove('speaking');
                return;
            }
            const instruction = AudioService.getFieldInstruction(field.id) ||
                `Please enter ${field.label.toLowerCase()}.`;
            speakBtn.classList.add('speaking');
            AudioService.speak(instruction, () => {
                speakBtn.classList.remove('speaking');
            });
        });
        controls.appendChild(speakBtn);

        // Voice input button (only for text-like inputs)
        if (field.type !== 'date' && field.type !== 'select' && field.type !== 'file') {
            const voiceBtn = document.createElement('button');
            voiceBtn.type = 'button';
            voiceBtn.className = 'btn-voice';
            voiceBtn.setAttribute('aria-label', `Voice input for ${field.label}`);
            voiceBtn.title = `Voice input for ${field.label}`;
            voiceBtn.textContent = '🎤';

            voiceBtn.addEventListener('click', () => {
                if (VoiceService.getIsListening()) {
                    VoiceService.stopListening();
                    voiceBtn.classList.remove('listening');
                    return;
                }

                if (!VoiceService.isSupported()) {
                    NotificationService.show(I18n.t('error.voiceNotSupported'), 'warning');
                    return;
                }

                VoiceService.startListening(
                    field.id,
                    (transcript, isFinal) => {
                        const input = document.getElementById(`field-${field.id}`);
                        if (input) {
                            input.value = transcript;
                            formData[field.id] = transcript;
                            if (isFinal) {
                                validateFieldUI(field, transcript);
                                runCrossFieldValidation();
                                updateReadiness();
                                voiceBtn.classList.remove('listening');
                            }
                        }
                    },
                    (state) => {
                        if (state === 'listening') {
                            voiceBtn.classList.add('listening');
                            voiceBtn.textContent = '⏹';
                        } else {
                            voiceBtn.classList.remove('listening');
                            voiceBtn.textContent = '🎤';
                        }
                    }
                );
            });
            controls.appendChild(voiceBtn);
        }

        return controls;
    }

    /**
     * Validate a field and update UI
     */
    function validateFieldUI(field, value) {
        const results = ValidationEngine.validateField(field, value, formData);
        fieldValidationResults[field.id] = results;

        const container = document.getElementById(`validation-${field.id}`);
        const input = document.getElementById(`field-${field.id}`);
        if (!container) return;

        container.innerHTML = '';

        // Remove previous states
        if (input) {
            input.classList.remove('field-error', 'field-warning', 'field-success');
        }

        if (results.length === 0 && value && value.toString().trim()) {
            // Valid field
            if (input) input.classList.add('field-success');
            return;
        }

        for (const result of results) {
            const msgEl = document.createElement('div');
            msgEl.className = `validation-msg ${result.severity}`;

            const icon = result.severity === 'error' ? '❌' :
                         result.severity === 'warning' ? '⚠️' :
                         result.severity === 'info' ? 'ℹ️' : '✅';

            let html = `
                <span class="validation-icon">${icon}</span>
                <div class="validation-text">
                    <span>${escapeHtml(result.message)}</span>
            `;

            if (result.suggestedFix) {
                html += `
                    <div class="validation-suggestion">
                        <button type="button" class="btn-fix" data-field="${field.id}" data-fix="${escapeAttr(result.suggestedFix)}">${I18n.t('validation.fixAuto')}</button>
                        <button type="button" class="btn-keep" data-field="${field.id}">${I18n.t('validation.keepEntry')}</button>
                    </div>
                `;
            }

            html += '</div>';
            msgEl.innerHTML = html;

            // Wire up fix buttons
            const fixBtn = msgEl.querySelector('.btn-fix');
            if (fixBtn) {
                fixBtn.addEventListener('click', () => {
                    const inputEl = document.getElementById(`field-${field.id}`);
                    if (inputEl) {
                        inputEl.value = result.suggestedFix;
                        formData[field.id] = result.suggestedFix;
                        validateFieldUI(field, result.suggestedFix);
                        runCrossFieldValidation();
                        updateReadiness();
                    }
                });
            }

            const keepBtn = msgEl.querySelector('.btn-keep');
            if (keepBtn) {
                keepBtn.addEventListener('click', () => {
                    msgEl.remove();
                });
            }

            container.appendChild(msgEl);

            // Set input state
            if (input) {
                if (result.severity === 'error') input.classList.add('field-error');
                else if (result.severity === 'warning') input.classList.add('field-warning');
            }
        }
    }

    /**
     * Validate all fields in current section
     */
    function validateAllCurrentFields() {
        const section = currentFormDef.sections[currentStep];
        if (!section) return;
        for (const field of section.fields) {
            const value = formData[field.id] || '';
            validateFieldUI(field, value);
        }
    }

    /**
     * Run cross-field validation and show document match warnings
     */
    function runCrossFieldValidation() {
        const crossResults = CrossFieldValidation.validate(formData, ocrData);
        
        // Remove existing cross-field warnings
        document.querySelectorAll('.doc-match-warning').forEach(el => el.remove());

        for (const result of crossResults) {
            // Show in the relevant field's validation area
            const container = document.getElementById(`validation-${result.field}`);
            if (container) {
                // Check if already shown
                const existing = container.querySelector(`[data-cross-field="${result.field}-${result.relatedField}"]`);
                if (existing) continue;

                const msgEl = document.createElement('div');
                msgEl.className = `validation-msg ${result.severity}`;
                msgEl.setAttribute('data-cross-field', `${result.field}-${result.relatedField}`);

                const icon = result.severity === 'error' ? '❌' :
                             result.severity === 'warning' ? '⚠️' : 'ℹ️';

                let html = `
                    <span class="validation-icon">${icon}</span>
                    <div class="validation-text">
                        <span>${escapeHtml(result.message)}</span>
                `;

                if (result.suggestedFix && result.fixField) {
                    html += `
                        <div class="validation-suggestion">
                            <button type="button" class="btn-fix" data-field="${result.fixField}" data-fix="${escapeAttr(result.suggestedFix)}">${result.isDocMismatch ? I18n.t('validation.useDoc') : I18n.t('validation.fixAuto')}</button>
                            <button type="button" class="btn-keep">${result.isDocMismatch ? I18n.t('validation.keepForm') : I18n.t('validation.keepEntry')}</button>
                        </div>
                    `;
                }

                html += '</div>';
                msgEl.innerHTML = html;

                // Wire up fix button
                const fixBtn = msgEl.querySelector('.btn-fix');
                if (fixBtn) {
                    fixBtn.addEventListener('click', () => {
                        const targetField = fixBtn.getAttribute('data-field');
                        const fixValue = fixBtn.getAttribute('data-fix');
                        const inputEl = document.getElementById(`field-${targetField}`);
                        if (inputEl) {
                            inputEl.value = fixValue;
                            formData[targetField] = fixValue;
                            const fieldDef = getAllFormFields(currentFormDef).find(f => f.id === targetField);
                            if (fieldDef) validateFieldUI(fieldDef, fixValue);
                            runCrossFieldValidation();
                            updateReadiness();
                        }
                    });
                }

                const keepBtn = msgEl.querySelector('.btn-keep');
                if (keepBtn) {
                    keepBtn.addEventListener('click', () => msgEl.remove());
                }

                container.appendChild(msgEl);
            }
        }
    }

    /**
     * Update readiness score and checklist
     */
    function updateReadiness() {
        if (!currentFormDef) return;

        const readiness = Guardian.calculateReadiness(currentFormDef, formData, ocrData);
        const percentEl = document.getElementById('readiness-percent');
        const fillEl = document.getElementById('readiness-fill');
        const checklistEl = document.getElementById('readiness-checklist');

        if (percentEl) {
            percentEl.textContent = readiness.percentage + '%';
            percentEl.className = 'readiness-percent';
            if (readiness.percentage >= 80) percentEl.classList.add('high');
            else if (readiness.percentage >= 40) percentEl.classList.add('medium');
        }

        if (fillEl) {
            fillEl.style.width = readiness.percentage + '%';
            fillEl.className = 'readiness-fill';
            if (readiness.percentage >= 80) fillEl.classList.add('high');
            else if (readiness.percentage >= 40) fillEl.classList.add('medium');
        }

        if (checklistEl) {
            checklistEl.innerHTML = '';
            for (const check of readiness.checks) {
                const li = document.createElement('li');
                li.className = check.passed ? 'passed' : 'failed';
                li.textContent = check.label;
                checklistEl.appendChild(li);
            }
        }
    }

    /**
     * Render review step
     */
    function renderReviewStep(container) {
        // Show guardian check
        showGuardianPanel();
    }

    /**
     * Show Pre-Submission Guardian panel
     */
    function showGuardianPanel() {
        const panel = document.getElementById('guardian-panel');
        const status = document.getElementById('guardian-status');
        const results = document.getElementById('guardian-results');
        const actions = document.getElementById('guardian-actions');
        const reviewPanel = document.getElementById('review-panel');
        const submissionPanel = document.getElementById('submission-panel');
        const formContainer = document.getElementById('form-container');

        panel.style.display = 'block';
        status.style.display = 'flex';
        results.style.display = 'none';
        actions.style.display = 'none';
        reviewPanel.style.display = 'none';
        submissionPanel.style.display = 'none';

        // Simulate guardian analysis
        setTimeout(() => {
            status.style.display = 'none';
            results.style.display = 'block';
            actions.style.display = 'flex';

            const issues = Guardian.runGuardian(currentFormDef, formData, ocrData);
            results.innerHTML = '';

            if (issues.length === 0) {
                // All good!
                results.innerHTML = `
                    <div class="guardian-success">
                        <div class="guardian-success-icon">🟢</div>
                        <h4>${I18n.t('guardian.noIssues')}</h4>
                        <ul class="guardian-success-checks">
                            <li>✓ ${I18n.t('guardian.checks.required')}</li>
                            <li>✓ ${I18n.t('guardian.checks.format')}</li>
                            <li>✓ ${I18n.t('guardian.checks.consistency')}</li>
                            <li>✓ ${I18n.t('guardian.checks.documents')}</li>
                            <li>✓ ${I18n.t('guardian.checks.noIssues')}</li>
                        </ul>
                    </div>
                `;
                document.getElementById('btn-fix-issues').style.display = 'none';
                document.getElementById('btn-review-app').style.display = 'inline-flex';
            } else {
                const header = document.createElement('h4');
                header.style.cssText = 'padding:0 0 16px;color:var(--error);';
                header.textContent = I18n.t('guardian.issuesFound', { count: issues.length });
                results.appendChild(header);

                for (const issue of issues) {
                    const item = document.createElement('div');
                    item.className = `guardian-result-item ${issue.severity}`;
                    item.innerHTML = `
                        <span class="guardian-result-icon">${issue.icon}</span>
                        <div class="guardian-result-text">
                            <strong>${escapeHtml(issue.title)}</strong>
                            <span>${escapeHtml(issue.message)}</span>
                        </div>
                    `;
                    // Click to navigate to field
                    item.addEventListener('click', () => {
                        if (issue.sectionId) {
                            const sectionIdx = currentFormDef.sections.findIndex(s => s.id === issue.sectionId);
                            if (sectionIdx >= 0) {
                                panel.style.display = 'none';
                                goToStep(sectionIdx);
                                setTimeout(() => {
                                    const fieldEl = document.getElementById(`field-${issue.field}`);
                                    if (fieldEl) {
                                        fieldEl.focus();
                                        fieldEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }, 300);
                            }
                        }
                    });
                    results.appendChild(item);
                }
                document.getElementById('btn-fix-issues').style.display = 'inline-flex';
                // Show review button too if only warnings
                const hasErrors = issues.some(i => i.severity === 'error');
                document.getElementById('btn-review-app').style.display = hasErrors ? 'none' : 'inline-flex';
            }
        }, 1500);
    }

    /**
     * Show application review
     */
    function showReview() {
        document.getElementById('guardian-panel').style.display = 'none';
        const reviewPanel = document.getElementById('review-panel');
        reviewPanel.style.display = 'block';

        const content = document.getElementById('review-content');
        content.innerHTML = '';

        for (const section of currentFormDef.sections) {
            if (section.isReviewStep || section.fields.length === 0) continue;

            const sectionEl = document.createElement('div');
            sectionEl.className = 'review-section';

            let fieldsHtml = '';
            for (const field of section.fields) {
                let displayValue = formData[field.id] || '—';
                // Mask sensitive data
                if (field.validationType === 'aadhaar' && displayValue && displayValue.length > 4) {
                    displayValue = 'XXXX XXXX ' + displayValue.slice(-4);
                }
                fieldsHtml += `
                    <div class="review-field">
                        <div class="review-field-label">${field.label}</div>
                        <div class="review-field-value">${escapeHtml(displayValue.toString())}</div>
                    </div>
                `;
            }

            const sectionIdx = currentFormDef.sections.indexOf(section);
            sectionEl.innerHTML = `
                <div class="review-section-header">
                    <h5>${section.title}</h5>
                    <button class="btn-edit-section" data-step="${sectionIdx}">${I18n.t('review.edit')}</button>
                </div>
                <div class="review-fields">${fieldsHtml}</div>
            `;

            // Wire up edit button
            sectionEl.querySelector('.btn-edit-section').addEventListener('click', (e) => {
                const step = parseInt(e.target.getAttribute('data-step'));
                reviewPanel.style.display = 'none';
                goToStep(step);
            });

            content.appendChild(sectionEl);
        }

        reviewPanel.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Handle form submission
     */
    function showConfirmDialog() {
        const dialog = document.getElementById('confirm-dialog');
        dialog.style.display = 'flex';
        const checkbox = document.getElementById('confirm-checkbox');
        const submitBtn = document.getElementById('btn-confirm-submit');
        checkbox.checked = false;
        submitBtn.disabled = true;
    }

    function submitApplication() {
        const refNumber = StorageService.generateRefNumber();
        const serviceName = currentFormDef.title;
        StorageService.saveSubmission(currentFormDef.id, serviceName, formData, refNumber);
        StorageService.stopAutoSave();

        document.getElementById('confirm-dialog').style.display = 'none';
        document.getElementById('review-panel').style.display = 'none';
        document.getElementById('guardian-panel').style.display = 'none';
        document.getElementById('form-container').style.display = 'none';
        document.getElementById('form-progress-bar').style.display = 'none';
        document.getElementById('readiness-panel').style.display = 'none';

        const submissionPanel = document.getElementById('submission-panel');
        submissionPanel.style.display = 'block';
        document.getElementById('submission-ref').textContent = refNumber;

        submissionPanel.scrollIntoView({ behavior: 'smooth' });
        NotificationService.show(I18n.t('notify.submitted'), 'success');
    }

    /**
     * Navigation
     */
    function goToStep(step) {
        if (step < 0 || step >= currentFormDef.sections.length) return;
        currentStep = step;
        renderProgressSteps();
        renderCurrentSection();
        updateReadiness();
        window.scrollTo({ top: 200, behavior: 'smooth' });
    }

    function nextStep() {
        if (currentStep < currentFormDef.sections.length - 1) {
            goToStep(currentStep + 1);
            autoSaveNow();
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            goToStep(currentStep - 1);
        }
    }

    function updateNavigation() {
        const prevBtn = document.getElementById('btn-prev-step');
        const nextBtn = document.getElementById('btn-next-step');
        if (prevBtn) prevBtn.disabled = currentStep === 0;
        if (nextBtn) {
            if (currentStep === currentFormDef.sections.length - 1) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = '';
                nextBtn.disabled = false;
            }
        }
    }

    /**
     * Apply OCR data to form
     */
    function applyOCRData(ocrFields) {
        ocrData = {};
        for (const [key, data] of Object.entries(ocrFields)) {
            ocrData[key] = data.value;
            // Populate form field if it exists and is empty or user confirms
            if (formData[key] === undefined || formData[key] === '') {
                formData[key] = data.value;
                const input = document.getElementById(`field-${key}`);
                if (input) {
                    input.value = data.value;
                    const fieldDef = getAllFormFields(currentFormDef).find(f => f.id === key);
                    if (fieldDef) validateFieldUI(fieldDef, data.value);
                }
            }
        }
        runCrossFieldValidation();
        updateReadiness();
        NotificationService.show(I18n.t('notify.docProcessed'), 'success');
    }

    function autoSaveNow() {
        if (currentFormDef) {
            StorageService.saveDraft(currentFormDef.id, formData, currentStep, currentFormDef.sections.length);
            StorageService.updateSaveStatus(true);
        }
    }

    function getFormData() { return formData; }
    function getOCRData() { return ocrData; }
    function getCurrentFormDef() { return currentFormDef; }

    // Utility functions
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeAttr(str) {
        return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    return {
        loadForm, loadErrorDemo, nextStep, prevStep, goToStep,
        applyOCRData, showGuardianPanel, showReview, showConfirmDialog, submitApplication,
        validateAllCurrentFields, runCrossFieldValidation, updateReadiness,
        getFormData, getOCRData, getCurrentFormDef, autoSaveNow
    };
})();
