import Admin from '@clients/common/flyteidl/admin';

export interface Project extends Admin.IProject {
  /** The display name for this project */
  name: string;
  /** Unique identifier for this project */
  id: string;
  /** One or more domains belonging to this project */
  domains: Domain[];
}

export interface Domain extends Admin.IDomain {
  name: string;
  id: string;
}
