# React Quality Improvement Report

**Generated**: 2026-01-28 12:30
**Git Branch**: main
**Last Commit**: 7df88ba Merge pull request #12 from Chili6666/chore/cleanup-docs
**Guideline**: .claude/guidelines/react-codingguideline.md
**Framework**: react
**Lint Command**: npm run lint && cd webview && npm run lint
**Build Command**: npm run build

---

## Critical Issues (HIGH/CRITICAL Priority - 3 items)

### 1. CSS Module Files Using Wrong Extension

**File(s)**:
- webview/src/App/App.module.css
- webview/src/components/Swimlane/Swimlane.module.css
- webview/src/components/TaskCard/TaskCard.module.css
- webview/src/components/VerticalSplitter/VerticalSplitter.module.css
- webview/src/components/PlanContentViewer/PlanContentViewer.module.css
- webview/src/components/PlanSidebar/PlanSidebar.module.css
- webview/src/components/PlanView/PlanView.module.css
- webview/src/components/PlanListItem/PlanListItem.module.css

**Effort**: 20 min
**Impact**: Coding Guideline Violation

**Description**: All CSS Module files use `.module.css` extension instead of the required `.module.scss` extension per project coding guidelines.

**Current Implementation**: Files named with `.module.css` extension.

**Recommendation**: Rename all files to use `.module.scss` extension and update imports accordingly.

**Benefits**:
- Compliance with project coding standards
- Enables SCSS features (variables, nesting, mixins) if needed in future

---

### 2. Function Declaration Used for Non-Component Utility

**File(s)**: webview/src/App/App.tsx:18-24
**Effort**: 5 min
**Impact**: Coding Guideline Violation

**Description**: The `getPersistedState` utility function uses the `function` keyword instead of an arrow function. Per TypeScript coding guidelines, only React components should use function declarations.

**Current Implementation**:
```tsx
function getPersistedState(): { activeTab?: TabType } {
  if (vscode) {
    const state = vscode.getState() as { activeTab?: TabType } | undefined;
    return state || {};
  }
  return {};
}
```

**Recommendation**: Convert to arrow function:
```tsx
const getPersistedState = (): { activeTab?: TabType } => {
  if (vscode) {
    const state = vscode.getState() as { activeTab?: TabType } | undefined;
    return state || {};
  }
  return {};
};
```

**Benefits**:
- Consistency with project coding standards
- Clear distinction between components (function declarations) and utilities (arrow functions)

---

### 3. XSS Vulnerability with dangerouslySetInnerHTML

**File(s)**: webview/src/components/PlanContentViewer/PlanContentViewer.tsx:40-43
**Effort**: 30 min
**Impact**: Security

**Description**: The component renders markdown content using `dangerouslySetInnerHTML` without sanitization. The `marked` library parses markdown which could contain embedded HTML/JavaScript, creating a potential XSS vulnerability.

**Current Implementation**:
```tsx
<div
  className={styles.content}
  dangerouslySetInnerHTML={{ __html: renderedContent }}
/>
```

**Recommendation**: Install and use DOMPurify to sanitize HTML:
```tsx
import DOMPurify from 'dompurify';

const renderedContent = useMemo(() => {
  if (!plan) return '';
  const html = marked.parse(plan.content, { async: false }) as string;
  return DOMPurify.sanitize(html);
}, [plan]);
```

**Benefits**:
- Protection against XSS attacks
- Safe rendering of user-provided markdown content

---

## Important Improvements (MEDIUM Priority - 4 items)

### 1. Missing Keyboard Navigation for Tabs

**File(s)**: webview/src/App/App.tsx:103-120
**Effort**: 15 min
**Impact**: Accessibility

**Description**: Tab elements have `role="tab"` but lack keyboard navigation support. Users cannot navigate tabs using keyboard (arrow keys, Enter/Space).

**Current Implementation**: Tabs only respond to click events.

**Recommendation**:
- Add `tabIndex={0}` to tab elements
- Add `onKeyDown` handler for Enter/Space key activation
- Add `role="tablist"` to parent nav element

```tsx
<nav className={styles.tabBar} role="tablist">
  <div
    className={`${styles.tabBarTab} ${activeTab === 'tasks' ? styles.tabBarTabActive : ''}`}
    onClick={() => handleTabChange('tasks')}
    role="tab"
    tabIndex={0}
    aria-selected={activeTab === 'tasks'}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleTabChange('tasks');
      }
    }}
  >
```

**Benefits**:
- WCAG 2.1 compliance
- Keyboard-only users can navigate the interface

---

### 2. Missing Accessible Label on Search Input

**File(s)**: webview/src/components/PlanSidebar/PlanSidebar.tsx:36-42
**Effort**: 5 min
**Impact**: Accessibility

**Description**: Search input lacks an accessible label. Screen readers may not announce the purpose of the input.

