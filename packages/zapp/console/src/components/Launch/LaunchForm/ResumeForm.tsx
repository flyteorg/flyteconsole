import * as React from 'react';
import { createInputValueCache, InputValueCacheContext } from './inputValueCache';
import { ResumeSignalForm } from './ResumeSignalForm';
import { ResumeSignalFormProps } from './types';

/** Renders the form for initiating a Launch request based on a Workflow or Task */
export const ResumeForm: React.FC<ResumeSignalFormProps> = (props) => {
  const [inputValueCache] = React.useState(createInputValueCache());

  return (
    <InputValueCacheContext.Provider value={inputValueCache}>
      <ResumeSignalForm {...props} />
    </InputValueCacheContext.Provider>
  );
};
