document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    if (!isAdminUser()) {
        window.location.href = 'index.html';
        return;
    }
    setupAdminPage();
});

const adminState = {
    view: 'overview',
    filtersOpen: false,
    stats: null,
    facets: null,
    logs: [],
    logOffset: 0,
    logHasMore: false,
    selected: new Set(),
    users: {
        q: '',
        role: '',
        status: '',
        department: '',
        banned: '',
        online: '',
        from: '',
        to: '',
        sort: 'created_at',
        dir: 'desc',
        page: 1,
        per_page: 10
    },
    verifications: { q: '', status: 'pending' },
    reports: { q: '', reason: '', status: 'pending' },
    logsFilter: { q: '', action: '', target_type: '', limit: 40 }
};

const VIEW_META = {
    overview: { title: 'Admin Overview', subtitle: 'Platform health, membership and moderation at a glance.' },
    users: { title: 'User Management', subtitle: 'Search, filter and moderate every account on the platform.' },
    moderation: { title: 'Moderation', subtitle: 'Review verification requests and reported community content.' },
    logs: { title: 'Admin Audit Log', subtitle: 'Every administrative action taken on this platform.' }
};

function qs(sel, root = document) {
    return root.querySelector(sel);
}

function qsAll(sel, root = document) {
    return Array.from(root.querySelectorAll(sel));
}

function buildQuery(params) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) return;
        search.set(key, value);
    });
    return search.toString();
}

function adminUrl(path, params) {
    const query = buildQuery(params);
    return query ? `${path}?${query}` : path;
}

async function setupAdminPage() {
    renderHeaderUser();
    bindStaticControls();

    const view = new URLSearchParams(location.search).get('view');
    if (view && VIEW_META[view]) adminState.view = view;

    await applyView(adminState.view, false);
    await loadStats();
    updateNavBadges();
}

function renderHeaderUser() {
    if (!currentUser) return;
    const nameEl = qs('#headerAdminName');
    if (nameEl) nameEl.textContent = currentUser.name;
    const avatarEl = qs('#headerAdminAvatar');
    if (avatarEl && currentUser.avatar) avatarEl.src = mediaUrl(currentUser.avatar);
}

function bindStaticControls() {
    qsAll('#adminTabs .admin-tab').forEach(tab => {
        tab.addEventListener('click', () => applyView(tab.dataset.view));
    });

    qsAll('.admin-sub-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            applyView(item.dataset.view);
        });
    });

    qs('#btnToggleFilters').addEventListener('click', toggleFilters);
    qs('#btnRefresh').addEventListener('click', refreshCurrentView);
    qs('#btnExportLogs').addEventListener('click', exportLogsCsv);

    const globalSearch = qs('#globalAdminSearch');
    globalSearch.addEventListener('input', debounce(() => {
        adminState.users.q = globalSearch.value.trim();
        qs('#userSearch').value = globalSearch.value;
        adminState.users.page = 1;
        applyView('users');
    }, 350));

    bindUserControls();
    bindModerationControls();
    bindLogControls();
}

function toggleFilters() {
    adminState.filtersOpen = !adminState.filtersOpen;
    const panel = qs('#filterPanel');
    const btn = qs('#btnToggleFilters');
    panel.hidden = !adminState.filtersOpen;
    btn.setAttribute('aria-expanded', String(adminState.filtersOpen));
    renderFilterPanel();
    if (adminState.filtersOpen && !adminState.facets) loadAdminUsers();
}

function updateFilterDot() {
    const f = adminState.users;
    const active = adminState.filtersOpen && [f.role, f.status, f.department, f.banned, f.online, f.from, f.to, f.q].some(v => v !== '');
    qs('#filterActiveDot').hidden = !active;
}

