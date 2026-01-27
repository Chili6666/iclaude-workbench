import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  subject: string;
  description?: string;
  status: TaskStatus;
  owner?: string;
  activeForm?: string;
  blockedBy?: string[];
  blocks?: string[];
  metadata?: Record<string, unknown>;
  sessionId?: string;
  filePath?: string;
}

export class TaskService {
  private static instance: TaskService;
  private _onTasksChanged = new vscode.EventEmitter<Task[]>();
  public readonly onTasksChanged = this._onTasksChanged.event;
  private _watchers: fs.FSWatcher[] = [];
  private _tasks: Task[] = [];
  private _debounceTimer: NodeJS.Timeout | undefined;

  private constructor() {
    this._setupWatchers();
  }

  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  private get tasksDirectory(): string {
    return path.join(os.homedir(), '.claude', 'tasks');
  }

  private _setupWatchers(): void {
    const tasksDir = this.tasksDirectory;

    if (!fs.existsSync(tasksDir)) {
      return;
    }

    // Watch the main tasks directory for new/deleted session folders
    this._watchDirectory(tasksDir);

    // Watch each session subdirectory for task file changes
    try {
      const sessionDirs = fs.readdirSync(tasksDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(tasksDir, dirent.name));

      for (const sessionDir of sessionDirs) {
        this._watchDirectory(sessionDir);
      }
    } catch (error) {
      console.error('Error setting up watchers:', error);
    }
  }

  private _watchDirectory(dirPath: string): void {
    try {
      const watcher = fs.watch(dirPath, { persistent: false }, () => {
        this._debouncedReload();
      });
      this._watchers.push(watcher);
    } catch (error) {
      console.warn(`Failed to watch directory ${dirPath}:`, error);
    }
  }

  private _debouncedReload(): void {
    // Debounce rapid file system events
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._reloadTasks();
      // Re-setup watchers in case directories were added/removed
      this._cleanupWatchers();
      this._setupWatchers();
    }, 100);
  }

  private _cleanupWatchers(): void {
    for (const watcher of this._watchers) {
      watcher.close();
    }
    this._watchers = [];
  }

  private async _reloadTasks(): Promise<void> {
    this._tasks = await this.loadAllTasks();
    this._onTasksChanged.fire(this._tasks);
  }

  public async loadAllTasks(): Promise<Task[]> {
    const tasks: Task[] = [];
    const tasksDir = this.tasksDirectory;

    try {
      if (!fs.existsSync(tasksDir)) {
        return [];
      }

      const sessionDirs = fs.readdirSync(tasksDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const sessionId of sessionDirs) {
        const sessionPath = path.join(tasksDir, sessionId);
        const files = fs.readdirSync(sessionPath)
          .filter(file => file.endsWith('.json'));

        for (const file of files) {
          const filePath = path.join(sessionPath, file);
          const task = await this._parseTaskFile(filePath, sessionId);
          if (task) {
            tasks.push(task);
          }
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }

    return tasks;
  }

  private async _parseTaskFile(filePath: string, sessionId: string): Promise<Task | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // Defensive parsing - extract only known fields with fallbacks
      if (!data.id) {
        console.warn(`Task file missing id: ${filePath}`);
        return null;
      }

      const task: Task = {
        id: String(data.id),
        subject: String(data.subject || 'Untitled Task'),
        description: data.description ? String(data.description) : undefined,
        status: this._parseStatus(data.status),
        owner: data.owner ? String(data.owner) : undefined,
        activeForm: data.activeForm ? String(data.activeForm) : undefined,
        blockedBy: Array.isArray(data.blockedBy)
          ? data.blockedBy.map((id: unknown) => String(id))
          : undefined,
        blocks: Array.isArray(data.blocks)
          ? data.blocks.map((id: unknown) => String(id))
          : undefined,
        metadata: typeof data.metadata === 'object' ? data.metadata : undefined,
        sessionId,
        filePath,
      };

      return task;
    } catch (error) {
      console.warn(`Failed to parse task file ${filePath}:`, error);
      return null;
    }
  }

  private _parseStatus(status: unknown): TaskStatus {
    if (status === 'pending' || status === 'in_progress' || status === 'completed') {
      return status;
    }
    return 'pending'; // Default fallback
  }

  public getTasks(): Task[] {
    return this._tasks;
  }

  public dispose(): void {
    this._cleanupWatchers();
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._onTasksChanged.dispose();
  }
}
