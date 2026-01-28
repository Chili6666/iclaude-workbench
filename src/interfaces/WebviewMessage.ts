import { Plan } from './Plan';

/**
 * Message interface for communication between extension and webview.
 * Used for handling commands from the webview panel/view.
 */
export interface WebviewMessage {
  type: string;
  taskId?: string;
  filePath?: string;
  planId?: string;
  plans?: Plan[];
  plan?: Plan;
  query?: string;
  sourcePath?: string;
  targetFolderPath?: string;
  workspaceFolders?: WorkspaceFolder[];
}

export interface WorkspaceFolder {
  path: string;  // Absolute path
  name: string;  // Folder name
}
