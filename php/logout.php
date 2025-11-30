<?php
/**
 * Logout Page
 * Handles user logout
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';

if (isAuthenticated()) {
    try {
        $client = new SupabaseClient();
        $client->signOut();
    } catch (Exception $e) {
        // Continue with logout even if API call fails
        logout();
    }
} else {
    logout();
}

header('Location: index.php');
exit;

