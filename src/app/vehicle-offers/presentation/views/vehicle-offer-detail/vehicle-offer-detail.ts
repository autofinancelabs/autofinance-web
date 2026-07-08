import {Component, computed, inject, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {VehicleOffersStore} from '../../../application/vehicle-offers.store';
import {MODEL_PRESET_LABEL} from '../../../domain/model/vehicle-3d-palette';
import {Vehicle3dViewer} from '../../components/vehicle-3d-viewer/vehicle-3d-viewer';

/**
 * Detail view of a single vehicle offer: its data plus, when present, the big
 * rotating 3D model and its cosmetic breakdown. Reuses the store's `loadOne` /
 * `selected` (same idiom as the credit-simulation results view).
 */
@Component({
  selector: 'app-vehicle-offer-detail',
  imports: [RouterLink, HlmButton, MoneyPipe, Breadcrumbs, Vehicle3dViewer],
  templateUrl: './vehicle-offer-detail.html',
  styleUrl: './vehicle-offer-detail.css',
})
export class VehicleOfferDetail implements OnInit {
  private readonly store = inject(VehicleOffersStore);
  private readonly route = inject(ActivatedRoute);

  protected readonly id = this.route.snapshot.paramMap.get('id')!;
  protected readonly offer = this.store.selected;
  protected readonly loading = this.store.loading;
  protected readonly presetLabel = MODEL_PRESET_LABEL;

  protected readonly breadcrumbs = computed(() => [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Vehículos', link: '/vehicle-offers'},
    {label: this.offer() ? `${this.offer()!.make} ${this.offer()!.model}` : 'Oferta'},
  ]);

  /** The cosmetic options that are enabled, as display labels. */
  protected readonly options = computed(() => {
    const model = this.offer()?.model3d;
    if (!model) {
      return [];
    }
    const labels: string[] = [];
    if (model.sportWheels) labels.push('Llantas deportivas');
    if (model.spoiler) labels.push('Spoiler');
    if (model.panoRoof) labels.push('Techo panorámico');
    return labels;
  });

  ngOnInit(): void {
    if (this.store.selected()?.id !== this.id) {
      this.store.loadOne(this.id);
    }
  }
}
