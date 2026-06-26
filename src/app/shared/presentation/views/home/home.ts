import {Component} from '@angular/core';
import {HlmButton} from '@spartan-ng/helm/button';

/**
 * Landing view of the application (shared kernel). Currently doubles as a visual
 * smoke test for the spartan theme (teal primary + Geist + semantic chips).
 */
@Component({
  selector: 'app-home',
  imports: [HlmButton],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}
