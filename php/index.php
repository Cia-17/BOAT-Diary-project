<?php
/**
 * Home/Index Page
 * Redirects authenticated users to dashboard, guests to landing
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';

if (isAuthenticated()) {
    try {
        $client = new SupabaseClient();
        $user = $client->getUser();
        if ($user) {
            header('Location: dashboard.php');
            exit;
        }
    } catch (Exception $e) {
        // If error, go to landing
    }
}

header('Location: landing.php');
exit;

