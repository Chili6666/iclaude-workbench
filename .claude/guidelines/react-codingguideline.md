---
name: react-codingguideline
description: INFORM React coding guidelines merging enterprise standards with React.dev best practices for components, hooks, and performance
version: 1.1.0
type: guideline
track_metrics: true
last_updated: 2025-12-11
dependencies:
  - guidelines/typescript-codingguideline.md
---

# React Coding Guidelines

This guideline merges **INFORM project standards** with **React.dev best practices** to provide comprehensive guidelines for React development in enterprise environments.


## ⚠️ Base Guidelines Required

**IMPORTANT:** This React guideline builds upon the base TypeScript coding standards.

**Before reviewing React code, you MUST also read:**
- `.claude/guidelines/typescript-codingguideline.md` for:
  - TypeScript type safety rules
  - Function and class structure
  - Error handling patterns
  - JSDoc documentation requirements
  - General code quality standards
  - Import organization basics

This React guideline focuses on **React-specific patterns only** and does not repeat TypeScript base rules.


## Priority Rules (Automated Code Review Focus)

These critical rules **MUST** be checked during code reviews. Violations **MUST** be rejected.

| Priority | Rule | Enforcement |
|----------|------|------------|
| 🔴 CRITICAL | Component folder structure (own folder per component) | **MANDATORY** - Zero exceptions |
| 🔴 CRITICAL | CSS Modules required (.module.scss - NOT .module.css) | **MANDATORY** - .scss only |
| 🔴 CRITICAL | TSX and SCSS files must be separated | **MANDATORY** - Co-located in folder |
| 🔴 CRITICAL | Use function declarations (NOT React.FC) | **MANDATORY** - Exception to TypeScript arrow rule |
| 🔴 CRITICAL | Hooks Rules violations (conditional hooks, missing deps) | **MANDATORY** - Blocks merge |
| 🟠 HIGH | Missing accessibility attributes | Highly recommended |
| 🟠 HIGH | Performance anti-patterns (expensive re-renders) | Highly recommended |
| 🟡 MEDIUM | Missing TypeScript types for props | Recommended |
| 🟡 MEDIUM | Incorrect import order | Recommended |

## Quick Reference

| Scenario | Pattern | File Structure | Example |
|----------|---------|----------------|---------|
| New Component | **Own folder + CSS Module** (MANDATORY) | `ComponentName/ComponentName.tsx` + `ComponentName.module.scss` | `Button/Button.tsx` |
| Page Component | In `/pages` with own folder | `PageName/PageName.tsx` + `PageName.module.scss` | `Dashboard/Dashboard.tsx` |
| Shared Component | In `/components/common/` with own folder | `common/ComponentName/ComponentName.tsx` | `common/LoadingOverlay/LoadingOverlay.tsx` |
| Route Configuration | Centralized config | `/routing/config/routes.config.tsx` | See Routing section |
| Store Feature | Feature-based slice | `/store/featureName/` | `store/app/appSlice.ts` |

## Core Rules

### INFORM Project Standards (MANDATORY)

#### Component Definition Pattern

⚠️ **CRITICAL EXCEPTION TO TYPESCRIPT ARROW FUNCTION RULE**

React components are the **ONE EXCEPTION** to the TypeScript arrow function rule. Following modern React best practices (React.dev), components **MUST** use function declarations, **NOT** `React.FC` with arrow functions.

**✅ REQUIRED: Function Declaration**
```tsx
// ✅ Correct - Function declaration (Modern React best practice)
interface ButtonProps {
  children: React.ReactNode;
  variant: 'primary' | 'secondary';
}

export function Button({ children, variant }: ButtonProps) {
  return (
    <button className={variant}>
      {children}
    </button>
  );
}

// ✅ Correct - Function declaration with default props
interface CardProps {
  title: string;
  children?: React.ReactNode;
}

export function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

**❌ FORBIDDEN: React.FC with Arrow Functions**
```tsx
// ❌ WRONG - React.FC with arrow function (outdated pattern)
export const Button: React.FC<ButtonProps> = ({ children, variant }) => {
  return (
    <button className={variant}>
      {children}
    </button>
  );
};

