import * as vscode from 'vscode';
import { TaskService, Task } from '../services/TaskService';
import { PlanService, Plan } from '../services/PlanService';
import { WebviewMessage } from '../interfaces/WebviewMessage';

/**
 * TaskBoardViewProvider manages the webview view for the task board sidebar.
 * It implements WebviewViewProvider to integrate with VS Code's sidebar panel system.
 */
export class TaskBoardViewProvider implements vscode.WebviewViewProvider {
  /** The unique identifier for this webview view type. */
  public static readonly viewType = 'iclaude-workbench.taskBoardView';
  private _view?: vscode.WebviewView;
  private _disposables: vscode.Disposable[] = [];
  private _taskService: TaskService;
  private _planService: PlanService;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._taskService = TaskService.getInstance();
    this._planService = PlanService.getInstance();

    // Listen for task changes
    this._taskService.onTasksChanged(
      (tasks) => this._sendTasksToWebview(tasks),
      null,
      this._disposables
    );

    // Listen for plan changes
    this._planService.onPlansChanged(
      (plans) => this._sendPlansToWebview(plans),
      null,
      this._disposables
    );
  }

  /**
   * Called when the webview view is resolved. Sets up the webview content,
   * message handling, and loads initial tasks.
   * @param webviewView - The webview view to resolve
   * @param _context - Context for the webview view resolution
   * @param _token - Cancellation token
   */
  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'out', 'webview')
      ]
    };

    webviewView.webview.html = this._getWebviewContent(
      webviewView.webview,
      this._extensionUri
    );

    // Set up message handling from webview
    webviewView.webview.onDidReceiveMessage(
      (message) => this._handleMessage(message),
      null,
      this._disposables
    );

    // Load initial tasks
    this._loadInitialTasks();

    // Send workspace folders to webview
    this._sendWorkspaceFolders();
  }

  private async _loadInitialTasks(): Promise<void> {
    const tasks = await this._taskService.loadAllTasks();
    this._sendTasksToWebview(tasks);
  }

  private _sendTasksToWebview(tasks: Task[]): void {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'tasksUpdated',
        tasks: tasks,
      });
    }
  }

  private _sendPlansToWebview(plans: Plan[]): void {
    if (this._view) {
      this._view.webview.postMessage({
        type: 'plansUpdated',
        plans: plans,
      });
    }
  }

  private async _sendWorkspaceFolders(): Promise<void> {
    const workspaceFolders = await this._getWorkspaceFoldersRecursive();

    if (this._view) {
      this._view.webview.postMessage({
        type: 'workspaceFoldersUpdated',
        workspaceFolders: workspaceFolders,
      });
    }
  }

  private async _getWorkspaceFoldersRecursive(): Promise<Array<{ path: string; name: string }>> {
    const folders: Array<{ path: string; name: string }> = [];
    const workspaceRoots = vscode.workspace.workspaceFolders;

    if (!workspaceRoots) {
      return folders;
    }

    for (const root of workspaceRoots) {
      // Add the root folder
      folders.push({
        path: root.uri.fsPath,
        name: root.name,
      });

      // Recursively get subfolders (2 levels deep)
      await this._addSubfolders(root.uri, root.name, folders, 0, 2);
    }

    return folders;
  }

  private async _addSubfolders(
    parentUri: vscode.Uri,
    parentDisplayName: string,
    folders: Array<{ path: string; name: string }>,
    currentLevel: number,
    maxLevel: number
  ): Promise<void> {
    if (currentLevel >= maxLevel) {
      return;
    }

    try {
      const entries = await vscode.workspace.fs.readDirectory(parentUri);

      for (const [name, type] of entries) {
        // Skip hidden folders and common directories to ignore
        if (name.startsWith('.') || name === 'node_modules' || name === 'dist' || name === 'out' || name === 'build') {
          continue;
        }

        if (type === vscode.FileType.Directory) {
          const folderUri = vscode.Uri.joinPath(parentUri, name);
          const displayName = `${parentDisplayName}/${name}`;

          folders.push({
            path: folderUri.fsPath,
            name: displayName,
          });

          // Recursively add subfolders
          await this._addSubfolders(folderUri, displayName, folders, currentLevel + 1, maxLevel);
        }
      }
    } catch (error) {
      // Ignore errors (e.g., permission denied)
    }
  }

  private async _loadInitialPlans(): Promise<void> {
    const plans = await this._planService.loadAllPlans();
    this._sendPlansToWebview(plans);
  }

  private async _handleMessage(message: WebviewMessage): Promise<void> {
    switch (message.type) {
      case 'requestTasks':
        await this._loadInitialTasks();
        break;
      case 'openTaskFile':
        if (message.filePath) {
          const uri = vscode.Uri.file(message.filePath);
          await vscode.window.showTextDocument(uri, { preview: true });
        }
        break;
      case 'requestPlans':
        await this._loadInitialPlans();
        break;
      case 'requestWorkspaceFolders':
        await this._sendWorkspaceFolders();
        break;
      case 'openPlanFile':
        if (message.filePath) {
          const uri = vscode.Uri.file(message.filePath);
          await vscode.window.showTextDocument(uri, { preview: true });
        }
        break;
      case 'copyPlanToProject':
        if (message.sourcePath) {
          await this._copyPlanToProject(message.sourcePath);
        }
        break;
      case 'copyPlanToFolder':
        if (message.sourcePath && message.targetFolderPath) {
          await this._copyPlanToFolder(message.sourcePath, message.targetFolderPath);
        }
        break;
    }
  }

  private async _copyPlanToProject(sourcePath: string): Promise<void> {
    const sourceUri = vscode.Uri.file(sourcePath);
    const fileName = sourcePath.split(/[/\\]/).pop() || 'plan.md';

    // Show folder picker dialog
    const folderUris = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: 'Select Destination Folder',
      title: 'Copy Plan To...',
    });

    if (!folderUris || folderUris.length === 0) {
      return;
    }

    const targetUri = vscode.Uri.joinPath(folderUris[0], fileName);

    // Check if file already exists
    try {
      await vscode.workspace.fs.stat(targetUri);
      // File exists, prompt for overwrite
      const overwrite = await vscode.window.showWarningMessage(
        `"${fileName}" already exists in the selected folder. Do you want to overwrite it?`,
        { modal: true },
        'Overwrite',
        'Cancel'
      );
      if (overwrite !== 'Overwrite') {
        return;
      }
    } catch {
      // File doesn't exist, proceed with copy
    }

    // Copy the file
    try {
      await vscode.workspace.fs.copy(sourceUri, targetUri, { overwrite: true });

      // Show success notification with actions
      const action = await vscode.window.showInformationMessage(
        `Plan copied to ${folderUris[0].fsPath}`,
        'Open File',
        'Reveal in Explorer'
      );

      if (action === 'Open File') {
        await vscode.window.showTextDocument(targetUri, { preview: false });
      } else if (action === 'Reveal in Explorer') {
        await vscode.commands.executeCommand('revealFileInOS', targetUri);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to copy plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async _copyPlanToFolder(sourcePath: string, targetFolderPath: string): Promise<void> {
    const sourceUri = vscode.Uri.file(sourcePath);
    const fileName = sourcePath.split(/[/\\]/).pop() || 'plan.md';
    const targetFolderUri = vscode.Uri.file(targetFolderPath);
    const targetUri = vscode.Uri.joinPath(targetFolderUri, fileName);

    // Check if file already exists
    try {
      await vscode.workspace.fs.stat(targetUri);
      // File exists, prompt for overwrite
      const overwrite = await vscode.window.showWarningMessage(
        `"${fileName}" already exists in the selected folder. Do you want to overwrite it?`,
        { modal: true },
        'Overwrite',
        'Cancel'
      );
      if (overwrite !== 'Overwrite') {
        return;
      }
    } catch {
      // File doesn't exist, proceed with copy
    }

    // Copy the file
    try {
      await vscode.workspace.fs.copy(sourceUri, targetUri, { overwrite: true });

      // Show success notification with actions
      const action = await vscode.window.showInformationMessage(
        `Plan copied to ${targetFolderPath}`,
        'Open File',
        'Reveal in Explorer'
      );

      if (action === 'Open File') {
        await vscode.window.showTextDocument(targetUri, { preview: false });
      } else if (action === 'Reveal in Explorer') {
        await vscode.commands.executeCommand('revealFileInOS', targetUri);
      }
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to copy plan: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private _getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'assets', 'index.js')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
  <title>iClaude Workbench</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
  }

  /**
   * Disposes the view provider and cleans up all associated resources.
   */
  public dispose(): void {
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }
}
