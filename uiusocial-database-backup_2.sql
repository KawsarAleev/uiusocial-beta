-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2026 at 04:27 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `uiusocial`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `target_type` varchar(50) NOT NULL,
  `target_id` int(11) NOT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_logs`
--

INSERT INTO `admin_logs` (`id`, `admin_id`, `action`, `target_type`, `target_id`, `details`, `created_at`) VALUES
(8, 8, 'ban', 'user', 10, 'For spamming', '2026-09-28 21:13:33'),
(34, 8, 'delete_post', 'post', 15, 'Deleted post #15 on the main feed: \"Hi, everyone\"', '2026-09-28 21:48:06'),
(47, 8, 'create_podcast', 'podcast', 43, 'Added youtube episode \"UIU Exam Conflict Tracker | Pre Advising Made Easy\"', '2026-09-29 02:25:21');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `club_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `created_by`, `club_id`, `created_at`) VALUES
(1, 'Midterm Schedule Released', 'Check the student portal for the revised schedule.', NULL, 3, '2026-09-22 00:53:21'),
(2, 'Library 24/7 Access', 'Extended hours begin next Monday for the exam period.', NULL, 1, '2026-09-22 00:53:21'),
(3, 'New 3D Printers arrived!', 'We are excited to announce that the lab has received three new Bambu Lab printers. Orientation for new members starts this Friday.', 4, 4, '2026-09-22 00:53:21'),
(4, 'Regional Qualifiers Registration', 'The registration for the upcoming Inter University National Debate Competition is now open. Team formation meetings at Room 402.', 2, 5, '2026-09-22 00:53:21'),
(5, 'Autumn App Showcase', 'Submit your prototype by next Wednesday to present at the monthly App Forum showcase.', NULL, 1, '2026-09-22 00:53:21');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_comments`
--

CREATE TABLE `announcement_comments` (
  `id` int(11) NOT NULL,
  `announcement_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcement_comments`
--

INSERT INTO `announcement_comments` (`id`, `announcement_id`, `user_id`, `content`, `created_at`) VALUES
(1, 1, 9, 'Ok', '2026-09-22 05:34:44'),
(2, 1, 9, 'hi', '2026-09-22 05:42:10');

-- --------------------------------------------------------

--
-- Table structure for table `announcement_likes`
--

CREATE TABLE `announcement_likes` (
  `id` int(11) NOT NULL,
  `announcement_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `blocked_users`
--

