import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DataDragonService {
  private version: string | null = null;
  private baseUrl: string | null = null;
  private cache = new Map<string, unknown>();

  private async ensureVersion(): Promise<void> {
    if (this.version) return;
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await res.json() as string[];
    this.version = versions[0];
    this.baseUrl = `https://ddragon.leagueoflegends.com/cdn/${this.version}`;
  }

  async getAllChampions(): Promise<any[]> {
    await this.ensureVersion();
    if (this.cache.has('all')) return this.cache.get('all') as any[];
    const res = await fetch(`${this.baseUrl}/data/en_US/champion.json`);
    const data = await res.json();
    const champions = Object.values(data.data);
    this.cache.set('all', champions);
    return champions;
  }

  async getChampionById(id: string): Promise<any> {
    await this.ensureVersion();
    if (this.cache.has(`champ_${id}`)) return this.cache.get(`champ_${id}`);
    const res = await fetch(`${this.baseUrl}/data/en_US/champion/${id}.json`);
    if (!res.ok) throw new Error('Champion not found');
    const data = await res.json();
    const champion = data.data[id];
    this.cache.set(`champ_${id}`, champion);
    return champion;
  }

  getImageUrl(imageFull: string): string {
    if (!this.baseUrl) throw new Error('Version not loaded yet');
    return `${this.baseUrl}/img/champion/${imageFull}`;
  }

  getSplashUrl(championId: string): string {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
  }

  getVersion(): string | null {
    return this.version;
  }
}