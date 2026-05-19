import { Routes } from '@angular/router';
import { ChampionList} from './components/champion-list/champion-list';
import { ChampionDetailComponent } from './components/champion-detail/champion-detail';
import { AdminList } from './components/admin-list/admin-list';
import { ChampionFormComponent } from './components/champion-form/champion-form';

export const routes: Routes = [
  { path: '', component: ChampionList },
  { path: 'champion/:id', component: ChampionDetailComponent },
  { path: 'admin', component: AdminList },
  { path: 'admin/new', component: ChampionFormComponent },
  { path: 'admin/edit/:id', component: ChampionFormComponent },
  { path: '**', redirectTo: '' },
];