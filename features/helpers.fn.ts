// Derived from https://github.com/supabase/supabase; modified by The Orcher Authors. See NOTICE.
export async function pluckPromise<T, K extends keyof T>(promise: Promise<T>, key: K) {
  const data = await promise
  return data[key]
}
