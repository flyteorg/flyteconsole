// Reference: https://stackoverflow.com/a/68742668

import { useCallback, useEffect, useState } from 'react';

type UseResizeProps = {
  minWidth: number;
};

type UseResizeReturn = {
  width: number;
  enableResize: () => void;
};

const useResize = ({ minWidth }: UseResizeProps): UseResizeReturn => {
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(minWidth);

  const enableResize = useCallback(() => {
    setIsResizing(true);
  }, [setIsResizing]);

  const disableResize = useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = document.body.offsetWidth - e.clientX; // You may want to add some offset here from props
        if (newWidth >= minWidth) {
          setWidth(newWidth);
        }
      }
    },
    [minWidth, isResizing, setWidth],
  );

  useEffect(() => {
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', disableResize);

    return () => {
      document.removeEventListener('mousemove', resize);
      document.removeEventListener('mouseup', disableResize);
    };
  }, [disableResize, resize]);

  return { width, enableResize };
};

export default useResize;
