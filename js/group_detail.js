document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    await loadGroupDetail();
    setupTabs();
});

let currentGroupId = null;
let currentGroup = null;

async function loadGroupDetail() {
    const params = new URLSearchParams(window.location.search);
    currentGroupId = parseInt(params.get('id'));
    if (!currentGroupId) {
        document.getElementById('group-name').textContent = 'Group not found';
        return;
    }

    try {
        const data = await api(`api/groups/get.php?id=${currentGroupId}`);
        currentGroup = data.group;
        renderGroupHeader(currentGroup);
        await renderGroupPosts();
        renderGroupMembers(data.members, currentGroup.is_manager);
        
        if (currentGroup.is_manager) {
            renderJoinRequests(data.requests || []);
        }
    } catch (e) {
        console.error('Failed to load group details', e);
        document.getElementById('group-name').textContent = 'Group not found';
    }
}

function renderGroupHeader(group) {
    document.title = group.name + ' - UIU Social';

    const cover = document.getElementById('group-cover');
    if (cover) {
        cover.style.background = group.image ? `url('${mediaUrl(group.image)}') center/cover no-repeat` : 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    }

    const avatarImg = document.getElementById('group-avatar-img');
    if (avatarImg) {
        avatarImg.src = mediaUrl(group.image || 'assets/images/groups/default.png');
    }

    document.getElementById('group-name').textContent = group.name;
    document.getElementById('group-category').textContent = (group.category || 'general').toUpperCase();
    document.getElementById('group-members').textContent = group.members_count;
    document.getElementById('group-about').textContent = group.description || 'No description provided.';
    document.getElementById('group-created').textContent = new Date(group.created_at).toLocaleDateString();

    // Populate the create-post avatar with current user's avatar
    const postAvatar = document.getElementById('group-post-avatar');
    if (postAvatar) {
        postAvatar.src = mediaUrl(currentUser?.avatar || 'assets/images/students/default.png');
    }

    const actions = document.getElementById('group-header-actions');
    if (actions) {
        if (group.is_manager) {
            actions.innerHTML = `<button class="btn btn-outline" disabled><i class="fa-solid fa-user-shield"></i> Group Admin</button>`;
        } else if (group.membership === 'member') {
            actions.innerHTML = `<button class="btn btn-action" disabled><i class="fa-solid fa-check"></i> Joined</button>`;
        } else if (group.membership === 'requested') {
            actions.innerHTML = `
                <div class="d-flex gap-2">
                    <button class="btn btn-outline" disabled>Pending Approval</button>
                    <button class="btn btn-outline btn-cancel-join" id="group-cancel-join-btn"><i class="fa-solid fa-xmark"></i> Cancel Request</button>
                </div>`;
            document.getElementById('group-cancel-join-btn')?.addEventListener('click', async (e) => {
                if (!guardAction(e)) return;
                showModal('Cancel Join Request?', 'Are you sure you want to cancel your join request?', async () => {
                    try {
                        await api('api/groups/leave.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ group_id: currentGroupId })
                        });
                        toast('Join request cancelled');
                        loadGroupDetail();
                    } catch (err) { alert(err.message); }
                });
            });
        } else {
            actions.innerHTML = `<button class="btn btn-primary" id="group-join-btn"><i class="fa-solid fa-plus"></i> Join Group</button>`;
            document.getElementById('group-join-btn').addEventListener('click', async (e) => {
                if (!guardAction(e)) return;
                showModal('Join ' + group.name + '?', 'Are you sure you want to request membership?', async () => {
                    try {
                        await api('api/groups/join.php', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ group_id: currentGroupId })
                        });
                        toast('Join request sent');
                        loadGroupDetail();
                    } catch (err) { alert(err.message); }
                });
            });
        }
    }

    // Show post box for everyone (but only allow posting if member)
    const createPost = document.getElementById('group-create-post');
    if (createPost) createPost.style.display = 'block';
    
    const isMember = group.is_manager || group.membership === 'member';
    const submitBtn = document.getElementById('group-submit-post-btn');
    const postInput = document.getElementById('group-post-input');
    
    if (submitBtn) {
        submitBtn.disabled = !isMember;
        if (!isMember) {
            submitBtn.title = 'Join the group to post';
        }
    }
    if (postInput) {
        postInput.placeholder = isMember ? 'Post to group...' : 'Join the group to post...';
    }
    
    submitBtn?.addEventListener('click', async (e) => {
        if (!isMember) {
            toast('Join the group to post');
            return;
        }
        if (!guardAction(e)) return;
        const text = postInput.value.trim();
        if (!text) return;
        
        const btn = e.target;
        btn.disabled = true;
        try {
            const fd = new FormData();
            fd.append('content', text);
            fd.append('group_id', currentGroupId);
            await api('api/posts/create_post.php', { method: 'POST', body: fd });
            postInput.value = '';
            toast('Posted to group');
            await renderGroupPosts();
        } catch (err) {
            alert(err.message);
        } finally {
            btn.disabled = false;
        }
    });
}

