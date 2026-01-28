import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { Task, TaskStatus } from '../interfaces/Task';

export { Task, TaskStatus };

/** Delay in milliseconds for debouncing file system events */
const DEBOUNCE_DELAY_MS = 300;

/**
 * TaskService manages Claude Code tasks by watching the file system
 * and providing task data to the UI. Implements a singleton pattern.
 */
export class TaskService {
  private static instance: TaskService;
  private _onTasksChanged = new vscode.EventEmitter<Task[]>();
  /** Event that fires when tasks are updated (added, modified, or removed). */
  public readonly onTasksChanged = this._onTasksChanged.event;
  private _watchers: fs.FSWatcher[] = [];
  private _tasks: Task[] = [];
  private _debounceTimer: NodeJS.Timeout | undefined;
  private _isReloading = false;

  private constructor() {
    this._setupWatchers();
  }

  /**
   * Returns the singleton instance of TaskService, creating it if necessary.
   * @returns The shared TaskService instance
   */
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
    this._debounceTimer = setTimeout(async () => {
      // Skip if already reloading to prevent race conditions
      if (this._isReloading) {
        return;
      }
      this._isReloading = true;
      try {
        await this._reloadTasks();
        // Re-setup watchers in case directories were added/removed
        this._cleanupWatchers();
        this._setupWatchers();
      } finally {
        this._isReloading = false;
      }
    }, DEBOUNCE_DELAY_MS);
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

  /**
   * Loads all tasks from the Claude tasks directory.
   * Scans all session subdirectories and parses task JSON files.
   * @returns Promise resolving to an array of all tasks
   */
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

    // Deduplicate tasks by sessionId+id (safety net for race conditions)
    const uniqueTasks = new Map<string, Task>();
    for (const task of tasks) {
      const key = `${task.sessionId}-${task.id}`;
      uniqueTasks.set(key, task);
    }
    return Array.from(uniqueTasks.values());
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

  /**
   * Returns the currently cached list of tasks.
   * @returns Array of tasks from the last load/reload
   */
  public getTasks(): Task[] {
    return this._tasks;
  }

  /**
   * Disposes the service by cleaning up file watchers, timers, and event emitters.
   */
  public dispose(): void {
    this._cleanupWatchers();
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._onTasksChanged.dispose();
  }
}
