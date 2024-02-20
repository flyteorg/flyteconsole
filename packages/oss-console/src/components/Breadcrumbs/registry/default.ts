import { contextualBreadcrumbRegistryList } from './contextualDefaults';
import { semanticBreadcrumbRegistryList } from './semanticDefaults';

const isContext = true;

export const flyteBreadcrumbRegistryList = isContext
  ? contextualBreadcrumbRegistryList
  : semanticBreadcrumbRegistryList;
