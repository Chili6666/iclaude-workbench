import { Plan } from '../../interfaces/Plan';
import { WorkspaceFolder } from '../../interfaces/WorkspaceFolder';
import { PlanListItem } from '../PlanListItem/PlanListItem';
import { PlanDropTarget } from '../PlanDropTarget/PlanDropTarget';
import styles from './PlanSidebar.module.css';

interface PlanSidebarProps {
  plans: Plan[];
  selectedPlanId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPlan: (planId: string) => void;
  workspaceFolders: WorkspaceFolder[];
  onDropPlan: (sourcePath: string, targetFolderPath: string) => void;
  selectedFolderPath: string;
  onFolderChange: (folderPath: string) => void;
}

/**
 * PlanSidebar component displays a search input and list of plans.
 */
export const PlanSidebar = ({
  plans,
  selectedPlanId,
  searchQuery,
  onSearchChange,
  onSelectPlan,
  workspaceFolders,
  onDropPlan,
  selectedFolderPath,
  onFolderChange,
}: PlanSidebarProps) => {
  const filteredPlans = searchQuery.trim()
    ? plans.filter(
        (plan) =>
          plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plan.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : plans;

  return (
    <div className={styles.sidebar}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search plans..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className={styles.planList}>
        {filteredPlans.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery.trim() ? 'No matching plans' : 'No plans found'}
          </div>
        ) : (
          filteredPlans.map((plan, index) => (
            <PlanListItem
              key={plan.id}
              plan={plan}
              isSelected={plan.id === selectedPlanId}
              isActive={index === 0}
              onClick={() => onSelectPlan(plan.id)}
            />
          ))
        )}
      </div>
      <PlanDropTarget
        workspaceFolders={workspaceFolders}
        onDropPlan={onDropPlan}
        selectedFolderPath={selectedFolderPath}
        onFolderChange={onFolderChange}
      />
    </div>
  );
}
