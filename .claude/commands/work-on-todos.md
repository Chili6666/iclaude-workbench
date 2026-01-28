---
name: work-on-todos
description: Systematically work on tasks from TODO reports with priority-based workflow
version: 1.1.1
type: command
track_metrics: true
last_updated: 2026-01-13
rationale: "After code review commands generate TODO reports with prioritized issues, developers need a systematic way to address them. This command automates the workflow of reading TODO reports, prioritizing tasks (Critical > High > Medium), and implementing fixes while tracking progress."
use_cases: "Use after running ts-check or react-check commands to work through generated TODO reports, when implementing code review feedback, during refactoring sessions to track task completion, or when addressing technical debt systematically."
dependencies:
  - shared/metrics-instructions.md
  - shared/todo-report-format.md
---

# Work on TODOs Command

You are tasked with systematically addressing tasks from TODO reports in the `todos/` folder.

**TODO Report Format:** This command works with TODO reports using checkbox format (`[ ]` pending, `[x]` completed).

## Step 0: Find TODO Files (EXECUTE FIRST)

1. Use Glob tool with pattern `todos/*TODO.md` to find TODO files (exclude `*IMPROVEMENTS.md` files)
2. If multiple TODO files exist, use AskUserQuestion to let user select which one to work on
3. If no TODO files found, inform user and exit
4. Store selected file path for next steps

## Prerequisites

1. Verify current git status and branch
2. Ensure working directory is clean (or ask user to commit/stash changes)

## Workflow

### Step 1: Read and Parse Selected TODO Report

- Use the Read tool to read the selected TODO file (from Step 0)
- Extract all tasks by priority (HIGH/CRITICAL, MEDIUM, LOW)
- Filter out tasks already marked as completed `[x]`
- Count remaining tasks by priority
- Present the summary to the user in the following format:
  ```
  TODO Report Summary:
  - HIGH/CRITICAL: X tasks remaining (~Y hours)
  - MEDIUM: X tasks remaining (~Y hours)
  - LOW: X tasks remaining (~Y minutes)
  ```
- If no tasks remain, inform the user and exit

### Step 1.5: Read Metadata and Gather Validation Commands

After reading the TODO report:

1. **Extract Metadata** from the TODO file header:
   - Look for `**Guideline**: <path>` field
   - Look for `**Framework**: <framework>` field
   - Look for `**Lint Command**: <command>` field (optional)
   - Look for `**Build Command**: <command>` field (optional)

2. **Determine Coding Guideline:**
   - **If `**Guideline**` field exists**: Use that guideline path
   - **If missing**: Use AskUserQuestion to list available guidelines:
     - Use Glob tool with pattern `.claude/guidelines/*.md`
     - Present available guidelines to user
     - Include "None - use general best practices" option
   - **If guideline file doesn't exist**: Inform user and continue without guideline

3. **Determine Validation Commands:**

   **For Lint Command:**
   - **If `**Lint Command**` field exists in TODO**: Use that command
   - **If missing**: Use AskUserQuestion to ask:
     - Option 1: "Yes, provide lint command" - User will specify command
     - Option 2: "No, skip lint validation" - Skip linting

   **For Build Command:**
   - **If `**Build Command**` field exists in TODO**: Use that command
   - **If missing**: Use AskUserQuestion to ask:
     - Option 1: "Yes, provide build/test command" - User will specify command
     - Option 2: "No, skip build validation" - Skip building

4. **Present Configuration Summary:**
   ```
   Configuration for this session:
   - Coding Guideline: {path or "None"}
   - Lint Command: {command or "Skipped"}
   - Build Command: {command or "Skipped"}
   ```

5. **Update TODO File** (if new metadata added):
   - If user provided guideline/commands that weren't in metadata
   - Use Edit tool to add new metadata fields to the TODO file header
   - This preserves the configuration for future runs

**Note:** This step makes the workflow framework-agnostic by storing all context in the TODO file itself.

### Step 2: Priority Selection

**Use the AskUserQuestion tool to ask which priority level to work on:**

Present these options:
- **Option 1**: "HIGH/CRITICAL tasks" - Work on high-priority blocking issues
- **Option 2**: "MEDIUM tasks" - Work on important improvements
- **Option 3**: "LOW tasks" - Work on suggestions and minor improvements

After user selects priority level, filter tasks to only that priority level.

### Step 3: Task Selection

Present the remaining tasks for the selected priority and ask the user to choose:

**Use the AskUserQuestion tool with the following options:**
- **Option 1**: "Work on all tasks" - Process all remaining tasks of selected priority sequentially
- **Option 2**: "Select specific tasks" - Let me choose which tasks to work on

**If user selects "Select specific tasks":**
- Present a numbered list of all remaining tasks for the selected priority
- Use AskUserQuestion with multiSelect: true to let them select multiple tasks
- Each option should show: task description, file location, and time estimate
- After selection, confirm the chosen tasks and proceed only with those

**If user selects "Work on all tasks":**
- Proceed with all remaining tasks of the selected priority

### Step 4: Branch Creation (Optional)

**Use the AskUserQuestion tool to ask about branch creation:**

Present these options:
- **Option 1**: "Create new branch" - Create a feature branch for the changes
- **Option 2**: "Stay on current branch" - Work on current branch

**If user selects "Create new branch":**
- Create a new branch with format: `fix/todos-{priority}`
  - For HIGH/CRITICAL: `fix/todos-critical`
  - For MEDIUM: `fix/todos-medium`
  - For LOW: `fix/todos-low`
- Switch to the new branch
- Confirm branch creation to the user

**If user selects "Stay on current branch":**
- Proceed with current branch
- Confirm current branch name to the user

### Step 5: Work on Each Task

For each selected task:

