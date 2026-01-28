---
name: typescript-codingguideline
description: INFORM TypeScript coding guidelines with strict rules for classes, interfaces, functions, and file organization
version: 1.1.0
type: guideline
track_metrics: true
last_updated: 2025-12-11
---

# TypeScript Coding Guidelines

**Purpose:** INFORM TypeScript coding guidelines with strict rules for classes, interfaces, functions, and file organization

## Priority Rules (Automated Code Review Focus)

These critical rules will be checked during automated code reviews:

| Priority | Rule | Auto-Check |
|----------|------|------------|
| 🔴 CRITICAL | No `function` keyword (use arrow functions) | ✓ |
| 🔴 CRITICAL | No unused variables or parameters | ✓ |
| 🔴 CRITICAL | File naming must match class/interface name | ✓ |
| 🔴 CRITICAL | One exported class or interface per file (no multiple) | ✓ |
| 🔴 CRITICAL | No exported interfaces mixed with exported functions | ✓ |
| 🟠 HIGH | Missing JSDoc on public members | ✓ |
| 🟠 HIGH | Mixing exported classes and interfaces in one file | ✓ |
| 🟡 MEDIUM | Missing explicit access modifiers | ✓ |
| 🟡 MEDIUM | Inconsistent patterns across similar classes | Manual |

## Quick Reference

| Scenario | Use | File Name | Example |
|----------|-----|-----------|---------|
| Has state/lifecycle | Class | PascalCase.ts | `Logger.ts` |
| Stateless utility | Exported functions | kebab-case.ts | `file-utils.ts` |
| Shared types/interfaces | Interface | PascalCase.ts | `UserConfig.ts` |
| Single-use interface | Private in same file | - | (inside class file) |

## Core Rules

- **Always use arrow functions** - No `function` keyword for function declarations (Exception: constructors use `constructor()` keyword - this is a TypeScript/JavaScript language requirement)
- **One exported entity per file** - Each file exports exactly ONE thing: either a class OR an interface. Private (non-exported) interfaces used only within that file MUST stay in the same file.
- **Interface organization** - Single-file interfaces stay private (non-exported) in the same file; shared/public interfaces go in separate files in `interfaces/`
- **Never mix exported interfaces with exported classes** - A file exports either a class OR an interface, not both
- **Never mix exported interfaces with exported functions** - Files with exported functions may only contain private (non-exported) types/interfaces for internal use
- **PascalCase file names** - Classes and exported interfaces use PascalCase.ts
- **Filename matches the export** - The filename must exactly match what is exported (e.g., `UserService.ts` exports `class UserService`, `User.ts` exports `interface User`). Private interfaces don't need separate files.
- **PascalCase types and enums** - All type definitions use PascalCase
- **Strict typing** - Avoid `any`, prefer explicit types
- **Use Record types** - Prefer `Record<string, Type>` over `[key: string]: any`
- **Always add access modifiers** - Explicitly declare `public`, `private`, `protected`
- **Class member order** - private members, constructor, public, protected, private implementation
- **JSDoc for public members** - All public properties, methods, and interfaces must have JSDoc comments
- **No unused variables** - All extracted/computed variables must be used; if not needed, don't create them
- **Pass parameters that will be used** - Functions should receive and use all parameters they extract
- **Maintain consistency** - Similar classes (generators, services, etc.) should follow the same patterns

## Classes vs Exported Functions

### When to Use Classes
Use classes when you need:
- **State management** - Instance properties that maintain state across method calls
- **Singleton pattern** - Single shared instance with initialization lifecycle
- **Encapsulation** - Related data and behavior grouped with access control
- **Instance lifecycle** - Constructor initialization or cleanup logic

```typescript
// ✅ Use class - Maintains state (singleton with server instance)
export class Logger {
  private static instance: Logger;
  private server: McpServer | null = null;

  private constructor() {}

  public static getInstance = (): Logger => {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  };

  public initialize = (server: McpServer): void => {
    this.server = server;
  };

  public info = (data: string): void => {
    this.log('info', data);
  };

  private log = (level: string, data: string): void => {
    if (this.server) {
      this.server.sendLog(level, data);
    }
  };
}
```

### When to Use Exported Functions
Use exported functions when you have:
- **Stateless utilities** - Pure functions with no internal state
- **Simple transformations** - Input → Output operations
- **No `this` context needed** - Functions that don't reference instance properties
- **Would only have static methods** - If all class methods would be static, use functions instead

