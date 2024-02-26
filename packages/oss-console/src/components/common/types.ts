export interface ListProps<T> {
  // height/width are optional. If unspecified, the component will
  // use auto-sizing behavior
  height?: number;
  value: T[];
  lastError: string | Error | null | unknown;
  isFetching: boolean;
  moreItemsAvailable: boolean;
  width?: number;
  fetch(): void;
}
