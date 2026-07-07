import {Routes} from '@angular/router';

const list = () => import('./views/clients-list/clients-list').then(m => m.ClientsList);
const form = () => import('./views/client-form/client-form').then(m => m.ClientForm);

/**
 * Clients routes, mounted under `/clients` in the main shell.
 */
export const clientsRoutes: Routes = [
  {path: '', loadComponent: list},
  {path: 'new', loadComponent: form},
  {path: ':id/edit', loadComponent: form},
];
