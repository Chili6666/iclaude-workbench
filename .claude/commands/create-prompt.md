---
name: create-prompt
description: Command to create well-structured prompts with adaptive questioning and intelligent splitting
version: 1.3.0
type: command
experimental: true
track_metrics: false
last_updated: 2026-01-23
rationale: "Well-structured prompts lead to better AI-assisted development outcomes. This command guides users through prompt creation by identifying gaps (context, requirements, constraints, deliverables), asking targeted questions, and generating XML-structured prompts that Claude can execute effectively. Enhanced with complexity detection to guide users in splitting complex prompts into focused, manageable units."
use_cases: "Use when starting new development tasks to create clear requirements, planning complex features that need structured specifications, onboarding team members to prompt engineering best practices, converting vague ideas into actionable prompts, or breaking down complex multi-concern tasks into focused execution units."
---

# Create Prompt Command

Help users create well-structured prompts by detecting gaps and asking clarifying questions.

## Step 0: Capture Initial Prompt

1. Check if `$ARGUMENTS` contains initial prompt text
2. If empty or too vague, ask the user: "What would you like the prompt to accomplish?"
3. Store the user's initial prompt for analysis

## Step 1: Analyze User Prompt for Gaps

Analyze the prompt to identify missing elements:

**Check for these critical elements:**
- **Context/Background**: Does it explain WHY this is needed?
- **Requirements**: Are there specific criteria or must-haves?
- **Output/Deliverable**: Is the expected result clear?
- **Constraints**: Are limitations mentioned (tech stack, scope, patterns)?
- **Success Criteria**: How will completion be verified?

**Simple heuristics to detect gaps:**
- Prompt < 30 words → likely missing context and requirements
- No "why/because/need to" → missing context
- No specific deliverables → missing output format
- Technical task without tech stack → may need constraints
- UI/visual task → may need reference images or mockups

**Detect task type using keywords:**

**UI/Frontend Task Detection:**
- Keywords: "UI", "design", "component", "screen", "page", "layout", "style", "frontend", "interface", "button", "form", "dashboard", "React", "Vue", "web app"
- Set flag: IS_UI_TASK = true

**React App Creation Detection:**
- Keywords: "React app", "new app", "create app", "build app", "application", "web application", "from scratch"
- Must be subset of UI tasks (not research)
- Set flag: IS_APP_CREATION = true

**Research Task Detection:**
- Keywords: "research", "explore", "investigate", "analyze", "study", "understand", "document", "planning", "explain", "how does"
- Set flag: IS_RESEARCH = true
- Takes precedence over other flags (skip project context questions)

## Step 1.5: Detect Complexity and Suggest Split

After analyzing for gaps, check if the prompt is too complex and would benefit from splitting into focused units.

**Complexity Detection Heuristics:**

1. **Requirement Count**: Count bullet points or distinct "must have" statements
   - >5 requirements = moderate complexity
   - >10 requirements = high complexity

2. **Feature Keywords**: Detect multiple major features
   - Count occurrences: "authentication", "dashboard", "API", "database", "UI", "testing", "deployment", "monitoring", "logging", "caching", "notification", "reporting", "search", "analytics"
   - >3 major features = suggest split

3. **Phase Indicators**: Look for sequential language
   - Keywords: "first", "then", "after that", "finally", "next", "followed by"
   - Pattern: "Phase 1", "Phase 2", "Plan 1", "Plan 2", "Step 1", "Step 2"
   - Explicit: "MUST be implemented in 2 separate plans", "split into multiple", "in stages"
   - 3+ phase indicators = suggest split

4. **Layer Mixing**: Multiple architectural layers in one prompt
   - Frontend keywords: "UI", "component", "React", "form", "button", "page"
   - Backend keywords: "API", "endpoint", "server", "route", "controller"
   - Database keywords: "schema", "migration", "query", "database", "model"
   - DevOps keywords: "deploy", "CI/CD", "Docker", "infrastructure"
   - Testing keywords: "test", "unit test", "integration test", "e2e"
   - 3+ different layers = consider splitting