function renderFilterPanel() {
    const panel = qs('#filterPanel');
    if (!adminState.filtersOpen) {
        panel.innerHTML = '';
        updateFilterDot();
        return;
    }

    const facets = adminState.facets || { roles: {}, statuses: {}, departments: {} };
    const roleOptions = Object.entries(facets.roles || {}).map(([key, count]) =>
        `<option value="${escapeHTML(key)}"${adminState.users.role === key ? ' selected' : ''}>${escapeHTML(key[0].toUpperCase() + key.slice(1))} (${count})</option>`).join('');
    const statusOptions = Object.entries(facets.statuses || {}).map(([key, count]) =>
        `<option value="${escapeHTML(key)}"${adminState.users.status === key ? ' selected' : ''}>${escapeHTML(key[0].toUpperCase() + key.slice(1))} (${count})</option>`).join('');
    const deptOptions = Object.entries(facets.departments || {}).map(([key, count]) =>
        `<option value="${escapeHTML(key)}"${adminState.users.department === key ? ' selected' : ''}>${escapeHTML(key)} (${count})</option>`).join('');

    panel.innerHTML = `
        <div class="filter-grid">
            <label class="filter-field">
                <span>Role</span>
                <select class="admin-select" data-filter="role">
                    <option value="">All roles</option>
                    ${roleOptions}
                </select>
            </label>
            <label class="filter-field">
                <span>Status</span>
                <select class="admin-select" data-filter="status">
                    <option value="">All statuses</option>
                    ${statusOptions}
                </select>
            </label>
            <label class="filter-field">
                <span>Department</span>
                <select class="admin-select" data-filter="department">
                    <option value="">All departments</option>
                    ${deptOptions}
                </select>
            </label>
            <label class="filter-field">
                <span>Account state</span>
                <select class="admin-select" data-filter="banned">
                    <option value="">Any</option>
                    <option value="banned"${adminState.users.banned === 'banned' ? ' selected' : ''}>Banned only</option>
                    <option value="clean"${adminState.users.banned === 'clean' ? ' selected' : ''}>Not banned</option>
                </select>
            </label>
            <label class="filter-field">
                <span>Presence</span>
                <select class="admin-select" data-filter="online">
                    <option value="">Any</option>
                    <option value="1"${adminState.users.online === '1' ? ' selected' : ''}>Online now</option>
                    <option value="0"${adminState.users.online === '0' ? ' selected' : ''}>Offline</option>
                </select>
            </label>
            <label class="filter-field">
                <span>Joined from</span>
                <input type="date" class="admin-select" data-filter="from" value="${escapeHTML(adminState.users.from)}">
            </label>
            <label class="filter-field">
                <span>Joined to</span>
                <input type="date" class="admin-select" data-filter="to" value="${escapeHTML(adminState.users.to)}">
            </label>
            <div class="filter-field filter-actions">
                <button class="btn btn-outline" id="btnClearFilters">Clear all</button>
            </div>
        </div>`;

    qsAll('[data-filter]', panel).forEach(control => {
        const key = control.dataset.filter;
        control.addEventListener('change', () => {
            adminState.users[key] = control.value;
            adminState.users.page = 1;
            syncUserControls();
            renderFilterPanel();
            applyView('users');
        });
    });

    qs('#btnClearFilters').addEventListener('click', () => {
        ['q', 'role', 'status', 'department', 'banned', 'online', 'from', 'to'].forEach(k => adminState.users[k] = '');
        adminState.users.page = 1;
        syncUserControls();
        renderFilterPanel();
        applyView('users');
    });

    updateFilterDot();
}

function syncUserControls() {
    qs('#userSearch').value = adminState.users.q;
    qs('#globalAdminSearch').value = adminState.users.q;
    qs('#filterRole').value = adminState.users.role;
    qs('#filterStatus').value = adminState.users.status;
    qs('#filterDepartment').value = adminState.users.department;
    qs('#filterBanned').value = adminState.users.banned;
    qs('#filterOnline').value = adminState.users.online;
}

