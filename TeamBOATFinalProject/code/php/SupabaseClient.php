<?php


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
    
    public function signUp($email, $password, $metadata = []) {
        $data = [
            'email' => $email,
            'password' => $password,
            'data' => $metadata
        ];
        
        return $this->request('POST', '/auth/v1/signup', $data);
    }
    

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
    

    public function signOut() {
        if ($this->accessToken) {
            try {
                $this->request('POST', '/auth/v1/logout');
            } catch (Exception $e) {
            }
        }
        
        logout();
    }
    

    public function select($table, $filters = [], $options = []) {
        $endpoint = '/rest/v1/' . $table;
        
        $queryParams = [];
        
        if (isset($options['select'])) {
            $queryParams[] = 'select=' . urlencode($options['select']);
        }
        
        foreach ($filters as $key => $value) {
            $queryParams[] = $key . '=eq.' . urlencode($value);
        }
        
        if (isset($options['order'])) {
            $queryParams[] = 'order=' . urlencode($options['order']);
        }
        
        if (isset($options['limit'])) {
            $queryParams[] = 'limit=' . intval($options['limit']);
        }
        
        if (isset($options['offset'])) {
            $queryParams[] = 'offset=' . intval($options['offset']);
        }
        
        if (!empty($queryParams)) {
            $endpoint .= '?' . implode('&', $queryParams);
        }
        
        return $this->request('GET', $endpoint);
    }
    
    public function insert($table, $data) {
        $endpoint = '/rest/v1/' . $table;
        
        $headers = [
            'Prefer: return=representation'
        ];
        
        return $this->request('POST', $endpoint, $data, $headers);
    }
    
    public function update($table, $data, $filters = []) {
        $endpoint = '/rest/v1/' . $table;
        

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
    

    public function delete($table, $filters = []) {
        $endpoint = '/rest/v1/' . $table;
        

        $queryParams = [];
        foreach ($filters as $key => $value) {
            $queryParams[] = $key . '=eq.' . urlencode($value);
        }
        
        if (!empty($queryParams)) {
            $endpoint .= '?' . implode('&', $queryParams);
        }
        
        return $this->request('DELETE', $endpoint);
    }
    
    public function getMoods() {
        return $this->select('moods', [], [
            'order' => 'mood_name.asc'
        ]);
    }
    

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
    
 
    public function createEntry($userId, $moodId, $entryText, $entryDate, $entryTime, $mediaFiles = []) {
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
    
    public function updateEntry($entryId, $userId, $moodId, $entryText, $entryDate, $entryTime, $mediaFiles = []) {

        $existing = $this->getEntryById($entryId, $userId);
        if (!$existing) {
            throw new Exception("Entry not found or unauthorized");
        }
        

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
        
        $this->delete('media_files', ['entry_id' => $entryId]);
        

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
    

    public function deleteEntry($entryId, $userId) {

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