5. **Scope Creep Patterns**:
   - Keywords: "and also", "additionally", "while we're at it", "plus", "also need"
   - Multiple "IMPORTANT:" or "CRITICAL:" or "NOTE:" statements (>3)
   - 2+ scope creep patterns = suggest split

6. **Word Count**:
   - Count words in user's prompt
   - >300 words = moderate complexity
   - >500 words = high complexity

**Detection Logic:**
```
complexity_score = 0

if requirement_count > 10: complexity_score += 3
elif requirement_count > 5: complexity_score += 1

if major_features > 3: complexity_score += 2
elif major_features > 2: complexity_score += 1

if has_explicit_phase_indicators: complexity_score += 3
elif phase_indicator_count >= 3: complexity_score += 2

if architectural_layers >= 3: complexity_score += 2

if scope_creep_patterns >= 2: complexity_score += 1

if word_count > 500: complexity_score += 2
elif word_count > 300: complexity_score += 1

# Determine if split should be suggested
suggest_split = complexity_score >= 4
```

**If complexity detected (suggest_split = true):**

1. **Identify distinct concerns/features** in the prompt:
   - List major features (e.g., "authentication", "dashboard", "reporting")
   - Identify architectural layers (e.g., "UI components", "API endpoints", "database schema")
   - Detect sequential phases (e.g., "project setup", "core implementation", "testing/polish")

2. **Use AskUserQuestion to suggest split:**

```
Question: "I detected multiple concerns in this prompt: [list identified concerns].
          This complexity may lead to agent overload and lower quality results.
          Would you like to split this into focused prompts?"

Options:
  - "Yes, help me split" → Go to Guided Decomposition Flow
  - "No, keep as single prompt" → Set SPLIT_DECLINED = true, continue to Step 2
  - "I'll split manually later" → Set SPLIT_DEFERRED = true, add note to prompt, continue to Step 2
```

**If user chooses "Yes, help me split":**
- Set flag: SPLIT_MODE = true
- Proceed to **Guided Decomposition Flow** (below)

**If user chooses "No" or "I'll split manually later":**
- Set flag: SPLIT_MODE = false
- Continue to Step 2 (normal flow)
- If deferred, add note to generated prompt:
  ```xml
  <complexity_note>
  Note: This prompt was flagged as complex with multiple concerns: [list].
  Consider splitting before execution if agent shows signs of overload.
  </complexity_note>
  ```

## Guided Decomposition Flow

**This flow only runs if SPLIT_MODE = true (user chose "Yes, help me split")**

### Decomposition Step 1: Choose Split Approach

Present the identified concerns and ask how to split:

```
I identified these distinct concerns:
[List each concern with brief description]

Question: "How would you like to split this prompt?"

Options:
  - "By feature" → Description: "One prompt per major feature (e.g., authentication, dashboard, reports)"
  - "By architectural layer" → Description: "Separate UI, backend, database, testing concerns"
  - "By implementation phase" → Description: "Sequential: setup, implementation, polish/testing"
  - "Custom split" → Description: "I'll describe my own split approach"
```

Store user choice in: SPLIT_APPROACH

### Decomposition Step 2: Determine Execution Order

```
Question: "What's the execution order for these split prompts?"

Options:
  - "Sequential" → Description: "Each prompt must complete before the next (1 → 2 → 3)"
  - "Parallel" → Description: "Prompts can be executed in any order independently"
  - "Mixed dependencies" → Description: "Some prompts depend on others, I'll specify"
```

Store user choice in: EXECUTION_ORDER

### Decomposition Step 3: Define Each Split

For each identified concern/split:

**If SPLIT_APPROACH = "Custom split":**
- Ask: "How many separate prompts do you want to create?" (store in SPLIT_COUNT)
- For each split (1 to SPLIT_COUNT):
  - Ask: "What should split [N] focus on? (Provide: focus area, key requirements)"

