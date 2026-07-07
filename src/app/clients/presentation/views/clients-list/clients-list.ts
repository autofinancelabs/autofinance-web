import {Component, computed, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmTooltipImports} from '@spartan-ng/helm/tooltip';
import {Breadcrumbs} from '../../../../shared/presentation/components/breadcrumbs/breadcrumbs';
import {ClientsStore} from '../../../application/clients.store';
import {documentTypes} from '../../../domain/model/document-type';

/**
 * Lists the dealership's clients (with a summary side panel broken down by
 * document type), and links to create and edit.
 */
@Component({
  selector: 'app-clients-list',
  imports: [RouterLink, HlmButton, HlmTooltipImports, Breadcrumbs],
  templateUrl: './clients-list.html',
  styleUrl: './clients-list.css',
})
export class ClientsList implements OnInit {
  private readonly store = inject(ClientsStore);

  protected readonly clients = this.store.clients;
  protected readonly loading = this.store.loading;
  protected readonly isEmpty = this.store.isEmpty;

  protected readonly breadcrumbs = [
    {label: 'Dashboard', link: '/dashboard'},
    {label: 'Clientes'},
  ];

  protected readonly total = computed(() => this.clients().length);

  /** Count of clients per document type, in display order. */
  protected readonly byType = computed(() =>
    documentTypes.map(type => ({
      type,
      count: this.clients().filter(client => client.documentId.type === type).length,
    })),
  );

  ngOnInit(): void {
    this.store.load();
  }
}
