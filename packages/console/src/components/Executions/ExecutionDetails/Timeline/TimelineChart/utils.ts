import { getNodeExecutionPhaseConstants } from 'components/Executions/utils';
import { primaryTextColor } from 'components/Theme/constants';
import { NodeExecutionPhase } from 'models/Execution/enums';
import t from 'components/Executions/strings';
import { Admin } from '@flyteorg/flyteidl-types';
import { dNode } from 'models/Graph/types';
import { get, isNil, startCase, uniq } from 'lodash';
import { timestampToDate } from 'common';
import traverse from 'traverse';

export const CASHED_GREEN = 'rgba(74,227,174,0.25)'; // statusColors.SUCCESS (Mint20) with 25% opacity
export const TRANSPARENT = 'rgba(0, 0, 0, 0)';

export interface BarItemData {
  phase: NodeExecutionPhase;
  startOffsetSec: number;
  durationSec: number;
  isFromCache: boolean;
  isMapTaskCache: boolean;
}

interface ChartDataInput {
  elementsNumber: number;
  durations: number[];
  startOffset: number[];
  offsetColor: string[];
  tooltipLabel: string[][];
  barLabel: string[];
  barColor: string[];
}
/**
 * Recursively traverses span data and returns a map of nodeId/taskId to span data.
 * Example return:
 *  {
 *    "n0": [span],
 *    "n1": [span]
 *  }
 */
export const parseSpanData = (
  data: Admin.WorkflowExecutionGetMetricsResponse,
) => {
  const results: Record<string, any> = {};
  const workflowSpans = data?.span?.spans ?? [];

  const traverseSpanData = (data: any) => {
    if (data.length > 0) {
      data.forEach(span => {
        if (span.nodeId) {
          results[span.nodeId.nodeId] = [];
          span.spans.forEach((childSpan: any) => {
            if (!childSpan.nodeId && !childSpan.taskId) {
              results[span.nodeId.nodeId].push(childSpan);
            }
          });
          if (span.spans.length > 0) {
            traverseSpanData(span.spans);
          }
        } else if (span.taskId) {
          results[span.taskId.nodeExecutionId.nodeId] = [];
          span.spans.forEach((childSpan: any) => {
            if (!childSpan.nodeId && !childSpan.taskId) {
              results[span.taskId.nodeExecutionId.nodeId].push(childSpan);
            }
          });
          if (span.spans.length > 0) {
            traverseSpanData(span.spans);
          }
        } else {
          traverseSpanData(span);
        }
      });
    }
  };

  if (workflowSpans.length > 0) {
    traverseSpanData(workflowSpans);
  }
  return results;
};

/**
 * Depending on amounf of second provided shows data in
 * XhXmXs or XmXs or Xs format
 */
export const formatSecondsToHmsFormat = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * Generates chart data maps per each BarItemData ("node") section
 */
export const generateChartData = (data: BarItemData[]): ChartDataInput => {
  const durations: number[] = [];
  const startOffset: number[] = [];
  const offsetColor: string[] = [];
  const tooltipLabel: string[][] = [];
  const barLabel: string[] = [];
  const barColor: string[] = [];

  data.forEach(element => {
    const phaseConstant = getNodeExecutionPhaseConstants(
      element.phase ?? NodeExecutionPhase.UNDEFINED,
    );

    const durationString = formatSecondsToHmsFormat(element.durationSec);
    const tooltipString = `${phaseConstant.text}: ${durationString}`;
    // don't show Label if there is now duration yet.
    const labelString = element.durationSec > 0 ? durationString : '';

    const generateTooltipLabelText = (element: BarItemData): string[] => {
      if (element.isMapTaskCache) return [tooltipString, t('mapCacheMessage')];
      if (element.isFromCache) return [tooltipString, t('readFromCache')];

      return [tooltipString];
    };

    const generateBarLabelText = (element: BarItemData): string => {
      if (element.isMapTaskCache) return '\u229A ' + t('mapCacheMessage');
      if (element.isFromCache) return '\u229A ' + t('fromCache');
      return labelString;
    };

    durations.push(element.durationSec);
    startOffset.push(element.startOffsetSec);
    offsetColor.push(element.isFromCache ? CASHED_GREEN : TRANSPARENT);
    tooltipLabel.push(generateTooltipLabelText(element));
    barLabel.push(generateBarLabelText(element));
    barColor.push(phaseConstant.badgeColor);
  });

  return {
    elementsNumber: data.length,
    durations,
    startOffset,
    offsetColor,
    tooltipLabel,
    barLabel,
    barColor,
  };
};

