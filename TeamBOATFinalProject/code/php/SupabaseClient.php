<?php
/**
 * SupabaseClient.php
 * PHP class for interacting with Supabase REST API
 * Handles authentication, CRUD operations, and file uploads
 */

require_once __DIR__ . '/config.php';

class SupabaseClient {
    private $url;
    private $anonKey;
    private $accessToken;
    
    public function __construct($accessToken = null) {
        $this->url = rtrim(SUPABASE_URL, '/');
        $this->anonKey = SUPABASE_ANON_KEY;
        $this->accessToken = $accessToken ?? getAccessToken();
        
        if (empty($this->url) || empty($this->anonKey)) {
            throw new Exception("Supabase configuration is missing");
        }
    }
    
    /**
     * Make HTTP request to Supabase
     */
    private function request($method, $endpoint, $data = null, $headers = []) {
        $url = $this->url . $endpoint;
        
        $defaultHeaders = [
            'Content-Type: application/json',
            'apikey: ' . $this->anonKey,
            'Authorization: Bearer ' . ($this->accessToken ?? $this->anonKey)
        ];
        
        $headers = array_merge($defaultHeaders, $headers);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($data !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        
        if ($error) {
            throw new Exception("CURL Error: " . $error);
        }
        
        $decoded = json_decode($response, true);
        
        if ($httpCode >= 400) {
            $errorMsg = $decoded['message'] ?? $decoded['error_description'] ?? 'Unknown error';
            throw new Exception($errorMsg, $httpCode);
        }
        
        return $decoded;
    }
    
    /**
     * Authentication: Sign up
     */
    public function signUp($email, $password, $metadata = []) {
        $data = [
            'email' => $email,
            'password' => $password,
            'data' => $metadata
        ];
        
        return $this->request('POST', '/auth/v1/signup', $data);
    }
    
    /**
     * Authentication: Sign in
     */
    public function signIn($email, $password) {
        $data = [
            'email' => $email,
            'password' => $password
        ];
        
        $response = $this->request('POST', '/auth/v1/token?grant_type=password', $data);
        
        if (isset($response['access_token'])) {
            $_SESSION['access_token'] = $response['access_token'];
            $_SESSION['refresh_token'] = $response['refresh_token'] ?? null;
            $_SESSION['user_id'] = $response['user']['id'] ?? null;
            $_SESSION['user_email'] = $response['user']['email'] ?? null;
        }
        
        return $response;
    }
    
    /**
     * Authentication: Get current user
     */
    public function getUser() {
        if (!$this->accessToken) {
            return null;
        }
        
        try {
            $response = $this->request('GET', '/auth/v1/user');
            return $response;
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Authentication: Sign out
     */
    public function signOut() {
        if ($this->accessToken) {
            try {
                $this->request('POST', '/auth/v1/logout');
            } catch (Exception $e) {
                // Ignore errors on logout
            }
        }
        
        logout();
    }
    
    /**
     * Database: Select from table
     */
    public function select($table, $filters = [], $options = []) {
        $endpoint = '/rest/v1/' . $table;
        
        // Build query string
        $queryParams = [];
        
        // Select columns
        if (isset($options['select'])) {
            $queryParams[] = 'select=' . urlencode($options['select']);
        }
        
        // Filters
        foreach ($filters as $key => $value) {
            $queryParams[] = $key . '=eq.' . urlencode($value);
        }
        
        // Order
        if (isset($options['order'])) {
            $queryParams[] = 'order=' . urlencode($options['order']);
        }
        
        // Limit
        if (isset($options['limit'])) {
            $queryParams[] = 'limit=' . intval($options['limit']);
        }
        
        // Offset
        if (isset($options['offset'])) {
            $queryParams[] = 'offset=' . intval($options['offset']);
        }
        
        if (!empty($queryParams)) {
            $endpoint .= '?' . implode('&', $queryParams);
        }
        
        return $this->request('GET', $endpoint);
    }
    
    /**
     * Database: Insert into table
     */
    public function insert($table, $data) {
        $endpoint = '/rest/v1/' . $table;
        
        $headers = [
            'Prefer: return=representation'
        ];
        
        return $this->request('POST', $endpoint, $data, $headers);
    }
    
    /**
     * Database: Update table
     */
    public function update($table, $data, $filters = []) {
        $endpoint = '/rest/v1/' . $table;
        
        // Build query string for filters
        $queryParams = [];
        foreach ($filters as $key => $value) {
            $queryParams[] = $key . '=eq.' . urlencode($value);
        }
        
        if (!empty($queryParams)) {
            $endpoint .= '?' . implode('&', $queryParams);
        }
        
        $headers = [
            'Prefer: return=representation'
        ];
        
        return $this->request('PATCH', $endpoint, $data, $headers);
    }
    
    /**
     * Database: Delete from table
     */
    public function delete($table, $filters = []) {
        $endpoint = '/rest/v1/' . $table;
        
        // Build query string for filters
        $queryParams = [];
        foreach ($filters as $key => $value) {
            $queryParams[] = $key . '=eq.' . urlencode($value);
        }
        
        if (!empty($queryParams)) {
            $endpoint .= '?' . implode('&', $queryParams);
        }
        
        return $this->request('DELETE', $endpoint);
    }
    
    /**
     * Get all moods
     */
    public function getMoods() {
        return $this->select('moods', [], [
            'order' => 'mood_name.asc'
        ]);
    }
    
    /**
     * Get user entries
     */
    public function getEntries($userId, $limit = null, $offset = null) {
        $options = [
            'select' => '*,mood:moods(*),media_files(*)',
            'order' => 'entry_date.desc,entry_time.desc'
        ];
        
        if ($limit) {
            $options['limit'] = $limit;
        }
        if ($offset !== null) {
            $options['offset'] = $offset;
        }
        
        return $this->select('entries', [
            'user_id' => $userId,
            'is_deleted' => 'false'
        ], $options);
    }
    
    /**
     * Get entry by ID
     */
    public function getEntryById($entryId, $userId) {
        $result = $this->select('entries', [
            'entry_id' => $entryId,
            'user_id' => $userId,
            'is_deleted' => 'false'
        ], [
            'select' => '*,mood:moods(*),media_files(*)',
            'limit' => 1
        ]);
        
        return !empty($result) ? $result[0] : null;
    }
    
    /**
     * Create entry
     */
    public function createEntry($userId, $moodId, $entryText, $entryDate, $entryTime, $mediaFiles = []) {
        // Create entry
        $entryData = [
            'user_id' => $userId,
            'mood_id' => intval($moodId),
            'entry_text' => $entryText,
            'entry_date' => $entryDate,
            'entry_time' => $entryTime
        ];
        
        $entryResult = $this->insert('entries', $entryData);
        $entryId = $entryResult[0]['entry_id'] ?? null;
        
        if (!$entryId) {
            throw new Exception("Failed to create entry");
        }
        
        // Add media files if any
        if (!empty($mediaFiles)) {
            foreach ($mediaFiles as $media) {
                // Calculate file size from base64
                $base64Length = strlen($media['base64_data']);
                $padding = substr_count($media['base64_data'], '=');
                $fileSize = max(1, floor(($base64Length * 3) / 4) - $padding);
                
                $mediaData = [
                    'entry_id' => $entryId,
                    'file_name' => $media['file_name'],
                    'file_type' => $media['file_type'],
                    'media_category' => $media['media_category'],
                    'base64_data' => $media['base64_data'],
                    'file_size' => $fileSize
                ];
                
                $this->insert('media_files', $mediaData);
            }
        }
        
        // Return the created entry with relations
        return $this->getEntryById($entryId, $userId);
    }
    
    /**
     * Update entry
     */
    public function updateEntry($entryId, $userId, $moodId, $entryText, $entryDate, $entryTime, $mediaFiles = []) {
        // Verify ownership
        $existing = $this->getEntryById($entryId, $userId);
        if (!$existing) {
            throw new Exception("Entry not found or unauthorized");
        }
        
        // Update entry
        $entryData = [
            'mood_id' => intval($moodId),
            'entry_text' => $entryText,
            'entry_date' => $entryDate,
            'entry_time' => $entryTime
        ];
        
        $this->update('entries', $entryData, [
            'entry_id' => $entryId,
            'user_id' => $userId
        ]);
        
        // Delete existing media files
        $this->delete('media_files', ['entry_id' => $entryId]);
        
        // Add new media files
        if (!empty($mediaFiles)) {
            foreach ($mediaFiles as $media) {
                $base64Length = strlen($media['base64_data']);
                $padding = substr_count($media['base64_data'], '=');
                $fileSize = max(1, floor(($base64Length * 3) / 4) - $padding);
                
                $mediaData = [
                    'entry_id' => $entryId,
                    'file_name' => $media['file_name'],
                    'file_type' => $media['file_type'],
                    'media_category' => $media['media_category'],
                    'base64_data' => $media['base64_data'],
                    'file_size' => $fileSize
                ];
                
                $this->insert('media_files', $mediaData);
            }
        }
        
        return $this->getEntryById($entryId, $userId);
    }
    
    /**
     * Delete entry (soft delete)
     */
    public function deleteEntry($entryId, $userId) {
        // Verify ownership
        $existing = $this->getEntryById($entryId, $userId);
        if (!$existing) {
            throw new Exception("Entry not found or unauthorized");
        }
        
        return $this->update('entries', [
            'is_deleted' => true
        ], [
            'entry_id' => $entryId,
            'user_id' => $userId
        ]);
    }
}

