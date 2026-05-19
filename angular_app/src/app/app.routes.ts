import { Routes } from '@angular/router';
import { ChampionListComponent } from './champion-list.component';

export const routes: Routes = [
  { path: '', redirectTo: 'champions', pathMatch: 'full' },
  { path: 'champions', component: ChampionListComponent },
];