```typescript
// ✅ Use exported functions - Stateless utility operations
/**
 * Creates a successful response.
 * @param text - text content of the response
 * @returns CallToolResult
 */
export const createResponse = (text: string): CallToolResult => {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
    isError: false,
  };
};

/**
 * Creates an error response.
 * @param text - error text
 * @returns CallToolResult
 */
export const createError = (text: string): CallToolResult => {
  return {
    content: [
      {
        type: 'text',
        text,
      },
    ],
    isError: true,
  };
};
```

### Anti-Patterns to Avoid

```typescript
// ❌ Incorrect - Don't use class for stateless utilities
export class ServerUtils {
  public static createResponse = (text: string): CallToolResult => {
    // This has no state, should be an exported function
  };

  public static createError = (text: string): CallToolResult => {
    // This has no state, should be an exported function
  };
}

// ❌ Incorrect - Don't use class with only static methods
export class FileScanner {
  public static scanDirectory = async (path: string): Promise<string[]> => {
    // No instance state needed, should be an exported function
  };
}
```

### File Naming Rules
- **Files with classes**: Use PascalCase matching the class name (e.g., `Logger.ts` for `class Logger`)
- **Files with exported functions**: Use kebab-case for files with utility functions (e.g., `server-utils.ts`, `file-scanner.ts`)
- **Multiple related functions**: Group in a single file with descriptive name (e.g., `response-helpers.ts`)

### File Organization for Exported Functions

**Rule: Public exported functions always go at the top of the file**

When a file contains exported functions and private helper functions, organize them in this order:
1. **Imports** - All import statements at the top
2. **Private types and interfaces** - Type definitions used internally in the file (NOT exported)
3. **Public exported functions** - The interesting ones, the public API
4. **Private helper functions** - Implementation details

**IMPORTANT:** Exported interfaces must be in separate files (see Interface Organization section). Only private (non-exported) types/interfaces are allowed in files with exported functions.

This makes the file easy to navigate because developers see the public API first.

```typescript
// ✅ Correct order - Public API first
import { readFile } from 'fs/promises';

type Config = {
  path: string;
  recursive: boolean;
};

/**
 * Loads all resources from configured sources
 * @returns Promise resolving to an array of all resources
 */
export const getResources = async (): Promise<Resource[]> => {
  const local = await loadLocalResources();
  const remote = await loadRemoteResources();
  return [...local, ...remote];
};

/**
 * Loads resources from local file system
 */
const loadLocalResources = async (): Promise<Resource[]> => {
  // Implementation details...
};

/**
 * Loads resources from remote sources
 */
const loadRemoteResources = async (): Promise<Resource[]> => {
  // Implementation details...
};

// ❌ Incorrect order - Public API buried at the bottom
import { readFile } from 'fs/promises';

type Config = {
  path: string;
  recursive: boolean;
};

// Private helpers first (wrong!)
const loadLocalResources = async (): Promise<Resource[]> => {
  // Implementation details...
};

const loadRemoteResources = async (): Promise<Resource[]> => {
  // Implementation details...
};

// Public API at the bottom (wrong!)
export const getResources = async (): Promise<Resource[]> => {
  const local = await loadLocalResources();
  const remote = await loadRemoteResources();
  return [...local, ...remote];
};
```

**Why this matters:**
- Developers reading the file see the public API immediately
- The "interesting" functions are at the top, not hidden at the bottom
- Helper functions are implementation details that can be scanned later
- Makes code reviews faster and more focused

### Decision Guide
Ask yourself:
1. **Does it need to maintain state between calls?** → Use a class
2. **Is it a singleton or needs lifecycle management?** → Use a class
3. **Is it a pure utility function?** → Use exported function
4. **Would all methods be static?** → Use exported functions instead

## Code Style

