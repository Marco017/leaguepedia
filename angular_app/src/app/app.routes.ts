import { Routes } from '@angular/router';
import { ChampionDetailComponent } from './components/champion-detail/champion-detail';
import { ChampionFormComponent } from './components/champion-form/champion-form';
import { ChampionList } from './components/champion-list/champion-list';
import { AdminList } from './components/admin-list/admin-list';
import { LoginComponent } from './components/login/login';
import { authGuard } from './services/authHandler';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'champions',
        pathMatch: 'full',
    },
    {
        path: 'champions',
        loadComponent: () => ChampionList,
    },
    {
        path: 'champions/:id',
        loadComponent: () => ChampionDetailComponent,
    },
    {
        path: 'login',
        loadComponent: () => LoginComponent,
    },
    {
        path: 'admin',
        loadComponent: () => AdminList,
        canActivate: [authGuard],
    },
    {
        path: 'admin/new',
        loadComponent: () => ChampionFormComponent,
        canActivate: [authGuard],
    },
    {
        path: 'admin/edit/:id',
        loadComponent: () => ChampionFormComponent,
        canActivate: [authGuard],
    },
];
