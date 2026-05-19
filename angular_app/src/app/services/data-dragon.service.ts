import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { shareReplay, map, catchError, switchMap } from 'rxjs/operators';

interface ChampionData {
  [key: string]: ChampionInfo;
}

interface ChampionInfo {
  id: string;
  key: string;
  name: string;
  title: string;
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class DataDragonService {
  private readonly DDRAGON_BASE_URL = 'https://ddragon.leagueoflegends.com';
  private version$: Observable<string>;

  constructor(private http: HttpClient) {
    this.version$ = this.fetchVersion();
  }

  private fetchVersion(): Observable<string> {
    return this.http
      .get<string[]>(`${this.DDRAGON_BASE_URL}/api/versions.json`)
      .pipe(
        map(versions => versions[0]),
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching Data Dragon version:', error);
          return throwError(() => new Error('Failed to fetch Data Dragon version'));
        })
      );
  }

  getAllChampions(): Observable<ChampionInfo[]> {
    return this.version$.pipe(
      map(version => {
        const baseUrl = `${this.DDRAGON_BASE_URL}/cdn/${version}`;
        return baseUrl;
      }),
      switchMap(baseUrl =>
        this.http.get<{ data: ChampionData }>(`${baseUrl}/data/en_US/champion.json`)
      ),
      map(response => Object.values(response.data)),
      catchError(error => {
        console.error('Error fetching champions:', error);
        return throwError(() => new Error('Failed to fetch champions'));
      })
    );
  }

  getChampionById(id: string): Observable<ChampionInfo> {
    return this.version$.pipe(
      map(version => {
        const baseUrl = `${this.DDRAGON_BASE_URL}/cdn/${version}`;
        return baseUrl;
      }),
      switchMap(baseUrl =>
        this.http.get<{ data: { [key: string]: ChampionInfo } }>(
          `${baseUrl}/data/en_US/champion/${id}.json`
        )
      ),
      map(response => response.data[id]),
      catchError(error => {
        console.error(`Error fetching champion ${id}:`, error);
        return throwError(() => new Error(`Champion ${id} not found`));
      })
    );
  }

  getChampionImageUrl(imageFull: string): Observable<string> {
    return this.version$.pipe(
      map(version => {
        const baseUrl = `${this.DDRAGON_BASE_URL}/cdn/${version}`;
        return `${baseUrl}/img/champion/${imageFull}`;
      })
    );
  }

  getChampionSplashUrl(championId: string): string {
    return `${this.DDRAGON_BASE_URL}/cdn/img/champion/splash/${championId}_0.jpg`;
  }
}
