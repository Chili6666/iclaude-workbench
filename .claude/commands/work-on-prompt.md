---
name: work-on-prompt
description: Execute prompts from prompts/ directory (main agent or background subagent)
version: 1.0.1
type: command
track_metrics: false
experimental: true
last_updated: 2026-01-13
rationale: "Structured prompts created with create-prompt need a systematic way to be executed. This command automates prompt discovery, selection (by number or name), and execution (either directly in main agent or via background subagent based on user preference), enabling a complete workflow from prompt creation to implementation with progress tracking and archival."
use_cases: "Use after creating prompts with create-prompt command, when you have a backlog of structured tasks to execute, for delegating complex multi-step implementations to fresh subagent contexts, or when you need to archive completed prompts while tracking execution history."
---

# Work on Prompt Command

Execute structured prompts from the prompts directory using Task tool delegation.

## Step 0: Find Available Prompts

1. Use Glob tool with pattern `prompts/*.md` (from project root)
2. If no prompts found, inform user and exit
3. List available prompts sorted by filename (sequential order)

## Step 1: Select Prompt

Check if `$ARGUMENTS` contains a prompt identifier. Support three selection methods:

**Method 1: Empty/Default**
- If `$ARGUMENTS` is empty, select the most recent prompt (highest number)

**Method 2: Numeric**
- If `$ARGUMENTS` is a number (e.g., "5" or "005"), match the number prefix
- "5" matches "005-login-screen.md"
- Ignore leading zeros when matching

**Method 3: Text**
- If `$ARGUMENTS` is text (e.g., "login"), search for substring match in filename
- "login" matches "001-login-screen.md"

**Multiple Matches:**
- If multiple prompts match, use AskUserQuestion to let user select specific prompt
- Show prompt numbers and names for easy identification

**No Match:**
- Show list of available prompts
- Exit with helpful message

## Step 2: Read Prompt Content

1. Use Read tool to read the selected prompt file
2. Verify prompt has valid structure (should contain XML tags like `<objective>`, `<context>`, etc.)
3. Store complete prompt content for execution

## Step 3: Choose Execution Mode

Use AskUserQuestion to ask the user how they want to execute the prompt:

**Question:** "How should this prompt be executed?"

**Options:**
1. **"Main agent (Recommended)"** - Execute directly in the current conversation context. Better for complex tasks that need user interaction or when you want to monitor progress directly.
2. **"Background subagent"** - Spawn a subagent to work in the background. Good for independent tasks where you want to continue with other work.

## Step 4: Execute Prompt

### Option A: Main Agent Execution (if user selected "Main agent")

1. Extract objective from prompt (for user feedback)

2. Provide immediate feedback:
   - "Starting work on: [prompt-number]-[prompt-name]"
   - "Objective: [first line of <objective> tag]"

3. Execute the prompt directly:
   - Follow the instructions in the prompt content
   - Work through all steps as specified
   - Interact with the user as needed during execution

4. After completion, proceed to Step 6 (Archive)

### Option B: Background Subagent Execution (if user selected "Background subagent")

1. Extract objective from prompt (for user feedback)

2. Provide immediate feedback:
   - "Starting work on: [prompt-number]-[prompt-name]"
   - "Objective: [first line of <objective> tag]"
   - "Spawning subagent to handle implementation..."

3. Spawn background subagent:
   - Use Task tool with `subagent_type="general-purpose"`
   - Set `run_in_background: true`
   - Pass: "Execute this structured prompt:\n\n[full prompt content]"
   - Store returned agent_id

4. Inform user about background execution:
   - "Subagent is working in the background"
   - "You can continue with other tasks"
   - "I'll archive the prompt when execution completes"
   - Show agent_id for reference

5. Command completes here (user gets control back)

## Step 5: Monitor Completion (Automated - Background only)

Note: This step is informational - the actual monitoring happens automatically by the system.

When the background subagent completes:

1. System will detect completion
2. Proceed to Step 6 (Archive) automatically
3. User will be notified of completion and archival

If user wants to check status manually, they can use:
- `/tasks` to see running agents
- Agent ID to track specific prompt execution

## Step 6: Archive Completed Prompt

After successful execution:

1. Create `prompts/completed/` directory if it doesn't exist (use Bash mkdir)
2. Prepare completion metadata to prepend to prompt:
   ```
   ---
   Completed: [current date]
   Status:  Completed
   ---

   ```
3. Read original prompt content and prepend metadata
4. Write updated content to `prompts/completed/[original-filename]`
5. Remove original file from `prompts/` (use Bash rm)
6. Confirm to user: "Prompt archived to prompts/completed/[filename]"

## Step 7: Handle Git Operations

After archiving:

1. Use Bash to run `git status --short` to see modified files
2. If files were changed, use AskUserQuestion to ask user:
   - Question: "What would you like to do with the changes?"
   - Option 1: "Create commit now" - Stage and commit changes
   - Option 2: "Skip for now" - Don't create commit

3. If user selects "Create commit now":
   - Extract objective from prompt content (first line in `<objective>` tag)
   - Stage modified files: `git add [files]`
   - Create commit with format:
     ```
     feat: [objective summary]

     Based on prompt: [prompt-filename]

     > Generated with iClaude Templates
     ```
   - Run `git status` to confirm commit

## Error Handling

- **No prompts found:** Inform user that `prompts/` is empty, suggest using `/create-prompt`
- **Invalid prompt structure:** Warn user and ask if they want to continue anyway
- **Execution failure:** Report Task tool error, don't archive prompt (keep for retry)
- **Git not initialized:** Warn user, skip git operations
- **Archive directory creation fails:** Report error, don't delete original prompt

## Notes

- Works seamlessly with `/create-prompt` command (create → execute workflow)
- Prompts are archived to keep `prompts/` directory organized
- Completion metadata helps track when prompts were executed
- Default behavior (no arguments) makes it easy to execute latest prompt
- **User chooses execution mode**: Main agent (recommended for complex/interactive tasks) or background subagent (for independent tasks)
- Main agent execution allows direct user interaction during prompt execution
- Background execution provides immediate feedback while maintaining fresh context per prompt
- Multiple selection methods (default/numeric/text) provide flexibility
- Git operations are optional (user decides when to commit)
- Archived prompts in `prompts/completed/` can be reviewed or reused