export interface AppRoute {
  path?: string;
  component: React.FC<any>;
  exact?: boolean;
}

export interface AppFrameRoutesConfig {
  navBarRoutes: AppRoute[];
  appContentRoutes: AppRoute[];
}