// ❌ WRONG - Arrow function without React.FC
export const Button = ({ children, variant }: ButtonProps) => {
  return (
    <button className={variant}>
      {children}
    </button>
  );
};
```

**Why Function Declarations?**

1. **React.dev Recommendation**: Official React documentation now recommends function declarations
2. **Better TypeScript Inference**: Function declarations have cleaner type inference for props without type wrapper
3. **No Implicit Children**: `React.FC` historically included `children` automatically, causing confusion about prop requirements
4. **Better Debugging**: Named function declarations show up clearly in React DevTools and stack traces
5. **Simpler Syntax**: Less boilerplate, more readable
6. **Modern Standard**: Industry has moved away from `React.FC` as unnecessary abstraction

**MANDATORY RULES:**
- **Use function declarations** - `export function ComponentName() {}`
- **Define props interface separately** - Clear, explicit props typing
- **No React.FC type** - Avoid the legacy type wrapper
- **Exception to arrow rule** - This is the ONLY place where function declarations are preferred over arrows

#### Component Structure

⚠️ **NON-NEGOTIABLE REQUIREMENT**

Every component **MUST** have its own dedicated folder. This is a **MANDATORY architectural rule with ZERO exceptions**. Code reviews **MUST REJECT** any PR that violates this structure.

**Critical:** Do NOT create empty folders for planned features. Only create component folders when implementing them.

**✅ REQUIRED:**
```
src/components/Button/Button.tsx              ← Component in own folder
src/components/Button/Button.module.scss      ← Styles co-located
```

**❌ FORBIDDEN:**
```
src/components/Button.tsx                     ← WRONG: No folder
src/components/Button.css                     ← WRONG: No CSS Modules
src/components/Button.module.css              ← WRONG: .css not .scss
```

**MANDATORY RULES:**
- **Every component must have its own folder** - NON-NEGOTIABLE
- **TSX and SCSS files must be separated** - Both in component folder
- **Use CSS Modules exclusively** (.module.scss only - NOT .module.css)
- **Test files live in the same folder** (.test.tsx or .spec.tsx)
- **File naming: PascalCase for component files**

**Flat structures are FORBIDDEN and will be rejected in code review.**

```
src/components/
├── common/
│   └── LoadingOverlay/                       ← Own folder: REQUIRED
│       ├── LoadingOverlay.tsx                ← TSX file
│       ├── LoadingOverlay.module.scss        ← SCSS Module (not .css)
│       └── LoadingOverlay.test.tsx           ← Tests co-located
└── subpages/
    └── Dashboard/                            ← Own folder: REQUIRED
        ├── Dashboard.tsx
        ├── Dashboard.module.scss
        └── DashboardStats/                   ← Nested component also own folder
            ├── DashboardStats.tsx
            └── DashboardStats.module.scss
```

#### CSS Modules Requirements

**MANDATORY: Use .module.scss (NOT .module.css)**

- **Always use CSS Modules** with `.module.scss` extension (REQUIRED)
- **Import styles as default**: `import styles from './Component.module.scss'`
- **Use camelCase in TypeScript**: `className={styles.componentName}`
- **Component wrapper pattern**: Wrap global selectors within a component class
- **File extension must be `.scss`** - `.css` is FORBIDDEN

```tsx
// ✅ Correct - Component with CSS Modules (.module.scss)
import styles from './Button.module.scss';  // ← .scss extension REQUIRED

export function Button({ children, variant }: ButtonProps) {
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {children}
    </button>
  );
}
```

```scss
// Button.module.scss
.button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;

  // Global selectors scoped within component wrapper
  elvt-icon {
    --icon-size: 1rem;
  }
}

.primary {
  background-color: blue;
  color: white;
}

.secondary {
  background-color: gray;
  color: black;
}
```

```tsx
// ❌ FORBIDDEN - Multiple violations
import styles from './Button.module.css';  // ❌ WRONG: .css not .scss
import './Button.css';                     // ❌ WRONG: not CSS Modules
import './styles.scss';                    // ❌ WRONG: not CSS Modules

