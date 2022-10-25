import { Admin, Core, Protobuf } from 'flyteidl';
import {
  BlobDimensionality,
  Identifier,
  LiteralType,
  NamedEntityIdentifier,
} from 'models/Common/types';
import { WorkflowExecutionIdentifier } from 'models/Execution/types';
import { LaunchPlan } from 'models/Launch/types';
import { Task } from 'models/Task/types';
import { Workflow, WorkflowId } from 'models/Workflow/types';
import { Interpreter, State } from 'xstate';
import {
  BaseLaunchContext,
  BaseLaunchEvent,
  BaseLaunchTypestate,
  TaskLaunchContext,
  TaskLaunchEvent,
  TaskLaunchTypestate,
  TaskResumeContext,
  TaskResumeTypestate,
  WorkflowLaunchContext,
  WorkflowLaunchEvent,
  WorkflowLaunchTypestate,
} from './launchMachine';
import { SearchableSelectorOption } from './SearchableSelector';

export type InputValueMap = Map<string, InputValue>;
export type LiteralValueMap = Map<string, Core.ILiteral>;
export type SearchableVersion = Workflow | Task;

export type BaseInterpretedLaunchState = State<
  BaseLaunchContext,
  BaseLaunchEvent,
  any,
  BaseLaunchTypestate
>;

export type BaseLaunchService = Interpreter<
  BaseLaunchContext,
  any,
  BaseLaunchEvent,
  BaseLaunchTypestate
>;

export interface BaseLaunchFormProps {
  onClose(): void;
  referenceExecutionId?: WorkflowExecutionIdentifier;
}

export interface BaseInitialLaunchParameters {
  values?: LiteralValueMap;
}

export interface WorkflowInitialLaunchParameters extends BaseInitialLaunchParameters {
  launchPlan?: Identifier;
  workflowId?: WorkflowId;
  authRole?: Admin.IAuthRole;
  securityContext?: Core.ISecurityContext;
  disableAll?: boolean | null;
  maxParallelism?: number | null;
  rawOutputDataConfig?: Admin.IRawOutputDataConfig | null;
  labels?: Admin.ILabels | null;
  annotations?: Admin.IAnnotations | null;
  interruptible?: Protobuf.IBoolValue | null;
}

export interface LaunchWorkflowFormProps extends BaseLaunchFormProps {
  workflowId: NamedEntityIdentifier;
  securityContext?: Core.ISecurityContext;
  initialParameters?: WorkflowInitialLaunchParameters;
}

export interface TaskInitialLaunchParameters extends BaseInitialLaunchParameters {
  taskId?: Identifier;
  authRole?: Admin.IAuthRole;
  securityContext?: Core.ISecurityContext;
  interruptible?: Protobuf.IBoolValue | null;
}
export interface LaunchTaskFormProps extends BaseLaunchFormProps {
  taskId: NamedEntityIdentifier;
  initialParameters?: TaskInitialLaunchParameters;
}

export type LaunchFormProps = LaunchWorkflowFormProps | LaunchTaskFormProps;

export interface LaunchFormInputsRef {
  getValues(): Record<string, Core.ILiteral>;
  validate(): boolean;
}

export interface LaunchRoles {
  authRole?: Admin.IAuthRole;
  securityContext?: Core.ISecurityContext;
}

export interface LaunchRoleInputRef {
  getValue(): LaunchRoles;
  validate(): boolean;
}

export interface LaunchInterruptibleInputRef {
  getValue(): Protobuf.IBoolValue | null | undefined;
  validate(): boolean;
}

export interface LaunchAdvancedOptionsRef {
  getValues(): Admin.IExecutionSpec;
  validate(): boolean;
}

export interface WorkflowSourceSelectorState {
  launchPlanSelectorOptions: SearchableSelectorOption<LaunchPlan>[];
  selectedWorkflow?: SearchableSelectorOption<Identifier>;
  selectedLaunchPlan?: SearchableSelectorOption<LaunchPlan>;
  workflowSelectorOptions: SearchableSelectorOption<WorkflowId>[];
  fetchSearchResults(query: string): Promise<SearchableSelectorOption<Identifier>[]>;
  onSelectWorkflowVersion(selected: SearchableSelectorOption<WorkflowId>): void;
  onSelectLaunchPlan(selected: SearchableSelectorOption<LaunchPlan>): void;
}

