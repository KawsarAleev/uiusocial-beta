<?php
require_once __DIR__ . '/session.php';

function getJsonInput() {
    $data = json_decode(file_get_contents('php://input'), true);
    return is_array($data) ? $data : [];
}

function isAdmin($user = null) {
    $user = $user ?? getCurrentUser();
    return $user && strtolower($user['role']) === 'admin';
}

function isGuestUser($user = null) {
    $user = $user ?? getCurrentUser();
    return $user && strtolower($user['role']) === 'guest';
}

function isApprovedMember($user = null) {
    $user = $user ?? getCurrentUser();
    if (!$user) return false;
    if (strtolower($user['role']) === 'guest') return false;
    $status = $user['status'] ?? 'approved';
    return $status === 'approved';
}

function canAct($user = null) {
    return isApprovedMember($user);
}

function requireCanAct() {
    requireLogin();
    if (!canAct()) {
        jsonResponse(['error' => 'Only approved students and faculty can perform this action.'], 403);
    }
}

function requireAdmin() {
    requireLogin();
    if (!isAdmin()) {
        jsonResponse(['error' => 'Admin access required'], 403);
    }
}

function columnExists(PDO $db, $table, $column) {
    $stmt = $db->prepare("SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?");
    $stmt->execute([$table, $column]);
    return (bool) $stmt->fetch();
}

function tableExists(PDO $db, $table) {
    $stmt = $db->prepare("SELECT 1 FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?");
    $stmt->execute([$table]);
    return (bool) $stmt->fetch();
}

function uploadImage($fileKey, $subdir) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $uploadDir = __DIR__ . '/../uploads/' . trim($subdir, '/') . '/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    $fileInfo = pathinfo($_FILES[$fileKey]['name']);
    $extension = strtolower($fileInfo['extension'] ?? '');
    if (!in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
        return null;
    }
    $newFilename = uniqid($subdir . '_') . '.' . $extension;
    $destination = $uploadDir . $newFilename;
    if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $destination)) {
        return 'uploads/' . trim($subdir, '/') . '/' . $newFilename;
    }
    return null;
}

function notificationIconClass($type) {
    $map = [
        'connection_request' => 'fa-solid fa-user-plus',
        'connection_accepted' => 'fa-solid fa-user-check',
        'connection_declined' => 'fa-solid fa-user-xmark',
        'connection_removed' => 'fa-solid fa-user-minus',
        'follow' => 'fa-solid fa-user-plus',
        'unfollow' => 'fa-solid fa-user-minus',
        'like_post' => 'fa-solid fa-heart',
        'like_comment' => 'fa-solid fa-heart',
        'like_club_post' => 'fa-solid fa-heart',
        'like_announcement' => 'fa-solid fa-heart',
        'comment_post' => 'fa-solid fa-comment',
        'comment_club_post' => 'fa-solid fa-comment',
        'comment_announcement' => 'fa-solid fa-comment',
        'reply_comment' => 'fa-solid fa-reply',
        'reply_reply' => 'fa-solid fa-reply',
        'new_post' => 'fa-solid fa-newspaper',
        'new_club_post' => 'fa-solid fa-newspaper',
        'new_announcement' => 'fa-solid fa-bullhorn',
        'event_rsvp' => 'fa-solid fa-calendar-check',
        'event_update' => 'fa-solid fa-calendar-day',
        'message' => 'fa-solid fa-envelope',
        'group_join_request' => 'fa-solid fa-user-group',
        'group_join_approved' => 'fa-solid fa-circle-check',
        'group_join_rejected' => 'fa-solid fa-circle-xmark',
        'group_removed' => 'fa-solid fa-user-minus',
        'club_join_request' => 'fa-solid fa-puzzle-piece',
        'club_join_approved' => 'fa-solid fa-circle-check',
        'club_join_rejected' => 'fa-solid fa-circle-xmark',
        'club_removed' => 'fa-solid fa-user-minus',
        'post_edited' => 'fa-solid fa-pen',
        'post_deleted' => 'fa-solid fa-trash',
        'join_request' => 'fa-solid fa-user-shield',
        'join_approved' => 'fa-solid fa-circle-check',
        'join_rejected' => 'fa-solid fa-circle-xmark',
        'report' => 'fa-solid fa-flag',
        'report_resolved' => 'fa-solid fa-shield-halved',
    ];
    $map['post_edit'] = $map['post_edited'];
    $map['connection'] = $map['connection_request'];
    $map['club_join'] = $map['club_join_request'];
    $map['club_join_approved'] = $map['club_join_approved'];
    $map['club_join_rejected'] = $map['club_join_rejected'];
    $map['group_join'] = $map['group_join_request'];
    $map['join'] = $map['join_approved'];
    return $map[$type] ?? 'fa-solid fa-bell';
}

