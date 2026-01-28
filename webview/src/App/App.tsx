import { useState, useEffect } from 'react';

import { Task } from '../interfaces/Task';
import { VSCodeApi } from '../interfaces/VSCodeApi';
import { Swimlane } from '../components/Swimlane/Swimlane';
import styles from './App.module.css';

declare function acquireVsCodeApi(): VSCodeApi;

// Get VS Code API (only available when running in webview)
const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

/**
 * Main App component for the iClaude Workbench.
 * Displays a Kanban-style task board with three swimlanes: Pending, In Progress, and Completed.
 */
export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'tasksUpdated') {
        setTasks(message.tasks || []);
        setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);

    // Request initial tasks from extension
    if (vscode) {
      vscode.postMessage({ type: 'requestTasks' });
    } else {
      // Not running in VS Code webview (dev mode)
      setLoading(false);
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

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.headerIcon}></div>
        <h1 className={styles.headerTitle}>iClaude Workbench</h1>
        <div className={styles.headerActions}></div>
      </header>

      <nav className={styles.tabBar}>
        <div className={`${styles.tabBarTab} ${styles.tabBarTabActive}`}>Tasks</div>
        <div className={styles.tabBarTab}>Plans</div>
      </nav>

      <main className={styles.swimlanes}>
        {loading ? (
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
        )}
      </main>
    </div>
  );
}

export default App;
