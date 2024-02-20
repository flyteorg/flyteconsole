import Core from '@clients/common/flyteidl/core';
import {
  Identifier,
  NamedEntity,
  NamedEntityIdentifier,
  NamedEntityMetadata,
  ResourceType,
} from '../models/Common/types';
import { NamedEntityState } from '../models/enums';

const defaultMetadata = {
  description: '',
  state: NamedEntityState.NAMED_ENTITY_ACTIVE,
};

export function createNamedEntity(
  resourceType: ResourceType,
  id: NamedEntityIdentifier,
  metadataOverrides?: Partial<NamedEntityMetadata>,
): NamedEntity {
  return {
    id,
    resourceType,
    metadata: { ...defaultMetadata, ...metadataOverrides },
  };
}
