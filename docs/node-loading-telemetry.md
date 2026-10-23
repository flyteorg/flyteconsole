# Node loading timings

The Nodes tab records two browser User Timing measurements for an expand click:

- `flyteconsole.node.expand`: time until the expanded rows render (the existing measurement).
- `flyteconsole.node.expand.children_loaded`: time from the same click until those rows also have their child execution data and dynamic workflow definitions loaded and rendered.

Both entries include `detail.workflowName`, `detail.executionId`, and `detail.scopedId`. The workflow name comes from the execution's workflow ID, rather than its launch plan name.

The implementation has three steps:

1. Clicking expand starts one timer. The existing measurement finishes when React renders the expanded rows.
2. Each row reports whether its children are ready. A response must be applied to the row data; dynamic workflow definitions must also appear in the rendered graph.
3. When every displayed row reports ready, the new measurement finishes using the same click time.

Offscreen rows don't block the timer because they fetch on scroll. Cached data and successful empty responses count as ready; background polling does not delay completion. Failed requests remain pending, so a successful retry includes the wait. Collapse, changing filters, navigation, or another toggle cancels the pending measurement. Only the latest expansion is tracked.

To inspect the measurements in your browser's developer console:

```js
performance.getEntriesByType('measure')
```

Each entry's `duration` is in milliseconds. The measurements also appear in the browser's Performance panel.
