document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    setupGroupsPage();
});

async function setupGroupsPage() {
    await loadGroups();
    setupCreateGroupButton();
    setupFilterButtons();
}

let allGroups = [];

async function loadGroups() {
    try {
        const data = await api('api/groups/list.php');
        allGroups = data.groups || [];
        renderGroupsList(allGroups);
    } catch (e) {
        console.error('Failed to load groups', e);
    }
}

function renderGroupsList(groups) {
    const grid = document.querySelector('.groups-grid');
    const side = document.querySelector('.groups-side');
    const featured = document.querySelector('.featured-group');

    if (!grid) return;

    // Clear existing hardcoded items
    grid.innerHTML = '';
    if (side) side.innerHTML = '';
    if (featured) featured.style.display = 'none';

    if (groups.length === 0) {
        grid.innerHTML = '<div class="text-center text-muted w-100 p-4">No groups found.</div>';
        return;
    }

    groups.forEach((group) => {
        const isMember = group.is_enrolled;
        const isAdmin = group.is_manager;
        const isRequested = group.membership === 'requested';

        // Build action area: max 2 buttons
        let btnHTML = '';
        if (isMember || isAdmin) {
            // State: already enrolled / admin
            btnHTML = `
                <div class="d-flex gap-2 w-100">
                    <button class="btn-join btn-joined" disabled><i class="fa-solid fa-check"></i> Joined</button>
                    <button class="btn-join btn-view-group" onclick="window.location.href='group_detail.html?id=${group.id}'">View</button>
                </div>`;
        } else if (isRequested) {
            // State: request pending
            btnHTML = `
                <div class="d-flex gap-2 w-100">
                    <button class="btn-join btn-cancel-request" data-id="${group.id}">Cancel</button>
                    <button class="btn-join btn-view-group" onclick="window.location.href='group_detail.html?id=${group.id}'">View</button>
                </div>`;
        } else {
            // State: not a member
            btnHTML = `
                <div class="d-flex gap-2 w-100">
                    <button class="btn-join btn-join-group" data-id="${group.id}" data-name="${escapeHTML(group.name)}"><i class="fa-solid fa-plus"></i> Join</button>
                    <button class="btn-join btn-view-group" onclick="window.location.href='group_detail.html?id=${group.id}'">View</button>
                </div>`;
        }

        const imageStyle = group.image
            ? `background: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('${mediaUrl(group.image)}') center/cover no-repeat;`
            : `background: linear-gradient(135deg, var(--primary-color), #ff8c00);`;

        const cardHTML = `
            <div class="group-card" data-id="${group.id}" data-category="${escapeHTML(group.category || 'other')}" data-enrolled="${isMember || isAdmin ? 'true' : 'false'}">
                <div class="group-image-header" style="${imageStyle}">
                    <div class="group-title-overlay">${escapeHTML(group.name)}</div>
                    ${isAdmin ? '<span style="position:absolute;top:8px;right:8px;background:var(--primary-color);color:#fff;font-size:10px;padding:2px 8px;border-radius:10px;">ADMIN</span>' : ''}
                </div>
                <div class="group-desc">${escapeHTML(group.description || 'A community group.')}</div>
                <div class="group-footer">
                    <span class="group-members"><i class="fa-solid fa-user-group"></i> ${group.members_count} Members</span>
                     ${btnHTML}
                </div>
            </div>`;

        grid.insertAdjacentHTML('beforeend', cardHTML);
    });

    // Bind join buttons
    grid.querySelectorAll('.btn-join-group').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!guardAction(e)) return;
            const id = btn.dataset.id;
            const name = btn.dataset.name;
            showModal(
                `Join ${name}?`,
                `Your request will be sent to the group admin for approval.`,
                async () => {
                    try {
                        await api('api/groups/join.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ group_id: id })
                        });
                        toast('Join request sent!');
                        loadGroups();
                    } catch (err) { alert(err.message); }
                }
            );
        });
    });

    // Bind cancel request buttons
    grid.querySelectorAll('.btn-cancel-request').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (!guardAction(e)) return;
            const id = btn.dataset.id;
            showModal(
                'Cancel Join Request?',
                'Are you sure you want to cancel your join request?',
                async () => {
                    try {
                        await api('api/groups/leave.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ group_id: id })
                        });
                        toast('Join request cancelled');
                        loadGroups();
                    } catch (err) { alert(err.message); }
                }
            );
        });
    });

    // Update badge count
    const badge = document.querySelector('.badge-pill.ml-auto, .badge-pill');
    if (badge) {
        const pending = allGroups.filter(g => g.has_join_requests).length;
    }
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            const filterValue = e.currentTarget.getAttribute('data-filter');

            let filtered = allGroups;
            if (filterValue === 'enrolled') {
                filtered = allGroups.filter(g => g.is_enrolled || g.is_manager);
            } else if (filterValue !== 'all') {
                filtered = allGroups.filter(g => (g.category || '').toLowerCase() === filterValue.toLowerCase());
            }
            renderGroupsList(filtered);
        });
    });

    const topFilterBtn = Array.from(document.querySelectorAll('.btn-outline')).find(b => b.textContent.includes('Filter'));
    if (topFilterBtn) {
        topFilterBtn.addEventListener('click', () => {
            showModal('Advanced Filters', 'Advanced filtering options will be available in the next update.', null);
        });
    }
}

