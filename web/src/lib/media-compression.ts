/**
 * Media compression utilities for images, audio, and video
 */

/**
 * Compress an image file
 * @param file - Image file to compress
 * @param maxWidth - Maximum width (default: 1920)
 * @param maxHeight - Maximum height (default: 1080)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          file.type || "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
}

/**
 * Compress audio file (simple approach - just return original if too complex)
 * @param file - Audio file to compress
 * @returns Original file (audio compression is complex, skip for now)
 */
export async function compressAudio(
  file: File,
  bitrate: number = 128
): Promise<Blob> {
  // For now, just return the original file
  // Audio compression requires complex processing
  // In production, you might want to use a service or library
  return file;
}

/**
 * Compress video file (simple approach - just return original if too complex)
 * @param file - Video file to compress
 * @returns Original file (video compression is complex, skip for now)
 */
export async function compressVideo(
  file: File,
  maxWidth: number = 1280,
  maxHeight: number = 720,
  quality: number = 0.7
): Promise<Blob> {
  // For now, just return the original file
  // Video compression requires complex processing
  // In production, you might want to use a service or library
  // For large files, you could show a warning
  if (file.size > 10 * 1024 * 1024) {
    console.warn("Large video file detected. Consider compressing before upload.");
  }
  return file;
}

/**
 * Helper function to convert AudioBuffer to WAV
 */
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const length = buffer.length;
  const numberOfChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
  const view = new DataView(arrayBuffer);
  const channels: Float32Array[] = [];

  for (let i = 0; i < numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + length * numberOfChannels * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numberOfChannels * 2, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, length * numberOfChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}

/**
 * Compress media file based on type
 * @param file - File to compress
 * @returns Compressed file as Blob
 */
export async function compressMedia(file: File): Promise<Blob> {
  try {
    if (file.type.startsWith("image/")) {
      // Always compress images
      return await compressImage(file);
    } else if (file.type.startsWith("audio/")) {
      // For audio, only compress if file is large (> 5MB)
      if (file.size > 5 * 1024 * 1024) {
        return await compressAudio(file);
      }
      return file;
    } else if (file.type.startsWith("video/")) {
      // For video, only compress if file is large (> 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return await compressVideo(file);
      }
      return file;
    }
    return file;
  } catch (error) {
    console.error("Compression error, using original file:", error);
    // If compression fails, return original
    return file;
  }
}

