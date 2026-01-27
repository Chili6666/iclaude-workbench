import { useState, useEffect } from 'react';
import './main.css';

type TaskStatus = 'pending' | 'in_progress' | 'completed';

interface Task {
  id: string;
  subject: string;
  description?: string;
  status: TaskStatus;
  owner?: string;
  activeForm?: string;
  blockedBy?: string[];
  blocks?: string[];
  sessionId?: string;
  filePath?: string;
}

// VS Code API interface
interface VSCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VSCodeApi;

// Get VS Code API (only available when running in webview)
const vscode = typeof acquireVsCodeApi !== 'undefined' ? acquireVsCodeApi() : null;

function TaskCard({ task, onOpenFile }: { task: Task; onOpenFile: (filePath: string) => void }) {
  const isBlocked = task.blockedBy && task.blockedBy.length > 0;
  const statusClass = `task-card--${task.status.replace('_', '-')}`;

  const handleClick = () => {
    if (task.filePath) {
      onOpenFile(task.filePath);
    }
  };

  return (
    <div
      className={`task-card ${statusClass} ${isBlocked ? 'task-card--blocked' : ''}`}
      onClick={handleClick}
      style={{ cursor: task.filePath ? 'pointer' : 'default' }}
    >
      <div className="task-card__header">
        <span className="task-card__id">#{task.id}</span>
        {task.owner && <span className="task-card__owner">{task.owner}</span>}
      </div>
      <h3 className="task-card__subject">{task.subject}</h3>
      {task.activeForm && task.status === 'in_progress' && (
        <p className="task-card__active-form">{task.activeForm}</p>
      )}
      {task.description && (
        <p className="task-card__description">{task.description}</p>
      )}
      {isBlocked && (
        <div className="task-card__blocked">
          Blocked by: #{task.blockedBy!.join(', #')}
        </div>
      )}
      {task.sessionId && (
        <div className="task-card__session">
          Session: {task.sessionId.slice(0, 8)}...
        </div>
      )}
    </div>
  );
}

function Swimlane({
  title,
  status,
  tasks,
  onOpenFile,
}: {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onOpenFile: (filePath: string) => void;
}) {
  const filteredTasks = tasks.filter((t) => t.status === status);
  const statusClass = `swimlane--${status.replace('_', '-')}`;

  return (
    <section className={`swimlane ${statusClass}`}>
      <div className="swimlane__header">
        <span className="swimlane__title">
          {title}
          <span className="swimlane__count">{filteredTasks.length}</span>
        </span>
      </div>
      <div className="swimlane__content">
        {filteredTasks.map((task) => (
          <TaskCard key={`${task.sessionId}-${task.id}`} task={task} onOpenFile={onOpenFile} />
        ))}
      </div>
    </section>
  );
}

function App() {
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
    <div className="app-container">
      <header className="header">
        <div className="header__icon"></div>
        <h1 className="header__title">iClaude Workbench</h1>
        <div className="header__actions"></div>
      </header>

      <nav className="tab-bar">
        <div className="tab-bar__tab tab-bar__tab--active">Tasks</div>
        <div className="tab-bar__tab">Plans</div>
      </nav>

      <main className="swimlanes">
        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            No tasks found in ~/.claude/tasks
          </div>
        ) : (
          <>
            <Swimlane title="Pending" status="pending" tasks={tasks} onOpenFile={handleOpenFile} />
            <Swimlane title="In Progress" status="in_progress" tasks={tasks} onOpenFile={handleOpenFile} />
            <Swimlane title="Completed" status="completed" tasks={tasks} onOpenFile={handleOpenFile} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
