import { useMemo } from 'react';
import { getLinkifiedTextChunks } from '../../common/linkify';

export function useLinkifiedChunks(text: string) {
  return useMemo(() => getLinkifiedTextChunks(text), [text]);
}
