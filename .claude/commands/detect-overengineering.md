---
name: detect-overengineering
description: Detect over-engineered patterns and suggest simplifications
version: 1.1.0
type: command
track_metrics: true
last_updated: 2025-12-11
dependencies:
  - shared/metrics-instructions.md
  - shared/todo-report-format.md
---

# Detect Over-Engineering Command

Run the over-engineering-detector agent to identify and suggest simplifications for:
- Excessive abstractions and indirection
- Premature optimizations
- Unnecessary design patterns
- Configuration overkill
- Feature creep and unused functionality

## Workflow

### Step 1: Configuration Review

Before invoking the agent, verify configuration:

1. Use Read tool to check if `.claude/config.json` exists
2. If config exists, the agent will automatically load `agents.over-engineering-detector.ignoreFolders` settings
3. If no config exists, the agent will analyze all folders by default

### Step 2: Invoke Agent

Use the Task tool to invoke the over-engineering-detector agent:

- **subagent_type**: "over-engineering-detector"
- **description**: "Detecting over-engineering"
- **prompt**: "Analyze the codebase for over-engineered patterns and suggest simplifications."

### Step 3: Review Findings

The agent will provide:
- Specific code locations with over-engineering issues
- Detailed explanation of why patterns are over-engineered
- Concrete simplification recommendations
- Estimated complexity reduction

### Step 4: Present Results

After the agent completes:
1. Summarize the key findings by category
2. Highlight the most critical over-engineering patterns
3. Present simplification recommendations with priority
4. Ask user: "Would you like me to help implement any of these simplifications?"

Wait for user confirmation before making any code changes.


## Report Generation

After the agent completes, generate two reports following the format defined in `.claude/shared/todo-report-format.md`:

**Generate:**
1. `todos/OVER_ENGINEERING_TODO.md` - Actionable checklist
2. `todos/OVER_ENGINEERING_IMPROVEMENTS.md` - Detailed suggestions

**For this command, replace {LANGUAGE} with:** OVER_ENGINEERING

**Include:**
- Categorized findings from the over-engineering-detector agent
- Effort estimates for each simplification task
- Status counts (X/Y completed, Total Effort)
- **REQUIRED METADATA:** Add these header fields to both reports:
  - `**Guideline**: .claude/guidelines/over-engineering-guidelines.md`
  - `**Framework**: Over-Engineering Detection`
  - `**Lint Command**: <actual command used>` (if lint was run, e.g., `pnpm run lint`)
  - `**Build Command**: <actual command used>` (if build was run, e.g., `pnpm run build`)
  - `**Agent**: agents/over-engineering-detector.md`

### Present Summary to User

After generating both reports, provide a clear summary including:
- Total number of over-engineering patterns by category
- Brief overview of the most critical patterns
- The locations of both generated reports

Then ask: "Would you like me to help implement any of these simplifications?"

Wait for user confirmation before proceeding with any refactoring.


## METRICS TRACKING

**This template has `track_metrics: true` in frontmatter.**

You MUST track and display execution metrics at the end of this execution.

See `.claude/shared/metrics-instructions.md` for complete tracking instructions and format.