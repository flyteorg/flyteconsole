import { useEffect, useMemo, useState } from 'react';
import { useQueryState } from './useQueryState';

export function useTabState(defaultValue: string, queryKey: string, deeplink: boolean = false) {
  const [params, setQueryStateValue] = useQueryState();

  const paramValue = useMemo(() => {
    return params?.[queryKey] || defaultValue;
  }, [params, queryKey, defaultValue]);

  const [value, setValue] = useState(paramValue || defaultValue);

  const onChange = (_event: any, tabId: string) => {
    if (!tabId) return;

    if (deeplink) setQueryStateValue(queryKey, tabId);
    setValue(tabId);
  };

  useEffect(() => {
    if (paramValue && deeplink) {
      setValue(paramValue);
    }
  }, [paramValue]);

  return { value, onChange };
}
