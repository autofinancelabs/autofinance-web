import {Routes} from '@angular/router';

const home = () => import('./shared/presentation/views/home/home').then(m => m.Home);
const about = () => import('./shared/presentation/views/about/about').then(m => m.About);
const layout = () =>
  import('./shared/presentation/components/layout/layout').then(m => m.Layout);
const authLayout = () =>
  import('./shared/presentation/components/auth-layout/auth-layout').then(m => m.AuthLayout);
const iamRoutes = () => import('./iam/presentation/iam.routes').then(m => m.iamRoutes);
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

/**
 * Root router with two layout shells:
 *  - the minimal {@link AuthLayout} for the IAM auth screens (/sign-in, /register);
 *  - the main {@link Layout} (nav + footer) for the rest of the app.
 *
 * Both are empty-path parents: the router tries the auth shell first and falls
 * through to the main shell when no IAM child matches. New bounded contexts add
 * their lazy routes under the main shell.
 */
export const routes: Routes = [
  {path: '', loadComponent: authLayout, loadChildren: iamRoutes},
  {
    path: '',
    loadComponent: layout,
    children: [
      {path: 'home', loadComponent: home},
      {path: 'about', loadComponent: about},
      {path: '', redirectTo: 'home', pathMatch: 'full'},
    ],
  },
  {path: '**', loadComponent: pageNotFound},
];
