/* eslint-disable no-restricted-syntax */
import React, { MouseEventHandler, PropsWithChildren } from 'react';
import classNames from 'classnames';
import {
  NodeExecutionDynamicProvider,
  useNodeExecutionDynamicContext,
} from '../../Executions/contextProvider/NodeExecutionDetails/NodeExecutionDynamicProvider';
import { dNode } from '../../../models/Graph/types';
import { useNodeExecutionsById } from '../../Executions/contextProvider/NodeExecutionDetails/WorkflowNodeExecutionsProvider';
import { findNodeInDag } from './utils';
import { RFCustomData } from './types';
import { NodeExecutionPhase } from '../../../models/Execution/enums';
import { getNodeExecutionStatusClassName } from '../../utils/classes';

export interface BreadElementProps {
  nestedView?: string;
  index?: number;
  currentNestedDepth: number;
  scopedId: string;
  onClick: MouseEventHandler<HTMLLIElement>;
}
export const BreadElement = ({
  nestedView,
  index,
  currentNestedDepth,
  scopedId,
  onClick,
}: BreadElementProps) => {
  return (
    <li
      onClick={onClick}
      className={index === currentNestedDepth - 1 ? 'inactive' : 'active'}
      id={`${scopedId}_${index}`}
      key={`${scopedId}_${index}key`}
    >
      {nestedView}
    </li>
  );
};

const BorderElement = ({
  node,
  initialNodeExecutionStatus,
  children,
}: PropsWithChildren<{
  node: dNode;
  initialNodeExecutionStatus: NodeExecutionPhase;
}>) => {
  const { componentProps } = useNodeExecutionDynamicContext();
  const { nodeExecutionsById } = useNodeExecutionsById();

  const nodeExecution = nodeExecutionsById[node?.scopedId];
  const nodeExecutionStatus = nodeExecution?.closure.phase || initialNodeExecutionStatus;

  return (
    <div
      className={classNames(
        'border',
        getNodeExecutionStatusClassName('border', nodeExecutionStatus),
      )}
      {...componentProps}
    >
      {children}
    </div>
  );
};

export const BorderContainer = ({
  data,
  children,
}: PropsWithChildren<{
  data: RFCustomData;
}>) => {
  const { node, currentNestedView, nodeExecutionStatus } = data;

  let contextNode = node;
  let borders = (
    <BorderElement node={node} initialNodeExecutionStatus={nodeExecutionStatus}>
      {children}
    </BorderElement>
  );
  for (const view of currentNestedView || []) {
    contextNode = findNodeInDag(view, contextNode);

    borders = contextNode ? (
      <NodeExecutionDynamicProvider node={contextNode}>
        <BorderElement node={contextNode!} initialNodeExecutionStatus={nodeExecutionStatus}>
          {borders}
        </BorderElement>
      </NodeExecutionDynamicProvider>
    ) : (
      <BorderElement node={contextNode!} initialNodeExecutionStatus={nodeExecutionStatus}>
        {borders}
      </BorderElement>
    );
  }
  return borders;
};

export const BreadCrumbContainer = ({
  text,
  currentNestedDepth,
  handleRootClick,
  children,
}: PropsWithChildren<{
  text: string;
  currentNestedDepth: number;
  handleRootClick: () => void;
}>) => {
  const { componentProps } = useNodeExecutionDynamicContext();
  const rootClick = currentNestedDepth > 0 ? handleRootClick : undefined;
  return (
    <div className="breadcrumb" {...componentProps}>
      <header
        onClick={(e) => {
          e.stopPropagation();
          rootClick?.();
        }}
      >
        {text}
      </header>
      <ol>{children}</ol>
    </div>
  );
};
