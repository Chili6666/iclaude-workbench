# iClaude Workbench

AI-native task management workbench for Claude Code.

## Installation

### For Team Members (from GitHub Releases)

1. Go to [Releases](https://github.com/Chili6666/iclaude-workbench/releases)
2. Download the `.vsix` file from the latest release
3. Install in VS Code:
   - **Option A (GUI):** Press `Ctrl+Shift+P` → "Extensions: Install from VSIX..." → select the downloaded file
   - **Option B (CLI):** Run `code --install-extension iclaude-workbench-x.x.x.vsix`
4. Reload VS Code

> **Note:** If the `.vsix` file is not attached to the release, you can build it locally:
> 1. Clone the repo
> 2. Run `pnpm install && pnpm compile && pnpm build:webview && pnpm package`
> 3. Install the generated `.vsix` file from the project root

### Updating the Extension

1. Download the new `.vsix` file from [Releases](https://github.com/Chili6666/iclaude-workbench/releases)
2. Install it using the same method as above (it will replace the existing version)
3. Reload VS Code

### Uninstalling the Extension

- **Option A (GUI):** Go to Extensions sidebar (`Ctrl+Shift+X`) → Find "iClaude Workbench" → Click the gear icon → "Uninstall"
- **Option B (CLI):** Run `code --uninstall-extension chili6666.iclaude-workbench`

### For Developers (from source)

See [Development Setup](#development-setup) below.

---

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
