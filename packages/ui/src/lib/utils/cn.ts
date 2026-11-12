// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
