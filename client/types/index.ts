export interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  createdAt: number;
  updatedAt: number;
}

export interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  installed: boolean;
  category: "language" | "theme" | "formatter" | "utility";
  features?: string[];
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  autoFormat: boolean;
  theme: "vs-dark" | "vs-light";
  geminiApiKey?: string;
  huggingfaceApiKey?: string;
  aiProvider: "replit" | "google" | "huggingface";
}

export interface TerminalSession {
  id: string;
  name: string;
  history: string[];
}
