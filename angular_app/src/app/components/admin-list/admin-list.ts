import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JsonServerChampionService } from '../../services/json-server-champion';
import { Champion } from '../../models/champion.model';
import { PaginationComponent } from '../pagination/pagination';

const ROLES = ['Fighter', 'Mage', 'Assassin', 'Tank', 'Support', 'Marksman'];
const PARTYPES = [
  'Mana', 'Energy', 'Fury', 'Rage', 'Flow', 'Heat',
  'Ferocity', 'Courage', 'Grit', 'Blood Well', 'Shield', 'None',
];
const PER_PAGE = 15;

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [RouterLink, FormsModule, PaginationComponent],
  templateUrl: './admin-list.html',
  styleUrls: ['./admin-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminList {
  private jsonService = inject(JsonServerChampionService);

  // State
  champions = signal<Champion[]>([]);
  totalItems = signal(0);
  totalPages = signal(1);
  loading = signal(true);

  // Filters (bound directly to inputs)
  nameFilter = signal('');
  tagFilter = signal('');
  partypeFilter = signal('');
  page = signal(1);

  constructor() {
    this.loadChampions();
  }

  async loadChampions() {
    this.loading.set(true);
    try {
      const result = await this.jsonService.getChampions({
        name: this.nameFilter() || undefined,
        tag: this.tagFilter() || undefined,
        partype: this.partypeFilter() || undefined,
        page: this.page(),
        perPage: PER_PAGE,
      });
      this.champions.set(result.data);
      this.totalPages.set(result.pages);
      this.totalItems.set(result.total);
    } catch (err) {
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  // Called when filter inputs change
  onFilterChange() {
    this.page.set(1);
    this.loadChampions();
  }

  // Called when page changes
  onPageChange(newPage: number) {
    this.page.set(newPage);
    this.loadChampions();
  }

  async deleteChampion(id: string) {
    if (!confirm('Are you sure you want to delete this champion?')) return;
    try {
      await this.jsonService.deleteChampion(id);
      this.loadChampions();
    } catch (err) {
      console.error(err);
    }
  }

  protected readonly roles = ROLES;
  protected readonly partypes = PARTYPES;
}