async function applyView(view, pushState = true) {
    if (!VIEW_META[view]) view = 'overview';
    adminState.view = view;

    qsAll('#adminTabs .admin-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.view === view));
    qsAll('.admin-sub-item').forEach(item => item.classList.toggle('active', item.dataset.view === view));
    qsAll('.admin-view').forEach(section => section.hidden = section.id !== `view-${view}`);

    qs('#adminPageTitle').textContent = VIEW_META[view].title;
    qs('#adminPageSubtitle').textContent = VIEW_META[view].subtitle;

    if (pushState) {
        history.replaceState({}, '', adminUrl('admin.html', { view }));
    }

    if (view === 'users') await loadAdminUsers();
    if (view === 'moderation') {
        await Promise.all([loadVerifications(), loadReports()]);
    }
    if (view === 'logs') await loadLogs(true);
}

async function refreshCurrentView() {
    await loadStats();
    updateNavBadges();
    if (adminState.view === 'users') await loadAdminUsers();
    if (adminState.view === 'moderation') {
        await Promise.all([loadVerifications(), loadReports()]);
    }
    if (adminState.view === 'logs') await loadLogs(true);
    toast('Data refreshed');
}

/* ─── Stats ─────────────────────────────────────────────── */

async function loadStats() {
    let data;
    try {
        data = await api('api/admin/stats.php');
    } catch (e) {
        console.error(e);
        return;
    }
    adminState.stats = data.stats;
    renderStats();
    updateNavBadges();
}

function updateNavBadges() {
    const stats = adminState.stats;
    if (!stats) return;
    qs('#navUsersBadge').textContent = stats.total_users;
    qs('#navModBadge').textContent = stats.pending_reports + stats.pending_verifications;
}

function renderStats() {
    const s = adminState.stats;
    const cards = [
        { label: 'Total members', value: s.total_users, icon: 'fa-users', tone: 'primary', sub: `${s.online_users} online now` },
        { label: 'Approved', value: s.approved_users, icon: 'fa-circle-check', tone: 'success', sub: `${s.pending_users} awaiting review` },
        { label: 'Pending approval', value: s.pending_users, icon: 'fa-user-clock', tone: 'warning', sub: `${s.rejected_users} rejected` },
        { label: 'Suspended', value: s.banned_users, icon: 'fa-ban', tone: 'danger', sub: `${s.faculty_users} faculty · ${s.guest_users} guests` },
        { label: 'New this week', value: s.new_users_7d, icon: 'fa-arrow-trend-up', tone: 'primary', sub: `+${s.new_users_24h} in 24h` },
        { label: 'Posts', value: s.total_posts, icon: 'fa-newspaper', tone: 'primary', sub: `${s.total_groups} groups · ${s.total_clubs} clubs` },
        { label: 'Pending reports', value: s.pending_reports, icon: 'fa-flag', tone: 'danger', sub: `${s.resolved_reports} resolved` },
        { label: 'Verifications', value: s.pending_verifications, icon: 'fa-shield-check', tone: 'warning', sub: 'Awaiting decision' }
    ];

    qs('#statGrid').innerHTML = cards.map(c => `
        <div class="stat-card tone-${c.tone}">
            <div class="stat-card-icon"><i class="fa-solid ${c.icon}"></i></div>
            <div class="stat-card-body">
                <div class="stat-card-value">${c.value}</div>
                <div class="stat-card-label">${escapeHTML(c.label)}</div>
                <div class="stat-card-sub">${escapeHTML(c.sub)}</div>
            </div>
        </div>`).join('');

    qs('#qsNewUsers').textContent = '+' + s.new_users_24h;
    qs('#qsReports').textContent = s.pending_reports;
    qs('#qsVerifications').textContent = s.pending_verifications;
    qs('#qsResponse').textContent = s.mean_response_minutes + 'm';

    const totalNew = (s.growth || []).reduce((sum, g) => sum + g.count, 0);
    qs('#growthTotal').textContent = '+' + totalNew;
    renderGrowthChart(s.growth || []);

    const breakdown = s.report_breakdown || {};
    const reasons = Object.keys(breakdown);
    qs('#reasonBreakdown').innerHTML = reasons.length
        ? reasons.map(r => {
            const pct = Math.round((breakdown[r] / s.pending_reports) * 100) || 0;
            return `
            <div class="reason-row">
                <span class="reason-label">${escapeHTML(r)}</span>
                <div class="reason-bar"><span style="width:${pct}%"></span></div>
                <span class="reason-count">${breakdown[r]}</span>
            </div>`;
        }).join('')
        : '<div class="text-center text-muted p-3">No pending reports</div>';

    const depts = s.by_department || [];
    qs('#deptBreakdown').innerHTML = depts.length
        ? depts.map(d => `
            <div class="stat-row">
                <span class="stat-label">${escapeHTML(d.department || 'Unassigned')}</span>
                <span class="stat-value">${d.total}</span>
            </div>`).join('')
        : '<div class="text-muted text-sm">No data</div>';
}

function renderGrowthChart(growth) {
    const chart = qs('#growthChart');
    if (!growth.length) {
        chart.innerHTML = '<div class="text-center text-muted p-4">No signups in the last 14 days</div>';
        return;
    }
    const max = Math.max(...growth.map(g => g.count), 1);
    chart.innerHTML = growth.map(g => `
        <div class="growth-col" title="${escapeHTML(g.day)}: ${g.count}">
            <div class="growth-value">${g.count}</div>
            <div class="growth-bar" style="height:${Math.max(4, Math.round((g.count / max) * 100))}%"></div>
            <div class="growth-day">${escapeHTML(g.day)}</div>
        </div>`).join('');
}

/* ─── Users ─────────────────────────────────────────────── */

function bindUserControls() {
    qs('#userSearch').addEventListener('input', debounce(() => {
        adminState.users.q = qs('#userSearch').value.trim();
        qs('#globalAdminSearch').value = adminState.users.q;
        adminState.users.page = 1;
        loadAdminUsers();
    }, 300));

    const filters = { filterRole: 'role', filterStatus: 'status', filterDepartment: 'department', filterBanned: 'banned', filterOnline: 'online' };
    Object.entries(filters).forEach(([id, key]) => {
        qs('#' + id).addEventListener('change', (e) => {
            adminState.users[key] = e.target.value;
            adminState.users.page = 1;
            if (adminState.filtersOpen) renderFilterPanel();
            loadAdminUsers();
        });
    });

    qs('#btnResetUserFilters').addEventListener('click', () => {
        ['q', 'role', 'status', 'department', 'banned', 'online', 'from', 'to'].forEach(k => adminState.users[k] = '');
        adminState.users.page = 1;
        adminState.selected.clear();
        syncUserControls();
        if (adminState.filtersOpen) renderFilterPanel();
        loadAdminUsers();
    });

    qsAll('.admin-table th.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const key = th.dataset.sort;
            if (adminState.users.sort === key) {
                adminState.users.dir = adminState.users.dir === 'asc' ? 'desc' : 'asc';
            } else {
                adminState.users.sort = key;
                adminState.users.dir = 'asc';
            }
            loadAdminUsers();
        });
    });

    qs('#checkAllUsers').addEventListener('change', (e) => {
        if (e.target.checked) {
            adminState.selected = new Set(adminState.visibleUsers.map(u => u.id));
        } else {
            adminState.selected.clear();
        }
        renderSelection();
    });

    qsAll('.bulk-btn').forEach(btn => {
        btn.addEventListener('click', () => handleBulkAction(btn.dataset.bulk));
    });
}

async function loadAdminUsers() {
    const tbody = qs('#usersTbody');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Loading users...</td></tr>';

    let data;
    try {
        data = await api(adminUrl('api/admin/users.php', adminState.users));
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">${escapeHTML(e.message)}</td></tr>`;
        return;
    }

    adminState.facets = data.facets;
    adminState.userNames = {};
    adminState.visibleUsers = data.users;
    data.users.forEach(u => { adminState.userNames[u.id] = u.name; });
    adminState.selected = new Set([...adminState.selected].filter(id => data.users.some(u => u.id === id)));

    populateUserFilterOptions();
    renderUsers(data);
    renderSelection();
    qs('#usersCountBadge').textContent = data.total + ' user' + (data.total === 1 ? '' : 's');
    updateFilterDot();
}

