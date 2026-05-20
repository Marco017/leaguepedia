import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DataDragonService } from '../../services/data-dragon';
import { JsonServerChampionService } from '../../services/json-server-champion';
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
  private jsonServerChampionService = inject(JsonServerChampionService);
  private isCustom = signal(false);
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
      const customChampion = await this.jsonServerChampionService.getChampionById(id).catch(() => null);
      if (customChampion) {
        this.champion.set(customChampion);
        this.isCustom.set(true);
        return;
      }
      const data = await this.ddragon.getChampionById(id) as Champion;
      this.champion.set(data);
    } catch {
      this.error.set('Champion not found.');
    } finally {
      this.loading.set(false);
    }
  }

  protected getSplashUrl(): string {
    // check if custom or data dragon champion
    if (this.isCustom()) {
      const champ = this.champion();
      return champ?.image.splash ?? '';
    }
    const champ = this.champion();
    return champ ? this.ddragon.getSplashUrl(champ.id) : '';
  }
  protected getImageUrl(): string {
    if (this.isCustom()) {
      const champ = this.champion();
      return champ?.image.full ?? '';
    }
    const champ = this.champion();
    return champ ? this.ddragon.getImageUrl(champ.image.full) : '';
  }
}