CREATE TABLE `blocked_users` (
  `id` int(11) NOT NULL,
  `blocker_id` int(11) NOT NULL,
  `blocked_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clubs`
--

CREATE TABLE `clubs` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `icon` varchar(50) DEFAULT 'fa-puzzle-piece',
  `icon_color` varchar(20) DEFAULT '#333',
  `icon_bg` varchar(20) DEFAULT '#f5f5f5',
  `cover_color` varchar(255) DEFAULT 'linear-gradient(135deg, #333, #666)',
  `members_count` int(11) DEFAULT 0,
  `founded` varchar(50) DEFAULT NULL,
  `advisor` varchar(100) DEFAULT NULL,
  `about` text DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_verified` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clubs`
--

INSERT INTO `clubs` (`id`, `name`, `slug`, `category`, `image`, `icon`, `icon_color`, `icon_bg`, `cover_color`, `members_count`, `founded`, `advisor`, `about`, `owner_id`, `created_at`, `is_verified`, `updated_at`) VALUES
(1, 'App Forum', 'app-forum', 'Technology', 'assets/images/clubs/app-forum.png', 'fa-code', '#d32f2f', '#ffe8e8', 'linear-gradient(135deg, #d32f2f, #f06292)', 450, 'January 2021', 'Dr. Rafid Nahiyan Farabi', 'A collaborative platform for app developers at UIU. We discuss mobile and web application development, share project ideas, organize hackathons, and help each other build real-world skills.', NULL, '2026-09-22 00:53:21', 0, NULL),
(2, 'UIU Computer Club', 'uiu-computer-club', 'Technology', 'assets/images/clubs/computer-club.png', 'fa-desktop', '#e65100', '#fff3e0', 'linear-gradient(135deg, #e65100, #ffa726)', 1200, 'March 2015', 'Dr. Avijit Saha', 'The largest and most prestigious club at UIU. UIU Computer Club (UIUCC) drives innovation through programming contests, seminars, and tech workshops. We nurture future software engineers and tech leaders.', 2, '2026-09-22 00:53:21', 0, NULL),
(3, 'Cultural Club', 'cultural-club', 'Arts & Culture', 'assets/images/clubs/cultural-club.png', 'fa-masks-theater', '#2e7d32', '#e8f5e9', 'linear-gradient(135deg, #2e7d32, #66bb6a)', 850, 'August 2018', 'Prof. Shamima Akhter', 'The Cultural Club of UIU celebrates the rich heritage and diversity of Bangladeshi culture. We organize music, drama, dance, and poetry events that enrich campus life and foster creativity.', 5, '2026-09-22 00:53:21', 0, NULL),
(4, 'Robotics Club', 'robotics-club', 'Technology', 'assets/images/clubs/robotics-club.png', 'fa-robot', '#1565c0', '#e3f2fd', 'linear-gradient(135deg, #1565c0, #42a5f5)', 320, 'June 2019', 'Dr. Karim Hossain', 'The UIU Robotics Lab is where hardware meets software. We build autonomous robots, IoT devices, and embedded systems. Members compete in national and international robotics competitions.', 4, '2026-09-22 00:53:21', 0, NULL),
(5, 'UIU Debate Club', 'debate-club', 'Academic', 'assets/images/clubs/debate-club.png', 'fa-comments', '#c62828', '#ffebee', 'linear-gradient(135deg, #c62828, #ef5350)', 520, 'October 2017', 'Dr. Rezwanul Huque', 'UIU Debate Club (UIUDC) is dedicated to promoting logic, critical thinking, public speaking, and parliamentary debate skills among students.', 2, '2026-09-22 00:53:21', 0, NULL),
(6, 'Sports Club', 'sports-club', 'Sports', 'assets/images/clubs/sports-club.png', 'fa-trophy', '#00897b', '#e0f2f1', 'linear-gradient(135deg, #00897b, #4db6ac)', 951, 'February 2016', 'Prof. Tareq Rahman', 'UIU Sports Club brings together athletes and sports enthusiasts across campus. We organize tournaments, foster teamwork, and promote fitness.', 5, '2026-09-22 00:53:21', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `club_activities`
--

CREATE TABLE `club_activities` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `activity` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_activities`
--

INSERT INTO `club_activities` (`id`, `club_id`, `activity`) VALUES
(1, 1, 'Monthly App Showcase'),
(2, 1, 'Weekly Dev Talks'),
(3, 1, 'Inter-university Hackathon'),
(4, 2, 'ICPC Training'),
(5, 2, 'National Collegiate Programming Contest'),
(6, 2, 'Annual Tech Symposium'),
(7, 3, 'Annual Cultural Festival'),
(8, 3, 'Photography Contest'),
(9, 3, 'Drama Competitions'),
(10, 3, 'Bangla New Year Celebration'),
(11, 4, 'RoboFest Competition'),
(12, 4, '3D Printing Workshops'),
(13, 4, 'Arduino Bootcamp'),
(14, 4, 'Inter-university Robot Wars'),
(15, 5, 'Inter-University National Debate'),
(16, 5, 'Weekly Public Speaking Sessions'),
(17, 5, 'Freshers Debate Workshop'),
(18, 6, 'UIU Champions League'),
(19, 6, 'Annual Sports Indoor Tournament'),
(20, 6, 'Inter-University Football Championship');

-- --------------------------------------------------------

--
-- Table structure for table `club_members`
--

CREATE TABLE `club_members` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('member','admin','owner','requested') DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_members`
--

INSERT INTO `club_members` (`id`, `club_id`, `user_id`, `role`, `joined_at`) VALUES
(2, 2, 2, 'owner', '2026-09-22 00:53:21'),
(3, 3, 5, 'owner', '2026-09-22 00:53:21'),
(4, 4, 4, 'owner', '2026-09-22 00:53:21'),
(5, 5, 2, 'owner', '2026-09-22 00:53:21'),
(6, 6, 5, 'owner', '2026-09-22 00:53:21'),
(7, 1, 3, 'member', '2026-09-22 00:53:21'),
(9, 4, 3, 'member', '2026-09-22 00:53:21'),
(10, 6, 9, 'member', '2026-09-22 02:43:51');

-- --------------------------------------------------------

--
-- Table structure for table `club_posts`
--

CREATE TABLE `club_posts` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `likes_count` int(11) DEFAULT 0,
  `comments_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_posts`
--

INSERT INTO `club_posts` (`id`, `club_id`, `user_id`, `content`, `likes_count`, `comments_count`, `created_at`) VALUES
(2, 1, 3, 'Great session today on React Native! The recording will be uploaded to the drive by tonight.', 51, 12, '2026-09-21 18:53:21'),
(3, 2, 2, 'The ICPC Regional 2024 practice sessions begin this Saturday. All registered members please confirm attendance.', 98, 23, '2026-09-21 00:53:21'),
(4, 2, 4, 'Finished 3rd in the inter-university CP contest! Huge thanks to the club for the training!', 145, 31, '2026-09-20 00:53:21'),
(5, 3, 5, 'Registrations for the Autumn Cultural Fest drama competition are now OPEN! Sign up before October 1st.', 67, 18, '2026-09-21 21:53:21'),
(7, 4, 4, 'New 3D Printers arrived! Three brand-new Bambu Lab machines are now in the lab. Orientation this Friday.', 42, 13, '2026-09-21 22:53:21'),
(8, 4, 3, 'Our team placed 2nd in the National RoboFest 2024! Super proud of everyone who put in the work!', 189, 47, '2026-09-21 19:53:21'),
(9, 5, 2, 'The registration for the upcoming Inter University National Debate Competition is now open. Team formation meetings at Room 402.', 89, 5, '2026-09-21 19:53:21'),
(10, 6, 5, 'Fixtures for the UIU Cricket Premier League are out! Check the tournament schedule on the noticeboard.', 104, 15, '2026-09-21 20:53:21'),
(11, 4, 8, 'hi', 0, 0, '2026-09-22 06:30:47');

-- --------------------------------------------------------

--
-- Table structure for table `club_post_comments`
--

CREATE TABLE `club_post_comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `club_post_likes`
--

CREATE TABLE `club_post_likes` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `club_tags`
--

CREATE TABLE `club_tags` (
  `id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `tag` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `club_tags`
--

INSERT INTO `club_tags` (`id`, `club_id`, `tag`) VALUES
(1, 1, 'Mobile Dev'),
(2, 1, 'Web Dev'),
(3, 1, 'Hackathon'),
(4, 1, 'UI/UX'),
(5, 2, 'Competitive Programming'),
(6, 2, 'Seminars'),
(7, 2, 'CP Contests'),
(8, 2, 'Tech Talks'),
(9, 3, 'Music'),
(10, 3, 'Drama'),
(11, 3, 'Dance'),
(12, 3, 'Poetry'),
(13, 3, 'Photography'),
(14, 4, 'Robotics'),
(15, 4, 'IoT'),
(16, 4, 'Arduino'),
(17, 4, 'Raspberry Pi'),
(18, 4, 'AI'),
(19, 5, 'Debate'),
(20, 5, 'Public Speaking'),
(21, 5, 'Parliamentary'),
(22, 5, 'Logic'),
(23, 6, 'Cricket'),
(24, 6, 'Football'),
(25, 6, 'Table Tennis'),
(26, 6, 'Chess'),
(27, 6, 'Badminton');

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `edited_at` timestamp NULL DEFAULT NULL,
  `likes_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `parent_id`, `content`, `created_at`, `edited_at`, `likes_count`) VALUES
(1, 1, 3, NULL, 'Thank you sir! Is registration open for 3rd-year students as well?', '2026-09-21 23:03:21', NULL, 0),
(3, 1, 4, NULL, 'Can EEE students join this seminar if seats are available?', '2026-09-21 23:23:21', NULL, 0),
(8, 4, 4, NULL, 'I work mostly on backend (Node.js), but let me know if you need someone on the server side!', '2026-09-21 19:13:21', NULL, 0),
(9, 4, 3, NULL, 'That works great! Sent you a message.', '2026-09-21 19:23:21', NULL, 0),
(10, 5, 5, NULL, 'Saw a red multimeter at the lab attendant desk a few minutes ago. Might want to check there!', '2026-09-21 17:13:21', NULL, 0),
(11, 5, 4, NULL, 'Found it at the desk, thanks Tamim!', '2026-09-21 17:23:21', NULL, 0),
(12, 6, 3, NULL, 'Are inter-departmental teams allowed this year?', '2026-09-21 13:13:21', NULL, 0),
(13, 6, 5, NULL, 'Yes! Each team must have at least one BBA student, but other members can be from CSE or EEE.', '2026-09-21 13:23:21', NULL, 0),
(14, 7, 4, NULL, 'Sir, should we bring a printed draft of our proposal?', '2026-09-21 01:33:21', NULL, 0),
(17, 8, 2, NULL, 'Yes, I uploaded the deck to the course portal under Module 4.', '2026-09-21 01:13:21', NULL, 0),
(18, 9, 5, NULL, 'Clean setup! What font family are you using in VS Code?', '2026-09-20 02:13:21', NULL, 0),
(19, 9, 3, NULL, 'That is JetBrains Mono with ligatures enabled!', '2026-09-20 02:23:21', NULL, 0),
(23, 5, 8, NULL, 'You found it?', '2026-09-22 01:35:41', NULL, 0),
(24, 5, 8, 11, 'Ok', '2026-09-22 01:35:50', NULL, 0),
(27, 16, 9, NULL, 'hlw', '2026-09-22 05:41:35', NULL, 0),
(28, 19, 8, NULL, 'hi', '2026-09-22 06:31:43', NULL, 0),
(29, 19, 8, 28, 'hlw', '2026-09-22 06:31:48', NULL, 0),
(42, 4, 9, NULL, 'hlw', '2026-09-28 19:40:44', NULL, 0),
(50, 3, 3, NULL, 'Thank you so much sir! This extension really helps with our ongoing midterms.', '2026-09-28 16:56:16', NULL, 0),
(51, 3, 2, NULL, 'You\'re welcome. Make sure the ER diagrams are clearly drawn in the appendix section.', '2026-09-28 17:06:16', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `comment_likes`
--

CREATE TABLE `comment_likes` (
  `id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `connections`
--

CREATE TABLE `connections` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `connected_user_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `connections`
--

INSERT INTO `connections` (`id`, `user_id`, `connected_user_id`, `status`, `created_at`) VALUES
(6, 2, 3, 'accepted', '2026-09-22 00:53:21'),
(7, 3, 4, 'accepted', '2026-09-22 00:53:21'),
(8, 8, 3, 'pending', '2026-09-22 01:36:04'),
(9, 8, 9, 'accepted', '2026-09-22 01:36:08'),
(10, 8, 2, 'pending', '2026-09-22 04:59:10'),
(11, 8, 4, 'pending', '2026-09-22 05:00:24'),
(13, 8, 11, 'pending', '2026-09-22 05:00:26'),
(14, 8, 5, 'pending', '2026-09-22 05:00:27');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT 'general',
  `event_date` date DEFAULT NULL,
  `event_time` time DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `event_type` enum('in_person','virtual') DEFAULT 'in_person',
  `organizer` varchar(100) DEFAULT NULL,
  `attendees_count` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `club_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `max_attendees` int(11) DEFAULT NULL,
  `registration_deadline` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `category`, `event_date`, `event_time`, `location`, `image`, `event_type`, `organizer`, `attendees_count`, `is_featured`, `created_by`, `club_id`, `created_at`, `max_attendees`, `registration_deadline`, `updated_at`) VALUES
(1, 'Navigating the Future of AI in Modern Engineering', 'Join us for an exclusive keynote featuring industry pioneers from Silicon Valley as they discuss the integration of artificial intelligence in engineering practices and what it means for upcoming graduates.', 'seminar', '2026-10-24', '10:00:00', 'Main Auditorium', 'assets/images/events/ai.png', 'in_person', 'IEEE Student Branch', 245, 1, 1, NULL, '2026-09-21 18:53:21', NULL, NULL, NULL),
(2, 'Web Development Hackathon 2026', 'A 24-hour intense coding session to build solutions for campus problems.', 'workshop', '2026-10-28', '09:00:00', 'CS Lab', 'https://www.cloudfest.com/wp-content/uploads/2025/04/hackathon-contest-programmers.jpg', 'in_person', 'App Forum', 0, 0, NULL, NULL, '2026-09-21 18:53:21', NULL, NULL, NULL),
(3, 'Data Science: Myths vs Reality', 'Understanding what the industry actually looks for in junior data scientists.', 'webinar', '2026-11-02', '18:00:00', 'Virtual', 'https://www.slideteam.net/media/catalog/product/cache/1280x720/d/a/data_analytics_powerpoint_presentation_slides_Slide01.jpg', 'virtual', 'Computer Club', 0, 0, 2, NULL, '2026-09-21 18:53:21', NULL, NULL, NULL),
(4, 'Annual University Club Fair', 'Discover over 50+ clubs and organizations to join and make your campus life memorable.', 'social', '2026-11-15', '10:00:00', 'Campus Plaza', 'https://d31kydh6n6r5j5.cloudfront.net/uploads/sites/2/2021/09/clubFair2021-e1632887497867.jpg', 'in_person', 'Student Affairs', 0, 0, 1, NULL, '2026-09-21 18:53:21', NULL, NULL, NULL),
(5, 'Emerging Trends in Smart Grid Technology', 'Specialized seminar for senior year engineering students.', 'seminar', '2026-12-05', '14:00:00', 'Seminar Hall B', '/assets/images/events/grid.png', 'in_person', 'EEE Dept', 0, 0, 1, NULL, '2026-09-21 18:53:21', NULL, NULL, NULL),
(6, 'Quantum Computing: The Next Frontier', 'Introduction to qubit mechanics and quantum algorithms.', 'seminar', '2026-12-08', '10:00:00', 'Virtual Room 4', 'https://static.vecteezy.com/system/resources/previews/034/795/600/non_2x/abstract-quantum-computer-technologies-background-concept-with-futuristic-blue-circuit-and-waves-flow-illustration-eps10-free-vector.jpg', 'virtual', 'CSE Dept', 0, 0, 1, NULL, '2026-09-21 18:53:21', NULL, NULL, NULL),
(7, 'Robotics Workshop 101', 'Hands-on intro to sensors, motors, and Arduino for new members.', 'workshop', '2026-09-12', '14:00:00', 'Main Auditorium', '/assets/images/events/robot.png', 'in_person', 'Robotics Club', 47, 0, 4, 4, '2026-09-21 18:53:21', NULL, NULL, NULL),
(8, 'Inter University Debate Qualifiers', 'Team formation and briefing for the national debate competition.', 'academic', '2026-10-05', '16:00:00', 'Room 402', '/assets/images/events/debate.png', 'in_person', 'UIU Debate Club', 32, 0, 2, 5, '2026-09-21 18:53:21', NULL, NULL, NULL),
(9, 'App Forum Hack Night', 'Overnight prototyping session for campus utility apps.', 'workshop', '2026-10-18', '18:00:00', 'CS Lab', '/assets/images/events/web.png', 'in_person', 'App Forum', 28, 0, NULL, 1, '2026-09-21 18:53:21', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `event_rsvps`
--

CREATE TABLE `event_rsvps` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_rsvps`
--

INSERT INTO `event_rsvps` (`id`, `event_id`, `user_id`, `created_at`) VALUES
(0, 1, 8, '2026-09-22 06:05:13'),
(0, 5, 8, '2026-09-22 06:05:14'),
(0, 4, 8, '2026-09-22 06:05:18'),
(0, 2, 8, '2026-09-22 06:05:19'),
(0, 3, 8, '2026-09-22 06:12:19'),
(0, 1, 11, '2026-09-22 06:44:59'),
(0, 5, 11, '2026-09-22 06:45:00'),
(0, 6, 11, '2026-09-22 06:45:01');

-- --------------------------------------------------------

--
-- Table structure for table `floor_connections`
--

CREATE TABLE `floor_connections` (
  `id` int(11) NOT NULL,
  `from_node_id` int(11) NOT NULL,
  `to_node_id` int(11) NOT NULL,
  `distance` decimal(8,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `floor_connections`
--

INSERT INTO `floor_connections` (`id`, `from_node_id`, `to_node_id`, `distance`) VALUES
(1, 1, 2, 20.00),
(2, 2, 1, 20.00),
(3, 1, 3, 24.00),
(4, 3, 1, 24.00),
(5, 1, 4, 8.00),
(6, 4, 1, 8.00),
(7, 1, 10, 20.00),
(8, 10, 1, 20.00),
(9, 1, 16, 24.00),
(10, 16, 1, 24.00),
(11, 2, 3, 10.00),
(12, 3, 2, 10.00),
(13, 2, 5, 21.00),
(14, 5, 2, 21.00),
(15, 3, 4, 20.00),
(16, 4, 3, 20.00),
(17, 5, 6, 11.00),
(18, 6, 5, 11.00),
(19, 5, 7, 11.00),
(20, 7, 5, 11.00),
(21, 5, 10, 15.00),
(22, 10, 5, 15.00),
(23, 6, 7, 6.00),
(24, 7, 6, 6.00),
(25, 7, 8, 6.00),
(26, 8, 7, 6.00),
(27, 8, 9, 6.00),
(28, 9, 8, 6.00),
(29, 9, 10, 10.00),
(30, 10, 9, 10.00),
(31, 10, 11, 12.00),
(32, 11, 10, 12.00),
(33, 10, 14, 17.00),
(34, 14, 10, 17.00),
(35, 11, 12, 6.00),
(36, 12, 11, 6.00),
(37, 12, 13, 6.00),
(38, 13, 12, 6.00),
(39, 13, 14, 10.00),
(40, 14, 13, 10.00),
(41, 14, 15, 7.00),
(42, 15, 14, 7.00),
(43, 14, 16, 22.00),
(44, 16, 14, 22.00),
(45, 15, 16, 20.00),
(46, 16, 15, 20.00);

-- --------------------------------------------------------

--
-- Table structure for table `floor_nodes`
--

CREATE TABLE `floor_nodes` (
  `id` int(11) NOT NULL,
  `floor_level` int(11) NOT NULL DEFAULT 2,
  `node_name` varchar(100) NOT NULL,
  `node_type` enum('lift','stair','room','corridor') NOT NULL DEFAULT 'corridor',
  `x_pos` int(11) NOT NULL,
  `y_pos` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `floor_nodes`
--

INSERT INTO `floor_nodes` (`id`, `floor_level`, `node_name`, `node_type`, `x_pos`, `y_pos`) VALUES
(1, 2, 'Main Entrance Lobby', 'corridor', 1536, 1024),
(2, 2, 'Lift', 'lift', 512, 1024),
(3, 2, 'Main Stairs', 'stair', 512, 512),
(4, 2, 'Reception Desk', 'room', 1536, 600),
(5, 2, 'Corridor Junction West', 'corridor', 768, 2048),
(6, 2, 'Classroom 220', 'room', 600, 2560),
(7, 2, 'Computer Lab 221', 'room', 900, 2560),
(8, 2, 'Classroom 223', 'room', 1200, 2560),
(9, 2, 'Faculty Offices', 'room', 1500, 2560),
(10, 2, 'Corridor Junction Center', 'corridor', 1536, 2048),
(11, 2, 'Lecture Hall A', 'room', 1800, 2560),
(12, 2, 'Seminar Room', 'room', 2100, 2560),
(13, 2, 'Restroom', 'room', 2400, 2560),
(14, 2, 'Corridor Junction East', 'corridor', 2400, 2048),
(15, 2, 'Library Reading Area', 'corridor', 2750, 2048),
(16, 2, 'East Elevator Lobby', 'corridor', 2750, 1024);

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `id` int(11) NOT NULL,
  `follower_id` int(11) NOT NULL,
  `following_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groups_table`
--

CREATE TABLE `groups_table` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `category` varchar(50) DEFAULT 'other',
  `members_count` int(11) DEFAULT 0,
  `is_enrolled` tinyint(1) DEFAULT 0,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_private` tinyint(1) DEFAULT 0,
  `rules` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `groups_table`
--

INSERT INTO `groups_table` (`id`, `name`, `description`, `image`, `category`, `members_count`, `is_enrolled`, `created_by`, `created_at`, `is_private`, `rules`, `updated_at`) VALUES
(1, 'CSE Batch 243 Official', 'The main hub for CSE Batch 24 students. Discuss exams, course registrations, and upcoming events.', 'assets/images/uiu/uiu-cse.png', 'cs', 452, 1, NULL, '2026-09-22 00:53:21', 0, NULL, NULL),
(2, 'Robotics Club Core', 'Project discussion and technical support for robotics competition teams.', '/assets/images/groups/robotics.png', 'cs,ee', 86, 0, 4, '2026-09-22 00:53:21', 0, NULL, NULL),
(3, 'DBMS Section B', 'Specifically for student enrolled in CSE411 Section B. Group project coordination.', '/assets/images/groups/dbms.png', 'cs', 42, 1, 2, '2026-09-22 00:53:21', 0, NULL, NULL),
(4, 'AI & Machine Learning', 'Advanced research discussion and paper reading group for senior students.', '/assets/images/groups/ml.png', 'cs', 215, 0, 3, '2026-09-22 00:53:21', 0, NULL, NULL),
(5, 'Algorithms Course Group', 'Collaborative study group for CSE301. Weekly problem solving and resource sharing.', '/assets/images/groups/dsa.png', 'cs', 128, 0, 2, '2026-09-22 00:53:21', 0, NULL, NULL),
(6, 'DBMS Lab', '', 'uploads/groups/groups_6ab1d316c2565.jpg', 'cs', 1, 0, 9, '2026-09-22 01:00:06', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role` enum('member','admin','requested') DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `group_members`
--

INSERT INTO `group_members` (`id`, `group_id`, `user_id`, `role`, `joined_at`) VALUES
(3, 1, 2, 'member', '2026-09-22 00:53:21'),
(4, 1, 3, 'member', '2026-09-22 00:53:21'),
(5, 3, 2, 'admin', '2026-09-22 00:53:21'),
(6, 1, 9, 'requested', '2026-09-22 00:59:27'),
(7, 6, 9, 'admin', '2026-09-22 01:00:06'),
(10, 4, 9, 'requested', '2026-09-22 03:27:01'),
(11, 2, 9, 'requested', '2026-09-22 03:29:12');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text DEFAULT NULL,
  `message_type` enum('text','image','file') NOT NULL DEFAULT 'text',
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `file_path` varchar(500) DEFAULT NULL,
  `file_mime` varchar(150) DEFAULT NULL,
  `reply_to` int(11) DEFAULT NULL,
  `edited_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `sender_id`, `receiver_id`, `content`, `message_type`, `file_name`, `file_size`, `is_read`, `created_at`, `file_path`, `file_mime`, `reply_to`, `edited_at`) VALUES
(5, 9, 2, 'Hi', 'text', NULL, NULL, 0, '2026-09-22 05:34:16', NULL, NULL, NULL, NULL),
(6, 9, 3, 'sdf', 'text', NULL, NULL, 0, '2026-09-22 05:41:51', NULL, NULL, NULL, NULL),
(295, 8, 2, 'hi', 'text', NULL, NULL, 1, '2026-09-28 22:10:20', NULL, NULL, NULL, NULL),
(296, 8, 2, NULL, 'image', 'uiusocial_erd.png', '1.1 MB', 1, '2026-09-28 22:10:32', 'uploads/chat/462bab72082c27c19ce1bf2105a6a6af.png', 'image/png', NULL, NULL),
(297, 8, 2, NULL, 'file', 'dbms_1st_Lab_Report.pdf', '177.3 KB', 1, '2026-09-28 22:10:59', 'uploads/chat/ca44813d62077bf36977d5bb321e0999.pdf', 'application/pdf', NULL, NULL),
(298, 8, 2, NULL, 'image', 'uiusocial_relational_schema_horizontal.png', '2.8 MB', 1, '2026-09-29 00:46:53', 'uploads/chat/e3b5e3ae869d07f2f00416f19a641672.png', 'image/png', NULL, NULL),
(301, 8, 2, NULL, 'image', 'Red_Dead_Redemption_26.jpg', '1.9 MB', 1, '2026-09-29 01:16:25', 'uploads/chat/f4c001168f8a471704061bdc4bd59b2a.jpg', 'image/jpeg', NULL, NULL),
(302, 8, 2, NULL, 'image', 'IMG_20260927_175954.jpg', '2.6 MB', 1, '2026-09-29 02:18:31', 'uploads/chat/b896f79562bf3df0255e4c6161b881b4.jpg', 'image/jpeg', NULL, NULL),
(303, 8, 3, 'hi', 'text', NULL, NULL, 1, '2026-09-29 02:18:37', NULL, NULL, NULL, NULL),
(304, 8, 5, 'hi', 'text', NULL, NULL, 1, '2026-09-29 02:19:30', NULL, NULL, NULL, NULL),
(305, 8, 5, 'hlw', 'text', NULL, NULL, 1, '2026-09-29 02:19:34', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `message_reads`
--

CREATE TABLE `message_reads` (
  `id` int(11) NOT NULL,
  `message_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `read_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `moderation_queue`
--

CREATE TABLE `moderation_queue` (
  `id` int(11) NOT NULL,
  `content_type` varchar(50) NOT NULL,
  `content_text` text DEFAULT NULL,
  `report_category` varchar(50) NOT NULL,
  `reported_by` varchar(100) DEFAULT NULL,
  `target` varchar(100) DEFAULT NULL,
  `status` enum('pending','dismissed','deleted') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `moderation_queue`
--

INSERT INTO `moderation_queue` (`id`, `content_type`, `content_text`, `report_category`, `reported_by`, `target`, `status`, `created_at`) VALUES
(1, 'post', 'Check out this link for cheap textbooks, 100% legit and approved by the board...', 'SPAM / ADVERTISING', 'S. Ahmed', NULL, 'pending', '2026-09-22 00:51:21'),
(2, 'comment', 'Targeted comments on a club event post.', 'HARASSMENT', NULL, 'Robotics Club', 'pending', '2026-09-22 00:38:21'),
(3, 'post', 'Sharing of unreleased department research papers without proper faculty authorization.', 'COPYRIGHT', NULL, 'CSE Dept', 'pending', '2026-09-21 23:53:21');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `body` text DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `actor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `body`, `link`, `is_read`, `created_at`, `actor_id`) VALUES
(3, 8, 'join_request', 'New joining request', 'testuser requested to join as student.', 'admin.html', 1, '2026-09-22 00:58:14', NULL),
(4, 8, 'join', 'Joining request accepted', 'Welcome to UIU Social. Your account is now active.', 'index.html', 1, '2026-09-22 00:58:51', NULL),
(5, 9, 'join', 'Joining request accepted', 'Welcome to UIU Social. Your account is now active.', 'index.html', 1, '2026-09-22 00:58:55', NULL),
(8, 8, 'group_join', 'Group join request', 'testuser requested to join CSE Batch 243 Official.', 'group_detail.html?id=1', 1, '2026-09-22 00:59:27', NULL),
(10, 8, 'join_request', 'New joining request', 'testuser2 requested to join as student.', 'admin.html', 1, '2026-09-22 01:05:13', NULL),
(11, 8, 'join_request', 'New joining request', 'Sahid Hossain Mustakim requested to join as faculty.', 'admin.html', 1, '2026-09-22 01:33:09', NULL),
(12, 11, 'join', 'Joining request accepted', 'Welcome to UIU Social. Your account is now active.', 'index.html', 1, '2026-09-22 01:33:29', NULL),
(13, 10, 'join', 'Joining request declined', 'Your joining request was not approved.', 'login.html', 0, '2026-09-22 01:33:33', NULL),
(14, 8, 'report', 'New post report', 'A post was reported for Copyright Infringement.', 'admin.html', 1, '2026-09-22 01:34:45', NULL),
(15, 3, 'connection', 'New connection request', 'Someone wants to connect with you.', 'index.html', 0, '2026-09-22 01:36:04', NULL),
(16, 9, 'connection', 'New connection request', 'Someone wants to connect with you.', 'index.html', 1, '2026-09-22 01:36:08', NULL),
(17, 8, 'connection', 'Connection accepted', 'Your connection request was accepted.', 'profile.html?id=9', 1, '2026-09-22 01:36:41', NULL),
(18, 2, 'group_join', 'Group join request', 'testuser requested to join DBMS Section B.', 'group_detail.html?id=3', 0, '2026-09-22 02:41:30', NULL),
(19, 8, 'group_join', 'Group join request', 'testuser requested to join DBMS Section B.', 'group_detail.html?id=3', 1, '2026-09-22 02:41:30', NULL),
(20, 2, 'club_join', 'Club join request', 'testuser requested to join UIU Computer Club.', 'club_detail.html?id=2', 0, '2026-09-22 03:14:33', NULL),
(21, 8, 'club_join', 'Club join request', 'testuser requested to join UIU Computer Club.', 'club_detail.html?id=2', 1, '2026-09-22 03:14:33', NULL),
(22, 4, 'group_join', 'Group join request', 'testuser requested to join Robotics Club Core.', 'group_detail.html?id=2', 0, '2026-09-22 03:15:22', NULL),
(23, 8, 'group_join', 'Group join request', 'testuser requested to join Robotics Club Core.', 'group_detail.html?id=2', 1, '2026-09-22 03:15:22', NULL),
(24, 3, 'group_join', 'Group join request', 'testuser requested to join AI & Machine Learning.', 'group_detail.html?id=4', 0, '2026-09-22 03:27:01', NULL),
(25, 8, 'group_join', 'Group join request', 'testuser requested to join AI & Machine Learning.', 'group_detail.html?id=4', 1, '2026-09-22 03:27:01', NULL),
(26, 4, 'group_join', 'Group join request', 'testuser requested to join Robotics Club Core.', 'group_detail.html?id=2', 0, '2026-09-22 03:29:12', NULL),
(27, 8, 'group_join', 'Group join request', 'testuser requested to join Robotics Club Core.', 'group_detail.html?id=2', 1, '2026-09-22 03:29:12', NULL),
(28, 8, 'post_edit', 'Post updated', 'Your post was edited.', 'index.html', 1, '2026-09-22 04:53:53', NULL),
(29, 8, 'post_edit', 'Post updated', 'Your post was edited.', 'index.html', 1, '2026-09-22 04:53:57', NULL),
(30, 2, 'connection', 'New connection request', 'Someone wants to connect with you.', 'index.html', 0, '2026-09-22 04:59:10', NULL),
(31, 4, 'connection', 'New connection request', 'Someone wants to connect with you.', 'index.html', 0, '2026-09-22 05:00:24', NULL),
(33, 11, 'connection', 'New connection request', 'Someone wants to connect with you.', 'index.html', 1, '2026-09-22 05:00:26', NULL),
(34, 5, 'connection', 'New connection request', 'Someone wants to connect with you.', 'index.html', 0, '2026-09-22 05:00:27', NULL),
(35, 2, 'club_join', 'Club join request', 'testuser requested to join UIU Computer Club.', 'club_detail.html?id=2', 0, '2026-09-22 05:37:15', NULL),
(36, 8, 'club_join', 'Club join request', 'testuser requested to join UIU Computer Club.', 'club_detail.html?id=2', 1, '2026-09-22 05:37:15', NULL),
(52, 9, 'like_post', 'New like', 'Kawsar Ahmed liked your post \"Hi, everyone\".', 'index.html#post-15', 1, '2026-09-28 19:39:18', 8),
(53, 9, 'comment_post', 'New comment', 'Kawsar Ahmed commented on your post \"hi\".', 'index.html#post-15', 1, '2026-09-28 19:39:22', 8),
(54, 8, 'like_post', 'New like', 'testuser liked your post \"Looking for team members for the upcoming Hackathon! Need someone with good knowledge of T…\".', 'index.html#post-4', 1, '2026-09-28 19:40:34', 9),
(55, 8, 'like_post', 'New like', 'testuser liked your post \"Hi friends\".', 'index.html#post-19', 1, '2026-09-28 19:40:37', 9),
(56, 8, 'comment_post', 'New comment', 'testuser commented on your post \"hlw\".', 'index.html#post-4', 1, '2026-09-28 19:40:44', 9),
(64, 10, 'join_rejected', 'Account suspended', 'Your account was suspended by an administrator. Reason: For spamming', 'login.html', 0, '2026-09-28 21:13:33', NULL),
(65, 2, 'new_club_post', 'New club post', 'Kawsar Ahmed posted in UIU Computer Club \"ADMIN DELETE SMOKE TEST club post\".', 'club_detail.html?id=2', 0, '2026-09-28 21:30:11', 8),
(66, 2, 'new_announcement', 'New announcement', 'Kawsar Ahmed posted an announcement in UIU Computer Club.', 'club_detail.html?id=2', 0, '2026-09-28 21:30:11', 8),
(67, 5, 'new_club_post', 'New club post', 'Kawsar Ahmed posted in Cultural Club \"SMOKE club parent\".', 'club_detail.html?id=3', 0, '2026-09-28 21:30:25', 8),
(68, 5, 'new_announcement', 'New announcement', 'Kawsar Ahmed posted an announcement in Cultural Club.', 'club_detail.html?id=3', 0, '2026-09-28 21:30:25', 8),
(69, 5, 'new_club_post', 'New club post', 'Kawsar Ahmed posted in Cultural Club \"SMOKE club parent\".', 'club_detail.html?id=3', 0, '2026-09-28 21:31:13', 8),
(70, 5, 'new_announcement', 'New announcement', 'Kawsar Ahmed posted an announcement in Cultural Club.', 'club_detail.html?id=3', 0, '2026-09-28 21:31:13', 8),
(72, 3, 'join_rejected', 'Account suspended', 'Your account was suspended by an administrator. Reason: log name check', 'login.html', 0, '2026-09-28 21:33:28', NULL),
(73, 3, 'join_approved', 'Account restored', 'Your account suspension was lifted by an administrator.', 'index.html', 0, '2026-09-28 21:33:28', NULL),
(75, 3, 'new_club_post', 'New club post', 'Kawsar Ahmed posted in App Forum \"SMOKE3 club post\".', 'club_detail.html?id=1', 0, '2026-09-28 21:37:11', 8),
(76, 3, 'new_announcement', 'New announcement', 'Kawsar Ahmed posted an announcement in App Forum.', 'club_detail.html?id=1', 0, '2026-09-28 21:37:11', 8),
(77, 3, 'new_club_post', 'New club post', 'Kawsar Ahmed posted in App Forum \"SMOKE4 club post\".', 'club_detail.html?id=1', 0, '2026-09-28 21:37:35', 8),
(78, 3, 'new_announcement', 'New announcement', 'Kawsar Ahmed posted an announcement in App Forum.', 'club_detail.html?id=1', 0, '2026-09-28 21:37:35', 8),
(79, 9, 'post_deleted', 'Content removed by an administrator', 'An administrator removed your post.', 'index.html', 0, '2026-09-28 21:48:06', 8),
(156, 2, 'message', 'New message', 'Kawsar Ahmed sent you a message \"hi\".', 'messages.html?user=8', 0, '2026-09-28 22:10:20', 8),
(157, 2, 'message', 'New message', 'Kawsar Ahmed sent you a message \"Sent an attachment: uiusocial_erd.png\".', 'messages.html?user=8', 0, '2026-09-28 22:10:32', 8),
(158, 2, 'message', 'New message', 'Kawsar Ahmed sent you a message \"Sent an attachment: dbms_1st_Lab_Report.pdf\".', 'messages.html?user=8', 0, '2026-09-28 22:10:59', 8),
(159, 2, 'message', 'New message', 'Kawsar Ahmed sent you a message \"Sent an attachment: uiusocial_relational_schema_horizontal.png\".', 'messages.html?user=8', 0, '2026-09-29 00:46:53', 8),
(160, 8, 'message', 'New message', 'Avijit Saha sent you a message \"ORIGINAL for reply test\".', 'messages.html?user=2', 1, '2026-09-29 01:14:09', 2),
(161, 8, 'message', 'New message', 'Avijit Saha sent you a message \"REPLY with quote\".', 'messages.html?user=2', 1, '2026-09-29 01:14:09', 2),
(162, 2, 'message', 'New message', 'Kawsar Ahmed sent you a message \"Sent an attachment: Red_Dead_Redemption_26.jpg\".', 'messages.html?user=8', 0, '2026-09-29 01:16:25', 8),
(163, 2, 'message', 'New message', 'Kawsar Ahmed sent you a message \"Sent an attachment: IMG_20260927_175954.jpg\".', 'messages.html?user=8', 0, '2026-09-29 02:18:31', 8),
(164, 3, 'message', 'New message', 'Kawsar Ahmed sent you a message \"hi\".', 'messages.html?user=8', 0, '2026-09-29 02:18:37', 8),
(165, 5, 'message', 'New message', 'Kawsar Ahmed sent you a message \"hi\".', 'messages.html?user=8', 0, '2026-09-29 02:19:30', 8),
(166, 5, 'message', 'New message', 'Kawsar Ahmed sent you a message \"hlw\".', 'messages.html?user=8', 0, '2026-09-29 02:19:34', 8);

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `podcasts`
--

CREATE TABLE `podcasts` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `provider` enum('youtube','spotify','soundcloud') NOT NULL DEFAULT 'youtube',
  `provider_id` varchar(150) NOT NULL,
  `kind` enum('video','audio') NOT NULL DEFAULT 'video',
  `category` varchar(60) NOT NULL DEFAULT 'General',
  `duration` varchar(20) DEFAULT NULL,
  `source_name` varchar(120) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `podcasts`
--

INSERT INTO `podcasts` (`id`, `title`, `description`, `provider`, `provider_id`, `kind`, `category`, `duration`, `source_name`, `created_by`, `created_at`) VALUES
(26, 'TED Talks Daily - Ideas Worth Spreading', 'Short talks from researchers, innovators, and educators on ideas that change how we learn and live.', 'youtube', 'REPLACE_ID_1', 'video', 'Society & Culture', '15m', 'TED', 8, '2026-09-29 02:10:27'),
(27, 'BBC 6 Minute English - Improve Your English', 'Short episodes on current topics to build vocabulary and listening skills for students.', 'youtube', 'REPLACE_ID_2', 'video', 'Society & Culture', '6m', 'BBC Learning English', 8, '2026-09-29 02:10:27'),
(28, 'Freakonomics Radio - The Hidden Side of Everything', 'Explores economics, human behavior, and everyday decisions through research and storytelling.', 'youtube', 'REPLACE_ID_3', 'video', 'Business & Productivity', '45m', 'Freakonomics Radio', 8, '2026-09-29 02:10:27'),
(29, 'Hidden Brain - The Science of Human Behavior', 'Psychology and neuroscience stories about the unconscious patterns that shape our choices.', 'youtube', 'REPLACE_ID_4', 'video', 'Health & Science', '50m', 'Hidden Brain', 8, '2026-09-29 02:10:27'),
(30, 'HBR IdeaCast - Leadership and Career Insights', 'Management, leadership, and career advice from Harvard Business Review authors.', 'youtube', 'REPLACE_ID_5', 'video', 'Business & Productivity', '30m', 'Harvard Business Review', 8, '2026-09-29 02:10:27'),
(31, 'AI Explained - Machine Learning for Beginners', 'A beginner-friendly look at AI and machine learning concepts for CS and IT students.', 'youtube', 'REPLACE_ID_6', 'video', 'Technology & AI', '25m', 'AI Explained', 8, '2026-09-29 02:10:27'),
(32, 'Syntax - Tasty Web Development Treats', 'A full-stack web development podcast hosted by Wes Bos and Scott Tolinski.', 'youtube', 'REPLACE_ID_7', 'video', 'Web Development', '48m', 'SyntaxFM', 8, '2026-09-29 02:10:27'),
(38, 'Why AI Will Never Replace a Great Teacher - Matt Wu', 'A TED talk on how peer tutoring builds human connection in education, and why teachers still matter in the age of AI.', 'youtube', 'xHr18GEJqck', 'video', 'Society & Culture', '15m', 'TED', 8, '2026-09-29 02:13:24'),
(39, '6 Minute English - What Makes a Great Library?', 'A short BBC discussion with new vocabulary, useful for improving English listening and speaking skills.', 'youtube', 'tD-6xHAHrQ4', 'video', 'Society & Culture', '6m', 'BBC Learning English', 8, '2026-09-29 02:13:24'),
(40, 'Hidden Brain - Shankar Vedantam on the Unconscious Mind', 'Explores the unconscious patterns that drive human behavior, with psychology and neuroscience research.', 'youtube', 'LaNlBRYwS10', 'video', 'Health & Science', '50m', 'Hidden Brain', 8, '2026-09-29 02:13:24'),
(41, 'HBR IdeaCast - Mastering the Art of Persuasion', 'Practical advice on communication, persuasion, and leadership from Harvard Business Review.', 'youtube', '5m4hzh5jFMw', 'video', 'Business & Productivity', '25m', 'Harvard Business Review', 8, '2026-09-29 02:13:24'),
(42, 'Syntax.fm Live! with Wes Bos and Scott Tolinski', 'A live recording of the Syntax web development podcast at Reactathon.', 'youtube', '8xJpxj6T1BQ', 'video', 'Web Development', '1h', 'Syntax', 8, '2026-09-29 02:13:24'),
(43, 'UIU Exam Conflict Tracker | Pre Advising Made Easy', 'Struggling to find courses that do not clash during pre advising? I built the UIU Exam Conflict Tracker to help you plan your semester without the headache.', 'youtube', '4iYUDeuZRJU', 'video', 'Conputer Science', '11m 20s', NULL, 8, '2026-09-29 02:25:21');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `edited_at` timestamp NULL DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `shares_count` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `group_id`, `content`, `image`, `created_at`, `edited_at`, `views_count`, `shares_count`) VALUES
(1, 11, NULL, 'The registration for the upcoming Departmental Cybersecurity & Network Security Seminar is now officially open for all final-year students. Please ensure you secure your spot through the portal before Friday.', '/assets/images/post-img/cyber-security.png', '2026-09-21 22:53:21', NULL, 0, 0),
(3, 2, NULL, 'Reminder for CSE 3rd year students: The deadline for submitting your Database Management Systems lab report has been extended to Sunday night.', NULL, '2026-09-28 16:36:16', NULL, 0, 0),
(4, 8, NULL, 'Looking for team members for the upcoming Hackathon! Need someone with good knowledge of Tailwind CSS and ReactJS. DM me if interested.', '/assets/images/post-img/hackathon.png', '2026-09-21 18:53:21', '2026-09-22 04:53:57', 0, 0),
(5, 4, NULL, 'Anyone in the EEE lab right now? Left my digital multimeter near workbench 4, please let me know if anyone spotted it.', NULL, '2026-09-21 16:53:21', NULL, 0, 0),
(6, 5, NULL, 'The annual BBA Business Case Competition registration is closing tomorrow. Make sure your teams submit the executive summary on time!', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80', '2026-09-21 12:53:21', NULL, 0, 0),
(7, 11, NULL, 'Office hours for this week have been rescheduled to Thursday from 2:00 PM to 4:00 PM. Drop by if you need assistance with your capstone project proposals.', NULL, '2026-09-21 00:53:21', NULL, 0, 0),
(8, 2, NULL, 'Great energy at today\'s Web Architecture workshop! Remember to review the REST API design guidelines before next week\'s practical session.', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80', '2026-09-21 00:53:21', NULL, 0, 0),
(9, 3, NULL, 'Late-night coding setup for the weekend hackathon prep. React and Tailwind form a fantastic combination for building UI fast!', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80', '2026-09-20 00:53:21', NULL, 0, 0),
(10, 4, NULL, 'Finally completed the IoT sensor node assembly in the robotics lab. Temperature and humidity readings are streaming smoothly to MQTT.', 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80', '2026-09-20 00:53:21', NULL, 0, 0),
(16, 9, 6, 'Hi', NULL, '2026-09-22 04:51:42', NULL, 0, 0),
(19, 8, NULL, 'Hi friends', 'https://gratisography.com/wp-content/uploads/2025/05/gratisography-moon-robot-800x525.jpg', '2026-09-22 06:31:38', NULL, 0, 0),
(28, 8, NULL, 'Our new project - UIU Social\'s ER Diagram', 'uploads/posts/posts_6abab4b91699e.png', '2026-09-28 18:40:57', NULL, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_likes`
--

INSERT INTO `post_likes` (`id`, `post_id`, `user_id`, `created_at`) VALUES
(1, 1, 2, '2026-09-22 00:53:21'),
(2, 1, 3, '2026-09-22 00:53:21'),
(3, 1, 4, '2026-09-22 00:53:21'),
(4, 1, 5, '2026-09-22 00:53:21'),
(12, 4, 2, '2026-09-22 00:53:21'),
(13, 4, 4, '2026-09-22 00:53:21'),
(14, 5, 5, '2026-09-22 00:53:21'),
(15, 5, 3, '2026-09-22 00:53:21'),
(17, 6, 2, '2026-09-22 00:53:21'),
(18, 6, 3, '2026-09-22 00:53:21'),
(19, 6, 4, '2026-09-22 00:53:21'),
(20, 7, 2, '2026-09-22 00:53:21'),
(21, 7, 4, '2026-09-22 00:53:21'),
(23, 8, 3, '2026-09-22 00:53:21'),
(26, 9, 2, '2026-09-22 00:53:21'),
(27, 9, 5, '2026-09-22 00:53:21'),
(29, 10, 3, '2026-09-22 00:53:21'),
(34, 28, 8, '2026-09-28 19:39:09'),
(36, 4, 9, '2026-09-28 19:40:34'),
(37, 19, 9, '2026-09-28 19:40:37'),
(39, 3, 3, '2026-09-28 21:36:16');

-- --------------------------------------------------------

--
-- Table structure for table `post_saves`
--

CREATE TABLE `post_saves` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `reported_by` int(11) NOT NULL,
  `reason` varchar(50) NOT NULL,
  `reason_label` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `status` enum('pending','reviewed','dismissed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `post_id`, `reported_by`, `reason`, `reason_label`, `details`, `status`, `created_at`) VALUES
(1, 5, 11, 'copyright', 'Copyright Infringement', NULL, 'dismissed', '2026-09-22 01:34:45'),
(3, 9, 8, 'copyright', 'Copyright Infringement', NULL, 'pending', '2026-09-28 21:27:57');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `department` varchar(50) NOT NULL DEFAULT 'CSE',
  `role` enum('student','faculty','guest','admin') NOT NULL DEFAULT 'student',
  `avatar` varchar(255) DEFAULT 'assets/images/students/default.png',
  `cover_photo` varchar(255) DEFAULT NULL,
  `about` text DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_seen_at` timestamp NULL DEFAULT NULL,
  `is_banned` tinyint(1) DEFAULT 0,
  `banned_reason` text DEFAULT NULL,
  `banned_until` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `student_id`, `password`, `department`, `role`, `avatar`, `cover_photo`, `about`, `is_online`, `status`, `created_at`, `last_seen_at`, `is_banned`, `banned_reason`, `banned_until`) VALUES
(2, 'Avijit Saha', 'asaha2430535@bscse.uiu.ac.bd', '0112430535', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CSE', 'student', '/assets/images/students/avijit.png', NULL, 'Teaching Web Architecture and Database Management. Focused on practical, project-based learning.', 1, 'approved', '2026-09-22 00:53:21', NULL, 0, NULL, NULL),
(3, 'Mahmudul Hasan Emon', 'semon2430105@bscse.uiu.ac.bd', '0112430105', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CSE', 'student', '/assets/images/students/emon.png', NULL, 'ReactJS and Tailwind CSS enthusiast. Always looking for the next hackathon.', 1, 'approved', '2026-09-22 00:53:21', NULL, 0, NULL, NULL),
(4, 'Molla Nabil Basar', 'mnabil2430xxx@bscee.uiu.ac.bd', '0112430444', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'EEE', 'student', '/assets/images/students/nabil.png', NULL, 'Hardware aficionado. Building IoT devices and robotics projects in my free time.', 0, 'approved', '2026-09-22 00:53:21', NULL, 0, NULL, NULL),
(5, 'Tamim Al Mitul', 'tamim2430xxx@bba.uiu.ac.bd', '0112430555', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BBA', 'student', '/assets/images/students/mitul.png', NULL, 'Business major with a minor in tech. Organizing case competitions and networking events.', 1, 'approved', '2026-09-22 00:53:21', NULL, 0, NULL, NULL),
(7, 'Campus Guest', 'guest@uiu.ac.bd', NULL, '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CSE', 'guest', 'assets/images/general/default.png', NULL, 'Browsing UIU Social as a guest.', 0, 'approved', '2026-09-22 00:53:21', NULL, 0, NULL, NULL),
(8, 'Kawsar Ahmed', 'kawsar@uiu.ac.bd', '0112430083', '$2y$10$F6EqeLQ8odLuxwyvfh3KZerACyHYFQPRWWyI2bWgchwYDUI/2mJca', 'CSE', 'admin', 'uploads/avatars/avatars_6ab1d207e8311.png', NULL, NULL, 0, 'approved', '2026-09-22 00:55:35', NULL, 0, NULL, NULL),
(9, 'testuser', 'testuser@uiu.ac.bd', '0112430087', '$2y$10$hKpxX73CnRf6IFPtXGKey.lTEgc5LSkMRreJYJWkHEFlmwXS.e09m', 'BBA', 'student', 'uploads/avatars/avatars_6ab1d2a672fa4.jpg', NULL, '', 0, 'approved', '2026-09-22 00:58:14', NULL, 0, NULL, NULL),
(10, 'testuser2', 'testuser2@uiu.ac.bd', '0112430088', '$2y$10$CXSNpZhWJX3nR.hjmtY3Y.PaGGiNyvCTSZ/Qi21RjS8Xyf7sI..3S', 'EEE', 'student', 'assets/images/students/default.png', NULL, NULL, 0, 'rejected', '2026-09-22 01:05:13', NULL, 1, 'For spamming', '2026-09-28 17:59:59'),
(11, 'Sahid Hossain Mustakim', 'mustakim@uiu.ac.bd', NULL, '$2y$10$4q82iFFsnvYlD7f.rSymDu9GWfSEcYVE981WQXaKwQpRe6sOUwm8W', 'CSE', 'faculty', 'uploads/avatars/avatars_6ab1dad50a1d9.png', NULL, NULL, 0, 'approved', '2026-09-22 01:33:09', NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user_settings`
--

CREATE TABLE `user_settings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message_privacy` enum('everyone','connections','none') DEFAULT 'everyone',
  `post_privacy` enum('everyone','connections','none') DEFAULT 'everyone',
  `email_notifications` tinyint(1) DEFAULT 1,
  `push_notifications` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `verification_queue`
--

CREATE TABLE `verification_queue` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `requested_role` varchar(50) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `verification_queue`
--

INSERT INTO `verification_queue` (`id`, `user_id`, `requested_role`, `status`, `created_at`) VALUES
(1, 8, 'Student', 'approved', '2026-09-22 00:55:35'),
(2, 9, 'Student', 'approved', '2026-09-22 00:58:14'),
(3, 10, 'Student', 'rejected', '2026-09-22 01:05:13'),
(4, 11, 'Faculty', 'approved', '2026-09-22 01:33:09');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `club_id` (`club_id`);

--
-- Indexes for table `announcement_comments`
--
ALTER TABLE `announcement_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `announcement_id` (`announcement_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `announcement_likes`
--
ALTER TABLE `announcement_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_ann_like` (`announcement_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_block` (`blocker_id`,`blocked_id`),
  ADD KEY `blocked_id` (`blocked_id`);

--
-- Indexes for table `clubs`
--
ALTER TABLE `clubs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `club_activities`
--
ALTER TABLE `club_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `club_id` (`club_id`);

--
-- Indexes for table `club_members`
--
ALTER TABLE `club_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_membership` (`club_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `club_posts`
--
ALTER TABLE `club_posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `club_id` (`club_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `club_post_comments`
--
ALTER TABLE `club_post_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `club_post_likes`
--
ALTER TABLE `club_post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_club_like` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `club_tags`
--
ALTER TABLE `club_tags`
  ADD PRIMARY KEY (`id`),
  ADD KEY `club_id` (`club_id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_comment_like` (`comment_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `connections`
--
ALTER TABLE `connections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_connection` (`user_id`,`connected_user_id`),
  ADD KEY `connected_user_id` (`connected_user_id`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `floor_connections`
--
ALTER TABLE `floor_connections`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_edge` (`from_node_id`,`to_node_id`),
  ADD KEY `idx_from` (`from_node_id`),
  ADD KEY `idx_to` (`to_node_id`);

--
-- Indexes for table `floor_nodes`
--
ALTER TABLE `floor_nodes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_floor_level` (`floor_level`),
  ADD KEY `idx_node_type` (`node_type`);

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_follow` (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Indexes for table `groups_table`
--
ALTER TABLE `groups_table`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_membership` (`group_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `idx_thread` (`sender_id`,`receiver_id`,`id`);

--
-- Indexes for table `message_reads`
--
ALTER TABLE `message_reads`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_read` (`message_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `moderation_queue`
--
ALTER TABLE `moderation_queue`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_user_read` (`user_id`,`is_read`),
  ADD KEY `idx_notif_created` (`created_at`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_token` (`token`);

--
-- Indexes for table `podcasts`
--
ALTER TABLE `podcasts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_podcast_category` (`category`),
  ADD KEY `idx_podcast_kind` (`kind`),
  ADD KEY `podcasts_fk_user` (`created_by`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_like` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `post_saves`
--
ALTER TABLE `post_saves`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_save` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `post_id` (`post_id`),
  ADD KEY `reported_by` (`reported_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_settings` (`user_id`);

--
-- Indexes for table `verification_queue`
--
ALTER TABLE `verification_queue`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=48;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `announcement_comments`
--
ALTER TABLE `announcement_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `announcement_likes`
--
ALTER TABLE `announcement_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `blocked_users`
--
ALTER TABLE `blocked_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `clubs`
--
ALTER TABLE `clubs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `club_activities`
--
ALTER TABLE `club_activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `club_members`
--
ALTER TABLE `club_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `club_posts`
--
ALTER TABLE `club_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `club_post_comments`
--
ALTER TABLE `club_post_comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `club_post_likes`
--
ALTER TABLE `club_post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `club_tags`
--
ALTER TABLE `club_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `comment_likes`
--
ALTER TABLE `comment_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `connections`
--
ALTER TABLE `connections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `floor_connections`
--
ALTER TABLE `floor_connections`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `floor_nodes`
--
ALTER TABLE `floor_nodes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `follows`
--
ALTER TABLE `follows`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `groups_table`
--
ALTER TABLE `groups_table`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=306;

--
-- AUTO_INCREMENT for table `message_reads`
--
ALTER TABLE `message_reads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `moderation_queue`
--
ALTER TABLE `moderation_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=167;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `podcasts`
--
ALTER TABLE `podcasts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT for table `post_saves`
--
ALTER TABLE `post_saves`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `user_settings`
--
ALTER TABLE `user_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `verification_queue`
--
ALTER TABLE `verification_queue`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcement_comments`
--
ALTER TABLE `announcement_comments`
  ADD CONSTRAINT `announcement_comments_ibfk_1` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `announcement_likes`
--
ALTER TABLE `announcement_likes`
  ADD CONSTRAINT `announcement_likes_ibfk_1` FOREIGN KEY (`announcement_id`) REFERENCES `announcements` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `announcement_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD CONSTRAINT `blocked_users_ibfk_1` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blocked_users_ibfk_2` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `clubs`
--
ALTER TABLE `clubs`
  ADD CONSTRAINT `clubs_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `club_activities`
--
ALTER TABLE `club_activities`
  ADD CONSTRAINT `club_activities_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `club_members`
--
ALTER TABLE `club_members`
  ADD CONSTRAINT `club_members_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `club_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `club_posts`
--
ALTER TABLE `club_posts`
  ADD CONSTRAINT `club_posts_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `club_posts_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `club_post_comments`
--
ALTER TABLE `club_post_comments`
  ADD CONSTRAINT `club_post_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `club_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `club_post_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `club_post_likes`
--
ALTER TABLE `club_post_likes`
  ADD CONSTRAINT `club_post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `club_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `club_post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `club_tags`
--
ALTER TABLE `club_tags`
  ADD CONSTRAINT `club_tags_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comment_likes`
--
ALTER TABLE `comment_likes`
  ADD CONSTRAINT `comment_likes_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `connections`
--
ALTER TABLE `connections`
  ADD CONSTRAINT `connections_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `connections_ibfk_2` FOREIGN KEY (`connected_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `groups_table`
--
ALTER TABLE `groups_table`
  ADD CONSTRAINT `groups_table_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `groups_table` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `message_reads`
--
ALTER TABLE `message_reads`
  ADD CONSTRAINT `message_reads_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_reads_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `podcasts`
--
ALTER TABLE `podcasts`
  ADD CONSTRAINT `podcasts_fk_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `post_saves`
--
ALTER TABLE `post_saves`
  ADD CONSTRAINT `post_saves_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_saves_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reported_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `user_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `verification_queue`
--
ALTER TABLE `verification_queue`
  ADD CONSTRAINT `verification_queue_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