function populateUserFilterOptions() {
    const facets = adminState.facets;
    if (!facets) return;

    const fill = (el, values, current) => {
        const first = el.querySelector('option');
        el.innerHTML = '';
        el.appendChild(first);
        Object.entries(values).forEach(([key, count]) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)} (${count})`;
            el.appendChild(opt);
        });
        el.value = current;
    };

    fill(qs('#filterRole'), facets.roles || {}, adminState.users.role);
    fill(qs('#filterStatus'), facets.statuses || {}, adminState.users.status);
    fill(qs('#filterDepartment'), facets.departments || {}, adminState.users.department);
}

function statusBadge(user) {
    if (user.is_banned) return '<span class="badge ban">Banned</span>';
    if (user.status === 'approved') return '<span class="badge ok">Approved</span>';
    if (user.status === 'pending') return '<span class="badge warn">Pending</span>';
    return '<span class="badge muted-badge">Rejected</span>';
}

function roleBadge(role) {
    if (role === 'admin') return '<span class="badge admin">Admin</span>';
    if (role === 'faculty') return '<span class="badge faculty">Faculty</span>';
    if (role === 'guest') return '<span class="badge guest">Guest</span>';
    return '<span class="badge student">Student</span>';
}

function renderUsers(data) {
    const tbody = qs('#usersTbody');

    if (!data.users.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No users match these filters</td></tr>';
        qs('#usersPager').innerHTML = '';
        return;
    }

    qsAll('.admin-table th.sortable').forEach(th => {
        th.classList.toggle('sorted', adminState.users.sort === th.dataset.sort);
        const base = th.dataset.label || th.textContent.trim();
        th.dataset.label = base;
        th.textContent = base.replace(/ [▲▼]$/, '');
        if (adminState.users.sort === th.dataset.sort) {
            th.textContent = `${base} ${adminState.users.dir === 'asc' ? '▲' : '▼'}`;
        }
    });

    tbody.innerHTML = data.users.map(u => `
        <tr>
            <td class="col-check"><input type="checkbox" class="user-check" data-id="${u.id}" ${adminState.selected.has(u.id) ? 'checked' : ''}></td>
            <td>
                <div class="user-cell user-profile-link" data-user-id="${u.id}" style="cursor:pointer;">
                    <img src="${mediaUrl(u.avatar)}" class="avatar" style="width:36px;height:36px;" alt="Avatar">
                    <div class="user-info">
                        <span class="user-name">${escapeHTML(u.name)}</span>
                        <span class="user-email">${escapeHTML(u.email)}</span>
                        <span class="user-email">ID: ${escapeHTML(u.student_id || '—')}</span>
                    </div>
                </div>
            </td>
            <td>${roleBadge(u.role)}</td>
            <td>${statusBadge(u)}
                ${u.is_banned && u.banned_reason ? `<div class="user-sub text-danger">${escapeHTML(u.banned_reason)}</div>` : ''}
                ${!u.is_banned && u.status === 'pending' ? '<div class="user-sub text-muted">Awaiting review</div>' : ''}
            </td>
            <td class="text-muted text-sm">${escapeHTML(u.department || '—')}</td>
            <td class="text-sm">
                <span class="activity-chip" title="Posts">${u.post_count} posts</span>
                <span class="activity-chip" title="Comments">${u.comment_count} comments</span>
                ${u.report_count ? `<span class="activity-chip danger" title="Reports received">${u.report_count} reports</span>` : ''}
            </td>
            <td class="text-muted text-sm">
                ${u.is_online ? '<span class="online-dot"></span> Online' : escapeHTML(u.time)}
            </td>
            <td>
                <div class="action-icons">
                    <i class="fa-solid fa-eye icon-btn" title="View details" onclick="openUserDetail(${u.id})"></i>
                    <i class="fa-solid fa-shield-halved icon-btn ${u.is_banned ? 'accept' : 'reject'}" title="${u.is_banned ? 'Lift suspension' : 'Suspend'}" onclick="quickToggleBan(${u.id}, ${u.is_banned})"></i>
                    <i class="fa-solid fa-user-gear icon-btn" title="Moderate" onclick="openUserActions(${u.id})"></i>
                </div>
            </td>
        </tr>`).join('');

    qsAll('.user-check', tbody).forEach(box => {
        box.addEventListener('change', () => {
            const id = Number(box.dataset.id);
            if (box.checked) adminState.selected.add(id);
            else adminState.selected.delete(id);
            renderSelection();
        });
    });

    qs('#checkAllUsers').checked = data.users.length > 0 && data.users.every(u => adminState.selected.has(u.id));
    renderPager(data);
}

function renderSelection() {
    const bar = qs('#bulkBar');
    const count = adminState.selected.size;
    bar.hidden = count === 0;
    qs('#bulkCount').textContent = count + ' selected';
}

function renderPager(data) {
    const pager = qs('#usersPager');
    if (data.pages <= 1) {
        pager.innerHTML = `<span class="pager-info">Showing ${data.users.length} of ${data.total}</span>`;
        return;
    }
    const buttons = [];
    for (let i = 1; i <= data.pages; i++) {
        buttons.push(`<button class="pager-btn${i === data.page ? ' active' : ''}" data-page="${i}">${i}</button>`);
    }
    pager.innerHTML = `
        <span class="pager-info">Showing ${data.users.length} of ${data.total}</span>
        <div class="pager-controls">
            <button class="pager-btn" data-page="${data.page - 1}" ${data.page === 1 ? 'disabled' : ''}><i class="fa-solid fa-chevron-left"></i></button>
            ${buttons.join('')}
            <button class="pager-btn" data-page="${data.page + 1}" ${data.page === data.pages ? 'disabled' : ''}><i class="fa-solid fa-chevron-right"></i></button>
        </div>`;

    qsAll('.pager-btn', pager).forEach(btn => {
        btn.addEventListener('click', () => {
            const page = Number(btn.dataset.page);
            if (!page || page < 1 || page > data.pages) return;
            adminState.users.page = page;
            loadAdminUsers();
        });
    });
}

function collectSelectedIds() {
    return [...adminState.selected];
}

async function handleBulkAction(action) {
    const ids = collectSelectedIds();
    if (!ids.length) return;

    const labels = {
        approve: 'Approve',
        reject: 'Reject',
        faculty: 'Change role to FACULTY',
        student: 'Change role to STUDENT',
        ban: 'Suspend',
        unban: 'Lift suspension'
    };
    const actionLabel = labels[action] || action;

    if (action === 'ban') {
        const reason = await promptBanReason(ids.length);
        if (reason === null) return;
        runUserAction(action, ids, { reason });
        return;
    }

    showModal(
        actionLabel,
        `You are about to ${actionLabel.toLowerCase()} ${ids.length} user(s). Proceed?`,
        async () => {
            const payload = { user_ids: ids };
            if (action === 'approve') payload.status = 'approved';
            if (action === 'reject') payload.status = 'rejected';
            if (action === 'faculty') payload.role = 'faculty';
            if (action === 'student') payload.role = 'student';
            runUserAction(action, ids, payload);
        }
    );
}

function promptBanReason(count) {
    return new Promise(resolve => {
        const existing = document.getElementById('uiu-ban-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'uiu-ban-modal';
        overlay.className = 'uiu-modal-overlay';
        overlay.innerHTML = `
            <div class="uiu-modal-box admin-modal-box">
                <h3>Suspend ${count} user(s)</h3>
                <p>Provide a reason. It is stored in the audit log and shown to the user.</p>
                <textarea class="form-control" id="banReasonInput" rows="3" placeholder="Spamming the feed with promotional links"></textarea>
                <label class="filter-field mt-2" style="text-align:left;">
                    <span>Suspend until (optional)</span>
                    <input type="date" class="admin-select" id="banUntilInput">
                </label>
                <div class="uiu-modal-actions mt-3">
                    <button type="button" class="btn btn-outline" id="banCancel">Cancel</button>
                    <button type="button" class="btn btn-primary" id="banConfirm">Suspend</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);

        const close = (value) => {
            overlay.remove();
            resolve(value);
        };
        qs('#banCancel').onclick = () => close(null);
        qs('#banConfirm').onclick = () => {
            const reason = qs('#banReasonInput').value.trim();
            if (!reason) {
                qs('#banReasonInput').classList.add('input-error');
                return;
            }
            const until = qs('#banUntilInput').value;
            close({ reason, until });
        };
        qs('#banReasonInput').focus();
    });
}

