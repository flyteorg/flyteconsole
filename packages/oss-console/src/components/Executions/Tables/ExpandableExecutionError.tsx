import React, { FC, useCallback, useMemo, useState } from 'react';
import Admin from '@clients/common/flyteidl/admin';
import { useQuery } from 'react-query';
import { ExpandableMonospaceText } from '../../common/ExpandableMonospaceText';
import { ExecutionError, WorkflowExecutionIdentifier } from '../../../models/Execution/types';
import { useExecutionTableStyles } from './styles';
import { getExecution } from '../../../models/Execution/api';

/** Renders an expandable/collapsible container for an ExecutionErorr, along with
 * a button for copying the error string.
 */
export const ExpandableExecutionError: FC<{
  abortMetadata?: Admin.IAbortMetadata;
  error?: ExecutionError;
  initialExpansionState?: boolean;
  resourceId: WorkflowExecutionIdentifier;
  onExpandCollapse?(expanded: boolean): void;
}> = ({ abortMetadata, error, initialExpansionState = false, onExpandCollapse, resourceId }) => {
  const styles = useExecutionTableStyles();

  const [isExpanded, setIsExpanded] = useState(initialExpansionState);

  const executionResourceId = {
    project: resourceId.project,
    domain: resourceId.domain,
    name: resourceId.name,
  } as WorkflowExecutionIdentifier;

  const isMessageTruncated = useMemo(() => {
    // messages may be shorteded in link results due to a limit in protobuf size
    return !!(error?.message?.length && error.message.length < 110);
  }, [error?.message]);

  const fullErrorMessageQuery = useQuery(
    `error-mesage-collapseable_${JSON.stringify(resourceId)}`,
    async () => getExecution(executionResourceId),
    // fetch on click if message has been shortened
    { enabled: isExpanded && isMessageTruncated },
  );

  const fullErrortext = useMemo(() => {
    if (fullErrorMessageQuery.isLoading) return 'Loading full error message...';

    return fullErrorMessageQuery.data?.closure?.error?.message || 'Error expanding message';
  }, [fullErrorMessageQuery.data, fullErrorMessageQuery.isLoading]);

  const handleExpandCollapse = useCallback(
    (expanded: boolean) => {
      if (onExpandCollapse) {
        onExpandCollapse(expanded);
      }
      setIsExpanded(expanded);
    },
    [onExpandCollapse],
  );

  const errorDisplayText = useMemo(() => {
    if (isMessageTruncated) {
      return isExpanded ? fullErrortext : `${abortMetadata?.cause ?? error?.message}…`;
    }
    return `${abortMetadata?.cause ?? error?.message ?? ''}`;
  }, [abortMetadata?.cause, error?.message, isExpanded, fullErrortext]);

  return (
    <div className={styles.errorContainer}>
      <ExpandableMonospaceText
        onExpandCollapse={handleExpandCollapse}
        initialExpansionState={initialExpansionState}
        text={errorDisplayText}
        isLoading={fullErrorMessageQuery.isLoading}
      />
    </div>
  );
};
