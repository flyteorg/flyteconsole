/**
 * Note:
 *  Dynamic nodes are deteremined at runtime and thus do not come
 *  down as part of the workflow closure. We can detect and place
 *  dynamic nodes by finding orphan execution id's and then mapping
 *  those executions into the dag by using the executions 'uniqueParentId'
 *  to render that node as a subworkflow
 */
export const checkForDynamicExecutions = (allExecutions, staticExecutions) => {
  const parentsToFetch = {};
  for (const executionId in allExecutions) {
    if (!staticExecutions[executionId]) {
      const dynamicExecution = allExecutions[executionId];
      const dynamicExecutionId = dynamicExecution.metadata.specNodeId || dynamicExecution.id;
      const uniqueParentId = dynamicExecution.fromUniqueParentId;
      if (uniqueParentId) {
        if (parentsToFetch[uniqueParentId]) {
          parentsToFetch[uniqueParentId].push(dynamicExecutionId);
        } else {
          parentsToFetch[uniqueParentId] = [dynamicExecutionId];
        }
      }
    }
  }
  const result = {};
  for (const parentId in parentsToFetch) {
    result[parentId] = allExecutions[parentId];
  }
  return result;
};
