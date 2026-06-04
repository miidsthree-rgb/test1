import { Platform } from 'react-native';

// Ultra-retro 8-bit / CRT Terminal theme tokens
export const theme = {
  colors: {
    primary: '#39FF14',        // Pure Phosphor Neon Green
    primaryDark: '#059669',    
    secondary: '#00FFFF',      // Retro Cyber Cyan
    accentPink: '#FF007F',     // Neon Pink / Magenta
    background: '#000000',     // Perfect Black Screen
    cardBg: '#050D0A',         // Very dark phosphor green terminal background
    cardBgElevated: '#0D2018', // Active selection background
    text: '#39FF14',           // Phosphor Green Text
    textMuted: '#10B981',      // Dimmed green text
    border: '#39FF14',         // Phosphor Green borders
    borderMuted: '#065F46',    
    success: '#00FFFF',        
    error: '#FF3333',          // Retro Neon Red
    warning: '#FFFF00',        // Retro Yellow
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
