import { Task, TaskStatus } from '../../interfaces/Task';
import { TaskCard } from '../TaskCard/TaskCard';
import styles from './Swimlane.module.css';

interface SwimlaneProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onOpenFile: (filePath: string) => void;
}

/**
 * Swimlane component displays a column of tasks filtered by status.
 * Part of the Kanban-style task board layout.
 */
export function Swimlane({ title, status, tasks, onOpenFile }: SwimlaneProps) {
  const filteredTasks = tasks.filter((t) => t.status === status);

  const statusClass =
    status === 'in_progress'
      ? styles.swimlaneInProgress
      : status === 'completed'
        ? styles.swimlaneCompleted
        : '';

  return (
    <section className={`${styles.swimlane} ${statusClass}`}>
      <div className={styles.header}>
        <span className={styles.title}>
          {title}
          <span className={styles.count}>{filteredTasks.length}</span>
        </span>
      </div>
      <div className={styles.content}>
        {filteredTasks.map((task) => (
          <TaskCard key={`${task.sessionId}-${task.id}`} task={task} onOpenFile={onOpenFile} />
        ))}
      </div>
    </section>
  );
}
