export interface Env extends NodeJS.ProcessEnv {
  ADMIN_API?: string;
  /**
   * @depricated use BASE_HREF
   */
  BASE_URL?: string;

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
  BASE_HREF?: string;
  DISABLE_CONSOLE_ROUTE_PREFIX?: string;

  DISABLE_ANALYTICS?: string;
  NODE_ENV?: 'development' | 'production' | 'test';
  STATUS_URL?: string;
  ADMIN_REQUEST_HEADERS?: string;

  /**
   * This is used to prevent use of the app during outages.
   * If this is set to 'true', the app will display a maintenance page.
   * You can provide a custom message by setting this to a string.
   *
   * @example MAINTENANCE_MODE=true
   * @example MAINTENANCE_MODE="We are currently down for maintenance.\n\nPlease try again later."
   */
  MAINTENANCE_MODE?: string;
}

/** Represents a plain object where string keys map to values of the same type */
type Dictionary<T> = { [k: string]: T };

declare global {
  export interface Window {
    __INITIAL_DATA__?: {
      config?: Dictionary<object>;
    };
    env: Env;
  }
}

const makeEnvInit = () => {
  const envInit = {
    ...process.env,
    ...window.env,
  };

  if (envInit.BASE_URL) {
    if (envInit.NODE_ENV !== 'test' && envInit.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('BASE_URL will be depricated.');
    }
  }

  // Ensure that the BASE_HREF is a valid URL or empty
  const urlOrEmpty = envInit?.BASE_HREF ? new URL(envInit.BASE_HREF).href : '';
  envInit.BASE_HREF = urlOrEmpty;

  envInit.MAINTENANCE_MODE = envInit.MAINTENANCE_MODE || '';

  window.env = envInit;
  return envInit;
};

export const env: Env = makeEnvInit();

export const isDevEnv = () => env.NODE_ENV === 'development';
export const isTestEnv = () => env.NODE_ENV === 'test';
