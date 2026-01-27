import * as vscode from 'vscode';
import { TaskBoardPanel } from './panels/TaskBoardPanel';
import { TaskBoardViewProvider } from './panels/TaskBoardViewProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('iClaude Workbench extension is now active');

  // Register the sidebar view provider
  const provider = new TaskBoardViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      TaskBoardViewProvider.viewType,
      provider
    )
  );

  // Keep the command for opening as a panel (backward compatibility)
  const showTaskBoardCommand = vscode.commands.registerCommand(
    'iclaude-workbench.showTaskBoard',
    () => {
      TaskBoardPanel.render(context.extensionUri);
    }
  );

  context.subscriptions.push(showTaskBoardCommand);
}

export function deactivate() {
  console.log('iClaude Workbench extension is now deactivated');
}