async function runUserAction(action, ids, extra = {}) {
    try {
        const data = await api('api/admin/manage_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, user_ids: ids, ...extra })
        });
        toast(data.message || 'Users updated');
        if (data.failed && data.failed.length) alert('Skipped: ' + data.failed.join(', '));
        adminState.selected.clear();
        await Promise.all([loadAdminUsers(), loadStats()]);
    } catch (err) {
        alert(err.message);
    }
}

window.quickToggleBan = function (id, isBanned) {
    const name = (adminState.userNames && adminState.userNames[id]) || `user #${id}`;
    if (isBanned) {
        showModal('Lift suspension', `Restore access for ${name}?`, () => runUserAction('unban', [id], {}));
        return;
    }
    promptBanReason(1).then(reason => {
        if (!reason) return;
        showModal('Suspend account', `Suspend ${name}?`, () => runUserAction('ban', [id], reason));
    });
};

window.openUserActions = function (id) {
    const selectId = `roleSelect-${id}`;
    const statusId = `statusSelect-${id}`;
    const modalId = 'uiu-action-modal';

    const overlay = document.createElement('div');
    overlay.id = modalId;
    overlay.className = 'uiu-modal-overlay';
    overlay.innerHTML = `
        <div class="uiu-modal-box admin-modal-box">
            <h3>Moderate user #${id}</h3>
            <p>Changes are written to the audit log.</p>
            <label class="filter-field" style="text-align:left;">
                <span>Role</span>
                <select class="admin-select" id="${selectId}">
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="guest">Guest</option>
                    <option value="admin">Admin</option>
                </select>
            </label>
            <label class="filter-field mt-2" style="text-align:left;">
                <span>Status</span>
                <select class="admin-select" id="${statusId}">
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                </select>
            </label>
            <div class="uiu-modal-actions mt-3">
                <button type="button" class="btn btn-outline" id="actionCancel">Cancel</button>
                <button type="button" class="btn btn-primary" id="actionSave">Save changes</button>
            </div>
        </div>`;
    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    qs('#actionCancel').onclick = close;
    qs('#actionSave').onclick = async () => {
        const role = qs('#' + selectId).value;
        const status = qs('#' + statusId).value;
        close();
        await runUserAction('set_role', [id], { role });
        await runUserAction('set_status', [id], { status });
    };
};

