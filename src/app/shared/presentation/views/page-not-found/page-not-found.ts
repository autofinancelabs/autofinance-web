import {Component, inject, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

/**
 * Fallback view shown for unknown routes (shared kernel).
 */
@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.css'
})
export class PageNotFound implements OnInit {
  protected invalidPath = '';
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.invalidPath = this.route.snapshot.url.map(segment => segment.path).join('/');
  }

  protected navigateToHome() {
    this.router.navigate(['home']);
  }
}
