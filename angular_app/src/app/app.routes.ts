import { Routes } from '@angular/router';
import { ChampionDetailComponent } from './components/champion-detail/champion-detail';
import { ChampionFormComponent } from './components/champion-form/champion-form';
import { ChampionList } from './components/champion-list/champion-list';
import { AdminList } from './components/admin-list/admin-list';
import { LoginComponent } from './components/login/login';
import { authHandler } from './services/authHandler';


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
        canActivate: [authHandler],
    },
    {
        path: 'admin/new',
        loadComponent: () => ChampionFormComponent,
        canActivate: [authHandler],
    },
    {
        path: 'admin/edit/:id',
        loadComponent: () => ChampionFormComponent,
        canActivate: [authHandler],
    },
];
