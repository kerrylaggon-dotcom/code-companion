import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#D4D4D4",
    textSecondary: "#858585",
    buttonText: "#FFFFFF",
    tabIconDefault: "#858585",
    tabIconSelected: "#4EC9B0",
    link: "#0E639C",
    backgroundRoot: "#1E1E1E",
    backgroundDefault: "#2D2D2D",
    backgroundSecondary: "#3E3E3E",
    backgroundTertiary: "#4E4E4E",
    primary: "#4EC9B0",
    secondary: "#569CD6",
    warning: "#CE9178",
    error: "#F44747",
    border: "#3E3E3E",
    buttonBackground: "#0E639C",
    buttonPressed: "#1177BB",
    success: "#4EC9B0",
  },
  dark: {
    text: "#D4D4D4",
    textSecondary: "#858585",
    buttonText: "#FFFFFF",
    tabIconDefault: "#858585",
    tabIconSelected: "#4EC9B0",
    link: "#0E639C",
    backgroundRoot: "#1E1E1E",
    backgroundDefault: "#2D2D2D",
    backgroundSecondary: "#3E3E3E",
    backgroundTertiary: "#4E4E4E",
    primary: "#4EC9B0",
    secondary: "#569CD6",
    warning: "#CE9178",
    error: "#F44747",
    border: "#3E3E3E",
    buttonBackground: "#0E639C",
    buttonPressed: "#1177BB",
    success: "#4EC9B0",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  full: 9999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "700" as const,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  code: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400" as const,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
