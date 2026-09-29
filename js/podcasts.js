let podcastCatalog = [];
let podcastActiveKind = 'all';
let podcastActiveCategory = 'all';
let podcastSearch = '';

document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
    await setupPodcastsPage();
});

async function setupPodcastsPage() {
    document.getElementById('podcast-search-input')?.addEventListener('input', (e) => {
        podcastSearch = e.target.value.trim().toLowerCase();
        renderPodcasts();
    });

    document.getElementById('podcast-filter-toggle')?.addEventListener('click', () => {
        const bar = document.getElementById('podcast-filter-bar');
        if (bar) bar.hidden = !bar.hidden;
    });

    const grid = document.getElementById('podcast-grid');
    grid?.addEventListener('click', (e) => {
        const play = e.target.closest('.podcast-play');
        if (play) {
            openPodcastModal(Number(play.dataset.id));
            return;
        }
        const del = e.target.closest('.podcast-delete');
        if (del) {
            e.stopPropagation();
            deletePodcast(Number(del.dataset.id));
        }
    });

    document.getElementById('podcast-modal-close')?.addEventListener('click', closePodcastModal);
    document.getElementById('podcast-modal-done')?.addEventListener('click', closePodcastModal);
    document.getElementById('podcast-modal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closePodcastModal();
    });

    document.getElementById('podcast-add-open')?.addEventListener('click', openAddModal);
    document.getElementById('podcast-add-close')?.addEventListener('click', closeAddModal);
    document.getElementById('podcast-add-cancel')?.addEventListener('click', closeAddModal);
    document.getElementById('podcast-add-submit')?.addEventListener('click', submitPodcast);
    document.getElementById('podcast-add-modal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeAddModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        closePodcastModal();
        closeAddModal();
    });

    await loadPodcasts();
}

async function loadPodcasts() {
    const grid = document.getElementById('podcast-grid');
    if (grid) grid.innerHTML = '<div class="podcast-empty">Loading episodes...</div>';
    try {
        const data = await api('api/podcasts/list.php?limit=60');
        podcastCatalog = data.podcasts || [];

        if (data.can_manage) {
            const addBtn = document.getElementById('podcast-add-open');
            if (addBtn) addBtn.hidden = false;
        }

        renderKindFilters(data.kinds || []);
        renderCategoryFilters(data.categories || []);
        renderPodcasts();
    } catch (err) {
        if (grid) {
            grid.innerHTML = '';
            const box = document.createElement('div');
            box.className = 'podcast-empty';
            box.textContent = err.message || 'Could not load episodes.';
            grid.appendChild(box);
        }
        console.error('Podcast load failed', err);
    }
}

function renderKindFilters(kinds) {
    const wrap = document.getElementById('podcast-kind-filters');
    if (!wrap) return;
    const total = kinds.reduce((n, k) => n + (k.count || 0), 0);
    const options = [{ name: 'all', count: total }, ...kinds];
    wrap.innerHTML = options.map(k => `
        <button type="button" class="podcast-chip${podcastActiveKind === k.name ? ' active' : ''}" data-kind="${escapeHTML(k.name)}">
            ${escapeHTML(k.name === 'all' ? 'Everything' : k.name === 'video' ? 'Video' : 'Audio')}
            <span class="podcast-chip-count">${k.count || 0}</span>
        </button>`).join('');

    wrap.querySelectorAll('.podcast-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            podcastActiveKind = btn.dataset.kind;
            renderKindFilters(kinds);
            renderPodcasts();
        });
    });
}

function renderCategoryFilters(categories) {
    const wrap = document.getElementById('podcast-category-filters');
    if (!wrap) return;
    const all = `<button type="button" class="podcast-chip${podcastActiveCategory === 'all' ? ' active' : ''}" data-cat="all">All topics</button>`;
    const rest = categories.map(c => `
        <button type="button" class="podcast-chip${podcastActiveCategory === c.name ? ' active' : ''}" data-cat="${escapeHTML(c.name)}">
            ${escapeHTML(c.name)} <span class="podcast-chip-count">${c.count}</span>
        </button>`).join('');
    wrap.innerHTML = all + rest;

    wrap.querySelectorAll('.podcast-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            podcastActiveCategory = btn.dataset.cat;
            renderCategoryFilters(categories);
            renderPodcasts();
        });
    });
}

