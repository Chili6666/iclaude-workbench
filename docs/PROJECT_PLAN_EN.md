# iClaude Workbench – Project Plan

## 1. Vision & Objectives

**iClaude Workbench** is a VS Code extension that visualizes local Claude artifacts from the user directory (`~/.claude`).

The goal is a **modern, VS Code-native, read-only live view as a Kanban/swimlane board** for:
- Claude **Tasks** (v1)
- Claude **Plans** (planned, v2)

The extension primarily targets **developers and power users** who use Claude Code intensively and want to overview their tasks directly in the editor.

---

## 2. Scope v1 (Initial Release)

### Included

- **Read-only live view** of **Claude Tasks** from `~/.claude/tasks`
- Presentation as **Kanban Board with Swimlanes**
  - Pending
  - In Progress
  - Completed
- **Opening the underlying JSON file** from VS Code
- **Automatic updates** on file changes (File Watcher)
- Support for:
  - macOS
  - Linux
  - Windows
- Distribution:
  - VS Code Marketplace
  - OpenVSX

---

## 3. Non-Goals (v1)

Explicitly **not part of v1**:

- No creating new tasks
- No deleting tasks
- No modifying tasks (read-only!)
- No drag & drop between swimlanes
- No task dependencies
- No synchronization with remote APIs
- No Claude API or CLI integration
- No plan display (only prepared)

---

## 4. Target Audience

- Open-source contributors
- VS Code extension developers
- Claude Code power users

The documentation and architecture should be **easily extensible** and **contribution-friendly**.

---

## 5. Technical Stack

### Extension Core
- **TypeScript**
- VS Code Extension API

### UI
- **Webview**
- **React**
- CSS (no external UI framework, VS Code Theme Tokens)

### Build & Tooling
- **Vite**
- npm / pnpm / yarn (open, not prescribed)

---

## 6. Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────┐
│   VS Code Extension Host            │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  File Watcher                │  │
│  │  (~/.claude/tasks)           │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│             ▼                       │
│  ┌──────────────────────────────┐  │
│  │  Task Parser                 │  │
│  │  (Defensive JSON Parsing)    │  │
│  └──────────┬───────────────────┘  │
│             │                       │
│             ▼                       │
│  ┌──────────────────────────────┐  │
│  │  Webview API                 │  │
│  └──────────┬───────────────────┘  │
└─────────────┼───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│   Webview (React)                   │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Kanban Board                │  │
│  │  (Swimlanes + Task Cards)    │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 7. Data Sources

### Tasks

According to [Claude Code documentation](https://code.claude.com/docs/en/cli-reference) and [recent research (Jan 2026)](https://medium.com/@richardhightower/claude-code-todos-to-tasks-5a1b0e351a1c):

- **Storage location:**
  - `~/.claude/tasks`
- **Introduced:**
  - Claude Code 2.1+ (approx. January 2026)
- **Structure:**
  - **One JSON file per task**
  - Tasks are **session-scoped**
  - Supports DAG (Directed Acyclic Graph) for dependencies
  - Parallel execution of sub-agents possible
- **Expected status fields:**
  - `pending`
  - `in_progress`
  - `completed`

### Important Assumptions

- ❗ The **JSON schema is not officially documented**
- ❗ The schema may change
- ❗ Fields may be missing or unexpected
- ❗ Tasks are primarily intended for the **active session**
- ❗ The extension only **displays** what Claude Code itself manages

➡️ **Defensive parsing strategy is mandatory**

---

## 8. Defensive Parsing Strategy

- No hard type assumptions
- Optional chaining & fallback values
- Ignore unknown fields
- Tasks without status:
  - Fallback → `pending`
- Malformed JSON files:
  - Do not render
  - Logging in output channel
- Graceful degradation on schema changes

---

## 9. UI / UX Concept

### Basic Layout

- **Horizontal Kanban Board**
- **Vertical Swimlanes (Columns)**:
  - Pending
  - In Progress
  - Completed

### Task Cards

- Compact cards
- Contents:
  - Title
  - Brief description (if available)
  - Metadata (e.g., timestamp)
- Click:
  - Opens JSON file in editor (read-only viewing)

### Design Principles

- VS Code native look & feel
- Use of theme tokens
- No strong colors
- Subtle separators
- High information density
- Clear visual hierarchy

---

## 10. Milestones

### M1 – Project Setup
- Extension skeleton
- Vite + React setup
- Webview integration

### M2 – Task Loading
- Reading from `~/.claude/tasks`
- Defensive JSON parsing
- Initial task list

### M3 – Kanban UI
- Swimlane layout
- Task cards
- Theme token integration

### M4 – Interaction
- Open task file
- Navigation between tasks
- Refresh function

### M5 – Stabilization
- File watcher
- Error handling
- Cross-platform testing

### M6 – Release
- README
- Marketplace assets
- Publishing

---

## 11. Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Unstable task schema | Defensive parsing with fallbacks |
| Large task volumes | Virtualized lists (later) |
| Schema changes | Version detection, graceful degradation |
| VS Code theme inconsistencies | Only use theme tokens |

---

## 12. Future Roadmap

### v2
- Display of **Plans** (`~/.claude/plans`)
- Tabs: Tasks / Plans
- Read-only plan visualization

### v3
- Filtering & search
- Task history & timeline
- Better metadata display

### v4+
- Optional: Task creation (if API available)
- Optional: Status change (with Claude Code CLI integration)
- Claude CLI integration
- Agent runs visualization
- Graphical plan dependencies

---

## 13. Open Assumptions

- Structure of plan files still unknown
- No guarantee for schema stability
- Extension remains **local-first**
- No official API for task manipulation in v1

---

## 14. Project Status

📌 **Status:** In Planning
📌 **Name:** iClaude Workbench
📌 **License:** TBD
📌 **Maintainer:** TBD

---

## Sources

- [CLI reference - Claude Code Docs](https://code.claude.com/docs/en/cli-reference)
- [Claude Code Tasks Feature (Jan 2026)](https://medium.com/@richardhightower/claude-code-todos-to-tasks-5a1b0e351a1c)
- [Shipyard - Claude Code CLI Cheatsheet](https://shipyard.build/blog/claude-code-cheat-sheet/)
- [GitHub - anthropics/claude-code](https://github.com/anthropics/claude-code)
