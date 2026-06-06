import { Platform } from 'react-native';

// Ultra-retro 8-bit / Neon Arcade theme tokens
export const theme = {
  colors: {
    primary: '#00FFFF',        // Electric Neon Cyan
    primaryDark: '#00B3B3',    
    secondary: '#FF007F',      // Hot Neon Pink
    accentPink: '#FF007F',     
    background: '#090714',     // Deep space cabinet navy/black
    cardBg: '#120F24',         // Cabinet dark violet
    cardBgElevated: '#1C1838', 
    text: '#00FFFF',           // Cyan terminal text
    textMuted: '#6F669B',      // Soft lavender/purple
    border: '#FF007F',         // Hot Neon Pink border
    borderMuted: '#292152',    
    success: '#39FF14',        // Bright green for success
    error: '#FF2A2A',          // Vibrant red for error
    warning: '#FFFF00',        // Pacman yellow
    white: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  fonts: {
    retro: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 0,      // Sharp 8-bit corners
    md: 0,
    lg: 0,
    full: 9999,
  },
};
