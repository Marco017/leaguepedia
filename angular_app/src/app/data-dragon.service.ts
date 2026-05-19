import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface ChampionData {
  id: string;
  name: string;
  tags?: string[];
  image?: {
    full: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class DataDragonService {
  private versionPromise: Promise<string>;

  constructor(private http: HttpClient) {
    this.versionPromise = this.fetchVersion();
  }

  private fetchVersion(): Promise<string> {
    return fetch('https://ddragon.leagueoflegends.com/api/versions.json')
      .then(res => res.json())
      .then(versions => versions[0]);
  }

  private async getBaseUrl(): Promise<string> {
    const version = await this.versionPromise;
    return `https://ddragon.leagueoflegends.com/cdn/${version}`;
  }

  async getAllChampions(): Promise<ChampionData[]> {
    try {
      const baseUrl = await this.getBaseUrl();
      const url = `${baseUrl}/data/en_US/champion.json`;
      const data = await firstValueFrom(
        this.http.get<any>(url).pipe(
          catchError(() => of({ data: {} }))
        )
      );
      return Object.values(data.data || {}) as ChampionData[];
    } catch {
      return [];
    }
  }

  async getChampionById(id: string): Promise<ChampionData> {
    try {
      const baseUrl = await this.getBaseUrl();
      const url = `${baseUrl}/data/en_US/champion/${id}.json`;
      const data = await firstValueFrom(this.http.get<any>(url));
      return data.data[id] as ChampionData;
    } catch {
      throw new Error('Champion not found');
    }
  }

  getChampionImageUrl(imageFull: string): string {
    if (!imageFull) return '';
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/${imageFull}`;
  }

  getChampionSplashUrl(championId: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
  }
}
