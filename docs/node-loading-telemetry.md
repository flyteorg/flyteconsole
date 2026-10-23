# Node loading timings

The Nodes tab records two browser User Timing measurements for an expand click:

- `flyteconsole.node.expand`: time until the expanded rows render (the existing measurement).
- `flyteconsole.node.expand.children_loaded`: time from the same click until those rows also have their child execution data and dynamic workflow definitions loaded and rendered.

Both entries include `detail.workflowName`, `detail.executionId`, and `detail.scopedId`. The workflow name comes from the execution's workflow ID, rather than its launch plan name.

The child-loading measurement waits for the expanded parent and its displayed descendants. It excludes loaders below the viewport, since their requests start when the user scrolls to them. Cached data and successful empty responses count as loaded; background polling does not delay completion. Errors, collapse, changing filters, navigation, or another toggle abandon the pending child-loading measurement. As with the existing timer, only the latest expansion is tracked.

To inspect the measurements in your browser's developer console:

```js
performance.getEntriesByType('measure').filter((entry) => entry.name.startsWith('flyteconsole.node.expand'))
```

Each entry's `duration` is in milliseconds. The measurements also appear in the browser's Performance panel.
