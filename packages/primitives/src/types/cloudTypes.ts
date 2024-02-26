interface OrgStats {
  userCount: string;
  appCount: string;
}

export interface OrgInfo {
  org: {
    orgId: string;
    orgName: string;
    orgAdminUrl: string;
    stats: OrgStats;
  };
}

export enum MeasureAggregation {
  MEASURE_AGGREGATION_SUM = 'MEASURE_AGGREGATION_SUM',
  MEASURE_AGGREGATION_MIN = 'MEASURE_AGGREGATION_MIN',
  MEASURE_AGGREGATION_MAX = 'MEASURE_AGGREGATION_MAX',
  MEASURE_AGGREGATION_AVG = 'MEASURE_AGGREGATION_AVG',
}

export enum CustomMeasureType {
  MEASURE_WORKFLOW_EXECUTION_QUEUED = 'MEASURE_WORKFLOW_EXECUTION_QUEUED',
  MEASURE_WORKFLOW_EXECUTION_RUNNING = 'MEASURE_WORKFLOW_EXECUTION_RUNNING',
  MEASURE_TASK_EXECUTION_INITIALIZING = 'MEASURE_TASK_EXECUTION_INITIALIZING',
  MEASURE_TASK_EXECUTION_QUEUED = 'MEASURE_TASK_EXECUTION_QUEUED',
  MEASURE_TASK_EXECUTION_RUNNING = 'MEASURE_TASK_EXECUTION_RUNNING',
  MEASURE_TASK_EXECUTION_WAITING_FOR_RESOURCES = 'MEASURE_TASK_EXECUTION_WAITING_FOR_RESOURCES',
  workflow_FAILED = 'workflow_FAILED',
  workflow_SUCCEEDED = 'workflow_SUCCEEDED',
  workflow_TIMED_OUT = 'workflow_TIMED_OUT',
  workflow_ABORTED = 'workflow_ABORTED',
  node_FAILED = 'node_FAILED',
  node_SUCCEEDED = 'node_SUCCEEDED',
  node_TIMED_OUT = 'node_TIMED_OUT',
  node_ABORTED = 'node_ABORTED',
  MEASURE_CAPACITY_CPU = 'MEASURE_CAPACITY_CPU',
  MEASURE_CAPACITY_EPHEMERAL_STORAGE = 'MEASURE_CAPACITY_EPHEMERAL_STORAGE',
  MEASURE_CAPACITY_GPU = 'MEASURE_CAPACITY_GPU',
  MEASURE_CAPACITY_MEMORY_BYTE = 'MEASURE_CAPACITY_MEMORY_BYTE',
  MEASURE_CONSUMED_NANOCPU = 'MEASURE_CONSUMED_NANOCPU',
  MEASURE_CONSUMED_EPHEMERAL_STORAGE = 'MEASURE_CONSUMED_EPHEMERAL_STORAGE',
  MEASURE_CONSUMED_NANOGPU = 'MEASURE_CONSUMED_NANOGPU',
  MEASURE_CONSUMED_MEMORY_BYTE = 'MEASURE_CONSUMED_MEMORY_BYTE',
  MEASURE_USED_NANOCPU = 'MEASURE_USED_NANOCPU',
  MEASURE_USED_MEMORY_BYTE = 'MEASURE_USED_MEMORY_BYTE',
  MEASURE_MEMORY_UTILIZATION = 'MEASURE_MEMORY_UTILIZATION',
  MEASURE_CPU_UTILIZATION = 'MEASURE_CPU_UTILIZATION',
}

export enum IntervalFilterType {
  // Dashboard
  Hourly = '24 Hours',
  Weekly = 'Week',
  Monthly = 'Month',
  Yearly = 'Year',

  // Billing
  Last7Days = 'Last 7 Days',
  Last14Days = 'Last 14 Days',
  MonthToDate = 'Month to Date',
  LastMonth = 'Last Month',
  Last60Days = 'Last 60 days',
}

export interface Org {
  info: {
    id: {
      name: string;
    };
    type: string;
    displayPreferences: {
      displayName: string;
      logoUrl: string;
    };
  };
  status: string;
}

export enum QuotaSeries {
  AggregateLimit = 'Aggregate Limit',
  Allocated = 'Requested',
  Used = 'Used',
}

export enum QuotaMeasure {
  NANOGPU = 'NANOGPU',
  NANOCPU = 'NANOCPU',
  MEMORY_BYTE = 'MEMORY_BYTE',
  EPHEMERAL_STORAGE = 'EPHEMERAL_STORAGE',
}

export enum UtlizationSeries {
  UTILIZED = 'UTILIZED',
}

export enum UtilizationMeasure {
  CPU = CustomMeasureType.MEASURE_CPU_UTILIZATION,
  MEMORY = CustomMeasureType.MEASURE_MEMORY_UTILIZATION,
}
