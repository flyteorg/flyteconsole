import * as React from 'react';

export declare const loadingSpinnerDelayMs = 1000;
declare type SizeValue = 'small' | 'medium' | 'large';
interface LoadingSpinnerProps {
  size?: SizeValue;
}
/** Renders a loading spinner after 1000ms. Size options are 'small', 'medium', and 'large' */
export declare const LoadingSpinner: React.FC<LoadingSpinnerProps>;
/** `LoadingSpinner` with a pre-bound size of `small` */
export declare const SmallLoadingSpinner: React.FC;
/** `LoadingSpinner` with a pre-bound size of `medium` */
export declare const MediumLoadingSpinner: React.FC;
/** `LoadingSpinner` with a pre-bound size of `large` */
export declare const LargeLoadingSpinner: React.FC;
export {};
// # sourceMappingURL=LoadingSpinner.d.ts.map
