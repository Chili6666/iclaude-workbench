# Webview CSS Loading Guide

This document explains how CSS styles are loaded in the VS Code webview for the iClaude Workbench extension.

## The Problem

When using Vite to build a React webview, CSS imported in your React components (e.g., `import './main.css'`) is **extracted into a separate CSS file** during the build process. This CSS file is **not automatically loaded** by VS Code's webview.

## How It Works

### 1. CSS Import in React

In `webview/src/App.tsx`:
```tsx
import './main.css';
```

### 2. Vite Build Output

Vite builds the webview and outputs:
```
out/webview/
├── assets/
│   ├── index.js    # JavaScript bundle
│   └── index.css   # Extracted CSS (!)
└── index.html
```

### 3. TaskBoardPanel Must Load Both Files

In `src/panels/TaskBoardPanel.ts`, you must explicitly load **both** the JS and CSS files:

```typescript
private _getWebviewContent(
  webview: vscode.Webview,
  extensionUri: vscode.Uri
): string {
  // JavaScript bundle
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'assets', 'index.js')
  );

  // CSS file - MUST BE LOADED EXPLICITLY!
  const styleUri = webview.asWebviewUri(
    vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'assets', 'index.css')
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none';
                 style-src ${webview.cspSource} 'unsafe-inline';
                 script-src ${webview.cspSource};">
  <title>iClaude Workbench</title>
  <link rel="stylesheet" href="${styleUri}">  <!-- CSS LINK HERE -->
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
}
```

## Key Points

| Aspect | Details |
|--------|---------|
| CSS Location | `out/webview/assets/index.css` |
| JS Location | `out/webview/assets/index.js` |
| CSP Requirement | `style-src ${webview.cspSource} 'unsafe-inline'` |
| Load Method | `<link rel="stylesheet" href="${styleUri}">` |

## Common Mistakes

1. **Forgetting to add the `<link>` tag** - CSS won't load even though it's bundled
2. **Wrong CSP** - Missing `style-src` will block the stylesheet
3. **Stale build** - Always rebuild both extension (`tsc`) and webview (`vite build`) after changes

## Build Commands

```bash
# Build everything
npm run build

# Or separately:
node ./node_modules/typescript/bin/tsc -p ./           # Extension
node ./node_modules/vite/bin/vite.js build             # Webview (from webview/ dir)
```

## Troubleshooting

If CSS is not applied:

1. Check that `out/webview/assets/index.css` exists
2. Check that `TaskBoardPanel.ts` has the `styleUri` and `<link>` tag
3. Verify the compiled `out/panels/TaskBoardPanel.js` contains `styleUri` (rebuild if not)
4. Reload VS Code window after rebuilding
