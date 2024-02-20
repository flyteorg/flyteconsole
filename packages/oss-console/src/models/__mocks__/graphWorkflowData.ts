/* eslint-disable global-require */
import { CompiledNode } from '../Node/types';
import { WorkflowTemplate, CompiledWorkflow, CompiledWorkflowClosure } from '../Workflow/types';

export const workflowData = require('./simpleWorkflowClosure.json');

export const mockCompiledWorkflowClosure: CompiledWorkflowClosure = workflowData.compiledWorkflow;

export const mockCompiledWorkflow: CompiledWorkflow = mockCompiledWorkflowClosure.primary;

export const mockTemplate: WorkflowTemplate = mockCompiledWorkflowClosure.primary.template;

export const mockNodesList: CompiledNode[] = mockTemplate.nodes;
export const mockCompiledStartNode: CompiledNode = mockNodesList[0];
export const mockCompiledEndNode: CompiledNode = mockNodesList[1];
export const mockCompiledTaskNode: CompiledNode = mockNodesList[2];
