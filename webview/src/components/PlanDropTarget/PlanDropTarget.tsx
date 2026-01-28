import { useState, useEffect } from 'react';
import { WorkspaceFolder } from '../../interfaces/WorkspaceFolder';
import styles from './PlanDropTarget.module.css';

interface PlanDropTargetProps {
  workspaceFolders: WorkspaceFolder[];
  onDropPlan: (sourcePath: string, targetFolderPath: string) => void;
  selectedFolderPath: string;
  onFolderChange: (folderPath: string) => void;
}

/**
 * PlanDropTarget component provides a drop zone for copying plans to workspace folders.
 * Contains a dropdown for selecting destination folder and a drop zone for drag-and-drop.
 */
export function PlanDropTarget({ workspaceFolders, onDropPlan, selectedFolderPath, onFolderChange }: PlanDropTargetProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  // Auto-select first folder when workspace folders load and no folder is selected
  useEffect(() => {
    if (workspaceFolders.length > 0 && !selectedFolderPath) {
      onFolderChange(workspaceFolders[0].path);
    }
  }, [workspaceFolders, selectedFolderPath, onFolderChange]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const sourcePath = e.dataTransfer.getData('text/plain');
    if (sourcePath && selectedFolderPath) {
      onDropPlan(sourcePath, selectedFolderPath);
    }
  };

  if (workspaceFolders.length === 0) {
    return (
      <div className={styles.dropTarget}>
        <div className={styles.emptyState}>
          No workspace folders available
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dropTarget}>
      <select
        className={styles.folderDropdown}
        value={selectedFolderPath}
        onChange={(e) => onFolderChange(e.target.value)}
      >
        {workspaceFolders.map((folder) => (
          <option key={folder.path} value={folder.path}>
            {folder.name}
          </option>
        ))}
      </select>
      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className={styles.dropIcon}>
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        <div className={styles.dropText}>
          Drop plan here to copy
        </div>
      </div>
    </div>
  );
}
