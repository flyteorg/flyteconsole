import path from 'path';
import dotenv from 'dotenv';

// load .env file
// cloud/clients/.env
// if not found it quietly errors out

// @ts-ignore
const projectRoot = path.resolve(process.cwd(), '../../', '.env');
const file = dotenv.config({ path: projectRoot });
if (file.error) {
  // eslint-disable-next-line no-console
  console.warn('No .env file found. Using environment variables from the shell.');
}

/**
 * @file Provides environment variables
 * Do not import this file into client/server code. Use common/env.ts instead
 */

/** Current environment environment. "development", "test" or "production" */
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Certificate path required for local development, should not include trailing '/'.
 * Located at top level of the repository in script folder
 */
const CERTIFICATE_PATH = '../../scripts/certificate';

// Use this to create SSL server
const ADMIN_API_USE_SSL = process.env.ADMIN_API_USE_SSL || 'http';

// Admin domain used as base for window URL and API urls
const ADMIN_API_URL = process.env.ADMIN_API_URL?.replace(/https?:\/\//, '') || '';

// If this is unset, API calls will default to the same host used to serve this app
const ADMIN_API = ADMIN_API_URL ? `//${ADMIN_API_URL}` : '';

// Webpage for local development
const LOCAL_DEV_HOST = `localhost.${ADMIN_API_URL}`;

/**
 * @depricated use BASE_HREF
 */
const BASE_URL = process.env.BASE_URL || '';

/**
 * The URL path to the root of the application.
 * This is used to configure the React-Router basename and the <base> tag in index.html.
 * Leave empty if deploying from the root of the domain.
 *
 * BASE_HREF=https://example.com/flyte/ui/here
 * The pathname section, "/flyte/ui/here", would be used as the basepath
 *
 * Read more about the <base> tag here:
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/base
 */
const BASE_HREF = process.env.BASE_HREF || '';

const DISABLE_CONSOLE_ROUTE_PREFIX = process.env.DISABLE_CONSOLE_ROUTE_PREFIX || '';

/** All emitted assets will have relative path to this path
 * every time it is changed - the index.js app.use should also be updated.
 */
const ASSETS_PATH = `${BASE_URL}/assets/`;

/**
 * This is used to prevent use of the app during outages.
 * If this is set to 'true', the app will display a maintenance page.
 * You can provide a custom message by setting this to a string.
 *
 * @example MAINTENANCE_MODE=true
 * @example MAINTENANCE_MODE="We are currently down for maintenance.\n\nPlease try again later."
 */
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE || '';

const processEnv = {
  NODE_ENV,
  ADMIN_API,
  ADMIN_API_URL,
  BASE_URL,
  BASE_HREF,
  DISABLE_CONSOLE_ROUTE_PREFIX,
  MAINTENANCE_MODE,
};

export {
  NODE_ENV,
  BASE_URL,
  BASE_HREF,
  DISABLE_CONSOLE_ROUTE_PREFIX,
  ASSETS_PATH,
  CERTIFICATE_PATH,
  ADMIN_API_USE_SSL,
  ADMIN_API_URL,
  ADMIN_API,
  LOCAL_DEV_HOST,
  MAINTENANCE_MODE,
  processEnv,
};
