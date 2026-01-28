import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CodeFile, Extension, EditorSettings } from "@/types";

const STORAGE_KEYS = {
  FILES: "@code_editor_files",
  EXTENSIONS: "@code_editor_extensions",
  SETTINGS: "@code_editor_settings",
  CURRENT_FILE: "@code_editor_current_file",
};

const DEFAULT_SETTINGS: EditorSettings = {
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  autoSave: true,
  autoFormat: true,
  theme: "vs-dark",
  geminiApiKey: "",
  huggingfaceApiKey: "",
  aiProvider: "replit",
};

const DEFAULT_EXTENSIONS: Extension[] = [
  {
    id: "pinescript",
    name: "PineScript Language Server",
    description: "Full language support for TradingView PineScript with syntax highlighting, auto-completion, and diagnostics",
    version: "1.0.0",
    author: "Code Editor",
    icon: "trending-up",
    installed: true,
    category: "language",
    features: ["Syntax Highlighting", "Auto-completion", "Error Diagnostics", "Code Formatting"],
  },
  {
    id: "auto-indent",
    name: "Auto Indentation",
    description: "Automatically fix indentation, spacing, and whitespace in your code",
    version: "1.0.0",
    author: "Code Editor",
    icon: "align-left",
    installed: true,
    category: "formatter",
    features: ["Auto Indent", "Trim Whitespace", "Fix Spacing"],
  },
  {
    id: "bracket-pair",
    name: "Bracket Pair Colorizer",
    description: "Colorize matching brackets to improve code readability",
    version: "1.0.0",
    author: "Code Editor",
    icon: "code",
    installed: false,
    category: "utility",
  },
  {
    id: "file-icons",
    name: "File Icons",
    description: "Add beautiful file icons based on file type",
    version: "1.0.0",
    author: "Code Editor",
    icon: "file",
    installed: false,
    category: "theme",
  },
  {
    id: "git-lens",
    name: "Git Integration",
    description: "Git blame annotations and code lens",
    version: "1.0.0",
    author: "Code Editor",
    icon: "git-branch",
    installed: false,
    category: "utility",
  },
  {
    id: "javascript",
    name: "JavaScript Language Server",
    description: "Full JavaScript/TypeScript support with IntelliSense",
    version: "1.0.0",
    author: "Code Editor",
    icon: "terminal",
    installed: false,
    category: "language",
  },
  {
    id: "python",
    name: "Python Language Server",
    description: "Python language support with Pylance",
    version: "1.0.0",
    author: "Code Editor",
    icon: "terminal",
    installed: false,
    category: "language",
  },
];

export async function getFiles(): Promise<CodeFile[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FILES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveFile(file: CodeFile): Promise<void> {
  const files = await getFiles();
  const index = files.findIndex((f) => f.id === file.id);
  if (index >= 0) {
    files[index] = { ...file, updatedAt: Date.now() };
  } else {
    files.push(file);
  }
  await AsyncStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
}

export async function deleteFile(fileId: string): Promise<void> {
  const files = await getFiles();
  const filtered = files.filter((f) => f.id !== fileId);
  await AsyncStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(filtered));
}

export async function getCurrentFile(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.CURRENT_FILE);
}

export async function setCurrentFile(fileId: string | null): Promise<void> {
  if (fileId) {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_FILE, fileId);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_FILE);
  }
}

export async function getExtensions(): Promise<Extension[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EXTENSIONS);
    if (data) {
      return JSON.parse(data);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.EXTENSIONS, JSON.stringify(DEFAULT_EXTENSIONS));
    return DEFAULT_EXTENSIONS;
  } catch {
    return DEFAULT_EXTENSIONS;
  }
}

export async function updateExtension(extension: Extension): Promise<void> {
  const extensions = await getExtensions();
  const index = extensions.findIndex((e) => e.id === extension.id);
  if (index >= 0) {
    extensions[index] = extension;
  }
  await AsyncStorage.setItem(STORAGE_KEYS.EXTENSIONS, JSON.stringify(extensions));
}

export async function getSettings(): Promise<EditorSettings> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: EditorSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function detectLanguage(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    py: "python",
    pine: "pinescript",
    json: "json",
    html: "html",
    css: "css",
    md: "markdown",
    txt: "plaintext",
  };
  return languageMap[ext || ""] || "plaintext";
}
