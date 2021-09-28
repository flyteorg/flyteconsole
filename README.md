<html>
    <p align="center"> 
        <img src="https://github.com/flyteorg/flyte/blob/master/rsts/images/flyte_circle_gradient_1_4x4.png" alt="Flyte Logo" width="100">
    </p>
    <h1 align="center">
        Flyte Console
    </h1>
    <p align="center">
        Web UI for the Flyte platform
    </p>
    <h3 align="center">
        <a href="CONTRIBUTING.md">Contribution Guide</a>
    </h3>
</html>

<p align="center">
  <a href="https://github.com/lyft/flyteconsole/releases/latest">
      <img src="https://img.shields.io/github/release/lyft/flyteconsole.svg" alt="Current Release" />
  </a>
  <a href="https://travis-ci.org/lyft/flyteconsole">
      <img src="https://travis-ci.org/lyft/flyteconsole.svg?branch=master" alt="Build Status" />
  </a>
  <a href="http://www.apache.org/licenses/LICENSE-2.0.html">
      <img src="https://img.shields.io/badge/LICENSE-Apache2.0-ff69b4.svg" alt="License" />
  </a>
  <a href="https://codecov.io/gh/lyft/flyteconsole">
      <img src="https://img.shields.io/codecov/c/github/lyft/flyteconsole.svg" alt="Code Coverage" />
  </a>
</p>

## 📦 Install Dependencies
Running flyteconsole locally requires [NodeJS](https://nodejs.org) and
[yarn](https://yarnpkg.com). Once these are installed, all of the dependencies
can be installed by running `yarn` in the project directory.

## 🚀 Quick Start
1. Start a local Flyte sandbox by running `flytectl sandbox start --source=$(pwd)`

2. Now, export the following env variables:

    ``
    export ADMIN_API_URL=http://localhost:30081
    export DISABLE_AUTH=1
    ``

   > You can persist these environment variables either in the current shell or in a `.env` file at the root
     of the repository. A `.env` file will persist the settings across multiple terminal
     sessions.

3. Start the server (uses localhost:3000)

    ``bash
    yarn start
    ``

4. Explore your local copy at `http://localhost:3000`

## Environment Variables

* `ADMIN_API_URL` (default: [window.location.origin](https://developer.mozilla.org/en-US/docs/Web/API/Window/location>))

    The Flyte Console displays information fetched from the FlyteAdmin API. This
    environment variable specifies the host prefix used in constructing API requests.

    *Note*: this is only the host portion of the API endpoint, consisting of the
    protocol, domain, and port (if not using the standard 80/443).

    This value will be combined with a suffix (such as `/api/v1`) to construct the
    final URL used in an API request.

    *Default Behavior*

    In most cases, `flyteconsole` will be hosted in the same cluster as the Admin
    API, meaning that the domain used to access the console is the same value used to
    access the API. For this reason, if no value is set for `ADMIN_API_URL`, the
    default behavior is to use the value of `window.location.origin`.

* `BASE_URL` (default: `undefined`)

    This allows running the console at a prefix on the target host. This is
    necessary when hosting the API and console on the same domain (with prefixes of
    `/api/v1` and `/console` for example). For local development, this is
    usually not needed, so the default behavior is to run without a prefix.

* `CORS_PROXY_PREFIX` (default: `/cors_proxy`)

    Sets the local endpoint for [CORS request proxying](CONTRIBUTING.md#cors-proxying-recommended-setup).

## Run the server

To start the local development server, run `yarn start`. This will spin up a
Webpack development server, compile all of the code into bundles, and start the
NodeJS server on the default port (3000). All requests to the NodeJS server will
be stalled until the bundles have finished. The application will be accessible
at http://localhost:3000 (if using the default port).