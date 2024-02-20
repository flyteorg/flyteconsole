import { nodeExecutionPhaseConstants } from '../../../Executions/constants';
import { NodeExecutionPhase } from '../../../../models/Execution/enums';
import { getNodeExecutionStatusClassName } from '../../../utils/classes';
import { stateColors } from '../../../utils/GlobalStyles';

const data = [
  // input, expected
  [NodeExecutionPhase.FAILED, nodeExecutionPhaseConstants()[NodeExecutionPhase.FAILED].nodeColor],
  [NodeExecutionPhase.FAILING, nodeExecutionPhaseConstants()[NodeExecutionPhase.FAILING].nodeColor],
  [
    NodeExecutionPhase.SUCCEEDED,
    nodeExecutionPhaseConstants()[NodeExecutionPhase.SUCCEEDED].nodeColor,
  ],
  [NodeExecutionPhase.ABORTED, nodeExecutionPhaseConstants()[NodeExecutionPhase.ABORTED].nodeColor],
  [NodeExecutionPhase.RUNNING, nodeExecutionPhaseConstants()[NodeExecutionPhase.RUNNING].nodeColor],
  [NodeExecutionPhase.QUEUED, nodeExecutionPhaseConstants()[NodeExecutionPhase.QUEUED].nodeColor],
  [NodeExecutionPhase.PAUSED, nodeExecutionPhaseConstants()[NodeExecutionPhase.PAUSED].nodeColor],
  [
    NodeExecutionPhase.UNDEFINED,
    nodeExecutionPhaseConstants()[NodeExecutionPhase.UNDEFINED].nodeColor,
  ],
];

describe('getStatusColor', () => {
  for (let i = 0; i < data.length; i++) {
    // eslint-disable-next-line no-loop-func
    it(`expeced nodeExecutionStatus colors ${data[i][0]}`, () => {
      const testCase = data[i];
      const result = getNodeExecutionStatusClassName('border', testCase[0] as NodeExecutionPhase);
      const resultCssSnippet = stateColors.find((cssDef) => {
        return cssDef.includes(result);
      });
      expect(resultCssSnippet).toBeTruthy();

      const isCSSColorCorrect = resultCssSnippet?.includes(testCase[1] as string);
      expect(isCSSColorCorrect).toBeTruthy();
    });
  }
});