function setupCreateGroupButton() {
    const createGroupBtn = Array.from(document.querySelectorAll('.btn-primary')).find(b => b.textContent.includes('Create Group'));
    if (!createGroupBtn) return;

    createGroupBtn.addEventListener('click', (e) => {
        if (!guardAction(e)) return;
        openCreateGroupModal();
    });
}

function openCreateGroupModal() {
    const overlay = document.createElement('div');
    overlay.id = 'create-group-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;backdrop-filter:blur(4px);';

    overlay.innerHTML = `
        <div style="background:white;border-radius:16px;padding:32px;width:480px;max-width:95vw;box-shadow:0 24px 60px rgba(0,0,0,0.2);">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                <div>
                    <h3 style="margin:0;font-size:18px;">Create New Group</h3>
                    <p style="margin:0;font-size:13px;color:#777;">Fill in the details for your group</p>
                </div>
            </div>

            <form id="create-group-form" enctype="multipart/form-data">
                <div style="margin-bottom:16px;">
                    <label style="font-size:13px;font-weight:600;color:#444;display:block;margin-bottom:6px;">Group Name <span style="color:red;">*</span></label>
                    <input id="cg-name" name="name" type="text" placeholder="e.g. Web Programming Study Group"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box;">
                </div>

                <div style="margin-bottom:16px;">
                    <label style="font-size:13px;font-weight:600;color:#444;display:block;margin-bottom:6px;">Department</label>
                    <select id="cg-dept" name="category"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box;background:white;">
                        <option value="cs">Computer Science</option>
                        <option value="ee">Electrical Engineering</option>
                        <option value="bba">Business Administration</option>
                        <option value="math">Mathematics</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div style="margin-bottom:16px;">
                    <label style="font-size:13px;font-weight:600;color:#444;display:block;margin-bottom:6px;">Description</label>
                    <textarea id="cg-desc" name="description" rows="3" placeholder="What is this group about?"
                        style="width:100%;padding:10px 14px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;box-sizing:border-box;resize:vertical;font-family:inherit;"></textarea>
                </div>

                <div style="margin-bottom:24px;">
                    <label style="font-size:13px;font-weight:600;color:#444;display:block;margin-bottom:6px;">Group Image (optional)</label>
                    <input type="file" name="image" id="cg-image" accept="image/*"
                        style="width:100%;padding:8px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;box-sizing:border-box;">
                </div>

                <div style="display:flex;gap:12px;justify-content:flex-end;">
                    <button type="button" id="cg-cancel" style="padding:10px 24px;border:1.5px solid #e2e8f0;border-radius:8px;background:white;color:#555;font-size:14px;font-weight:600;cursor:pointer;">Cancel</button>
                    <button type="submit" style="padding:10px 24px;border:none;border-radius:8px;background:var(--primary-color);color:white;font-size:14px;font-weight:600;cursor:pointer;">
                        <i class="fa-solid fa-plus"></i> Create Group
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('cg-cancel').addEventListener('click', () => overlay.remove());

    document.getElementById('create-group-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('cg-name').value.trim();
        if (!name) {
            document.getElementById('cg-name').style.borderColor = 'red';
            return;
        }
        const fd = new FormData(e.target);
        try {
            await api('api/groups/create.php', { method: 'POST', body: fd });
            overlay.remove();
            toast('Group created!');
            loadGroups();
        } catch (err) {
            alert(err.message);
        }
    });
}