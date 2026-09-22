document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    loadNotifications();
    document.getElementById('mark-all-read')?.addEventListener('click', async () => {
        try {
            await api('api/notifications/mark_read.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
            loadNotifications();
            toast('All marked as read');
        } catch (e) { alert(e.message); }
    });
});

async function loadNotifications() {
    try {
        const data = await api('api/notifications/mark_read.php');
        const list = document.getElementById('notif-list');
        if (!list) return;
        list.innerHTML = data.notifications.length
            ? data.notifications.map(n => `
                <div class="notif-page-item ${n.is_read ? '' : 'unread'}">
                    <i class="fa-solid fa-bell"></i>
                    <div>
                        <strong>${escapeHTML(n.title)}</strong>
                        <span>${escapeHTML(n.body || '')}</span>
                        <em>${escapeHTML(n.time)}</em>
                    </div>
                </div>
            `).join('')
            : '<div class="empty-state"><i class="fa-solid fa-bell-slash"></i><h4>No notifications</h4><p>You\'re all caught up!</p></div>';
    } catch (e) { console.error(e); }
}
