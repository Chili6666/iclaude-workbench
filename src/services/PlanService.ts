import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { Plan } from '../interfaces/Plan';

export { Plan };

/** Delay in milliseconds for debouncing file system events */
const DEBOUNCE_DELAY_MS = 100;

/**
 * PlanService manages Claude Code plans by watching the file system
 * and providing plan data to the UI. Implements a singleton pattern.
 */
export class PlanService {
  private static instance: PlanService;
  private _onPlansChanged = new vscode.EventEmitter<Plan[]>();
  /** Event that fires when plans are updated (added, modified, or removed). */
  public readonly onPlansChanged = this._onPlansChanged.event;
  private _watcher: fs.FSWatcher | undefined;
  private _plans: Plan[] = [];
  private _debounceTimer: NodeJS.Timeout | undefined;

  private constructor() {
    this._setupWatcher();
  }

  /**
   * Returns the singleton instance of PlanService, creating it if necessary.
   * @returns The shared PlanService instance
   */
  public static getInstance = (): PlanService => {
    if (!PlanService.instance) {
      PlanService.instance = new PlanService();
    }
    return PlanService.instance;
  };

  private get plansDirectory(): string {
    return path.join(os.homedir(), '.claude', 'plans');
  }

  private _setupWatcher(): void {
    const plansDir = this.plansDirectory;

    if (!fs.existsSync(plansDir)) {
      return;
    }

    this._watchDirectory(plansDir);
  }

  private _watchDirectory(dirPath: string): void {
    try {
      this._watcher = fs.watch(dirPath, { persistent: false }, () => {
        this._debouncedReload();
      });
    } catch (error) {
      console.warn(`Failed to watch directory ${dirPath}:`, error);
    }
  }

  private _debouncedReload(): void {
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._debounceTimer = setTimeout(() => {
      this._reloadPlans();
    }, DEBOUNCE_DELAY_MS);
  }

  private _cleanupWatcher(): void {
    if (this._watcher) {
      this._watcher.close();
      this._watcher = undefined;
    }
  }

  private async _reloadPlans(): Promise<void> {
    this._plans = await this.loadAllPlans();
    this._onPlansChanged.fire(this._plans);
  }

  /**
   * Loads all plans from the Claude plans directory.
   * Scans for .md files and parses their content.
   * @returns Promise resolving to an array of all plans
   */
  public async loadAllPlans(): Promise<Plan[]> {
    const plans: Plan[] = [];
    const plansDir = this.plansDirectory;

    try {
      if (!fs.existsSync(plansDir)) {
        return [];
      }

      const files = fs.readdirSync(plansDir)
        .filter(file => file.endsWith('.md'));

      for (const file of files) {
        const filePath = path.join(plansDir, file);
        const plan = await this._parsePlanFile(filePath);
        if (plan) {
          plans.push(plan);
        }
      }

      // Sort by modifiedAt descending (newest first)
      plans.sort((a, b) => b.modifiedAt - a.modifiedAt);
    } catch (error) {
      console.error('Error loading plans:', error);
    }

    return plans;
  }

  private async _parsePlanFile(filePath: string): Promise<Plan | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const stats = fs.statSync(filePath);
      const filename = path.basename(filePath, '.md');
      const title = this._extractTitle(content, filename);

      const plan: Plan = {
        id: filename,
        title,
        content,
        filePath,
        modifiedAt: stats.mtimeMs,
      };

      return plan;
    } catch (error) {
      console.warn(`Failed to parse plan file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Extracts the title from markdown content.
   * Looks for the first H1 heading (# Title), falls back to filename.
   */
  private _extractTitle(content: string, fallback: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    if (match && match[1]) {
      return match[1].trim();
    }
    return fallback;
  }

  /**
   * Gets the content of a specific plan by ID.
   * @param id - The plan ID (filename without .md)
   * @returns The plan content or null if not found
   */
  public getPlanContent(id: string): string | null {
    const plan = this._plans.find(p => p.id === id);
    return plan ? plan.content : null;
  }

  /**
   * Searches plans by query string.
   * Searches in both title and content.
   * @param query - The search query
   * @returns Array of matching plans
   */
  public searchPlans(query: string): Plan[] {
    if (!query.trim()) {
      return this._plans;
    }
    const lowerQuery = query.toLowerCase();
    return this._plans.filter(plan =>
      plan.title.toLowerCase().includes(lowerQuery) ||
      plan.content.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Returns the currently cached list of plans.
   * @returns Array of plans from the last load/reload
   */
  public getPlans(): Plan[] {
    return this._plans;
  }

  /**
   * Disposes the service by cleaning up file watchers, timers, and event emitters.
   */
  public dispose(): void {
    this._cleanupWatcher();
    if (this._debounceTimer) {
      clearTimeout(this._debounceTimer);
    }
    this._onPlansChanged.dispose();
  }
}
