import { Routes } from '@angular/router';
import { MainPageComponent } from './components/main-page/main-page.component';
import { MyPokemonComponent } from './components/my-pokemon/my-pokemon.component';

export const routes: Routes = [
  {
    path: '',
    component: MainPageComponent,
    title: 'Max Calculator',
  },
  {
    path: 'my-pokemon',
    component: MyPokemonComponent,
    title: 'My Pokemon',
  },
];
