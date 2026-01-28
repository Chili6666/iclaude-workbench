import { useState, useEffect } from 'react';

import { Task } from '../interfaces/Task';
import { Plan } from '../interfaces/Plan';
import { WorkspaceFolder } from '../interfaces/WorkspaceFolder';
import { VSCodeApi } from '../interfaces/VSCodeApi';
import { Swimlane } from '../components/Swimlane/Swimlane';
import { PlanView } from '../components/PlanView/PlanView';
import styles from './App.module.css';

type TabType = 'tasks' | 'plans';

declare function acquireVsCodeApi(): VSCodeApi;

// Get VS Code API (only available when running in webview)
const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

// Restore persisted state
function getPersistedState(): { activeTab?: TabType; selectedFolderPath?: string } {
  if (vscode) {
    const state = vscode.getState() as { activeTab?: TabType; selectedFolderPath?: string } | undefined;
    return state || {};
  }
  return {};
}

/**
 * Main App component for the iClaude Workbench.
 * Displays a Kanban-style task board with three swimlanes: Pending, In Progress, and Completed.
 */
export function App() {
  const persistedState = getPersistedState();
  const [activeTab, setActiveTab] = useState<TabType>(persistedState.activeTab || 'tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planSearchQuery, setPlanSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [workspaceFolders, setWorkspaceFolders] = useState<WorkspaceFolder[]>([]);
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>(persistedState.selectedFolderPath || '');

  useEffect(() => {
    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'tasksUpdated') {
        setTasks(message.tasks || []);
        setLoading(false);
      } else if (message.type === 'plansUpdated') {
        setPlans(message.plans || []);
        setPlansLoading(false);
      } else if (message.type === 'workspaceFoldersUpdated') {
        setWorkspaceFolders(message.workspaceFolders || []);
      }
    };

    window.addEventListener('message', handleMessage);

    // Request initial data from extension
    if (vscode) {
      vscode.postMessage({ type: 'requestTasks' });
      vscode.postMessage({ type: 'requestPlans' });
      vscode.postMessage({ type: 'requestWorkspaceFolders' });
    } else {
      // Not running in VS Code webview (dev mode)
      setLoading(false);
      setPlansLoading(false);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleOpenFile = (filePath: string) => {
    if (vscode) {
      vscode.postMessage({ type: 'openTaskFile', filePath });
    }
  };

  const handleOpenPlanFile = (filePath: string) => {
    if (vscode) {
      vscode.postMessage({ type: 'openPlanFile', filePath });
    }
  };

  const handleCopyPlan = (filePath: string) => {
    if (vscode) {
      vscode.postMessage({ type: 'copyPlanToProject', sourcePath: filePath });
    }
  };

  const handleDropPlan = (sourcePath: string, targetFolderPath: string) => {
    if (vscode) {
      vscode.postMessage({ type: 'copyPlanToFolder', sourcePath, targetFolderPath });
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (vscode) {
      vscode.setState({ ...vscode.getState(), activeTab: tab });

      // Request workspace folders when switching to Plans tab
      if (tab === 'plans') {
        vscode.postMessage({ type: 'requestWorkspaceFolders' });
      }
    }
  };

  const handleFolderChange = (folderPath: string) => {
    setSelectedFolderPath(folderPath);
    if (vscode) {
      vscode.setState({ ...vscode.getState(), selectedFolderPath: folderPath });
    }
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerIcon}></div>
        <h1 className={styles.headerTitle}>iClaude Workbench</h1>
        <div className={styles.headerActions}></div>
      </header>

      <nav className={styles.tabBar}>
        <div
          className={`${styles.tabBarTab} ${activeTab === 'tasks' ? styles.tabBarTabActive : ''}`}
          onClick={() => handleTabChange('tasks')}
          role="tab"
          aria-selected={activeTab === 'tasks'}
        >
          Tasks
        </div>
        <div
          className={`${styles.tabBarTab} ${activeTab === 'plans' ? styles.tabBarTabActive : ''}`}
          onClick={() => handleTabChange('plans')}
          role="tab"
          aria-selected={activeTab === 'plans'}
        >
          Plans
        </div>
      </nav>

      <main className={activeTab === 'tasks' ? styles.swimlanes : styles.planContainer}>
        {activeTab === 'tasks' ? (
          loading ? (
            <div className={styles.loading}>Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className={styles.emptyState}>No tasks found in ~/.claude/tasks</div>
          ) : (
            <>
              <Swimlane title="Pending" status="pending" tasks={tasks} onOpenFile={handleOpenFile} />
              <Swimlane
                title="In Progress"
                status="in_progress"
                tasks={tasks}
                onOpenFile={handleOpenFile}
              />
              <Swimlane
                title="Completed"
                status="completed"
                tasks={tasks}
                onOpenFile={handleOpenFile}
              />
            </>
          )
        ) : plansLoading ? (
          <div className={styles.loading}>Loading plans...</div>
        ) : (
          <PlanView
            plans={plans}
            selectedPlanId={selectedPlanId}
            searchQuery={planSearchQuery}
            onSearchChange={setPlanSearchQuery}
            onSelectPlan={setSelectedPlanId}
            onOpenFile={handleOpenPlanFile}
            onCopyPlan={handleCopyPlan}
            workspaceFolders={workspaceFolders}
            onDropPlan={handleDropPlan}
            selectedFolderPath={selectedFolderPath}
            onFolderChange={handleFolderChange}
          />
        )}
      </main>
    </div>
  );
}

export default App;