export const getExecutionMetricsData = (
  data: Admin.WorkflowExecutionGetMetricsResponse,
  nodes: dNode[],
): { operationIds: string[]; operations: Record<string, number[]> } => {
  const operationIds = uniq(
    traverse(data)
      .paths()
      .filter(path => path.at(-1) === 'operationId')
      .map(path => get(data, path)),
  );

  const operations = operationIds.reduce<Record<string, any>>(
    (acc, operation) => {
      acc[operation] = [];

      return acc;
    },
    {} as any,
  );

  if (isNil(data.span)) {
    return { operationIds, operations };
  }

  const tree = traverse(data.span);
  const paths = tree.paths();

  for (const node of nodes) {
    const spanPath = paths
      .find(path => {
        if (path.length < 2) {
          return false;
        }

        if (path.at(-2) !== 'nodeId' || path.at(-1) !== 'nodeId') {
          return false;
        }

        return get(data.span, path) === node.id;
      })
      ?.slice(0, -2);

    const nodeSpans = (spanPath && get(data.span, spanPath)?.spans) ?? [];

    for (const operationId of operationIds) {
      const operationSpan = nodeSpans.find(
        span => span.operationId === operationId,
      );

      if (!operationSpan || !operationSpan.startTime) {
        operations[operationId].push(0);
        continue;
      }

      const endTime = operationSpan.endTime
        ? timestampToDate(operationSpan.endTime).getTime()
        : Date.now();

      const duration =
        endTime - timestampToDate(operationSpan.startTime).getTime();

      operations[operationId].push(duration / 1000);
    }
  }

  return {
    operationIds,
    operations,
  };
};

export const getExecutionMetricsTooltips = (
  nodes: dNode[],
  operationIds: string[],
  operations: Record<string, number[]>,
) => {
  return nodes.map((node, idx) => {
    const tooltipText: string[] = [];

    operationIds.map(operationId => {
      const operationLabel = startCase(
        operationId.toLowerCase().split('_').join(' '),
      );
      tooltipText.push(`${operationLabel}: ${operations[operationId][idx]}`);
    });

    return tooltipText;
  });
};

/**
 * Generates chart data format suitable for Chart.js Bar. Each bar consists of two data items:
 * |-----------|XXXXXXXXXXXXXXXX|
 * |-|XXXXXX|
 * |------|XXXXXXXXXXXXX|
 * Where |---| is offset - usually transparent part to give user a feeling that timeline wasn't started from ZERO time position
 * Where |XXX| is duration of the operation, colored per step Phase status.
 */
export const getChartData = (
  data: ChartDataInput,
  executionMetrics: Record<string, number[]>,
) => {
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
        borderColor: 'rgba(0, 0, 0, 0.55)',
        borderWidth: {
          top: 0,
          left: 0,
          right: 1,
          bottom: 0,
        },
        datalabels: {
          // Positioning info - https://chartjs-plugin-datalabels.netlify.app/guide/positioning.html
          color: primaryTextColor,
          align: 'end' as const, // related to text
          anchor: 'start' as const, // related to bar
          formatter: function (value, context) {
            return data.barLabel[context.dataIndex] ?? '';
          },
        },
      },
      // ...Object.entries(executionMetrics).map(([_, d], idx) => ({
      //   ...defaultStyle,
      //   data: d,
      //   backgroundColor: data.barColor,
      //   borderColor: 'rgba(0, 0, 0, 0.55)',
      //   borderWidth: {
      //     top: 0,
      //     left: 0,
      //     right: 1,
      //     bottom: 0,
      //   },
      //   datalabels: {
      //     color: primaryTextColor,
      //     align: 'end' as const, // related to text
      //     anchor: 'start' as const, // related to bar
      //     formatter: function (value, context) {
      //       return value > 0.01 ? `${value}s` : '';
      //     },
      //   },
      // })),
    ],
  };
};
