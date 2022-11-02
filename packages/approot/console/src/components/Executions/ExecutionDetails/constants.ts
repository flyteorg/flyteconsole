export enum ExecutionMetadataLabels {
  cluster = 'Cluster',
  domain = 'Domain',
  duration = 'Duration',
  time = 'Time',
  relatedTo = 'Related to',
  version = 'Version',
  serviceAccount = 'Service Account',
  iam = 'IAM Role',
  rawOutputPrefix = 'Raw Output Prefix',
  parallelism = 'Parallelism',
  securityContextDefault = 'default',
  interruptible = 'Interruptible override',
}

export const tabs = {
  nodes: {
    id: 'nodes',
    label: 'Nodes',
  },
  graph: {
    id: 'graph',
    label: 'Graph',
  },
  timeline: {
    id: 'timeline',
    label: 'Timeline',
  },
};

export const executionActionStrings = {
  clone: 'Clone Execution',
};

export const backLinkTitle = 'Back to parent';
