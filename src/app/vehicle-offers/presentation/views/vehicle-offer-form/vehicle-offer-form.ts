import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {form, FormField, min, required, submit, validate} from '@angular/forms/signals';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmError, HlmFormField} from '@spartan-ng/helm/form-field';
import {Currency} from '../../../../shared/domain/model/currency';
import {Money} from '../../../../shared/domain/model/money';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {MoneyPipe} from '../../../../shared/presentation/money.pipe';
import {VehicleOffersStore} from '../../../application/vehicle-offers.store';
import {VehicleOfferDraft} from '../../../domain/model/vehicle-offer-draft.command';

interface VehicleOfferModel {
  make: string;
  model: string;
  year: number | null;
  salePrice: number | null;
  currency: Currency;
  planName: string;
  planInstallments: number | null;
}

/**
 * Create / edit form for a vehicle offer (Signal Forms). With a route `:id` it
 * preloads the offer for editing; otherwise it creates a new one. Server errors
 * are surfaced as toasts; only client-side validation is shown inline.
 */
@Component({
  selector: 'app-vehicle-offer-form',
  imports: [
    FormField,
    RouterLink,
    HlmInput,
    HlmLabel,
    HlmError,
    HlmFormField,
    HlmButton,
    MoneyPipe,
    Breadcrumbs,
  ],
  templateUrl: './vehicle-offer-form.html',
  styleUrl: './vehicle-offer-form.css',
})
export class VehicleOfferForm extends BaseForm implements OnInit {
  private readonly store = inject(VehicleOffersStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly currencies = [Currency.PEN, Currency.USD];
  protected readonly saving = this.store.saving;

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = this.id !== null;

  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Vehículos', link: '/vehicle-offers'},
    {label: this.id !== null ? 'Editar oferta' : 'Nueva oferta'},
  ];

  /** Live preview of the offer, derived from the form model. */
  protected readonly preview = computed(() => {
    const value = this.model();
    const title = `${value.make} ${value.model}`.trim();
    const hasPlan = value.planName.trim() !== '' && value.planInstallments !== null;
    return {
      title: title === '' ? 'Nueva oferta' : title,
      year: value.year,
      price:
        value.salePrice !== null
          ? new Money({amount: value.salePrice, currency: value.currency})
          : null,
      planLabel: hasPlan ? `${value.planName.trim()} · ${value.planInstallments} cuotas` : null,
    };
  });

  protected readonly model = signal<VehicleOfferModel>({
    make: '',
    model: '',
    year: null,
    salePrice: null,
    currency: Currency.PEN,
    planName: '',
    planInstallments: null,
  });

  protected readonly f = form(this.model, path => {
    required(path.make, {message: this.messageFor('marca', 'required')});
    required(path.model, {message: this.messageFor('modelo', 'required')});
    required(path.year, {message: this.messageFor('año', 'required')});
    min(path.year, 1, {message: 'Ingresa un año válido.'});
    required(path.salePrice, {message: this.messageFor('precio de venta', 'required')});
    min(path.salePrice, 1, {message: 'El precio de venta debe ser mayor que 0.'});
    required(path.currency, {message: this.messageFor('moneda', 'required')});
    // Plan is all-or-nothing.
    validate(path.planName, ctx => {
      const installments = ctx.valueOf(path.planInstallments);
      const name = ctx.value().trim();
      if (installments !== null && name === '') {
        return {kind: 'required', message: 'Indica el nombre del plan.'};
      }
      return undefined;
    });
    validate(path.planInstallments, ctx => {
      const name = ctx.valueOf(path.planName).trim();
      const installments = ctx.value();
      if (name !== '' && (installments === null || installments <= 0)) {
        return {kind: 'min', message: 'Indica las cuotas del plan (mayor que 0).'};
      }
      return undefined;
    });
  });

  constructor() {
    super();
    effect(() => {
      const offer = this.store.selected();
      if (offer !== null) {
        this.model.set({
          make: offer.make,
          model: offer.model,
          year: offer.year,
          salePrice: offer.salePrice.amount,
          currency: offer.salePrice.currency,
          planName: offer.plan?.name ?? '',
          planInstallments: offer.plan?.installments ?? null,
        });
      }
    });
    effect(() => {
      if (this.store.saved()) {
        void this.router.navigate(['/vehicle-offers']);
      }
    });
  }

  ngOnInit(): void {
    this.store.resetWriteState();
    if (this.id !== null) {
      this.store.loadOne(this.id);
    }
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.f, async () => {
      const value = this.model();
      const draft = new VehicleOfferDraft({
        make: value.make,
        model: value.model,
        year: value.year ?? 0,
        salePrice: value.salePrice ?? 0,
        currency: value.currency,
        planName: value.planName.trim() === '' ? null : value.planName.trim(),
        planInstallments: value.planInstallments,
      });
      if (this.id !== null) {
        this.store.update(this.id, draft);
      } else {
        this.store.create(draft);
      }
      return undefined;
    });
  }
}
