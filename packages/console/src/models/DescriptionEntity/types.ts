import { Admin } from '@flyteorg/flyteidl-types';
import { Identifier } from 'models/Common/types';



export interface SourceCode extends Admin.ISourceCode {
  link?: string
}

/** A serialized version of all information needed to execute a task */
export interface LongDescription extends Admin.IDescription {
  value: string;
  uri: string;
  format: Admin.DescriptionFormat
  iconLink?: string
}

export interface DescriptionEntity extends Admin.IDescriptionEntity {
  id: Identifier;
  shortDescription: string;
  longDescription: LongDescription
  sourceCode: SourceCode
  tags?: string[]
}
