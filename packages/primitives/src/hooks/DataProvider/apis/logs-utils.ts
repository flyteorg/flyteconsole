import { formatEndpointV2 } from '../../../utils/api';
import { apiEndpoints } from '../../../utils/endpoints';
import { checkIsNumber } from '../../../utils/format';

export interface LogResult {
  asctime?: string;
  levelname?: 'WARNING' | 'ERROR' | 'INFO' | 'DEBUG';
  message?: string;
  name?: string;
}

export interface LogQueryArgs {
  projectId: string;
  domainId: string;
  executionId: string;
  nodeId: string;
  taskProjectId?: string;
  taskDomainId?: string;
  taskId: string;
  version: string;
  attemptId?: number | string;
  mappedIndex?: number | string;
  mappedAttempt?: number | string;
  taskType?: string;
}
/**
 * The transformed response from the logs API
 * key: the task ID used to differentiate mapped tasks
 */
export interface LogsResponse {
  [key: string]: LogResult[];
}

export const isLogResult = (response: any): response is LogResult => {
  return typeof response === 'object' && 'message' in response;
};

export const getLogsEndpoint = (queryArgs: LogQueryArgs, stream: boolean = false) => {
  const { mappedIndex, taskType } = queryArgs;
  const useMappedTasks = checkIsNumber(mappedIndex);
  const endpointTarget = stream ? 'stream' : 'get';
  let endpoint = apiEndpoints.logs.byAttempt[endpointTarget];
  if (useMappedTasks) {
    endpoint = apiEndpoints.logs.byMappedTaskAttempt[endpointTarget];
  }
  if (taskType && ['dgx_job', 'dgx_data_mover'].includes(taskType)) {
    endpoint = apiEndpoints.logs.byAgentAttempt[endpointTarget];
  }

  return formatEndpointV2(endpoint, queryArgs);
};

const removeCarriageReturn = (data: string) => {
  return data.replace(/\r/g, '\n');
};

export const parseSingleLog = (data: string) => {
  let log: LogResult;
  const parsedData = removeCarriageReturn(data);
  try {
    // try to parse the response as JSON
    const parsed = JSON.parse(parsedData);
    if (isLogResult(parsed)) {
      log = parsed;
    } else {
      log = {
        message: parsed,
      };
    }
  } catch {
    // if not JSON, treat it as an INFO message
    log = {
      message: parsedData,
    };
  }

  return log;
};
export const parseLogsResponse = (data: string): LogResult[] => {
  let logs: LogResult[];
  try {
    // try to parse the response as JSON
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      logs = parsed.map(parseSingleLog);
    } else {
      logs = [parseSingleLog(parsed)];
    }
  } catch {
    // if not JSON, treat it as an INFO message
    logs = data
      ?.split('\n')
      // restore the line breaks we removed before parsing
      // this is to prevent the logs window from "jumping" when it seitches to streamed logs
      ?.map?.((l) => parseSingleLog(`${l}\n`));
  }

  return logs;
};

export const parseErrorResponse = (data: string): string => {
  try {
    const doc = new DOMParser().parseFromString(data, 'text/xml');
    const title = doc.querySelector('title');
    if (!title) throw new Error('');
    return title?.textContent || 'Sorry, an error occurred while retrieving logs.';
  } catch {
    return data || 'Sorry, an error occurred while retrieving logs.';
  }
};

export const getTaskId = (queryArgs: LogQueryArgs) => {
  return JSON.stringify(queryArgs);
};
