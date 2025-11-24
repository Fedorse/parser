import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
