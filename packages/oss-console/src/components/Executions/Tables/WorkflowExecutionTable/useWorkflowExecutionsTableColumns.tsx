import * as React from 'react';

import { FeatureFlag, useFeatureFlag } from '../../../../basics/FeatureFlags';
import { useCommonStyles } from '../../../common/styles';
import { WorkflowExecutionColumnDefinition } from '../types';
import {
  ApprovalDoubleCell,
  ApprovalDoubleCellProps,
  getActionsCell,
  getDurationCell,
  getExecutionIdCell,
  getStartTimeCell,
  getStatusCell,
  getLaunchPlanCell,
  getVersionCell,
  getScheduleCell,
  getWorkflowTaskCell,
} from './cells';
import { useStyles } from './styles';
import t, { patternKey } from './strings';

interface WorkflowExecutionColumnOptions {
  showWorkflowName?: boolean;
  showRelativeStartTime?: boolean;
  onArchiveClick?: () => void;
  omitColumns?: string[];
}

/** Returns a memoized list of column definitions to use when rendering a
 * `WorkflowExecutionRow`. Memoization is based on common/column style objects
 * and any fields in the incoming `WorkflowExecutionColumnOptions` object.
 */
export function useWorkflowExecutionsTableColumns(
  props: WorkflowExecutionColumnOptions,
): WorkflowExecutionColumnDefinition[] {
  const styles = useStyles();
  const commonStyles = useCommonStyles();
  const isLaunchPlanEnabled = useFeatureFlag(FeatureFlag.LaunchPlan);

  return React.useMemo(() => {
    const arr: WorkflowExecutionColumnDefinition[] = [
      {
        cellRenderer: ({ execution }) => getStatusCell(execution),
        key: 'phase',
        label: t(patternKey('tableLabel', 'phase')),
      },
      {
        cellRenderer: ({ execution }) => getExecutionIdCell(execution),
        key: 'executionId',
        label: t(patternKey('tableLabel', 'name')),
      },
      {
        cellRenderer: ({ execution }) => getWorkflowTaskCell(execution),
        key: 'workflowTask',
        label: t(patternKey('tableLabel', 'workflowTask')),
      },
      {
        cellRenderer: ({ execution }) => getVersionCell(execution),
        key: 'version',
        label: t(patternKey('tableLabel', 'version')),
      },
      {
        cellRenderer: ({ execution }) => getLaunchPlanCell(execution, commonStyles.textWrapped),
        key: 'launchPlan',
        label: t(patternKey('tableLabel', 'launchPlan')),
      },
      {
        cellRenderer: ({ execution }) => getScheduleCell(execution),
        key: 'schedule',
        label: 'schedule',
      },
      {
        cellRenderer: ({ execution }) => getStartTimeCell(execution, props.showRelativeStartTime),
        key: 'startedAt',
        label: t(patternKey('tableLabel', 'startedAt')),
      },

      {
        cellRenderer: ({ execution }) => getDurationCell(execution),
        key: 'duration',
        label: t(patternKey('tableLabel', 'duration')),
      },
      {
        cellRenderer: ({ execution, state }) =>
          getActionsCell(
            execution,
            state,
            isLaunchPlanEnabled,
            styles.actionContainer,
            styles.rightMargin,
            props.onArchiveClick,
          ),
        className: styles.columnActions,
        key: 'actions',
        label: t(patternKey('tableLabel', 'actions')),
      },
    ];

    if (props.omitColumns?.length) {
      return arr.filter((column) => !props.omitColumns?.includes(column.key));
    }
    return arr;
  }, [
    styles,
    commonStyles,
    props.showWorkflowName,
    isLaunchPlanEnabled,
    props.onArchiveClick,
    props.omitColumns,
  ]);
}

/**
 * Returns a confirmation section to be used in a row instead of regular column cells
 * when an action confrimation is required from user
 */
export function useConfirmationSection(
  props: ApprovalDoubleCellProps,
): WorkflowExecutionColumnDefinition {
  const styles = useStyles();

  const approve: WorkflowExecutionColumnDefinition = {
    cellRenderer: () => <ApprovalDoubleCell {...props} />,
    className: styles.columnActions,
    key: 'actions',
    // Label is used for headers only, this item doesn't have header as shown temporarily in the row
    label: '',
  };
  return approve;
}
