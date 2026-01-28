---
name: explore-codebase
description: Explore and understand codebase structure using the Explore agent
version: 1.1.0
type: command
track_metrics: true
last_updated: 2025-12-05
dependencies:
  - shared/metrics-instructions.md
---

# Explore Codebase Command

Use the Explore agent to understand the codebase structure, locate implementations, and answer questions about how the code works.

## Execution Workflow

### Step 1: Determine Exploration Goal

If the user hasn't specified what to explore, ask: "What would you like me to explore?"

Use this command when you need to understand how features are implemented, locate functionality, map architecture, or answer questions about how the code works.

### Step 2: Determine Thoroughness Level

Based on the complexity and scope of the question, choose the appropriate thoroughness:

**Quick** - Use for simple, focused queries:
- Finding a specific file or function
- Quick lookups of patterns
- Straightforward "where is X?" questions

**Medium** - Use for moderate exploration:
- Understanding a single feature implementation
- Finding multiple related components
- Mapping out a subsystem

**Very Thorough** - Use for comprehensive analysis:
- Understanding complex architectural patterns
- Deep analysis across multiple subsystems
- Comprehensive feature mapping

### Step 3: Invoke the Explore Agent

Use the Task tool to launch the Explore agent with the user's exploration question and thoroughness level.

**Important**: Always include the thoroughness level in the prompt (quick/medium/very thorough) to guide the agent's depth of exploration.

### Step 4: Present Findings

After the agent completes:

1. **Summarize Key Findings**: Present main discoveries with file locations and line numbers
2. **Provide Context**: Connect findings to the user's question and note patterns discovered
3. **Offer Next Steps**: Ask if they want changes made, more exploration, or documentation created

## Guidelines

- Always specify thoroughness level in the prompt to the agent
- Use Read tool to examine specific files when needed for deeper analysis
- Don't make changes during exploration - this is for understanding only
- Present findings clearly with file paths and line numbers (e.g., src/auth/login.ts:45)
- Wait for user confirmation before making any changes based on findings
- Use TodoWrite if exploration reveals tasks to be done


## METRICS TRACKING

**This template has `track_metrics: true` in frontmatter.**

You MUST track and display execution metrics at the end of this execution.

See `.claude/shared/metrics-instructions.md` for complete tracking instructions and format.