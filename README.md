# iClaude Workbench

AI-native task management workbench for Claude Code.

## Development Setup

### Prerequisites
- Node.js 18+
- pnpm (or npm)
- VS Code

### Installation

```bash
pnpm install
pnpm compile
pnpm build:webview
```

### Running the Extension

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
4. Type "iClaude Workbench: Show Task Board"

### Watch Mode

Run in separate terminals for hot reload:

```bash
pnpm watch          # Watch extension TypeScript
pnpm watch:webview  # Watch webview React files
```

Press `Ctrl+R` (or `Cmd+R`) in the Extension Development Host to reload.

### Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm compile` | Compile TypeScript extension code |
| `pnpm watch` | Watch and compile extension on changes |
| `pnpm build:webview` | Build React webview with Vite |
| `pnpm watch:webview` | Watch and build webview on changes |
| `pnpm lint` | Run ESLint on source files |
| `pnpm package` | Package extension as .vsix file |

## Project Structure

```
iclaude-workbench/
├── src/                  # Extension source code
│   ├── extension.ts      # Extension entry point
│   └── panels/           # Webview panel controllers
├── webview/              # React webview application
│   └── src/              # React components
├── out/                  # Build output (gitignored)
└── docs/                 # Documentation
```
