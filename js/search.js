document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    const debouncedSearch = debounce(async (q) => {
        if (q.length < 2) { document.getElementById('search-suggestions').style.display = 'none'; return; }
        try {
            const data = await api(`api/users/search.php?q=${encodeURIComponent(q)}`);
            const sug = document.getElementById('search-suggestions');
            if (!data.users.length) { sug.style.display = 'none'; return; }
            sug.innerHTML = data.users.map(u => `
                <div style="padding:10px 16px;cursor:pointer;border-bottom:1px solid var(--border-color);" onclick="window.location.href='profile.html?id=${u.id}'">
                    <strong>${escapeHTML(u.name)}</strong><br><span style="font-size:12px;color:var(--text-muted);">${escapeHTML(u.department)}</span>
                </div>
            `).join('');
            sug.style.display = 'block';
        } catch (e) {}
    }, 300);

    const searchInput = document.getElementById('global-search');
    searchInput?.addEventListener('input', (e) => debouncedSearch(e.target.value));
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#search-suggestions') && !e.target.closest('#global-search')) {
            document.getElementById('search-suggestions').style.display = 'none';
        }
    });

    document.querySelectorAll('.search-tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.search-tabs .tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
});
