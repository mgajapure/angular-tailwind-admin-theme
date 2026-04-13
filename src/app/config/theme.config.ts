export type ColorScheme = 'indigo' | 'violet' | 'emerald' | 'rose' | 'amber';
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type FontFamily = 'inter' | 'geist' | 'plus-jakarta';
export type ThemeMode = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'default' | 'comfortable';

export interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  borderRadius: BorderRadius;
  fontFamily: FontFamily;
  density: Density;
}

export interface LayoutConfig {
  sidebarStyle: 'default' | 'mini' | 'overlay';
  sidebarPosition: 'left' | 'right';
  topbarStyle: 'fixed' | 'sticky' | 'static';
  contentWidth: 'full' | 'boxed';
  footerVisible: boolean;
}

export interface FeatureFlags {
  commandPalette: boolean;
  aiAssistant: boolean;
  advancedAnalytics: boolean;
  notifications: boolean;
}

export interface BrandingConfig {
  appName: string;
  logoIcon: string;
  primaryColor?: string;
}

export interface AdminConfig {
  theme: ThemeConfig;
  layout: LayoutConfig;
  features: FeatureFlags;
  branding: BrandingConfig;
}

export const defaultConfig: AdminConfig = {
  theme: {
    mode: 'light',
    colorScheme: 'indigo',
    borderRadius: 'md',
    fontFamily: 'inter',
    density: 'default',
  },
  layout: {
    sidebarStyle: 'default',
    sidebarPosition: 'left',
    topbarStyle: 'fixed',
    contentWidth: 'full',
    footerVisible: true,
  },
  features: {
    commandPalette: true,
    aiAssistant: false,
    advancedAnalytics: true,
    notifications: true,
  },
  branding: {
    appName: 'AdminKit',
    logoIcon: 'zap',
  }
};

export const colorSchemes: { value: ColorScheme; label: string; hex: string }[] = [
  { value: 'indigo', label: 'Indigo', hex: '#4f46e5' },
  { value: 'violet', label: 'Violet', hex: '#7c3aed' },
  { value: 'emerald', label: 'Emerald', hex: '#059669' },
  { value: 'rose', label: 'Rose', hex: '#e11d48' },
  { value: 'amber', label: 'Amber', hex: '#d97706' },
];

export const radiusMap: Record<BorderRadius, string> = {
  none: '0rem',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
};
