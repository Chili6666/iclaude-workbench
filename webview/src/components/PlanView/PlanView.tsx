import { useState, useCallback } from 'react';
import { Plan } from '../../interfaces/Plan';
import { WorkspaceFolder } from '../../interfaces/WorkspaceFolder';
import { PlanSidebar } from '../PlanSidebar/PlanSidebar';
import { PlanContentViewer } from '../PlanContentViewer/PlanContentViewer';
import { VerticalSplitter } from '../VerticalSplitter/VerticalSplitter';
import styles from './PlanView.module.css';

interface PlanViewProps {
  plans: Plan[];
  selectedPlanId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPlan: (planId: string) => void;
  onOpenFile: (filePath: string) => void;
  workspaceFolders: WorkspaceFolder[];
  onDropPlan: (sourcePath: string, targetFolderPath: string) => void;
  selectedFolderPath: string;
  onFolderChange: (folderPath: string) => void;
}

/**
 * PlanView component displays a split panel with plan list and content viewer.
 */
export const PlanView = ({
  plans,
  selectedPlanId,
  searchQuery,
  onSearchChange,
  onSelectPlan,
  onOpenFile,
  workspaceFolders,
  onDropPlan,
  selectedFolderPath,
  onFolderChange,
}: PlanViewProps) => {
  const [sidebarWidth, setSidebarWidth] = useState(280);

  const handleResize = useCallback((width: number) => {
    setSidebarWidth(width);
  }, []);

  const selectedPlan = selectedPlanId
    ? plans.find((p) => p.id === selectedPlanId) ?? null
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.sidebar} style={{ width: sidebarWidth }}>
        <PlanSidebar
          plans={plans}
          selectedPlanId={selectedPlanId}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onSelectPlan={onSelectPlan}
          workspaceFolders={workspaceFolders}
          onDropPlan={onDropPlan}
          selectedFolderPath={selectedFolderPath}
          onFolderChange={onFolderChange}
        />
      </div>
      <VerticalSplitter
        onResize={handleResize}
        minWidth={150}
        maxWidth={500}
      />
      <div className={styles.content}>
        <PlanContentViewer plan={selectedPlan} onOpenFile={onOpenFile} />
      </div>
    </div>
  );
}
