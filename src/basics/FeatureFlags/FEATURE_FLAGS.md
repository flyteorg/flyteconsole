**Example - adding flags:**

```javascript
enum FeatureFlags {
    ...
    AddNewPage: 'add-new-page'
    UseCommonPath: 'use-common-path'
}

export const defaultFlagConfig: FeatureFlagConfig = {
    ...
    'add-new-page': false, // default/prior behavior doesn't include new page
    'use-common-path': true, // default/prior behavior uses common path
};
```

To use flags in code you need to ensure that the most top level component is wrapped by `FeatureFlagsProvider`.
By default we are wrapping top component in Apps file, so if you do not plan to include
feature flags checks in the `\*.tests.tsx` - you should be good to go.
To check flag's value use `useFeatureFlag` hook.

**Example - flag usage**:

```javascript
import { FeatureFlag, useFeatureFlag } from 'basics/FeatureFlags';

export function MyComponent(props: Props): React.ReactNode {
    ...
    const isFlagEnabled = useFeatureFlag(FeatureFlag.AddNewPage);

    return isFlagEnabled ? <NewPage ...props/> : null;
}
```

During your local development you can either:

-   temporarily switch flags value in runtimeConfig as:
    ```javascript
    let runtimeConfig = {
        ...defaultFlagConfig,
        'add-new-page': true,
    };
    ```
-   turn flag on/off from the devTools console in Chrome
    ![SetFeatureFlagFromConsole](https://user-images.githubusercontent.com/55718143/150002962-f12bbe57-f221-4bbd-85e3-717aa0221e89.gif)