window.openUserDetail = async function (id) {
    const overlay = document.createElement('div');
    overlay.id = 'uiu-detail-modal';
    overlay.className = 'uiu-modal-overlay';
    overlay.innerHTML = '<div class="uiu-modal-box admin-detail-box"><div class="text-center text-muted p-4">Loading account...</div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.remove();
    });

    let data;
    try {
        data = await api(`api/admin/user_detail.php?id=${id}`);
    } catch (e) {
        qs('.admin-detail-box', overlay).innerHTML = `<div class="text-center text-danger p-4">${escapeHTML(e.message)}</div>`;
        return;
    }

    const u = data.user;
    const c = data.counts;
    adminState.userNames = adminState.userNames || {};
    adminState.userNames[u.id] = u.name;
    const countItem = (label, value) => `<div class="detail-count"><span>${value}</span><small>${label}</small></div>`;

    qs('.admin-detail-box', overlay).innerHTML = `
        <div class="detail-head">
            <img src="${mediaUrl(u.avatar)}" class="avatar" style="width:56px;height:56px;" alt="Avatar">
            <div>
                <div class="detail-name">${escapeHTML(u.name)} ${roleBadge(u.role)}</div>
                <div class="user-email">${escapeHTML(u.email)}</div>
                <div class="user-email">ID: ${escapeHTML(u.student_id || '—')} · ${escapeHTML(u.department || '—')}</div>
            </div>
            <button type="button" class="detail-close" id="detailClose"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="detail-badges">
            ${statusBadge(u)}
            ${u.is_online ? '<span class="badge ok">Online</span>' : '<span class="badge muted-badge">Offline</span>'}
            <span class="badge muted-badge">Joined ${escapeHTML(formatDate(u.created_at))}</span>
            ${u.last_seen_at ? `<span class="badge muted-badge">Seen ${escapeHTML(timeAgo(u.last_seen_at))}</span>` : ''}
        </div>

        ${u.is_banned ? `<div class="detail-alert danger"><strong>Suspended:</strong> ${escapeHTML(u.banned_reason || 'No reason recorded')}${u.banned_until ? ` (until ${escapeHTML(u.banned_until.slice(0, 10))})` : ''}</div>` : ''}

        <div class="detail-counts">
            ${countItem('Posts', c.posts)}
            ${countItem('Comments', c.comments)}
            ${countItem('Connections', c.connections)}
            ${countItem('Followers', c.followers)}
            ${countItem('Groups', c.groups)}
            ${countItem('Clubs', c.clubs)}
            ${countItem('Messages', c.messages_sent)}
            ${countItem('Reports filed', c.reports_filed)}
            ${countItem('Reports received', c.reports_received)}
        </div>

        ${u.about ? `<div class="detail-section"><h4>About</h4><p class="text-sm text-muted">${escapeHTML(u.about)}</p></div>` : ''}

        ${data.reports.length ? `
        <div class="detail-section">
            <h4>Reported content</h4>
            ${data.reports.map(r => `
                <div class="detail-row">
                    <span class="badge ${r.status === 'pending' ? 'warn' : 'muted-badge'}">${escapeHTML(r.reason)}</span>
                    <span class="detail-row-text">${escapeHTML(r.content)}</span>
                    <span class="text-muted text-sm">${escapeHTML(r.time)}</span>
                </div>`).join('')}
        </div>` : ''}

        ${data.verifications.length ? `
        <div class="detail-section">
            <h4>Verification history</h4>
            ${data.verifications.map(v => `
                <div class="detail-row">
                    <span class="badge ${v.status === 'approved' ? 'ok' : (v.status === 'rejected' ? 'ban' : 'warn')}">${escapeHTML(v.status)}</span>
                    <span class="detail-row-text">Requested as ${escapeHTML(v.requested_role)}</span>
                    <span class="text-muted text-sm">${escapeHTML(timeAgo(v.created_at))}</span>
                </div>`).join('')}
        </div>` : ''}

        ${data.history.length ? `
        <div class="detail-section">
            <h4>Moderation history</h4>
            ${data.history.map(h => `
                <div class="detail-row">
                    <span class="badge muted-badge">${escapeHTML(h.action)}</span>
                    <span class="detail-row-text">${escapeHTML(h.details || '')}</span>
                    <span class="text-muted text-sm">${escapeHTML(h.admin_name || 'Admin')} · ${escapeHTML(h.time)}</span>
                </div>`).join('')}
        </div>` : '<div class="detail-section"><p class="text-muted text-sm">No moderation history for this account.</p></div>'}

        <div class="detail-actions">
            <a class="btn btn-outline" href="profile.html?id=${u.id}" target="_blank" rel="noopener">
                <i class="fa-solid fa-id-card mr-2"></i> View public profile
            </a>
            <button class="btn btn-outline" id="detailBanBtn">
                <i class="fa-solid ${u.is_banned ? 'fa-unlock' : 'fa-ban'} mr-2"></i>${u.is_banned ? 'Lift suspension' : 'Suspend'}
            </button>
        </div>`;

    qs('#detailClose', overlay).onclick = () => overlay.remove();
    qs('#detailBanBtn', overlay).onclick = () => {
        overlay.remove();
        window.quickToggleBan(u.id, u.is_banned);
    };
};

