/**
 * NSGP Notification Service
 */
const NotificationService = (() => {
    const ICONS = {
        success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
    };
    let counter = 0;

    function show(message, type, duration) {
        type = type || 'info';
        duration = duration || 4000;

        const area = document.getElementById('notification-area');
        if (!area) return;

        const id = 'notif-' + (++counter);
        const notifEl = document.createElement('div');
        notifEl.className = `notification ${type}`;
        notifEl.id = id;
        notifEl.setAttribute('role', 'alert');
        notifEl.innerHTML = `
            <span class="notification-icon">${ICONS[type] || 'ℹ️'}</span>
            <span class="notification-text">${escapeHtml(message)}</span>
            <button class="notification-close" aria-label="Close notification" onclick="NotificationService.close('${id}')">✕</button>
        `;
        area.appendChild(notifEl);

        if (duration > 0) {
            setTimeout(() => close(id), duration);
        }
        return id;
    }

    function close(id) {
        const el = document.getElementById(id);
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateX(100%)';
            setTimeout(() => el.remove(), 200);
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    return { show, close };
})();
