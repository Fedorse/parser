import { z } from 'zod';

export const gitRepoSchema = z
  .string()
  .trim()
  .min(1, 'URL cannot be empty')
  .url({ message: 'Invalid URL format' })
  .startsWith('https://', 'URL must start with https://')
  .refine((url) => {
    try {
      const { pathname } = new URL(url);
      const segments = pathname.split('/').filter(Boolean);
      return segments.length >= 2;
    } catch {
      return false;
    }
  }, 'Incomplete repository path. Example: https://github.com/user/repo')

  .refine(
    (url) => !/\/blob\/|\/tree\/|\/commit\//.test(url),
    'Please provide the root repository URL (remove /tree/, /blob/, etc.)'
  )
  .refine((url) => !/\.(zip|tar|gz|rar|7z)$/i.test(url), 'Cannot clone archive files directly');

export const renameSchema = z
  .string()
  .min(1, 'Name cannot be empty')
  .max(255, 'Name cannot be longer than 255 characters')
  .regex(/^[^\\/:*?"<>|]+$/, 'Invalid characters in filename');
