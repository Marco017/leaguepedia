import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataDragonService } from '../../services/data-dragon';
import { JsonServerChampionService } from '../../services/json-server-champion';
import { Champion } from '../../models/champion.model';
import { PaginationComponent } from '../pagination/pagination';

const ROLES = ['Fighter', 'Mage', 'Assassin', 'Tank', 'Support', 'Marksman'];
const PER_PAGE = 30;

@Component({
  selector: 'app-champion-list',
  standalone: true,
  imports: [RouterLink, FormsModule, PaginationComponent],
  templateUrl: './champion-list.html',
  styleUrls: ['./champion-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChampionList implements OnInit {
  private ddragon = inject(DataDragonService);
  private jsonService = inject(JsonServerChampionService);

  allChampions = signal<Champion[]>([]);
  search = signal('');
  role = signal('');
  page = signal(1);
  readonly perPage = PER_PAGE;

  loading = signal(true);
  error = signal('');

  async ngOnInit() {
    try {
      const [ddChamps, customChamps] = await Promise.all([
        this.ddragon.getAllChampions() as Promise<Champion[]>,
        this.jsonService.getAllCustomChampions(),
      ]);
      const customMap = new Map(customChamps.map(c => [c.id, c]));
      const merged = ddChamps.map(c => customMap.get(c.id) ?? c);
      const ddIds = new Set(ddChamps.map(c => c.id));
      const extraCustom = customChamps.filter(c => !ddIds.has(c.id));
      this.allChampions.set([...merged, ...extraCustom]);
    } catch (err) {
      this.error.set('Failed to load champion data.');
    } finally {
      this.loading.set(false);
    }
  }

  get filteredChampions() {
    const searchLower = this.search().toLowerCase();
    const roleFilter = this.role();
    return this.allChampions().filter(c => {
      const matchName = c.name.toLowerCase().includes(searchLower);
      const matchRole = roleFilter ? c.tags.includes(roleFilter) : true;
      return matchName && matchRole;
    });
  }

  get totalPages() {
    return Math.ceil(this.filteredChampions.length / this.perPage);
  }

  get paginatedChampions() {
    const start = (this.page() - 1) * this.perPage;
    return this.filteredChampions.slice(start, start + this.perPage);
  }

  onFilterChange() {
    this.page.set(1);
  }

  onPageChange(newPage: number) {
    this.page.set(newPage);
  }

  getImageUrl(imageFull: string): string {
    return this.ddragon.getImageUrl(imageFull);
  }

  protected readonly roles = ROLES;
}