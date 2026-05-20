import { Injectable, signal } from '@angular/core';
import type { Champion } from '../models/champion.model';

@Injectable({ providedIn: 'root' })
export class JsonServerChampionService {
  private readonly BASE = 'http://localhost:3000';
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  async getChampions(params: {
    name?: string;
    tag?: string;
    partype?: string;
    page?: number;
    perPage?: number;
  }) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const url = new URL(`${this.BASE}/champions`);
      if (params.name) url.searchParams.append('name:contains', params.name);
      // if (params.tag) url.searchParams.append('tags:contains', params.tag);
      if (params.partype) url.searchParams.append('partype:eq', params.partype);
      if (params.page) url.searchParams.append('_page', String(params.page));
      if (params.perPage) url.searchParams.append('_per_page', String(params.perPage));

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Error loading champions');
      const json = await res.json();

      // json-server v1 pagination envelope
      if (json && typeof json === 'object' && Array.isArray(json.data)) {
        return {
          data: json.data,
          pages: json.pages ?? 1,
          total: json.items ?? json.data.length,
        };
      }
      const arr = Array.isArray(json) ? json : [];
      return { data: arr, pages: 1, total: arr.length };
    } catch (err) {
      this.errorSignal.set(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getAllCustomChampions(): Promise<Champion[]> {
    try {
      const res = await fetch(`${this.BASE}/champions`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : data.data || [];
    } catch {
      return [];
    }
  }

  async getChampionById(id: string): Promise<Champion> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const res = await fetch(`${this.BASE}/champions/${id}`);
      if (!res.ok) throw new Error('Champion not found');
      return await res.json();
    } catch (err) {
      this.errorSignal.set(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createChampion(champion: Omit<Champion, 'id'>) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const res = await fetch(`${this.BASE}/champions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(champion),
      });
      if (!res.ok) throw new Error('Error creating champion');
      return await res.json();
    } catch (err) {
      this.errorSignal.set(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async updateChampion(id: string, champion: Partial<Champion>) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const res = await fetch(`${this.BASE}/champions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(champion),
      });
      if (!res.ok) throw new Error('Error updating champion');
      return await res.json();
    } catch (err) {
      this.errorSignal.set(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async deleteChampion(id: string) {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    try {
      const res = await fetch(`${this.BASE}/champions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error deleting champion');
      return await res.json();
    } catch (err) {
      this.errorSignal.set(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      this.loadingSignal.set(false);
    }
  }
}