import { createClient } from "./client";
import type { Database } from "./types";

export type Entry = {
  entry_id: number;
  user_id: string;
  mood_id: number;
  entry_text: string;
  entry_date: string;
  entry_time: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  mood?: {
    mood_name: string;
    mood_emoji: string;
    mood_color: string;
  };
  media_files?: MediaFile[];
};

export type MediaFile = {
  media_id: number;
  entry_id: number;
  file_name: string;
  file_type: string;
  media_category: "image" | "audio" | "video";
  file_path?: string; // Optional for backward compatibility
  base64_data: string;
  file_size?: number; // File size in bytes
  uploaded_at: string;
};

export type Mood = {
  mood_id: number;
  mood_name: string;
  mood_emoji: string;
  mood_color: string;
  mood_description: string;
};

// Fetch all moods
export async function getMoods(): Promise<Mood[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("moods")
    .select("*")
    .order("mood_name");

  if (error) throw error;
  return data || [];
}

// Fetch user's entries
export async function getEntries(
  limit?: number,
  offset?: number
): Promise<Entry[]> {
  const supabase = createClient();
  let query = supabase
    .from("entries")
    .select(
      `
      *,
      mood:moods(*),
      media_files(*)
    `
    )
    .eq("is_deleted", false)
    .order("entry_date", { ascending: false })
    .order("entry_time", { ascending: false });

  if (limit) query = query.limit(limit);
  if (offset) query = query.range(offset, offset + (limit || 10) - 1);

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

// Fetch entry by ID
export async function getEntryById(entryId: number): Promise<Entry | null> {
  const supabase = createClient();
  
  // SECURITY: Verify user authentication and ownership
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from("entries")
    .select(
      `
      *,
      mood:moods(*),
      media_files(*)
    `
    )
    .eq("entry_id", entryId)
    .eq("user_id", user.id) // SECURITY: Enforce user ownership (defense in depth)
    .eq("is_deleted", false)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }
  return data;
}

// Create new entry
export async function createEntry(
  entryData: {
    mood_id: number;
    entry_text: string;
    entry_date: string;
    entry_time: string;
    media_files?: Omit<MediaFile, "media_id" | "entry_id" | "uploaded_at" | "file_size">[];
  }
): Promise<Entry> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Create entry
  console.log("Creating entry with data:", {
    user_id: user.id,
    mood_id: entryData.mood_id,
    entry_text_length: entryData.entry_text.length,
    entry_date: entryData.entry_date,
    entry_time: entryData.entry_time,
    has_media_files: !!entryData.media_files,
    media_files_count: entryData.media_files?.length || 0
  });
  
  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      user_id: user.id,
      mood_id: entryData.mood_id,
      entry_text: entryData.entry_text,
      entry_date: entryData.entry_date,
      entry_time: entryData.entry_time,
    })
    .select()
    .single();

  if (entryError) {
    console.error("Error creating entry:", entryError);
    throw entryError;
  }
  
  console.log("Entry created successfully with ID:", entry.entry_id);

  // Insert media files if provided
  if (entryData.media_files && entryData.media_files.length > 0) {
    console.log(`Inserting ${entryData.media_files.length} media files for entry ${entry.entry_id}`);
    
    const mediaData = entryData.media_files.map((media) => {
      // Ensure base64_data is a string and not empty
      if (!media.base64_data || typeof media.base64_data !== "string") {
        throw new Error(`Invalid base64 data for file: ${media.file_name}`);
      }
      
      // Calculate file size from base64 data
      // Base64 encoding increases size by ~33%, so original size ≈ base64_length * 3/4
      const base64Length = media.base64_data.length;
      const padding = (media.base64_data.match(/=/g) || []).length;
      // Ensure file_size is always a positive number
      const fileSize = Math.max(1, Math.floor((base64Length * 3) / 4) - padding);
      
      // Build media object with required fields
      // Note: file_size is required by database, so always include it
      // SECURITY: Sanitize file name to prevent path traversal
      const sanitizedFileName = media.file_name
        .split('/')
        .pop()
        ?.replace(/[^a-zA-Z0-9._-]/g, '_')
        .substring(0, 255) || 'file';
      
      return {
        entry_id: entry.entry_id,
        file_name: sanitizedFileName,
        file_type: media.file_type,
        media_category: media.media_category,
        base64_data: media.base64_data,
        file_size: fileSize, // Always include file_size (required by database)
      };
    });

    console.log("Media data prepared:", mediaData.map(m => ({ 
      file_name: m.file_name, 
      category: m.media_category, 
      data_length: m.base64_data.length 
    })));

    const { data: insertedMedia, error: mediaError } = await supabase
      .from("media_files")
      .insert(mediaData)
      .select();

    if (mediaError) {
      console.error("Error inserting media files:", mediaError);
      throw new Error(`Failed to save media files: ${mediaError.message}`);
    }

    console.log(`Successfully inserted ${insertedMedia?.length || 0} media files`);
  }

  // Fetch complete entry with relations
  return getEntryById(entry.entry_id) as Promise<Entry>;
}

