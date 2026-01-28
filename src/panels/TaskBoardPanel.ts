import * as vscode from 'vscode';
import { TaskService, Task } from '../services/TaskService';
import { WebviewMessage } from '../interfaces/WebviewMessage';

/**
 * TaskBoardPanel manages the webview panel for displaying the task board.
 * It handles rendering, message passing, and task updates in a standalone editor panel.
 */
export class TaskBoardPanel {
  /** The currently active panel instance, or undefined if no panel is open. */
  public static currentPanel: TaskBoardPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private _taskService: TaskService;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._taskService = TaskService.getInstance();

    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    // Set up message handling from webview
    this._panel.webview.onDidReceiveMessage(
      (message) => this._handleMessage(message),
      null,
      this._disposables
    );

    // Listen for task changes
    this._taskService.onTasksChanged(
      (tasks) => this._sendTasksToWebview(tasks),
      null,
      this._disposables
    );

    // Load initial tasks
    this._loadInitialTasks();

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
  }

  private async _loadInitialTasks(): Promise<void> {
    const tasks = await this._taskService.loadAllTasks();
    this._sendTasksToWebview(tasks);
  }

  private _sendTasksToWebview(tasks: Task[]): void {
    this._panel.webview.postMessage({
      type: 'tasksUpdated',
      tasks: tasks,
    });
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

  /**
   * Renders the task board panel. If a panel already exists, it reveals it;
   * otherwise, it creates a new panel.
   * @param extensionUri - The URI of the extension's root directory
   */
  public static render(extensionUri: vscode.Uri): void {
    if (TaskBoardPanel.currentPanel) {
      TaskBoardPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        'taskBoard',
        'iClaude Workbench',
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [
            vscode.Uri.joinPath(extensionUri, 'out', 'webview')
          ]
        }
      );

      TaskBoardPanel.currentPanel = new TaskBoardPanel(panel, extensionUri);
    }
  }

  /**
   * Disposes the panel and cleans up all associated resources.
   */
  public dispose(): void {
    TaskBoardPanel.currentPanel = undefined;

    this._panel.dispose();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'assets', 'index.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, 'out', 'webview', 'assets', 'index.css')
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
  <title>iClaude Workbench</title>
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${scriptUri}"></script>
</body>
</html>`;
  }
}
