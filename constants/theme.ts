/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// Enterprise Agribusiness Color Palette
const primaryGreen = '#1B5E20'; // Dark forest green
const primaryGreenLight = '#2E7D32'; // Lighter forest green for hover
const accentYellow = '#F9A825'; // Soft yellow for highlights
const accentGreen = '#81C784'; // Light green for secondary highlights
const earthBrown = '#6D4C41'; // Soil brown
const textDark = '#1F2937'; // Dark text for light mode
const textLight = '#F3F4F6'; // Light text for dark mode
const borderGray = '#E5E7EB'; // Subtle borders
const successGreen = '#10B981'; // Status green
const warningAmber = '#F59E0B'; // Status amber
const dangerRed = '#EF4444'; // Status red

export const Colors = {
  light: {
    text: textDark,
    background: '#F9FAFB', // Off-white background
    tint: primaryGreen,
    icon: '#6B7280', // Subtle gray icon
    tabIconDefault: '#9CA3AF',
    tabIconSelected: primaryGreen,
    card: '#FFFFFF',
    cardBorder: borderGray,
    success: successGreen,
    warning: warningAmber,
    danger: dangerRed,
    accent: accentYellow,
  },
  dark: {
    text: textLight,
    background: '#111827', // Very dark background
    tint: accentGreen,
    icon: '#D1D5DB',
    tabIconDefault: '#9CA3AF',
    tabIconSelected: accentGreen,
    card: '#1F2937',
    cardBorder: '#374151',
    success: successGreen,
    warning: warningAmber,
    danger: dangerRed,
    accent: accentYellow,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
