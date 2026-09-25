/**
 * NSGP Storage Service
 * Manages draft saving, auto-save, and application state persistence
 * Uses localStorage/IndexedDB for demo; architecture supports backend replacement
 */
const StorageService = (() => {
    const DRAFTS_KEY = 'nsgp-drafts';
    const SUBMISSIONS_KEY = 'nsgp-submissions';
    let autoSaveTimer = null;

    function getAllDrafts() {
        try {
            const data = localStorage.getItem(DRAFTS_KEY);
            return data ? JSON.parse(data) : {};
        } catch { return {}; }
    }

    function saveDraft(serviceId, formData, currentStep, totalSteps) {
        const drafts = getAllDrafts();
        drafts[serviceId] = {
            serviceId,
            formData,
            currentStep,
            totalSteps,
            lastSaved: new Date().toISOString(),
            progress: Math.round(((currentStep + 1) / totalSteps) * 100)
        };
        try {
            localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
            return true;
        } catch { return false; }
    }

    function getDraft(serviceId) {
        const drafts = getAllDrafts();
        return drafts[serviceId] || null;
    }

    function deleteDraft(serviceId) {
        const drafts = getAllDrafts();
        delete drafts[serviceId];
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    }

    function startAutoSave(serviceId, getFormDataFn, getStepFn, getTotalStepsFn, interval) {
        stopAutoSave();
        autoSaveTimer = setInterval(() => {
            const formData = getFormDataFn();
            const step = getStepFn();
            const totalSteps = getTotalStepsFn();
            if (saveDraft(serviceId, formData, step, totalSteps)) {
                updateSaveStatus(true);
            }
        }, interval || 15000); // Default every 15 seconds
    }

    function stopAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
            autoSaveTimer = null;
        }
    }

    function updateSaveStatus(saved) {
        const statusEl = document.getElementById('form-save-status');
        if (!statusEl) return;
        if (saved) {
            statusEl.classList.add('saved');
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            statusEl.innerHTML = `<span class="save-dot"></span><span>${I18n.t('form.saved')} (${timeStr})</span>`;
        } else {
            statusEl.classList.remove('saved');
            statusEl.innerHTML = `<span class="save-dot"></span><span>${I18n.t('form.notSaved')}</span>`;
        }
    }

    // Submissions (for demo)
    function getAllSubmissions() {
        try {
            const data = localStorage.getItem(SUBMISSIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    }

    function saveSubmission(serviceId, serviceName, formData, refNumber) {
        const submissions = getAllSubmissions();
        submissions.push({
            serviceId,
            serviceName,
            formData,
            refNumber,
            submittedAt: new Date().toISOString(),
            status: 'submitted'
        });
        localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
        deleteDraft(serviceId);
    }

    function generateRefNumber() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let ref = 'NSGP-DEMO-';
        for (let i = 0; i < 8; i++) {
            ref += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return ref;
    }

    return {
        getAllDrafts, saveDraft, getDraft, deleteDraft,
        startAutoSave, stopAutoSave, updateSaveStatus,
        getAllSubmissions, saveSubmission, generateRefNumber
    };
})();
