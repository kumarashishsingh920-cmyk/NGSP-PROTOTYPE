/**
 * NSGP Main Application
 * Orchestrates all components, handles navigation, events, and state
 */
(function() {
    'use strict';

    // ── Application State ──
    let currentPage = 'home';
    let fontScale = 1;

    // ── Initialization ──
    document.addEventListener('DOMContentLoaded', init);

    function init() {
        I18n.init();
        setupNavigation();
        setupAccessibility();
        setupLanguageSelector();
        setupMobileMenu();
        setupServiceCards();
        setupFormEvents();
        setupScannerEvents();
        setupSearchAndFilter();
        setupConnectionMonitor();
        setupHelpTooltips();
        loadApplicationsList();

        // Check if user has drafts and show resume banner if needed
        checkForDrafts();
    }

    // ── Navigation ──
    function setupNavigation() {
        // Nav links
        document.querySelectorAll('[data-page]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo(el.getAttribute('data-page'));
            });
        });

        // Data-action navigate buttons
        document.querySelectorAll('[data-action="navigate"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const target = el.getAttribute('data-target');
                if (target) navigateTo(target);
            });
        });
    }

    function navigateTo(page) {
        // Stop any active audio/camera
        AudioService.stop();
        VoiceService.stopListening();
        ScannerService.stopCamera();

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

        // Show target page
        const targetPage = document.getElementById(`page-${page}`);
        if (targetPage) {
            targetPage.classList.add('active');
            currentPage = page;
        }

        // Update nav active state
        document.querySelectorAll('.gov-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === page) {
                link.classList.add('active');
            }
        });

        // Close mobile menu
        document.getElementById('gov-nav-list').classList.remove('open');
        document.getElementById('mobile-menu-btn').setAttribute('aria-expanded', 'false');

        // Refresh data for certain pages
        if (page === 'applications') loadApplicationsList();
        if (page === 'services') populateServicesPage();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('main-content').focus();
    }

    // ── Language Selector ──
    function setupLanguageSelector() {
        document.getElementById('language-selector').addEventListener('change', (e) => {
            I18n.setLanguage(e.target.value);
            // Re-render current page if needed
            if (currentPage === 'form') {
                FormEngine.updateReadiness();
            }
        });
    }

    // ── Mobile Menu ──
    function setupMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn');
        const nav = document.getElementById('gov-nav-list');

        btn.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            btn.setAttribute('aria-expanded', isOpen.toString());
        });
    }

    // ── Accessibility Toolbar ──
    function setupAccessibility() {
        // Font size increase
        document.getElementById('btn-font-increase').addEventListener('click', () => {
            fontScale = Math.min(fontScale + 0.1, 1.8);
            document.documentElement.style.setProperty('--font-multiplier', fontScale);
            updateA11yBtnState('btn-font-increase', fontScale > 1);
        });

        // Font size decrease
        document.getElementById('btn-font-decrease').addEventListener('click', () => {
            fontScale = Math.max(fontScale - 0.1, 0.7);
            document.documentElement.style.setProperty('--font-multiplier', fontScale);
            updateA11yBtnState('btn-font-decrease', fontScale < 1);
        });

        // High contrast
        document.getElementById('btn-high-contrast').addEventListener('click', () => {
            document.body.classList.toggle('high-contrast');
            updateA11yBtnState('btn-high-contrast', document.body.classList.contains('high-contrast'));
        });

        // Reduce motion
        document.getElementById('btn-reduce-motion').addEventListener('click', () => {
            document.body.classList.toggle('reduce-motion');
            updateA11yBtnState('btn-reduce-motion', document.body.classList.contains('reduce-motion'));
        });

        // Screen reader mode
        document.getElementById('btn-screen-reader').addEventListener('click', () => {
            document.body.classList.toggle('screen-reader-mode');
            updateA11yBtnState('btn-screen-reader', document.body.classList.contains('screen-reader-mode'));
        });

        // Reset
        document.getElementById('btn-reset-a11y').addEventListener('click', () => {
            fontScale = 1;
            document.documentElement.style.setProperty('--font-multiplier', 1);
            document.body.classList.remove('high-contrast', 'reduce-motion', 'screen-reader-mode');
            document.querySelectorAll('.a11y-btn').forEach(b => b.classList.remove('active'));
        });

        // Screen reader access button
        document.getElementById('btn-screen-reader-access').addEventListener('click', () => {
            document.body.classList.toggle('screen-reader-mode');
            NotificationService.show('Screen reader mode ' +
                (document.body.classList.contains('screen-reader-mode') ? 'enabled' : 'disabled'), 'info');
        });
    }

    function updateA11yBtnState(id, isActive) {
        document.getElementById(id).classList.toggle('active', isActive);
    }

    // ── Service Cards ──
    function setupServiceCards() {
        document.querySelectorAll('.service-start-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const serviceId = btn.getAttribute('data-service');
                startService(serviceId);
            });
        });
    }

    function startService(serviceId) {
        if (serviceId === 'demo-errors') {
            navigateTo('form');
            // Reset form UI
            resetFormUI();
            setTimeout(() => FormEngine.loadErrorDemo(), 100);
            return;
        }

        const formDef = FORM_DEFINITIONS[serviceId];
        if (!formDef) {
            // For unimplemented services, show notice
            NotificationService.show('This service uses the Income Certificate form structure for demonstration.', 'info');
            navigateTo('form');
            resetFormUI();
            setTimeout(() => FormEngine.loadForm('income-certificate'), 100);
            return;
        }

        navigateTo('form');
        resetFormUI();
        setTimeout(() => FormEngine.loadForm(serviceId), 100);
    }

    function resetFormUI() {
        document.getElementById('form-container').style.display = '';
        document.getElementById('form-progress-bar').style.display = '';
        document.getElementById('readiness-panel').style.display = '';
        document.getElementById('guardian-panel').style.display = 'none';
        document.getElementById('review-panel').style.display = 'none';
        document.getElementById('submission-panel').style.display = 'none';
        document.getElementById('confirm-dialog').style.display = 'none';
        document.getElementById('scanner-section').style.display = 'none';
        document.getElementById('ocr-review-section').style.display = 'none';
    }

    // ── Form Navigation Events ──
    function setupFormEvents() {
        document.getElementById('btn-next-step').addEventListener('click', () => FormEngine.nextStep());
        document.getElementById('btn-prev-step').addEventListener('click', () => FormEngine.prevStep());
        document.getElementById('btn-save-draft').addEventListener('click', () => {
            FormEngine.autoSaveNow();
            NotificationService.show(I18n.t('notify.draftSaved'), 'success');
        });

        // Guardian events
        document.getElementById('btn-fix-issues').addEventListener('click', () => {
            document.getElementById('guardian-panel').style.display = 'none';
            // Go to first section with issues
            FormEngine.goToStep(0);
        });

        document.getElementById('btn-review-app').addEventListener('click', () => {
            FormEngine.showReview();
        });

        // Review events
        document.getElementById('btn-back-to-form').addEventListener('click', () => {
            document.getElementById('review-panel').style.display = 'none';
            document.getElementById('guardian-panel').style.display = 'none';
            FormEngine.goToStep(0);
        });

        document.getElementById('btn-submit-app').addEventListener('click', () => {
            FormEngine.showConfirmDialog();
        });

        // Confirmation dialog events
        document.getElementById('confirm-checkbox').addEventListener('change', (e) => {
            document.getElementById('btn-confirm-submit').disabled = !e.target.checked;
        });

        document.getElementById('btn-cancel-submit').addEventListener('click', () => {
            document.getElementById('confirm-dialog').style.display = 'none';
        });

        document.getElementById('btn-confirm-submit').addEventListener('click', () => {
            FormEngine.submitApplication();
        });

        // Submission actions
        document.getElementById('btn-download-ack').addEventListener('click', () => {
            downloadAcknowledgement();
        });

        document.getElementById('btn-print-ack').addEventListener('click', () => {
            window.print();
        });

        // Login button (demo)
        document.getElementById('login-btn').addEventListener('click', () => {
            NotificationService.show('Login functionality is available in the full version. This is a demonstration platform.', 'info');
        });
    }

    // ── Scanner Events ──
    function setupScannerEvents() {
        // Open scanner from form
        document.getElementById('btn-scan-doc').addEventListener('click', openScanner);
        document.getElementById('btn-scan-home').addEventListener('click', () => {
            // Navigate to a default form first
            startService('income-certificate');
            setTimeout(openScanner, 500);
        });

        // Close scanner
        document.getElementById('close-scanner').addEventListener('click', closeScanner);

        // Open camera
        document.getElementById('btn-open-camera').addEventListener('click', async () => {
            const video = document.getElementById('camera-video');
            const capturedImg = document.getElementById('captured-image');
            video.style.display = 'block';
            capturedImg.style.display = 'none';

            const success = await ScannerService.openCamera(video);
            if (success) {
                document.getElementById('btn-open-camera').style.display = 'none';
                document.getElementById('btn-upload-doc').style.display = 'none';
                document.getElementById('btn-capture').style.display = 'inline-flex';
            } else {
                NotificationService.show(I18n.t('error.cameraFailed'), 'error');
                NotificationService.show(I18n.t('error.cameraReasons'), 'info', 6000);
            }
        });

        // Upload image
        document.getElementById('btn-upload-doc').addEventListener('click', () => {
            document.getElementById('doc-file-input').click();
        });

        document.getElementById('doc-file-input').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                try {
                    const imageData = await ScannerService.processUploadedFile(file);
                    const capturedImg = document.getElementById('captured-image');
                    const video = document.getElementById('camera-video');
                    capturedImg.src = imageData;
                    capturedImg.style.display = 'block';
                    video.style.display = 'none';

                    document.getElementById('btn-open-camera').style.display = 'none';
                    document.getElementById('btn-upload-doc').style.display = 'none';
                    document.getElementById('btn-capture').style.display = 'none';
                    document.getElementById('btn-retake').style.display = 'inline-flex';
                    document.getElementById('btn-process-doc').style.display = 'inline-flex';
                } catch (err) {
                    NotificationService.show('Failed to process image. Please try again.', 'error');
                }
            }
        });

        // Capture from camera
        document.getElementById('btn-capture').addEventListener('click', () => {
            const video = document.getElementById('camera-video');
            const canvas = document.getElementById('camera-canvas');
            const capturedImg = document.getElementById('captured-image');

            const imageData = ScannerService.captureImage(video, canvas);
            capturedImg.src = imageData;
            capturedImg.style.display = 'block';
            video.style.display = 'none';
            ScannerService.stopCamera();

            document.getElementById('btn-capture').style.display = 'none';
            document.getElementById('btn-retake').style.display = 'inline-flex';
            document.getElementById('btn-process-doc').style.display = 'inline-flex';
        });

        // Retake
        document.getElementById('btn-retake').addEventListener('click', () => {
            ScannerService.clearCapturedImage();
            const video = document.getElementById('camera-video');
            const capturedImg = document.getElementById('captured-image');
            capturedImg.style.display = 'none';
            video.style.display = 'none';

            document.getElementById('btn-open-camera').style.display = 'inline-flex';
            document.getElementById('btn-upload-doc').style.display = 'inline-flex';
            document.getElementById('btn-capture').style.display = 'none';
            document.getElementById('btn-retake').style.display = 'none';
            document.getElementById('btn-process-doc').style.display = 'none';
        });

        // Process document (OCR)
        document.getElementById('btn-process-doc').addEventListener('click', async () => {
            const statusEl = document.getElementById('scanner-status');
            const statusText = document.getElementById('scanner-status-text');

            statusEl.style.display = 'flex';
            statusText.textContent = I18n.t('scanner.reading');

            try {
                const imageData = ScannerService.getCapturedImage();
                const result = await OCRService.processDocument(imageData);

                statusText.textContent = I18n.t('scanner.processing');
                await new Promise(r => setTimeout(r, 800));

                statusEl.style.display = 'none';

                if (result.success) {
                    showOCRReview(result);
                } else {
                    NotificationService.show(I18n.t('error.ocrFailed'), 'error');
                    NotificationService.show(I18n.t('error.ocrReasons'), 'info', 6000);
                }
            } catch (err) {
                statusEl.style.display = 'none';
                NotificationService.show(I18n.t('error.ocrFailed'), 'error');
            }
        });

        // OCR Review actions
        document.getElementById('btn-use-ocr').addEventListener('click', () => {
            applyOCRResults();
            document.getElementById('ocr-review-section').style.display = 'none';
            closeScanner();
        });

        document.getElementById('btn-review-ocr').addEventListener('click', () => {
            // Keep OCR review visible, let user edit values
            NotificationService.show('You can edit the detected values before applying.', 'info');
        });

        document.getElementById('btn-rescan').addEventListener('click', () => {
            document.getElementById('ocr-review-section').style.display = 'none';
            // Reset scanner
            document.getElementById('btn-retake').click();
        });
    }

    function openScanner() {
        const scannerSection = document.getElementById('scanner-section');
        const ocrSection = document.getElementById('ocr-review-section');
        scannerSection.style.display = 'block';
        ocrSection.style.display = 'none';

        // Reset scanner state
        document.getElementById('btn-open-camera').style.display = 'inline-flex';
        document.getElementById('btn-upload-doc').style.display = 'inline-flex';
        document.getElementById('btn-capture').style.display = 'none';
        document.getElementById('btn-retake').style.display = 'none';
        document.getElementById('btn-process-doc').style.display = 'none';
        document.getElementById('scanner-status').style.display = 'none';
        document.getElementById('camera-video').style.display = 'none';
        document.getElementById('captured-image').style.display = 'none';

        scannerSection.scrollIntoView({ behavior: 'smooth' });
    }

    function closeScanner() {
        ScannerService.stopCamera();
        document.getElementById('scanner-section').style.display = 'none';
    }

    let lastOCRResult = null;

    function showOCRReview(result) {
        lastOCRResult = result;
        const ocrSection = document.getElementById('ocr-review-section');
        const ocrDocType = document.getElementById('ocr-doc-type');
        const ocrTable = document.getElementById('ocr-review-table');

        ocrSection.style.display = 'block';

        if (result.documentType) {
            ocrDocType.textContent = `Document detected: ${result.documentType}`;
        } else {
            ocrDocType.textContent = I18n.t('ocr.docUnknown');
        }

        // Build review table
        ocrTable.innerHTML = '';
        for (const [fieldKey, data] of Object.entries(result.fields)) {
            const row = document.createElement('div');
            row.className = 'ocr-row';

            // Find field label from form definition
            const formDef = FormEngine.getCurrentFormDef();
            let fieldLabel = fieldKey;
            if (formDef) {
                const field = getAllFormFields(formDef).find(f => f.id === fieldKey);
                if (field) fieldLabel = field.label;
            }

            const confClass = data.confidence === 'high' ? 'high' :
                              data.confidence === 'medium' ? 'medium' : 'low';

            row.innerHTML = `
                <div class="ocr-field-name">${fieldLabel}</div>
                <div class="ocr-field-value">
                    <input type="text" value="${escapeAttr(data.value)}" data-ocr-field="${fieldKey}" aria-label="Detected ${fieldLabel}">
                </div>
                <div class="ocr-confidence ${confClass}">${data.confidence}</div>
            `;
            ocrTable.appendChild(row);
        }

        ocrSection.scrollIntoView({ behavior: 'smooth' });
    }

    function applyOCRResults() {
        if (!lastOCRResult) return;

        // Get potentially edited values from review table
        const editedFields = {};
        document.querySelectorAll('[data-ocr-field]').forEach(input => {
            const fieldKey = input.getAttribute('data-ocr-field');
            editedFields[fieldKey] = {
                value: input.value,
                confidence: lastOCRResult.fields[fieldKey] ? lastOCRResult.fields[fieldKey].confidence : 'medium'
            };
        });

        FormEngine.applyOCRData(editedFields);
    }

    // ── Search & Filter ──
    function setupSearchAndFilter() {
        const searchInput = document.getElementById('service-search');
        const categoryFilter = document.getElementById('category-filter');

        if (searchInput) {
            searchInput.addEventListener('input', () => filterServices());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => filterServices());
        }
    }

    function populateServicesPage() {
        const grid = document.getElementById('services-list');
        if (!grid) return;
        grid.innerHTML = '';

        const services = [
            { id: 'income-certificate', title: 'Income Certificate', desc: 'Apply for income certificate', category: 'certificates', docs: 3, time: '15 min', steps: 6 },
            { id: 'caste-certificate', title: 'Caste Certificate', desc: 'Apply for caste certificate', category: 'certificates', docs: 4, time: '20 min', steps: 6 },
            { id: 'residence-certificate', title: 'Residence/Domicile Certificate', desc: 'Apply for residence certificate', category: 'certificates', docs: 3, time: '15 min', steps: 6 },
            { id: 'birth-certificate', title: 'Birth Certificate', desc: 'Apply for birth certificate', category: 'certificates', docs: 2, time: '10 min', steps: 5 },
            { id: 'aadhaar-update', title: 'Aadhaar-Related Services', desc: 'Aadhaar update and correction (Demo)', category: 'identity', docs: 2, time: '10 min', steps: 5 },
            { id: 'scholarship', title: 'Scholarship Application', desc: 'Apply for government scholarship', category: 'education', docs: 5, time: '25 min', steps: 7 },
            { id: 'health-scheme', title: 'Health Scheme Application', desc: 'Apply for government health scheme', category: 'healthcare', docs: 3, time: '15 min', steps: 5 },
            { id: 'insurance', title: 'Insurance Application', desc: 'Apply for government insurance', category: 'insurance', docs: 4, time: '20 min', steps: 6 },
        ];

        for (const svc of services) {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.setAttribute('data-service', svc.id);
            card.setAttribute('data-category', svc.category);
            card.innerHTML = `
                <div class="service-card-header">
                    <span class="service-icon">📄</span>
                    <h5>${svc.title}</h5>
                </div>
                <p class="service-desc">${svc.desc}</p>
                <div class="service-meta">
                    <span class="meta-item">📎 ${svc.docs} Documents</span>
                    <span class="meta-item">⏱ ~${svc.time}</span>
                    <span class="meta-item">📝 ${svc.steps} Steps</span>
                </div>
                <button class="btn btn-primary btn-sm service-start-btn" data-service="${svc.id}">
                    ${I18n.t('services.startApplication')}
                </button>
            `;

            card.querySelector('.service-start-btn').addEventListener('click', () => {
                startService(svc.id);
            });

            grid.appendChild(card);
        }
    }

    function filterServices() {
        const searchTerm = (document.getElementById('service-search').value || '').toLowerCase();
        const category = document.getElementById('category-filter').value;

        document.querySelectorAll('#services-list .service-card').forEach(card => {
            const title = card.querySelector('h5').textContent.toLowerCase();
            const desc = card.querySelector('.service-desc').textContent.toLowerCase();
            const cardCategory = card.getAttribute('data-category');

            const matchesSearch = !searchTerm || title.includes(searchTerm) || desc.includes(searchTerm);
            const matchesCategory = category === 'all' || cardCategory === category;

            card.style.display = (matchesSearch && matchesCategory) ? '' : 'none';
        });
    }

    // ── Applications Dashboard ──
    function loadApplicationsList() {
        const container = document.getElementById('applications-list');
        if (!container) return;

        const drafts = StorageService.getAllDrafts();
        const submissions = StorageService.getAllSubmissions();
        const noApps = document.getElementById('no-applications');

        // Clear existing cards
        container.querySelectorAll('.app-card, .resume-banner').forEach(el => el.remove());

        const hasDrafts = Object.keys(drafts).length > 0;
        const hasSubmissions = submissions.length > 0;

        if (!hasDrafts && !hasSubmissions) {
            if (noApps) noApps.style.display = '';
            return;
        }

        if (noApps) noApps.style.display = 'none';

        // Draft applications
        for (const [serviceId, draft] of Object.entries(drafts)) {
            const formDef = FORM_DEFINITIONS[serviceId] || { title: serviceId };
            const lastSaved = new Date(draft.lastSaved);
            const timeAgo = getTimeAgo(lastSaved);
            const progress = draft.progress || 0;

            const card = document.createElement('div');
            card.className = 'app-card';
            card.innerHTML = `
                <div class="app-card-info">
                    <h4>${formDef.title || serviceId}</h4>
                    <div class="app-card-meta">
                        <span>${I18n.t('applications.progress')}: ${progress}%</span>
                        <span>${I18n.t('applications.lastSaved')}: ${timeAgo}</span>
                    </div>
                    <div class="app-progress-bar">
                        <div class="app-progress-fill" style="width:${progress}%"></div>
                    </div>
                </div>
                <span class="app-card-status draft">${I18n.t('applications.draft')}</span>
                <div class="app-card-actions">
                    <button class="btn btn-primary btn-sm btn-continue">${I18n.t('applications.continue')}</button>
                    <button class="btn btn-outline btn-sm btn-delete">${I18n.t('applications.delete')}</button>
                </div>
            `;

            card.querySelector('.btn-continue').addEventListener('click', () => {
                navigateTo('form');
                resetFormUI();
                setTimeout(() => FormEngine.loadForm(serviceId, draft), 100);
            });

            card.querySelector('.btn-delete').addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this draft?')) {
                    StorageService.deleteDraft(serviceId);
                    loadApplicationsList();
                    NotificationService.show('Draft deleted.', 'info');
                }
            });

            container.insertBefore(card, noApps);
        }

        // Submitted applications
        for (const sub of submissions) {
            const card = document.createElement('div');
            card.className = 'app-card';
            const submittedTime = new Date(sub.submittedAt);
            card.innerHTML = `
                <div class="app-card-info">
                    <h4>${sub.serviceName || sub.serviceId}</h4>
                    <div class="app-card-meta">
                        <span>Ref: ${sub.refNumber}</span>
                        <span>Submitted: ${getTimeAgo(submittedTime)}</span>
                    </div>
                    <div class="app-progress-bar">
                        <div class="app-progress-fill complete" style="width:100%"></div>
                    </div>
                </div>
                <span class="app-card-status submitted">${I18n.t('applications.submitted')}</span>
                <div class="app-card-actions">
                    <button class="btn btn-outline btn-sm">View</button>
                </div>
            `;
            container.insertBefore(card, noApps);
        }
    }

    function checkForDrafts() {
        const drafts = StorageService.getAllDrafts();
        const keys = Object.keys(drafts);
        if (keys.length > 0) {
            // Could show a resume banner on home page
            // For now, notification is sufficient
        }
    }

    // ── Connection Monitor ──
    function setupConnectionMonitor() {
        function updateStatus() {
            const statusEl = document.getElementById('connection-status');
            const dot = statusEl.querySelector('.status-dot');
            const text = statusEl.querySelector('.status-text');

            if (navigator.onLine) {
                dot.className = 'status-dot online';
                text.textContent = I18n.t('status.online');
            } else {
                dot.className = 'status-dot offline';
                text.textContent = I18n.t('status.offline');
            }
        }

        window.addEventListener('online', () => {
            updateStatus();
            NotificationService.show(I18n.t('notify.connectionRestored'), 'success');
        });

        window.addEventListener('offline', () => {
            updateStatus();
            NotificationService.show(I18n.t('notify.offline'), 'warning');
        });

        updateStatus();
    }

    // ── Help Tooltips ──
    function setupHelpTooltips() {
        document.addEventListener('click', (e) => {
            const helpBtn = e.target.closest('.field-help-icon');
            if (helpBtn) {
                const fieldId = helpBtn.getAttribute('data-field');
                const tooltip = document.getElementById(`help-${fieldId}`);
                if (tooltip) {
                    const isVisible = tooltip.classList.contains('visible');
                    // Close all tooltips first
                    document.querySelectorAll('.help-tooltip.visible').forEach(t => t.classList.remove('visible'));
                    if (!isVisible) {
                        tooltip.classList.add('visible');
                    }
                }
                return;
            }

            // Close tooltips when clicking elsewhere
            if (!e.target.closest('.help-tooltip')) {
                document.querySelectorAll('.help-tooltip.visible').forEach(t => t.classList.remove('visible'));
            }
        });
    }

    // ── Download Acknowledgement ──
    function downloadAcknowledgement() {
        const ref = document.getElementById('submission-ref').textContent;
        const formDef = FormEngine.getCurrentFormDef();
        const formData = FormEngine.getFormData();

        let content = `NSGP — Application Acknowledgement\n`;
        content += `${'='.repeat(50)}\n\n`;
        content += `Reference Number: ${ref}\n`;
        content += `Service: ${formDef ? formDef.title : 'N/A'}\n`;
        content += `Date: ${new Date().toLocaleDateString('en-IN')}\n`;
        content += `Time: ${new Date().toLocaleTimeString('en-IN')}\n\n`;
        content += `${'—'.repeat(50)}\n`;
        content += `APPLICANT DETAILS\n`;
        content += `${'—'.repeat(50)}\n\n`;

        if (formDef) {
            for (const section of formDef.sections) {
                if (section.isReviewStep) continue;
                content += `${section.title}:\n`;
                for (const field of section.fields) {
                    if (field.type === 'file') continue;
                    let val = formData[field.id] || '—';
                    if (field.validationType === 'aadhaar' && val.length > 4) {
                        val = 'XXXX XXXX ' + val.slice(-4);
                    }
                    content += `  ${field.label}: ${val}\n`;
                }
                content += '\n';
            }
        }

        content += `${'—'.repeat(50)}\n`;
        content += `NOTE: This is a DEMONSTRATION acknowledgement.\n`;
        content += `NSGP is not an official Government of India website.\n`;
        content += `This reference number is for demo purposes only.\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NSGP-Acknowledgement-${ref}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // ── Utilities ──
    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
        return date.toLocaleDateString('en-IN');
    }

    function escapeAttr(str) {
        return (str || '').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
})();
