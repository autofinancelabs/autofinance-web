import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmTooltipImports} from '@spartan-ng/helm/tooltip';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {VehicleOffersStore} from '../../../application/vehicle-offers.store';

/**
 * Lists the dealership's vehicle offers, with links to create and edit.
 */
@Component({
  selector: 'app-vehicle-offers-list',
  imports: [RouterLink, HlmButton, HlmTooltipImports, MoneyPipe],
  templateUrl: './vehicle-offers-list.html',
  styleUrl: './vehicle-offers-list.css',
})
export class VehicleOffersList implements OnInit {
  private readonly store = inject(VehicleOffersStore);

  protected readonly offers = this.store.offers;
  protected readonly loading = this.store.loading;
  protected readonly isEmpty = this.store.isEmpty;

  ngOnInit(): void {
    this.store.load();
  }
}
