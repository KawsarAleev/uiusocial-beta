document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    await setupEventsPage();
});

let allEvents = [];
let currentFilter = 'upcoming';

async function setupEventsPage() {
    const tabs = document.querySelectorAll('.events-tabs .tab');

    // Set initial active tab based on currentFilter
    tabs.forEach(tab => {
        const filter = tab.dataset.filter || 'upcoming';
        if (filter === currentFilter) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Bind tab click handlers
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter || 'upcoming';
            renderEventsGrid();
            renderFeaturedEvent();
            renderSeminars();
        });
    });

    // Show Create Event button for admins
    const createBtn = document.getElementById('create-event-btn');
    if (createBtn && isAdminUser()) {
        createBtn.style.display = '';
    }

    if (createBtn) {
        createBtn.addEventListener('click', (e) => {
            if (!guardAction(e)) return;
            openCreateEventModal();
        });
    }

    // Load events last so grid/tabs are ready
    await loadEvents();
}

function openCreateEventModal() {
    const existing = document.getElementById('create-event-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.className = 'uiu-modal-overlay';
    overlay.id = 'create-event-modal';
    overlay.innerHTML = `
        <div class="uiu-modal-box create-event-box" style="max-width: 540px; max-height: 90vh; overflow-y: auto; text-align: left;">
            <h3 style="text-align: center;">Create New Event</h3>
            <div id="ce-error" class="text-danger" style="display:none; font-size:13px; margin-bottom:12px;"></div>
            <form id="ce-form">
                <div class="ce-form-group">
                    <label class="ce-form-label">Event Title <span style="color:var(--danger-color);">*</span></label>
                    <input type="text" name="title" class="ce-form-control" required placeholder="Enter event title">
                </div>
                <div class="ce-form-group">
                    <label class="ce-form-label">Description</label>
                    <textarea name="description" class="ce-form-control" rows="3" placeholder="Event description..."></textarea>
                </div>
                <div style="display:flex; gap:12px;">
                    <div class="ce-form-group" style="flex:1;">
                        <label class="ce-form-label">Category</label>
                        <select name="category" class="ce-form-control">
                            <option value="seminar">Seminar</option>
                            <option value="workshop">Workshop</option>
                            <option value="conference">Conference</option>
                            <option value="webinar">Webinar</option>
                            <option value="social">Social</option>
                        </select>
                    </div>
                    <div class="ce-form-group" style="flex:1;">
                        <label class="ce-form-label">Event Type</label>
                        <select name="event_type" class="ce-form-control">
                            <option value="in_person">In Person</option>
                            <option value="virtual">Virtual</option>
                        </select>
                    </div>
                </div>
                <div style="display:flex; gap:12px;">
                    <div class="ce-form-group" style="flex:1;">
                        <label class="ce-form-label">Date</label>
                        <input type="date" name="event_date" class="ce-form-control">
                    </div>
                    <div class="ce-form-group" style="flex:1;">
                        <label class="ce-form-label">Time</label>
                        <input type="time" name="event_time" class="ce-form-control">
                    </div>
                </div>
                <div class="ce-form-group">
                    <label class="ce-form-label">Location</label>
                    <input type="text" name="location" class="ce-form-control" placeholder="e.g. Main Auditorium">
                </div>
                <div class="ce-form-group">
                    <label class="ce-form-label">Organizer</label>
                    <input type="text" name="organizer" class="ce-form-control" placeholder="UIU Administration">
                </div>
                <div class="ce-form-group">
                    <label class="ce-form-label">Event Image (Optional)</label>
                    <input type="file" name="image" class="ce-form-control" accept="image/*">
                </div>
                <div class="ce-form-group">
                    <label class="ce-form-label">Or Image URL</label>
                    <input type="url" name="image_url" class="ce-form-control" placeholder="https://...">
                </div>
                <div style="display:flex; gap:8px; justify-content:center; margin-top:16px;">
                    <button type="button" class="btn btn-outline" id="ce-cancel">Cancel</button>
                    <button type="submit" class="btn btn-primary" id="ce-submit"><i class="fa-solid fa-plus"></i> Create Event</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('#ce-cancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

    overlay.querySelector('#ce-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = overlay.querySelector('#ce-submit');
        const errorDiv = overlay.querySelector('#ce-error');
        const fd = new FormData(e.target);

        try {
            btn.disabled = true;
            btn.innerHTML = 'Creating...';
            errorDiv.style.display = 'none';

            const response = await fetch('api/events/create.php', { method: 'POST', body: fd });
            const data = await response.json();

            if (response.ok && data.success) {
                overlay.remove();
                toast('Event created successfully');
                await loadEvents();
            } else {
                errorDiv.textContent = data.error || 'Failed to create event';
                errorDiv.style.display = 'block';
            }
        } catch (err) {
            errorDiv.textContent = 'An error occurred. Please try again.';
            errorDiv.style.display = 'block';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-plus"></i> Create Event';
        }
    });
}

async function loadEvents() {
    try {
        const data = await api('api/events/list.php');
        allEvents = data.events || [];

        renderFeaturedEvent();
        renderEventsGrid();
        renderSeminars();
    } catch (e) {
        console.error('Failed to load events', e);
    }
}

function renderFeaturedEvent() {
    const container = document.getElementById('featured-event');
    if (!container) return;

    const upcoming = allEvents.filter(e => new Date(e.event_date) >= new Date());
    if (upcoming.length === 0) {
        container.style.display = 'none';
        return;
    }

    const event = upcoming[0];
    container.style.display = '';

    const d = new Date(event.event_date);
    const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = d.getDate();

    document.getElementById('featured-img').style.backgroundImage = `url('${mediaUrl(event.image || 'assets/images/events/default.jpg')}')`;
    document.getElementById('featured-date').innerHTML = `<span>${month}</span><strong>${day}</strong>`;
    document.getElementById('featured-badge').textContent = event.event_type === 'virtual' ? 'Virtual' : 'In Person';
    document.getElementById('featured-badge').style.background = event.event_type === 'virtual' ? '#7a7a7a75' : '#7a7a7a75';

    document.getElementById('featured-tags').innerHTML = `<span class="badge" style="background: transparent;">${capitalizeFirst(event.category)}</span>`;
    document.getElementById('featured-title').textContent = event.title;
    document.getElementById('featured-desc').textContent = event.description || '';
    document.getElementById('featured-location').textContent = event.location || 'TBA';
    document.getElementById('featured-attendees').textContent = event.attendees_count || 0;
    document.getElementById('featured-organizer').textContent = event.organizer || 'UIU Administration';

    const joinBtn = document.getElementById('featured-join-btn');
    joinBtn.dataset.id = event.id;
    if (event.joined) {
        joinBtn.innerHTML = '<i class="fa-solid fa-check"></i> Registered';
        joinBtn.disabled = true;
        joinBtn.classList.remove('btn-outline');
        joinBtn.classList.add('btn-primary');
    } else {
        joinBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Register';
        joinBtn.disabled = false;
        joinBtn.classList.remove('btn-primary');
        joinBtn.classList.add('btn-outline');
    }

    // Remove old listeners
    const newBtn = joinBtn.cloneNode(true);
    joinBtn.parentNode.replaceChild(newBtn, joinBtn);
    newBtn.addEventListener('click', async (e) => {
        if (!guardAction(e)) return;
        const id = newBtn.dataset.id;
        try {
            const res = await api('api/events/join.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ event_id: id })
            });
            toast(res.joined ? 'Registered for event' : 'Registration cancelled');
            await loadEvents();
        } catch (err) {
            alert(err.message);
        }
    });
}

function renderEventsGrid() {
    const grid = document.getElementById('events-grid');
    if (!grid) return;

    let filtered = allEvents;
    const now = new Date();

    if (currentFilter === 'upcoming') {
        filtered = allEvents.filter(e => new Date(e.event_date) >= now);
    } else if (currentFilter === 'past') {
        filtered = allEvents.filter(e => new Date(e.event_date) < now);
    } else if (currentFilter === 'registered') {
        filtered = allEvents.filter(e => e.joined);
    }

    if (currentFilter === 'upcoming') {
        const upcoming = allEvents
            .filter(e => new Date(e.event_date) >= now)
            .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        if (upcoming.length > 0) {
            const featuredId = String(upcoming[0].id);
            filtered = filtered.filter(e => String(e.id) !== featuredId);
        }
    }

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: #666; padding: 20px;">No events found for this filter.</div>';
        return;
    }

    grid.innerHTML = filtered.map(event => {
        const d = new Date(event.event_date);
        const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = d.getDate();

        let actionBtn = '';
        if (event.joined) {
            actionBtn = `<button class="btn btn-primary w-100 btn-sm" disabled><i class="fa-solid fa-check"></i> Registered</button>`;
        } else {
            actionBtn = `<button class="btn btn-outline w-100 btn-sm btn-join-event" data-id="${event.id}"><i class="fa-solid fa-plus"></i> Register</button>`;
        }

        return `
            <div class="event-card" data-event-id="${event.id}" style="cursor:pointer;">
                <div class="event-card-header" style="background: url('${mediaUrl(event.image || 'assets/images/events/default.jpg')}') center/cover no-repeat; height: 140px; position: relative;">
                    <div class="event-card-date">
                        <span>${month}</span>
                        <strong>${day}</strong>
                    </div>
                </div>
                <div class="event-card-body">
                    <div class="event-card-title">${escapeHTML(event.title)}</div>
                    <div class="event-card-meta"><i class="fa-regular fa-clock"></i> ${escapeHTML(event.event_time || 'TBA')}</div>
                    <div class="event-card-meta"><i class="fa-solid fa-location-dot"></i> ${escapeHTML(event.location || 'TBA')}</div>
                    <div class="event-card-desc mt-2" style="font-size: 13px; color: #666; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${escapeHTML(event.description || '')}</div>
                </div>
                <div class="event-card-footer d-flex gap-2">
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');

    // Bind join buttons
    grid.querySelectorAll('.btn-join-event').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!guardAction(e)) return;
            const id = btn.dataset.id;
            try {
                const res = await api('api/events/join.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event_id: id })
                });
                toast(res.joined ? 'Registered for event' : 'Registration cancelled');
                await loadEvents();
            } catch (err) {
                alert(err.message);
            }
        });
    });

    grid.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button, a, .badge')) return;
            const id = card.dataset.eventId;
            if (id) window.location.href = `event_detail.html?id=${id}`;
        });
    });
}

