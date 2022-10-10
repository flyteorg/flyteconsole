import {
  mockCompiledWorkflow,
  mockCompiledEndNode,
  mockCompiledStartNode,
  mockCompiledTaskNode,
} from 'models/__mocks__/graphWorkflowData';
import { dTypes } from 'models/Graph/types';
import {
  DISPLAY_NAME_START,
  DISPLAY_NAME_END,
  getDisplayName,
  getNodeTypeFromCompiledNode,
  isStartNode,
  isEndNode,
} from '../utils';

describe('getDisplayName', () => {
  it('should return correct name', () => {
    expect(getDisplayName(mockCompiledStartNode)).toBe(DISPLAY_NAME_START);
    expect(getDisplayName(mockCompiledEndNode)).toBe(DISPLAY_NAME_END);
    expect(getDisplayName(mockCompiledTaskNode)).toBe('DEADBEEF');
    expect(getDisplayName(mockCompiledWorkflow)).toBe('myWorkflowName');
  });
});

// TODO add tests for `launchplan` branch
describe('getNodeTypeFromCompiledNode', () => {
  const branchNode = {
    branchNode: {},
  };
  const workflowNode = {
    workflowNode: {},
  };
  const gateNode = {
    gateNode: {},
  };
  const mockBranchNode = { ...mockCompiledTaskNode, ...branchNode };
  const mockWorkflowNode = { ...mockCompiledTaskNode, ...workflowNode };
  const mockGateNode = { ...mockCompiledTaskNode, ...gateNode };

  it('should return dTypes.start when node is start-node', () => {
    expect(getNodeTypeFromCompiledNode(mockCompiledStartNode)).toBe(dTypes.start);
  });
  it('should return dTypes.end when node is end-node', () => {
    expect(getNodeTypeFromCompiledNode(mockCompiledEndNode)).toBe(dTypes.end);
  });
  it('should return *dTypes.subworkflow (branch is typed as subworkflow for graph) when node has branchNodes', () => {
    expect(getNodeTypeFromCompiledNode(mockBranchNode)).toBe(dTypes.subworkflow);
  });
  it('should return dTypes.subworkflow when node is workflowNode', () => {
    expect(getNodeTypeFromCompiledNode(mockWorkflowNode)).toBe(dTypes.subworkflow);
  });
  it('should return dTypes.task when node is taskNode', () => {
    expect(getNodeTypeFromCompiledNode(mockCompiledTaskNode)).toBe(dTypes.task);
  });
  it('should return dTypes.gateNode when node is gateNode', () => {
    expect(getNodeTypeFromCompiledNode(mockGateNode)).toBe(dTypes.gateNode);
  });
});

describe('isStartNode', () => {
  it('should return true when start-node', () => {
    expect(isStartNode(mockCompiledStartNode)).toBe(true);
  });
  it('should return false when not start-node', () => {
    expect(isStartNode(mockCompiledTaskNode)).toBe(false);
  });
});

describe('isEndNode', () => {
  it('should return true when start-node', () => {
    expect(isEndNode(mockCompiledEndNode)).toBe(true);
  });
  it('should return false when not start-node', () => {
    expect(isEndNode(mockCompiledTaskNode)).toBe(false);
  });
});

describe('getSubWorkflowFromId', () => {
  it('should return subworkflow from id', () => {
    expect(isStartNode(mockCompiledStartNode)).toBe(true);
  });
  it('should return false when not start-node', () => {
    expect(isStartNode(mockCompiledTaskNode)).toBe(false);
  });
});
