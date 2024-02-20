import { HandleProps } from 'react-flow-renderer';
import { CatalogCacheStatus, NodeExecutionPhase } from '../../../models/Execution/enums';
import { dNode, dTypes } from '../../../models/Graph/types';

export interface RFBackgroundProps {
  background: any;
  gridColor: string;
  gridSpacing: number;
}

export enum RFGraphTypes {
  main,
  nested,
  static,
}

export interface RFWrapperProps {
  rfGraphJson: any;
  backgroundStyle: RFBackgroundProps;
  type?: RFGraphTypes;
  currentNestedView?: any;
  version?: string;
}

/* Note: extending to allow applying styles directly to handle */
export interface RFHandleProps extends HandleProps {
  style: any;
}

export interface LayoutRCProps {
  setPositionedElements: any;
  graphData: any;
}

/* React Flow params and styles (background is styles) */

export interface BuildRFNodeProps {
  dNode: dNode;
  dag?: any[];
  typeOverride: dTypes | null;
  currentNestedView?: any;
  isStaticGraph: boolean;
}

export interface ConvertDagProps {
  root: dNode;
  currentNestedView?: any;
  maxRenderDepth: number;
  isStaticGraph?: boolean;
}

export interface DagToReactFlowProps extends ConvertDagProps {
  currentDepth: number;
  parents: any;
}

export interface RFCustomData {
  node: dNode;
  nodeExecutionStatus: NodeExecutionPhase;
  text: string;
  handles: [];
  nodeType: dTypes;
  scopedId: string;
  dag: any;
  taskType: dTypes;
  cacheStatus: CatalogCacheStatus;
  parentScopedId: string;
  currentNestedView: string[];
}

export interface RFNode {
  data: RFCustomData;
}
