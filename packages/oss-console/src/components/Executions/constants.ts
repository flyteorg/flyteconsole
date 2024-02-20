import { palette } from '@clients/theme/Theme/muiTheme';
import * as CommonStylesConstants from '@clients/theme/CommonStyles/constants';
import {
  CatalogCacheStatus,
  NodeExecutionPhase,
  TaskExecutionPhase,
  WorkflowExecutionPhase,
} from '../../models/Execution/enums';
import { TaskType } from '../../models/Task/constants';
import t from './strings';
import { ExecutionPhaseConstants, NodeExecutionDisplayType } from './types';

export const executionRefreshIntervalMs = 10000;
export const nodeExecutionRefreshIntervalMs = 3000;
export const noLogsFoundString = t('noLogsFoundString');

/** Shared values for color/text/etc for each execution phase */
export const workflowExecutionPhaseConstants = (): {
  [key in WorkflowExecutionPhase]: ExecutionPhaseConstants;
} => ({
  [WorkflowExecutionPhase.ABORTED]: {
    text: t('aborted'),
    value: 'ABORTED',
    badgeColor: palette.state.aborted,
    nodeColor: palette.state.aborted,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [WorkflowExecutionPhase.ABORTING]: {
    text: t('aborting'),
    value: 'ABORTING',
    badgeColor: palette.state.aborting,
    nodeColor: palette.state.aborting,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [WorkflowExecutionPhase.FAILING]: {
    text: t('failing'),
    value: 'FAILING',
    badgeColor: palette.state.failing,
    nodeColor: palette.state.failing,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [WorkflowExecutionPhase.FAILED]: {
    text: t('failed'),
    value: 'FAILED',
    badgeColor: palette.state.failed,
    nodeColor: palette.state.failed,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [WorkflowExecutionPhase.QUEUED]: {
    text: t('queued'),
    value: 'QUEUED',
    badgeColor: palette.state.queued,
    nodeColor: palette.state.queued,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [WorkflowExecutionPhase.RUNNING]: {
    text: t('running'),
    value: 'RUNNING',
    badgeColor: palette.state.running,
    nodeColor: palette.state.running,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [WorkflowExecutionPhase.SUCCEEDED]: {
    text: t('succeeded'),
    value: 'SUCCEEDED',
    badgeColor: palette.state.succeeded,
    nodeColor: palette.state.succeeded,
    textColor: CommonStylesConstants.positiveTextColor,
  },
  [WorkflowExecutionPhase.SUCCEEDING]: {
    text: t('succeeding'),
    value: 'SUCCEEDING',
    badgeColor: palette.state.succeeded,
    nodeColor: palette.state.succeeded,
    textColor: CommonStylesConstants.positiveTextColor,
  },
  [WorkflowExecutionPhase.TIMED_OUT]: {
    text: t('timedOut'),
    value: 'TIMED_OUT',
    badgeColor: palette.state.timedout,
    nodeColor: palette.state.timedout,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [WorkflowExecutionPhase.UNDEFINED]: {
    text: t('unknown'),
    value: 'UNDEFINED',
    badgeColor: palette.state.undefined,
    nodeColor: palette.state.undefined,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
});

/** Shared values for color/text/etc for each node execution phase */
export const nodeExecutionPhaseConstants = (): {
  [key in NodeExecutionPhase]: ExecutionPhaseConstants;
} => ({
  [NodeExecutionPhase.ABORTED]: {
    text: t('aborted'),
    value: 'ABORTED',
    badgeColor: palette.state.aborted,
    nodeColor: palette.state.aborted,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [NodeExecutionPhase.FAILING]: {
    text: t('failing'),
    value: 'FAILING',
    badgeColor: palette.state.failing,
    nodeColor: palette.state.failing,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [NodeExecutionPhase.FAILED]: {
    text: t('failed'),
    value: 'FAILED',
    badgeColor: palette.state.failed,
    nodeColor: palette.state.failed,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [NodeExecutionPhase.QUEUED]: {
    text: t('queued'),
    value: 'QUEUED',
    badgeColor: palette.state.queued,
    nodeColor: palette.state.queued,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [NodeExecutionPhase.RUNNING]: {
    text: t('running'),
    value: 'RUNNING',
    badgeColor: palette.state.running,
    nodeColor: palette.state.running,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [NodeExecutionPhase.DYNAMIC_RUNNING]: {
    text: t('running'),
    value: 'RUNNING',
    badgeColor: palette.state.dynamicrunning,
    nodeColor: palette.state.dynamicrunning,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [NodeExecutionPhase.SUCCEEDED]: {
    text: t('succeeded'),
    value: 'SUCCEEDED',
    badgeColor: palette.state.succeeded,
    nodeColor: palette.state.succeeded,
    textColor: CommonStylesConstants.positiveTextColor,
  },
  [NodeExecutionPhase.TIMED_OUT]: {
    text: t('timedOut'),
    value: 'TIMED_OUT',
    badgeColor: palette.state.timedout,
    nodeColor: palette.state.timedout,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [NodeExecutionPhase.SKIPPED]: {
    text: t('skipped'),
    value: 'SKIPPED',
    badgeColor: palette.state.skipped,
    nodeColor: palette.state.skipped,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [NodeExecutionPhase.RECOVERED]: {
    text: t('recovered'),
    value: 'RECOVERED',
    badgeColor: palette.state.recovered,
    nodeColor: palette.state.recovered,
    textColor: CommonStylesConstants.positiveTextColor,
  },
  [NodeExecutionPhase.PAUSED]: {
    text: t('paused'),
    value: 'PAUSED',
    badgeColor: palette.state.paused,
    nodeColor: palette.state.paused,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [NodeExecutionPhase.UNDEFINED]: {
    text: t('unknown'),
    value: 'UNDEFINED',
    badgeColor: palette.state.undefined,
    nodeColor: palette.state.undefined,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
});

/** Shared values for color/text/etc for each node execution phase */
export const taskExecutionPhaseConstants = (): {
  [key in TaskExecutionPhase]: ExecutionPhaseConstants;
} => ({
  [TaskExecutionPhase.ABORTED]: {
    text: t('aborted'),
    value: 'ABORTED',
    badgeColor: palette.state.aborted,
    nodeColor: palette.state.aborted,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [TaskExecutionPhase.FAILED]: {
    text: t('failed'),
    value: 'FAILED',
    badgeColor: palette.state.failed,
    nodeColor: palette.state.failed,
    textColor: CommonStylesConstants.negativeTextColor,
  },
  [TaskExecutionPhase.WAITING_FOR_RESOURCES]: {
    text: t('waiting'),
    value: 'WAITING',
    badgeColor: palette.state.waiting,
    nodeColor: palette.state.waiting,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [TaskExecutionPhase.QUEUED]: {
    text: t('queued'),
    value: 'QUEUED',
    badgeColor: palette.state.queued,
    nodeColor: palette.state.queued,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [TaskExecutionPhase.INITIALIZING]: {
    text: t('initializing'),
    value: 'INITIALIZING',
    badgeColor: palette.state.initializing,
    nodeColor: palette.state.initializing,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [TaskExecutionPhase.RUNNING]: {
    text: t('running'),
    value: 'RUNNING',
    badgeColor: palette.state.running,
    nodeColor: palette.state.running,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
  [TaskExecutionPhase.SUCCEEDED]: {
    text: t('succeeded'),
    value: 'SUCCEEDED',
    badgeColor: palette.state.succeeded,
    nodeColor: palette.state.succeeded,
    textColor: CommonStylesConstants.positiveTextColor,
  },
  [TaskExecutionPhase.UNDEFINED]: {
    text: t('unknown'),
    value: 'UNDEFINED',
    badgeColor: palette.state.undefined,
    nodeColor: palette.state.undefined,
    textColor: CommonStylesConstants.secondaryTextColor,
  },
});

export const taskTypeToNodeExecutionDisplayType: {
  [k in TaskType]: NodeExecutionDisplayType;
} = {
  [TaskType.ARRAY]: NodeExecutionDisplayType.MapTask,
  [TaskType.BATCH_HIVE]: NodeExecutionDisplayType.BatchHiveTask,
  [TaskType.DYNAMIC]: NodeExecutionDisplayType.DynamicTask,
  [TaskType.HIVE]: NodeExecutionDisplayType.HiveTask,
  [TaskType.PYTHON]: NodeExecutionDisplayType.PythonTask,
  [TaskType.SIDECAR]: NodeExecutionDisplayType.SidecarTask,
  [TaskType.SPARK]: NodeExecutionDisplayType.SparkTask,
  [TaskType.UNKNOWN]: NodeExecutionDisplayType.UnknownTask,
  [TaskType.WAITABLE]: NodeExecutionDisplayType.WaitableTask,
  [TaskType.MPI]: NodeExecutionDisplayType.MpiTask,
  [TaskType.ARRAY_AWS]: NodeExecutionDisplayType.ARRAY_AWS,
  [TaskType.ARRAY_K8S]: NodeExecutionDisplayType.ARRAY_K8S,
  [TaskType.BRANCH]: NodeExecutionDisplayType.BranchNode,
};

export const cacheStatusMessages: { [k in CatalogCacheStatus]: string } = {
  [CatalogCacheStatus.CACHE_DISABLED]: t('cacheDisabledMessage'),
  [CatalogCacheStatus.CACHE_HIT]: t('cacheHitMessage'),
  [CatalogCacheStatus.CACHE_LOOKUP_FAILURE]: t('cacheLookupFailureMessage'),
  [CatalogCacheStatus.CACHE_MISS]: t('cacheMissMessage'),
  [CatalogCacheStatus.CACHE_POPULATED]: t('cachePopulatedMessage'),
  [CatalogCacheStatus.CACHE_PUT_FAILURE]: t('cachePutFailure'),
  [CatalogCacheStatus.MAP_CACHE]: t('mapCacheMessage'),
  [CatalogCacheStatus.CACHE_SKIPPED]: t('cacheSkippedMessage'),
  [CatalogCacheStatus.CACHE_EVICTED]: t('cacheEvictedMessage'),
};
export const unknownCacheStatusString = t('unknownCacheStatusString');
export const viewSourceExecutionString = t('viewSourceExecutionString');