export const Button = () => {
  return <button className="button">Click</button>;  // ❌ WRONG: string class names
};
```

#### Routing Structure
- **Dedicated `/routing` folder** for all routing logic
- **Centralized route configuration** in `routing/config/routes.config.tsx`
- **Guards for auth/guest protection** in `routing/guards/`
- **Layout components** in `routing/components/`

```typescript
// routing/config/routes.config.tsx
import { RouteConfig } from '../../interfaces/RouteConfig';
import AuthGuard from '../guards/AuthGuard';
import GuestGuard from '../guards/GuestGuard';

export const routeConfig: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    guard: 'auth',
    showHeader: true,
    showLeftSidebar: true,
  },
  {
    path: '/landing',
    element: <Landing />,
    guard: 'guest',
    showHeader: false,
  },
];

export const getGuardComponent = (guardType: string | undefined) => {
  switch (guardType) {
    case 'auth':
      return AuthGuard;
    case 'guest':
      return GuestGuard;
    default:
      return null;
  }
};
```

```tsx
// routing/guards/AuthGuard.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

function AuthGuard() {
  const isAuthenticated = useSelector((state: RootState) => state.app.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return <Outlet />;
}

export default AuthGuard;
```

#### Store Structure (Redux Toolkit)
- **Feature-based organization**: Each feature has its own folder in `/store`
- **RTK Query for API calls**: Separate API slices
- **Barrel exports**: Use index.ts for clean imports
- **Selectors in separate files**: `featureSelectors.ts`

```
src/store/
├── api/
│   ├── baseApi.ts          # RTK Query base configuration
│   ├── agentApi.ts          # Feature-specific API
│   ├── analyticsApi.ts
│   └── index.ts             # Barrel export
├── app/
│   ├── appSlice.ts          # Slice with reducers
│   ├── appTypes.ts          # TypeScript types
│   ├── appSelectors.ts      # Reselect selectors
│   ├── appStorage.ts        # Persistence logic
│   ├── app.test.ts          # Tests
│   └── index.ts             # Barrel export
├── dashboard/
│   ├── dashboardSlice.ts
│   ├── dashboardTypes.ts
│   ├── dashboardSelectors.ts
│   └── index.ts
├── middleware/
│   └── sessionStorageMiddleware.ts
└── store.ts                 # Root store factory
```

```typescript
// store/app/appSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from '../../interfaces/Types';
import { initialAppState } from './appTypes';

const appSlice = createSlice({
  name: 'app',
  initialState: initialAppState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
  },
});

export const { setTheme, setIsAuthenticated } = appSlice.actions;
export default appSlice.reducer;
```

```typescript
// store/app/index.ts - Barrel export
export { default as appReducer } from './appSlice';
export * from './appSlice';
export * from './appSelectors';
export * from './appTypes';
export * from './appStorage';
```

#### ELEVATE Design System Integration
- **Wrap app with ElvtApplication** for theming
- **Use ELEVATE components** over custom implementations
- **Import React wrappers**: `from '@inform-elevate/elevate-core-ui/dist/react'`
- **Use design tokens** for styling

```tsx
// App.tsx
import { ElvtApplication } from '@inform-elevate/elevate-core-ui/dist/react';
import '@inform-elevate/elevate-core-ui/dist/elevate.css';
import '@inform-elevate/elevate-core-ui/dist/themes/light.css';
import '@inform-elevate/elevate-core-ui/dist/themes/dark.css';

export function App() {
  const theme = useSelector((state: RootState) => state.app.theme);

  return (
    <ElvtApplication theme={theme}>
      {/* Your app content */}
    </ElvtApplication>
  );
}
```

```tsx
// Using ELEVATE components
import { ElvtButton, ElvtCard, ElvtStack } from '@inform-elevate/elevate-core-ui/dist/react';

export function Dashboard() {
  return (
    <ElvtCard padding="m">
      <ElvtStack direction="column" gap="s">
        <ElvtButton tone="primary" onClick={handleSave}>
          Save
        </ElvtButton>
      </ElvtStack>
    </ElvtCard>
  );
}
```

#### Import Organization (React-Specific Extensions)

React projects extend the base TypeScript import organization (see `typescript-codingguideline.md`) with these React-specific additions:

```typescript
// Follow base TypeScript import order, with React-specific extensions:

