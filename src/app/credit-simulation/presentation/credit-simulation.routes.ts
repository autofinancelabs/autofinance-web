import {Routes} from '@angular/router';

const config = () =>
  import('./views/simulation-config/simulation-config').then(m => m.SimulationConfig);
const results = () =>
  import('./views/simulation-results/simulation-results').then(m => m.SimulationResults);

/**
 * Credit Simulation routes, mounted under `/credit-simulations` in the main shell.
 * There is no list-all endpoint (history is per client), so the entry point is the
 * configuration form ("new"); a generated/saved simulation is shown by id.
 */
export const creditSimulationRoutes: Routes = [
  {path: 'new', loadComponent: config},
  {path: ':id', loadComponent: results},
  {path: '', redirectTo: 'new', pathMatch: 'full'},
];
