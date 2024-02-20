import React, { useEffect } from 'react';
import { LargeLoadingComponent } from '@clients/primitives/LoadingSpinner';
import { ExecutionDetailsRouteParams, ExecutionDetailsWrapper } from './ExecutionContainer';

export function withExecutionDetails<P extends ExecutionDetailsRouteParams>(
  WrappedComponent: React.FC<P>,
) {
  return (props: P) => {
    const [localRouteProps, setLocalRouteProps] = React.useState<P>();

    useEffect(() => {
      setLocalRouteProps((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(props)) {
          return prev;
        }

        return props;
      });
    }, [props]);

    if (!localRouteProps) {
      return <LargeLoadingComponent />;
    }
    return (
      <ExecutionDetailsWrapper {...localRouteProps!}>
        <WrappedComponent {...localRouteProps!} />
      </ExecutionDetailsWrapper>
    );
  };
}
