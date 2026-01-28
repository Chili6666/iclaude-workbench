import { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { Plan } from '../../interfaces/Plan';
import styles from './PlanContentViewer.module.css';

interface PlanContentViewerProps {
  plan: Plan | null;
  onOpenFile: (filePath: string) => void;
}

/**
 * PlanContentViewer component renders markdown content for the selected plan.
 */
export const PlanContentViewer = ({ plan, onOpenFile }: PlanContentViewerProps) => {
  const renderedContent = useMemo(() => {
    if (!plan) return '';
    const markdownHtml = marked.parse(plan.content, { async: false }) as string;
    return DOMPurify.sanitize(markdownHtml);
  }, [plan]);

  if (!plan) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyStateText}>Select a plan to view its contents</div>
      </div>
    );
  }

  return (
    <div className={styles.viewer}>
      <div className={styles.header}>
        <h2 className={styles.title}>{plan.title}</h2>
        <button
          className={styles.openButton}
          onClick={() => onOpenFile(plan.filePath)}
          title="Open in editor"
        >
          Open File
        </button>
      </div>
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />
    </div>
  );
}
