import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataDragonService } from './data-dragon.service';

describe('DataDragonService', () => {
  let service: DataDragonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DataDragonService]
    });
    service = TestBed.inject(DataDragonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch version on initialization', () => {
    const mockVersions = ['14.1.1', '14.1.0', '14.0.1'];
    const req = httpMock.expectOne('https://ddragon.leagueoflegends.com/api/versions.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockVersions);
  });

  it('should cache the version', () => {
    const mockVersions = ['14.1.1', '14.1.0', '14.0.1'];
    const req1 = httpMock.expectOne('https://ddragon.leagueoflegends.com/api/versions.json');
    req1.flush(mockVersions);

    // Second subscription should not trigger another request due to shareReplay
    service['version$'].subscribe();
    httpMock.expectNone('https://ddragon.leagueoflegends.com/api/versions.json');
  });

  it('should fetch all champions', (done) => {
    const mockVersions = ['14.1.1', '14.1.0', '14.0.1'];
    const mockChampions = {
      data: {
        Aatrox: {
          id: 'Aatrox',
          key: '266',
          name: 'Aatrox',
          title: 'the Darkin Blade'
        },
        Ahri: {
          id: 'Ahri',
          key: '103',
          name: 'Ahri',
          title: 'the Nine-Tailed Fox'
        }
      }
    };

    service.getAllChampions().subscribe(champions => {
      expect(champions.length).toBe(2);
      expect(champions[0].name).toBe('Aatrox');
      done();
    });

    const versionReq = httpMock.expectOne('https://ddragon.leagueoflegends.com/api/versions.json');
    versionReq.flush(mockVersions);

    const championsReq = httpMock.expectOne('https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion.json');
    championsReq.flush(mockChampions);
  });

  it('should fetch a single champion by ID', (done) => {
    const mockVersions = ['14.1.1', '14.1.0', '14.0.1'];
    const mockChampion = {
      data: {
        Aatrox: {
          id: 'Aatrox',
          key: '266',
          name: 'Aatrox',
          title: 'the Darkin Blade',
          image: {
            full: 'Aatrox.png',
            sprite: 'champion0.png',
            group: 'champion',
            x: 0,
            y: 0,
            w: 48,
            h: 48
          }
        }
      }
    };

    service.getChampionById('Aatrox').subscribe(champion => {
      expect(champion.name).toBe('Aatrox');
      expect(champion.title).toBe('the Darkin Blade');
      done();
    });

    const versionReq = httpMock.expectOne('https://ddragon.leagueoflegends.com/api/versions.json');
    versionReq.flush(mockVersions);

    const championReq = httpMock.expectOne('https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion/Aatrox.json');
    championReq.flush(mockChampion);
  });

  it('should construct champion image URL', (done) => {
    const mockVersions = ['14.1.1', '14.1.0', '14.0.1'];
    const imageFull = 'Aatrox.png';
    const expectedUrl = 'https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/Aatrox.png';

    service.getChampionImageUrl(imageFull).subscribe(url => {
      expect(url).toBe(expectedUrl);
      done();
    });

    const versionReq = httpMock.expectOne('https://ddragon.leagueoflegends.com/api/versions.json');
    versionReq.flush(mockVersions);
  });

  it('should construct champion splash URL', () => {
    const championId = 'Aatrox';
    const expectedUrl = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg';
    const url = service.getChampionSplashUrl(championId);
    expect(url).toBe(expectedUrl);
  });

  it('should handle champion not found error', (done) => {
    const mockVersions = ['14.1.1', '14.1.0', '14.0.1'];

    service.getChampionById('InvalidChampion').subscribe(
      () => {
        fail('should have failed with 404');
      },
      error => {
        expect(error.message).toContain('not found');
        done();
      }
    );

    const versionReq = httpMock.expectOne('https://ddragon.leagueoflegends.com/api/versions.json');
    versionReq.flush(mockVersions);

    const championReq = httpMock.expectOne('https://ddragon.leagueoflegends.com/cdn/14.1.1/data/en_US/champion/InvalidChampion.json');
    championReq.flush(null, { status: 404, statusText: 'Not Found' });
  });
});
