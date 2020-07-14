import { SimpleType } from 'models';
import { InputType } from './types';

export const launchPlansTableRowHeight = 40;
export const launchPlansTableColumnWidths = {
    name: 250,
    version: 250
};

export const schedulesTableColumnsWidths = {
    active: 80,
    frequency: 300,
    name: 250
};

export const formStrings = {
    cancel: 'Cancel',
    inputs: 'Inputs',
    submit: 'Launch',
    title: 'Launch Workflow',
    workflowVersion: 'Workflow Version',
    launchPlan: 'Launch Plan'
};

/** Maps any valid InputType enum to a display string */
export const typeLabels: { [k in InputType]: string } = {
    [InputType.Binary]: 'binary',
    [InputType.Blob]: 'blob',
    [InputType.Boolean]: 'boolean',
    [InputType.Collection]: '',
    [InputType.Datetime]: 'datetime - UTC',
    [InputType.Duration]: 'duration - ms',
    [InputType.Error]: 'error',
    [InputType.Float]: 'float',
    [InputType.Integer]: 'integer',
    [InputType.Map]: '',
    [InputType.None]: 'none',
    [InputType.Schema]: 'schema',
    [InputType.String]: 'string',
    [InputType.Struct]: 'struct',
    [InputType.Unknown]: 'unknown'
};

/** Maps nested `SimpleType`s to our flattened `InputType` enum. */
export const simpleTypeToInputType: { [k in SimpleType]: InputType } = {
    [SimpleType.BINARY]: InputType.Binary,
    [SimpleType.BOOLEAN]: InputType.Boolean,
    [SimpleType.DATETIME]: InputType.Datetime,
    [SimpleType.DURATION]: InputType.Duration,
    [SimpleType.ERROR]: InputType.Error,
    [SimpleType.FLOAT]: InputType.Float,
    [SimpleType.INTEGER]: InputType.Integer,
    [SimpleType.NONE]: InputType.None,
    [SimpleType.STRING]: InputType.String,
    [SimpleType.STRUCT]: InputType.Struct
};

export const cannotLaunchWorkflowString = 'This workflow cannot be launched';
export const unsupportedRequiredInputsString = `This Workflow version contains one or more required inputs which are not supported by Flyte Console and do not have default values specified in the workflow definition or the selected Launch Plan.\n
You can launch this Workflow version with the Flyte CLI or by selecting a Launch Plan which provides values for the unsupported inputs.\nThe inputs are listed below:`;
