# Claude Code Configuration

## Project Overview

VS Code extension with React webview for AI-native task management.

## Key Locations

- **Extension code**: `src/`
- **React webview**: `webview/src/`
- **CSS styles**: `webview/src/main.css`
- **Project plan**: `docs/PROJECT_PLAN_EN.md`

## Styling Rules

- **All colors MUST be defined as CSS custom properties** in `webview/src/App/App.module.css` at the `:root` level
- Never use hardcoded color values in component CSS files
- Always use `var(--variable-name)` to reference colors

## Commands

- `/commit` - Guided git commit workflow with conventional commit messages

## Development

```bash
pnpm compile        # Build extension
pnpm build:webview  # Build webview
pnpm watch          # Watch extension
pnpm watch:webview  # Watch webview
```
