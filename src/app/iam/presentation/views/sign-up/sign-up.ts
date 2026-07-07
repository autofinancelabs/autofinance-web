import {Component, effect, inject, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {
  applyWhenValue,
  email,
  form,
  FormField,
  minLength,
  pattern,
  required,
  submit,
} from '@angular/forms/signals';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmError, HlmFormField} from '@spartan-ng/helm/form-field';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {Brand} from '../../../../shared/presentation/components/brand/brand';
import {AuthStore} from '../../../application/auth.store';
import {DealershipRegistration} from '../../../domain/model/dealership-registration.command';

/**
 * Dealership registration screen. Creates the dealership + first user via
 * {@link AuthStore}; on success it routes to /sign-in with a success flag (the
 * backend returns no token). Server errors are surfaced as toasts; only
 * client-side validation is shown inline.
 */
@Component({
  selector: 'app-sign-up',
  imports: [FormField, RouterLink, HlmInput, HlmLabel, HlmError, HlmFormField, HlmButton, Brand],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUp extends BaseForm {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly loading = this.authStore.loading;

  protected readonly model = signal({
    name: '',
    ruc: '',
    contactEmail: '',
    userEmail: '',
    username: '',
    password: '',
  });

  protected readonly f = form(this.model, path => {
    required(path.name, {message: this.messageFor('nombre', 'required')});
    required(path.ruc, {message: this.messageFor('RUC', 'required')});
    pattern(path.ruc, /^\d{11}$/, {message: 'El RUC debe tener exactamente 11 dígitos.'});
    required(path.userEmail, {message: this.messageFor('correo', 'required')});
    email(path.userEmail, {message: this.messageFor('correo', 'email')});
    required(path.username, {message: this.messageFor('usuario', 'required')});
    required(path.password, {message: this.messageFor('contraseña', 'required')});
    minLength(path.password, 8, {message: this.messageFor('contraseña', 'minLength')});
    applyWhenValue(
      path.contactEmail,
      value => value.trim() !== '',
      contactEmailPath => {
        email(contactEmailPath, {message: this.messageFor('correo de contacto', 'email')});
      },
    );
  });

  constructor() {
    super();
    effect(() => {
      if (this.authStore.registeredDealership() !== null) {
        void this.router.navigate(['/sign-in'], {queryParams: {registered: 'true'}});
      }
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.f, async () => {
      const value = this.model();
      const contactEmail = value.contactEmail.trim();
      this.authStore.register(
        new DealershipRegistration({
          name: value.name,
          ruc: value.ruc,
          contactEmail: contactEmail === '' ? null : contactEmail,
          userEmail: value.userEmail,
          username: value.username,
          password: value.password,
        }),
      );
      return undefined;
    });
  }
}
