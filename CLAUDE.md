# Claude Code Configuration

This document describes the Claude Code setup for the iClaude Workbench project.

## Overview

This project uses Claude Code with custom configurations and commands to streamline development workflow.

## Configuration

The project includes Claude Code settings in the `.claude/` directory:

- **settings.local.json** - Defines permissions for allowed Bash commands and tools
- **commands/** - Custom Claude Code commands for automation

### Allowed Operations

The configuration permits specific operations including:
- Package management (pnpm/npm install, add)
- Build operations (compile, build:webview)
- TypeScript compilation
- Testing
- Linting
- Git operations (push)

## Custom Commands

### `/commit` Command

A workflow automation command for git commits that:
- Analyzes git changes
- Guides branch selection
- Generates conventional commit messages (feat:, fix:)
- Provides commit message confirmation
- Optionally pushes to remote

See `.claude/commands/commit.md` for full details.

## Project Documentation

For detailed project planning and architecture, see:

- **[docs/PROJECT_PLAN_EN.md](docs/PROJECT_PLAN_EN.md)** - Comprehensive project plan including:
  - Vision & objectives
  - Technical architecture
  - Implementation milestones
  - Roadmap (v1-v4)
  - Risk mitigation strategies

## Project Structure

Key file locations:

- **CSS Styles** - All CSS is located in `main.css`

## Development with Claude Code

When working on this project with Claude Code:

1. Claude has pre-approved permissions for common development tasks
2. Use the `/commit` command for streamlined git commits
3. Refer to PROJECT_PLAN_EN.md for architectural decisions and implementation approach
4. Follow the defensive parsing strategy outlined in the project plan

## Quick Links

- [Project Plan](docs/PROJECT_PLAN_EN.md) - Full technical specification
- [README](README.md) - Development setup and usage
- `.claude/settings.local.json` - Claude Code permissions
- `.claude/commands/commit.md` - Commit command specification
