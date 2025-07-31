# How flyteconsole releases work?

This repo uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate version management and packaging of new flyteconsole releases.

Every time a PR with commit messages including `feat` or `fix` is merged, `semantic-release` will automatically cut a new flyteconsole release.
This can be tracked with [this action](https://github.com/flyteorg/flyteconsole/actions/workflows/checks.yml), specifically the [Generate Release](https://github.com/flyteorg/flyteconsole/blob/acbb626ebdc3fb24040306e42ffcdaada8fc14b3/.github/workflows/checks.yml#L69-L91) step.

Currently, flyteconsole releases are independent from flyte or flytekit releases, **but there is a caveat**: on every new flyteconsole release, the corresponding packages are pushed to the [flyteconsole GHCR repo](https://github.com/flyteorg/flyteconsole/pkgs/container/flyteconsole).
However, part of the Flyte release process automation includes checking for new flyteconsole releases, pulling the latest from the flyteconsole repo and pushing the package to a different [flyteconsole-release](https://github.com/flyteorg/flyteconsole/pkgs/container/flyteconsole-release/) repo, where many users and customers are used to pull from.

This means that, in order to sync packages between these two registries, we need to cut a Flyte release AFTER a flyteconsole release is out.
