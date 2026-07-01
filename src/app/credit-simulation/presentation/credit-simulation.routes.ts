import {Routes} from '@angular/router';

const list = () =>
  import('./views/simulations-list/simulations-list').then(m => m.SimulationsList);
const config = () =>
  import('./views/simulation-config/simulation-config').then(m => m.SimulationConfig);
const results = () =>
  import('./views/simulation-results/simulation-results').then(m => m.SimulationResults);
const history = () =>
  import('./views/simulation-history/simulation-history').then(m => m.SimulationHistory);

/**
 * Credit Simulation routes, mounted under `/credit-simulations` in the main shell.
 * The landing is the tenant-wide list of all the advisor's simulations; "new" is the
 * configuration form, "by-client/:clientId" a client's history, and ":id" a result.
 */
export const creditSimulationRoutes: Routes = [
  {path: '', loadComponent: list},
  {path: 'new', loadComponent: config},
  {path: 'by-client/:clientId', loadComponent: history},
  {path: ':id', loadComponent: results},
];
