let currentChatUserId = null;
let chatPollInterval = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    await setupMessagesPage();
});

async function setupMessagesPage() {
    setCurrentUserAvatar();
    await renderChatList();

    const urlParams = new URLSearchParams(window.location.search);
    const initialUserId = urlParams.get('user');
    if (initialUserId) {
        selectChat(initialUserId);
    } else {
        showEmptyState(true);
    }

    const sendBtn = document.getElementById('chat-send-btn');
    sendBtn?.addEventListener('click', sendTextMessage);

    const inputField = document.getElementById('chat-input-field');
    inputField?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendTextMessage();
    });

    const toggleInfoBtn = document.getElementById('toggle-info-btn');
    const userInfoPane = document.getElementById('user-info-pane');
    toggleInfoBtn?.addEventListener('click', () => {
        const isHidden = !userInfoPane.style.display || userInfoPane.style.display === 'none';
        userInfoPane.style.display = isHidden ? 'flex' : 'none';
        toggleInfoBtn.classList.toggle('text-primary', isHidden);
    });

    const blockBtn = document.getElementById('block-action-btn');
    blockBtn?.addEventListener('click', handleBlockToggle);

    const searchInput = document.getElementById('chat-search-input');
    searchInput?.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll('.chat-item').forEach(item => {
            const name = item.querySelector('.chat-item-name')?.textContent.toLowerCase() || '';
            const preview = item.querySelector('.chat-item-preview')?.textContent.toLowerCase() || '';
            item.style.display = (name.includes(q) || preview.includes(q)) ? '' : 'none';
        });
    });
}

function setCurrentUserAvatar() {
    if (!window.currentUser?.avatar) return;
    const src = mediaUrl(window.currentUser.avatar);
    const avatarImg = document.getElementById('current-user-avatar') || document.querySelector('.header-user .avatar');
    if (avatarImg) avatarImg.src = src;
}

function showEmptyState(show) {
    const empty = document.getElementById('chat-empty-state');
    const header = document.getElementById('chat-area-header');
    const messages = document.getElementById('chat-messages-container');
    const inputArea = document.getElementById('chat-input-area');
    const infoPane = document.getElementById('user-info-pane');

    if (empty) empty.style.display = show ? 'flex' : 'none';
    if (header) header.style.display = show ? 'none' : 'flex';
    if (messages) messages.style.display = show ? 'none' : 'flex';
    if (inputArea) inputArea.style.display = show ? 'none' : 'flex';
    if (infoPane) infoPane.style.display = show ? 'none' : 'flex';
}

async function renderChatList() {
    const chatItems = document.getElementById('chat-items-container') || document.querySelector('.chat-items');
    if (!chatItems) return;
    try {
        const data = await api('api/messages/users.php');
        const users = data.users || [];

        chatItems.innerHTML = users.map(u => `
            <div class="chat-item ${u.blocked ? 'blocked-chat' : ''}" data-user-id="${u.id}" onclick="selectChat(${u.id})" style="cursor:pointer;">
                <div class="chat-avatar-wrapper">
                    <img src="${mediaUrl(u.avatar)}" class="avatar" alt="${escapeHTML(u.name)}">
                    <div class="chat-status ${u.is_online ? 'online' : ''}"></div>
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-header">
                        <span class="chat-item-name">${escapeHTML(u.name)}</span>
                        <span class="chat-item-time">${u.last_time || ''}</span>
                    </div>
                    <div class="chat-item-preview">
                        <span class="badge ${u.role === 'faculty' ? 'faculty' : 'student'}" style="font-size:8px;padding:2px 4px;">${u.role.toUpperCase()}</span>
                        ${u.blocked ? '<span style="color:#dc3545;font-size:12px;"> Blocked</span>' : escapeHTML(u.last_message || 'No messages yet')}
                    </div>
                </div>
            </div>
        `).join('');

        if (!users.length) {
            chatItems.innerHTML = '<div class="text-muted text-center p-3">No users to message yet.</div>';
        }
    } catch (e) {
        console.error('Failed to load message users', e);
    }
}

async function selectChat(userId) {
    currentChatUserId = userId;
    showEmptyState(false);

    document.querySelectorAll('.chat-item').forEach(el => {
        el.classList.toggle('active', String(el.dataset.userId) === String(userId));
    });

    if (chatPollInterval) clearInterval(chatPollInterval);

    await loadChatThread(userId);
    await loadChatUserInfo(userId);

    chatPollInterval = setInterval(() => loadChatThread(userId, true), 3000);
}

