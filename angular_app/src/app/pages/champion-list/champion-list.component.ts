import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DataDragonService } from '../../data-dragon.service';
import { JsonServerService } from '../../json-server.service';
import { PaginationComponent } from './pagination.component';

interface ChampionData {
  id: string;
  name: string;
  tags?: string[];
  image?: {
    full: string;
  };
}

const ROLES = ['Fighter', 'Mage', 'Assassin', 'Tank', 'Support', 'Marksman'];
const PER_PAGE = 30;

@Component({
  selector: 'app-champion-list',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule, FormsModule, PaginationComponent],
  template: `
    <div class="page">
      <h1>Champions ({{ filteredCount }})</h1>

      <div class="filters-bar">
        <input
          type="text"
          placeholder="Search by name…"
          [(ngModel)]="searchText"
          (ngModelChange)="onSearchChange()"
        />
        <select [(ngModel)]="selectedRole" (ngModelChange)="onRoleChange()">
          <option value="">All roles</option>
          <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
        </select>
      </div>

      <div *ngIf="loading()" class="loading-msg">
        Loading champions…
      </div>

      <div *ngIf="error()" class="error-msg">
        {{ error() }}
      </div>

      <div *ngIf="!loading() && !error()" class="champion-grid">
        <a
          *ngFor="let champion of paginatedChampions()"
          [routerLink]="['/champion', champion.id]"
          class="champion-card"
        >
          <div *ngIf="champion.image?.full" class="champion-image">
            <img
              [src]="getChampionImageUrl(champion.image.full)"
              [alt]="champion.name"
              width="120"
              height="120"
            />
          </div>
          <div *ngIf="!champion.image?.full" class="champion-placeholder">
            ?
          </div>
          <p class="champion-card-name">{{ champion.name }}</p>
        </a>
      </div>

      <app-pagination
        [page]="currentPage()"
        [totalPages]="totalPages()"
        (pageChange)="onPageChange($event)"
      ></app-pagination>
    </div>
  `,
  styles: [],
})
export class ChampionListComponent implements OnInit {
  // Data signals
  ddChampions = signal<ChampionData[]>([]);
  serverChampions = signal<ChampionData[]>([]);
  loading = signal(true);
  error = signal('');

  // Filter signals
  searchText: string = '';
  selectedRole: string = '';
  currentPage = signal(1);

  // Computed signals
  mergedChampions = signal<ChampionData[]>([]);
  filteredChampions = signal<ChampionData[]>([]);
  filteredCount = 0;
  totalPages = signal(1);
  paginatedChampions = signal<ChampionData[]>([]);

  roles = ROLES;

  constructor(
    private dataDragon: DataDragonService,
    private jsonServer: JsonServerService
  ) {
    // Effect to merge champions
    effect(() => {
      const dd = this.ddChampions();
      const server = this.serverChampions();
      this.mergedChampions.set(this.mergeChampions(dd, server));
    });

    // Effect to filter champions
    effect(() => {
      const merged = this.mergedChampions();
      this.filteredChampions.set(this.filterChampions(merged));
    });

    // Effect to update pagination
    effect(() => {
      const filtered = this.filteredChampions();
      this.filteredCount = filtered.length;
      this.totalPages.set(Math.max(1, Math.ceil(filtered.length / PER_PAGE)));
      this.currentPage.set(1);
    });

    // Effect to paginate champions
    effect(() => {
      const filtered = this.filteredChampions();
      const page = this.currentPage();
      const start = (page - 1) * PER_PAGE;
      const end = start + PER_PAGE;
      this.paginatedChampions.set(filtered.slice(start, end));
    });
  }

  ngOnInit(): void {
    this.loadChampions();
  }

  private loadChampions(): void {
    this.loading.set(true);
    this.error.set('');

    Promise.all([
      this.dataDragon.getAllChampions().catch(() => []),
      this.fetchServerChampions(),
    ])
      .then(([dd, server]) => {
        this.ddChampions.set(Array.isArray(dd) ? dd : []);
        this.serverChampions.set(Array.isArray(server) ? server : []);
      })
      .catch(() => this.error.set('Failed to load champion data.'))
      .finally(() => this.loading.set(false));
  }

  private fetchServerChampions(): Promise<ChampionData[]> {
    return fetch('http://localhost:3000/champions')
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        // Handle both plain array and pagination envelope
        if (Array.isArray(data)) {
          return data;
        }
        return Array.isArray(data?.data) ? data.data : [];
      })
      .catch(() => []);
  }

  private mergeChampions(dd: ChampionData[], server: ChampionData[]): ChampionData[] {
    const serverById = Object.fromEntries(server.map(c => [c.id, c]));
    const ddFiltered = dd.map(c => serverById[c.id] ?? c);
    const ddIds = new Set(dd.map(c => c.id));
    const extraServer = server.filter(c => !ddIds.has(c.id));
    return [...ddFiltered, ...extraServer];
  }

  private filterChampions(champions: ChampionData[]): ChampionData[] {
    const q = this.searchText.toLowerCase();
    return champions.filter(c => {
      const matchName = c.name?.toLowerCase().includes(q) ?? false;
      const matchRole = this.selectedRole
        ? (c.tags ?? []).includes(this.selectedRole)
        : true;
      return matchName && matchRole;
    });
  }

  onSearchChange(): void {
    this.currentPage.set(1);
    this.filteredChampions.set(this.filterChampions(this.mergedChampions()));
  }

  onRoleChange(): void {
    this.currentPage.set(1);
    this.filteredChampions.set(this.filterChampions(this.mergedChampions()));
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  getChampionImageUrl(imageFull: string): string {
    return this.dataDragon.getChampionImageUrl(imageFull);
  }
}
