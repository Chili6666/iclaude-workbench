import { useState } from 'react';
import { Plan } from '../../interfaces/Plan';
import styles from './PlanListItem.module.css';

interface PlanListItemProps {
  plan: Plan;
  isSelected: boolean;
  isActive?: boolean;
  onClick: () => void;
}

/**
 * PlanListItem component displays a single plan in the sidebar list.
 * Shows an "Active" badge for the currently active plan.
 */
export const PlanListItem = ({ plan, isSelected, isActive, onClick }: PlanListItemProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const formattedDate = new Date(plan.modifiedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', plan.filePath);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`${styles.planListItem} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className={styles.content}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{plan.title}</span>
          {isActive && <span className={styles.activeBadge}>Active</span>}
        </div>
        <div className={styles.date}>{formattedDate}</div>
      </div>
    </div>
  );
}
