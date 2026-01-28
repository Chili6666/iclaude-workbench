---
name: todo-report-format
description: "Standardized format for generating TODO reports from quality check commands"
version: 1.1.0
type: shared
last_updated: 2025-12-11
---

# TODO Report Format

## Overview

Quality check commands generate persistent TODO reports in the `todos/` folder. These reports track actionable issues discovered during code reviews, builds, and linting.

**Priority Alignment:** The priority categories in TODO reports align with the review priority system defined in `.claude/shared/review-workflow.md`:
- **HIGH/CRITICAL** (TODO reports) = 🔴 **CRITICAL** (review feedback) - Must fix before merge
- **MEDIUM** (TODO reports) = 🟡 **HIGH** (review feedback) - Should fix before merge
- **LOW** (TODO reports) = 🟢 **MEDIUM** (review feedback) - Nice to have

This ensures consistency between immediate review feedback and persistent TODO tracking.


## File Naming and Location

**Standard naming:**
- `{LANGUAGE}_TODO.md` - Actionable checklist with validation summary
- `{LANGUAGE}_IMPROVEMENTS.md` - Detailed improvement suggestions and positive observations

**Where:**
- `{LANGUAGE}` = TYPESCRIPT, PYTHON, REACT, VUE, etc. (uppercase convention)
- Reports stored in `todos/` folder at project root
- Create `todos/` folder if it doesn't exist

**Update policy:**
- If file doesn't exist: Create it with all findings
- If file exists: **MERGE** with existing report (preserve completed tasks)
- Always update "Generated" timestamp with current date and time

**Merge Strategy (CRITICAL):**

When a TODO report already exists, you MUST merge intelligently:

1. **Read existing TODO file first** using Read tool
2. **Parse completed tasks**: Extract all tasks marked as `[x]` from existing report
3. **For each completed task:**
   - Keep it as `[x]` completed in the new report
   - Verify it's still relevant (check if file/code still exists)
   - If obsolete (code removed/changed), remove the task
4. **Add new findings**: Add tasks from current code review as `[ ]` pending
5. **Avoid duplicates**: Don't add tasks that already exist (completed or pending)
6. **Update status counts**: Reflect completed + new pending tasks
7. **Preserve completion history**: Never reset `[x]` tasks to `[ ]`

**Why this matters:** Users track progress over time. Resetting completed tasks on every run loses this history and creates frustration.

**Example scenario:**
- Previous run: 10 tasks, user completed 3 → `[x] [x] [x] [ ] [ ] [ ] [ ] [ ] [ ] [ ]`
- Current run finds 2 new issues
- **WRONG**: Replace entire file → All 12 tasks become `[ ]` (loses 3 completions)
- **CORRECT**: Merge → `[x] [x] [x] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ] [ ]` (preserves 3 completions + adds 2 new)

---

## Metadata Fields

TODO reports include metadata to enable framework-agnostic workflows:

**Required Fields:**
- `**Guideline**: <path>` - Path to coding guideline file used for review (e.g., `.claude/guidelines/LANGUAGE-codingguideline.md`)
- `**Framework**: <name>` - Framework identifier (language or framework name)

**Optional Fields:**
- `**Lint Command**: <command>` - User-provided lint command for validation (e.g., linter command)
- `**Build Command**: <command>` - User-provided build/test command for validation (e.g., build or test command)

**Purpose:**
- Commands like `work-on-todos` use this metadata to determine which coding standards to apply
- Stored commands can be reused in subsequent runs
- If metadata is missing, user will be prompted to provide guideline/commands

**Example:**
```
**Guideline**: .claude/guidelines/LANGUAGE-codingguideline.md
**Framework**: LANGUAGE
**Lint Command**: <lint command>
**Build Command**: <build or test command>
```

---

## Report 1: {LANGUAGE}_TODO.md

Actionable checklist organized by priority.

### Template Structure

