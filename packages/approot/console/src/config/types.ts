export interface Env extends NodeJS.ProcessEnv {
  ADMIN_API_URL?: string;
  BASE_URL?: string;
  FLYTE_NAVIGATION?: string;

  DISABLE_ANALYTICS?: string;
  NODE_ENV?: 'development' | 'production' | 'test';
  STATUS_URL?: string;
}