```typescript
// ✅ Functions - Use arrow functions
const processData = (items: Item[]): ProcessedItem[] => {
  return items.map(item => transformItem(item));
};

// ❌ Incorrect - Don't use function keyword for declarations
function processData(items: Item[]): ProcessedItem[] {
  return items.map(item => transformItem(item));
}

// ✅ Class structure - Access modifiers and member order with JSDoc
export class UserService {
  // Private members first
  private readonly users: User[] = [];
  private static readonly DEFAULT_LIMIT = 100;

  // Constructor - NOTE: Constructors use constructor() keyword (language requirement)
  public constructor(private readonly config: ServiceConfig) {}

  // Public methods - Use arrow functions for all methods
  /**
   * Finds a user by their unique identifier
   * @param id - The unique user identifier
   * @returns The user if found, undefined otherwise
   */
  public findUser = (id: string): User | undefined => {
    return this.findUserById(id);
  };

  /**
   * Creates a new user with the provided data
   * @param data - The user creation request data
   * @returns The newly created user
   */
  public createUser = (data: CreateUserRequest): User => {
    return this.processUserCreation(data);
  };

  // Protected methods
  /**
   * Validates user data before creation
   * @param data - The user data to validate
   * @returns True if valid, false otherwise
   */
  protected validateUser = (data: CreateUserRequest): boolean => {
    return data.email.includes('@');
  };

  // Private implementation methods
  private findUserById = (id: string): User | undefined => {
    return this.users.find(user => user.id === id);
  };

  private processUserCreation = (data: CreateUserRequest): User => {
    const user: User = {
      id: this.generateId(),
      ...data,
    };
    this.users.push(user);
    return user;
  };

  private generateId = (): string => {
    return `user-${Date.now()}`;
  };
}

// ❌ Incorrect - Missing access modifiers
export class UserService {
  users: User[] = []; // Should be: private readonly users: User[] = [];

  findUser(id: string): User | undefined { // Should be: public findUser = ...
    return this.users.find(user => user.id === id);
  }
}

// ✅ Record types - Better type safety
type TokenMap = Record<string, TokenValue>;

// ❌ Incorrect - Avoid any with index signatures
type TokenMap = {
  [key: string]: any;
};
```

## Interface Organization

### Single-Use Interfaces (Private)
Keep interfaces private when they're only used within one class:

```typescript
// ✅ Correct - Private interface used only in this service
// UserService.ts
interface CreateUserData {
  email: string;
  name: string;
}

export class UserService {
  /**
   * Creates a new user
   * @param data - User creation data
   * @returns The created user
   */
  public createUser = (data: CreateUserData): User => {
    // Implementation
  };
}
```

### Shared Interfaces (Separate Files)
Interfaces used by multiple files go in `interfaces/` directory:

```typescript
// ✅ Correct - Shared interface in separate file
// interfaces/User.ts
/**
 * Represents a user in the system
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name: string;
}

// services/UserService.ts
import { User } from '../interfaces/User';

export class UserService {
  public findUser = (id: string): User | undefined => {
    // Implementation
  };
}

// controllers/UserController.ts
import { User } from '../interfaces/User';

export class UserController {
  public getUser = (id: string): User | undefined => {
    // Implementation
  };
}
```

### Never Mix Exports

```typescript
// ❌ Incorrect - Don't mix interface and class exports in same file
// User.ts
export interface User {
  id: string;
  name: string;
}

export class UserService {
  // Don't export both!
}

// ❌ Incorrect - Multiple interfaces in one file
// AuditResult.ts
export interface ProjectAuditResult {
  path: string;
  projectName: string;
}

export interface AuditResult {
  timestamp: Date;
  projects: ProjectAuditResult[];
}

// ❌ Incorrect - Exported interface mixed with exported functions
// prompts.ts
export interface SelectOption {
  name: string;
  value: string;
}

export const promptSelect = async (message: string): Promise<string> => {
  // Don't export both interface and functions!
};

// ✅ Correct - Separate files
// interfaces/User.ts
export interface User {
  id: string;
  name: string;
}

// services/UserService.ts
import { User } from '../interfaces/User';

export class UserService {
  // Only class exported here
}

// ✅ Correct - Each interface in its own file
// interfaces/ProjectAuditResult.ts
export interface ProjectAuditResult {
  path: string;
  projectName: string;
}

// interfaces/AuditResult.ts
import { ProjectAuditResult } from './ProjectAuditResult';

export interface AuditResult {
  timestamp: Date;
  projects: ProjectAuditResult[];
}

// ✅ Correct - Interface in separate file, functions in utility file
// interfaces/SelectOption.ts
export interface SelectOption {
  name: string;
  value: string;
}

// utils/prompts.ts
import { SelectOption } from '../interfaces/SelectOption';

export const promptSelect = async (message: string, choices: SelectOption[]): Promise<string> => {
  // Only functions exported here
};
```

### Decision Guide for Interfaces

Ask yourself these questions:

