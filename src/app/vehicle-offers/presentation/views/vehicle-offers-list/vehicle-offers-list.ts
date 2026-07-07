import {Component, computed, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmTooltipImports} from '@spartan-ng/helm/tooltip';
import {Currency} from '../../../../shared/domain/model/currency';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {VehicleOffersStore} from '../../../application/vehicle-offers.store';

/**
 * Lists the dealership's vehicle offers (with a summary side panel), and links
 * to create and edit.
 */
@Component({
  selector: 'app-vehicle-offers-list',
  imports: [RouterLink, HlmButton, HlmTooltipImports, MoneyPipe, Breadcrumbs],
  templateUrl: './vehicle-offers-list.html',
  styleUrl: './vehicle-offers-list.css',
})
export class VehicleOffersList implements OnInit {
  private readonly store = inject(VehicleOffersStore);

  protected readonly offers = this.store.offers;
  protected readonly loading = this.store.loading;
  protected readonly isEmpty = this.store.isEmpty;

  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Vehículos'},
  ];

  protected readonly total = computed(() => this.offers().length);
  protected readonly penCount = computed(
    () => this.offers().filter(offer => offer.salePrice.currency === Currency.PEN).length,
  );
  protected readonly usdCount = computed(
    () => this.offers().filter(offer => offer.salePrice.currency === Currency.USD).length,
  );

  ngOnInit(): void {
    this.store.load();
  }
}
