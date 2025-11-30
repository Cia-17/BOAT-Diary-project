-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS media_files CASCADE;
DROP TABLE IF EXISTS entries CASCADE;
DROP TABLE IF EXISTS moods CASCADE;

-- ============================================
-- TABLE 1: MOODS
-- Predefined mood categories for tracking
-- ============================================
CREATE TABLE moods (
    mood_id SERIAL PRIMARY KEY,
    mood_name VARCHAR(50) NOT NULL UNIQUE,
    mood_emoji VARCHAR(10) DEFAULT NULL,
    mood_color VARCHAR(7) DEFAULT NULL,
    mood_description TEXT DEFAULT NULL
);

CREATE INDEX idx_mood_name ON moods(mood_name);

-- ============================================
-- TABLE 2: ENTRIES
-- Stores diary entry records
-- References auth.users for user_id
-- ============================================
CREATE TABLE entries (
    entry_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mood_id INTEGER NOT NULL REFERENCES moods(mood_id) ON DELETE RESTRICT,
    entry_text TEXT NOT NULL,
    entry_date DATE NOT NULL,
    entry_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_entry_date ON entries(entry_date);
CREATE INDEX idx_entries_user_date ON entries(user_id, entry_date);
CREATE INDEX idx_entries_user_deleted ON entries(user_id, is_deleted);
CREATE INDEX idx_entries_mood_id ON entries(mood_id);

-- ============================================
-- TABLE 3: MEDIA_FILES
-- Stores media files as base64 encoded data
-- ============================================
CREATE TABLE media_files (
    media_id SERIAL PRIMARY KEY,
    entry_id INTEGER NOT NULL REFERENCES entries(entry_id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    media_category VARCHAR(10) NOT NULL CHECK (media_category IN ('image', 'audio', 'video')),
    base64_data TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_media_entry_id ON media_files(entry_id);
CREATE INDEX idx_media_category ON media_files(media_category);

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Entries policies: Users can only access their own entries
CREATE POLICY "Users can view their own entries"
    ON entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
    ON entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
    ON entries FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries"
    ON entries FOR DELETE
    USING (auth.uid() = user_id);

-- Media files policies: Users can only access media for their own entries
CREATE POLICY "Users can view media for their own entries"
    ON media_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM entries
            WHERE entries.entry_id = media_files.entry_id
            AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert media for their own entries"
    ON media_files FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM entries
            WHERE entries.entry_id = media_files.entry_id
            AND entries.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete media for their own entries"
    ON media_files FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM entries
            WHERE entries.entry_id = media_files.entry_id
            AND entries.user_id = auth.uid()
        )
    );

-- Moods are public read-only
CREATE POLICY "Anyone can view moods"
    ON moods FOR SELECT
    USING (true);

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert predefined moods
INSERT INTO moods (mood_name, mood_emoji, mood_color, mood_description) VALUES
('Happy', '😊', '#FFD700', 'Feeling joyful and content'),
('Sad', '😢', '#4169E1', 'Feeling down or melancholic'),
('Excited', '🤩', '#FF6347', 'Feeling enthusiastic and energized'),
('Tired', '😴', '#A9A9A9', 'Feeling exhausted or sleepy'),
('Motivated', '💪', '#32CD32', 'Feeling driven and determined'),
('Anxious', '😰', '#9370DB', 'Feeling worried or nervous'),
('Calm', '😌', '#87CEEB', 'Feeling peaceful and relaxed'),
('Angry', '😠', '#DC143C', 'Feeling frustrated or upset'),
('Grateful', '🙏', '#FF69B4', 'Feeling thankful and appreciative'),
('Reflective', '🤔', '#DDA0DD', 'Feeling thoughtful and introspective');