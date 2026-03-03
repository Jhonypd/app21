export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'all';

export const FILE_ACCEPT_MAP: Record<FileType, string> = {
   image: 'image/*',
   video: 'video/*',
   audio: 'audio/*',
   pdf: 'application/pdf',
   document:
      'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
   all: '*',
};

const MIME_TO_EXTENSION: Record<string, string> = {
   'image/jpeg': '.jpg',
   'image/png': '.png',
   'image/gif': '.gif',
   'image/webp': '.webp',
   'image/svg+xml': '.svg',
   'video/mp4': '.mp4',
   'video/webm': '.webm',
   'audio/mpeg': '.mp3',
   'audio/ogg': '.ogg',
   'application/pdf': '.pdf',
   'application/msword': '.doc',
   'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '.docx',
};

function acceptsFile(file: File, accept: string): boolean {
   if (!accept || accept === '*') return true;

   const acceptList = accept.split(',').map((a) => a.trim().toLowerCase());
   const mimeType = file.type.toLowerCase();
   const extension =
      MIME_TO_EXTENSION[mimeType] ??
      '.' + file.name.split('.').pop()?.toLowerCase();

   return acceptList.some((pattern) => {
      if (pattern === '*') return true;
      if (pattern.endsWith('/*')) {
         const baseType = pattern.slice(0, -2);
         return mimeType.startsWith(baseType + '/');
      }
      if (pattern.startsWith('.')) {
         return extension === pattern;
      }
      return mimeType === pattern;
   });
}

export interface ValidateFileResult {
   isValid: boolean;
   errors: string[];
}

export function validateFile(
   file: File,
   accept: string,
   maxSizeMB: number,
): ValidateFileResult {
   const errors: string[] = [];

   if (!acceptsFile(file, accept)) {
      errors.push(`Tipo de arquivo não permitido: ${file.type || file.name}`);
   }

   const sizeMB = file.size / (1024 * 1024);
   if (sizeMB > maxSizeMB) {
      errors.push(
         `Arquivo muito grande (${sizeMB.toFixed(1)} MB). O limite é ${maxSizeMB} MB.`,
      );
   }

   return { isValid: errors.length === 0, errors };
}

export function createImagePreviews(files: File[]): string[] {
   return files.map((file) => URL.createObjectURL(file));
}

export function revokeObjectURLs(urls: string[]): void {
   for (const url of urls) {
      if (url) URL.revokeObjectURL(url);
   }
}
