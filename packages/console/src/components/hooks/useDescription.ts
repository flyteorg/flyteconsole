import {Identifier, IdentifierScope, RequestConfig} from "../../models";
import {useFetchableData} from "./useFetchableData";
import {getDescriptionEntity, listDescriptionEntities} from "../../models/DescriptionEntity/api";
import {DescriptionEntity} from "../../models/DescriptionEntity/types";
import {FetchableData} from "./types";
import {useAPIContext} from "../data/apiContext";
import {usePagination} from "./usePagination";


export function useDescriptionEntity(id: Identifier): FetchableData<DescriptionEntity> {
  const { getDescriptionEntity } = useAPIContext();
  return useFetchableData<DescriptionEntity, Identifier>(
    {
      useCache: true,
      debugName: 'DescriptionEntity',
      defaultValue: {} as DescriptionEntity,
      doFetch: async descriptionEntityId => (await getDescriptionEntity(descriptionEntityId)) as DescriptionEntity,
    },
    id,
  );
}

/** A hook for fetching a paginated list of description entities */
export function useDescriptionEntityList(scope: IdentifierScope, config: RequestConfig) {
  const { listDescriptionEntities } = useAPIContext();
  return usePagination<DescriptionEntity, IdentifierScope>(
    { ...config, cacheItems: true, fetchArg: scope },
    listDescriptionEntities,
  );
}
