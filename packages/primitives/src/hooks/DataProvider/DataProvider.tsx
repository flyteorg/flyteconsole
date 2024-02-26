import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';

export const DataProvider = (props: PropsWithChildren<unknown>) => {
  return <Provider store={store}>{props.children}</Provider>;
};