function renderSeminars() {
    const heading = document.getElementById('seminars-heading');
    const list = document.getElementById('seminars-list');
    if (!heading || !list) return;

    const seminars = allEvents.filter(e => e.category === 'seminar');
    if (seminars.length === 0) {
        heading.style.display = 'none';
        list.innerHTML = '';
        return;
    }

    heading.style.display = '';
    list.innerHTML = seminars.map(event => {
        const d = new Date(event.event_date);
        const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = d.getDate();

        let actionBtn = '';
        if (event.joined) {
            actionBtn = `<button class="btn btn-primary btn-sm" disabled><i class="fa-solid fa-check"></i> Registered</button>`;
        } else {
            actionBtn = `<button class="btn btn-outline btn-sm btn-join-event" data-id="${event.id}"><i class="fa-solid fa-plus"></i> Register</button>`;
        }

        return `
            <div class="seminar-item" data-event-id="${event.id}" style="cursor:pointer;">
                <div class="seminar-date">
                    <span>${month}</span>
                    <strong>${day}</strong>
                </div>
                <div class="seminar-info">
                    <div class="seminar-meta">
                        <span class="seminar-dept">${escapeHTML(event.organizer || 'UIU')}</span>
                        <span class="seminar-loc">${escapeHTML(event.location || 'TBA')}</span>
                    </div>
                    <div class="seminar-title">${escapeHTML(event.title)}</div>
                    <div class="seminar-desc">${escapeHTML(event.description || '')}</div>
                </div>
                <div class="seminar-speaker">
                    <span class="seminar-speaker-label">Speakers</span>
                    <span class="seminar-speaker-name">${event.attendees_count || 0} Attending</span>
                </div>
                ${actionBtn}
            </div>
        `;
    }).join('');

    // Bind join buttons in seminars
    list.querySelectorAll('.btn-join-event').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if (!guardAction(e)) return;
            const id = btn.dataset.id;
            try {
                const res = await api('api/events/join.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event_id: id })
                });
                toast(res.joined ? 'Registered for event' : 'Registration cancelled');
                await loadEvents();
            } catch (err) {
                alert(err.message);
            }
        });
    });

    list.querySelectorAll('.seminar-item').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('button, a, .badge')) return;
            const id = card.dataset.eventId;
            if (id) window.location.href = `event_detail.html?id=${id}`;
        });
    });
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}