import { Routes } from '@angular/router';
import { ChampionDetailComponent } from './components/champion-detail/champion-detail';
import { ChampionFormComponent } from './components/champion-form/champion-form';
import { ChampionList } from './components/champion-list/champion-list';
import { AdminList } from './components/admin-list/admin-list';


export const routes: Routes = [
    {
        "path": "",
        "redirectTo": "champions",
        "pathMatch": "full"
    },
    {
        "path": "champions",
        "loadComponent": () => ChampionList
    },
    {
        "path": "champions/:id",
        "loadComponent": () => ChampionDetailComponent
    },
    {
        "path": "admin",
        "loadComponent": () => AdminList
    },
    {
        "path": "admin/new",    
        "loadComponent": () => ChampionFormComponent
    },
    {
        "path": "admin/edit/:id",
        "loadComponent": () => ChampionFormComponent
    }

];
