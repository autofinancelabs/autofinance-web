import {Routes} from '@angular/router';

const list = () =>
  import('./views/vehicle-offers-list/vehicle-offers-list').then(m => m.VehicleOffersList);
const form = () =>
  import('./views/vehicle-offer-form/vehicle-offer-form').then(m => m.VehicleOfferForm);
const detail = () =>
  import('./views/vehicle-offer-detail/vehicle-offer-detail').then(m => m.VehicleOfferDetail);

/**
 * Vehicle Offers routes, mounted under `/vehicle-offers` in the main shell.
 * `:id` (detail) is declared after `new` and `:id/edit` so those match first.
 */
export const vehicleOffersRoutes: Routes = [
  {path: '', loadComponent: list},
  {path: 'new', loadComponent: form},
  {path: ':id/edit', loadComponent: form},
  {path: ':id', loadComponent: detail},
];
