import {Component, inject} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {ThemeStore} from './shared/presentation/theme/theme.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Instantiate the theme store eagerly so the persisted/system theme is applied.
  private readonly theme = inject(ThemeStore);
}