/* ─── Moderation ────────────────────────────────────────── */

function bindModerationControls() {
    qs('#verifSearch').addEventListener('input', debounce(() => {
        adminState.verifications.q = qs('#verifSearch').value.trim();
        loadVerifications();
    }, 300));

    qs('#verifStatus').addEventListener('change', (e) => {
        adminState.verifications.status = e.target.value;
        loadVerifications();
    });

    qs('#reportSearch').addEventListener('input', debounce(() => {
        adminState.reports.q = qs('#reportSearch').value.trim();
        loadReports();
    }, 300));

    qs('#reportReason').addEventListener('change', (e) => {
        adminState.reports.reason = e.target.value;
        loadReports();
    });

    qs('#reportStatus').addEventListener('change', (e) => {
        adminState.reports.status = e.target.value;
        loadReports();
    });
}

async function loadVerifications() {
    const tbody = qs('#verifTbody');
    let data;
    try {
        data = await api(adminUrl('api/admin/join_requests.php', adminState.verifications));
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${escapeHTML(e.message)}</td></tr>`;
        return;
    }

    const label = adminState.verifications.status.charAt(0).toUpperCase() + adminState.verifications.status.slice(1);
    qs('#verifCountBadge').textContent = data.requests.length + ' ' + label;

    if (!data.requests.length) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No ${label.toLowerCase()} verification requests</td></tr>`;
        return;
    }

    const canDecide = adminState.verifications.status === 'pending';
    adminState.requestNames = {};
    data.requests.forEach(req => { adminState.requestNames[req.id] = req.name; });
    tbody.innerHTML = data.requests.map(req => `
        <tr>
            <td>
                <div class="user-cell user-profile-link" data-user-id="${req.user_id}" style="cursor:pointer;">
                    <img src="${mediaUrl(req.avatar)}" class="avatar" style="width:36px;height:36px;" alt="Avatar">
                    <div class="user-info">
                        <span class="user-name">${escapeHTML(req.name)}</span>
                        <span class="user-email">${escapeHTML(req.email)}</span>
                        ${req.is_banned ? '<span class="user-sub text-danger">Currently suspended</span>' : ''}
                    </div>
                </div>
            </td>
            <td>${roleBadge(req.requested_role.toLowerCase())}</td>
            <td class="text-muted text-sm">${escapeHTML(formatDate(req.created_at))}</td>
            <td><span class="badge ${req.status === 'approved' ? 'ok' : (req.status === 'rejected' ? 'ban' : 'warn')}">${escapeHTML(req.status)}</span></td>
            <td>
                <div class="action-icons">
                    ${canDecide ? `
                    <i class="fa-solid fa-xmark icon-btn reject" title="Reject" onclick="handleVerify(${req.id}, 'reject')"></i>
                    <i class="fa-solid fa-circle-check icon-btn accept" title="Accept" onclick="handleVerify(${req.id}, 'accept')"></i>
                    ` : ''}
                    <i class="fa-solid fa-eye icon-btn" title="View details" onclick="openUserDetail(${req.user_id})"></i>
                </div>
            </td>
        </tr>`).join('');
}

async function loadReports() {
    const grid = qs('#moderationGrid');
    grid.innerHTML = '<div class="text-center text-muted w-100 p-4">Loading reports...</div>';

    let data;
    try {
        data = await api(adminUrl('api/admin/reports.php', adminState.reports));
    } catch (e) {
        grid.innerHTML = `<div class="text-center text-danger w-100 p-4">${escapeHTML(e.message)}</div>`;
        return;
    }

    const label = adminState.reports.status.charAt(0).toUpperCase() + adminState.reports.status.slice(1);
    qs('#reportsCountBadge').textContent = data.reports.length + ' ' + label;

    if (!data.reports.length) {
        grid.innerHTML = `<div class="text-center text-muted w-100 p-4">No ${label.toLowerCase()} reports</div>`;
        return;
    }

    grid.innerHTML = data.reports.map(rep => {
        let iconClass = 'fa-triangle-exclamation';
        let headerClass = 'spam';
        if (rep.reason === 'harassment') { iconClass = 'fa-ban'; headerClass = 'harassment'; }
        else if (rep.reason === 'copyright') { iconClass = 'fa-copyright'; headerClass = 'copyright'; }
        const canAct = adminState.reports.status === 'pending';

        return `
        <div class="mod-card" data-id="${rep.id}">
            <div class="mod-card-header ${headerClass}">
                <div><i class="fa-solid ${iconClass}"></i> ${escapeHTML((rep.reason_label || rep.reason).toUpperCase())}</div>
                <span class="mod-time">${escapeHTML(rep.time)}</span>
            </div>
            <div class="mod-card-body">
                ${rep.post_image ? `<img src="${mediaUrl(rep.post_image)}" style="max-width:100%; max-height:100px; border-radius:4px; margin-bottom:8px; object-fit:cover;">` : ''}
                <p><i>"${escapeHTML(rep.post_content)}"</i></p>
                <div class="mod-reported-by">By: <strong>${escapeHTML(rep.author_name)}</strong>${rep.author_banned ? ' <span class="text-danger">(suspended)</span>' : ''}</div>
                <div class="mod-reported-by">Reported by: <strong>${escapeHTML(rep.reporter_name)}</strong></div>
            </div>
            <div class="mod-actions">
                ${canAct ? `
                <button class="mod-btn dismiss" onclick="handleReport(${rep.id}, 'dismiss')">Dismiss</button>
                <button class="mod-btn delete" onclick="handleReport(${rep.id}, 'delete')">Delete Post</button>
                ` : `<span class="mod-btn dismiss" style="cursor:default;">${escapeHTML(rep.status)}</span>
                      <button class="mod-btn delete" onclick="openUserDetail(${rep.post_author_id})">View author</button>`}
            </div>
        </div>`;
    }).join('');
}