// 1. React imports (first)
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Third-party imports (alphabetically)
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';

// 3. ELEVATE imports (INFORM-specific)
import { ElvtButton, ElvtCard } from '@inform-elevate/elevate-core-ui/dist/react';

// 4-7. Local imports (as per TypeScript guideline)
// ... (Components, Utilities, Store, Types)

// 8. Styles (always last in React projects)
import styles from './Dashboard.module.scss';
```

**Key React-specific rules:**
- React imports always first
- ELEVATE design system imports grouped together
- CSS Module imports always last

### React Best Practices (RECOMMENDED)

#### Component Patterns

##### React Component Pattern
```tsx
// ✅ React component with proper typing
interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
  // Early return pattern
  if (!isLoading) return null;

  return (
    <div className={styles.overlay}>
      <ElvtProgress indeterminate={true} />
      {message && <span>{message}</span>}
    </div>
  );
}
```

##### React Props Pattern
```tsx
// ✅ React-specific prop types
interface ButtonProps {
  children: React.ReactNode;  // React node type
  variant?: 'primary' | 'secondary' | 'danger';
  onClick?: () => void;  // Event handler
  disabled?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled = false
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

#### Hooks Rules (CRITICAL)

##### Rule 1: Only Call Hooks at Top Level
```tsx
// ✅ Correct - Hooks at top level
export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Hooks are called in the same order every render
  useEffect(() => {
    fetchUser();
  }, []);

  return <div>{user?.name}</div>;
}
```

```tsx
// ❌ Incorrect - Conditional hook
export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);

  if (user) {
    // WRONG: Hook called conditionally
    const { t } = useTranslation();
  }

  return <div>{user?.name}</div>;
}

// ❌ Incorrect - Hook in loop
export function UserList({ users }: { users: User[] }) {
  users.forEach(user => {
    // WRONG: Hook called in loop
    const [selected, setSelected] = useState(false);
  });

  return <div>...</div>;
}
```

##### Rule 2: Dependencies Arrays
```tsx
// ✅ Correct - All dependencies listed
export function DataFetcher({ userId }: { userId: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await apiService.getUser(userId);
      setData(result);
    };

    void fetchData();
  }, [userId]); // userId listed as dependency

  return <div>{data?.name}</div>;
}
```

```tsx
// ❌ Incorrect - Missing dependencies
export function DataFetcher({ userId }: { userId: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const result = await apiService.getUser(userId); // Uses userId
      setData(result);
    };

    void fetchData();
  }, []); // WRONG: userId not in dependencies

  return <div>{data?.name}</div>;
}
```

##### Rule 3: Custom Hooks for Reusable Logic
```tsx
// ✅ Good - Custom hook for reusable logic
export const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const data = await apiService.getUser(userId);
        setUser(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    void fetchUser();
  }, [userId]);

  return { user, loading, error };
};

// Usage
export function UserProfile() {
  const { user, loading, error } = useUserData('123');

  if (loading) return <LoadingOverlay isLoading={true} />;
  if (error) return <ErrorCard error={error} />;
  return <div>{user?.name}</div>;
}
```

#### Hook Organization Pattern
```tsx
// ✅ Good - Hooks organized by category with comments
export function Dashboard() {
  // React hooks
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const navigate = useNavigate();

  // Third-party hooks
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Redux hooks
  const theme = useSelector((state: RootState) => state.app.theme);
  const user = useSelector((state: RootState) => state.app.user);

  // Custom hooks
  const { data, loading, error } = useAnalyticsData(selectedDate);

  // Effects
  useEffect(() => {
    // Component mount logic
  }, []);

  // Event handlers
  const handleDateChange = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      await saveData();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    // JSX
  );
}
```

#### Performance Optimization

##### useMemo (Only When Needed)
```tsx
// ✅ Good - useMemo for expensive calculations
export function DataTable({ data }: { data: DataItem[] }) {
  // Expensive computation that should be memoized
  const sortedAndFilteredData = useMemo(() => {
    return data
      .filter(item => item.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  return <Table data={sortedAndFilteredData} />;
}
```

```tsx
// ❌ Avoid - Unnecessary useMemo
export function SimpleComponent({ count }: { count: number }) {
  // WRONG: Simple calculation doesn't need memoization
  const doubled = useMemo(() => count * 2, [count]);

  return <div>{doubled}</div>;
}
```

##### useCallback (Only When Needed)
```tsx
// ✅ Good - useCallback for functions passed to memoized children
const MemoizedChild = React.memo<{ onClick: () => void }>(({ onClick }) => {
  return <button onClick={onClick}>Click</button>;
});

export function Parent() {
  const [count, setCount] = useState(0);

  // Callback needs to be stable to prevent MemoizedChild re-renders
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <MemoizedChild onClick={handleClick} />;
}
```

```tsx
// ❌ Avoid - Unnecessary useCallback
export function SimpleComponent() {
  const [count, setCount] = useState(0);

  // WRONG: useCallback without memoized children is overhead
  const handleClick = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return <button onClick={handleClick}>Count: {count}</button>;
}
```

##### React.memo (For Expensive Components)
```tsx
// ✅ Good - Memo for component that re-renders often but props rarely change
export const ExpensiveChart = React.memo<{ data: ChartData[] }>(({ data }) => {
  // Expensive rendering logic
  return <div>{/* Complex chart rendering */}</div>;
});

// ✅ Good - Custom comparison function
export const UserCard = React.memo<UserCardProps>(
  ({ user }) => {
    return <div>{user.name}</div>;
  },
  (prevProps, nextProps) => {
    // Only re-render if user.id changes
    return prevProps.user.id === nextProps.user.id;
  }
);
```

#### State Management Decisions

##### When to Use Local State
```tsx
// ✅ Good - Local state for component-specific UI
export function SearchInput() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
}
```

##### When to Use Redux
```tsx
// ✅ Good - Redux for global/shared state
export function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.app.theme);

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  return (
    <ElvtSwitch
      checked={theme === 'dark'}
      onChange={handleToggle}
    />
  );
}
```

##### When to Use Context
```tsx
// ✅ Good - Context for dependency injection or theme
import { createContext, useContext } from 'react';

interface AppDependencies {
  fusionApp: FusionApp;
  logger: Logger;
}

const DependenciesContext = createContext<AppDependencies | null>(null);

export const useDependencies = () => {
  const context = useContext(DependenciesContext);
  if (!context) {
    throw new Error('useDependencies must be used within DependenciesProvider');
  }
  return context;
};

// Usage
export function SomeComponent() {
  const { fusionApp, logger } = useDependencies();
  // ...
}
```

#### Event Handler Naming
```tsx
// ✅ Good - Use 'handle' prefix for event handlers
export function Form() {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // ...
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    // ...
  };

  const handleButtonClick = () => {
    // ...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleInputChange} />
      <button onClick={handleButtonClick}>Submit</button>
    </form>
  );
}
```

#### Async Operations
```tsx
// ✅ Good - Proper async handling with void for fire-and-forget
export function UserActions() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    // Fire-and-forget async operation
    void dispatch(logoutUser());
  };

  const handleSave = async () => {
    // Async with error handling
    try {
      await saveData();
      showSuccessMessage();
    } catch (error) {
      console.error('Save failed:', error);
      showErrorMessage();
    }
  };

  return (
    <>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => void handleSave()}>Save</button>
    </>
  );
}
```

#### Conditional Rendering Patterns
```tsx
// ✅ Good - Early returns for conditional rendering
export function ConditionalComponent({ data }: { data: Data | null }) {
  if (!data) return null;
  if (data.error) return <ErrorCard error={data.error} />;
  if (data.loading) return <LoadingOverlay isLoading={true} />;

  return <div>{data.content}</div>;
}

// ✅ Good - Short-circuit for optional elements
export function Header({ showLogo }: { showLogo?: boolean }) {
  return (
    <header>
      {showLogo && <Logo />}
      <Navigation />
    </header>
  );
}

// ✅ Good - Ternary for either/or
export function Status({ isActive }: { isActive: boolean }) {
  return (
    <div>
      {isActive ? <ActiveBadge /> : <InactiveBadge />}
    </div>
  );
}
```

#### Fragment Usage
```tsx
// ✅ Good - Fragment for multiple elements
export function MultiElement() {
  return (
    <>
      <Header />
      <Main />
      <Footer />
    </>
  );
}

// ✅ Good - Keyed fragments in lists
export function ItemList({ items }: { items: Item[] }) {
  return (
    <div>
      {items.map(item => (
        <React.Fragment key={item.id}>
          <ItemHeader item={item} />
          <ItemBody item={item} />
        </React.Fragment>
      ))}
    </div>
  );
}
```

### Accessibility (a11y)

#### Semantic HTML
```tsx
// ✅ Good - Semantic HTML elements
export function Article() {
  return (
    <article>
      <header>
        <h1>Title</h1>
      </header>
      <section>
        <p>Content</p>
      </section>
      <footer>
        <time dateTime="2024-01-01">January 1, 2024</time>
      </footer>
    </article>
  );
}
```

```tsx
// ❌ Avoid - Div soup
export function Article() {
  return (
    <div>
      <div>
        <div>Title</div>
      </div>
      <div>
        <div>Content</div>
      </div>
    </div>
  );
}
```

#### ARIA Attributes
```tsx
// ✅ Good - Proper ARIA attributes
export function Menu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="menu-dropdown"
        onClick={() => setIsOpen(!isOpen)}
      >
        Menu
      </button>
      {isOpen && (
        <ul id="menu-dropdown" role="menu">
          <li role="menuitem">
            <a href="/profile">Profile</a>
          </li>
          <li role="menuitem">
            <a href="/settings">Settings</a>
          </li>
        </ul>
      )}
    </>
  );
}
```

#### Keyboard Navigation
```tsx
// ✅ Good - Keyboard support
export function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Modal Title</h2>
      <button onClick={onClose} aria-label="Close modal">×</button>
    </div>
  );
}
```

### Error Boundaries

```tsx
// ✅ Good - Error boundary for error handling
import { Component, ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h1>Something went wrong</h1>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
export function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

## Testing

### Test Organization
- **Tests live in the same folder as component**
- **File naming: ComponentName.test.tsx**
- **Use Vitest (not Jest) in this project**

```
src/components/common/LoadingOverlay/
├── LoadingOverlay.tsx
├── LoadingOverlay.module.scss
└── LoadingOverlay.test.tsx
```

### Test Patterns
```tsx
// LoadingOverlay.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  it('should render when isLoading is true', () => {
    render(<LoadingOverlay isLoading={true} />);
    expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
  });

  it('should not render when isLoading is false', () => {
    render(<LoadingOverlay isLoading={false} />);
    expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
  });
});
```

## Common Anti-Patterns to Avoid

### ❌ Mutating State Directly
```tsx
// ❌ Incorrect
const [items, setItems] = useState([]);
items.push(newItem); // WRONG: Direct mutation

