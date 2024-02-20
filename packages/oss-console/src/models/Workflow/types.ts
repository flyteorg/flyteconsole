import Admin from '@clients/common/flyteidl/admin';
import Core from '@clients/common/flyteidl/core';

import { Identifier, TypedInterface } from '../Common/types';
import { CompiledNode, ConnectionSet } from '../Node/types';
import { CompiledTask } from '../Task/types';

/** Holds information about all nodes existing in a Workflow graph */
export interface WorkflowTemplate extends Core.IWorkflowTemplate {
  id: Identifier;
  interface?: TypedInterface;
  nodes: CompiledNode[];
}

/** A serialized representation of the nodes/connections which exist in a given
 * version of a Workflow
 */
export interface CompiledWorkflow extends Core.ICompiledWorkflow {
  template: WorkflowTemplate;
  connections: ConnectionSet;
}

/** A serialized representation of all information needed to execute a specific
 * workflow graph.
 */
export interface CompiledWorkflowClosure extends Core.ICompiledWorkflowClosure {
  primary: CompiledWorkflow;
  subWorkflows?: CompiledWorkflow[];
  tasks: CompiledTask[];
}

/** A serialized representation of all information about a specific workflow
 * version.
 */
export interface WorkflowClosure extends Admin.IWorkflowClosure {
  compiledWorkflow?: CompiledWorkflowClosure;
}

export interface Workflow extends Admin.IWorkflow {
  closure?: WorkflowClosure;
  id: Identifier;
  shortDescription?: string;
}

export type WorkflowId = Identifier;
