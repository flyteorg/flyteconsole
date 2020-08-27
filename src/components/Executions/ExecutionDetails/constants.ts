import { Core } from 'flyteidl';

export enum ExecutionMetadataLabels {
    cluster = 'Cluster',
    domain = 'Domain',
    duration = 'Duration',
    time = 'Time',
    version = 'Version'
}

export const tabs = {
    nodes: {
        id: 'nodes',
        label: 'Nodes'
    },
    graph: {
        id: 'graph',
        label: 'Graph'
    }
};

export const cacheStatusMessages: { [k in Core.CatalogCacheStatus]: string } = {
    [Core.CatalogCacheStatus.CACHE_DISABLED]:
        'Caching was disabled for this execution.',
    [Core.CatalogCacheStatus.CACHE_HIT]:
        'Output for this execution was read from cache.',
    [Core.CatalogCacheStatus.CACHE_LOOKUP_FAILURE]:
        'Failed to lookup cache information.',
    [Core.CatalogCacheStatus.CACHE_MISS]:
        'No cached output was found for this execution.',
    [Core.CatalogCacheStatus.CACHE_POPULATED]:
        'The result of this execution was written to cache.',
    [Core.CatalogCacheStatus.CACHE_PUT_FAILURE]:
        'Failed to write output for this execution to cache.'
};
export const unknownCacheStatusString = 'Cache status is unknown';
export const viewSourceExecutionString = 'View source execution';
