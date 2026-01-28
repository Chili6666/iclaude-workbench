import { useState } from 'react';
import { Plan } from '../../interfaces/Plan';
import styles from './PlanListItem.module.css';

interface PlanListItemProps {
  plan: Plan;
  isSelected: boolean;
  onClick: () => void;
  onCopyPlan: (filePath: string) => void;
}

/**
 * PlanListItem component displays a single plan in the sidebar list.
 * Shows a copy button on hover to copy plan files to the project.
 */
export function PlanListItem({ plan, isSelected, onClick, onCopyPlan }: PlanListItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  const formattedDate = new Date(plan.modifiedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyPlan(plan.filePath);
  };

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
        <div className={styles.title}>{plan.title}</div>
        <div className={styles.date}>{formattedDate}</div>
      </div>
      <button
        className={styles.copyButton}
        onClick={handleCopyClick}
        title="Copy plan to project folder"
        aria-label="Copy plan to project folder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M13 1H5c-.55 0-1 .45-1 1v2H2c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1zM9 13H3V6h6v7zm4-3h-2V5c0-.55-.45-1-1-1H6V3h7v7z"/>
        </svg>
      </button>
    </div>
  );
}
