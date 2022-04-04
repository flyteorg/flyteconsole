import { createLocalizedString } from 'basics/Locale';

const str = {
  annotationsHeader: 'Annotations',
  domainSettingsTitle: 'Domain Settings',
  iamRoleHeader: 'IAM Role',
  inherited: 'Inherits from project level values',
  labelsHeader: 'Labels',
  maxParallelismHeader: 'Max_parallelism',
  rawDataHeader: 'Raw output data config',
  securityContextHeader: 'Security Context',
  serviceAccountHeader: 'Service Account',
};

export { patternKey } from 'basics/Locale';
export default createLocalizedString(str);
