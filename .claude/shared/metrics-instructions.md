---
name: metrics-instructions
description: Instructions for Claude on how to track and display execution metrics
version: 1.1.0
type: shared
last_updated: 2025-12-05
---

# Metrics Tracking Instructions

## 🚨 CRITICAL: ALWAYS TRACK METRICS 🚨

**YOU MUST TRACK AND DISPLAY METRICS FOR EVERY EXECUTION!**

This is a **MANDATORY REQUIREMENT** and a **KEY DIFFERENTIATOR** that sets these templates apart from standard Claude usage.

**When to track metrics:**
- ✅ Template has `track_metrics: true` in frontmatter → **ALWAYS TRACK**
- ❌ Template has `track_metrics: false` or missing → Skip tracking
- ⚠️ If `.claude/config.json` has `metrics.enabled: false` → Skip tracking

**If you see `track_metrics: true` in the template frontmatter, you MUST:**
1. Note the start time at the beginning of execution
2. Count every tool call during execution
3. Estimate token usage from files read and responses generated
4. Display the metrics report at the end

**DO NOT FORGET THIS!** Metrics are what make these templates valuable.

## How to Track Metrics

### At the Start of Execution

Add this at the beginning of your response:

```
I'm starting metrics tracking for this execution.
```

Then mentally note:
- Start time
- Initial context (what files you need to read, what task you're doing)

### During Execution

Track all tool usage:
- Every `Read` operation (count files read)
- Every `Write` operation (count files written)
- Every `Edit` operation (count files edited)
- Every `Bash` command (count commands)
- Any errors or failures

Estimate token usage:
- Keep track of the content you read (input tokens)
- Keep track of your responses and generated content (output tokens)

### At the End of Execution

When you complete your work, display metrics using this format:

```
📊 Execution Metrics
────────────────────────────────────────────────────────────
Component: [agent/command/skill-name] (agent/command/skill)
Status:    ✓ SUCCESS / ✗ ERROR

Timing:
  Started:  [start time]
  Ended:    [end time]
  Duration: [X.Xs or Xm Ys]

Token Usage (estimated):
  Input:    [X,XXX] tokens
  Output:   [X,XXX] tokens
  Total:    [X,XXX] tokens

Tool Calls:
  Total:    [X] calls
  Read:     [X] files
  Written:  [X] files
  Edited:   [X] files
  Bash:     [X] commands
  Failed:   [X] calls (if any)

Tool Breakdown:
  Read: [X]
  Write: [X]
  Edit: [X]
  Bash: [X]
  [other tools]: [X]
────────────────────────────────────────────────────────────
```

## Token Estimation Guidelines

Use these rough estimates:
- **Code files:** ~4 characters per token
- **Markdown/docs:** ~4 characters per token
- **Your responses:** ~4 characters per token

Examples:
- Small file (100 lines, ~3,000 chars) ≈ 750 tokens
- Medium file (300 lines, ~9,000 chars) ≈ 2,250 tokens
- Large file (1,000 lines, ~30,000 chars) ≈ 7,500 tokens

Add up all files read (input) and all content generated (output).

## When Metrics Are Disabled

If metrics are not enabled in the configuration, skip all metrics tracking and reporting. Simply perform your regular work without metrics overhead.

## Example

```
User: "Review the authentication module"
```