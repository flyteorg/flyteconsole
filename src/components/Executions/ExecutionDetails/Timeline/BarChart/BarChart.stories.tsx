import { ComponentMeta, ComponentStory } from '@storybook/react';
import * as React from 'react';
import { Bar } from 'react-chartjs-2';
import { NodeExecutionPhase } from 'models/Execution/enums';
import { generateChartData, getChartData } from './utils';
import { getBarOptions } from './barOptions';

const isFromCache = [false, true, true, false, false, false];
const phaseStatus = [
  NodeExecutionPhase.FAILED,
  NodeExecutionPhase.SUCCEEDED,
  NodeExecutionPhase.SUCCEEDED,
  NodeExecutionPhase.RUNNING,
  NodeExecutionPhase.UNDEFINED,
  NodeExecutionPhase.SUCCEEDED,
];

const barItems = [
  { phase: phaseStatus[0], startOffsetSec: 0, durationSec: 5, isFromCache: isFromCache[0] },
  { phase: phaseStatus[1], startOffsetSec: 10, durationSec: 2, isFromCache: isFromCache[1] },
  { phase: phaseStatus[2], startOffsetSec: 0, durationSec: 1, isFromCache: isFromCache[2] },
  { phase: phaseStatus[3], startOffsetSec: 0, durationSec: 10, isFromCache: isFromCache[3] },
  { phase: phaseStatus[4], startOffsetSec: 15, durationSec: 25, isFromCache: isFromCache[4] },
  { phase: phaseStatus[5], startOffsetSec: 7, durationSec: 20, isFromCache: isFromCache[5] },
];

export default {
  title: 'Workflow/Timeline',
  component: Bar,
} as ComponentMeta<typeof Bar>;

const Template: ComponentStory<typeof Bar> = (args) => <Bar {...args} />;
export const BarSingle = Template.bind({});
const phaseDataSingle = generateChartData([barItems[0]]);
BarSingle.args = {
  options: getBarOptions(1, phaseDataSingle.tooltipLabel) as any,
  data: getChartData(phaseDataSingle),
};

export const BarSection = () => {
  const phaseData = generateChartData(barItems);
  // Chart interval - 1s
  return (
    <Bar options={getBarOptions(1, phaseData.tooltipLabel) as any} data={getChartData(phaseData)} />
  );
};