1. **Is the interface used by only ONE file?** → Make it private in that file
2. **Is the interface part of the public API?** (exported and used by multiple files) → Separate file in `interfaces/`
3. **Is the interface an implementation detail?** → Keep it private in the implementation file
4. **Will other services/components need this interface?** → Separate file in `interfaces/`

**Summary:**
- **Single-file interfaces** → Private (non-exported) in the same file where they're used
- **Shared interfaces/public API** → Separate files in `interfaces/` (ONE interface per file)
- **Never mix exported interfaces with exported classes**
- **Never mix exported interfaces with exported functions** → Move interface to separate file
- **Never put multiple exported interfaces in one file** → Each exported interface gets its own file with matching filename

## JSDoc Documentation

All public members must include JSDoc comments:

### Interface Documentation Style

**Preferred: @property Block Style**

Use `@property` tags in a single block comment for interface documentation:

```typescript
// ✅ Preferred - @property block style for interfaces
/**
 * Configuration for token processing
 * @property {number} maxTokens - Maximum number of tokens to process
 * @property {boolean} [debug] - Enable debug logging
 * @property {object} validation - Token validation rules
 * @property {number} validation.minLength - Minimum token length
 * @property {RegExp} validation.pattern - Required token pattern
 */
export interface TokenConfig {
  maxTokens: number;
  debug?: boolean;
  validation: {
    minLength: number;
    pattern: RegExp;
  };
}

**Alternative: Inline Style (for very complex nested types)**

For interfaces with highly complex nested structures, inline comments may improve readability:

```typescript
// ✅ Acceptable - Inline style for complex nested structures
/**
 * Advanced configuration with deep nesting
 */
export interface AdvancedConfig {
  /**
   * Nested validation configuration
   * Contains multiple layers of rules and patterns
   */
  validation: {
    /** Primary validation rules */
    primary: {
      /** Minimum length constraint */
      minLength: number;
      /** Maximum length constraint */
      maxLength: number;
    };
    /** Secondary validation patterns */
    secondary: {
      /** Email validation regex */
      emailPattern: RegExp;
      /** URL validation regex */
      urlPattern: RegExp;
    };
  };
}
```

### Class Properties with JSDoc

```typescript
// ✅ Class properties with JSDoc
export class ConfigManager {
  /** Current configuration settings */
  public readonly config: TokenConfig;

  /**
   * Creates a new configuration manager
   * @param initialConfig - Initial configuration to load
   */
  public constructor(initialConfig: TokenConfig) {
    this.config = initialConfig;
  }
}

// ✅ Function with complete JSDoc
/**
 * Validates a token against configuration rules
 * @param token - The token string to validate
 * @param config - Configuration containing validation rules
 * @returns True if token is valid, false otherwise
 * @throws {ValidationError} When token format is invalid
 * @example
 * ```typescript
 * const isValid = validateToken('abc123', { minLength: 6, pattern: /^[a-z0-9]+$/ });
 * ```
 */
const validateToken = (token: string, config: ValidationConfig): boolean => {
  // Implementation
};
```

## Common Patterns

```typescript
// Service class pattern with proper structure and JSDoc
export class TokenService {
  // Private members
  private readonly tokens: Token[] = [];
  private static readonly MAX_TOKENS = 1000;

  // Constructor
  public constructor() {}

  // Public methods
  /**
   * Creates a new token with the provided data
   * @param data - The token creation request containing name and value
   * @returns The newly created token
   */
  public createToken = (data: CreateTokenRequest): Token => {
    return this.processTokenCreation(data);
  };

  /**
   * Finds a token by its unique identifier
   * @param id - The unique token identifier
   * @returns The token if found, undefined otherwise
   */
  public findToken = (id: string): Token | undefined => {
    return this.locateTokenById(id);
  };

  // Private implementation
  private processTokenCreation = (data: CreateTokenRequest): Token => { /* */ };
  private locateTokenById = (id: string): Token | undefined => { /* */ };
}

// Type definitions with JSDoc
/**
 * Request data for creating a new token
 */
type CreateTokenRequest = {
  /** The display name for the token */
  name: string;
  /** The token value or secret */
  value: string;
};

/**
 * Supported token types for authentication
 */