async function renderGroupPosts() {
    const container = document.getElementById('group-posts-container');
    if (!container) return;
    try {
        const data = await api(`api/posts/get_posts.php?group_id=${currentGroupId}`);
        const posts = data.posts || [];
        if (posts.length === 0) {
            container.innerHTML = '<div class="text-center text-muted p-4">No posts in this group yet.</div>';
            return;
        }
        
        container.innerHTML = '';
        posts.forEach(post => {
            let extra = '';
            // Group managers get their own delete; admins use the shield action from postCardHTML
            if (currentGroup.is_manager && !isAdminUser()) {
                extra = `<i class="fa-solid fa-trash text-danger" style="cursor:pointer;" title="Delete Post" onclick="deleteGroupPost(${post.id})"></i>`;
            }
            container.insertAdjacentHTML('beforeend', postCardHTML(post, extra, { showOwnerDelete: false }));
        });
        bindPostInteractions(container);
        window.reloadPosts = () => renderGroupPosts();
    } catch (e) {
        container.innerHTML = '<div class="text-center text-muted p-4">Failed to load posts</div>';
    }
}

window.deleteGroupPost = async function(postId) {
    if (!guardAction()) return;
    showModal('Delete Post?', 'Are you sure you want to delete this post from the group?', async () => {
        try {
            await api('api/posts/delete.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ post_id: postId })
            });
            toast('Post deleted');
            renderGroupPosts();
        } catch (e) { alert(e.message); }
    });
};

function renderGroupMembers(members, isManager) {
    const container = document.getElementById('group-members-list');
    if (!container) return;
    if (!members || members.length === 0) {
        container.innerHTML = '<div class="text-muted">No members found.</div>';
        return;
    }
    
    // Users 1,2,3,4 are admins
    const adminIds = [1, 2, 3, 4];
    
    container.innerHTML = members.map(m => {
        const isAdmin = adminIds.includes(m.user_id) || m.role === 'admin';
        const roleLabel = isAdmin ? 'Admin' : 'Member';
        return `
            <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                <div class="d-flex align-items-center gap-2">
                    <img src="${mediaUrl(m.avatar)}" class="avatar user-profile-link" data-user-id="${m.user_id || m.id}" style="width:36px;height:36px;object-fit:cover;">
                    <div>
                        <div class="fw-600 user-profile-link" data-user-id="${m.user_id || m.id}">${escapeHTML(m.name)}</div>
                        <div class="text-sm text-muted">${roleLabel}</div>
                    </div>
                </div>
                ${isManager && !isAdmin ? `<button class="group-kick-btn" onclick="kickGroupMember(${m.user_id || m.id})">Kick</button>` : ''}
            </div>
        `;
    }).join('');
}

window.kickGroupMember = async function(userId) {
    if (!guardAction()) return;
    showModal('Kick Member?', 'Are you sure you want to remove this member from the group?', async () => {
        try {
            await api('api/groups/kick.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ group_id: currentGroupId, user_id: userId })
            });
            toast('Member kicked');
            loadGroupDetail();
        } catch (e) { alert(e.message); }
    });
};

function renderJoinRequests(requests) {
    const reqCard = document.getElementById('group-join-requests');
    const reqList = document.getElementById('group-requests-list');
    if (!reqCard || !reqList) return;
    
    if (requests.length === 0) {
        reqCard.style.display = 'none';
        return;
    }
    
    reqCard.style.display = 'block';
    reqList.innerHTML = requests.map(r => `
        <div class="d-flex flex-column gap-2 mb-3 border-bottom pb-2">
            <div class="d-flex align-items-center gap-2">
                <img src="${mediaUrl(r.avatar)}" class="avatar" style="width:28px;height:28px;object-fit:cover;">
                <div class="fw-600 text-sm">${escapeHTML(r.name)}</div>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-primary btn-sm w-100" onclick="handleGroupJoin(${r.id}, 'approve')">Approve</button>
                <button class="btn btn-outline btn-sm w-100" onclick="handleGroupJoin(${r.id}, 'reject')">Reject</button>
            </div>
        </div>
    `).join('');
}

window.handleGroupJoin = async function(userId, action) {
    if (!guardAction()) return;
    try {
        await api('api/groups/handle_join.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ group_id: currentGroupId, user_id: userId, action })
        });
        toast('Request ' + action + 'd');
        loadGroupDetail();
    } catch (e) { alert(e.message); }
};

function setupTabs() {
    const tabs = document.querySelectorAll('.profile-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.dataset.tab;
            document.getElementById('tab-feed').style.display = 'none';
            document.getElementById('tab-members').style.display = 'none';
            document.getElementById('tab-activities').style.display = 'none';
            document.getElementById('tab-' + tabName).style.display = 'block';
        });
    });
}