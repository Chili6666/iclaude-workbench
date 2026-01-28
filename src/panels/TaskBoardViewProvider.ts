import * as vscode from 'vscode';
import { TaskService, Task } from '../services/TaskService';
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

  constructor(private readonly _extensionUri: vscode.Uri) {
    this._taskService = TaskService.getInstance();

    // Listen for task changes
    this._taskService.onTasksChanged(
      (tasks) => this._sendTasksToWebview(tasks),
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
