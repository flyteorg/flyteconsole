/* eslint-disable no-param-reassign */
import Admin from '@clients/common/flyteidl/admin';
import Event from '@clients/common/flyteidl/event';
import Core from '@clients/common/flyteidl/core';
import keys from 'lodash/keys';
import values from 'lodash/values';

export const transformResourceEntry = (
  value: Core.Resources.ResourceEntry,
): Core.Resources.ResourceEntry => {
  value.name = Core.Resources.ResourceName[value.name] as any;

  return value;
};

export const transformIdentifier = (value: Core.Identifier): Core.Identifier => {
  value.resourceType = Core.ResourceType[value.resourceType] as any;
  return value;
};

export const transformRuntimeMetadata = (value: Core.RuntimeMetadata): Core.RuntimeMetadata => {
  value.type = Core.RuntimeMetadata.RuntimeType[value.type] as any;
  return value;
};

export const transformLiteralProperty = <T>(value: T): T => {
  if (value instanceof Core.LiteralType) {
    // eslint-disable-next-line no-use-before-define
    transformLiteralType(value);
  } else if (value instanceof Core.SchemaType.SchemaColumn) {
    value.type = Core.SchemaType.SchemaColumn.SchemaColumnType[value.type] as any;
  } else if (value instanceof Core.BlobType) {
    value.dimensionality = Core.BlobType.BlobDimensionality[value.dimensionality] as any;
  } else if (typeof value === 'object') {
    values(value).forEach(transformLiteralProperty);
  }
  return value;
};

export const transformLiteralType = (value: Core.LiteralType): Core.LiteralType => {
  switch (value.type) {
    case 'simple':
      value.simple = Core.SimpleType[value.simple] as any;
      break;

    default: {
      values(value).forEach((v) => {
        transformLiteralProperty(v);
      });
      return value;
    }
  }

  return value;
};

export const transformPropertyWithWorkflowExecutionEvent = <
  T extends Event.WorkflowExecutionEvent | Admin.ExecutionClosure,
>(
  value: T,
): T => {
  values(value).forEach((v) => {
    value = transformDecodedApiResponse(v);
  });
  return { ...value, phase: Core.WorkflowExecution.Phase[value.phase] as any };
};

export const transformDecodedApiResponse = (response: any) => {
  if (!response || keys(response).length === 0) {
    return response;
  }

  values(response).forEach((value) => {
    if (value instanceof Core.Identifier) {
      value = transformIdentifier(value);
    } else if (value instanceof Core.Resources.ResourceEntry) {
      value = transformResourceEntry(value);
    } else if (value instanceof Core.RuntimeMetadata) {
      value = transformRuntimeMetadata(value);
    } else if (value instanceof Core.LiteralType) {
      value = transformLiteralType(value);
    } else if (
      value instanceof Event.WorkflowExecutionEvent ||
      value instanceof Admin.ExecutionClosure
    ) {
      value = transformPropertyWithWorkflowExecutionEvent(value);
    } else if (typeof value === 'object') {
      value = transformDecodedApiResponse(value);
    }
  });

  return response;
};
