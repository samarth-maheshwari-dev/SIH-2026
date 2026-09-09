export type AppTheme = 'dark' | 'light' | 'ocean' | 'forest' | 'sunset' | 'lavender';

export interface ThemeConfig {
  id: AppTheme;
  label: string;
  swatch: string;        // Primary bg color for swatch dot
  swatchAccent: string;  // Accent color for second swatch dot
  isDark: boolean;
  emoji: string;
}

export const THEMES: ThemeConfig[] = [
  { id: 'dark',     label: 'Dark',     swatch: '#0f172a', swatchAccent: '#6366f1', isDark: true,  emoji: '🌙' },
  { id: 'light',    label: 'Light',    swatch: '#f8fafc', swatchAccent: '#4f46e5', isDark: false, emoji: '☀️' },
  { id: 'ocean',    label: 'Ocean',    swatch: '#0a1628', swatchAccent: '#0ea5e9', isDark: true,  emoji: '🌊' },
  { id: 'forest',   label: 'Forest',   swatch: '#0d1f14', swatchAccent: '#10b981', isDark: true,  emoji: '🌿' },
  { id: 'sunset',   label: 'Sunset',   swatch: '#1a0f0a', swatchAccent: '#f97316', isDark: true,  emoji: '🌅' },
  { id: 'lavender', label: 'Lavender', swatch: '#f5f3ff', swatchAccent: '#7c3aed', isDark: false, emoji: '💜' },
];
