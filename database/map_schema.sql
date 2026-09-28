-- Indoor Navigation Map Schema
-- UIU 2nd Floor waypoints and connections
-- Run this file against the existing `uiusocial` database.
-- Safe to re-run: uses CREATE TABLE IF NOT EXISTS and INSERT IGNORE.

CREATE TABLE IF NOT EXISTS floor_nodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    floor_level INT NOT NULL DEFAULT 2,
    node_name VARCHAR(100) NOT NULL,
    node_type ENUM('lift', 'stair', 'room', 'corridor') NOT NULL DEFAULT 'corridor',
    x_pos INT NOT NULL,
    y_pos INT NOT NULL,
    INDEX idx_floor_level (floor_level),
    INDEX idx_node_type (node_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS floor_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_node_id INT NOT NULL,
    to_node_id INT NOT NULL,
    distance DECIMAL(8,2) NOT NULL,
    INDEX idx_from (from_node_id),
    INDEX idx_to (to_node_id),
    UNIQUE KEY unique_edge (from_node_id, to_node_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SEED DATA: FLOOR NODES (UIU 2nd Floor)
-- Coordinates are in the native map.jpg pixel space (3072 x 4096).
-- ============================================
INSERT IGNORE INTO floor_nodes (id, floor_level, node_name, node_type, x_pos, y_pos) VALUES
(1,  2, 'Main Entrance Lobby',      'corridor', 1536, 1024),
(2,  2, 'Lift',                     'lift',     512,  1024),
(3,  2, 'Main Stairs',              'stair',    512,  512),
(4,  2, 'Reception Desk',           'room',     1536, 600),
(5,  2, 'Corridor Junction West',   'corridor', 768,  2048),
(6,  2, 'Classroom 220',            'room',     600,  2560),
(7,  2, 'Computer Lab 221',         'room',     900,  2560),
(8,  2, 'Classroom 223',            'room',     1200, 2560),
(9,  2, 'Faculty Offices',          'room',     1500, 2560),
(10, 2, 'Corridor Junction Center', 'corridor', 1536, 2048),
(11, 2, 'Lecture Hall A',           'room',     1800, 2560),
(12, 2, 'Seminar Room',             'room',     2100, 2560),
(13, 2, 'Restroom',                 'room',     2400, 2560),
(14, 2, 'Corridor Junction East',   'corridor', 2400, 2048),
(15, 2, 'Library Reading Area',     'corridor', 2750, 2048),
(16, 2, 'East Elevator Lobby',      'corridor', 2750, 1024);

-- ============================================
-- SEED DATA: FLOOR CONNECTIONS
-- Distances are in metres. Edges are bidirectional;
-- each undirected connection is stored once and
-- mirrored with the same distance for both directions.
-- ============================================
INSERT IGNORE INTO floor_connections (from_node_id, to_node_id, distance) VALUES
(1, 2, 20),   (2, 1, 20),
(1, 3, 24),   (3, 1, 24),
(1, 4, 8),    (4, 1, 8),
(1, 10, 20),  (10, 1, 20),
(1, 16, 24),  (16, 1, 24),
(2, 3, 10),   (3, 2, 10),
(2, 5, 21),   (5, 2, 21),
(3, 4, 20),   (4, 3, 20),
(5, 6, 11),   (6, 5, 11),
(5, 7, 11),   (7, 5, 11),
(5, 10, 15),  (10, 5, 15),
(6, 7, 6),    (7, 6, 6),
(7, 8, 6),    (8, 7, 6),
(8, 9, 6),    (9, 8, 6),
(9, 10, 10),  (10, 9, 10),
(10, 11, 12), (11, 10, 12),
(10, 14, 17), (14, 10, 17),
(11, 12, 6),  (12, 11, 6),
(12, 13, 6),  (13, 12, 6),
(13, 14, 10), (14, 13, 10),
(14, 15, 7),  (15, 14, 7),
(14, 16, 22), (16, 14, 22),
(15, 16, 20), (16, 15, 20);
