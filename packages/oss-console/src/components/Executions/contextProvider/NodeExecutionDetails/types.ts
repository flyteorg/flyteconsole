import { NodeExecutionDisplayType } from '../../types';
import { NodeExecutionInfo } from '../../../WorkflowGraph/utils';

export const UNKNOWN_DETAILS: NodeExecutionInfo = {
  displayId: 'unknownNode',
  displayName: 'unknownTask',
  displayType: NodeExecutionDisplayType.Unknown,
};
