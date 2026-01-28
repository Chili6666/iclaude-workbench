---
name: save-conversation
description: Save current conversation to conversations folder with flexible format options
version: 1.0.2
type: command
track_metrics: false
last_updated: 2026-01-13
rationale: "Long development conversations contain valuable context, decisions, and solutions that should be preserved for future reference. This command provides flexible saving options (summary, full conversation, or custom selection) with proper formatting, searchability, and the ability to clear context after saving for a fresh start."
use_cases: "Use when completing a development session to preserve context, before starting a new unrelated task to clear conversation history, when you want to document implementation decisions and rationale, or when creating searchable knowledge base entries from development conversations."
dependencies: []
---

# Save Conversation Command

Persist the current Claude Code conversation with flexible format options, searchability, and context clearing capability.

## Step 0: Initialize Conversations Folder

1. Use Glob tool with pattern `conversations/*.md` to check if folder exists
2. If no results and folder doesn't exist, create it: `mkdir -p conversations`
3. Inform user: "Conversations folder ready"

## Step 1: Choose Save Format

Use AskUserQuestion to determine format:

- Question: "How would you like to save this conversation?"
- Options:
  - "Comprehensive summary" - Key points, decisions made, and actions taken
  - "Full conversation" - Complete dialogue with all messages and context
  - "Custom selection" - Choose specific sections to save

## Step 2: Gather Conversation Content

**For "Comprehensive summary":**
1. Analyze conversation and extract:
   - Main topic/objective
   - Key decisions made
   - Actions taken
   - Important outcomes
   - Blockers or issues encountered
2. Create structured summary with sections

**For "Full conversation":**
1. Capture all user and assistant messages
2. Include relevant tool outputs
3. Preserve code snippets and file references
4. Maintain chronological order

**For "Custom selection":**
1. Present overview of conversation sections:
   - Introduction/Problem statement
   - Analysis and exploration
   - Implementation details
   - Testing and validation
   - Outcomes and next steps
2. Use AskUserQuestion with multiSelect: true to let user choose sections
3. Compile selected sections into final content

## Step 3: Generate Filename

1. Analyze conversation topic and extract 2-4 key words
2. Convert to kebab-case format
3. Add current date: `[topic-keywords]-[YYYY-MM-DD].md`
4. Example: `authentication-feature-discussion-2026-01-10.md`
5. Present suggested filename to user
6. Use AskUserQuestion to confirm:
   - Question: "Save as: [suggested-filename]"
   - Options:
     - "Use this filename" - Proceed with suggestion
     - "Change filename" - User provides custom name

## Step 4: Save Conversation

1. Prepare frontmatter with metadata:
   ```
   ---
   Date: [YYYY-MM-DD]
   Topic: [main topic]
   Format: [summary|full|custom]
   ---
   ```
2. Combine frontmatter with content
3. Use Write tool to save to `conversations/[filename]`
4. Confirm to user: "Conversation saved to conversations/[filename]"

## Step 5: Context Clearing Option

Use AskUserQuestion to offer context clearing:

- Question: "Would you like to clear the current context?"
- Options:
  - "Yes, clear context" - Run /clear command to start fresh
  - "No, keep context" - Continue with current conversation

If user selects "Yes, clear context", inform them: "Use /clear to reset the conversation"

## Extra Features

### List Conversations (when $ARGUMENTS = "list")

1. Use Glob tool with pattern `conversations/*.md`
2. For each file, use Read tool to extract metadata from frontmatter
3. Display table with:
   - Filename
   - Date
   - Topic
   - Format
4. Sort by date (most recent first)

### Search Conversations (when $ARGUMENTS = "search [keyword]")

1. Extract search keyword from $ARGUMENTS
2. Use Glob tool to get all conversation files
3. Use Grep tool with pattern matching keyword in conversation files
4. Display matching conversations with context snippets
5. Show filename, date, and matching excerpt

## Error Handling

- Conversations folder creation fails: Display error and suggest manual creation
- Filename conflict: Append timestamp suffix (e.g., `-v2`, `-v3`)
- Save operation fails: Report error, keep content in memory for retry
- No conversations found (list/search): Inform user directory is empty

## Notes

- Similar to TODO management pattern - persistent storage for knowledge retention
- Semantic filenames make conversations easy to identify and search
- Format flexibility accommodates different use cases (quick reference vs full archive)
- List and search features enable efficient conversation retrieval
- Context clearing option helps manage conversation length and focus
- Conversations are stored as markdown for easy readability and version control