enum TokenType {
  /** Bearer token for API authentication */
  Bearer = 'Bearer',
  /** API key for service authentication */
  ApiKey = 'ApiKey'
}
```

## Code Quality Rules

### No Unused Variables

**Rule**: Don't extract or compute variables unless you actually use them.

```typescript
// ❌ Incorrect - tokens extracted but never used
private generateStyles = (componentName: string, spec: ComponentSpec): string => {
  const tokens = this.extractTokens(spec); // Extracted but not used!

  if (componentName === 'button') {
    return this.generateButtonStyles(); // Should receive tokens
  }

  return this.generateDefaultStyles();
};

// ✅ Correct - tokens extracted and passed to methods that use them
private generateStyles = (componentName: string, spec: ComponentSpec): string => {
  const tokens = this.extractTokens(spec);

  if (componentName === 'button') {
    return this.generateButtonStyles(tokens); // Passed and used
  }

  return this.generateDefaultStyles(tokens);
};

// ✅ Also correct - don't extract if not needed
private generateStyles = (componentName: string): string => {
  // No token extraction since we're using hardcoded styles

  if (componentName === 'button') {
    return this.generateButtonStyles();
  }

  return this.generateDefaultStyles();
};
```

### Pass Parameters That Will Be Used

**Rule**: If a function extracts data to pass to helpers, those helpers must actually use the parameters.

```typescript
// ❌ Incorrect - generateButtonCSS signature doesn't use tokens parameter
private generateStyles = (tokens: Record<string, unknown>): string => {
  return this.generateButtonCSS(tokens); // Passed but ignored
};

private generateButtonCSS = (_tokens: Record<string, unknown>): string => {
  // Parameter prefixed with _ means intentionally unused - code smell!
  return `button { background: #0052cc; }`; // Hardcoded, not using tokens
};

// ✅ Correct - helper actually uses the parameter
private generateStyles = (tokens: Record<string, unknown>): string => {
  return this.generateButtonCSS(tokens);
};

private generateButtonCSS = (tokens: Record<string, unknown>): string => {
  return `button {
    background: ${tokens['button.primary.fill.default']};
    color: ${tokens['button.primary.text.default']};
  }`;
};
```

### Maintain Consistency Across Similar Classes

**Rule**: When you have multiple classes serving the same purpose (like generators), they should follow the same patterns.

```typescript
// ❌ Incorrect - ReactGenerator passes tokens, but ReactNativeGenerator doesn't
// ReactGenerator.ts
private generateCSSModule = (componentName: string, spec: ComponentSpec): string => {
  const tokens = this.extractTokens(spec);
  return this.generateButtonCSS(tokens); // ✅ Passes tokens
};

private generateButtonCSS = (tokens: Record<string, unknown>): string => {
  return `button { background: ${tokens['button.fill']}; }`;
};

// ReactNativeGenerator.ts
private generateStyles = (componentName: string, spec: ComponentSpec): string => {
  const tokens = this.extractTokens(spec); // Extracted...
  return this.generateButtonStyles(); // ❌ But not passed!
};

private generateButtonStyles = (): string => {
  return 'button { background: #0052cc; }'; // Hardcoded
};

// ✅ Correct - Both follow the same pattern
// ReactGenerator.ts
private generateCSSModule = (componentName: string, spec: ComponentSpec): string => {
  const tokens = this.extractTokens(spec);
  return this.generateButtonCSS(tokens);
};

// ReactNativeGenerator.ts
private generateStyles = (componentName: string, spec: ComponentSpec): string => {
  const tokens = this.extractTokens(spec);
  return this.generateButtonStyles(tokens); // Now consistent
};
```

### When Unused Parameters Are Acceptable

Use the `_` prefix for parameters required by an interface/signature but not used in a specific implementation:

```typescript
// ✅ Acceptable - variant/size not used in this implementation yet
public generate = (
  componentName: string,
  spec: ComponentSpec,
  _variant?: string,  // May be used in future
  _size?: string       // May be used in future
): GeneratorResult => {
  // Implementation doesn't need variant/size yet
  return this.generateComponent(componentName, spec);
};
```

**Key difference**: The `_` prefix is for parameters that MUST exist (interface requirement) but aren't needed yet. It's NOT for hiding the fact that you're extracting data you don't use.

## Type Safety Guidelines

### Complete Type Annotations Required

All functions, especially public ones, must have complete type annotations.

**Requirements:**
- ✅ All function parameters have explicit type annotations
- ✅ All function return types are declared
- ✅ Avoid `any` type (use specific types or `unknown`)
- ✅ Use `Record<string, Type>` instead of `any` for objects
- ✅ Proper use of union types (`Type1 | Type2`)
- ✅ Proper use of optional types (`Type | undefined` or `Type?`)
- ✅ Generic types used appropriately
- ✅ Type assertions used sparingly and safely

**Common Type Safety Issues:**
- Missing type annotations on public functions
- Using `any` when more specific types are available
- Type assertions that could hide errors (`as` keyword)
- Implicit `any` types
- Missing null/undefined checks

```typescript
// ✅ Correct - Complete type annotations
const processUsers = (users: User[], filter: string | undefined): ProcessedUser[] => {
  return users
    .filter(user => !filter || user.name.includes(filter))
    .map(user => ({ id: user.id, name: user.name }));
};

