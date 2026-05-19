import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface ChampionFilters {
  name?: string;
  tag?: string;
  partype?: string;
  page?: number;
  perPage?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pages: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class JsonServerService {
  private readonly BASE = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Fetch a paginated + filtered page of champions from json-server.
   *
   * json-server v1 (beta) filter syntax:
   *   field:contains=value   →  case-insensitive substring match
   *   field:eq=value         →  exact match
   *   _page=N&_per_page=N    →  pagination (response: { data, first, prev, next, last, pages, items })
   */
  getChampions(filters: ChampionFilters = {}): Observable<PaginatedResponse<any>> {
    const {
      name = '',
      tag = '',
      partype = '',
      page = 1,
      perPage = 20
    } = filters;

    let params = new HttpParams();

    if (name) {
      params = params.set('name:contains', name);
    }
    if (tag) {
      params = params.set('tags:contains', tag);
    }
    if (partype) {
      params = params.set('partype:eq', partype);
    }

    params = params.set('_page', page.toString());
    params = params.set('_per_page', perPage.toString());

    return this.http.get<any>(`${this.BASE}/champions`, { params }).pipe(
      map(response => this.normalizeChampionsResponse(response))
    );
  }

  /**
   * Fetch a single champion by ID.
   */
  getChampionById(id: string): Observable<any> {
    return this.http.get<any>(`${this.BASE}/champions/${id}`);
  }

  /**
   * Create a new champion.
   */
  createChampion(champion: any): Observable<any> {
    return this.http.post<any>(`${this.BASE}/champions`, champion);
  }

  /**
   * Update an existing champion by ID.
   */
  updateChampion(id: string, champion: any): Observable<any> {
    return this.http.put<any>(`${this.BASE}/champions/${id}`, champion);
  }

  /**
   * Delete a champion by ID.
   */
  deleteChampion(id: string): Observable<any> {
    return this.http.delete<any>(`${this.BASE}/champions/${id}`);
  }

  /**
   * Normalize the response from json-server to ensure consistent structure.
   *
   * Handles both:
   * - Paginated response envelope: { data, pages, items, ... }
   * - Plain array response (safety net)
   */
  private normalizeChampionsResponse(response: any): PaginatedResponse<any> {
    // Check if response has pagination envelope structure
    if (response && typeof response === 'object' && Array.isArray(response.data)) {
      return {
        data: response.data,
        pages: response.pages ?? 1,
        total: response.items ?? response.data.length
      };
    }

    // Fallback: treat response as plain array
    const arr = Array.isArray(response) ? response : [];
    return {
      data: arr,
      pages: 1,
      total: arr.length
    };
  }
}