// ✅ Correct
const [items, setItems] = useState([]);
setItems([...items, newItem]); // Correct: New array
```

### ❌ Forgetting Keys in Lists
```tsx
// ❌ Incorrect
{items.map(item => <div>{item.name}</div>)}

// ✅ Correct
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

### ❌ Using Index as Key
```tsx
// ❌ Incorrect (unless list is static and never reordered)
{items.map((item, index) => <div key={index}>{item.name}</div>)}

// ✅ Correct
{items.map(item => <div key={item.id}>{item.name}</div>)}
```

### ❌ Props Drilling
```tsx
// ❌ Incorrect - Passing props through many layers
<Parent>
  <ChildA userData={user}>
    <ChildB userData={user}>
      <ChildC userData={user} /> {/* Finally used here */}
    </ChildB>
  </ChildA>
</Parent>

// ✅ Correct - Use Context or Redux
const UserContext = createContext<User | null>(null);

// In parent
<UserContext.Provider value={user}>
  <ChildA>
    <ChildB>
      <ChildC /> {/* Gets user from context */}
    </ChildB>
  </ChildA>
</UserContext.Provider>
```

## METRICS TRACKING

**This template has `track_metrics: true` in frontmatter.**

You MUST track and display execution metrics at the end of this execution.

See `shared/metrics-instructions.md` for complete tracking instructions and format.