/* eslint-disable no-param-reassign */
import Protobuf from '@clients/common/flyteidl/protobuf';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import moment from 'moment';
import { type ChartData } from 'chart.js';
import t from '../../../strings';
import { NodeExecutionPhase } from '../../../../../models/Execution/enums';
import { getNodeExecutionPhaseConstants } from '../../../utils';
import { timestampToDate } from '../../../../../common/utils';
import { Span, WorkflowExecutionGetMetricsResponse } from '../../../../../models/Execution/types';

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
 *    "n0": [span, span, span],
 *    "n1": [span, span]
 *  }
 */
export const parseSpanData = (data: WorkflowExecutionGetMetricsResponse) => {
  const results: Record<string, Span[]> = {};
  const workflowSpans = data?.span ?? {};

  const traverseSpanData = (rootSpan: Span) => {
    const spanNodeId =
      rootSpan.nodeId?.nodeId ||
      rootSpan.taskId?.nodeExecutionId?.nodeId ||
      rootSpan.workflowId?.name ||
      '';

    if (!results[spanNodeId]) {
      results[spanNodeId] = [];
    }

    if (rootSpan.spans?.length > 0) {
      rootSpan.spans.forEach((span) => {
        /* Recurse if taskId/nodeId; else add to record */
        if (span.nodeId?.nodeId || span.taskId?.nodeExecutionId?.nodeId) {
          traverseSpanData(span);
        } else {
          results[spanNodeId].push(span);
        }
      });
    }
  };
  traverseSpanData(workflowSpans);
  return results;
};

/**
 * Depending on amounf of second provided shows data in
 * XhXmXs or XmXs or Xs format
 */
export const formatSecondsToHmsFormat = (seconds: number) => {
  moment.defaultFormatUtc = 'YYYY-MM-DD HH:mm:ss';
  const hours = Math.floor(seconds / (60 * 60));
  let remainingSeconds = seconds % (60 * 60);
  const minutes = Math.floor(remainingSeconds / 60);
  remainingSeconds = Number((seconds % 60).toFixed(2));
  const sections: string[] = [];
  // show hours only if there is hours
  if (hours) {
    sections.push(`${hours}h`);
  }
  // show minutes only if there is minutes or hours and seconds
  if (minutes || (hours && remainingSeconds)) {
    sections.push(`${minutes}m`);
  }
  // show seconds only if there is seconds or there is no hours and minutes
  if (remainingSeconds || (!hours && !minutes)) {
    sections.push(`${remainingSeconds}s`);
  }

  return sections.join(' ');
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

  data.forEach((element) => {
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
      if (element.isMapTaskCache) return `\u229A ${t('mapCacheMessage')}`;
      if (element.isFromCache) return `\u229A ${t('fromCache')}`;
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

export const getDuration = (
  startTime?: Protobuf.ITimestamp | null,
  endTime?: Protobuf.ITimestamp | null,
) => {
  if (!startTime) return 0;

  const endTimeInMS = endTime ? timestampToDate(endTime).getTime() : Date.now();
  const duration = endTimeInMS - timestampToDate(startTime).getTime();
  return duration;
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

  const final: ChartData<'bar', number[]> = {
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
          color: CommonStylesConstants.primaryTextColor,
          padding: 12,
          align: 'end' as const, // related to text
          anchor: 'start' as const, // related to bar
          formatter(_, context) {
            return `${data.barLabel[context.dataIndex] ?? ''}`;
          },
        },
      },
    ],
  };

  return final;
};
