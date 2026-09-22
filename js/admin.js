document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    if (!isAdminUser()) {
        window.location.href = 'index.html';
        return;
    }
    setupAdminPage();
});

async function setupAdminPage() {
    await loadVerifications();
    await loadReports();

    // Handle Top Action Buttons (Filters, Export Logs)
    const headerButtons = document.querySelectorAll('.page-content > .d-flex .btn');
    headerButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.textContent.trim();
            showModal(action, `${action} functionality will be available in the backend integration phase.`, null);
        });
    });
}

async function loadVerifications() {
    try {
        const data = await api('api/admin/join_requests.php');
        const tbody = document.querySelector('.admin-table tbody');
        if (!tbody) return;
        
        document.querySelector('.section-header .badge-pill').textContent = `${data.requests.length} Pending`;

        if (data.requests.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No pending verifications</td></tr>';
            return;
        }

        tbody.innerHTML = data.requests.map(req => `
            <tr data-id="${req.id}">
                <td>
                    <div class="user-cell user-profile-link" data-user-id="${req.user_id}" style="cursor:pointer;">
                        <img src="${mediaUrl(req.avatar)}" class="avatar" style="width:36px;height:36px;" alt="Avatar">
                        <div class="user-info">
                            <span class="user-name" style="color: var(--primary-color);">${escapeHTML(req.name)}</span>
                            <span class="user-email">${escapeHTML(req.email)}</span>
                        </div>
                    </div>
                </td>
                <td><span class="badge ${req.requested_role.toLowerCase() === 'faculty' ? 'faculty' : 'student'}">${escapeHTML(req.requested_role)}</span></td>
                <td class="text-muted text-sm">${new Date(req.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="action-icons">
                        <i class="fa-solid fa-xmark icon-btn reject" title="Reject" onclick="handleVerify(${req.id}, 'reject', '${escapeHTML(req.name)}')"></i>
                        <i class="fa-solid fa-circle-check icon-btn accept" title="Accept" onclick="handleVerify(${req.id}, 'accept', '${escapeHTML(req.name)}')"></i>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error(e);
    }
}

async function loadReports() {
    try {
        const data = await api('api/admin/reports.php');
        const grid = document.querySelector('.moderation-grid');
        if (!grid) return;
        
        const headerBadge = document.querySelector('.card .section-header .badge-pill.ml-auto');
        if (headerBadge) {
            headerBadge.textContent = `${data.reports.length} Pending`;
        }

        if (data.reports.length === 0) {
            grid.innerHTML = '<div class="text-center text-muted w-100 p-4">No pending reports</div>';
            return;
        }

        grid.innerHTML = data.reports.map(rep => {
            let iconClass = 'fa-triangle-exclamation';
            let headerClass = 'spam';
            if (rep.reason === 'harassment') { iconClass = 'fa-ban'; headerClass = 'harassment'; }
            else if (rep.reason === 'copyright') { iconClass = 'fa-copyright'; headerClass = 'copyright'; }

            return `
            <div class="mod-card" data-id="${rep.id}">
                <div class="mod-card-header ${headerClass}">
                    <div><i class="fa-solid ${iconClass}"></i> ${escapeHTML(rep.reason_label.toUpperCase())}</div>
                    <span class="mod-time">${escapeHTML(rep.time)}</span>
                </div>
                <div class="mod-card-body">
                    ${rep.post_image ? `<img src="${mediaUrl(rep.post_image)}" style="max-width:100%; max-height:100px; border-radius:4px; margin-bottom:8px; object-fit:cover;">` : ''}
                    <p><i>"${escapeHTML(rep.post_content)}"</i></p>
                    <div class="mod-reported-by">Reported by: <strong>${escapeHTML(rep.reporter_name)}</strong></div>
                </div>
                <div class="mod-actions">
                    <button class="mod-btn dismiss" onclick="handleReport(${rep.id}, 'dismiss')">Dismiss</button>
                    <button class="mod-btn delete" onclick="handleReport(${rep.id}, 'delete')">Delete Post</button>
                </div>
            </div>`;
        }).join('');
    } catch (e) {
        console.error(e);
    }
}

window.handleVerify = function(id, action, name) {
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
                loadVerifications();
            } catch (err) {
                alert(err.message);
            }
        }
    );
};

window.handleReport = function(id, action) {
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
                loadReports();
            } catch (err) {
                alert(err.message);
            }
        }
    );
};