#### 5.1 Present Task
- Show the task description, file location, and estimated time
- Use TodoWrite tool to track the current task in progress

#### 5.2 Implement Fix
- Read the relevant file(s)
- Implement the required fix based on the task description
- Follow the coding guideline configured in Step 1.5 (if any)
- Reference the improvement report (if it exists) for detailed context

#### 5.3 Validate Changes

After implementing each fix, run validation in sequence (based on Step 1.5 configuration):

1. **Lint Check** (if configured in Step 1.5)
   - Run the lint command specified by user or from TODO metadata
   - If lint fails, fix the errors before proceeding
   - If auto-fix is available, ask user if they want to run it
   - Do not move to the next task until lint passes

2. **Build/Test Check** (if configured in Step 1.5)
   - Run the build/test command specified by user or from TODO metadata
   - If validation fails, fix the errors before proceeding
   - Do not move to the next task until validation passes

3. **Coding Guidelines Check** (if configured in Step 1.5)
   - If guideline path was provided, use Read tool to read the guideline file
   - Verify the fix complies with guideline requirements
   - If violations are found, fix them immediately
   - If no guideline configured, use language-specific best practices

#### 5.4 Update TODO Report
- Mark the completed task with `[x]` in the TODO report
- Update the status count for the priority section (e.g., "Status: 2/15 completed")
- Update the total effort remaining
- Save the updated report

#### 5.5 Continue or Pause

1. **Show Progress**
   - Display: "Completed X of Y {PRIORITY} tasks"
   - Show brief git status (files modified count)

2. **Ask User Next Action** using AskUserQuestion tool:
   - Question: "What would you like to do next?"
   - Option 1: "Continue to next task" - Keep working on remaining tasks
   - Option 2: "Stop and commit changes" - Create commit with completed work
   - Option 3: "Stop without committing" - View summary without committing

3. **Execute Based on User Choice:**
   - If "Continue to next task" → Loop back to Step 5.1 for next task
   - If "Stop and commit" → Set commit_flag=true, proceed to Step 6
   - If "Stop without committing" → Set commit_flag=false, proceed to Step 6

### Step 6: Final Summary

After user chooses to stop (from Step 5.5):

1. **Show Summary**
   - Display git status showing all changes
   - Show git diff summary
   - List all completed tasks
   - Show updated task counts from the TODO report

2. **Create Commit** (conditional based on Step 5.5 choice)
   - **If user selected "Stop and commit"** in Step 5.5:
     - Create a commit with message format:
     ```
     fix: address {PRIORITY} priority TODO items

     Completed tasks:
     - [Task 1 description] (file:line)
     - [Task 2 description] (file:line)
     ...

     Lint: {✅ Passed / ⏭️ Skipped}
     Build: {✅ Passed / ⏭️ Skipped}
     Coding Guidelines: {✅ Verified / ⏭️ None configured}

     🤖 Generated with iClaude Templates

     ```
     - Replace {PRIORITY} with actual priority (HIGH/CRITICAL, MEDIUM, or LOW)
     - Run `git status` after commit to confirm
   - **If user selected "Stop without committing"** in Step 5.5:
     - Skip commit creation
     - Proceed directly to section 3 (Next Steps)

3. **Next Steps**
   - Inform user of current branch
   - If tasks remain in this priority, suggest running the command again
   - If all tasks in this priority are done, suggest working on the next priority level
   - **IMPORTANT**: After displaying next steps, you MUST proceed immediately to Step 7

### Step 7: Display Execution Metrics (MANDATORY - DO NOT SKIP)

⚠️ **This template has `track_metrics: true` - you MUST execute this step NOW**

Display the execution metrics report using the format from `.claude/shared/metrics-instructions.md`:

- Component: work-on-todos (command)
- Status: ✓ SUCCESS or ✗ ERROR
- Timing: Start time, end time, duration
- Token Usage: Input tokens, output tokens, total
- Tool Calls: Total count + breakdown (Read, Write, Edit, Bash, etc.)

**Execute this step BEFORE ending the command. This is mandatory.** 

## Error Handling

- If TODO file not found: List available files in `todos/` folder and ask user to select one
- If metadata missing: Prompt user for guideline and commands (Step 1.5)
- If guideline file doesn't exist: Inform user and continue without guideline (use best practices)
- If validation command fails: Fix errors, do not proceed to next task
- If lint fails: Fix errors or offer auto-fix, do not proceed to next task
- If coding guideline violations found: Fix immediately
- If file not found: Report error and ask user for guidance
- If git operations fail: Report error and stop workflow

## Notes

- Always work on tasks sequentially, one at a time
- Never skip validation steps (lint/build/guidelines)
- Always update the TODO report after each completed task
- Never commit automatically - always ask user first
- Use TodoWrite tool throughout to show progress
- Works with any TODO markdown file that follows the checkbox format `[ ]` / `[x]`
- Framework and language agnostic - works with any project type (TypeScript, Python, Rust, Go, Java, etc.)
- Validation commands configured via user prompts or TODO metadata (no package.json dependency)
- Supports any lint/build/test command (npm, poetry, cargo, go test, pytest, etc.)
- Gracefully handles missing guidelines (falls back to language best practices)
- Metadata stored in TODO files enables reusable configurations across sessions
- First run prompts for configuration, subsequent runs reuse stored metadata
- **HIGH/CRITICAL tasks** are blocking issues that must be addressed first
- **MEDIUM tasks** are important improvements that should be addressed soon
- **LOW tasks** are nice-to-have suggestions and minor improvements
- If multiple TODO files exist (e.g., TYPESCRIPT_TODO.md, PYTHON_TODO.md, or custom project TODO files), user can choose which to work on
- IMPROVEMENTS files (`*_IMPROVEMENTS.md`) are excluded from the workflow