// ❌ Incorrect - Missing return type
const processUsers = (users: User[], filter: string | undefined) => {
  return users.filter(user => !filter || user.name.includes(filter));
};

// ❌ Incorrect - Using any
const processData = (data: any): any => {
  return data.map(item => item.value);
};

// ✅ Correct - Use unknown or specific types
const processData = (data: unknown): string[] => {
  if (!Array.isArray(data)) throw new Error('Expected array');
  return data.map(item => String(item));
};
```

## Code Quality & Architecture

### Single Responsibility Principle

**Rule:** Functions should do one thing well, classes should have focused purpose, modules should have clear boundaries.

**Check for:**
- ✅ Functions are focused and under 50 lines when possible
- ✅ Complex logic decomposed into smaller units
- ✅ Magic numbers/strings extracted to named constants
- ✅ Proper error handling with type-safe errors
- ✅ Async/await patterns correct (no floating promises)
- ✅ No `console.log` or `debugger` statements in production code
- ✅ No commented-out code
- ✅ SOLID principles followed
- ✅ Dependencies injected, not hard-coded
- ✅ No circular dependencies
- ✅ Proper module boundaries and encapsulation

```typescript
// ✅ Correct - Magic numbers extracted
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

const fetchWithRetry = async (url: string): Promise<Response> => {
  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (attempt === MAX_RETRY_ATTEMPTS - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  throw new Error('Max retries exceeded');
};

// ❌ Incorrect - Magic numbers embedded
const fetchWithRetry = async (url: string): Promise<Response> => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await fetch(url);
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw new Error('Max retries exceeded');
};
```

### Dependency Injection

**Rule:** Classes should receive dependencies via constructor, avoid hard-coded dependencies.

```typescript
// ✅ Correct - Dependencies injected
export class UserService {
  public constructor(
    private readonly database: Database,
    private readonly logger: Logger
  ) {}

  public createUser = async (data: CreateUserData): Promise<User> => {
    this.logger.info('Creating user');
    return await this.database.users.create(data);
  };
}

// ❌ Incorrect - Hard-coded dependencies
export class UserService {
  private database = new Database(); // Hard-coded!
  private logger = new Logger();     // Hard-coded!

  public createUser = async (data: CreateUserData): Promise<User> => {
    this.logger.info('Creating user');
    return await this.database.users.create(data);
  };
}
```

### Error Handling

**Requirements:**
- ✅ Try-catch blocks where appropriate
- ✅ Errors are type-safe (use custom error classes)
- ✅ Async errors properly caught
- ✅ No silent failures (always handle or propagate errors)

```typescript
// ✅ Correct - Type-safe custom errors
class ValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const validateUser = (user: User): void => {
  if (!user.email.includes('@')) {
    throw new ValidationError('Invalid email format');
  }
};

// ❌ Incorrect - Generic error, unclear context
const validateUser = (user: User): void => {
  if (!user.email.includes('@')) {
    throw new Error('Invalid');
  }
};
```

## Security Guidelines

**Critical security checks that must be enforced:**

### Input Validation

**Rule:** Validate all external data (API requests, user input, file contents).

```typescript
// ✅ Correct - Input validated
const processUserInput = (input: unknown): ProcessedData => {
  if (typeof input !== 'object' || input === null) {
    throw new ValidationError('Expected object');
  }

  const data = input as Record<string, unknown>;

  if (typeof data.name !== 'string' || data.name.length === 0) {
    throw new ValidationError('Name required');
  }

  return { name: data.name };
};

