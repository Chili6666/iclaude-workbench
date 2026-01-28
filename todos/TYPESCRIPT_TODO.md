# TypeScript Quality TODO Report

**Generated**: 2026-01-28 14:30
**Git Branch**: main
**Last Commit**: 7df88ba Merge pull request #12 from Chili6666/chore/cleanup-docs
**Guideline**: .claude/guidelines/typescript-codingguideline.md
**Framework**: typescript
**Lint Command**: npm run lint
**Build Command**: npm run build

---

## Todo Checklist

### HIGH/CRITICAL Priority

- [x] Replace `function` keyword with arrow functions in activate/deactivate (src/extension.ts:5,28) - 10 min
- [x] Extract Task interface and TaskStatus type to separate files (src/services/TaskService.ts:6-20) - 15 min
- [x] Add JSDoc documentation to TaskBoardPanel class and public members (src/panels/TaskBoardPanel.ts:4,5,65,85) - 15 min
- [x] Add JSDoc documentation to TaskBoardViewProvider class and public members (src/panels/TaskBoardViewProvider.ts:4,5,21,102) - 15 min
- [x] Add JSDoc documentation to TaskService class and public members (src/services/TaskService.ts:22,25,34,105,181,185) - 20 min
- [x] Convert React components from `function` keyword to arrow functions (webview/src/App/App.tsx:18,30) - 10 min
- [x] Convert React components from `function` keyword to arrow functions (webview/src/components/Swimlane/Swimlane.tsx:16) - 5 min
- [x] Convert React components from `function` keyword to arrow functions (webview/src/components/TaskCard/TaskCard.tsx:13) - 5 min
- [x] Convert React components from `function` keyword to arrow functions (webview/src/components/PlanView/PlanView.tsx:21) - 5 min
- [x] Convert React components from `function` keyword to arrow functions (webview/src/components/PlanSidebar/PlanSidebar.tsx:17) - 5 min
- [x] Convert React components from `function` keyword to arrow functions (webview/src/components/PlanContentViewer/PlanContentViewer.tsx:14) - 5 min
- [x] Convert React components from `function` keyword to arrow functions (webview/src/components/PlanListItem/PlanListItem.tsx:15) - 5 min
- [x] Convert React components from `function` keyword to arrow functions (webview/src/components/VerticalSplitter/VerticalSplitter.tsx:13) - 5 min
- [x] Convert static getInstance method to arrow function (src/services/TaskService.ts:34) - 5 min
- [x] Convert static getInstance method to arrow function (src/services/PlanService.ts:33) - 5 min
- [x] Add HTML sanitization for dangerouslySetInnerHTML (webview/src/components/PlanContentViewer/PlanContentViewer.tsx:42) - 30 min

**Status: 16/16 completed** - Total Effort: ~30min remaining

### MEDIUM Priority

- [x] Extract inline message type to named interface for type safety (src/panels/TaskBoardPanel.ts:51) - 10 min
- [x] Extract inline message type to named interface for consistency (src/panels/TaskBoardViewProvider.ts:65) - 10 min
- [x] Define DEBOUNCE_DELAY_MS constant instead of magic number 100 (src/services/TaskService.ts:90) - 5 min
- [ ] Add JSDoc documentation to Task interface (src/interfaces/Task.ts:1-15) - 10 min
- [ ] Add JSDoc documentation to Plan interface using @property format (src/interfaces/Plan.ts:1-7) - 10 min
- [ ] Add JSDoc documentation to webview Task interface (webview/src/interfaces/Task.ts:1-14) - 10 min
- [ ] Add JSDoc documentation to webview Plan interface using @property format (webview/src/interfaces/Plan.ts:1-7) - 10 min
- [ ] Add JSDoc documentation to VSCodeApi interface (webview/src/interfaces/VSCodeApi.ts:1-5) - 5 min
- [ ] Remove console.log statements from production code (src/extension.ts:6,29) - 5 min
- [ ] Remove console.log/warn/error statements from TaskService (src/services/TaskService.ts:65,76,146,165,189) - 10 min
- [ ] Remove console.log/warn/error statements from PlanService (src/services/PlanService.ts:59,113,136) - 10 min
- [ ] Extract duplicated code between TaskBoardPanel and TaskBoardViewProvider (src/panels/TaskBoardPanel.ts, src/panels/TaskBoardViewProvider.ts) - 45 min

**Status: 3/12 completed** - Total Effort: ~1h 55min remaining

### LOW Priority

- [ ] Convert WebviewMessage interface to discriminated union for better type safety (src/interfaces/WebviewMessage.ts:7-16) - 20 min
- [ ] Add runtime validation for vscode.getState() return value (webview/src/App/App.tsx:91) - 15 min
- [ ] Consider using React refs instead of previousElementSibling DOM access (webview/src/components/VerticalSplitter/VerticalSplitter.tsx:27-29) - 20 min
- [ ] Consolidate multiple loading states into single state object (webview/src/App/App.tsx:33-38) - 15 min

**Status: 0/4 completed** - Total Effort: ~1h 10min remaining

---

**Note**: Detailed information for each improvement item can be found in `TYPESCRIPT_IMPROVEMENTS.md`
