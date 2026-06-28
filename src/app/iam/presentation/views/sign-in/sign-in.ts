import {Component, effect, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {form, FormField, required, submit} from '@angular/forms/signals';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInput} from '@spartan-ng/helm/input';
import {HlmLabel} from '@spartan-ng/helm/label';
import {HlmError, HlmFormField} from '@spartan-ng/helm/form-field';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {AuthStore} from '../../../application/auth.store';
import {Credentials} from '../../../domain/model/credentials.command';

/**
 * Sign-in screen. Authenticates via {@link AuthStore} and, once authenticated,
 * navigates to the `redirectTo` query param (or `/dashboard`). Server errors are
 * surfaced as toasts (by the error interceptor); only client-side validation is
 * shown inline.
 */
@Component({
  selector: 'app-sign-in',
  imports: [FormField, RouterLink, HlmInput, HlmLabel, HlmError, HlmFormField, HlmButton],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn extends BaseForm {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly loading = this.authStore.loading;
  protected readonly justRegistered =
    this.route.snapshot.queryParamMap.get('registered') === 'true';

  private readonly redirectTo = this.route.snapshot.queryParamMap.get('redirectTo') ?? '/dashboard';

  protected readonly model = signal({identifier: '', password: ''});
  protected readonly f = form(this.model, path => {
    required(path.identifier, {message: this.messageFor('usuario o correo', 'required')});
    required(path.password, {message: this.messageFor('contraseña', 'required')});
  });

  constructor() {
    super();
    effect(() => {
      if (this.authStore.isAuthenticated()) {
        void this.router.navigateByUrl(this.redirectTo);
      }
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    void submit(this.f, async () => {
      const value = this.model();
      this.authStore.signIn(
        new Credentials({identifier: value.identifier, password: value.password}),
      );
      return undefined;
    });
  }
}
