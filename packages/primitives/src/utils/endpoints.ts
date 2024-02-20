const getOrgSegment = () => {
  const pathName = window?.location?.pathname ?? '';
  const pathSegments = pathName.split('/');

  const orgKeyIndex = pathSegments.indexOf('org');
  const orgValueIndex = orgKeyIndex + 1;
  const orgValue = pathSegments[orgValueIndex];
  const orgSegment = orgValue ? `/org/${orgValue}` : '';

  return orgSegment;
};

const orgSegment = getOrgSegment();

export const apiEndpoints = {
  org: {
    getDetails: `${orgSegment}/org/api/v1/details/{orgName}`,
  },
  users: {
    getUser: `${orgSegment}/users/api/v1/{subject}`,
    listUsers: `${orgSegment}/users/api/v1`,
    addUser: `${orgSegment}/users/api/v1`,
    removeUser: `${orgSegment}/users/api/v1/{subject}`,
    listUsersCount: `${orgSegment}/users/api/v1/count`,
  },
  // https://github.com/unionai/cloud/blob/main/idl/identity/policy_service.proto
  policies: {
    list: `${orgSegment}/policies/api/v1`,
  },
  console: {
    admin: {
      executionPerPhase: `${orgSegment}/executions/{project}/{domain}?{filter}&limit={limit}`,
    },
    executions: {
      list: `${orgSegment}/api/v1/executions/{project}/{domain}?{filter}&limit={limit}`,
      perPhase: `${orgSegment}/api/v1/executions/{project}/{domain}?{filter}&limit={limit}`,
    },
  },
  clusterpools: {
    list: `${orgSegment}/clusterpool/api/v1?{limit}`,
    getConfig: `${orgSegment}/clusterpool/api/v1/{clustername}/config`,
  },
  cluster: {
    count: `${orgSegment}/cluster/api/v1/count?rawFilters=eq(state,STATE_ENABLED)`,
    countHealthy: `${orgSegment}/cluster/api/v1/count?rawFilters=eq(state,STATE_ENABLED)&rawFilters=eq(health,HEALTHY)`,
  },
  usage: {
    counter: `${orgSegment}/usage/api/v1/counter?window={lookbackWindow}&counter_group={counterGroup}`,
    histogram: {
      all: `${orgSegment}/usage/api/v1/histogram?window={lookbackWindow}`,
      oneItem: `${orgSegment}/usage/api/v1/histogram?window={lookbackWindow}&measure={measureType}`,
    },
    measureGroup: `${orgSegment}/usage/api/v1/measure_group?start_time={startTime}&measure_group={measureGroup}`,
    measureGroups: `${orgSegment}/usage/api/v1/measure_groups?measure_groups=MEASURE_GROUP_WORKFLOW_EXECUTION&measure_groups=MEASURE_GROUP_WORKFLOW_EXECUTION_TERMINAL&measure_groups=MEASURE_GROUP_TASK_EXECUTION&measure_groups=MEASURE_GROUP_NODE_EXECUTION_TERMINAL&measure_groups=MEASURE_GROUP_COMPUTE_RESOURCES&start_time={startTime}&end_time={endTime}`,
    billingInfo: `${orgSegment}/usage/api/v1/billing_info`,
    billableMeasures: `${orgSegment}/usage/api/v1/billable_measures?start_time={startTime}&end_time={endTime}`,
    managedCluster: `${orgSegment}/managed_cluster/api/v1/displayinfo`,
    quota: `${orgSegment}/usage/api/v1/quota`,
    taskMetrics: {
      byAttempt: `${orgSegment}/usage/api/v1/task_metrics/{projectId}/{domainId}/{executionId}/{nodeId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}/{attemptId}`,
      byMappedTaskAttempt: `${orgSegment}/usage/api/v1/task_metrics/{projectId}/{domainId}/{executionId}/{nodeId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}/{attemptId}/{mappedIndex}/{mappedAttempt}`,
      byAgentAttempt: `${orgSegment}/dataplane/agent/v1/fqn/task/{projectId}/{domainId}/{executionId}/{nodeId}/{attemptId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}/metrics`,
    },
  },
  logs: {
    byAttempt: {
      get: `${orgSegment}/logs/v2/{projectId}/{domainId}/{executionId}/{nodeId}/{attemptId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}`,
      stream: `${orgSegment}/logs/v2/stream/{projectId}/{domainId}/{executionId}/{nodeId}/{attemptId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}`,
    },
    byMappedTaskAttempt: {
      get: `${orgSegment}/logs/v2/{projectId}/{domainId}/{executionId}/{nodeId}/{attemptId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}/{mappedIndex}/{mappedAttempt}`,
      stream: `${orgSegment}/logs/v2/stream/{projectId}/{domainId}/{executionId}/{nodeId}/{attemptId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}/{mappedIndex}/{mappedAttempt}`,
    },
    byAgentAttempt: {
      get: `${orgSegment}/dataplane/agent/v1/fqn/task/{projectId}/{domainId}/{executionId}/{nodeId}/{attemptId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}/logs`,
      stream: `${orgSegment}/dataplane/agent/v1/fqn/task/{projectId}/{domainId}/{executionId}/{nodeId}/{attemptId}/{taskProjectId}/{taskDomainId}/{taskId}/{version}/logs_stream`,
    },
  },
  profile: `/me`,
};
