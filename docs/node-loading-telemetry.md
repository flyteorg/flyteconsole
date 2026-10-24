# Node loading timings

The Nodes tab records two browser User Timing measurements for an expand click:

-   `flyteconsole.node.expand`: time until React commits the expanded rows (the existing measurement).
-   `flyteconsole.node.expand.children_loaded`: time from the same click until those rows satisfy their child-loading readiness checks, including applying child execution data and dynamic workflow definitions to the row's graph data. This does not measure the browser's final paint.

Both entries include `detail.workflowName`, `detail.executionId`, and `detail.scopedId`. The workflow name comes from the execution's workflow ID, rather than its launch plan name.

The implementation has three steps:

1. Clicking expand starts one timer. The existing measurement finishes when React renders the expanded rows.
2. Each row reports whether its children are ready. A response must be applied to the row data; dynamic workflow definitions must also appear in the rendered graph.
3. When every displayed row reports ready, the new measurement finishes using the same click time.

Offscreen rows don't block the timer because they fetch on scroll. Cached data and successful empty responses count as ready; background polling does not delay completion. Failed requests remain pending, so a successful retry includes the wait. Collapse, changing filters, navigation, or another toggle cancels the pending measurement. Only the latest expansion is tracked.

## Example: Parent with Child A and Child B

The table owns the timer. Each row's provider reports whether that row's child-loading requirements are ready. In this example, Child A and Child B are leaf tasks.

```text
Click "+" on Parent
        |
        v
NodeExecutionsTable.onToggleNode(parent)
  - Save the click time and the parent being measured
  - Call the existing toggleNode(parent)
        |
        v
React commits the expanded rows:

    [-] Parent
          Child A
          Child B
        |
        v
Table records: flyteconsole.node.expand
  The rows exist; their data may still be loading.

Each row's NodeExecutionDynamicProvider reports readiness:

    Parent  -> Wait for child execution records to be applied.
               If dynamic, also wait for its workflow definition
               to be applied to the graph.
    Child A -> Leaf: no children to load, so ready.
    Child B -> Leaf: no children to load, so ready.
        |
        | reportRowReadiness(nodeId, ready)
        v
Table's readiness Map:

    Parent  -> false
    Child A -> true
    Child B -> true
        |
        | Parent's data is applied; its provider reports ready.
        v
    Parent  -> true
    Child A -> true
    Child B -> true
        |
        v
Table checks the parent and its displayed descendants:
  All ready?
        |
       YES
        |
        v
Table records: flyteconsole.node.expand.children_loaded
  Use the SAME original click time, then clear the pending timer.
```

The `Map` is a checklist stored in a ref. `reportRowReadiness` updates it in place. While an expansion is pending, changed reports also increment `readinessVersion`, prompting the table to check the checklist again. Reports received without an active expansion do not request a table render.

Fetching and readiness reports can happen before the click, and reports can arrive in any order. If readiness is already satisfied when the expanded rows commit, both measurements can finish together. Rows confirmed to be offscreen do not block readiness. Another toggle replaces or cancels the pending timer.

```text
Row button   -> "The user clicked this node."
Row provider -> "This row's child-loading requirements are ready."
Table        -> "Everyone we are waiting for is ready; stop timing."
```

## Inspecting measurements

To inspect the measurements in your browser's developer console:

```js
performance.getEntriesByType('measure');
```

Each entry's `duration` is in milliseconds. The measurements also appear in the browser's Performance panel.
