import { RefObject } from 'react';
import t from './strings';
import { LaunchFormInputsRef } from './types';

export async function validate(formInputsRef: RefObject<LaunchFormInputsRef>): Promise<boolean> {
  if (formInputsRef.current === null) {
    throw new Error('Unexpected empty form inputs ref');
  }

  if (!formInputsRef.current.validate()) {
    throw new Error(t('correctInputErrors'));
  }
  return true;
}
