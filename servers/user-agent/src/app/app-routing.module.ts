import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConnectComponent } from './components/connect/connect.component';
import { HomeComponent } from './components/home/home.component';
// import { OauthCallbackComponent } from './components/oauth-callback/oauth-callback.component';

/**
 * URI Path of redirect URI.
 */
export const OAUTH_REDIRECT_URI_PATH = 'redirect';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'connect', component: ConnectComponent },
  // { path: OAUTH_REDIRECT_URI_PATH, component: OauthCallbackComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
