import { createLocalizedString } from '@clients/locale/locale';

const str = {
  allExecutionsTitle: 'All Executions in the Project',
  last100ExecutionsTitle: (resourceType: string) => `Last 100 Executions in the ${resourceType}`,
  annotationsHeader: 'Annotations',
  collapseButton: (showAll: boolean) => (showAll ? 'Collapse' : 'Expand'),
  domainSettingsTitle: 'Domain Settings',
  iamRoleHeader: 'IAM Role',
  inherited: 'Inherits from project level values',
  labelsHeader: 'Labels',
  maxParallelismHeader: 'Max parallelism',
  rawDataHeader: 'Raw output data config',
  securityContextHeader: 'Security Context',
  serviceAccountHeader: 'Service Account',
  noValue: '-',
  missingUnionListOfSubType: 'Unexpected missing type for union',
  missingMapSubType: 'Unexpected missing subtype for map',
  mapMissingMapProperty: 'Map literal missing `map` property',
  mapMissingMapLiteralsProperty: 'Map literal missing `map.literals` property',
  mapLiternalNotObject: 'Map literal is not an object',
  mapLiternalObjectEmpty: 'Map literal object is empty',
  valueNotString: 'Value is not a string',
  valueRequired: 'Value is required',
  valueNotParse: 'Value did not parse to an object',
  valueKeyRequired: 'Map cannot be empty',
  valueValueInvalid: "Value's value is invalid",
  valueKeyInvalid: "Value's key is invalid",
  valueMustBeObject: 'Value must be an object',
  gateNodeInput: 'Node input',
  type: 'Type',
};

export default createLocalizedString(str);
