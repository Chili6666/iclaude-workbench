---
name: communication-guidelines
description: "Best practices for providing constructive, actionable code review feedback"
version: 1.1.0
type: shared
last_updated: 2025-12-05
---

# Communication Guidelines for Code Reviews


## Core Principles

### 1. Be Constructive
Frame feedback as learning opportunities, not criticisms. Focus on the code, not the person. Suggest improvements and explain benefits.

### 2. Explain Reasoning
Always include the "why" behind suggestions. State the principle or guideline being applied, the concrete benefit, and the potential risk of not making the change.

### 3. Provide Specific Examples
Show exactly what needs to change and how. Include file paths, line numbers, and specific instructions. Show before/after when relevant.

### 4. Prioritize Effectively
Use the priority system (🔴🟡🟢) consistently. Reserve CRITICAL for truly blocking issues. Don't overuse high priorities - they lose meaning.

### 5. Acknowledge Excellence
Provide at least 1-3 positive observations in every review. Be specific about what was done well. Recognize good architectural decisions and adherence to standards.

### 6. Be Specific and Concrete
Always include file path and line numbers. Name the specific function, class, or variable. Describe what needs to change and how to implement it.

### 7. Stay Objective
Base feedback on guidelines and best practices, not personal preferences. Cite specific guideline sections. Reference industry standards when applicable.

### 8. Offer Alternatives
When suggesting changes, present multiple approaches with pros and cons. Recommend one approach but explain why. Consider team expertise and project constraints.

### 9. Reference Standards
Link feedback to established guidelines and documentation. Reference project coding guidelines and industry standards. Point to examples in the codebase.

## Tone

**Use collaborative language:**
- "Consider...", "What if we...", "Have you thought about..."
- "This approach works, though..."
- "I wonder if...", "Could we..."

**Avoid confrontational language:**
- "You should...", "You must...", "This is wrong..."
- "Obviously...", "Clearly...", "Everyone knows..."

**Be honest but kind:**
- Clear about blocking issues
- Explain why something is critical
- Balance critique with positive observations


**Usage Note:** These guidelines apply to all code review agents. Follow them consistently to maintain high-quality, constructive feedback.