function visiblePodcasts() {
    return podcastCatalog.filter(p => {
        if (podcastActiveKind !== 'all' && p.kind !== podcastActiveKind) return false;
        if (podcastActiveCategory !== 'all' && p.category !== podcastActiveCategory) return false;
        if (podcastSearch) {
            const hay = `${p.title} ${p.description} ${p.category} ${p.source_name}`.toLowerCase();
            if (!hay.includes(podcastSearch)) return false;
        }
        return true;
    });
}

function renderPodcasts() {
    const grid = document.getElementById('podcast-grid');
    const countEl = document.getElementById('podcast-count');
    const titleEl = document.getElementById('podcast-section-title');
    if (!grid) return;

    const list = visiblePodcasts();
    if (countEl) countEl.textContent = `${list.length} episode${list.length === 1 ? '' : 's'}`;
    if (titleEl) {
        const parts = [];
        if (podcastActiveKind !== 'all') parts.push(podcastActiveKind === 'audio' ? 'Audio' : 'Video');
        if (podcastActiveCategory !== 'all') parts.push(podcastActiveCategory);
        titleEl.textContent = parts.length ? parts.join(' · ') : 'All episodes';
    }

    renderFeature(list);

    if (!list.length) {
        grid.innerHTML = '<div class="podcast-empty">No episodes match these filters.</div>';
        return;
    }

    const canManage = !!document.getElementById('podcast-add-open') && !document.getElementById('podcast-add-open').hidden;
    grid.innerHTML = list.map(p => podcastCardHtml(p, canManage)).join('');
}

