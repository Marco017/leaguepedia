import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataDragonService } from '../../services/data-dragon';
import { Champion } from '../../models/champion.model';

@Component({
  selector: 'app-champion-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './champion-detail.html',
  styleUrls: ['./champion-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChampionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ddragon = inject(DataDragonService);

  champion = signal<Champion | null>(null);
  error = signal('');
  loading = signal(true);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No champion ID provided');
      this.loading.set(false);
      return;
    }
    try {
      const data = await this.ddragon.getChampionById(id) as Champion;
      this.champion.set(data);
    } catch {
      this.error.set('Champion not found.');
    } finally {
      this.loading.set(false);
    }
  }

  protected getSplashUrl(championId: string): string {
    return this.ddragon.getSplashUrl(championId);
  }
}