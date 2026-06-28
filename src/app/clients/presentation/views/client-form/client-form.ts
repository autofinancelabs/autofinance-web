import {Component, computed, effect, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {applyWhenValue, email, form, FormField, pattern, required, submit} from '@angular/forms/signals';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmError, HlmFormField} from '@spartan-ng/helm/form-field';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {ClientsStore} from '../../../application/clients.store';
import {ClientDraft} from '../../../domain/model/client-draft.command';
import {DocumentType, documentTypes} from '../../../domain/model/document-type';

interface ClientModel {
  documentType: string;
  documentNumber: string;
  email: string;
  phone: string;
  address: string;
}

/**
 * Create / edit form for a client (Signal Forms). With a route `:id` it preloads
 * the client for editing — and the identity document becomes read-only, since it
 * is immutable (only the contact data can change). Server errors surface as
 * toasts; only client-side validation is shown inline. The side panel previews a
 * client identity card with a monogram derived from the document.
 */
@Component({
  selector: 'app-client-form',
  imports: [FormField, RouterLink, HlmInput, HlmLabel, HlmError, HlmFormField, HlmButton, Breadcrumbs],
  templateUrl: './client-form.html',
  styleUrl: './client-form.css',
})
export class ClientForm extends BaseForm implements OnInit {
  private readonly store = inject(ClientsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly documentTypes = documentTypes;
  // Keyed by string (not DocumentType) so the template can index it with the raw
  // model value; in practice it only ever holds the known document types.
  protected readonly documentTypeLabels: Record<string, string> = {
    [DocumentType.DNI]: 'DNI',
    [DocumentType.CE]: 'Carné de extranjería',
    [DocumentType.PASAPORTE]: 'Pasaporte',
  };
  protected readonly saving = this.store.saving;

  protected readonly id = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = this.id !== null;

  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Clientes', link: '/clients'},
    {label: this.id !== null ? 'Editar cliente' : 'Nuevo cliente'},
  ];

  /** Live identity-card preview of the client, derived from the form model. */
  protected readonly preview = computed(() => {
    const value = this.model();
    const number = value.documentNumber.trim();
    const monogram = number.slice(0, 2).toUpperCase();
    return {
      type: value.documentType === '' ? null : value.documentType,
      number: number === '' ? null : number,
      monogram: monogram === '' ? null : monogram,
      email: value.email.trim() === '' ? null : value.email.trim(),
      phone: value.phone.trim() === '' ? null : value.phone.trim(),
      address: value.address.trim() === '' ? null : value.address.trim(),
    };
  });

  protected readonly model = signal<ClientModel>({
    documentType: '',
    documentNumber: '',
    email: '',
    phone: '',
    address: '',
  });

  protected readonly f = form(this.model, path => {
    required(path.documentType, {message: this.messageFor('tipo de documento', 'required')});
    required(path.documentNumber, {message: this.messageFor('número de documento', 'required')});
    // Contact fields are optional; validate format only when provided.
    applyWhenValue(
      path.email,
      value => value.trim() !== '',
      emailPath => {
        email(emailPath, {message: this.messageFor('correo', 'email')});
      },
    );
    applyWhenValue(
      path.phone,
      value => value.trim() !== '',
      phonePath => {
        pattern(phonePath, /^\d{6,15}$/, {
          message: 'El teléfono debe tener entre 6 y 15 dígitos.',
        });
      },
    );
  });

  constructor() {
    super();
    effect(() => {
      const client = this.store.selected();
      if (client !== null) {
        this.model.set({
          documentType: client.documentId.type,
          documentNumber: client.documentId.number,
          email: client.contactInfo?.email ?? '',
          phone: client.contactInfo?.phone ?? '',
          address: client.contactInfo?.address ?? '',
        });
      }
    });
    effect(() => {
      if (this.store.saved()) {
        void this.router.navigate(['/clients']);
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
      const draft = new ClientDraft({
        documentType: value.documentType as DocumentType,
        documentNumber: value.documentNumber.trim(),
        email: value.email.trim() === '' ? null : value.email.trim(),
        phone: value.phone.trim() === '' ? null : value.phone.trim(),
        address: value.address.trim() === '' ? null : value.address.trim(),
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
