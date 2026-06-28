import {Routes} from '@angular/router';
import {authGuard} from './iam/application/auth.guard';
import {guestGuard} from './iam/application/guest.guard';

const home = () => import('./shared/presentation/views/home/home').then(m => m.Home);
const about = () => import('./shared/presentation/views/about/about').then(m => m.About);
const layout = () =>
  import('./shared/presentation/components/layout/layout').then(m => m.Layout);
const authLayout = () =>
  import('./shared/presentation/components/auth-layout/auth-layout').then(m => m.AuthLayout);
const iamRoutes = () => import('./iam/presentation/iam.routes').then(m => m.iamRoutes);
const vehicleOffersRoutes = () =>
  import('./vehicle-offers/presentation/vehicle-offers.routes').then(m => m.vehicleOffersRoutes);
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

/**
 * Root router with two layout shells:
 *  - the minimal {@link AuthLayout} for the IAM auth screens (guarded by
 *    `guestGuard`: authenticated users are redirected to /home);
 *  - the main {@link Layout} (nav + footer), guarded by `authGuard`, for the
 *    authenticated app. Bounded contexts lazy-load their routes here.
 *
 * Both are empty-path parents: the router tries the auth shell first and falls
 * through to the main shell when no IAM child matches.
 */
export const routes: Routes = [
  {path: '', loadComponent: authLayout, loadChildren: iamRoutes, canActivate: [guestGuard]},
  {
    path: '',
    loadComponent: layout,
    canActivate: [authGuard],
    children: [
      {path: 'home', loadComponent: home},
      {path: 'about', loadComponent: about},
      {path: 'vehicle-offers', loadChildren: vehicleOffersRoutes},
      {path: '', redirectTo: 'home', pathMatch: 'full'},
    ],
  },
  {path: '**', loadComponent: pageNotFound},
];
