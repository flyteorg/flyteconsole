import { Spacing } from '@material-ui/core/styles/createSpacing';
import { nameColumnLeftMarginGridWidth } from './styles';

export function calculateNodeExecutionRowLeftSpacing(level: number, spacing: Spacing) {
  return spacing(nameColumnLeftMarginGridWidth + 3 * level);
}

export function selectExecution(state, nodeExecution) {
  // use null in case if there is no execution provied - to close panel
  state.setSelectedExecution(nodeExecution?.id ?? null);
}
