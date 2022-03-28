import { getNodeExecutionPhaseConstants } from 'components/Executions/utils';
import { primaryTextColor } from 'components/Theme/constants';
import { NodeExecutionPhase } from 'models/Execution/enums';

const CASHED_GREEN = 'rgba(74,227,174,0.25)'; // statusColors.SUCCESS (Mint20) with 25% opacity
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

export interface BarItemData {
  phase: NodeExecutionPhase;
  startOffsetSec: number;
  durationSec: number;
  isFromCache: boolean;
}

interface ChartDataInput {
  elementsNumber: number;
  totalDurationSec: number;
  durations: number[];
  startOffset: number[];
  offsetColor: string[];
  barLabel: string[];
  barColor: string[];
}

// narusina - check if exports are still needed
export const getOffsetColor = (isCachedValue: boolean[]) => {
  const colors = isCachedValue.map((val) => (val === true ? CASHED_GREEN : TRANSPARENT));
  return colors;
};

/**
 * Generates chart data maps per each BarItemData ("node") section
 */
export const generateChartData = (data: BarItemData[]): ChartDataInput => {
  const durations: number[] = [];
  const startOffset: number[] = [];
  const offsetColor: string[] = [];
  const barLabel: string[] = [];
  const barColor: string[] = [];

  let totalDurationSec = 0;
  data.forEach((element) => {
    durations.push(element.durationSec);
    startOffset.push(element.startOffsetSec);
    offsetColor.push(element.isFromCache ? CASHED_GREEN : TRANSPARENT);
    barLabel.push(element.isFromCache ? 'From cache' : `${Math.round(element.durationSec)}s`);
    barColor.push(
      getNodeExecutionPhaseConstants(element.phase ?? NodeExecutionPhase.UNDEFINED).badgeColor,
    );

    totalDurationSec = Math.max(totalDurationSec, element.startOffsetSec + element.durationSec);
  });
  const elementsNumber = data.length;
  return {
    elementsNumber,
    totalDurationSec,
    durations,
    startOffset,
    offsetColor,
    barLabel,
    barColor,
  };
};

/**
 * Generates chart data format suitable for Chart.js Bar. Each bar consists of two data items:
 * |-----------|XXXXXXXXXXXXXXXX|
 * |-|XXXXXX|
 * |------|XXXXXXXXXXXXX|
 * Where |---| is offset - usually transparent part to give user a feeling that timeline wasn't started from ZERO time position
 * Where |XXX| is duration of the operation, colored per step Phase status.
 */
export const getChartData = (data: ChartDataInput) => {
  const defaultStyle = {
    barPercentage: 1,
    borderWidth: 0,
  };

  return {
    labels: Array(data.elementsNumber).fill(''), // clear up Chart Bar default labels
    datasets: [
      // fill-in offsets
      {
        ...defaultStyle,
        data: data.startOffset,
        backgroundColor: data.offsetColor,
        datalabels: {
          labels: {
            title: null,
          },
        },
      },
      // fill in duration bars
      {
        ...defaultStyle,
        data: data.durations,
        backgroundColor: data.barColor,
        datalabels: {
          // Positioning info - https://chartjs-plugin-datalabels.netlify.app/guide/positioning.html
          color: primaryTextColor,
          align: 'end' as const, // related to text
          anchor: 'start' as const, // related to bar
          formatter: function (value, context) {
            return data.offsetColor[context.dataIndex] === CASHED_GREEN
              ? '\u229A From Cache'
              : `${Math.round(value)}s`;
          },
        },
      },
    ],
  };
};
