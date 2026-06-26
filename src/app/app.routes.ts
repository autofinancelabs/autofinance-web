import {Routes} from '@angular/router';

const home = () => import('./shared/presentation/views/home/home').then(m => m.Home);
const about = () => import('./shared/presentation/views/about/about').then(m => m.About);
const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

/**
 * Root router. Mounts the shared app-wide views; each bounded context will add
 * its own lazy-loaded routes here via `loadChildren` as it is built.
 */
export const routes: Routes = [
  {path: 'home', loadComponent: home},
  {path: 'about', loadComponent: about},
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: '**', loadComponent: pageNotFound},
];
