<?php

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/SupabaseClient.php';

if (isAuthenticated()) {
    try {
        $client = new SupabaseClient();
        $client->signOut();
    } catch (Exception $e) {
        
        logout();
    }
} else {
    logout();
}

header('Location: index.php');
exit;

