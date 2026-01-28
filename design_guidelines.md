# Android Code Editor - Design Guidelines

## 1. Brand Identity

**Purpose**: A powerful mobile code editor for developers who need to write and test code on Android, with full VS Code extension support and PineScript development capabilities.

**Aesthetic Direction**: **Brutally Minimal & Developer-First**
- Professional IDE aesthetic optimized for mobile
- Dark-by-default with high contrast for code readability
- Zero decoration, maximum function
- Every pixel serves the developer's workflow

**Memorable Element**: Split-screen code/terminal view with gesture-based toggling - swipe up from bottom to reveal terminal, swipe down to collapse.

## 2. Navigation Architecture

**Root Navigation**: Drawer + Stack (no tab bar)

**Why**: Code editors need a collapsible file tree (drawer) while keeping maximum screen space for code. The drawer houses project files and settings; the main stack shows editor and terminal.

**Screen List**:
1. **Editor Screen** (Home) - Write and edit code
2. **Terminal Screen** (Overlay) - Execute commands via xtermjs
3. **Extensions Manager** - Browse and install VS Code extensions
4. **Extension Detail** - View extension info and settings
5. **Settings** - App preferences and editor configuration
6. **File Browser** (Drawer) - Navigate project files

## 3. Screen-by-Screen Specifications

### Editor Screen
- **Purpose**: Main coding workspace with Monaco Editor
- **Layout**:
  - Header: Transparent, file name (center), more menu (right: save, format, copy all)
  - Main: Monaco Editor (full screen)
  - Floating: Terminal toggle button (bottom-right, 16dp from edge)
- **Safe Area**: Top: headerHeight + 16dp, Bottom: insets.bottom + 16dp (when terminal hidden), Right: 16dp
- **Components**: Monaco webview, floating action button with terminal icon
- **Empty State**: When no file open, show welcome illustration with "Open a file" message

### Terminal Screen (Bottom Sheet Overlay)
- **Purpose**: Execute commands without leaving editor
- **Layout**:
  - Header: Drag handle (top center), "Terminal" title, close button (right)
  - Main: xtermjs webview
  - Height: 40% of screen, expandable to 70% via drag
- **Safe Area**: Bottom: insets.bottom + 16dp
- **Components**: Resizable bottom sheet, xtermjs webview

### File Browser (Drawer)
- **Purpose**: Navigate project structure
- **Layout**:
  - Header: "Files" title, new file/folder buttons (right)
  - Main: Scrollable file tree (nested list)
  - Footer: Settings button (bottom)
- **Components**: Expandable tree view, file/folder icons, context menu (long-press)

### Extensions Manager
- **Purpose**: Discover and manage VS Code extensions
- **Layout**:
  - Header: Default with "Extensions" title, search icon (right)
  - Main: Scrollable list of extension cards
  - Floating: Installed filter toggle (top-right, below header)
- **Safe Area**: Top: 16dp, Bottom: insets.bottom + 16dp
- **Components**: Search bar (in header), extension cards (icon, name, description, install/uninstall button)
- **Empty State**: "No extensions installed" with browse prompt

### Settings
- **Purpose**: Configure editor behavior and app preferences
- **Layout**:
  - Header: Default with "Settings" title, back button (left)
  - Main: Scrollable grouped list
- **Components**: Toggle switches, dropdown selectors, text inputs
- **Sections**: Editor (tab size, auto-save), Theme (dark/light), PineScript (language server settings), Account (local profile)

## 4. Color Palette

**Background Colors**:
- Primary Background: `#1E1E1E` (editor dark)
- Surface: `#2D2D2D` (drawer, cards)
- Elevated Surface: `#3E3E3E` (terminal, modals)

**Accent Colors**:
- Primary: `#4EC9B0` (teal - for success, syntax highlighting)
- Secondary: `#569CD6` (blue - links, info)
- Warning: `#CE9178` (orange)
- Error: `#F44747` (red)

**Text Colors**:
- Primary Text: `#D4D4D4` (main code/text)
- Secondary Text: `#858585` (hints, placeholders)
- Syntax Colors: Use Monaco's default dark theme

**Interactive**:
- Button Background: `#0E639C` (action buttons)
- Button Pressed: `#1177BB`
- Border: `#3E3E3E`

## 5. Typography

**Font**: **JetBrains Mono** (monospace for code) + **Roboto** (UI text)

**Type Scale**:
- Code: JetBrains Mono Regular, 14sp
- Headline: Roboto Medium, 20sp (screen titles)
- Body: Roboto Regular, 16sp (descriptions, settings)
- Caption: Roboto Regular, 14sp (labels, hints)
- Button: Roboto Medium, 16sp

## 6. Visual Design

- **Icons**: Material Icons (file, folder, terminal, extensions, settings)
- **Floating Terminal Button**: 
  - 56dp circle
  - Shadow: offsetY: 2, opacity: 0.10, radius: 2
  - Terminal icon (white)
- **Touchable Feedback**: Ripple effect (Material Design standard)
- **File Tree**: Indentation: 24dp per level, expand/collapse chevron icons

## 7. Assets to Generate

1. **icon.png** - App launcher icon (teal bracket symbol `{ }` on dark background) - Used: Device home screen
2. **splash-icon.png** - Same bracket symbol - Used: App launch screen
3. **empty-files.png** - Minimalist folder with dotted outline - Used: File browser when no project open
4. **empty-editor.png** - Code window with placeholder brackets - Used: Editor screen when no file selected
5. **welcome-pinescript.png** - Pine tree made of code brackets - Used: PineScript extension card header