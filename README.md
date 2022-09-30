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
  <a href="https://slack.flyte.org">
      <img src="https://img.shields.io/badge/slack-join_chat-white.svg?logo=slack&style=social" alt="Slack" />
  </a>
</p>

## 📦 Install Dependencies

Running flyteconsole locally requires [NodeJS](https://nodejs.org) and
[yarn](https://yarnpkg.com). Once these are installed, you can run application locally.
For help with installing dependencies look into
[Installation section](CONTRIBUTING.md#-install-dependencies).

## 🚀 Quick Start

1. Follow [Start a Local flyte backend](https://docs.flyte.org/en/latest/getting_started/index.html), like:
    ```bash
    docker run --rm --privileged -p 30080:30080 -p 30081:30081 -p 30082:30082 -p 30084:30084 cr.flyte.org/flyteorg/flyte-sandbox
    ```
2. Now, export the following env variables:

    `export ADMIN_API_URL=http://localhost:30080 export DISABLE_AUTH=1`

    > You can persist these environment variables either in the current shell or in a `.env` file at the root
    > of the repository. A `.env` file will persist the settings across multiple terminal
    > sessions.

3. Start the server (uses localhost:3000)

    `bash yarn start `

4. Explore your local copy at `http://localhost:3000`

### Note: Python errors with OSX

Recently OSX (12.3) removed python 2.7 from default installation and this can cause build errors for some users depending on it's setup. In this repository you can experience `env: python: No such file or directory` error from gyp ([node-gyp](https://github.com/nodejs/node-gyp)).
The easiest way to fix it:

-   Install the XCode Command Line Tools standalone by running `xcode-select --install` in the terminal

OR

```bash
   brew install python    # install python with brew
   which python           # check if python path is properly defined
   # if path not defined
   where python3
   # Take the version and location from above and run this command (replacing `/usr/bin/python3` with the location of your python instalation). This will symlink python to python3
   ln -s /usr/bin/python3 /usr/local/bin/python
```

### Environment Variables

-   `ADMIN_API_URL` (default: [window.location.origin](https://developer.mozilla.org/en-US/docs/Web/API/Window/location>))

    The Flyte Console displays information fetched from the FlyteAdmin API. This
    environment variable specifies the host prefix used in constructing API requests.

    _Note_: this is only the host portion of the API endpoint, consisting of the
    protocol, domain, and port (if not using the standard 80/443).

    This value will be combined with a suffix (such as `/api/v1`) to construct the
    final URL used in an API request.

    _Default Behavior_

    In most cases, `flyteconsole` will be hosted in the same cluster as the Admin
    API, meaning that the domain used to access the console is the same value used to
    access the API. For this reason, if no value is set for `ADMIN_API_URL`, the
    default behavior is to use the value of `window.location.origin`.

-   `BASE_URL` (default: `undefined`)

    This setting allows running the console at a prefix on the target host. This is
    necessary when hosting the API and console on the same domain (with prefixes of
    `/api/v1` and `/console` for example). For local development, this is
    usually not needed, so the default behavior is to run without a prefix.

-   `FLYTE_NAVIGATION` (default: `undefined`)
    UI related. Allows you to change colors of the navigation bar and add links
    to other internal pages or external sites. **[More info](packages/zapp/console/src/components/Navigation/Readme.md)**

### Running from docker image as localhost

To run flyteconsole directly from your docker image as localhost you must set a
few environment variables in your run command to setup the appliation.

`BASE_URL="/console"` (required)

`CONFIG_DIR="/etc/flyte/config"` (required)

`DISABLE_AUTH="1"` (optional)

This example assumes building from `v1.0.0` on port `8080`

```bash
docker run -p 8080:8080 -e BASE_URL="/console" -e CONFIG_DIR="/etc/flyte/config" -e DISABLE_AUTH="1" ghcr.io/flyteorg/flyteconsole:v1.0.0
```

### Run the server

To start the local development server run:

```bash
yarn install    # to install node_modules
yarn start      # to start application
```

This will spin up a Webpack development server, compile all of the code into bundles,
and start the NodeJS server on the default port (3000). All requests to the NodeJS server
will be stalled until the bundles have finished. The application will be accessible
at http://localhost:3000 (if using the default port).

### 🎱 Using items in your own application

-   Authorize your app to call flyte admin api. **[More info](packages/plugins/flyte-api/README.md)**

## 🛠 Development

For continious development we are using:

-   **[Protobuf and Debug Output](CONTRIBUTING.md#protobuf-and-debug-output)**.
    Protobuf is a binary response/request format, which makes _Network Tab_ hardly useful.
    To get more info on requests - use our Debug Output
-   **[Storybook](CONTRIBUTING.md#storybook)**
    \- used for component stories and base UI testing.

-   **[Feature flags](CONTRIBUTING.md#feature-flags)**
    \- allows to enable/disable specific code paths. Used to simplify continious development.

-   **[Google Analytics](CONTRIBUTING.md#google-analytics)**
    \- adds tracking code to the app or website. To disable use `ENABLE_GA=false`

More info on each section could be found at [CONTRIBUTING.md](CONTRIBUTING.md)

-   Set `ADMIN_API_URL` and `ADMIN_API_USE_SSL`

    ```bash
    export ADMIN_API_URL=https://different.admin.service.com
    export ADMIN_API_USE_SSL="https"
    export LOCAL_DEV_HOST=localhost.different.admin.service.com
    ```

    > **Hint:** Add these to your local profile (eg, `./profile`) to prevent having to do this step each time

-   Generate SSL certificate

    Run the following command from your `flyteconsole` directory

    ```bash
    make generate_ssl
    ```

-   Add new record to hosts file

    ```bash
    sudo vim /etc/hosts
    ```

    Add the following record

    ```bash
    127.0.0.1 localhost.different.admin.service.com
    ```

-   Install Chrome plugin: [Moesif Origin & CORS Changer](https://chrome.google.com/webstore/detail/moesif-origin-cors-change/digfbfaphojjndkpccljibejjbppifbc)

    > _NOTE:_
    >
    > 1. Activate plugin (toggle to "on")
    > 1. Open 'Advanced Settings':
    >
    > -   set `Access-Control-Allow-Credentials`: `true`
    > -   set `Domain List`: `your.localhost.com`

-   Start `flyteconsole`

    ```bash
    yarn start
    ```

    Your new localhost is [localhost.different.admin.service.com](http://localhost.different.admin.service.com)

    > **Hint:** Ensure you don't have `ADMIN_API_URL` set (eg, in your `/.profile`.)

## ⛳️ Release

To release, you have to annotate the PR message to include one of the following [commit-analyzer types](https://github.com/semantic-release/commit-analyzer#rules-matching)