async function loadChatThread(userId, silent = false) {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;
    try {
        const data = await api(`api/messages/thread.php?user_id=${userId}`);
        const messages = data.messages || [];
        const wasBlocked = data.blocked;

        if (!silent) {
            container.innerHTML = '';
        }

        const existingIds = new Set(
            Array.from(container.querySelectorAll('[data-msg-id]')).map(el => el.dataset.msgId)
        );

        messages.forEach(msg => {
            if (!existingIds.has(String(msg.id))) {
                const row = document.createElement('div');
                row.className = `msg-row ${msg.mine ? 'sent' : 'received'}`;
                row.dataset.msgId = msg.id;
                row.innerHTML = `
                    <div>
                        <div class="msg-bubble">${escapeHTML(msg.content)}</div>
                        <span class="msg-time">${msg.time}${msg.mine ? ' <i class="fa-solid fa-check-double text-primary"></i>' : ''}</span>
                    </div>`;
                container.appendChild(row);
            }
        });

        container.scrollTop = container.scrollHeight;

        const inputField = document.getElementById('chat-input-field');
        const sendBtn = document.getElementById('chat-send-btn');
        if (wasBlocked) {
            if (inputField) { inputField.disabled = true; inputField.placeholder = 'This conversation is blocked.'; }
            if (sendBtn) sendBtn.style.opacity = '0.4';
        } else {
            if (inputField) { inputField.disabled = false; inputField.placeholder = 'Type your message...'; }
            if (sendBtn) sendBtn.style.opacity = '1';
        }

        const blockBtn = document.getElementById('block-action-btn');
        if (blockBtn) {
            const user = (window.globalUsers || []).find(u => String(u.id) === String(userId));
            const name = user ? user.name.split(' ')[0] : 'User';
            blockBtn.innerHTML = wasBlocked
                ? `<i class="fa-solid fa-check-circle"></i> Unblock ${name}`
                : `<i class="fa-solid fa-ban"></i> Block ${name}`;
            blockBtn.dataset.blocked = wasBlocked ? '1' : '0';
        }
    } catch (e) {
        console.error('Thread load failed', e);
    }
}

async function loadChatUserInfo(userId) {
    const user = (window.globalUsers || []).find(u => String(u.id) === String(userId));

    const headerTitle = document.getElementById('chat-header-title');
    const headerMeta = document.getElementById('chat-header-meta');
    const headerAvatar = document.getElementById('chat-header-avatar');
    const infoAvatar = document.getElementById('info-avatar');
    const infoName = document.getElementById('info-name');
    const infoRole = document.getElementById('info-role');
    const infoBadges = document.getElementById('info-badges');
    const infoProfileBtn = document.getElementById('info-view-profile-btn');

    if (user) {
        const roleClass = user.role === 'faculty' ? 'faculty' : 'student';
        if (headerTitle) headerTitle.innerHTML = `${escapeHTML(user.name)} <span class="badge ${roleClass}">${user.role.toUpperCase()}</span>`;
        if (headerMeta) headerMeta.innerHTML = `<span class="dot text-success" style="width:6px;height:6px;"></span> ${escapeHTML(user.department || '')} • ${user.is_online ? 'Online' : 'Offline'}`;
        if (headerAvatar) { headerAvatar.src = mediaUrl(user.avatar); }
        if (infoAvatar) { infoAvatar.src = mediaUrl(user.avatar); infoAvatar.dataset.userId = user.id; }
        if (infoName) { infoName.textContent = user.name; infoName.dataset.userId = user.id; }
        if (infoRole) infoRole.textContent = user.department || '';
        if (infoBadges) infoBadges.innerHTML = `<span class="badge ${roleClass}">${user.role.toUpperCase()}</span>`;
        if (infoProfileBtn) infoProfileBtn.href = `profile.html?id=${user.id}`;
    }
}

async function sendTextMessage() {
    if (!guardAction()) return;
    if (!currentChatUserId) return;

    const inputField = document.getElementById('chat-input-field');
    const content = (inputField?.value || '').trim();
    if (!content) return;

    inputField.value = '';
    try {
        await api('api/messages/send.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver_id: currentChatUserId, content })
        });
        await loadChatThread(currentChatUserId);
        renderChatList();
    } catch (err) { alert(err.message); }
}

async function handleBlockToggle() {
    if (!currentChatUserId) return;
    if (!guardAction()) return;

    const user = (window.globalUsers || []).find(u => String(u.id) === String(currentChatUserId));
    const name = user ? user.name : 'this user';
    const blockBtn = document.getElementById('block-action-btn');
    const isBlocked = blockBtn?.dataset.blocked === '1';

    showModal(
        isBlocked ? 'Unblock User' : 'Block User',
        isBlocked
            ? `Unblock ${name}? You'll be able to message them again.`
            : `Block ${name}? They won't be able to message you.`,
        async () => {
            try {
                const data = await api('api/messages/block.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: currentChatUserId })
                });
                toast(data.blocked ? 'User blocked' : 'User unblocked');
                await loadChatThread(currentChatUserId);
                renderChatList();
            } catch (err) { alert(err.message); }
        }
    );
}