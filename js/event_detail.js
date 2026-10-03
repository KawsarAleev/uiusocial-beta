document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    setupCreateEventButton();
    await loadEventDetail();
});

function setupCreateEventButton() {
    const btn = document.getElementById('event-create-btn');
    if (btn && canAct()) {
        btn.style.display = '';
        btn.addEventListener('click', () => openCreateEventModal());
    }
}

let currentEventId = null;
let currentEvent = null;

async function loadEventDetail() {
    const params = new URLSearchParams(window.location.search);
    currentEventId = parseInt(params.get('id'));
    if (!currentEventId) {
        document.getElementById('event-title').textContent = 'Event not found';
        document.getElementById('event-description').textContent = 'No event ID provided.';
        document.getElementById('event-image-wrap').style.display = 'none';
        return;
    }

    try {
        const data = await api(`api/events/get.php?id=${currentEventId}`);
        currentEvent = data.event;
        renderEventDetail(currentEvent);
    } catch (e) {
        console.error('Failed to load event detail', e);
        document.getElementById('event-title').textContent = 'Event not found';
        document.getElementById('event-description').textContent = 'Could not load this event.';
        document.getElementById('event-image-wrap').style.display = 'none';
    }
}

function renderEventDetail(event) {
    document.title = event.title + ' - UIU Social';

    const imageWrap = document.getElementById('event-image-wrap');
    if (imageWrap) {
        imageWrap.style.background = event.image
            ? `url('${mediaUrl(event.image)}') center/cover no-repeat`
            : `url('assets/images/uiu/seminar.png') center/cover no-repeat`;
        imageWrap.style.display = 'block';
    }

    const featuredDate = document.getElementById('event-featured-date');
    if (featuredDate && event.event_date) {
        const d = new Date(event.event_date);
        const month = d.toLocaleString('default', { month: 'short' }).toUpperCase();
        const day = d.getDate();
        featuredDate.querySelector('span').textContent = month;
        featuredDate.querySelector('strong').textContent = day;
    }

    const titleEl = document.getElementById('event-title');
    if (titleEl) titleEl.textContent = event.title || 'Untitled Event';

    const descEl = document.getElementById('event-description');
    if (descEl) descEl.textContent = event.description || 'No description provided.';

    const infoEl = document.getElementById('event-info');
    if (infoEl) {
        let metaHtml = '';
        if (event.event_time) {
            metaHtml += `<span><i class="fa-regular fa-clock"></i> ${escapeHTML(event.event_time)}</span>`;
        }
        if (event.location) {
            metaHtml += `<span><i class="fa-solid fa-location-dot"></i> ${escapeHTML(event.location)}</span>`;
        }
        const attendeeCount = event.attendees || event.attendees_count || 0;
        metaHtml += `<span><i class="fa-solid fa-users"></i> ${attendeeCount} Attending</span>`;
        infoEl.innerHTML = metaHtml;
    }

    const rsvpBtn = document.getElementById('event-rsvp-btn');
    if (rsvpBtn) {
        rsvpBtn.addEventListener('click', async (e) => {
            if (!guardAction(e)) return;
            if (!currentEventId) return;
            try {
                const res = await api('api/events/join.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event_id: currentEventId })
                });
                currentEvent.joined = res.joined;
                currentEvent.attendees = res.attendees;
                toast(res.joined ? 'Registered for event' : 'Registration cancelled');
                rsvpBtn.innerHTML = res.joined
                    ? '<i class="fa-solid fa-check"></i> Registered'
                    : '<i class="fa-solid fa-check"></i> RSVP';
                rsvpBtn.classList.toggle('btn-primary', !res.joined);
                rsvpBtn.classList.toggle('btn-outline', res.joined);
                renderAttendees();
            } catch (err) {
                toast(err.message);
            }
        });
        rsvpBtn.innerHTML = event.joined
            ? '<i class="fa-solid fa-check"></i> Registered'
            : '<i class="fa-solid fa-check"></i> RSVP';
        rsvpBtn.classList.toggle('btn-outline', !!event.joined);
    }

    const icsBtn = document.getElementById('event-ics-btn');
    if (icsBtn) {
        icsBtn.addEventListener('click', () => {
            if (!event.event_date) { toast('Event date not set'); return; }
            const d = new Date(event.event_date);
            if (event.event_time) {
                const [h, m] = event.event_time.split(':');
                d.setHours(parseInt(h), parseInt(m), 0, 0);
            }
            const endDate = new Date(d.getTime() + 60 * 60 * 1000);
            const fmt = (date) => {
                const p = (n) => String(n).padStart(2, '0');
                return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}T${p(date.getHours())}${p(date.getMinutes())}`;
            };
            const calId = `uiu-event-${event.id}`;
            const ics = [
                'BEGIN:VCALENDAR',
                'VERSION:2.0',
                'PRODID:-//UIU Social//Event//EN',
                'BEGIN:VEVENT',
                `UID:${calId}@uiusocial`,
                `DTSTART:${fmt(d)}`,
                `DTEND:${fmt(endDate)}`,
                `SUMMARY:${escapeHTML(event.title)}`,
                `DESCRIPTION:${escapeHTML(event.description || '')}`,
                `LOCATION:${escapeHTML(event.location || '')}`,
                'END:VEVENT',
                'END:VCALENDAR'
            ].join('\r\n');
            const blob = new Blob([ics], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    renderAttendees();
}

function renderAttendees() {
    const el = document.getElementById('event-attendees');
    if (!el || !currentEvent) return;
    const count = currentEvent.attendees || 0;
    if (count > 0) {
        el.innerHTML = `<div class="badge bg-primary" style="font-size:12px;">${count} attending</div>`;
    } else {
        el.innerHTML = '<span class="text-muted" style="font-size:13px;">No attendees yet</span>';
    }
}
