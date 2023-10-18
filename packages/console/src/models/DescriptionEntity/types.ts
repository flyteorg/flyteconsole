import { Admin } from '@flyteorg/flyteidl-types';
import { Identifier } from 'models/Common/types';

/** Optional link to source code used to define this entity */
export interface SourceCode extends Admin.ISourceCode {
  link?: string;
}

/** Full user description with formatting preserved */
export interface LongDescription extends Admin.IDescription {
  value: string;
  uri: string;
  format: Admin.DescriptionFormat;
  iconLink?: string;
}

/*
DescriptionEntity contains detailed description for the task/workflow.
Documentation could provide insight into the algorithms, business use case, etc
*/
export interface DescriptionEntity extends Admin.IDescriptionEntity {
  id: Identifier;
  shortDescription: string;
  longDescription: LongDescription;
  sourceCode?: SourceCode;
  tags?: string[];
}