function renderFeature(list) {
    const feature = document.getElementById('podcast-feature');
    if (!feature) return;
    if (!list.length) {
        feature.hidden = true;
        feature.innerHTML = '';
        return;
    }
    // Feature the first audio entry when the user is browsing audio, else the
    // first result, so the page always opens on something playable.
    const p = list.find(x => x.kind === 'audio') || list[0];
    feature.hidden = false;
    feature.innerHTML = `
        <div class="podcast-feature-copy">
            <span class="podcast-feature-badge"><i class="fa-solid fa-star"></i> Featured</span>
            <h3>${escapeHTML(p.title)}</h3>
            <p>${escapeHTML(p.description || '')}</p>
            <div class="podcast-feature-meta">
                <span><i class="fa-solid fa-layer-group"></i> ${escapeHTML(p.category)}</span>
                <span><i class="fa-solid fa-tower-broadcast"></i> ${escapeHTML(p.source_name)}</span>
                ${p.duration ? `<span><i class="fa-regular fa-clock"></i> ${escapeHTML(p.duration)}</span>` : ''}
            </div>
            <button type="button" class="btn btn-primary podcast-feature-play" data-id="${p.id}">
                <i class="fa-solid fa-play"></i> Play now
            </button>
        </div>
        <div class="podcast-feature-art">
            ${p.thumbnail
                ? `<img src="${escapeHTML(p.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
                : `<div class="podcast-feature-art-fallback"><i class="fa-solid fa-headphones"></i></div>`}
        </div>`;

    feature.querySelector('.podcast-feature-play')?.addEventListener('click', () => openPodcastModal(p.id));
}

function podcastCardHtml(p, canManage) {
    const art = p.thumbnail
        ? `<img src="${escapeHTML(p.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer">`
        : `<div class="podcast-card-art-fallback"><i class="fa-solid ${p.kind === 'audio' ? 'fa-headphones' : 'fa-play'}"></i></div>`;

    return `
    <article class="podcast-card" data-id="${p.id}">
        <div class="podcast-card-art">
            ${art}
            <button type="button" class="podcast-play" data-id="${p.id}" aria-label="Play ${escapeHTML(p.title)}">
                <i class="fa-solid fa-play"></i>
            </button>
            <span class="podcast-kind-badge">${p.kind === 'audio' ? 'Audio' : 'Video'}</span>
        </div>
        <div class="podcast-card-body">
            <span class="podcast-card-category">${escapeHTML(p.category)}</span>
            <h3 class="podcast-card-title" title="${escapeHTML(p.title)}">${escapeHTML(p.title)}</h3>
            <p class="podcast-card-desc">${escapeHTML(truncateText(p.description || '', 110))}</p>
            <div class="podcast-card-foot">
                <span class="podcast-card-source"><i class="fa-solid fa-tower-broadcast"></i> ${escapeHTML(p.source_name)}</span>
                ${p.duration ? `<span class="podcast-card-duration">${escapeHTML(p.duration)}</span>` : ''}
                ${canManage ? `<button type="button" class="podcast-delete" data-id="${p.id}" title="Remove episode" aria-label="Remove episode"><i class="fa-solid fa-trash"></i></button>` : ''}
            </div>
        </div>
    </article>`;
}

function truncateText(text, max) {
    const t = String(text || '');
    return t.length > max ? t.slice(0, max).trimEnd() + '…' : t;
}

/*
 * Embeds are rendered from server-built URLs only. Everything is set through
 * DOM properties rather than innerHTML, and the frame is sandboxed without
 * allow-top-navigation or allow-forms, so a player cannot redirect the app or
 * post a form as the signed-in user.
 */
function buildEmbedFrame(p) {
    const frame = document.createElement('iframe');
    frame.className = 'podcast-embed';
    frame.src = p.embed_url;
    frame.title = p.title;
    frame.loading = 'lazy';
    frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups');
    frame.setAttribute('allowfullscreen', 'allowfullscreen');
    if (p.kind === 'audio') {
        frame.style.height = '152px';
    }
    return frame;
}

function openPodcastModal(id) {
    const p = podcastCatalog.find(x => x.id === id);
    if (!p) return;

    const modal = document.getElementById('podcast-modal');
    const title = document.getElementById('podcast-modal-title');
    const embedWrap = document.getElementById('podcast-modal-embed');
    const meta = document.getElementById('podcast-modal-meta');
    const watch = document.getElementById('podcast-modal-watch');
    if (!modal || !embedWrap) return;

    if (title) title.textContent = p.title;

    embedWrap.innerHTML = '';
    embedWrap.appendChild(buildEmbedFrame(p));

    if (meta) {
        meta.innerHTML = '';
        [
            ['fa-layer-group', p.category],
            ['fa-tower-broadcast', p.source_name],
            ['fa-circle-play', p.kind === 'audio' ? 'Audio' : 'Video']
        ].forEach(([icon, value]) => {
            const span = document.createElement('span');
            const i = document.createElement('i');
            i.className = icon;
            span.appendChild(i);
            span.appendChild(document.createTextNode(' ' + value));
            meta.appendChild(span);
        });
    }

    if (watch) {
        watch.href = p.watch_url;
        watch.setAttribute('rel', 'noopener noreferrer');
    }

    modal.hidden = false;
    document.body.classList.add('modal-open');
}

function closePodcastModal() {
    const modal = document.getElementById('podcast-modal');
    if (!modal || modal.hidden) return;
    // Clearing the frame stops playback and releases the third-party player.
    const wrap = document.getElementById('podcast-modal-embed');
    if (wrap) wrap.innerHTML = '';
    modal.hidden = true;
    document.body.classList.remove('modal-open');
}

function openAddModal() {
    const modal = document.getElementById('podcast-add-modal');
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    document.getElementById('podcast-form-link')?.focus();
}

function closeAddModal() {
    const modal = document.getElementById('podcast-add-modal');
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
}

async function submitPodcast() {
    if (!guardAction()) return;
    const btn = document.getElementById('podcast-add-submit');
    if (btn) btn.disabled = true;

    const payload = {
        action: 'create',
        link: document.getElementById('podcast-form-link')?.value || '',
        provider: document.getElementById('podcast-form-provider')?.value || 'youtube',
        kind: document.getElementById('podcast-form-kind')?.value || 'video',
        title: document.getElementById('podcast-form-title')?.value || '',
        category: document.getElementById('podcast-form-category')?.value || '',
        duration: document.getElementById('podcast-form-duration')?.value || '',
        description: document.getElementById('podcast-form-desc')?.value || '',
    };

    try {
        await api('api/podcasts/manage.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        closeAddModal();
        ['podcast-form-link', 'podcast-form-title', 'podcast-form-category', 'podcast-form-duration', 'podcast-form-desc']
            .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
        toast('Episode added');
        await loadPodcasts();
    } catch (err) {
        alert(err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

async function deletePodcast(id) {
    if (!guardAction()) return;
    const p = podcastCatalog.find(x => x.id === id);
    if (!p) return;
    if (!confirm(`Remove "${p.title}" from the library?`)) return;
    try {
        await api('api/podcasts/manage.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
        });
        toast('Episode removed');
        await loadPodcasts();
    } catch (err) {
        alert(err.message);
    }
}