function notificationIconColor($type) {
    if (strpos($type, 'like_') === 0) return '#e0245e';
    if (strpos($type, 'message') !== false) return '#0ea5e9';
    if (strpos($type, 'rejected') !== false || strpos($type, 'declined') !== false || strpos($type, 'removed') !== false || $type === 'post_deleted') return '#dc3545';
    if (strpos($type, 'request') !== false) return '#f59e0b';
    if (strpos($type, 'approved') !== false || strpos($type, 'accepted') !== false) return '#16a34a';
    if (strpos($type, 'report') !== false) return '#dc3545';
    return 'var(--primary-color)';
}

function notifyUser($userId, $type, $title, $body, $link = null, $actorId = null) {
    $userId = (int) $userId;
    if ($userId <= 0) return;
    if ($actorId && (int) $actorId === $userId) return;
    $title = mb_substr((string) $title, 0, 200);
    try {
        $db = getDB();
        try {
            $stmt = $db->prepare("INSERT INTO notifications (user_id, actor_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $actorId ?: null, $type, $title, $body, $link]);
        } catch (PDOException $e) {
            $stmt = $db->prepare("INSERT INTO notifications (user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$userId, $type, $title, $body, $link]);
        }
    } catch (Exception $e) {
        error_log('notifyUser: ' . $e->getMessage());
    }
}

function notifyAdmins($type, $title, $body, $link = null, $actorId = null) {
    try {
        $db = getDB();
        $stmt = $db->query("SELECT id FROM users WHERE role = 'admin'");
        foreach ($stmt->fetchAll() as $admin) {
            notifyUser($admin['id'], $type, $title, $body, $link, $actorId);
        }
    } catch (Exception $e) {
        error_log('notifyAdmins: ' . $e->getMessage());
    }
}

function userDisplayName($userId) {
    static $cache = [];
    $userId = (int) $userId;
    if (!$userId) return 'Someone';
    if (isset($cache[$userId])) return $cache[$userId];
    $name = null;
    try {
        $stmt = getDB()->prepare("SELECT name FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        if ($row && !empty($row['name'])) $name = $row['name'];
    } catch (Exception $e) {}
    $cache[$userId] = $name ?: 'Someone';
    return $cache[$userId];
}

function notificationSnippet($text, $limit = 90) {
    $text = trim(preg_replace('/\s+/', ' ', (string) $text));
    if ($text === '') return '';
    if (mb_strlen($text) <= $limit) return $text;
    return mb_substr($text, 0, $limit) . '…';
}

function postNotificationLink(array $ctx) {
    $postId = (int) ($ctx['post_id'] ?? 0);
    $groupId = (int) ($ctx['group_id'] ?? 0);
    $clubId = (int) ($ctx['club_id'] ?? 0);
    if ($clubId) return 'club_detail.html?id=' . $clubId . ($postId ? '#post-' . $postId : '');
    if ($groupId) return 'group_detail.html?id=' . $groupId . ($postId ? '#post-' . $postId : '');
    return 'index.html' . ($postId ? '#post-' . $postId : '');
}

function notificationTemplate($type, $actorName, array $ctx = []) {
    $actorId = (int) ($ctx['actor_id'] ?? 0);
    $profile = $actorId ? 'profile.html?id=' . $actorId : 'index.html';
    $snippet = notificationSnippet($ctx['snippet'] ?? '');
    $tail = $snippet !== '' ? ' "' . $snippet . '"' : '';
    $groupName = $ctx['group_name'] ?? 'the group';
    $clubName = $ctx['club_name'] ?? 'the club';
    $eventName = $ctx['event_name'] ?? 'your event';
    $item = $ctx['item_name'] ?? 'your post';

    $make = function ($title, $body, $link) {
        return ['title' => $title, 'body' => $body, 'link' => $link];
    };

    switch ($type) {
        case 'connection_request':
            return $make('New connection request', $actorName . ' wants to connect with you.', $profile);
        case 'connection_accepted':
            return $make('Connection accepted', $actorName . ' accepted your connection request.', $profile);
        case 'connection_declined':
            return $make('Connection request declined', $actorName . ' declined your connection request.', $profile);
        case 'connection_removed':
            return $make('Connection removed', $actorName . ' removed you from their connections.', $profile);
        case 'follow':
            return $make('New follower', $actorName . ' started following you.', $profile);
        case 'unfollow':
            return $make('Unfollowed', $actorName . ' no longer follows you.', $profile);

        case 'like_post':
        case 'like_club_post':
        case 'like_announcement':
            return $make('New like', $actorName . ' liked ' . $item . $tail . '.', postNotificationLink($ctx));
        case 'like_comment':
            return $make('New like on your comment', $actorName . ' liked your comment' . $tail . '.', postNotificationLink($ctx));

        case 'comment_post':
            return $make('New comment', $actorName . ' commented on ' . $item . $tail . '.', postNotificationLink($ctx));
        case 'comment_club_post':
        case 'comment_announcement':
            return $make('New comment', $actorName . ' commented' . $tail . '.', postNotificationLink($ctx));
        case 'reply_comment':
            return $make('New reply', $actorName . ' replied to your comment' . $tail . '.', postNotificationLink($ctx));
        case 'reply_reply':
            return $make('New reply', $actorName . ' replied to you' . $tail . '.', postNotificationLink($ctx));

        case 'new_post':
            return $make('New post', $actorName . ' shared a new post' . $tail . '.', postNotificationLink($ctx));
        case 'new_club_post':
            return $make('New club post', $actorName . ' posted in ' . $clubName . $tail . '.', 'club_detail.html?id=' . (int) ($ctx['club_id'] ?? 0));
        case 'new_announcement':
            return $make('New announcement', $actorName . ' posted an announcement in ' . $clubName . '.', 'club_detail.html?id=' . (int) ($ctx['club_id'] ?? 0));

        case 'event_rsvp':
            return $make('Event RSVP', $actorName . ' is going to ' . $eventName . '.', 'event_detail.html?id=' . (int) ($ctx['event_id'] ?? 0));
        case 'event_update':
            return $make('Event update', $actorName . ' updated ' . $eventName . '.', 'event_detail.html?id=' . (int) ($ctx['event_id'] ?? 0));

        case 'message':
            return $make('New message', $actorName . ' sent you a message' . $tail . '.', 'messages.html?user=' . $actorId);

        case 'group_join_request':
            return $make('Group join request', $actorName . ' requested to join ' . $groupName . '.', 'group_detail.html?id=' . (int) ($ctx['group_id'] ?? 0));
        case 'group_join_approved':
            return $make('Group request approved', 'Your request to join ' . $groupName . ' was approved.', 'group_detail.html?id=' . (int) ($ctx['group_id'] ?? 0));
        case 'group_join_rejected':
            return $make('Group request declined', 'Your request to join ' . $groupName . ' was declined.', 'group_detail.html?id=' . (int) ($ctx['group_id'] ?? 0));
        case 'group_removed':
            return $make('Removed from group', $actorName . ' removed you from ' . $groupName . '.', 'groups.html');

        case 'club_join_request':
            return $make('Club join request', $actorName . ' requested to join ' . $clubName . '.', 'club_detail.html?id=' . (int) ($ctx['club_id'] ?? 0));
        case 'club_join_approved':
            return $make('Club request approved', 'Your request to join ' . $clubName . ' was approved.', 'club_detail.html?id=' . (int) ($ctx['club_id'] ?? 0));
        case 'club_join_rejected':
            return $make('Club request declined', 'Your request to join ' . $clubName . ' was declined.', 'club_detail.html?id=' . (int) ($ctx['club_id'] ?? 0));
        case 'club_removed':
            return $make('Removed from club', $actorName . ' removed you from ' . $clubName . '.', 'club_hub.html');

        case 'post_edited':
            return $make('Post updated', $actorName . ' edited ' . $item . $tail . '.', postNotificationLink($ctx));
        case 'post_deleted':
            return $make('Post removed', 'Your post was removed by ' . $actorName . '.', 'index.html');

        case 'join_request':
            return $make('New joining request', $actorName . ' requested to join as ' . ($ctx['requested_role'] ?? 'student') . '.', 'admin.html');
        case 'join_approved':
            return $make('Account approved', 'Welcome to UIU Social! Your account is approved.', 'index.html');
        case 'join_rejected':
            return $make('Account declined', 'Your joining request was not approved.', 'login.html');
        case 'report':
            return $make('New report', $actorName . ' reported a post for ' . ($ctx['reason'] ?? 'review') . '.', 'admin.html');
        case 'report_resolved':
            return $make('Report resolved', 'Your report was reviewed by an admin.', 'index.html');
        default:
            return $make('Update', $actorName . ' triggered a new update.', $profile);
    }
}

function notifyActivity($type, $actorId, $recipients, array $ctx = []) {
    $actorId = (int) $actorId;
    $ids = [];
    foreach ((array) $recipients as $r) {
        $r = (int) $r;
        if ($r > 0) $ids[$r] = true;
    }
    unset($ids[$actorId]);
    if (!$ids) return;
    $actorName = $ctx['actor_name'] ?? ($actorId ? userDisplayName($actorId) : 'UIU Social');
    $ctx['actor_id'] = $actorId;
    $tpl = notificationTemplate($type, $actorName, $ctx);
    foreach (array_keys($ids) as $rid) {
        notifyUser($rid, $type, $tpl['title'], $tpl['body'], $tpl['link'], $actorId ?: null);
    }
}

function followerIds($userId) {
    try {
        $stmt = getDB()->prepare("SELECT follower_id FROM follows WHERE following_id = ?");
        $stmt->execute([(int) $userId]);
        return array_map(fn($r) => (int) $r['follower_id'], $stmt->fetchAll());
    } catch (Exception $e) {
        return [];
    }
}

function followingIds($userId) {
    try {
        $stmt = getDB()->prepare("SELECT following_id FROM follows WHERE follower_id = ?");
        $stmt->execute([(int) $userId]);
        return array_map(fn($r) => (int) $r['following_id'], $stmt->fetchAll());
    } catch (Exception $e) {
        return [];
    }
}

function groupMemberIds($groupId) {
    try {
        $stmt = getDB()->prepare("SELECT user_id FROM group_members WHERE group_id = ? AND role != 'requested'");
        $stmt->execute([(int) $groupId]);
        return array_map(fn($r) => (int) $r['user_id'], $stmt->fetchAll());
    } catch (Exception $e) {
        return [];
    }
}

function clubMemberIds($clubId) {
    try {
        $stmt = getDB()->prepare("SELECT user_id FROM club_members WHERE club_id = ? AND role != 'requested'");
        $stmt->execute([(int) $clubId]);
        return array_map(fn($r) => (int) $r['user_id'], $stmt->fetchAll());
    } catch (Exception $e) {
        return [];
    }
}

function eventAttendeeIds($eventId) {
    try {
        $stmt = getDB()->prepare("SELECT user_id FROM event_rsvps WHERE event_id = ?");
        $stmt->execute([(int) $eventId]);
        return array_map(fn($r) => (int) $r['user_id'], $stmt->fetchAll());
    } catch (Exception $e) {
        return [];
    }
}

function adminIds() {
    try {
        return array_map(fn($r) => (int) $r['id'], getDB()->query("SELECT id FROM users WHERE role = 'admin'")->fetchAll());
    } catch (Exception $e) {
        return [];
    }
}

function isGroupManager($groupId, $user = null) {
    $user = $user ?? getCurrentUser();
    if (!$user) return false;
    if (isAdmin($user)) return true;
    $db = getDB();
    $stmt = $db->prepare("SELECT created_by FROM groups_table WHERE id = ?");
    $stmt->execute([$groupId]);
    $group = $stmt->fetch();
    if ($group && (int) $group['created_by'] === (int) $user['id']) {
        return true;
    }
    $stmt = $db->prepare("SELECT role FROM group_members WHERE group_id = ? AND user_id = ?");
    $stmt->execute([$groupId, $user['id']]);
    $row = $stmt->fetch();
    return $row && $row['role'] === 'admin';
}

function isClubManager($clubId, $user = null) {
    $user = $user ?? getCurrentUser();
    if (!$user) return false;
    if (isAdmin($user)) return true;
    $db = getDB();
    $stmt = $db->prepare("SELECT owner_id FROM clubs WHERE id = ?");
    $stmt->execute([$clubId]);
    $club = $stmt->fetch();
    if ($club && (int) $club['owner_id'] === (int) $user['id']) {
        return true;
    }
    $stmt = $db->prepare("SELECT role FROM club_members WHERE club_id = ? AND user_id = ?");
    $stmt->execute([$clubId, $user['id']]);
    $row = $stmt->fetch();
    return $row && in_array($row['role'], ['admin', 'owner'], true);
}
