# Code Editor - Mobile IDE for Android

## Overview

A mobile code editor application built with React Native and Expo, designed for developers who need to write and test code on Android devices. The app features a VS Code-inspired dark theme, Monaco editor integration for code editing, an xterm.js-powered terminal, and an AI assistant specifically designed for TradingView PineScript development (similar to Pineify functionality).

The application follows a mobile-first design philosophy with gesture-based navigation, including a drawer for file browsing and a bottom sheet for terminal access. It prioritizes maximum screen real estate for code editing while maintaining quick access to essential features.

## Recent Changes (January 28, 2026)

- Added AI floating button on the editor screen for quick access to PineScript AI
- Added "PineScript AI" navigation button in the file browser drawer
- Added AI menu option in editor menu for easy access
- Completed AI Assistant screen with streaming chat, suggestion chips, and code generation

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React Native with Expo SDK 54
- Uses Expo's managed workflow with custom native modules
- React Navigation for routing (Drawer + Native Stack navigation pattern)
- React Native Reanimated for smooth animations
- Gesture Handler for swipe interactions

**Navigation Pattern**:
- Drawer Navigator: Houses the file browser, accessible via swipe from left edge
- Stack Navigator: Manages screens (Editor, Extensions, Settings, AI Assistant)
- No tab bar - maximizes screen space for code editing

**State Management**:
- TanStack React Query for server state and API calls
- Local component state for UI interactions
- AsyncStorage for persistent client-side data (files, settings, extensions)

**Key UI Components**:
- `MonacoEditor`: WebView-based code editor using Monaco
- `Terminal`: WebView-based terminal using xterm.js
- `BottomSheet`: Gesture-controlled overlay for terminal
- `FileItem`, `ExtensionCard`, `SettingsItem`: Domain-specific list items

### Backend Architecture

**Server**: Express.js (v5) with TypeScript
- Runs on Node.js with ESM modules
- Handles API routes and serves the landing page for web visitors
- CORS configured for Replit domains and localhost development

**API Structure**:
- `GET /api/health` - Health check endpoint
- `POST /api/generate` - AI code generation for PineScript
- `POST /api/explain` - AI explanation endpoint
- Additional chat and image generation routes via Replit integrations

**AI Integration**:
- Google Gemini API via Replit AI Integrations
- PineScript-specific system prompts for code generation
- Supports text generation and image generation models

### Data Storage

**Client-Side Storage** (AsyncStorage):
- Code files with metadata (id, name, content, language, timestamps)
- Extension configurations (installed status, settings)
- Editor settings (font size, tab size, word wrap, etc.)
- Current file selection

**Server-Side Storage** (PostgreSQL via Drizzle ORM):
- User accounts (id, username, password)
- Chat conversations and messages (for AI assistant history)
- Schema defined in `shared/schema.ts`

### Path Aliases

The project uses path aliases for clean imports:
- `@/` → `./client/`
- `@shared/` → `./shared/`

Configured in both `tsconfig.json` and `babel.config.js` for TypeScript and Metro bundler compatibility.

## External Dependencies

### Replit AI Integrations

The app uses Replit's AI Integrations service for Gemini API access:
- Environment variables: `AI_INTEGRATIONS_GEMINI_API_KEY`, `AI_INTEGRATIONS_GEMINI_BASE_URL`
- Supported models: `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-image`
- Pre-built utilities in `server/replit_integrations/` for batch processing, chat, and image generation

### Database

- PostgreSQL database (Drizzle ORM)
- Connection via `DATABASE_URL` environment variable
- Migrations stored in `./migrations/`
- Currently uses in-memory storage fallback (`MemStorage`) when DB unavailable

### External CDN Resources

The Monaco editor and xterm.js are loaded via CDN in WebViews:
- Monaco Editor: jsDelivr CDN
- xterm.js: jsDelivr CDN

### Key NPM Packages

- `expo` - Mobile app framework
- `react-native-webview` - For Monaco and terminal embedding
- `@tanstack/react-query` - Data fetching and caching
- `drizzle-orm` / `drizzle-zod` - Database ORM and validation
- `@google/genai` - Gemini AI SDK
- `react-native-reanimated` - Animations
- `react-native-gesture-handler` - Gesture recognition