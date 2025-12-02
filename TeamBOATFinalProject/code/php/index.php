<?php


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

    }
}

header('Location: landing.php');
exit;

