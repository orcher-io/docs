export interface Theme {
  name: string
  value: string
}

export const themes = [
  { name: 'System', value: 'system' }, // Follows the OS setting
  { name: 'Dark', value: 'dark' },
  { name: 'Light', value: 'light' },
]
