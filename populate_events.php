<?php
require_once 'C:\xampp\htdocs\uiusocial\config\database.php';
$db = getDB();

// Campus events
$events = [
    [1, 'Navigating the Future of AI in Modern Engineering', 'Join us for an exclusive keynote featuring industry pioneers from Silicon Valley as they discuss the integration of artificial intelligence in engineering practices and what it means for upcoming graduates.', 'seminar', '2026-10-24', '10:00:00', 'Main Auditorium', NULL, 'in_person', 'IEEE Student Branch', 245, 1, 1],
    [2, 'Web Development Hackathon 2026', 'A 24-hour intense coding session to build solutions for campus problems.', 'workshop', '2026-10-28', '09:00:00', 'CS Lab', '/assets/images/uiu/web-hackathon.png', 'in_person', 'App Forum', 0, 0, 6],
    [3, 'Data Science: Myths vs Reality', 'Understanding what the industry actually looks for in junior data scientists.', 'webinar', '2026-11-02', '18:00:00', 'Virtual', '/assets/images/uiu/myth-reality.png', 'virtual', 'Computer Club', 0, 0, 2],
    [4, 'Annual University Club Fair', 'Discover over 50 clubs and organizations to join and make your campus life memorable.', 'social', '2026-11-15', '10:00:00', 'Campus Plaza', '/assets/images/uiu/club-fair.png', 'in_person', 'Student Affairs', 0, 0, 1],
    [5, 'Emerging Trends in Smart Grid Technology', 'Specialized seminar for senior year engineering students.', 'seminar', '2026-12-05', '14:00:00', 'Seminar Hall B', NULL, 'in_person', 'EEE Dept', 0, 0, 1],
    [6, 'Quantum Computing: The Next Frontier', 'Introduction to qubit mechanics and quantum algorithms.', 'seminar', '2026-12-08', '10:00:00', 'Virtual Room 4', NULL, 'virtual', 'CSE Dept', 0, 0, 1],
];

$stmt = $db->prepare("INSERT INTO events (id, title, description, category, event_date, event_time, location, image, event_type, organizer, attendees_count, is_featured, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
foreach ($events as $e) {
    $stmt->execute($e);
}

// Club events
$clubEvents = [
    ['Robotics Workshop 101', 'Hands-on intro to sensors, motors, and Arduino for new members.', 'workshop', '2026-09-12', '14:00:00', 'Main Auditorium', 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=500&q=80', 'in_person', 'Robotics Club', 47, 0, 4, 4],
    ['Inter University Debate Qualifiers', 'Team formation and briefing for the national debate competition.', 'academic', '2026-10-05', '16:00:00', 'Room 402', NULL, 'in_person', 'UIU Debate Club', 32, 0, 2, 5],
    ['App Forum Hack Night', 'Overnight prototyping session for campus utility apps.', 'workshop', '2026-10-18', '18:00:00', 'CS Lab', '/assets/images/uiu/web-hackathon.png', 'in_person', 'App Forum', 28, 0, 6, 1],
];

$stmt2 = $db->prepare("INSERT INTO events (title, description, category, event_date, event_time, location, image, event_type, organizer, attendees_count, is_featured, created_by, club_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)");
foreach ($clubEvents as $e) {
    $stmt2->execute($e);
}

// RSVPs
$rsvps = [
    [1,2],[1,3],[1,4],[1,5],[1,6],
    [2,1],[2,3],[2,4],
    [3,1],[3,2],[3,6],
    [7,3],[7,6],
    [8,2],[8,5],
];

$stmt3 = $db->prepare("INSERT INTO event_rsvps (event_id, user_id) VALUES (?,?)");
foreach ($rsvps as $r) {
    $stmt3->execute($r);
}

echo "Done inserting events and RSVPs\n";

$stmt = $db->query('SELECT COUNT(*) as c FROM events');
echo 'Events: ' . $stmt->fetch()['c'] . PHP_EOL;
$stmt = $db->query('SELECT COUNT(*) as c FROM event_rsvps');
echo 'RSVPs: ' . $stmt->fetch()['c'] . PHP_EOL;