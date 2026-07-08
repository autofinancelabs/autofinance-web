import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmTooltipImports} from '@spartan-ng/helm/tooltip';
import {Currency} from '../../../../shared/domain/model/currency';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {VehicleOffersStore} from '../../../application/vehicle-offers.store';
import {Vehicle3dModel} from '../../../domain/model/vehicle-3d-model';
import {MODEL_PRESET_LABEL} from '../../../domain/model/vehicle-3d-palette';

/**
 * Lists the dealership's vehicle offers (with a summary side panel), and links to
 * create, detail and edit. Offers with a 3D model get a small static thumbnail,
 * rendered lazily by an offscreen WebGL helper loaded on demand (so three.js stays
 * out of this chunk).
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

  protected readonly presetLabel = MODEL_PRESET_LABEL;

  /** Offer id -> rendered thumbnail data URL. */
  private readonly thumbnails = signal<Map<string, string>>(new Map());

  protected thumb(offerId: string): string | undefined {
    return this.thumbnails().get(offerId);
  }

  protected readonly total = computed(() => this.offers().length);
  protected readonly penCount = computed(
    () => this.offers().filter(offer => offer.salePrice.currency === Currency.PEN).length,
  );
  protected readonly usdCount = computed(
    () => this.offers().filter(offer => offer.salePrice.currency === Currency.USD).length,
  );

  constructor() {
    // Render thumbnails for offers with a 3D model whenever the list changes.
    effect(() => {
      const pending = this.offers().filter(
        offer => offer.model3d !== null && !this.thumbnails().has(offer.id),
      );
      if (pending.length > 0) {
        void this.renderThumbnails(pending.map(offer => ({id: offer.id, model3d: offer.model3d!})));
      }
    });
  }

  private async renderThumbnails(items: {id: string; model3d: Vehicle3dModel}[]): Promise<void> {
    const {renderVehicleThumbnail} = await import(
      '../../components/vehicle-3d-viewer/vehicle-3d-thumbnail'
    );
    const next = new Map(this.thumbnails());
    for (const item of items) {
      const url = renderVehicleThumbnail(item.model3d, 128);
      if (url !== null) {
        next.set(item.id, url);
      }
    }
    this.thumbnails.set(next);
  }

  ngOnInit(): void {
    this.store.load();
  }
}
