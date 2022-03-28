import { timestampToDate } from 'common/utils';
import { CatalogCacheStatus, NodeExecutionPhase } from 'models/Execution/enums';
import { dNode } from 'models/Graph/types';
import { BarItemData } from './utils';

const EMPTY_BAR_ITEM: BarItemData = {
  phase: NodeExecutionPhase.UNDEFINED,
  startOffsetSec: 0,
  durationSec: 0,
  isFromCache: false,
};

export const getChartDurationData = (nodes: dNode[], startedAt: Date): BarItemData[] => {
  if (nodes.length === 0) return [];

  const initialStartTime = startedAt.getTime();
  const result: BarItemData[] = nodes.map(({ execution }) => {
    if (!execution) {
      return EMPTY_BAR_ITEM;
    }

    const phase = execution.closure.phase;
    const isFromCache =
      execution.closure.taskNodeMetadata?.cacheStatus === CatalogCacheStatus.CACHE_HIT;

    // Offset values
    let startOffset = 0;
    const startedAt = execution.closure.startedAt;
    if (isFromCache) {
      if (execution.closure.createdAt) {
        startOffset = timestampToDate(execution.closure.createdAt).getTime() - initialStartTime;
      }
    } else if (startedAt) {
      startOffset = timestampToDate(startedAt).getTime() - initialStartTime;
    }

    // duration
    let durationSec = 0;
    if (isFromCache) {
      const updatedAt = execution.closure.updatedAt?.seconds?.toNumber() ?? 0;
      const createdAt = execution.closure.createdAt?.seconds?.toNumber() ?? 0;
      durationSec = updatedAt - createdAt;
      durationSec = durationSec === 0 ? 2 : durationSec;
    } else if (phase === NodeExecutionPhase.RUNNING) {
      // we need to add check if parents are failed - workflow status - ?
      if (startedAt) {
        const duration = Date.now() - timestampToDate(startedAt).getTime();
        durationSec = duration / 1000;
      }
    } else {
      durationSec = execution.closure.duration?.seconds?.toNumber() ?? 0;
    }

    return { phase, startOffsetSec: startOffset / 1000, durationSec, isFromCache };
  });

  // Do we want to get initialStartTime from different place, to avoid recalculating it.
  return result;
};
