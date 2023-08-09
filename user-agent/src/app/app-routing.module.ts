import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ConnectComponent } from './components/connect/connect.component';
import { HomeComponent } from './components/home/home.component';
import { OAUTH_REDIRECT_URI_PATH } from './services/auth/auth.service';
import { OauthCallbackComponent } from './components/oauth-callback/oauth-callback.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'connect', component: ConnectComponent },
  { path: OAUTH_REDIRECT_URI_PATH, component: OauthCallbackComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
