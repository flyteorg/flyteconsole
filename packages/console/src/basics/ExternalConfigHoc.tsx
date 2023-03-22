import * as React from 'react';

export const ExternalConfigHoc = ({ ChildComponent, data }): any => {
  return <ChildComponent data={data} />;
};
