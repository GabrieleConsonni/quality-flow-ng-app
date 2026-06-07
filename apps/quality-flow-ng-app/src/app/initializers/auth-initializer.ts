import { authImplicitFlowConfig } from '@quality-flow/auth.config';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { lastValueFrom } from 'rxjs';

interface IdpConfig {
  issuerUri: string;
}

export async function initializeAuth(oauthService: OAuthService, httpClient: HttpClient): Promise<void> {
  const idpConfig = await lastValueFrom(httpClient.get<IdpConfig>('public/idp-config'));
  const authConfig = authImplicitFlowConfig(idpConfig.issuerUri);
  oauthService.configure(authConfig);
  await oauthService.loadDiscoveryDocumentAndTryLogin();
  oauthService.setupAutomaticSilentRefresh();
}
