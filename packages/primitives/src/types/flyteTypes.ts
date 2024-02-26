import { WorkflowExecutionPhase } from './flyteConstants';

export namespace Flyte {
  export interface Profile {
    /**
     * github username and oauth bundle
     */
    additional_claims?: any;
    subject: string;
    name: string;
    preferredUsername: string;
    givenName: string;
    familyName: string;
    email: string;
    picture: string;
  }

  export interface DomainInfo {
    id: string;
    name: string;
  }

  export interface ProjectInfo {
    id: string;
    name: string;
    domains: DomainInfo[];
    description?: string;
    labels?: Object;
  }

  export interface ProjectList {
    projects: ProjectInfo[];
  }

  export interface ExecutionId {
    project: string;
    domain: string;
    name: string;
  }

  export interface ExecutionClosure {
    outputs: unknown;
    phase: WorkflowExecutionPhase;
  }

  export interface ExecutionItem {
    id: ExecutionId;
    spec: unknown;
    closure: ExecutionClosure;
  }

  export interface ExecutionsList {
    executions: ExecutionItem[];
  }
}
