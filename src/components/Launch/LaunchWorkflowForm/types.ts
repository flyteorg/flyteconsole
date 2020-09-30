import { Core } from 'flyteidl';
import {
    BlobDimensionality,
    Identifier,
    LaunchPlan,
    NamedEntityIdentifier,
    WorkflowId
} from 'models';
import { State } from 'xstate';
import {
    LaunchContext,
    LaunchEvent,
    LaunchFlatTypestate,
    LaunchTypestate
} from './launchMachine';
import { SearchableSelectorOption } from './SearchableSelector';

export type InputValueMap = Map<string, InputValue>;
export type LiteralValueMap = Map<string, Core.ILiteral>;

export interface InitialLaunchParameters {
    launchPlan?: Identifier;
    workflow?: WorkflowId;
    values?: LiteralValueMap;
}

export interface LaunchWorkflowFormProps {
    workflowId: NamedEntityIdentifier;
    initialParameters?: InitialLaunchParameters;
    onClose(): void;
}

export interface LaunchWorkflowFormInputsRef {
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
    /** Used to key inputs component so it is re-mounted the list of inputs */
    formKey?: string;
    formInputsRef: React.RefObject<LaunchWorkflowFormInputsRef>;
    inputValueCache: InputValueMap;
    showErrors: boolean;
    state: State<LaunchContext, LaunchEvent, any, LaunchFlatTypestate>;
    workflowSourceSelectorState: WorkflowSourceSelectorState;
    onCancel(): void;
    onSubmit(): void;
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
