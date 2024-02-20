import { type Theme } from '@mui/material/styles';

export function calculateNodeExecutionRowLeftSpacing(level: number, spacing: Theme['spacing']) {
  return spacing(level * 2);
}