window.handleVerify = function (id, action) {
    const name = (adminState.requestNames && adminState.requestNames[id]) || `request #${id}`;
    const actionText = action === 'accept' ? 'Accept' : 'Reject';
    showModal(
        `${actionText} Verification`,
        `Are you sure you want to ${action} the verification request for ${name}?`,
        async () => {
            try {
                await api('api/admin/handle_join.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, action })
                });
                toast(`Request ${action}ed successfully`);
                await Promise.all([loadVerifications(), loadStats()]);
            } catch (err) {
                alert(err.message);
            }
        }
    );
};

window.handleReport = function (id, action) {
    const actionText = action === 'delete' ? 'Delete Post' : 'Dismiss Report';
    showModal(
        `Confirm ${actionText}`,
        `You are about to perform "${actionText}" on this reported content. Proceed?`,
        async () => {
            try {
                await api('api/admin/handle_report.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id, action })
                });
                toast(`Report ${action}ed`);
                await Promise.all([loadReports(), loadStats()]);
            } catch (err) {
                alert(err.message);
            }
        }
    );
};

/* ─── Audit log ─────────────────────────────────────────── */

function bindLogControls() {
    qs('#logSearch').addEventListener('input', debounce(() => {
        adminState.logsFilter.q = qs('#logSearch').value.trim();
        loadLogs(true);
    }, 300));

    qs('#logAction').addEventListener('change', (e) => {
        adminState.logsFilter.action = e.target.value;
        loadLogs(true);
    });

    qs('#logTarget').addEventListener('change', (e) => {
        adminState.logsFilter.target_type = e.target.value;
        loadLogs(true);
    });

    qs('#btnLoadMoreLogs').addEventListener('click', () => loadLogs(false));
}

async function loadLogs(reset) {
    const tbody = qs('#logsTbody');
    if (reset) {
        adminState.logs = [];
        adminState.logOffset = 0;
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Loading log...</td></tr>';
    }

    let data;
    try {
        data = await api(adminUrl('api/admin/logs.php', {
            ...adminState.logsFilter,
            offset: adminState.logOffset
        }));
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${escapeHTML(e.message)}</td></tr>`;
        return;
    }

    adminState.logs = reset ? data.logs : adminState.logs.concat(data.logs);
    adminState.logOffset = data.offset + data.logs.length;
    adminState.logHasMore = data.has_more;

    const actions = qs('#logAction');
    if (actions.options.length <= 1 && data.actions.length) {
        const first = actions.querySelector('option');
        actions.innerHTML = '';
        actions.appendChild(first);
        data.actions.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a;
            opt.textContent = a.replace(/_/g, ' ');
            actions.appendChild(opt);
        });
        actions.value = adminState.logsFilter.action;
    }

    if (!adminState.logs.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No log entries</td></tr>';
    } else {
        tbody.innerHTML = adminState.logs.map(l => `
            <tr>
                <td>
                    <div class="user-cell">
                        <img src="${mediaUrl(l.admin_avatar)}" class="avatar" style="width:32px;height:32px;" alt="Admin">
                        <div class="user-info">
                            <span class="user-name">${escapeHTML(l.admin_name || 'System')}</span>
                            <span class="user-email">#${l.admin_id}</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge muted-badge">${escapeHTML(l.action.replace(/_/g, ' '))}</span></td>
                <td class="text-sm">
                    ${escapeHTML(l.target_type)}${l.target_name ? ` · <a href="profile.html?id=${l.target_id}" class="text-primary fw-600">${escapeHTML(l.target_name)}</a>` : ` #${l.target_id}`}
                </td>
                <td class="text-sm text-muted">${escapeHTML(l.details || '—')}</td>
                <td class="text-muted text-sm" title="${escapeHTML(l.created_at)}">${escapeHTML(l.time)}</td>
            </tr>`).join('');
    }

    qs('#logsCountBadge').textContent = data.total + ' entries';
    qs('#btnLoadMoreLogs').hidden = !data.has_more;
}

async function exportLogsCsv() {
    let data;
    try {
        data = await api(adminUrl('api/admin/logs.php', { ...adminState.logsFilter, limit: 200, offset: 0 }));
    } catch (e) {
        alert(e.message);
        return;
    }

    if (!data.logs.length) {
        toast('No log entries to export');
        return;
    }

    const headers = ['id', 'admin_id', 'admin_name', 'action', 'target_type', 'target_id', 'details', 'created_at'];
    const escapeCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [headers.join(',')];
    data.logs.forEach(l => rows.push(headers.map(h => escapeCell(l[h])).join(',')));

    const blob = new Blob([rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `uiusocial-admin-log-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast(`Exported ${data.logs.length} log entries`);
}
