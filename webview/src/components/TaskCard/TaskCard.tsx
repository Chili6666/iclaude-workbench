import { Task } from '../../interfaces/Task';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onOpenFile: (filePath: string) => void;
}

/**
 * TaskCard component displays a single task with its details.
 * Supports click-to-open functionality when a file path is associated.
 */
export const TaskCard = ({ task, onOpenFile }: TaskCardProps) => {
  const isBlocked = task.blockedBy && task.blockedBy.length > 0;

  const handleClick = () => {
    if (task.filePath) {
      onOpenFile(task.filePath);
    }
  };

  const statusClass =
    task.status === 'in_progress'
      ? styles.taskCardInProgress
      : task.status === 'completed'
        ? styles.taskCardCompleted
        : '';

  return (
    <div
      className={`${styles.taskCard} ${statusClass} ${isBlocked ? styles.taskCardBlocked : ''}`}
      onClick={handleClick}
      style={{ cursor: task.filePath ? 'pointer' : 'default' }}
      role="button"
      tabIndex={0}
      aria-label={`Task ${task.id}: ${task.subject}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className={styles.header}>
        <span className={styles.id}>#{task.id}</span>
        {task.owner && <span className={styles.owner}>{task.owner}</span>}
      </div>
      <h3 className={styles.subject}>{task.subject}</h3>
      {task.activeForm && task.status === 'in_progress' && (
        <p className={styles.activeForm}>{task.activeForm}</p>
      )}
      {task.description && <p className={styles.description}>{task.description}</p>}
      {isBlocked && (
        <div className={styles.blocked}>Blocked by: #{task.blockedBy!.join(', #')}</div>
      )}
      {task.sessionId && (
        <div className={styles.session}>Session: {task.sessionId.slice(0, 8)}...</div>
      )}
    </div>
  );
}
