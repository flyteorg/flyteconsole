import { createLocalizedString } from '@flyteorg/locale';

const str = {
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
  noMatchingResults: 'No matching results',
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

export { patternKey } from '@flyteorg/locale';
export default createLocalizedString(str);
