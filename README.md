# iClaude Workbench

AI-native task management workbench for Claude Code.

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm (or npm)
- VS Code

### Installation

```bash
# Install dependencies
pnpm install

# Compile extension
pnpm compile

# Build webview
pnpm build:webview
```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. In the new window, press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "iClaude Workbench: Show Task Board"
5. The webview panel should open

### Development Workflow

#### Watch Mode

Run these commands in separate terminals for hot reload:

```bash
# Watch extension TypeScript files
pnpm watch

# Watch webview React files
pnpm watch:webview
```

After making changes, press `Ctrl+R` (or `Cmd+R` on Mac) in the Extension Development Host to reload.

### Available Scripts

- `pnpm compile` - Compile TypeScript extension code
- `pnpm watch` - Watch and compile extension on changes
- `pnpm build:webview` - Build React webview with Vite
- `pnpm watch:webview` - Watch and build webview on changes
- `pnpm lint` - Run ESLint on source files
- `pnpm package` - Package extension as .vsix file

## Project Structure

```
iclaude-workbench/
├── .vscode/              # VS Code configuration
│   ├── launch.json       # Debug configuration
│   └── tasks.json        # Build tasks
├── src/                  # Extension source code
│   ├── extension.ts      # Extension entry point
│   └── panels/
│       └── TaskBoardPanel.ts  # Webview panel controller
├── webview/              # React webview application
│   ├── src/
│   │   ├── App.tsx       # Root React component
│   │   └── main.tsx      # React entry point
│   ├── index.html        # Webview HTML template
│   ├── vite.config.ts    # Vite configuration
│   └── tsconfig.json     # Webview TypeScript config
├── out/                  # Build output (gitignored)
│   ├── extension.js      # Compiled extension
│   └── webview/          # Built webview assets
├── package.json          # Extension manifest
└── tsconfig.json         # Extension TypeScript config
```

## Current Status

- ✅ Project structure set up
- ✅ Extension entry point implemented
- ✅ Webview panel controller created
- ✅ React app scaffolded
- ✅ Build system configured
- ✅ Debug configuration ready

## Next Steps

- Implement Kanban board UI (M2)
- Add task management functionality
- Integrate with Claude Code task system