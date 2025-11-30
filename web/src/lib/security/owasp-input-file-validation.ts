/**
 * OWASP A03:2021 - Injection & A08:2021 - Data Integrity Failures
 * Input validation and file type validation using magic bytes
 * Implements input validation, sanitization, and security checks
 */

import { z } from 'zod';

// Entry text validation schema
export const entryTextSchema = z.string()
  .min(1, "Entry text cannot be empty")
  .max(50000, "Entry text cannot exceed 50,000 characters")
  .refine(
    (text) => {
      // Check for potential XSS patterns
      const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // Event handlers like onclick=
        /<iframe/i,
        /<object/i,
        /<embed/i,
      ];
      return !dangerousPatterns.some(pattern => pattern.test(text));
    },
    { message: "Entry contains potentially unsafe content" }
  );

// File name sanitization
export function sanitizeFileName(fileName: string): string {
  // Remove path components
  const basename = fileName.split('/').pop() || fileName;
  const nameParts = basename.split('.');
  const extension = nameParts.length > 1 ? '.' + nameParts.pop() : '';
  const name = nameParts.join('.');
  
  // Remove special characters except dots, dashes, underscores
  const sanitized = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length (255 chars total including extension)
  const maxLength = 255;
  const finalName = sanitized.length > maxLength - extension.length
    ? sanitized.substring(0, maxLength - extension.length) + extension
    : sanitized + extension;
  
  return finalName || 'file';
}

// File type validation using magic bytes
export async function validateFileType(
  file: File,
  expectedType: 'image' | 'audio' | 'video'
): Promise<{ valid: boolean; error?: string }> {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // Image signatures
  const imageSignatures: number[][] = [
    [0xFF, 0xD8, 0xFF], // JPEG
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG
    [0x47, 0x49, 0x46, 0x38], // GIF
  ];
  
  // Audio signatures
  const audioSignatures: number[][] = [
    [0xFF, 0xFB], // MP3
    [0xFF, 0xF3], // MP3
    [0xFF, 0xF2], // MP3
    [0x52, 0x49, 0x46, 0x46], // WAV/RIFF
  ];
  
  // Video signatures
  const videoSignatures: number[][] = [
    [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // MP4
    [0x1A, 0x45, 0xDF, 0xA3], // WebM/EBML
  ];
  
  let signatures: number[][];
  switch (expectedType) {
    case 'image':
      signatures = imageSignatures;
      break;
    case 'audio':
      signatures = audioSignatures;
      break;
    case 'video':
      signatures = videoSignatures;
      break;
    default:
      return { valid: false, error: 'Invalid file type category' };
  }
  
  const isValid = signatures.some(sig => 
    sig.every((byte, index) => bytes[index] === byte)
  );
  
  if (!isValid) {
    return { 
      valid: false, 
      error: `File type validation failed. File may be corrupted or not a valid ${expectedType} file.` 
    };
  }
  
  return { valid: true };
}

// Email validation
export const emailSchema = z.string()
  .email("Invalid email address")
  .max(255, "Email address is too long")
  .toLowerCase()
  .trim();

// Entry ID validation
export function validateEntryId(entryId: unknown): number | null {
  if (typeof entryId !== 'string' && typeof entryId !== 'number') {
    return null;
  }
  
  const id = typeof entryId === 'string' ? parseInt(entryId, 10) : entryId;
  
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    return null;
  }
  
  return id;
}

// File size limits
export const FILE_SIZE_LIMITS = {
  MAX_SINGLE_FILE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_FILES: 100 * 1024 * 1024, // 100MB
  MAX_FILE_COUNT: 10,
} as const;

// Input length limits
export const INPUT_LIMITS = {
  MAX_ENTRY_TEXT: 50000, // 50KB
  MAX_NAME_LENGTH: 100,
  MAX_FILE_NAME_LENGTH: 255,
} as const;