export interface TaskSourceSelectorState {
  selectedTask?: SearchableSelectorOption<Identifier>;
  taskSelectorOptions: SearchableSelectorOption<Identifier>[];
  fetchSearchResults(query: string): Promise<SearchableSelectorOption<Identifier>[]>;
  onSelectTaskVersion(selected: SearchableSelectorOption<Identifier>): void;
}

export interface LaunchWorkflowFormState {
  advancedOptionsRef: React.RefObject<LaunchAdvancedOptionsRef>;
  formInputsRef: React.RefObject<LaunchFormInputsRef>;
  roleInputRef: React.RefObject<LaunchRoleInputRef>;
  interruptibleInputRef: React.RefObject<LaunchInterruptibleInputRef>;
  state: State<WorkflowLaunchContext, WorkflowLaunchEvent, any, WorkflowLaunchTypestate>;
  service: Interpreter<WorkflowLaunchContext, any, WorkflowLaunchEvent, WorkflowLaunchTypestate>;
  workflowSourceSelectorState: WorkflowSourceSelectorState;
}

export interface LaunchTaskFormState {
  formInputsRef: React.RefObject<LaunchFormInputsRef>;
  roleInputRef: React.RefObject<LaunchRoleInputRef>;
  interruptibleInputRef: React.RefObject<LaunchInterruptibleInputRef>;
  state: State<TaskLaunchContext, TaskLaunchEvent, any, TaskLaunchTypestate>;
  service: Interpreter<TaskLaunchContext, any, TaskLaunchEvent, TaskLaunchTypestate>;
  taskSourceSelectorState: TaskSourceSelectorState;
}

export interface ResumeFormState {
  formInputsRef: React.RefObject<LaunchFormInputsRef>;
  state: State<TaskResumeContext, BaseLaunchEvent, any, TaskResumeTypestate>;
  service: Interpreter<TaskResumeContext, any, BaseLaunchEvent, TaskResumeTypestate>;
}

export enum InputType {
  Binary = 'BINARY',
  Blob = 'BLOB',
  Boolean = 'BOOLEAN',
  Collection = 'COLLECTION',
  Datetime = 'DATETIME',
  Duration = 'DURATION',
  Error = 'ERROR',
  Enum = 'ENUM',
  Float = 'FLOAT',
  Integer = 'INTEGER',
  Map = 'MAP',
  None = 'NONE',
  Schema = 'SCHEMA',
  String = 'STRING',
  Struct = 'STRUCT',
  Union = 'Union',
  Unknown = 'UNKNOWN',
}

export interface InputTypeDefinition {
  literalType: LiteralType;
  type: InputType;
  subtype?: InputTypeDefinition;
  listOfSubTypes?: InputTypeDefinition[];
}

export interface BlobValue {
  dimensionality: BlobDimensionality | string;
  format?: string;
  uri: string;
}

export interface UnionValue {
  value: InputValue;
  typeDefinition: InputTypeDefinition;
}

export interface NoneValue {}

export type InputValue = string | number | boolean | Date | BlobValue | UnionValue | NoneValue;
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
  setIsError: (boolean) => void;
}

export interface ParsedInput
  extends Pick<InputProps, 'description' | 'label' | 'name' | 'required' | 'typeDefinition'> {
  /** Provides an initial value for the input, which can be changed by the user. */
  initialValue?: Core.ILiteral;
}

export enum AuthRoleTypes {
  k8 = 'k8',
  IAM = 'IAM',
}

export interface AuthRoleMeta {
  helperText: string;
  inputLabel: string;
  label: string;
  value: RoleTypeValue;
  validate?: any;
  error?: any;
}

export type RoleTypeValue = keyof Admin.IAuthRole;
export interface RoleType {
  helperText: string;
  inputLabel: string;
  label: string;
  value: RoleTypeValue;
}
