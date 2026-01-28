/**
 * Message interface for communication between extension and webview.
 * Used for handling commands from the webview panel/view.
 */
export interface WebviewMessage {
  type: string;
  taskId?: string;
  filePath?: string;
}