// Update entry
export async function updateEntry(
  entryId: number,
  entryData: {
    mood_id?: number;
    entry_text?: string;
    entry_date?: string;
    entry_time?: string;
    media_files?: Omit<MediaFile, "media_id" | "entry_id" | "uploaded_at" | "file_size">[];
  }
): Promise<Entry> {
  const supabase = createClient();
  
  // SECURITY: Verify user authentication and ownership
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // SECURITY: Verify entry ownership before update
  const { data: existingEntry } = await supabase
    .from("entries")
    .select("user_id")
    .eq("entry_id", entryId)
    .eq("user_id", user.id)
    .single();
    
  if (!existingEntry) {
    throw new Error("Unauthorized: Entry not found or does not belong to user");
  }

  // Update entry fields
  const updateData: any = {};
  if (entryData.mood_id !== undefined) updateData.mood_id = entryData.mood_id;
  if (entryData.entry_text !== undefined)
    updateData.entry_text = entryData.entry_text;
  if (entryData.entry_date !== undefined)
    updateData.entry_date = entryData.entry_date;
  if (entryData.entry_time !== undefined)
    updateData.entry_time = entryData.entry_time;

  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase
      .from("entries")
      .update(updateData)
      .eq("entry_id", entryId)
      .eq("user_id", user.id); // SECURITY: Enforce ownership in update

    if (updateError) throw updateError;
  }

  // Handle media files if provided
  if (entryData.media_files) {
    // Delete existing media
    await supabase.from("media_files").delete().eq("entry_id", entryId);

    // Insert new media
    if (entryData.media_files.length > 0) {
      console.log(`Updating ${entryData.media_files.length} media files for entry ${entryId}`);
      
      const mediaData = entryData.media_files.map((media) => {
        // Ensure base64_data is a string and not empty
        if (!media.base64_data || typeof media.base64_data !== "string") {
          throw new Error(`Invalid base64 data for file: ${media.file_name}`);
        }
        
        // Calculate file size from base64 data
        // Base64 encoding increases size by ~33%, so original size ≈ base64_length * 3/4
        const base64Length = media.base64_data.length;
        const padding = (media.base64_data.match(/=/g) || []).length;
        // Ensure file_size is always a positive number
        const fileSize = Math.max(1, Math.floor((base64Length * 3) / 4) - padding);
        
        // Build media object with required fields
        // Note: file_size is required by database, so always include it
        // SECURITY: Sanitize file name to prevent path traversal
        const sanitizedFileName = media.file_name
          .split('/')
          .pop()
          ?.replace(/[^a-zA-Z0-9._-]/g, '_')
          .substring(0, 255) || 'file';
        
        return {
          entry_id: entryId,
          file_name: sanitizedFileName,
          file_type: media.file_type,
          media_category: media.media_category,
          base64_data: media.base64_data,
          file_size: fileSize, // Always include file_size (required by database)
        };
      });

      console.log("Media data prepared:", mediaData.map(m => ({ 
        file_name: m.file_name, 
        category: m.media_category, 
        data_length: m.base64_data.length,
        has_file_size: !!m.file_size
      })));

      console.log("Updating media files with data:", JSON.stringify(mediaData.map(m => ({
        entry_id: m.entry_id,
        file_name: m.file_name,
        file_type: m.file_type,
        media_category: m.media_category,
        base64_length: m.base64_data.length,
        file_size: m.file_size
      })), null, 2));

      const { data: insertedMedia, error: mediaError } = await supabase
        .from("media_files")
        .insert(mediaData)
        .select();

      if (mediaError) {
        console.error("Error inserting media files:", mediaError);
        console.error("Media data that failed:", mediaData);
        throw new Error(`Failed to save media files: ${mediaError.message}`);
      }

      console.log(`Successfully inserted ${insertedMedia?.length || 0} media files`);
    }
  }

  return getEntryById(entryId) as Promise<Entry>;
}

// Delete entry (soft delete)
export async function deleteEntry(entryId: number): Promise<void> {
  const supabase = createClient();
  
  // SECURITY: Verify user authentication and ownership
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // SECURITY: Verify entry ownership before delete
  const { data: existingEntry } = await supabase
    .from("entries")
    .select("user_id")
    .eq("entry_id", entryId)
    .eq("user_id", user.id)
    .single();
    
  if (!existingEntry) {
    throw new Error("Unauthorized: Entry not found or does not belong to user");
  }
  
  const { error } = await supabase
    .from("entries")
    .update({ is_deleted: true })
    .eq("entry_id", entryId)
    .eq("user_id", user.id); // SECURITY: Enforce ownership in delete

  if (error) throw error;
}

// Get entries by date range for calendar
export async function getEntriesByDateRange(
  startDate: string,
  endDate: string
): Promise<Array<{ entry_id: number; entry_date: string; mood?: { mood_color: string }[] }>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("entries")
    .select(
      `
      entry_id,
      entry_date,
      mood:moods(mood_color)
    `
    )
    .gte("entry_date", startDate)
    .lte("entry_date", endDate)
    .eq("is_deleted", false);

  if (error) throw error;
  return (data || []) as Array<{ entry_id: number; entry_date: string; mood?: { mood_color: string }[] }>;
}