```
# {Language} Quality TODO Report

**Generated**: {Current Date and Time - YYYY-MM-DD HH:MM}
**Git Branch**: {Current branch name}
**Last Commit**: {Last commit hash and message}
**Guideline**: {Path to coding guideline file, e.g., .claude/guidelines/LANGUAGE-codingguideline.md}
**Framework**: {Framework identifier, e.g., LANGUAGE}

---

## Todo Checklist

### HIGH/CRITICAL Priority

- [ ] Task description (file.ext:line) - time estimate
- [x] Completed task description (file.ext:line) - time estimate

**Status: X/Y completed** - Total Effort: ~X hours

### MEDIUM Priority

- [ ] Task description (file.ext:line) - time estimate

**Status: X/Y completed** - Total Effort: ~X hours

### LOW Priority

- [ ] Task description (file.ext:line) - time estimate

**Status: X/Y completed** - Total Effort: ~X hours

---

**Note**: Detailed information for each improvement item can be found in `{LANGUAGE}_IMPROVEMENTS.md`
```

### Formatting Requirements

**Checkboxes:**
- `[ ]` = pending/open tasks
- `[x]` = completed tasks (when re-running checks)

**Task format:**
```
- [ ] Action verb + specific description (FilePath.ext:LineNumber) - effort estimate
```

**Task guidelines:**
- Start with action verb (Fix, Add, Replace, Remove, Refactor)
- Include file location and line number
- Add effort estimate (5 min, 15 min, 1 hour, etc.)
- Be specific and actionable

**Status line:**
```
**Status: X/Y completed** - Total Effort: ~X hours
```
- X = completed tasks count
- Y = total tasks in this priority
- Total Effort = sum of all estimates

---

## Report 2: {LANGUAGE}_IMPROVEMENTS.md

Detailed suggestions and positive observations.

### Template Structure

```
# {Language} Quality Improvement Report

**Generated**: {Current Date and Time - YYYY-MM-DD HH:MM}
**Git Branch**: {Current branch name}
**Last Commit**: {Last commit hash and message}
**Guideline**: {Path to coding guideline file, e.g., .claude/guidelines/LANGUAGE-codingguideline.md}
**Framework**: {Framework identifier, e.g., LANGUAGE}

---

## Important Improvements (MEDIUM Priority - X items)

### 1. [Improvement Title]

**File(s)**: [file paths with line numbers]
**Effort**: [time estimate]
**Impact**: [Maintainability/Security/Performance/Readability]

**Description**: [Detailed description of the improvement opportunity]

**Current Implementation**: [Brief description of current approach]

**Recommendation**: [Specific recommendations with explanation]

**Benefits**:
- [Benefit 1]
- [Benefit 2]

---

## Suggestions (LOW Priority - X items)

### 1. [Suggestion Title]

**File(s)**: [file paths with line numbers]
**Effort**: [time estimate]
**Impact**: [Readability/Maintainability/Code style]

[Brief description - 2-3 sentences]

**Recommendation**: [Specific suggestion]

---

## Positive Observations

What was done well in this codebase:

1. [Positive observation 1 with specific example]
2. [Positive observation 2 with specific example]
3. [Positive observation 3 with specific example]

**Examples of good patterns to maintain:**
- [Specific pattern or practice to continue]

---

**Report Last Updated:** {Date}
**Total Improvements**: [X medium priority, Y low priority suggestions]
```

### Section Guidelines

**Important Improvements (MEDIUM):**
- Detailed analysis with context
- Include current vs recommended approach
- Explain benefits clearly
- Estimate effort realistically

**Suggestions (LOW):**
- Shorter format (2-3 sentences)
- Simple recommendations
- Focus on minor improvements

**Positive Observations:**
- Always include this section (minimum 3 items)
- Be specific about what was done well
- Highlight patterns worth replicating

---

## Priority Categorization Guidelines

**HIGH/CRITICAL Priority** - Blocking issues:
- Security vulnerabilities
- Build-breaking errors
- Critical type safety violations
- Coding guideline violations that impact functionality
- Broken functionality

**MEDIUM Priority** - Important improvements:
- Code quality improvements
- Non-blocking lint errors
- Performance concerns
- Missing documentation on public APIs
- Architectural improvements

**LOW Priority** - Nice to have:
- Code style suggestions
- Lint warnings
- Documentation improvements
- Minor optimizations
- Refactoring suggestions

---

**Usage Note:** This format is used by quality check commands to generate consistent, actionable TODO reports across all languages and frameworks.