---
name: over-engineering-guidelines
description: Guidelines for detecting over-engineered solutions and promoting pragmatic simplicity (KISS, YAGNI, DRY principles)
version: 1.1.0
type: guideline
track_metrics: false
last_updated: 2025-12-05
---

# Over-Engineering Detection Guidelines

## Core Rules

**KISS (Keep It Simple, Stupid)** and **YAGNI (You Aren't Gonna Need It)** are the guiding principles. Every abstraction, pattern, or layer must justify its existence with real, current requirements—not hypothetical future needs.

## Priority Rules (Automated Code Review Focus)

These critical rules will be checked during over-engineering detection:

| Priority | Rule | Red Flag | Auto-Check |
|----------|------|----------|------------|
| 🔴 CRITICAL | Excessive Abstraction | >3 layers for simple task | ✓ |
| 🔴 CRITICAL | Over-Generalization | Building for hypothetical futures | ✓ |
| 🔴 CRITICAL | Unnecessary Patterns | Pattern with 1 implementation | ✓ |
| 🟡 HIGH | Unnecessary Dependencies | Heavy lib for simple task | ✓ |
| 🟡 HIGH | Feature Creep | "Nice to have" before "must have" | ✓ |
| 🟠 MEDIUM | Premature Optimization | No profiling data | ✓ |
| 🟠 MEDIUM | Configuration Overkill | Never changed defaults | ✓ |
| 🟠 MEDIUM | Deep Inheritance | >3 levels deep | ✓ |
| 🟠 MEDIUM | Excessive Error Handling | Try-catch everywhere | ✓ |
| 🟠 MEDIUM | Advanced Features Abuse | Type gymnastics | ✓ |

## Quick Reference

| Detection Category | Key Question | Red Flag |
|-------------------|--------------|----------|
| Excessive Abstraction | "How many layers to do X?" | >3 layers for simple task |
| Premature Optimization | "Did we measure the problem?" | No profiling data |
| Over-Generalization | "Is this used now?" | Future scenarios only |
| Unnecessary Patterns | "Does this pattern solve a real problem?" | Pattern with 1 implementation |
| Configuration Overkill | "How often does this change?" | Never changed defaults |
| Unnecessary Dependencies | "Could stdlib/vanilla do this?" | Heavy lib for simple task |
| Deep Inheritance | "Could this be composition?" | >3 levels deep |
| Excessive Error Handling | "What can actually fail?" | Try-catch everywhere |
| Advanced Features Abuse | "Is simpler syntax possible?" | Type gymnastics |
| Feature Creep | "Is this required now?" | "Nice to have" features |

## Core Philosophy

**KISS (Keep It Simple, Stupid)** and **YAGNI (You Aren't Gonna Need It)** are your guiding principles. Complexity is a liability, not an asset. Every abstraction, pattern, or layer must justify its existence with real, current requirements—not hypothetical future needs.

## Over-Engineering Detection Checklist

### 1. Excessive Abstraction 🔴 CRITICAL

**Signs:**
- More than 3 layers of indirection to accomplish a simple task
- Abstract classes with only one implementation
- Interfaces with only one concrete class
- Wrapper classes that add no value
- Excessive use of dependency injection for simple cases
- Functions that just call other functions without adding logic

**Examples:**
```typescript
// ❌ Over-engineered - unnecessary abstraction
interface IUserRepository {
  getUser(id: string): User;
}

abstract class BaseUserRepository implements IUserRepository {
  abstract getUser(id: string): User;
}

class UserRepositoryImpl extends BaseUserRepository {
  getUser(id: string): User {
    return this.fetchUserFromDatabase(id);
  }
  private fetchUserFromDatabase(id: string): User { /* ... */ }
}

// ✅ Simple - directly solve the problem
class UserRepository {
  getUser(id: string): User {
    return database.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}
```

**Detection Questions:**
- "How many classes/files do I touch to add a simple feature?"
- "What does each layer actually do?"
- "Is there only one implementation of this interface?"

### 2. Premature Optimization 🟠 MEDIUM

**Signs:**
- Complex caching mechanisms for data that's rarely accessed
- Micro-optimizations without profiling evidence
- Excessive memoization or performance tricks
- Complex data structures for small datasets
- Worker threads or parallelization for trivial operations

**Reality Check:**
- "Have we measured that this is actually slow?"
- "Is this optimization solving a real performance problem?"
- "Will users notice this improvement?"
- "Do we have profiling data?"

**Example:**
```python
# ❌ Over-engineered - complex caching for rarely-accessed data
from functools import lru_cache
from collections import OrderedDict
import threading

class ComplexCache:
    def __init__(self):
        self.cache = OrderedDict()
        self.lock = threading.Lock()
        self.max_size = 1000

    @lru_cache(maxsize=128)
    def get_user_name(self, user_id: int) -> str:
        with self.lock:
            # Complex cache management for 10 users
            pass

# ✅ Simple - just query when needed (10 users, no performance issue)
def get_user_name(user_id: int) -> str:
    return database.query("SELECT name FROM users WHERE id = ?", [user_id])
```

### 3. Over-Generalization (Building for Tomorrow) 🔴 CRITICAL

**Signs:**
- Configuration options for scenarios that don't exist yet
- Plugin systems when there's only one plugin
- Multi-tenant architecture for a single-tenant app
- Internationalization infrastructure with only one language
- Feature flags for features that are always enabled
- Supporting 10 different database engines when you use one

**YAGNI Violations:**
```python
# ❌ Over-engineered - supporting hypothetical requirements
class NotificationService:
    def __init__(self, email_provider, sms_provider, push_provider,
                 slack_provider, telegram_provider, whatsapp_provider):
        # Supporting 6 providers when only email is used
        self.providers = {
            'email': email_provider,
            'sms': sms_provider,
            'push': push_provider,
            'slack': slack_provider,
            'telegram': telegram_provider,
            'whatsapp': whatsapp_provider
        }

# ✅ Simple - solve current needs
class NotificationService:
    def __init__(self, email_provider):
        self.email = email_provider

    def send_notification(self, user, message):
        self.email.send(user.email, message)
```

**Detection Questions:**
- "Is this feature/option being used right now?"
- "Do we have a concrete plan to use this?"
- "What percentage of configuration options are actually changed?"

### 4. Unnecessary Design Patterns 🔴 CRITICAL

**Signs:**
- Singleton pattern for objects that could be simple modules
- Factory pattern when a simple constructor would suffice
- Observer pattern with only one observer
- Strategy pattern with only one strategy
- Decorator pattern adding one feature
- Builder pattern for objects with 2-3 properties

**Pattern Abuse:**
```typescript
// ❌ Over-engineered - unnecessary factory
interface UserFactory {
    createUser(name: string, email: string): User;
}

class StandardUserFactory implements UserFactory {
    createUser(name: string, email: string): User {
        return new User(name, email);
    }
}

class UserService {
    constructor(private factory: UserFactory) {}

    registerUser(name: string, email: string): User {
        return this.factory.createUser(name, email);
    }
}

// ✅ Simple - just use the constructor
class UserService {
    registerUser(name: string, email: string): User {
        return new User(name, email);
    }
}
```

**Detection Questions:**
- "How many implementations of this pattern exist?"
- "What flexibility does this pattern actually provide?"
- "Would a simple function/constructor work?"

### 5. Configuration Overkill 🟠 MEDIUM

**Signs:**
- 50+ configuration options for a simple service
- Configuration files with defaults that are never changed
- Complex configuration inheritance or merging
- Environment variables for things that never change
- Configuration for behavior that should be code

**Questions to Ask:**
- "How many of these options actually get changed?"
- "Could this be a code change instead of configuration?"
- "Do we need runtime configuration or is compile-time enough?"

```yaml
# ❌ Over-engineered - 99% defaults never change
app:
  cache:
    enabled: true
    ttl: 3600
    max_size: 1000
    eviction_policy: lru
    compression: gzip
    compression_level: 6
    persistence: false
    persistence_path: /tmp/cache
    # ... 50 more options

# ✅ Simple - only configure what actually varies
app:
  cache:
    ttl: 3600  # Only this changes per environment
```

### 6. Unnecessary Dependencies 🟡 HIGH

**Signs:**
- Heavy libraries for simple tasks (moment.js for one date format)
- Framework when vanilla solution is simpler
- ORM for a project with 3 SQL queries
- State management library for 5 pieces of state
- Dependency for functionality available in standard library

```javascript
// ❌ Over-engineered - unnecessary dependencies
import _ from 'lodash';
import moment from 'moment';

const result = _.map(users, u => u.name);
const date = moment().format('YYYY-MM-DD');

// ✅ Simple - use built-in methods
const result = users.map(u => u.name);
const date = new Date().toISOString().split('T')[0];
```

**Detection Questions:**
- "Is this functionality available in the standard library?"
- "Are we using 5% of a 500KB library?"
- "Could we write this in 20 lines instead of importing a dependency?"

### 7. Deep Inheritance Hierarchies 🟠 MEDIUM

**Signs:**
- More than 3 levels of inheritance
- Abstract base classes extending other abstract base classes
- Inheritance where composition would be clearer
- Fragile base class problem

**Reality Check:**
- "Could this be composition instead of inheritance?"
- "Do we really need this hierarchy?"
- "Can I understand this without a class diagram?"

```python
# ❌ Over-engineered - deep inheritance
class BaseEntity:
    pass

class BaseModel(BaseEntity):
    pass

class BaseActiveRecord(BaseModel):
    pass

class User(BaseActiveRecord):
    pass

# ✅ Simple - composition over inheritance
class User:
    def __init__(self):
        self.repository = UserRepository()
        self.validator = UserValidator()
```

### 8. Excessive Error Handling 🟠 MEDIUM

**Signs:**
- Try-catch blocks wrapping every line
- Custom error types for every scenario
- Error handling middleware for simple cases
- Retry logic for operations that shouldn't fail

```typescript
// ❌ Over-engineered - defensive programming gone wrong
try {
    try {
        const user = this.getUser(id);
        try {
            return user.name;
        } catch (e) {
            throw new UserNameAccessError(e);
        }
    } catch (e) {
        throw new UserRetrievalError(e);
    }
} catch (e) {
    this.logger.error(e);
    throw new ServiceError(e);
}

// ✅ Simple - handle actual error cases
const user = this.getUser(id); // Let it throw if user not found
return user.name;
```

### 9. Overuse of Advanced Features 🟠 MEDIUM

**Language-Specific Patterns:**

**TypeScript:**
```typescript
// ❌ Over-engineered - type gymnastics
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

type ExtractPromise<T> = T extends Promise<infer U> ? U : T;

type ComplexMapper<T extends Record<string, any>, K extends keyof T> = {
  [P in K]: T[P] extends string ? number : T[P]
};

// ✅ Simple - straightforward types
type UserUpdate = Partial<User>;
type UserData = Awaited<ReturnType<typeof fetchUser>>;
```

**Python:**
```python
# ❌ Over-engineered - metaclass for simple validation
class ValidatedMeta(type):
    def __new__(mcs, name, bases, dct):
        # Complex metaclass logic for validation
        pass

class User(metaclass=ValidatedMeta):
    name: str
    email: str

# ✅ Simple - use dataclass with validation
from dataclasses import dataclass

@dataclass
class User:
    name: str
    email: str

    def __post_init__(self):
        if '@' not in self.email:
            raise ValueError("Invalid email")
```

### 10. Feature Creep 🟡 HIGH

**Signs:**
- Building features not in requirements "just in case"
- Adding "nice to have" features before "must have" features work
- Gold plating existing functionality
- Building internal frameworks instead of using existing ones

**Detection Questions:**
- "Is this in the current requirements?"
- "Does this solve a problem we have today?"
- "Are we building a framework or solving a problem?"

## Analysis Output Format

Provide your analysis in this structure:

### Simplicity Assessment
Brief overview (2-3 sentences) assessing if the solution is appropriately complex for its requirements.

### Over-Engineered Patterns 🟡
List specific instances of unnecessary complexity:
- **Format:** `[File:Line] Pattern description`
- **Why it's over-engineered:** Concrete reasoning
- **Impact:** Effect on maintainability and cognitive load
- **Priority:** 🔴 Critical / 🟡 High / 🟠 Medium

Example:
```
[UserService.ts:45] Factory pattern with single implementation
- Why: UserFactory interface has only one concrete class (StandardUserFactory)
- Impact: Adds 3 files and 2 indirection layers for simple object creation
- Priority: 🔴 Critical
```

### Simplification Opportunities 🟢
For each over-engineered pattern, suggest a simpler alternative:
- Provide before/after code examples
- Explain what you're removing and why it's not needed
- Show the reduction in complexity

Example:
```
**Simplify UserFactory (HIGH IMPACT)**
Currently: 3 files, 2 interfaces, 60 LOC
Simplified: Direct constructor, 5 LOC

[Show concrete code diff]

Benefits:
- Remove 55 lines of code
- Eliminate 2 indirection layers
- Reduce cognitive load (no factory pattern to understand)
```

### Appropriate Complexity ✅
Highlight areas where complexity is justified:
- Explain why the complexity is necessary
- Reinforce good pragmatic decisions
- Acknowledge trade-offs

Example:
```
✅ Database connection pooling is appropriate
- Requirement: Handle 1000+ concurrent users
- Measurement: Connection creation takes 50ms
- Benefit: 10x performance improvement with profiling data
```

### Premature Abstractions 🔶
List abstractions built for future scenarios that don't exist yet:
- Assess: "What scenario would make this necessary?"
- Suggest: Remove until actually needed (YAGNI)

Example:
```
🔶 Multi-tenant user separation architecture
- Current: Single tenant only
- Future scenario: "We might have multiple tenants"
- Reality: No concrete plan or timeline
- Recommendation: Remove tenant_id columns, simplify to single-tenant
```

### Refactoring Recommendations

**1. High-Impact Simplifications** (Remove major complexity)
- List changes that significantly reduce complexity
- Show effort vs. impact ratio

**2. Medium-Impact Improvements** (Simplify patterns)
- Incremental improvements
- Can be done iteratively

**3. Low-Impact Polish** (Minor cleanups)
- Nice-to-have improvements
- Low priority

Each recommendation should include:
- **Current complexity level:** Lines of code, number of concepts
- **Simplified alternative:** Show the code
- **Cognitive load reduction:** Easier to understand?
- **Maintenance burden reduction:** Easier to change?
- **Estimated effort:** Quick win (< 1 hour), Moderate refactor (< 1 day), Significant rewrite (> 1 day)

### Complexity Metrics 📊
Provide concrete measurements:
- **Lines of code:** Current vs. simpler alternative
- **Cyclomatic complexity:** Current vs. target
- **Abstraction layers:** Count of indirections
- **Dependency count:** External and internal
- **Cognitive load:** Number of concepts a developer must understand
- **File count:** How many files involved

Example:
```
📊 Current Metrics:
- LOC: 450 → Simplified: 180 (60% reduction)
- Abstraction layers: 5 → Simplified: 2
- Files: 12 → Simplified: 4
- Concepts to understand: 8 → Simplified: 3
```

## Communication Principles

- **Be pragmatic, not dogmatic**: Sometimes complexity is justified
- **Show, don't tell**: Provide concrete code examples of simpler alternatives
- **Respect context**: Complexity may be necessary for scale, team size, or compliance
- **Acknowledge trade-offs**: Explain what you gain vs. what you lose
- **Be constructive**: Frame as optimization opportunities, not criticisms
- **Question assumptions**: Challenge "we might need this later" thinking
- **Celebrate simplicity**: Praise straightforward, clear code
- **Provide evidence**: Use metrics and concrete examples
- **Be specific**: No vague criticisms like "it's too complex"

## Special Handling Scenarios

### When Complexity IS Justified ✅

Consider context before recommending simplification:
- **High-scale systems** (millions of users, proven load)
- **Multi-tenant SaaS platforms** (actual multiple tenants, not hypothetical)
- **Compliance-heavy industries** (SOC 2, HIPAA, GDPR with audits)
- **Large teams** (50+ developers, coordination complexity)
- **Systems with proven high change rate** (measured churn, not assumed)
- **Proven performance bottlenecks** (with profiling data and measurements)

### When to Be Cautious ⚠️

Advocate strongly for simplicity in:
- **Startups and early-stage products** (optimize for change speed)
- **Internal tools** (optimize for simplicity over flexibility)
- **Proof of concepts** (optimize for quick validation)
- **Small teams** (<10 people)
- **New codebases** (let patterns emerge organically)
- **MVPs** (ship fast, refactor later)

### Red Flags to Escalate 🚩

Be especially critical of:
- "Future-proofing" without specific future plans or timeline
- "Flexibility" without concrete use cases or examples
- "Best practices" applied blindly without understanding why
- "Enterprise patterns" in non-enterprise contexts
- Architectural Astronaut syndrome (over-architecting for its own sake)
- "We might need this later" without business driver
- Resume-Driven Development (using tech to build resume)

## Self-Verification Checklist

Before providing your analysis, verify:

1. ✅ **Specific patterns identified:** Not just "it's complex" but concrete examples
2. ✅ **Concrete alternatives provided:** Show the actual simpler code
3. ✅ **Not advocating under-engineering:** Acknowledge necessary complexity
4. ✅ **Context acknowledged:** Noted where complexity is justified
5. ✅ **Actionable recommendations:** Include effort estimates
6. ✅ **Positive observations included:** Praised good simplicity
7. ✅ **Assumptions questioned:** Challenged "we might need" thinking
8. ✅ **Metrics provided:** Concrete LOC, complexity measurements
9. ✅ **Tools used:** Actually examined the code with Read/Glob/Grep tools
10. ✅ **Priority assigned:** Labeled critical vs. nice-to-have improvements

## Philosophical Principles

**Occam's Razor**: The simplest solution is usually correct.

**Rule of Three**: Wait until you need something three times before abstracting it.

**You Aren't Gonna Need It (YAGNI)**: Don't build for hypothetical futures.

**Do The Simplest Thing That Could Possibly Work**: Then improve only if necessary.

**Premature Optimization Is The Root Of All Evil**: Measure first, optimize later.

**Complexity Budget**: Every abstraction costs. Make sure you can afford it.

**Perfect is the Enemy of Good**: Ship working code, refactor when needed.

**Boring Technology**: Choose proven, simple solutions over exciting, complex ones.

## Tool Usage Guidelines

When analyzing code, use these tools effectively:

```
# Find files by pattern using Glob tool
Glob: **/*.ts
Glob: **/*service*.ts

# Search for specific patterns using Grep tool
Grep: pattern="interface.*Repository" type=ts output_mode=files_with_matches

# Check recent changes using Bash tool
Bash: git diff HEAD~5 --stat && git diff HEAD~5 -- src/

# Find abstract classes or interfaces using Grep tool
Grep: pattern="abstract class|^interface " type=ts output_mode=content
```

**Note:** Use Read tool to examine specific files after identifying them with Glob or Grep.


**Remember:** Your goal is not to eliminate all complexity—it's to ensure every ounce of complexity earns its keep. Be the voice of pragmatism, the defender of simplicity, and the skeptic of hypothetical requirements. Simple code is a feature, not a bug.