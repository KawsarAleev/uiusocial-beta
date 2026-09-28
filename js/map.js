// Indoor Navigation Map engine for UIU Academic Building, 2nd Floor.
// The floor plan is drawn as HTML/CSS inside #stage (943 x 894 coordinate space).
// Walkable space is the drawn corridor network; rooms are walls. Routes are
// computed with A* over a grid built from the corridor rectangles, so a line
// never crosses a room, a lift shaft or a stair block.
// Requires utils.js (escapeHTML / toast).

(function () {
    'use strict';

    const STAGE_W = 943;
    const STAGE_H = 894;
    const M_PER_PX = 0.055;
    const CELL = 2;

    const ROUTE_COLOR = '#f06520';

    const TYPES = {
        lift:      { label: 'Lifts / Elevators' },
        stair:     { label: 'Stairs' },
        escalator: { label: 'Escalator' },
        washroom:  { label: 'Washrooms' },
        exit:      { label: 'Fire Exits' },
        room:      { label: 'Rooms' },
        corridor:  { label: 'Corridors' }
    };
    const TYPE_ORDER = ['lift', 'stair', 'escalator', 'washroom', 'exit', 'room', 'corridor'];

    /* ------------------------------------------------------------------ *
     * 1. Floor plan geometry (identical to the original static drawing)
     * ------------------------------------------------------------------ */

    const BORDER_LINES = [
        // Top edge (one continuous line from x=20 to x=920)
        [20, 8, 900, 1],

        // Left edge (top segment + bottom segment, aligned to x=20)
        [20, 8, 1, 345],
        [20, 510, 1, 376],   // extends to y=886 so it meets the bottom line

        // Right edge (top segment + bottom segment, aligned to x=920)
        [920, 8, 1, 345],
        [920, 510, 1, 376],

        // Bottom edge (one continuous line from x=20 to x=920)
        [20, 886, 900, 1]
    ];

    const CORRIDOR_RECTS = [
        [245, 205, 200, 40], [563, 136, 60, 170], [460, 276, 190, 30], [440, 240, 30, 66],
        [470, 300, 110, 100], [578, 400, 88, 95], [560, 490, 42, 160], [520, 640, 225, 50],
        [250, 680, 275, 36], [250, 618, 110, 64], [600, 300, 65, 200], [340, 120, 140, 20]
    ];

    const CLIP_T = 'clip-path:polygon(0 0,100% 0,96% 100%,4% 100%)';
    const CLIP_U = 'clip-path:polygon(4% 0,96% 0,100% 100%,0 100%)';

    // x, y, w, h, label, visual class, inline style  (index = room index)
    const ROOMS = [
        [253, 70, 82, 68, 'Classroom<br>#230', 'r', CLIP_U],                       // 0
        [257, 140, 52, 36, 'Male<br>Washroom', 'y'],                               // 1
        [309, 140, 26, 24, 'Lift', 'g'],                                          // 2
        [259, 177, 50, 32, 'FIRE<br>EXIT<br>DOOR', 'f'],                          // 3
        [166, 135, 97, 140, 'Study Room<br>#231-232', 'r', 'clip-path:polygon(0 12%,100% 0,100% 100%,4% 100%,0 60%)'], // 4
        [392, 70, 80, 68, 'Classroom<br>#228', 'r', CLIP_U],                       // 5
        [395, 140, 78, 80, 'Classroom<br>#229', 'r', 'clip-path:polygon(0 0,100% 0,96% 100%,10% 100%)'], // 6
        [484, 136, 80, 66, 'Computer<br>Lab<br>#227', 'r'],                        // 7
        [482, 204, 80, 72, 'Computer<br>Lab<br>#226', 'r', 'clip-path:polygon(4% 0,100% 0,100% 100%,0 100%)'], // 8
        [622, 136, 78, 66, 'Classroom<br>#224', 'r'],                               // 9
        [622, 204, 24, 28, 'Lift', 'g'],                                          // 10
        [646, 204, 54, 32, 'Female<br>Washroom', 'y'],                            // 11
        [649, 241, 50, 32, 'FIRE<br>EXIT<br>DOOR', 'f'],                          // 12
        [702, 201, 74, 72, 'Classroom<br>#223', 'r', CLIP_U],                       // 13
        [646, 299, 76, 72, 'Faculty Room<br>#219', 'r'],                           // 14
        [724, 299, 76, 72, 'Classroom<br>#222', 'r', CLIP_U],                       // 15
        [459, 301, 72, 66, 'Classroom<br>#225', 'r', 'clip-path:polygon(0 0,100% 0,100% 100%,10% 100%)'], // 16
        [533, 343, 36, 22, 'Male<br>Washroom', 'y', 'font-size:6.5px'],            // 17
        [569, 352, 10, 13, '', 'y'],                                               // 18
        [579, 343, 32, 22, 'Female<br>Wash Room', 'y', 'font-size:6.5px'],         // 19
        [528, 368, 84, 38, 'Lift', 'g'],                                           // 20
        [388, 243, 52, 22, 'STAIR', 'k', 'background:#ec6d92;font-size:9px'],       // 21
        [445, 305, 20, 90, '<span style="transform:rotate(-90deg);white-space:nowrap">STAIR</span>', 'k', 'background:#ec7f9d;clip-path:polygon(15% 0,100% 0,100% 100%,0 100%)'], // 22
        [480, 368, 36, 30, '', 'k', 'background:#ec6d92'],                         // 23
        [420, 494, 75, 80, 'Faculty &amp;<br>Officers<br>Lounge<br>#217', 'r', 'clip-path:polygon(0 0,100% 0,100% 100%,0 100%)'], // 24
        [487, 490, 84, 38, 'Lift', 'g'],                                           // 25
        [518, 575, 34, 78, '<span style="transform:rotate(-90deg);white-space:nowrap">Escalator</span>', 'k', 'background:#ec7f9d;clip-path:polygon(0 0,100% 6%,100% 100%,10% 96%)'], // 26
        [597, 490, 76, 122, 'BBA Program Office<br>Dean of SoBE<br>#215-216', 'r', ''], // 27
        [669, 553, 76, 74, 'Classroom<br>#211', 'r'],                               // 28
        [174, 588, 94, 66, 'Classroom<br>#202', 'r', CLIP_T],                       // 29
        [186, 653, 80, 66, 'Classroom<br>#201', 'r'],                               // 30
        [266, 652, 48, 30, 'FIRE<br>EXIT<br>DOOR', 'f'],                          // 31
        [266, 684, 48, 32, 'Female<br>Washroom', 'y'],                            // 32
        [315, 700, 26, 18, 'Lift', 'g'],                                          // 33
        [264, 718, 76, 64, 'Classroom<br>#203', 'r'],                               // 34
        [348, 714, 80, 66, 'Classroom<br>#205', 'r', CLIP_U],                       // 35
        [348, 780, 80, 63, 'Classroom<br>#204', 'r'],                               // 36
        [482, 711, 82, 70, 'Classroom<br>#206', 'r', CLIP_U],                       // 37
        [564, 711, 78, 66, 'Classroom<br>#208', 'r'],                               // 38
        [564, 777, 78, 66, 'Classroom<br>#207', 'r'],                               // 39
        [651, 716, 78, 64, 'Classroom<br>#209', 'r'],                               // 40
        [651, 700, 22, 18, 'Lift', 'g'],                                           // 41
        [673, 672, 60, 44, 'Male<br>Washroom', 'y'],                               // 42
        [656, 650, 78, 32, 'FIRE<br>EXIT<br>DOOR', 'f'],                          // 43
        [730, 648, 80, 70, 'Classroom<br>#210', 'r', CLIP_T]                        // 44
    ];

    const ARROWS = [
        [326, 187, 180], [380, 216, 180], [455, 238, 60], [458, 275, 225], [512, 279, 0],
        [590, 290, -60], [616, 344, -75], [621, 418, -80], [573, 457, 90], [568, 541, 95],
        [553, 620, 95], [590, 660, 0], [556, 687, 0], [434, 688, 180], [358, 689, 180],
        [320, 663, 180], [639, 659, 0], [617, 253, 0]
    ];

    const COMPASS = [
        // East  – centered horizontally at top, y sits just above the top border
        [415, 12, 110, 28, 'East'],
        // West  – centered horizontally at bottom, y sits just below the bottom border
        [415, 855, 110, 28, 'West'],
        // North – centered vertically on the left border, x sits left of the border
        [4, 393, 30, 110, '<span style="transform:rotate(-90deg)">North</span>'],
        // South – centered vertically on the right border, x sits right of the border
        [909, 393, 30, 110, '<span style="transform:rotate(90deg)">South</span>']
    ];

    /* ------------------------------------------------------------------ *
     * 2. Locations
     * ------------------------------------------------------------------ */

    // id, name, type, room index in ROOMS
    const PLACES = [
        ['p230', 'Classroom 230', 'room', 0],
        ['p231', 'Study Room 231-232', 'room', 4],
        ['p228', 'Classroom 228', 'room', 5],
        ['p229', 'Classroom 229', 'room', 6],
        ['p227', 'Computer Lab 227', 'room', 7],
        ['p226', 'Computer Lab 226', 'room', 8],
        ['p224', 'Classroom 224', 'room', 9],
        ['p223', 'Classroom 223', 'room', 13],
        ['p222', 'Classroom 222', 'room', 15],
        ['p219', 'Faculty Room 219', 'room', 14],
        ['p225', 'Classroom 225', 'room', 16],
        ['p217', 'Faculty & Officers Lounge 217', 'room', 24],
        ['p215', 'BBA Program Office / Dean of SoBE 215-216', 'room', 27],
        ['p211', 'Classroom 211', 'room', 28],
        ['p210', 'Classroom 210', 'room', 44],
        ['p209', 'Classroom 209', 'room', 40],
        ['p208', 'Classroom 208', 'room', 38],
        ['p207', 'Classroom 207', 'room', 39],
        ['p206', 'Classroom 206', 'room', 37],
        ['p205', 'Classroom 205', 'room', 35],
        ['p204', 'Classroom 204', 'room', 36],
        ['p203', 'Classroom 203', 'room', 34],
        ['p202', 'Classroom 202', 'room', 29],
        ['p201', 'Classroom 201', 'room', 30],

        ['lA', 'Lift A - North Male Washroom Side', 'lift', 2],
        ['lB', 'Lift B - North Female Washroom Side', 'lift', 10],
        ['lC', 'Lift C - Central Washroom Lobby', 'lift', 20],
        ['lD', 'Lift D - Faculty Lounge 217', 'lift', 25],
        ['lE', 'Lift E - South Female Washroom Side', 'lift', 33],
        ['lF', 'Lift F - South Male Washroom Side', 'lift', 41],

        ['sA', 'Stairs - North Wing (Classroom 229 side)', 'stair', 21],
        ['sB', 'Stairs - Central Wing (Classroom 225 side)', 'stair', 22],

        ['e1', 'Escalator - Central (Floor 1 to Floor 3)', 'escalator', 26],

        ['mN', 'Male Washroom - North Wing', 'washroom', 1],
        ['fN', 'Female Washroom - North Wing', 'washroom', 11],
        ['mC', 'Male Washroom - Central Lobby', 'washroom', 17],
        ['fC', 'Female Washroom - Central Lobby', 'washroom', 19],
        ['fW', 'Female Washroom - South West Wing', 'washroom', 32],
        ['mE', 'Male Washroom - South East Wing', 'washroom', 42],

        ['xN', 'Fire Exit - North West', 'exit', 3],
        ['xN2', 'Fire Exit - North East', 'exit', 12],
        ['xS', 'Fire Exit - South West', 'exit', 31],
        ['xS2', 'Fire Exit - South East', 'exit', 43]
    ];

    // Named corridor points offered in the dropdowns. Each one is snapped to
    // the nearest walkable cell of the drawn corridor network at start up.
    const WAYPOINTS = [
        ['wa1', 300, 225, 'West Corridor - Classroom 230 / Study Room', false],
        ['wa2', 370, 225, 'North Main Corridor', false],
        ['wa3', 445, 225, 'Corridor Junction - Stairs / Lab 226', false],
        ['wa4', 455, 272, 'Corridor Junction - Central Stairs', false],
        ['wa5', 478, 240, 'East Junction - Computer Labs 226 / 227', false],
        ['wa6', 480, 139, 'North Corridor End', false],
        ['wa7', 430, 139, 'North Corridor - Classroom 228', false],
        ['wa8', 365, 139, 'North Corridor - Classrooms 230 / 228', false],
        ['wa9', 365, 190, 'North Lobby - Classroom 229', false],
        ['wb1', 593, 150, 'North East Corridor - Classroom 224', false],
        ['wb2', 600, 225, 'North East Corridor - Lift B', false],
        ['wb3', 600, 285, 'Corridor Junction - Lab 226 / Fire Exit', false],
        ['wb4', 555, 291, 'South Corridor - Computer Lab 226', false],
        ['wc5', 552, 330, 'Central Lobby - Washrooms', false],
        ['wb5', 700, 285, 'East Junction - Classrooms 222 / 223', false],
        ['wb6', 632, 360, 'Corridor - Faculty Room 219', false],
        ['wb7', 622, 447, 'Central Corridor Junction', false],
        ['wn1', 455, 450, 'Central Lobby - Faculty Lounge 217', false],
        ['wb8', 581, 500, 'South Junction - Lift D', false],
        ['wb12', 581, 570, 'Corridor - Faculty Lounge / Escalator', false],
        ['wb13', 555, 614, 'South Corridor - Escalator', false],
        ['wb14', 560, 665, 'South West Corridor - Classrooms 206 / 208', false],
        ['wb15', 635, 640, 'South Corridor - BBA Program Office', false],
        ['wb18', 600, 700, 'South Junction - Classrooms 207 / 208 / 209', false],
        ['wb19', 520, 698, 'South Corridor - Classroom 206', false],
        ['wb20', 470, 698, 'South Corridor - Classroom 205', false],
        ['wb21', 387, 698, 'South Corridor - Classroom 205 / Lift E', false],
        ['wb22', 330, 690, 'South West Corridor - Lift E / Washroom', false],
        ['wsw', 340, 667, 'West Corridor - Fire Exit (South West)', false]
    ];

    /* ------------------------------------------------------------------ *
     * 3. State + DOM
     * ------------------------------------------------------------------ */

    const stage = document.getElementById('stage');
    const wrap = document.getElementById('stage-wrap');
    const startSelect = document.getElementById('start-node');
    const endSelect = document.getElementById('end-node');
    const routeBtn = document.getElementById('show-route-btn');
    const clearBtn = document.getElementById('clear-route-btn');
    const guidanceEl = document.getElementById('turn-by-turn');
    const summaryEl = document.getElementById('route-summary');

    if (!stage) return;

    const locations = new Map();
    let net = null;
    let zoom = 1;
    let layer = null;
    let routePathEl = null;
    let animHandle = null;

    /* ------------------------------------------------------------------ *
     * 4. Draw the floor plan
     * ------------------------------------------------------------------ */

    function add(cls, x, y, w, h, html, style) {
        const d = document.createElement('div');
        d.className = cls;
        d.style.cssText = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;${style || ''}`;
        d.innerHTML = html || '';
        stage.appendChild(d);
        return d;
    }

    function buildPlan() {
        // BORDER_LINES.forEach(l => add('ln', l[0], l[1], l[2], l[3]));
        CORRIDOR_RECTS.forEach(c => add('c', c[0], c[1], c[2], c[3]));
        ROOMS.forEach(r => add('r ' + (r[5] === 'r' ? '' : r[5]), r[0], r[1], r[2], r[3], r[4], r[6]));
        ARROWS.forEach(a => add('a', a[0], a[1], 24, 14, '&#10140;', `transform:rotate(${a[2]}deg)`));
        COMPASS.forEach(c => add('cmp', c[0], c[1], c[2], c[3], c[4]));
    }

    function buildOverlay() {
        layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        layer.setAttribute('class', 'nav-layer');
        layer.setAttribute('viewBox', `0 0 ${STAGE_W} ${STAGE_H}`);
        layer.setAttribute('preserveAspectRatio', 'none');
        layer.innerHTML =
            '<polyline class="nav-halo" points=""/>' +
            '<polyline class="nav-route" points=""/>';
        stage.appendChild(layer);
        routePathEl = layer.querySelector('.nav-route');
    }

    /* ------------------------------------------------------------------ *
     * 5. Walkable network (the drawn corridors) + A* routing
     * ------------------------------------------------------------------ */

    const inRect = (x, y, r) => x >= r[0] && x <= r[0] + r[2] && y >= r[1] && y <= r[1] + r[3];

    // Walkable space: the drawn corridors plus the open floor between rooms.
    // Rooms are solid. Corridors cost 1, open floor costs more, so a route
    // follows the road lines whenever the plan provides one.
    const BOUNDS = { x0: 28, y0: 12, x1: 918, y2: 882 };
    const OPEN_COST = 2.5;

    function buildNetwork() {
        const cols = Math.ceil(STAGE_W / CELL);
        const rows = Math.ceil(STAGE_H / CELL);
        const walk = new Uint8Array(cols * rows);
        const road = new Uint8Array(cols * rows);
        const comp = new Int32Array(cols * rows).fill(-1);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * CELL + CELL / 2;
                const y = r * CELL + CELL / 2;
                if (x < BOUNDS.x0 || x > BOUNDS.x1 || y < BOUNDS.y0 || y > BOUNDS.y2) continue;
                let solid = 0;
                for (let i = 0; i < ROOMS.length && !solid; i++) {
                    if (inRect(x, y, ROOMS[i])) solid = 1;
                }
                if (solid) continue;
                walk[r * cols + c] = 1;
                for (let i = 0; i < CORRIDOR_RECTS.length; i++) {
                    if (inRect(x, y, CORRIDOR_RECTS[i])) { road[r * cols + c] = 1; break; }
                }
            }
        }
        return { cols, rows, walk, road, comp, mainComp: labelComponents(comp, walk, cols, rows) };
    }

    // Label connected areas of walkable floor and return the biggest one.
    function labelComponents(comp, walk, cols, rows) {
        const stack = [];
        const sizes = {};
        for (let i = 0; i < walk.length; i++) {
            if (walk[i] !== 1 || comp[i] !== -1) continue;
            const label = i;
            stack.push(i);
            comp[i] = label;
            let size = 0;
            while (stack.length) {
                const cur = stack.pop();
                size++;
                const c = cur % cols, r = (cur - c) / cols;
                const nb = [[c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]];
                for (const [nc, nr] of nb) {
                    if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
                    const ni = nr * cols + nc;
                    if (walk[ni] === 1 && comp[ni] === -1) { comp[ni] = label; stack.push(ni); }
                }
            }
            sizes[label] = size;
        }
        let main = 0, best = -1;
        Object.keys(sizes).forEach(k => { if (sizes[k] > best) { best = sizes[k]; main = Number(k); } });
        return main;
    }

    function cellAt(n, x, y) {
        const c = Math.min(n.cols - 1, Math.max(0, Math.round((x - CELL / 2) / CELL)));
        const r = Math.min(n.rows - 1, Math.max(0, Math.round((y - CELL / 2) / CELL)));
        return r * n.cols + c;
    }

    function cellCentre(idx) {
        const c = idx % net.cols;
        const r = (idx - c) / net.cols;
        return { x: c * CELL + CELL / 2, y: r * CELL + CELL / 2 };
    }

    function isWalkable(x, y) {
        const c = Math.round((x - CELL / 2) / CELL);
        const r = Math.round((y - CELL / 2) / CELL);
        if (c < 0 || r < 0 || c >= net.cols || r >= net.rows) return false;
        return net.walk[r * net.cols + c] === 1;
    }

    function isRoad(x, y) {
        const c = Math.round((x - CELL / 2) / CELL);
        const r = Math.round((y - CELL / 2) / CELL);
        if (c < 0 || r < 0 || c >= net.cols || r >= net.rows) return false;
        return net.road[r * net.cols + c] === 1;
    }

    function snap(x, y, maxRadius, roadOnly) {
        if (isWalkable(x, y) && (!roadOnly || isRoad(x, y))) return { x, y };
        const c0 = Math.round((x - CELL / 2) / CELL);
        const r0 = Math.round((y - CELL / 2) / CELL);
        for (let rad = 1; rad <= maxRadius; rad++) {
            for (let dr = -rad; dr <= rad; dr++) {
                for (let dc = -rad; dc <= rad; dc++) {
                    if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
                    const c = c0 + dc, r = r0 + dr;
                    if (c < 0 || r < 0 || c >= net.cols || r >= net.rows) continue;
                    const i = r * net.cols + c;
                    if (net.walk[i] === 1 && (!roadOnly || net.road[i] === 1)) {
                        return { x: c * CELL + CELL / 2, y: c * 0 + r * CELL + CELL / 2 };
                    }
                }
            }
        }
        return null;
    }

    // The point where a room opens onto the corridor network: a walkable cell
    // next to the room that can be reached in a straight line from the middle
    // of the room without clipping any other block. Road cells and cells in
    // the main connected area always win.
    function findDoor(room, roomIndex) {
        const cx = room[0] + room[2] / 2;
        const cy = room[1] + room[3] / 2;
        let best = null, bestScore = Infinity;
        for (let r = 0; r < net.rows; r++) {
            for (let c = 0; c < net.cols; c++) {
                const i = r * net.cols + c;
                if (net.walk[i] !== 1) continue;
                const x = c * CELL + CELL / 2, y = r * CELL + CELL / 2;
                if (x < room[0] - 4 || x > room[0] + room[2] + 4) continue;
                if (y < room[1] - 4 || y > room[1] + room[3] + 4) continue;
                if (!clearOfOtherRooms(cx, cy, x, y, roomIndex)) continue;
                let score = Math.hypot(x - cx, y - cy);
                if (net.road[i] !== 1) score += 90;             // prefer the roads
                if (net.comp[i] !== net.mainComp) score += 5000; // prefer the main area
                if (score < bestScore) { bestScore = score; best = { x, y }; }
            }
        }
        if (best) return best;
        return snap(cx, cy, 40, false);
    }

    // Straight line between two points must not pass through a room block
    // other than the one being entered (roomIndex, -1 for none). A 1 px
    // tolerance keeps the line from grazing a room corner.
    function clearOfOtherRooms(x0, y0, x1, y1, roomIndex) {
        const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2);
        for (let i = 0; i <= steps; i++) {
            const t = steps ? i / steps : 0;
            const px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t;
            for (let k = 0; k < ROOMS.length; k++) {
                if (k === roomIndex) continue;
                if (deepInside(px, py, ROOMS[k], 1)) return false;
            }
        }
        return true;
    }

    // True when a point is more than `slack` pixels inside a room block.
    function deepInside(px, py, r, slack) {
        return px > r[0] + slack && px < r[0] + r[2] - slack &&
            py > r[1] + slack && py < r[1] + r[3] - slack;
    }

    const NEIGHBOURS = [
        [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
        [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]
    ];

    // Binary min-heap keyed on f score (keeps A* fast on the 943 x 894 grid).
    class MinHeap {
        constructor() { this.items = []; this.f = []; }
        get size() { return this.items.length; }
        push(item, score) {
            this.items.push(item); this.f.push(score);
            let i = this.items.length - 1;
            while (i > 0) {
                const p = (i - 1) >> 1;
                if (this.f[p] <= this.f[i]) break;
                this.swap(i, p); i = p;
            }
        }
        pop() {
            const top = this.items[0];
            const lastItem = this.items.pop();
            const lastF = this.f.pop();
            if (this.items.length) {
                this.items[0] = lastItem; this.f[0] = lastF;
                let i = 0;
                for (;;) {
                    const l = i * 2 + 1, r = l + 1;
                    let s = i;
                    if (l < this.f.length && this.f[l] < this.f[s]) s = l;
                    if (r < this.f.length && this.f[r] < this.f[s]) s = r;
                    if (s === i) break;
                    this.swap(i, s); i = s;
                }
            }
            return top;
        }
        swap(a, b) {
            const ti = this.items[a]; this.items[a] = this.items[b]; this.items[b] = ti;
            const tf = this.f[a]; this.f[a] = this.f[b]; this.f[b] = tf;
        }
    }

    function astar(from, to) {
        const start = cellAt(net, from.x, from.y);
        const goal = cellAt(net, to.x, to.y);
        if (!net.walk[start] || !net.walk[goal]) return null;
        if (start === goal) return [cellCentre(start)];

        const total = net.cols * net.rows;
        const gScore = new Float64Array(total).fill(Infinity);
        const came = new Int32Array(total).fill(-1);
        const closed = new Uint8Array(total);
        gScore[start] = 0;

        const gx = goal % net.cols, gy = (goal - gx) / net.cols;
        function heuristic(a) {
            const ax = a % net.cols, ay = (a - ax) / net.cols;
            return Math.hypot(ax - gx, ay - gy) * CELL;
        }

        const open = new MinHeap();
        open.push(start, heuristic(start));

        while (open.size) {
            const cur = open.pop();
            if (cur === goal) break;
            if (closed[cur]) continue;
            closed[cur] = 1;

            const cc = cur % net.cols;
            const cr = (cur - cc) / net.cols;
            for (const [dc, dr, w] of NEIGHBOURS) {
                const nc = cc + dc, nr = cr + dr;
                if (nc < 0 || nr < 0 || nc >= net.cols || nr >= net.rows) continue;
                const ni = nr * net.cols + nc;
                if (net.walk[ni] !== 1 || closed[ni]) continue;
                if (dc && dr) {   // no corner cutting
                    if (net.walk[cr * net.cols + nc] !== 1 || net.walk[nr * net.cols + cc] !== 1) continue;
                }
                const tentative = gScore[cur] + w * CELL * (net.road[ni] ? 1 : OPEN_COST);
                if (tentative < gScore[ni]) {
                    gScore[ni] = tentative;
                    came[ni] = cur;
                    open.push(ni, tentative + heuristic(ni));
                }
            }
        }

        if (came[goal] === -1 && goal !== start) return null;
        const path = [];
        let cur = goal;
        while (cur !== -1) { path.push(cellCentre(cur)); cur = came[cur]; }
        path.reverse();
        return path;
    }

    // Weighted length of a straight run: corridor cells cost 1, open floor
    // costs more, so a shortcut is only taken when it is genuinely cheaper
    // than following the corridors.
    function segCost(a, b) {
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const steps = Math.max(1, Math.ceil(len / 0.5));
        let cost = 0;
        for (let i = 0; i <= steps; i++) {
            const t = steps ? i / steps : 0;
            const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
            cost += isRoad(px, py) ? len / steps : (len / steps) * OPEN_COST;
        }
        return cost;
    }

    function pathCost(points, from, to) {
        let sum = 0;
        for (let k = from; k < to; k++) sum += segCost(points[k], points[k + 1]);
        return sum;
    }

    // String pulling that respects the corridor preference.
    function simplify(points) {
        if (points.length < 3) return points.slice();
        const out = [points[0]];
        let i = 0;
        while (i < points.length - 1) {
            let j = points.length - 1;
            for (; j > i + 1; j--) {
                if (!clearLine(points[i], points[j])) continue;
                if (segCost(points[i], points[j]) <= pathCost(points, i, j) + 0.5) break;
            }
            out.push(points[j]);
            i = j;
        }
        return out;
    }

    function clearLine(a, b) {
        const steps = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.5);
        for (let i = 0; i <= steps; i++) {
            const t = steps ? i / steps : 0;
            const px = a.x + (b.x - a.x) * t, py = a.y + (b.y - a.y) * t;
            if (!isWalkable(px, py)) return false;
            for (let k = 0; k < ROOMS.length; k++) {
                if (deepInside(px, py, ROOMS[k], 1)) return false;
            }
        }
        return true;
    }

    function buildLocations() {
        PLACES.forEach(p => {
            const room = ROOMS[p[3]];
            const centre = { x: room[0] + room[2] / 2, y: room[1] + room[3] / 2 };
            const door = findDoor(room, p[3]);
            locations.set(p[0], {
                id: p[0], name: p[1], type: p[2], room: p[3],
                cx: centre.x, cy: centre.y, door: door || centre
            });
        });

        WAYPOINTS.forEach(w => {
            const at = snap(w[1], w[2], 16, true);
            if (!at) return;
            locations.set(w[0], {
                id: w[0], name: w[3], type: 'corridor', room: -1,
                cx: at.x, cy: at.y, door: at
            });
        });
    }

    function routeBetween(from, to) {
        const raw = astar(from.door, to.door);
        if (!raw) return null;
        const road = simplify(raw);
        const line = [road[0]];
        road.forEach(p => {
            const last = line[line.length - 1];
            if (Math.hypot(p.x - last.x, p.y - last.y) > 1) line.push(p);
        });

        const points = [{ x: from.cx, y: from.cy }, { x: from.door.x, y: from.door.y }]
            .concat(line.slice(1, -1).map(p => ({ x: p.x, y: p.y })))
            .concat([{ x: to.door.x, y: to.door.y }, { x: to.cx, y: to.cy }]);

        let meters = 0;
        for (let i = 1; i < points.length; i++) {
            meters += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y) * M_PER_PX;
        }
        return { points, meters };
    }

    /* ------------------------------------------------------------------ *
     * 6. Dropdowns
     * ------------------------------------------------------------------ */

    function populateSelect(select, placeholder) {
        select.innerHTML = '';
        const ph = document.createElement('option');
        ph.value = '';
        ph.textContent = placeholder;
        ph.disabled = true;
        ph.selected = true;
        select.appendChild(ph);

        TYPE_ORDER.forEach(type => {
            const list = Array.from(locations.values())
                .filter(n => n.type === type)
                .sort((a, b) => a.name.localeCompare(b.name));
            if (!list.length) return;
            const group = document.createElement('optgroup');
            group.label = TYPES[type].label;
            list.forEach(n => {
                const opt = document.createElement('option');
                opt.value = n.id;
                opt.textContent = n.name;
                group.appendChild(opt);
            });
            select.appendChild(group);
        });
    }

    /* ------------------------------------------------------------------ *
     * 7. Drawing the route
     * ------------------------------------------------------------------ */

    function drawRoute(points, animate) {
        if (animHandle) { cancelAnimationFrame(animHandle); animHandle = null; }
        const attr = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
        const halo = layer.querySelector('.nav-halo');
        halo.setAttribute('points', attr);
        routePathEl.setAttribute('points', attr);

        if (!animate) {
            routePathEl.style.strokeDasharray = '';
            routePathEl.style.strokeDashoffset = '';
            return;
        }
        const total = polylineLength(points);
        routePathEl.style.strokeDasharray = `${total}`;
        routePathEl.style.strokeDashoffset = `${total}`;
        const duration = Math.min(2600, 500 + total * 4);
        const t0 = performance.now();
        const step = now => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = p < 1 ? 1 - Math.pow(1 - p, 3) : 1;
            routePathEl.style.strokeDashoffset = `${total * (1 - eased)}`;
            if (p < 1) animHandle = requestAnimationFrame(step);
            else animHandle = null;
        };
        animHandle = requestAnimationFrame(step);
    }

    function polylineLength(points) {
        let sum = 0;
        for (let i = 1; i < points.length; i++) {
            sum += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
        }
        return sum;
    }

    function clearRoute() {
        drawRoute([], false);
        summaryEl.style.display = 'none';
        summaryEl.innerHTML = '';
        guidanceEl.innerHTML = '<p class="guidance-placeholder">Pick your current location and a destination, then press "Show Route". The line follows the corridors of the drawn floor plan.</p>';
    }

    /* ------------------------------------------------------------------ *
     * 8. Turn by turn
     * ------------------------------------------------------------------ */

    const COMPASS_WORDS = [
        [22.5, 'north'], [67.5, 'north-east'], [112.5, 'east'], [157.5, 'south-east'],
        [202.5, 'south'], [247.5, 'south-west'], [292.5, 'west'], [337.5, 'north-west'], [360, 'north']
    ];

    function compassWord(deg) {
        for (const [limit, word] of COMPASS_WORDS) if (deg < limit) return word;
        return 'north';
    }

    function headingDiff(a, b) {
        let diff = b - a;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }

    function headingOf(a, b) {
        let deg = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90;
        if (deg < 0) deg += 360;
        return deg;
    }

    function turnWord(diff) {
        if (Math.abs(diff) < 25) return null;
        if (Math.abs(diff) > 150) return 'turn back';
        return diff > 0 ? 'turn right' : 'turn left';
    }

    function buildLegs(points) {
        const legs = [];
        for (let i = 2; i < points.length - 1; i++) {
            const heading = headingOf(points[i - 1], points[i]);
            const len = Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y) * M_PER_PX;
            const last = legs[legs.length - 1];
            if (len < 2.5) { if (last) last.len += len; continue; }
            if (last && Math.abs(headingDiff(last.heading, heading)) < 20) {
                last.len += len;
                last.heading = heading;
                continue;
            }
            legs.push({ heading, len, turn: last ? headingDiff(last.heading, heading) : null });
        }
        return legs;
    }

    function renderGuidance(from, to, points) {
        const steps = [{
            icon: 'fa-location-dot',
            text: `Start at ${from.name} (${TYPES[from.type].label.replace(/s$/, '')}).`
        }];
        let acc = 0;
        buildLegs(points).forEach(leg => {
            acc += leg.len;
            const turn = leg.turn === null ? null : turnWord(leg.turn);
            if (turn) {
                steps.push({
                    icon: turn === 'turn back' ? 'fa-rotate-left'
                        : (leg.turn > 0 ? 'fa-arrow-turn-up' : 'fa-arrow-turn-up fa-flip-horizontal'),
                    text: `At the corridor junction - ${turn} and continue ${compassWord(leg.heading)}.`
                });
            }
            steps.push({
                icon: 'fa-walking',
                text: `Walk ${Math.round(leg.len)} m ${compassWord(leg.heading)} along the corridor (${Math.round(acc)} m so far).`
            });
        });
        steps.push({ icon: 'fa-flag-checkered', text: `Arrive at ${to.name} (${TYPES[to.type].label.replace(/s$/, '')}).` });

        guidanceEl.innerHTML =
            '<div class="guidance-title"><i class="fa-solid fa-list-ul"></i> Turn-by-turn directions</div>' +
            '<ul>' + steps.map((s, i) =>
                `<li><span class="step-number${i === steps.length - 1 ? ' final' : ''}">
                    <i class="fa-solid ${s.icon}"></i></span>
                 <span>${escapeHTML(s.text)}</span></li>`).join('') + '</ul>';
    }

    function renderSummary(meters) {
        summaryEl.innerHTML =
            `<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="route-distance"><i class="fa-solid fa-ruler"></i> ${Math.round(meters)} m walk</div>
                <span class="route-steps">about ${Math.max(1, Math.round(meters / 80))} min on foot</span>
            </div>`;
        summaryEl.style.display = 'block';
    }

    /* ------------------------------------------------------------------ *
     * 9. Actions
     * ------------------------------------------------------------------ */

    function showRoute(startId, endId, animate) {
        const from = locations.get(startId);
        const to = locations.get(endId);
        if (!from || !to) {
            toast('Please select both a current location and a destination.');
            return;
        }
        if (startId === endId) {
            toast('Start and destination are the same place.');
            return;
        }
        const result = routeBetween(from, to);
        if (!result) {
            toast('No corridor route connects these two points.');
            return;
        }
        drawRoute(result.points, animate !== false);
        renderSummary(result.meters);
        renderGuidance(from, to, result.points);
    }

    function onShowRoute() {
        routeBtn.disabled = true;
        routeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculating...';
        setTimeout(() => {
            showRoute(startSelect.value, endSelect.value, true);
            routeBtn.disabled = false;
            routeBtn.innerHTML = '<i class="fa-solid fa-route"></i> Show Route';
        }, 60);
    }

    function initSearch() {
        const input = document.getElementById('map-search');
        if (!input) return;
        const pick = () => {
            const q = input.value.trim().toLowerCase();
            if (q.length < 2) return false;
            const hit = Array.from(locations.values()).find(n => n.name.toLowerCase().includes(q));
            if (!hit) return false;
            endSelect.value = hit.id;
            if (startSelect.value) showRoute(startSelect.value, hit.id, true);
            return true;
        };
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!pick()) toast('No location matches that search.');
            }
        });
    }

    function fit() {
        if (!wrap) return;
        const available = wrap.clientWidth || 943;
        zoom = Math.min(1, available / STAGE_W);
        stage.style.transform = `scale(${zoom})`;
        wrap.style.height = `${STAGE_H * zoom}px`;
    }

    /* ------------------------------------------------------------------ *
     * 10. Boot
     * ------------------------------------------------------------------ */

    document.addEventListener('DOMContentLoaded', () => {
        buildPlan();
        net = buildNetwork();
        buildLocations();
        buildOverlay();
        populateSelect(startSelect, 'Select your current location...');
        populateSelect(endSelect, 'Select a destination...');
        fit();

        if (routeBtn) routeBtn.addEventListener('click', onShowRoute);
        if (clearBtn) clearBtn.addEventListener('click', () => {
            startSelect.value = '';
            endSelect.value = '';
            clearRoute();
        });
        startSelect.addEventListener('change', () => {
            if (startSelect.value && endSelect.value) showRoute(startSelect.value, endSelect.value, false);
        });
        endSelect.addEventListener('change', () => {
            if (startSelect.value && endSelect.value) showRoute(startSelect.value, endSelect.value, true);
        });

        window.addEventListener('resize', fit);
        initSearch();
        clearRoute();
    });
})();