**Otherwise (feature/layer/phase split):**
- For each identified concern:
  - Present: "Split [N]: [Concern Name] - [Brief description]"
  - Ask: "Any additional details or requirements specific to this split?"

For each split, collect:
- **Name**: Short descriptive name (for filename)
- **Focus**: What this split accomplishes
- **Key requirements**: Specific to this split only
- **Dependencies**: Which other splits must complete first (if any)

Store in: SPLITS array with structure:
```
{
  name: string,
  focus: string,
  requirements: string[],
  dependencies: number[] (indices of other splits)
}
```

### Decomposition Step 4: Set Priorities

**If EXECUTION_ORDER = "Parallel":**
- Ask: "Do any splits have priority? (Optional: specify which should be done first)"

**If EXECUTION_ORDER = "Sequential":**
- Confirm order: "Execution order: Split 1 → Split 2 → Split 3. Is this correct?"
- Allow reordering if needed

**If EXECUTION_ORDER = "Mixed dependencies":**
- For each split: "Which splits must complete before [Split N]?"

Update SPLITS array with priority/order information.

### Decomposition Step 5: Validate Splits

For each split, verify:
- Has clear, focused objective (not overlapping with other splits)
- Has distinct requirements (not duplicating other splits)
- Dependencies are logical (no circular dependencies)

If validation issues found:
- Alert user: "Split [N] seems to overlap with Split [M]. Should we merge or clarify boundaries?"
- Resolve conflicts before proceeding

After validation, proceed to Step 3 (Check Prompts Directory), then to **Enhanced Step 4** for multi-prompt generation.

## Step 2: Ask Targeted Questions

Use the AskUserQuestion tool with conditional logic based on task type flags. Ask 2-4 questions total.

**Conditional Question Priority (ask in this order):**

**1. If IS_APP_CREATION = true AND IS_RESEARCH = false:**
Ask FIRST (using AskUserQuestion with options):
- Question: "Are you creating a new app from scratch or adding to an existing project?"
- Options:
  - "New app from scratch" → Description: "Set up complete project structure with dependencies and configuration"
  - "Add to existing app" → Description: "Integrate with existing codebase, follow current patterns and structure"

**2. If IS_UI_TASK = true:**
Ask about visual references:
- Question: "Do you have any design mockups, screenshots, or visual references?"
- Options:
  - "Yes, I have references" → Description: "Provide file paths or URLs to mockups/designs"
  - "No, create a design" → Description: "Generate creative design following best practices"
- Alternatively, use open-ended: "Do you have reference images, mockups, or sample implementations? (Provide file paths or URLs if available)"

**3. For all tasks (ask about missing critical elements):**
- **If missing context**: "What's the background? Why is this needed?"
- **If missing requirements**: "What are the specific requirements or criteria?"
- **If missing output**: "What should the final deliverable look like?"
- **If missing constraints**: "Are there any constraints (tech stack, scope, patterns to follow)?"

