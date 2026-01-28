---
name: react-check
description: Comprehensive React validation (code review, build, lint) with TODO report generation
version: 1.1.0
type: command
track_metrics: true
last_updated: 2025-12-11
dependencies:
  - agents/react-code-reviewer.md
  - shared/todo-report-format.md
  - shared/metrics-instructions.md
---

# react-check Command

Run a comprehensive React validation workflow to ensure code quality, build integrity, and adherence to coding standards.

## Precondition Check

**Verify this is a React project before proceeding:**

1. Use Glob to search for `**/*.tsx` or `**/*.jsx` files (exclude `node_modules/**`, `dist/**`, `build/**`)
2. Use Read to check if `package.json` exists and contains "react" in dependencies or devDependencies
3. If BOTH checks fail: Display error "⚠️ Not a React project. No .tsx/.jsx files or React dependency found." and EXIT immediately
4. If either check passes: Proceed to validation workflow

**Note:** This saves ~30,000 tokens by detecting non-React projects in seconds.

## Validation Workflow

Execute the following validation steps in sequence:

### 1. React Code Review

- Use the Task tool to invoke the **react-code-reviewer** agent
- Present the agent's complete review findings
- If coding guideline violations are found, address them before proceeding to build/lint

### 2. Build Verification

- Use Read tool to examine package.json and auto-detect the build command (look for "build" script)
- If no build script found, skip this step and proceed to linting
- Run the build command (e.g., `npm run build`, `pnpm run build`, `yarn build`)
- If the build fails, report errors clearly and stop the workflow
- If build succeeds, proceed to the next step

### 3. Linting Check

- Auto-detect the lint command from package.json (look for "lint" script)
- If no lint script found, skip this step and proceed to report generation
- Run the linting command (e.g., `npm run lint`, `pnpm run lint`, `yarn lint`)
- If there are auto-fixable issues, offer to run the fix command (e.g., `npm run lint:fix`)
- Report final lint status

### 4. React-Specific Checks (Optional)

If configured in the project, run additional React-specific checks:
- Type checking: `tsc --noEmit` (if TypeScript is used)
- Accessibility audit: Check for a11y linting rules in ESLint config
- Bundle size analysis: Check if `build` output includes size warnings

## Execution Guidelines

- Execute steps sequentially (don't run in parallel)
- Code review violations should be addressed before proceeding to build/lint
- Build failure is blocking - stop and report
- Use TodoWrite to track progress through the validation workflow


## Report Generation

After all steps complete, generate two reports following the format defined in `.claude/shared/todo-report-format.md`:

### Step 1: Check for Existing Reports

Before generating new reports, check if TODO reports already exist:

1. Use Read tool to check for existing `todos/REACT_TODO.md`
2. If file exists:
   - Parse all tasks marked as `[x]` (completed)
   - Note which tasks were completed and their descriptions
   - These MUST be preserved in the new report
3. If file doesn't exist, proceed to Step 2

### Step 2: Merge Findings (if existing report found)

When generating the new TODO report:

1. **Preserve completed tasks:**
   - Keep all `[x]` tasks from existing report at the top of each priority section
   - Verify each is still relevant to current codebase (check if files still exist)
   - If a completed task is obsolete (code changed/removed), remove it

2. **Add new findings:**
   - Add new tasks from current code review as `[ ]` (pending)
   - Place new pending tasks after completed tasks in each priority section
   - Don't duplicate existing tasks

3. **Update status counts:**
   - Calculate: X completed (from old) + Y new pending = total tasks
   - Update effort estimates to include both completed and pending work

**CRITICAL:** Never reset `[x]` completed tasks to `[ ]` pending. This loses user progress history.

### Step 3: Generate Reports

**Generate:**
1. `todos/REACT_TODO.md` - Merged actionable checklist (preserving completed tasks)
2. `todos/REACT_IMPROVEMENTS.md` - Detailed suggestions (can be fully replaced)

**For this command, replace {LANGUAGE} with:** REACT

**Include:**
- Categorized findings from code review, build, and lint steps
- Effort estimates for each task
- Status counts (X/Y completed, Total Effort)
- **REQUIRED METADATA:** Add these header fields to both reports:
  - `**Guideline**: .claude/guidelines/react-codingguideline.md`
  - `**Framework**: react`
  - `**Lint Command**: <actual command used>` (if lint was run, e.g., `npm run lint`)
  - `**Build Command**: <actual command used>` (if build was run, e.g., `npm run build`)

### Present Summary to User

After generating both reports, provide a clear summary including:
- Total number of issues in each category
- Brief overview of the most critical issues
- The locations of both generated reports

Then ask: "Would you like me to start working on addressing these issues?"

Wait for user confirmation before proceeding with any fixes.

## METRICS TRACKING

**This template has `track_metrics: true` in frontmatter.**

You MUST track and display execution metrics at the end of this execution.

See `.claude/shared/metrics-instructions.md` for complete tracking instructions and format.