import {Routes} from '@angular/router';
import {authGuard} from './iam/application/auth.guard';
import {guestGuard} from './iam/application/guest.guard';

const dashboard = () =>
  import('./shared/presentation/views/dashboard/dashboard').then(m => m.Dashboard);
const appShell = () =>
  import('./shared/presentation/components/app-shell/app-shell').then(m => m.AppShell);
const authLayout = () =>
  import('./shared/presentation/components/auth-layout/auth-layout').then(m => m.AuthLayout);
const iamRoutes = () => import('./iam/presentation/iam.routes').then(m => m.iamRoutes);
const vehicleOffersRoutes = () =>
  import('./vehicle-offers/presentation/vehicle-offers.routes').then(m => m.vehicleOffersRoutes);
const clientsRoutes = () =>
  import('./clients/presentation/clients.routes').then(m => m.clientsRoutes);
const creditSimulationRoutes = () =>
  import('./credit-simulation/presentation/credit-simulation.routes').then(
    m => m.creditSimulationRoutes,
  );
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

/**
 * Root router with two layout shells:
 *  - the minimal {@link AuthLayout} for the IAM auth screens (guarded by
 *    `guestGuard`);
 *  - the {@link AppShell} (topbar + sidebar), guarded by `authGuard`, for the
 *    authenticated app. Bounded contexts lazy-load their routes here.
 */
export const routes: Routes = [
  {path: '', loadComponent: authLayout, loadChildren: iamRoutes, canActivate: [guestGuard]},
  {
    path: '',
    loadComponent: appShell,
    canActivate: [authGuard],
    children: [
      {path: 'dashboard', loadComponent: dashboard},
      {path: 'vehicle-offers', loadChildren: vehicleOffersRoutes},
      {path: 'clients', loadChildren: clientsRoutes},
      {path: 'credit-simulations', loadChildren: creditSimulationRoutes},
      {path: '', redirectTo: 'dashboard', pathMatch: 'full'},
    ],
  },
  {path: '**', loadComponent: pageNotFound},
];
