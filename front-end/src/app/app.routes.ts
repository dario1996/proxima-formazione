import { AuthGuard } from './core/services/route-guard.service';
import { Routes } from '@angular/router';
import { Ruoli } from './shared/models/Ruoli';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'gestionale-formazione',
    loadComponent: () =>
      import('./modules/home/pages/welcome/welcome.component').then(
        m => m.WelcomeComponent,
      ),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './modules/dashboard/pages/home-dashboard/home-dashboard.component'
          ).then(m => m.HomeDashboardComponent),
      },
      {
        path: 'dipendenti',
        loadComponent: () =>
          import(
            './modules/dipendenti/pages/dipendenti/dipendenti.component'
          ).then(m => m.DipendentiComponent),
      },
    ],
    canActivate: [AuthGuard],
    data: { roles: [Ruoli.amministratore] },
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./modules/login/pages/login/login.component').then(
        m => m.LoginComponent,
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import(
        './modules/login/pages/registrazione/registrazione.component'
      ).then(m => m.RegistrazioneComponent),
  },
  {
    path: 'user/settings',
    loadComponent: () =>
      import('./modules/login/pages/settings/settings.component').then(
        m => m.SettingsComponent,
      ),
  },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./modules/home/pages/welcome/welcome.component').then(
        m => m.WelcomeComponent,
      ),
    canActivate: [AuthGuard],
    data: { roles: [Ruoli.utente] },
  },
  {
    path: 'welcome/:userid',
    loadComponent: () =>
      import('./modules/home/pages/welcome/welcome.component').then(
        m => m.WelcomeComponent,
      ),
    canActivate: [AuthGuard],
    data: { roles: [Ruoli.utente] },
  },
  {
    path: 'logout',
    loadComponent: () =>
      import('./modules/logout/pages/logout/logout.component').then(
        m => m.LogoutComponent,
      ),
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('./modules/errors/pages/forbidden/forbidden.component').then(
        m => m.ForbiddenComponent,
      ),
      //canActivate: [AuthGuard],
    //data: { roles: [Ruoli.utente] },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./modules/errors/pages/error/error.component').then(
        m => m.ErrorComponent,
      ),
  },
];
