import classnames from 'classnames';
import { Admin } from 'flyteidl';
import { getCacheKey } from 'components/Cache/utils';
import { DetailsPanel } from 'components/common/DetailsPanel';
import { useCommonStyles } from 'components/common/styles';
import * as scrollbarSize from 'dom-helpers/util/scrollbarSize';
import { NodeExecution, NodeExecutionIdentifier } from 'models/Execution/types';
import { transformerWorkflowToDag } from 'components/WorkflowGraph/transformerWorkflowToDag';
import { useQuery } from 'react-query';
import { checkForDynamicExecutions } from 'components/common/utils';
import { makeNodeExecutionDynamicWorkflowQuery } from 'components/Workflow/workflowQueries';
import { dNode } from 'models/Graph/types';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { dateToTimestamp } from 'common/utils';
import * as React from 'react';
import { NodeExecutionDetailsPanelContent } from '../ExecutionDetails/NodeExecutionDetailsPanelContent';
import { NodeExecutionsTableContext } from './contexts';
import { ExecutionsTableHeader } from './ExecutionsTableHeader';
import { generateColumns } from './nodeExecutionColumns';
import { NodeExecutionRow } from './NodeExecutionRow';
import { NoExecutionsContent } from './NoExecutionsContent';
import { useColumnStyles, useExecutionTableStyles } from './styles';
import { useNodeExecutionContext } from '../contextProvider/NodeExecutionDetails';
import { NodeExecutionsByIdContext } from '../contexts';
import { convertToPlainNodes } from '../ExecutionDetails/Timeline/helpers';

export interface NodeExecutionsTableProps {
  abortMetadata?: Admin.IAbortMetadata;
}

const scrollbarPadding = scrollbarSize();

/** Renders a table of NodeExecution records. Executions with errors will
 * have an expanadable container rendered as part of the table row.
 * NodeExecutions are expandable and will potentially render a list of child
 * TaskExecutions
 */
export const NodeExecutionsTable: React.FC<NodeExecutionsTableProps> = ({ abortMetadata }) => {
  const [selectedExecution, setSelectedExecution] = React.useState<NodeExecutionIdentifier | null>(
    null,
  );
  const [nodeExecutions, setNodeExecutions] = React.useState<NodeExecution[]>([]);
  const commonStyles = useCommonStyles();
  const tableStyles = useExecutionTableStyles();

  const { compiledWorkflowClosure } = useNodeExecutionContext();
  const { staticExecutionIdsMap } = compiledWorkflowClosure
    ? transformerWorkflowToDag(compiledWorkflowClosure)
    : { staticExecutionIdsMap: {} };
  const nodeExecutionsById = React.useContext(NodeExecutionsByIdContext);
  const dynamicParents = checkForDynamicExecutions(nodeExecutionsById, staticExecutionIdsMap);
  const { data: dynamicWorkflows } = useQuery(
    makeNodeExecutionDynamicWorkflowQuery(dynamicParents),
  );

  React.useEffect(() => {
    const nodes: dNode[] = compiledWorkflowClosure
      ? transformerWorkflowToDag(compiledWorkflowClosure, dynamicWorkflows).dag.nodes
      : [];
    // we remove start/end node info in the root dNode list during first assignment
    const initializeNodes = convertToPlainNodes(nodes);
    if (nodeExecutionsById) {
      const executions: NodeExecution[] = [];
      initializeNodes.map((node) => {
        if (nodeExecutionsById[node.scopedId]) executions.push(nodeExecutionsById[node.scopedId]);
        else
          executions.push({
            closure: {
              createdAt: dateToTimestamp(new Date()),
              outputUri: '',
              phase: NodeExecutionPhase.UNDEFINED,
            },
            id: {
              executionId: {
                domain: node.value?.taskNode?.referenceId?.domain,
                name: node.value?.taskNode?.referenceId?.name,
                project: node.value?.taskNode?.referenceId?.project,
              },
              nodeId: node.id,
            },
            inputUri: '',
            scopedId: node.scopedId,
          });
      });
      setNodeExecutions(executions);
    }
  }, [dynamicWorkflows, compiledWorkflowClosure, nodeExecutionsById]);

  const executionsWithKeys = React.useMemo(
    () =>
      nodeExecutions.map((nodeExecution) => ({
        nodeExecution,
        cacheKey: getCacheKey(nodeExecution.id),
      })),
    [nodeExecutions],
  );

  const columnStyles = useColumnStyles();
  // Memoizing columns so they won't be re-generated unless the styles change
  const columns = React.useMemo(() => generateColumns(columnStyles), [columnStyles]);
  const tableContext = React.useMemo(
    () => ({ columns, state: { selectedExecution, setSelectedExecution } }),
    [columns, selectedExecution, setSelectedExecution],
  );

  const onCloseDetailsPanel = () => setSelectedExecution(null);

  const rowProps = {
    selectedExecution,
    setSelectedExecution,
  };
  const content =
    executionsWithKeys.length > 0 ? (
      executionsWithKeys.map(({ nodeExecution, cacheKey }, index) => {
        return (
          <NodeExecutionRow
            {...rowProps}
            abortMetadata={abortMetadata}
            index={index}
            key={cacheKey}
            execution={nodeExecution}
          />
        );
      })
    ) : (
      <NoExecutionsContent size="large" />
    );

  return (
    <div className={classnames(tableStyles.tableContainer, commonStyles.flexFill)}>
      <ExecutionsTableHeader columns={columns} scrollbarPadding={scrollbarPadding} />
      <NodeExecutionsTableContext.Provider value={tableContext}>
        <div className={tableStyles.scrollContainer}>{content}</div>
      </NodeExecutionsTableContext.Provider>
      <DetailsPanel open={selectedExecution !== null} onClose={onCloseDetailsPanel}>
        {selectedExecution != null ? (
          <NodeExecutionDetailsPanelContent
            onClose={onCloseDetailsPanel}
            nodeExecutionId={selectedExecution}
          />
        ) : null}
      </DetailsPanel>
    </div>
  );
};
