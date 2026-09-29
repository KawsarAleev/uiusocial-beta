<?php
// One-off seeder for the podcasts table. Every id below was verified to exist
// via YouTube's oEmbed endpoint, and titles/authors are taken from that
// response rather than typed by hand.
require_once __DIR__ . '/../config/helpers.php';

$meta = json_decode(file_get_contents('C:/Users/kawsa/AppData/Local/Temp/kilo/podcast_meta.json'), true);
if (!is_array($meta)) {
    exit("could not read podcast_meta.json\n");
}

$curated = [
    '8mAITcNt710' => ['kind' => 'video', 'category' => 'Computer Science', 'duration' => '24h 08m',
        'description' => 'Harvard University\'s introduction to the intellectual enterprises of computer science and the art of programming. The full lecture series that anchors most first-year CS curricula.'],
    'zOjov-2OZ0E' => ['kind' => 'video', 'category' => 'Computer Science', 'duration' => '4h 26m',
        'description' => 'A ground-up introduction to programming and computer science, covering variables, conditionals, loops, functions and recursion with worked examples.'],
    'PkZNo7MFNFg' => ['kind' => 'video', 'category' => 'Web Development', 'duration' => '1h 11m',
        'description' => 'A complete beginner-friendly pass through JavaScript covering variables, functions, arrays, objects and the DOM.'],
    'eIrMbAQSU34' => ['kind' => 'video', 'category' => 'Programming', 'duration' => '2h 30m',
        'description' => 'A full introductory Java course, from installation and first program through object-oriented programming and file handling.'],
    'UB1O30fR-EE' => ['kind' => 'video', 'category' => 'Web Development', 'duration' => '1h 07m',
        'description' => 'A fast crash course in HTML covering document structure, semantic elements, forms and tables for absolute beginners.'],
    'aircAruvnKk' => ['kind' => 'video', 'category' => 'AI & ML', 'duration' => '19m',
        'description' => 'The first chapter of the deep learning series: what a neural network actually computes, explained visually from the input layer outward.'],
    '5qap5aO4i9A' => ['kind' => 'audio', 'category' => 'Focus & Music', 'duration' => 'Live stream',
        'description' => 'A continuous lofi hip hop stream for background listening while studying or working.'],
];

$db = getDB();
$admin = (int) $db->query("SELECT id FROM users WHERE role='admin' AND status='approved' ORDER BY id LIMIT 1")->fetchColumn();

$stmt = $db->prepare(
    "INSERT INTO podcasts (title, description, provider, provider_id, kind, category, duration, source_name, created_by)
     VALUES (?, ?, 'youtube', ?, ?, ?, ?, ?, ?)"
);

$added = 0;
foreach ($meta as $m) {
    $id = $m['id'];
    if (!isset($curated[$id])) continue;

    // Never seed a row whose provider/id pair would fail validation.
    if (podcastEmbedInfo('youtube', $id) === null) {
        echo "skipped $id (failed validation)\n";
        continue;
    }

    $exists = $db->prepare("SELECT id FROM podcasts WHERE provider = 'youtube' AND provider_id = ?");
    $exists->execute([$id]);
    if ($exists->fetch()) continue;

    $c = $curated[$id];
    $stmt->execute([
        $m['title'],
        $c['description'],
        $id,
        $c['kind'],
        $c['category'],
        $c['duration'],
        $m['author'],
        $admin ?: null,
    ]);
    $added++;
    echo "  + #{$db->lastInsertId()} {$c['category']} / {$c['kind']}  {$m['title']}\n";
}

echo "\ninserted $added podcast(s); table now holds " . $db->query('SELECT COUNT(*) FROM podcasts')->fetchColumn() . "\n";