// ❌ Incorrect - No validation
const processUserInput = (input: any): ProcessedData => {
  return { name: input.name };
};
```

### Security Checklist

- ✅ Input validation on all external data (API, user input, files)
- ✅ SQL injection prevention (use parameterized queries)
- ✅ XSS prevention (proper escaping, no `dangerouslySetInnerHTML` with user data)
- ✅ Authentication/authorization checks present
- ✅ No sensitive data logged (passwords, tokens, API keys)
- ✅ No hardcoded secrets in code (use environment variables)
- ✅ Proper sanitization before rendering or storage
- ✅ CSRF protection in place for state-changing operations
- ✅ Rate limiting on sensitive endpoints

**Common Security Issues to Avoid:**
- User input not validated
- SQL queries with string concatenation
- Sensitive data in logs or console output
- Missing authentication checks
- XSS vulnerabilities in user-facing content

## Performance Guidelines

### React-Specific Performance

When working with React, follow these performance patterns:

- ✅ Avoid unnecessary re-renders (use `React.memo` when appropriate)
- ✅ Use `useMemo` for expensive calculations
- ✅ Use `useCallback` for function props passed to memoized children
- ✅ Dependencies arrays must be correct in hooks
- ✅ State updates should be efficient and minimal

### General Performance Best Practices

- ✅ Use efficient data structures (Map vs Object, Set vs Array)
- ✅ Avoid N+1 query problems in database operations
- ✅ Don't perform expensive operations inside loops
- ✅ Consider bundle size when importing libraries
- ✅ Use lazy loading where appropriate
- ✅ Apply memoization for expensive pure functions

**Performance Anti-Patterns to Avoid:**
- Expensive calculations in React render functions
- Large objects in React state causing unnecessary re-renders
- Multiple unnecessary array iterations (use single pass when possible)
- Missing database indexes causing slow queries

```typescript
// ✅ Correct - Efficient single pass
const processItems = (items: Item[]): ProcessedItem[] => {
  return items.reduce<ProcessedItem[]>((acc, item) => {
    if (item.active && item.value > 0) {
      acc.push({ id: item.id, value: item.value * 2 });
    }
    return acc;
  }, []);
};

// ❌ Incorrect - Multiple passes
const processItems = (items: Item[]): ProcessedItem[] => {
  return items
    .filter(item => item.active)
    .filter(item => item.value > 0)
    .map(item => ({ id: item.id, value: item.value * 2 }));
};
```

## Testing & Maintainability

### Testability Requirements

Code must be written with testability in mind:

- ✅ Code is decoupled and testable
- ✅ Dependencies are injectable (see Dependency Injection section)
- ✅ Prefer pure functions where possible
- ✅ Side effects are isolated and clearly identified

### Documentation Standards

Already covered in JSDoc section, but additional requirements:

- ✅ Comments explain "why", not "what" (code should be self-documenting)
- ✅ Complex algorithms have explanatory comments
- ✅ README files updated when public API changes
- ✅ TODO/FIXME comments include issue tracking references when possible

### Code Clarity

- ✅ Use descriptive variable and function names
- ✅ Consider edge cases (null, undefined, empty arrays)
- ✅ Avoid overly clever code - prefer clear and maintainable
- ✅ No dead code or unused imports

```typescript
// ✅ Correct - Clear, descriptive names
const calculateTotalPriceWithTax = (
  items: CartItem[],
  taxRate: number
): number => {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxAmount = subtotal * taxRate;
  return subtotal + taxAmount;
};

// ❌ Incorrect - Unclear names
const calc = (arr: CartItem[], r: number): number => {
  const s = arr.reduce((a, b) => a + b.price, 0);
  return s + (s * r);
};
```

## Automated Checks Summary

The following rules can be automatically validated:

| Check Type | Rule | Severity |
|------------|------|----------|
| Syntax | No `function` keyword (except constructors) | CRITICAL |
| Code Quality | No unused variables | CRITICAL |
| Naming | File name matches class name | CRITICAL |
| Type Safety | Complete type annotations on public APIs | CRITICAL |
| Security | Input validation on external data | CRITICAL |
| Documentation | JSDoc present on public members | HIGH |
| Architecture | No mixed class/interface exports | HIGH |
| Performance | No expensive operations in loops | HIGH |
| Style | Explicit access modifiers | MEDIUM |
| Consistency | Similar classes follow same patterns | MEDIUM |

## METRICS TRACKING

**This template has `track_metrics: true` in frontmatter.**

You MUST track and display execution metrics at the end of this execution.

See `shared/metrics-instructions.md` for complete tracking instructions and format.