**Important notes:**
- Keep questions open-ended to gather maximum information
- Don't overwhelm (max 4 questions total across all categories)
- Skip questions if user already provided the information in initial prompt
- If IS_RESEARCH = true, skip "new vs existing" question (doesn't apply to research tasks)

## Step 3: Check Prompts Directory

1. Use Glob tool with pattern `prompts/*.md` (from project root)
2. If directory doesn't exist, note that it will be created
3. Extract numbers from existing files (e.g., `001-task.md` → `001`)
4. Determine next sequence number (max + 1, or `001` if none exist)

## Step 4: Generate Structured Prompt(s)

**If SPLIT_MODE = false (single prompt):**

Create prompt content using XML tags:

```xml
<objective>
[Clear statement of what needs to be accomplished]
</objective>

<context>
[Background information and why this is needed]
</context>

<requirements>
[Specific criteria and must-haves]
- Requirement 1
- Requirement 2
</requirements>

<constraints>
[Limitations, restrictions, or boundaries - include only if applicable]
</constraints>

<output>
[Expected deliverable format and structure]
</output>

<examples>
[Clarifying examples - include only if provided by user]
</examples>

<references>
[Visual references for UI/design tasks - include only if applicable]
- Mockup/design file: [path or URL]
- Reference screenshot: [path or URL]
- Sample implementation: [path or URL]
</references>

<verification>
[How to verify the task is complete successfully]
- Success criterion 1
- Success criterion 2
</verification>
```

**If SPLIT_MODE = true (multiple prompts):**

For each split in the SPLITS array, generate a focused prompt file with:

```xml
<objective>
[Focused objective for this specific split only]
</objective>

<context>
[Background for this split, including relationship to other splits]
Original prompt covered multiple concerns. This prompt focuses on: [split focus].
[Context specific to this split]
</context>

<split_metadata>
Split from: [Original prompt summary or base request]
Split number: [N] of [Total]
Execution order: [Sequential/Parallel/Mixed]
</split_metadata>

<dependencies>
[Only include if this split has dependencies]
Depends on:
- [Filename of dependency 1]: [Brief description of what must be complete]
- [Filename of dependency 2]: [Brief description of what must be complete]

Blocks:
- [Filename of blocked prompt]: [Brief description of why]
</dependencies>

<requirements>
[Requirements specific to this split only - do not duplicate other splits]
- Requirement 1
- Requirement 2
</requirements>

<constraints>
[Constraints specific to this split - include only if applicable]
</constraints>

<output>
[Deliverables for this split only]
</output>

<verification>
[Success criteria specific to this split]
- Verification criterion 1
- Verification criterion 2
</verification>
```

**Tag usage:**
- Always include: `<objective>`, `<context>`, `<requirements>`, `<output>`
- Include only if applicable: `<constraints>`, `<examples>`, `<references>` (for UI tasks), `<verification>`
- For split prompts, always include: `<split_metadata>`, and `<dependencies>` if applicable

**Conditional tags (add based on task type):**

If IS_APP_CREATION answered "New app from scratch":
```xml
<project_setup>
New application from scratch.
Initial project structure, dependencies, and configuration required.
</project_setup>
```

If IS_APP_CREATION answered "Add to existing app":
```xml
<project_context>
Adding to existing application.
Follow existing patterns, structure, and conventions.
Integrate with current codebase.
</project_context>
```

If IS_UI_TASK = true:
```xml
<design_directive>
IMPORTANT: Use the Skill tool to invoke the 'frontend-design' skill before implementing UI.
Follow ELEVATE design system tokens if available in project.
Reference: .claude/skills/frontend-design.md
Apply distinctive, production-grade aesthetics as defined in the skill.
</design_directive>
```

If SPLIT_DEFERRED = true (complexity detected but user deferred splitting):
```xml
<complexity_note>
Note: This prompt was flagged as complex with multiple concerns: [list concerns].
Consider splitting before execution if agent shows signs of overload.
</complexity_note>
```

**Tag placement order (single prompt):**
1. `<objective>`
2. `<context>`
3. `<project_setup>` or `<project_context>` (if applicable)
4. `<complexity_note>` (if applicable)
5. `<requirements>`
6. `<constraints>` (if applicable)
7. `<design_directive>` (if applicable)
8. `<output>`
9. `<examples>` (if applicable)
10. `<references>` (if applicable)
11. `<verification>` (if applicable)

**Tag placement order (split prompts):**
1. `<objective>`
2. `<context>`
3. `<split_metadata>`
4. `<dependencies>` (if applicable)
5. `<project_setup>` or `<project_context>` (if applicable)
6. `<requirements>`
7. `<constraints>` (if applicable)
8. `<design_directive>` (if applicable)
9. `<output>`
10. `<examples>` (if applicable)
11. `<references>` (if applicable)
12. `<verification>` (if applicable)

## Step 5: Generate Filename(s)

**If SPLIT_MODE = false (single prompt):**

1. Extract key words from objective
2. Convert to kebab-case format
3. Format: `[number]-[descriptive-name].md`
4. Limit filename to 50 characters (excluding number prefix)
5. Example: `001-authentication-system.md`, `002-api-endpoint.md`

**If SPLIT_MODE = true (multiple prompts):**

Determine naming convention based on SPLIT_APPROACH and EXECUTION_ORDER:

**For Sequential Execution:**
- Format: `[base-number]-[descriptive-name].md`
- Example: `001-setup.md`, `002-implementation.md`, `003-testing.md`
- Each split gets incremental number: base, base+1, base+2, etc.

**For Parallel Execution (feature-based split):**
- Format: `[base-number]-[letter]-[descriptive-name].md`
- Example: `001-a-authentication.md`, `001-b-dashboard.md`, `001-c-reports.md`
- All splits share same base number but have letter suffix (a, b, c, etc.)

**For Mixed Dependencies (hybrid approach):**
- Use sequential numbers for dependent chains
- Use letter suffixes for parallel features within same phase
- Example: `001-foundation.md`, `002-a-feature-one.md`, `002-b-feature-two.md`, `003-integration.md`

**Filename generation rules:**
- Extract key words from each split's name/focus
- Convert to kebab-case
- Limit to 40 characters (excluding number/letter prefix)
- Ensure filenames are descriptive and distinguish splits clearly

## Step 6: Save and Confirm

**If SPLIT_MODE = false (single prompt):**

1. Create `prompts/` directory if it doesn't exist (use Bash mkdir if needed)
2. Use Write tool to save the prompt file
3. Confirm to user:
   ```
   ✓ Prompt saved to prompts/[filename]

   Next steps:
   1. Review the prompt
   2. Execute with: /work-on-prompt [number]
   ```

**If SPLIT_MODE = true (multiple prompts):**

1. Create `prompts/` directory if it doesn't exist
2. For each split, use Write tool to save the prompt file
3. Provide comprehensive confirmation:

```
✓ Created [N] focused prompts from complex base request:

  [List each prompt with icon and description]
  - prompts/001-setup.md
    Focus: [Brief description]

  - prompts/002-implementation.md
    Focus: [Brief description]
    Dependencies: Requires 001-setup.md

  - prompts/003-testing.md
    Focus: [Brief description]
    Dependencies: Requires 002-implementation.md

Execution order: [Sequential/Parallel/Mixed]

[If Sequential:]
Recommended workflow:
1. Start with: /work-on-prompt 001
2. After 001 completes, run: /work-on-prompt 002
3. After 002 completes, run: /work-on-prompt 003

[If Parallel:]
These prompts can be executed in any order.
You can work on multiple prompts concurrently.

[If Mixed:]
Dependency chain:
- Start with: [list independent prompts]
- Then proceed to: [list dependent prompts with their dependencies]

Benefits of this split:
- Each prompt has a focused, clear objective
- Agents can execute each prompt without overload
- Better traceability and version control
- Easier to review and validate results
```

## Error Handling

- No prompts directory → Create automatically
- Numbering conflict → Find next available number
- Empty prompt after questions → Ask to clarify or exit
- Invalid filename characters → Replace with hyphens
- Circular dependencies in splits → Alert user and help resolve
- Overlapping split concerns → Ask user to clarify boundaries or merge splits
- User cancels during decomposition → Save progress and offer to resume or start over

## Notes

- Generated prompts use XML tags for structure (better for Claude to parse)
- Command file uses standard markdown format (follows template conventions)
- Sequential numbering helps organize prompts chronologically
- Descriptive filenames make prompts easy to identify
- Focuses on gathering essential information without overwhelming user
- For UI tasks, the `<references>` tag can include paths to mockups, screenshots, or design files
- Visual references help Claude understand design intent and implementation requirements
- Complexity detection prevents agent overload by guiding users to create focused prompts
- Split prompts improve traceability, review process, and execution quality
- Dependencies between prompts are explicitly documented for clear execution order

## Examples

### Example 1: Complex Multi-Feature Prompt (Suggests Split)

**User input:**
```
Build a user authentication system with login, registration, password reset,
email verification, and also add a dashboard with user profile, settings page,
analytics charts, and an admin panel with user management and reporting.
```

**Complexity analysis:**
- Feature count: 2 major features (authentication + dashboard)
- Requirement count: 8+ distinct requirements
- Word count: ~40 words
- Scope creep: "and also" pattern detected
- Complexity score: 5 (suggests split)

**Split suggestion:**
```
I detected multiple concerns in this prompt:
1. User authentication system (login, registration, password reset, email verification)
2. User dashboard (profile, settings, analytics)
3. Admin panel (user management, reporting)

This complexity may lead to agent overload and lower quality results.
Would you like to split this into focused prompts?
```

**If user chooses "Yes, help me split":**

Generated prompts:
- `001-authentication-system.md` - Login, registration, password reset, email verification
- `002-user-dashboard.md` - User profile, settings, analytics charts
- `003-admin-panel.md` - User management and reporting features

### Example 2: Sequential Phase Prompt (Suggests Split)

**User input:**
```
First, set up a new React project with TypeScript and Tailwind CSS.
Then, implement a UI with three main panels: sidebar, content area, and properties panel.
Finally, add search functionality and markdown rendering to the content area.
```

**Complexity analysis:**
- Phase indicators: "First", "Then", "Finally" (3 phases)
- Sequential structure detected
- Complexity score: 5 (suggests split)

**Split suggestion:**
```
I detected multiple implementation phases in this prompt:
1. Project setup (React, TypeScript, Tailwind CSS)
2. UI implementation (three-panel layout)
3. Feature additions (search and markdown rendering)

Would you like to split this into sequential prompts?
```

**Generated prompts (Sequential):**
- `001-project-setup.md` - React project with TypeScript and Tailwind CSS
- `002-ui-layout.md` - Three-panel layout implementation
  - Dependencies: Requires 001-project-setup.md
- `003-content-features.md` - Search and markdown rendering
  - Dependencies: Requires 002-ui-layout.md

### Example 3: Simple Focused Prompt (No Split Suggested)

**User input:**
```
Add a logout button to the navigation bar that clears the session and redirects to login page.
```

**Complexity analysis:**
- Feature count: 1 (logout functionality)
- Requirement count: 2 (clear session, redirect)
- Word count: 17 words
- Complexity score: 0 (no split suggested)

**Result:**
- Normal single-prompt flow continues
- Generated: `001-logout-button.md`

### Example 4: User Declines Split

**User input:** (Complex multi-feature prompt)

**Complexity detected, user chooses:** "No, keep as single prompt"

**Result:**
Generated prompt includes complexity note:
```xml
<objective>
Build authentication system and dashboard with admin panel
</objective>

<context>
[Context here]
</context>

<complexity_note>
Note: This prompt was flagged as complex with multiple concerns:
- User authentication system
- User dashboard
- Admin panel

Consider splitting before execution if agent shows signs of overload.
</complexity_note>

<requirements>
[All requirements listed]
</requirements>
```

### Example 5: Layer-Based Split (Parallel Execution)

**User input:**
```
Build a task management API with database schema, REST endpoints,
authentication middleware, and comprehensive test suite.
```

**Split approach:** By architectural layer

**Generated prompts (Parallel - can execute in any order):**
- `001-a-database-schema.md` - Database models and migrations
- `001-b-rest-endpoints.md` - API routes and controllers
- `001-c-auth-middleware.md` - Authentication and authorization
- `001-d-test-suite.md` - Unit and integration tests

Note: All use same base number (001) with letter suffixes since they're parallel.

### Example 6: Mixed Dependencies

**User input:**
```
Set up Express.js backend, then add user management API and product catalog API in parallel,
finally integrate both with a unified search endpoint.
```

**Split approach:** Mixed (sequential foundation, parallel features, sequential integration)

**Generated prompts:**
- `001-express-setup.md` - Express.js backend setup
- `002-a-user-api.md` - User management API (depends on 001)
- `002-b-product-api.md` - Product catalog API (depends on 001)
- `003-search-integration.md` - Unified search (depends on 002-a and 002-b)