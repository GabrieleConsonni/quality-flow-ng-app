import { AuthConfig } from 'angular-oauth2-oidc';

export const authImplicitFlowConfig: (issuer: string) => AuthConfig = (issuer: string) => {
  const hostname = window.location.hostname;
  const hostParts = hostname.split('.');

  const tenant =
    hostname === 'localhost' || hostParts.length < 2
      ? 'akn-dev-local'
      : hostParts.length === 3
        ? hostParts[0]
        : `${hostParts[0]}.${hostParts[1]}`;

  return <AuthConfig>{
    issuer: `${issuer}/realms/${tenant}`,
    redirectUri: window.location.origin + window.location.pathname,
    clientId: 'nautilus-web',
    responseType: 'code',
    scope: 'openid profile email offline_access',
    showDebugInformation: false,
    timeoutFactor: 0.75,
    checkOrigin: false,
    requireHttps: false,
    sessionChecksEnabled: true,
    useSilentRefresh: false,
    silentRefreshRedirectUri: undefined,
  };
};
