import { Core } from 'flyteidl';
import {
    BlobDimensionality,
    Identifier,
    LaunchPlan,
    NamedEntityIdentifier,
    WorkflowId
} from 'models';
import { Interpreter, State } from 'xstate';
import {
    TaskLaunchContext,
    TaskLaunchEvent,
    TaskLaunchTypestate,
    WorkflowLaunchContext,
    WorkflowLaunchEvent,
    WorkflowLaunchTypestate
} from './launchMachine';
import { SearchableSelectorOption } from './SearchableSelector';

export type InputValueMap = Map<string, InputValue>;
export type LiteralValueMap = Map<string, Core.ILiteral>;

export interface BaseLaunchFormProps {
    onClose(): void;
}

export interface BaseInitialLaunchParameters {
    values?: LiteralValueMap;
}

export interface WorkflowInitialLaunchParameters
    extends BaseInitialLaunchParameters {
    launchPlan?: Identifier;
    workflow?: WorkflowId;
}
export interface LaunchWorkflowFormProps extends BaseLaunchFormProps {
    workflowId: NamedEntityIdentifier;
    initialParameters?: InitialWorkflowLaunchParameters;
}

export interface TaskInitialLaunchParameters
    extends BaseInitialLaunchParameters {
    task?: Identifier;
}
export interface LaunchTaskFormProps extends BaseLaunchFormProps {
    taskId: NamedEntityIdentifier;
    initialParameters?: InitialWorkflowLaunchParameters;
    onClose(): void;
}

export type LaunchFormProps = LaunchWorkflowFormProps | LaunchTaskFormProps;

export interface InitialWorkflowLaunchParameters {
    launchPlan?: Identifier;
    workflow?: WorkflowId;
    values?: LiteralValueMap;
}
export interface LaunchWorkflowFormProps {
    workflowId: NamedEntityIdentifier;
    initialParameters?: InitialWorkflowLaunchParameters;
    onClose(): void;
}

export interface LaunchFormInputsRef {
    getValues(): Record<string, Core.ILiteral>;
    validate(): boolean;
}

export interface WorkflowSourceSelectorState {
    launchPlanSelectorOptions: SearchableSelectorOption<LaunchPlan>[];
    selectedWorkflow?: SearchableSelectorOption<Identifier>;
    selectedLaunchPlan?: SearchableSelectorOption<LaunchPlan>;
    workflowSelectorOptions: SearchableSelectorOption<WorkflowId>[];
    fetchSearchResults(
        query: string
    ): Promise<SearchableSelectorOption<Identifier>[]>;
    onSelectWorkflowVersion(
        selected: SearchableSelectorOption<WorkflowId>
    ): void;
    onSelectLaunchPlan(selected: SearchableSelectorOption<LaunchPlan>): void;
}

export interface LaunchWorkflowFormState {
    formInputsRef: React.RefObject<LaunchFormInputsRef>;
    state: State<
        WorkflowLaunchContext,
        WorkflowLaunchEvent,
        any,
        WorkflowLaunchTypestate
    >;
    service: Interpreter<
        WorkflowLaunchContext,
        any,
        WorkflowLaunchEvent,
        WorkflowLaunchTypestate
    >;
    workflowSourceSelectorState: WorkflowSourceSelectorState;
}

export interface LaunchTaskFormState {
    formInputsRef: React.RefObject<LaunchFormInputsRef>;
    state: State<TaskLaunchContext, TaskLaunchEvent, any, TaskLaunchTypestate>;
    service: Interpreter<
        TaskLaunchContext,
        any,
        TaskLaunchEvent,
        TaskLaunchTypestate
    >;
    // taskSourceSelectorState: WorkflowSourceSelectorState;
}

export enum InputType {
    Binary = 'BINARY',
    Blob = 'BLOB',
    Boolean = 'BOOLEAN',
    Collection = 'COLLECTION',
    Datetime = 'DATETIME',
    Duration = 'DURATION',
    Error = 'ERROR',
    Float = 'FLOAT',
    Integer = 'INTEGER',
    Map = 'MAP',
    None = 'NONE',
    Schema = 'SCHEMA',
    String = 'STRING',
    Struct = 'STRUCT',
    Unknown = 'UNKNOWN'
}

export interface InputTypeDefinition {
    type: InputType;
    subtype?: InputTypeDefinition;
}

export interface ObjectValue {
    type: InputType;
}

export interface BlobValue {
    dimensionality: BlobDimensionality | string;
    format?: string;
    uri: string;
}

export type InputValue = string | number | boolean | Date | BlobValue;
export type InputChangeHandler = (newValue: InputValue) => void;

export interface InputProps {
    description: string;
    error?: string;
    helperText?: string;
    initialValue?: Core.ILiteral;
    name: string;
    label: string;
    required: boolean;
    typeDefinition: InputTypeDefinition;
    value?: InputValue;
    onChange: InputChangeHandler;
}

export interface ParsedInput
    extends Pick<
        InputProps,
        'description' | 'label' | 'name' | 'required' | 'typeDefinition'
    > {
    /** Provides an initial value for the input, which can be changed by the user. */
    initialValue?: Core.ILiteral;
}
