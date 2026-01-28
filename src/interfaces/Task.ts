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