**Recommendation**: Add `aria-label` attribute:
```tsx
<input
  type="text"
  className={styles.searchInput}
  placeholder="Search plans..."
  value={searchQuery}
  onChange={(e) => onSearchChange(e.target.value)}
  aria-label="Search plans"
/>
```

**Benefits**:
- Screen reader users will understand the input's purpose
- Improved accessibility compliance

---

### 3. Missing JSDoc Documentation on Plan Interface

**File(s)**: webview/src/interfaces/Plan.ts:1-7
**Effort**: 10 min
**Impact**: Maintainability

**Description**: The Plan interface has inline comments but lacks proper JSDoc documentation as required by coding guidelines.

**Current Implementation**:
```tsx
export interface Plan {
  id: string;        // Filename without .md extension
  title: string;     // From first H1 heading or filename
  content: string;   // Full markdown content
  filePath: string;  // Absolute path to the file
  modifiedAt: number;// Timestamp for sorting
}
```

**Recommendation**: Add proper JSDoc:
```tsx
/**
 * Represents a plan document in the workbench
 * @property id - Filename without .md extension
 * @property title - From first H1 heading or filename
 * @property content - Full markdown content
 * @property filePath - Absolute path to the file
 * @property modifiedAt - Timestamp for sorting
 */
export interface Plan {
  id: string;
  title: string;
  content: string;
  filePath: string;
  modifiedAt: number;
}
```

**Benefits**:
- Better IDE intellisense
- Improved code documentation

---

### 4. Missing tablist Role on Tab Container

**File(s)**: webview/src/App/App.tsx:103
**Effort**: 5 min
**Impact**: Accessibility

**Description**: The parent navigation element for tabs should have `role="tablist"` to properly announce the tab navigation pattern to screen readers.

**Recommendation**: Add role to nav element:
```tsx
<nav className={styles.tabBar} role="tablist">
```

**Benefits**:
- Proper ARIA landmark for assistive technologies
- Complete tab pattern implementation

---

## Suggestions (LOW Priority - 3 items)

### 1. Memoize Filtered Tasks in Swimlane

**File(s)**: webview/src/components/Swimlane/Swimlane.tsx:17
**Effort**: 10 min
**Impact**: Performance

The `filteredTasks` array is recalculated on every render. For larger task lists, memoizing with `useMemo` would improve performance.

**Recommendation**:
```tsx
const filteredTasks = useMemo(
  () => tasks.filter((t) => t.status === status),
  [tasks, status]
);
```

---

### 2. Memoize Filtered Plans in PlanSidebar

**File(s)**: webview/src/components/PlanSidebar/PlanSidebar.tsx:25-31
**Effort**: 10 min
**Impact**: Performance

The filter operation (including content search) runs on every render. For many plans with large content, this could impact performance.

**Recommendation**: Wrap filter logic in `useMemo`:
```tsx
const filteredPlans = useMemo(
  () => plans.filter((plan) =>
    plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.content.toLowerCase().includes(searchQuery.toLowerCase())
  ),
  [plans, searchQuery]
);
```

---

### 3. Add Keyboard Support for VerticalSplitter

**File(s)**: webview/src/components/VerticalSplitter/VerticalSplitter.tsx:55-62
**Effort**: 30 min
**Impact**: Accessibility

The splitter has `role="separator"` but keyboard-only users cannot resize the panel. Adding keyboard handlers would improve accessibility.

**Recommendation**: Add `tabIndex`, ARIA value attributes, and keyboard handlers for arrow key resizing.

---

## Positive Observations

What was done well in this codebase:

1. **Proper Component Folder Structure**: Each component correctly lives in its own dedicated folder with co-located styles (Swimlane/Swimlane.tsx, TaskCard/TaskCard.tsx, etc.)

2. **Function Declarations for Components**: All React components correctly use function declarations (not arrow functions with React.FC), following modern React best practices.

3. **Well-Defined TypeScript Interfaces**: Props interfaces are properly defined for all components with explicit types and no use of `any`.

4. **Good Accessibility Foundation**: Several components include accessibility attributes (TaskCard has role="button", tabIndex, aria-label, onKeyDown; PlanListItem has similar attributes).

5. **Clean Component Interfaces**: Props interfaces are well-structured and explicit:
```tsx
interface PlanViewProps {
  plans: Plan[];
  selectedPlanId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPlan: (planId: string) => void;
  onOpenFile: (filePath: string) => void;
  onCopyPlan: (filePath: string) => void;
}
```

6. **Proper State Management**: useState hooks are correctly typed and state is properly lifted to App component for cross-component communication.

**Examples of good patterns to maintain:**
- Co-located component files with CSS Modules
- Explicit TypeScript interfaces for all props
- Accessibility attributes on interactive elements
- Clear separation of concerns between components

---

**Report Last Updated:** 2026-01-28
**Total Improvements**: 3 critical, 4 medium priority, 3 low priority suggestions
