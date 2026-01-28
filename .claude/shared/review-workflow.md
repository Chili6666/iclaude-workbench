---
name: review-workflow
description: "Standard priority system and output format for code review agents"
version: 1.1.0
type: shared
last_updated: 2025-12-05
---

# Review Workflow System

## Priority System

All code review agents use a consistent three-tier priority system to categorize findings:

| Priority | Emoji | Must Fix Before Merge | Typical Timeline |
|----------|-------|----------------------|------------------|
| 🔴 CRITICAL | Red | YES | Immediate (blocking) |
| 🟡 HIGH | Yellow | SHOULD | Before merge (recommended) |
| 🟢 MEDIUM | Green | NICE TO HAVE | Next iteration |

### Priority Definitions

#### 🔴 CRITICAL - Must Fix Before Merge: YES

Issues that **block the merge** and must be resolved immediately:

- Security vulnerabilities
- Broken functionality
- Coding guideline violations that break team standards
- Type safety violations
- Critical performance issues that make the application unusable
- Data integrity violations

#### 🟡 HIGH - Must Fix Before Merge: SHOULD

Issues that **should be addressed** before merging but can be deferred with proper justification:

- Performance issues that degrade user experience
- Architectural concerns
- Missing documentation on public APIs
- Incomplete error handling in important code paths
- Code quality issues that significantly impact maintainability
- Accessibility issues

#### 🟢 MEDIUM - Must Fix Before Merge: NICE TO HAVE

Issues that are **good to fix** but can be addressed in future iterations:

- Code style improvements
- Minor refactoring opportunities
- Alternative approaches
- Documentation improvements for internal functions
- Minor optimization opportunities
- Nice-to-have features or edge case handling

---

## Standard Review Output Format

All code review agents must provide feedback in this structured format:

### 1. Summary

Brief overview of overall code quality (2-3 sentences):
- Scope of changes reviewed
- General assessment of quality
- Key themes or patterns observed

### 2. Critical Issues 🔴

List any blocking issues that **MUST be fixed before merging**:

**Format:** `[File:Line] Issue description`

**Structure for each issue:**
```
[File.ext:LineNumber] Brief issue description
- Violates: [Specific guideline section or best practice]
- Impact: [Why this matters - security, maintainability, performance, etc.]
- Fix: [Specific instruction]
```

### 3. Important Improvements 🟡

List significant improvements that **SHOULD be addressed**:

**Format:** `[File:Line] Improvement description with reasoning`

### 4. Suggestions 🟢

List optional enhancements and best practice recommendations:

**Format:** `[File:Line] Suggestion with brief rationale`

### 5. Positive Observations ✅

Highlight what was done well (minimum 1-3 observations):
- Specific patterns used correctly
- Good architectural decisions
- Well-structured, clean code
- Proper use of language features
- Good testing practices

### 6. Action Items

Numbered list of specific, actionable changes in priority order:

**Format for each item:**
```
N. [File:Line] Action description
   - Current: Brief description of current implementation
   - Suggested fix: Clear instruction
   - Effort: Quick fix / Moderate refactor / Significant rework
   - Priority: 🔴 / 🟡 / 🟢
```

---

## TodoWrite Tool Usage

Use the TodoWrite tool during reviews to track progress and maintain focus:

### When to Use TodoWrite

1. **At review start**: Create todo list with main review phases
2. **For large reviews**: Break down review into manageable chunks
3. **During implementation fixes**: Track fixes needed

### TodoWrite Best Practices

- Mark current task as `in_progress` before starting work
- Complete tasks immediately when done (don't batch completions)
- Only ONE task should be `in_progress` at a time
- Update todo list as priorities change or new issues discovered
- Remove completed or irrelevant tasks

---

## Communication Principles

When providing review feedback:

- **Be constructive**: Frame feedback as learning opportunities, not criticisms
- **Explain reasoning**: Always include the "why" behind suggestions
- **Provide examples**: Show what needs to change and how
- **Prioritize effectively**: Use severity levels (🔴🟡🟢) to help developers focus
- **Acknowledge excellence**: Actively call out good patterns and decisions
- **Be specific**: Reference exact file names, line numbers, and function names
- **Stay objective**: Base feedback on guidelines and best practices, not personal preferences
- **Offer alternatives**: When criticizing an approach, suggest solutions with trade-offs
- **Reference standards**: Cite guideline sections when applicable

---

## Self-Verification Checklist

Before submitting a review, verify:

1. ✅ **Read coding guidelines**: Reviewed all relevant guideline files
2. ✅ **Examined all files**: Reviewed all modified files in scope
3. ✅ **Specific feedback**: All feedback includes file/line references
4. ✅ **Correct priorities**: Critical issues are truly blocking
5. ✅ **Positive observations**: Provided at least one positive comment
6. ✅ **Actionable items**: All action items are clear and implementable
7. ✅ **Used tools**: Actually examined code, not just assumed
8. ✅ **Followed output format**: Used standard structure above

---

**Usage Note:** This file is referenced by code review agents. Agent-specific priority categories and examples should be defined in the individual agent files.